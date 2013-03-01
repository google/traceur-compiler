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

import {ExportSymbol} from '../../semantics/symbols/ExportSymbol.js';
import {IDENTIFIER_EXPRESSION} from '../../syntax/trees/ParseTreeType.js';
import {ModuleVisitor} from './ModuleVisitor.js';

/**
 * Visits a parse tree and adds all the module definitions.
 *
 *   module m { ... }
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

    traceur.assert(typeof name == 'string');

    var parent = this.currentModule;
    if (parent.hasExport(name)) {
      this.reportError_(tree, 'Duplicate export declaration \'%s\'', name);
      this.reportRelatedError_(parent.getExport(name));
      return;
    }
    parent.addExport(name, new ExportSymbol(tree, name, this.relatedTree_));
  }

  visitClassDeclaration(tree) {
    this.addExport_(tree.name.identifierToken.value, tree);
  }

  visitExportDeclaration(tree) {
    this.inExport_ = true;
    this.visitAny(tree.declaration);
    this.inExport_ = false;
  }

  visitExportMapping(tree) {
    this.relatedTree_ = tree.moduleExpression;
    this.visitAny(tree.specifierSet);
    this.relatedTree_ = null;
  }

  visitExportMappingList(tree) {
    for (var i = 0; i < tree.paths.length; i++) {
      var path = tree.paths[i];
      if (path.type == IDENTIFIER_EXPRESSION) {
        this.addExport_(path.identifierToken.value, path);
      } else {
        this.visitAny(path);
      }
    }
  }

  visitExportSpecifier(tree) {
    this.addExport_((tree.rhs || tree.lhs).value, tree);
  }

  visitExportStar(tree) {
    var module = this.getModuleForModuleExpression(this.relatedTree_);
    module.getExports().forEach(({name}) => {
      this.addExport_(name, tree);
    });
  }

  visitFunctionDeclaration(tree) {
    this.addExport_(tree.name.identifierToken.value, tree);
  }

  visitIdentifierExpression(tree) {
    this.addExport_(tree.identifierToken.value, tree);
  }

  visitModuleDefinition(tree) {
    this.addExport_(tree.name.value, tree);
    var inExport = this.inExport_;
    this.inExport_ = false;
    super.visitModuleDefinition(tree);
    this.inExport_ = inExport;
  }

  visitModuleSpecifier(tree) {
    this.addExport_(tree.identifier.value, tree);
  }

  visitVariableDeclaration(tree) {
    this.addExport_(tree.lvalue.identifierToken.value, tree);
  }
}
