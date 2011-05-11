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

  var TokenType = traceur.syntax.TokenType;
  var PredefinedName = traceur.syntax.PredefinedName;

  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var FormalParameterList = traceur.syntax.trees.FormalParameterList;

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;
  var createConditionalExpression =
      ParseTreeFactory.createConditionalExpression;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createOperatorToken = ParseTreeFactory.createOperatorToken;
  var createNumberLiteral = ParseTreeFactory.createNumberLiteral;
  var createMemberLookupExpression =
      ParseTreeFactory.createMemberLookupExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createFunctionDeclaration = ParseTreeFactory.createFunctionDeclaration;
  var createBlock = ParseTreeFactory.createBlock;

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
      var transformedTree = ParseTreeTransformer.prototype.
          transformFunctionDeclaration.call(this, tree);
      if (this.hasDefaultParameters_(transformedTree.formalParameterList)) {
        return this.desugarDefaultParameters_(tree);
      }
      return transformedTree;
    },

    hasDefaultParameters_: function(params) {
      return params.parameters.some(function(param) {
        return param.type == ParseTreeType.DEFAULT_PARAMETER;
      });
    },

    desugarDefaultParameters_: function(tree) {

      // Desugar default parameters as follows:
      //
      // function f(x, y = expr1, z = expr2) {}
      //
      // function f(x) {
      //   var y = arguments.length > 0 ? arguments[1] : expr1;
      //   var z = arguments.length > 1 ? arguments[2] : expr2;
      // }

      var params = tree.formalParameterList.parameters.filter(function(param) {
        return param.type != ParseTreeType.DEFAULT_PARAMETER;
      });

      var parametersWithoutDefault =
          new FormalParameterList(
              tree.formalParameterList.location, params);

      var statements = [];

      for (var i = 0; i < tree.formalParameterList.parameters.length; i++) {
        var param = tree.formalParameterList.parameters[i];
        if (param.type == ParseTreeType.DEFAULT_PARAMETER) {
          var defaultParam = param;
          // var y = arguments.length > i ? arguments[i] : expr;
          statements.push(
              createVariableStatement(
              TokenType.VAR,
              defaultParam.identifier.identifierToken,
              createConditionalExpression(
                  createBinaryOperator(
                      createMemberExpression(PredefinedName.ARGUMENTS,
                                             PredefinedName.LENGTH),
                      createOperatorToken(TokenType.CLOSE_ANGLE),
                      createNumberLiteral(i)),
                  createMemberLookupExpression(
                      createIdentifierExpression(PredefinedName.ARGUMENTS),
                      createNumberLiteral(i)),
                  defaultParam.expression)));
        }
      }

      statements.push.apply(statements, tree.functionBody.statements);

      return createFunctionDeclaration(
          tree.name, parametersWithoutDefault,
          createBlock(statements));
    }
  });

  return {
    DefaultParametersTransformer: DefaultParametersTransformer
  };
});
