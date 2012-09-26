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

  var MemberLookupExpression = traceur.syntax.trees.MemberLookupExpression;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var PredefinedName = traceur.syntax.PredefinedName;
  var TempVarTransformer = traceur.codegeneration.TempVarTransformer;
  var TokenType = traceur.syntax.TokenType;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;
  var VariableStatement = traceur.syntax.trees.VariableStatement;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createEmptyArgumentList = ParseTreeFactory.createEmptyArgumentList;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createVariableDeclaration = ParseTreeFactory.createVariableDeclaration;

  /**
   * Desugars the private name syntax, @name.
   *
   * @see http://wiki.ecmascript.org/doku.php?id=strawman:syntactic_support_for_private_names
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @extends {TempVarTransformer}
   * @constructor
   */
  function PrivateNameSyntaxTransformer(identifierGenerator) {
    TempVarTransformer.call(this, identifierGenerator);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   */
  PrivateNameSyntaxTransformer.transformTree = function(identifierGenerator,
                                                        tree) {
    return new PrivateNameSyntaxTransformer(identifierGenerator).
        transformAny(tree);
  };

  var base = TempVarTransformer.prototype;
  PrivateNameSyntaxTransformer.prototype = traceur.createObject(base, {

    getTransformedName_: function(token) {
      return this.identifierGenerator.getUniqueIdentifier(token.value);
    },

    transformAtNameExpression: function(tree) {
      var transformedName = this.getTransformedName_(tree.atNameToken);
      return createIdentifierExpression(transformedName);
    },

    transformNameStatement: function(tree) {
      // private @a, @b = expr;
      //  =>
      // const __a = traceur.runtime.createName(),
      //       __b = traceur.runtime.assertName(expr)
      var declarations = this.transformList(tree.declarations);
      return new VariableStatement(tree.location,
          new VariableDeclarationList(tree.location, TokenType.CONST,
                                      declarations));
    },

    /**
     * @param {MemberExpression} tree
     * @return {ParseTree}
     */
    transformMemberExpression: function(tree) {
      // operand.@name
      //  =>
      // operand[__name]
      if (tree.memberName.type !== TokenType.AT_NAME)
        return base.transformMemberExpression.call(this, tree);

      var operand = this.transformAny(tree.operand);
      var transformedName = this.getTransformedName_(tree.memberName);
      return new MemberLookupExpression(tree.location, operand,
          createIdentifierExpression(transformedName));
    },

    transformAtNameDeclaration: function(tree) {
      var transformedName = this.getTransformedName_(tree.atNameToken);

      var args, name;
      if (tree.initializer) {
        args = createArgumentList(this.transformAny(tree.initializer));
        name = PredefinedName.ASSERT_NAME;
      } else {
        args = createEmptyArgumentList();
        name = PredefinedName.CREATE_NAME;
      }

      return createVariableDeclaration(transformedName,
        createCallExpression(
          createMemberExpression(
              PredefinedName.TRACEUR,
              PredefinedName.RUNTIME,
              name),
          args));
    }
  });

  return {
    PrivateNameSyntaxTransformer: PrivateNameSyntaxTransformer
  };
});
