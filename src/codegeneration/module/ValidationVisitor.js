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

  /**
   * Visits a parse tree and validates all module expressions.
   *
   *   module m = n, o = p.q.r
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
        this.reportError_(tree, '\'%s\' is not exported', name);
        this.reportRelatedError_(this.validatingModule_);
      }
    },

    /**
     * @param {ModuleSymbol} module
     * @param {ParseTree} tree
     * @param {string=} name
     */
    visitAndValidate_: function(module, tree, name) {
      var validatingModule = this.validatingModule_;
      this.validatingModule_ = module;
      if (name) {
        this.checkExport_(tree, name);
      } else {
        this.visitAny(tree);
      }
      this.validatingModule_ = validatingModule;
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPath: function(tree) {
      this.visitAny(tree.moduleExpression);
      var module = this.getModuleForModuleExpression(tree.moduleExpression);
      this.visitAndValidate_(module, tree.specifier);
    },

    visitExportSpecifier: function(tree) {
      var token = tree.rhs || tree.lhs;
      this.checkExport_(tree, token.value);
    },

    visitIdentifierExpression: function(tree) {
      this.checkExport_(tree, tree.identifierToken.value);
    },

    visitModuleExpression: function(tree) {
      this.getModuleForModuleExpression(tree, true /* reportErrors */);
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      this.visitAny(tree.moduleExpression);
      var module = this.getModuleForModuleExpression(tree.moduleExpression);
      this.visitAndValidate_(module, tree, tree.identifier.value);
    }
  });

  return {
    ValidationVisitor: ValidationVisitor
  };
});
