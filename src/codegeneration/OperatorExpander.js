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
  IDENTIFIER_EXPRESSION,
  SUPER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {
  AMPERSAND,
  AMPERSAND_EQUAL,
  BAR,
  BAR_EQUAL,
  CARET,
  CARET_EQUAL,
  LEFT_SHIFT,
  LEFT_SHIFT_EQUAL,
  MINUS,
  MINUS_EQUAL,
  PERCENT,
  PERCENT_EQUAL,
  PLUS,
  PLUS_EQUAL,
  RIGHT_SHIFT,
  RIGHT_SHIFT_EQUAL,
  SLASH,
  SLASH_EQUAL,
  STAR,
  STAR_EQUAL,
  UNSIGNED_RIGHT_SHIFT,
  UNSIGNED_RIGHT_SHIFT_EQUAL
} from '../syntax/TokenType';
import {
  createAssignmentExpression,
  createBinaryOperator,
  createCommaExpression,
  createIdentifierExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createOperatorToken,
  createParenExpression
} from './ParseTreeFactory';

/**
 * Returns the binary operator that the assignment operator should use. For
 * example *= should use *.
 */
function getBinaryOperator(type) {
  switch (type) {
    case STAR_EQUAL:
      return STAR;
    case SLASH_EQUAL:
      return SLASH;
    case PERCENT_EQUAL:
      return PERCENT;
    case PLUS_EQUAL:
      return PLUS;
    case MINUS_EQUAL:
      return MINUS;
    case LEFT_SHIFT_EQUAL:
      return LEFT_SHIFT;
    case RIGHT_SHIFT_EQUAL:
      return RIGHT_SHIFT;
    case UNSIGNED_RIGHT_SHIFT_EQUAL:
      return UNSIGNED_RIGHT_SHIFT;
    case AMPERSAND_EQUAL:
      return AMPERSAND;
    case CARET_EQUAL:
      return CARET;
    case BAR_EQUAL:
      return BAR;
    default:
      throw Error('unreachable');
  }
}

/**
 * Normalizes member lookup expressions with += etc.
 *
 * e1[e2] += e3
 * =>
 * (tmp1 = e1, tmp2 = e2, tmp1[tmp2] = tmp1[tmp2] + e3)
 *
 * If e1 is a single identifier expression then we skip the tmp1 = e1
 * assignment.
 * @param {ParseTree} tree
 * @param {TempVarTransformer} tempVarTransformer
 * @return {ParseTree}
 */
export function expandMemberLookupExpression(tree, tempVarTransformer) {
  var tmp1;
  var expressions = [];
  if (tree.left.operand.type == SUPER_EXPRESSION ||
      tree.left.operand.type == IDENTIFIER_EXPRESSION) {
    tmp1 = tree.left.operand;
  } else {
    tmp1 = createIdentifierExpression(tempVarTransformer.addTempVar());
    expressions.push(createAssignmentExpression(tmp1, tree.left.operand));
  }

  var tmp2 = createIdentifierExpression(tempVarTransformer.addTempVar());
  expressions.push(
    createAssignmentExpression(tmp2, tree.left.memberExpression),
    createAssignmentExpression(
        createMemberLookupExpression(tmp1, tmp2),
        createBinaryOperator(
            createMemberLookupExpression(tmp1, tmp2),
            createOperatorToken(getBinaryOperator(tree.operator.type)),
            tree.right))
  );
  return createParenExpression(createCommaExpression(expressions));
}

/**
 * Normalizes member expressions with += etc.
 *
 * e1.p += e2
 * =>
 * (tmp = e1, tmp.p = tmp.p + e2)
 *
 * If e1 is a single identifier expression then we skip the tmp = e1
 * assignment.
 *
 * @param {ParseTree} tree
 * @param {TempVarTransformer} tempVarTransformer
 * @return {ParseTree}
 */
export function expandMemberExpression(tree, tempVarTransformer) {
  var tmp;
  var expressions = [];
  if (tree.left.operand.type == SUPER_EXPRESSION ||
      tree.left.operand.type == IDENTIFIER_EXPRESSION) {
    tmp = tree.left.operand;
  } else {
    tmp = createIdentifierExpression(tempVarTransformer.addTempVar());
    expressions.push(createAssignmentExpression(tmp, tree.left.operand));
  }

  expressions.push(
      createAssignmentExpression(
          createMemberExpression(tmp, tree.left.memberName),
          createBinaryOperator(
              createMemberExpression(tmp, tree.left.memberName),
              createOperatorToken(getBinaryOperator(tree.operator.type)),
              tree.right)));
  return createParenExpression(createCommaExpression(expressions));
}
