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

import {TRACEUR_RUNTIME} from '../syntax/PredefinedName.js';
import {VARIABLE_DECLARATION_LIST} from '../syntax/trees/ParseTreeType.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  createIdentifierExpression,
  createMemberExpression,
  createVariableStatement
} from './ParseTreeFactory.js';
import {parseStatement} from './PlaceholderParser.js';

/**
 * Desugars for-of statement.
 */
export class ForOfTransformer extends TempVarTransformer {

  /**
   * @param {ForOfStatement} original
   * @return {ParseTree}
   */
  transformForOfStatement(original) {
    var tree = super.transformForOfStatement(original);
    var iter = createIdentifierExpression(this.getTempIdentifier());
    var result = createIdentifierExpression(this.getTempIdentifier());

    var assignment;
    if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
      // {var,let} initializer = $result.value;
      assignment = createVariableStatement(
          tree.initializer.declarationType,
          tree.initializer.declarations[0].lvalue,
          createMemberExpression(result, 'value'));
    } else {
      assignment = parseStatement `${tree.initializer} = ${result}.value;`;
    }
    var id = createIdentifierExpression;

    return parseStatement `
        for (var ${iter} =
                 ${id(TRACEUR_RUNTIME)}.getIterator(${tree.collection}),
                 ${result};
             !(${result} = ${iter}.next()).done; ) {
          ${assignment};
          ${tree.body};
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
