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

  var ExportSymbol = traceur.semantics.symbols.ExportSymbol;

  var IDENTIFIER_EXPRESSION = traceur.syntax.trees.ParseTreeType.IDENTIFIER_EXPRESSION;

  /**
   * Visits a parse tree and adds all the module definitions.
   *
   *   module m { ... }
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ExportVisitor(reporter, project, module) {
    ModuleVisitor.call(this, reporter, project, module);
    this.inExport_ = false;
    this.relatedTree_ = null;
  }

  ExportVisitor.prototype = traceur.createObject(ModuleVisitor.prototype, {

    addExport_: function(name, tree) {
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
    },

    visitClassDeclaration: function(tree) {
      this.addExport_(tree.name.identifierToken.value, tree);
    },

    visitExportDeclaration: function(tree) {
      this.inExport_ = true;
      this.visitAny(tree.declaration);
      this.inExport_ = false;
    },

    visitExportMapping: function(tree) {
      this.relatedTree_ = tree.moduleExpression;
      this.visitAny(tree.specifierSet);
      this.relatedTree_ = null;
    },

    visitExportMappingList: function(tree) {
      for (var i = 0; i < tree.paths.length; i++) {
        var path = tree.paths[i];
        if (path.type == IDENTIFIER_EXPRESSION) {
          this.addExport_(path.identifierToken.value, path);
        } else {
          this.visitAny(path);
        }
      }
    },

    visitExportSpecifier: function(tree) {
      this.addExport_((tree.rhs || tree.lhs).value, tree);
    },

    visitFunctionDeclaration: function(tree) {
      if (tree.name) {
        this.addExport_(tree.name.identifierToken.value, tree);
      }
    },

    visitIdentifierExpression: function(tree) {
      this.addExport_(tree.identifierToken.value, tree);
    },

    visitModuleDefinition: function(tree) {
      this.addExport_(tree.name.value, tree);
      var inExport = this.inExport_;
      this.inExport_ = false;
      ModuleVisitor.prototype.visitModuleDefinition.call(this, tree);
      this.inExport_ = inExport;
    },

    visitModuleSpecifier: function(tree) {
      this.addExport_(tree.identifier.value, tree);
    },

    visitVariableDeclaration: function(tree) {
      this.addExport_(tree.lvalue.identifierToken.value, tree);
    }
  });

  return {
    ExportVisitor: ExportVisitor
  };
});
