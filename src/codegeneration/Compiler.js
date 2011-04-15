// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Compiles a Traceur Project. Drives the overall compilation
 * process.
 */

traceur.define('codegeneration', function() {
  'use strict';

  var ProgramTransformer = traceur.codegeneration.ProgramTransformer;
  var Parser = traceur.syntax.Parser;

  var SemanticAnalyzer = traceur.semantics.SemanticAnalyzer;

  /**
   * @param {ErrorReporter} reporter Where to report compile errors.
   * @param {Project} project The project to compile.
   * @param {boolean} inOrder Should the compiler translates the results in
   *     source order. If false then the compiler will compile in an optimistic
   *     order.
   * @return {LinkedHashMap<SourceFile,ParseTree>} A map from input file name to
   *     translated results. Returns null if there was a compile error.
   */
  Compiler.compile = function(reporter, project, inOrder) {
    return new Compiler(reporter, project, inOrder).compile_();
  };

  /**
   * @param {ErrorReporter} reporter Where to report compile errors.
   * @param {Project} project The project to compile.
   * @param {boolean} inOrder Should the compiler translates the results in
   *     source order. If false then the compiler will compile in an optimistic
   *     order.
   * @param {SourceFile} sourceFile file to compile.
   * @return {LinkedHashMap<SourceFile,ParseTree>} A map from input file name to
   *     translated results. Returns null if there was a compile error.
   */
  Compiler.compileFile = function(reporter, project, inOrder, sourceFile) {
    return new Compiler(reporter, project, inOrder).compileFile_(sourceFile);
  };

  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {boolean} inOrder
   * @constructor
   */
  function Compiler(reporter, project, inOrder) {
    this.reporter_ = reporter;
    this.project_ = project;
    this.inOrder_ = inOrder;
  }

  Compiler.prototype = {
    /**
     * @return {LinkedHashMap<SourceFile,ParseTree>}
     * @private
     */
    compile_: function() {
      this.parse_();
      this.analyze_();
      this.transform_();

      if (this.hadError_()) {
        return null;
      }
      return this.results_;
    },

    /**
     * @param {SourceFile} file
     * @return {LinkedHashMap<SourceFile,ParseTree>}
     * @private
     */
    compileFile_: function(file) {
      this.parseFile_(file);
      this.analyzeFile_(file);
      this.transformFile_(file);

      if (this.hadError_()) {
        return null;
      }
      return this.results_;
    },

    /**
     * Transform the analyzed project to standard JS.
     *
     * @return {void}
     * @private
     */
    transform_: function() {
      if (this.hadError_()) {
        return;
      }
      this.results_ = ProgramTransformer.transform(this.reporter_,
                                                   this.project_);
    },

    /**
     * Transform the analyzed project to standard JS.
     *
     * @param {SourceFile} sourceFile
     * @return {void}
     * @private
     */
    transformFile_: function(sourceFile) {
      if (this.hadError_()) {
        return;
      }
      this.results_ = ProgramTransformer.transformFile(this.reporter_,
                                                       this.project_,
                                                       sourceFile);
    },

    /**
     * Build all symbols and perform all semantic checks.
     *
     * @return {void}
     * @private
     */
    analyze_: function() {
      if (this.hadError_()) {
        return;
      }
      var analyzer = new SemanticAnalyzer(this.reporter_, this.project_,
                                          this.inOrder_);
      analyzer.analyze();
    },

    /**
     * Build all symbols and perform all semantic checks.
     *
     * @param {SourceFile} sourceFile
     * @return {void}
     * @private
     */
    analyzeFile_: function(sourceFile) {
      if (this.hadError_()) {
        return;
      }
      var analyzer = new SemanticAnalyzer(this.reporter_, this.project_,
                                          this.inOrder_);
      analyzer.analyzeFile(sourceFile);
    },

    /**
     * Parse all source files in the project.
     *
     * @return {void}
     * @private
     */
    parse_: function() {
      this.project_.getSourceFiles().forEach(this.parseFile_, this);
    },

    /**
     * Parse all source files in the project.
     */
    /**
     * @param {SourceFile} file
     * @return {void}
     * @private
     */
    parseFile_: function(file) {
      if (this.hadError_()) {
        return;
      }

      this.project_.setParseTree(
          file, new Parser(this.reporter_, file).parseProgram());
    },

    /**
     * @return {boolean}
     * @private
     */
    hadError_: function() {
      return this.reporter_.hadError();
    }
  };

  return {
    Compiler: Compiler
  };
});
