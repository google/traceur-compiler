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

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var TokenType = traceur.syntax.TokenType;
  var expandMemberExpression = traceur.codegeneration.expandMemberExpression;
  var expandMemberLookupExpression = traceur.codegeneration.expandMemberLookupExpression;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createThisExpression = ParseTreeFactory.createThisExpression;

  /**
   * Transforms super expressions in function bodies.
   *
   * @param {TempVarTransformer} tempVarTransformer
   * @param {ErrorReporter} reporter
   * @param {ParseTree} method
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function SuperTransformer(tempVarTransformer, reporter, className,
                            methodTree) {
    ParseTreeTransformer.call(this);
    this.tempVarTransformer_ = tempVarTransformer;
    this.className_ = className;
    this.method_ = methodTree;
    this.reporter_ = reporter;
  }

  var proto = ParseTreeTransformer.prototype;
  SuperTransformer.prototype = traceur.createObject(proto, {

    superFound_: false,
    get hasSuper() {
      return this.superFound_;
    },

    // super does not carry into other method bodies.
    transformFunctionDeclaration: function(tree) { return tree; },
    transformGetAccessor: function(tree) { return tree; },
    transformSetAccessor: function(tree) { return tree; },
    transformPropertyMethodAssignMent: function(tree) { return tree; },

    /**
     * @param {CallExpression} tree
     * @return {ParseTree}
     */
    transformCallExpression: function(tree) {
      if (this.method_ && tree.operand.type == ParseTreeType.SUPER_EXPRESSION) {
        // We have: super(args)
        this.superFound_ = true;
        var methodName = this.method_.name.value;

        // traceur.runtime.superCall(this, class, "name", <args>)
        return createCallExpression(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.SUPER_CALL),
            createArgumentList(
              createThisExpression(),
              this.className_,
              createStringLiteral(methodName),
              createArrayLiteralExpression(tree.args.args)));
      }

      if ((tree.operand.type == ParseTreeType.MEMBER_EXPRESSION ||
           tree.operand.type == ParseTreeType.MEMBER_LOOKUP_EXPRESSION) &&
          tree.operand.operand.type == ParseTreeType.SUPER_EXPRESSION) {
        // super.member(args) or member[exrp](args)
        this.superFound_ = true;

        var nameExpression;
        if (tree.operand.type == ParseTreeType.MEMBER_EXPRESSION) {
          nameExpression = createStringLiteral(
              tree.operand.memberName.value);
        } else {
          nameExpression = tree.operand.memberExpression;
        }

        // traceur.runtime.superCall(this, class, "name", <args>)
        return createCallExpression(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.SUPER_CALL),
            createArgumentList(
              createThisExpression(),
              this.className_,
              nameExpression,
              createArrayLiteralExpression(tree.args.args)));
      }

      return proto.transformCallExpression.call(this, tree);
    },

    transformMemberShared_: function(tree, name) {
      // traceur.runtime.superGet(this, class, "name")
      return createCallExpression(
          createMemberExpression(
              PredefinedName.TRACEUR,
              PredefinedName.RUNTIME,
              PredefinedName.SUPER_GET),
          createArgumentList(
            createThisExpression(),
            this.className_,
            name));
    },

    /**
     * @param {MemberExpression} tree
     * @return {ParseTree}
     */
    transformMemberExpression: function(tree) {
      if (tree.operand.type === ParseTreeType.SUPER_EXPRESSION) {
        return this.transformMemberShared_(tree,
            createStringLiteral(tree.memberName.value));
      }
      return proto.transformMemberExpression.call(this, tree);
    },

    transformMemberLookupExpression: function(tree) {
      if (tree.operand.type === ParseTreeType.SUPER_EXPRESSION)
        return this.transformMemberShared_(tree, tree.memberExpression);
      return proto.transformMemberLookupExpression.call(this, tree);
    },

    transformBinaryOperator: function(tree) {
      if (tree.operator.isAssignmentOperator() &&
          (tree.left.type === ParseTreeType.MEMBER_EXPRESSION ||
           tree.left.type === ParseTreeType.MEMBER_LOOKUP_EXPRESSION) &&
          tree.left.operand.type === ParseTreeType.SUPER_EXPRESSION) {

        if (tree.operator.type !== TokenType.EQUAL) {
          if (tree.left.type === ParseTreeType.MEMBER_LOOKUP_EXPRESSION) {
            tree = expandMemberLookupExpression(tree,
                                                   this.tempVarTransformer_);
          } else {
            tree = expandMemberExpression(tree, this.tempVarTransformer_);
          }
          return this.transformAny(tree);
        }

        this.superFound_ = true;
        var name = tree.left.type === ParseTreeType.MEMBER_LOOKUP_EXPRESSION ?
            tree.left.memberExpression :
            createStringLiteral(tree.left.memberName.value);

        // traceur.runtim.superSet(this, class, "name", value)
        return createCallExpression(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.SUPER_SET),
            createArgumentList(
              createThisExpression(),
              this.className_,
              name,
              this.transformAny(tree.right)));
      }

      // TODO(arv): Implement super.foo op= expr
      return proto.transformBinaryOperator.call(this, tree);
    },

    /**
     * @param {SuperExpression} tree
     * @return {ParseTree}
     */
    transformSuperExpression: function(tree) {
      this.reportError_(tree, '"super" may only be used on the LHS of a member access expression before a call (TODO wording)');
      return tree;
    },

    /**
     * @param {ParseTree} tree
     * @param {string} format
     * @param {...Object} var_args
     */
    reportError_: function(tree, format, var_args) {
      var args = Array.prototype.slice.call(arguments);
      args[0] = tree.location.start;
      this.reporter_.reportError.apply(this.reporter_, args);
    }
  });

  return {
    SuperTransformer: SuperTransformer
  };
});
