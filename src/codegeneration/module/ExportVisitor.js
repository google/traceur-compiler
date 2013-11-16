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

import {ExportSymbol} from '../../semantics/symbols/ExportSymbol';
import {ModuleVisitor} from './ModuleVisitor';
import {assert} from '../../util/assert';

/**
 * Visits a parse tree and adds all the module definitions.
 *
 *   module 'm' { ... }
 *
 */
export class ExportVisitor extends ModuleVisitor {
  /**
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   */
  constructor(reporter, project, module) {
    super(reporter, project, module);
    this.inExport_ = false;
    this.relatedTree_ = null;
  }

  addExport_(name, tree) {
    if (!this.inExport_) {
      return;
    }

    assert(typeof name == 'string');

    var parent = this.currentModule;
    if (parent.hasExport(name)) {
      this.reportError_(tree, 'Duplicate export declaration \'%s\'', name);
      this.reportRelatedError_(parent.getExport(name));
      return;
    }
    parent.addExport(new ExportSymbol(name, tree, this.relatedTree_));
  }

  visitClassDeclaration(tree) {
    this.addExport_(tree.name.identifierToken.value, tree);
  }

  visitExportDeclaration(tree) {
    this.inExport_ = true;
    this.visitAny(tree.declaration);
    this.inExport_ = false;
  }

  visitNamedExport(tree) {
    this.relatedTree_ = tree.moduleSpecifier;
    this.visitAny(tree.specifierSet);
    this.relatedTree_ = null;
  }

  visitExportDefault(tree) {
    this.addExport_('default', tree);
  }

  visitExportSpecifier(tree) {
    this.addExport_((tree.rhs || tree.lhs).value, tree);
  }

  visitExportStar(tree) {
    var module = this.getModuleForModuleSpecifier(this.relatedTree_);
    module.getExports().forEach(({name}) => {
      this.addExport_(name, tree);
    });
  }

  visitFunctionDeclaration(tree) {
    this.addExport_(tree.name.identifierToken.value, tree);
  }

  visitModuleDeclaration(tree) {
    this.addExport_(tree.identifier.value, tree);
  }

  visitVariableDeclaration(tree) {
    this.addExport_(tree.lvalue.identifierToken.value, tree);
  }
}
