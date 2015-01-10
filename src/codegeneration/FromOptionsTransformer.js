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

import {AmdTransformer} from './AmdTransformer.js';
import {AnnotationsTransformer} from './AnnotationsTransformer.js';
import {ArrayComprehensionTransformer} from './ArrayComprehensionTransformer.js';
import {ArrowFunctionTransformer} from './ArrowFunctionTransformer.js';
import {BlockBindingTransformer} from './BlockBindingTransformer.js';
import {ClassTransformer} from './ClassTransformer.js';
import {CommonJsModuleTransformer} from './CommonJsModuleTransformer.js';
import {ClosureModuleTransformer} from './ClosureModuleTransformer.js';
import {ExponentiationTransformer} from './ExponentiationTransformer.js';
import {validate as validateConst} from '../semantics/ConstChecker.js';
import {DefaultParametersTransformer} from './DefaultParametersTransformer.js';
import {DestructuringTransformer} from './DestructuringTransformer.js';
import {ForOfTransformer} from './ForOfTransformer.js';
import {validate as validateFreeVariables} from
    '../semantics/FreeVariableChecker.js';
import {GeneratorComprehensionTransformer} from
    './GeneratorComprehensionTransformer.js';
import {GeneratorTransformPass} from './GeneratorTransformPass.js';
import {InlineModuleTransformer} from './InlineModuleTransformer.js';
import {MemberVariableTransformer} from './MemberVariableTransformer.js';
import {ModuleTransformer} from './ModuleTransformer.js';
import {MultiTransformer} from './MultiTransformer.js';
import {NumericLiteralTransformer} from './NumericLiteralTransformer.js';
import {ObjectLiteralTransformer} from './ObjectLiteralTransformer.js';
import {PropertyNameShorthandTransformer} from
    './PropertyNameShorthandTransformer.js';
import {InstantiateModuleTransformer} from './InstantiateModuleTransformer.js';
import {RegularExpressionTransformer} from './RegularExpressionTransformer.js';
import {RestParameterTransformer} from './RestParameterTransformer.js';
import {SpreadTransformer} from './SpreadTransformer.js';
import {SymbolTransformer} from './SymbolTransformer.js';
import {TemplateLiteralTransformer} from './TemplateLiteralTransformer.js';
import {TypeTransformer} from './TypeTransformer.js';
import {TypeAssertionTransformer} from './TypeAssertionTransformer.js';
import {TypeToExpressionTransformer} from './TypeToExpressionTransformer.js';
import {UnicodeEscapeSequenceTransformer} from './UnicodeEscapeSequenceTransformer.js';
import {UniqueIdentifierGenerator} from './UniqueIdentifierGenerator.js';
import {options, transformOptions} from '../Options.js';

/**
 * MultiTransformer built from global options settings
 */
export class FromOptionsTransformer extends MultiTransformer {
  /**
   * @param {ErrorReporter} reporter
   * @param {Options} options
   */
  constructor(reporter, options) {
    super(reporter, options.validate);

    var append = (transformer) => {
      this.append((tree) => {
        return new transformer(idGenerator, reporter).transformAny(tree);
      });
    };

    if (options.transformView('blockBinding')) {
      this.append((tree) => {
        validateConst(tree, reporter);
        return tree;
      });
    }

    // Issue errors for any unbound variables
    if (options.freeVariableChecker) {
      this.append((tree) => {
        validateFreeVariables(tree, reporter);
        return tree;
      });
    }

    // TODO: many of these simple, local transforms could happen in the same
    // tree pass
    if (options.transformView('exponentiation'))
      append(ExponentiationTransformer);

    if (options.transformView('numericLiterals'))
      append(NumericLiteralTransformer);

    if (options.transformView('unicodeExpressions'))
      append(RegularExpressionTransformer);

    if (options.transformView('templateLiterals'))
      append(TemplateLiteralTransformer);

    if (options.transformView('types'))
      append(TypeToExpressionTransformer);

    if (options.transformView('unicodeEscapeSequences'))
      append(UnicodeEscapeSequenceTransformer);

    if (options.transformView('annotations'))
      append(AnnotationsTransformer);

    if (options.typeAssertions) {
      // Transforming member variabless to getters/setters only make
      // sense when the type assertions are enabled.
      if (options.memberVariables) append(MemberVariableTransformer);
      append(TypeAssertionTransformer);
    }

    // PropertyNameShorthandTransformer needs to come before
    // module transformers. See #1120 or
    // test/node-instantiate-test.js test "Shorthand syntax with import"
    // for detailed info.
    if (options.transformView('propertyNameShorthand'))
      append(PropertyNameShorthandTransformer);

    if (options.transformView('modules')) {
      switch (options.transformView('modules')) {
        case 'commonjs':
          append(CommonJsModuleTransformer);
          break;
        case 'amd':
          append(AmdTransformer);
          break;
        case 'closure':
          append(ClosureModuleTransformer);
          break;
        case 'inline':
          append(InlineModuleTransformer);
          break;
        case 'instantiate':
          append(InstantiateModuleTransformer);
          break;
        case 'register':
          append(ModuleTransformer);
          break;
        default:
          // The options processing should prevent us from getting here.
          throw new Error('Invalid modules transform option');
      }
    }

    if (options.transformView('arrowFunctions'))
      append(ArrowFunctionTransformer);

    // ClassTransformer needs to come before ObjectLiteralTransformer.
    if (options.transformView('classes'))
      append(ClassTransformer);

    if (options.transformView('propertyMethods') ||
        options.transformView('computedPropertyNames')) {
      append(ObjectLiteralTransformer);
    }

    // Generator/ArrayComprehensionTransformer must come before for-of and
    // destructuring.
    if (options.transformView('generatorComprehension'))
      append(GeneratorComprehensionTransformer);
    if (options.transformView('arrayComprehension'))
      append(ArrayComprehensionTransformer);

    // for of must come before destructuring and generator, or anything
    // that wants to use VariableBinder
    if (options.transformView('forOf'))
      append(ForOfTransformer);

    // rest parameters must come before generator
    if (options.transformView('restParameters'))
      append(RestParameterTransformer);

    // default parameters should come after rest parameter to get the
    // expected order in the transformed code.
    if (options.transformView('defaultParameters'))
      append(DefaultParametersTransformer);

    // destructuring must come after for of and before block binding and
    // generator
    if (options.transformView('destructuring'))
      append(DestructuringTransformer);

    if (options.transformView('types'))
      append(TypeTransformer);

    if (options.transformView('spread'))
      append(SpreadTransformer);

    if (options.transformView('blockBinding')) {
      this.append((tree) => {
        // this transformer need to be aware of the tree it will be working on
        var transformer = new BlockBindingTransformer(idGenerator, reporter, tree);
        return transformer.transformAny(tree);
      });
    }

    // generator must come after for of and rest parameters
    if (options.transformView('generators') ||
        options.transformView('asyncFunctions'))
      append(GeneratorTransformPass);

    if (options.transformView('symbols'))
      append(SymbolTransformer);
  }
}
