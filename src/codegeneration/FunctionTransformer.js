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

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;

  var PredefinedName = traceur.syntax.PredefinedName;
  var TokenType = traceur.syntax.TokenType;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createCallCall = ParseTreeFactory.createCallCall;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createThisExpression = ParseTreeFactory.createThisExpression;

  var MethodSymbol = traceur.semantics.symbols.MethodSymbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;

  /**
   * Transforms method bodies.
   *
   * Includes:
   *  - static
   *  - 'super' keyword
   *
   * @param {ErrorReporter} reporter
   * @param {AggregateSymbol|MethodSymbol} symbol
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function FunctionTransformer(reporter, symbol) {
    ParseTreeTransformer.call(this);
    if (symbol instanceof MethodSymbol) {
      this.method_ = symbol;
      symbol = symbol.containingAggregate;
    }
    this.reporter_ = reporter;
    this.aggregate_ = symbol;
    Object.freeze(this);
  }

  var proto = ParseTreeTransformer.prototype;
  FunctionTransformer.prototype = traceur.createObject(proto, {

    /**
     * @param {FunctionDeclaration} tree
     * @return {ParseTree}
     */
    transformFunctionDeclaration: function(tree) {
      var nested = new FunctionTransformer(this.context_);
      return new FunctionDeclaration(
          null,
          tree.name,
          tree.isStatic,
          tree.formalParameterList,
          nested.transformBlock(tree.functionBody));
    },

    /**
     * @param {CallExpression} tree
     * @return {ParseTree}
     */
    transformCallExpression: function(tree) {
      if (tree.operand.type == ParseTreeType.SUPER_EXPRESSION &&
          this.method_ && !this.method_.isStatic) {
        // We have: super(args)

        // This becomes a call into the current method, which might be the
        // constructor.

        var methodName = this.method_.name;
        if (methodName == PredefinedName.NEW) {
          methodName = PredefinedName.CONSTRUCTOR;
        }

        // traceur.runtime.superCall(this, class, "name", <args>)
        return createCallCall(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.SUPER_CALL),
            createThisExpression(),
            createIdentifierExpression(this.aggregate_.name),
            createStringLiteral(methodName),
            createArrayLiteralExpression(tree.args.args));
      }

      if (tree.operand.type == ParseTreeType.MEMBER_EXPRESSION &&
          tree.operand.operand.type == ParseTreeType.SUPER_EXPRESSION) {
        // We have: super.member(args)

        var memberExpression = tree.operand;
        this.validateSuperMember_(memberExpression);

        // traceur.runtime.superCall(this, class, "name", <args>)
        return createCallCall(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.SUPER_CALL),
            createThisExpression(),
            createIdentifierExpression(this.aggregate_.name),
            createStringLiteral(memberExpression.memberName.value),
            createArrayLiteralExpression(tree.args.args));
      }

      return proto.transformCallExpression.call(this, tree);
    },

    /**
     * @param {MemberExpression} tree
     * @return {ParseTree}
     */
    transformMemberExpression: function(tree) {
      switch (tree.operand.type) {
        case ParseTreeType.SUPER_EXPRESSION:
          this.validateSuperMember_(tree);
          // traceur.runtime.superGet(this, class, "name")
          return createCallCall(
              createMemberExpression(
                  PredefinedName.TRACEUR,
                  PredefinedName.RUNTIME,
                  PredefinedName.SUPER_GET),
              createThisExpression(),
              createIdentifierExpression(this.aggregate_.name),
              createStringLiteral(tree.memberName.value));
        case ParseTreeType.CLASS_EXPRESSION:
          var classSymbol = this.getClassExpression_(tree.operand);
          if (classSymbol == null) {
            return null;
          }
          var memberName = tree.memberName.value;
          var member = classSymbol.getStaticMember(memberName);
          if (member == null) {
            this.reportError_(tree, 'Class "%s" does not contain a member named "%s"', classSymbol.name, memberName);
            return null;
          }
          return proto.transformMemberExpression.call(this, tree);
        default:
          return proto.transformMemberExpression.call(this, tree);
      }
    },

    /** @param {MemberExpression} tree */
    validateSuperMember_: function(memberExpression) {
      if (this.aggregate_ == null) {
        this.reportError_(memberExpression.operand, '"super" expression not allowed outside a class declaration');
      }
      if (this.aggregate_.type != SymbolType.CLASS) {
        this.reportError_(memberExpression.operand, '"super" expressions may only be used inside class members.');
      }
    },

    /**
     * @param {SuperExpression} tree
     * @return {ParseTree}
     */
    transformSuperExpression: function(tree) {
      // TODO: super.property = ...;
      // TODO: super.property op= ...;
      this.reportError_(tree, '"super" may only be used on the LHS of a member access expression before a call (TODO wording)');
      return tree;
    },

    /**
     * @param {ClassExpression} tree
     * @return {ParseTree}
     */
    transformClassExpression: function(tree) {
      var classSymbol = this.getClassExpression_(tree);
      if (classSymbol == null) {
        return null;
      }
      return createIdentifierExpression(classSymbol.name);
    },

    /**
     * @param {ClassExpression } tree
     * @return {ClassSymbol}
     */
    getClassExpression_: function(tree) {
      if (this.aggregate_ == null || this.aggregate_.type != SymbolType.CLASS) {
        this.reportError_(tree, 'Cannot use "class" primary expressions outside of a class declaration.');
        return null;
      }
      return this.aggregate_;
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
    FunctionTransformer: FunctionTransformer
  };
});
