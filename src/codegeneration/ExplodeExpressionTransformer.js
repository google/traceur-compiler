// Copyright 2014 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  createAssignmentExpression,
  createCommaExpression,
  createIdentifierExpression as id,
  createMemberExpression,
  createNumberLiteral,
  createOperatorToken,
  createParenExpression
} from './ParseTreeFactory';
import {
  AND,
  EQUAL,
  MINUS,
  MINUS_EQUAL,
  MINUS_MINUS,
  OR,
  PLUS,
  PLUS_EQUAL,
  PLUS_PLUS
} from '../syntax/TokenType';
import {
  COMMA_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  PROPERTY_NAME_ASSIGNMENT,
  SPREAD_EXPRESSION,
  TEMPLATE_LITERAL_PORTION
} from '../syntax/trees/ParseTreeType';
import {
  ArgumentList,
  ArrayLiteralExpression,
  BinaryOperator,
  CallExpression,
  ConditionalExpression,
  MemberExpression,
  MemberLookupExpression,
  NewExpression,
  ObjectLiteralExpression,
  PropertyNameAssignment,
  SpreadExpression,
  TemplateLiteralExpression,
  TemplateSubstitution,
  UnaryExpression,
  YieldExpression
} from '../syntax/trees/ParseTrees';
import {assert} from '../util/assert';
import assignmentOperatorToBinaryOperator from
    './assignmentOperatorToBinaryOperator';

/**
 * @fileoverview This transforms expression into a normalized comma expression.
 * These comma expressions take the form of
 *
 *   $tmp1 = ..., $tmp2 = ..., $tmp3 = $tmp1 op $tmp2, $tmp3
 *
 * The important part here is that the order of execution stays the same and
 * that the semantics is the same as well as that the last expression is either
 * an identifier, a literal expression or an expression that has no side effects
 * (minus crazy valueOf, toString, global getter).
 *
 * This concept is also extended to support conditionals `a ? b : c` and
 * expressions such as `a || b` gets transformed into a conditional.
 *
 * The normalized comma form is used by the CPS transformer when there is a
 * yield expression. It can also byt the SuperTransformer.
 */

class CommaExpressionBuilder {
  constructor(tempVar) {
    this.tempVar = tempVar;
    this.expressions = [];
  }
  add(tree) {
    if (tree.type === COMMA_EXPRESSION) {
      this.expressions.push(...getExpressions(tree));
    } else {
      assert(tree.type === LITERAL_EXPRESSION ||
             tree.type === IDENTIFIER_EXPRESSION);
    }
    return this;
  }
  build(tree) {
    var tempVar = this.tempVar;
    this.expressions.push(createAssignmentExpression(tempVar, tree), tempVar);
    return createCommaExpression(this.expressions);
  }
}

function getResult(tree) {
  if (tree.type === COMMA_EXPRESSION)
    return tree.expressions[tree.expressions.length - 1];
  return tree;
}

function getExpressions(tree) {
  if (tree.type === COMMA_EXPRESSION)
    return tree.expressions.slice(0, -1);
  return [];
}

export class ExplodeExpressionTransformer extends ParseTreeTransformer {

  /**
   * @param {tempVarTransformer} tempVarTransformer This is the caller temp
   *   var transformer and it is used to generate the temp var names that are
   *   needed for the intermediary expressions.
   */
  constructor(tempVarTransformer) {
    super();
    this.tempVarTransformer_ = tempVarTransformer;
  }

  addTempVar() {
    var tmpId = this.tempVarTransformer_.addTempVar();
    return id(tmpId);
  }

  transformUnaryExpression(tree) {
    if (tree.operator.type == PLUS_PLUS)
      return this.transformUnaryNumeric(tree, PLUS_EQUAL);

    if (tree.operator.type == MINUS_MINUS)
      return this.transformUnaryNumeric(tree, MINUS_EQUAL);

    // typeof a
    // =>
    // $0 = a, typeof $0
    var operand = this.transformAny(tree.operand);
    if (operand === tree.operand)
      return tree;

    var expressions = [
      ...getExpressions(operand),
      new UnaryExpression(tree.location, tree.operator, getResult(operand))
    ];
    return createCommaExpression(expressions);
  }

  transformUnaryNumeric(tree, operator) {
    // This is slightly different than the usual transform methods. It
    // transforms the expression accordingly:
    //
    // ++a
    // =>
    // a += 1
    //
    // and then calls transformAny to get the `a += 1` expression to be
    // transformed as needed.

    return this.transformAny(
        new BinaryOperator(tree.location, tree.operand,
            createOperatorToken(operator), createNumberLiteral(1)));
  }

  transformPostfixExpression(tree) {
    if (tree.operand.type === MEMBER_EXPRESSION)
      return this.transformPostfixMemberExpression(tree);
    if (tree.operand.type === MEMBER_LOOKUP_EXPRESSION)
      return this.transformPostfixMemberLookupExpression(tree);

    // What else do we need to support?
    assert(tree.operand.type === IDENTIFIER_EXPRESSION);

    // x++
    // =>
    // $0 = x, x = $0 + 1, $0

    var operand = tree.operand
    var tmp = this.addTempVar();
    var operator = tree.operator.type === PLUS_PLUS ? PLUS : MINUS;

    var expressions = [
      createAssignmentExpression(tmp, operand),
      createAssignmentExpression(operand,
          new BinaryOperator(tree.location, tmp, createOperatorToken(operator),
              createNumberLiteral(1))),
      tmp
    ];
    return createCommaExpression(expressions);
  }

  transformPostfixMemberExpression(tree) {
    // a.b++
    // =>
    // $0 = a, $1 = $0.b, $0.b = $1 + 1, $1

    var memberName = tree.operand.memberName;
    var operand = this.transformAny(tree.operand.operand);
    var tmp = this.addTempVar();
    var memberExpression =
        new MemberExpression(tree.operand.location, getResult(operand),
                             memberName);
    var operator = tree.operator.type === PLUS_PLUS ? PLUS : MINUS;

    var expressions = [
      ...getExpressions(operand),
      createAssignmentExpression(tmp, memberExpression),
      createAssignmentExpression(memberExpression,
          new BinaryOperator(tree.location, tmp, createOperatorToken(operator),
              createNumberLiteral(1))),
      tmp
    ];
    return createCommaExpression(expressions);
  }

  transformPostfixMemberLookupExpression(tree) {
    // a[b]++
    // =>
    // $0 = a, $1 = b, $2 = $0[$1], $0[$1] = $2 + 1, $2

    var memberExpression = this.transformAny(tree.operand.memberExpression);
    var operand = this.transformAny(tree.operand.operand);
    var tmp = this.addTempVar();
    var memberLookupExpression = new MemberLookupExpression(
        null, getResult(operand), getResult(memberExpression));
    var operator = tree.operator.type === PLUS_PLUS ? PLUS : MINUS;

    var expressions = [
      ...getExpressions(operand),
      ...getExpressions(memberExpression),
      createAssignmentExpression(tmp, memberLookupExpression),
      createAssignmentExpression(memberLookupExpression,
          new BinaryOperator(tree.location, tmp, createOperatorToken(operator),
              createNumberLiteral(1))),
      tmp
    ];
    return createCommaExpression(expressions);
  }

  transformYieldExpression(tree) {
    var expression = this.transformAny(tree.expression);
    return this.createCommaExpressionBuilder().add(expression).build(
        new YieldExpression(tree.location, getResult(expression),
                            tree.isYieldFor));
  }

  transformParenExpression(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression === tree.expression)
      return tree;

    var result = getResult(expression);
    if (result.type === IDENTIFIER_EXPRESSION)
      return expression;

    // We do not need to wrap the result in parens since the assignment
    // expression will take care of the grouping.
    return this.createCommaExpressionBuilder().add(expression).build(result);
  }

  transformCommaExpression(tree) {
    var expressions = this.transformList(tree.expressions);
    if (expressions === tree.expressions)
      return tree;

    var builder = new CommaExpressionBuilder(null);
    // var results = [];
    for (var i = 0; i < expressions.length; i++) {
      builder.add(expressions[i]);
      // results.push(getResult(expressions[i]));
    }
    return createCommaExpression([
      ...builder.expressions,
      getResult(expressions[expressions.length - 1])
    ]);
  }

  transformMemberExpression(tree) {
    // a.b
    // =>
    // $0 = a, $1 = $0.b, $1

    var operand = this.transformAny(tree.operand);
    return this.createCommaExpressionBuilder().add(operand).build(
        new MemberExpression(
            tree.location, getResult(operand), tree.memberName));
  }

  transformMemberLookupExpression(tree) {
    // a[b]
    // =>
    // $0 = a, $1 = b, $2 = $0[$1], $2

    var operand = this.transformAny(tree.operand);
    var memberExpression = this.transformAny(tree.memberExpression);
    return this.createCommaExpressionBuilder().add(operand).
        add(memberExpression).
        build(new MemberLookupExpression(
            tree.location, getResult(operand), getResult(memberExpression)));
  }

  transformBinaryOperator(tree) {
    if (tree.operator.isAssignmentOperator())
      return this.transformAssignmentExpression(tree);

    var left = this.transformAny(tree.left);
    var right = this.transformAny(tree.right);

    if (left === tree.left && right === tree.right)
      return tree;

    if (tree.operator.type === OR)
      return this.transformOr(left, right);

    if (tree.operator.type === AND)
      return this.transformAnd(left, right);

    // a op b
    // =>
    // $0 = a, $1 = b, $0 op $1

    var expressions = [
      ...getExpressions(left),
      ...getExpressions(right),
      new BinaryOperator(
              tree.location, getResult(left), tree.operator, getResult(right))
    ];

    return createCommaExpression(expressions);
  }

  transformAssignmentExpression(tree) {
    var left = tree.left;
    if (left.type === MEMBER_EXPRESSION)
      return this.transformAssignMemberExpression(tree);
    if (left.type === MEMBER_LOOKUP_EXPRESSION)
        return this.transformAssignMemberLookupExpression(tree);

    // What else do we need to support?
    assert(tree.left.type === IDENTIFIER_EXPRESSION);

    if (tree.operator.type === EQUAL) {
      // a = b
      // =>
      // $0 = b, a = $0, $0

      var left = this.transformAny(left);
      var right = this.transformAny(tree.right);

      var expressions = [
        ...getExpressions(right),
        createAssignmentExpression(left, getResult(right)),
        getResult(right)
      ];
      return createCommaExpression(expressions);
    }

    // a += b
    // =>
    // $0 = b, $1 = a + $0, a = $1, $1

    var right = this.transformAny(tree.right);
    var tmp = this.addTempVar();
    var binop = createOperatorToken(
        assignmentOperatorToBinaryOperator(tree.operator.type));

    var expressions = [
      ...getExpressions(right),
      createAssignmentExpression(tmp,
        new BinaryOperator(tree.location, left, binop, getResult(right))),
      createAssignmentExpression(left, tmp),
      tmp
    ];
    return createCommaExpression(expressions);
  }

  transformAssignMemberExpression(tree) {
    var left = tree.left;

    if (tree.operator.type === EQUAL) {
      // a.b = c
      // =>
      // $0 = a, $1 = c, $0.b = $1, $1

      var operand = this.transformAny(left.operand);
      var right = this.transformAny(tree.right);

      var expressions = [
        ...getExpressions(operand),
        ...getExpressions(right),
        new BinaryOperator(tree.location,
            new MemberExpression(left.location, getResult(operand), left.memberName),
            tree.operator,
            getResult(right)),
        getResult(right)
      ];
      return createCommaExpression(expressions);
    }

    // a.b += c
    // =>
    // $0 = a, $1 = c, $2 = $0.b, $3 = $2 + $1, $0.b = $3, $3

    var operand = this.transformAny(left.operand);
    var right = this.transformAny(tree.right);
    var tmp = this.addTempVar();
    var memberExpression = new MemberExpression(left.location,
        getResult(operand), left.memberName);
    var tmp2 = this.addTempVar();
    var binop = createOperatorToken(
        assignmentOperatorToBinaryOperator(tree.operator.type));

    var expressions = [
      ...getExpressions(operand),
      ...getExpressions(right),
      createAssignmentExpression(tmp, memberExpression),
      createAssignmentExpression(tmp2,
          new BinaryOperator(tree.location, tmp, binop, getResult(right))),
      createAssignmentExpression(memberExpression, tmp2),
      tmp2
    ];
    return createCommaExpression(expressions);
  }

  transformAssignMemberLookupExpression(tree) {
    var left = tree.left;

    if (tree.operator.type === EQUAL) {
      // a[b] = c
      // =>
      // $0 = a, $1 = b, $2 = c, $0[$1] = $2, $2

      var operand = this.transformAny(left.operand);
      var memberExpression = this.transformAny(left.memberExpression);
      var right = this.transformAny(tree.right);

      var expressions = [
        ...getExpressions(operand),
        ...getExpressions(memberExpression),
        ...getExpressions(right),
        new BinaryOperator(tree.location,
            new MemberLookupExpression(
                left.location, getResult(operand), getResult(memberExpression)),
            tree.operator,
            getResult(right)),
        getResult(right)
      ];
      return createCommaExpression(expressions);
    }

    // a[b] += c
    // =>
    // $0 = a, $1 = b, $2 = c, $3 = $0[$1], $4 = $3 + $2, $0[$1] = $4, $4

    var operand = this.transformAny(left.operand);
    var memberExpression = this.transformAny(left.memberExpression);
    var right = this.transformAny(tree.right);
    var tmp = this.addTempVar();
    var memberLookupExpression = new MemberLookupExpression(left.location,
        getResult(operand), getResult(memberExpression));
    var tmp2 = this.addTempVar();
    var binop = createOperatorToken(
        assignmentOperatorToBinaryOperator(tree.operator.type));

    var expressions = [
      ...getExpressions(operand),
      ...getExpressions(memberExpression),
      ...getExpressions(right),
      createAssignmentExpression(tmp, memberLookupExpression),
      createAssignmentExpression(tmp2,
          new BinaryOperator(tree.location, tmp, binop, getResult(right))),
      createAssignmentExpression(memberLookupExpression, tmp2),
      tmp2
    ];
    return createCommaExpression(expressions);
  }

  transformArrayLiteralExpression(tree) {
    var elements = this.transformList(tree.elements);
    if (elements === tree.elements)
      return tree;

    var builder = this.createCommaExpressionBuilder();
    var results = [];
    for (var i = 0; i < elements.length; i++) {
      builder.add(elements[i]);
      results.push(getResult(elements[i]));
    }
    return builder.build(new ArrayLiteralExpression(tree.location, results));
  }

  transformObjectLiteralExpression(tree) {
    var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
    if (propertyNameAndValues === tree.propertyNameAndValues)
      return tree;

    var builder = this.createCommaExpressionBuilder();
    var results = [];
    for (var i = 0; i < propertyNameAndValues.length; i++) {
      if (propertyNameAndValues[i].type === PROPERTY_NAME_ASSIGNMENT) {
        builder.add(propertyNameAndValues[i].value);
        results.push(new PropertyNameAssignment(
            propertyNameAndValues[i].location,
            propertyNameAndValues[i].name,
            getResult(propertyNameAndValues[i].value)));
      } else {
        results.push(propertyNameAndValues[i]);
      }
    }
    return builder.build(new ObjectLiteralExpression(tree.location, results));
  }

  transformTemplateLiteralExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var elements = this.transformList(tree.elements);
    // If operand is present this has side effects.
    if (!operand && operand === tree.operand && elements === tree.elements)
      return tree;

    var builder = this.createCommaExpressionBuilder();
    if (operand)
      builder.add(operand);

    var results = [];
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].type === TEMPLATE_LITERAL_PORTION) {
        results.push(elements[i]);
      } else {
        var expression = elements[i].expression
        builder.add(expression);
        var result = getResult(expression);
        results.push(new TemplateSubstitution(expression.location, result));
      }
    }
    return builder.build(
        new TemplateLiteralExpression(
            tree.location, operand && getResult(operand), results));
  }

  transformCallExpression(tree) {
    if (tree.operand.type === MEMBER_EXPRESSION)
      return this.transformCallMemberExpression(tree);
    if (tree.operand.type === MEMBER_LOOKUP_EXPRESSION)
      return this.transformCallMemberLookupExpression(tree);
    return this.transformCallAndNew_(tree, CallExpression);
  }

  transformNewExpression(tree) {
    return this.transformCallAndNew_(tree, NewExpression);
  }

  transformCallAndNew_(tree, ctor) {
    var operand = this.transformAny(tree.operand);
    var args = this.transformAny(tree.args);

    // Call expression have side effects so don't short circuit.

    var builder = this.createCommaExpressionBuilder().add(operand);
    var argResults = [];
    args.args.forEach((arg) => {
      builder.add(arg);
      argResults.push(getResult(arg));
    });
    return builder.build(
        new ctor(tree.location, getResult(operand),
            new ArgumentList(args.location, argResults)));
  }

  transformCallMemberExpression(tree) {
    // a.b(c)
    // =>
    // $0 = a, $1 = $0.b, $2 = c, $3 = $1.call($0, $2), $3

    var memberName = tree.operand.memberName;
    var operand = this.transformAny(tree.operand.operand);
    var tmp = this.addTempVar();
    var memberExpresssion = new MemberExpression(
        tree.operand.location, getResult(operand), memberName);
    var args = this.transformAny(tree.args);

    var expressions = [
      ...getExpressions(operand),
      createAssignmentExpression(tmp, memberExpresssion)
    ];

    var argResults = [getResult(operand)];
    args.args.forEach((arg) => {
      expressions.push(...getExpressions(arg));
      argResults.push(getResult(arg));
    });

    var callExpression =
        new CallExpression(tree.location,
            createMemberExpression(tmp, 'call'),
            new ArgumentList(args.location, argResults));

    var tmp2 = this.addTempVar();
    expressions.push(
        createAssignmentExpression(tmp2, callExpression),
        tmp2);
    return createCommaExpression(expressions);
  }

  transformCallMemberLookupExpression(tree) {
    // a[b](c)
    // =>
    // $0 = a, $1 = b, $2 = $0[$1], $3 = c, $4 = $2.call($0, $3), $4

    var operand = this.transformAny(tree.operand.operand);
    var memberExpression = this.transformAny(tree.operand.memberExpression);
    var tmp = this.addTempVar();
    var lookupExpresssion = new MemberLookupExpression(
        tree.operand.location, getResult(operand), getResult(memberExpression));
    var args = this.transformAny(tree.args);

    var expressions = [
      ...getExpressions(operand),
      ...getExpressions(memberExpression),
      createAssignmentExpression(tmp, lookupExpresssion)
    ];

    var argResults = [getResult(operand)];
    args.args.forEach((arg, i) => {
      expressions.push(...getExpressions(arg));
      var result = getResult(arg);
      if (tree.args.args[i].type === SPREAD_EXPRESSION)
        result = new SpreadExpression(arg.location, result);
      argResults.push(result);
    });

    var callExpression =
        new CallExpression(tree.location,
            createMemberExpression(tmp, 'call'),
            new ArgumentList(args.location, argResults));

    var tmp2 = this.addTempVar();
    expressions.push(
        createAssignmentExpression(tmp2, callExpression),
        tmp2);
    return createCommaExpression(expressions);
  }

  transformConditionalExpression(tree) {
    // a ? b : c
    // =>
    // $0 = a, $0 ? ($1 = b, $2 = $1) : ($3 = c, $2 = $3), $2

    var condition = this.transformAny(tree.condition);
    var left = this.transformAny(tree.left);
    var right = this.transformAny(tree.right);
    if (condition === tree.condition && left === tree.left && right === tree.right)
      return tree;

    var res = this.addTempVar();
    var leftTree = createCommaExpression([
      ...getExpressions(left),
      createAssignmentExpression(res, getResult(left))
    ]);
    var rightTree = createCommaExpression([
      ...getExpressions(right),
      createAssignmentExpression(res, getResult(right))
    ]);

    var expressions = [
      ...getExpressions(condition),
      new ConditionalExpression(tree.location, getResult(condition),
          createParenExpression(leftTree), createParenExpression(rightTree)),
      res
    ];
    return createCommaExpression(expressions);
  }

  transformOr(left, right) {
    // a || b
    // =>
    // ($0 = a) ? $0 : b

    var res = this.addTempVar();

    var leftTree = createCommaExpression([
      createAssignmentExpression(res, getResult(left))
    ]);

    var rightTree = createCommaExpression([
      ...getExpressions(right),
      createAssignmentExpression(res, getResult(right))
    ]);

    var expressions = [
      ...getExpressions(left),
      new ConditionalExpression(left.location, getResult(left),
          createParenExpression(leftTree), createParenExpression(rightTree)),
      res
    ];
    return createCommaExpression(expressions);
  }

  transformAnd(left, right) {
    // a && b
    // =>
    // ($0 = a) ? b : $0

    var res = this.addTempVar();

    var leftTree = createCommaExpression([
      ...getExpressions(right),
      createAssignmentExpression(res, getResult(right))
    ]);

    var rightTree = createCommaExpression([
      createAssignmentExpression(res, getResult(left))
    ]);

    var expressions = [
      ...getExpressions(left),
      new ConditionalExpression(left.location, getResult(left),
          createParenExpression(leftTree), createParenExpression(rightTree)),
      res
    ];
    return createCommaExpression(expressions);
  }

  transformSpreadExpression(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression === tree.expression)
      return tree;

    var result = getResult(expression);
    if (result.type !== SPREAD_EXPRESSION)
      result = new SpreadExpression(result.location, result);

    var expressions = [
      ...getExpressions(expression),
      result
    ];
    return createCommaExpression(expressions);
  }

  createCommaExpressionBuilder() {
    return new CommaExpressionBuilder(this.addTempVar());
  }
}
