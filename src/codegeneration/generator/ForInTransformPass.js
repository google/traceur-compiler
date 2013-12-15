// Copyright 2012 Traceur Authors.
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

import {
  BLOCK,
  VARIABLE_DECLARATION_LIST,
  IDENTIFIER_EXPRESSION
} from '../../syntax/trees/ParseTreeType';
import {
  LENGTH,
  PUSH
} from '../../syntax/PredefinedName';
import {TempVarTransformer} from '../TempVarTransformer';
import {
  BANG,
  IN,
  OPEN_ANGLE,
  PLUS_PLUS,
  VAR
} from '../../syntax/TokenType';
import {
  createArgumentList,
  createAssignmentStatement,
  createBinaryOperator,
  createBlock,
  createCallStatement,
  createContinueStatement,
  createEmptyArrayLiteralExpression,
  createForInStatement,
  createForStatement,
  createIdentifierExpression,
  createIfStatement,
  createMemberExpression,
  createMemberLookupExpression,
  createNumberLiteral,
  createOperatorToken,
  createParenExpression,
  createPostfixExpression,
  createUnaryExpression,
  createVariableDeclarationList,
  createVariableStatement
} from '../ParseTreeFactory';

/**
 * Desugars for-in loops to be compatible with generators.
 */
export class ForInTransformPass extends TempVarTransformer {

  // for ( var key in object ) statement
  //
  // var $keys = [];
  // var $collection = object;
  // for (var $p in $collection) $keys.push($p);
  // for (var $i = 0; $i < $keys.length; $i++) {
  //   var key;
  //   key = $keys[$i];
  //   if (!(key in $collection))
  //     continue;
  //   statement
  // }
  /**
   * @param {ForInStatement} original
   * @return {ParseTree}
   */
  transformForInStatement(original) {
    var tree = original;

    // Transform body first
    var bodyStatements = [];
    var body = this.transformAny(tree.body);
    if (body.type == BLOCK) {
      bodyStatements.push(...body.statements);
    } else {
      bodyStatements.push(body);
    }

    var elements = [];

    // var $keys = [];
    var keys = this.getTempIdentifier();
    elements.push(
        createVariableStatement(VAR, keys,
        createEmptyArrayLiteralExpression()));

    // var $collection = object;
    var collection = this.getTempIdentifier();
    elements.push(createVariableStatement(VAR, collection, tree.collection));

    // for (var $p in $collection) $keys.push($p);
    var p = this.getTempIdentifier();
    elements.push(
        createForInStatement(
            // var $p
            createVariableDeclarationList(VAR, p, null),
            // $collection
            createIdentifierExpression(collection),
            // $keys.push($p)
            createCallStatement(
                createMemberExpression(keys, PUSH),
                createArgumentList(createIdentifierExpression(p)))));

    var i = this.getTempIdentifier();

    // $keys[$i]
    var lookup = createMemberLookupExpression(
        createIdentifierExpression(keys),
        createIdentifierExpression(i));

    var originalKey, assignOriginalKey;
    if (tree.initialiser.type == VARIABLE_DECLARATION_LIST) {
      var decList = tree.initialiser;
      originalKey = createIdentifierExpression(decList.declarations[0].lvalue);
      // var key = $keys[$i];
      assignOriginalKey = createVariableStatement(decList.declarationType,
          originalKey.identifierToken, lookup);
    } else if (tree.initialiser.type == IDENTIFIER_EXPRESSION) {
      originalKey = tree.initialiser;
      // key = $keys[$i];
      assignOriginalKey = createAssignmentStatement(tree.initialiser, lookup);
    } else {
      throw new Error('Invalid left hand side of for in loop');
    }

    var innerBlock = [];

    // var key = $keys[$i];
    innerBlock.push(assignOriginalKey);

    // if (!(key in $collection))
    innerBlock.push(
        createIfStatement(
            createUnaryExpression(
                createOperatorToken(BANG),
                createParenExpression(
                    createBinaryOperator(
                        originalKey,
                        createOperatorToken(IN),
                        createIdentifierExpression(collection)))),
            // continue
            createContinueStatement(),
            null));

    // add original body
    innerBlock.push(...bodyStatements);

    // for (var $i = 0; $i < $keys.length; $i++) {
    elements.push(
        createForStatement(
            // var $i = 0
            createVariableDeclarationList(VAR, i, createNumberLiteral(0)),
            // $i < $keys.length
            createBinaryOperator(
                createIdentifierExpression(i),
                createOperatorToken(OPEN_ANGLE),
                createMemberExpression(keys, LENGTH)),
            // $i++
            createPostfixExpression(
                createIdentifierExpression(i),
                createOperatorToken(PLUS_PLUS)),
            // body
            createBlock(innerBlock)));

    return createBlock(elements);
  }
}
