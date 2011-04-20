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

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createArrayPattern = ParseTreeFactory.createArrayPattern;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createBlock = ParseTreeFactory.createBlock;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCaseClause = ParseTreeFactory.createCaseClause;
  var createCatch = ParseTreeFactory.createCatch;
  var createClassDeclaration = ParseTreeFactory.createClassDeclaration;
  var createCommaExpression = ParseTreeFactory.createCommaExpression;
  var createConditionalExpression = ParseTreeFactory.createConditionalExpression;
  var createDefaultClause = ParseTreeFactory.createDefaultClause;
  var createDefaultParameter = ParseTreeFactory.createDefaultParameter;
  var createDoWhileStatement = ParseTreeFactory.createDoWhileStatement;
  var createExpressionStatement = ParseTreeFactory.createExpressionStatement;
  var createExpressionStatement = ParseTreeFactory.createExpressionStatement;
  var createFieldDeclaration = ParseTreeFactory.createFieldDeclaration;
  var createFinally = ParseTreeFactory.createFinally;
  var createForEachStatement = ParseTreeFactory.createForEachStatement;
  var createForInStatement = ParseTreeFactory.createForInStatement;
  var createForStatement = ParseTreeFactory.createForStatement;
  var createFunctionDeclaration = ParseTreeFactory.createFunctionDeclaration;
  var createGetAccessor = ParseTreeFactory.createGetAccessor;
  var createIfStatement = ParseTreeFactory.createIfStatement;
  var createLabelledStatement = ParseTreeFactory.createLabelledStatement;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createMemberLookupExpression = ParseTreeFactory.createMemberLookupExpression;
  var createMixin = ParseTreeFactory.createMixin;
  var createMixinResolveList = ParseTreeFactory.createMixinResolveList;
  var createNewExpression = ParseTreeFactory.createNewExpression;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createObjectPattern = ParseTreeFactory.createObjectPattern;
  var createObjectPatternField = ParseTreeFactory.createObjectPatternField;
  var createParenExpression = ParseTreeFactory.createParenExpression;
  var createPostfixExpression = ParseTreeFactory.createPostfixExpression;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;
  var createSetAccessor = ParseTreeFactory.createSetAccessor;
  var createSpreadExpression = ParseTreeFactory.createSpreadExpression;
  var createSpreadPatternElement = ParseTreeFactory.createSpreadPatternElement;
  var createSwitchStatement = ParseTreeFactory.createSwitchStatement;
  var createThrowStatement = ParseTreeFactory.createThrowStatement;
  var createTraitDeclaration = ParseTreeFactory.createTraitDeclaration;
  var createTryStatement = ParseTreeFactory.createTryStatement;
  var createUnaryExpression = ParseTreeFactory.createUnaryExpression;
  var createVariableDeclaration = ParseTreeFactory.createVariableDeclaration;
  var createVariableDeclarationList = ParseTreeFactory.createVariableDeclarationList;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;
  var createWhileStatement = ParseTreeFactory.createWhileStatement;
  var createWithStatement = ParseTreeFactory.createWithStatement;
  var createYieldStatement = ParseTreeFactory.createYieldStatement;


  var AwaitStatementTree = traceur.syntax.trees.AwaitStatementTree;
  var ExportDeclarationTree = traceur.syntax.trees.ExportDeclarationTree;
  var ImportDeclarationTree = traceur.syntax.trees.ImportDeclarationTree;
  var ImportPathTree = traceur.syntax.trees.ImportPathTree;
  var ModuleDeclarationTree = traceur.syntax.trees.ModuleDeclarationTree;
  var ModuleDefinitionTree = traceur.syntax.trees.ModuleDefinitionTree;
  var ModuleExpressionTree = traceur.syntax.trees.ModuleExpressionTree;
  var ModuleSpecifierTree = traceur.syntax.trees.ModuleSpecifierTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ProgramTree = traceur.syntax.trees.ProgramTree;

  var ARGUMENT_LIST = ParseTreeType.ARGUMENT_LIST;
  var ARRAY_LITERAL_EXPRESSION = ParseTreeType.ARRAY_LITERAL_EXPRESSION;
  var ARRAY_PATTERN = ParseTreeType.ARRAY_PATTERN;
  var AWAIT_STATEMENT = ParseTreeType.AWAIT_STATEMENT;
  var BINARY_OPERATOR = ParseTreeType.BINARY_OPERATOR;
  var BLOCK = ParseTreeType.BLOCK;
  var BREAK_STATEMENT = ParseTreeType.BREAK_STATEMENT;
  var CALL_EXPRESSION = ParseTreeType.CALL_EXPRESSION;
  var CASE_CLAUSE = ParseTreeType.CASE_CLAUSE;
  var CATCH = ParseTreeType.CATCH;
  var CLASS_DECLARATION = ParseTreeType.CLASS_DECLARATION;
  var CLASS_EXPRESSION = ParseTreeType.CLASS_EXPRESSION;
  var COMMA_EXPRESSION = ParseTreeType.COMMA_EXPRESSION;
  var CONDITIONAL_EXPRESSION = ParseTreeType.CONDITIONAL_EXPRESSION;
  var CONTINUE_STATEMENT = ParseTreeType.CONTINUE_STATEMENT;
  var DEBUGGER_STATEMENT = ParseTreeType.DEBUGGER_STATEMENT;
  var DEFAULT_CLAUSE = ParseTreeType.DEFAULT_CLAUSE;
  var DEFAULT_PARAMETER = ParseTreeType.DEFAULT_PARAMETER;
  var DO_WHILE_STATEMENT = ParseTreeType.DO_WHILE_STATEMENT;
  var EMPTY_STATEMENT = ParseTreeType.EMPTY_STATEMENT;
  var EXPORT_DECLARATION = ParseTreeType.EXPORT_DECLARATION;
  var EXPRESSION_STATEMENT = ParseTreeType.EXPRESSION_STATEMENT;
  var FIELD_DECLARATION = ParseTreeType.FIELD_DECLARATION;
  var FINALLY = ParseTreeType.FINALLY;
  var FORMAL_PARAMETER_LIST = ParseTreeType.FORMAL_PARAMETER_LIST;
  var FOR_EACH_STATEMENT = ParseTreeType.FOR_EACH_STATEMENT;
  var FOR_IN_STATEMENT = ParseTreeType.FOR_IN_STATEMENT;
  var FOR_STATEMENT = ParseTreeType.FOR_STATEMENT;
  var FUNCTION_DECLARATION = ParseTreeType.FUNCTION_DECLARATION;
  var GET_ACCESSOR = ParseTreeType.GET_ACCESSOR;
  var IDENTIFIER_EXPRESSION = ParseTreeType.IDENTIFIER_EXPRESSION;
  var IF_STATEMENT = ParseTreeType.IF_STATEMENT;
  var IMPORT_DECLARATION = ParseTreeType.IMPORT_DECLARATION;
  var IMPORT_PATH = ParseTreeType.IMPORT_PATH;
  var IMPORT_SPECIFIER = ParseTreeType.IMPORT_SPECIFIER;
  var LABELLED_STATEMENT = ParseTreeType.LABELLED_STATEMENT;
  var LITERAL_EXPRESSION = ParseTreeType.LITERAL_EXPRESSION;
  var MEMBER_EXPRESSION = ParseTreeType.MEMBER_EXPRESSION;
  var MEMBER_LOOKUP_EXPRESSION = ParseTreeType.MEMBER_LOOKUP_EXPRESSION;
  var MISSING_PRIMARY_EXPRESSION = ParseTreeType.MISSING_PRIMARY_EXPRESSION;
  var MIXIN = ParseTreeType.MIXIN;
  var MIXIN_RESOLVE = ParseTreeType.MIXIN_RESOLVE;
  var MIXIN_RESOLVE_LIST = ParseTreeType.MIXIN_RESOLVE_LIST;
  var MODULE_DECLARATION = ParseTreeType.MODULE_DECLARATION;
  var MODULE_DEFINITION = ParseTreeType.MODULE_DEFINITION;
  var MODULE_EXPRESSION = ParseTreeType.MODULE_EXPRESSION;
  var MODULE_REQUIRE = ParseTreeType.MODULE_REQUIRE;
  var MODULE_SPECIFIER = ParseTreeType.MODULE_SPECIFIER;
  var NEW_EXPRESSION = ParseTreeType.NEW_EXPRESSION;
  var NULL = ParseTreeType.NULL;
  var OBJECT_LITERAL_EXPRESSION = ParseTreeType.OBJECT_LITERAL_EXPRESSION;
  var OBJECT_PATTERN = ParseTreeType.OBJECT_PATTERN;
  var OBJECT_PATTERN_FIELD = ParseTreeType.OBJECT_PATTERN_FIELD;
  var PAREN_EXPRESSION = ParseTreeType.PAREN_EXPRESSION;
  var POSTFIX_EXPRESSION = ParseTreeType.POSTFIX_EXPRESSION;
  var PROGRAM = ParseTreeType.PROGRAM;
  var PROPERTY_NAME_ASSIGNMENT = ParseTreeType.PROPERTY_NAME_ASSIGNMENT;
  var REQUIRES_MEMBER = ParseTreeType.REQUIRES_MEMBER;
  var REST_PARAMETER = ParseTreeType.REST_PARAMETER;
  var RETURN_STATEMENT = ParseTreeType.RETURN_STATEMENT;
  var SET_ACCESSOR = ParseTreeType.SET_ACCESSOR;
  var SPREAD_EXPRESSION = ParseTreeType.SPREAD_EXPRESSION;
  var SPREAD_PATTERN_ELEMENT = ParseTreeType.SPREAD_PATTERN_ELEMENT;
  var STATE_MACHINE = ParseTreeType.STATE_MACHINE;
  var SUPER_EXPRESSION = ParseTreeType.SUPER_EXPRESSION;
  var SWITCH_STATEMENT = ParseTreeType.SWITCH_STATEMENT;
  var THIS_EXPRESSION = ParseTreeType.THIS_EXPRESSION;
  var THROW_STATEMENT = ParseTreeType.THROW_STATEMENT;
  var TRAIT_DECLARATION = ParseTreeType.TRAIT_DECLARATION;
  var TRY_STATEMENT = ParseTreeType.TRY_STATEMENT;
  var UNARY_EXPRESSION = ParseTreeType.UNARY_EXPRESSION;
  var VARIABLE_DECLARATION = ParseTreeType.VARIABLE_DECLARATION;
  var VARIABLE_DECLARATION_LIST = ParseTreeType.VARIABLE_DECLARATION_LIST;
  var VARIABLE_STATEMENT = ParseTreeType.VARIABLE_STATEMENT;
  var WHILE_STATEMENT = ParseTreeType.WHILE_STATEMENT;
  var WITH_STATEMENT = ParseTreeType.WITH_STATEMENT;
  var YIELD_STATEMENT = ParseTreeType.YIELD_STATEMENT;


  /**
   * A base class for transforming parse trees.
   *
   * The ParseTreeTransformer walks every node and gives derived classes the opportunity
   * (but not the obligation) to transform every node in a tree. By default the ParseTreeTransformer
   * performs the identity transform.
   */
  function ParseTreeTransformer() {}

  ParseTreeTransformer.prototype = {

    /**
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    transformAny: function(tree) {
      if (tree == null) {
        return null;
      }

      switch (tree.type) {
        case ARGUMENT_LIST:
          return this.transformArgumentListTree(tree.asArgumentList());
        case ARRAY_LITERAL_EXPRESSION:
          return this.transformArrayLiteralExpressionTree(tree.asArrayLiteralExpression());
        case ARRAY_PATTERN:
          return this.transformArrayPatternTree(tree.asArrayPattern());
        case AWAIT_STATEMENT:
          return this.transformAwaitStatementTree(tree.asAwaitStatement());
        case BINARY_OPERATOR:
          return this.transformBinaryOperatorTree(tree.asBinaryOperator());
        case BLOCK:
          return this.transformBlockTree(tree.asBlock());
        case BREAK_STATEMENT:
          return this.transformBreakStatementTree(tree.asBreakStatement());
        case CALL_EXPRESSION:
          return this.transformCallExpressionTree(tree.asCallExpression());
        case CASE_CLAUSE:
          return this.transformCaseClauseTree(tree.asCaseClause());
        case CATCH:
          return this.transformCatchTree(tree.asCatch());
        case CLASS_DECLARATION:
          return this.transformClassDeclarationTree(tree.asClassDeclaration());
        case CLASS_EXPRESSION:
          return this.transformClassExpressionTree(tree.asClassExpression());
        case COMMA_EXPRESSION:
          return this.transformCommaExpressionTree(tree.asCommaExpression());
        case CONDITIONAL_EXPRESSION:
          return this.transformConditionalExpressionTree(tree.asConditionalExpression());
        case CONTINUE_STATEMENT:
          return this.transformContinueStatementTree(tree.asContinueStatement());
        case DEBUGGER_STATEMENT:
          return this.transformDebuggerStatementTree(tree.asDebuggerStatement());
        case DEFAULT_CLAUSE:
          return this.transformDefaultClauseTree(tree.asDefaultClause());
        case DEFAULT_PARAMETER:
          return this.transformDefaultParameterTree(tree.asDefaultParameter());
        case DO_WHILE_STATEMENT:
          return this.transformDoWhileStatementTree(tree.asDoWhileStatement());
        case EMPTY_STATEMENT:
          return this.transformEmptyStatementTree(tree.asEmptyStatement());
        case EXPORT_DECLARATION:
          return this.transformExportDeclarationTree(tree.asExportDeclaration());
        case EXPRESSION_STATEMENT:
          return this.transformExpressionStatementTree(tree.asExpressionStatement());
        case FIELD_DECLARATION:
          return this.transformFieldDeclarationTree(tree.asFieldDeclaration());
        case FINALLY:
          return this.transformFinallyTree(tree.asFinally());
        case FOR_EACH_STATEMENT:
          return this.transformForEachStatementTree(tree.asForEachStatement());
        case FOR_IN_STATEMENT:
          return this.transformForInStatementTree(tree.asForInStatement());
        case FOR_STATEMENT:
          return this.transformForStatementTree(tree.asForStatement());
        case FORMAL_PARAMETER_LIST:
          return this.transformFormalParameterListTree(tree.asFormalParameterList());
        case FUNCTION_DECLARATION:
          return this.transformFunctionDeclarationTree(tree.asFunctionDeclaration());
        case GET_ACCESSOR:
          return this.transformGetAccessorTree(tree.asGetAccessor());
        case IDENTIFIER_EXPRESSION:
          return this.transformIdentifierExpressionTree(tree.asIdentifierExpression());
        case IF_STATEMENT:
          return this.transformIfStatementTree(tree.asIfStatement());
        case IMPORT_DECLARATION:
          return this.transformImportDeclarationTree(tree.asImportDeclaration());
        case IMPORT_PATH:
          return this.transformImportPathTree(tree.asImportPath());
        case IMPORT_SPECIFIER:
          return this.transformImportSpecifierTree(tree.asImportSpecifier());
        case LABELLED_STATEMENT:
          return this.transformLabelledStatementTree(tree.asLabelledStatement());
        case LITERAL_EXPRESSION:
          return this.transformLiteralExpressionTree(tree.asLiteralExpression());
        case MEMBER_EXPRESSION:
          return this.transformMemberExpressionTree(tree.asMemberExpression());
        case MEMBER_LOOKUP_EXPRESSION:
          return this.transformMemberLookupExpressionTree(tree.asMemberLookupExpression());
        case MISSING_PRIMARY_EXPRESSION:
          return this.transformMissingPrimaryExpressionTree(tree.asMissingPrimaryExpression());
        case MIXIN:
          return this.transformMixinTree(tree.asMixin());
        case MIXIN_RESOLVE:
          return this.transformMixinResolveTree(tree.asMixinResolve());
        case MIXIN_RESOLVE_LIST:
          return this.transformMixinResolveListTree(tree.asMixinResolveList());
        case MODULE_DECLARATION:
          return this.transformModuleDeclarationTree(tree.asModuleDeclaration());
        case MODULE_DEFINITION:
          return this.transformModuleDefinitionTree(tree.asModuleDefinition());
        case MODULE_EXPRESSION:
          return this.transformModuleExpressionTree(tree.asModuleExpression());
        case MODULE_REQUIRE:
          return this.transformModuleRequireTree(tree.asModuleRequire());
        case MODULE_SPECIFIER:
          return this.transformModuleSpecifierTree(tree.asModuleSpecifier());
        case NEW_EXPRESSION:
          return this.transformNewExpressionTree(tree.asNewExpression());
        case NULL:
          return this.transformNullTree(tree.asNull());
        case OBJECT_LITERAL_EXPRESSION:
          return this.transformObjectLiteralExpressionTree(tree.asObjectLiteralExpression());
        case OBJECT_PATTERN:
          return this.transformObjectPatternTree(tree.asObjectPattern());
        case OBJECT_PATTERN_FIELD:
          return this.transformObjectPatternFieldTree(tree.asObjectPatternField());
        case PAREN_EXPRESSION:
          return this.transformParenExpressionTree(tree.asParenExpression());
        case POSTFIX_EXPRESSION:
          return this.transformPostfixExpressionTree(tree.asPostfixExpression());
        case PROGRAM:
          return this.transformProgramTree(tree.asProgram());
        case PROPERTY_NAME_ASSIGNMENT:
          return this.transformPropertyNameAssignmentTree(tree.asPropertyNameAssignment());
        case REQUIRES_MEMBER:
          return this.transformRequiresMemberTree(tree.asRequiresMember());
        case REST_PARAMETER:
          return this.transformRestParameterTree(tree.asRestParameter());
        case RETURN_STATEMENT:
          return this.transformReturnStatementTree(tree.asReturnStatement());
        case SET_ACCESSOR:
          return this.transformSetAccessorTree(tree.asSetAccessor());
        case SPREAD_EXPRESSION:
          return this.transformSpreadExpressionTree(tree.asSpreadExpression());
        case SPREAD_PATTERN_ELEMENT:
          return this.transformSpreadPatternElementTree(tree.asSpreadPatternElement());
        case STATE_MACHINE:
          return this.transformStateMachineTree(tree.asStateMachine());
        case SUPER_EXPRESSION:
          return this.transformSuperExpressionTree(tree.asSuperExpression());
        case SWITCH_STATEMENT:
          return this.transformSwitchStatementTree(tree.asSwitchStatement());
        case THIS_EXPRESSION:
          return this.transformThisExpressionTree(tree.asThisExpression());
        case THROW_STATEMENT:
          return this.transformThrowStatementTree(tree.asThrowStatement());
        case TRAIT_DECLARATION:
          return this.transformTraitDeclarationTree(tree.asTraitDeclaration());
        case TRY_STATEMENT:
          return this.transformTryStatementTree(tree.asTryStatement());
        case UNARY_EXPRESSION:
          return this.transformUnaryExpressionTree(tree.asUnaryExpression());
        case VARIABLE_DECLARATION:
          return this.transformVariableDeclarationTree(tree.asVariableDeclaration());
        case VARIABLE_DECLARATION_LIST:
          return this.transformVariableDeclarationListTree(tree.asVariableDeclarationList());
        case VARIABLE_STATEMENT:
          return this.transformVariableStatementTree(tree.asVariableStatement());
        case WHILE_STATEMENT:
          return this.transformWhileStatementTree(tree.asWhileStatement());
        case WITH_STATEMENT:
          return this.transformWithStatementTree(tree.asWithStatement());
        case YIELD_STATEMENT:
          return this.transformYieldStatementTree(tree.asYieldStatement());
        default:
          throw new Error('Should never get here!');
      }
    },

    /**
     * @param {Array.<ParseTree>} list
     * @return {Array.<ParseTree>}
     */
    transformList: function(list) {
      if (list == null || list.length == 0) {
        return list;
      }

      var builder = null;

      for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var transformed = this.transformAny(element);

        if (builder != null || element != transformed) {
          if (builder == null) {
            builder = list.slice(0, index);
          }
          builder.push(transformed);
        }
      }

      return builder || list;
    },

    /**
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    toSourceElement: function(tree) {
      return tree.isSourceElement() ? tree : createExpressionStatement(tree);
    },

    /**
     * @param {Array.<ParseTree>} list
     * @return {Array.<ParseTree>}
     */
    transformSourceElements: function(list) {
      if (list == null || list.length == 0) {
        return list;
      }

      var builder = null;

      for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var transformed = this.toSourceElement(this.transformAny(element));

        if (builder != null || element != transformed) {
          if (builder == null) {
            builder = list.slice(0, index);
          }
          builder.push(transformed);
        }
      }

      return builder || list;
    },

    /**
     * @param {ArgumentListTree} tree
     * @return {ParseTree}
     */
    transformArgumentListTree: function(tree) {
      var args = this.transformList(tree.args);
      if (args == tree.args) {
        return tree;
      }
      return createArgumentList(args);
    },

    /**
     * @param {ArrayLiteralExpressionTree} tree
     * @return {ParseTree}
     */
    transformArrayLiteralExpressionTree: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return createArrayLiteralExpression(elements);
    },

    /**
     * @param {ArrayPatternTree} tree
     * @return {ParseTree}
     */
    transformArrayPatternTree: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return createArrayPattern(elements);
    },

    /**
     * @param {AwaitStatementTree} tree
     * @return {ParseTree}
     */
    transformAwaitStatementTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (tree.expression == expression) {
        return tree;
      }
      return new AwaitStatementTree(null, tree.identifier, expression);
    },

    /**
     * @param {BinaryOperatorTree} tree
     * @return {ParseTree}
     */
    transformBinaryOperatorTree: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left == tree.left && right == tree.right) {
        return tree;
      }
      return createBinaryOperator(left, tree.operator, right);
    },

    /**
     * @param {BlockTree} tree
     * @return {ParseTree}
     */
    transformBlockTree: function(tree) {
      var elements = this.transformList(tree.statements);
      if (elements == tree.statements) {
        return tree;
      }
      return createBlock(elements);
    },

    /**
     * @param {BreakStatementTree} tree
     * @return {ParseTree}
     */
    transformBreakStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {CallExpressionTree} tree
     * @return {ParseTree}
     */
    transformCallExpressionTree: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args).asArgumentList();
      if (operand == tree.operand && args == tree.args) {
        return tree;
      }
      return createCallExpression(operand, args);
    },

    /**
     * @param {CaseClauseTree} tree
     * @return {ParseTree}
     */
    transformCaseClauseTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statements = this.transformList(tree.statements);
      if (expression == tree.expression && statements == tree.statements) {
        return tree;
      }
      return createCaseClause(expression, statements);
    },

    /**
     * @param {CatchTree} tree
     * @return {ParseTree}
     */
    transformCatchTree: function(tree) {
      var catchBody = this.transformAny(tree.catchBody);
      if (catchBody == tree.catchBody) {
        return tree;
      }
      return createCatch(tree.exceptionName, catchBody);
    },

    /**
     * @param {ClassDeclarationTree} tree
     * @return {ParseTree}
     */
    transformClassDeclarationTree: function(tree) {
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);

      if (superClass == tree.superClass && elements == tree.elements) {
        return tree;
      }
      return createClassDeclaration(tree.name, superClass, elements);
    },

    /**
     * @param {ClassExpressionTree} tree
     * @return {ParseTree}
     */
    transformClassExpressionTree: function(tree) {
      return tree;
    },

    /**
     * @param {CommaExpressionTree} tree
     * @return {ParseTree}
     */
    transformCommaExpressionTree: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions == tree.expressions) {
        return tree;
      }
      return createCommaExpression(expressions);
    },

    /**
     * @param {ConditionalExpressionTree} tree
     * @return {ParseTree}
     */
    transformConditionalExpressionTree: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition == tree.condition && left == tree.left && right == tree.right) {
        return tree;
      }
      return createConditionalExpression(condition, left, right);
    },

    /**
     * @param {ContinueStatementTree} tree
     * @return {ParseTree}
     */
    transformContinueStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {DebuggerStatementTree} tree
     * @return {ParseTree}
     */
    transformDebuggerStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {DefaultClauseTree} tree
     * @return {ParseTree}
     */
    transformDefaultClauseTree: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements == tree.statements) {
        return tree;
      }
      return createDefaultClause(statements);
    },

    /**
     * @param {DefaultParameterTree} tree
     * @return {ParseTree}
     */
    transformDefaultParameterTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createDefaultParameter(tree.identifier, expression);
    },

    /**
     * @param {DoWhileStatementTree} tree
     * @return {ParseTree}
     */
    transformDoWhileStatementTree: function(tree) {
      var body = this.transformAny(tree.body);
      var condition = this.transformAny(tree.condition);
      if (body == tree.body && condition == tree.condition) {
        return tree;
      }
      return createDoWhileStatement(body, condition);
    },

    /**
     * @param {EmptyStatementTree} tree
     * @return {ParseTree}
     */
    transformEmptyStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {ExportDeclarationTree} tree
     * @return {ParseTree}
     */
    transformExportDeclarationTree: function(tree) {
      var declaration = this.transformAny(tree.declaration);
      if (tree.declaration == declaration) {
        return tree;
      }
      return new ExportDeclarationTree(null, declaration);
    },

    /**
     * @param {ExpressionStatementTree} tree
     * @return {ParseTree}
     */
    transformExpressionStatementTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createExpressionStatement(expression);
    },

    /**
     * @param {FieldDeclarationTree} tree
     * @return {ParseTree}
     */
    transformFieldDeclarationTree: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      return createFieldDeclaration(tree.isStatic, tree.isConst, declarations);
    },

    /**
     * @param {FinallyTree} tree
     * @return {ParseTree}
     */
    transformFinallyTree: function(tree) {
      var block = this.transformAny(tree.block);
      if (block == tree.block) {
        return tree;
      }
      return createFinally(block);
    },

    /**
     * @param {ForEachStatementTree} tree
     * @return {ParseTree}
     */
    transformForEachStatementTree: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer == tree.initializer && collection == tree.collection &&
          body == tree.body) {
        return tree;
      }
      return createForEachStatement(initializer.asVariableDeclarationList(),
                                    collection, body);
    },

    /**
     * @param {ForInStatementTree} tree
     * @return {ParseTree}
     */
    transformForInStatementTree: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer == tree.initializer && collection == tree.collection &&
          body == tree.body) {
        return tree;
      }
      return createForInStatement(initializer, collection, body);
    },

    /**
     * @param {ForStatementTree} tree
     * @return {ParseTree}
     */
    transformForStatementTree: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var condition = this.transformAny(tree.condition);
      var increment = this.transformAny(tree.increment);
      var body = this.transformAny(tree.body);
      if (initializer == tree.initializer && condition == tree.condition &&
          increment == tree.increment && body == tree.body) {
        return tree;
      }
      return createForStatement(initializer, condition, increment, body);
    },

    /**
     * @param {FormalParameterListTree} tree
     * @return {ParseTree}
     */
    transformFormalParameterListTree: function(tree) {
      return tree;
    },

    /**
     * @param {FunctionDeclarationTree} tree
     * @return {ParseTree}
     */
    transformFunctionDeclarationTree: function(tree) {
      var parameters =
          this.transformAny(tree.formalParameterList).asFormalParameterList();
      var functionBody = this.transformAny(tree.functionBody).asBlock();
      if (parameters == tree.formalParameterList &&
          functionBody == tree.functionBody) {
        return tree;
      }
      return createFunctionDeclaration(tree.name, parameters, functionBody);
    },

    /**
     * @param {GetAccessorTree} tree
     * @return {ParseTree}
     */
    transformGetAccessorTree: function(tree) {
      var body = this.transformAny(tree.body).asBlock();
      if (body == tree.body) {
        return tree;
      }
      return createGetAccessor(tree.propertyName, tree.isStatic, body);
    },

    /**
     * @param {IdentifierExpressionTree} tree
     * @return {ParseTree}
     */
    transformIdentifierExpressionTree: function(tree) {
      return tree;
    },

    /**
     * @param {IfStatementTree} tree
     * @return {ParseTree}
     */
    transformIfStatementTree: function(tree) {
      var condition = this.transformAny(tree.condition);
      var ifClause = this.transformAny(tree.ifClause);
      var elseClause = this.transformAny(tree.elseClause);
      if (condition == tree.condition && ifClause == tree.ifClause && elseClause == tree.elseClause) {
        return tree;
      }
      return createIfStatement(condition, ifClause, elseClause);
    },

    /**
     * @param {ImportDeclarationTree} tree
     * @return {ParseTree}
     */
    transformImportDeclarationTree: function(tree) {
      var importPathList = this.transformList(tree.importPathList);
      if (importPathList == tree.importPathList) {
        return tree;
      }
      return new ImportDeclarationTree(null, importPathList);
    },

    /**
     * @param {ImportPathTree} tree
     * @return {ParseTree}
     */
    transformImportPathTree: function(tree) {
      if (tree.importSpecifierSet != null) {
        var importSpecifierSet = this.transformList(tree.importSpecifierSet);
        if (importSpecifierSet != tree.importSpecifierSet) {
          return new ImportPathTree(null, tree.qualifiedPath,
                                    importSpecifierSet);
        }
      }

      return tree;
    },

    /**
     * @param {ImportSpecifierTree} tree
     * @return {ParseTree}
     */
    transformImportSpecifierTree: function(tree) {
      return tree;
    },

    /**
     * @param {LabelledStatementTree} tree
     * @return {ParseTree}
     */
    transformLabelledStatementTree: function(tree) {
      var statement = this.transformAny(tree.statement);
      if (statement == tree.statement) {
        return tree;
      }
      return createLabelledStatement(tree.name, statement);
    },

    /**
     * @param {LiteralExpressionTree} tree
     * @return {ParseTree}
     */
    transformLiteralExpressionTree: function(tree) {
      return tree;
    },

    /**
     * @param {MemberExpressionTree} tree
     * @return {ParseTree}
     */
    transformMemberExpressionTree: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return createMemberExpression(operand, tree.memberName);
    },

    /**
     * @param {MemberLookupExpressionTree} tree
     * @return {ParseTree}
     */
    transformMemberLookupExpressionTree: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (operand == tree.operand &&
          memberExpression == tree.memberExpression) {
        return tree;
      }
      return createMemberLookupExpression(operand, memberExpression);
    },

    /**
     * @param {MissingPrimaryExpressionTree} tree
     * @return {ParseTree}
     */
    transformMissingPrimaryExpressionTree: function(tree) {
      throw new Error('Should never transform trees that had errors during parse');
    },

    /**
     * @param {MixinTree} tree
     * @return {ParseTree}
     */
    transformMixinTree: function(tree) {
      var mixinResolves = this.transformAny(tree.mixinResolves);
      if (mixinResolves == tree.mixinResolves) {
        return tree;
      }
      return createMixin(tree.name, mixinResolves);
    },

    /**
     * @param {MixinResolveTree} tree
     * @return {ParseTree}
     */
    transformMixinResolveTree: function(tree) {
      return tree;
    },

    /**
     * @param {MixinResolveListTree} tree
     * @return {ParseTree}
     */
    transformMixinResolveListTree: function(tree) {
      var resolves = this.transformList(tree.resolves);
      if (resolves == tree.resolves) {
        return tree;
      }
      return createMixinResolveList(resolves);
    },

    /**
     * @param {ModuleDeclarationTree} tree
     * @return {ParseTree}
     */
    transformModuleDeclarationTree: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers == tree.specifiers) {
        return tree;
      }

      return new ModuleDeclarationTree(null, specifiers);
    },

    /**
     * @param {ModuleDefinitionTree} tree
     * @return {ParseTree}
     */
    transformModuleDefinitionTree: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }

      return new ModuleDefinitionTree(null, tree.name, elements);
    },

    /**
     * @param {ModuleExpressionTree} tree
     * @return {ParseTree}
     */
    transformModuleExpressionTree: function(tree) {
      var reference = this.transformAny(tree.reference);
      if (reference == tree.reference) {
        return tree;
      }
      return new ModuleExpressionTree(null, reference, tree.identifiers);
    },

    /**
     * @param {ModuleRequireTree} tree
     * @return {ParseTree}
     */
    transformModuleRequireTree: function(tree) {
      return tree;
    },

    /**
     * @param {ModuleSpecifierTree} tree
     * @return {ParseTree}
     */
    transformModuleSpecifierTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new ModuleSpecifierTree(null, tree.identifier, expression);
    },

    /**
     * @param {NewExpressionTree} tree
     * @return {ParseTree}
     */
    transformNewExpressionTree: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);

      if (operand == tree.operand && args == tree.args) {
        return tree;
      }
      return createNewExpression(operand, args);
    },

    /**
     * @param {NullTree} tree
     * @return {ParseTree}
     */
    transformNullTree: function(tree) {
      return tree;
    },

    /**
     * @param {ObjectLiteralExpressionTree} tree
     * @return {ParseTree}
     */
    transformObjectLiteralExpressionTree: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues == tree.propertyNameAndValues) {
        return tree;
      }
      return createObjectLiteralExpression(propertyNameAndValues);
    },

    /**
     * @param {ObjectPatternTree} tree
     * @return {ParseTree}
     */
    transformObjectPatternTree: function(tree) {
      var fields = this.transformList(tree.fields);
      if (fields == tree.fields) {
        return tree;
      }
      return createObjectPattern(fields);
    },

    /**
     * @param {ObjectPatternFieldTree} tree
     * @return {ParseTree}
     */
    transformObjectPatternFieldTree: function(tree) {
      var element = this.transformAny(tree.element);
      if (element == tree.element) {
        return tree;
      }
      return createObjectPatternField(tree.identifier, element);
    },

    /**
     * @param {ParenExpressionTree} tree
     * @return {ParseTree}
     */
    transformParenExpressionTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createParenExpression(expression);
    },

    /**
     * @param {PostfixExpressionTree} tree
     * @return {ParseTree}
     */
    transformPostfixExpressionTree: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return createPostfixExpression(operand, tree.operator);
    },

    /**
     * @param {ProgramTree} tree
     * @return {ParseTree}
     */
    transformProgramTree: function(tree) {
      var elements = this.transformList(tree.sourceElements);
      if (elements == tree.sourceElements) {
        return tree;
      }
      return new ProgramTree(null, elements);
    },

    /**
     * @param {PropertyNameAssignmentTree} tree
     * @return {ParseTree}
     */
    transformPropertyNameAssignmentTree: function(tree) {
      var value = this.transformAny(tree.value);
      if (value == tree.value) {
        return tree;
      }
      return createPropertyNameAssignment(tree.name, value);
    },

    /**
     * @param {RequiresMemberTree} tree
     * @return {ParseTree}
     */
    transformRequiresMemberTree: function(tree) {
      return tree;
    },

    /**
     * @param {RestParameterTree} tree
     * @return {ParseTree}
     */
    transformRestParameterTree: function(tree) {
      return tree;
    },

    /**
     * @param {ReturnStatementTree} tree
     * @return {ParseTree}
     */
    transformReturnStatementTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createReturnStatement(expression);
    },

    /**
     * @param {SetAccessorTree} tree
     * @return {ParseTree}
     */
    transformSetAccessorTree: function(tree) {
      var body = this.transformAny(tree.body).asBlock();
      if (body == tree.body) {
        return tree;
      }
      return createSetAccessor(tree.propertyName, tree.isStatic, tree.parameter, body);
    },

    /**
     * @param {SpreadExpressionTree} tree
     * @return {ParseTree}
     */
    transformSpreadExpressionTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createSpreadExpression(expression);
    },

    /**
     * @param {SpreadPatternElementTree} tree
     * @return {ParseTree}
     */
    transformSpreadPatternElementTree: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      if (lvalue == tree.lvalue) {
        return tree;
      }
      return createSpreadPatternElement(lvalue);
    },

    /**
     * @param {StateMachineTree} tree
     * @return {ParseTree}
     */
    transformStateMachineTree: function(tree) {
      throw new Error();
    },

    /**
     * @param {SuperExpressionTree} tree
     * @return {ParseTree}
     */
    transformSuperExpressionTree: function(tree) {
      return tree;
    },

    /**
     * @param {SwitchStatementTree} tree
     * @return {ParseTree}
     */
    transformSwitchStatementTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      var caseClauses = this.transformList(tree.caseClauses);
      if (expression == tree.expression && caseClauses == tree.caseClauses) {
        return tree;
      }
      return createSwitchStatement(expression, caseClauses);
    },

    /**
     * @param {ThisExpressionTree} tree
     * @return {ParseTree}
     */
    transformThisExpressionTree: function(tree) {
      return tree;
    },

    /**
     * @param {ThrowStatementTree} tree
     * @return {ParseTree}
     */
    transformThrowStatementTree: function(tree) {
      var value = this.transformAny(tree.value);
      if (value == tree.value) {
        return tree;
      }
      return createThrowStatement(value);
    },

    /**
     * @param {TraitDeclarationTree} tree
     * @return {ParseTree}
     */
    transformTraitDeclarationTree: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return createTraitDeclaration(tree.name, elements);
    },

    /**
     * @param {TryStatementTree} tree
     * @return {ParseTree}
     */
    transformTryStatementTree: function(tree) {
      var body = this.transformAny(tree.body);
      var catchBlock = this.transformAny(tree.catchBlock);
      var finallyBlock = this.transformAny(tree.finallyBlock);
      if (body == tree.body && catchBlock == tree.catchBlock &&
          finallyBlock == tree.finallyBlock) {
        return tree;
      }
      return createTryStatement(body, catchBlock, finallyBlock);
    },

    /**
     * @param {UnaryExpressionTree} tree
     * @return {ParseTree}
     */
    transformUnaryExpressionTree: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return createUnaryExpression(tree.operator, operand);
    },

    /**
     * @param {VariableDeclarationTree} tree
     * @return {ParseTree}
     */
    transformVariableDeclarationTree: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var initializer = this.transformAny(tree.initializer);
      if (lvalue == tree.lvalue && initializer == tree.initializer) {
        return tree;
      }
      return createVariableDeclaration(lvalue, initializer);
    },

    /**
     * @param {VariableDeclarationListTree} tree
     * @return {ParseTree}
     */
    transformVariableDeclarationListTree: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      return createVariableDeclarationList(tree.declarationType, declarations);
    },

    /**
     * @param {VariableStatementTree} tree
     * @return {ParseTree}
     */
    transformVariableStatementTree: function(tree) {
      var declarations = this.transformAny(tree.declarations).
          asVariableDeclarationList();
      if (declarations == tree.declarations) {
        return tree;
      }
      return createVariableStatement(declarations);
    },

    /**
     * @param {WhileStatementTree} tree
     * @return {ParseTree}
     */
    transformWhileStatementTree: function(tree) {
      var condition = this.transformAny(tree.condition);
      var body = this.transformAny(tree.body);
      if (condition == tree.condition && body == tree.body) {
        return tree;
      }
      return createWhileStatement(condition, body);
    },

    /**
     * @param {WithStatementTree} tree
     * @return {ParseTree}
     */
    transformWithStatementTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      var body = this.transformAny(tree.body);
      if (expression == tree.expression && body == tree.body) {
        return tree;
      }
      return createWithStatement(expression, body);
    },

    /**
     * @param {YieldStatementTree} tree
     * @return {ParseTree}
     */
    transformYieldStatementTree: function(tree) {
      var expression = this.transformAny(tree.expression);
      var isYieldFor = tree.isYieldFor;
      if (expression == tree.expression) {
        return tree;
      }
      return createYieldStatement(expression, isYieldFor);
    }
  };

  return {
    ParseTreeTransformer: ParseTreeTransformer
  };
});
