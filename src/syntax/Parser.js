// Copyright 2012 Traceur Authors.
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

import {
  AssignmentPatternTransformer,
  AssignmentPatternTransformerError
} from '../codegeneration/AssignmentPatternTransformer';
import {
  CoverFormalsTransformer,
  CoverFormalsTransformerError
} from '../codegeneration/CoverFormalsTransformer';
import {IdentifierToken} from './IdentifierToken';
import {
  ARRAY_LITERAL_EXPRESSION,
  BINARY_OPERATOR,
  CALL_EXPRESSION,
  CASCADE_EXPRESSION,
  COMMA_EXPRESSION,
  COMPUTED_PROPERTY_NAME,
  FORMAL_PARAMETER_LIST,
  IDENTIFIER_EXPRESSION,
  LITERAL_PROPERTY_NAME,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  OBJECT_LITERAL_EXPRESSION,
  PAREN_EXPRESSION,
  PROPERTY_NAME_ASSIGNMENT,
  REST_PARAMETER,
  SYNTAX_ERROR_TREE
} from './trees/ParseTreeType';
import {
  ANY,
  AS,
  BOOL,
  FROM,
  GET,
  MODULE,
  NUMBER,
  OF,
  SET,
  STRING
} from './PredefinedName';
import {Scanner} from './Scanner';
import {SourceRange} from '../util/SourceRange';
import {StrictParams} from '../staticsemantics/StrictParams';
import {
  Token,
  isAssignmentOperator
} from './Token';
import {
  parseOptions,
  options
} from '../options';

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
} from './TokenType';

import {
  ArgumentList,
  ArrayComprehension,
  ArrayLiteralExpression,
  ArrayPattern,
  ArrowFunctionExpression,
  AwaitStatement,
  BinaryOperator,
  BindingElement,
  BindingIdentifier,
  Block,
  BreakStatement,
  CallExpression,
  CascadeExpression,
  CaseClause,
  Catch,
  ClassDeclaration,
  ClassExpression,
  CommaExpression,
  ComprehensionFor,
  ComprehensionIf,
  ComputedPropertyName,
  ConditionalExpression,
  ContinueStatement,
  CoverFormals,
  CoverInitialisedName,
  DebuggerStatement,
  DefaultClause,
  DoWhileStatement,
  EmptyStatement,
  ExportDeclaration,
  ExportDefault,
  ExportSpecifier,
  ExportSpecifierSet,
  ExportStar,
  ExpressionStatement,
  Finally,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FormalParameterList,
  FunctionBody,
  FunctionDeclaration,
  FunctionExpression,
  GeneratorComprehension,
  GetAccessor,
  IdentifierExpression,
  IfStatement,
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  ImportedBinding,
  LabelledStatement,
  LiteralExpression,
  LiteralPropertyName,
  MemberExpression,
  MemberLookupExpression,
  Module,
  ModuleDeclaration,
  ModuleSpecifier,
  NamedExport,
  NewExpression,
  ObjectLiteralExpression,
  ObjectPattern,
  ObjectPatternField,
  ParenExpression,
  PostfixExpression,
  PredefinedType,
  Script,
  PropertyMethodAssignment,
  PropertyNameAssignment,
  PropertyNameShorthand,
  RestParameter,
  ReturnStatement,
  SetAccessor,
  SpreadExpression,
  SpreadPatternElement,
  SuperExpression,
  SwitchStatement,
  SyntaxErrorTree,
  TemplateLiteralExpression,
  TemplateLiteralPortion,
  TemplateSubstitution,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  TypeName,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  WhileStatement,
  WithStatement,
  YieldExpression
}  from './trees/ParseTrees';

/**
 * Differentiates between parsing for 'In' vs. 'NoIn'
 * Variants of expression grammars.
 */
var Expression = {
  NO_IN: 'NO_IN',
  NORMAL: 'NORMAL'
};

/**
 * Enum for determining if the initializer is needed in a variable declaration
 * with a destructuring pattern.
 * @enum {string}
 */
var DestructuringInitializer = {
  REQUIRED: 'REQUIRED',
  OPTIONAL: 'OPTIONAL'
};

/**
 * Enum used to determine if an initializer is allowed or not.
 * @enum {string}
 */
var Initializer = {
  ALLOWED: 'ALLOWED',
  REQUIRED: 'REQUIRED'
};

/**
 * Parses a javascript file.
 *
 * The various this.parseX_() methods never return null - even when parse errors
 * are encountered.Typically this.parseX_() will return a XTree ParseTree. Each
 * ParseTree that is created includes its source location. The typical pattern
 * for a this.parseX_() method is:
 *
 * XTree this.parseX_() {
 *   var start = this.getTreeStartLocation_();
 *   parse X grammar element and its children
 *   return new XTree(this.getTreeLocation_(start), children);
 * }
 *
 * this.parseX_() methods must consume at least 1 token - even in error cases.
 * This prevents infinite loops in the parser.
 *
 * Many this.parseX_() methods are matched by a 'boolean this.peekX_()' method
 * which will return true if the beginning of an X appears at the current
 * location. There are also this.peek_() methods which examine the next token.
 * this.peek_() methods must not consume any tokens.
 *
 * The this.eat_() method consumes a token and reports an error if the consumed
 * token is not of the expected type. The this.eatOpt_() methods consume the
 * next token iff the next token is of the expected type and return the consumed
 * token or null if no token was consumed.
 *
 * When parse errors are encountered, an error should be reported and the parse
 * should return a best guess at the current parse tree.
 *
 * When parsing lists, the preferred pattern is:
 *   this.eat_(LIST_START);
 *   var elements = [];
 *   while (this.peekListElement_()) {
 *     elements.push(this.parseListElement_());
 *   }
 *   this.eat_(LIST_END);
 */
export class Parser {
  /**
   * @param {ErrorReporter} errorReporter
   * @param {SourceFile} file
   */
  constructor(errorReporter, file) {
    this.errorReporter_ = errorReporter;
    this.scanner_ = new Scanner(errorReporter, file, this);

    /**
     * Keeps track of whether we currently allow yield expressions.
     * @type {boolean}
     * @private
     */
    this.allowYield_ = options.unstarredGenerators;

    /**
     * Keeps track of whether we are currently in strict mode parsing or not.
     * @type {boolean}
     */
    this.strictMode_ = false;

    this.noLint = false;
    this.noLintChanged_ = false;
    this.strictSemicolons_ = options.strictSemicolons;

    this.coverInitialisedName_ = null;
    this.assignmentExpressionDepth_ = 0;
  }

  // 14 Script
  /**
   * @return {Script}
   */
  parseScript() {
    this.strictMode_ = false;
    var start = this.getTreeStartLocation_();
    var scriptItemList = this.parseScriptItemList_();
    this.eat_(END_OF_FILE);
    return new Script(this.getTreeLocation_(start), scriptItemList);
  }

  // ScriptItemList :
  //   ScriptItem
  //   ScriptItemList ScriptItem

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseScriptItemList_() {
    var result = [];
    var type;

    // We do a lot of type assignment in loops like these for performance
    // reasons.
    var checkUseStrictDirective = true;
    while ((type = this.peekType_()) !== END_OF_FILE) {
      var scriptItem = this.parseScriptItem_(type, false);

      // TODO(arv): We get here when we load external modules, which are always
      // strict but we currently do not have a way to determine if we are in
      // that case.
      if (checkUseStrictDirective) {
        if (!scriptItem.isDirectivePrologue()) {
          checkUseStrictDirective = false;
        } else if (scriptItem.isUseStrictDirective()) {
          this.strictMode_ = true;
          checkUseStrictDirective = false;
        }
      }

      result.push(scriptItem);
    }
    return result;
  }

  // ScriptItem :
  //   ModuleDeclaration
  //   ImportDeclaration
  //   StatementListItem

  /**
   * @return {ParseTree}
   * @private
   */
  parseScriptItem_(type, allowModuleItem) {
    return this.parseStatement_(type, allowModuleItem, true);
  }

  parseModule() {
    var start = this.getTreeStartLocation_();
    var scriptItemList = this.parseModuleItemList_();
    this.eat_(END_OF_FILE);
    // TODO(arv): Use Module instead.
    return new Module(this.getTreeLocation_(start), scriptItemList);
  }

  parseModuleItemList_() {
    this.strictMode_ = true;
    var result = [];
    var type;

    // TODO(arv): Remove CLOSE_CURLY when we no longer supports inline modules.
    while ((type = this.peekType_()) !== END_OF_FILE && type !== CLOSE_CURLY) {
      var scriptItem = this.parseScriptItem_(type, true);
      result.push(scriptItem);
    }
    return result;
  }

  parseModuleSpecifier_() {
    // ModuleSpecifier :
    //   StringLiteral
    var start = this.getTreeStartLocation_();
    var token = this.eat_(STRING);
    return new ModuleSpecifier(this.getTreeLocation_(start), token);
  }

  // ClassDeclaration
  // ImportDeclaration
  // ExportDeclaration
  // ModuleDeclaration
  // TODO: ModuleBlock
  // Statement (other than BlockStatement)
  // FunctionDeclaration

  // ImportDeclaration(load) ::= "import" ImportDeclaration(load) ";"
  /**
   * @return {ParseTree}
   * @private
   */
  parseImportDeclaration_() {
    var start = this.getTreeStartLocation_();
    this.eat_(IMPORT);
    var importClause = this.parseImportClause_();
    this.eatId_(FROM);
    var moduleSpecifier = this.parseModuleSpecifier_();
    this.eatPossibleImplicitSemiColon_();
    return new ImportDeclaration(this.getTreeLocation_(start),
        importClause, moduleSpecifier);
  }

  // https://bugs.ecmascript.org/show_bug.cgi?id=2287
  // ImportClause :
  //   ImportedBinding
  //   NamedImports

  parseImportClause_() {
    var start = this.getTreeStartLocation_();
    if (this.eatIf_(OPEN_CURLY)) {
      var specifiers = [this.parseImportSpecifier_()];
      while (this.eatIf_(COMMA)) {
        if (this.peek_(CLOSE_CURLY))
          break;
        specifiers.push(this.parseImportSpecifier_());
      }
      this.eat_(CLOSE_CURLY);

      return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers);
    }

    var binding = this.parseBindingIdentifier_();
    return new ImportedBinding(this.getTreeLocation_(start), binding);
  }

  // ImportSpecifier ::= IdentifierName ("as" Identifier)?
  //                     Identifier "as" Identifier
  /**
   * @return {ParseTree}
   * @private
   */
  parseImportSpecifier_() {
    var start = this.getTreeStartLocation_();

    var token = this.peekToken_();
    var isKeyword = token.isKeyword();
    var lhs = this.eatIdName_();
    var rhs = null;
    if (isKeyword || this.peekPredefinedString_(AS)) {
      this.eatId_(AS);
      rhs = this.eatId_();
    }

    return new ImportSpecifier(this.getTreeLocation_(start), lhs, rhs);
  }

  // export  VariableStatement
  // export  FunctionDeclaration
  // export  ConstStatement
  // export  ClassDeclaration
  // export  ModuleDeclaration

  /**
   * @return {ParseTree}
   * @private
   */
  parseExportDeclaration_() {
    var start = this.getTreeStartLocation_();
    this.eat_(EXPORT);
    var exportTree;
    var type = this.peekType_();
    switch (type) {
      case CONST:
      case LET:
      case VAR:
        exportTree = this.parseVariableStatement_();
        break;
      case FUNCTION:
        exportTree = this.parseFunctionDeclaration_();
        break;
      case CLASS:
        exportTree = this.parseClassDeclaration_();
        break;
      case DEFAULT:
        exportTree = this.parseExportDefault_();
        break;
      case OPEN_CURLY:
      case STAR:
        exportTree = this.parseNamedExport_();
        break;
      default:
        return this.parseUnexpectedToken_(type);
    }
    return new ExportDeclaration(this.getTreeLocation_(start), exportTree);
  }

  parseExportDefault_() {
    // export default AssignmentExpression ;
    var start = this.getTreeStartLocation_();
    this.eat_(DEFAULT);
    var expression = this.parseAssignmentExpression();
    this.eatPossibleImplicitSemiColon_();
    return new ExportDefault(this.getTreeLocation_(start), expression);
  }

  parseNamedExport_() {
    // NamedExport ::=
    //     "*" "from" ModuleSpecifier(load)
    //     ExportSpecifierSet ("from" ModuleSpecifier(load))?
    var start = this.getTreeStartLocation_();

    var specifierSet, expression;

    if (this.peek_(OPEN_CURLY)) {
      specifierSet = this.parseExportSpecifierSet_();
      expression = this.parseFromModuleSpecifierOpt_(false);
    } else {
      this.eat_(STAR);
      specifierSet = new ExportStar(this.getTreeLocation_(start));
      expression = this.parseFromModuleSpecifierOpt_(true);
    }

    this.eatPossibleImplicitSemiColon_();

    return new NamedExport(this.getTreeLocation_(start), expression,
                             specifierSet);
  }

  parseFromModuleSpecifierOpt_(required) {
    if (required || this.peekPredefinedString_(FROM)) {
      this.eatId_(FROM);
      return this.parseModuleSpecifier_();
    }
    return null;
  }

  parseExportSpecifierSet_() {
    // ExportSpecifierSet ::=
    //     "{" ExportSpecifier ("," ExportSpecifier)* ","? "}"

    var start = this.getTreeStartLocation_();
    this.eat_(OPEN_CURLY);
    var specifiers = [this.parseExportSpecifier_()];
    while (this.eatIf_(COMMA)) {
      if (this.peek_(CLOSE_CURLY))
        break;
      specifiers.push(this.parseExportSpecifier_());
    }
    this.eat_(CLOSE_CURLY);

    return new ExportSpecifierSet(this.getTreeLocation_(start), specifiers);
  }

  // ExportSpecifier :
  //   Identifier
  //   Identifier "as" IdentifierName
  parseExportSpecifier_() {
    // ExportSpecifier ::= Identifier
    //     | IdentifierName ":" Identifier

    var start = this.getTreeStartLocation_();
    var lhs = this.eatId_();
    var rhs = null;
    if (this.peekPredefinedString_(AS)) {
      this.eatId_(AS);
      rhs = this.eatIdName_();
    }
    return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
  }

  peekId_(type) {
    if (type === IDENTIFIER)
      return true;
    if (this.strictMode_)
      return false;
    return this.peekToken_().isStrictKeyword();
  }

  peekIdName_(token) {
    return token.type === IDENTIFIER || token.isKeyword();
  }

  parseClassShared_(constr) {
    var start = this.getTreeStartLocation_();
    var strictMode = this.strictMode_;
    this.strictMode_ = true;
    this.eat_(CLASS);
    var name = null;
    // Name is optional for ClassExpression
    if (constr == ClassDeclaration ||
        !this.peek_(EXTENDS) && !this.peek_(OPEN_CURLY)) {
      name = this.parseBindingIdentifier_();
    }
    var superClass = null;
    if (this.eatIf_(EXTENDS)) {
      superClass = this.parseAssignmentExpression();
    }
    this.eat_(OPEN_CURLY);
    var elements = this.parseClassElements_();
    this.eat_(CLOSE_CURLY);
    this.strictMode_ = strictMode;
    return new constr(this.getTreeLocation_(start), name, superClass,
                      elements);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseClassDeclaration_() {
    return this.parseClassShared_(ClassDeclaration);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseClassExpression_() {
    return this.parseClassShared_(ClassExpression);
  }

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseClassElements_() {
    var result = [];

    while (true) {
      var type = this.peekType_();
      if (type === SEMI_COLON) {
        this.nextToken_();
      } else if (this.peekClassElement_(this.peekType_())) {
        result.push(this.parseClassElement_());
      } else {
        break;
      }
    }

    return result;
  }

  peekClassElement_(type) {
    // PropertyName covers get, set and static too.
    return this.peekPropertyName_(type) ||
        type === STAR && parseOptions.generators;
  }

  // PropertyName :
  //   LiteralPropertyName
  //   ComputedPropertyName
  parsePropertyName_() {
    if (this.peek_(OPEN_SQUARE))
      return this.parseComputedPropertyName_()
    return this.parseLiteralPropertyName_();
  }

  parseLiteralPropertyName_() {
    var start = this.getTreeStartLocation_();
    var token = this.nextToken_();
    return new LiteralPropertyName(this.getTreeLocation_(start), token);
  }

  // ComputedPropertyName :
  //   [ AssignmentExpression ]
  parseComputedPropertyName_() {
    var start = this.getTreeStartLocation_();
    this.eat_(OPEN_SQUARE);
    var expression = this.parseAssignmentExpression();
    this.eat_(CLOSE_SQUARE);

    return new ComputedPropertyName(this.getTreeLocation_(start), expression);
  }

  parseStatement() {
    return this.parseStatement_(this.peekType_(), false, false);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseStatement_(type, allowModuleItem, allowScriptItem) {
    switch (type) {
      // Most common first (based on building Traceur).
      case RETURN:
        return this.parseReturnStatement_();
      case CONST:
      case LET:
        if (!parseOptions.blockBinding)
          break;
        // Fall through.
      case VAR:
        return this.parseVariableStatement_();
      case IF:
        return this.parseIfStatement_();
      case FOR:
        return this.parseForStatement_();
      case BREAK:
        return this.parseBreakStatement_();
      case SWITCH:
        return this.parseSwitchStatement_();
      case THROW:
        return this.parseThrowStatement_();
      case WHILE:
        return this.parseWhileStatement_();
      case FUNCTION:
        return this.parseFunctionDeclaration_();

      // Rest are just alphabetical order.
      case AWAIT:
        if (parseOptions.deferredFunctions)
          return this.parseAwaitStatement_();
        break;
      case CLASS:
        if (parseOptions.classes)
          return this.parseClassDeclaration_();
        break;
      case CONTINUE:
        return this.parseContinueStatement_();
      case DEBUGGER:
        return this.parseDebuggerStatement_();
      case DO:
        return this.parseDoWhileStatement_();
      case EXPORT:
        if (allowModuleItem && parseOptions.modules)
          return this.parseExportDeclaration_();
        break;
      case IMPORT:
        if (allowScriptItem && parseOptions.modules)
          return this.parseImportDeclaration_();
        break;
      case OPEN_CURLY:
        return this.parseBlock_();
      case SEMI_COLON:
        return this.parseEmptyStatement_();
      case TRY:
        return this.parseTryStatement_();
      case WITH:
        return this.parseWithStatement_();
    }
    return this.parseFallThroughStatement_(allowScriptItem);
  }

  // 13 Function Definition
  /**
   * @return {ParseTree}
   * @private
   */
  parseFunctionDeclaration_() {
    var start = this.getTreeStartLocation_();
    this.nextToken_(); // function or #
    var isGenerator = parseOptions.generators && this.eatIf_(STAR);
    return this.parseFunctionDeclarationTail_(start, isGenerator,
                                              this.parseBindingIdentifier_());
  }

  /**
   * @param {SourcePosition} start
   * @param {IdentifierToken} name
   * @return {ParseTree}
   * @private
   */
  parseFunctionDeclarationTail_(start, isGenerator, name) {
    this.eat_(OPEN_PAREN);
    var formalParameterList = this.parseFormalParameterList_();
    this.eat_(CLOSE_PAREN);
    var functionBody = this.parseFunctionBody_(isGenerator,
                                               formalParameterList);
    return new FunctionDeclaration(this.getTreeLocation_(start), name,
                                   isGenerator, formalParameterList,
                                   functionBody);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseFunctionExpression_() {
    var start = this.getTreeStartLocation_();
    this.nextToken_(); // function or #
    var isGenerator = parseOptions.generators && this.eatIf_(STAR);
    var name = null;
    if (this.peekBindingIdentifier_(this.peekType_())) {
      name = this.parseBindingIdentifier_();
    }
    this.eat_(OPEN_PAREN);
    var formalParameterList = this.parseFormalParameterList_();
    this.eat_(CLOSE_PAREN);
    var functionBody = this.parseFunctionBody_(isGenerator,
                                               formalParameterList);
    return new FunctionExpression(this.getTreeLocation_(start), name,
                                  isGenerator, formalParameterList,
                                  functionBody);
  }

  /**
   * @return {FormalParameterList}
   * @private
   */
  parseFormalParameterList_() {
    // FormalParameterList :
    //   [empty]
    //   FunctionRestParameter
    //   FormalsList
    //   FormalsList , FunctionRestParameter
    //
    // FunctionRestParameter :
    //   ... BindingIdentifier
    //
    // FormalsList :
    //   FormalParameter
    //   FormalsList , FormalParameter
    //
    // FormalParameter :
    //   BindingElement
    //
    // BindingElement :
    //   SingleNameBinding
    //   BindingPattern Initialiseropt
    var start = this.getTreeStartLocation_();
    var formals = [];
    var type = this.peekType_();
    if (this.peekRest_(type)) {
      formals.push(this.parseRestParameter_());
    } else {
      if (this.peekFormalParameter_(this.peekType_()))
        formals.push(this.parseFormalParameter_());

      while (this.eatIf_(COMMA)) {
        if (this.peekRest_(this.peekType_())) {
          formals.push(this.parseRestParameter_());
          break;
        }
        formals.push(this.parseFormalParameter_());
      }
    }

    return new FormalParameterList(this.getTreeLocation_(start), formals);
  }

  peekFormalParameter_(type) {
    return this.peekBindingElement_(type);
  }

  parseFormalParameter_(initializerAllowed = undefined) {
    return this.parseBindingElement_(initializerAllowed);
  }

  parseRestParameter_() {
    var start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    var id = this.parseBindingIdentifier_();
    return new RestParameter(this.getTreeLocation_(start), id);
  }

  /**
   * @return {Block}
   * @private
   */
  parseFunctionBody_(isGenerator, params) {
    var start = this.getTreeStartLocation_();
    this.eat_(OPEN_CURLY);

    var allowYield = this.allowYield_;
    var strictMode = this.strictMode_;
    this.allowYield_ = isGenerator || options.unstarredGenerators;

    var result = this.parseStatementList_(!strictMode);

    if (!strictMode && this.strictMode_ && params)
      StrictParams.visit(params, this.errorReporter_);

    this.strictMode_ = strictMode;
    this.allowYield_ = allowYield;

    this.eat_(CLOSE_CURLY);
    return new FunctionBody(this.getTreeLocation_(start), result);
  }

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseStatementList_(checkUseStrictDirective) {
    var result = [];
    var type;
    while ((type = this.peekType_()) !== CLOSE_CURLY && type !== END_OF_FILE) {
      var statement = this.parseStatement_(type, false, false);
      if (checkUseStrictDirective) {
        if (!statement.isDirectivePrologue()) {
          checkUseStrictDirective = false;
        } else if (statement.isUseStrictDirective()) {
          this.strictMode_ = true;
          checkUseStrictDirective = false;
        }
      }
      result.push(statement);
    }
    return result;
  }

  /**
   * @return {SpreadExpression}
   * @private
   */
  parseSpreadExpression_() {
    if (!parseOptions.spread)
      return this.parseUnexpectedToken_(DOT_DOT_DOT);

    var start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    var operand = this.parseAssignmentExpression();
    return new SpreadExpression(this.getTreeLocation_(start), operand);
  }

  // 12.1 Block
  /**
   * @return {Block}
   * @private
   */
  parseBlock_() {
    var start = this.getTreeStartLocation_();
    this.eat_(OPEN_CURLY);
    var result = this.parseStatementList_(false);
    this.eat_(CLOSE_CURLY);
    return new Block(this.getTreeLocation_(start), result);
  }

  // 12.2 Variable Statement
  /**
   * @return {VariableStatement}
   * @private
   */
  parseVariableStatement_() {
    var start = this.getTreeStartLocation_();
    var declarations = this.parseVariableDeclarationList_();
    this.checkInitializers_(declarations);
    this.eatPossibleImplicitSemiColon_();
    return new VariableStatement(this.getTreeLocation_(start), declarations);
  }

  /**
   * @param {Expression=} expressionIn
   * @param {DestructuringInitializer} initializer Whether destructuring
   *     requires an initializer
   * @return {VariableDeclarationList}
   * @private
   */
  parseVariableDeclarationList_(
      expressionIn = Expression.NORMAL,
      initializer = DestructuringInitializer.REQUIRED) {
    var type = this.peekType_();

    switch (type) {
      case CONST:
      case LET:
        if (!parseOptions.blockBinding)
          debugger;
      case VAR:
        this.nextToken_();
        break;
      default:
        throw Error('unreachable');
    }

    var start = this.getTreeStartLocation_();
    var declarations = [];

    declarations.push(this.parseVariableDeclaration_(type, expressionIn,
                                                     initializer));
    while (this.eatIf_(COMMA)) {
      declarations.push(this.parseVariableDeclaration_(type, expressionIn,
                                                       initializer));
    }
    return new VariableDeclarationList(
        this.getTreeLocation_(start), type, declarations);
  }

  /**
   * VariableDeclaration :
   *   BindingIdentifier Initialiseropt
   *   BindingPattern Initialiser
   *
   * VariableDeclarationNoIn :
   *   BindingIdentifier InitialiserNoInopt
   *   BindingPattern InitialiserNoIn
   *
   * @param {TokenType} binding
   * @param {Expression} expressionIn
   * @param {DestructuringInitializer=} initializer
   * @return {VariableDeclaration}
   * @private
   */
  parseVariableDeclaration_(binding, expressionIn,
                            initializer = DestructuringInitializer.REQUIRED) {
    var initRequired = initializer !== DestructuringInitializer.OPTIONAL;
    var start = this.getTreeStartLocation_();

    var lvalue;
    var typeAnnotation;
    if (this.peekPattern_(this.peekType_())) {
      lvalue = this.parseBindingPattern_();
      typeAnnotation = null;
    } else {
      lvalue = this.parseBindingIdentifier_();
      typeAnnotation = this.parseTypeAnnotationOpt_();
    }

    var initializer = null;
    if (this.peek_(EQUAL))
      initializer = this.parseInitializer_(expressionIn);
    else if (lvalue.isPattern() && initRequired)
      this.reportError_('destructuring must have an initializer');

    return new VariableDeclaration(this.getTreeLocation_(start), lvalue,
        typeAnnotation, initializer);
  }

  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseInitializer_(expressionIn) {
    this.eat_(EQUAL);
    return this.parseAssignmentExpression(expressionIn);
  }

  // 12.3 Empty Statement
  /**
   * @return {EmptyStatement}
   * @private
   */
  parseEmptyStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(SEMI_COLON);
    return new EmptyStatement(this.getTreeLocation_(start));
  }

  // Expression Statement and Module declaration.
  /**
   * @return {ExpressionStatement|ModuleDeclaration}
   * @private
   */
  parseFallThroughStatement_(allowScriptItem) {
    var start = this.getTreeStartLocation_();
    var expression = this.parseExpression();

    if (expression.type === IDENTIFIER_EXPRESSION) {
      var nameToken = expression.identifierToken;

      // 12.12 Labelled Statement
      if (this.eatIf_(COLON)) {
        var statement = this.parseStatement();
        return new LabelledStatement(this.getTreeLocation_(start), nameToken,
                                     statement);
      }

      // ModuleDeclaration :
      //     module [no LineTerminator here] ImportedBinding FromClause ;
      //
      if (allowScriptItem && nameToken.value === MODULE &&
          parseOptions.modules) {
        var token = this.peekTokenNoLineTerminator_();
        if (token !== null && token.type === IDENTIFIER) {
          var name = this.eatId_();
          this.eatId_(FROM);
          var moduleSpecifier = this.parseModuleSpecifier_();
          this.eatPossibleImplicitSemiColon_();
          return new ModuleDeclaration(this.getTreeLocation_(start), name,
                                       moduleSpecifier);
        }

        // Fall through.
      }
    }

    this.eatPossibleImplicitSemiColon_();
    return new ExpressionStatement(this.getTreeLocation_(start), expression);
  }

  // 12.5 If Statement
  /**
   * @return {IfStatement}
   * @private
   */
  parseIfStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(IF);
    this.eat_(OPEN_PAREN);
    var condition = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    var ifClause = this.parseStatement();
    var elseClause = null;
    if (this.eatIf_(ELSE)) {
      elseClause = this.parseStatement();
    }
    return new IfStatement(this.getTreeLocation_(start), condition, ifClause, elseClause);
  }

  // 12.6 Iteration Statements

  // 12.6.1 The do-while Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseDoWhileStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(DO);
    var body = this.parseStatement();
    this.eat_(WHILE);
    this.eat_(OPEN_PAREN);
    var condition = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    this.eatPossibleImplicitSemiColon_();
    return new DoWhileStatement(this.getTreeLocation_(start), body, condition);
  }

  // 12.6.2 The while Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseWhileStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(WHILE);
    this.eat_(OPEN_PAREN);
    var condition = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    var body = this.parseStatement();
    return new WhileStatement(this.getTreeLocation_(start), condition, body);
  }

  // 12.6.3 The for Statement
  // 12.6.4 The for-in Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseForStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(FOR);
    this.eat_(OPEN_PAREN);

    var validate = (variables, kind) => {
      if (variables.declarations.length > 1) {
        this.reportError_(kind +
            ' statement may not have more than one variable declaration');
      }
      var declaration = variables.declarations[0];
      if (declaration.lvalue.isPattern() && declaration.initializer) {
        this.reportError_(declaration.initializer.location,
            `initializer is not allowed in ${kind} loop with pattern`);
      }
    };

    var type = this.peekType_();
    if (this.peekVariableDeclarationList_(type)) {
      var variables =
         this.parseVariableDeclarationList_(
              Expression.NO_IN, DestructuringInitializer.OPTIONAL);
      type = this.peekType_();
      if (type === IN) {
        // for-in: only one declaration allowed
        validate(variables, 'for-in');

        var declaration = variables.declarations[0];
        // for-in: if let/const binding used, initializer is illegal
        if (parseOptions.blockBinding &&
            (variables.declarationType == LET ||
             variables.declarationType == CONST)) {
          if (declaration.initializer != null) {
            this.reportError_(
                'let/const in for-in statement may not have initializer');
          }
        }

        return this.parseForInStatement_(start, variables);
      } else if (this.peekOf_(type)) {
        // for-of: only one declaration allowed
        validate(variables, 'for-of');

        // for-of: initializer is illegal
        var declaration = variables.declarations[0];
        if (declaration.initializer != null) {
          this.reportError_('for-of statement may not have initializer');
        }

        return this.parseForOfStatement_(start, variables);
      } else {
        // for statement: let and const must have initializers
        this.checkInitializers_(variables);
        return this.parseForStatement2_(start, variables);
      }
    }

    if (type === SEMI_COLON) {
      return this.parseForStatement2_(start, null);
    }

    var initializer = this.parseExpression(Expression.NO_IN);
    type = this.peekType_();
    if (initializer.isLeftHandSideExpression() &&
        (type === IN || this.peekOf_(type))) {
      initializer = this.transformLeftHandSideExpression_(initializer);
      if (this.peekOf_(type))
        return this.parseForOfStatement_(start, initializer);
      return this.parseForInStatement_(start, initializer);
    }

    return this.parseForStatement2_(start, initializer);
  }

  peekOf_(type) {
    return type === IDENTIFIER && parseOptions.forOf &&
        this.peekToken_().value === OF;
  }

  // The for-each Statement
  // for  (  { let | var }  identifier  of  expression  )  statement
  /**
   * @param {SourcePosition} start
   * @param {ParseTree} initializer
   * @return {ParseTree}
   * @private
   */
  parseForOfStatement_(start, initializer) {
    this.eatId_(); // of
    var collection = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    var body = this.parseStatement();
    return new ForOfStatement(this.getTreeLocation_(start), initializer, collection, body);
  }

  /**
   * Checks variable declaration in variable and for statements.
   *
   * @param {VariableDeclarationList} variables
   * @return {void}
   * @private
   */
  checkInitializers_(variables) {
    if (parseOptions.blockBinding &&
        variables.declarationType == CONST) {
      var type = variables.declarationType;
      for (var i = 0; i < variables.declarations.length; i++) {
        if (!this.checkInitializer_(type, variables.declarations[i])) {
          break;
        }
      }
    }
  }

  /**
   * Checks variable declaration
   *
   * @param {TokenType} type
   * @param {VariableDeclaration} declaration
   * @return {boolan} Whether the initializer is correct.
   * @private
   */
  checkInitializer_(type, declaration) {
    if (parseOptions.blockBinding && type == CONST &&
        declaration.initializer == null) {
      this.reportError_('const variables must have an initializer');
      return false;
    }
    return true;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekVariableDeclarationList_(type) {
    switch (type) {
      case VAR:
        return true;
      case CONST:
      case LET:
        return parseOptions.blockBinding;
      default:
        return false;
    }
  }

  // 12.6.3 The for Statement
  /**
   * @param {SourcePosition} start
   * @param {ParseTree} initializer
   * @return {ParseTree}
   * @private
   */
  parseForStatement2_(start, initializer) {
    this.eat_(SEMI_COLON);

    var condition = null;
    if (!this.peek_(SEMI_COLON)) {
      condition = this.parseExpression();
    }
    this.eat_(SEMI_COLON);

    var increment = null;
    if (!this.peek_(CLOSE_PAREN)) {
      increment = this.parseExpression();
    }
    this.eat_(CLOSE_PAREN);
    var body = this.parseStatement();
    return new ForStatement(this.getTreeLocation_(start), initializer, condition, increment, body);
  }

  // 12.6.4 The for-in Statement
  /**
   * @param {SourcePosition} start
   * @param {ParseTree} initializer
   * @return {ParseTree}
   * @private
   */
  parseForInStatement_(start, initializer) {
    this.eat_(IN);
    var collection = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    var body = this.parseStatement();
    return new ForInStatement(this.getTreeLocation_(start), initializer, collection, body);
  }

  // 12.7 The continue Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseContinueStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(CONTINUE);
    var name = null;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      name = this.eatIdOpt_();
    }
    this.eatPossibleImplicitSemiColon_();
    return new ContinueStatement(this.getTreeLocation_(start), name);
  }

  // 12.8 The break Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseBreakStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(BREAK);
    var name = null;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      name = this.eatIdOpt_();
    }
    this.eatPossibleImplicitSemiColon_();
    return new BreakStatement(this.getTreeLocation_(start), name);
  }

  //12.9 The return Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseReturnStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(RETURN);
    var expression = null;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      expression = this.parseExpression();
    }
    this.eatPossibleImplicitSemiColon_();
    return new ReturnStatement(this.getTreeLocation_(start), expression);
  }

  // Harmony: The yield Statement
  //  yield  [expression];
  /**
   * @return {ParseTree}
   * @private
   */
  parseYieldExpression_() {
    if (!this.allowYield_) {
      return this.parseSyntaxError_(
          "'yield' expressions are only allowed inside 'function*'");
    }

    var start = this.getTreeStartLocation_();
    this.eat_(YIELD);
    var expression = null;
    var isYieldFor = this.eatIf_(STAR);
    if (isYieldFor || !this.peekImplicitSemiColon_(this.peekType_())) {
      expression = this.parseAssignmentExpression();
    }
    return new YieldExpression(
        this.getTreeLocation_(start), expression, isYieldFor);
  }

  // Harmony?: The await Statement
  // TODO: await should be an expression, not a statement
  // await[ identifier = ] expression;
  /**
   * @return {ParseTree}
   * @private
   */
  parseAwaitStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(AWAIT);
    var identifier = null;
    if (this.peek_(IDENTIFIER) && this.peek_(EQUAL, 1)) {
      identifier = this.eatId_();
      this.eat_(EQUAL);
    }
    var expression = this.parseExpression();
    this.eatPossibleImplicitSemiColon_();
    return new AwaitStatement(this.getTreeLocation_(start), identifier, expression);
  }

  // 12.10 The with Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseWithStatement_() {
    if (this.strictMode_)
      this.reportError_('Strict mode code may not include a with statement');

    var start = this.getTreeStartLocation_();
    this.eat_(WITH);
    this.eat_(OPEN_PAREN);
    var expression = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    var body = this.parseStatement();
    return new WithStatement(this.getTreeLocation_(start), expression, body);
  }

  // 12.11 The switch Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseSwitchStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(SWITCH);
    this.eat_(OPEN_PAREN);
    var expression = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    this.eat_(OPEN_CURLY);
    var caseClauses = this.parseCaseClauses_();
    this.eat_(CLOSE_CURLY);
    return new SwitchStatement(this.getTreeLocation_(start), expression, caseClauses);
  }

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseCaseClauses_() {
    var foundDefaultClause = false;
    var result = [];

    while (true) {
      var start = this.getTreeStartLocation_();
      switch (this.peekType_()) {
        case CASE:
          this.nextToken_();
          var expression = this.parseExpression();
          this.eat_(COLON);
          var statements = this.parseCaseStatementsOpt_();
          result.push(new CaseClause(this.getTreeLocation_(start), expression, statements));
          break;
        case DEFAULT:
          if (foundDefaultClause) {
            this.reportError_('Switch statements may have at most one default clause');
          } else {
            foundDefaultClause = true;
          }
          this.nextToken_();
          this.eat_(COLON);
          result.push(new DefaultClause(this.getTreeLocation_(start), this.parseCaseStatementsOpt_()));
          break;
        default:
          return result;
      }
    }
  }

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseCaseStatementsOpt_() {
    var result = [];
    var type;
    while (true) {
      switch (type = this.peekType_()) {
        case CASE:
        case DEFAULT:
        case CLOSE_CURLY:
        case END_OF_FILE:
          return result;
      }
      result.push(this.parseStatement_(type, false, false));
    }
  }

  // 12.13 Throw Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseThrowStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(THROW);
    var value = null;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      value = this.parseExpression();
    }
    this.eatPossibleImplicitSemiColon_();
    return new ThrowStatement(this.getTreeLocation_(start), value);
  }

  // 12.14 Try Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseTryStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(TRY);
    var body = this.parseBlock_();
    var catchBlock = null;
    if (this.peek_(CATCH)) {
      catchBlock = this.parseCatch_();
    }
    var finallyBlock = null;
    if (this.peek_(FINALLY)) {
      finallyBlock = this.parseFinallyBlock_();
    }
    if (catchBlock == null && finallyBlock == null) {
      this.reportError_("'catch' or 'finally' expected.");
    }
    return new TryStatement(this.getTreeLocation_(start), body, catchBlock, finallyBlock);
  }

  /**
   * Catch :
   *   catch ( CatchParameter ) Block
   *
   * CatchParameter :
   *   BindingIdentifier
   *   BindingPattern
   *
   * @return {ParseTree}
   * @private
   */
  parseCatch_() {
    var start = this.getTreeStartLocation_();
    var catchBlock;
    this.eat_(CATCH);
    this.eat_(OPEN_PAREN);
    var binding;
    if (this.peekPattern_(this.peekType_()))
      binding = this.parseBindingPattern_();
    else
      binding = this.parseBindingIdentifier_();
    this.eat_(CLOSE_PAREN);
    var catchBody = this.parseBlock_();
    catchBlock = new Catch(this.getTreeLocation_(start), binding,
                           catchBody);
    return catchBlock;
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseFinallyBlock_() {
    var start = this.getTreeStartLocation_();
    this.eat_(FINALLY);
    var finallyBlock = this.parseBlock_();
    return new Finally(this.getTreeLocation_(start), finallyBlock);
  }

  // 12.15 The Debugger Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseDebuggerStatement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(DEBUGGER);
    this.eatPossibleImplicitSemiColon_();

    return new DebuggerStatement(this.getTreeLocation_(start));
  }

  // 11.1 Primary Expressions
  /**
   * @return {ParseTree}
   * @private
   */
  parsePrimaryExpression_() {
    switch (this.peekType_()) {
      case CLASS:
        return parseOptions.classes ?
            this.parseClassExpression_() :
            this.parseSyntaxError_('Unexpected reserved word');
      case SUPER:
        return this.parseSuperExpression_();
      case THIS:
        return this.parseThisExpression_();
      case IDENTIFIER:
        return this.parseIdentifierExpression_();
      case NUMBER:
      case STRING:
      case TRUE:
      case FALSE:
      case NULL:
        return this.parseLiteralExpression_();
      case OPEN_SQUARE:
        return this.parseArrayLiteral_();
      case OPEN_CURLY:
        return this.parseObjectLiteral_();
      case OPEN_PAREN:
        return this.parseParenExpression_();
      case SLASH:
      case SLASH_EQUAL:
        return this.parseRegularExpressionLiteral_();
      case NO_SUBSTITUTION_TEMPLATE:
      case TEMPLATE_HEAD:
        return this.parseTemplateLiteral_(null);

      case IMPLEMENTS:
      case INTERFACE:
      case PACKAGE:
      case PRIVATE:
      case PROTECTED:
      case PUBLIC:
      case STATIC:
      case YIELD:
        if (!this.strictMode_)
          return this.parseIdentifierExpression_();
        this.reportReservedIdentifier_(this.nextToken_());
        // Fall through.

      case END_OF_FILE:
        return this.parseSyntaxError_('Unexpected end of input');

      default:
        return this.parseUnexpectedToken_(this.peekToken_());
    }
  }

  /**
   * @return {SuperExpression}
   * @private
   */
  parseSuperExpression_() {
    var start = this.getTreeStartLocation_();
    this.eat_(SUPER);
    return new SuperExpression(this.getTreeLocation_(start));
  }

  /**
   * @return {ThisExpression}
   * @private
   */
  parseThisExpression_() {
    var start = this.getTreeStartLocation_();
    this.eat_(THIS);
    return new ThisExpression(this.getTreeLocation_(start));
  }

  peekBindingIdentifier_(type) {
    return this.peekId_(type);
  }

  parseBindingIdentifier_() {
    var start = this.getTreeStartLocation_();
    var identifier = this.eatId_();
    return new BindingIdentifier(this.getTreeLocation_(start), identifier);
  }

  /**
   * @return {IdentifierExpression}
   * @private
   */
  parseIdentifierExpression_() {
    var start = this.getTreeStartLocation_();
    var identifier = this.eatId_();
    return new IdentifierExpression(this.getTreeLocation_(start), identifier);
  }

  /**
   * Special case of parseIdentifierExpression_ which allows keywords.
   * @return {IdentifierExpression}
   * @private
   */
  parseIdentifierNameExpression_() {
    var start = this.getTreeStartLocation_();
    var identifier = this.eatIdName_();
    return new IdentifierExpression(this.getTreeLocation_(start), identifier);
  }

  /**
   * @return {LiteralExpression}
   * @private
   */
  parseLiteralExpression_() {
    var start = this.getTreeStartLocation_();
    var literal = this.nextLiteralToken_();
    return new LiteralExpression(this.getTreeLocation_(start), literal);
  }

  /**
   * @return {Token}
   * @private
   */
  nextLiteralToken_() {
    return this.nextToken_();
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseRegularExpressionLiteral_() {
    var start = this.getTreeStartLocation_();
    var literal = this.nextRegularExpressionLiteralToken_();
    return new LiteralExpression(this.getTreeLocation_(start), literal);
  }

  peekSpread_(type) {
    return type === DOT_DOT_DOT && parseOptions.spread;
  }

  // 11.1.4 Array Literal Expression
  /**
   * Parse array literal and delegates to {@code parseArrayComprehension_} as
   * needed.
   *
   * ArrayLiteral :
   *   [ Elisionopt ]
   *   [ ElementList ]
   *   [ ElementList , Elisionopt ]
   *
   * ElementList :
   *   Elisionopt AssignmentExpression
   *   Elisionopt ... AssignmentExpression
   *   ElementList , Elisionopt AssignmentExpression
   *   ElementList , Elisionopt SpreadElement
   *
   * Elision :
   *   ,
   *   Elision ,
   *
   * SpreadElement :
   *   ... AssignmentExpression
   *
   * @return {ParseTree}
   * @private
   */
  parseArrayLiteral_() {

    var start = this.getTreeStartLocation_();
    var expression;
    var elements = [];

    this.eat_(OPEN_SQUARE);

    var type = this.peekType_();
    if (type === FOR && parseOptions.arrayComprehension)
      return this.parseArrayComprehension_(start);

    while (true) {
      type = this.peekType_();
      if (type === COMMA) {
        expression = null;
      } else if (this.peekSpread_(type)) {
        expression = this.parseSpreadExpression_();
      } else if (this.peekAssignmentExpression_(type)) {
        expression = this.parseAssignmentExpression();
      } else {
        break;
      }

      elements.push(expression);

      type = this.peekType_();
      if (type !== CLOSE_SQUARE)
        this.eat_(COMMA);
    }
    this.eat_(CLOSE_SQUARE);
    return new ArrayLiteralExpression(this.getTreeLocation_(start), elements);
  }

  /**
   * Continues parsing array comprehension.
   *
   * ArrayComprehension :
   *   [ Comprehension ]
   *
   * Comprehension :
   *   ForComprehensionClause ComprehensionClause* Expression
   *
   * ComprehensionClause :
   *   ForComprehensionClause
   *   IfComprehensionClause
   *
   * ForComprehensionClause :
   *   for ( ForBinding of Expression )
   *
   * IfComprehensionClause  :
   *   if ( Expression )
   *
   * ForBinding :
   *   BindingIdentifier
   *   BindingPattern
   *
   * @param {Location} start
   * @return {ParseTree}
   */
  parseArrayComprehension_(start) {
    var list = this.parseComprehensionList_();
    var expression = this.parseAssignmentExpression();
    this.eat_(CLOSE_SQUARE);
    return new ArrayComprehension(this.getTreeLocation_(start),
                                  list, expression);
  }

  parseComprehensionList_() {
    // Must start with for (...)
    var list = [this.parseComprehensionFor_()];
    while (true) {
      var type = this.peekType_();
      switch (type) {
        case FOR:
          list.push(this.parseComprehensionFor_());
          break;
        case IF:
          list.push(this.parseComprehensionIf_());
          break;
        default:
          return list;
      }
    }
  }

  parseComprehensionFor_() {
    var start = this.getTreeStartLocation_();
    this.eat_(FOR);
    this.eat_(OPEN_PAREN);
    var left = this.parseForBinding_();
    this.eatId_(OF);
    var iterator = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    return new ComprehensionFor(this.getTreeLocation_(start), left, iterator);
  }

  parseComprehensionIf_() {
    var start = this.getTreeStartLocation_();
    this.eat_(IF);
    this.eat_(OPEN_PAREN);
    var expression = this.parseExpression();
    this.eat_(CLOSE_PAREN);
    return new ComprehensionIf(this.getTreeLocation_(start), expression);
  }

  // 11.1.4 Object Literal Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseObjectLiteral_() {
    var start = this.getTreeStartLocation_();
    var result = [];

    this.eat_(OPEN_CURLY);
    while (this.peekPropertyDefinition_(this.peekType_())) {
      var propertyDefinition = this.parsePropertyDefinition();
      result.push(propertyDefinition);
      if (!this.eatIf_(COMMA))
        break;
    }
    this.eat_(CLOSE_CURLY);
    return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
  }

  /**
   * PropertyDefinition :
   *   IdentifierName
   *   CoverInitialisedName
   *   PropertyName : AssignmentExpression
   *   MethodDefinition
   */
  parsePropertyDefinition() {
    var start = this.getTreeStartLocation_();

    var isGenerator = false;
    var isStatic = false;

    if (parseOptions.generators && parseOptions.propertyMethods &&
        this.peek_(STAR)) {
      return this.parseGeneratorMethod_(start, isStatic);
    }

    var token = this.peekToken_();
    var name = this.parsePropertyName_();

    if (parseOptions.propertyMethods && this.peek_(OPEN_PAREN))
      return this.parseMethod_(start, isStatic, isGenerator, name);

    if (this.eatIf_(COLON)) {
      var value = this.parseAssignmentExpression();
      return new PropertyNameAssignment(this.getTreeLocation_(start), name,
                                        value);
    }

    var type = this.peekType_();
    if (name.type === LITERAL_PROPERTY_NAME) {
      var nameLiteral = name.literalToken;
      if (nameLiteral.value === GET &&
          this.peekPropertyName_(type)) {
        return this.parseGetAccessor_(start, isStatic);
      }

      if (nameLiteral.value === SET &&
          this.peekPropertyName_(type)) {
        return this.parseSetAccessor_(start, isStatic);
      }

      if (parseOptions.propertyNameShorthand &&
          nameLiteral.type === IDENTIFIER) {

        if (this.peek_(EQUAL)) {
          token = this.nextToken_();
          var expr = this.parseAssignmentExpression();
          return this.coverInitialisedName_ =
              new CoverInitialisedName(this.getTreeLocation_(start),
                                       nameLiteral, token, expr);
        }

        return new PropertyNameShorthand(this.getTreeLocation_(start),
                                         nameLiteral);
      }
    }

    if (name.type === COMPUTED_PROPERTY_NAME)
      token = this.peekToken_();

    return this.parseUnexpectedToken_(token);
  }

  /**
   * ClassElement :
   *   static MethodDefinition
   *   MethodDefinition
   *
   * MethodDefinition :
   *   PropertyName ( FormalParameterList ) { FunctionBody }
   *   * PropertyName ( FormalParameterList ) { FunctionBody }
   *   get PropertyName ( ) { FunctionBody }
   *   set PropertyName ( PropertySetParameterList ) { FunctionBody }
   */
  parseClassElement_() {
    var start = this.getTreeStartLocation_();

    var type = this.peekType_();
    var isStatic = false, isGenerator = false;
    switch (type) {
      case STATIC:
        var staticToken = this.nextToken_();
        type = this.peekType_();
        switch (type) {
          case OPEN_PAREN:
            var name = new LiteralPropertyName(start, staticToken);
            return this.parseMethod_(start, isStatic, isGenerator, name);

          default:
            isStatic = true;
            if (type === STAR && parseOptions.generators)
              return this.parseGeneratorMethod_(start, true);

            return this.parseGetSetOrMethod_(start, isStatic);
        }
        break;

      case STAR:
        return this.parseGeneratorMethod_(start, isStatic);

      default:
        return this.parseGetSetOrMethod_(start, isStatic);
    }
  }

  parseGeneratorMethod_(start, isStatic) {
    var isGenerator = true;
    this.eat_(STAR);
    var name = this.parsePropertyName_();
    return this.parseMethod_(start, isStatic, isGenerator, name);
  }

  parseMethod_(start, isStatic, isGenerator, name) {
    this.eat_(OPEN_PAREN);
    var formalParameterList = this.parseFormalParameterList_();
    this.eat_(CLOSE_PAREN);
    var functionBody = this.parseFunctionBody_(isGenerator,
                                               formalParameterList);
    return new PropertyMethodAssignment(this.getTreeLocation_(start),
        isStatic, isGenerator, name, formalParameterList, functionBody);
  }

  parseGetSetOrMethod_(start, isStatic) {
    var isGenerator = false;
    var name = this.parsePropertyName_();
    var type = this.peekType_();

    // TODO(arv): Can we unify this with parsePropertyDefinition?

    if (name.type === LITERAL_PROPERTY_NAME &&
        name.literalToken.value === GET &&
        this.peekPropertyName_(type)) {
      return this.parseGetAccessor_(start, isStatic);
    }

    if (name.type === LITERAL_PROPERTY_NAME &&
        name.literalToken.value === SET &&
        this.peekPropertyName_(type)) {
      return this.parseSetAccessor_(start, isStatic);
    }

    return this.parseMethod_(start, isStatic, isGenerator, name);
  }

  parseGetAccessor_(start, isStatic) {
    var isGenerator = false;
    var name = this.parsePropertyName_();
    this.eat_(OPEN_PAREN);
    this.eat_(CLOSE_PAREN);
    var body = this.parseFunctionBody_(isGenerator, null);
    return new GetAccessor(this.getTreeLocation_(start), isStatic, name, body);
  }

  parseSetAccessor_(start, isStatic) {
    var isGenerator = false;
    var name = this.parsePropertyName_();
    this.eat_(OPEN_PAREN);
    var parameter = this.parsePropertySetParameterList_();
    this.eat_(CLOSE_PAREN);
    var body = this.parseFunctionBody_(isGenerator, parameter);
    return new SetAccessor(this.getTreeLocation_(start), isStatic, name,
                           parameter, body);
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPropertyDefinition_(type) {
    return this.peekPropertyName_(type) ||
        type == STAR && parseOptions.propertyMethods && parseOptions.generators;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPropertyName_(type) {
    switch (type) {
      case IDENTIFIER:
      case STRING:
      case NUMBER:
        return true;
      case OPEN_SQUARE:
        return parseOptions.computedPropertyNames;
      default:
        return this.peekToken_().isKeyword();
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPredefinedString_(string) {
    var token = this.peekToken_();
    return token.type === IDENTIFIER && token.value === string;
  }

  /**
   * PropertySetParameterList :
   *   BindingIdentifier
   *   BindingPattern
   */
  parsePropertySetParameterList_() {
    var start = this.getTreeStartLocation_();

    var binding;
    if (this.peekPattern_(this.peekType_()))
      binding = this.parseBindingPattern_();
    else
      binding = this.parseBindingIdentifier_();

    return new BindingElement(this.getTreeLocation_(start), binding, null);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseParenExpression_() {
    // Parse arrow function will return a ParenExpression if there isn't an
    // arrow after the ( CoverFormals ).
    return this.parseArrowFunction_();
  }

  parseSyntaxError_(message) {
    var start = this.getTreeStartLocation_();
    this.reportError_(message);
    var token = this.nextToken_();
    return new SyntaxErrorTree(this.getTreeLocation_(start), token, message);
  }

  /**
   * @param {*} name Name of the token. Token object and TokenType both
   *     stringigy to a user friendly string.
   * @return {SyntaxErrorTree}
   */
  parseUnexpectedToken_(name) {
    return this.parseSyntaxError_(`unexpected token ${name}`);
  }

  // 11.14 Expressions

  /**
   * @return {boolean}
   * @private
   */
  peekExpression_(type) {
    switch (type) {
      case NO_SUBSTITUTION_TEMPLATE:
      case TEMPLATE_HEAD:
        return parseOptions.templateLiterals;
      case BANG:
      case CLASS:
      case DELETE:
      case FALSE:
      case FUNCTION:
      case IDENTIFIER:
      case MINUS:
      case MINUS_MINUS:
      case NEW:
      case NULL:
      case NUMBER:
      case OPEN_CURLY:
      case OPEN_PAREN:
      case OPEN_SQUARE:
      case PLUS:
      case PLUS_PLUS:
      case SLASH: // regular expression literal
      case SLASH_EQUAL:
      case STRING:
      case SUPER:
      case THIS:
      case TILDE:
      case TRUE:
      case TYPEOF:
      case VOID:
      case YIELD:
        return true;
      default:
        return false;
    }
  }

  /**
   * Expression :
   *   AssignmentExpression
   *   Expression , AssignmentExpression
   *
   * ExpressionNoIn :
   *   AssignmentExpressionNoIn
   *   ExpressionNoIn , AssignmentExpressionNoIn
   *
   * @return {ParseTree}
   */
  parseExpression(expressionIn = Expression.IN) {
    var start = this.getTreeStartLocation_();
    var result = this.parseAssignmentExpression(expressionIn);
    if (this.peek_(COMMA)) {
      var exprs = [result];
      while (this.eatIf_(COMMA)) {
        exprs.push(this.parseAssignmentExpression(expressionIn));
      }
      return new CommaExpression(this.getTreeLocation_(start), exprs);
    }
    return result;
  }

  parseExpressionForCoverFormals_(expressionIn = Expression.IN) {
    var start = this.getTreeStartLocation_();
    var exprs = [this.parseAssignmentExpression(expressionIn)];
    if (this.peek_(COMMA)) {
      while (this.eatIf_(COMMA)) {
        if (this.peekRest_(this.peekType_())) {
          exprs.push(this.parseRestParameter_());
          break;
        }
        exprs.push(this.parseAssignmentExpression(expressionIn));
      }
    }
    return new CoverFormals(this.getTreeLocation_(start), exprs);
  }

  // 11.13 Assignment expressions

  /**
   * @return {boolean}
   * @private
   */
  peekAssignmentExpression_(type) {
    return this.peekExpression_(type);
  }

  /**
   * AssignmentExpression :
   *   ConditionalExpression
   *   YieldExpression
   *   ArrowFunction
   *   LeftHandSideExpression = AssignmentExpression
   *   LeftHandSideExpression AssignmentOperator AssignmentExpression
   *
   * AssignmentExpressionNoIn :
   *   ConditionalExpressionNoIn
   *   YieldExpression
   *   ArrowFunction
   *   LeftHandSideExpression = AssignmentExpressionNoIn
   *   LeftHandSideExpression AssignmentOperator AssignmentExpressionNoIn
   *
   * @param {Expression} expressionIn
   * @return {ParseTree}
   */
  parseAssignmentExpression(expressionIn = Expression.NORMAL) {
    if (this.allowYield_ && this.peek_(YIELD))
      return this.parseYieldExpression_();

    this.assignmentExpressionDepth_++;

    var start = this.getTreeStartLocation_();
    var left = this.parseConditional_(expressionIn);
    var type = this.peekType_();

    if (this.peekAssignmentOperator_(type)) {
      if (type === EQUAL)
        left = this.transformLeftHandSideExpression_(left);


      if (!left.isLeftHandSideExpression() && !left.isPattern()) {
        this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
      }

      var operator = this.nextToken_();
      var right = this.parseAssignmentExpression(expressionIn);
      this.assignmentExpressionDepth_--;
      this.coverInitialisedName_ = null;

      return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }

    this.assignmentExpressionDepth_--;

    if (this.assignmentExpressionDepth_ === 0 && this.coverInitialisedName_) {
      var token = this.coverInitialisedName_.equalToken;
      this.reportError_(token.location, `Unexpected token '${token}'`);
      this.coverInitialisedName_ = null;
    }

    // Handle arrow function.
    if (left && left.type === IDENTIFIER_EXPRESSION && this.peekArrow_(type)) {
      this.nextToken_();
      var id = new BindingIdentifier(left.location, left.identifierToken);
      var formals = [new BindingElement(id.location, id, null)];
      var body = this.parseConciseBody_();
      var startLoc = left.location;
      return new ArrowFunctionExpression(startLoc,
          new FormalParameterList(startLoc, formals),
          body);
    }

    return left;
  }

  /**
   * Transforms a LeftHandSideExpression into a AssignmentPattern if possible.
   * This returns the transformed tree if it parses as an AssignmentPattern,
   * otherwise it returns the original tree.
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  transformLeftHandSideExpression_(tree) {
    switch (tree.type) {
      case ARRAY_LITERAL_EXPRESSION:
      case OBJECT_LITERAL_EXPRESSION:
        var transformer = new AssignmentPatternTransformer();
        var transformedTree;
        try {
          transformedTree = transformer.transformAny(tree);
        } catch (ex) {
          if (!(ex instanceof AssignmentPatternTransformerError))
            throw ex;
        }
        if (transformedTree)
          return transformedTree;
        break;

      case PAREN_EXPRESSION:
        var expression =
            this.transformLeftHandSideExpression_(tree.expression);
        if (expression !== tree.expression)
          return new ParenExpression(tree.location, expression);
    }
    return tree;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekAssignmentOperator_(type) {
    return isAssignmentOperator(type);
  }

  // 11.12 Conditional Expression
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseConditional_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var condition = this.parseLogicalOR_(expressionIn);
    if (this.eatIf_(QUESTION)) {
      var left = this.parseAssignmentExpression();
      this.eat_(COLON);
      var right = this.parseAssignmentExpression(expressionIn);
      return new ConditionalExpression(this.getTreeLocation_(start), condition, left, right);
    }
    return condition;
  }

  // 11.11 Logical OR
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseLogicalOR_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseLogicalAND_(expressionIn);
    var operator;
    while (operator = this.eatOpt_(OR)) {
      var right = this.parseLogicalAND_(expressionIn);
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  // 11.11 Logical AND
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseLogicalAND_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseBitwiseOR_(expressionIn);
    var operator;
    while (operator = this.eatOpt_(AND)) {
      var right = this.parseBitwiseOR_(expressionIn);
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  // 11.10 Bitwise OR
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseBitwiseOR_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseBitwiseXOR_(expressionIn);
    var operator;
    while (operator = this.eatOpt_(BAR)) {
      var right = this.parseBitwiseXOR_(expressionIn);
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  // 11.10 Bitwise XOR
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseBitwiseXOR_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseBitwiseAND_(expressionIn);
    var operator;
    while (operator = this.eatOpt_(CARET)) {
      var right = this.parseBitwiseAND_(expressionIn);
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  // 11.10 Bitwise AND
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseBitwiseAND_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseEquality_(expressionIn);
    var operator;
    while (operator = this.eatOpt_(AMPERSAND)) {
      var right = this.parseEquality_(expressionIn);
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  // 11.9 Equality Expression
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseEquality_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseRelational_(expressionIn);
    while (this.peekEqualityOperator_(this.peekType_())) {
      var operator = this.nextToken_();
      var right = this.parseRelational_(expressionIn);
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekEqualityOperator_(type) {
    switch (type) {
      case EQUAL_EQUAL:
      case NOT_EQUAL:
      case EQUAL_EQUAL_EQUAL:
      case NOT_EQUAL_EQUAL:
        return true;
    }
    return false;
  }

  // 11.8 Relational
  /**
   * @param {Expression} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseRelational_(expressionIn) {
    var start = this.getTreeStartLocation_();
    var left = this.parseShiftExpression_();
    while (this.peekRelationalOperator_(expressionIn)) {
      var operator = this.nextToken_();
      var right = this.parseShiftExpression_();
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  /**
   * @param {Expression} expressionIn
   * @return {boolean}
   * @private
   */
  peekRelationalOperator_(expressionIn) {
    switch (this.peekType_()) {
      case OPEN_ANGLE:
      case CLOSE_ANGLE:
      case GREATER_EQUAL:
      case LESS_EQUAL:
      case INSTANCEOF:
        return true;
      case IN:
        return expressionIn == Expression.NORMAL;
      default:
        return false;
    }
  }

  // 11.7 Shift Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseShiftExpression_() {
    var start = this.getTreeStartLocation_();
    var left = this.parseAdditiveExpression_();
    while (this.peekShiftOperator_(this.peekType_())) {
      var operator = this.nextToken_();
      var right = this.parseAdditiveExpression_();
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekShiftOperator_(type) {
    switch (type) {
      case LEFT_SHIFT:
      case RIGHT_SHIFT:
      case UNSIGNED_RIGHT_SHIFT:
        return true;
      default:
        return false;
    }
  }

  // 11.6 Additive Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseAdditiveExpression_() {
    var start = this.getTreeStartLocation_();
    var left = this.parseMultiplicativeExpression_();
    while (this.peekAdditiveOperator_(this.peekType_())) {
      var operator = this.nextToken_();
      var right = this.parseMultiplicativeExpression_();
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekAdditiveOperator_(type) {
    switch (type) {
      case PLUS:
      case MINUS:
        return true;
      default:
        return false;
    }
  }

  // 11.5 Multiplicative Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseMultiplicativeExpression_() {
    var start = this.getTreeStartLocation_();
    var left = this.parseUnaryExpression_();
    while (this.peekMultiplicativeOperator_(this.peekType_())) {
      var operator = this.nextToken_();
      var right = this.parseUnaryExpression_();
      left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    }
    return left;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekMultiplicativeOperator_(type) {
    switch (type) {
      case STAR:
      case SLASH:
      case PERCENT:
        return true;
      default:
        return false;
    }
  }

  // 11.4 Unary Operator
  /**
   * @return {ParseTree}
   * @private
   */
  parseUnaryExpression_() {
    var start = this.getTreeStartLocation_();
    if (this.peekUnaryOperator_(this.peekType_())) {
      var operator = this.nextToken_();
      var operand = this.parseUnaryExpression_();
      return new UnaryExpression(this.getTreeLocation_(start), operator, operand);
    }
    return this.parsePostfixExpression_();
  }

  /**
   * @return {boolean}
   * @private
   */
  peekUnaryOperator_(type) {
    switch (type) {
      case DELETE:
      case VOID:
      case TYPEOF:
      case PLUS_PLUS:
      case MINUS_MINUS:
      case PLUS:
      case MINUS:
      case TILDE:
      case BANG:
        return true;
      default:
        return false;
    }
  }

  // 11.3 Postfix Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parsePostfixExpression_() {
    var start = this.getTreeStartLocation_();
    var operand = this.parseLeftHandSideExpression_();
    while (this.peekPostfixOperator_(this.peekType_())) {
      var operator = this.nextToken_();
      operand = new PostfixExpression(this.getTreeLocation_(start), operand, operator);
    }
    return operand;
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPostfixOperator_(type) {
    switch (type) {
      case PLUS_PLUS:
      case MINUS_MINUS:
        var token = this.peekTokenNoLineTerminator_();
        return token !== null;
    }
    return false;
  }

  // 11.2 Left hand side expression
  //
  // Also inlines the call expression productions

  /**
   * LeftHandSideExpression :
   *   NewExpression
   *   CallExpression
   *
   * @return {ParseTree}
   * @private
   */
  parseLeftHandSideExpression_() {
    var start = this.getTreeStartLocation_();
    var operand = this.parseNewExpression_();

    // this test is equivalent to is member expression
    if (!(operand instanceof NewExpression) || operand.args != null) {

      // The Call expression productions
      loop: while (true) {
        switch (this.peekType_()) {
          case OPEN_PAREN:
            var args = this.parseArguments_();
            operand = new CallExpression(this.getTreeLocation_(start),
                                         operand, args);
            break;

          case OPEN_SQUARE:
            this.nextToken_();
            var member = this.parseExpression();
            this.eat_(CLOSE_SQUARE);
            operand = new MemberLookupExpression(this.getTreeLocation_(start),
                                                 operand, member);
            break;

          case PERIOD:
            this.nextToken_();
            var memberName = this.eatIdName_();
            operand = new MemberExpression(this.getTreeLocation_(start),
                                           operand, memberName);
            break;

          case PERIOD_OPEN_CURLY:
            if (!parseOptions.cascadeExpression)
              break loop;
            var expressions = this.parseCascadeExpressions_();
            operand = new CascadeExpression(this.getTreeLocation_(start),
                                            operand, expressions);
            break;

          case NO_SUBSTITUTION_TEMPLATE:
          case TEMPLATE_HEAD:
            if (!parseOptions.templateLiterals)
              break loop;
            operand = this.parseTemplateLiteral_(operand);
            break;

          default:
            break loop;
        }
      }
    }
    return operand;
  }

  // 11.2 Member Expression without the new production
  /**
   * @return {ParseTree}
   * @private
   */
  parseMemberExpressionNoNew_() {
    var start = this.getTreeStartLocation_();
    var operand;
    if (this.peekType_() === FUNCTION) {
      operand = this.parseFunctionExpression_();
    } else {
      operand = this.parsePrimaryExpression_();
    }

    loop: while (true) {
      switch (this.peekType_()) {
        case OPEN_SQUARE:
          this.nextToken_();
          var member = this.parseExpression();
          this.eat_(CLOSE_SQUARE);
          operand = new MemberLookupExpression(this.getTreeLocation_(start),
                                               operand, member);
          break;

        case PERIOD:
          this.nextToken_();
          var name;
          name = this.eatIdName_();
          operand = new MemberExpression(this.getTreeLocation_(start),
                                         operand, name);
          break;

        case PERIOD_OPEN_CURLY:
          if (!parseOptions.cascadeExpression)
            break loop;
          var expressions = this.parseCascadeExpressions_();
          operand = new CascadeExpression(this.getTreeLocation_(start),
                                          operand, expressions);
          break;

        case NO_SUBSTITUTION_TEMPLATE:
        case TEMPLATE_HEAD:
          if (!parseOptions.templateLiterals)
            break loop;
          operand = this.parseTemplateLiteral_(operand);
          break;

        default:
          break loop;  // break out of loop.
      }
    }
    return operand;
  }

  parseCascadeExpressions_() {
    this.eat_(PERIOD_OPEN_CURLY);
    var expressions = [];
    var type;
    while (this.peekId_(type = this.peekType_()) &&
           this.peekAssignmentExpression_(type)) {
      expressions.push(this.parseCascadeExpression_());
      this.eatPossibleImplicitSemiColon_();
    }
    this.eat_(CLOSE_CURLY);
    return expressions;
  }

  parseCascadeExpression_() {
    var expr = this.parseAssignmentExpression();
    var operand;
    switch (expr.type) {
      case CALL_EXPRESSION:
      case MEMBER_EXPRESSION:
      case MEMBER_LOOKUP_EXPRESSION:
      case CASCADE_EXPRESSION:
        operand = expr.operand;
        break;
      case BINARY_OPERATOR:
        operand = expr.left;
        break;
      default:
        this.reportError_(expr.location,
                          `Invalid expression. Type: ${expr.type}`);
    }

    if (operand) {
      switch (operand.type) {
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case CALL_EXPRESSION:
        case CASCADE_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
          break;
        default:
          this.reportError_(operand.location,
                            `Invalid expression: ${operand.type}`);
      }
    }

    if (expr.type == BINARY_OPERATOR &&
        !expr.operator.isAssignmentOperator()) {
      this.reportError_(expr.operator, `Invalid operator: ${expr.operator}`);
    }

    return expr;
  }

  // 11.2 New Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseNewExpression_() {
    if (this.peek_(NEW)) {
      var start = this.getTreeStartLocation_();
      this.eat_(NEW);
      var operand = this.parseNewExpression_();
      var args = null;
      if (this.peek_(OPEN_PAREN)) {
        args = this.parseArguments_();
      }
      return new NewExpression(this.getTreeLocation_(start), operand, args);
    } else {
      return this.parseMemberExpressionNoNew_();
    }
  }

  /**
   * @return {ArgumentList}
   * @private
   */
  parseArguments_() {
    // ArgumentList :
    //   AssignmentOrSpreadExpression
    //   ArgumentList , AssignmentOrSpreadExpression
    //
    // AssignmentOrSpreadExpression :
    //   ... AssignmentExpression
    //   AssignmentExpression

    var start = this.getTreeStartLocation_();
    var args = [];

    this.eat_(OPEN_PAREN);
    while (true) {
      var type = this.peekType_();
      if (this.peekRest_(type)) {
        args.push(this.parseSpreadExpression_());
      } else if (this.peekAssignmentExpression_(type)) {
        args.push(this.parseAssignmentExpression());
      } else {
        break;
      }

      if (!this.peek_(CLOSE_PAREN)) {
        this.eat_(COMMA);
      }
    }
    this.eat_(CLOSE_PAREN);
    return new ArgumentList(this.getTreeLocation_(start), args);
  }

  peekRest_(type) {
    return type === DOT_DOT_DOT && parseOptions.restParameters;
  }

  /**
   * Parses arrow functions and paren expressions as well as delegates to
   * {@code parseGeneratorComprehension_} if this begins a generator
   * comprehension.
   *
   * Arrow function support, see:
   * http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax
   *
   * Generator comprehensions syntax is in the ES6 draft,
   * 11.1.7 Generator Comprehensions
   *
   * ArrowFunction :
   *   ArrowParameters => ConciseBody
   *
   * ArrowParameters :
   *   BindingIdentifer
   *   CoverParenthesizedExpressionAndArrowParameterList
   *
   * CoverParenthesizedExpressionAndArrowParameterList :
   *   ( Expression )
   *   ( )
   *   ( ... Identifier )
   *   ( Expression , ... Identifier )
   *
   * ConciseBody :
   *   [lookahead not {] AssignmentExpression
   *   { FunctionBody }
   *
   *
   * @param {Expression=} expressionIn
   * @return {ParseTree}
   * @private
   */
  parseArrowFunction_(expressionIn) {
    var start = this.getTreeStartLocation_();

    this.eat_(OPEN_PAREN);

    if (this.peek_(FOR) && parseOptions.generatorComprehension)
      return this.parseGeneratorComprehension_(start);

    var formals;
    var coverFormals = this.parseCoverFormals_();
    var expressions = coverFormals.expressions;

    this.eat_(CLOSE_PAREN);

    // ()
    // ( ... ident )
    var mustBeArrow = expressions.length === 0 ||
        expressions[expressions.length - 1].type === REST_PARAMETER;

    if (mustBeArrow || this.peekArrow_(this.peekType_())) {
      formals = this.transformCoverFormals_(coverFormals);
      if (!formals && mustBeArrow) {
        return this.parseUnexpectedToken_(DOT_DOT_DOT);
      }
    }

    if (!formals) {
      var expression;
      if (expressions.length > 1)
        expression = new CommaExpression(coverFormals.location, expressions);
      else
        expression = expressions[0];
      return new ParenExpression(this.getTreeLocation_(start), expression);
    }

    this.eat_(ARROW);

    var body = this.parseConciseBody_();
    var startLoc = this.getTreeLocation_(start);
    return new ArrowFunctionExpression(startLoc, formals, body);
  }

  parseCoverFormals_() {
    // CoverParenthesizedExpressionAndArrowParameterList :
    //   ( Expression )
    //   ()
    //   ( ... Identifier)
    //   (Expression, ... Identifier)
    //
    //  The surrounding parens are handled by the caller.

    var start = this.getTreeStartLocation_();
    var type = this.peekType_();
    if (type === CLOSE_PAREN)
      return new CoverFormals(this.getTreeLocation_(start), []);

    // ( ... Identifier )
    if (this.peekRest_(type)) {
      var parameter = this.parseRestParameter_();
      return new CoverFormals(this.getTreeLocation_(start), [parameter]);
    }

    return this.parseExpressionForCoverFormals_();
  }

  /**
   * Reparses the {@code coverFormals} as a FormalsList. This returns null if
   * {@code coverFormals} cannot be parsed or fully consumed as a FormalsList.
   * @param {ParseTree} coverFormals The expression that started after the
   *     opening paren in an arrow function.
   * @return {Array.<ParseTree>} An aray with the items to use in a
   *     FormalsList or {@code null} if there was an error.
   */
  transformCoverFormals_(coverFormals) {
    var transformer = new CoverFormalsTransformer();
    var formals = null;
    try {
      formals = transformer.transformAny(coverFormals);
    } catch (ex) {
      if (!(ex instanceof CoverFormalsTransformerError))
        throw ex;
    }

    return formals;
  }

  /** @returns {TokenType} */
  peekArrow_(type) {
    return type === ARROW && parseOptions.arrowFunctions;
  }

  /**
   * ConciseBody :
   *   [lookahead not {] AssignmentExpression
   *   { FunctionBody }
   *
   * @param {boolean} isGenerator
   * @return {ParseTree}
   *
   * @return {ParseTree} */
  parseConciseBody_() {
    // The body can be a block or an expression. A '{' is always treated as
    // the beginning of a block.
    if (this.peek_(OPEN_CURLY))
      return this.parseFunctionBody_();
    return this.parseAssignmentExpression();
  }

  /**
   * Continues parsing generator expressions. The opening paren and the
   * expression is parsed by parseArrowFunction_.
   *
   * https://bugs.ecmascript.org/show_bug.cgi?id=381
   *
   * GeneratorComprehension :
   *   ( Comprehension )
   */
  parseGeneratorComprehension_(start) {
    var comprehensionList = this.parseComprehensionList_();
    var expression = this.parseAssignmentExpression();
    this.eat_(CLOSE_PAREN);
    return new GeneratorComprehension(this.getTreeLocation_(start),
                                      comprehensionList,
                                      expression);
  }

  /**
   * ForBinding :
   *   BindingIdentifier
   *   BindingPattern
   */
  parseForBinding_() {
    if (this.peekPattern_(this.peekType_()))
      return this.parseBindingPattern_();
    return this.parseBindingIdentifier_();
  }

  // Destructuring; see
  // http://wiki.ecmascript.org/doku.php?id=harmony:destructuring
  //
  // SpiderMonkey is much more liberal in where it allows
  // parenthesized patterns, for example, it allows [x, ([y, z])] but
  // those inner parentheses aren't allowed in the grammar on the ES
  // wiki. This implementation conservatively only allows parentheses
  // at the top-level of assignment statements.

  peekPattern_(type) {
    return parseOptions.destructuring && (this.peekObjectPattern_(type) ||
        this.peekArrayPattern_(type));
  }

  peekArrayPattern_(type) {
    return type === OPEN_SQUARE;
  }

  peekObjectPattern_(type) {
    return type === OPEN_CURLY;
  }

  /**
   * BindingPattern :
   *   ObjectBindingPattern
   *   ArrayBindingPattern
   */
  parseBindingPattern_() {
    if (this.peekArrayPattern_(this.peekType_()))
      return this.parseArrayBindingPattern_();
    return this.parseObjectBindingPattern_();
  }

  /**
   * ArrayBindingPattern :
   *   []
   *   [ BindingElementList ]
   *   [ BindingElementList , Elisionopt BindingRestElementopt ]
   *
   * BindingElementList :
   *   Elisionopt BindingElement
   *   BindingElementList , Elisionopt BindingElement
   *
   * Elision :
   *   ,
   *   Elision ,
   */
  parseArrayBindingPattern_() {
    var start = this.getTreeStartLocation_();
    var elements = [];
    this.eat_(OPEN_SQUARE);
    var type;
    while ((type = this.peekType_()) === COMMA ||
           this.peekBindingElement_(type) ||
           this.peekRest_(type)) {
      // TODO(arv): Refactor to not peek twice.
      this.parseElisionOpt_(elements);
      if (this.peekRest_(this.peekType_())) {
        elements.push(this.parseBindingRestElement_());
        break;
      } else {
        elements.push(this.parseBindingElement_());
        // Trailing commas are not allowed in patterns.
        if (this.peek_(COMMA) &&
            !this.peek_(CLOSE_SQUARE, 1)) {
          this.nextToken_();
        }
      }
    }
    this.eat_(CLOSE_SQUARE);
    return new ArrayPattern(this.getTreeLocation_(start), elements);
  }

  /**
   * BindingElementList :
   *   Elisionopt BindingElement
   *   BindingElementList , Elisionopt BindingElement
   */
  parseBindingElementList_(elements) {
    this.parseElisionOpt_(elements);
    elements.push(this.parseBindingElement_());
    while (this.eatIf_(COMMA)) {
      this.parseElisionOpt_(elements);
      elements.push(this.parseBindingElement_());
    }
  }

  /**
   * Parses the elision opt production and appends null to the
   * {@code elements} array for every empty elision.
   *
   * @param {Array} elements The array to append to.
   */
  parseElisionOpt_(elements) {
    while (this.eatIf_(COMMA)) {
      elements.push(null);
    }
  }

  /**
   * BindingElement :
   *   SingleNameBinding
   *   BindingPattern Initialiseropt
   *
   * SingleNameBinding :
   *   BindingIdentifier Initialiseropt
   */
  peekBindingElement_(type) {
    return this.peekBindingIdentifier_(type) || this.peekPattern_(type);
  }

  /**
   * @param {Initializer=} initializer If left out the initializer is
   *     optional and allowed. If set to Initializer.REQUIRED there must be an
   *     initializer.
   * @return {ParseTree}
   */
  parseBindingElement_(initializer = Initializer.OPTIONAL) {
    var start = this.getTreeStartLocation_();
    var binding;
    if (this.peekPattern_(this.peekType_()))
      binding = this.parseBindingPattern_();
    else
      binding = this.parseBindingIdentifier_();
    var initializer = null;
    if (this.peek_(EQUAL) ||
        initializer === Initializer.REQUIRED) {
      initializer = this.parseInitializer_();
    }
    return new BindingElement(this.getTreeLocation_(start), binding,
                                                    initializer);
  }

  /**
   * BindingRestElement :
   *   ... BindingIdentifier
   */
  parseBindingRestElement_() {
    var start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    var identifier = this.parseBindingIdentifier_();
    return new SpreadPatternElement(this.getTreeLocation_(start), identifier);
  }

  /**
   * ObjectBindingPattern :
   *   {}
   *   { BindingPropertyList }
   *   { BindingPropertyList , }
   *
   * BindingPropertyList :
   *   BindingProperty
   *   BindingPropertyList , BindingProperty
   */
  parseObjectBindingPattern_() {
    var start = this.getTreeStartLocation_();
    var elements = [];
    this.eat_(OPEN_CURLY);
    while (this.peekBindingProperty_(this.peekType_())) {
      elements.push(this.parseBindingProperty_());
      if (!this.eatIf_(COMMA))
        break;
    }
    this.eat_(CLOSE_CURLY);
    return new ObjectPattern(this.getTreeLocation_(start), elements);
  }

  /**
   * BindingProperty :
   *   SingleNameBinding
   *   PropertyName : BindingElement
   *
   * SingleNameBinding :
   *   BindingIdentifier Initialiseropt
   */
  peekBindingProperty_(type) {
    return this.peekBindingIdentifier_(type) || this.peekPropertyName_(type);
  }

  parseBindingProperty_() {
    var start = this.getTreeStartLocation_();

    var name = this.parsePropertyName_();

    var requireColon = name.type !== LITERAL_PROPERTY_NAME ||
        !name.literalToken.isStrictKeyword() &&
        name.literalToken.type !== IDENTIFIER;
    if (requireColon || this.peek_(COLON)) {
      this.eat_(COLON);
      var binding = this.parseBindingElement_();
      // TODO(arv): Rename ObjectPatternField to BindingProperty
      return new ObjectPatternField(this.getTreeLocation_(start),
                                    name, binding);
    }

    var token = name.literalToken;
    if (this.strictMode_ && token.isStrictKeyword())
        this.reportReservedIdentifier_(token);

    var binding = new BindingIdentifier(name.location, token);
    var initializer = null;
    if (this.peek_(EQUAL))
      initializer = this.parseInitializer_();
    return new BindingElement(this.getTreeLocation_(start), binding,
                              initializer);
  }

  /**
   * Template Literals
   *
   * Template ::
   *   FullTemplate
   *   TemplateHead
   *
   * FullTemplate ::
   *   ` TemplateCharactersopt `
   *
   * TemplateHead ::
   *   ` TemplateCharactersopt ${
   *
   * TemplateSubstitutionTail ::
   *   TemplateMiddle
   *   TemplateTail
   *
   * TemplateMiddle ::
   *   } TemplateCharactersopt ${
   *
   * TemplateTail ::
   *   } TemplateCharactersopt `
   *
   * TemplateCharacters ::
   *   TemplateCharacter TemplateCharactersopt
   *
   * TemplateCharacter ::
   *   SourceCharacter but not one of ` or \ or $
   *   $ [lookahead not { ]
   *   \ EscapeSequence
   *   LineContinuation
   *
   * @param {ParseTree} operand
   * @return {ParseTree}
   * @private
   */
  parseTemplateLiteral_(operand) {
    if (!parseOptions.templateLiterals)
      return this.parseUnexpectedToken_('`');

    var start = operand ?
        operand.location.start : this.getTreeStartLocation_();

    var token = this.nextToken_();
    var elements = [new TemplateLiteralPortion(token.location, token)];

    if (token.type === NO_SUBSTITUTION_TEMPLATE) {
      return new TemplateLiteralExpression(this.getTreeLocation_(start),
                                        operand, elements);
    }

    // `abc${
    var expression = this.parseExpression();
    elements.push(new TemplateSubstitution(expression.location, expression));

    while (expression.type !== SYNTAX_ERROR_TREE) {
      token = this.nextTemplateLiteralToken_();
      if (token.type === ERROR || token.type === END_OF_FILE)
        break;

      elements.push(new TemplateLiteralPortion(token.location, token));
      if (token.type === TEMPLATE_TAIL)
        break;

      expression = this.parseExpression();
      elements.push(new TemplateSubstitution(expression.location, expression));
    }

    return new TemplateLiteralExpression(this.getTreeLocation_(start),
                                      operand, elements);
  }

  parseTypeAnnotationOpt_() {
    if (parseOptions.types && this.eatOpt_(COLON)) {
      return this.parseType_();
    }
    return null;
  }

  /**
   * Types
   *
   * Type ::
   *   PredefinedType
   *   TypeName
   *   TypeLiteral
   *
   * @return {ParseTree}
   * @private
   */
  parseType_() {
    var start = this.getTreeStartLocation_();
    var elementType;
    switch (this.peekType_()) {
      case IDENTIFIER:
        elementType = this.parseNamedOrPredefinedType_();
        break;
      case NEW:
        elementType = this.parseConstructorType_();
        break;
      case OPEN_CURLY:
        elementType = this.parseObjectType_();
        break;
      case OPEN_PAREN:
        elementType = this.parseFunctionType_();
        break;
      case VOID:
        var token = this.nextToken_();
        return new PredefinedType(this.getTreeLocation_(start), token);
      default:
        return this.parseUnexpectedToken_(this.peekToken_());
    }
    return this.parseArrayTypeSuffix_(start, elementType);
  }

  parseArrayTypeSuffix_(start, elementType) {
    // NYI
    return elementType;
  }

  parseConstructorType_() {
    throw 'NYI';
  }

  parseObjectType_() {
    throw 'NYI';
  }

  parseFunctionType_() {
    throw 'NYI';
  }

  /**
   * PredefinedType ::
   *   any
   *   number
   *   bool
   *   string
   * @return {ParseTree}
   * @private
   */
  parseNamedOrPredefinedType_() {
    var start = this.getTreeStartLocation_();

    switch (this.peekToken_().value) {
      case ANY:
      case NUMBER:
      case BOOL:
      case STRING:
        var token = this.nextToken_();
        return new PredefinedType(this.getTreeLocation_(start), token);
      default:
        return this.parseTypeName_();
    }
  }

  /**
   * Type Name ::
   *   ModuleOrTypeName
   *
   * ModuleOrTypeName ::
   *   Identifier
   *   ModuleName . Identifier
   *
   * ModuleName ::
   *   ModuleOrTypeName
   *
   * @return {ParseTree}
   * @private
   */
  parseTypeName_() {
    var start = this.getTreeStartLocation_();
    var typeName = new TypeName(this.getTreeLocation_(start), null,
        this.eatId_());
    while (this.eatIf_(PERIOD)) {
      var memberName = this.eatIdName_();
      typeName = new TypeName(this.getTreeLocation_(start), typeName,
      memberName);
    }
    return typeName;
  }

  /**
   * Consume a (possibly implicit) semi-colon. Reports an error if a semi-colon is not present.
   *
   * @return {void}
   * @private
   */
  eatPossibleImplicitSemiColon_() {
    var strictSemicolons = this.strictSemicolons_;
    var token = this.peekTokenNoLineTerminator_();
    if (!token) {
      // We delay changes in lint-nolint checking until the next token. This is
      // needed to properly handle (or ignore) semicolon errors occurring at the
      // boundary of a changeover.
      if (this.noLintChanged_)
        strictSemicolons = !strictSemicolons;
      if (!strictSemicolons)
        return;
    } else {
      switch (token.type) {
        case SEMI_COLON:
          this.nextToken_();
          return;
        case END_OF_FILE:
        case CLOSE_CURLY:
          if (this.noLintChanged_)
            strictSemicolons = !strictSemicolons;
          if (!strictSemicolons)
            return;
      }
    }

    this.reportError_('Semi-colon expected');
  }

  /**
   * Returns true if an implicit or explicit semi colon is at the current location.
   *
   * @return {boolean}
   * @private
   */
  peekImplicitSemiColon_() {
    switch (this.peekType_()) {
      case SEMI_COLON:
      case CLOSE_CURLY:
      case END_OF_FILE:
        return true;
    }
    var token = this.peekTokenNoLineTerminator_();
    return token === null;
  }

  /**
   * Consumes the next token if it is of the expected type. Otherwise returns null.
   * Never reports errors.
   *
   * @param {TokenType} expectedTokenType
   * @return {Token} The consumed token, or null if the next token is not of the expected type.
   * @private
   */
  eatOpt_(expectedTokenType) {
    if (this.peek_(expectedTokenType))
      return this.nextToken_();
    return null;
  }

  /**
   * Shorthand for this.eatOpt_(IDENTIFIER)
   *
   * @return {IdentifierToken}
   * @private
   */
  eatIdOpt_() {
    return this.peek_(IDENTIFIER) ? this.eatId_() : null;
  }

  /**
   * Shorthand for this.eat_(IDENTIFIER)
   * @param {string=} expected
   * @return {IdentifierToken}
   * @private
   */
  eatId_(expected = undefined) {
    var token = this.nextToken_();
    if (!token) {
      if (expected)
        this.reportError_(this.peekToken_(), `expected '${expected}'`);
      return null;
    }

    if (token.type === IDENTIFIER)
      return token;

    if (token.isStrictKeyword()) {
      if (this.strictMode_) {
        this.reportReservedIdentifier_(token);
      } else {
        // Use an identifier token instead because it is treated as such and
        // this simplifies the transformers.
        return new IdentifierToken(token.location, token.type);
      }
    } else {
      this.reportExpectedError_(token, expected || 'identifier');
    }

    return token;
  }

  /**
   * Eats an identifier or keyword. Equivalent to IdentifierName in the spec.
   *
   * @return {Token}
   * @private
   */
  eatIdName_() {
    var t = this.nextToken_();
    if (t.type != IDENTIFIER) {
      if (!t.isKeyword()) {
        this.reportExpectedError_(t, 'identifier');
        return null;
      }
      return new IdentifierToken(t.location, t.type);
    }
    return t;
  }

  /**
   * Consumes the next token. If the consumed token is not of the expected type
   * then report an error and return null. Otherwise return the consumed token.
   *
   * @param {TokenType} expectedTokenType
   * @return {Token} The consumed token, or null if the next token is not of
   *     the expected type.
   * @private
   */
  eat_(expectedTokenType) {
    var token = this.nextToken_();
    if (token.type != expectedTokenType) {
      this.reportExpectedError_(token, expectedTokenType);
      return null;
    }
    return token;
  }

  /**
   * If the next token matches the given TokenType, this consumes the token
   * and returns true.
   */
  eatIf_(expectedTokenType) {
    if (this.peek_(expectedTokenType)) {
      this.nextToken_();
      return true;
    }
    return false;
  }

  /**
   * Report a 'X' expected error message.
   * @param {Token} token The location to report the message at.
   * @param {Object} expected The thing that was expected.
   *
   * @return {void}
   * @private
   */
  reportExpectedError_(token, expected) {
    this.reportError_(token, "'" + expected + "' expected");
  }

  /**
   * Returns a SourcePosition for the start of a parse tree that starts at the current location.
   *
   * @return {SourcePosition}
   * @private
   */
  getTreeStartLocation_() {
    return this.peekToken_().location.start;
  }

  /**
   * Returns a SourcePosition for the end of a parse tree that ends at the current location.
   *
   * @return {SourcePosition}
   * @private
   */
  getTreeEndLocation_() {
    return this.scanner_.lastToken.location.end;
  }

  /**
   * Returns a SourceRange for a parse tree that starts at {start} and ends at the current location.
   *
   * @return {SourceRange}
   * @private
   */
  getTreeLocation_(start) {
    return new SourceRange(start, this.getTreeEndLocation_());
  }

  handleSingleLineComment(input, start, end) {
    // Check for '//:' and 'options.ignoreNolint' first so that we can
    // immediately skip the expensive slice and regexp if it's not needed.
    if (input.charCodeAt(start += 2) === 58 && !options.ignoreNolint) {
      // We slice one more than the length of 'nolint' so that we can properly
      // check for the presence or absence of a word boundary.
      var text = input.slice(start + 1, start + 8);
      if (text.search(/^(?:no)?lint\b/) === 0) {
        var noLint = text[0] === 'n';
        if (noLint !== this.noLint) {
          this.noLintChanged_ = !this.noLintChanged_;
          this.noLint = noLint;
          this.strictSemicolons_ = options.strictSemicolons && !this.noLint;
        }
      }
    }
  }

  /**
   * Consumes the next token and returns it. Will return a never ending stream of
   * END_OF_FILE at the end of the file so callers don't have to check for EOF explicitly.
   *
   * Tokenizing is contextual. this.nextToken_() will never return a regular expression literal.
   *
   * @return {Token}
   * @private
   */
  nextToken_() {
    this.noLintChanged_ = false;
    return this.scanner_.nextToken();
  }

  /**
   * Consumes a regular expression literal token and returns it.
   *
   * @return {LiteralToken}
   * @private
   */
  nextRegularExpressionLiteralToken_() {
    return this.scanner_.nextRegularExpressionLiteralToken();
  }

  nextTemplateLiteralToken_() {
    return this.scanner_.nextTemplateLiteralToken();
  }

  isAtEnd() {
    return this.scanner_.isAtEnd();
  }

  /**
   * Returns true if the index-th next token is of the expected type. Does not consume any tokens.
   *
   * @param {TokenType} expectedType
   * @param {number=} opt_index
   * @return {boolean}
   * @private
   */
  peek_(expectedType, opt_index) {
    // Too hot for default parameters.
    return this.peekToken_(opt_index).type === expectedType;
  }

  /**
   * Returns the TokenType of the index-th next token. Does not consume any tokens.
   *
   * @return {TokenType}
   * @private
   */
  peekType_() {
    return this.peekToken_().type;
  }

  /**
   * Returns the index-th next token. Does not consume any tokens.
   *
   * @return {Token}
   * @private
   */
  peekToken_(opt_index) {
    // Too hot for default parameters.
    return this.scanner_.peekToken(opt_index);
  }

  /**
   * Returns the index-th next token. Does not allow any line terminator
   * before the next token. Does not consume any tokens. This returns null if
   * no token was found before the next line terminator.
   *
   * @return {Token}
   * @private
   */
  peekTokenNoLineTerminator_() {
    return this.scanner_.peekTokenNoLineTerminator();
  }

  /**
   * Reports an error message at a given token.
   * @param {traceur.util.SourcePostion|Token} token The location to report
   *     the message at.
   * @param {string} message The message to report in String.format style.
   *
   * @return {void}
   * @private
   */
  reportError_(var_args) {
    if (arguments.length == 1) {
      this.errorReporter_.reportError(this.scanner_.getPosition(),
                                      arguments[0]);
    } else {
      var location = arguments[0];
      if (location instanceof Token) {
        location = location.location;
      }
      this.errorReporter_.reportError(location.start, arguments[1]);
    }
  }

  reportReservedIdentifier_(token) {
    this.reportError_(token, `${token.type} is a reserved identifier`);
  }
}
