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

import {ModuleTransformer} from './ModuleTransformer';
import {createBindingIdentifier} from './ParseTreeFactory';
import {
  parseExpression,
  parseStatements
} from './PlaceholderParser';

export class InlineModuleTransformer extends ModuleTransformer {

  getTempVarNameForModuleDefinition(moduleName) {
    return '$__module__' + moduleName.replace(/[^a-zA-Z0-9$]/g, function(c) {
      return '_' + c.charCodeAt(0) + '_';
    }) + '__';
  }

  wrapModule(statements) {
    var moduleVariable = this.getTempVarNameForModuleDefinition(this.moduleName)
    return parseStatements
        `var ${moduleVariable} = (function() {
          ${statements}
        }).call(this);`;
  }

  transformModuleSpecifier(tree) {
    var normalizedName = System.normalize(tree.token.processedValue, this.moduleName);
    var moduleVariable = this.getTempVarNameForModuleDefinition(normalizedName)
    return createBindingIdentifier(moduleVariable);
  }
}
