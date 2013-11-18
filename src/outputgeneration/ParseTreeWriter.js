// Copyright 2012 Traceur Authors.
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

import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';
import {
  AS,
  FROM,
  GET,
  OF,
  MODULE,
  SET
} from '../syntax/PredefinedName';
import {Token} from '../syntax/Token';
import {getKeywordType} from '../syntax/Keywords';

import {
  AMPERSAND,
  AMPERSAND_EQUAL,
  AND,
  ARROW,
  AWAIT,
  BACK_QUOTE,
  BANG,
  BAR,
  BAR_EQUAL,
  BREAK,
  CARET,
  CARET_EQUAL,
  CASE,
  CATCH,
  CLASS,
  CLOSE_ANGLE,
  CLOSE_CURLY,
  CLOSE_PAREN,
  CLOSE_SQUARE,
  COLON,
  COMMA,
  CONST,
  CONTINUE,
  DEBUGGER,
  DEFAULT,
  DELETE,
  DO,
  DOT_DOT_DOT,
  ELSE,
  END_OF_FILE,
  ENUM,
  EQUAL,
  EQUAL_EQUAL,
  EQUAL_EQUAL_EQUAL,
  ERROR,
  EXPORT,
  EXTENDS,
  FALSE,
  FINALLY,
  FOR,
  FUNCTION,
  GREATER_EQUAL,
  IDENTIFIER,
  IF,
  IMPLEMENTS,
  IMPORT,
  IN,
  INSTANCEOF,
  INTERFACE,
  LEFT_SHIFT,
  LEFT_SHIFT_EQUAL,
  LESS_EQUAL,
  LET,
  MINUS,
  MINUS_EQUAL,
  MINUS_MINUS,
  NEW,
  NO_SUBSTITUTION_TEMPLATE,
  NOT_EQUAL,
  NOT_EQUAL_EQUAL,
  NULL,
  NUMBER,
  OPEN_ANGLE,
  OPEN_CURLY,
  OPEN_PAREN,
  OPEN_SQUARE,
  OR,
  PACKAGE,
  PERCENT,
  PERCENT_EQUAL,
  PERIOD,
  PERIOD_OPEN_CURLY,
  PLUS,
  PLUS_EQUAL,
  PLUS_PLUS,
  PRIVATE,
  PROTECTED,
  PUBLIC,
  QUESTION,
  REGULAR_EXPRESSION,
  RETURN,
  RIGHT_SHIFT,
  RIGHT_SHIFT_EQUAL,
  SEMI_COLON,
  SLASH,
  SLASH_EQUAL,
  STAR,
  STAR_EQUAL,
  STATIC,
  STRING,
  SUPER,
  SWITCH,
  TEMPLATE_HEAD,
  TEMPLATE_MIDDLE,
  TEMPLATE_TAIL,
  THIS,
  THROW,
  TILDE,
  TRUE,
  TRY,
  TYPEOF,
  UNSIGNED_RIGHT_SHIFT,
  UNSIGNED_RIGHT_SHIFT_EQUAL,
  VAR,
  VOID,
  WHILE,
  WITH,
  YIELD
} from '../syntax/TokenType';

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
    this.result_ = '';
    this.currentLine_ = '';

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
     * @type {string|Token|TokenType}
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
    this.write_(OPEN_PAREN);
    this.writeList_(tree.args, COMMA, false);
    this.write_(CLOSE_PAREN);
  }

  visitArrayComprehension(tree) {
    this.write_(OPEN_SQUARE);
    this.visitList(tree.comprehensionList);
    this.visitAny(tree.expression);
    this.write_(CLOSE_SQUARE);
  }

  /**
   * @param {ArrayLiteralExpression} tree
   */
  visitArrayLiteralExpression(tree) {
    this.write_(OPEN_SQUARE);
    this.writeList_(tree.elements, COMMA, false);
    this.write_(CLOSE_SQUARE);
  }

  /**
   * @param {ArrayPattern} tree
   */
  visitArrayPattern(tree) {
    this.write_(OPEN_SQUARE);
    this.writeList_(tree.elements, COMMA, false);
    this.write_(CLOSE_SQUARE);
  }

  /**
   * @param {ArrowFunctionExpression} tree
   */
  visitArrowFunctionExpression(tree) {
    this.write_(OPEN_PAREN);
    this.visitAny(tree.formalParameters);
    this.write_(CLOSE_PAREN);
    this.write_(ARROW);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {AwaitStatement} tree
   */
  visitAwaitStatement(tree) {
    this.write_(AWAIT);
    if (tree.identifier !== null) {
      this.write_(tree.identifier);
      this.write_(EQUAL);
    }
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
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
      this.write_(EQUAL);
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
    this.write_(OPEN_CURLY);
    this.writelnList_(tree.statements);
    this.write_(CLOSE_CURLY);
  }

  /**
   * @param {BreakStatement} tree
   */
  visitBreakStatement(tree) {
    this.write_(BREAK);
    if (tree.name !== null) {
      this.write_(tree.name);
    }
    this.write_(SEMI_COLON);
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
    this.write_(CASE);
    this.visitAny(tree.expression);
    this.write_(COLON);
    this.indentDepth_++;
    this.writelnList_(tree.statements);
    this.indentDepth_--;
  }

  /**
   * @param {Catch} tree
   */
  visitCatch(tree) {
    this.write_(CATCH);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.binding);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.catchBody);
  }

  /**
   * @param {ChaineExpression} tree
   */
  visitCascadeExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(PERIOD_OPEN_CURLY);
    this.writelnList_(tree.expressions, SEMI_COLON);
    this.write_(CLOSE_CURLY);
  }

  visitClassShared_(tree) {
    this.write_(CLASS);
    this.visitAny(tree.name);
    if (tree.superClass !== null) {
      this.write_(EXTENDS);
      this.visitAny(tree.superClass);
    }
    this.write_(OPEN_CURLY);
    this.writelnList_(tree.elements);
    this.write_(CLOSE_CURLY);
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
    this.writeList_(tree.expressions, COMMA, false);
  }

  visitComprehensionFor(tree) {
    this.write_(FOR);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.left);
    this.write_(OF);
    this.visitAny(tree.iterator);
    this.write_(CLOSE_PAREN);
  }

  visitComprehensionIf(tree) {
    this.write_(IF);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
  }

  visitComputedPropertyName(tree) {
    this.write_(OPEN_SQUARE);
    this.visitAny(tree.expression);
    this.write_(CLOSE_SQUARE);
  }

  /**
   * @param {ConditionalExpression} tree
   */
  visitConditionalExpression(tree) {
    this.visitAny(tree.condition);
    this.write_(QUESTION);
    this.visitAny(tree.left);
    this.write_(COLON);
    this.visitAny(tree.right);
  }

  /**
   * @param {ContinueStatement} tree
   */
  visitContinueStatement(tree) {
    this.write_(CONTINUE);
    if (tree.name !== null) {
      this.write_(tree.name);
    }
    this.write_(SEMI_COLON);
  }

  /**
   * @param {DebuggerStatement} tree
   */
  visitDebuggerStatement(tree) {
    this.write_(DEBUGGER);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {DefaultClause} tree
   */
  visitDefaultClause(tree) {
    this.write_(DEFAULT);
    this.write_(COLON);
    this.indentDepth_++;
    this.writelnList_(tree.statements);
    this.indentDepth_--;
  }

  /**
   * @param {DoWhileStatement} tree
   */
  visitDoWhileStatement(tree) {
    this.write_(DO);
    this.visitAny(tree.body);
    this.write_(WHILE);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(CLOSE_PAREN);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {EmptyStatement} tree
   */
  visitEmptyStatement(tree) {
    this.write_(SEMI_COLON);
  }

  /**
   * @param {ExportDeclaration} tree
   */
  visitExportDeclaration(tree) {
    this.write_(EXPORT);
    this.visitAny(tree.declaration);
  }

  visitExportDefault(tree) {
    this.write_(DEFAULT);
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {NamedExport} tree
   */
  visitNamedExport(tree) {
    this.visitAny(tree.specifierSet);
    if (tree.moduleSpecifier) {
      this.write_(FROM);
      this.visitAny(tree.moduleSpecifier);
    }
    this.write_(SEMI_COLON);
  }

  /**
   * @param {ExportSpecifier} tree
   */
  visitExportSpecifier(tree) {
    this.write_(tree.lhs);
    if (tree.rhs) {
      this.write_(AS);
      this.write_(tree.rhs);
    }
  }

  /**
   * @param {ExportSpecifierSet} tree
   */
  visitExportSpecifierSet(tree) {
    this.write_(OPEN_CURLY);
    this.writeList_(tree.specifiers, COMMA, false);
    this.write_(CLOSE_CURLY);
  }

  /**
   * @param {ExportStar} tree
   */
  visitExportStar(tree) {
    this.write_(STAR);
  }

  /**
   * @param {ExpressionStatement} tree
   */
  visitExpressionStatement(tree) {
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {Finally} tree
   */
  visitFinally(tree) {
    this.write_(FINALLY);
    this.visitAny(tree.block);
  }

  /**
   * @param {ForOfStatement} tree
   */
  visitForOfStatement(tree) {
    this.write_(FOR);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.initializer);
    this.write_(OF);
    this.visitAny(tree.collection);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {ForInStatement} tree
   */
  visitForInStatement(tree) {
    this.write_(FOR);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.initializer);
    this.write_(IN);
    this.visitAny(tree.collection);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {ForStatement} tree
   */
  visitForStatement(tree) {
    this.write_(FOR);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.initializer);
    this.write_(SEMI_COLON);
    this.visitAny(tree.condition);
    this.write_(SEMI_COLON);
    this.visitAny(tree.increment);
    this.write_(CLOSE_PAREN);
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
        this.write_(COMMA);
      }

      this.visitAny(parameter);
    }
  }

  /**
   * @param {FunctionBody} tree
   */
  visitFunctionBody(tree) {
    this.write_(OPEN_CURLY);
    this.writelnList_(tree.statements);
    this.write_(CLOSE_CURLY);
  }

  /**
   * @param {FunctionDeclaration} tree
   */
  visitFunctionDeclaration(tree) {
    this.visitFunction_(tree);
  }

  /**
   * @param {FunctionExpression} tree
   */
  visitFunctionExpression(tree) {
    this.visitFunction_(tree);
  }

  visitFunction_(tree) {
    this.write_(FUNCTION);
    if (tree.isGenerator) {
      this.write_(STAR);
    }
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.formalParameterList);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.functionBody);
  }

  visitGeneratorComprehension(tree) {
    this.write_(OPEN_PAREN);
    this.visitList(tree.comprehensionList);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
  }

  /**
   * @param {GetAccessor} tree
   */
  visitGetAccessor(tree) {
    if (tree.isStatic)
      this.write_(STATIC);
    this.write_(GET);
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.write_(CLOSE_PAREN);
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
    this.write_(IF);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.ifClause);
    if (tree.elseClause) {
      this.write_(ELSE);
      this.visitAny(tree.elseClause);
    }
  }

  /**
   * @param {ImportDeclaration} tree
   */
  visitImportDeclaration(tree) {
    this.write_(IMPORT);
    this.visitAny(tree.importClause);
    if (tree.moduleSpecifier) {
      this.write_(FROM);
      this.visitAny(tree.moduleSpecifier);
    }
    this.write_(SEMI_COLON);
  }

  /**
   * @param {ImportSpecifier} tree
   */
  visitImportSpecifier(tree) {
    this.write_(tree.lhs);
    if (tree.rhs !== null) {
      this.write_(AS);
      this.write_(tree.rhs);
    }
  }

  visitImportSpecifierSet(tree) {
    if (tree.specifiers.type == STAR) {
      this.write_(STAR);
    } else {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.specifiers, COMMA);
      this.write_(CLOSE_CURLY);
    }
  }

  /**
   * @param {LabelledStatement} tree
   */
  visitLabelledStatement(tree) {
    this.write_(tree.name);
    this.write_(COLON);
    this.visitAny(tree.statement);
  }

  /**
   * @param {LiteralExpression} tree
   */
  visitLiteralExpression(tree) {
    this.write_(tree.literalToken);
  }

  /**
   * @param {LiteralPropertyName} tree
   */
  visitLiteralPropertyName(tree) {
    this.write_(tree.literalToken);
  }

  /**
   * @param {MemberExpression} tree
   */
  visitMemberExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(PERIOD);
    this.write_(tree.memberName);
  }

  /**
   * @param {MemberLookupExpression} tree
   */
  visitMemberLookupExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(OPEN_SQUARE);
    this.visitAny(tree.memberExpression);
    this.write_(CLOSE_SQUARE);
  }

  /**
   * @param {SyntaxErrorTree} tree
   */
  visitSyntaxErrorTree(tree) {
    this.write_('(function() {' +
        `throw SyntaxError(${JSON.stringify(tree.message)});` +
        '})()');
  }

  visitModule(tree) {
    this.writelnList_(tree.scriptItemList, null);
  }

  /**
   * @param {ModuleSpecifier} tree
   */
  visitModuleSpecifier(tree) {
    this.write_(tree.token);
  }

  /**
   * @param {ModuleDeclaration} tree
   */
  visitModuleDeclaration(tree) {
    this.write_(MODULE);
    this.write_(tree.identifier);
    this.write_(FROM);
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {NewExpression} tree
   */
  visitNewExpression(tree) {
    this.write_(NEW);
    this.visitAny(tree.operand);
    this.visitAny(tree.args);
  }

  /**
   * @param {ObjectLiteralExpression} tree
   */
  visitObjectLiteralExpression(tree) {
    this.write_(OPEN_CURLY);
    if (tree.propertyNameAndValues.length > 1)
      this.writeln_();
    this.writelnList_(tree.propertyNameAndValues, COMMA);
    if (tree.propertyNameAndValues.length > 1)
      this.writeln_();
    this.write_(CLOSE_CURLY);
  }

  /**
   * @param {ObjectPattern} tree
   */
  visitObjectPattern(tree) {
    this.write_(OPEN_CURLY);
    this.writelnList_(tree.fields, COMMA);
    this.write_(CLOSE_CURLY);
  }

  /**
   * @param {ObjectPatternField} tree
   */
  visitObjectPatternField(tree) {
    this.visitAny(tree.name);
    if (tree.element !== null) {
      this.write_(COLON);
      this.visitAny(tree.element);
    }
  }

  /**
   * @param {ParenExpression} tree
   */
  visitParenExpression(tree) {
    this.write_(OPEN_PAREN);
    super.visitParenExpression(tree);
    this.write_(CLOSE_PAREN);
  }

  /**
   * @param {PostfixExpression} tree
   */
  visitPostfixExpression(tree) {
    this.visitAny(tree.operand);
    this.write_(tree.operator);
  }

  /**
   * @param {PredefinedType} tree
   */
  visitPredefinedType(tree) {
    this.write_(tree.typeToken);
  }

  /**
   * @param {Script} tree
   */
  visitScript(tree) {
    this.writelnList_(tree.scriptItemList, null);
  }

  /**
   * @param {PropertyMethodAssignment} tree
   */
  visitPropertyMethodAssignment(tree) {
    if (tree.isStatic)
      this.write_(STATIC);
    if (tree.isGenerator)
      this.write_(STAR);
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.formalParameterList);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {PropertyNameAssignment} tree
   */
  visitPropertyNameAssignment(tree) {
    this.visitAny(tree.name);
    this.write_(COLON);
    this.visitAny(tree.value);
  }

  /**
   * @param {PropertyNameShorthand} tree
   */
  visitPropertyNameShorthand(tree) {
    // TODO(arv): Verify
    this.write_(tree.name);
  }

  /**
   * @param {TemplateLiteralExpression} tree
   */
  visitTemplateLiteralExpression(tree) {
    // Template Literals have important whitespace semantics.
    this.visitAny(tree.operand);
    this.writeRaw_(BACK_QUOTE);
    this.visitList(tree.elements);
    this.writeRaw_(BACK_QUOTE);
  }

  /**
   * @param {TemplateLiteralPortion} tree
   */
  visitTemplateLiteralPortion(tree) {
    this.writeRaw_(tree.value);
  }

  /**
   * @param {TemplateSubstitution} tree
   */
  visitTemplateSubstitution(tree) {
    this.writeRaw_('$');
    this.writeRaw_(OPEN_CURLY);
    this.visitAny(tree.expression);
    this.writeRaw_(CLOSE_CURLY);
  }

  /**
   * @param {ReturnStatement} tree
   */
  visitReturnStatement(tree) {
    this.write_(RETURN);
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {RestParameter} tree
   */
  visitRestParameter(tree) {
    this.write_(DOT_DOT_DOT);
    this.write_(tree.identifier.identifierToken);
  }

  /**
   * @param {SetAccessor} tree
   */
  visitSetAccessor(tree) {
    if (tree.isStatic)
      this.write_(STATIC);
    this.write_(SET);
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameter);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {SpreadExpression} tree
   */
  visitSpreadExpression(tree) {
    this.write_(DOT_DOT_DOT);
    this.visitAny(tree.expression);
  }

  /**
   * @param {SpreadPatternElement} tree
   */
  visitSpreadPatternElement(tree) {
    this.write_(DOT_DOT_DOT);
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
    this.write_(SUPER);
  }

  /**
   * @param {SwitchStatement} tree
   */
  visitSwitchStatement(tree) {
    this.write_(SWITCH);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
    this.write_(OPEN_CURLY);
    this.writelnList_(tree.caseClauses);
    this.write_(CLOSE_CURLY);
  }

  /**
   * @param {ThisExpression} tree
   */
  visitThisExpression(tree) {
    this.write_(THIS);
  }

  /**
   * @param {ThrowStatement} tree
   */
  visitThrowStatement(tree) {
    this.write_(THROW);
    this.visitAny(tree.value);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {TryStatement} tree
   */
  visitTryStatement(tree) {
    this.write_(TRY);
    this.visitAny(tree.body);
    this.visitAny(tree.catchBlock);
    this.visitAny(tree.finallyBlock);
  }

  /**
   * @param {TypeName} tree
   */
  visitTypeName(tree) {
    if (tree.moduleName) {
      this.visitAny(tree.moduleName);
      this.write_(PERIOD);
    }
    this.write_(tree.name);
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
    this.writeList_(tree.declarations, COMMA, true, 2);
  }

  /**
   * @param {VariableDeclaration} tree
   */
  visitVariableDeclaration(tree) {
    this.visitAny(tree.lvalue);
    if (tree.typeAnnotation !== null) {
      this.write_(COLON);
      this.visitAny(tree.typeAnnotation);
    }
    if (tree.initializer !== null) {
      this.write_(EQUAL);
      this.visitAny(tree.initializer);
    }
  }

  /**
   * @param {VariableStatement} tree
   */
  visitVariableStatement(tree) {
    super.visitVariableStatement(tree);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {WhileStatement} tree
   */
  visitWhileStatement(tree) {
    this.write_(WHILE);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {WithStatement} tree
   */
  visitWithStatement(tree) {
    this.write_(WITH);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
    this.visitAny(tree.body);
  }

  /**
   * @param {YieldExpression} tree
   */
  visitYieldExpression(tree) {
    this.write_(YIELD);
    if (tree.isYieldFor) {
      this.write_(STAR);
    }
    this.visitAny(tree.expression);
  }

  writeCurrentln_() {
      this.result_ += this.currentLine_ + NEW_LINE;
  }

  writeln_() {
    if (this.currentLineComment_) {
      while (this.currentLine_.length < 80) {
        this.currentLine_ += ' ';
      }
      this.currentLine_ += ' // ' + this.currentLineComment_;
      this.currentLineComment_ = null;
    }
    if (this.currentLine_)
      this.writeCurrentln_();
    this.currentLine_ = '';
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
  writeList_(list, delimiter, writeNewLine, indent = 0) {
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
          if (i === 1)
            this.indentDepth_ += indent;
          this.writeln_();
        }
      }
      this.visitAny(element);
    }
    if (writeNewLine && list.length > 1)
        this.indentDepth_ -= indent;
  }

  /**
   * @param {string|Token|TokenType} value
   * @private
   */
  writeRaw_(value) {
    if (value !== null)
      this.currentLine_ += value;
  }

  /**
   * @param {string|Token|TokenType} value
   * @private
   */
  write_(value) {
    if (value === CLOSE_CURLY) {
      this.indentDepth_--;
    }

    if (value !== null) {
      if (PRETTY_PRINT) {
        if (!this.currentLine_) {
          this.lastToken_ = '';
          for (var i = 0, indent = this.indentDepth_; i < indent; i++) {
            this.currentLine_ += '  ';
          }
        }
      }
      if (this.needsSpace_(value))
        this.currentLine_ += ' ';
      this.lastToken_ = value;
      this.currentLine_ += value;
    }

    if (value === OPEN_CURLY) {
      this.indentDepth_++;
    }
  }

  /**
   * @param {string|Token|TokenType} token
   */
  isIdentifierNameOrNumber_(token) {
    if (token instanceof Token) {
      if (token.isKeyword())
        return true;

      switch (token.type) {
        case IDENTIFIER:
        case NUMBER:
          return true;
      }
    }

    var value = token.toString();
    // We have some contextual keywords like get, set etc.
    switch (value) {
      case AS:
      case FROM:
      case GET:
      case OF:
      case MODULE:
      case SET:
        return true;
    }

    return !!getKeywordType(value);
  }

  /**
   * @param {string|Token|TokenType} value
   */
  needsSpace_(token) {
    if (!this.lastToken_)
      return false;

    // Prevent the next token from being interpreted as regular expression
    // flags.
    if (this.lastToken_.type === REGULAR_EXPRESSION &&
        this.isIdentifierNameOrNumber_(token)) {
      return true;
    }

    var value = token.toString();
    var lastValue = this.lastToken_.toString();

    switch (value) {
      case CLOSE_CURLY:
      case CLOSE_PAREN:
      case CLOSE_SQUARE:
      case COLON:  // Prioritize formatting of object literal over
                             // conditional expression.
      case COMMA:
      case PERIOD:
      case PERIOD_OPEN_CURLY:
      case SEMI_COLON:
        return false;
      case CATCH:
      case ELSE:
      case FINALLY:
      case WHILE:
        return PRETTY_PRINT;

      case OPEN_CURLY:
        switch (lastValue) {
          case OPEN_CURLY:
          case OPEN_PAREN:
          case OPEN_SQUARE:
            return false;
        }
        return PRETTY_PRINT;
    }

    switch (lastValue) {
      case OPEN_CURLY:
      case OPEN_PAREN:
      case OPEN_SQUARE:
        return false;

      case CATCH:
      case COLON:
      case COMMA:
      case DO:
      case FINALLY:
      case FOR:
      case IF:
      case SEMI_COLON:
      case SWITCH:
      case TRY:
      case WHILE:
      case WITH:
        return PRETTY_PRINT;

      case CASE:
      case CLASS:
      case CONST:
      case DELETE:
      case ELSE:
      case ENUM:
      case EXPORT:
      case EXTENDS:
      case IMPLEMENTS:
      case IMPORT:
      case IN:
      case INSTANCEOF:
      case INTERFACE:
      case LET:
      case NEW:
      case PACKAGE:
      case PRIVATE:
      case PROTECTED:
      case PUBLIC:
      case RETURN:
      case STATIC:
      case THROW:
      case TYPEOF:
      case VAR:
      case VOID:
      case YIELD:

      case FROM:
      case OF:
      case MODULE:
        return PRETTY_PRINT || this.isIdentifierNameOrNumber_(token);
    }

    if ((lastValue == PLUS || lastValue == PLUS_PLUS) &&
        (value == PLUS || value == PLUS_PLUS) ||
        (lastValue == MINUS || lastValue == MINUS_MINUS) &&
        (value == MINUS || value == MINUS_MINUS)) {
      return true;
    }

    if (this.spaceArround_(lastValue) || this.spaceArround_(value))
      return true;

    if (this.isIdentifierNameOrNumber_(token)) {
      // This should really line break and indent until ;
      if (lastValue === CLOSE_PAREN)
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
      case AMPERSAND:
      case AMPERSAND_EQUAL:
      case AND:
      case ARROW:
      case AWAIT:
      case BAR:
      case BAR_EQUAL:
      case CARET_EQUAL:
      case CLOSE_ANGLE:
      case EQUAL:
      case EQUAL_EQUAL:
      case EQUAL_EQUAL_EQUAL:
      case GREATER_EQUAL:
      case LEFT_SHIFT:
      case LEFT_SHIFT_EQUAL:
      case LESS_EQUAL:
      case MINUS:
      case MINUS_EQUAL:
      case NOT_EQUAL:
      case NOT_EQUAL_EQUAL:
      case OPEN_ANGLE:
      case OR:
      case PERCENT:
      case PERCENT_EQUAL:
      case PLUS:
      case PLUS_EQUAL:
      case QUESTION:
      case RIGHT_SHIFT:
      case RIGHT_SHIFT_EQUAL:
      case SLASH:
      case SLASH_EQUAL:
      case STAR:
      case STAR_EQUAL:
      case UNSIGNED_RIGHT_SHIFT:
      case UNSIGNED_RIGHT_SHIFT_EQUAL:
        return PRETTY_PRINT;
    }
    return false;
  }
}
