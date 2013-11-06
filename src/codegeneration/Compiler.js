// Copyright 2012 Traceur Authors.
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

import {ModuleAnalyzer} from '../semantics/ModuleAnalyzer';
import {Parser} from '../syntax/Parser';
import {ProgramTransformer} from './ProgramTransformer';
import {Project} from '../semantics/symbols/Project';

/**
 * @fileoverview Compiles a Traceur Project. Drives the overall compilation
 * process.
 */

/**
 * @param {ErrorReporter} reporter
 * @param {Project} project
 */
export class Compiler {
  constructor(reporter, project) {
    this.reporter_ = reporter;
    this.project_ = project;
  }

  /**
   * @return {ObjectMap}
   * @private
   */
  compile_() {
    this.parse_();
    this.analyze_();
    this.transform_();

    if (this.hadError_()) {
      return null;
    }
    return this.results_;
  }

  /**
   * @param {SourceFile} file
   * @return {ParseTree}
   * @private
   */
  compileFile_(file) {
    this.parseFile_(file);
    this.analyzeFile_(file);
    this.transformFile_(file);

    if (this.hadError_()) {
      return null;
    }
    return this.results_.get(file);
  }

  /**
   * Transform the analyzed project to standard JS.
   *
   * @return {void}
   * @private
   */
  transform_() {
    if (this.hadError_()) {
      return;
    }
    this.results_ = ProgramTransformer.transform(this.reporter_,
                                                 this.project_);
  }

  /**
   * Transform the analyzed project to standard JS.
   *
   * @param {SourceFile} sourceFile
   * @return {void}
   * @private
   */
  transformFile_(sourceFile) {
    if (this.hadError_()) {
      return;
    }
    this.results_ = ProgramTransformer.transformFile(this.reporter_,
                                                     this.project_,
                                                     sourceFile);
  }

  /**
   * Build all symbols and perform all semantic checks.
   *
   * @return {void}
   * @private
   */
  analyze_() {
    if (this.hadError_()) {
      return;
    }
    var analyzer = new ModuleAnalyzer(this.reporter_, this.project_);
    analyzer.analyze();
  }

  /**
   * Build all symbols and perform all semantic checks.
   *
   * @param {SourceFile} sourceFile
   * @return {void}
   * @private
   */
  analyzeFile_(sourceFile) {
    if (this.hadError_()) {
      return;
    }
    var analyzer = new ModuleAnalyzer(this.reporter_, this.project_);
    analyzer.analyzeFile(sourceFile);
  }

  /**
   * Parse all source files in the project.
   *
   * @return {void}
   * @private
   */
  parse_() {
    this.project_.getSourceFiles().forEach(this.parseFile_, this);
  }

  /**
   * Parse all source files in the project.
   */
  /**
   * @param {SourceFile} file
   * @return {void}
   * @private
   */
  parseFile_(file) {
    if (this.hadError_()) {
      return;
    }

    this.project_.setParseTree(
        file, new Parser(this.reporter_, file).parseScript());
  }

  /**
   * @return {boolean}
   * @private
   */
  hadError_() {
    return this.reporter_.hadError();
  }

  /**
   * @param {ErrorReporter} reporter Where to report compile errors.
   * @param {Project} project The project to compile.
   * @return {ObjectMap} A map from input file name to
   *     translated results. Returns null if there was a compile error.
   */
  static compile(reporter, project) {
    return new Compiler(reporter, project).compile_();
  }

  /**
   * @param {ErrorReporter} reporter Where to report compile errors.
   * @param {SourceFile} sourceFile file to compile.
   * @param {string} url The URL of the file to compile or the URL of the
   *     document in case of an eval or inline script.
   * @return {ParseTree} A map from input file name to
   *     translated results. Returns null if there was a compile error.
   */
  static compileFile(reporter, sourceFile, url = sourceFile.name, project = new Project(url)) {
    project.addFile(sourceFile);
    return new Compiler(reporter, project).compileFile_(sourceFile);
  }
}
