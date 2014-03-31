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

import {AnnotationsTransformer} from './AnnotationsTransformer';
import {FreeVariableChecker} from '../semantics/FreeVariableChecker';
import {MultiTransformer} from './MultiTransformer';
import {TypeTransformer} from './TypeTransformer';
import {UniqueIdentifierGenerator} from './UniqueIdentifierGenerator';
import {options, transformOptions} from '../options';

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
   * @param {UniqueIdGenerator=} idGenerator
   */
  constructor(reporter, idGenerator = new UniqueIdentifierGenerator()) {
    super(reporter, options.validate);

    var append = (transformer) => {
      this.append((tree) => {
        return new transformer(idGenerator, reporter).transformAny(tree);
      });
    };

    append(AnnotationsTransformer);
    append(TypeTransformer);

    // Issue errors for any unbound variables
    if (options.freeVariableChecker) {
      this.append((tree) => {
        FreeVariableChecker.checkScript(reporter, tree);
        return tree;
      });
    }
  }
}
