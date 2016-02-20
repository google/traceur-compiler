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
  JSX_SPREAD_ATTRIBUTE,
  JSX_TEXT,
  PROPERTY_NAME_ASSIGNMENT,
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
  createIdentifierExpression,
  createIdentifierToken,
  createMemberExpression,
  createNullLiteral,
  createObjectLiteral,
  createPropertyNameAssignment,
  createStringLiteral,
  createStringLiteralToken,
  createTrueLiteral,
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
    let props = this.transformJsxAttributes_(tree);
    let children = this.transformJsxChildren_(tree.children);
    let args = createArgumentList([name, props, ...children]);
    return parseExpression `${this.getJsxFunction_()}(${args})`;
  }

  transformJsxAttributes_(tree) {
    let attrs = this.transformList(tree.attributes);
    if (attrs.length === 0) {
      return createNullLiteral();
    }
    if (tree.attributes.some(a => a.type === JSX_SPREAD_ATTRIBUTE)) {
      return this.createSpreadAttributeExpression_(attrs);
    }
    return createObjectLiteral(attrs);
  }

  createSpreadAttributeExpression_(attrs) {
    // <a b='b' c='c' {...d} {...g} />
    // =>
    // React.createElement('a',
    //     $traceurRuntime.objectAssign({b: 'b', c: 'c'}, d, g))

    // Accummulate consecutive jsx attributes into a single js property.
    let args = [];
    let accummulatedProps = null;
    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];
      if (attr.type === PROPERTY_NAME_ASSIGNMENT) {
        if (!accummulatedProps) {
          accummulatedProps = [];
        }
        accummulatedProps.push(attr);
      } else {  // JSX spread attribute transformed into an expression.
        if (accummulatedProps) {
          args.push(createObjectLiteral(accummulatedProps));
          accummulatedProps = null;
        }
        args.push(attr);
      }
    }
    if (accummulatedProps) {
      args.push(createObjectLiteral(accummulatedProps));
    }
    return parseExpression `$traceurRuntime.objectAssign(${
        createArgumentList(args)})`;
  }

  transformJsxElementName(tree) {
    if (tree.names.length === 1) {
      let {value} = tree.names[0];
      if (value[0] === value[0].toUpperCase()) {
        return createIdentifierExpression(value);;
      }
      return createStringLiteral(value);
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
    let value;
    if (tree.value === null) {
      value = createTrueLiteral();
    } else {
      value = this.transformAny(tree.value);
    }
    return createPropertyNameAssignment(name, value);
  }

  transformJsxPlaceholder(tree) {
    return this.transformAny(tree.expression);
  }

  transformJsxSpreadAttribute(tree) {
    return this.transformAny(tree.expression);
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
