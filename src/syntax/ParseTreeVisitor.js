// Copyright 2012 Traceur Authors.
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

/**
 * A base class for traversing a ParseTree in top down (pre-Order) traversal.
 *
 * A node is visited before its children. Derived classes may (but are not
 * obligated) to override the specific visit(XTree) methods to add custom
 * processing for specific ParseTree types. An override of a visit(XTree)
 * method is responsible for visiting its children.
 */
export class ParseTreeVisitor {

  /**
   * @param {ParseTree} tree
   */
  visitAny(tree) {
    tree && tree.visit(this);
  }

  /**
   * @param {ParseTree} tree
   */
  visit(tree) {
    this.visitAny(tree);
  }

  /**
   * @param {Array} list
   */
  visitList(list) {
    for (var i = 0; i < list.length; i++) {
      this.visitAny(list[i]);
    }
  }

  /**
   * @param {ArgumentList} tree
   */
  visitArgumentList(tree) {
    this.visitList(tree.args);
  }

  /**
   * @param {ArrayComprehension} tree
   */
  visitArrayComprehension(tree) {
    this.visitList(tree.comprehensionList);
    this.visitAny(tree.expression);
  }

  /**
   * @param {ArrayLiteralExpression} tree
   */
  visitArrayLiteralExpression(tree) {
    this.visitList(tree.elements);
  }

  /**
   * @param {ArrayPattern} tree
   */
  visitArrayPattern(tree) {
    this.visitList(tree.elements);
  }

  /**
   * @param {ArrowFunctionExpression} tree
   */
  visitArrowFunctionExpression(tree) {
    this.visitAny(tree.formalParameters);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {AtNameExpression} tree
   */
  visitAtNameExpression(tree) {
  }

  /**
   * @param {AtNameDeclaration} tree
   */
  visitAtNameDeclaration(tree) {
    this.visitAny(tree.initializer);
  }

  /**
   * @param {AwaitStatement} tree
   */
  visitAwaitStatement(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {BinaryOperator} tree
   */
  visitBinaryOperator(tree) {
    this.visitAny(tree.left);
    this.visitAny(tree.right);
  }

  /**
   * @param {BindingElement} tree
   */
  visitBindingElement(tree) {
    this.visitAny(tree.binding);
    this.visitAny(tree.initializer);
  }

  /**
   * @param {BindingIdentifier} tree
   */
  visitBindingIdentifier(tree) {
    // noop
  }

  /**
   * @param {Block} tree
   */
  visitBlock(tree) {
    this.visitList(tree.statements);
  }

  /**
   * @param {BreakStatement} tree
   */
  visitBreakStatement(tree) {
  }

  /**
   * @param {CallExpression} tree
   */
  visitCallExpression(tree) {
    this.visitAny(tree.operand);
    this.visitAny(tree.args);
  }

  /**
   * @param {CaseClause} tree
   */
  visitCaseClause(tree) {
    this.visitAny(tree.expression);
    this.visitList(tree.statements);
  }

  /**
   * @param {Catch} tree
   */
  visitCatch(tree) {
    this.visitAny(tree.binding);
    this.visitAny(tree.catchBody);
  }

  /**
   * @param {CascadeExpression} tree
   */
  visitCascadeExpression(tree) {
    this.visitAny(tree.operand);
    this.visitList(tree.expressions);
  }

  /**
   * @param {ClassDeclaration} tree
   */
  visitClassDeclaration(tree) {
    this.visitAny(tree.superClass);
    this.visitList(tree.elements);
  }

  /**
   * @param {ClassExpression} tree
   */
  visitClassExpression(tree) {
  }

  /**
   * @param {CommaExpression} tree
   */
  visitCommaExpression(tree) {
    this.visitList(tree.expressions);
  }

  /**
   * @param {ComprehensionFor} tree
   */
  visitComprehensionFor(tree) {
    this.visitAny(tree.left);
    this.visitAny(tree.iterator);
  }

  /**
   * @param {ComprehensionIf} tree
   */
  visitComprehensionIf(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {ConditionalExpression} tree
   */
  visitConditionalExpression(tree) {
    this.visitAny(tree.condition);
    this.visitAny(tree.left);
    this.visitAny(tree.right);
  }

  /**
   * @param {ContinueStatement} tree
   */
  visitContinueStatement(tree) {
  }

  /**
   * @param {DebuggerStatement} tree
   */
  visitDebuggerStatement(tree) {
  }

  /**
   * @param {DefaultClause} tree
   */
  visitDefaultClause(tree) {
    this.visitList(tree.statements);
  }

  /**
   * @param {DoWhileStatement} tree
   */
  visitDoWhileStatement(tree) {
    this.visitAny(tree.body);
    this.visitAny(tree.condition);
  }

  /**
   * @param {EmptyStatement} tree
   */
  visitEmptyStatement(tree) {
  }

  /**
   * @param {ExportDeclaration} tree
   */
  visitExportDeclaration(tree) {
    this.visitAny(tree.declaration);
  }

  /**
   * @param {ExportMapping} tree
   */
  visitExportMapping(tree) {
    this.visitAny(tree.moduleExpression);
    this.visitAny(tree.specifierSet);
  }

  /**
   * @param {ExportMappingList} tree
   */
  visitExportMappingList(tree) {
    this.visitList(tree.paths);
  }

  /**
   * @param {ExportSpecifier} tree
   */
  visitExportSpecifier(tree) {

  }

  /**
   * @param {ExportSpecifierSet} tree
   */
  visitExportSpecifierSet(tree) {
    this.visitList(tree.specifiers);
  }

  /**
   * @param {ExportStar} tree
   */
  visitExportStar(tree) {

  }

  /**
   * @param {ExpressionStatement} tree
   */
  visitExpressionStatement(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {Finally} tree
   */
  visitFinally(tree) {
    this.visitAny(tree.block);
  }

  /**
   * @param {ForOfStatement} tree
   */
  visitForOfStatement(tree) {
    this.visitAny(tree.initializer);
    this.visitAny(tree.collection);
    this.visitAny(tree.body);
  }

  /**
   * @param {ForInStatement} tree
   */
  visitForInStatement(tree) {
    this.visitAny(tree.initializer);
    this.visitAny(tree.collection);
    this.visitAny(tree.body);
  }

  /**
   * @param {ForStatement} tree
   */
  visitForStatement(tree) {
    this.visitAny(tree.initializer);
    this.visitAny(tree.condition);
    this.visitAny(tree.increment);
    this.visitAny(tree.body);
  }

  /**
   * @param {FormalParameterList} tree
   */
  visitFormalParameterList(tree) {
    this.visitList(tree.parameters);
  }

  /**
   * @param {FunctionDeclaration|FunctionExpression} tree
   */
  visitFunction(tree) {
    this.visitAny(tree.name);
    this.visitAny(tree.formalParameterList);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {FunctionDeclaration} tree
   */
  visitFunctionDeclaration(tree) {
    this.visitFunction(tree);
  }

  /**
   * @param {FunctionExpression} tree
   */
  visitFunctionExpression(tree) {
    this.visitFunction(tree);
  }

  /**
   * @param {GeneratorComprehension} tree
   */
  visitGeneratorComprehension(tree) {
    this.visitList(tree.comprehensionList);
    this.visitAny(tree.expression);
  }

  /**
   * @param {GetAccessor} tree
   */
  visitGetAccessor(tree) {
    this.visitAny(tree.body);
  }

  /**
   * @param {IdentifierExpression} tree
   */
  visitIdentifierExpression(tree) {
  }

  /**
   * @param {IfStatement} tree
   */
  visitIfStatement(tree) {
    this.visitAny(tree.condition);
    this.visitAny(tree.ifClause);
    this.visitAny(tree.elseClause);
  }

  /**
   * @param {ImportDeclaration} tree
   */
  visitImportDeclaration(tree) {
    this.visitList(tree.importPathList);
  }

  /**
   * @param {ImportBinding} tree
   */
  visitImportBinding(tree) {
    if (tree.importSpecifierSet !== null) {
      this.visitList(tree.importSpecifierSet);
    }
    this.visitAny(tree.moduleExpression);
  }

  /**
   * @param {ImportSpecifier} tree
   */
  visitImportSpecifier(tree) {
  }

  /**
   * @param {ImportSpecifierSet} tree
   */
  visitImportSpecifierSet(tree) {
    this.visitList(tree.specifiers);
  }

  /**
   * @param {LabelledStatement} tree
   */
  visitLabelledStatement(tree) {
    this.visitAny(tree.statement);
  }

  /**
   * @param {LiteralExpression} tree
   */
  visitLiteralExpression(tree) {
  }

  /**
   * @param {MemberExpression} tree
   */
  visitMemberExpression(tree) {
    this.visitAny(tree.operand);
  }

  /**
   * @param {MemberLookupExpression} tree
   */
  visitMemberLookupExpression(tree) {
    this.visitAny(tree.operand);
    this.visitAny(tree.memberExpression);
  }

  /**
   * @param {MissingPrimaryExpression} tree
   */
  visitMissingPrimaryExpression(tree) {
  }

  /**
   * @param {ModuleDeclaration} tree
   */
  visitModuleDeclaration(tree) {
    this.visitList(tree.specifiers);
  }

  /**
   * @param {ModuleDefinition} tree
   */
  visitModuleDefinition(tree) {
    this.visitList(tree.elements);
  }

  /**
   * @param {ModuleExpression} tree
   */
  visitModuleExpression(tree) {
    this.visitAny(tree.reference);
  }

  /**
   * @param {ModuleRequire} tree
   */
  visitModuleRequire(tree) {
  }

  /**
   * @param {ModuleSpecifier} tree
   */
  visitModuleSpecifier(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {NewExpression} tree
   */
  visitNewExpression(tree) {
    this.visitAny(tree.operand);
    this.visitAny(tree.args);
  }

  /**
   * @param {NameStatement} tree
   */
  visitNameStatement(tree) {
    this.visitList(tree.declarations);
  }

  /**
   * @param {ObjectLiteralExpression} tree
   */
  visitObjectLiteralExpression(tree) {
    this.visitList(tree.propertyNameAndValues);
  }

  /**
   * @param {ObjectPattern} tree
   */
  visitObjectPattern(tree) {
    this.visitList(tree.fields);
  }

  /**
   * @param {ObjectPatternField} tree
   */
  visitObjectPatternField(tree) {
    this.visitAny(tree.element);
  }

  /**
   * @param {ParenExpression} tree
   */
  visitParenExpression(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {PostfixExpression} tree
   */
  visitPostfixExpression(tree) {
    this.visitAny(tree.operand);
  }

  /**
   * @param {PredefinedType} tree
   */
  visitPredefinedType(tree) {
  }

  /**
   * @param {Program} tree
   */
  visitProgram(tree) {
    this.visitList(tree.programElements);
  }

  /**
   * @param {PropertyMethodAssignment} tree
   */
  visitPropertyMethodAssignment(tree) {
    this.visitAny(tree.formalParameterList);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {PropertyNameAssignment} tree
   */
  visitPropertyNameAssignment(tree) {
    this.visitAny(tree.value);
  }

  /**
   * @param {PropertyNameShorthand} tree
   */
  visitPropertyNameShorthand(tree) {
  }

  /**
   * @param {TemplateLiteralExpression} tree
   */
  visitTemplateLiteralExpression(tree) {
    this.visitAny(tree.operand);
    this.visitList(tree.elements);
  }

  /**
   * @param {TemplateLiteralPortion} tree
   */
  visitTemplateLiteralPortion(tree) {
  }

  /**
   * @param {TemplateSubstitution} tree
   */
  visitTemplateSubstitution(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {RestParameter} tree
   */
  visitRestParameter(tree) {
  }

  /**
   * @param {ReturnStatement} tree
   */
  visitReturnStatement(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {SetAccessor} tree
   */
  visitSetAccessor(tree) {
    this.visitAny(tree.parameter);
    this.visitAny(tree.body);
  }

  /**
   * @param {SpreadExpression} tree
   */
  visitSpreadExpression(tree) {
    this.visitAny(tree.expression);
  }

  /**
   * @param {SpreadPatternElement} tree
   */
  visitSpreadPatternElement(tree) {
    this.visitAny(tree.lvalue);
  }

  /**
   * @param {StateMachine} tree
   */
  visitStateMachine(tree) {
    throw Error('State machines should not live outside of the' +
        ' GeneratorTransformer.');
  }

  /**
   * @param {SuperExpression} tree
   */
  visitSuperExpression(tree) {
  }

  /**
   * @param {SwitchStatement} tree
   */
  visitSwitchStatement(tree) {
    this.visitAny(tree.expression);
    this.visitList(tree.caseClauses);
  }

  /**
   * @param {ThisExpression} tree
   */
  visitThisExpression(tree) {
  }

  /**
   * @param {ThrowStatement} tree
   */
  visitThrowStatement(tree) {
    this.visitAny(tree.value);
  }

  /**
   * @param {TryStatement} tree
   */
  visitTryStatement(tree) {
    this.visitAny(tree.body);
    this.visitAny(tree.catchBlock);
    this.visitAny(tree.finallyBlock);
  }

  /**
   * @param {TypeName} tree
   */
  visitTypeName(tree) {
    this.visitAny(tree.moduleName);
  }

  /**
   * @param {UnaryExpression} tree
   */
  visitUnaryExpression(tree) {
    this.visitAny(tree.operand);
  }

  /**
   * @param {VariableDeclaration} tree
   */
  visitVariableDeclaration(tree) {
    this.visitAny(tree.lvalue);
    this.visitAny(tree.typeAnnotation);
    this.visitAny(tree.initializer);
  }

  /**
   * @param {VariableDeclarationList} tree
   */
  visitVariableDeclarationList(tree) {
    this.visitList(tree.declarations);
  }

  /**
   * @param {VariableStatement} tree
   */
  visitVariableStatement(tree) {
    this.visitAny(tree.declarations);
  }

  /**
   * @param {WhileStatement} tree
   */
  visitWhileStatement(tree) {
    this.visitAny(tree.condition);
    this.visitAny(tree.body);
  }

  /**
   * @param {WithStatement} tree
   */
  visitWithStatement(tree) {
    this.visitAny(tree.expression);
    this.visitAny(tree.body);
  }

  /**
   * @param {YieldExpression} tree
   */
  visitYieldExpression(tree) {
    this.visitAny(tree.expression);
  }
}
