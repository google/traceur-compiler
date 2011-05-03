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
  var ParseTreeWriter = traceur.codegeneration.ParseTreeWriter;
  var TokenType = traceur.syntax.TokenType;
  var NewExpression = traceur.syntax.trees.NewExpression;

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
  }

  /**
   * An error thrown when an invalid parse tree is encountered. This error is
   * used internally to distinguish between errors in the Validator itself vs
   * errors it threw to unwind the call stack.
   *
   * @param {traceur.syntax.trees.ParseTree} tree
   * @param {string} message
   * @constructor
   */
  function ValidationError(tree, message) {
    this.tree = tree;
    this.message = message;
  }
  ValidationError.prototype = {
    __proto__: Error.prototype
  };

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
      if (!(e instanceof ValidationError)) {
        throw e;
      }

      var location = null;
      if (e.tree !== null) {
        location = e.tree.location;
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
          ParseTreeWriter.write(tree, e.tree, true) +
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
      throw new ValidationError(tree, message);
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
     * @param {traceur.syntax.trees.ArgumentList} tree
     */
    visitArgumentList: function(tree) {
      for (var i = 0; i < tree.args.length; i++) {
        var argument = tree.args[i];
        this.checkVisit_(argument.isAssignmentOrSpread(), argument,
            'assignment or spread expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpression} tree
     */
    visitArrayLiteralExpression: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element.isNull() || element.isAssignmentOrSpread(),
            element, 'assignment or spread expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayPattern} tree
     */
    visitArrayPattern: function(tree) {
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
     * @param {traceur.syntax.trees.AwaitStatement} tree
     */
    visitAwaitStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'await must be expression');
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperator} tree
     */
    visitBinaryOperator: function(tree) {
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
     * @param {traceur.syntax.trees.Block} tree
     */
    visitBlock: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isSourceElement(), statement,
            'statement or function declaration expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.CallExpression} tree
     */
    visitCallExpression: function(tree) {
      this.check_(tree.operand.isLeftHandSideExpression() ||
                  tree.operand.isMemberExpression(),
                  tree.operand,
                  'left hand side expression or member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand,
            'new args expected');
      }
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.CaseClause} tree
     */
    visitCaseClause: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement,
            'statement expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.Catch} tree
     */
    visitCatch: function(tree) {
      this.checkVisit_(tree.catchBody.type === ParseTreeType.BLOCK,
          tree.catchBody, 'block expected');
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclaration} tree
     */
    visitClassDeclaration: function(tree) {
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
     * @param {traceur.syntax.trees.CommaExpression} tree
     */
    visitCommaExpression: function(tree) {
      for (var i = 0; i < tree.expressions.length; i++) {
        var expression = tree.expressions[i];
        this.checkVisit_(expression.isAssignmentExpression(), expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpression} tree
     */
    visitConditionalExpression: function(tree) {
      this.checkVisit_(tree.condition.isAssignmentExpression(), tree.condition,
          'expression expected');
      this.checkVisit_(tree.left.isAssignmentExpression(), tree.left,
          'expression expected');
      this.checkVisit_(tree.right.isAssignmentExpression(), tree.right,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.DefaultClause} tree
     */
    visitDefaultClause: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement,
            'statement expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatement} tree
     */
    visitDoWhileStatement: function(tree) {
      this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
      this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ExportDeclaration} tree
     */
    visitExportDeclaration: function(tree) {
      var declType = tree.declaration.type;
      this.checkVisit_(
          declType == ParseTreeType.VARIABLE_STATEMENT ||
          declType == ParseTreeType.FUNCTION_DECLARATION ||
          declType == ParseTreeType.MODULE_DEFINITION ||
          declType == ParseTreeType.MODULE_DECLARATION ||
          declType == ParseTreeType.CLASS_DECLARATION ||
          declType == ParseTreeType.TRAIT_DECLARATION ||
          declType == ParseTreeType.EXPORT_PATH_LIST,
          tree.declaration,
          'expected valid export tree');
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPath: function(tree) {
      this.checkVisit_(
          tree.moduleExpression.type == ParseTreeType.MODULE_EXPRESSION,
          tree.moduleExpression,
          'module expression expected');

      var specifierType = tree.specifier.type;
      this.checkVisit_(specifierType == ParseTreeType.EXPORT_SPECIFIER_SET ||
                       specifierType == ParseTreeType.IDENTIFIER_EXPRESSION,
                       tree.specifier,
                       'specifier set or identifier expected');
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPathList: function(tree) {
      this.check_(tree.paths.length > 0, tree,
                  'expected at least one path');
      for (var i = 0; i < tree.paths.length; i++) {
        var path = tree.paths[i];
        var type = path.type;
        this.checkVisit_(
            type == ParseTreeType.EXPORT_PATH ||
            type == ParseTreeType.EXPORT_PATH_SPECIFIER_SET ||
            type == ParseTreeType.IDENTIFIER_EXPRESSION,
            path,
            'expected valid export path');
      }
    },

    /**
     * @param {traceur.syntax.trees.ExportPathSpecifierSet} tree
     */
    visitExportPathSpecifierSet: function(tree) {
      this.check_(tree.specifiers.length > 0, tree,
                  'expected at least one specifier');
      this.visitList(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifierSet} tree
     */
    visitExportSpecifierSet: function(tree) {
      this.check_(tree.specifiers.length > 0, tree,
          'expected at least one identifier');
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        this.checkVisit_(
            specifier.type == ParseTreeType.EXPORT_SPECIFIER,
            specifier,
            'expected valid export specifier');
      }
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatement} tree
     */
    visitExpressionStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclaration} tree
     */
    visitFieldDeclaration: function(tree) {
      for (var i = 0; i < tree.declarations.length; i++) {
        var declaration = tree.declarations[i];
        this.checkVisit_(
            declaration.type === ParseTreeType.VARIABLE_DECLARATION,
            declaration,
            'variable declaration expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.Finally} tree
     */
    visitFinally: function(tree) {
      this.checkVisit_(tree.block.type === ParseTreeType.BLOCK, tree.block,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatement} tree
     */
    visitForEachStatement: function(tree) {
      this.checkVisit_(tree.initializer.declarations.length <= 1,
          tree.initializer,
          'for-each statement may not have more than one variable declaration');
      this.checkVisit_(tree.collection.isExpression(), tree.collection,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.ForInStatement} tree
     */
    visitForInStatement: function(tree) {
      if (tree.initializer.type === ParseTreeType.VARIABLE_DECLARATION_LIST) {
        this.checkVisit_(
            tree.initializer.declarations.length <=
                1,
            tree.initializer,
            'for-in statement may not have more than one variable declaration');
      } else {
        this.checkVisit_(tree.initializer.isExpression(),
            tree.initializer, 'variable declaration or expression expected');
      }
      this.checkVisit_(tree.collection.isExpression(), tree.collection,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterList} tree
     */
    visitFormalParameterList: function(tree) {
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        switch (parameter.type) {
          case ParseTreeType.REST_PARAMETER:
            this.checkVisit_(
                i === tree.parameters.length - 1, parameter,
                'rest parameters must be the last parameter in a parameter' +
                ' list');
            // Fall through

          case ParseTreeType.IDENTIFIER_EXPRESSION:
            // TODO(dominicc): Add array and object patterns here when
            // desugaring them is supported.
            break;

          case ParseTreeType.DEFAULT_PARAMETER:
            // TODO(arv): There must not be a parameter after this one that is
            // not a rest or another default parameter.
            break;

          default:
            this.fail_(parameter, 'parameters must be identifiers or rest' +
                ' parameters');
            break;
        }
        this.visitAny(parameter);
      }
    },

    /**
     * @param {traceur.syntax.trees.ForStatement} tree
     */
    visitForStatement: function(tree) {
      if (tree.initializer !== null && !tree.initializer.isNull()) {
        this.checkVisit_(
            tree.initializer.isExpression() ||
            tree.initializer.type === ParseTreeType.VARIABLE_DECLARATION_LIST,
            tree.initializer,
            'variable declaration list or expression expected');
      }
      if (tree.condition !== null) {
        this.checkVisit_(tree.condition.isExpression(), tree.condition,
            'expression expected');
      }
      if (tree.increment !== null) {
        this.checkVisit_(tree.condition.isExpression(), tree.increment,
            'expression expected');
      }
      this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.GetAccessor} tree
     */
    visitGetAccessor: function(tree) {
      this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.IfStatement} tree
     */
    visitIfStatement: function(tree) {
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
     * @param {traceur.syntax.trees.LabelledStatement} tree
     */
    visitLabelledStatement: function(tree) {
      this.checkVisit_(tree.statement.isStatement(), tree.statement,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.MemberExpression} tree
     */
    visitMemberExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand,
          'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand,
            'new args expected');
      }
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpression} tree
     */
    visitMemberLookupExpression: function(tree) {
      this.check_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand,
            'new args expected');
      }
      this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpression} tree
     */
    visitMissingPrimaryExpression: function(tree) {
      this.fail_(tree, 'parse tree contains errors');
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveList} tree
     */
    visitMixinResolveList: function(tree) {
      for (var i = 0; i < tree.resolves.length; i++) {
        var resolve = tree.resolves[i];
        this.check_(resolve.type === ParseTreeType.MIXIN_RESOLVE, resolve,
            'mixin resolve expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDeclaration: function(tree) {
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        this.checkVisit_(specifier.type == ParseTreeType.MODULE_SPECIFIER,
                         specifier,
                         'module specifier expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDefinition: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(
            (element.isStatement() && element.type !== ParseTreeType.BLOCK) ||
            element.type === ParseTreeType.CLASS_DECLARATION ||
            element.type === ParseTreeType.EXPORT_DECLARATION ||
            element.type === ParseTreeType.IMPORT_DECLARATION ||
            element.type === ParseTreeType.MODULE_DEFINITION ||
            element.type === ParseTreeType.MODULE_DECLARATION ||
            element.type === ParseTreeType.TRAIT_DECLARATION,
            element,
            'module element expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleRequire} tree
     */
    visitModuleRequire: function(tree) {
      this.check_(tree.url.type == TokenType.STRING, tree.url,
                  'string expected');
    },

    /**
     * @param {traceur.syntax.trees.ModuleSpecifier} tree
     */
    visitModuleSpecifier: function(tree) {
      this.checkVisit_(tree.expression.type == ParseTreeType.MODULE_EXPRESSION,
                       tree.expression,
                       'module expression expected');
    },

    /**
     * @param {traceur.syntax.trees.NewExpression} tree
     */
    visitNewExpression: function(tree) {
      this.checkVisit_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpression} tree
     */
    visitObjectLiteralExpression: function(tree) {
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
     * @param {traceur.syntax.trees.ObjectPattern} tree
     */
    visitObjectPattern: function(tree) {
      for (var i = 0; i < tree.fields.length; i++) {
        var field = tree.fields[i];
        this.checkVisit_(field.type === ParseTreeType.OBJECT_PATTERN_FIELD,
            field,
            'object pattern field expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternField} tree
     */
    visitObjectPatternField: function(tree) {
      if (tree.element !== null) {
        this.checkVisit_(tree.element.isLeftHandSideExpression() ||
            tree.element.isPattern(),
            tree.element,
            'left hand side expression or pattern expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ParenExpression} tree
     */
    visitParenExpression: function(tree) {
      if (tree.expression.isPattern()) {
        this.visitAny(tree.expression);
      } else {
        this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpression} tree
     */
    visitPostfixExpression: function(tree) {
      this.checkVisit_(tree.operand.isAssignmentExpression(), tree.operand,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.Program} tree
     */
    visitProgram: function(tree) {
      for (var i = 0; i < tree.programElements.length; i++) {
        var programElement = tree.programElements[i];
        this.checkVisit_(programElement.isProgramElement(),
            programElement,
            'global program element expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignment} tree
     */
    visitPropertyNameAssignment: function(tree) {
      this.checkVisit_(tree.value.isAssignmentExpression(), tree.value,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      this.checkVisit_(
          tree.moduleExpression.type == ParseTreeType.MODULE_EXPRESSION,
          tree.moduleExpression,
          'module expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatement} tree
     */
    visitReturnStatement: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.SetAccessor} tree
     */
    visitSetAccessor: function(tree) {
      this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.SpreadExpression} tree
     */
    visitSpreadExpression: function(tree) {
      this.checkVisit_(tree.expression.isAssignmentExpression(),
          tree.expression,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.StateMachine} tree
     */
    visitStateMachine: function(tree) {
      this.fail_(tree, 'State machines are never valid outside of the ' +
          'GeneratorTransformer pass.');
    },

    /**
     * @param {traceur.syntax.trees.SwitchStatement} tree
     */
    visitSwitchStatement: function(tree) {
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
     * @param {traceur.syntax.trees.TraitDeclaration} tree
     */
    visitTraitDeclaration: function(tree) {
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
     * @param {traceur.syntax.trees.ThrowStatement} tree
     */
    visitThrowStatement: function(tree) {
      if (tree.value === null) {
        return;
      }
      this.checkVisit_(tree.value.isExpression(), tree.value,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.TryStatement} tree
     */
    visitTryStatement: function(tree) {
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
     * @param {traceur.syntax.trees.UnaryExpression} tree
     */
    visitUnaryExpression: function(tree) {
      this.checkVisit_(tree.operand.isAssignmentExpression(), tree.operand,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclaration} tree
     */
    visitVariableDeclaration: function(tree) {
      if (tree.initializer !== null) {
        this.checkVisit_(tree.initializer.isAssignmentExpression(),
            tree.initializer, 'assignment expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.WhileStatement} tree
     */
    visitWhileStatement: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.WithStatement} tree
     */
    visitWithStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.YieldStatement} tree
     */
    visitYieldStatement: function(tree) {
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
