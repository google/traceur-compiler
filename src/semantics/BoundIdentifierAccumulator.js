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
  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var TokenType = traceur.syntax.TokenType;
  var BlockTree = traceur.syntax.trees.BlockTree;
  var CatchTree = traceur.syntax.trees.CatchTree;
  var ForInStatementTree = traceur.syntax.trees.ForInStatementTree;
  var ForStatementTree = traceur.syntax.trees.ForStatementTree;
  var FunctionDeclarationTree = traceur.syntax.trees.FunctionDeclarationTree;
  var ObjectPatternFieldTree = traceur.syntax.trees.ObjectPatternFieldTree;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var VariableDeclarationListTree = traceur.syntax.trees.VariableDeclarationListTree;
  var VariableDeclarationTree = traceur.syntax.trees.VariableDeclarationTree;

  /**
   * Finds the identifiers that are bound in a given scope. Identifiers
   * can be bound by function declarations, formal parameter lists,
   * variable declarations, and catch headers.
   * @param {boolean} inFunctionScope
   * @param {BlockTree=} scope
   * @extends {ParseTreeVisitor}
   * @constructor
   */
  function BoundIdentifierAccumulator(includeFunctionScope, scope) {
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
   * @param {BlockTree} tree
   * @param {boolean=} includeFunctionScope
   * @returns {Object}
   */
  BoundIdentifierAccumulator.boundIdentifiersInBlock = function(tree,
        includeFunctionScope) {
    var accumulator = new BoundIdentifierAccumulator(includeFunctionScope, tree);
    accumulator.visitAny(tree);
    return accumulator.identifiers_;
  };

  /**
   * Gets the identifiers bound in {@code tree}. The tree is treated
   * in an expression/statement context. This means if {@code tree}
   * is:
   *
   * <pre>
   * function f(x) { var y; }
   * </pre>
   *
   * Then only {@code "f"} is bound; {@code "x"} and {@code "y"} are
   * bound in the separate lexical scope of {@code f}.
   * 
   * @param {ParseTree} tree
   * @returns {Object}
   */
  BoundIdentifierAccumulator.boundIdentifiersInExpression = function(tree) {
    var accumulator = new BoundIdentifierAccumulator(false);
    accumulator.visitAny(tree);
    return accumulator.identifiers_;
  };
  
  /**
   * Gets the identifiers bound in the context of a function,
   * {@code tree}. For example, if {@code tree} is:
   *
   * <pre>
   * function f(x) { var y; f(); }
   * </pre>
   *
   * Then a set containing only {@code "x"} and {@code "y"} is
   * returned. Note that we treat {@code "f"} as free in the body of
   * {@code f}, even though it is trivially resolved from the
   * enclosing scope.
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
   * Reports {@code "g"} as being bound, because the function
   * declaration is hoisted to the scope of {@code f}. {@code "x"} is
   * only bound in the scope of the catch block; {@code "y"} is only
   * bound in the scope of {@code g}.
   *
   * <p>{@code "arguments"} is only reported as bound if it is
   * explicitly bound in the function. If it is not explicitly bound,
   * {@code "arguments"} is implicitly bound during function
   * invocation.
   *
   * @param {FunctionDeclarationTree} tree
   * @returns {Object}
   */
  BoundIdentifierAccumulator.boundIdentifiersInFunction = function(tree) {
    var accumulator = new BoundIdentifierAccumulator(false, tree.functionBody);
    accumulator.accumulateBoundIdentifiersInFunction_(tree);
    return accumulator.identifiers_;
  };  

  /**
   * Gets the identifier <em>additionally</em> bound in the context of
   * a {@code catch} block. Because variable and function declarations
   * are hoisted to their enclosing function scope, only the exception
   * being bound is additionally bound in the context of a catch
   * block.
   *
   * @param {Object} tree
   * @returns {Object}
   */
  BoundIdentifierAccumulator.boundIdentifiersInCatch = function(tree) {
    var result = Object.create(null);
    result[tree.exceptionName.value] = true;
    return result;
  }
  
  var proto = ParseTreeVisitor.prototype;
  BoundIdentifierAccumulator.prototype = {
    __proto__: proto,
    
    /** @param {FunctionDeclarationTree} tree */
    accumulateBoundIdentifiersInFunction_: function(tree) {
      var parameters = tree.formalParameterList.parameters;
      for (var i = 0; i < parameters.length; i++) {
        this.bindParameter_(parameters[i]);
      }
      this.visitAny(tree.functionBody);
    },
      
    /** @param {BlockTree} tree */
    visitBlockTree: function(tree) {
      // Save and set current block
      var parentBlock = this.block_;
      this.block_ = tree;
  
      // visit the statements
      proto.visitBlockTree.call(this, tree);
  
      // restore current block
      this.block_ = parentBlock;
    },
  
    /** @param {ForInStatementTree} tree */
    visitForInStatementTree: function(tree) {
      if (tree.initializer != null &&
          tree.initializer.type == ParseTreeType.VARIABLE_DECLARATION_LIST) {
        this.visitForDeclarations_(tree.initializer.asVariableDeclarationList());
      } else {
        this.visitAny(tree.initializer);
      }
  
      // visit the rest of the for..in statement
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },
  
    /** @param {ForStatementTree} tree */
    visitForStatementTree: function(tree) {
      if (tree.initializer != null &&
          tree.initializer.type == ParseTreeType.VARIABLE_DECLARATION_LIST) {
        this.visitForDeclarations_(tree.initializer.asVariableDeclarationList());
      } else {
        this.visitAny(tree.initializer);
      }
  
      // visit the rest of the for statement
      this.visitAny(tree.condition);
      this.visitAny(tree.increment);
      this.visitAny(tree.body);
    },
  
    /** @param {VariableDeclarationListTree} declarations */
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
  
    /** @param {FunctionDeclarationTree} tree */
    visitFunctionDeclarationTree: function(tree) {
      // functions follow the binding rules of 'let'
      if (tree.name != null && this.block_ == this.scope_) {
        this.bind_(tree.name);
      }
      // We don't recurse into function bodies, because they create
      // their own lexical scope.
    },
  
    /** @param {VariableDeclarationListTree} tree */
    visitVariableDeclarationListTree: function(tree) {
      // "var" variables are bound if we are scanning the whole function only
      // "let/const" are bound if (we are scanning block scope or function) AND
      //   the scope currently processed is the scope we care about
      //   (either the block scope being scanned or the top level function scope)
      if ((tree.declarationType == TokenType.VAR && this.includeFunctionScope_) ||
          (tree.declarationType != TokenType.VAR && this.block_ == this.scope_)) {
        // declare the variables
        proto.visitVariableDeclarationListTree.call(this, tree);
      } else {
        // skipping let/const declarations in nested blocks
        var decls = tree.declarations;
        for (var i = 0; i < decls.length; i++) {
          this.visitAny(decls[i].initializer);
        }        
      }
    },
  
    /** @param {VariableDeclarationTree} tree */
    visitVariableDeclarationTree: function(tree) {
      this.bindVariableDeclaration_(tree.lvalue);
      proto.visitVariableDeclarationTree.call(this, tree);
    },
  
    /** @param {IdentifierToken} identifier */
    bind_: function(identifier) {
      this.identifiers_[identifier.value] = true;
    },
  
    /** @param {ParseTree} parameter */
    bindParameter_: function(parameter) {
      if (parameter.isRestParameter()) {
        this.bind_(parameter.asRestParameter().identifier);
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
          this.bind_(tree.asIdentifierExpression().identifierToken);
          break;
  
        case ParseTreeType.ARRAY_PATTERN:
          var i = tree.asArrayPattern().elements;
          for (var i = 0; i < elements.length; i++) {
            this.bindVariableDeclaration_(elements[i]);
          }
          break;
  
        case ParseTreeType.SPREAD_PATTERN_ELEMENT:
          this.bindVariableDeclaration_(tree.asSpreadPatternElement().lvalue);
          break;
  
        case ParseTreeType.OBJECT_PATTERN:
          var fields = tree.asObjectPattern().fields;
          for (var i = 0; i < fields.length; i++) {
            this.bindVariableDeclaration_(fields[i]);
          }
          break;
  
        case ParseTreeType.OBJECT_PATTERN_FIELD:
          var field = tree.asObjectPatternField();
          if (field.element == null) {
            this.bind_(field.identifier);
          } else {
            this.bindVariableDeclaration_(field.element);
          }
          break;
  
        case ParseTreeType.PAREN_EXPRESSION:
          this.bindVariableDeclaration_(tree.asParenExpression().expression);
          break;
  
        default:
          throw new Error('unreachable');
      }
    }    
  };

  return {
    BoundIdentifierAccumulator: BoundIdentifierAccumulator
  };
});