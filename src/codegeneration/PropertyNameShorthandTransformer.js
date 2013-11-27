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
  LiteralPropertyName,
  PropertyNameAssignment
} from '../syntax/trees/ParseTrees';
import {ParseTreeTransformer} from './ParseTreeTransformer';

/**
 * Desugars property name shorthands.
 *
 * @see http://people.mozilla.org/~jorendorff/es6-draft.html#sec-11.1.5
 */
export class PropertyNameShorthandTransformer extends ParseTreeTransformer {
  transformPropertyNameShorthand(tree) {
    return new PropertyNameAssignment(tree.location,
        new LiteralPropertyName(tree.location, tree.name),
        new IdentifierExpression(tree.location, tree.name));
  }
}
