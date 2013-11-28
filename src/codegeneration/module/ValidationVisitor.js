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

import {ModuleVisitor} from './ModuleVisitor';

/**
 * Validates that symbols are exported when we extract them.
 *
 *   export {a as b} from 'm'
 *   import {c as d} from 'n'
 *
 * validates that 'm' exports a and that 'n' exports c.
 */
export class ValidationVisitor extends ModuleVisitor {

  checkExport_(tree, name) {
    var module = this.validatingModule_;
    if (module && !module.hasExport(name)) {
      var url = module.url;
      this.reportError(tree, `'${name}' is not exported by '${url}'`);
    }
  }

  /**
   * @param {ModuleSymbol} module
   * @param {ParseTree} tree
   */
  visitAndValidate_(module, tree) {
    var validatingModule = this.validatingModule_;
    this.validatingModule_ = module;
    this.visitAny(tree);
    this.validatingModule_ = validatingModule;
  }

  /**
   * @param {NamedExport} tree
   */
  visitNamedExport(tree) {
    // Ensures that the module expression exports the names we want to
    // re-export.
    if (tree.moduleSpecifier) {
      var module = this.getModuleForModuleSpecifier(tree.moduleSpecifier);
      this.visitAndValidate_(module, tree.specifierSet);
    }
    // The else case is checked else where and duplicate exports are caught
    // as well as undefined variables.
  }

  visitExportSpecifier(tree) {
    // export {a as b} from 'm'
    this.checkExport_(tree, tree.lhs.value);
  }

  visitModuleSpecifier(tree) {
    this.getModuleForModuleSpecifier(tree);
  }

  visitImportDeclaration(tree) {
    var module = this.getModuleForModuleSpecifier(tree.moduleSpecifier);
    this.visitAndValidate_(module, tree.importClause);
  }

  visitImportSpecifier(tree) {
    this.checkExport_(tree, tree.lhs.value);
  }

  visitImportedBinding(tree) {
    this.checkExport_(tree, 'default');
  }
}
