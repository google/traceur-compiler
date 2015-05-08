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

import {
  ParenExpression,
  UnaryExpression,
} from '../../syntax/trees/ParseTrees.js';
import {ExplodeExpressionTransformer} from '../ExplodeExpressionTransformer.js';
import {LanguageModeTransformerTrait} from '../LanguageModeTransformerTrait.js';
import {parseExpression} from '../PlaceholderParser.js';
import {TempVarTransformer} from '../TempVarTransformer.js';
import {
  AMPERSAND_EQUAL,
  AMPERSAND,
  BAR_EQUAL,
  BAR,
  CARET_EQUAL,
  CARET,
  CLOSE_ANGLE,
  GREATER_EQUAL,
  LEFT_SHIFT_EQUAL,
  LEFT_SHIFT,
  LESS_EQUAL,
  MINUS_EQUAL,
  MINUS_MINUS,
  MINUS,
  OPEN_ANGLE,
  PERCENT_EQUAL,
  PERCENT,
  PLUS_PLUS,
  PLUS,
  RIGHT_SHIFT_EQUAL,
  RIGHT_SHIFT,
  SLASH_EQUAL,
  SLASH,
  STAR_EQUAL,
  STAR_STAR_EQUAL,
  STAR_STAR,
  STAR,
  TILDE,
  UNSIGNED_RIGHT_SHIFT_EQUAL,
  UNSIGNED_RIGHT_SHIFT,
} from '../../syntax/TokenType.js';

function getRuntimeName(type) {
  switch (type) {
    case AMPERSAND: return 'strongBitAnd';
    case BAR: return 'strongBitOr';
    case CARET: return 'strongBitXor';
    case CLOSE_ANGLE: return 'strongGreaterThan';
    case GREATER_EQUAL: return 'strongGreaterThanEqual';
    case LEFT_SHIFT: return 'strongLeftShift';
    case LESS_EQUAL: return 'strongLessThanEqual';
    case MINUS: return 'strongMinus';
    case OPEN_ANGLE: return 'strongLessThan';
    case PERCENT: return 'strongMod';
    case PLUS: return 'strongPlus';
    case RIGHT_SHIFT: return 'strongRightShift';
    case SLASH: return 'strongDiv';
    case STAR_STAR: return 'strongPow';
    case STAR: return 'strongMul';
    case UNSIGNED_RIGHT_SHIFT: return 'strongUnsignedRightShift';
    default: return '';
  }
}

function needsExpansion(operator) {
  if (!operator.isAssignmentOperator()) {
    return false;
  }
  switch (operator.type) {
    case AMPERSAND_EQUAL:
    case BAR_EQUAL:
    case CARET_EQUAL:
    case LEFT_SHIFT_EQUAL:
    case MINUS_EQUAL:
    case PERCENT_EQUAL:
    case RIGHT_SHIFT_EQUAL:
    case SLASH_EQUAL:
    case STAR_EQUAL:
    case STAR_STAR_EQUAL:
    case UNSIGNED_RIGHT_SHIFT_EQUAL:
      return true;
    default:
      return false;
  }
}

/**
 * In strong mode it is a TypeError to do multiplacation on non numbers.
 *
 * This transformer transforms binary expressions to check the types of its
 * operand.
 *
 *   function f(x, y) {
 *     'use strong';
 *     return x * y
 *   }
 *
 *   Generates:
 *
 *   function f(x) {
 *     'use strong';
 *     return $traceurRuntime.strongMul(x, y);
 *   }
 */
export class StrongCoercionTransformer extends
    LanguageModeTransformerTrait(TempVarTransformer) {

  transformBinaryExpression(tree) {
    if (this.isStrongMode()) {
      if (needsExpansion(tree.operator)) {
        let expanded =
            new ExplodeExpressionTransformer(this).transformAny(tree);
        return this.transformAny(expanded);
      }

      let runtimeName = getRuntimeName(tree.operator.type);
      if (runtimeName !== '') {
        let left = this.transformAny(tree.left);
        let right = this.transformAny(tree.right);
        return parseExpression
            `$traceurRuntime.${runtimeName}(${left}, ${right})`;
      }
    }
    return super.transformBinaryExpression(tree);
  }

  transformUnaryExpression(tree) {
    if (this.isStrongMode()) {
      switch (tree.operator.type) {
        case PLUS_PLUS:
        case MINUS_MINUS: {
          let expanded =
              new ExplodeExpressionTransformer(this).transformAny(tree);
          return new ParenExpression(null, this.transformAny(expanded));
        }
        case MINUS:
        case PLUS:
        case TILDE: {
          let operand = this.transformAny(tree.operand);
          operand = parseExpression `$traceurRuntime.assertNumber(${operand})`;
          return new UnaryExpression(tree.location, tree.operator, operand);
        }
      }
    }
    return super.transformUnaryExpression(tree);
  }

  transformPostfixExpression(tree) {
    if (this.isStrongMode()) {
      switch (tree.operator.type) {
        case PLUS_PLUS:
        case MINUS_MINUS: {
          let expanded =
              new ExplodeExpressionTransformer(this).transformAny(tree);
          return new ParenExpression(null, this.transformAny(expanded));
        }
      }
    }
    return super.transformUnaryExpression(tree);
  }
}
