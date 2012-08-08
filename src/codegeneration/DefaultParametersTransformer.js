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

  var FormalParameterList = traceur.syntax.trees.FormalParameterList;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var TokenType = traceur.syntax.TokenType;

  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createBlock = ParseTreeFactory.createBlock;
  var createConditionalExpression = ParseTreeFactory.createConditionalExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = ParseTreeFactory.createMemberLookupExpression;
  var createNumberLiteral = ParseTreeFactory.createNumberLiteral;
  var createOperatorToken = ParseTreeFactory.createOperatorToken;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;
  var createVoid0 = ParseTreeFactory.createVoid0;

  var stack = [];

  /**
   * Desugars default parameters.
   *
   * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:parameter_default_values">harmony:parameter_default_values</a>
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function DefaultParametersTransformer() {
    ParseTreeTransformer.call(this);
  }

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  DefaultParametersTransformer.transformTree = function(tree) {
    return new DefaultParametersTransformer().transformAny(tree);
  };

  DefaultParametersTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    transformFunctionDeclaration: function(tree) {
      stack.push([]);

      var transformedTree = ParseTreeTransformer.prototype.
          transformFunctionDeclaration.call(this, tree);

      var statements = stack.pop();
      if (!statements.length)
        return transformedTree;

      // Prepend the var statements to the block.
      statements.push.apply(statements,
                            transformedTree.functionBody.statements);

      return new FunctionDeclaration(transformedTree.location,
                                     transformedTree.name,
                                     transformedTree.isGenerator,
                                     transformedTree.formalParameterList,
                                     createBlock(statements));
    },

    transformFormalParameterList: function(tree) {
      var parameters = [];
      var statements = stack[stack.length - 1];
      var changed = false;
      for (var i = 0; i < tree.parameters.length; i++) {
        var param = this.transformAny(tree.parameters[i]);
        if (param !== tree.parameters[i])
          changed = true;

        if (param.type === ParseTreeType.REST_PARAMETER || !param.initializer) {
          parameters.push(param);

        // binding = initializer
        //
        // =>
        //
        // var binding = arguments[i] !== (void 0) ? arguments[i] : initializer;
        } else {
          changed = true;
          statements.push(createVariableStatement(
              TokenType.VAR,
              param.binding,
              createConditionalExpression(
                  createBinaryOperator(
                      createMemberLookupExpression(
                          createIdentifierExpression(PredefinedName.ARGUMENTS),
                          createNumberLiteral(i)),
                      createOperatorToken(TokenType.NOT_EQUAL_EQUAL),
                      createVoid0()),
                  createMemberLookupExpression(
                      createIdentifierExpression(PredefinedName.ARGUMENTS),
                      createNumberLiteral(i)),
                  param.initializer)));
        }
      }

      if (!changed)
        return tree;

      return new FormalParameterList(tree.location, parameters);
    }
  });

  return {
    DefaultParametersTransformer: DefaultParametersTransformer
  };
});
