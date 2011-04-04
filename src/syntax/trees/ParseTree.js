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

traceur.define('syntax.trees', function() {
  'use strict';

  var assert = traceur.assert;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  //TODO: var NewExpressionTree = traceur.syntax.trees.NewExpressionTree;
  //TODO: var ParenExpressionTree = traceur.syntax.trees.ParenExpressionTree;
  
  /**
   * An abstract syntax tree for JavaScript parse trees.
   * Immutable.
   * A plain old data structure. Should include data members and simple
   * accessors only.
   *
   * Derived classes should have a 'Tree' suffix. Each concrete derived class
   * should have a ParseTreeType whose name matches the derived class name.
   *
   * A parse tree derived from source should have a non-null location. A parse
   * tree that is synthesized by the compiler may have a null location.
   *
   * When adding a new subclass of ParseTree you must also do the following:
   *   - add a new entry to ParseTreeType
   *   - add ParseTree.asXTree()
   *   - modify ParseTreeVisitor.visit(ParseTree) for new ParseTreeType
   *   - add ParseTreeVisitor.visit(XTree)
   *   - modify ParseTreeTransformer.transform(ParseTree) for new ParseTreeType
   *   - add ParseTreeTransformer.transform(XTree)
   *   - add ParseTreeWriter.visit(XTree)
   *   - add ParseTreeValidator.visit(XTree)
   *
   * @param {traceur.syntax.trees.ParseTreeType} type
   * @param {traceur.util.SourceRange} location
   * @constructor
   */
  function ParseTree(type, location) {
    this.type = type;
    this.location = location;
  }

  ParseTree.prototype = {
    /** @return {traceur.syntax.trees.ArgumentListTree} */    
    asArgumentList: function() {
      assert(this instanceof ArgumentListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ArrayLiteralExpressionTree} */    
    asArrayLiteralExpression: function() {
      assert(this instanceof ArrayLiteralExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ArrayPatternTree} */    
    asArrayPattern: function() {
      assert(this instanceof ArrayPatternTree);
      return this;
    },

    /** @return {traceur.syntax.trees.AsyncStatementTree} */    
    asAsyncStatement: function() {
      assert(this instanceof AsyncStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.BinaryOperatorTree} */    
    asBinaryOperator: function() {
      assert(this instanceof BinaryOperatorTree);
      return this;
    },

    /** @return {traceur.syntax.trees.BlockTree} */    
    asBlock: function() {
      assert(this instanceof BlockTree);
      return this;
    },

    /** @return {traceur.syntax.trees.BreakStatementTree} */    
    asBreakStatement: function() {
      assert(this instanceof BreakStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CallExpressionTree} */    
    asCallExpression: function() {
      assert(this instanceof CallExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CaseClauseTree} */    
    asCaseClause: function() {
      assert(this instanceof CaseClauseTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CatchTree} */    
    asCatch: function() {
      assert(this instanceof CatchTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ClassDeclarationTree} */    
    asClassDeclaration: function() {
      assert(this instanceof ClassDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ClassExpressionTree} */    
    asClassExpression: function() {
      assert(this instanceof ClassExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CommaExpressionTree} */    
    asCommaExpression: function() {
      assert(this instanceof CommaExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ConditionalExpressionTree} */    
    asConditionalExpression: function() {
      assert(this instanceof ConditionalExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ContinueStatementTree} */    
    asContinueStatement: function() {
      assert(this instanceof ContinueStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DebuggerStatementTree} */    
    asDebuggerStatement: function() {
      assert(this instanceof DebuggerStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DefaultClauseTree} */    
    asDefaultClause: function() {
      assert(this instanceof DefaultClauseTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DefaultParameterTree} */    
    asDefaultParameter: function() {
      assert(this instanceof DefaultParameterTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DoWhileStatementTree} */    
    asDoWhileStatement: function() {
      assert(this instanceof DoWhileStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.EmptyStatementTree} */    
    asEmptyStatement: function() {
      assert(this instanceof EmptyStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ExportDeclarationTree} */    
    asExportDeclaration: function() {
      assert(this instanceof ExportDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ExpressionStatementTree} */    
    asExpressionStatement: function() {
      assert(this instanceof ExpressionStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FieldDeclarationTree} */    
    asFieldDeclaration: function() {
      assert(this instanceof FieldDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FinallyTree} */    
    asFinally: function() {
      assert(this instanceof FinallyTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ForEachStatementTree} */    
    asForEachStatement: function() {
      assert(this instanceof ForEachStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ForInStatementTree} */    
    asForInStatement: function() {
      assert(this instanceof ForInStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FormalParameterListTree} */    
    asFormalParameterList: function() {
      assert(this instanceof FormalParameterListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ForStatementTree} */    
    asForStatement: function() {
      assert(this instanceof ForStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FunctionDeclarationTree} */    
    asFunctionDeclaration: function() {
      assert(this instanceof FunctionDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.StateMachineTree} */    
    asStateMachine: function() {
      assert(this instanceof StateMachineTree);
      return this;
    },

    /** @return {traceur.syntax.trees.GetAccessorTree} */    
    asGetAccessor: function() {
      assert(this instanceof GetAccessorTree);
      return this;
    },

    /** @return {traceur.syntax.trees.IdentifierExpressionTree} */    
    asIdentifierExpression: function() {
      assert(this instanceof IdentifierExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.IfStatementTree} */    
    asIfStatement: function() {
      assert(this instanceof IfStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportDeclarationTree} */    
    asImportDeclaration: function() {
      assert(this instanceof ImportDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportPathTree} */    
    asImportPath: function() {
      assert(this instanceof ImportPathTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportSpecifierTree} */    
    asImportSpecifier: function() {
      assert(this instanceof ImportSpecifierTree);
      return this;
    },

    /** @return {traceur.syntax.trees.LabelledStatementTree} */    
    asLabelledStatement: function() {
      assert(this instanceof LabelledStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.LiteralExpressionTree} */    
    asLiteralExpression: function() {
      assert(this instanceof LiteralExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MemberExpressionTree} */    
    asMemberExpression: function() {
      assert(this instanceof MemberExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MemberLookupExpressionTree} */    
    asMemberLookupExpression: function() {
      assert(this instanceof MemberLookupExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MissingPrimaryExpressionTree} */    
    asMissingPrimaryExpression: function() {
      assert(this instanceof MissingPrimaryExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinTree} */    
    asMixin: function() {
      assert(this instanceof MixinTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinResolveTree} */    
    asMixinResolve: function() {
      assert(this instanceof MixinResolveTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinResolveListTree} */    
    asMixinResolveList: function() {
      assert(this instanceof MixinResolveListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleDefinitionTree} */    
    asModuleDefinition: function() {
      assert(this instanceof ModuleDefinitionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.NewExpressionTree} */    
    asNewExpression: function() {
      assert(this instanceof NewExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.NullTree} */    
    asNull: function() {
      assert(this instanceof NullTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectLiteralExpressionTree} */    
    asObjectLiteralExpression: function() {
      assert(this instanceof ObjectLiteralExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectPatternTree} */    
    asObjectPattern: function() {
      assert(this instanceof ObjectPatternTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectPatternFieldTree} */    
    asObjectPatternField: function() {
      assert(this instanceof ObjectPatternFieldTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ParenExpressionTree} */    
    asParenExpression: function() {
      assert(this instanceof ParenExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.PostfixExpressionTree} */    
    asPostfixExpression: function() {
      assert(this instanceof PostfixExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ProgramTree} */    
    asProgram: function() {
      assert(this instanceof ProgramTree);
      return this;
    },

    /** @return {traceur.syntax.trees.PropertyNameAssignmentTree} */    
    asPropertyNameAssignment: function() {
      assert(this instanceof PropertyNameAssignmentTree);
      return this;
    },

    /** @return {traceur.syntax.trees.RequiresMemberTree} */    
    asRequiresMember: function() {
      assert(this instanceof RequiresMemberTree);
      return this;
    },

    /** @return {traceur.syntax.trees.RestParameterTree} */    
    asRestParameter: function() {
      assert(this instanceof RestParameterTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ReturnStatementTree} */    
    asReturnStatement: function() {
      assert(this instanceof ReturnStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SetAccessorTree} */    
    asSetAccessor: function() {
      assert(this instanceof SetAccessorTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SpreadExpressionTree} */    
    asSpreadExpression: function() {
      assert(this instanceof SpreadExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SpreadPatternElementTree} */    
    asSpreadPatternElement: function() {
      assert(this instanceof SpreadPatternElementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SuperExpressionTree} */    
    asSuperExpression: function() {
      assert(this instanceof SuperExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SwitchStatementTree} */    
    asSwitchStatement: function() {
      assert(this instanceof SwitchStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ThisExpressionTree} */    
    asThisExpression: function() {
      assert(this instanceof ThisExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ThrowStatementTree} */    
    asThrowStatement: function() {
      assert(this instanceof ThrowStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.TraitDeclarationTree} */    
    asTraitDeclaration: function() {
      assert(this instanceof TraitDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.TryStatementTree} */    
    asTryStatement: function() {
      assert(this instanceof TryStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.UnaryExpressionTree} */    
    asUnaryExpression: function() {
      assert(this instanceof UnaryExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableDeclarationListTree} */    
    asVariableDeclarationList: function() {
      assert(this instanceof VariableDeclarationListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableDeclarationTree} */    
    asVariableDeclaration: function() {
      assert(this instanceof VariableDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableStatementTree} */    
    asVariableStatement: function() {
      assert(this instanceof VariableStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.WhileStatementTree} */    
    asWhileStatement: function() {
      assert(this instanceof WhileStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.WithStatementTree} */    
    asWithStatement: function() {
      assert(this instanceof WithStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.YieldStatementTree} */    
    asYieldStatement: function() {
      assert(this instanceof YieldStatementTree);
      return this;
    },

  
    /** @return {boolean} */    
    isNull: function() {
      return this.type === ParseTreeType.NULL;
    },

    /** @return {boolean} */    
    isPattern: function() {
      switch (this.type) {
        case ParseTreeType.ARRAY_PATTERN:
        case ParseTreeType.OBJECT_PATTERN:
          return true;
        case ParseTreeType.PAREN_EXPRESSION:
          return this.asParenExpression().expression.isPattern();
        default:
          return false;
      }
    },
        
    /** @return {boolean} */    
    isLeftHandSideExpression: function() {
      switch (this.type) {
        case ParseTreeType.THIS_EXPRESSION:
        case ParseTreeType.CLASS_EXPRESSION:
        case ParseTreeType.SUPER_EXPRESSION:
        case ParseTreeType.IDENTIFIER_EXPRESSION:
        case ParseTreeType.LITERAL_EXPRESSION:
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
        case ParseTreeType.NEW_EXPRESSION:
        case ParseTreeType.MEMBER_EXPRESSION:
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        case ParseTreeType.CALL_EXPRESSION:
        case ParseTreeType.FUNCTION_DECLARATION:
          return true;
        case ParseTreeType.PAREN_EXPRESSION:
          return this.asParenExpression().expression.isLeftHandSideExpression();
        default:
          return false;
      }
    },
  
    // TODO: enable classes and traits
    /** @return {boolean} */    
    isAssignmentExpression: function() {
      switch (this.type) {
        case ParseTreeType.FUNCTION_DECLARATION:
        case ParseTreeType.BINARY_OPERATOR:
        case ParseTreeType.THIS_EXPRESSION:
        case ParseTreeType.IDENTIFIER_EXPRESSION:
        case ParseTreeType.LITERAL_EXPRESSION:
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
        case ParseTreeType.MISSING_PRIMARY_EXPRESSION:
        case ParseTreeType.CONDITIONAL_EXPRESSION:
        case ParseTreeType.UNARY_EXPRESSION:
        case ParseTreeType.POSTFIX_EXPRESSION:
        case ParseTreeType.MEMBER_EXPRESSION:
        case ParseTreeType.NEW_EXPRESSION:
        case ParseTreeType.CALL_EXPRESSION:
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        case ParseTreeType.PAREN_EXPRESSION:
        case ParseTreeType.SUPER_EXPRESSION:
          return true;
        default:
          return false;
      }
    },
  
    // ECMA 262 11.2:
    // MemberExpression :
    //    PrimaryExpression
    //    FunctionExpression
    //    MemberExpression [ Expression ]
    //    MemberExpression . IdentifierName
    //    new MemberExpression Arguments
    /** @return {boolean} */        
    isMemberExpression: function() {
      switch (this.type) {
        // PrimaryExpression
        case ParseTreeType.THIS_EXPRESSION:
        case ParseTreeType.CLASS_EXPRESSION:
        case ParseTreeType.SUPER_EXPRESSION:
        case ParseTreeType.IDENTIFIER_EXPRESSION:
        case ParseTreeType.LITERAL_EXPRESSION:
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
        case ParseTreeType.PAREN_EXPRESSION:
        // FunctionExpression
        case ParseTreeType.FUNCTION_DECLARATION:
        // MemberExpression [ Expression ]
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        // MemberExpression . IdentifierName
        case ParseTreeType.MEMBER_EXPRESSION:
        // CallExpression:
        //   CallExpression . IdentifierName
        case ParseTreeType.CALL_EXPRESSION:
          return true;
  
        // new MemberExpression Arguments
        case ParseTreeType.NEW_EXPRESSION:
          return asNewExpression().arguments != null;
      }
  
      return false;
    },
  
    /** @return {boolean} */    
    isExpression: function() {
      return isAssignmentExpression() ||
        this.type == ParseTreeType.COMMA_EXPRESSION;
    },
  
    /** @return {boolean} */    
    isAssignmentOrSpread: function() {
      return isAssignmentExpression() ||
        this.type == ParseTreeType.SPREAD_EXPRESSION;
    },
  
    /** @return {boolean} */    
    isRestParameter: function() {
      return this.type == ParseTreeType.REST_PARAMETER;
    },
  
    /** @return {boolean} */    
    isSpreadPatternElement: function() {
      return this.type == ParseTreeType.SPREAD_PATTERN_ELEMENT;
    },
  
    /**
     * In V8 any source element may appear where statement appears in the ECMA
     * grammar.
     * @return {boolean}
     */
    isStatement: function() {
      return this.isSourceElement();
    },
  
    /**
     * This function reflects the ECMA standard, or what we would expect to
     * become the ECMA standard. Most places use isStatement instead which
     * reflects where code on the web diverges from the standard.
     * @return {boolean}
     */
    isStatementStandard: function() {
      switch (this.type) {
        case ParseTreeType.BLOCK:
        case ParseTreeType.ASYNC_STATEMENT:
        case ParseTreeType.VARIABLE_STATEMENT:
        case ParseTreeType.EMPTY_STATEMENT:
        case ParseTreeType.EXPRESSION_STATEMENT:
        case ParseTreeType.IF_STATEMENT:
        case ParseTreeType.DO_WHILE_STATEMENT:
        case ParseTreeType.WHILE_STATEMENT:
        case ParseTreeType.FOR_EACH_STATEMENT:
        case ParseTreeType.FOR_IN_STATEMENT:
        case ParseTreeType.FOR_STATEMENT:
        case ParseTreeType.CONTINUE_STATEMENT:
        case ParseTreeType.BREAK_STATEMENT:
        case ParseTreeType.RETURN_STATEMENT:
        case ParseTreeType.YIELD_STATEMENT:
        case ParseTreeType.WITH_STATEMENT:
        case ParseTreeType.SWITCH_STATEMENT:
        case ParseTreeType.LABELLED_STATEMENT:
        case ParseTreeType.THROW_STATEMENT:
        case ParseTreeType.TRY_STATEMENT:
        case ParseTreeType.DEBUGGER_STATEMENT:
          return true;
        default:
          return false;
      }
    },
  
    /** @return {boolean} */    
    isSourceElement: function() {
      return isStatementStandard() || this.type == ParseTreeType.FUNCTION_DECLARATION;
    }
  };

  return {
    ParseTree: ParseTree
  };
});
