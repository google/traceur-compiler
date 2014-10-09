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

import {AmdTransformer} from './AmdTransformer';
import {AnnotationsTransformer} from './AnnotationsTransformer';
import {ArrayComprehensionTransformer} from './ArrayComprehensionTransformer';
import {ArrowFunctionTransformer} from './ArrowFunctionTransformer';
import {BlockBindingTransformer} from './BlockBindingTransformer';
import {ClassTransformer} from './ClassTransformer';
import {CommonJsModuleTransformer} from './CommonJsModuleTransformer';
import {ExponentiationTransformer} from './ExponentiationTransformer';
import {validate as validateConst} from '../semantics/ConstChecker';
import {DefaultParametersTransformer} from './DefaultParametersTransformer';
import {DestructuringTransformer} from './DestructuringTransformer';
import {ForOfTransformer} from './ForOfTransformer';
import {validate as validateFreeVariables} from
    '../semantics/FreeVariableChecker';
import {GeneratorComprehensionTransformer} from
    './GeneratorComprehensionTransformer';
import {GeneratorTransformPass} from './GeneratorTransformPass';
import {InlineModuleTransformer} from './InlineModuleTransformer';
import {ModuleTransformer} from './ModuleTransformer';
import {MultiTransformer} from './MultiTransformer';
import {NumericLiteralTransformer} from './NumericLiteralTransformer';
import {ObjectLiteralTransformer} from './ObjectLiteralTransformer';
import {PropertyNameShorthandTransformer} from
    './PropertyNameShorthandTransformer';
import {InstantiateModuleTransformer} from './InstantiateModuleTransformer';
import {RegularExpressionTransformer} from './RegularExpressionTransformer';
import {RestParameterTransformer} from './RestParameterTransformer';
import {SpreadTransformer} from './SpreadTransformer';
import {SymbolTransformer} from './SymbolTransformer';
import {TemplateLiteralTransformer} from './TemplateLiteralTransformer';
import {TypeTransformer} from './TypeTransformer';
import {TypeAssertionTransformer} from './TypeAssertionTransformer';
import {TypeToExpressionTransformer} from './TypeToExpressionTransformer';
import {UnicodeEscapeSequenceTransformer} from './UnicodeEscapeSequenceTransformer';
import {UniqueIdentifierGenerator} from './UniqueIdentifierGenerator';
import {options, transformOptions} from '../Options';

/**
 * MultiTransformer built from global options settings
 */
export class FromOptionsTransformer extends MultiTransformer {
  /**
   * @param {ErrorReporter} reporter
   * @param {UniqueIdentifierGenerator=} idGenerator
   */
  constructor(reporter, idGenerator = new UniqueIdentifierGenerator()) {
    super(reporter, options.validate);

    var append = (transformer) => {
      this.append((tree) => {
        return new transformer(idGenerator, reporter).transformAny(tree);
      });
    };

    if (transformOptions.blockBinding) {
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
    if (transformOptions.exponentiation)
      append(ExponentiationTransformer);

    if (transformOptions.numericLiterals)
      append(NumericLiteralTransformer);

    if (transformOptions.unicodeExpressions)
      append(RegularExpressionTransformer);

    if (transformOptions.templateLiterals)
      append(TemplateLiteralTransformer);

    if (options.types)
      append(TypeToExpressionTransformer);

    if (transformOptions.unicodeEscapeSequences)
      append(UnicodeEscapeSequenceTransformer);

    if (transformOptions.annotations)
      append(AnnotationsTransformer);

    if (options.typeAssertions)
      append(TypeAssertionTransformer);

    // PropertyNameShorthandTransformer needs to come before
    // module transformers. See #1120 or
    // test/node-instantiate-test.js test "Shorthand syntax with import"
    // for detailed info.
    if (transformOptions.propertyNameShorthand)
      append(PropertyNameShorthandTransformer);

    if (transformOptions.modules) {
      switch (transformOptions.modules) {
        case 'commonjs':
          append(CommonJsModuleTransformer);
          break;
        case 'amd':
          append(AmdTransformer);
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

    if (transformOptions.arrowFunctions)
      append(ArrowFunctionTransformer);

    // ClassTransformer needs to come before ObjectLiteralTransformer.
    if (transformOptions.classes)
      append(ClassTransformer);

    if (transformOptions.propertyMethods ||
              transformOptions.computedPropertyNames) {
      append(ObjectLiteralTransformer);
    }

    // Generator/ArrayComprehensionTransformer must come before for-of and
    // destructuring.
    if (transformOptions.generatorComprehension)
      append(GeneratorComprehensionTransformer);
    if (transformOptions.arrayComprehension)
      append(ArrayComprehensionTransformer);

    // for of must come before destructuring and generator, or anything
    // that wants to use VariableBinder
    if (transformOptions.forOf)
      append(ForOfTransformer);

    // rest parameters must come before generator
    if (transformOptions.restParameters)
      append(RestParameterTransformer);

    // default parameters should come after rest parameter to get the
    // expected order in the transformed code.
    if (transformOptions.defaultParameters)
      append(DefaultParametersTransformer);

    // destructuring must come after for of and before block binding and
    // generator
    if (transformOptions.destructuring)
      append(DestructuringTransformer);

    if (transformOptions.types)
      append(TypeTransformer);

    if (transformOptions.spread)
      append(SpreadTransformer);

    if (transformOptions.blockBinding) {
      this.append((tree) => {
        // this transformer need to be aware of the tree it will be working on
        var transformer = new BlockBindingTransformer(idGenerator, reporter, tree);
        return transformer.transformAny(tree);
      });
    }

    // generator must come after for of and rest parameters
    if (transformOptions.generators || transformOptions.asyncFunctions)
      append(GeneratorTransformPass);

    if (transformOptions.symbols)
      append(SymbolTransformer);
  }
}
