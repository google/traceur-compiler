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
  BINARY_EXPRESSION,
  COMMA_EXPRESSION,
  CONDITIONAL_EXPRESSION,
  TEMPLATE_LITERAL_PORTION
} from '../syntax/trees/ParseTreeType';
import {
  LiteralExpression,
  ParenExpression
} from '../syntax/trees/ParseTrees';
import {LiteralToken} from '../syntax/LiteralToken';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {TempVarTransformer} from './TempVarTransformer';
import {
  PERCENT,
  PLUS,
  SLASH,
  STAR,
  STRING
} from '../syntax/TokenType';
import {
  createArgumentList,
  createArrayLiteralExpression,
  createBinaryExpression,
  createCallExpression,
  createIdentifierExpression,
  createOperatorToken,
  createStringLiteral
} from './ParseTreeFactory';
import {parseExpression} from './PlaceholderParser';

/**
 * @param {ParseTree} tree
 * @return {ParseTree}
 */
function createCallSiteIdObject(tree) {
  var elements = tree.elements;
  var cooked = createCookedStringArray(elements);
  var raw = createRawStringArray(elements);
  return parseExpression `Object.freeze(Object.defineProperties(${cooked}, {
    raw: {
      value: Object.freeze(${raw})
    }
  }))`;
}

/**
 * Adds an empty string at the end if needed. This is needed in case the
 * template literal does not end with a literal portion.
 * @param {Array.<ParseTree>} elements
 * @param {Array.<ParseTree>} items This is the array that gets mutated.
 */
function maybeAddEmptyStringAtEnd(elements, items) {
  var length = elements.length;
  if (!length || elements[length - 1].type !== TEMPLATE_LITERAL_PORTION)
    items.push(createStringLiteral(''));
}

function createRawStringArray(elements) {
  var items = [];
  for (var i = 0; i < elements.length; i += 2) {
    var str = elements[i].value.value;
    // Normalize line endings before using JSON for the rest.
    str = str.replace(/\r\n?/g, '\n');
    str = JSON.stringify(str);
    // JSON does not handle Unicode line terminators \u2028 and \u2029.
    str = replaceRaw(str);
    var loc = elements[i].location;
    var expr = new LiteralExpression(loc, new LiteralToken(STRING, str, loc));
    items.push(expr);
  }
  maybeAddEmptyStringAtEnd(elements, items);
  return createArrayLiteralExpression(items);
}

function createCookedStringLiteralExpression(tree) {
  var str = cookString(tree.value.value);
  var loc = tree.location;
  return new LiteralExpression(loc, new LiteralToken(STRING, str, loc));
}

function createCookedStringArray(elements) {
  var items = [];
  for (var i = 0; i < elements.length; i += 2) {
    items.push(createCookedStringLiteralExpression(elements[i]));
  }
  maybeAddEmptyStringAtEnd(elements, items);
  return createArrayLiteralExpression(items);
}

function replaceRaw(s) {
  return s.replace(/\u2028|\u2029/g, function(c) {
    switch (c) {
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
      default:
        throw Error('Not reachable');
    }
  });
}

/**
 * Takes a raw string and returns a string that is suitable for the cooked
 * value. This involves removing line continuations, escaping double quotes
 * and escaping whitespace.
 */
function cookString(s) {
  var sb = ['"'];
  var i = 0, k = 1, c, c2;
  while (i < s.length) {
    c = s[i++];
    switch (c) {
      case '\\':
        c2 = s[i++];
        switch (c2) {
          // Strip line continuation.
          case '\n':
          case '\u2028':
          case '\u2029':
            break;
          case '\r':
            // \ \r \n should be stripped as one
            if (s[i + 1] === '\n') {
              i++;
            }
            break;

          default:
            sb[k++] = c;
            sb[k++] = c2;
        }
        break;

      // Since we wrap the string in " we need to escape those.
      case '"':
        sb[k++] = '\\"';
        break;

      // Whitespace
      case '\n':
        sb[k++] = '\\n';
        break;
      // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF>
      // for both TV and TRV.
      case '\r':
        if (s[i] === '\n')
          i++;
        sb[k++] = '\\n';
        break;
      case '\t':
        sb[k++] = '\\t';
        break;
      case '\f':
        sb[k++] = '\\f';
        break;
      case '\b':
        sb[k++] = '\\b';
        break;
      case '\u2028':
        sb[k++] = '\\u2028';
        break;
      case '\u2029':
        sb[k++] = '\\u2029';
        break;

      default:
        sb[k++] = c;
    }
  }

  sb[k++] = '"';
  return sb.join('');
}

export class TemplateLiteralTransformer extends TempVarTransformer {

  /**
   * Override to not use functions scope for temporary variables since we
   * only want to scope these to modules or global.
   */
  transformFunctionBody(tree) {
    return ParseTreeTransformer.prototype.transformFunctionBody.call(this, tree);
  }

  transformTemplateLiteralExpression(tree) {
    if (!tree.operand)
      return this.createDefaultTemplateLiteral(tree);

    var operand = this.transformAny(tree.operand);
    var elements = tree.elements;

    var callsiteIdObject = createCallSiteIdObject(tree);
    var idName = this.addTempVar(callsiteIdObject);

    var args = [createIdentifierExpression(idName)];

    for (var i = 1; i < elements.length; i += 2) {
      args.push(this.transformAny(elements[i]));
    }

    return createCallExpression(operand, createArgumentList(args));
  }

  transformTemplateSubstitution(tree) {
    var transformedTree = this.transformAny(tree.expression);
    // Wrap in a paren expression if needed.
    switch (transformedTree.type) {
      case BINARY_EXPRESSION:
        // Only * / and % have higher priority than +.
        switch (transformedTree.operator.type) {
          case STAR:
          case PERCENT:
          case SLASH:
            return transformedTree;
        }
        // Fall through.
      case COMMA_EXPRESSION:
      case CONDITIONAL_EXPRESSION:
        return new ParenExpression(null, transformedTree);
    }

    return transformedTree;
  }

  transformTemplateLiteralPortion(tree) {
    return createCookedStringLiteralExpression(tree);
  }

  createDefaultTemplateLiteral(tree) {
    // convert to ("a" + b + "c" + d + "")
    var length = tree.elements.length;
    if (length === 0) {
      var loc = tree.location;
      return new LiteralExpression(loc, new LiteralToken(STRING, '""', loc));
    }

    var firstNonEmpty = tree.elements[0].value.value === '' ? -1 : 0;
    var binaryExpression = this.transformAny(tree.elements[0]);
    if (length == 1)
      return binaryExpression;

    var plusToken = createOperatorToken(PLUS);
    for (var i = 1; i < length; i++) {
      var element = tree.elements[i];
      if (element.type === TEMPLATE_LITERAL_PORTION) {
        if (element.value.value === '')
          continue;
        else if (firstNonEmpty < 0 && i === 2)
          binaryExpression = binaryExpression.right;
      }
      var transformedTree = this.transformAny(tree.elements[i]);
      binaryExpression = createBinaryExpression(binaryExpression, plusToken,
                                              transformedTree);
    }

    return new ParenExpression(null, binaryExpression);
  }
}
