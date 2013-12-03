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
  APPLY,
  BIND,
  FUNCTION,
  PROTOTYPE
} from '../syntax/PredefinedName';
import {
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  SPREAD_EXPRESSION
} from  '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  createArgumentList,
  createArrayLiteralExpression,
  createAssignmentExpression,
  createCallExpression,
  createEmptyArgumentList,
  createIdentifierExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createNewExpression,
  createNullLiteral,
  createParenExpression
} from './ParseTreeFactory';
import {
  parseExpression
} from './PlaceholderParser';

function hasSpreadMember(trees) {
  return trees.some((tree) => tree && tree.type == SPREAD_EXPRESSION);
}

/**
 * Desugars spread in arrays.
 * TODO(arv): spread in array patterns
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:spread">harmony:spread</a>
 */
export class SpreadTransformer extends TempVarTransformer {
  /**
   * Creates an expression that results in an array where all the elements are
   * spread.
   *
   *   ...xs, x, ...ys, y, z
   *
   * transforms to something like
   *
   *   _spread(xs, [x], ys, [y, z])
   *
   * @param {Array.<ParseTree>} elements
   * @param {boolean} needsNewArray In the case of a spread call we can
   *     sometimes get away with out creating a new array.
   * @return {CallExpression}
   * @private
   */
  createArrayFromElements_(elements, needsNewArray) {
    var length = elements.length;

    // If only one argument we know it must be a spread expression so all we
    // need to do is to ensure it is an object.
    if (length === 1 && !needsNewArray) {
      var args = createArgumentList(this.transformAny(elements[0].expression));
      return parseExpression `$traceurRuntime.toObject(${args})`;
    }

    // Coalesce multiple non spread elements.
    var args = [];
    var lastArray;
    for (var i = 0; i < length; i++) {
      // Arrays can contain holes which are represented by null.
      if (elements[i] && elements[i].type === SPREAD_EXPRESSION) {
        if (lastArray) {
          args.push(createArrayLiteralExpression(lastArray));
          lastArray = null;
        }
        args.push(
            this.transformAny(elements[i].expression));
      } else {
        if (!lastArray)
          lastArray = [];
        lastArray.push(this.transformAny(elements[i]));
      }
    }
    if (lastArray)
      args.push(createArrayLiteralExpression(lastArray));

    return parseExpression
        `$traceurRuntime.spread(${createArgumentList(args)})`;
  }

  desugarCallSpread_(tree) {
    var operand = this.transformAny(tree.operand);
    var functionObject, contextObject;

    this.pushTempVarState();

    if (operand.type == MEMBER_EXPRESSION) {
      // expr.fun(a, ...b, c)
      //
      // ($tmp = expr).fun.apply($tmp, expandedArgs)

      var tempIdent = createIdentifierExpression(this.addTempVar());
      var parenExpression = createParenExpression(
          createAssignmentExpression(tempIdent, operand.operand));
      var memberName = operand.memberName;

      contextObject = tempIdent;
      functionObject = createMemberExpression(parenExpression, memberName);

    } else if (tree.operand.type == MEMBER_LOOKUP_EXPRESSION) {
      // expr[fun](a, ...b, c)
      //
      // ($tmp = expr)[fun].apply($tmp, expandedArgs)

      var tempIdent = createIdentifierExpression(this.addTempVar());
      var parenExpression = createParenExpression(
          createAssignmentExpression(tempIdent, operand.operand));
      var memberExpression = this.transformAny(operand.memberExpression);

      contextObject = tempIdent;
      functionObject = createMemberLookupExpression(parenExpression,
                                                    memberExpression);

    } else {

      // f(a, ...b, c)
      //
      // f.apply(null, expandedArgs)
      // TODO(arv): Should this be apply([[Global]], ...) instead?
      contextObject = createNullLiteral();
      functionObject = operand;
    }

    this.popTempVarState();

    // functionObject.apply(contextObject, expandedArgs)
    var arrayExpression = this.createArrayFromElements_(tree.args.args, false);
    return createCallExpression(
        createMemberExpression(functionObject, APPLY),
        createArgumentList(contextObject, arrayExpression));
  }

  desugarNewSpread_(tree) {
    // new Fun(a, ...b, c)
    //
    // new (Function.prototype.bind.apply(Fun, [null, ... args]))

    var arrayExpression = [createNullLiteral(), ...tree.args.args];
    arrayExpression = this.createArrayFromElements_(arrayExpression, false);

    return createNewExpression(
        createParenExpression(
            createCallExpression(
              createMemberExpression(FUNCTION, PROTOTYPE, BIND, APPLY),
              createArgumentList(
                  this.transformAny(tree.operand),
                  arrayExpression))),
        createEmptyArgumentList());
  }

  transformArrayLiteralExpression(tree) {
    if (hasSpreadMember(tree.elements)) {
      return this.createArrayFromElements_(tree.elements, true);
    }
    return super.transformArrayLiteralExpression(tree);
  }

  transformCallExpression(tree) {
    if (hasSpreadMember(tree.args.args)) {
      return this.desugarCallSpread_(tree);
    }
    return super.transformCallExpression(tree);
  }

  transformNewExpression(tree) {
    if (tree.args != null && hasSpreadMember(tree.args.args)) {
      return this.desugarNewSpread_(tree);
    }
    return super.transformNewExpression(tree);
  }
}
