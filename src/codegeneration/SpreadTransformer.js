// Copyright 2011 Google Inc.
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

  var createArgumentList = traceur.codegeneration.ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = traceur.codegeneration.ParseTreeFactory.createArrayLiteralExpression;
  var createBlock = traceur.codegeneration.ParseTreeFactory.createBlock;
  var createBooleanLiteral = traceur.codegeneration.ParseTreeFactory.createBooleanLiteral;
  var createCallExpression = traceur.codegeneration.ParseTreeFactory.createCallExpression;
  var createFunctionExpression = traceur.codegeneration.ParseTreeFactory.createFunctionExpression;
  var createMemberExpression = traceur.codegeneration.ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = traceur.codegeneration.ParseTreeFactory.createMemberLookupExpression;
  var createNullLiteral = traceur.codegeneration.ParseTreeFactory.createNullLiteral;
  var createParameterList = traceur.codegeneration.ParseTreeFactory.createParameterList;
  var createParameterReference = traceur.codegeneration.ParseTreeFactory.createParameterReference;
  var createParenExpression = traceur.codegeneration.ParseTreeFactory.createParenExpression;
  var createReturnStatement = traceur.codegeneration.ParseTreeFactory.createReturnStatement;

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;

  var APPLY = traceur.syntax.PredefinedName.APPLY;
  var ARRAY = traceur.syntax.PredefinedName.ARRAY;
  var CALL = traceur.syntax.PredefinedName.CALL;
  var RUNTIME = traceur.syntax.PredefinedName.RUNTIME;
  var SLICE = traceur.syntax.PredefinedName.SLICE;
  var SPREAD = traceur.syntax.PredefinedName.SPREAD;
  var SPREAD_NEW = traceur.syntax.PredefinedName.SPREAD_NEW;
  var TRACEUR = traceur.syntax.PredefinedName.TRACEUR;

  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  function hasSpreadMember(trees) {
    return trees.some(function(tree) {
      return tree.type == ParseTreeType.SPREAD_EXPRESSION;
    });
  }

  function getExpandFunction() {
    // traceur.runtime.spread
    return createMemberExpression(TRACEUR, RUNTIME, SPREAD);
  }

  function desugarArraySpread(tree) {
    // [a, ...b, c]
    //
    // (expandFunction)([false, a, true, b, false, c])
    return createExpandCall(tree.elements);
  }

  function createInterleavedArgumentsArray(elements) {
    var args = [];
    elements.forEach(function(element) {
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

  function createExpandCall(elements) {
    var args = createInterleavedArgumentsArray(elements);
    return createCallExpression(
        getExpandFunction(),
        createArgumentList(args));
  }

  function desugarCallSpread(tree) {
    if (tree.operand.type == ParseTreeType.MEMBER_EXPRESSION) {
      // expr.fun(a, ...b, c)
      //
      // expr.fun.apply(expr, (expandFunction)([false, a, true, b, false, c]))
      //
      // (function($0, $1) {
      //   return $0.fun.apply($0, $1);
      // })(expr, (expandFunction)([false, a, true, b, false, c]))

      var expression = tree.operand;
      return desugarSpreadMethodCall(
          tree,
          expression.operand,
          createMemberExpression(
              createParameterReference(0),
              expression.memberName));

    } else if (tree.operand.type == ParseTreeType.MEMBER_LOOKUP_EXPRESSION) {
      // expr[fun](a, ...b, c)
      //
      // expr[fun].apply(expr, (expandFunction)([false, a, true, b, false, c]))
      //
      // (function($0, $1) {
      //   return $0[fun].apply($0, $1);
      // })(expr, (expandFunction)([false, a, true, b, false, c]))

      var lookupExpression = tree.operand;
      return desugarSpreadMethodCall(
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
        createArgumentList(createNullLiteral(), createExpandCall(tree.args.args)));
  }

  function desugarSpreadMethodCall(tree, operand, memberLookup) {
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
            createExpandCall(tree.args.args)));
  }

  function desugarNewSpread(tree) {
    // new Fun(a, ...b, c)
    //
    // traceur.runtime.newWithSpread(Fun, [false, a, true, b, false, c])
    return createCallExpression(
        createMemberExpression(TRACEUR, RUNTIME, SPREAD_NEW),
        createArgumentList(
            tree.operand,
            createInterleavedArgumentsArray(tree.args.args)));
  }

  /**
   * Desugars spread in arrays.
   * TODO(arv): spread in array patterns
   *
   * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:spread">harmony:spread</a>
   *
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function SpreadTransformer() {}

  SpreadTransformer.transformTree = function(tree) {
    return new SpreadTransformer().transformAny(tree);
  };

  SpreadTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    transformArrayLiteralExpression: function(tree) {
      if (hasSpreadMember(tree.elements)) {
        return desugarArraySpread(tree);
      }
      return ParseTreeTransformer.prototype.
          transformArrayLiteralExpression.call(this, tree);
    },

    transformCallExpression: function(tree) {
      if (hasSpreadMember(tree.args.args)) {
        return desugarCallSpread(tree);
      }
      return ParseTreeTransformer.prototype.transformCallExpression.
          call(this, tree);
    },

    transformNewExpression: function(tree) {
      if (tree.args != null && hasSpreadMember(tree.args.args)) {
        return desugarNewSpread(tree);
      }
      return ParseTreeTransformer.prototype.transformNewExpression.
          call(this, tree);
    }
  });

  return {
    SpreadTransformer: SpreadTransformer
  };
});
