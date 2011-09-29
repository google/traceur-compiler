// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('codegeneration', function() {
  'use strict';

  var TokenType = traceur.syntax.TokenType;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var PredefinedName = traceur.syntax.PredefinedName;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createBlock = ParseTreeFactory.createBlock;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCallStatement = ParseTreeFactory.createCallStatement;
  var createFinally = ParseTreeFactory.createFinally;
  var createIfStatement = ParseTreeFactory.createIfStatement;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createTryStatement = ParseTreeFactory.createTryStatement;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;
  var createWhileStatement = ParseTreeFactory.createWhileStatement;

  /**
   * Desugars for of statement.
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @constructor
   */
  function ForOfTransformer(identifierGenerator) {
    ParseTreeTransformer.call(this);
    this.identifierGenerator_ = identifierGenerator;
    Object.freeze(this);
  }

  /*
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   */
  ForOfTransformer.transformTree = function(identifierGenerator, tree) {
    return new ForOfTransformer(identifierGenerator).transformAny(tree);
  };

  ForOfTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    // for ( initializer of collection ) statement
    //
    // let $it = collection.__traceurIterator__();
    // try {
    //   while ($it.moveNext()) {
    //     initializer = $it.current;
    //     statement
    //   }
    // } finally {
    //   if ($it.close)
    //     $it.close();
    // }
    /**
     * @param {ForOfStatement} original
     * @return {ParseTree}
     */
    transformForOfStatement: function(original) {
      var tree = ParseTreeTransformer.prototype.transformForOfStatement.call(
          this, original);

      //   let $it = collection.__traceurIterator__();
      // TODO: use 'var' instead of 'let' to enable yield's from within for of statements
      var iter = this.identifierGenerator_.generateUniqueIdentifier();
      var initializer = createVariableStatement(TokenType.VAR, iter,
          createCallExpression(createMemberExpression(tree.collection, PredefinedName.ITERATOR)));

      // {
      //   initializer = $it.current;
      //   statement
      // }
      var body = createBlock(
          createVariableStatement(
              tree.initializer.declarationType,
              tree.initializer.declarations[0].lvalue.identifierToken,
              createMemberExpression(iter, PredefinedName.CURRENT)),
          tree.body);

      // while ($it.moveNext()) { body }
      var loop = createWhileStatement(createCallExpression(
          createMemberExpression(iter, PredefinedName.MOVE_NEXT)), body);

      // if ($it.close)
      //   $it.close();
      var finallyBody = createIfStatement(
          createMemberExpression(iter, PredefinedName.CLOSE),
          createCallStatement(createMemberExpression(iter, PredefinedName.CLOSE)));

      return createBlock(initializer,
          createTryStatement(createBlock(loop), null, createFinally(createBlock(finallyBody))));
    }
  });

  return {
    ForOfTransformer: ForOfTransformer
  };
});
