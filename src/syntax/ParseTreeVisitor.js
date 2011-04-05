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

traceur.define('syntax', function() {
  'use strict';
  
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  /**
   * A base class for traversing a ParseTree in top down (pre-Order) traversal.
   *
   * A node is visited before its children. Derived classes may (but are not obligated) to
   * override the specific visit(XTree) methods to add custom processing for specific ParseTree
   * types. An override of a visit(XTree) method is responsible for visiting its children.
   */
  function ParseTreeVisitor() {
  }

  ParseTreeVisitor.prototype = {
    /**
     * @param {traceur.syntax.trees.ParseTree} tree
     */
    visitAny: function(tree) {
      if (tree === null) {
        return;
      }
      switch (tree.type) {
        case ParseTreeType.ARGUMENT_LIST: this.visitArgumentList(tree.asArgumentList()); break;
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION: this.visitArrayLiteralExpression(tree.asArrayLiteralExpression()); break;
        case ParseTreeType.ARRAY_PATTERN: this.visitArrayPattern(tree.asArrayPattern()); break;
        case ParseTreeType.ASYNC_STATEMENT: this.visitAsyncStatement(tree.asAsyncStatement()); break;
        case ParseTreeType.BINARY_OPERATOR: this.visitBinaryOperator(tree.asBinaryOperator()); break;
        case ParseTreeType.BLOCK: this.visitBlock(tree.asBlock()); break;
        case ParseTreeType.BREAK_STATEMENT: this.visitBreakStatement(tree.asBreakStatement()); break;
        case ParseTreeType.CALL_EXPRESSION: this.visitCallExpression(tree.asCallExpression()); break;
        case ParseTreeType.CASE_CLAUSE: this.visitCaseClause(tree.asCaseClause()); break;
        case ParseTreeType.CATCH: this.visitCatch(tree.asCatch()); break;
        case ParseTreeType.CLASS_DECLARATION: this.visitClassDeclaration(tree.asClassDeclaration()); break;
        case ParseTreeType.CLASS_EXPRESSION: this.visitClassExpression(tree.asClassExpression()); break;
        case ParseTreeType.COMMA_EXPRESSION: this.visitCommaExpression(tree.asCommaExpression()); break;
        case ParseTreeType.CONDITIONAL_EXPRESSION: this.visitConditionalExpression(tree.asConditionalExpression()); break;
        case ParseTreeType.CONTINUE_STATEMENT: this.visitContinueStatement(tree.asContinueStatement()); break;
        case ParseTreeType.DEBUGGER_STATEMENT: this.visitDebuggerStatement(tree.asDebuggerStatement()); break;
        case ParseTreeType.DEFAULT_CLAUSE: this.visitDefaultClause(tree.asDefaultClause()); break;
        case ParseTreeType.DEFAULT_PARAMETER: this.visitDefaultParameter(tree.asDefaultParameter()); break;
        case ParseTreeType.DO_WHILE_STATEMENT: this.visitDoWhileStatement(tree.asDoWhileStatement()); break;
        case ParseTreeType.EMPTY_STATEMENT: this.visitEmptyStatement(tree.asEmptyStatement()); break;
        case ParseTreeType.EXPORT_DECLARATION: this.visitExportDeclaration(tree.asExportDeclaration()); break;
        case ParseTreeType.EXPRESSION_STATEMENT: this.visitExpressionStatement(tree.asExpressionStatement()); break;
        case ParseTreeType.FIELD_DECLARATION: this.visitFieldDeclaration(tree.asFieldDeclaration()); break;
        case ParseTreeType.FINALLY: this.visitFinally(tree.asFinally()); break;
        case ParseTreeType.FOR_EACH_STATEMENT: this.visitForEachStatement(tree.asForEachStatement()); break;
        case ParseTreeType.FOR_IN_STATEMENT: this.visitForInStatement(tree.asForInStatement()); break;
        case ParseTreeType.FOR_STATEMENT: this.visitForStatement(tree.asForStatement()); break;
        case ParseTreeType.FORMAL_PARAMETER_LIST: this.visitFormalParameterList(tree.asFormalParameterList()); break;
        case ParseTreeType.FUNCTION_DECLARATION: this.visitFunctionDeclaration(tree.asFunctionDeclaration()); break;
        case ParseTreeType.GET_ACCESSOR: this.visitGetAccessor(tree.asGetAccessor()); break;
        case ParseTreeType.IDENTIFIER_EXPRESSION: this.visitIdentifierExpression(tree.asIdentifierExpression()); break;
        case ParseTreeType.IF_STATEMENT: this.visitIfStatement(tree.asIfStatement()); break;
        case ParseTreeType.IMPORT_DECLARATION: this.visitImportDeclaration(tree.asImportDeclaration()); break;
        case ParseTreeType.IMPORT_PATH: this.visitImportPath(tree.asImportPath()); break;
        case ParseTreeType.IMPORT_SPECIFIER: this.visitImportSpecifier(tree.asImportSpecifier()); break;
        case ParseTreeType.LABELLED_STATEMENT: this.visitLabelledStatement(tree.asLabelledStatement()); break;
        case ParseTreeType.LITERAL_EXPRESSION: this.visitLiteralExpression(tree.asLiteralExpression()); break;
        case ParseTreeType.MEMBER_EXPRESSION: this.visitMemberExpression(tree.asMemberExpression()); break;
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION: this.visitMemberLookupExpression(tree.asMemberLookupExpression()); break;
        case ParseTreeType.MISSING_PRIMARY_EXPRESSION: this.visitMissingPrimaryExpression(tree.asMissingPrimaryExpression()); break;
        case ParseTreeType.MIXIN: this.visitMixin(tree.asMixin()); break;
        case ParseTreeType.MIXIN_RESOLVE: this.visitMixinResolve(tree.asMixinResolve()); break;
        case ParseTreeType.MIXIN_RESOLVE_LIST: this.visitMixinResolveList(tree.asMixinResolveList()); break;
        case ParseTreeType.MODULE_DEFINITION: this.visitModuleDefinition(tree.asModuleDefinition()); break;
        case ParseTreeType.NEW_EXPRESSION: this.visitNewExpression(tree.asNewExpression()); break;
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION: this.visitObjectLiteralExpression(tree.asObjectLiteralExpression()); break;
        case ParseTreeType.OBJECT_PATTERN: this.visitObjectPattern(tree.asObjectPattern()); break;
        case ParseTreeType.OBJECT_PATTERN_FIELD: this.visitObjectPatternField(tree.asObjectPatternField()); break;
        case ParseTreeType.PAREN_EXPRESSION: this.visitParenExpression(tree.asParenExpression()); break;
        case ParseTreeType.POSTFIX_EXPRESSION: this.visitPostfixExpression(tree.asPostfixExpression()); break;
        case ParseTreeType.PROGRAM: this.visitProgram(tree.asProgram()); break;
        case ParseTreeType.PROPERTY_NAME_ASSIGNMENT: this.visitPropertyNameAssignment(tree.asPropertyNameAssignment()); break;
        case ParseTreeType.REQUIRES_MEMBER: this.visitRequiresMember(tree.asRequiresMember()); break;
        case ParseTreeType.REST_PARAMETER: this.visitRestParameter(tree.asRestParameter()); break;
        case ParseTreeType.RETURN_STATEMENT: this.visitReturnStatement(tree.asReturnStatement()); break;
        case ParseTreeType.SET_ACCESSOR: this.visitSetAccessor(tree.asSetAccessor()); break;
        case ParseTreeType.SPREAD_EXPRESSION: this.visitSpreadExpression(tree.asSpreadExpression()); break;
        case ParseTreeType.SPREAD_PATTERN_ELEMENT: this.visitSpreadPatternElement(tree.asSpreadPatternElement()); break;
        case ParseTreeType.STATE_MACHINE: this.visitStateMachine(tree.asStateMachine()); break;
        case ParseTreeType.SUPER_EXPRESSION: this.visitSuperExpression(tree.asSuperExpression()); break;
        case ParseTreeType.SWITCH_STATEMENT: this.visitSwitchStatement(tree.asSwitchStatement()); break;
        case ParseTreeType.THIS_EXPRESSION: this.visitThisExpression(tree.asThisExpression()); break;
        case ParseTreeType.THROW_STATEMENT: this.visitThrowStatement(tree.asThrowStatement()); break;
        case ParseTreeType.TRAIT_DECLARATION: this.visitTraitDeclaration(tree.asTraitDeclaration()); break;
        case ParseTreeType.TRY_STATEMENT: this.visitTryStatement(tree.asTryStatement()); break;
        case ParseTreeType.UNARY_EXPRESSION: this.visitUnaryExpression(tree.asUnaryExpression()); break;
        case ParseTreeType.VARIABLE_DECLARATION: this.visitVariableDeclaration(tree.asVariableDeclaration()); break;
        case ParseTreeType.VARIABLE_DECLARATION_LIST: this.visitVariableDeclarationList(tree.asVariableDeclarationList()); break;
        case ParseTreeType.VARIABLE_STATEMENT: this.visitVariableStatement(tree.asVariableStatement()); break;
        case ParseTreeType.WHILE_STATEMENT: this.visitWhileStatement(tree.asWhileStatement()); break;
        case ParseTreeType.WITH_STATEMENT: this.visitWithStatement(tree.asWithStatement()); break;
        case ParseTreeType.YIELD_STATEMENT: this.visitYieldStatement(tree.asYieldStatement()); break;
        case ParseTreeType.NULL: this.visitNull(tree.asNull()); break;
        default:
          throw {};
      }
    },

    /**
     * @param {traceur.syntax.trees.ParseTree} tree
     */
    visit: function(tree) {
      this.visitAny(tree);
    },

    /**
     * @param {Array} list
     */
    visitList: function(list) {
      for (var i = 0; i < list.length; i++) {
        this.visitAny(list[i]);
      }
    },

    /**
     * @param {traceur.syntax.trees.ArgumentListTree} tree
     */
    visitArgumentListTree: function(tree) {
      this.visitList(tree.arguments);
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpressionTree} tree
     */
    visitArrayLiteralExpressionTree: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ArrayPatternTree} tree
     */
    visitArrayPatternTree: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.AsyncStatementTree} tree
     */
    visitAsyncStatementTree: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperatorTree} tree
     */
    visitBinaryOperatorTree: function(tree) {
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.BlockTree} tree
     */
    visitBlockTree: function(tree) {
      this.visitList(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.BreakStatementTree} tree
     */
    visitBreakStatementTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.CallExpressionTree} tree
     */
    visitCallExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.arguments);
    },

    /**
     * @param {traceur.syntax.trees.CaseClauseTree} tree
     */
    visitCaseClauseTree: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.CatchTree} tree
     */
    visitCatchTree: function(tree) {
      this.visitAny(tree.catchBody);
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclarationTree} tree
     */
    visitClassDeclarationTree: function(tree) {
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ClassExpressionTree} tree
     */
    visitClassExpressionTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.CommaExpressionTree} tree
     */
    visitCommaExpressionTree: function(tree) {
      this.visitList(tree.expressions);
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpressionTree} tree
     */
    visitConditionalExpressionTree: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.ContinueStatementTree} tree
     */
    visitContinueStatementTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.DebuggerStatementTree} tree
     */
    visitDebuggerStatementTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.DefaultClauseTree} tree
     */
    visitDefaultClauseTree: function(tree) {
      this.visitList(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.DefaultParameterTree} tree
     */
    visitDefaultParameterTree: function(tree) {
      this.visitAny(tree.identifier);
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatementTree} tree
     */
    visitDoWhileStatementTree: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.condition);
    },

    /**
     * @param {traceur.syntax.trees.EmptyStatementTree} tree
     */
    visitEmptyStatementTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ExportDeclarationTree} tree
     */
    visitExportDeclarationTree: function(tree) {
      this.visitAny(tree.declaration);
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatementTree} tree
     */
    visitExpressionStatementTree: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclarationTree} tree
     */
    visitFieldDeclarationTree: function(tree) {
      this.visitList(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.FinallyTree} tree
     */
    visitFinallyTree: function(tree) {
      this.visitAny(tree.block);
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatementTree} tree
     */
    visitForEachStatementTree: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.ForInStatementTree} tree
     */
    visitForInStatementTree: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.ForStatementTree} tree
     */
    visitForStatementTree: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.condition);
      this.visitAny(tree.increment);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterListTree} tree
     */
    visitFormalParameterListTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.FunctionDeclarationTree} tree
     */
    visitFunctionDeclarationTree: function(tree) {
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.functionBody);
    },

    /**
     * @param {traceur.syntax.trees.GetAccessorTree} tree
     */
    visitGetAccessorTree: function(tree) {
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.IdentifierExpressionTree} tree
     */
    visitIdentifierExpressionTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.IfStatementTree} tree
     */
    visitIfStatementTree: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.ifClause);
      this.visitAny(tree.elseClause);
    },

    /**
     * @param {traceur.syntax.trees.ImportDeclarationTree} tree
     */
    visitImportDeclarationTree: function(tree) {
      this.visitList(tree.importPathList);
    },

    /**
     * @param {traceur.syntax.trees.ImportPathTree} tree
     */
    visitImportPathTree: function(tree) {
      if (tree.importSpecifierSet !== null) {
        this.visitList(tree.importSpecifierSet);
      }
    },

    /**
     * @param {traceur.syntax.trees.ImportSpecifierTree} tree
     */
    visitImportSpecifierTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.LabelledStatementTree} tree
     */
    visitLabelledStatementTree: function(tree) {
      this.visitAny(tree.statement);
    },

    /**
     * @param {traceur.syntax.trees.LiteralExpressionTree} tree
     */
    visitLiteralExpressionTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.MemberExpressionTree} tree
     */
    visitMemberExpressionTree: function(tree) {
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpressionTree} tree
     */
    visitMemberLookupExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.memberExpression);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpressionTree} tree
     */
    visitMissingPrimaryExpressionTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.MixinTree} tree
     */
    visitMixinTree: function(tree) {
      this.visitAny(tree.mixinResolves);
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveTree} tree
     */
    visitMixinResolveTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveListTree} tree
     */
    visitMixinResolveListTree: function(tree) {
      this.visitList(tree.resolves);
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinitionTree} tree
     */
    visitModuleDefinitionTree: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.NewExpressionTree} tree
     */
    visitNewExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.arguments);
    },

    /**
     * @param {traceur.syntax.trees.NullTree} tree
     */
    visitNullTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpressionTree} tree
     */
    visitObjectLiteralExpressionTree: function(tree) {
      this.visitList(tree.propertyNameAndValues);
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternTree} tree
     */
    visitObjectPatternTree: function(tree) {
      this.visitList(tree.fields);
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternFieldTree} tree
     */
    visitObjectPatternFieldTree: function(tree) {
      this.visitAny(tree.element);
    },

    /**
     * @param {traceur.syntax.trees.ParenExpressionTree} tree
     */
    visitParenExpressionTree: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpressionTree} tree
     */
    visitPostfixExpressionTree: function(tree) {
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.ProgramTree} tree
     */
    visitProgramTree: function(tree) {
      this.visitList(tree.sourceElements);
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignmentTree} tree
     */
    visitPropertyNameAssignmentTree: function(tree) {
      this.visitAny(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.RequiresMemberTree} tree
     */
    visitRequiresMemberTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.RestParameterTree} tree
     */
    visitRestParameterTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatementTree} tree
     */
    visitReturnStatementTree: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.SetAccessorTree} tree
     */
    visitSetAccessorTree: function(tree) {
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.SpreadExpressionTree} tree
     */
    visitSpreadExpressionTree: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.SpreadPatternElementTree} tree
     */
    visitSpreadPatternElementTree: function(tree) {
      this.visitAny(tree.lvalue);
    },

    /**
     * @param {traceur.syntax.trees.StateMachineTree} tree
     */
    visitStateMachineTree: function(tree) {
      throw {}; // State machines should not live outside of the GeneratorTransformer.
    },

    /**
     * @param {traceur.syntax.trees.SuperExpressionTree} tree
     */
    visitSuperExpressionTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.SwitchStatementTree} tree
     */
    visitSwitchStatementTree: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.caseClauses);
    },

    /**
     * @param {traceur.syntax.trees.ThisExpressionTree} tree
     */
    visitThisExpressionTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ThrowStatementTree} tree
     */
    visitThrowStatementTree: function(tree) {
      this.visitAny(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.TraitDeclarationTree} tree
     */
    visitTraitDeclarationTree: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.TryStatementTree} tree
     */
    visitTryStatementTree: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },

    /**
     * @param {traceur.syntax.trees.UnaryExpressionTree} tree
     */
    visitUnaryExpressionTree: function(tree) {
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclarationTree} tree
     */
    visitVariableDeclarationTree: function(tree) {
      this.visitAny(tree.lvalue);
      this.visitAny(tree.initializer);
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclarationListTree} tree
     */
    visitVariableDeclarationListTree: function(tree) {
      this.visitList(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.VariableStatementTree} tree
     */
    visitVariableStatementTree: function(tree) {
      this.visitAny(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.WhileStatementTree} tree
     */
    visitWhileStatementTree: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.WithStatementTree} tree
     */
    visitWithStatementTree: function(tree) {
      this.visitAny(tree.expression);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.YieldStatementTree} tree
     */
    visitYieldStatementTree: function(tree) {
      this.visitAny(tree.expression);
    }
  }

  // Export
  return {
    ParseTreeVisitor: ParseTreeVisitor
  };
});
