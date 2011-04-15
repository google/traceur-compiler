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

  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var PredefinedName = traceur.syntax.PredefinedName;
  var Keywords = traceur.syntax.Keywords;
  var TokenType = traceur.syntax.TokenType;
  var StringBuilder = traceur.util.StringBuilder;
  var Keywords = traceur.syntax.Keywords;
  var PredefinedName = traceur.syntax.PredefinedName;

  /**
   * Converts a ParseTree to text.
   * @param {ParseTree} highlighted
   * @param {boolean} showLineNumbers
   * @constructor
   */
  function ParseTreeWriter(highlighted, showLineNumbers) {
    ParseTreeVisitor.call(this);
    this.highlighted_ = highlighted;
    this.showLineNumbers_ = showLineNumbers;
    this.result_ = new StringBuilder();
    this.currentLine_ = new StringBuilder();
  }

  // constants
  var NEW_LINE = '\n';
  var PRETTY_PRINT = true;

  ParseTreeWriter.write = function(tree, var_args) {
    var showLineNumbers;
    var highlighted = null;

    // TODO: can we make this argument order more sane?
    if (arguments.length === 1) {
      showLineNumbers = false;
    } else if (arguments.length === 2) {
      showLineNumbers = arguments[1];
    } else {
      showLineNumbers = arguments[2];
      highlighted = arguments[1];
    }
    var writer = new ParseTreeWriter(highlighted, showLineNumbers);
    writer.visitAny(tree);
    if (writer.currentLine_.length > 0) {
      writer.writeln_();
    }
    return writer.result_.toString();
  }

  ParseTreeWriter.prototype = {
    __proto__: ParseTreeVisitor.prototype,

    /**
     * @type {string}
     * @private
     */
    currentLineComment_: null,

    /**
     * @type {number}
     * @private
     */
    indentDepth_: 0,

    /**
     * @param {ParseTree} tree
     */
    visitAny: function(tree) {
      // set background color to red if tree is highlighted
      if (tree != null && tree == this.highlighted_) {
        this.write_('\x1B[41m');
      }

      if (tree != null && tree.location != null &&
          tree.location.start != null && this.showLineNumbers_) {
        this.currentLineComment_ = 'Line: ' + (tree.location.start.line + 1);
      }
      ParseTreeVisitor.prototype.visitAny.call(this, tree);

      // set background color to normal
      if (tree != null && tree == this.highlighted_) {
        this.write_('\x1B[0m');
      }
    },

    /**
     * @param {ArgumentListTree} tree
     */
    visitArgumentListTree: function(tree) {
      this.write_(TokenType.OPEN_PAREN);
      this.writeList_(tree.args, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_PAREN);
    },

    /**
     * @param {ArrayLiteralExpressionTree} tree
     */
    visitArrayLiteralExpressionTree: function(tree) {
      this.write_(TokenType.OPEN_SQUARE);
      this.writeList_(tree.elements, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {ArrayPatternTree} tree
     */
    visitArrayPatternTree: function(tree) {
      this.write_(TokenType.OPEN_SQUARE);
      this.writeList_(tree.elements, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {AwaitStatementTree} tree
     */
    visitAwaitStatementTree: function(tree) {
      this.write_(TokenType.AWAIT);
      if (tree.identifier != null) {
        this.write_(tree.identifier);
        this.write_(TokenType.EQUAL);
      }
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {BinaryOperatorTree} tree
     */
    visitBinaryOperatorTree: function(tree) {
      this.visitAny(tree.left);
      this.write_(tree.operator);
      this.visitAny(tree.right);
    },

    /**
     * @param {BlockTree} tree
     */
    visitBlockTree: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.statements);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {BreakStatementTree} tree
     */
    visitBreakStatementTree: function(tree) {
      this.write_(TokenType.BREAK);
      if (tree.name != null) {
        this.write_(tree.name);
      }
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {CallExpressionTree} tree
     */
    visitCallExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },

    /**
     * @param {CaseClauseTree} tree
     */
    visitCaseClauseTree: function(tree) {
      this.write_(TokenType.CASE);
      this.visitAny(tree.expression);
      this.write_(TokenType.COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },

    /**
     * @param {CatchTree} tree
     */
    visitCatchTree: function(tree) {
      this.write_(TokenType.CATCH);
      this.write_(TokenType.OPEN_PAREN);
      this.write_(tree.exceptionName);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.catchBody);
    },

    /**
     * @param {ClassDeclarationTree} tree
     */
    visitClassDeclarationTree: function(tree) {
      this.write_(TokenType.CLASS);
      this.write_(tree.name);
      if (tree.superClass != null) {
        this.write_(TokenType.COLON);
        this.visitAny(tree.superClass);
      }
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.elements);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ClassExpressionTree} tree
     */
    visitClassExpressionTree: function(tree) {
      this.write_(TokenType.CLASS);
    },

    /**
     * @param {CommaExpressionTree} tree
     */
    visitCommaExpressionTree: function(tree) {
      this.writeList_(tree.expressions, TokenType.COMMA, false);
    },

    /**
     * @param {ConditionalExpressionTree} tree
     */
    visitConditionalExpressionTree: function(tree) {
      this.visitAny(tree.condition);
      this.write_(TokenType.QUESTION);
      this.visitAny(tree.left);
      this.write_(TokenType.COLON);
      this.visitAny(tree.right);
    },

    /**
     * @param {ContinueStatementTree} tree
     */
    visitContinueStatementTree: function(tree) {
      this.write_(TokenType.CONTINUE);
      if (tree.name != null) {
        this.write_(tree.name);
      }
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {DebuggerStatementTree} tree
     */
    visitDebuggerStatementTree: function(tree) {
      this.write_(TokenType.DEBUGGER);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {DefaultClauseTree} tree
     */
    visitDefaultClauseTree: function(tree) {
      this.write_(TokenType.DEFAULT);
      this.write_(TokenType.COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },

    /**
     * @param {DefaultParameterTree} tree
     */
    visitDefaultParameterTree: function(tree) {
      this.visitAny(tree.identifier);
      this.write_(TokenType.EQUAL);
      this.visitAny(tree.expression);
    },

    /**
     * @param {DoWhileStatementTree} tree
     */
    visitDoWhileStatementTree: function(tree) {
      this.write_(TokenType.DO);
      this.visitAny(tree.body);
      this.write_(TokenType.WHILE);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(TokenType.CLOSE_PAREN);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {EmptyStatementTree} tree
     */
    visitEmptyStatementTree: function(tree) {
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ExportDeclarationTree} tree
     */
    visitExportDeclarationTree: function(tree) {
      this.write_(TokenType.EXPORT);
      this.visitAny(tree.declaration);
    },

    /**
     * @param {ExpressionStatementTree} tree
     */
    visitExpressionStatementTree: function(tree) {
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {FieldDeclarationTree} tree
     */
    visitFieldDeclarationTree: function(tree) {
      if (tree.isStatic) {
        this.write_(TokenType.CLASS);
      }
      if (tree.isConst) {
        this.write_(TokenType.CONST);
      }
      this.writeList_(tree.declarations, TokenType.COMMA, false);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {FinallyTree} tree
     */
    visitFinallyTree: function(tree) {
      this.write_(TokenType.FINALLY);
      this.visitAny(tree.block);
    },

    /**
     * @param {ForEachStatementTree} tree
     */
    visitForEachStatementTree: function(tree) {
      this.write_(TokenType.FOR);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(TokenType.COLON);
      this.visitAny(tree.collection);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {ForInStatementTree} tree
     */
    visitForInStatementTree: function(tree) {
      this.write_(TokenType.FOR);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(TokenType.IN);
      this.visitAny(tree.collection);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {ForStatementTree} tree
     */
    visitForStatementTree: function(tree) {
      this.write_(TokenType.FOR);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(TokenType.SEMI_COLON);
      this.visitAny(tree.condition);
      this.write_(TokenType.SEMI_COLON);
      this.visitAny(tree.increment);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {FormalParameterListTree} tree
     */
    visitFormalParameterListTree: function(tree) {
      var first = true;

      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];

        if (first) {
          first = false;
        } else {
          this.write_(TokenType.COMMA);
        }

        this.visitAny(parameter);
      }
    },

    /**
     * @param {FunctionDeclarationTree} tree
     */
    visitFunctionDeclarationTree: function(tree) {
      if (tree.isStatic) {
        this.write_(TokenType.CLASS);
      }
      this.write_(Keywords.FUNCTION);
      if (tree.name != null) {
        this.write_(tree.name);
      }
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.functionBody);
    },

    /**
     * @param {GetAccessorTree} tree
     */
    visitGetAccessorTree: function(tree) {
      if (tree.isStatic) {
        this.write_(TokenType.CLASS);
      }
      this.write_(PredefinedName.GET);
      this.write_(tree.propertyName);
      this.write_(TokenType.OPEN_PAREN);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {IdentifierExpressionTree} tree
     */
    visitIdentifierExpressionTree: function(tree) {
      this.write_(tree.identifierToken);
    },

    /**
     * @param {IfStatementTree} tree
     */
    visitIfStatementTree: function(tree) {
      this.write_(TokenType.IF);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.ifClause);
      if (tree.elseClause != null) {
        this.write_(TokenType.ELSE);
        this.visitAny(tree.elseClause);
      }
    },

    /**
     * @param {ImportDeclarationTree} tree
     */
    visitImportDeclarationTree: function(tree) {
      this.write_(TokenType.IMPORT);
      this.writeList_(tree.importPathList, TokenType.COMMA, false);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ImportPathTree} tree
     */
    visitImportPathTree: function(tree) {
      this.writeTokenList_(tree.qualifiedPath, TokenType.PERIOD, false);
      switch (tree.kind) {
        case ALL:
          this.write_(TokenType.PERIOD);
          this.write_(TokenType.STAR);
          break;
        case NONE:
          break;
        case SET:
          this.write_(TokenType.PERIOD);
          this.write_(TokenType.OPEN_CURLY);
          this.writeList_(tree.importSpecifierSet, TokenType.COMMA, false);
          this.write_(TokenType.CLOSE_CURLY);
          break;
      }
    },

    /**
     * @param {ImportSpecifierTree} tree
     */
    visitImportSpecifierTree: function(tree) {
      this.write_(tree.importedName);
      if (tree.destinationName != null) {
        this.write_(TokenType.COLON);
        this.write_(tree.destinationName);
      }
    },

    /**
     * @param {LabelledStatementTree} tree
     */
    visitLabelledStatementTree: function(tree) {
      this.write_(tree.name);
      this.write_(TokenType.COLON);
      this.visitAny(tree.statement);
    },

    /**
     * @param {LiteralExpressionTree} tree
     */
    visitLiteralExpressionTree: function(tree) {
      this.write_(tree.literalToken);
    },

    /**
     * @param {MemberExpressionTree} tree
     */
    visitMemberExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.write_(TokenType.PERIOD);
      this.write_(tree.memberName);
    },

    /**
     * @param {MemberLookupExpressionTree} tree
     */
    visitMemberLookupExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.write_(TokenType.OPEN_SQUARE);
      this.visitAny(tree.memberExpression);
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {MissingPrimaryExpressionTree} tree
     */
    visitMissingPrimaryExpressionTree: function(tree) {
      this.write_('MissingPrimaryExpressionTree');
    },

    /**
     * @param {MixinTree} tree
     */
    visitMixinTree: function(tree) {
      this.write_(PredefinedName.MIXIN);
      this.write_(tree.name);
      this.visitAny(tree.mixinResolves);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {MixinResolveTree} tree
     */
    visitMixinResolveTree: function(tree) {
      this.write_(tree.from);
      this.write_(TokenType.COLON);
      this.write_(tree.to);
    },

    /**
     * @param {MixinResolveListTree} tree
     */
    visitMixinResolveListTree: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      this.writeList_(tree.resolves, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ModuleDefinitionTree} tree
     */
    visitModuleDefinitionTree: function(tree) {
      this.write_(PredefinedName.MODULE);
      this.write_(tree.name);
      this.write_(TokenType.OPEN_CURLY);
      this.writeln_();
      this.writeList_(tree.elements, null, true);
      this.write_(TokenType.CLOSE_CURLY);
      this.writeln_();
    },

    /**
     * @param {NewExpressionTree} tree
     */
    visitNewExpressionTree: function(tree) {
      this.write_(TokenType.NEW);
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },

    /**
     * @param {NullTree} tree
     */
    visitNullTree: function(tree) {
    },

    /**
     * @param {ObjectLiteralExpressionTree} tree
     */
    visitObjectLiteralExpressionTree: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      if (tree.propertyNameAndValues.length > 1)
        this.writeln_();
      this.writelnList_(tree.propertyNameAndValues, TokenType.COMMA);
      if (tree.propertyNameAndValues.length > 1)
        this.writeln_();
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ObjectPatternTree} tree
     */
    visitObjectPatternTree: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.fields, TokenType.COMMA);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ObjectPatternFieldTree} tree
     */
    visitObjectPatternFieldTree: function(tree) {
      this.write_(tree.identifier);
      if (tree.element != null) {
        this.write_(TokenType.COLON);
        this.visitAny(tree.element);
      }
    },

    /**
     * @param {ParenExpressionTree} tree
     */
    visitParenExpressionTree: function(tree) {
      this.write_(TokenType.OPEN_PAREN);
      ParseTreeVisitor.prototype.visitParenExpressionTree.call(this, tree);
      this.write_(TokenType.CLOSE_PAREN);
    },

    /**
     * @param {PostfixExpressionTree} tree
     */
    visitPostfixExpressionTree: function(tree) {
      this.visitAny(tree.operand);
      this.write_(tree.operator);
    },

    /**
     * @param {ProgramTree} tree
     */
    visitProgramTree: function(tree) {
      this.writelnList_(tree.sourceElements);
    },

    /**
     * @param {PropertyNameAssignmentTree} tree
     */
    visitPropertyNameAssignmentTree: function(tree) {
      this.write_(tree.name);
      this.write_(TokenType.COLON);
      this.visitAny(tree.value);
    },

    /**
     * @param {RequiresMemberTree} tree
     */
    visitRequiresMemberTree: function(tree) {
      this.write_(PredefinedName.REQUIRES);
      this.write_(tree.name);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ReturnStatementTree} tree
     */
    visitReturnStatementTree: function(tree) {
      this.write_(TokenType.RETURN);
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {RestParameterTree} tree
     */
    visitRestParameterTree: function(tree) {
      this.write_(TokenType.SPREAD);
      this.write_(tree.identifier);
    },

    /**
     * @param {SetAccessorTree} tree
     */
    visitSetAccessorTree: function(tree) {
      if (tree.isStatic) {
        this.write_(TokenType.CLASS);
      }
      this.write_(PredefinedName.SET);
      this.write_(tree.propertyName);
      this.write_(TokenType.OPEN_PAREN);
      this.write_(tree.parameter);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {SpreadExpressionTree} tree
     */
    visitSpreadExpressionTree: function(tree) {
      this.write_(TokenType.SPREAD);
      this.visitAny(tree.expression);
    },

    /**
     * @param {SpreadPatternElementTree} tree
     */
    visitSpreadPatternElementTree: function(tree) {
      this.write_(TokenType.SPREAD);
      this.visitAny(tree.lvalue);
    },

    /**
     * @param {StateMachineTree} tree
     */
    visitStateMachineTree: function(tree) {
      throw new Error('State machines cannot be converted to source');
    },

    /**
     * @param {SuperExpressionTree} tree
     */
    visitSuperExpressionTree: function(tree) {
      this.write_(TokenType.SUPER);
    },

    /**
     * @param {SwitchStatementTree} tree
     */
    visitSwitchStatementTree: function(tree) {
      this.write_(TokenType.SWITCH);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(TokenType.CLOSE_PAREN);
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.caseClauses);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ThisExpressionTree} tree
     */
    visitThisExpressionTree: function(tree) {
      this.write_(TokenType.THIS);
    },

    /**
     * @param {TraitDeclarationTree} tree
     */
    visitTraitDeclarationTree: function(tree) {
      this.write_(PredefinedName.TRAIT);
      this.write_(tree.name);
      this.write_(TokenType.OPEN_CURLY);
      visitList(tree.elements);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ThrowStatementTree} tree
     */
    visitThrowStatementTree: function(tree) {
      this.write_(TokenType.THROW);
      this.visitAny(tree.value);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {TryStatementTree} tree
     */
    visitTryStatementTree: function(tree) {
      this.write_(TokenType.TRY);
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },

    /**
     * @param {UnaryExpressionTree} tree
     */
    visitUnaryExpressionTree: function(tree) {
      this.write_(tree.operator);
      this.visitAny(tree.operand);
    },

    /**
     * @param {VariableDeclarationListTree} tree
     */
    visitVariableDeclarationListTree: function(tree) {
      this.write_(tree.declarationType);
      this.writeList_(tree.declarations, TokenType.COMMA, false);
    },

    /**
     * @param {VariableDeclarationTree} tree
     */
    visitVariableDeclarationTree: function(tree) {
      this.visitAny(tree.lvalue);
      if (tree.initializer != null) {
        this.write_(TokenType.EQUAL);
        this.visitAny(tree.initializer);
      }
    },

    /**
     * @param {VariableStatementTree} tree
     */
    visitVariableStatementTree: function(tree) {
      ParseTreeVisitor.prototype.visitVariableStatementTree.call(this, tree);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {WhileStatementTree} tree
     */
    visitWhileStatementTree: function(tree) {
      this.write_(TokenType.WHILE);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {WithStatementTree} tree
     */
    visitWithStatementTree: function(tree) {
      this.write_(TokenType.WITH);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {YieldStatementTree} tree
     */
    visitYieldStatementTree: function(tree) {
      this.write_(TokenType.YIELD);
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    writeln_: function() {
      if (this.currentLineComment_ != null) {
        while (this.currentLine_.length < 80) {
          this.currentLine_.append(' ');
        }
        this.currentLine_.append(' // ').append(this.currentLineComment_);
        this.currentLineComment_ = null;
      }
      this.result_.append(this.currentLine_.toString());
      this.result_.append(NEW_LINE);
      this.currentLine_ = new StringBuilder();
    },

    /**
     * @param {Array.<ParseTree>} list
     * @param {TokenType} delimiter
     * @private
     */
    writelnList_: function(list, delimiter) {
      if (delimiter) {
        this.writeList_(list, delimiter, true);
      } else {
        if (list.length > 0)
          this.writeln_();
        this.writeList_(list, null, true);
        if (list.length > 0)
          this.writeln_();
      }
    },

    /**
     * @param {Array.<ParseTree>} list
     * @param {TokenType} delimiter
     * @param {boolean} writeNewLine
     * @private
     */
    writeList_: function(list, delimiter, writeNewLine) {
      var first = true;
      for (var i = 0; i < list.length; i++) {
        var element = list[i];
        if (first) {
          first = false;
        } else {
          if (delimiter != null) {
            this.write_(delimiter);
          }
          if (writeNewLine) {
            this.writeln_();
          }
        }
        this.visitAny(element);
      }
    },

    writeTokenList_: function(list, delimiter, writeNewLine) {
      var first = true;
      for (var i = 0; i < list.length; i++) {
        var element = list[i];
        if (first) {
          first = false;
        } else {
          if (delimiter != null) {
            this.write_(delimiter);
          }
          if (writeNewLine) {
            this.writeln_();
          }
        }
        this.write_(element);
      }
    },

    /**
     * @param {string|Token|TokenType|Keywords} value
     * @private
     */
    write_: function(value) {
      if (value === TokenType.CLOSE_CURLY) {
        this.indentDepth_--;
      }

      // Imperfect but good enough spacing rules to make output readable.
      var spaceBefore = true;
      var spaceAfter = true;
      switch (value) {
        case TokenType.PERIOD:
        case TokenType.OPEN_SQUARE:
        case TokenType.OPEN_PAREN:
        case TokenType.CLOSE_SQUARE:
          spaceBefore = false;
          spaceAfter = false;
          break;
        case TokenType.COLON:
        case TokenType.COMMA:
        case TokenType.SEMI_COLON:
        case TokenType.CLOSE_PAREN:
          spaceBefore = false;
          break;
      }

      if (value != null) {
        if (PRETTY_PRINT) {
          if (this.currentLine_.length == 0) {
            for (var i = 0, indent = this.indentDepth_ * 2; i < indent; ++i) {
              this.currentLine_.append(' ');
            }
          } else {
            if (spaceBefore == false && this.currentLine_.lastChar() == ' ') {
              this.currentLine_.deleteLastChar();
            }
          }
        }
        this.currentLine_.append(value.toString());
        if (spaceAfter) {
          this.currentLine_.append(' ');
        }
      }

      if (value === TokenType.OPEN_CURLY) {
        this.indentDepth_++;
      }
    }
  };

  return {
    ParseTreeWriter: ParseTreeWriter
  };
});
