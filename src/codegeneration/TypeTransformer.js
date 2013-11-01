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

import {VariableDeclaration} from '../syntax/trees/ParseTrees';
import {ParseTreeTransformer} from './ParseTreeTransformer';

/**
 * Desugars type annotations.
 */
export class TypeTransformer extends ParseTreeTransformer {

  /**
   * @param {VariableDeclaration} tree
   * @return {ParseTree}
   */
  transformVariableDeclaration(tree) {
    if (tree.typeAnnotation) {
      tree = new VariableDeclaration(tree.location, tree.lvalue, null,
          tree.initializer);
    }
    return super.transformVariableDeclaration(tree);
  }

  static transformTree(tree) {
    return new TypeTransformer().transformAny(tree);
  }
}
