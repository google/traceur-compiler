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

import {ArrayComprehensionTransformer} from
    './ArrayComprehensionTransformer.js';
import {ArrowFunctionTransformer} from './ArrowFunctionTransformer.js';
import {AtNameMemberTransformer} from './AtNameMemberTransformer.js';
import {BlockBindingTransformer} from './BlockBindingTransformer.js';
import {CascadeExpressionTransformer} from './CascadeExpressionTransformer.js';
import {ClassTransformer} from './ClassTransformer.js';
import {CollectionTransformer} from './CollectionTransformer.js';
import {DefaultParametersTransformer} from './DefaultParametersTransformer.js';
import {DestructuringTransformer} from './DestructuringTransformer.js';
import {ForOfTransformer} from './ForOfTransformer.js';
import {FreeVariableChecker} from '../semantics/FreeVariableChecker.js';
import {GeneratorComprehensionTransformer} from
    'GeneratorComprehensionTransformer.js';
import {GeneratorTransformPass} from './GeneratorTransformPass.js';
import {ModuleTransformer} from './ModuleTransformer.js';
import {ObjectLiteralTransformer} from './ObjectLiteralTransformer.js';
import {ObjectMap} from '../util/ObjectMap.js';
import {ParseTreeValidator} from '../syntax/ParseTreeValidator.js';
import {PrivateNameSyntaxTransformer} from './PrivateNameSyntaxTransformer.js';
import {PropertyNameShorthandTransformer} from
    'PropertyNameShorthandTransformer.js';
import {TemplateLiteralTransformer} from './TemplateLiteralTransformer.js';
import {RestParameterTransformer} from './RestParameterTransformer.js';
import {SpreadTransformer} from './SpreadTransformer.js';
import {TypeTransformer} from './TypeTransformer.js';
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

  transformTree_(tree, module = undefined) {
    var identifierGenerator = this.project_.identifierGenerator;
    var runtimeInliner = this.project_.runtimeInliner;
    var reporter = this.reporter_;

    function transform(enabled, transformer, ...args) {
      return chain(enabled, () => transformer.transformTree(...args, tree));
    }

    function chain(enabled, func) {
      if (!enabled)
        return;

      if (!reporter.hadError()) {
        if (options.validate) {
          ParseTreeValidator.validate(tree);
        }

        tree = func() || tree;
      }
    }


    // TODO: many of these simple, local transforms could happen in the same
    // tree pass

    transform(transformOptions.types, TypeTransformer);

    transform(transformOptions.templateLiterals,
              TemplateLiteralTransformer,
              identifierGenerator);

    chain(transformOptions.modules,
          () => this.transformModules_(tree, module));

    transform(transformOptions.arrowFunctions,
              ArrowFunctionTransformer, reporter);

    // ClassTransformer needs to come before ObjectLiteralTransformer.
    transform(transformOptions.classes,
              ClassTransformer,
              identifierGenerator,
              runtimeInliner,
              reporter);

    transform(transformOptions.propertyNameShorthand,
              PropertyNameShorthandTransformer);
    transform(transformOptions.propertyMethods ||
              transformOptions.privateNameSyntax &&
              transformOptions.privateNames,
              ObjectLiteralTransformer,
              identifierGenerator);

    // Generator/ArrayComprehensionTransformer must come before for-of and
    // destructuring.
    transform(transformOptions.generatorComprehension,
              GeneratorComprehensionTransformer,
              identifierGenerator);
    transform(transformOptions.arrayComprehension,
              ArrayComprehensionTransformer,
              identifierGenerator);

    // for of must come before destructuring and generator, or anything
    // that wants to use VariableBinder
    transform(transformOptions.forOf,
              ForOfTransformer,
              identifierGenerator);

    // rest parameters must come before generator
    transform(transformOptions.restParameters,
              RestParameterTransformer,
              identifierGenerator);

    // default parameters should come after rest parameter to get the
    // expected order in the transformed code.
    transform(transformOptions.defaultParameters,
              DefaultParametersTransformer,
              identifierGenerator);

    // destructuring must come after for of and before block binding and
    // generator
    transform(transformOptions.destructuring,
              DestructuringTransformer,
              identifierGenerator);

    // generator must come after for of and rest parameters
    transform(transformOptions.generators || transformOptions.deferredFunctions,
              GeneratorTransformPass,
              identifierGenerator,
              runtimeInliner,
              reporter);

    transform(transformOptions.privateNames &&
              transformOptions.privateNameSyntax,
              AtNameMemberTransformer,
              identifierGenerator);

    transform(transformOptions.privateNames &&
              transformOptions.privateNameSyntax,
              PrivateNameSyntaxTransformer,
              identifierGenerator);

    transform(transformOptions.spread,
              SpreadTransformer,
              identifierGenerator,
              runtimeInliner);

    chain(true, () => runtimeInliner.transformAny(tree));

    transform(transformOptions.blockBinding,
              BlockBindingTransformer);

    // Cascade must come before CollectionTransformer.
    transform(transformOptions.cascadeExpression,
              CascadeExpressionTransformer,
              identifierGenerator,
              reporter);

    transform(transformOptions.trapMemberLookup ||
              transformOptions.privateNames,
              CollectionTransformer,
              identifierGenerator);

    // Issue errors for any unbound variables
    chain(options.freeVariableChecker,
          () => FreeVariableChecker.checkProgram(reporter, tree));

    return tree;
  }

  /**
   * Transforms a program tree. If an optional module is passed in the
   * program is treated as a module body.
   * @param {Program} tree
   * @param {ModuleSymbol=} module
   * @return {Program}
   * @private
   */
  transformModules_(tree, module = undefined) {
    if (module)
      return ModuleTransformer.transformAsModule(this.project_, module, tree);
    return ModuleTransformer.transform(this.project_, tree);
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
