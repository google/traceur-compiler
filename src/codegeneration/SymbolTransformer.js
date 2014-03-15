// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  BinaryOperator,
  MemberLookupExpression,
  UnaryExpression
} from '../syntax/trees/ParseTrees';
import {ExplodeExpressionTransformer} from './ExplodeExpressionTransformer';
import {
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  UNARY_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  EQUAL,
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  IN,
  NOT_EQUAL,
  NOT_EQUAL_EQUAL,
  STRING,
  TYPEOF
} from '../syntax/TokenType';
import {createParenExpression} from './ParseTreeFactory';
import {parseExpression} from './PlaceholderParser';

class ExplodeSymbolExpression extends ExplodeExpressionTransformer {
  transformArrowFunctionExpression(tree) {
    return tree;
  }
  transformClassExpression(tree) {
    return tree;
  }
  transformFunctionBody(tree) {
    return tree;
  }
}

function isEqualityExpression(tree) {
  switch (tree.operator.type) {
    case EQUAL_EQUAL:
    case EQUAL_EQUAL_EQUAL:
    case NOT_EQUAL:
    case NOT_EQUAL_EQUAL:
      return true;
  }
  return false;
}

function isTypeof(tree) {
  return tree.type === UNARY_EXPRESSION && tree.operator.type === TYPEOF;
}

function isSafeTypeofString(tree) {
  if (tree.type !== LITERAL_EXPRESSION)
    return false;
  var value = tree.literalToken.processedValue;
  switch (value) {
    case 'symbol':
    case 'object':
      return false;
  }
  return true;
}

/**
 * This transformer is used with symbol values to ensure that symbols can be
 * used as member expressions.
 *
 * It does the following transformations:
 *
 *   operand[memberExpression]
 *   =>
 *   operand[$traceurRuntime.toProperty(memberExpression)]
 *
 *   operand[memberExpression] = value
 *   =>
 *   $traceurRuntime.setProperty(operand, memberExpression}, value)
 */
export class SymbolTransformer extends TempVarTransformer {

  /**
   * Helper for the case where we only want to transform the operand of
   * the typeof expression.
   */
  transformTypeofOperand_(tree) {
    var operand = this.transformAny(tree.operand);
    return new UnaryExpression(tree.location, tree.operator, operand);
  }

  transformBinaryOperator(tree) {
    if (tree.operator.type === IN) {
      var name = this.transformAny(tree.left);
      var object = this.transformAny(tree.right);

      if (name.type === LITERAL_EXPRESSION)
        return new BinaryOperator(tree.location, name, tree.operator, object);

      // name in object
      // =>
      return parseExpression
          `$traceurRuntime.toProperty(${name}) in ${object}`;
    }

    // typeof expr === 'object'
    // Since symbols are implemented as objects typeof returns 'object'.
    // However, if the expression is comparing to 'undefined' etc we can just
    // use the built in typeof.
    if (isEqualityExpression(tree)) {
      if (isTypeof(tree.left) && isSafeTypeofString(tree.right)) {
        var left = this.transformTypeofOperand_(tree.left);
        var right = tree.right;
        return new BinaryOperator(tree.location, left, tree.operator, right);
      }

      if (isTypeof(tree.right) && isSafeTypeofString(tree.left)) {
        var left = tree.left;
        var right = this.transformTypeofOperand_(tree.right);
        return new BinaryOperator(tree.location, left, tree.operator, right);
      }
    }

    if (tree.left.type === MEMBER_LOOKUP_EXPRESSION &&
        tree.operator.isAssignmentOperator()) {

      if (tree.operator.type !== EQUAL) {
        var exploded = new ExplodeSymbolExpression(this).transformAny(tree);
        return this.transformAny(createParenExpression(exploded));
      }

      var operand = this.transformAny(tree.left.operand);
      var memberExpression = this.transformAny(tree.left.memberExpression);
      var value = this.transformAny(tree.right);

      // operand[memberExpr] = value
      // =>
      return parseExpression `$traceurRuntime.setProperty(${operand},
          ${memberExpression}, ${value})`;
    }

    return super.transformBinaryOperator(tree);
  }

  transformMemberLookupExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var memberExpression = this.transformAny(tree.memberExpression);

    // Only string literals can overlap with the symbol.
    if (memberExpression.type === LITERAL_EXPRESSION &&
        memberExpression.literalToken.type !== STRING) {
      return new MemberLookupExpression(tree.location, operand,
          memberExpression);
    }

    // operand[memberExpr]
    // =>
    return parseExpression
        `${operand}[$traceurRuntime.toProperty(${memberExpression})]`;
  }

  transformUnaryExpression(tree) {
    if (tree.operator.type !== TYPEOF)
      return super.transformUnaryExpression(tree);

    var operand = this.transformAny(tree.operand);

    var expression = parseExpression `$traceurRuntime.typeof(${operand})`;

    if (operand.type === IDENTIFIER_EXPRESSION) {
      // For ident we cannot just call the function since the ident might not
      // be bound to an identifier. This is important if the free variable
      // pass is not turned on.
      return parseExpression `(typeof ${operand} === 'undefined' ?
          'undefined' : ${expression})`;
    }

    return expression;
  }
}
