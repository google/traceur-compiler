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

import {ModuleSymbol} from '../../semantics/symbols/ModuleSymbol.js';
import {ModuleVisitor} from './ModuleVisitor.js';
import {
  IDENTIFIER,
  STRING
} from '../../syntax/TokenType.js';
import {assert} from '../../util/assert.js';
import {resolveUrl} from '../../util/url.js';

/**
 * Visits a parse tree and adds all the module definitions.
 *
 *   module 'm' { ... }
 */
export class ModuleDefinitionVisitor extends ModuleVisitor {
  /**
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   */
  constructor(reporter, project, module) {
    super(reporter, project, module);
  }

  visitModuleDefinition(tree) {
    if (tree.name.type === IDENTIFIER) {
      var name = tree.name.value;
      if (this.checkForDuplicateModule_(name, tree)) {
        var parent = this.currentModule;
        var module = new ModuleSymbol(name, parent, tree, parent.url);
        parent.addModule(module);
      }
    } else {
      assert(tree.name.type === STRING);
      var parent = this.currentModule;
      var baseUrl = parent ? parent.url : this.project.url;
      var url = resolveUrl(parent.url, tree.name.processedValue);
      var moduleSymbol = new ModuleSymbol(null, parent, tree, url);
      this.project.addExternalModule(moduleSymbol);
    }

    super.visitModuleDefinition(tree);
  }
}
