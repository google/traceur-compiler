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

import {ParseTree} from '../../syntax/trees/ParseTree.js';
import {ParseTreeVisitor} from '../../syntax/ParseTreeVisitor.js';
import {
  MODULE_DECLARATION,
  MODULE_DEFINITION,
  EXPORT_DECLARATION,
  IMPORT_DECLARATION
} from '../../syntax/trees/ParseTreeType.js';
import {STRING} from '../../syntax/TokenType.js';
import {Symbol} from '../../semantics/symbols/Symbol.js';
import {resolveUrl} from '../../util/url.js';

function getFriendlyName(module) {
  return module.name || module.url;
}

/**
 * A specialized parse tree visitor for use with modules.
 */
export class ModuleVisitor extends ParseTreeVisitor {
  /**
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   */
  constructor(reporter, project, module) {
    super();
    this.reporter_ = reporter;
    this.project = project;
    this.currentModule_ = module;
  }

  get currentModule() {
    return this.currentModule_;
  }

  /**
   * Finds a module by name. This walks the lexical scope chain of the
   * {@code currentModule} and returns first matching module or null if none
   * is found.
   * @param {string} name
   * @return {ModuleSymbol}
   */
  getModuleByName(name) {
    var module = this.currentModule;
    while (module) {
      if (module.hasModule(name)) {
        return module.getModule(name);
      }
      module = module.parent;
    }
    return null;
  }

  /**
   * @param {ModuleSpecifier} tree
   * @param {boolean=} reportErrors If false no errors are reported.
   * @return {ModuleSymbol}
   */
  getModuleForModuleSpecifier(tree, reportErrors) {
    // "url"
    if (tree.token.type == STRING) {
      var url = tree.token.processedValue;
      url = resolveUrl(this.currentModule.url, url);
      return this.project.getModuleForUrl(url);
    }

    // id

    var name = tree.token.value;
    var parent = this.getModuleByName(name);
    if (!parent) {
      if (reportErrors) {
        this.reportError_(tree, '\'%s\' is not a module', name);
      }
      return null;
    }


    return parent;
  }

  // Limit the trees to visit.
  visitFunctionDeclaration(tree) {}
  visitFunctionExpression(tree) {}
  visitSetAccessor(tree) {}
  visitGetAccessor(tree) {}

  visitModuleElement_(element) {
    switch (element.type) {
      case MODULE_DECLARATION:
      case MODULE_DEFINITION:
      case EXPORT_DECLARATION:
      case IMPORT_DECLARATION:
        this.visitAny(element);
    }
  }

  visitProgram(tree) {
    tree.programElements.forEach(this.visitModuleElement_, this);
  }

  visitModuleDefinition(tree) {
    var current = this.currentModule_;
    var name = tree.name.value;
    var module = current.getModule(name);
    traceur.assert(module);
    this.currentModule_ = module;
    tree.elements.forEach(this.visitModuleElement_, this);
    this.currentModule_ = current;
  }

  checkForDuplicateModule_(name, tree) {
    var parent = this.currentModule;
    if (parent.hasModule(name)) {
      this.reportError_(tree, 'Duplicate module declaration \'%s\'', name);
      this.reportRelatedError_(parent.getModule(name).tree);
      return false;
    }
    return true;
  }

  /**
   * @param {Symbol|ParseTree} symbolOrTree
   * @param {string} format
   * @param {...Object} args
   * @return {void}
   * @private
   */
  reportError_(symbolOrTree, format, ...args) {
    var tree;
    if (symbolOrTree instanceof Symbol) {
      tree = symbolOrTree.tree;
    } else {
      tree = symbolOrTree;
    }

    this.reporter_.reportError(tree.location.start, format, ...args);
  }

  /**
   * @param {Symbol|ParseTree} symbolOrTree
   * @return {void}
   * @private
   */
  reportRelatedError_(symbolOrTree) {
    if (symbolOrTree instanceof ParseTree) {
      this.reportError_(symbolOrTree, 'Location related to previous error');
    } else {
      var tree = symbolOrTree.tree;
      if (tree) {
        this.reportRelatedError_(tree);
      } else {
        this.reporter_.reportError(null,
            `Module related to previous error: ${symbolOrTree.url}`);
      }
    }
  }
}
