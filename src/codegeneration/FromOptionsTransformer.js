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
 * MultiTransformer built from global options settings
 */
export class FromOptionsTransformer extends MultiTransformer {
  /**
   * @param {ErrorReporter} reporter
   * @param {UniqueIdGenerator} idGenerator
   * @param {RuntimeInliner} runtimeInliner
   */
  constructor(reporter, idGenerator, runtimeInliner) {
    super(reporter, options.validate);

    var append = (transformer, ...args) => this.append (
        (tree) => transformer.transformTree(...args, tree)
      );
    // TODO: many of these simple, local transforms could happen in the same
    // tree pass

    if (transformOptions.types)
      append(TypeTransformer);
    if (transformOptions.numericLiterals)
      append(NumericLiteralTransformer);

    if (transformOptions.templateLiterals)
      append(TemplateLiteralTransformer, idGenerator);

    if (transformOptions.modules)
      append(ModuleTransformer, idGenerator);

    if (transformOptions.arrowFunctions)
      append(ArrowFunctionTransformer, idGenerator);

    // ClassTransformer needs to come before ObjectLiteralTransformer.
    if (transformOptions.classes)
      append(ClassTransformer, idGenerator, runtimeInliner, reporter);

    if (transformOptions.propertyNameShorthand)
      append(PropertyNameShorthandTransformer);
    if (transformOptions.propertyMethods ||
              transformOptions.computedPropertyNames)
      append(ObjectLiteralTransformer, idGenerator);

    // Generator/ArrayComprehensionTransformer must come before for-of and
    // destructuring.
    if (transformOptions.generatorComprehension)
      append(GeneratorComprehensionTransformer, idGenerator);
    if (transformOptions.arrayComprehension)
      append(ArrayComprehensionTransformer, idGenerator);

    // for of must come before destructuring and generator, or anything
    // that wants to use VariableBinder
    if (transformOptions.forOf)
      append(ForOfTransformer, idGenerator, runtimeInliner);

    // rest parameters must come before generator
    if (transformOptions.restParameters)
      append(RestParameterTransformer, idGenerator);

    // default parameters should come after rest parameter to get the
    // expected order in the transformed code.
    if (transformOptions.defaultParameters)
      append(DefaultParametersTransformer, idGenerator);

    // destructuring must come after for of and before block binding and
    // generator
    if (transformOptions.destructuring)
      append(DestructuringTransformer, idGenerator);

    // generator must come after for of and rest parameters
    if (transformOptions.generators || transformOptions.deferredFunctions)
      append(GeneratorTransformPass, idGenerator, runtimeInliner, reporter);

    if (transformOptions.spread)
      append(SpreadTransformer, idGenerator, runtimeInliner);

    this.append((tree) => runtimeInliner.transformAny(tree));

    if (transformOptions.blockBinding)
      append(BlockBindingTransformer);

    // Cascade must come before CollectionTransformer.
    if (transformOptions.cascadeExpression)
      append(CascadeExpressionTransformer, idGenerator, reporter);

    if (transformOptions.trapMemberLookup ||  transformOptions.privateNames)
      append(CollectionTransformer, idGenerator);

    // Issue errors for any unbound variables
    if (options.freeVariableChecker)
      this.append((tree) => FreeVariableChecker.checkScript(reporter, tree));
  }

}


