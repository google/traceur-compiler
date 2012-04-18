// Copyright 2011 Google Inc.
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

traceur.define('codegeneration.module', function() {
  'use strict';

  var ModuleVisitor = traceur.codegeneration.module.ModuleVisitor;

  function getFriendlyName(module) {
    return module.name || "'" + module.url + "'";
  }

  /**
   * Visits a parse tree and validates all module expressions.
   *
   *   module m from n, o from p.q.r
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ValidationVisitor(reporter, project, module) {
    ModuleVisitor.call(this, reporter, project, module);
  }

  ValidationVisitor.prototype = traceur.createObject(
      ModuleVisitor.prototype, {

    checkExport_: function(tree, name) {
      if (this.validatingModule_ && !this.validatingModule_.hasExport(name)) {
        this.reportError_(tree, '\'%s\' is not exported by %s', name,
            getFriendlyName(this.validatingModule_));
      }
    },

    /**
     * @param {ModuleSymbol} module
     * @param {ParseTree} tree
     */
    visitAndValidate_: function(module, tree) {
      var validatingModule = this.validatingModule_;
      this.validatingModule_ = module;
      this.visitAny(tree);
      this.validatingModule_ = validatingModule;
    },

    /**
     * @param {traceur.syntax.trees.ExportMapping} tree
     */
    visitExportMapping: function(tree) {
      // Ensures that the module expression exports the names we want to
      // re-export.
      if (tree.moduleExpression) {
        this.visitAny(tree.moduleExpression);
        var module = this.getModuleForModuleExpression(tree.moduleExpression);
        this.visitAndValidate_(module, tree.specifierSet);
      }
      // The else case is checked else where and duplicate exports are caught
      // as well as undefined variables.
    },

    visitExportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    },

    visitIdentifierExpression: function(tree) {
      this.checkExport_(tree, tree.identifierToken.value);
    },

    visitModuleExpression: function(tree) {
      this.getModuleForModuleExpression(tree, true /* reportErrors */);
    },

    visitImportBinding: function(tree) {
      var module = this.getModuleForModuleExpression(tree.moduleExpression,
          true /* reportErrors */);
      this.visitAndValidate_(module, tree.importSpecifierSet);
    },

    visitImportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    }
  });

  return {
    ValidationVisitor: ValidationVisitor
  };
});
