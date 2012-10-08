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

traceur.define('codegeneration', function() {
  'use strict';

  var AtNameExpression = traceur.syntax.trees.AtNameExpression;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var TempVarTransformer = traceur.codegeneration.TempVarTransformer;
  var TokenType = traceur.syntax.TokenType;
  var expandMemberExpression = traceur.codegeneration.expandMemberExpression;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createAssignmentExpression = ParseTreeFactory.createAssignmentExpression;
  var createCallCall = ParseTreeFactory.createCallCall;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCommaExpression = ParseTreeFactory.createCommaExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createParenExpression = ParseTreeFactory.createParenExpression;

  var DELETE_PROPERTY = traceur.syntax.PredefinedName.DELETE_PROPERTY;
  var GET_PROPERTY = traceur.syntax.PredefinedName.GET_PROPERTY;
  var RUNTIME = traceur.syntax.PredefinedName.RUNTIME;
  var SET_PROPERTY = traceur.syntax.PredefinedName.SET_PROPERTY;
  var TRACEUR = traceur.syntax.PredefinedName.TRACEUR;

  /**
   * Transforms expr.@name into traceur.runtime.getProperty(expr, @name). It
   * also transforms []= and the delete operator in similar fashion.
   *
   * This pass is used for private name syntax.
   *
   * http://wiki.ecmascript.org/doku.php?id=strawman:syntactic_support_for_private_names
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @extends {TempVarTransformer}
   * @constructor
   */
  function AtNameMemberTransformer(identifierGenerator) {
    TempVarTransformer.call(this, identifierGenerator);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  AtNameMemberTransformer.transformTree = function(identifierGenerator, tree) {
    return new AtNameMemberTransformer(identifierGenerator).transformAny(tree);
  };

  var base = TempVarTransformer.prototype;
  AtNameMemberTransformer.prototype = traceur.createObject(base, {
    transformBinaryOperator: function(tree) {

      if (tree.left.type === ParseTreeType.MEMBER_EXPRESSION &&
          tree.left.memberName.type === TokenType.AT_NAME &&
          tree.operator.isAssignmentOperator()) {

        if (tree.operator.type !== TokenType.EQUAL) {
          tree = expandMemberExpression(tree, this);
          return this.transformAny(tree);
        }

        var operand = this.transformAny(tree.left.operand);
        var memberName = tree.left.memberName;
        var atNameExpression = new AtNameExpression(memberName.location,
                                                    memberName);
        var value = this.transformAny(tree.right);

        // operand.@name = value
        // =>
        // traceur.runtime.setProperty(operand, memberExpr, value)
        return createCallExpression(
            createMemberExpression(TRACEUR, RUNTIME, SET_PROPERTY),
            createArgumentList(operand, atNameExpression, value));
      }

      return base.transformBinaryOperator.call(this, tree);
    },

    transformCallExpression: function(tree) {
      if (tree.operand.type !== ParseTreeType.MEMBER_EXPRESSION ||
          tree.operand.memberName.type !== TokenType.AT_NAME)
        return base.transformCallExpression.call(this, tree);

      var operand = this.transformAny(tree.operand.operand);
      var memberName = tree.operand.memberName;

      // operand.@name(args)
      // =>
      // ($tmp = operand,
      //  traceur.runtime.getProperty($tmp, @name).call($tmp, args))

      var ident = createIdentifierExpression(this.addTempVar());
      var elements = tree.args.args.map(this.transformAny, this);
      var atNameExpression = new AtNameExpression(memberName.location,
                                                  memberName);
      var callExpr = createCallCall(
          createCallExpression(
            createMemberExpression(TRACEUR, RUNTIME, GET_PROPERTY),
            createArgumentList(ident, atNameExpression)),
          ident,
          elements);

      var expressions = [
        createAssignmentExpression(ident, operand),
        callExpr
      ];

      return createParenExpression(createCommaExpression(expressions));
    },

    transformMemberExpression: function(tree) {
      if (tree.memberName.type !== TokenType.AT_NAME)
        return base.transformMemberExpression.call(this, tree);

      // operand.@name
      // =>
      // traceur.runtime.getProperty(operand, @name)
      var atNameExpression = new AtNameExpression(tree.memberName.location,
                                                 tree.memberName);
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, GET_PROPERTY),
          createArgumentList(tree.operand, atNameExpression));
    },

    transformUnaryExpression: function(tree) {
      if (tree.operator.type !== TokenType.DELETE ||
          tree.operand.type !== ParseTreeType.MEMBER_EXPRESSION ||
          tree.operand.memberName.type !== TokenType.AT_NAME) {
        return base.transformUnaryExpression.call(this, tree);
      }

      var operand = this.transformAny(tree.operand.operand);
      var memberName = tree.operand.memberName;
      var atNameExpression = new AtNameExpression(memberName.location,
                                                  memberName);

      // delete operand.@name
      // =>
      // traceur.runtime.deletePropery(operand, @name)
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, DELETE_PROPERTY),
          createArgumentList(operand, atNameExpression));
    }
  });

  return {
    AtNameMemberTransformer: AtNameMemberTransformer
  };
});
