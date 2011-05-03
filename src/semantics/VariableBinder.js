// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('semantics', function() {
  'use strict';

  var IdentifierToken = traceur.syntax.IdentifierToken;
  var ParseTreeType = traceur.syntax.ParseTreeType;
  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var TokenType = traceur.syntax.TokenType;
  var Block = traceur.syntax.trees.Block;
  var Catch = traceur.syntax.trees.Catch;
  var ForInStatement = traceur.syntax.trees.ForInStatement;
  var ForStatement = traceur.syntax.trees.ForStatement;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var ObjectPatternField = traceur.syntax.trees.ObjectPatternField;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;

  /**
   * Finds the identifiers that are bound in a given scope. Identifiers
   * can be bound by function declarations, formal parameter lists,
   * variable declarations, and catch headers.
   * @param {boolean} inFunctionScope
   * @param {Block=} scope
   * @extends {ParseTreeVisitor}
   * @constructor
   */
  function VariableBinder(includeFunctionScope, scope) {
    ParseTreeVisitor.call(this);

    // Should we include:
    // * all "var" declarations
    // * all block scoped declarations occurring in the top level function block.
    this.includeFunctionScope_ = includeFunctionScope;

    // Block within which we are looking for declarations:
    // * block scoped declaration occurring in this block.
    // If function != null this refers to the top level function block.
    this.scope_ = scope || null;

    // Block currently being processed
    this.block_ = null;

    this.identifiers_ = Object.create(null);
  }

  // TODO: Add entry more entry points:
  //    for..in statment
  //    for statement

  /**
   * Gets the identifiers bound in {@code tree}. The tree should be a block
   * statement. This means if {@code tree} is:
   *
   * <pre>
   * { function f(x) { var y; } }
   * </pre>
   *
   * Then only {@code "f"} is bound; {@code "x"} and {@code "y"} are bound in
   * the separate lexical scope of {@code f}. Note that only const/let bound
   * variables (such as {@code "f"} in this example) are returned. Variables
   * declared with "var" are only returned when {@code includeFunctionScope} is
   * set to true.
   *
   * If {@code tree} was instead:
   * <pre>
   * { var z = function f(x) { var y; }; }
   * </pre>
   *
   * Then only {@code "z"} is bound
   *
   * @param {Block} tree
   * @param {boolean=} includeFunctionScope
   * @return {Object}
   */
  VariableBinder.variablesInBlock = function(tree,
      includeFunctionScope) {
    var binder = new VariableBinder(includeFunctionScope, tree);
    binder.visitAny(tree);
    return binder.identifiers_;
  };

  /**
   * Gets the identifiers bound in the context of a function,
   * {@code tree}, other than the function name itself. For example, if
   * {@code tree} is:
   *
   * <pre>
   * function f(x) { var y; f(); }
   * </pre>
   *
   * Then a set containing only {@code "x"} and {@code "y"} is returned. Note
   * that we treat {@code "f"} as free in the body of {@code f}, because
   * AlphaRenamer uses this fact to determine if the function name is shadowed
   * by another name in the body of the function.
   *
   * <p>Only identifiers that are bound <em>throughout</em> the
   * specified tree are returned, for example:
   *
   * <pre>
   * function f() {
   *   try {
   *   } catch (x) {
   *     function g(y) { }
   *   }
   * }
   * </pre>
   *
   * Reports nothing as being bound, because {@code "x"} is only bound in the
   * scope of the catch block; {@code "g"} is let bound to the catch block, and
   * {@code "y"} is only bound in the scope of {@code g}.
   *
   * <p>{@code "arguments"} is only reported as bound if it is
   * explicitly bound in the function. If it is not explicitly bound,
   * {@code "arguments"} is implicitly bound during function
   * invocation.
   *
   * @param {FunctionDeclaration} tree
   * @return {Object}
   */
  VariableBinder.variablesInFunction = function(tree) {
    var binder = new VariableBinder(true, tree.functionBody);
    binder.bindVariablesInFunction_(tree);
    return binder.identifiers_;
  };

  var proto = ParseTreeVisitor.prototype;
  VariableBinder.prototype = {
    __proto__: proto,

    /** @param {FunctionDeclaration} tree */
    bindVariablesInFunction_: function(tree) {
      var parameters = tree.formalParameterList.parameters;
      for (var i = 0; i < parameters.length; i++) {
        this.bindParameter_(parameters[i]);
      }
      this.visitAny(tree.functionBody);
    },

    /** @param {Block} tree */
    visitBlock: function(tree) {
      // Save and set current block
      var parentBlock = this.block_;
      this.block_ = tree;

      // visit the statements
      tree.statements.forEach(function(s) {
        if (s.type == ParseTreeType.FUNCTION_DECLARATION) {
          this.bindFunctionDeclaration_(s);
        } else {
          this.visitAny(s);
        }
      }, this);

      // restore current block
      this.block_ = parentBlock;
    },

    /** @param {FunctionDeclaration} tree */
    bindFunctionDeclaration_: function(tree) {
      // functions follow the binding rules of 'let'
      if (tree.name != null && this.block_ == this.scope_) {
        this.bind_(tree.name);
      }
      // We don't recurse into function bodies, because they create
      // their own lexical scope.
    },

    /** @param {FunctionDeclaration} tree */
    visitFunctionDeclaration: function(tree) {
      // We don't recurse into function bodies, because they create
      // their own lexical scope.
    },

    /** @param {ForEachStatement} tree */
    visitForEachStatement: function(tree) {
      throw new Error('foreach statements should be transformed before this pass');
    },

    /** @param {ForInStatement} tree */
    visitForInStatement: function(tree) {
      if (tree.initializer != null &&
          tree.initializer.type == ParseTreeType.VARIABLE_DECLARATION_LIST) {
        this.visitForDeclarations_(tree.initializer);
      } else {
        this.visitAny(tree.initializer);
      }

      // visit the rest of the for..in statement
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },

    /** @param {ForStatement} tree */
    visitForStatement: function(tree) {
      if (tree.initializer != null &&
          tree.initializer.type == ParseTreeType.VARIABLE_DECLARATION_LIST) {
        this.visitForDeclarations_(tree.initializer);
      } else {
        this.visitAny(tree.initializer);
      }

      // visit the rest of the for statement
      this.visitAny(tree.condition);
      this.visitAny(tree.increment);
      this.visitAny(tree.body);
    },

    /** @param {VariableDeclarationList} declarations */
    visitForDeclarations_: function(declarations) {
      if (declarations.declarationType == TokenType.VAR) {
        this.visitAny(declarations);
      } else {
        // let and const declare in the nested scope, not the outer scope
        // so we need to bypass them (but walk the initializers)
        var decls = declarations.declarations;
        for (var i = 0; i < decls.length; i++) {
          // skipping lvalue, visit only initializer
          this.visitAny(decls[i].initializer);
        }
      }
    },

    /** @param {VariableDeclarationList} tree */
    visitVariableDeclarationList: function(tree) {
      // "var" variables are bound if we are scanning the whole function only
      // "let/const" are bound if (we are scanning block scope or function) AND
      //   the scope currently processed is the scope we care about
      //   (either the block scope being scanned or the top level function scope)
      if ((tree.declarationType == TokenType.VAR && this.includeFunctionScope_) ||
          (tree.declarationType != TokenType.VAR && this.block_ == this.scope_)) {
        // declare the variables
        proto.visitVariableDeclarationList.call(this, tree);
      } else {
        // skipping let/const declarations in nested blocks
        var decls = tree.declarations;
        for (var i = 0; i < decls.length; i++) {
          this.visitAny(decls[i].initializer);
        }
      }
    },

    /** @param {VariableDeclaration} tree */
    visitVariableDeclaration: function(tree) {
      this.bindVariableDeclaration_(tree.lvalue);
      proto.visitVariableDeclaration.call(this, tree);
    },

    /** @param {IdentifierToken} identifier */
    bind_: function(identifier) {
      this.identifiers_[identifier.value] = true;
    },

    /** @param {ParseTree} parameter */
    bindParameter_: function(parameter) {
      if (parameter.isRestParameter()) {
        this.bind_(parameter.identifier);
      } else {
        // Formal parameters are otherwise like variable
        // declarations--identifier expressions and patterns
        this.bindVariableDeclaration_(parameter);
      }
    },

    /** @param {ParseTree} parameter */
    bindVariableDeclaration_: function(tree) {
      switch (tree.type) {
        case ParseTreeType.IDENTIFIER_EXPRESSION:
          this.bind_(tree.identifierToken);
          break;

        case ParseTreeType.ARRAY_PATTERN:
          var i = tree.elements;
          for (var i = 0; i < elements.length; i++) {
            this.bindVariableDeclaration_(elements[i]);
          }
          break;

        case ParseTreeType.SPREAD_PATTERN_ELEMENT:
          this.bindVariableDeclaration_(tree.lvalue);
          break;

        case ParseTreeType.OBJECT_PATTERN:
          var fields = tree.fields;
          for (var i = 0; i < fields.length; i++) {
            this.bindVariableDeclaration_(fields[i]);
          }
          break;

        case ParseTreeType.OBJECT_PATTERN_FIELD:
          var field = tree;
          if (field.element == null) {
            this.bind_(field.identifier);
          } else {
            this.bindVariableDeclaration_(field.element);
          }
          break;

        case ParseTreeType.PAREN_EXPRESSION:
          this.bindVariableDeclaration_(tree.expression);
          break;

        default:
          throw new Error('unreachable');
      }
    }
  };

  return {
    VariableBinder: VariableBinder
  };
});
