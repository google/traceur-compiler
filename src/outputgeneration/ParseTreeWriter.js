// Copyright 2012 Google Inc.
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

import Keywords from '../syntax/Keywords.js';
import ParseTreeVisitor from '../syntax/ParseTreeVisitor.js';
import {
  FROM,
  GET,
  OF,
  MODULE,
  REQUIRES,
  SET
} from '../syntax/PredefinedName.js';
import StringBuilder from '../util/StringBuilder.js';
import TokenType from '../syntax/TokenType.js';

// constants
var NEW_LINE = '\n';
var PRETTY_PRINT = true;

/**
 * Converts a ParseTree to text.
 */
export class ParseTreeWriter extends ParseTreeVisitor {
  /**
   * @param {ParseTree} highlighted
   * @param {boolean} showLineNumbers
   */
  constructor(highlighted, showLineNumbers) {
    super();
    this.highlighted_ = highlighted;
    this.showLineNumbers_ = showLineNumbers;
    this.result_ = new StringBuilder();
    this.currentLine_ = new StringBuilder();

    /**
     * @type {string}
     * @private
     */
    this.currentLineComment_ = null;

    /**
     * @type {number}
     * @private
     */
    this.indentDepth_ = 0;

    /**
     * @type {string|Token|TokenType|Keywords}
     * @private
     */
    this.lastToken_ = null;
  }

  /**
   * @param {ParseTree} tree
   */
  visitAny(tree) {
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
      this.currentLineComment_ = `Line: ${line}.${column}`;
    }

    this.currentLocation = tree.location;

    super.visitAny(tree);

    // set background color to normal
    if (tree === this.highlighted_) {
      this.write_('\x1B[0m');
    }
  }

  /**
   * @param {ArgumentList} tree
   */
  visitArgumentList(tree) {
    this.write_(TokenType.OPEN_PAREN);
    this.writeList_(tree.args, TokenType.COMMA, false);
    this.write_(TokenType.CLOSE_PAREN);
  }

  visitArrayComprehension(tree) {
    this.write_(TokenType.OPEN_SQUARE);
    this.visitAny(tree.expression);
    this.visitList(tree.comprehensionForList);
    if (tree.ifExpression) {
      this.write_(TokenType.IF);
      this.visitAny(tree.ifExpression);
    }
    this.write_(TokenType.CLOSE_SQUARE);
  }

  /**
   * @param {ArrayLiteralExpression} tree
   */
  visitArrayLiteralExpression(tree) {
    this.write_(TokenType.OPEN_SQUARE);
    this.writeList_(tree.elements, TokenType.COMMA, false);
    this.write_(TokenType.CLOSE_SQUARE);
  }

  /**
   * @param {ArrayPattern} tree
   */
  visitArrayPattern(tree) {
    this.write_(TokenType.OPEN_SQUARE);
    this.writeList_(tree.elements, TokenType.COMMA, false);
    this.write_(TokenType.CLOSE_SQUARE);
  }

  /**
   * @param {ArrowFunctionExpression} tree
   */
  visitArrowFunctionExpression(tree) {
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.formalParameters);
    this.write_(TokenType.CLOSE_PAREN);
    this.write_(TokenType.ARROW);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {AtNameExpression} tree
   */
  visitAtNameExpression(tree) {
    this.write_(tree.atNameToken);
  }

  /**
   * @param {AtNameDeclaration} tree
   */
  visitAtNameDeclaration(tree) {
    this.write_(tree.atNameToken);
    if (tree.initializer) {
      this.write_(TokenType.EQUAL);
      this.visitAny(tree.initializer);
    }
  }

  /**
   * @param {AwaitStatement} tree
   */
  visitAwaitStatement(tree) {
    this.write_(TokenType.AWAIT);
    if (tree.identifier !== null) {
      this.write_(tree.identifier);
      this.write_(TokenType.EQUAL);
    }
    this.visitAny(tree.expression);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {BinaryOperator} tree
   */
  visitBinaryOperator(tree) {
    this.visitAny(tree.left);
    this.write_(tree.operator);
    this.visitAny(tree.right);
  }

  /**
   * @param {BindingElement} tree
   */
  visitBindingElement(tree) {
    this.visitAny(tree.binding);
    if (tree.initializer) {
      this.write_(TokenType.EQUAL);
      this.visitAny(tree.initializer);
    }
  }

  /**
   * @param {BindingIdentifier} tree
   */
  visitBindingIdentifier(tree) {
    this.write_(tree.identifierToken);
  }

  /**
   * @param {Block} tree
   */
  visitBlock(tree) {
    this.write_(TokenType.OPEN_CURLY);
    this.writelnList_(tree.statements);
    this.write_(TokenType.CLOSE_CURLY);
  }

  /**
   * @param {BreakStatement} tree
   */
  visitBreakStatement(tree) {
    this.write_(TokenType.BREAK);
    if (tree.name !== null) {
      this.write_(tree.name);
    }
    this.write_(TokenType.SEMI_COLON);
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
    this.write_(TokenType.CASE);
    this.visitAny(tree.expression);
    this.write_(TokenType.COLON);
    this.indentDepth_++;
    this.writelnList_(tree.statements);
    this.indentDepth_--;
  }

  /**
   * @param {Catch} tree
   */
  visitCatch(tree) {
    this.write_(TokenType.CATCH);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.binding);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.catchBody);
  }

  /**
   * @param {ChaineExpression} tree
   */
  visitCascadeExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(TokenType.PERIOD_OPEN_CURLY);
    this.writelnList_(tree.expressions, TokenType.SEMI_COLON, false);
    this.write_(TokenType.CLOSE_CURLY);
  }

  visitClassShared_(tree) {
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
  }

  /**
   * @param {ClassDeclaration} tree
   */
  visitClassDeclaration(tree) {
    this.visitClassShared_(tree);
  }

  /**
   * @param {ClassExpression} tree
   */
  visitClassExpression(tree) {
    this.visitClassShared_(tree);
  }

  /**
   * @param {CommaExpression} tree
   */
  visitCommaExpression(tree) {
    this.writeList_(tree.expressions, TokenType.COMMA, false);
  }

  visitComprehensionFor(tree) {
    this.write_(TokenType.FOR);
    this.visitAny(tree.left);
    this.write_(OF);
    this.visitAny(tree.iterator);
  }

  /**
   * @param {ConditionalExpression} tree
   */
  visitConditionalExpression(tree) {
    this.visitAny(tree.condition);
    this.write_(TokenType.QUESTION);
    this.visitAny(tree.left);
    this.write_(TokenType.COLON);
    this.visitAny(tree.right);
  }

  /**
   * @param {ContinueStatement} tree
   */
  visitContinueStatement(tree) {
    this.write_(TokenType.CONTINUE);
    if (tree.name !== null) {
      this.write_(tree.name);
    }
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {DebuggerStatement} tree
   */
  visitDebuggerStatement(tree) {
    this.write_(TokenType.DEBUGGER);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {DefaultClause} tree
   */
  visitDefaultClause(tree) {
    this.write_(TokenType.DEFAULT);
    this.write_(TokenType.COLON);
    this.indentDepth_++;
    this.writelnList_(tree.statements);
    this.indentDepth_--;
  }

  /**
   * @param {DoWhileStatement} tree
   */
  visitDoWhileStatement(tree) {
    this.write_(TokenType.DO);
    this.visitAny(tree.body);
    this.write_(TokenType.WHILE);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(TokenType.CLOSE_PAREN);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {EmptyStatement} tree
   */
  visitEmptyStatement(tree) {
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {ExportDeclaration} tree
   */
  visitExportDeclaration(tree) {
    this.write_(TokenType.EXPORT);
    this.visitAny(tree.declaration);
  }

  /**
   * @param {ExportMappingList} tree
   */
  visitExportMappingList(tree) {
    this.writeList_(tree.paths, TokenType.COMMA, false);
  }

  /**
   * @param {ExportMapping} tree
   */
  visitExportMapping(tree) {
    this.visitAny(tree.specifierSet);
    if (tree.moduleExpression) {
      this.write_(FROM);
      this.visitAny(tree.moduleExpression);
    }
  }

  /**
   * @param {ExportSpecifier} tree
   */
  visitExportSpecifier(tree) {
    this.write_(tree.lhs);
    if (tree.rhs) {
      this.write_(TokenType.COLON);
      this.write_(tree.rhs);
    }
  }

  /**
   * @param {ExportSpecifierSet} tree
   */
  visitExportSpecifierSet(tree) {
    this.write_(TokenType.OPEN_CURLY);
    this.writeList_(tree.specifiers, TokenType.COMMA, false);
    this.write_(TokenType.CLOSE_CURLY);
  }

  /**
   * @param {ExportStar} tree
   */
  visitExportStar(tree) {
    this.write_(TokenType.STAR);
  }

  /**
   * @param {ExpressionStatement} tree
   */
  visitExpressionStatement(tree) {
    this.visitAny(tree.expression);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {Finally} tree
   */
  visitFinally(tree) {
    this.write_(TokenType.FINALLY);
    this.visitAny(tree.block);
  }

  /**
   * @param {ForOfStatement} tree
   */
  visitForOfStatement(tree) {
    this.write_(TokenType.FOR);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.initializer);
    this.write_(OF);
    this.visitAny(tree.collection);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {ForInStatement} tree
   */
  visitForInStatement(tree) {
    this.write_(TokenType.FOR);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.initializer);
    this.write_(TokenType.IN);
    this.visitAny(tree.collection);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {ForStatement} tree
   */
  visitForStatement(tree) {
    this.write_(TokenType.FOR);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.initializer);
    this.write_(TokenType.SEMI_COLON);
    this.visitAny(tree.condition);
    this.write_(TokenType.SEMI_COLON);
    this.visitAny(tree.increment);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {FormalParameterList} tree
   */
  visitFormalParameterList(tree) {
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
  }

  /**
   * @param {FunctionDeclaration} tree
   */
  visitFunctionDeclaration(tree) {
    this.write_(Keywords.FUNCTION);
    if (tree.isGenerator) {
      this.write_(TokenType.STAR);
    }
    this.visitAny(tree.name);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.formalParameterList);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.functionBody);
  }

  visitGeneratorComprehension(tree) {
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.expression);
    this.visitList(tree.comprehensionForList);
    if (tree.ifExpression) {
      this.write_(TokenType.IF);
      this.visitAny(tree.ifExpression);
    }
    this.write_(TokenType.CLOSE_PAREN);
  }

  /**
   * @param {GetAccessor} tree
   */
  visitGetAccessor(tree) {
    this.write_(GET);
    this.write_(tree.name);
    this.write_(TokenType.OPEN_PAREN);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {IdentifierExpression} tree
   */
  visitIdentifierExpression(tree) {
    this.write_(tree.identifierToken);
  }

  /**
   * @param {IfStatement} tree
   */
  visitIfStatement(tree) {
    this.write_(TokenType.IF);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.ifClause);
    if (tree.elseClause) {
      this.write_(TokenType.ELSE);
      this.visitAny(tree.elseClause);
    }
  }

  /**
   * @param {ImportDeclaration} tree
   */
  visitImportDeclaration(tree) {
    this.write_(TokenType.IMPORT);
    this.writeList_(tree.importPathList, TokenType.COMMA, false);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {ImportBinding} tree
   */
  visitImportBinding(tree) {
    this.visitAny(tree.importSpecifierSet);
    if (tree.moduleExpression) {
      this.write_(FROM);
      this.visitAny(tree.moduleExpression);
    }
  }

  /**
   * @param {ImportSpecifier} tree
   */
  visitImportSpecifier(tree) {
    this.write_(tree.importedName);
    if (tree.destinationName !== null) {
      this.write_(TokenType.COLON);
      this.write_(tree.destinationName);
    }
  }

  visitImportSpecifierSet(tree) {
    if (tree.specifiers.type == TokenType.STAR)
      this.write_(TokenType.STAR);
    else
      this.visitList(tree.specifiers);
  }

  /**
   * @param {LabelledStatement} tree
   */
  visitLabelledStatement(tree) {
    this.write_(tree.name);
    this.write_(TokenType.COLON);
    this.visitAny(tree.statement);
  }

  /**
   * @param {LiteralExpression} tree
   */
  visitLiteralExpression(tree) {
    this.write_(tree.literalToken);
  }

  /**
   * @param {MemberExpression} tree
   */
  visitMemberExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(TokenType.PERIOD);
    this.write_(tree.memberName);
  }

  /**
   * @param {MemberLookupExpression} tree
   */
  visitMemberLookupExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(TokenType.OPEN_SQUARE);
    this.visitAny(tree.memberExpression);
    this.write_(TokenType.CLOSE_SQUARE);
  }

  /**
   * @param {MissingPrimaryExpression} tree
   */
  visitMissingPrimaryExpression(tree) {
    this.write_('MissingPrimaryExpression');
  }

  /**
   * @param {ModuleDeclarationfinitionTree} tree
   */
  visitModuleDeclaration(tree) {
    this.write_(MODULE);
    this.writeList_(tree.specifiers, TokenType.COMMA, false);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {ModuleDefinition} tree
   */
  visitModuleDefinition(tree) {
    this.write_(MODULE);
    this.write_(tree.name);
    this.write_(TokenType.OPEN_CURLY);
    this.writeln_();
    this.writeList_(tree.elements, null, true);
    this.write_(TokenType.CLOSE_CURLY);
    this.writeln_();
  }

  /**
   * @param {ModuleExpression} tree
   */
  visitModuleExpression(tree) {
    this.visitAny(tree.reference);
    for (var i = 0; i < tree.identifiers.length; i++) {
      this.write_(TokenType.PERIOD);
      this.write_(tree.identifiers[i]);
    }
  }

  /**
   * @param {ModuleRequire} tree
   */
  visitModuleRequire(tree) {
    this.write_(tree.url);
  }

  /**
   * @param {ModuleSpecifier} tree
   */
  visitModuleSpecifier(tree) {
    this.write_(tree.identifier);
    this.write_(FROM);
    this.visitAny(tree.expression);
  }

  /**
   * @param {NameStatement} tree
   */
  visitNameStatement(tree) {
    this.write_(TokenType.PRIVATE);
    this.writeList_(tree.declarations, TokenType.COMMA, false);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {NewExpression} tree
   */
  visitNewExpression(tree) {
    this.write_(TokenType.NEW);
    this.visitAny(tree.operand);
    this.visitAny(tree.args);
  }

  /**
   * @param {NullTree} tree
   */
  visitNullTree(tree) {
  }

  /**
   * @param {ObjectLiteralExpression} tree
   */
  visitObjectLiteralExpression(tree) {
    this.write_(TokenType.OPEN_CURLY);
    if (tree.propertyNameAndValues.length > 1)
      this.writeln_();
    this.writelnList_(tree.propertyNameAndValues, TokenType.COMMA);
    if (tree.propertyNameAndValues.length > 1)
      this.writeln_();
    this.write_(TokenType.CLOSE_CURLY);
  }

  /**
   * @param {ObjectPattern} tree
   */
  visitObjectPattern(tree) {
    this.write_(TokenType.OPEN_CURLY);
    this.writelnList_(tree.fields, TokenType.COMMA);
    this.write_(TokenType.CLOSE_CURLY);
  }

  /**
   * @param {ObjectPatternField} tree
   */
  visitObjectPatternField(tree) {
    this.write_(tree.identifier);
    if (tree.element !== null) {
      this.write_(TokenType.COLON);
      this.visitAny(tree.element);
    }
  }

  /**
   * @param {ParenExpression} tree
   */
  visitParenExpression(tree) {
    this.write_(TokenType.OPEN_PAREN);
    super.visitParenExpression(tree);
    this.write_(TokenType.CLOSE_PAREN);
  }

  /**
   * @param {PostfixExpression} tree
   */
  visitPostfixExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(tree.operator);
  }

  /**
   * @param {Program} tree
   */
  visitProgram(tree) {
    this.writelnList_(tree.programElements, null, true);
  }

  /**
   * @param {PropertyMethodAssignment} tree
   */
  visitPropertyMethodAssignment(tree) {
    if (tree.isGenerator)
      this.write_(TokenType.STAR);
    this.write_(tree.name);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.formalParameterList);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {PropertyNameAssignment} tree
   */
  visitPropertyNameAssignment(tree) {
    this.write_(tree.name);
    this.write_(TokenType.COLON);
    this.visitAny(tree.value);
  }

  /**
   * @param {PropertyNameShorthand} tree
   */
  visitPropertyNameShorthand(tree) {
    this.write_(tree.name);
  }

  /**
   * @param {QuasiLiteralExpression} tree
   */
  visitQuasiLiteralExpression(tree) {
    // Quasi Literals have important whitespace semantics.
    this.visitAny(tree.operand);
    this.writeRaw_(TokenType.BACK_QUOTE);
    this.visitList(tree.elements);
    this.writeRaw_(TokenType.BACK_QUOTE);
  }

  /**
   * @param {QuasiLiteralPortion} tree
   */
  visitQuasiLiteralPortion(tree) {
    this.writeRaw_(tree.value);
  }

  /**
   * @param {QuasiSubstitution} tree
   */
  visitQuasiSubstitution(tree) {
    this.writeRaw_(TokenType.DOLLAR);
    this.writeRaw_(TokenType.OPEN_CURLY);
    this.visitAny(tree.expression);
    this.writeRaw_(TokenType.CLOSE_CURLY);
  }

  /**
   * @param {ReturnStatement} tree
   */
  visitReturnStatement(tree) {
    this.write_(TokenType.RETURN);
    this.visitAny(tree.expression);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {RestParameter} tree
   */
  visitRestParameter(tree) {
    this.write_(TokenType.DOT_DOT_DOT);
    this.write_(tree.identifier.identifierToken);
  }

  /**
   * @param {SetAccessor} tree
   */
  visitSetAccessor(tree) {
    this.write_(SET);
    this.write_(tree.name);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.parameter);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {SpreadExpression} tree
   */
  visitSpreadExpression(tree) {
    this.write_(TokenType.DOT_DOT_DOT);
    this.visitAny(tree.expression);
  }

  /**
   * @param {SpreadPatternElement} tree
   */
  visitSpreadPatternElement(tree) {
    this.write_(TokenType.DOT_DOT_DOT);
    this.visitAny(tree.lvalue);
  }

  /**
   * @param {StateMachine} tree
   */
  visitStateMachine(tree) {
    throw new Error('State machines cannot be converted to source');
  }

  /**
   * @param {SuperExpression} tree
   */
  visitSuperExpression(tree) {
    this.write_(TokenType.SUPER);
  }

  /**
   * @param {SwitchStatement} tree
   */
  visitSwitchStatement(tree) {
    this.write_(TokenType.SWITCH);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(TokenType.CLOSE_PAREN);
    this.write_(TokenType.OPEN_CURLY);
    this.writelnList_(tree.caseClauses);
    this.write_(TokenType.CLOSE_CURLY);
  }

  /**
   * @param {ThisExpression} tree
   */
  visitThisExpression(tree) {
    this.write_(TokenType.THIS);
  }

  /**
   * @param {ThrowStatement} tree
   */
  visitThrowStatement(tree) {
    this.write_(TokenType.THROW);
    this.visitAny(tree.value);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {TryStatement} tree
   */
  visitTryStatement(tree) {
    this.write_(TokenType.TRY);
    this.visitAny(tree.body);
    this.visitAny(tree.catchBlock);
    this.visitAny(tree.finallyBlock);
  }

  /**
   * @param {UnaryExpression} tree
   */
  visitUnaryExpression(tree) {
    this.write_(tree.operator);
    this.visitAny(tree.operand);
  }

  /**
   * @param {VariableDeclarationList} tree
   */
  visitVariableDeclarationList(tree) {
    this.write_(tree.declarationType);
    this.writeList_(tree.declarations, TokenType.COMMA, false);
  }

  /**
   * @param {VariableDeclaration} tree
   */
  visitVariableDeclaration(tree) {
    this.visitAny(tree.lvalue);
    if (tree.initializer !== null) {
      this.write_(TokenType.EQUAL);
      this.visitAny(tree.initializer);
    }
  }

  /**
   * @param {VariableStatement} tree
   */
  visitVariableStatement(tree) {
    super.visitVariableStatement(tree);
    this.write_(TokenType.SEMI_COLON);
  }

  /**
   * @param {WhileStatement} tree
   */
  visitWhileStatement(tree) {
    this.write_(TokenType.WHILE);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {WithStatement} tree
   */
  visitWithStatement(tree) {
    this.write_(TokenType.WITH);
    this.write_(TokenType.OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(TokenType.CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {YieldExpression} tree
   */
  visitYieldExpression(tree) {
    this.write_(TokenType.YIELD);
    if (tree.isYieldFor) {
      this.write_(TokenType.STAR);
    }
    this.visitAny(tree.expression);
  }

  writeCurrentln_() {
      this.result_.append(this.currentLine_.toString());
      this.result_.append(NEW_LINE);
  }

  writeln_() {
    if (this.currentLineComment_ !== null) {
      while (this.currentLine_.length < 80) {
        this.currentLine_.append(' ');
      }
      this.currentLine_.append(' // ').append(this.currentLineComment_);
      this.currentLineComment_ = null;
    }
    if (this.currentLine_.lastChar() === ' ')
      this.currentLine_.deleteLastChar();
    if (this.currentLine_.length)
      this.writeCurrentln_();
    this.currentLine_ = new StringBuilder();
  }

  /**
   * @param {Array.<ParseTree>} list
   * @param {TokenType} delimiter
   * @private
   */
  writelnList_(list, delimiter) {
    if (delimiter) {
      this.writeList_(list, delimiter, true);
    } else {
      if (list.length > 0)
        this.writeln_();
      this.writeList_(list, null, true);
      if (list.length > 0)
        this.writeln_();
    }
  }

  /**
   * @param {Array.<ParseTree>} list
   * @param {TokenType} delimiter
   * @param {boolean} writeNewLine
   * @private
   */
  writeList_(list, delimiter, writeNewLine) {
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
  }

  /**
   * @param {string|Token|TokenType|Keywords} value
   * @private
   */
  writeRaw_(value) {
    if (value !== null) {
      this.currentLine_.append(value.toString());
    }
  }

  /**
   * @param {string|Token|TokenType|Keywords} value
   * @private
   */
  write_(value) {
    if (value === TokenType.CLOSE_CURLY) {
      this.indentDepth_--;
    }

    if (value !== null) {
      if (PRETTY_PRINT) {
        if (this.currentLine_.length === 0) {
          this.lastToken_ = '';
          for (var i = 0, indent = this.indentDepth_ * 2; i < indent; ++i) {
            this.currentLine_.append(' ');
          }
        }
      }
      if (this.needsSpace_(value))
        this.currentLine_.append(' ');
      this.lastToken_ = value;
      this.currentLine_.append(value.toString());
    }

    if (value === TokenType.OPEN_CURLY) {
      this.indentDepth_++;
    }
  }

  /**
   * @param {string|Token|TokenType|Keywords} token
   */
  isIdentifierNameOrNumber_(token) {
    switch (token.type) {
      case TokenType.IDENTIFIER:
      case TokenType.NUMBER:
        return true;
    }

    var value = token.toString();
    // We have some contextual keywords like get, set etc.
    switch (value) {
      case FROM:
      case GET:
      case OF:
      case MODULE:
      case REQUIRES:
      case SET:
        return true;
    }
    return Keywords.isKeyword(value);
  }

  /**
   * @param {string|Token|TokenType|Keywords} value
   */
  needsSpace_(token) {
    if (!this.lastToken_)
      return false;

    var value = token.toString();
    var lastValue = this.lastToken_.toString();

    switch (value) {
      case TokenType.CLOSE_CURLY:
      case TokenType.CLOSE_PAREN:
      case TokenType.CLOSE_SQUARE:
      case TokenType.COLON:  // Prioritize formatting of object literal over
                             // conditional expression.
      case TokenType.COMMA:
      case TokenType.PERIOD:
      case TokenType.PERIOD_OPEN_CURLY:
      case TokenType.SEMI_COLON:
        return false;
      case TokenType.CATCH:
      case TokenType.ELSE:
      case TokenType.FINALLY:
      case TokenType.WHILE:
        return PRETTY_PRINT;

      case TokenType.OPEN_CURLY:
        switch (lastValue) {
          case TokenType.OPEN_CURLY:
          case TokenType.OPEN_PAREN:
          case TokenType.OPEN_SQUARE:
            return false;
        }
        return PRETTY_PRINT;
    }

    switch (lastValue) {
      case TokenType.OPEN_CURLY:
      case TokenType.OPEN_PAREN:
      case TokenType.OPEN_SQUARE:
        return false;

      case TokenType.CATCH:
      case TokenType.COLON:
      case TokenType.COMMA:
      case TokenType.DO:
      case TokenType.FINALLY:
      case TokenType.FOR:
      case TokenType.IF:
      case TokenType.SEMI_COLON:
      case TokenType.SWITCH:
      case TokenType.TRY:
      case TokenType.WHILE:
      case TokenType.WITH:
        return PRETTY_PRINT;

      case TokenType.CASE:
      case TokenType.CLASS:
      case TokenType.CONST:
      case TokenType.DELETE:
      case TokenType.ELSE:
      case TokenType.ENUM:
      case TokenType.EXPORT:
      case TokenType.EXTENDS:
      case TokenType.IMPLEMENTS:
      case TokenType.IMPORT:
      case TokenType.IN:
      case TokenType.INSTANCEOF:
      case TokenType.INTERFACE:
      case TokenType.LET:
      case TokenType.NEW:
      case TokenType.PACKAGE:
      case TokenType.PRIVATE:
      case TokenType.PROTECTED:
      case TokenType.PUBLIC:
      case TokenType.RETURN:
      case TokenType.STATIC:
      case TokenType.THROW:
      case TokenType.TYPEOF:
      case TokenType.VAR:
      case TokenType.VOID:
      case TokenType.YIELD:

      case FROM:
      case OF:
      case MODULE:
      case REQUIRES:
        return PRETTY_PRINT || this.isIdentifierNameOrNumber_(token);
    }

    if ((lastValue == TokenType.PLUS || lastValue == TokenType.PLUS_PLUS) &&
        (value == TokenType.PLUS || value == TokenType.PLUS_PLUS) ||
        (lastValue == TokenType.MINUS || lastValue == TokenType.MINUS_MINUS) &&
        (value == TokenType.MINUS || value == TokenType.MINUS_MINUS)) {
      return true;
    }

    if (this.spaceArround_(lastValue) || this.spaceArround_(value))
      return true;

    if (this.isIdentifierNameOrNumber_(token)) {
      // This should really line break and indent until ;
      if (lastValue === TokenType.CLOSE_PAREN)
        return PRETTY_PRINT;

      return this.isIdentifierNameOrNumber_(this.lastToken_);
    }

    return false;
  }

  /**
   * @param {string} value
   * @return {boolean} Whether we want spaces around the value if we are pretty
   *     printing.
   * @private
   */
  spaceArround_(value) {
    switch (value) {
      case TokenType.AMPERSAND:
      case TokenType.AMPERSAND_EQUAL:
      case TokenType.AND:
      case TokenType.ARROW:
      case TokenType.AWAIT:
      case TokenType.BAR:
      case TokenType.BAR_EQUAL:
      case TokenType.CARET_EQUAL:
      case TokenType.CLOSE_ANGLE:
      case TokenType.EQUAL:
      case TokenType.EQUAL_EQUAL:
      case TokenType.EQUAL_EQUAL_EQUAL:
      case TokenType.GREATER_EQUAL:
      case TokenType.LEFT_SHIFT:
      case TokenType.LEFT_SHIFT_EQUAL:
      case TokenType.LESS_EQUAL:
      case TokenType.MINUS:
      case TokenType.MINUS_EQUAL:
      case TokenType.NOT_EQUAL:
      case TokenType.NOT_EQUAL_EQUAL:
      case TokenType.OPEN_ANGLE:
      case TokenType.OR:
      case TokenType.PERCENT:
      case TokenType.PERCENT_EQUAL:
      case TokenType.PLUS:
      case TokenType.PLUS_EQUAL:
      case TokenType.QUESTION:
      case TokenType.RIGHT_SHIFT:
      case TokenType.RIGHT_SHIFT_EQUAL:
      case TokenType.SLASH:
      case TokenType.SLASH_EQUAL:
      case TokenType.STAR:
      case TokenType.STAR_EQUAL:
      case TokenType.UNSIGNED_RIGHT_SHIFT:
      case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL:
        return PRETTY_PRINT;
    }
    return false;
  }
}
