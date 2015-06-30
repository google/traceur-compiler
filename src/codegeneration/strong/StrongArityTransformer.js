// Copyright 2015 Traceur Authors.
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

'use strong';

import {LanguageModeTransformerTrait} from '../LanguageModeTransformerTrait.js';
import {ParameterTransformer} from '../ParameterTransformer.js';
import {parseStatement} from '../PlaceholderParser.js';
import expectedArgumentCount from '../../staticsemantics/ExpectedArgumentCount.js';

/**
 * In strong mode it is a TypeError to call a function with too few parameters.
 *
 * This transformer injects a check for the number of arguments passed:
 *
 *   function f(x) {
 *     'use strong';
 *     ...
 *   }
 *
 *   Generates:
 *
 *   function f(x) {
 *     'use strong';
 *     if (arguments.length < 1) throw ...
 *     ...
 *   }
 */
export class StrongArityTransformer extends
    LanguageModeTransformerTrait(ParameterTransformer) {
  constructor(idGen, reporter, options) {
    super(idGen, reporter, options);
    this.currentArrowFormals_ = null;
  }
  transformFormalParameterList(tree) {
    if (this.isStrongMode() && tree !== this.currentArrowFormals_) {
      let arity = expectedArgumentCount(tree);
      if (arity > 0) {
        let ifStatement = parseStatement
            `if (arguments.length < ${arity}) throw new TypeError(
                'In strong mode it is illegal to call a function with too few arguments')`;
        this.parameterStatements.push(ifStatement);
      }
    }
    this.currentArrowFormals_ = null;
    return super.transformFormalParameterList(tree);
  }

  transformArrowFunction(tree) {
    // Arrow functions do not have arguments so we cannot check them.
    this.currentArrowFormals_ = tree.parameterList;
    return super.transformArrowFunction(tree);
  }
}
