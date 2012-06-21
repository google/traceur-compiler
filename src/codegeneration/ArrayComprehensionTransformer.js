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

  var ComprehensionTransformer = traceur.codegeneration.ComprehensionTransformer;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var TokenType = traceur.syntax.TokenType;

  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createAssignmentStatement = ParseTreeFactory.createAssignmentStatement;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberLookupExpression = ParseTreeFactory.createMemberLookupExpression;
  var createNumberLiteral = ParseTreeFactory.createNumberLiteral;
  var createPostfixExpression = ParseTreeFactory.createPostfixExpression;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;
  var createVariableDeclaration = ParseTreeFactory.createVariableDeclaration;
  var createVariableDeclarationList = ParseTreeFactory.createVariableDeclarationList;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

  /**
   * Array Comprehension Transformer:
   *
   * The desugaring is defined at
   * http://wiki.ecmascript.org/doku.php?id=harmony:array_comprehensions
   * as something like this:
   *
   * [ Expression0 for ( LHSExpression1 of Expression1 )
   *               ...
   *               for ( LHSExpressionn ) if ( Expression )opt ]
   *
   * =>
   *
   * (function () {
   *     var $result = [], $i = 0;
   *     for (let LHSExpression1 of Expression1 ) {
   *         ...
   *         for (let LHSExpressionn of Expressionn ) {
   *             if ( Expression )opt
   *                 $result[$i++] = Expression0;
   *             }
   *         }
   *     }
   *     return $result;
   * })()
   *
   * with alpha renaming of this and arguments of course.
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @constructor
   * @extends {ComprehensionTransformer}
   */
  function ArrayComprehensionTransformer(identifierGenerator) {
    ComprehensionTransformer.call(this, identifierGenerator);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  ArrayComprehensionTransformer.transformTree =
      function(identifierGenerator, tree) {
    return new ArrayComprehensionTransformer(identifierGenerator).
        transformAny(tree);
  };

  ArrayComprehensionTransformer.prototype = traceur.createObject(
      ComprehensionTransformer.prototype, {
    transformArrayComprehension: function(tree) {
      var expression = this.transformAny(tree.expression);

      var indexName = this.identifierGenerator.generateUniqueIdentifier();
      var resultName = this.identifierGenerator.generateUniqueIdentifier();
      var resultIdentifier = createIdentifierExpression(resultName);

      var initStatement = createVariableStatement(
          createVariableDeclarationList(TokenType.VAR, [
            createVariableDeclaration(indexName, createNumberLiteral(0)),
            createVariableDeclaration(resultName,
                                      createArrayLiteralExpression([]))
          ]));

      var statement = createAssignmentStatement(
          createMemberLookupExpression(
              resultIdentifier,
              createPostfixExpression(createIdentifierExpression(indexName),
                                      TokenType.PLUS_PLUS)),
          expression);

      var returnStatement = createReturnStatement(resultIdentifier);
      var isGenerator = false;

      return this.transformComprehension(tree, statement, isGenerator,
                                         initStatement, returnStatement);
    }
  });

  return {
    ArrayComprehensionTransformer: ArrayComprehensionTransformer
  };
});
