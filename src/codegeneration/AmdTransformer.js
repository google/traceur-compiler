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

import {ModuleTransformer} from './ModuleTransformer.js';
import {
  createIdentifierExpression,
  createStringLiteralToken
} from './ParseTreeFactory.js';
import globalThis from './globalThis.js';
import {
  parseExpression,
  parseStatement,
  parseStatements,
  parsePropertyDefinition
} from './PlaceholderParser.js';
import scopeContainsThis from './scopeContainsThis.js';

export class AmdTransformer extends ModuleTransformer {

  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.dependencies = [];
  }

  getExportProperties() {
    var properties = super.getExportProperties();

    if (this.exportVisitor_.hasExports())
      properties.push(parsePropertyDefinition `__esModule: true`);
    return properties;
  }

  moduleProlog() {
    // insert the default handling after the "use strict" and __moduleName lines
    var locals = this.dependencies.map((dep) => {
      var local = createIdentifierExpression(dep.local);
      return parseStatement
          `if (!${local} || !${local}.__esModule)
            ${local} = {default: ${local}}`;
    });
    return super.moduleProlog().concat(locals);
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

    if (this.moduleName) {
      return parseStatements `define(${this.moduleName}, ${depPaths}, ${func});`;
    }
    else {
      return parseStatements `define(${depPaths}, ${func});`;
    }
  }

  transformModuleSpecifier(tree) {
    var localName = this.getTempIdentifier();
    // AMD does not allow .js
    var value = tree.token.processedValue
    var stringLiteral = createStringLiteralToken(value.replace(/\.js$/, ''));

    this.dependencies.push({path: stringLiteral, local: localName});
    return createIdentifierExpression(localName);
  }
}
