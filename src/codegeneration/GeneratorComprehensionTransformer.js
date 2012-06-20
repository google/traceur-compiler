// Copyright 2012 Google Inc.
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

  var AlphaRenamer = traceur.codegeneration.AlphaRenamer;
  var FindInFunctionScope = traceur.codegeneration.FindInFunctionScope;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var TempVarTransformer = traceur.codegeneration.TempVarTransformer;
  var TokenType = traceur.syntax.TokenType;

  var createBlock = ParseTreeFactory.createBlock;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createEmptyParameterList = ParseTreeFactory.createEmptyParameterList;
  var createForOfStatement = ParseTreeFactory.createForOfStatement;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createIfStatement = ParseTreeFactory.createIfStatement;
  var createParenExpression = ParseTreeFactory.createParenExpression;
  var createScopedExpression = ParseTreeFactory.createScopedExpression;
  var createThisExpression = ParseTreeFactory.createThisExpression;
  var createVariableDeclarationList = ParseTreeFactory.createVariableDeclarationList;
  var createYieldStatement = ParseTreeFactory.createYieldStatement;

  /**
   * This is used to find whether a function contains a reference to 'this'.
   * @extend {FindInFunctionScope}
   * @param {ParseTree} tree The tree to search.
   */
  function ThisFinder(tree) {
    FindInFunctionScope.call(this, tree);
  }
  ThisFinder.prototype = traceur.createObject(
      FindInFunctionScope.prototype, {

    visitThisExpression: function(tree) {
      this.found = true;
    }
  });

  /**
   * This is used to find whether a function contains a reference to
   * 'arguments'.
   * @extend {FindInFunctionScope}
   * @param {ParseTree} tree The tree to search.
   */
  function ArgumentsFinder(tree) {
    FindInFunctionScope.call(this, tree);
  }
  ArgumentsFinder.prototype = traceur.createObject(
      FindInFunctionScope.prototype, {

    visitIdentifierExpression: function(tree) {
      if (tree.identifierToken.value === PredefinedName.ARGUMENTS)
        this.found = true;
    }
  });

  /**
   * Generator Comprehension Transformer:
   *
   * The desugaring is defined at
   * http://wiki.ecmascript.org/doku.php?id=harmony:generator_expressions#translation
   * as something like this:
   *
   * ( Expression0 for LHSExpression1 of Expression1 ...
   *               for LHSExpressionn of Expressionn if ( Expression )opt )
   *
   * =>
   *
   * (function () {
   *     for (let LHSExpression1 of Expression1 ) {
   *         ...
   *         for (let LHSExpressionn of Expressionn ) {
   *             if ( Expression )opt
   *                 yield (Expression0);
   *             }
   *         }
   *     }
   * })()
   *
   * with alpha renaming of this and arguments of course.
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @constructor
   * @extends {TempVarTransformer}
   */
  function GeneratorComprehensionTransformer(identifierGenerator) {
    TempVarTransformer.call(this, identifierGenerator);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  GeneratorComprehensionTransformer.transformTree =
      function(identifierGenerator, tree) {
    return new GeneratorComprehensionTransformer(identifierGenerator).
        transformAny(tree);
  };

  var proto = TempVarTransformer.prototype;
  GeneratorComprehensionTransformer.prototype = traceur.createObject(proto, {
    transformGeneratorComprehension: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statement = createYieldStatement(expression);
      if (tree.ifExpression) {
        var ifExpression = this.transformAny(tree.ifExpression);
        statement = createIfStatement(ifExpression, statement);
      }
      for (var i = tree.comprehensionForList.length - 1; i >= 0; i--) {
        var item = tree.comprehensionForList[i];
        var left = this.transformAny(item.left);
        var iterator = this.transformAny(item.iterator);
        // This should really be a let but we don't support let in generators.
        // https://code.google.com/p/traceur-compiler/issues/detail?id=6
        var initializer = createVariableDeclarationList(TokenType.VAR,
                                                        left, null);
        statement = createForOfStatement(initializer, iterator, statement);
      }

      var argumentsFinder = new ArgumentsFinder(statement);
      if (argumentsFinder.found) {
        var tempVar = this.addTempVar(
            createIdentifierExpression(PredefinedName.ARGUMENTS));
        statement = AlphaRenamer.rename(statement, PredefinedName.ARGUMENTS,
                                        tempVar);
      }

      var thisFinder = new ThisFinder(statement);
      if (thisFinder.found) {
        var tempVar = this.addTempVar(createThisExpression());
        statement = AlphaRenamer.rename(statement, PredefinedName.THIS,
                                        tempVar);
      }

      var isGenerator = true;
      var func = new FunctionDeclaration(null, null, isGenerator,
                                         createEmptyParameterList(),
                                         createBlock(statement));

      return createParenExpression(createCallExpression(func));
    }
  });

  return {
    GeneratorComprehensionTransformer: GeneratorComprehensionTransformer
  };
});
