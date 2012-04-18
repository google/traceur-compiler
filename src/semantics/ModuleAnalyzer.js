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

  var ExportVisitor = traceur.codegeneration.module.ExportVisitor;
  var ImportStarVisitor = traceur.codegeneration.module.ImportStarVisitor;
  var ModuleDeclarationVisitor = traceur.codegeneration.module.ModuleDeclarationVisitor;
  var ModuleDefinitionVisitor = traceur.codegeneration.module.ModuleDefinitionVisitor;
  var ValidationVisitor = traceur.codegeneration.module.ValidationVisitor;

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
      this.analyzeTrees(this.project_.getSourceTrees());
    },

    /**
     * @param {SourceFile} sourceFile
     * @return {void}
     */
    analyzeFile: function(sourceFile) {
      var trees = [this.project_.getParseTree(sourceFile)];
      this.analyzeTrees(trees);
    },

    /**
     * @param {Array.<ParseTree>} trees
     * @return {void}
     */
    analyzeTrees: function(trees) {
      this.analyzeModuleTrees(trees);
    },

    /**
     * @param {ParseTree} tree
     * @param {ModuleSymbol} root
     * @return {void}
     */
    analyzeModuleTrees: function(trees, opt_roots) {
      var reporter = this.reporter_;
      var project = this.project_;
      var root = project.getRootModule();

      function getRoot(i) {
        return opt_roots ? opt_roots[i] : root;
      }

      function doVisit(ctor) {
        for (var i = 0; i < trees.length; i++) {
          var visitor = new ctor(reporter, project, getRoot(i));
          visitor.visitAny(trees[i]);
        }
      }

      doVisit(ModuleDefinitionVisitor);
      doVisit(ExportVisitor);
      doVisit(ModuleDeclarationVisitor);
      doVisit(ValidationVisitor);
      doVisit(ImportStarVisitor);
    }
  };

  return {
    ModuleAnalyzer: ModuleAnalyzer
  };
});
