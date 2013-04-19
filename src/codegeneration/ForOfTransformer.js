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
  CLOSE,
  CURRENT,
  GET_ITERATOR,
  MOVE_NEXT,
  RUNTIME,
  TRACEUR_RUNTIME
} from '../syntax/PredefinedName.js';
import {VARIABLE_DECLARATION_LIST} from '../syntax/trees/ParseTreeType.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {VAR} from '../syntax/TokenType.js';
import {
  createArgumentList,
  createAssignmentExpression,
  createBlock,
  createCallExpression,
  createCallStatement,
  createExpressionStatement,
  createFinally,
  createIfStatement,
  createIdentifierExpression,
  createMemberExpression,
  createTryStatement,
  createVariableStatement,
  createWhileStatement
} from './ParseTreeFactory.js';
import {parseStatement} from './PlaceholderParser.js';

/**
 * Desugars for-of statement.
 */
export class ForOfTransformer extends TempVarTransformer {

  // for ( initializer of collection ) statement
  //
  // var $it = traceurRuntime.getIterator(collection);
  // try {
  //   while (true) {
  //     initializer = $it.next();
  //     statement
  //   }
  // } catch(e) {
  //   if (!traceurRuntime.isStopIteration(e))
  //     throw e;
  // }
  /**
   * @param {ForOfStatement} original
   * @return {ParseTree}
   */
  transformForOfStatement(original) {
    var tree = super.transformForOfStatement(original);
    var iter = createIdentifierExpression(this.getTempIdentifier());

    var assignment;
    if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
      // {var,let} initializer = $it.next();
      assignment = createVariableStatement(
          tree.initializer.declarationType,
          tree.initializer.declarations[0].lvalue,
          createCallExpression(createMemberExpression(iter, 'next')));
    } else {
      // initializer = $it.next();
      assignment = createExpressionStatement(
          createAssignmentExpression(
              tree.initializer,
              createCallExpression(createMemberExpression(iter, 'next'))));
    }

    var id = createIdentifierExpression;
    return parseStatement `
      {
        var ${iter} = ${id(TRACEUR_RUNTIME)}.getIterator(${tree.collection});
        try {
          while (true) {
            ${assignment};
            ${tree.body}; // statement
          }
        } catch(e) {
          if (!${id(TRACEUR_RUNTIME)}.isStopIteration(e))
            throw e;
        }
      }`;
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   */
  static transformTree(identifierGenerator, tree) {
    return new ForOfTransformer(identifierGenerator).transformAny(tree);
  }
}
