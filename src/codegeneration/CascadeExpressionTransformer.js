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
  BINARY_OPERATOR,
  CALL_EXPRESSION,
  CALL_EXPRESSION,
  CASCADE_EXPRESSION,
  CASCADE_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  createAssignmentExpression,
  createBinaryOperator,
  createCallExpression,
  createCascadeExpression,
  createCommaExpression,
  createIdentifierExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createParenExpression
} from './ParseTreeFactory';

/**
 * Member expressions (and member lookup expressions) are built from right to
 * left.
 * @param {string} name
 * @param {ParseTree} rest
 * @return {MemberExpression}
 */
function prependMemberExpression(name, rest) {
  switch (rest.type) {
    case MEMBER_EXPRESSION:
      // rest = operand.name
      return createMemberExpression(
          prependMemberExpression(name, rest.operand),
          rest.memberName);
    case MEMBER_LOOKUP_EXPRESSION:
      // rest = operand[memberExpression]
      return createMemberLookupExpression(
          prependMemberExpression(name, rest.operand),
          rest.memberExpression);
    case IDENTIFIER_EXPRESSION:
      return createMemberExpression(name, rest.identifierToken);
    case CALL_EXPRESSION:
      return createCallExpression(
          prependMemberExpression(name, rest.operand),
          rest.args);
    case CASCADE_EXPRESSION:
      return createCascadeExpression(
          prependMemberExpression(name, rest.operand),
          rest.expressions);
    default:
      throw Error('Not reachable');
  }
}

/**
 * Cascade Expressions allow cascading property assignments and method calls.
 *
 * @see http://blog.mozilla.com/dherman/2011/12/01/now-thats-a-nice-stache/
 */
export class CascadeExpressionTransformer extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, reporter) {
    super(identifierGenerator);
    this.reporter_ = reporter;
  }

  /**
   * EXPR.{
   *   LHS = RHS
   *   CALL(ARGS)
   * }
   *
   * Transforms to
   *
   * var $tmp;
   * ...
   * ($tmp = EXPR, $tmp.LHS = RHS, $tmp.CALL = ARGS, $tmp)
   *
   */
  transformCascadeExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var ident = createIdentifierExpression(this.addTempVar());

    // Transform inner .{} before outer.
    var expressions = this.transformList(tree.expressions.
        map(this.desugarExpression_.bind(this, ident)));

    expressions.unshift(createAssignmentExpression(ident, operand));
    expressions.push(ident);
    return createParenExpression(createCommaExpression(expressions));
  }

  desugarExpression_(ident, tree) {
    switch (tree.type) {
      case BINARY_OPERATOR:
        return this.desugarBinaryExpression_(ident, tree);
      case CALL_EXPRESSION:
        return this.desugarCallExpression_(ident, tree);
      case CASCADE_EXPRESSION:
        return this.desugarCascadeExpression_(ident, tree);
      default:
        this.reporter_.reportError(tree.location.start,
            'Unsupported expression type in cascade: %s', tree.type);
    }
  }

  /**
   * Desugars
   *
   * LHS OP RHS
   *
   * to
   *
   * $tmp.LHS OP RHS
   */
  desugarBinaryExpression_(ident, tree) {
    return createBinaryOperator(
        prependMemberExpression(ident, tree.left),
        tree.operator,
        tree.right);
  }

  /**
   * Desugars
   *
   * CALL(EXPR)
   *
   * to
   *
   * $tmp.CALL(EXPR)
   */
  desugarCallExpression_(ident, tree) {
    var newOperand = prependMemberExpression(ident, tree.operand);
    return createCallExpression(newOperand, tree.args);
  }

  /**
   * Desugars
   *
   * OPERATOR.{ EXPRS }
   *
   * to
   *
   * $tmp.OPERATOR.{ EXPRS }
   */
  desugarCascadeExpression_(ident, tree) {
    var newOperand = prependMemberExpression(ident, tree.operand);
    return createCascadeExpression(newOperand, tree.expressions);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(identifierGenerator, reporter, tree) {
    return new CascadeExpressionTransformer(identifierGenerator, reporter).
        transformAny(tree);
  }
}
