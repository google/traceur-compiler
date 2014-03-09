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

import {ExplodeExpressionTransformer} from './ExplodeExpressionTransformer';
import {MEMBER_LOOKUP_EXPRESSION} from '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  EQUAL,
  IN
} from '../syntax/TokenType';
import {createParenExpression} from './ParseTreeFactory';
import {parseExpression} from './PlaceholderParser';

class ExplodeSymbolExpression extends ExplodeExpressionTransformer {
  transformArrowFunctionExpression(tree) {
    return tree;
  }
  transformClassExpression(tree) {
    return tree;
  }
  transformFunctionBody(tree) {
    return tree;
  }
}

/**
 * This transformer is used with symbol values to ensure that symbols can be
 * used as member expressions.
 *
 * It does the following transformations:
 *
 *   operand[memberExpression]
 *   =>
 *   operand[$traceurRuntime.toProperty(memberExpression)]
 *
 *   operand[memberExpression] = value
 *   =>
 *   $traceurRuntime.setProperty(operand, memberExpression}, value)
 */
export class SymbolTransformer extends TempVarTransformer {

  transformBinaryOperator(tree) {
    if (tree.operator.type === IN) {
      var name = this.transformAny(tree.left);
      var object = this.transformAny(tree.right);
      // name in object
      // =>
      return parseExpression
          `$traceurRuntime.toProperty(${name}) in ${object}`;
    }

    if (tree.left.type === MEMBER_LOOKUP_EXPRESSION &&
        tree.operator.isAssignmentOperator()) {

      if (tree.operator.type !== EQUAL) {
        var exploded = new ExplodeSymbolExpression(this).transformAny(tree);
        return this.transformAny(createParenExpression(exploded));
      }

      var operand = this.transformAny(tree.left.operand);
      var memberExpression = this.transformAny(tree.left.memberExpression);
      var value = this.transformAny(tree.right);

      // operand[memberExpr] = value
      // =>
      return parseExpression `$traceurRuntime.setProperty(${operand},
          ${memberExpression}, ${value})`;
    }

    return super.transformBinaryOperator(tree);
  }

  transformMemberLookupExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var memberExpression = this.transformAny(tree.memberExpression);

    // operand[memberExpr]
    // =>
    return parseExpression
        `${operand}[$traceurRuntime.toProperty(${memberExpression})]`;

  }
}
