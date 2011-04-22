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


  var AwaitStatement = traceur.syntax.trees.AwaitStatement;
  var ExportDeclaration = traceur.syntax.trees.ExportDeclaration;
  var ImportDeclaration = traceur.syntax.trees.ImportDeclaration;
  var ImportPath = traceur.syntax.trees.ImportPath;
  var ModuleDeclaration = traceur.syntax.trees.ModuleDeclaration;
  var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
  var ModuleExpression = traceur.syntax.trees.ModuleExpression;
  var ModuleSpecifier = traceur.syntax.trees.ModuleSpecifier;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var Program = traceur.syntax.trees.Program;

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
          return this.transformArgumentList(tree.asArgumentList());
        case ARRAY_LITERAL_EXPRESSION:
          return this.transformArrayLiteralExpression(tree.asArrayLiteralExpression());
        case ARRAY_PATTERN:
          return this.transformArrayPattern(tree.asArrayPattern());
        case AWAIT_STATEMENT:
          return this.transformAwaitStatement(tree.asAwaitStatement());
        case BINARY_OPERATOR:
          return this.transformBinaryOperator(tree.asBinaryOperator());
        case BLOCK:
          return this.transformBlock(tree.asBlock());
        case BREAK_STATEMENT:
          return this.transformBreakStatement(tree.asBreakStatement());
        case CALL_EXPRESSION:
          return this.transformCallExpression(tree.asCallExpression());
        case CASE_CLAUSE:
          return this.transformCaseClause(tree.asCaseClause());
        case CATCH:
          return this.transformCatch(tree.asCatch());
        case CLASS_DECLARATION:
          return this.transformClassDeclaration(tree.asClassDeclaration());
        case CLASS_EXPRESSION:
          return this.transformClassExpression(tree.asClassExpression());
        case COMMA_EXPRESSION:
          return this.transformCommaExpression(tree.asCommaExpression());
        case CONDITIONAL_EXPRESSION:
          return this.transformConditionalExpression(tree.asConditionalExpression());
        case CONTINUE_STATEMENT:
          return this.transformContinueStatement(tree.asContinueStatement());
        case DEBUGGER_STATEMENT:
          return this.transformDebuggerStatement(tree.asDebuggerStatement());
        case DEFAULT_CLAUSE:
          return this.transformDefaultClause(tree.asDefaultClause());
        case DEFAULT_PARAMETER:
          return this.transformDefaultParameter(tree.asDefaultParameter());
        case DO_WHILE_STATEMENT:
          return this.transformDoWhileStatement(tree.asDoWhileStatement());
        case EMPTY_STATEMENT:
          return this.transformEmptyStatement(tree.asEmptyStatement());
        case EXPORT_DECLARATION:
          return this.transformExportDeclaration(tree.asExportDeclaration());
        case EXPRESSION_STATEMENT:
          return this.transformExpressionStatement(tree.asExpressionStatement());
        case FIELD_DECLARATION:
          return this.transformFieldDeclaration(tree.asFieldDeclaration());
        case FINALLY:
          return this.transformFinally(tree.asFinally());
        case FOR_EACH_STATEMENT:
          return this.transformForEachStatement(tree.asForEachStatement());
        case FOR_IN_STATEMENT:
          return this.transformForInStatement(tree.asForInStatement());
        case FOR_STATEMENT:
          return this.transformForStatement(tree.asForStatement());
        case FORMAL_PARAMETER_LIST:
          return this.transformFormalParameterList(tree.asFormalParameterList());
        case FUNCTION_DECLARATION:
          return this.transformFunctionDeclaration(tree.asFunctionDeclaration());
        case GET_ACCESSOR:
          return this.transformGetAccessor(tree.asGetAccessor());
        case IDENTIFIER_EXPRESSION:
          return this.transformIdentifierExpression(tree.asIdentifierExpression());
        case IF_STATEMENT:
          return this.transformIfStatement(tree.asIfStatement());
        case IMPORT_DECLARATION:
          return this.transformImportDeclaration(tree.asImportDeclaration());
        case IMPORT_PATH:
          return this.transformImportPath(tree.asImportPath());
        case IMPORT_SPECIFIER:
          return this.transformImportSpecifier(tree.asImportSpecifier());
        case LABELLED_STATEMENT:
          return this.transformLabelledStatement(tree.asLabelledStatement());
        case LITERAL_EXPRESSION:
          return this.transformLiteralExpression(tree.asLiteralExpression());
        case MEMBER_EXPRESSION:
          return this.transformMemberExpression(tree.asMemberExpression());
        case MEMBER_LOOKUP_EXPRESSION:
          return this.transformMemberLookupExpression(tree.asMemberLookupExpression());
        case MISSING_PRIMARY_EXPRESSION:
          return this.transformMissingPrimaryExpression(tree.asMissingPrimaryExpression());
        case MIXIN:
          return this.transformMixin(tree.asMixin());
        case MIXIN_RESOLVE:
          return this.transformMixinResolve(tree.asMixinResolve());
        case MIXIN_RESOLVE_LIST:
          return this.transformMixinResolveList(tree.asMixinResolveList());
        case MODULE_DECLARATION:
          return this.transformModuleDeclaration(tree.asModuleDeclaration());
        case MODULE_DEFINITION:
          return this.transformModuleDefinition(tree.asModuleDefinition());
        case MODULE_EXPRESSION:
          return this.transformModuleExpression(tree.asModuleExpression());
        case MODULE_REQUIRE:
          return this.transformModuleRequire(tree.asModuleRequire());
        case MODULE_SPECIFIER:
          return this.transformModuleSpecifier(tree.asModuleSpecifier());
        case NEW_EXPRESSION:
          return this.transformNewExpression(tree.asNewExpression());
        case NULL:
          return this.transformNullTree(tree.asNull());
        case OBJECT_LITERAL_EXPRESSION:
          return this.transformObjectLiteralExpression(tree.asObjectLiteralExpression());
        case OBJECT_PATTERN:
          return this.transformObjectPattern(tree.asObjectPattern());
        case OBJECT_PATTERN_FIELD:
          return this.transformObjectPatternField(tree.asObjectPatternField());
        case PAREN_EXPRESSION:
          return this.transformParenExpression(tree.asParenExpression());
        case POSTFIX_EXPRESSION:
          return this.transformPostfixExpression(tree.asPostfixExpression());
        case PROGRAM:
          return this.transformProgram(tree.asProgram());
        case PROPERTY_NAME_ASSIGNMENT:
          return this.transformPropertyNameAssignment(tree.asPropertyNameAssignment());
        case REQUIRES_MEMBER:
          return this.transformRequiresMember(tree.asRequiresMember());
        case REST_PARAMETER:
          return this.transformRestParameter(tree.asRestParameter());
        case RETURN_STATEMENT:
          return this.transformReturnStatement(tree.asReturnStatement());
        case SET_ACCESSOR:
          return this.transformSetAccessor(tree.asSetAccessor());
        case SPREAD_EXPRESSION:
          return this.transformSpreadExpression(tree.asSpreadExpression());
        case SPREAD_PATTERN_ELEMENT:
          return this.transformSpreadPatternElement(tree.asSpreadPatternElement());
        case STATE_MACHINE:
          return this.transformStateMachineTree(tree.asStateMachine());
        case SUPER_EXPRESSION:
          return this.transformSuperExpression(tree.asSuperExpression());
        case SWITCH_STATEMENT:
          return this.transformSwitchStatement(tree.asSwitchStatement());
        case THIS_EXPRESSION:
          return this.transformThisExpression(tree.asThisExpression());
        case THROW_STATEMENT:
          return this.transformThrowStatement(tree.asThrowStatement());
        case TRAIT_DECLARATION:
          return this.transformTraitDeclaration(tree.asTraitDeclaration());
        case TRY_STATEMENT:
          return this.transformTryStatement(tree.asTryStatement());
        case UNARY_EXPRESSION:
          return this.transformUnaryExpression(tree.asUnaryExpression());
        case VARIABLE_DECLARATION:
          return this.transformVariableDeclaration(tree.asVariableDeclaration());
        case VARIABLE_DECLARATION_LIST:
          return this.transformVariableDeclarationList(tree.asVariableDeclarationList());
        case VARIABLE_STATEMENT:
          return this.transformVariableStatement(tree.asVariableStatement());
        case WHILE_STATEMENT:
          return this.transformWhileStatement(tree.asWhileStatement());
        case WITH_STATEMENT:
          return this.transformWithStatement(tree.asWithStatement());
        case YIELD_STATEMENT:
          return this.transformYieldStatement(tree.asYieldStatement());
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
     * @param {ArgumentList} tree
     * @return {ParseTree}
     */
    transformArgumentList: function(tree) {
      var args = this.transformList(tree.args);
      if (args == tree.args) {
        return tree;
      }
      return createArgumentList(args);
    },

    /**
     * @param {ArrayLiteralExpression} tree
     * @return {ParseTree}
     */
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return createArrayLiteralExpression(elements);
    },

    /**
     * @param {ArrayPattern} tree
     * @return {ParseTree}
     */
    transformArrayPattern: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return createArrayPattern(elements);
    },

    /**
     * @param {AwaitStatement} tree
     * @return {ParseTree}
     */
    transformAwaitStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (tree.expression == expression) {
        return tree;
      }
      return new AwaitStatement(null, tree.identifier, expression);
    },

    /**
     * @param {BinaryOperator} tree
     * @return {ParseTree}
     */
    transformBinaryOperator: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left == tree.left && right == tree.right) {
        return tree;
      }
      return createBinaryOperator(left, tree.operator, right);
    },

    /**
     * @param {Block} tree
     * @return {ParseTree}
     */
    transformBlock: function(tree) {
      var elements = this.transformList(tree.statements);
      if (elements == tree.statements) {
        return tree;
      }
      return createBlock(elements);
    },

    /**
     * @param {BreakStatement} tree
     * @return {ParseTree}
     */
    transformBreakStatement: function(tree) {
      return tree;
    },

    /**
     * @param {CallExpression} tree
     * @return {ParseTree}
     */
    transformCallExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args).asArgumentList();
      if (operand == tree.operand && args == tree.args) {
        return tree;
      }
      return createCallExpression(operand, args);
    },

    /**
     * @param {CaseClause} tree
     * @return {ParseTree}
     */
    transformCaseClause: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statements = this.transformList(tree.statements);
      if (expression == tree.expression && statements == tree.statements) {
        return tree;
      }
      return createCaseClause(expression, statements);
    },

    /**
     * @param {Catch} tree
     * @return {ParseTree}
     */
    transformCatch: function(tree) {
      var catchBody = this.transformAny(tree.catchBody);
      if (catchBody == tree.catchBody) {
        return tree;
      }
      return createCatch(tree.exceptionName, catchBody);
    },

    /**
     * @param {ClassDeclaration} tree
     * @return {ParseTree}
     */
    transformClassDeclaration: function(tree) {
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);

      if (superClass == tree.superClass && elements == tree.elements) {
        return tree;
      }
      return createClassDeclaration(tree.name, superClass, elements);
    },

    /**
     * @param {ClassExpression} tree
     * @return {ParseTree}
     */
    transformClassExpression: function(tree) {
      return tree;
    },

    /**
     * @param {CommaExpression} tree
     * @return {ParseTree}
     */
    transformCommaExpression: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions == tree.expressions) {
        return tree;
      }
      return createCommaExpression(expressions);
    },

    /**
     * @param {ConditionalExpression} tree
     * @return {ParseTree}
     */
    transformConditionalExpression: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition == tree.condition && left == tree.left && right == tree.right) {
        return tree;
      }
      return createConditionalExpression(condition, left, right);
    },

    /**
     * @param {ContinueStatement} tree
     * @return {ParseTree}
     */
    transformContinueStatement: function(tree) {
      return tree;
    },

    /**
     * @param {DebuggerStatement} tree
     * @return {ParseTree}
     */
    transformDebuggerStatement: function(tree) {
      return tree;
    },

    /**
     * @param {DefaultClause} tree
     * @return {ParseTree}
     */
    transformDefaultClause: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements == tree.statements) {
        return tree;
      }
      return createDefaultClause(statements);
    },

    /**
     * @param {DefaultParameter} tree
     * @return {ParseTree}
     */
    transformDefaultParameter: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createDefaultParameter(tree.identifier, expression);
    },

    /**
     * @param {DoWhileStatement} tree
     * @return {ParseTree}
     */
    transformDoWhileStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var condition = this.transformAny(tree.condition);
      if (body == tree.body && condition == tree.condition) {
        return tree;
      }
      return createDoWhileStatement(body, condition);
    },

    /**
     * @param {EmptyStatement} tree
     * @return {ParseTree}
     */
    transformEmptyStatement: function(tree) {
      return tree;
    },

    /**
     * @param {ExportDeclaration} tree
     * @return {ParseTree}
     */
    transformExportDeclaration: function(tree) {
      var declaration = this.transformAny(tree.declaration);
      if (tree.declaration == declaration) {
        return tree;
      }
      return new ExportDeclaration(null, declaration);
    },

    /**
     * @param {ExpressionStatement} tree
     * @return {ParseTree}
     */
    transformExpressionStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createExpressionStatement(expression);
    },

    /**
     * @param {FieldDeclaration} tree
     * @return {ParseTree}
     */
    transformFieldDeclaration: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      return createFieldDeclaration(tree.isStatic, tree.isConst, declarations);
    },

    /**
     * @param {Finally} tree
     * @return {ParseTree}
     */
    transformFinally: function(tree) {
      var block = this.transformAny(tree.block);
      if (block == tree.block) {
        return tree;
      }
      return createFinally(block);
    },

    /**
     * @param {ForEachStatement} tree
     * @return {ParseTree}
     */
    transformForEachStatement: function(tree) {
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
     * @param {ForInStatement} tree
     * @return {ParseTree}
     */
    transformForInStatement: function(tree) {
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
     * @param {ForStatement} tree
     * @return {ParseTree}
     */
    transformForStatement: function(tree) {
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
     * @param {FormalParameterList} tree
     * @return {ParseTree}
     */
    transformFormalParameterList: function(tree) {
      return tree;
    },

    /**
     * @param {FunctionDeclaration} tree
     * @return {ParseTree}
     */
    transformFunctionDeclaration: function(tree) {
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
     * @param {GetAccessor} tree
     * @return {ParseTree}
     */
    transformGetAccessor: function(tree) {
      var body = this.transformAny(tree.body).asBlock();
      if (body == tree.body) {
        return tree;
      }
      return createGetAccessor(tree.propertyName, tree.isStatic, body);
    },

    /**
     * @param {IdentifierExpression} tree
     * @return {ParseTree}
     */
    transformIdentifierExpression: function(tree) {
      return tree;
    },

    /**
     * @param {IfStatement} tree
     * @return {ParseTree}
     */
    transformIfStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var ifClause = this.transformAny(tree.ifClause);
      var elseClause = this.transformAny(tree.elseClause);
      if (condition == tree.condition && ifClause == tree.ifClause && elseClause == tree.elseClause) {
        return tree;
      }
      return createIfStatement(condition, ifClause, elseClause);
    },

    /**
     * @param {ImportDeclaration} tree
     * @return {ParseTree}
     */
    transformImportDeclaration: function(tree) {
      var importPathList = this.transformList(tree.importPathList);
      if (importPathList == tree.importPathList) {
        return tree;
      }
      return new ImportDeclaration(null, importPathList);
    },

    /**
     * @param {ImportPath} tree
     * @return {ParseTree}
     */
    transformImportPath: function(tree) {
      if (tree.importSpecifierSet != null) {
        var importSpecifierSet = this.transformList(tree.importSpecifierSet);
        if (importSpecifierSet != tree.importSpecifierSet) {
          return new ImportPath(null, tree.qualifiedPath,
                                    importSpecifierSet);
        }
      }

      return tree;
    },

    /**
     * @param {ImportSpecifier} tree
     * @return {ParseTree}
     */
    transformImportSpecifier: function(tree) {
      return tree;
    },

    /**
     * @param {LabelledStatement} tree
     * @return {ParseTree}
     */
    transformLabelledStatement: function(tree) {
      var statement = this.transformAny(tree.statement);
      if (statement == tree.statement) {
        return tree;
      }
      return createLabelledStatement(tree.name, statement);
    },

    /**
     * @param {LiteralExpression} tree
     * @return {ParseTree}
     */
    transformLiteralExpression: function(tree) {
      return tree;
    },

    /**
     * @param {MemberExpression} tree
     * @return {ParseTree}
     */
    transformMemberExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return createMemberExpression(operand, tree.memberName);
    },

    /**
     * @param {MemberLookupExpression} tree
     * @return {ParseTree}
     */
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (operand == tree.operand &&
          memberExpression == tree.memberExpression) {
        return tree;
      }
      return createMemberLookupExpression(operand, memberExpression);
    },

    /**
     * @param {MissingPrimaryExpression} tree
     * @return {ParseTree}
     */
    transformMissingPrimaryExpression: function(tree) {
      throw new Error('Should never transform trees that had errors during parse');
    },

    /**
     * @param {Mixin} tree
     * @return {ParseTree}
     */
    transformMixin: function(tree) {
      var mixinResolves = this.transformAny(tree.mixinResolves);
      if (mixinResolves == tree.mixinResolves) {
        return tree;
      }
      return createMixin(tree.name, mixinResolves);
    },

    /**
     * @param {MixinResolve} tree
     * @return {ParseTree}
     */
    transformMixinResolve: function(tree) {
      return tree;
    },

    /**
     * @param {MixinResolveList} tree
     * @return {ParseTree}
     */
    transformMixinResolveList: function(tree) {
      var resolves = this.transformList(tree.resolves);
      if (resolves == tree.resolves) {
        return tree;
      }
      return createMixinResolveList(resolves);
    },

    /**
     * @param {ModuleDeclaration} tree
     * @return {ParseTree}
     */
    transformModuleDeclaration: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers == tree.specifiers) {
        return tree;
      }

      return new ModuleDeclaration(null, specifiers);
    },

    /**
     * @param {ModuleDefinition} tree
     * @return {ParseTree}
     */
    transformModuleDefinition: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }

      return new ModuleDefinition(null, tree.name, elements);
    },

    /**
     * @param {ModuleExpression} tree
     * @return {ParseTree}
     */
    transformModuleExpression: function(tree) {
      var reference = this.transformAny(tree.reference);
      if (reference == tree.reference) {
        return tree;
      }
      return new ModuleExpression(null, reference, tree.identifiers);
    },

    /**
     * @param {ModuleRequire} tree
     * @return {ParseTree}
     */
    transformModuleRequire: function(tree) {
      return tree;
    },

    /**
     * @param {ModuleSpecifier} tree
     * @return {ParseTree}
     */
    transformModuleSpecifier: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new ModuleSpecifier(null, tree.identifier, expression);
    },

    /**
     * @param {NewExpression} tree
     * @return {ParseTree}
     */
    transformNewExpression: function(tree) {
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
     * @param {ObjectLiteralExpression} tree
     * @return {ParseTree}
     */
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues == tree.propertyNameAndValues) {
        return tree;
      }
      return createObjectLiteralExpression(propertyNameAndValues);
    },

    /**
     * @param {ObjectPattern} tree
     * @return {ParseTree}
     */
    transformObjectPattern: function(tree) {
      var fields = this.transformList(tree.fields);
      if (fields == tree.fields) {
        return tree;
      }
      return createObjectPattern(fields);
    },

    /**
     * @param {ObjectPatternField} tree
     * @return {ParseTree}
     */
    transformObjectPatternField: function(tree) {
      var element = this.transformAny(tree.element);
      if (element == tree.element) {
        return tree;
      }
      return createObjectPatternField(tree.identifier, element);
    },

    /**
     * @param {ParenExpression} tree
     * @return {ParseTree}
     */
    transformParenExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createParenExpression(expression);
    },

    /**
     * @param {PostfixExpression} tree
     * @return {ParseTree}
     */
    transformPostfixExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return createPostfixExpression(operand, tree.operator);
    },

    /**
     * @param {Program} tree
     * @return {ParseTree}
     */
    transformProgram: function(tree) {
      var elements = this.transformList(tree.sourceElements);
      if (elements == tree.sourceElements) {
        return tree;
      }
      return new Program(null, elements);
    },

    /**
     * @param {PropertyNameAssignment} tree
     * @return {ParseTree}
     */
    transformPropertyNameAssignment: function(tree) {
      var value = this.transformAny(tree.value);
      if (value == tree.value) {
        return tree;
      }
      return createPropertyNameAssignment(tree.name, value);
    },

    /**
     * @param {RequiresMember} tree
     * @return {ParseTree}
     */
    transformRequiresMember: function(tree) {
      return tree;
    },

    /**
     * @param {RestParameter} tree
     * @return {ParseTree}
     */
    transformRestParameter: function(tree) {
      return tree;
    },

    /**
     * @param {ReturnStatement} tree
     * @return {ParseTree}
     */
    transformReturnStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createReturnStatement(expression);
    },

    /**
     * @param {SetAccessor} tree
     * @return {ParseTree}
     */
    transformSetAccessor: function(tree) {
      var body = this.transformAny(tree.body).asBlock();
      if (body == tree.body) {
        return tree;
      }
      return createSetAccessor(tree.propertyName, tree.isStatic, tree.parameter, body);
    },

    /**
     * @param {SpreadExpression} tree
     * @return {ParseTree}
     */
    transformSpreadExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return createSpreadExpression(expression);
    },

    /**
     * @param {SpreadPatternElement} tree
     * @return {ParseTree}
     */
    transformSpreadPatternElement: function(tree) {
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
     * @param {SuperExpression} tree
     * @return {ParseTree}
     */
    transformSuperExpression: function(tree) {
      return tree;
    },

    /**
     * @param {SwitchStatement} tree
     * @return {ParseTree}
     */
    transformSwitchStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var caseClauses = this.transformList(tree.caseClauses);
      if (expression == tree.expression && caseClauses == tree.caseClauses) {
        return tree;
      }
      return createSwitchStatement(expression, caseClauses);
    },

    /**
     * @param {ThisExpression} tree
     * @return {ParseTree}
     */
    transformThisExpression: function(tree) {
      return tree;
    },

    /**
     * @param {ThrowStatement} tree
     * @return {ParseTree}
     */
    transformThrowStatement: function(tree) {
      var value = this.transformAny(tree.value);
      if (value == tree.value) {
        return tree;
      }
      return createThrowStatement(value);
    },

    /**
     * @param {TraitDeclaration} tree
     * @return {ParseTree}
     */
    transformTraitDeclaration: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return createTraitDeclaration(tree.name, elements);
    },

    /**
     * @param {TryStatement} tree
     * @return {ParseTree}
     */
    transformTryStatement: function(tree) {
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
     * @param {UnaryExpression} tree
     * @return {ParseTree}
     */
    transformUnaryExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return createUnaryExpression(tree.operator, operand);
    },

    /**
     * @param {VariableDeclaration} tree
     * @return {ParseTree}
     */
    transformVariableDeclaration: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var initializer = this.transformAny(tree.initializer);
      if (lvalue == tree.lvalue && initializer == tree.initializer) {
        return tree;
      }
      return createVariableDeclaration(lvalue, initializer);
    },

    /**
     * @param {VariableDeclarationList} tree
     * @return {ParseTree}
     */
    transformVariableDeclarationList: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      return createVariableDeclarationList(tree.declarationType, declarations);
    },

    /**
     * @param {VariableStatement} tree
     * @return {ParseTree}
     */
    transformVariableStatement: function(tree) {
      var declarations = this.transformAny(tree.declarations).
          asVariableDeclarationList();
      if (declarations == tree.declarations) {
        return tree;
      }
      return createVariableStatement(declarations);
    },

    /**
     * @param {WhileStatement} tree
     * @return {ParseTree}
     */
    transformWhileStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var body = this.transformAny(tree.body);
      if (condition == tree.condition && body == tree.body) {
        return tree;
      }
      return createWhileStatement(condition, body);
    },

    /**
     * @param {WithStatement} tree
     * @return {ParseTree}
     */
    transformWithStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var body = this.transformAny(tree.body);
      if (expression == tree.expression && body == tree.body) {
        return tree;
      }
      return createWithStatement(expression, body);
    },

    /**
     * @param {YieldStatement} tree
     * @return {ParseTree}
     */
    transformYieldStatement: function(tree) {
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
