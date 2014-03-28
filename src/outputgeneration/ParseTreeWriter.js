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

import {
  BLOCK,
  IF_STATEMENT,
  LITERAL_EXPRESSION,
  POSTFIX_EXPRESSION,
  UNARY_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';
import {
  AS,
  ASYNC,
  AWAIT,
  FROM,
  GET,
  OF,
  MODULE,
  SET
} from '../syntax/PredefinedName';
import {Token} from '../syntax/Token';
import {getKeywordType} from '../syntax/Keywords';
import {
  isIdentifierPart,
  isWhitespace
} from '../syntax/Scanner';

import {
  AMPERSAND,
  AMPERSAND_EQUAL,
  AND,
  ARROW,
  AT,
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

var NEW_LINE = '\n';
var LINE_LENGTH = 80;

/**
 * Converts a ParseTree to text.
 */
export class ParseTreeWriter extends ParseTreeVisitor {
  /**
   * @param {ParseTree} highlighted
   * @param {boolean} showLineNumbers
   */
  constructor({
    highlighted = false,
    showLineNumbers = false,
    prettyPrint = true
  } = {}) {
    super();
    this.highlighted_ = highlighted;
    this.showLineNumbers_ = showLineNumbers;
    this.prettyPrint_ = prettyPrint;
    this.result_ = '';
    this.currentLine_ = '';

    /**
     * @private {string}
     */
    this.currentLineComment_ = null;

    /**
     * @private {number}
     */
    this.indentDepth_ = 0;

    /**
     * @private {TypeAnnotation}
     */
    this.currentParameterTypeAnnotation_ = null;
  }

  toString() {
    if (this.currentLine_.length > 0) {
      this.result_ += this.currentLine_;
      this.currentLine_ = '';
    }

    return this.result_;
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

    super.visitAny(tree);

    // set background color to normal
    if (tree === this.highlighted_) {
      this.write_('\x1B[0m');
    }
  }

  /**
   * @param {Annotation} tree
   */
  visitAnnotation(tree) {
    this.write_(AT);
    this.visitAny(tree.name);

    if (tree.args !== null) {
      this.write_(OPEN_PAREN);
      this.writeList_(tree.args, COMMA, false);
      this.write_(CLOSE_PAREN);
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
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.write_(ARROW);
    this.writeSpace_();
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {AwaitExpression} tree
   */
  visitAwaitExpression(tree) {
    this.write_(AWAIT);
    this.writeSpace_();
    this.visitAny(tree.expression);
  }

  /**
   * @param {BinaryOperator} tree
   */
  visitBinaryOperator(tree) {
    var left = tree.left;
    this.visitAny(left);
    var operator = tree.operator;
    if (left.type === POSTFIX_EXPRESSION &&
        requiresSpaceBetween(left.operator.type, operator.type)) {
      this.writeRequiredSpace_();
    } else {
      this.writeSpace_();
    }
    this.write_(operator);
    var right = tree.right;
    if (right.type === UNARY_EXPRESSION &&
        requiresSpaceBetween(operator.type, right.operator.type)) {
      this.writeRequiredSpace_();
    } else {
      this.writeSpace_();
    }
    this.visitAny(right);
  }

  /**
   * @param {BindingElement} tree
   */
  visitBindingElement(tree) {
    var typeAnnotation = this.currentParameterTypeAnnotation_;
    // resetting type annotation so it doesn't filter down recursively
    this.currentParameterTypeAnnotation_ = null;
    this.visitAny(tree.binding);
    this.writeTypeAnnotation_(typeAnnotation);
    if (tree.initialiser) {
      this.writeSpace_();
      this.write_(EQUAL);
      this.writeSpace_();
      this.visitAny(tree.initialiser);
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
      this.writeSpace_();
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
    this.writeSpace_();
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
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.binding);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.visitAny(tree.catchBody);
  }

  visitClassShared_(tree) {
    this.writeAnnotations_(tree.annotations);
    this.write_(CLASS);
    this.writeSpace_();
    this.visitAny(tree.name);
    if (tree.superClass !== null) {
      this.writeSpace_();
      this.write_(EXTENDS);
      this.writeSpace_();
      this.visitAny(tree.superClass);
    }
    this.writeSpace_();
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
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.left);
    this.writeSpace_();
    this.write_(OF);
    this.writeSpace_();
    this.visitAny(tree.iterator);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
  }

  visitComprehensionIf(tree) {
    this.write_(IF);
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
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
    this.writeSpace_();
    this.write_(QUESTION);
    this.writeSpace_();
    this.visitAny(tree.left);
    this.writeSpace_();
    this.write_(COLON);
    this.writeSpace_();
    this.visitAny(tree.right);
  }

  /**
   * @param {ContinueStatement} tree
   */
  visitContinueStatement(tree) {
    this.write_(CONTINUE);
    if (tree.name !== null) {
      this.writeSpace_();
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
    this.visitAnyBlockOrIndent_(tree.body);
    this.writeSpace_();
    this.write_(WHILE);
    this.writeSpace_();
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
    this.writeAnnotations_(tree.annotations);
    this.write_(EXPORT);
    this.writeSpace_();
    this.visitAny(tree.declaration);
  }

  visitExportDefault(tree) {
    this.write_(DEFAULT);
    this.writeSpace_();
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {NamedExport} tree
   */
  visitNamedExport(tree) {
    this.visitAny(tree.specifierSet);
    if (tree.moduleSpecifier) {
      this.writeSpace_();
      this.write_(FROM);
      this.writeSpace_();
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
      this.writeSpace_();
      this.write_(AS);
      this.writeSpace_();
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
    this.writeSpace_();
    this.visitAny(tree.block);
  }

  /**
   * @param {ForOfStatement} tree
   */
  visitForOfStatement(tree) {
    this.write_(FOR);
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.initialiser);
    this.writeSpace_();
    this.write_(OF);
    this.writeSpace_();
    this.visitAny(tree.collection);
    this.write_(CLOSE_PAREN);
    this.visitAnyBlockOrIndent_(tree.body);
  }

  /**
   * @param {ForInStatement} tree
   */
  visitForInStatement(tree) {
    this.write_(FOR);
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.initialiser);
    this.writeSpace_();
    this.write_(IN);
    this.writeSpace_();
    this.visitAny(tree.collection);
    this.write_(CLOSE_PAREN);
    this.visitAnyBlockOrIndent_(tree.body);
  }

  /**
   * @param {ForStatement} tree
   */
  visitForStatement(tree) {
    this.write_(FOR);
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.initialiser);
    this.write_(SEMI_COLON);
    this.writeSpace_();
    this.visitAny(tree.condition);
    this.write_(SEMI_COLON);
    this.writeSpace_();
    this.visitAny(tree.increment);
    this.write_(CLOSE_PAREN);
    this.visitAnyBlockOrIndent_(tree.body);
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
        this.writeSpace_();
      }

      this.visitAny(parameter);
    }
  }

  /**
   * @param {FormalParameter} tree
   */
  visitFormalParameter(tree) {
    this.writeAnnotations_(tree.annotations, false);
    this.currentParameterTypeAnnotation_ = tree.typeAnnotation;
    this.visitAny(tree.parameter);
    this.currentParameterTypeAnnotation_ = null;
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
    this.writeAnnotations_(tree.annotations);
    if (tree.isAsyncFunction())
      this.write_(tree.functionKind);
    this.write_(FUNCTION);
    if (tree.isGenerator())
      this.write_(tree.functionKind);

    if (tree.name) {
      this.writeSpace_();
      this.visitAny(tree.name);
    }

    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    this.writeTypeAnnotation_(tree.typeAnnotation);
    this.writeSpace_();
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
    this.writeAnnotations_(tree.annotations);
    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }
    this.write_(GET);
    this.writeSpace_();
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.writeTypeAnnotation_(tree.typeAnnotation);
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
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(CLOSE_PAREN);
    this.visitAnyBlockOrIndent_(tree.ifClause);
    if (tree.elseClause) {
      if (tree.ifClause.type === BLOCK)
        this.writeSpace_();
      this.write_(ELSE);
      if (tree.elseClause.type === IF_STATEMENT) {
        this.writeSpace_();
        this.visitAny(tree.elseClause);
      } else {
        this.visitAnyBlockOrIndent_(tree.elseClause);
      }
    }
  }

  /**
   * Called for the block of if, for etc.
   */
  visitAnyBlockOrIndent_(tree) {
    if (tree.type === BLOCK) {
      this.writeSpace_();
      this.visitAny(tree);
    } else {
      this.visitAnyIndented_(tree);
    }
  }

  visitAnyIndented_(tree, indent = 1) {
      if (this.prettyPrint_) {
        this.indentDepth_ += indent;
        this.writeln_();
      }
      this.visitAny(tree);
      if (this.prettyPrint_) {
        this.indentDepth_ -= indent;
        this.writeln_();
      }
  }

  /**
   * @param {ImportDeclaration} tree
   */
  visitImportDeclaration(tree) {
    this.write_(IMPORT);
    this.writeSpace_();
    if (tree.importClause) {
      this.visitAny(tree.importClause);
      this.writeSpace_();
      this.write_(FROM);
      this.writeSpace_();
    }
    this.visitAny(tree.moduleSpecifier);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {ImportSpecifier} tree
   */
  visitImportSpecifier(tree) {
    this.write_(tree.lhs);
    if (tree.rhs !== null) {
      this.writeSpace_();
      this.write_(AS);
      this.writeSpace_();
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
    this.writeSpace_();
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
    // If we have `1 .memberName` we need to ensure we add a space or the
    // generated code will not be valid.
    if (tree.operand.type === LITERAL_EXPRESSION &&
        tree.operand.literalToken.type === NUMBER) {
      if (!/\.|e|E/.test(tree.operand.literalToken.value))
        this.writeRequiredSpace_();
    }
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
    this.writeSpace_();
    this.write_(tree.identifier);
    this.writeSpace_();
    this.write_(FROM);
    this.writeSpace_();
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {NewExpression} tree
   */
  visitNewExpression(tree) {
    this.write_(NEW);
    this.writeSpace_();
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
      this.writeSpace_();
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
    if (tree.operand.type === POSTFIX_EXPRESSION &&
        tree.operand.operator.type === tree.operator.type) {
      this.writeRequiredSpace_();
    }
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
    this.writeAnnotations_(tree.annotations);
    if (tree.isStatic) {
      this.write_(STATIC);
      this.writeSpace_();
    }

    if (tree.isGenerator())
      this.write_(STAR);

    if (tree.isAsyncFunction())
      this.write_(ASYNC);

    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.writeTypeAnnotation_(tree.typeAnnotation);
    this.visitAny(tree.functionBody);
  }

  /**
   * @param {PropertyNameAssignment} tree
   */
  visitPropertyNameAssignment(tree) {
    this.visitAny(tree.name);
    this.write_(COLON);
    this.writeSpace_();
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
    if (tree.operand) {
      this.visitAny(tree.operand);
      this.writeSpace_();
    }
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
    this.writeSpace_(tree.expression);
    this.visitAny(tree.expression);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {RestParameter} tree
   */
  visitRestParameter(tree) {
    this.write_(DOT_DOT_DOT);
    this.write_(tree.identifier.identifierToken);
    this.writeTypeAnnotation_(this.currentParameterTypeAnnotation_);
  }

  /**
   * @param {SetAccessor} tree
   */
  visitSetAccessor(tree) {
    this.writeAnnotations_(tree.annotations);
    if (tree.isStatic){
      this.write_(STATIC);
      this.writeSpace_();
    }
    this.write_(SET);
    this.writeSpace_();
    this.visitAny(tree.name);
    this.write_(OPEN_PAREN);
    this.visitAny(tree.parameterList);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
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
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
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
    this.writeSpace_();
    this.visitAny(tree.value);
    this.write_(SEMI_COLON);
  }

  /**
   * @param {TryStatement} tree
   */
  visitTryStatement(tree) {
    this.write_(TRY);
    this.writeSpace_();
    this.visitAny(tree.body);
    if (tree.catchBlock) {
      this.writeSpace_();
      this.visitAny(tree.catchBlock);
    }
    if (tree.finallyBlock) {
      this.writeSpace_();
      this.visitAny(tree.finallyBlock);
    }
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
    var op = tree.operator;
    this.write_(op);
    var operand = tree.operand;
    if (operand.type === UNARY_EXPRESSION &&
        requiresSpaceBetween(op.type, operand.operator.type)) {
      this.writeRequiredSpace_();
    }
    this.visitAny(operand);
  }

  /**
   * @param {VariableDeclarationList} tree
   */
  visitVariableDeclarationList(tree) {
    this.write_(tree.declarationType);
    this.writeSpace_();
    this.writeList_(tree.declarations, COMMA, true, 2);
  }

  /**
   * @param {VariableDeclaration} tree
   */
  visitVariableDeclaration(tree) {
    this.visitAny(tree.lvalue);
    this.writeTypeAnnotation_(tree.typeAnnotation);
    if (tree.initialiser !== null) {
      this.writeSpace_();
      this.write_(EQUAL);
      this.writeSpace_();
      this.visitAny(tree.initialiser);
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
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.condition);
    this.write_(CLOSE_PAREN);
    this.visitAnyBlockOrIndent_(tree.body);
  }

  /**
   * @param {WithStatement} tree
   */
  visitWithStatement(tree) {
    this.write_(WITH);
    this.writeSpace_();
    this.write_(OPEN_PAREN);
    this.visitAny(tree.expression);
    this.write_(CLOSE_PAREN);
    this.writeSpace_();
    this.visitAny(tree.body);
  }

  /**
   * @param {YieldExpression} tree
   */
  visitYieldExpression(tree) {
    this.write_(YIELD);
    if (tree.isYieldFor)
      this.write_(STAR);

    if (tree.expression) {
      this.writeSpace_();
      this.visitAny(tree.expression);
    }
  }

  writeCurrentln_() {
    this.result_ += this.currentLine_ + NEW_LINE;
  }

  writeln_() {
    if (this.currentLineComment_) {
      while (this.currentLine_.length < LINE_LENGTH) {
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
          if (!writeNewLine)
            this.writeSpace_();
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
    this.currentLine_ += value;
  }

  /**
   * @param {string|Token|TokenType} value
   * @private
   */
  write_(value) {
    if (value === CLOSE_CURLY)
      this.indentDepth_--;

    if (value !== null) {
      if (this.prettyPrint_) {
        if (!this.currentLine_) {
          for (var i = 0, indent = this.indentDepth_; i < indent; i++) {
            this.currentLine_ += '  ';
          }
        }
      }
      if (this.needsSpace_(value))
        this.currentLine_ += ' ';
      this.currentLine_ += value;
    }

    if (value === OPEN_CURLY)
      this.indentDepth_++;
  }

  writeSpace_(useSpace = this.prettyPrint_) {
    if (useSpace && !endsWithSpace(this.currentLine_))
      this.currentLine_ += ' ';
  }

  writeRequiredSpace_() {
    this.writeSpace_(true);
  }

  writeTypeAnnotation_(typeAnnotation) {
    if (typeAnnotation !== null) {
      this.write_(COLON);
      this.writeSpace_();
      this.visitAny(typeAnnotation);
    }
  }

  /**
   * @param {Array.<ParseTree>} annotations
   * @param {boolean} writeNewLine
   * @private
   */
  writeAnnotations_(annotations, writeNewLine = this.prettyPrint_) {
    if (annotations.length > 0) {
      this.writeList_(annotations, null, writeNewLine);
      if (writeNewLine)
        this.writeln_();
    }
  }

  /**
   * @param {string|Token|TokenType} value
   */
  needsSpace_(token) {
    var line = this.currentLine_;
    if (!line)
      return false;

    var lastCode = line.charCodeAt(line.length - 1);
    if (isWhitespace(lastCode))
      return false;

    var firstCode = token.toString().charCodeAt(0);

    return isIdentifierPart(firstCode) &&
        // /m is treated as regexp flag
        (isIdentifierPart(lastCode) || lastCode === 47);
  }
}

function requiresSpaceBetween(first, second) {
  return (first === MINUS || first === MINUS_MINUS) &&
      (second === MINUS || second === MINUS_MINUS) ||
      (first === PLUS || first === PLUS_PLUS) &&
      (second === PLUS || second === PLUS_PLUS);
}

function endsWithSpace(s) {
  return isWhitespace(s.charCodeAt(s.length - 1));
}
