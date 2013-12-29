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

import assertType from './assertType';
import {FormalParameter} from '../syntax/trees/ParseTrees';
import {createExpressionStatement} from './ParseTreeFactory';
import {ParameterTransformer} from './ParameterTransformer';

/**
 * Removes type annotation on formal parameter and prepends a type assertion into
 * the body of the function.
 *
 */
export class ParameterTypeTransformer extends ParameterTransformer {
  /**
   * @param {FormalParameter} tree
   * @return {ParseTree}
   */
  transformFormalParameter(tree) {
    if (tree.typeAnnotation !== null) {
      this.parameterStatements.push(createExpressionStatement(assertType(tree.parameter, tree.typeAnnotation)));
      tree = new FormalParameter(tree.location, tree.parameter, null, tree.annotations);
    }
    return super.transformFormalParameter(tree);
  }
}
