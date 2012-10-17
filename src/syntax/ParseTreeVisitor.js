// Copyright 2012 Google Inc.
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

import {
  ParseTreeType,
  getTreeNameForType
} from 'trees/ParseTree.js';

/**
 * A base class for traversing a ParseTree in top down (pre-Order) traversal.
 *
 * A node is visited before its children. Derived classes may (but are not
 * obligated) to override the specific visit(XTree) methods to add custom
 * processing for specific ParseTree types. An override of a visit(XTree)
 * method is responsible for visiting its children.
 */
export function ParseTreeVisitor() {
}

ParseTreeVisitor.prototype = {
  /**
   * @param {ParseTree} tree
   */
  visitAny: function(tree) {
    if (tree === null) {
      return;
    }

    var name = getTreeNameForType(tree.type);
    this['visit' + name](tree);
  },

  /**
   * @param {ParseTree} tree
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
   * @param {ArgumentList} tree
   */
  visitArgumentList: function(tree) {
    this.visitList(tree.args);
  },

  /**
   * @param {ArrayComprehension} tree
   */
  visitArrayComprehension: function(tree) {
    this.visitAny(tree.expression);
    this.visitList(tree.comprehensionForList);
    this.visitAny(tree.ifExpression);
  },

  /**
   * @param {ArrayLiteralExpression} tree
   */
  visitArrayLiteralExpression: function(tree) {
    this.visitList(tree.elements);
  },

  /**
   * @param {ArrayPattern} tree
   */
  visitArrayPattern: function(tree) {
    this.visitList(tree.elements);
  },

  /**
   * @param {ArrowFunctionExpression} tree
   */
  visitArrowFunctionExpression: function(tree) {
    this.visitAny(tree.formalParameters);
    this.visitAny(tree.functionBody);
  },

  /**
   * @param {AtNameExpression} tree
   */
  visitAtNameExpression: function(tree) {
  },

  /**
   * @param {AtNameDeclaration} tree
   */
  visitAtNameDeclaration: function(tree) {
    this.visitAny(tree.initializer);
  },

  /**
   * @param {AwaitStatement} tree
   */
  visitAwaitStatement: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {BinaryOperator} tree
   */
  visitBinaryOperator: function(tree) {
    this.visitAny(tree.left);
    this.visitAny(tree.right);
  },

  /**
   * @param {BindThisParameter} tree
   */
  visitBindThisParameter: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {BindingElement} tree
   */
  visitBindingElement: function(tree) {
    this.visitAny(tree.binding);
    this.visitAny(tree.initializer);
  },

  /**
   * @param {BindingIdentifier} tree
   */
  visitBindingIdentifier: function(tree) {
    // noop
  },

  /**
   * @param {Block} tree
   */
  visitBlock: function(tree) {
    this.visitList(tree.statements);
  },

  /**
   * @param {BreakStatement} tree
   */
  visitBreakStatement: function(tree) {
  },

  /**
   * @param {CallExpression} tree
   */
  visitCallExpression: function(tree) {
    this.visitAny(tree.operand);
    this.visitAny(tree.args);
  },

  /**
   * @param {CaseClause} tree
   */
  visitCaseClause: function(tree) {
    this.visitAny(tree.expression);
    this.visitList(tree.statements);
  },

  /**
   * @param {Catch} tree
   */
  visitCatch: function(tree) {
    this.visitAny(tree.binding);
    this.visitAny(tree.catchBody);
  },

  /**
   * @param {CascadeExpression} tree
   */
  visitCascadeExpression: function(tree) {
    this.visitAny(tree.operand);
    this.visitList(tree.expressions);
  },

  /**
   * @param {ClassDeclaration} tree
   */
  visitClassDeclaration: function(tree) {
    this.visitAny(tree.superClass);
    this.visitList(tree.elements);
  },

  /**
   * @param {ClassExpression} tree
   */
  visitClassExpression: function(tree) {
  },

  /**
   * @param {CommaExpression} tree
   */
  visitCommaExpression: function(tree) {
    this.visitList(tree.expressions);
  },

  /**
   * @param {ComprehensionFor} tree
   */
  visitComprehensionFor: function(tree) {
    this.visitAny(tree.left);
    this.visitAny(tree.iterator);
  },

  /**
   * @param {ConditionalExpression} tree
   */
  visitConditionalExpression: function(tree) {
    this.visitAny(tree.condition);
    this.visitAny(tree.left);
    this.visitAny(tree.right);
  },

  /**
   * @param {ContinueStatement} tree
   */
  visitContinueStatement: function(tree) {
  },

  /**
   * @param {DebuggerStatement} tree
   */
  visitDebuggerStatement: function(tree) {
  },

  /**
   * @param {DefaultClause} tree
   */
  visitDefaultClause: function(tree) {
    this.visitList(tree.statements);
  },

  /**
   * @param {DoWhileStatement} tree
   */
  visitDoWhileStatement: function(tree) {
    this.visitAny(tree.body);
    this.visitAny(tree.condition);
  },

  /**
   * @param {EmptyStatement} tree
   */
  visitEmptyStatement: function(tree) {
  },

  /**
   * @param {ExportDeclaration} tree
   */
  visitExportDeclaration: function(tree) {
    this.visitAny(tree.declaration);
  },

  /**
   * @param {ExportMapping} tree
   */
  visitExportMapping: function(tree) {
    this.visitAny(tree.moduleExpression);
    this.visitAny(tree.specifierSet);
  },

  /**
   * @param {ExportMappingList} tree
   */
  visitExportMappingList: function(tree) {
    this.visitList(tree.paths);
  },

  /**
   * @param {ExportSpecifier} tree
   */
  visitExportSpecifier: function(tree) {

  },

  /**
   * @param {ExportSpecifierSet} tree
   */
  visitExportSpecifierSet: function(tree) {
    this.visitList(tree.specifiers);
  },

  /**
   * @param {ExpressionStatement} tree
   */
  visitExpressionStatement: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {Finally} tree
   */
  visitFinally: function(tree) {
    this.visitAny(tree.block);
  },

  /**
   * @param {ForOfStatement} tree
   */
  visitForOfStatement: function(tree) {
    this.visitAny(tree.initializer);
    this.visitAny(tree.collection);
    this.visitAny(tree.body);
  },

  /**
   * @param {ForInStatement} tree
   */
  visitForInStatement: function(tree) {
    this.visitAny(tree.initializer);
    this.visitAny(tree.collection);
    this.visitAny(tree.body);
  },

  /**
   * @param {ForStatement} tree
   */
  visitForStatement: function(tree) {
    this.visitAny(tree.initializer);
    this.visitAny(tree.condition);
    this.visitAny(tree.increment);
    this.visitAny(tree.body);
  },

  /**
   * @param {FormalParameterList} tree
   */
  visitFormalParameterList: function(tree) {
    this.visitList(tree.parameters);
  },

  /**
   * @param {FunctionDeclaration} tree
   */
  visitFunctionDeclaration: function(tree) {
    this.visitAny(tree.name);
    this.visitAny(tree.formalParameterList);
    this.visitAny(tree.functionBody);
  },

  /**
   * @param {GeneratorComprehension} tree
   */
  visitGeneratorComprehension: function(tree) {
    this.visitAny(tree.expression);
    this.visitList(tree.comprehensionForList);
    this.visitAny(tree.ifExpression);
  },

  /**
   * @param {GetAccessor} tree
   */
  visitGetAccessor: function(tree) {
    this.visitAny(tree.body);
  },

  /**
   * @param {IdentifierExpression} tree
   */
  visitIdentifierExpression: function(tree) {
  },

  /**
   * @param {IfStatement} tree
   */
  visitIfStatement: function(tree) {
    this.visitAny(tree.condition);
    this.visitAny(tree.ifClause);
    this.visitAny(tree.elseClause);
  },

  /**
   * @param {ImportDeclaration} tree
   */
  visitImportDeclaration: function(tree) {
    this.visitList(tree.importPathList);
  },

  /**
   * @param {ImportBinding} tree
   */
  visitImportBinding: function(tree) {
    if (tree.importSpecifierSet !== null) {
      this.visitList(tree.importSpecifierSet);
    }
    this.visitAny(tree.moduleExpression);
  },

  /**
   * @param {ImportSpecifier} tree
   */
  visitImportSpecifier: function(tree) {
  },

  /**
   * @param {ImportSpecifierSet} tree
   */
  visitImportSpecifierSet: function(tree) {
    this.visitList(tree.specifiers);
  },

  /**
   * @param {LabelledStatement} tree
   */
  visitLabelledStatement: function(tree) {
    this.visitAny(tree.statement);
  },

  /**
   * @param {LiteralExpression} tree
   */
  visitLiteralExpression: function(tree) {
  },

  /**
   * @param {MemberExpression} tree
   */
  visitMemberExpression: function(tree) {
    this.visitAny(tree.operand);
  },

  /**
   * @param {MemberLookupExpression} tree
   */
  visitMemberLookupExpression: function(tree) {
    this.visitAny(tree.operand);
    this.visitAny(tree.memberExpression);
  },

  /**
   * @param {MissingPrimaryExpression} tree
   */
  visitMissingPrimaryExpression: function(tree) {
  },

  /**
   * @param {ModuleDeclaration} tree
   */
  visitModuleDeclaration: function(tree) {
    this.visitList(tree.specifiers);
  },

  /**
   * @param {ModuleDefinition} tree
   */
  visitModuleDefinition: function(tree) {
    this.visitList(tree.elements);
  },

  /**
   * @param {ModuleExpression} tree
   */
  visitModuleExpression: function(tree) {
    this.visitAny(tree.reference);
  },

  /**
   * @param {ModuleRequire} tree
   */
  visitModuleRequire: function(tree) {
  },

  /**
   * @param {ModuleSpecifier} tree
   */
  visitModuleSpecifier: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {NewExpression} tree
   */
  visitNewExpression: function(tree) {
    this.visitAny(tree.operand);
    this.visitAny(tree.args);
  },

  /**
   * @param {NameStatement} tree
   */
  visitNameStatement: function(tree) {
    this.visitList(tree.declarations);
  },

  /**
   * @param {NullTree} tree
   */
  visitNullTree: function(tree) {
  },

  /**
   * @param {ObjectLiteralExpression} tree
   */
  visitObjectLiteralExpression: function(tree) {
    this.visitList(tree.propertyNameAndValues);
  },

  /**
   * @param {ObjectPattern} tree
   */
  visitObjectPattern: function(tree) {
    this.visitList(tree.fields);
  },

  /**
   * @param {ObjectPatternField} tree
   */
  visitObjectPatternField: function(tree) {
    this.visitAny(tree.element);
  },

  /**
   * @param {ParenExpression} tree
   */
  visitParenExpression: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {PostfixExpression} tree
   */
  visitPostfixExpression: function(tree) {
    this.visitAny(tree.operand);
  },

  /**
   * @param {Program} tree
   */
  visitProgram: function(tree) {
    this.visitList(tree.programElements);
  },

  /**
   * @param {PropertyMethodAssignment} tree
   */
  visitPropertyMethodAssignment: function(tree) {
    this.visitAny(tree.formalParameterList);
    this.visitAny(tree.functionBody);
  },

  /**
   * @param {PropertyNameAssignment} tree
   */
  visitPropertyNameAssignment: function(tree) {
    this.visitAny(tree.value);
  },

  /**
   * @param {PropertyNameShorthand} tree
   */
  visitPropertyNameShorthand: function(tree) {
  },

  /**
   * @param {QuasiLiteralExpression} tree
   */
  visitQuasiLiteralExpression: function(tree) {
    this.visitAny(tree.operand);
    this.visitList(tree.elements);
  },

  /**
   * @param {QuasiLiteralPortion} tree
   */
  visitQuasiLiteralPortion: function(tree) {
  },

  /**
   * @param {QuasiSubstitution} tree
   */
  visitQuasiSubstitution: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {RequiresMember} tree
   */
  visitRequiresMember: function(tree) {
  },

  /**
   * @param {RestParameter} tree
   */
  visitRestParameter: function(tree) {
  },

  /**
   * @param {ReturnStatement} tree
   */
  visitReturnStatement: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {SetAccessor} tree
   */
  visitSetAccessor: function(tree) {
    this.visitAny(tree.body);
  },

  /**
   * @param {SpreadExpression} tree
   */
  visitSpreadExpression: function(tree) {
    this.visitAny(tree.expression);
  },

  /**
   * @param {SpreadPatternElement} tree
   */
  visitSpreadPatternElement: function(tree) {
    this.visitAny(tree.lvalue);
  },

  /**
   * @param {StateMachine} tree
   */
  visitStateMachine: function(tree) {
    throw Error('State machines should not live outside of the' +
        ' GeneratorTransformer.');
  },

  /**
   * @param {SuperExpression} tree
   */
  visitSuperExpression: function(tree) {
  },

  /**
   * @param {SwitchStatement} tree
   */
  visitSwitchStatement: function(tree) {
    this.visitAny(tree.expression);
    this.visitList(tree.caseClauses);
  },

  /**
   * @param {ThisExpression} tree
   */
  visitThisExpression: function(tree) {
  },

  /**
   * @param {ThrowStatement} tree
   */
  visitThrowStatement: function(tree) {
    this.visitAny(tree.value);
  },

  /**
   * @param {TryStatement} tree
   */
  visitTryStatement: function(tree) {
    this.visitAny(tree.body);
    this.visitAny(tree.catchBlock);
    this.visitAny(tree.finallyBlock);
  },

  /**
   * @param {UnaryExpression} tree
   */
  visitUnaryExpression: function(tree) {
    this.visitAny(tree.operand);
  },

  /**
   * @param {VariableDeclaration} tree
   */
  visitVariableDeclaration: function(tree) {
    this.visitAny(tree.lvalue);
    this.visitAny(tree.initializer);
  },

  /**
   * @param {VariableDeclarationList} tree
   */
  visitVariableDeclarationList: function(tree) {
    this.visitList(tree.declarations);
  },

  /**
   * @param {VariableStatement} tree
   */
  visitVariableStatement: function(tree) {
    this.visitAny(tree.declarations);
  },

  /**
   * @param {WhileStatement} tree
   */
  visitWhileStatement: function(tree) {
    this.visitAny(tree.condition);
    this.visitAny(tree.body);
  },

  /**
   * @param {WithStatement} tree
   */
  visitWithStatement: function(tree) {
    this.visitAny(tree.expression);
    this.visitAny(tree.body);
  },

  /**
   * @param {YieldStatement} tree
   */
  visitYieldStatement: function(tree) {
    this.visitAny(tree.expression);
  }
};
