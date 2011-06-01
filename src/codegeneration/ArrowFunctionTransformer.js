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
  var ThisExpression = traceur.syntax.trees.ThisExpression;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var FormalParameterList = traceur.syntax.trees.FormalParameterList;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createBlock = ParseTreeFactory.createBlock;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createParenExpression = ParseTreeFactory.createParenExpression;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;

  /**
   * Desugars arrow function expressions
   *
   * @see <a href="http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax">strawman:arrow_function_syntax</a>
   *
   * @param {ErrorReporter} reporter
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function ArrowFunctionTransformer(reporter) {
    this.reporter_ = reporter;
  }

  ArrowFunctionTransformer.transformTree = function(reporter, tree) {
    return new ArrowFunctionTransformer(reporter).transformAny(tree);
  };

  ArrowFunctionTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    /**
     * Transforms an arrow function expression into a function declaration.
     * The main things we need to deal with are the 'this' binding, and adding a
     * block and return statement if needed.
     */
    transformArrowFunctionExpression: function(tree) {
      var thisBinding = null;
      var parameters;
      if (tree.formalParameters) {
        parameters = this.transformAny(tree.formalParameters).parameters;
      } else {
        parameters = [];
      }

      if (parameters.length > 0 &&
          parameters[0].type == ParseTreeType.BIND_THIS_PARAMETER) {

        if (tree.arrow == TokenType.FAT_ARROW) {
          this.reporter_.reportError(parameters[0].location.start,
              '"this" parameter cannot be used with "=>", use "->" instead');
        }

        thisBinding = parameters[0].expression;
        parameters = parameters.slice(1);
      }

      if (tree.arrow == TokenType.FAT_ARROW) {
        // "(params) => body" is equivalent to "(this = this, params) -> body"
        thisBinding = new ThisExpression(null);
      }

      var functionBody = this.transformAny(tree.functionBody);
      if (functionBody.type != ParseTreeType.BLOCK) {
        // { return expr; }
        functionBody = createBlock(createReturnStatement(functionBody));
      }

      // function(params) { ... }
      var result = createFunctionExpression(
          new FormalParameterList(null, parameters), functionBody);

      if (thisBinding) {
        // (function(params) { ... }).bind(thisBinding);
        result = createCallExpression(
            createMemberExpression(
                createParenExpression(result),
                PredefinedName.BIND),
            createArgumentList(thisBinding));
      }

      return result;
    }
  });

  return {
    ArrowFunctionTransformer: ArrowFunctionTransformer
  };
});
