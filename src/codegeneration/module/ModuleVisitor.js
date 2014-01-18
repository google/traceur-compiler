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

import {ParseTree} from '../../syntax/trees/ParseTree';
import {ParseTreeVisitor} from '../../syntax/ParseTreeVisitor';
import {
  MODULE_DECLARATION,
  EXPORT_DECLARATION,
  IMPORT_DECLARATION
} from '../../syntax/trees/ParseTreeType';

/**
 * A specialized parse tree visitor for use with modules.
 */
export class ModuleVisitor extends ParseTreeVisitor {
  /**
   * @param {traceur.util.ErrorReporter} reporter
   * @param {Loader} loader
   * @param {ModuleSymbol} moduleSymbol The root of the module system.
   */
  constructor(reporter, loader, moduleSymbol) {
    this.reporter = reporter;
    this.loader_ = loader;
    this.moduleSymbol = moduleSymbol;
  }

  /**
   * @param {ModuleSpecifier} tree
   * @param {boolean=} reportErrors If false no errors are reported.
   * @return {ModuleSymbol}
   */
  getModuleSymbolForModuleSpecifier(tree) {
    var name = tree.token.processedValue;
    var referrer = this.moduleSymbol.normalizedName;
    var codeUnit = this.loader_.getCodeUnitForModuleSpecifier(name, referrer);
    var moduleSymbol = codeUnit.metadata.moduleSymbol;
    if (!moduleSymbol) {
      var msg = `${name} is not a module, required by ${referrer}`;
      this.reportError(tree, msg);
      return null;
    }

    return moduleSymbol;
  }

  // Limit the trees to visit.
  visitFunctionDeclaration(tree) {}
  visitFunctionExpression(tree) {}
  visitFunctionBody(tree) {}
  visitBlock(tree) {}
  visitClassDeclaration(tree) {}
  visitClassExpression(tree) {}

  visitModuleElement_(element) {
    switch (element.type) {
      case MODULE_DECLARATION:
      case EXPORT_DECLARATION:
      case IMPORT_DECLARATION:
        this.visitAny(element);
    }
  }

  visitScript(tree) {
    tree.scriptItemList.forEach(this.visitModuleElement_, this);
  }

  visitModule(tree) {
    tree.scriptItemList.forEach(this.visitModuleElement_, this);
  }

  /**
   * @param {ParseTree} tree
   * @param {string} format
   * @param {...Object} args
   * @return {void}
   */
  reportError(tree, format, ...args) {
    this.reporter.reportError(tree.location.start, format, ...args);
  }
}
