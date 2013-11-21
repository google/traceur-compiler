// Copyright 2013 Traceur Authors.
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
    './ArrayComprehensionTransformer';
import {ArrowFunctionTransformer} from './ArrowFunctionTransformer';
import {BlockBindingTransformer} from './BlockBindingTransformer';
import {CascadeExpressionTransformer} from './CascadeExpressionTransformer';
import {ClassTransformer} from './ClassTransformer';
import {CollectionTransformer} from './CollectionTransformer';
import {DefaultParametersTransformer} from './DefaultParametersTransformer';
import {DestructuringTransformer} from './DestructuringTransformer';
import {ForOfTransformer} from './ForOfTransformer';
import {FreeVariableChecker} from '../semantics/FreeVariableChecker';
import {GeneratorComprehensionTransformer} from
    'GeneratorComprehensionTransformer';
import {GeneratorTransformPass} from './GeneratorTransformPass';
import {ModuleTransformer} from './ModuleTransformer';
import {MultiTransformer} from './MultiTransformer';
import {NumericLiteralTransformer} from './NumericLiteralTransformer';
import {ObjectLiteralTransformer} from './ObjectLiteralTransformer';
import {ObjectMap} from '../util/ObjectMap';
import {ParseTreeValidator} from '../syntax/ParseTreeValidator';
import {PropertyNameShorthandTransformer} from
    'PropertyNameShorthandTransformer';
import {TemplateLiteralTransformer} from './TemplateLiteralTransformer';
import {RestParameterTransformer} from './RestParameterTransformer';
import {SpreadTransformer} from './SpreadTransformer';
import {TypeTransformer} from './TypeTransformer';
import {options, transformOptions} from '../options';

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
    this.url = null;
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
  transformFile_(file, url = file.name) {
    this.url = url;
    var result = this.transform(this.project_.getParseTree(file));
    this.results_.set(file, result);
  }

  /**
   * @param {ModuleSymbol} module
   * @param {SourceFile} file
   * @return {void}
   * @private
   */
  transformFileAsModule_(file, module) {
    this.url = module.url;

    var result = this.transformerFromOptions_(module).transform(
          this.project_.getParseTree(file));
    this.results_.set(file, result);
  }

  /**
   * This is the root of the code generation pass.
   * Each pass translates one contruct from Traceur to standard JS constructs.
   * The order of the passes matters.
   *
   * @param {Script} tree
   * @return {ParseTree}
   */
  transform(tree) {
    return this.transformerFromOptions_().transform(tree)
  }

  transformerFromOptions_(module = undefined) {
    var identifierGenerator = this.project_.identifierGenerator;
    var runtimeInliner = this.project_.runtimeInliner;
    var reporter = this.reporter_;

    var multi = new MultiTransformer(reporter, options.validate);

    function append(transformer, ...args) {
      multi.append((tree) => transformer.transformTree(...args, tree));
    }
    // TODO: many of these simple, local transforms could happen in the same
    // tree pass

    if (transformOptions.types)
      append(TypeTransformer);
    if (transformOptions.numericLiterals)
      append(NumericLiteralTransformer);

    if (transformOptions.templateLiterals)
      append(TemplateLiteralTransformer, identifierGenerator);

    if (transformOptions.modules)
      multi.append((tree) => this.transformModules_(tree, module));

    if (transformOptions.arrowFunctions)
      append(ArrowFunctionTransformer, identifierGenerator);

    // ClassTransformer needs to come before ObjectLiteralTransformer.
    if (transformOptions.classes)
      append(ClassTransformer,
              identifierGenerator,
              runtimeInliner,
              reporter);

    if (transformOptions.propertyNameShorthand)
      append(PropertyNameShorthandTransformer);
    if (transformOptions.propertyMethods ||
              transformOptions.computedPropertyNames)
      append(ObjectLiteralTransformer,
              identifierGenerator);

    // Generator/ArrayComprehensionTransformer must come before for-of and
    // destructuring.
    if (transformOptions.generatorComprehension)
      append(GeneratorComprehensionTransformer,
              identifierGenerator);
    if (transformOptions.arrayComprehension)
      append(ArrayComprehensionTransformer,
              identifierGenerator);

    // for of must come before destructuring and generator, or anything
    // that wants to use VariableBinder
    if (transformOptions.forOf)
      append(ForOfTransformer,
              identifierGenerator,
              runtimeInliner);

    // rest parameters must come before generator
    if (transformOptions.restParameters)
      append(RestParameterTransformer,
              identifierGenerator);

    // default parameters should come after rest parameter to get the
    // expected order in the transformed code.
    if (transformOptions.defaultParameters)
      append(DefaultParametersTransformer,
              identifierGenerator);

    // destructuring must come after for of and before block binding and
    // generator
    if (transformOptions.destructuring)
      append(DestructuringTransformer,
              identifierGenerator);

    // generator must come after for of and rest parameters
    if (transformOptions.generators || transformOptions.deferredFunctions)
      append(GeneratorTransformPass,
              identifierGenerator,
              runtimeInliner,
              reporter);

    if (transformOptions.spread)
      append(SpreadTransformer,
              identifierGenerator,
              runtimeInliner);

    multi.append((tree) => runtimeInliner.transformAny(tree));

    if (transformOptions.blockBinding)
      append(BlockBindingTransformer);

    // Cascade must come before CollectionTransformer.
    if (transformOptions.cascadeExpression)
      append(CascadeExpressionTransformer,
              identifierGenerator,
              reporter);

    if (transformOptions.trapMemberLookup ||
              transformOptions.privateNames)
      append(CollectionTransformer,
              identifierGenerator);

    // Issue errors for any unbound variables
    if (options.freeVariableChecker)
      multi.append((tree) => FreeVariableChecker.checkScript(reporter, tree));

    return multi;
  }

  /**
   * Transforms a program tree. If an optional module is passed in the
   * program is treated as a module body.
   * @param {Script} tree
   * @param {ModuleSymbol=} module
   * @return {Script}
   * @private
   */
  transformModules_(tree, module = undefined) {
    var idGenerator = this.project_.identifierGenerator;
    if (module)
      return ModuleTransformer.transformAsModule(idGenerator, tree, module);
    return ModuleTransformer.transform(idGenerator, tree, this.url);
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
 * @param {string} url
 * @return {ObjectMap}
 */
ProgramTransformer.transformFile = function(reporter, project, sourceFile, url = undefined) {
  // TODO(arv): Why doesn't the file know its URL?
  var transformer = new ProgramTransformer(reporter, project);
  transformer.transformFile_(sourceFile, url);
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
  transformer.transformFileAsModule_(sourceFile, module);
  return transformer.results_;
};
