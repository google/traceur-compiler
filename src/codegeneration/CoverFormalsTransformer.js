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

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  ArrayPattern,
  BindingElement,
  BindingIdentifier,
  CommaExpression,
  FormalParameter,
  FormalParameterList,
  ObjectPattern,
  ObjectPatternField,
  ParenExpression,
  RestParameter,
  SpreadPatternElement
} from '../syntax/trees/ParseTrees';
import {EQUAL} from '../syntax/TokenType';
import {
  IDENTIFIER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {AssignmentPatternTransformerError} from
    './AssignmentPatternTransformer';

/**
 * @fileoverview This transformer is used by the parser to transform a
 * CoverFormals tree into a FormalParameterList tree.
 */

/**
 * Error class used to signal that the transformation to a valid
 * FormalParameterList cannot be done.
 */
export class CoverFormalsTransformerError extends Error {
  constructor(location, message) {
    this.location = location;
    this.message = message;
  }
}

class ToFormalParametersTransformer extends ParseTreeTransformer {
  constructor() {
    this.isValid = true;
    this.inArrayPattern_ = false;
  }

  transformCoverFormals(tree) {
    var expressions = this.transformList(tree.expressions).map((expression) => {
      return new FormalParameter(expression.location, expression, null, []);
    });
    return new FormalParameterList(tree.location, expressions);
  }

  transformIdentifierExpression(tree) {
    return new BindingElement(tree.location,
        new BindingIdentifier(tree.location, tree.identifierToken),
        null);
  }

  transformBinaryOperator(tree) {
    if (tree.operator.type !== EQUAL)
      throw new CoverFormalsTransformerError(tree.operator,
          `Unexpected token ${tree.operator}`);

    var bindingElement = this.transformAny(tree.left);
    if (bindingElement instanceof BindingElement)
      bindingElement = bindingElement.binding;
    return new BindingElement(tree.location,
                              bindingElement,
                              tree.right);
  }

  transformArrayLiteralExpression(tree) {
    // We need to distinguish '...' at top level vs inside array patterns.
    var wasInArrayPattern = this.inArrayPattern_;
    this.inArrayPattern_ = true;
    var elements = this.transformList(tree.elements);
    this.inArrayPattern_ = wasInArrayPattern;

    // In expression context '...' can occur in any array position, but in
    // patterns it can only occur in last position.
    var okIndex = elements.length - 1;
    for (var i = 0; i < okIndex; i++) {
      if (elements[i] instanceof SpreadPatternElement)
        throw new CoverFormalsTransformerError(elements[i].location,
            'Unexpected token ...');
    }

    return new BindingElement(tree.location,
                              new ArrayPattern(tree.location, elements),
                              null);
  }

  transformObjectLiteralExpression(tree) {
    var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);

    return new BindingElement(tree.location,
        new ObjectPattern(tree.location, propertyNameAndValues), null);
  }

  transformCoverInitialisedName(tree) {
    return new BindingElement(tree.location,
                              new BindingIdentifier(tree.location, tree.name),
                              tree.initialiser);
  }

  transformPropertyNameAssignment(tree) {
    return new ObjectPatternField(tree.location, tree.name,
                                  this.transformAny(tree.value));
  }

  transformPropertyNameShorthand(tree) {
    return new BindingElement(tree.location,
                              new BindingIdentifier(tree.location, tree.name),
                              null);
  }

  transformSpreadExpression(tree) {
    // These only happens inside array patterns.
    if (tree.expression.type !== IDENTIFIER_EXPRESSION)
      throw new CoverFormalsTransformerError(tree.expression.location,
          'identifier expected');

    var bindingIdentifier =
        new BindingIdentifier(tree.expression.location,
                              tree.expression.identifierToken);

    if (this.inArrayPattern_)
      return new SpreadPatternElement(tree.location, bindingIdentifier);
    return new RestParameter(tree.location, bindingIdentifier);
  }

  transformSyntaxErrorTree(tree) {
    throw new AssignmentPatternTransformerError();
  }
}

/**
 * Converts a CoverFormals tree to a ParenExpression.
 * @param {CoverFormals} tree
 * @return {ParenExpression}
 */
export function toParenExpression(tree) {
  var expressions = tree.expressions;
  var length = expressions.length;

  if (length === 0)
    throw new CoverFormalsTransformerError(tree.location,
        'Unexpected token )');

  for (var i = 0; i < length; i++) {
    if (expressions[i].isRestParameter())
      throw new CoverFormalsTransformerError(expressions[i].location,
          'Unexpected token ...');
  }

  var expression;
  if (expressions.length > 1) {
    expression = new CommaExpression(expressions[0].location,
                                     expressions);
  } else  {
    expression = expressions[0];
  }
  return new ParenExpression(tree.location, expression);
}

/**
 * Converts a CoverFormals tree to a FormalParameterList.
 * @param {CoverFormals} tree
 * @return {FormalParameterList}
 */
export function toFormalParameters(tree) {
  var transformer = new ToFormalParametersTransformer();
  return transformer.transformAny(tree);
}
