// Copyright 2013 Traceur Authors.
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

import {ModuleTransformer} from './ModuleTransformer';
import {VAR} from '../syntax/TokenType';
import {createBindingIdentifier} from './ParseTreeFactory';
import globalThis from './globalThis';
import {
  parseExpression,
  parseStatement,
  parseStatements,
  parsePropertyDefinition
} from './PlaceholderParser';
import scopeContainsThis from './scopeContainsThis';

export class AmdTransformer extends ModuleTransformer {

  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.dependencies = [];
  }

  getExportProperties() {
    var properties = super();

    if (this.exportVisitor_.hasExports())
      properties.push(parsePropertyDefinition `__transpiledModule: true`);
    return properties;
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

    return parseStatements `define(${depPaths}, ${func});`;
  }

  transformModuleSpecifier(tree) {
    var localName = this.getTempIdentifier();
    this.dependencies.push({path: tree.token, local: localName});
    return createBindingIdentifier(localName);
  }
}
