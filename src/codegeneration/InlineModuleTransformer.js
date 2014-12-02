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

import {VAR} from '../syntax/TokenType.js';
import {ModuleTransformer} from './ModuleTransformer.js';
import {
  createBindingIdentifier,
  createEmptyStatement,
  createFunctionBody,
  createImmediatelyInvokedFunctionExpression,
  createScopedExpression,
  createVariableStatement
} from './ParseTreeFactory.js';
import globalThis from './globalThis.js';
import scopeContainsThis from './scopeContainsThis.js';

var anonInlineModules = 0;

/**
 * Inline modules are meant for compilation of all modules to a single file.
 * They require no runtime but have slightly different semantics than ES6
 * modules since the execution is eager.
 */
export class InlineModuleTransformer extends ModuleTransformer {

  wrapModule(statements) {
    var seed = this.moduleName || 'anon_' + ++anonInlineModules;
    var idName = this.getTempVarNameForModuleName(seed);

    var body = createFunctionBody(statements);
    var moduleExpression;
    if (statements.some(scopeContainsThis)) {
      moduleExpression = createScopedExpression(body, globalThis());
    } else {
      moduleExpression = createImmediatelyInvokedFunctionExpression(body);
    }

    return [createVariableStatement(VAR, idName, moduleExpression)];
  }

  transformNamedExport(tree) {
    return createEmptyStatement();
  }

  transformModuleSpecifier(tree) {
    return createBindingIdentifier(this.getTempVarNameForModuleSpecifier(tree));
  }
}
