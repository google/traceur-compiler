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

'use strong';

import {
  BinaryExpression,
  MemberLookupExpression,
  Module,
  ForInStatement,
  Script,
  UnaryExpression
} from '../syntax/trees/ParseTrees.js';
import {ExplodeExpressionTransformer} from './ExplodeExpressionTransformer.js';
import {
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  UNARY_EXPRESSION,
  VARIABLE_DECLARATION_LIST
} from '../syntax/trees/ParseTreeType.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  IN,
  NOT_EQUAL,
  NOT_EQUAL_EQUAL,
  STRING,
  TYPEOF
} from '../syntax/TokenType.js';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser.js';
import {prependStatements} from './PrependStatements.js';


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

function isEqualityExpression(tree) {
  switch (tree.operator.type) {
    case EQUAL_EQUAL:
    case EQUAL_EQUAL_EQUAL:
    case NOT_EQUAL:
    case NOT_EQUAL_EQUAL:
      return true;
  }
  return false;
}

function isTypeof(tree) {
  return tree.type === UNARY_EXPRESSION && tree.operator.type === TYPEOF;
}

function isSafeTypeofString(tree) {
  if (tree.type !== LITERAL_EXPRESSION)
    return false;
  var value = tree.literalToken.processedValue;
  switch (value) {
    case 'symbol':
    case 'object':
      return false;
  }
  return true;
}

var runtimeOption = parseStatement `$traceurRuntime.options.symbols = true`;

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
 *   operand[$traceurRuntime.toProperty(memberExpression)] = value
 */
export class SymbolTransformer extends TempVarTransformer {

  transformModule(tree) {
    return new Module(tree.location,
        prependStatements(this.transformList(tree.scriptItemList),
            runtimeOption),
        this.moduleName_);
  }

  transformScript(tree) {
    return new Script(tree.location,
        prependStatements(this.transformList(tree.scriptItemList),
            runtimeOption),
        this.moduleName_);
  }

  /**
   * Helper for the case where we only want to transform the operand of
   * the typeof expression.
   */
  transformTypeofOperand_(tree) {
    var operand = this.transformAny(tree.operand);
    return new UnaryExpression(tree.location, tree.operator, operand);
  }

  transformBinaryExpression(tree) {
    if (tree.operator.type === IN) {
      var name = this.transformAny(tree.left);
      var object = this.transformAny(tree.right);

      if (name.type === LITERAL_EXPRESSION)
        return new BinaryExpression(tree.location, name, tree.operator, object);

      // name in object
      // =>
      return parseExpression
          `$traceurRuntime.toProperty(${name}) in ${object}`;
    }

    // typeof expr === 'object'
    // Since symbols are implemented as objects typeof returns 'object'.
    // However, if the expression is comparing to 'undefined' etc we can just
    // use the built in typeof.
    if (isEqualityExpression(tree)) {
      if (isTypeof(tree.left) && isSafeTypeofString(tree.right)) {
        var left = this.transformTypeofOperand_(tree.left);
        var right = tree.right;
        return new BinaryExpression(tree.location, left, tree.operator, right);
      }

      if (isTypeof(tree.right) && isSafeTypeofString(tree.left)) {
        var left = tree.left;
        var right = this.transformTypeofOperand_(tree.right);
        return new BinaryExpression(tree.location, left, tree.operator, right);
      }
    }

    return super.transformBinaryExpression(tree);
  }

  transformMemberLookupExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var memberExpression = this.transformAny(tree.memberExpression);

    // Only string literals can overlap with the symbol.
    if (memberExpression.type === LITERAL_EXPRESSION &&
        memberExpression.literalToken.type !== STRING) {
      return new MemberLookupExpression(tree.location, operand,
          memberExpression);
    }

    // operand[memberExpr]
    // =>
    return parseExpression
        `${operand}[$traceurRuntime.toProperty(${memberExpression})]`;
  }

  transformUnaryExpression(tree) {
    if (tree.operator.type !== TYPEOF)
      return super.transformUnaryExpression(tree);

    var operand = this.transformAny(tree.operand);
    var expression = this.getRuntimeTypeof(operand);

    if (operand.type === IDENTIFIER_EXPRESSION) {
      // For ident we cannot just call the function since the ident might not
      // be bound to an identifier. This is important if the free variable
      // pass is not turned on.
      return parseExpression `(typeof ${operand} === 'undefined' ?
          'undefined' : ${expression})`;
    }

    return expression;
  }

  getRuntimeTypeof(operand) {
    return parseExpression `$traceurRuntime.typeof(${operand})`;
  }

  /**
   * Transform for-in to filter out shim symbols keys.
   */
  transformForInStatement(tree) {
    // for (i in coll) ...
    //
    // =>
    //
    // for (i in coll) if (!isSymbol(i)) ...
    var initializer = this.transformAny(tree.initializer);
    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);

    var initIdentToken;
    if (initializer.type === VARIABLE_DECLARATION_LIST) {
      initIdentToken = initializer.declarations[0].lvalue.identifierToken;
    } else {
      initIdentToken = initializer.identifierToken;
    }

    if (!initIdentToken) {
      // Destructuring is not yet supported here.
      throw new Error('Not implemented');
    }

    body = parseStatement
        `if (!$traceurRuntime.isSymbolString(${initIdentToken})) ${body}`;
    return new ForInStatement(tree.location, initializer, collection, body);
  }
}
