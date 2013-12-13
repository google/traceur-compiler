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

import {VARIABLE_DECLARATION_LIST} from '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  createIdentifierExpression as id,
  createMemberExpression,
  createVariableStatement
} from './ParseTreeFactory';
import {parseStatement} from './PlaceholderParser';

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
    var iter = id(this.getTempIdentifier());
    var result = id(this.getTempIdentifier());

    var assignment;
    if (tree.initialiser.type === VARIABLE_DECLARATION_LIST) {
      // {var,let} initialiser = $result.value;
      assignment = createVariableStatement(
          tree.initialiser.declarationType,
          tree.initialiser.declarations[0].lvalue,
          createMemberExpression(result, 'value'));
    } else {
      assignment = parseStatement `${tree.initialiser} = ${result}.value;`;
    }

    return parseStatement `
        for (var ${iter} =
                 ${tree.collection}[Symbol.iterator](),
                 ${result};
             !(${result} = ${iter}.next()).done; ) {
          ${assignment};
          ${tree.body};
        }`;
  }
}
