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

import ParseTreeTransformer from 'ParseTreeTransformer.js';
import ParseTreeType from '../syntax/trees/ParseTree.js';
import PredefinedName from '../syntax/PredefinedName.js';
import {
  createArgumentList,
  createArrayLiteralExpression,
  createBlock,
  createBooleanLiteral,
  createCallExpression,
  createFunctionExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createNullLiteral,
  createParameterList,
  createParameterReference,
  createParenExpression,
  createReturnStatement
} from 'ParseTreeFactory.js';
import createObject from '../util/util.js';

var APPLY = PredefinedName.APPLY;


// Spreads the elements in {@code items} into a single array.
// @param {Array} items Array of interleaving booleans and values.
// @return {Array}
var SPREAD_CODE = `
    function(items) {
      var retval = [];
      var k = 0;
      for (var i = 0; i < items.length; i += 2) {
        var value = items[i + 1];
        // spread
        if (items[i]) {
          value = %toObject(value);
          for (var j = 0; j < value.length; j++) {
            retval[k++] = value[j];
          }
        } else {
          retval[k++] = value;
        }
      }
      return retval;
    }`;


// @param {Function} ctor
// @param {Array} items Array of interleaving booleans and values.
// @return {Object}
var SPREAD_NEW_CODE = `
    function(ctor, items) {
      var args = %spread(items);
      args.unshift(null);
      return new (Function.prototype.bind.apply(ctor, args));
    }`;

function hasSpreadMember(trees) {
  return trees.some((tree) => tree.type == ParseTreeType.SPREAD_EXPRESSION);
}

function createInterleavedArgumentsArray(elements) {
  var args = [];
  elements.forEach((element) => {
    if (element.type == ParseTreeType.SPREAD_EXPRESSION) {
      args.push(createBooleanLiteral(true));
      args.push(element.expression);
    } else {
      args.push(createBooleanLiteral(false));
      args.push(element);
    }
  });
  return createArrayLiteralExpression(args);
}

/**
 * Desugars spread in arrays.
 * TODO(arv): spread in array patterns
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:spread">harmony:spread</a>
 *
 * @param {RuntimeInliner} runtimeInliner
 * @extends {ParseTreeTransformer}
 * @constructor
 */
export function SpreadTransformer(runtimeInliner) {
  ParseTreeTransformer.call(this);
  this.runtimeInliner_ = runtimeInliner;
}

SpreadTransformer.transformTree = function(runtimeInliner, tree) {
  return new SpreadTransformer(runtimeInliner).transformAny(tree);
};

SpreadTransformer.prototype = createObject(
    ParseTreeTransformer.prototype, {

  createExpandCall_: function(elements) {
    if (elements.length === 1) {
      return createCallExpression(
          this.toObject_,
          createArgumentList(elements[0].expression));
    }
    var args = createInterleavedArgumentsArray(elements);
    return createCallExpression(
        this.spread_,
        createArgumentList(args));
  },

  get spread_() {
    return this.runtimeInliner_.get('spread', SPREAD_CODE);
  },

  get spreadNew_() {
    this.runtimeInliner_.register('spread', SPREAD_CODE);
    return this.runtimeInliner_.get('spreadNew', SPREAD_NEW_CODE);
  },

  get toObject_() {
    return this.runtimeInliner_.get('toObject');
  },

  desugarArraySpread_: function(tree) {
    // [a, ...b, c]
    //
    // (expandFunction)([false, a, true, b, false, c])
    return this.createExpandCall_(tree.elements);
  },

  desugarCallSpread_: function(tree) {
    if (tree.operand.type == ParseTreeType.MEMBER_EXPRESSION) {
      // expr.fun(a, ...b, c)
      //
      // expr.fun.apply(expr, (expandFunction)([false, a, true, b, false, c]))
      //
      // (function($0, $1) {
      //   return $0.fun.apply($0, $1);
      // })(expr, (expandFunction)([false, a, true, b, false, c]))

      var expression = tree.operand;
      return this.desugarSpreadMethodCall_(
          tree,
          expression.operand,
          createMemberExpression(
              createParameterReference(0),
              expression.memberName));

    } else if (tree.operand.type == ParseTreeType.MEMBER_LOOKUP_EXPRESSION) {
      // expr[fun](a, ...b, c)
      //
      // expr[fun].apply(expr,
      //                 (expandFunction)([false, a, true, b, false, c]))
      //
      // (function($0, $1) {
      //   return $0[fun].apply($0, $1);
      // })(expr, (expandFunction)([false, a, true, b, false, c]))

      var lookupExpression = tree.operand;
      return this.desugarSpreadMethodCall_(
          tree,
          lookupExpression.operand,
          createMemberLookupExpression(
              createParameterReference(0),
              lookupExpression.memberExpression));
    }
    // f(a, ..b, c)
    //
    // f.apply(null, (expandFunction)([false, a, true, b, false, c])

    // TODO(arv): Should this be apply([[Global]], ...) instead?

    return createCallExpression(createMemberExpression(tree.operand, APPLY),
        createArgumentList(createNullLiteral(),
                           this.createExpandCall_(tree.args.args)));
  },

  desugarSpreadMethodCall_: function(tree, operand, memberLookup) {
    // (function ($0, $1) {
    //   return memberLookup.apply($0, $1);
    // })(operand, expandCall(arguments))

    var body = createBlock(
        createReturnStatement(
            createCallExpression(
                createMemberExpression(
                    memberLookup,
                    APPLY),
                createArgumentList(
                    createParameterReference(0),
                    createParameterReference(1)))));

    var func = createParenExpression(
        createFunctionExpression(createParameterList(2), body));

    return createCallExpression(
        func,
        createArgumentList(
            operand,
            this.createExpandCall_(tree.args.args)));
  },

  desugarNewSpread_: function(tree) {
    // new Fun(a, ...b, c)
    //
    // %spreadNew(Fun, [false, a, true, b, false, c])
    return createCallExpression(
        this.spreadNew_,
        createArgumentList(
            tree.operand,
            createInterleavedArgumentsArray(tree.args.args)));
  },

  transformArrayLiteralExpression: function(tree) {
    if (hasSpreadMember(tree.elements)) {
      return this.desugarArraySpread_(tree);
    }
    return ParseTreeTransformer.prototype.
        transformArrayLiteralExpression.call(this, tree);
  },

  transformCallExpression: function(tree) {
    if (hasSpreadMember(tree.args.args)) {
      return this.desugarCallSpread_(tree);
    }
    return ParseTreeTransformer.prototype.transformCallExpression.
        call(this, tree);
  },

  transformNewExpression: function(tree) {
    if (tree.args != null && hasSpreadMember(tree.args.args)) {
      return this.desugarNewSpread_(tree);
    }
    return ParseTreeTransformer.prototype.transformNewExpression.
        call(this, tree);
  }
});
