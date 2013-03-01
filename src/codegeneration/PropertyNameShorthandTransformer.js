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

import {
  IdentifierExpression,
  PropertyNameAssignment
} from '../syntax/trees/ParseTrees.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';

/**
 * Desugars property name shorthands
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=strawman:object_initialiser_shorthand">strawman:object_initialiser_shorthand</a>
 */
export class PropertyNameShorthandTransformer extends ParseTreeTransformer {
  transformPropertyNameShorthand(tree) {
    // We need to pass along the location for the FreeVariableChecker to not
    // fail.
    return new PropertyNameAssignment(tree.location,
        tree.name, new IdentifierExpression(tree.location, tree.name));
  }

  static transformTree(tree) {
    return new PropertyNameShorthandTransformer().transformAny(tree);
  }
}
