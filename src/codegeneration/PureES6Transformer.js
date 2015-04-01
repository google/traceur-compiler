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

import {AnnotationsTransformer} from './AnnotationsTransformer.js';
import {MemberVariableTransformer} from './MemberVariableTransformer.js';
import {MultiTransformer} from './MultiTransformer.js';
import {TypeAssertionTransformer} from './TypeAssertionTransformer.js';
import {TypeTransformer} from './TypeTransformer.js';
import {ES6ClassTransformer} from './ES6ClassTransformer.js';
import {UniqueIdentifierGenerator} from './UniqueIdentifierGenerator.js';
import {validate as validateFreeVariables} from
    '../semantics/FreeVariableChecker.js';

/**
 * MultiTransformer that only transforms non ES6 features, such as:
 * - annotations
 * - types
 *
 * This is used to transform ES6+ code into pure ES6.
 */
export class PureES6Transformer extends MultiTransformer {
  /**
   * @param {ErrorReporter} reporter
   * @param {Options} options
   * @param {Object} metadata Implementation defined loader data.
   */
  constructor(reporter, options, metadata) {
    super(reporter, options.validate);
    let idGenerator = new UniqueIdentifierGenerator();

    let append = (transformer) => {
      this.append((tree) => {
        return new transformer(idGenerator, reporter, options, metadata).
            transformAny(tree);
      });
    };

    // Issue errors for any unbound variables
    if (options.freeVariableChecker) {
      this.append((tree) => {
        validateFreeVariables(tree, reporter);
        return tree;
      });
    }

    if (options.typeAssertions) {
      // Transforming member variables to getters/setters only make
      // sense when the type assertions are enabled.
      if (options.memberVariables) append(MemberVariableTransformer);
      append(TypeAssertionTransformer);
    }
    if (options.memberVariables) {
      append(ES6ClassTransformer);
    }
    append(AnnotationsTransformer);
    append(TypeTransformer);
  }
}
