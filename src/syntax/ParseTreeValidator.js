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
  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  // TODO(cburrows): uncomment when writer is available
  //var ParseTreeWriter = traceur.codegeneration.ParseTreeWriter;
  var TokenType = traceur.syntax.TokenType;

  /*
  TODO: add contextual information to the validator so we can check
  non-local grammar rules, such as:
   * operator precedence
   * expressions with or without "in"
   * return statements must be in a function
   * break must be enclosed in loops or switches
   * continue must be enclosed in loops
   * function declarations must have non-null names
     (optional for function expressions)
  */

  /**
   * Validates a parse tree
   *
   * @constructor
   * @extends {ParseTreeVisitor}
   */
  function ParseTreeValidator() {
    ParseTreeVisitor.call(this);
    this.lastVisited = null;
  }

  /**
   * Validates a parse tree.  Validation failures are compiler bugs.
   * When a failure is found, the source file is dumped to standard
   * error output and a runtime exception is thrown.
   *
   * @param {traceur.syntax.trees.ParseTree} tree
   */
  ParseTreeValidator.validate = function(tree) {
    var validator = new ParseTreeValidator();
    try {
      validator.visitAny(tree);
    } catch (e) {
      var location = null;
      if (validator.lastVisited !== null) {
        location = validator.lastVisited.location;
      }
      if (location === null) {
        location = tree.location;
      }
      var locationString = location !== null ?
          location.start.toString() :
          '(unknown)';
      throw Error('Parse tree validation failure \'' + e.message + '\' at ' +
          locationString +
          ':\n\n' +
          // TODO(cburrows): uncomment when writer is available
          // ParseTreeWriter.write(tree, validator.lastVisited, true) +
          '\n');
    }
  };

  ParseTreeValidator.prototype = {
    __proto__: ParseTreeVisitor.prototype,

    /**
     * @param {traceur.syntax.trees.ParseTree} tree
     * @param {string} message
     */
    fail_: function(tree, message) {
      if (tree !== null) {
        this.lastVisited = tree;
      }
      throw Error(message);
    },

    /**
     * @param {boolean} condition
     * @param {traceur.syntax.trees.ParseTree} tree
     * @param {string} message
     */
    check_: function(condition, tree, message) {
      if (!condition) {
        this.fail_(tree, message);
      }
    },

    /**
     * @param {boolean} condition
     * @param {traceur.syntax.trees.ParseTree} tree
     * @param {string} message
     */
    checkVisit_: function(condition, tree, message) {
      this.check_(condition, tree, message);
      this.visitAny(tree);
    },

    /**
     * @param {traceur.syntax.trees.ParseTree} tree
     */
    visitAny: function(tree) {
      this.lastVisited = tree;
      ParseTreeVisitor.prototype.visitAny.call(this, tree);
    },

    /**
     * @param {traceur.syntax.trees.ArgumentListTree} tree
     */
    visitArgumentListTree: function(tree) {
      for (var i = 0; i < tree.args.length; i++) {
        var argument = tree.args[i];
        this.checkVisit_(argument.isAssignmentOrSpread(), argument,
            'assignment or spread expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpressionTree} tree
     */
    visitArrayLiteralExpressionTree: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element.isNull() || element.isAssignmentOrSpread(),
            element,
            'assignment or spread expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayPatternTree} tree
     */
    visitArrayPatternTree: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element.isNull() ||
            element.isLeftHandSideExpression() ||
            element.isPattern() ||
            element.isSpreadPatternElement(),
            element,
            'null, sub pattern, left hand side expression or spread expected');

        if (element.isSpreadPatternElement()) {
          this.check_(i === (tree.elements.length - 1), element,
              'spread in array patterns must be the last element');
        }
      }
    },

    /**
     * @param {traceur.syntax.trees.AwaitStatementTree} tree
     */
    visitAwaitStatementTree: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'await must be expression');
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperatorTree} tree
     */
    visitBinaryOperatorTree: function(tree) {
      switch (tree.operator.type) {
        // assignment
        case TokenType.EQUAL:
        case TokenType.STAR_EQUAL:
        case TokenType.SLASH_EQUAL:
        case TokenType.PERCENT_EQUAL:
        case TokenType.PLUS_EQUAL:
        case TokenType.MINUS_EQUAL:
        case TokenType.LEFT_SHIFT_EQUAL:
        case TokenType.RIGHT_SHIFT_EQUAL:
        case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL:
        case TokenType.AMPERSAND_EQUAL:
        case TokenType.CARET_EQUAL:
        case TokenType.BAR_EQUAL:
          this.check_(tree.left.isLeftHandSideExpression() ||
              tree.left.isPattern(),
              tree.left,
              'left hand side expression or pattern expected');
          this.check_(tree.right.isAssignmentExpression(),
              tree.right,
              'assignment expression expected');
          break;

        // logical
        case TokenType.AND:
        case TokenType.OR:
        case TokenType.BAR:
        case TokenType.CARET:
        case TokenType.AMPERSAND:

        // equality
        case TokenType.EQUAL_EQUAL:
        case TokenType.NOT_EQUAL:
        case TokenType.EQUAL_EQUAL_EQUAL:
        case TokenType.NOT_EQUAL_EQUAL:

        // relational
        case TokenType.OPEN_ANGLE:
        case TokenType.CLOSE_ANGLE:
        case TokenType.GREATER_EQUAL:
        case TokenType.LESS_EQUAL:
        case TokenType.INSTANCEOF:
        case TokenType.IN:

        // shift
        case TokenType.LEFT_SHIFT:
        case TokenType.RIGHT_SHIFT:
        case TokenType.UNSIGNED_RIGHT_SHIFT:

        // additive
        case TokenType.PLUS:
        case TokenType.MINUS:

        // multiplicative
        case TokenType.STAR:
        case TokenType.SLASH:
        case TokenType.PERCENT:
          this.check_(tree.left.isAssignmentExpression(), tree.left,
              'assignment expression expected');
          this.check_(tree.right.isAssignmentExpression(), tree.right,
              'assignment expression expected');
          break;

        default:
          this.fail_(tree, 'unexpected binary operator');
      }
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.BlockTree} tree
     */
    visitBlockTree: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isSourceElement(), statement,
            'statement or function declaration expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.CallExpressionTree} tree
     */
    visitCallExpressionTree: function(tree) {
      this.check_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      if (tree.operand instanceof NewExpressionTree) {
        this.check_(tree.operand.asNewExpression().args !== null, tree.operand,
            'new args expected');
      }
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.CaseClauseTree} tree
     */
    visitCaseClauseTree: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement, 'statement expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.CatchTree} tree
     */
    visitCatchTree: function(tree) {
      this.checkVisit_(tree.catchBody.type === ParseTreeType.BLOCK, tree.catchBody,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclarationTree} tree
     */
    visitClassDeclarationTree: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        switch (element.type) {
          case ParseTreeType.FUNCTION_DECLARATION:
          case ParseTreeType.GET_ACCESSOR:
          case ParseTreeType.SET_ACCESSOR:
          case ParseTreeType.MIXIN:
          case ParseTreeType.REQUIRES_MEMBER:
          case ParseTreeType.FIELD_DECLARATION:
            break;
          default:
            this.fail_(element, 'class element expected');
        }
        this.visitAny(element);
      }
    },

    /**
     * @param {traceur.syntax.trees.CommaExpressionTree} tree
     */
    visitCommaExpressionTree: function(tree) {
      for (var i = 0; i < tree.expressions.length; i++) {
        var expression = tree.expressions[i];
        this.checkVisit_(expression.isAssignmentExpression(), expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpressionTree} tree
     */
    visitConditionalExpressionTree: function(tree) {
      this.checkVisit_(tree.condition.isAssignmentExpression(), tree.condition,
          'expression expected');
      this.checkVisit_(tree.left.isAssignmentExpression(), tree.left,
          'expression expected');
      this.checkVisit_(tree.right.isAssignmentExpression(), tree.right,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.DefaultClauseTree} tree
     */
    visitDefaultClauseTree: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement, 'statement expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatementTree} tree
     */
    visitDoWhileStatementTree: function(tree) {
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
      this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ExportDeclarationTree} tree
     */
    visitExportDeclarationTree: function(tree) {
      switch (tree.type) {
        case ParseTreeType.VARIABLE_STATEMENT:
        case ParseTreeType.FUNCTION_DECLARATION:
        case ParseTreeType.MODULE_DEFINITION:
        case ParseTreeType.CLASS_DECLARATION:
        case ParseTreeType.TRAIT_DECLARATION:
          break;
        default:
          this.fail_(tree.declaration, 'expected valid export tree');
      }
      this.visitAny(tree.declaration);
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatementTree} tree
     */
    visitExpressionStatementTree: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclarationTree} tree
     */
    visitFieldDeclarationTree: function(tree) {
      for (var i = 0; i < tree.declarations.length; i++) {
        var declaration = tree.declarations[i];
        this.checkVisit_(declaration.type === ParseTreeType.VARIABLE_DECLARATION,
            declaration, 'variable declaration expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.FinallyTree} tree
     */
    visitFinallyTree: function(tree) {
      this.checkVisit_(tree.block.type === ParseTreeType.BLOCK, tree.block,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatementTree} tree
     */
    visitForEachStatementTree: function(tree) {
      this.checkVisit_(tree.initializer.declarations.length <= 1,
          tree.initializer,
          'for-each statement may not have more than one variable declaration');
      this.checkVisit_(tree.collection.isExpression(), tree.collection,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.ForInStatementTree} tree
     */
    visitForInStatementTree: function(tree) {
      if (tree.initializer.type === ParseTreeType.VARIABLE_DECLARATION_LIST) {
        this.checkVisit_(tree.initializer.asVariableDeclarationList().declarations.length <= 1,
            tree.initializer,
            'for-in statement may not have more than one variable declaration');
      } else {
        this.checkVisit_(tree.initializer.isExpression(),
            tree.initializer, 'variable declaration or expression expected');
      }
      this.checkVisit_(tree.collection.isExpression(), tree.collection,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterListTree} tree
     */
    visitFormalParameterListTree: function(tree) {
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        switch (parameter.type) {
          case ParseTreeType.REST_PARAMETER:
            this.checkVisit_(
                i === tree.parameters.length - 1, parameter,
                'rest parameters must be the last parameter in a parameter list');
            // Fall through

          case ParseTreeType.IDENTIFIER_EXPRESSION:
            // TODO(dominicc): Add array and object patterns here when
            // desugaring them is supported.
            break;

          case ParseTreeType.DEFAULT_PARAMETER:
            // TODO(arv): There must not be a parameter after this one that is not a rest or another
            // default parameter.
            break;

          default:
            this.fail_(parameter, 'parameters must be identifiers or rest parameters');
            break;
        }
        this.visitAny(parameter);
      }
    },

    /**
     * @param {traceur.syntax.trees.ForStatementTree} tree
     */
    visitForStatementTree: function(tree) {
      if (tree.initializer !== null && !tree.initializer.isNull()) {
        this.checkVisit_(
            tree.initializer.isExpression() ||
            tree.initializer.type === ParseTreeType.VARIABLE_DECLARATION_LIST,
            tree.initializer, 'variable declaration list or expression expected');
      }
      if (tree.condition !== null) {
        this.checkVisit_(tree.condition.isExpression(), tree.condition,
            'expression expected');
      }
      if (tree.increment !== null) {
        this.checkVisit_(tree.condition.isExpression(), tree.increment,
            'expression expected');
      }
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.GetAccessorTree} tree
     */
    visitGetAccessorTree: function(tree) {
      this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.IfStatementTree} tree
     */
    visitIfStatementTree: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
      this.checkVisit_(tree.ifClause.isStatement(), tree.ifClause,
          'statement expected');
      if (tree.elseClause !== null) {
        this.checkVisit_(tree.elseClause.isStatement(), tree.elseClause,
            'statement expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.LabelledStatementTree} tree
     */
    visitLabelledStatementTree: function(tree) {
      this.checkVisit_(tree.statement.isStatement(), tree.statement,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.MemberExpressionTree} tree
     */
    visitMemberExpressionTree: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand,
          'member expression expected');
      if (tree.operand instanceof NewExpressionTree) {
        this.check_(tree.operand.asNewExpression().args !== null, tree.operand,
            'new args expected');
      }
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpressionTree} tree
     */
    visitMemberLookupExpressionTree: function(tree) {
      this.check_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      if (tree.operand instanceof NewExpressionTree) {
        this.check_(tree.operand.asNewExpression().args !== null, tree.operand,
            'new args expected');
      }
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpressionTree} tree
     */
    visitMissingPrimaryExpressionTree: function(tree) {
      this.fail_(tree, 'parse tree contains errors');
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveListTree} tree
     */
    visitMixinResolveListTree: function(tree) {
      for (var i = 0; i < tree.resolves.length; i++) {
        var resolve = tree.resolves[i];
        this.check_(resolve.type === ParseTreeType.MIXIN_RESOLVE, resolve,
            'mixin resolve expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinitionTree} tree
     */
    visitModuleDefinitionTree: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.check_((element.isStatement() && element.type !== ParseTreeType.BLOCK) ||
            element.type === ParseTreeType.CLASS_DECLARATION ||
            element.type === ParseTreeType.EXPORT_DECLARATION ||
            element.type === ParseTreeType.IMPORT_DECLARATION ||
            element.type === ParseTreeType.MODULE_DEFINITION ||
            element.type === ParseTreeType.TRAIT_DECLARATION,
            element,
            'module element expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.NewExpressionTree} tree
     */
    visitNewExpressionTree: function(tree) {
      this.checkVisit_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpressionTree} tree
     */
    visitObjectLiteralExpressionTree: function(tree) {
      for (var i = 0; i < tree.propertyNameAndValues.length; i++) {
        var propertyNameAndValue = tree.propertyNameAndValues[i];
        switch (propertyNameAndValue.type) {
          case ParseTreeType.GET_ACCESSOR:
          case ParseTreeType.SET_ACCESSOR:
          case ParseTreeType.PROPERTY_NAME_ASSIGNMENT:
            break;
          default:
            this.fail_(propertyNameAndValue,
                'accessor or property name assignment expected');
        }
        this.visitAny(propertyNameAndValue);
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternTree} tree
     */
    visitObjectPatternTree: function(tree) {
      for (var i = 0; i < tree.fields.length; i++) {
        var field = tree.fields[i];
        this.checkVisit_(field.type === ParseTreeType.OBJECT_PATTERN_FIELD, field,
            'object pattern field expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternFieldTree} tree
     */
    visitObjectPatternFieldTree: function(tree) {
      if (tree.element !== null) {
        this.checkVisit_(tree.element.isLeftHandSideExpression() ||
            tree.element.isPattern(),
            tree.element,
            'left hand side expression or pattern expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ParenExpressionTree} tree
     */
    visitParenExpressionTree: function(tree) {
      if (tree.expression.isPattern()) {
        this.visitAny(tree.expression);
      } else {
        this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpressionTree} tree
     */
    visitPostfixExpressionTree: function(tree) {
      this.checkVisit_(tree.operand.isAssignmentExpression(), tree.operand,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ProgramTree} tree
     */
    visitProgramTree: function(tree) {
      for (var i = 0; i < tree.sourceElements.length; i++) {
        var sourceElement = tree.sourceElements[i];
        this.checkVisit_(sourceElement.isSourceElement() ||
            sourceElement.type === ParseTreeType.CLASS_DECLARATION ||
            sourceElement.type === ParseTreeType.TRAIT_DECLARATION ||
            sourceElement.type === ParseTreeType.MODULE_DEFINITION,
            sourceElement,
            'global source element expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignmentTree} tree
     */
    visitPropertyNameAssignmentTree: function(tree) {
      this.checkVisit_(tree.value.isAssignmentExpression(), tree.value,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatementTree} tree
     */
    visitReturnStatementTree: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.SetAccessorTree} tree
     */
    visitSetAccessorTree: function(tree) {
      this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.SpreadExpressionTree} tree
     */
    visitSpreadExpressionTree: function(tree) {
      this.checkVisit_(tree.expression.isAssignmentExpression(), tree.expression,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.StateMachineTree} tree
     */
    visitStateMachineTree: function(tree) {
      this.fail_(tree, 'State machines are never valid outside of the GeneratorTransformer pass.');
    },

    /**
     * @param {traceur.syntax.trees.SwitchStatementTree} tree
     */
    visitSwitchStatementTree: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      var defaultCount = 0;
      for (var i = 0; i < tree.caseClauses.length; i++) {
        var caseClause = tree.caseClauses[i];
        if (caseClause.type === ParseTreeType.DEFAULT_CLAUSE) {
          ++defaultCount;
          this.checkVisit_(defaultCount <= 1, caseClause,
              'no more than one default clause allowed');
        } else {
          this.checkVisit_(caseClause.type === ParseTreeType.CASE_CLAUSE,
              caseClause, 'case or default clause expected');
        }
      }
    },

    /**
     * @param {traceur.syntax.trees.TraitDeclarationTree} tree
     */
    visitTraitDeclarationTree: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        switch (element.type) {
          case ParseTreeType.FUNCTION_DECLARATION:
          case ParseTreeType.GET_ACCESSOR:
          case ParseTreeType.SET_ACCESSOR:
          case ParseTreeType.MIXIN:
          case ParseTreeType.REQUIRES_MEMBER:
            break;
          default:
            this.fail_(element, 'trait element expected');
        }
        this.visitAny(element);
      }
    },

    /**
     * @param {traceur.syntax.trees.ThrowStatementTree} tree
     */
    visitThrowStatementTree: function(tree) {
      if (tree.value === null) {
        return;
      }
      this.checkVisit_(tree.value.isExpression(), tree.value, 'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.TryStatementTree} tree
     */
    visitTryStatementTree: function(tree) {
      this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
      if (tree.catchBlock !== null && !tree.catchBlock.isNull()) {
        this.checkVisit_(tree.catchBlock.type === ParseTreeType.CATCH,
            tree.catchBlock, 'catch block expected');
      }
      if (tree.finallyBlock !== null && !tree.finallyBlock.isNull()) {
        this.checkVisit_(tree.finallyBlock.type === ParseTreeType.FINALLY,
            tree.finallyBlock, 'finally block expected');
      }
      if ((tree.catchBlock === null || tree.catchBlock.isNull()) &&
          (tree.finallyBlock === null || tree.finallyBlock.isNull())) {
        this.fail_(tree, 'either catch or finally must be present');
      }
    },

    /**
     * @param {traceur.syntax.trees.UnaryExpressionTree} tree
     */
    visitUnaryExpressionTree: function(tree) {
      this.checkVisit_(tree.operand.isAssignmentExpression(), tree.operand,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclarationTree} tree
     */
    visitVariableDeclarationTree: function(tree) {
      if (tree.initializer !== null) {
        this.checkVisit_(tree.initializer.isAssignmentExpression(),
            tree.initializer, 'assignment expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.WhileStatementTree} tree
     */
    visitWhileStatementTree: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.WithStatementTree} tree
     */
    visitWithStatementTree: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.YieldStatementTree} tree
     */
    visitYieldStatementTree: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    }
  };

  // Export
  return {
    ParseTreeValidator: ParseTreeValidator
  };
});
