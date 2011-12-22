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

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var AlphaRenamer = traceur.codegeneration.AlphaRenamer;

  var ArgumentsFinder = traceur.codegeneration.ArgumentsFinder;
  var ArrayPattern = traceur.syntax.trees.ArrayPattern;
  var BinaryOperator = traceur.syntax.trees.BinaryOperator;
  var BindingIdentifier = traceur.syntax.trees.BindingIdentifier;
  var ObjectPattern = traceur.syntax.trees.ObjectPattern;
  var ObjectPatternField = traceur.syntax.trees.ObjectPatternField;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var PredefinedName = traceur.syntax.PredefinedName;
  var TokenType = traceur.syntax.TokenType;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;

  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createBlock = ParseTreeFactory.createBlock;
  var createCallCall = ParseTreeFactory.createCallCall;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCascadeExpression = ParseTreeFactory.createCascadeExpression;
  var createExpressionStatement = ParseTreeFactory.createExpressionStatement;
  var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = ParseTreeFactory.createMemberLookupExpression;
  var createParameterList = ParseTreeFactory.createParameterList;
  var createParenExpression = ParseTreeFactory.createParenExpression;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;
  var createThisExpression = ParseTreeFactory.createThisExpression;

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
   * @param {ErrorReporter} reporter
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function CascadeExpressionTransformer(reporter) {
    this.reporter_ = reporter;
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  CascadeExpressionTransformer.transformTree = function(reporter, tree) {
    return new CascadeExpressionTransformer(reporter).transformAny(tree);
  };

  var proto = ParseTreeTransformer.prototype;
  CascadeExpressionTransformer.prototype = traceur.createObject(proto, {

    /**
     * EXPR.{
     *   LHS = RHS
     *   CALL(ARGS)
     * }
     *
     * Transforms to (with alpha renaming of arguments)
     *
     * (function($tmp) {
     *   $tmp.LHS = RHS
     *   $tmp.CALL(ARGS);
     * }).call(this, EXPR)
     */
    transformCascadeExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var hasArguments = tree.expressions.some(function(expr) {
        return new ArgumentsFinder(expr).hasArguments;
      });

      // Transform inner .{} before outer.
      var statements = this.transformList(tree.expressions.
          map(this.desugarExpression_, this));

      statements.push(createReturnStatement(
          createIdentifierExpression(PredefinedName.getParameterName(0))));

      if (hasArguments) {
        // function($0, $arguments) { alpha renamed body }
        var func = createFunctionExpression(
            createParameterList(
                PredefinedName.getParameterName(0),
                PredefinedName.CAPTURED_ARGUMENTS),
            AlphaRenamer.rename(
                createBlock(statements),
                PredefinedName.ARGUMENTS,
                PredefinedName.CAPTURED_ARGUMENTS));

        // (func).call(this, operand, arguments)
        return createCallCall(
            createParenExpression(func),
            createThisExpression(),
            operand,
            createIdentifierExpression(PredefinedName.ARGUMENTS));
      }

      // function($0) { body }
      var func = createFunctionExpression(
          createParameterList(PredefinedName.getParameterName(0)),
          createBlock(statements));

      // (func).call(this, operand)
      return createCallCall(
          createParenExpression(func),
          createThisExpression(),
          operand);
    },

    desugarExpression_: function(tree) {
      switch (tree.type) {
        case ParseTreeType.BINARY_OPERATOR:
          return this.desugarBinaryExpression_(tree);
        case ParseTreeType.CALL_EXPRESSION:
          return this.desugarCallExpression_(tree);
        case ParseTreeType.CASCADE_EXPRESSION:
          return this.desugarCascadeExpression_(tree);
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
    desugarBinaryExpression_: function(tree) {
      return createExpressionStatement(createBinaryOperator(
          prependMemberExpression(PredefinedName.getParameterName(0),
                                  tree.left),
          tree.operator,
          tree.right));
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
    desugarCallExpression_: function(tree) {
      var newOperand = prependMemberExpression(
          PredefinedName.getParameterName(0),
          tree.operand);
      return createExpressionStatement(createCallExpression(newOperand,
                                                            tree.args));
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
    desugarCascadeExpression_: function(tree) {
      var newOperand = prependMemberExpression(
          PredefinedName.getParameterName(0),
          tree.operand);
      return createExpressionStatement(
          createCascadeExpression(newOperand, tree.expressions));
    }
  });

  return {
    CascadeExpressionTransformer: CascadeExpressionTransformer
  };
});
