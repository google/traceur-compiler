// Copyright 2012 Google Inc.
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
  CLOSE,
  CURRENT,
  GET_ITERATOR,
  MOVE_NEXT,
  RUNTIME,
  TRACEUR
} from '../syntax/PredefinedName.js';
import VARIABLE_DECLARATION_LIST from '../syntax/trees/ParseTreeType.js';
import TempVarTransformer from 'TempVarTransformer.js';
import VAR from '../syntax/TokenType.js';
import {
  createArgumentList,
  createAssignmentExpression,
  createBlock,
  createCallExpression,
  createCallStatement,
  createExpressionStatement,
  createFinally,
  createIfStatement,
  createMemberExpression,
  createStringLiteral,
  createTryStatement,
  createVariableStatement,
  createWhileStatement
} from 'ParseTreeFactory.js';

/**
 * Desugars for-of statement.
 */
export class ForOfTransformer extends TempVarTransformer {

  // for ( initializer of collection ) statement
  //
  // let $it = traceur.runtime.getIterator(collection);
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
  transformForOfStatement(original) {
    var tree = super.transformForOfStatement(original);

    //   let $it = traceur.runtime.getIterator(collection);
    // TODO: use 'var' instead of 'let' to enable yield's from within for of statements
    var iter = this.getTempIdentifier();
    var initializer = createVariableStatement(VAR, iter,
        createCallExpression(
            createMemberExpression(TRACEUR, RUNTIME, GET_ITERATOR),
            createArgumentList(tree.collection)));

    // {
    //   initializer = $it.current;
    //   statement
    // }
    var statement;
    if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
      statement = createVariableStatement(
          tree.initializer.declarationType,
          tree.initializer.declarations[0].lvalue,
          createMemberExpression(iter, CURRENT));
    } else {
      statement = createExpressionStatement(
          createAssignmentExpression(tree.initializer,
              createMemberExpression(iter, CURRENT)));
    }
    var body = createBlock(statement, tree.body);

    // while ($it.moveNext()) { body }
    var loop = createWhileStatement(createCallExpression(
        createMemberExpression(iter, MOVE_NEXT)), body);

    // if ($it.close)
    //   $it.close();
    var finallyBody = createIfStatement(
        createMemberExpression(iter, CLOSE),
        createCallStatement(createMemberExpression(iter, CLOSE)));

    return createBlock(initializer,
        createTryStatement(createBlock(loop), null, createFinally(createBlock(finallyBody))));
  }
}

/**
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @param {ParseTree} tree
 */
ForOfTransformer.transformTree = function(identifierGenerator, tree) {
  return new ForOfTransformer(identifierGenerator).transformAny(tree);
};
