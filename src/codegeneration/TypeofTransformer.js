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
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var TokenType = traceur.syntax.TokenType;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createConditionalExpression = ParseTreeFactory.createConditionalExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createOperatorToken = ParseTreeFactory.createOperatorToken;
  var createParenExpression = ParseTreeFactory.createParenExpression;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createUnaryExpression = ParseTreeFactory.createUnaryExpression;

  var RUNTIME = traceur.syntax.PredefinedName.RUNTIME;
  var TRACEUR = traceur.syntax.PredefinedName.TRACEUR;
  var TYPEOF = traceur.syntax.PredefinedName.TYPEOF;
  var UNDEFINED = traceur.syntax.PredefinedName.UNDEFINED;

  /**
   * @extends {ParseTreeTransformer}
   */
  function TypeofTransformer() {
    ParseTreeTransformer.call(this);
  }

  /*
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  TypeofTransformer.transformTree = function(tree) {
    return new TypeofTransformer().transformAny(tree);
  };

  var proto = ParseTreeTransformer.prototype;
  TypeofTransformer.prototype = traceur.createObject(proto, {
    transformUnaryExpression: function(tree) {
      if (tree.operator.type !== TokenType.TYPEOF)
        return proto.transformUnaryExpression.call(this, tree);

      var operand = this.transformAny(tree.operand);

      // traceur.runtime.typeof(operand))
      var callExpression = createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, TYPEOF),
          createArgumentList(operand));

      if (operand.type === ParseTreeType.IDENTIFIER_EXPRESSION) {
        // For ident we cannot just call the function since the ident might not
        // be bound to an identifier. This is important if the free variable
        // pass is not turned on.
        //
        // typeof ident
        //
        // Desugars to
        //
        // (typeof ident === 'undefined' ?
        //     'undefined' : traceur.runtime.typeof(ident))
        return createParenExpression(
            createConditionalExpression(
                // typeof ident === 'undefined'
                createBinaryOperator(
                    // typeof operand
                    createUnaryExpression(TokenType.TYPEOF, operand),
                    createOperatorToken(TokenType.EQUAL_EQUAL_EQUAL),
                    createStringLiteral(UNDEFINED)),
                createStringLiteral(UNDEFINED),
                callExpression));
      }

      // typeof expression
      //
      // Desugars to
      //
      // traceur.runtime.typef(expression)
      return callExpression;
    }
  });

  return {
    TypeofTransformer: TypeofTransformer
  };
});
