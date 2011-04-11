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

// TODO(arv): This should probably use a runtime library to reduce code
// duplication.

traceur.define('codegeneration', function() {
  'use strict';

  var createArgumentList = traceur.codegeneration.ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = traceur.codegeneration.ParseTreeFactory.createArrayLiteralExpression;
  var createBinaryOperator = traceur.codegeneration.ParseTreeFactory.createBinaryOperator;
  var createBlock = traceur.codegeneration.ParseTreeFactory.createBlock;
  var createBooleanLiteral = traceur.codegeneration.ParseTreeFactory.createBooleanLiteral;
  var createCallExpression = traceur.codegeneration.ParseTreeFactory.createCallExpression;
  var createCallStatement = traceur.codegeneration.ParseTreeFactory.createCallStatement;
  var createConditionalExpression = traceur.codegeneration.ParseTreeFactory.createConditionalExpression;
  var createForStatement = traceur.codegeneration.ParseTreeFactory.createForStatement;
  var createFunctionExpression = traceur.codegeneration.ParseTreeFactory.createFunctionExpression;
  var createIdentifierExpression = traceur.codegeneration.ParseTreeFactory.createIdentifierExpression;
  var createIfStatement = traceur.codegeneration.ParseTreeFactory.createIfStatement;
  var createMemberExpression = traceur.codegeneration.ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = traceur.codegeneration.ParseTreeFactory.createMemberLookupExpression;
  var createNullLiteral = traceur.codegeneration.ParseTreeFactory.createNullLiteral;
  var createNumberLiteral = traceur.codegeneration.ParseTreeFactory.createNumberLiteral;
  var createOperatorToken = traceur.codegeneration.ParseTreeFactory.createOperatorToken;
  var createParameterList = traceur.codegeneration.ParseTreeFactory.createParameterList;
  var createParameterReference = traceur.codegeneration.ParseTreeFactory.createParameterReference;
  var createParenExpression = traceur.codegeneration.ParseTreeFactory.createParenExpression;
  var createReturnStatement = traceur.codegeneration.ParseTreeFactory.createReturnStatement;
  var createStringLiteral = traceur.codegeneration.ParseTreeFactory.createStringLiteral;
  var createThrowStatement = traceur.codegeneration.ParseTreeFactory.createThrowStatement;
  var createUnaryExpression = traceur.codegeneration.ParseTreeFactory.createUnaryExpression;
  var createUndefinedExpression = traceur.codegeneration.ParseTreeFactory.createUndefinedExpression;
  var createVariableDeclarationList = traceur.codegeneration.ParseTreeFactory.createVariableDeclarationList;
  var createVariableStatement = traceur.codegeneration.ParseTreeFactory.createVariableStatement;

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;

  var APPLY = traceur.syntax.PredefinedName.APPLY;
  var ARRAY = traceur.syntax.PredefinedName.ARRAY;
  var CALL = traceur.syntax.PredefinedName.CALL;
  var CREATE = traceur.syntax.PredefinedName.CREATE;
  var LENGTH = traceur.syntax.PredefinedName.LENGTH;
  var OBJECT = traceur.syntax.PredefinedName.OBJECT;
  var PROTOTYPE = traceur.syntax.PredefinedName.PROTOTYPE;
  var PUSH = traceur.syntax.PredefinedName.PUSH;
  var SLICE = traceur.syntax.PredefinedName.SLICE;
  var TYPE_ERROR = traceur.syntax.PredefinedName.TYPE_ERROR;
  var getParameterName = traceur.syntax.PredefinedName.getParameterName;
  var TokenType = traceur.syntax.TokenType;

  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  function hasSpreadMember(trees) {
    return trees.some(function(tree) {
      return tree.type == ParseTreeType.SPREAD_EXPRESSION;
    });
  }

  /**
   * Array.prototype.slice.call(tree)
   */
  function toArray(tree) {
    return createCallExpression(createMemberExpression(
        ARRAY, PROTOTYPE, SLICE, CALL),
        createArgumentList(tree));
  }


  var expandFunction;

  function getExpandFunction() {
    if (!expandFunction) {
      // TODO(arv): Remove toArray work around for V8 bug: https://code.google.com/p/v8/issues/detail?id=917

      // (function(xs)) {
      //   var rv = [];
      //   for (var i = 0; i < xs.length; i += 2) {
      //     if (xs[i]) {
      //       if (typeof xs[i + 1] != 'object' && xs[i + 1] !== undefined)
      //         throw TypeError('Spread expression has wrong type');
      //       rv.push.apply(rv, toArray(xs[i + 1]));
      //     } else {
      //       rv.push(xs[i + 1]);
      //     }
      //   }
      //   return rv;
      // })

      var xs = 0;
      var rv = 1;
      var i = 2;
      var xsExpression = createParameterReference(xs);
      var rvExpression = createParameterReference(rv);
      var iExpression = createParameterReference(i);

      var statements = [];

      // var rv = [];
      statements.push(createVariableStatement(
          TokenType.VAR, getParameterName(rv),
          createArrayLiteralExpression([])));

      // xs[i + 1]
      var xsLookup = createMemberLookupExpression(
          xsExpression,
          createBinaryOperator(
              iExpression,
              createOperatorToken(TokenType.PLUS),
              createNumberLiteral(1)));

      // rv.push.apply(rv, toArray(xs[i + 1]));
      var ifClause = createCallStatement(
          createMemberExpression(rvExpression, PUSH, APPLY),
          createArgumentList(rvExpression, toArray(xsLookup)));

      // rv.push(xs[i + 1]);
      var elseClause = createCallStatement(
          createMemberExpression(rvExpression, PUSH),
          createArgumentList(xsLookup));

      // typeof xs[i + 1] != 'object' && xs[i + 1] !== undefined
      var invalidObjectExpression = createBinaryOperator(
          createBinaryOperator(
              createUnaryExpression(
                  createOperatorToken(TokenType.TYPEOF),
                  xsLookup),
              createOperatorToken(TokenType.NOT_EQUAL),
              createStringLiteral('object')),
          createOperatorToken(TokenType.AND),
          createBinaryOperator(
              xsLookup,
              createOperatorToken(TokenType.NOT_EQUAL_EQUAL),
              createUndefinedExpression()));

      // throw TypeError('Spread expression has wrong type');
      var throwStatement = createThrowStatement(
          createCallExpression(
              createIdentifierExpression(TYPE_ERROR),
              createArgumentList(createStringLiteral('Spread expression has wrong type'))));

      // if (xs[i])
      var ifStatement = createIfStatement(
          createMemberLookupExpression(xsExpression, iExpression),
          // {
          createBlock(
              // if (typeof ...
              createIfStatement(
                  invalidObjectExpression,
                  throwStatement,
                  null),
              ifClause),
          elseClause);

      // for (var i = 0; i < xs.length; i += 2) {
      var forStatement = createForStatement(
          createVariableDeclarationList(
              TokenType.VAR,
              getParameterName(i),
              createNumberLiteral(0)),
          createBinaryOperator(
              iExpression,
              createOperatorToken(TokenType.OPEN_ANGLE),
              createMemberExpression(xsExpression, LENGTH)),
          createBinaryOperator(
              iExpression,
              createOperatorToken(TokenType.PLUS_EQUAL),
              createNumberLiteral(2)),
          ifStatement);

      statements.push(forStatement);
      // return rv;
      statements.push(createReturnStatement(rvExpression));

      expandFunction = createParenExpression(
          createFunctionExpression(createParameterList(1),
                                   createBlock(statements)));
    }
    return expandFunction;
  }

  function desugarArraySpread(tree) {
    // [a, ...b, c]
    //
    // (expandFunction)([false, a, true, b, false, c])
    return createExpandCall(tree.elements);
  }

  function createExpandCall(elements) {
    var args = [];
    elements.forEach(function(element) {
      if (element.type == ParseTreeType.SPREAD_EXPRESSION) {
        args.push(createBooleanLiteral(true));
        args.push(element.asSpreadExpression().expression);
      } else {
        args.push(createBooleanLiteral(false));
        args.push(element);
      }
    });
    return createCallExpression(
        getExpandFunction(),
        createArgumentList(
            createArrayLiteralExpression(args)));
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

      var expression = tree.operand.asMemberExpression();
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

      var lookupExpression = tree.operand.asMemberLookupExpression();
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
    // (function($0, $1) {
    //   var $2 = Object.create($0.prototype);
    //   var $3 = $0.apply($2, $1);
    //   return typeof $3 == 'object' ? $3 : $2;
    // })(Fun, (expandFunction)([false, a, true, b, false, c]))

    var body = createBlock(
        createVariableStatement(
            TokenType.VAR,
            getParameterName(2),
            createCallExpression(
                createMemberExpression(OBJECT, CREATE),
                createArgumentList(
                    createMemberExpression(getParameterName(0), PROTOTYPE)))),
        createVariableStatement(
            TokenType.VAR,
            getParameterName(3),
            createCallExpression(
                createMemberExpression(getParameterName(0), APPLY),
                createArgumentList(
                    createParameterReference(2),
                    createParameterReference(1)))),
        createReturnStatement(
            createConditionalExpression(
                createBinaryOperator(
                    createUnaryExpression(
                        createOperatorToken(TokenType.TYPEOF),
                        createParameterReference(3)),
                    createOperatorToken(TokenType.EQUAL_EQUAL),
                    createStringLiteral('object')),
                createParameterReference(3),
                createParameterReference(2))));

    var func = createParenExpression(
        createFunctionExpression(
            createParameterList(2),
            body));

    return createCallExpression(
        func,
        createArgumentList(
            tree.operand,
            createExpandCall(tree.args.args)));
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

  SpreadTransformer.prototype = {
    __proto__: ParseTreeTransformer.prototype,

    transformArrayLiteralExpressionTree: function(tree) {
      if (hasSpreadMember(tree.elements)) {
        return desugarArraySpread(tree);
      }
      return ParseTreeTransformer.prototype.
          transformArrayLiteralExpressionTree.call(this, tree);
    },

    transformCallExpressionTree: function(tree) {
      if (hasSpreadMember(tree.args.args)) {
        return desugarCallSpread(tree);
      }
      return ParseTreeTransformer.prototype.transformCallExpressionTree.
          call(this, tree);
    },

    transformNewExpressionTree: function(tree) {
      if (tree.args != null && hasSpreadMember(tree.args.args)) {
        return desugarNewSpread(tree);
      }
      return ParseTreeTransformer.prototype.transformNewExpressionTree.
          call(this, tree);
    }
  };

  return {
    SpreadTransformer: SpreadTransformer
  };
});
