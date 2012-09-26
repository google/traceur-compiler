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

traceur.define('outputgeneration', function() {
  'use strict';

  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var PredefinedName = traceur.syntax.PredefinedName;
  var Keywords = traceur.syntax.Keywords;
  var TokenType = traceur.syntax.TokenType;
  var StringBuilder = traceur.util.StringBuilder;

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

  ParseTreeWriter.prototype = traceur.createObject(
      ParseTreeVisitor.prototype, {

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
      if (!tree) {
        return;
      }
        
      // set background color to red if tree is highlighted
      if (tree === this.highlighted_) {
        this.write_('\x1B[41m');
      }

      if (tree.location !== null &&
          tree.location.start !== null && this.showLineNumbers_) {
          var line = tree.location.start.line + 1;
          var column = tree.location.start.column;
        this.currentLineComment_ = 'Line: ' + line + '.' + column;
      }
      
      this.currentLocation = tree.location;
      
      ParseTreeVisitor.prototype.visitAny.call(this, tree);

      // set background color to normal
      if (tree === this.highlighted_) {
        this.write_('\x1B[0m');
      }
    },

    /**
     * @param {ArgumentList} tree
     */
    visitArgumentList: function(tree) {
      this.write_(TokenType.OPEN_PAREN);
      this.writeList_(tree.args, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_PAREN);
    },

    visitArrayComprehension: function(tree) {
      this.write_(TokenType.OPEN_SQUARE);
      this.visitAny(tree.expression);
      this.visitList(tree.comprehensionForList);
      if (tree.ifExpression) {
        this.write_(TokenType.IF);
        this.visitAny(tree.ifExpression);
      }
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {ArrayLiteralExpression} tree
     */
    visitArrayLiteralExpression: function(tree) {
      this.write_(TokenType.OPEN_SQUARE);
      this.writeList_(tree.elements, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {ArrayPattern} tree
     */
    visitArrayPattern: function(tree) {
      this.write_(TokenType.OPEN_SQUARE);
      this.writeList_(tree.elements, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {traceur.syntax.trees.ArrowFunctionExpression} tree
     */
    visitArrowFunctionExpression: function(tree) {
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.formalParameters);
      this.write_(TokenType.CLOSE_PAREN);
      this.write_(TokenType.ARROW);
      this.visitAny(tree.functionBody);
    },

    /**
     * @param {AtNameExpression} tree
     */
    visitAtNameExpression: function(tree) {
      this.write_(tree.atNameToken);
    },

    /**
     * @param {AtNameDeclaration} tree
     */
    visitAtNameDeclaration: function(tree) {
      this.write_(tree.atNameToken);
      if (tree.initializer) {
        this.write_(TokenType.EQUAL);
        this.visitAny(tree.initializer);
      }
    },

    /**
     * @param {AwaitStatement} tree
     */
    visitAwaitStatement: function(tree) {
      this.write_(TokenType.AWAIT);
      if (tree.identifier !== null) {
        this.write_(tree.identifier);
        this.write_(TokenType.EQUAL);
      }
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {BinaryOperator} tree
     */
    visitBinaryOperator: function(tree) {
      this.visitAny(tree.left);
      this.write_(tree.operator);
      this.visitAny(tree.right);
    },

    /**
     * @param {BindThisParameter} tree
     */
    visitBindThisParameter: function(tree) {
      this.write_(TokenType.THIS);
      this.write_(TokenType.EQUAL);
      this.visitAny(tree.expression);
    },

    /**
     * @param {BindingElement} tree
     */
    visitBindingElement: function(tree) {
      this.visitAny(tree.binding);
      if (tree.initializer) {
        this.write_(TokenType.EQUAL);
        this.visitAny(tree.initializer);
      }
    },

    /**
     * @param {BindingIdentifier} tree
     */
    visitBindingIdentifier: function(tree) {
      this.write_(tree.identifierToken);
    },

    /**
     * @param {Block} tree
     */
    visitBlock: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.statements);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {BreakStatement} tree
     */
    visitBreakStatement: function(tree) {
      this.write_(TokenType.BREAK);
      if (tree.name !== null) {
        this.write_(tree.name);
      }
      this.write_(TokenType.SEMI_COLON);
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
      this.write_(TokenType.CASE);
      this.visitAny(tree.expression);
      this.write_(TokenType.COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },

    /**
     * @param {Catch} tree
     */
    visitCatch: function(tree) {
      this.write_(TokenType.CATCH);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.binding);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.catchBody);
    },

    /**
     * @param {ChaineExpression} tree
     */
    visitCascadeExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(TokenType.PERIOD_OPEN_CURLY);
      this.writelnList_(tree.expressions, TokenType.SEMI_COLON, false);
      this.write_(TokenType.CLOSE_CURLY);
    },

    visitClassShared_: function(tree) {
      this.write_(TokenType.CLASS);
      if (tree.name) 
        this.write_(tree.name);
      if (tree.superClass !== null) {
        this.write_(TokenType.EXTENDS);
        this.visitAny(tree.superClass);
      }
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.elements);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ClassDeclaration} tree
     */
    visitClassDeclaration: function(tree) {
      this.visitClassShared_(tree);
    },

    /**
     * @param {ClassExpression} tree
     */
    visitClassExpression: function(tree) {
      this.visitClassShared_(tree);
    },

    /**
     * @param {CommaExpression} tree
     */
    visitCommaExpression: function(tree) {
      this.writeList_(tree.expressions, TokenType.COMMA, false);
    },

    visitComprehensionFor: function(tree) {
      this.write_(TokenType.FOR);
      this.visitAny(tree.left);
      this.write_(PredefinedName.OF);
      this.visitAny(tree.iterator);
    },

    /**
     * @param {ConditionalExpression} tree
     */
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.write_(TokenType.QUESTION);
      this.visitAny(tree.left);
      this.write_(TokenType.COLON);
      this.visitAny(tree.right);
    },

    /**
     * @param {ContinueStatement} tree
     */
    visitContinueStatement: function(tree) {
      this.write_(TokenType.CONTINUE);
      if (tree.name !== null) {
        this.write_(tree.name);
      }
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {DebuggerStatement} tree
     */
    visitDebuggerStatement: function(tree) {
      this.write_(TokenType.DEBUGGER);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {DefaultClause} tree
     */
    visitDefaultClause: function(tree) {
      this.write_(TokenType.DEFAULT);
      this.write_(TokenType.COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },

    /**
     * @param {DoWhileStatement} tree
     */
    visitDoWhileStatement: function(tree) {
      this.write_(TokenType.DO);
      this.visitAny(tree.body);
      this.write_(TokenType.WHILE);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(TokenType.CLOSE_PAREN);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {EmptyStatement} tree
     */
    visitEmptyStatement: function(tree) {
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ExportDeclaration} tree
     */
    visitExportDeclaration: function(tree) {
      this.write_(TokenType.EXPORT);
      this.visitAny(tree.declaration);
    },

    /**
     * @param {traceur.syntax.trees.ExportMappingList} tree
     */
    visitExportMappingList: function(tree) {
      this.writeList_(tree.paths, TokenType.COMMA, false);
    },

    /**
     * @param {traceur.syntax.trees.ExportMapping} tree
     */
    visitExportMapping: function(tree) {
      this.visitAny(tree.specifierSet);
      if (tree.moduleExpression) {
        this.write_(PredefinedName.FROM);
        this.visitAny(tree.moduleExpression);
      }
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifier} tree
     */
    visitExportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs) {
        this.write_(TokenType.COLON);
        this.write_(tree.rhs);
      }
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifierSet} tree
     */
    visitExportSpecifierSet: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      this.writeList_(tree.specifiers, TokenType.COMMA, false);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ExpressionStatement} tree
     */
    visitExpressionStatement: function(tree) {
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {Finally} tree
     */
    visitFinally: function(tree) {
      this.write_(TokenType.FINALLY);
      this.visitAny(tree.block);
    },

    /**
     * @param {ForOfStatement} tree
     */
    visitForOfStatement: function(tree) {
      this.write_(TokenType.FOR);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(PredefinedName.OF);
      this.visitAny(tree.collection);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {ForInStatement} tree
     */
    visitForInStatement: function(tree) {
      this.write_(TokenType.FOR);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(TokenType.IN);
      this.visitAny(tree.collection);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {ForStatement} tree
     */
    visitForStatement: function(tree) {
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
     * @param {FormalParameterList} tree
     */
    visitFormalParameterList: function(tree) {
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
     * @param {FunctionDeclaration} tree
     */
    visitFunctionDeclaration: function(tree) {
      this.write_(Keywords.FUNCTION);
      if (tree.isGenerator) {
        this.write_(TokenType.STAR);
      }
      this.visitAny(tree.name);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.functionBody);
    },

    visitGeneratorComprehension: function(tree) {
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.expression);
      this.visitList(tree.comprehensionForList);
      if (tree.ifExpression) {
        this.write_(TokenType.IF);
        this.visitAny(tree.ifExpression);
      }
      this.write_(TokenType.CLOSE_PAREN);
    },

    /**
     * @param {GetAccessor} tree
     */
    visitGetAccessor: function(tree) {
      this.write_(PredefinedName.GET);
      this.write_(tree.propertyName);
      this.write_(TokenType.OPEN_PAREN);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {IdentifierExpression} tree
     */
    visitIdentifierExpression: function(tree) {
      this.write_(tree.identifierToken);
    },

    /**
     * @param {IfStatement} tree
     */
    visitIfStatement: function(tree) {
      this.write_(TokenType.IF);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.ifClause);
      if (tree.elseClause) {
        this.write_(TokenType.ELSE);
        this.visitAny(tree.elseClause);
      }
    },

    /**
     * @param {ImportDeclaration} tree
     */
    visitImportDeclaration: function(tree) {
      this.write_(TokenType.IMPORT);
      this.writeList_(tree.importPathList, TokenType.COMMA, false);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ImportBinding} tree
     */
    visitImportBinding: function(tree) {
      this.visitAny(tree.importSpecifierSet);
      if (tree.moduleExpression) {
        this.write_(PredefinedName.FROM);
        this.visitAny(tree.moduleExpression);
      }
    },

    /**
     * @param {ImportSpecifier} tree
     */
    visitImportSpecifier: function(tree) {
      this.write_(tree.importedName);
      if (tree.destinationName !== null) {
        this.write_(TokenType.COLON);
        this.write_(tree.destinationName);
      }
    },

    visitImportSpecifierSet: function(tree) {
      if (tree.specifiers.type == TokenType.STAR)
        this.write_(TokenType.STAR);
      else
        this.visitList(tree.specifiers);
    },

    /**
     * @param {LabelledStatement} tree
     */
    visitLabelledStatement: function(tree) {
      this.write_(tree.name);
      this.write_(TokenType.COLON);
      this.visitAny(tree.statement);
    },

    /**
     * @param {LiteralExpression} tree
     */
    visitLiteralExpression: function(tree) {
      this.write_(tree.literalToken);
    },

    /**
     * @param {MemberExpression} tree
     */
    visitMemberExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(TokenType.PERIOD);
      this.write_(tree.memberName);
    },

    /**
     * @param {MemberLookupExpression} tree
     */
    visitMemberLookupExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(TokenType.OPEN_SQUARE);
      this.visitAny(tree.memberExpression);
      this.write_(TokenType.CLOSE_SQUARE);
    },

    /**
     * @param {MissingPrimaryExpression} tree
     */
    visitMissingPrimaryExpression: function(tree) {
      this.write_('MissingPrimaryExpression');
    },

    /**
     * @param {ModuleDeclarationfinitionTree} tree
     */
    visitModuleDeclaration: function(tree) {
      this.write_(PredefinedName.MODULE);
      this.writeList_(tree.specifiers, TokenType.COMMA, false);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ModuleDefinition} tree
     */
    visitModuleDefinition: function(tree) {
      this.write_(PredefinedName.MODULE);
      this.write_(tree.name);
      this.write_(TokenType.OPEN_CURLY);
      this.writeln_();
      this.writeList_(tree.elements, null, true);
      this.write_(TokenType.CLOSE_CURLY);
      this.writeln_();
    },

    /**
     * @param {ModuleExpression} tree
     */
    visitModuleExpression: function(tree) {
      this.visitAny(tree.reference);
      for (var i = 0; i < tree.identifiers.length; i++) {
        this.write_(TokenType.PERIOD);
        this.write_(tree.identifiers[i]);
      }
    },

    /**
     * @param {ModuleRequire} tree
     */
    visitModuleRequire: function(tree) {
      this.write_(tree.url);
    },

    /**
     * @param {ModuleSpecifier} tree
     */
    visitModuleSpecifier: function(tree) {
      this.write_(tree.identifier);
      this.write_(PredefinedName.FROM);
      this.visitAny(tree.expression);
    },

    /**
     * @param {NameStatement} tree
     */
    visitNameStatement: function(tree) {
      this.write_(TokenType.PRIVATE);
      this.writeList_(tree.declarations, TokenType.COMMA, false);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {NewExpression} tree
     */
    visitNewExpression: function(tree) {
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
     * @param {ObjectLiteralExpression} tree
     */
    visitObjectLiteralExpression: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      if (tree.propertyNameAndValues.length > 1)
        this.writeln_();
      this.writelnList_(tree.propertyNameAndValues, TokenType.COMMA);
      if (tree.propertyNameAndValues.length > 1)
        this.writeln_();
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ObjectPattern} tree
     */
    visitObjectPattern: function(tree) {
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.fields, TokenType.COMMA);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ObjectPatternField} tree
     */
    visitObjectPatternField: function(tree) {
      this.write_(tree.identifier);
      if (tree.element !== null) {
        this.write_(TokenType.COLON);
        this.visitAny(tree.element);
      }
    },

    /**
     * @param {ParenExpression} tree
     */
    visitParenExpression: function(tree) {
      this.write_(TokenType.OPEN_PAREN);
      ParseTreeVisitor.prototype.visitParenExpression.call(this, tree);
      this.write_(TokenType.CLOSE_PAREN);
    },

    /**
     * @param {PostfixExpression} tree
     */
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(tree.operator);
    },

    /**
     * @param {Program} tree
     */
    visitProgram: function(tree) {
      this.writelnList_(tree.programElements);
    },

    /**
     * @param {PropertyMethodAssignment} tree
     */
    visitPropertyMethodAssignment: function(tree) {
      if (tree.isGenerator)
        this.write_(TokenType.STAR);
      this.write_(tree.name);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.functionBody);
    },

    /**
     * @param {PropertyNameAssignment} tree
     */
    visitPropertyNameAssignment: function(tree) {
      this.write_(tree.name);
      this.write_(TokenType.COLON);
      this.visitAny(tree.value);
    },

    /**
     * @param {PropertyNameShorthand} tree
     */
    visitPropertyNameShorthand: function(tree) {
      this.write_(tree.name);
    },

    /**
     * @param {traceur.syntax.trees.QuasiLiteralExpression} tree
     */
    visitQuasiLiteralExpression: function(tree) {
      // Quasi Literals have important whitespace semantics.
      this.visitAny(tree.operand);
      this.writeRaw_(TokenType.BACK_QUOTE);
      this.visitList(tree.elements);
      this.writeRaw_(TokenType.BACK_QUOTE);
    },

    /**
     * @param {traceur.syntax.trees.QuasiLiteralPortion} tree
     */
    visitQuasiLiteralPortion: function(tree) {
      this.writeRaw_(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.QuasiSubstitution} tree
     */
    visitQuasiSubstitution: function(tree) {
      this.writeRaw_(TokenType.DOLLAR);
      this.writeRaw_(TokenType.OPEN_CURLY);
      this.visitAny(tree.expression);
      this.writeRaw_(TokenType.CLOSE_CURLY);
    },

    /*
     * @param {RequiresMember} tree
     */
    visitRequiresMember: function(tree) {
      this.write_(PredefinedName.REQUIRES);
      this.write_(tree.name);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {ReturnStatement} tree
     */
    visitReturnStatement: function(tree) {
      this.write_(TokenType.RETURN);
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {RestParameter} tree
     */
    visitRestParameter: function(tree) {
      this.write_(TokenType.DOT_DOT_DOT);
      this.write_(tree.identifier);
    },

    /**
     * @param {SetAccessor} tree
     */
    visitSetAccessor: function(tree) {
      this.write_(PredefinedName.SET);
      this.write_(tree.propertyName);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.parameter);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {SpreadExpression} tree
     */
    visitSpreadExpression: function(tree) {
      this.write_(TokenType.DOT_DOT_DOT);
      this.visitAny(tree.expression);
    },

    /**
     * @param {SpreadPatternElement} tree
     */
    visitSpreadPatternElement: function(tree) {
      this.write_(TokenType.DOT_DOT_DOT);
      this.visitAny(tree.lvalue);
    },

    /**
     * @param {StateMachine} tree
     */
    visitStateMachine: function(tree) {
      throw new Error('State machines cannot be converted to source');
    },

    /**
     * @param {SuperExpression} tree
     */
    visitSuperExpression: function(tree) {
      this.write_(TokenType.SUPER);
    },

    /**
     * @param {SwitchStatement} tree
     */
    visitSwitchStatement: function(tree) {
      this.write_(TokenType.SWITCH);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(TokenType.CLOSE_PAREN);
      this.write_(TokenType.OPEN_CURLY);
      this.writelnList_(tree.caseClauses);
      this.write_(TokenType.CLOSE_CURLY);
    },

    /**
     * @param {ThisExpression} tree
     */
    visitThisExpression: function(tree) {
      this.write_(TokenType.THIS);
    },

    /**
     * @param {ThrowStatement} tree
     */
    visitThrowStatement: function(tree) {
      this.write_(TokenType.THROW);
      this.visitAny(tree.value);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {TryStatement} tree
     */
    visitTryStatement: function(tree) {
      this.write_(TokenType.TRY);
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },

    /**
     * @param {UnaryExpression} tree
     */
    visitUnaryExpression: function(tree) {
      this.write_(tree.operator);
      this.visitAny(tree.operand);
    },

    /**
     * @param {VariableDeclarationList} tree
     */
    visitVariableDeclarationList: function(tree) {
      this.write_(tree.declarationType);
      this.writeList_(tree.declarations, TokenType.COMMA, false);
    },

    /**
     * @param {VariableDeclaration} tree
     */
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      if (tree.initializer !== null) {
        this.write_(TokenType.EQUAL);
        this.visitAny(tree.initializer);
      }
    },

    /**
     * @param {VariableStatement} tree
     */
    visitVariableStatement: function(tree) {
      ParseTreeVisitor.prototype.visitVariableStatement.call(this, tree);
      this.write_(TokenType.SEMI_COLON);
    },

    /**
     * @param {WhileStatement} tree
     */
    visitWhileStatement: function(tree) {
      this.write_(TokenType.WHILE);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {WithStatement} tree
     */
    visitWithStatement: function(tree) {
      this.write_(TokenType.WITH);
      this.write_(TokenType.OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(TokenType.CLOSE_PAREN);
      this.visitAny(tree.body);
    },

    /**
     * @param {YieldStatement} tree
     */
    visitYieldStatement: function(tree) {
      this.write_(TokenType.YIELD);
      if (tree.isYieldFor) {
        this.write_(TokenType.STAR);
      }
      this.visitAny(tree.expression);
      this.write_(TokenType.SEMI_COLON);
    },

    writeln_: function() {
      if (this.currentLineComment_ !== null) {
        while (this.currentLine_.length < 80) {
          this.currentLine_.append(' ');
        }
        this.currentLine_.append(' // ').append(this.currentLineComment_);
        this.currentLineComment_ = null;
      }
      this.result_.append(this.currentLine_.toString());
      this.result_.append(NEW_LINE);
      this.outputLineCount++;
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
          if (delimiter !== null) {
            this.write_(delimiter);
          }
          if (writeNewLine) {
            this.writeln_();
          }
        }
        this.visitAny(element);
      }
    },
    
    // TODO(jjb) not called 
    writeTokenList_: function(list, delimiter, writeNewLine) {
      var first = true;
      for (var i = 0; i < list.length; i++) {
        var element = list[i];
        if (first) {
          first = false;
        } else {
          if (delimiter !== null) {
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
    writeRaw_: function(value) {
      if (value !== null) {
        this.currentLine_.append(value.toString());
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

      if (value !== null) {
        if (PRETTY_PRINT) {
          if (this.currentLine_.length === 0) {
            for (var i = 0, indent = this.indentDepth_ * 2; i < indent; ++i) {
              this.currentLine_.append(' ');
            }
          } else {
            if (spaceBefore === false && this.currentLine_.lastChar() === ' ') {
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
    
  });
  
  return {
    ParseTreeWriter: ParseTreeWriter
  };
});
