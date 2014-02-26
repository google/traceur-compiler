// Copyright 2014 Traceur Authors.
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


import {assert} from '../util/assert';
import {createIdentifierExpression} from './ParseTreeFactory';
import globalThis from './globalThis';
import {ModuleTransformer} from './ModuleTransformer';
import {
  parseExpression,
  parseStatements
} from './PlaceholderParser';
import scopeContainsThis from './scopeContainsThis';

/**
 * @fileoverview Transform a module to a 'instantiate' format:
 * System.register(localName, [deps], function(normalizedNames) {});
 * where [deps] are unnormalized (module-specifier-like) names.
 */

export class InstantiateModuleTransformer extends ModuleTransformer {

  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.dependencies = [];
  }

  wrapModule(statements) {
    var depPaths = this.dependencies.map((dep) => dep.path);
    var depLocals = this.dependencies.map((dep) => dep.local);

    var hasTopLevelThis = statements.some(scopeContainsThis);

    var func = parseExpression `function(${depLocals}) {
      ${statements}
    }`;

    if (hasTopLevelThis)
      func = parseExpression `${func}.bind(${globalThis()})`;

    return parseStatements
        `System.register(${this.moduleName}, ${depPaths}, ${func});`;
  }

  /**
   * For
   *  import {foo} from './foo';
   * transcode the './foo' part to
   *  System.get(tempVar);
   * where tempVar is a function argument.
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    assert(this.moduleName);
    var name = tree.token.processedValue;
    var localName = this.getTempIdentifier();
    this.dependencies.push({path: tree.token, local: localName});
    var localIdentifier = createIdentifierExpression(localName);

    if (this.moduleSpecifierKind_ === 'module')
      return parseExpression `$traceurRuntime.ModuleStore.get(${localIdentifier})`;
    return parseExpression `$traceurRuntime.getModuleImpl(${localIdentifier})`;
  }
}
