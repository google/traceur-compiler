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

import {ModuleDescription} from './ModuleSymbol';
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
   * @param {string} Module specifier, not normalized.
   * @param {function} codeUnit -> moduleDescription.
   * @return {ModuleDescription|null}
   */
  getModuleDescriptionFromCodeUnit_(name, codeUnitToModuleInfo) {
    var referrer = this.moduleSymbol.normalizedName;
    var codeUnit = this.loader_.getCodeUnitForModuleSpecifier(name, referrer);
    var moduleDescription = codeUnitToModuleInfo(codeUnit);
    if (!moduleDescription) {
      var msg = `${name} is not a module, required by ${referrer}`;
      this.reportError(codeUnit.metadata.tree, msg);
      return null;
    }
    return moduleDescription;
  }

  /**
   * @param {string} Module specifier, not normalized.
   * @return {ModuleSymbol|null}
   */
  getModuleSymbolForModuleSpecifier(name) {
    return this.getModuleDescriptionFromCodeUnit_(name, (codeUnit) => {
      return codeUnit.metadata.moduleSymbol;
    });
  }

  /**
   * @param {string} Module specifier, not normalized.
   * @return {ModuleDescription|null}
   */
  getModuleDescriptionForModuleSpecifier(name) {
    return this.getModuleDescriptionFromCodeUnit_(name, (codeUnit) => {
      var moduleDescription = codeUnit.metadata.moduleSymbol;
      if (!moduleDescription && codeUnit.result) {
        moduleDescription =
            new ModuleDescription(codeUnit.normalizedName, codeUnit.result);
      }
      return moduleDescription;
    });
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
   * @param {string} message
   * @return {void}
   */
  reportError(tree, message) {
    this.reporter.reportError(tree.location.start, message);
  }
}
