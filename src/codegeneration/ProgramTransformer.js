// Copyright 2012 Google Inc.
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

import ArrayComprehensionTransformer from 'ArrayComprehensionTransformer.js';
import ArrowFunctionTransformer from 'ArrowFunctionTransformer.js';
import AtNameMemberTransformer from 'AtNameMemberTransformer.js';
import BlockBindingTransformer from 'BlockBindingTransformer.js';
import CascadeExpressionTransformer from 'CascadeExpressionTransformer.js';
import ClassTransformer from 'ClassTransformer.js';
import CollectionTransformer from 'CollectionTransformer.js';
import DefaultParametersTransformer from 'DefaultParametersTransformer.js';
import DestructuringTransformer from 'DestructuringTransformer.js';
import ForOfTransformer from 'ForOfTransformer.js';
import FreeVariableChecker from '../semantics/FreeVariableChecker.js';
import GeneratorComprehensionTransformer from
    'GeneratorComprehensionTransformer.js';
import GeneratorTransformPass from 'GeneratorTransformPass.js';
import IsExpressionTransformer from 'IsExpressionTransformer.js';
import ModuleTransformer from 'ModuleTransformer.js';
import ObjectLiteralTransformer from 'ObjectLiteralTransformer.js';
import ObjectMap from '../util/ObjectMap.js';
import ParseTreeValidator from '../syntax/ParseTreeValidator.js';
import PrivateNameSyntaxTransformer from 'PrivateNameSyntaxTransformer.js';
import PropertyNameShorthandTransformer from
    'PropertyNameShorthandTransformer.js';
import TemplateLiteralTransformer from 'TemplateLiteralTransformer.js';
import RestParameterTransformer from 'RestParameterTransformer.js';
import SpreadTransformer from 'SpreadTransformer.js';
import TypeTransformer from 'TypeTransformer.js';
import {options, transformOptions} from '../options.js';

/**
 * Transforms a Traceur file's ParseTree to a JS ParseTree.
 */
export class ProgramTransformer {
  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   */
  constructor(reporter, project) {
    this.project_ = project;
    this.reporter_ = reporter;
    this.results_ = new ObjectMap();
  }

  /**
   * @return {void}
   * @private
   */
  transform_() {
    this.project_.getSourceFiles().forEach((file) => {
      this.transformFile_(file);
    });
  }

  /**
   * @param {SourceFile} file
   * @return {void}
   * @private
   */
  transformFile_(file) {
    var result = this.transform(this.project_.getParseTree(file));
    this.results_.set(file, result);
  }

  /**
   * @param {ModuleSymbol} module
   * @param {SourceFile} file
   * @return {void}
   * @private
   */
  transformFileAsModule_(module, file) {
    var result = this.transformTree_(this.project_.getParseTree(file),
                                     module);
    this.results_.set(file, result);
  }

  /**
   * This is the root of the code generation pass.
   * Each pass translates one contruct from Traceur to standard JS constructs.
   * The order of the passes matters.
   *
   * @param {Program} tree
   * @return {ParseTree}
   */
  transform(tree) {
    return this.transformTree_(tree);
  }

  transformTree_(tree, opt_module) {
    var identifierGenerator = this.project_.identifierGenerator;
    var runtimeInliner = this.project_.runtimeInliner;
    var reporter = this.reporter_;

    function chain(enabled, transformer, ...args) {
      if (!enabled)
        return;

      if (!reporter.hadError()) {
        if (options.validate) {
          ParseTreeValidator.validate(tree);
        }

        tree = transformer(...args, tree) || tree;
      }
    }

    // TODO: many of these simple, local transforms could happen in the same
    // tree pass

    chain(transformOptions.types, TypeTransformer.transformTree);

    chain(transformOptions.templateLiterals,
          TemplateLiteralTransformer.transformTree,
          identifierGenerator);

    chain(transformOptions.modules, this.transformModules_.bind(this), tree,
          opt_module);

    chain(transformOptions.arrowFunctions,
          ArrowFunctionTransformer.transformTree, reporter);

    // ClassTransformer needs to come before ObjectLiteralTransformer.
    chain(transformOptions.classes, ClassTransformer.transform,
          identifierGenerator, runtimeInliner, reporter);

    chain(transformOptions.propertyNameShorthand,
          PropertyNameShorthandTransformer.transformTree);
    chain(transformOptions.propertyMethods ||
              transformOptions.privateNameSyntax &&
              transformOptions.privateNames,
          ObjectLiteralTransformer.transformTree, identifierGenerator);

    chain(transformOptions.isExpression, IsExpressionTransformer.transformTree);

    // Generator/ArrayComprehensionTransformer must come before for-of and
    // destructuring.
    chain(transformOptions.generatorComprehension,
          GeneratorComprehensionTransformer.transformTree,
          identifierGenerator);
    chain(transformOptions.arrayComprehension,
          ArrayComprehensionTransformer.transformTree,
          identifierGenerator);

    // for of must come before destructuring and generator, or anything
    // that wants to use VariableBinder
    chain(transformOptions.forOf, ForOfTransformer.transformTree,
          identifierGenerator);

    // rest parameters must come before generator
    chain(transformOptions.restParameters,
          RestParameterTransformer.transformTree, identifierGenerator);

    // default parameters should come after rest parameter to get the
    // expected order in the transformed code.
    chain(transformOptions.defaultParameters,
          DefaultParametersTransformer.transformTree);

    // destructuring must come after for of and before block binding and
    // generator
    chain(transformOptions.destructuring,
          DestructuringTransformer.transformTree, identifierGenerator);

    // generator must come after for of and rest parameters
    chain(transformOptions.generators || transformOptions.deferredFunctions,
          GeneratorTransformPass.transformTree,
          identifierGenerator,
          reporter);

    chain(transformOptions.privateNames && transformOptions.privateNameSyntax,
          AtNameMemberTransformer.transformTree,
          identifierGenerator);

    chain(transformOptions.privateNames && transformOptions.privateNameSyntax,
          PrivateNameSyntaxTransformer.transformTree,
          identifierGenerator);

    chain(transformOptions.spread, SpreadTransformer.transformTree,
          identifierGenerator, runtimeInliner);

    chain(true, runtimeInliner.transformAny.bind(runtimeInliner));

    chain(transformOptions.blockBinding, BlockBindingTransformer.transformTree);

    // Cascade must come before CollectionTransformer.
    chain(transformOptions.cascadeExpression,
          CascadeExpressionTransformer.transformTree,
          identifierGenerator,
          reporter);

    chain(transformOptions.trapMemberLookup || transformOptions.privateNames,
          CollectionTransformer.transformTree,
          identifierGenerator);

    // Issue errors for any unbound variables
    chain(options.freeVariableChecker,
          FreeVariableChecker.checkProgram, reporter);

    return tree;
  }

  /**
   * Transforms a program tree. If an optional module is passed in the
   * program is treated as a module body.
   * @param {Program} tree
   * @param {ModuleSymbol} module
   * @return {Program}
   * @private
   */
  transformModules_(tree, opt_module) {
    if (opt_module) {
      return ModuleTransformer.transformAsModule(this.project_, opt_module,
                                                 tree);
    } else {
      return ModuleTransformer.transform(this.project_, tree);
    }
  }
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
};

/**
 * @param {ErrorReporter} reporter
 * @param {Project} project
 * @param {ModuleSymbol}
 * @param {SourceFile} sourceFile
 * @return {ObjectMap}
 */
ProgramTransformer.transformFileAsModule = function(reporter, project,
                                                    module, sourceFile) {
  var transformer = new ProgramTransformer(reporter, project);
  transformer.transformFileAsModule_(module, sourceFile);
  return transformer.results_;
};
