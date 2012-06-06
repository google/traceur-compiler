// Copyright 2012 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var TokenType = traceur.syntax.TokenType;

  var createAssignmentExpression = ParseTreeFactory.createAssignmentExpression;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createCommaExpression = ParseTreeFactory.createCommaExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = ParseTreeFactory.createMemberLookupExpression;
  var createOperatorToken = ParseTreeFactory.createOperatorToken;
  var createParenExpression = ParseTreeFactory.createParenExpression;

  /**
   * Returns the binary operator that the assignment operator should use. For
   * example *= should use *.
   */
  function getBinaryOperator(type) {
    switch (type) {
      case TokenType.STAR_EQUAL:
        return TokenType.STAR;
      case TokenType.SLASH_EQUAL:
        return TokenType.SLASH;
      case TokenType.PERCENT_EQUAL:
        return TokenType.PERCENT;
      case TokenType.PLUS_EQUAL:
        return TokenType.PLUS;
      case TokenType.MINUS_EQUAL:
        return TokenType.MINUS;
      case TokenType.LEFT_SHIFT_EQUAL:
        return TokenType.LEFT_SHIFT;
      case TokenType.RIGHT_SHIFT_EQUAL:
        return TokenType.RIGHT_SHIFT;
      case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL:
        return TokenType.UNSIGNED_RIGHT_SHIFT;
      case TokenType.AMPERSAND_EQUAL:
        return TokenType.AMPERSAND;
      case TokenType.CARET_EQUAL:
        return TokenType.CARET;
      case TokenType.BAR_EQUAL:
        return TokenType.BAR;
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
  function expandMemberLookupExpression(tree, tempVarTransformer) {
    var tmp1;
    var expressions = [];
    if (tree.left.operand.type == ParseTreeType.SUPER_EXPRESSION ||
        tree.left.operand.type == ParseTreeType.IDENTIFIER_EXPRESSION) {
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
  function expandMemberExpression(tree, tempVarTransformer) {
    var tmp;
    var expressions = [];
    if (tree.left.operand.type == ParseTreeType.SUPER_EXPRESSION ||
        tree.left.operand.type == ParseTreeType.IDENTIFIER_EXPRESSION) {
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

  return {
    expandMemberLookupExpression: expandMemberLookupExpression,
    expandMemberExpression: expandMemberExpression
  };
});
