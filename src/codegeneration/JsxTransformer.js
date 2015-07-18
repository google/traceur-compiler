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

import {
  JSX_ELEMENT,
  JSX_PLACEHOLDER,
  JSX_TEXT,
} from '../syntax/trees/ParseTreeType.js';
import {
  JsxText,
  LiteralExpression,
  LiteralPropertyName,
} from '../syntax/trees/ParseTrees.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {STRING} from '../syntax/TokenType.js';
import {
  createArgumentList,
  createIdentifierToken,
  createMemberExpression,
  createNullLiteral,
  createObjectLiteral,
  createPropertyNameAssignment,
  createStringLiteral,
  createStringLiteralToken,
} from './ParseTreeFactory.js';
import {parseExpression} from './PlaceholderParser.js';

/**
 * Desugars JSX expressions.
 *
 *   <p a="b" c="d">e{f}g</p>
 *
 * to:
 *
 *   Rect.createElement('p', {a: 'b', c: 'd'}, 'e', f, 'g')
 *
 * The emitted function is configurable. By default the generated function is
 * `React.createElement` but by setting the `jsx` option you can provide your
 * own function to use:
 *
 *   // Options: --jsx=myFunc
 *   <p/>
 *
 * Would generate something like:
 *
 *   myFunc('p', null)
 */
export class JsxTransformer extends ParseTreeTransformer {
  constructor(idGen, reporter, options) {
    super();
    this.options_ = options;
    this.jsxFunction_ = null;
  }

  getJsxFunction_() {
    // Let the emitted JSX function be configurable.
    // --jsx  -> React.createElement(tagName, opts, ...children)
    // --jsx=a.b.c -> a.b.c(tagName, opts, ...children)
    if (!this.jsxFunction_) {
      let jsx = this.options_.jsx;
      if (typeof jsx === 'string') {
        this.jsxFunction_ = parseExpression([jsx]);
      } else {
        this.jsxFunction_ = parseExpression `React.createElement`;
      }
    }
    return this.jsxFunction_;
  }

  transformJsxElement(tree) {
    let name = this.transformAny(tree.name);
    let attrs = this.transformList(tree.attributes);
    let children = this.transformJsxChildren_(tree.children);
    let props;
    if (attrs.length > 0) {
      props = createObjectLiteral(attrs);
    } else {
      props = createNullLiteral();
    }
    let args = createArgumentList([name, props, ...children]);
    return parseExpression `${this.getJsxFunction_()}(${args})`;
  }

  transformJsxElementName(tree) {
    if (tree.names.length === 1) {
      return createStringLiteral(tree.names[0].value);
    }

    let names = tree.names.map(jsxIdentifierToToken);
    let operand = names[0];
    if (operand.type === STRING) {
      names[0] = new LiteralExpression(operand.location, operand);
    }

    return createMemberExpression(...names);
  }

  transformJsxAttribute(tree) {
    let name =
        new LiteralPropertyName(tree.name.location,
                                jsxIdentifierToToken(tree.name));
    let value = this.transformAny(tree.value);
    return createPropertyNameAssignment(name, value);
  }

  transformJsxPlaceholder(tree) {
    return tree.expression;
  }

  transformJsxText(tree) {
    return createStringLiteral(tree.value.value);
  }

  transformJsxChildren_(trees) {
    // All lines having leading or trailing whitespace are trimmed, all newlines
    // are removed, adjacent text separated by newlines become separated by a
    // single space. Any whitespace tabs are replaced with spaces. Strings
    // inside expressions are unaffected.
    let rv = [];
    trees.forEach(tree => {
      let newTree;
      switch (tree.type) {
        case JSX_ELEMENT:
          newTree = this.transformAny(tree);
          break;
        case JSX_PLACEHOLDER:
          if (tree.expression === null) {
            return;
          }
          newTree = this.transformAny(tree);
          break;
        case JSX_TEXT: {
          let s = tree.value.value;
          s = s.replace(/\t/g, ' ');
          if (!/[\n\r]/.test(s)) {
            newTree = createStringLiteral(s);
          } else {
            s = s.replace(/^[ \t]*[\n\r]\s*/, '');
            s = s.replace(/[ \t]*[\n\r]\s*$/, '');
            if (s === '') {
              return;
            }
            newTree = createStringLiteral(s);
          }
          break;
        }
      }
      rv.push(newTree)
    });
    return rv;
  }
}

function jsxIdentifierToToken(token) {
  let value = token.value;
  if (value.indexOf('-') !== -1) {
    return createStringLiteralToken(value);
  }
  return createIdentifierToken(value);
}
