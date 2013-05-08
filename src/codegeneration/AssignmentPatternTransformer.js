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

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  ArrayPattern,
  BindingElement,
  IdentifierExpression,
  ObjectPattern,
  ObjectPatternField,
  SpreadPatternElement
} from '../syntax/trees/ParseTrees.js';
import {EQUAL} from '../syntax/TokenType.js';

/**
 * @fileoverview This transformer is used by the parser to transform a
 * LeftHandSideExpression into an AssignmentPattern tree.
 */

/**
 * Error class used to signal that the transformation to a valid
 * ArrayPattern cannot be done.
 */
export class AssignmentPatternTransformerError extends Error {}

export class AssignmentPatternTransformer extends ParseTreeTransformer {

  transformBinaryOperator(tree) {
    if (tree.operator.type !== EQUAL)
      throw new AssignmentPatternTransformerError();

    // TODO(arv): We should probably introduce an AssignmentElement to better
    // match the spec.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=181
    var bindingElement = this.transformAny(tree.left);
    return new BindingElement(tree.location,
                              bindingElement.binding,
                              tree.right);
  }

  transformArrayLiteralExpression(tree) {
    var elements = this.transformList(tree.elements);
    return new ArrayPattern(tree.location, elements);
  }

  transformObjectLiteralExpression(tree) {
    var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
    return new ObjectPattern(tree.location, propertyNameAndValues);
  }

  transformPropertyNameAssignment(tree) {
    // TODO(arv) name is currently just a token but that will change with
    // [names].
    return new ObjectPatternField(tree.location, tree.name,
                                  this.transformAny(tree.value));
  }

  transformPropertyNameShorthand(tree) {
    return new IdentifierExpression(tree.location, tree.name);
  }

  transformSpreadExpression(tree) {
    return new SpreadPatternElement(tree.location, tree.expression);
  }

  transformSyntaxErrorTree(tree) {
    throw new AssignmentPatternTransformerError();
  }
}
