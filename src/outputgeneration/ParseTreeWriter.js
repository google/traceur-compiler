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
import createObject from '../util/util.js';

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
   * @param {BindThisParameter} tree
   */
  visitBindThisParameter(tree) {
    this.write_(TokenType.THIS);
    this.write_(TokenType.EQUAL);
    this.visitAny(tree.expression);
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
    this.writelnList_(tree.programElements);
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

  /*
   * @param {RequiresMember} tree
   */
  visitRequiresMember(tree) {
    this.write_(REQUIRES);
    this.write_(tree.name);
    this.write_(TokenType.SEMI_COLON);
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
    this.write_(tree.identifier);
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
   * @param {YieldStatement} tree
   */
  visitYieldStatement(tree) {
    this.write_(TokenType.YIELD);
    if (tree.isYieldFor) {
      this.write_(TokenType.STAR);
    }
    this.visitAny(tree.expression);
    this.write_(TokenType.SEMI_COLON);
  }

  writeln_() {
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

  // TODO(jjb) not called
  writeTokenList_(list, delimiter, writeNewLine) {
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
}
