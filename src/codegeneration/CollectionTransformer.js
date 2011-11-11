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

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var TokenType = traceur.syntax.TokenType;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;

  var RUNTIME = traceur.syntax.PredefinedName.RUNTIME;
  var TRACEUR = traceur.syntax.PredefinedName.TRACEUR;
  var ELEMENT_DELETE = traceur.syntax.PredefinedName.ELEMENT_DELETE;
  var ELEMENT_GET = traceur.syntax.PredefinedName.ELEMENT_GET;
  var ELEMENT_GET_CALL = traceur.syntax.PredefinedName.ELEMENT_GET_CALL;
  var ELEMENT_SET = traceur.syntax.PredefinedName.ELEMENT_SET;


  /**
   * Allows an object to have a collection set and get trap. For example:
   *
   *   var storage = Object.create(null);
   *   var object = {};
   *   Object.defineElementSet(object, function(key, value) {
   *     storage[hashCode(key)] = value;
   *   });
   *   Object.defineElementGet(object, function(key) {
   *     return storage[hashCode(key)];
   *   });
   *   var key = {};
   *   object[key] = 42;
   *
   * @see <a href="https://mail.mozilla.org/pipermail/es-discuss/2011-October/017468.html">es-dsicuss</a>
   *
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function CollectionTransformer() {
    ParseTreeTransformer.call(this);
  }

  /*
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  CollectionTransformer.transformTree = function(tree) {
    return new CollectionTransformer().transformAny(tree);
  };

  var proto = ParseTreeTransformer.prototype;
  CollectionTransformer.prototype = traceur.createObject(proto, {
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== TokenType.EQUAL ||
          tree.left.type !== ParseTreeType.MEMBER_LOOKUP_EXPRESSION) {
        return proto.transformBinaryOperator.call(this, tree);
      }

      var operand = this.transformAny(tree.left.operand);
      var memberExpression = this.transformAny(tree.left.memberExpression);
      var value = this.transformAny(tree.right);

      // operand[memberExpr] = value
      // =>
      // traceur.runtime.elementSet(operand, memberExpr, value)
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, ELEMENT_SET),
          createArgumentList(operand, memberExpression, value));
    },

    transformCallExpression: function(tree) {
      if (tree.operand.type !== ParseTreeType.MEMBER_LOOKUP_EXPRESSION)
        return proto.transformCallExpression.call(this, tree);

      var operand = this.transformAny(tree.operand.operand);
      var memberExpression = this.transformAny(tree.operand.memberExpression);

      // operand[memberExpr](args)
      // =>
      // traceur.runtime.elementGetCall(operand, memberExpr, [args])

      var elements = tree.args.args.map(this.transformAny, this);
      var arrayLiteral = createArrayLiteralExpression(elements);
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, ELEMENT_GET_CALL),
          createArgumentList(operand, memberExpression, arrayLiteral));
    },

    transformMemberLookupExpression: function(tree) {
      // operand[memberExpr]
      // =>
      // traceur.runtime.elementGet(operand, memberExpr)
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, ELEMENT_GET),
          createArgumentList(tree.operand, tree.memberExpression));
    },

    transformUnaryExpression: function(tree) {
      if (tree.operator.type !== TokenType.DELETE ||
          tree.operand.type !== ParseTreeType.MEMBER_LOOKUP_EXPRESSION) {
        return proto.transformUnaryExpression.call(this, tree);
      }

      var operand = this.transformAny(tree.operand.operand);
      var memberExpression = this.transformAny(tree.operand.memberExpression);

      // delete operand[memberExpr]
      // =>
      // traceur.runtime.elementDelete(operand, memberExpr)
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, ELEMENT_DELETE),
          createArgumentList(operand, memberExpression));
    }
  });

  return {
    CollectionTransformer: CollectionTransformer
  };
});
