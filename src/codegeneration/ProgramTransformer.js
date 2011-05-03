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

traceur.define('codegeneration', function() {
  'use strict';

  var ObjectMap = traceur.util.ObjectMap;

  var ParseTreeValidator = traceur.syntax.ParseTreeValidator;
  var ProgramTree = traceur.syntax.trees.ProgramTree;
  var UniqueIdentifierGenerator = traceur.codegeneration.UniqueIdentifierGenerator;
  var ForEachTransformer = traceur.codegeneration.ForEachTransformer;
  var RestParameterTransformer = traceur.codegeneration.RestParameterTransformer;
  var DefaultParametersTransformer = traceur.codegeneration.DefaultParametersTransformer;
  var GeneratorTransformPass = traceur.codegeneration.GeneratorTransformPass;
  var DestructuringTransformer = traceur.codegeneration.DestructuringTransformer;
  var SpreadTransformer = traceur.codegeneration.SpreadTransformer;
  var BlockBindingTransformer = traceur.codegeneration.BlockBindingTransformer;
  var TraitTransformer = traceur.codegeneration.TraitTransformer;
  var ClassTransformer = traceur.codegeneration.ClassTransformer;
  var ModuleTransformer = traceur.codegeneration.ModuleTransformer;
  var GeneratorTransformPass = traceur.codegeneration.GeneratorTransformPass;
  var FreeVariableChecker = traceur.semantics.FreeVariableChecker;

  var CLASS_DECLARATION = traceur.syntax.trees.ParseTreeType.CLASS_DECLARATION;
  var TRAIT_DECLARATION = traceur.syntax.trees.ParseTreeType.TRAIT_DECLARATION;

  /**
   * Transforms a Traceur file's ParseTree to a JS ParseTree.
   *
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @constructor
   */
  function ProgramTransformer(reporter, project) {
    this.project_ = project;
    this.reporter_ = reporter;
    this.results_ = new ObjectMap();
    this.identifierGenerator_ = new UniqueIdentifierGenerator();
    Object.freeze(this);
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @return {ObjectMap}
   */
  ProgramTransformer.transform = function(reporter, project) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transform_();
    return transformer.results_;
  };

  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {SourceFile} sourceFile
   * @return {ObjectMap}
   */
  ProgramTransformer.transformFile = function(reporter, project, sourceFile) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transformFile_(sourceFile);
    return transformer.results_;
  }

  ProgramTransformer.prototype = {
    /**
     * @return {void}
     * @private
     */
    transform_: function() {
      this.project_.getSourceFiles().forEach(function(file) {
        this.transformFile_(file);
      }, this);
    },

    /**
     * @param {SourceFile} file
     * @return {void}
     * @private
     */
    transformFile_: function(file) {
      var result = this.transform(this.project_.getParseTree(file));
      this.results_.put(file, result);
    },

    /**
     * This is the root of the code generation pass.
     * Each pass translates one contruct from Traceur to standard JS constructs.
     * The order of the passes matters.
     *
     * @param {Program} tree
     * @return {ParseTree}
     */
    transform: function(tree) {
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        tree = this.transformModules_(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        tree = this.transformAggregates_(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        // foreach must come before destructuring and generator, or anything
        // that wants to use VariableBinder
        tree = ForEachTransformer.transformTree(
            this.identifierGenerator_, tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        // rest parameters must come before generator
        tree = RestParameterTransformer.transformTree(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        // default parameters should come after rest parameter to get the
        // expected order in the transformed code.
        tree = DefaultParametersTransformer.transformTree(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        // generator must come after foreach and rest parameters
        tree = GeneratorTransformPass.transformTree(
            this.identifierGenerator_, this.reporter_, tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        // destructuring must come after foreach and before block binding
        tree = DestructuringTransformer.transformTree(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        tree = SpreadTransformer.transformTree(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);
        tree = BlockBindingTransformer.transformTree(tree);
      }
      if (!this.reporter_.hadError()) {
        ParseTreeValidator.validate(tree);

        // Issue errors for any unbound variables
        FreeVariableChecker.checkProgram(this.reporter_, tree);
      }
      return tree;
    },

    /**
     * @param {Program} tree
     * @return {Program}
     * @private
     */
    transformModules_: function(tree) {
      return ModuleTransformer.transform(this.project_, tree);
    },

    /**
     * @param {Program} tree
     * @return {Program}
     * @private
     */
    transformAggregates_: function(tree) {
      return ClassTransformer.transform(this.reporter_, tree);
    }
  };

  return {
    ProgramTransformer: ProgramTransformer
  };
});
