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

import {TRACEUR_RUNTIME} from '../syntax/PredefinedName';
import {VARIABLE_DECLARATION_LIST} from '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  createIdentifierExpression as id,
  createMemberExpression,
  createVariableStatement
} from './ParseTreeFactory';
import {parseStatement} from './PlaceholderParser';
import {transformOptions} from '../options';

var GET_ITERATOR_CODE = `function(object) {
  return object[%iterator]();
}`;

var GET_ITERATOR_RUNTIME_CODE = `function(object) {
  return ${TRACEUR_RUNTIME}.getIterator(object);
}`;

/**
 * Desugars for-of statement.
 */
export class ForOfTransformer extends TempVarTransformer {

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   */
  constructor(identifierGenerator, runtimeInliner) {
    super(identifierGenerator);
    this.runtimeInliner_ = runtimeInliner;
  }

  /**
   * @param {ForOfStatement} original
   * @return {ParseTree}
   */
  transformForOfStatement(original) {
    var tree = super.transformForOfStatement(original);
    var iter = id(this.getTempIdentifier());
    var result = id(this.getTempIdentifier());

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

    return parseStatement `
        for (var ${iter} =
                 ${this.getIterator_}(${tree.collection}),
                 ${result};
             !(${result} = ${iter}.next()).done; ) {
          ${assignment};
          ${tree.body};
        }`;
  }

  get getIterator_() {
    if (transformOptions.privateNames) {
      return this.runtimeInliner_.get('getIterator', GET_ITERATOR_RUNTIME_CODE);
    } else {
      return this.runtimeInliner_.get('getIterator', GET_ITERATOR_CODE);
    }
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ParseTree} tree
   */
  static transformTree(identifierGenerator, runtimeInliner, tree) {
    return new ForOfTransformer(identifierGenerator, runtimeInliner).transformAny(tree);
  }
}
