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

traceur.define('semantics', function() {
  'use strict';

  var ModuleDefinitionVisitor = traceur.codegeneration.module.ModuleDefinitionVisitor;
  var ExportVisitor = traceur.codegeneration.module.ExportVisitor;
  var ModuleDeclarationVisitor = traceur.codegeneration.module.ModuleDeclarationVisitor;
  var ValidationVisitor = traceur.codegeneration.module.ValidationVisitor;

  // TODO(arv): import
  // TODO(arv): Validate that there are no free variables
  // TODO(arv): Validate that the exported reference exists

  /**
   * Builds up all module symbols and validates them.
   *
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @constructor
   */
  function ModuleAnalyzer(reporter, project) {
    this.reporter_ = reporter;
    this.project_ = project;
  }

  ModuleAnalyzer.prototype = {
    /**
     * @return {void}
     */
    analyze: function() {
      var root = this.project_.getRootModule();
      var visitor = new ModuleDefinitionVisitor(this.reporter_, root);
      this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);

      if (!this.reporter_.hadError()) {
        visitor = new ExportVisitor(this.reporter_, root);
        this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);
      }

      if (!this.reporter_.hadError()) {
        visitor = new ModuleDeclarationVisitor(this.reporter_, root);
        this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);
      }

      if (!this.reporter_.hadError()) {
        visitor = new ValidationVisitor(this.reporter_, root);
        this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);
      }
    },

    /**
     * @param {SourceFile} sourceFile
     * @return {void}
     */
    analyzeFile: function(sourceFile) {
      var root = this.project_.getRootModule();
      var visitor = new ModuleDefinitionVisitor(this.reporter_, root);
      var tree = this.project_.getParseTree(sourceFile);
      visitor.visitAny(tree);

      if (!this.reporter_.hadError()) {
        visitor = new ExportVisitor(this.reporter_, root);
        visitor.visitAny(tree);
      }

      if (!this.reporter_.hadError()) {
        visitor = new ModuleDeclarationVisitor(this.reporter_, root);
        visitor.visitAny(tree);
      }

      if (!this.reporter_.hadError()) {
        visitor = new ValidationVisitor(this.reporter_, root);
        visitor.visitAny(tree);
      }
    }
  };

  return {
    ModuleAnalyzer: ModuleAnalyzer
  };
});
