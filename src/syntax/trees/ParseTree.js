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
      assert(this instanceof traceur.syntax.trees.ArgumentListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ArrayLiteralExpressionTree} */
    asArrayLiteralExpression: function() {
      assert(this instanceof traceur.syntax.trees.ArrayLiteralExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ArrayPatternTree} */
    asArrayPattern: function() {
      assert(this instanceof traceur.syntax.trees.ArrayPatternTree);
      return this;
    },

    /** @return {traceur.syntax.trees.AsyncStatementTree} */
    asAsyncStatement: function() {
      assert(this instanceof traceur.syntax.trees.AsyncStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.BinaryOperatorTree} */
    asBinaryOperator: function() {
      assert(this instanceof traceur.syntax.trees.BinaryOperatorTree);
      return this;
    },

    /** @return {traceur.syntax.trees.BlockTree} */
    asBlock: function() {
      assert(this instanceof traceur.syntax.trees.BlockTree);
      return this;
    },

    /** @return {traceur.syntax.trees.BreakStatementTree} */
    asBreakStatement: function() {
      assert(this instanceof traceur.syntax.trees.BreakStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CallExpressionTree} */
    asCallExpression: function() {
      assert(this instanceof traceur.syntax.trees.CallExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CaseClauseTree} */
    asCaseClause: function() {
      assert(this instanceof traceur.syntax.trees.CaseClauseTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CatchTree} */
    asCatch: function() {
      assert(this instanceof traceur.syntax.trees.CatchTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ClassDeclarationTree} */
    asClassDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ClassDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ClassExpressionTree} */
    asClassExpression: function() {
      assert(this instanceof traceur.syntax.trees.ClassExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.CommaExpressionTree} */
    asCommaExpression: function() {
      assert(this instanceof traceur.syntax.trees.CommaExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ConditionalExpressionTree} */
    asConditionalExpression: function() {
      assert(this instanceof traceur.syntax.trees.ConditionalExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ContinueStatementTree} */
    asContinueStatement: function() {
      assert(this instanceof traceur.syntax.trees.ContinueStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DebuggerStatementTree} */
    asDebuggerStatement: function() {
      assert(this instanceof traceur.syntax.trees.DebuggerStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DefaultClauseTree} */
    asDefaultClause: function() {
      assert(this instanceof traceur.syntax.trees.DefaultClauseTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DefaultParameterTree} */
    asDefaultParameter: function() {
      assert(this instanceof traceur.syntax.trees.DefaultParameterTree);
      return this;
    },

    /** @return {traceur.syntax.trees.DoWhileStatementTree} */
    asDoWhileStatement: function() {
      assert(this instanceof traceur.syntax.trees.DoWhileStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.EmptyStatementTree} */
    asEmptyStatement: function() {
      assert(this instanceof traceur.syntax.trees.EmptyStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ExportDeclarationTree} */
    asExportDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ExportDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ExpressionStatementTree} */
    asExpressionStatement: function() {
      assert(this instanceof traceur.syntax.trees.ExpressionStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FieldDeclarationTree} */
    asFieldDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.FieldDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FinallyTree} */
    asFinally: function() {
      assert(this instanceof traceur.syntax.trees.FinallyTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ForEachStatementTree} */
    asForEachStatement: function() {
      assert(this instanceof traceur.syntax.trees.ForEachStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ForInStatementTree} */
    asForInStatement: function() {
      assert(this instanceof traceur.syntax.trees.ForInStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FormalParameterListTree} */
    asFormalParameterList: function() {
      assert(this instanceof traceur.syntax.trees.FormalParameterListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ForStatementTree} */
    asForStatement: function() {
      assert(this instanceof traceur.syntax.trees.ForStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.FunctionDeclarationTree} */
    asFunctionDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.FunctionDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.StateMachineTree} */
    asStateMachine: function() {
      assert(this instanceof traceur.syntax.trees.StateMachineTree);
      return this;
    },

    /** @return {traceur.syntax.trees.GetAccessorTree} */
    asGetAccessor: function() {
      assert(this instanceof traceur.syntax.trees.GetAccessorTree);
      return this;
    },

    /** @return {traceur.syntax.trees.IdentifierExpressionTree} */
    asIdentifierExpression: function() {
      assert(this instanceof traceur.syntax.trees.IdentifierExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.IfStatementTree} */
    asIfStatement: function() {
      assert(this instanceof traceur.syntax.trees.IfStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportDeclarationTree} */
    asImportDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ImportDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportPathTree} */
    asImportPath: function() {
      assert(this instanceof traceur.syntax.trees.ImportPathTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportSpecifierTree} */
    asImportSpecifier: function() {
      assert(this instanceof traceur.syntax.trees.ImportSpecifierTree);
      return this;
    },

    /** @return {traceur.syntax.trees.LabelledStatementTree} */
    asLabelledStatement: function() {
      assert(this instanceof traceur.syntax.trees.LabelledStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.LiteralExpressionTree} */
    asLiteralExpression: function() {
      assert(this instanceof traceur.syntax.trees.LiteralExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MemberExpressionTree} */
    asMemberExpression: function() {
      assert(this instanceof traceur.syntax.trees.MemberExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MemberLookupExpressionTree} */
    asMemberLookupExpression: function() {
      assert(this instanceof traceur.syntax.trees.MemberLookupExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MissingPrimaryExpressionTree} */
    asMissingPrimaryExpression: function() {
      assert(this instanceof traceur.syntax.trees.MissingPrimaryExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinTree} */
    asMixin: function() {
      assert(this instanceof traceur.syntax.trees.MixinTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinResolveTree} */
    asMixinResolve: function() {
      assert(this instanceof traceur.syntax.trees.MixinResolveTree);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinResolveListTree} */
    asMixinResolveList: function() {
      assert(this instanceof traceur.syntax.trees.MixinResolveListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleDefinitionTree} */
    asModuleDefinition: function() {
      assert(this instanceof traceur.syntax.trees.ModuleDefinitionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.NewExpressionTree} */
    asNewExpression: function() {
      assert(this instanceof traceur.syntax.trees.NewExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.NullTree} */
    asNull: function() {
      assert(this instanceof traceur.syntax.trees.NullTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectLiteralExpressionTree} */
    asObjectLiteralExpression: function() {
      assert(this instanceof traceur.syntax.trees.ObjectLiteralExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectPatternTree} */
    asObjectPattern: function() {
      assert(this instanceof traceur.syntax.trees.ObjectPatternTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectPatternFieldTree} */
    asObjectPatternField: function() {
      assert(this instanceof traceur.syntax.trees.ObjectPatternFieldTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ParenExpressionTree} */
    asParenExpression: function() {
      assert(this instanceof traceur.syntax.trees.ParenExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.PostfixExpressionTree} */
    asPostfixExpression: function() {
      assert(this instanceof traceur.syntax.trees.PostfixExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ProgramTree} */
    asProgram: function() {
      assert(this instanceof traceur.syntax.trees.ProgramTree);
      return this;
    },

    /** @return {traceur.syntax.trees.PropertyNameAssignmentTree} */
    asPropertyNameAssignment: function() {
      assert(this instanceof traceur.syntax.trees.PropertyNameAssignmentTree);
      return this;
    },

    /** @return {traceur.syntax.trees.RequiresMemberTree} */
    asRequiresMember: function() {
      assert(this instanceof traceur.syntax.trees.RequiresMemberTree);
      return this;
    },

    /** @return {traceur.syntax.trees.RestParameterTree} */
    asRestParameter: function() {
      assert(this instanceof traceur.syntax.trees.RestParameterTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ReturnStatementTree} */
    asReturnStatement: function() {
      assert(this instanceof traceur.syntax.trees.ReturnStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SetAccessorTree} */
    asSetAccessor: function() {
      assert(this instanceof traceur.syntax.trees.SetAccessorTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SpreadExpressionTree} */
    asSpreadExpression: function() {
      assert(this instanceof traceur.syntax.trees.SpreadExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SpreadPatternElementTree} */
    asSpreadPatternElement: function() {
      assert(this instanceof traceur.syntax.trees.SpreadPatternElementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SuperExpressionTree} */
    asSuperExpression: function() {
      assert(this instanceof traceur.syntax.trees.SuperExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.SwitchStatementTree} */
    asSwitchStatement: function() {
      assert(this instanceof traceur.syntax.trees.SwitchStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ThisExpressionTree} */
    asThisExpression: function() {
      assert(this instanceof traceur.syntax.trees.ThisExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ThrowStatementTree} */
    asThrowStatement: function() {
      assert(this instanceof traceur.syntax.trees.ThrowStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.TraitDeclarationTree} */
    asTraitDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.TraitDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.TryStatementTree} */
    asTryStatement: function() {
      assert(this instanceof traceur.syntax.trees.TryStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.UnaryExpressionTree} */
    asUnaryExpression: function() {
      assert(this instanceof traceur.syntax.trees.UnaryExpressionTree);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableDeclarationListTree} */
    asVariableDeclarationList: function() {
      assert(this instanceof traceur.syntax.trees.VariableDeclarationListTree);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableDeclarationTree} */
    asVariableDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.VariableDeclarationTree);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableStatementTree} */
    asVariableStatement: function() {
      assert(this instanceof traceur.syntax.trees.VariableStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.WhileStatementTree} */
    asWhileStatement: function() {
      assert(this instanceof traceur.syntax.trees.WhileStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.WithStatementTree} */
    asWithStatement: function() {
      assert(this instanceof traceur.syntax.trees.WithStatementTree);
      return this;
    },

    /** @return {traceur.syntax.trees.YieldStatementTree} */
    asYieldStatement: function() {
      assert(this instanceof traceur.syntax.trees.YieldStatementTree);
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
      return isStatementStandard() ||
          this.type == ParseTreeType.FUNCTION_DECLARATION;
    }
  };

  return {
    ParseTree: ParseTree
  };
});
