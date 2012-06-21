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
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
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
  var createThisExpression = ParseTreeFactory.createThisExpression;
  var createVariableDeclarationList = ParseTreeFactory.createVariableDeclarationList;

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
   * Base class for GeneratorComprehensionTransformer and
   * ArrayComprehensionTransformer.
   *
   * See subclasses for details on desugaring.
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @constructor
   * @extends {TempVarTransformer}
   */
  function ComprehensionTransformer(identifierGenerator) {
    TempVarTransformer.call(this, identifierGenerator);
  }

  var proto = TempVarTransformer.prototype;
  ComprehensionTransformer.prototype = traceur.createObject(proto, {
    /**
     * transformArrayComprehension and transformGeneratorComprehension calls
     * this
     * @param {ArrayComprehension|GeneratorComprehension} tree
     * @param {ParseTree} statement The statement that goes inside the innermost
     *     loop (and if if present).
     * @param {boolean} isGenerator
     * @param {ParseTree=} initStatement
     * @param {ParseTree=} returnStatement
     * @return {ParseTree}
     */
    transformComprehension: function(tree, statement, isGenerator,
        initStatement, returnStatement) {

      // This should really be a let but we don't support let in generators.
      // https://code.google.com/p/traceur-compiler/issues/detail?id=6
      var bindingKind = isGenerator ? TokenType.VAR : TokenType.LET;

      if (tree.ifExpression) {
        var ifExpression = this.transformAny(tree.ifExpression);
        statement = createIfStatement(ifExpression, statement);
      }
      for (var i = tree.comprehensionForList.length - 1; i >= 0; i--) {
        var item = tree.comprehensionForList[i];
        var left = this.transformAny(item.left);
        var iterator = this.transformAny(item.iterator);
        var initializer = createVariableDeclarationList(bindingKind,
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

      var statements = [];
      if (initStatement)
        statements.push(initStatement);
      statements.push(statement);
      if (returnStatement)
        statements.push(returnStatement);

      var func = new FunctionDeclaration(null, null, isGenerator,
                                         createEmptyParameterList(),
                                         createBlock(statements));

      return createParenExpression(createCallExpression(func));
    }
  });

  return {
    ComprehensionTransformer: ComprehensionTransformer
  };
});
