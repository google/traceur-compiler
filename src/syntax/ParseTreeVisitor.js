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
  var getTreeNameForType = traceur.syntax.trees.getTreeNameForType;

  /**
   * A base class for traversing a ParseTree in top down (pre-Order) traversal.
   *
   * A node is visited before its children. Derived classes may (but are not
   * obligated) to override the specific visit(XTree) methods to add custom
   * processing for specific ParseTree types. An override of a visit(XTree)
   * method is responsible for visiting its children.
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

      var name = getTreeNameForType(tree.type);
      this['visit' + name](tree);
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
     * @param {traceur.syntax.trees.ArgumentList} tree
     */
    visitArgumentList: function(tree) {
      this.visitList(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpression} tree
     */
    visitArrayLiteralExpression: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ArrayPattern} tree
     */
    visitArrayPattern: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.AwaitStatement} tree
     */
    visitAwaitStatement: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperator} tree
     */
    visitBinaryOperator: function(tree) {
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.Block} tree
     */
    visitBlock: function(tree) {
      this.visitList(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.BreakStatement} tree
     */
    visitBreakStatement: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.CallExpression} tree
     */
    visitCallExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.CaseClause} tree
     */
    visitCaseClause: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.Catch} tree
     */
    visitCatch: function(tree) {
      this.visitAny(tree.catchBody);
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclaration} tree
     */
    visitClassDeclaration: function(tree) {
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ClassExpression} tree
     */
    visitClassExpression: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.CommaExpression} tree
     */
    visitCommaExpression: function(tree) {
      this.visitList(tree.expressions);
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpression} tree
     */
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.ContinueStatement} tree
     */
    visitContinueStatement: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.DebuggerStatement} tree
     */
    visitDebuggerStatement: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.DefaultClause} tree
     */
    visitDefaultClause: function(tree) {
      this.visitList(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.DefaultParameter} tree
     */
    visitDefaultParameter: function(tree) {
      this.visitAny(tree.identifier);
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatement} tree
     */
    visitDoWhileStatement: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.condition);
    },

    /**
     * @param {traceur.syntax.trees.EmptyStatement} tree
     */
    visitEmptyStatement: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ExportDeclaration} tree
     */
    visitExportDeclaration: function(tree) {
      this.visitAny(tree.declaration);
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPath: function(tree) {
      this.visitAny(tree.moduleExpression);
      this.visitAny(tree.specifier);
    },

    /**
     * @param {traceur.syntax.trees.ExportPathList} tree
     */
    visitExportPathList: function(tree) {
      this.visitList(tree.paths);
    },

    /**
     * @param {traceur.syntax.trees.ExportPathSpecifier} tree
     */
    visitExportPathSpecifier: function(tree) {
      this.visitAny(tree.specifier);
    },

    /**
     * @param {traceur.syntax.trees.ExportPathSpecifierSet} tree
     */
    visitExportPathSpecifierSet: function(tree) {
      this.visitList(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifier} tree
     */
    visitExportSpecifier: function(tree) {

    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifierSet} tree
     */
    visitExportSpecifierSet: function(tree) {
      this.visitList(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatement} tree
     */
    visitExpressionStatement: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclaration} tree
     */
    visitFieldDeclaration: function(tree) {
      this.visitList(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.Finally} tree
     */
    visitFinally: function(tree) {
      this.visitAny(tree.block);
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatement} tree
     */
    visitForEachStatement: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.ForInStatement} tree
     */
    visitForInStatement: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.ForStatement} tree
     */
    visitForStatement: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.condition);
      this.visitAny(tree.increment);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterList} tree
     */
    visitFormalParameterList: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.FunctionDeclaration} tree
     */
    visitFunctionDeclaration: function(tree) {
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.functionBody);
    },

    /**
     * @param {traceur.syntax.trees.GetAccessor} tree
     */
    visitGetAccessor: function(tree) {
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.IdentifierExpression} tree
     */
    visitIdentifierExpression: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.IfStatement} tree
     */
    visitIfStatement: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.ifClause);
      this.visitAny(tree.elseClause);
    },

    /**
     * @param {traceur.syntax.trees.ImportDeclaration} tree
     */
    visitImportDeclaration: function(tree) {
      this.visitList(tree.importPathList);
    },

    /**
     * @param {traceur.syntax.trees.ImportPath} tree
     */
    visitImportPath: function(tree) {
      if (tree.importSpecifierSet !== null) {
        this.visitList(tree.importSpecifierSet);
      }
    },

    /**
     * @param {traceur.syntax.trees.ImportSpecifier} tree
     */
    visitImportSpecifier: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.LabelledStatement} tree
     */
    visitLabelledStatement: function(tree) {
      this.visitAny(tree.statement);
    },

    /**
     * @param {traceur.syntax.trees.LiteralExpression} tree
     */
    visitLiteralExpression: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.MemberExpression} tree
     */
    visitMemberExpression: function(tree) {
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpression} tree
     */
    visitMemberLookupExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.memberExpression);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpression} tree
     */
    visitMissingPrimaryExpression: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.Mixin} tree
     */
    visitMixin: function(tree) {
      this.visitAny(tree.mixinResolves);
    },

    /**
     * @param {traceur.syntax.trees.MixinResolve} tree
     */
    visitMixinResolve: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveList} tree
     */
    visitMixinResolveList: function(tree) {
      this.visitList(tree.resolves);
    },

    /**
     * @param {traceur.syntax.trees.ModuleDeclaration} tree
     */
    visitModuleDeclaration: function(tree) {
      this.visitList(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDefinition: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ModuleExpression} tree
     */
    visitModuleExpression: function(tree) {
      this.visitAny(tree.reference);
    },

    /**
     * @param {traceur.syntax.trees.ModuleRequire} tree
     */
    visitModuleRequire: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ModuleSpecifier} tree
     */
    visitModuleSpecifier: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.NewExpression} tree
     */
    visitNewExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.NullTree} tree
     */
    visitNullTree: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpression} tree
     */
    visitObjectLiteralExpression: function(tree) {
      this.visitList(tree.propertyNameAndValues);
    },

    /**
     * @param {traceur.syntax.trees.ObjectPattern} tree
     */
    visitObjectPattern: function(tree) {
      this.visitList(tree.fields);
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternField} tree
     */
    visitObjectPatternField: function(tree) {
      this.visitAny(tree.element);
    },

    /**
     * @param {traceur.syntax.trees.ParenExpression} tree
     */
    visitParenExpression: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpression} tree
     */
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.Program} tree
     */
    visitProgram: function(tree) {
      this.visitList(tree.programElements);
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignment} tree
     */
    visitPropertyNameAssignment: function(tree) {
      this.visitAny(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      this.visitAny(tree.moduleExpression);
    },

    /**
     * @param {traceur.syntax.trees.RequiresMember} tree
     */
    visitRequiresMember: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.RestParameter} tree
     */
    visitRestParameter: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatement} tree
     */
    visitReturnStatement: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.SetAccessor} tree
     */
    visitSetAccessor: function(tree) {
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.SpreadExpression} tree
     */
    visitSpreadExpression: function(tree) {
      this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.SpreadPatternElement} tree
     */
    visitSpreadPatternElement: function(tree) {
      this.visitAny(tree.lvalue);
    },

    /**
     * @param {traceur.syntax.trees.StateMachine} tree
     */
    visitStateMachine: function(tree) {
      throw Error('State machines should not live outside of the' +
          ' GeneratorTransformer.');
    },

    /**
     * @param {traceur.syntax.trees.SuperExpression} tree
     */
    visitSuperExpression: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.SwitchStatement} tree
     */
    visitSwitchStatement: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.caseClauses);
    },

    /**
     * @param {traceur.syntax.trees.ThisExpression} tree
     */
    visitThisExpression: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.ThrowStatement} tree
     */
    visitThrowStatement: function(tree) {
      this.visitAny(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.TraitDeclaration} tree
     */
    visitTraitDeclaration: function(tree) {
      this.visitList(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.TryStatement} tree
     */
    visitTryStatement: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },

    /**
     * @param {traceur.syntax.trees.UnaryExpression} tree
     */
    visitUnaryExpression: function(tree) {
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclaration} tree
     */
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      this.visitAny(tree.initializer);
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclarationList} tree
     */
    visitVariableDeclarationList: function(tree) {
      this.visitList(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.VariableStatement} tree
     */
    visitVariableStatement: function(tree) {
      this.visitAny(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.WhileStatement} tree
     */
    visitWhileStatement: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.WithStatement} tree
     */
    visitWithStatement: function(tree) {
      this.visitAny(tree.expression);
      this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.YieldStatement} tree
     */
    visitYieldStatement: function(tree) {
      this.visitAny(tree.expression);
    }
  };

  // Export
  return {
    ParseTreeVisitor: ParseTreeVisitor
  };
});
