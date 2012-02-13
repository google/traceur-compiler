// Copyright 2011 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;

  var BinaryOperator = traceur.syntax.trees.BinaryOperator;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var TempVarTransformer = traceur.codegeneration.TempVarTransformer;

  var createAssignmentExpression = ParseTreeFactory.createAssignmentExpression;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCascadeExpression = ParseTreeFactory.createCascadeExpression;
  var createCommaExpression = ParseTreeFactory.createCommaExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = ParseTreeFactory.createMemberLookupExpression;
  var createParenExpression = ParseTreeFactory.createParenExpression;

  /**
   * Member expressions (and member lookup expressions) are built from right to
   * left.
   * @param {string} name
   * @param {ParseTree} rest
   * @return {MemberExpression}
   */
  function prependMemberExpression(name, rest) {
    switch (rest.type) {
      case ParseTreeType.MEMBER_EXPRESSION:
        // rest = operand.name
        return createMemberExpression(
            prependMemberExpression(name, rest.operand),
            rest.memberName);
      case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        // rest = operand[memberExpression]
        return createMemberLookupExpression(
            prependMemberExpression(name, rest.operand),
            rest.memberExpression);
      case ParseTreeType.IDENTIFIER_EXPRESSION:
        return createMemberExpression(name, rest.identifierToken);
      case ParseTreeType.CALL_EXPRESSION:
        return createCallExpression(
            prependMemberExpression(name, rest.operand),
            rest.args);
      case ParseTreeType.CASCADE_EXPRESSION:
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
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @constructor
   * @extends {TempVarTransformer}
   */
  function CascadeExpressionTransformer(identifierGenerator, reporter) {
    TempVarTransformer.call(this, identifierGenerator);
    this.reporter_ = reporter;
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  CascadeExpressionTransformer.transformTree = function(identifierGenerator,
                                                        reporter, tree) {
    return new CascadeExpressionTransformer(identifierGenerator, reporter).
        transformAny(tree);
  };

  var proto = TempVarTransformer.prototype;
  CascadeExpressionTransformer.prototype = traceur.createObject(proto, {

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
    transformCascadeExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var ident = createIdentifierExpression(this.addTempVar());

      // Transform inner .{} before outer.
      var expressions = this.transformList(tree.expressions.
          map(this.desugarExpression_.bind(this, ident)));

      expressions.unshift(createAssignmentExpression(ident, operand));
      expressions.push(ident);
      return createParenExpression(createCommaExpression(expressions));
    },

    desugarExpression_: function(ident, tree) {
      switch (tree.type) {
        case ParseTreeType.BINARY_OPERATOR:
          return this.desugarBinaryExpression_(ident, tree);
        case ParseTreeType.CALL_EXPRESSION:
          return this.desugarCallExpression_(ident, tree);
        case ParseTreeType.CASCADE_EXPRESSION:
          return this.desugarCascadeExpression_(ident, tree);
        default:
          this.reporter_.reportError(tree.location.start,
              'Unsupported expression type in cascade: %s', tree.type);
      }
    },

    /**
     * Desugars
     *
     * LHS OP RHS
     *
     * to
     *
     * $tmp.LHS OP RHS
     */
    desugarBinaryExpression_: function(ident, tree) {
      return createBinaryOperator(
          prependMemberExpression(ident, tree.left),
          tree.operator,
          tree.right);
    },

    /**
     * Desugars
     *
     * CALL(EXPR)
     *
     * to
     *
     * $tmp.CALL(EXPR)
     */
    desugarCallExpression_: function(ident, tree) {
      var newOperand = prependMemberExpression(ident, tree.operand);
      return createCallExpression(newOperand, tree.args);
    },

    /**
     * Desugars
     *
     * OPERATOR.{ EXPRS }
     *
     * to
     *
     * $tmp.OPERATOR.{ EXPRS }
     */
    desugarCascadeExpression_: function(ident, tree) {
      var newOperand = prependMemberExpression(ident, tree.operand);
      return createCascadeExpression(newOperand, tree.expressions);
    }
  });

  return {
    CascadeExpressionTransformer: CascadeExpressionTransformer
  };
});
