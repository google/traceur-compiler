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

'use strong';

import {FindVisitor} from '../codegeneration/FindVisitor.js';
import {IdentifierToken} from './IdentifierToken.js';
import {
  ARRAY_LITERAL_EXPRESSION,
  BINDING_IDENTIFIER,
  BLOCK,
  BREAK_STATEMENT,
  CALL_EXPRESSION,
  COMPUTED_PROPERTY_NAME,
  CONTINUE_STATEMENT,
  COVER_FORMALS,
  DEFAULT_CLAUSE,
  FORMAL_PARAMETER_LIST,
  IDENTIFIER_EXPRESSION,
  IF_STATEMENT,
  LITERAL_PROPERTY_NAME,
  OBJECT_LITERAL_EXPRESSION,
  REST_PARAMETER,
  RETURN_STATEMENT,
  SWITCH_STATEMENT,
  SYNTAX_ERROR_TREE,
  THROW_STATEMENT,
} from './trees/ParseTreeType.js';
import {Options} from '../Options.js';
import {
  AS,
  ASYNC,
  ASYNC_STAR,
  AWAIT,
  CONSTRUCTOR,
  EVAL,
  FROM,
  GET,
  OF,
  ON,
  SET,
  UNDEFINED
} from './PredefinedName.js';
import {SyntaxErrorReporter} from '../util/SyntaxErrorReporter.js';
import {Scanner} from './Scanner.js';
import {SourceRange} from '../util/SourceRange.js';
import {StrictParams} from '../staticsemantics/StrictParams.js';
import {StrongParams} from '../staticsemantics/StrongParams.js';

import {
  Token,
  isAssignmentOperator
} from './Token.js';
import {getKeywordType} from './Keywords.js';
import {validateConstructor} from '../semantics/ConstructorValidator.js';

import {
  AMPERSAND,
  AND,
  ARROW,
  AT,
  BANG,
  BAR,
  BREAK,
  CARET,
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
  LESS_EQUAL,
  LET,
  MINUS,
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
  PERIOD,
  PLUS,
  PLUS_PLUS,
  PRIVATE,
  PROTECTED,
  PUBLIC,
  QUESTION,
  RETURN,
  RIGHT_SHIFT,
  SEMI_COLON,
  SLASH,
  SLASH_EQUAL,
  STAR,
  STAR_STAR,
  STATIC,
  STRING,
  SUPER,
  SWITCH,
  TEMPLATE_HEAD,
  TEMPLATE_TAIL,
  THIS,
  THROW,
  TILDE,
  TRUE,
  TRY,
  TYPEOF,
  UNSIGNED_RIGHT_SHIFT,
  VAR,
  VOID,
  WHILE,
  WITH,
  YIELD
} from './TokenType.js';

import {
  ArgumentList,
  ArrayComprehension,
  ArrayLiteralExpression,
  ArrayPattern,
  ArrayType,
  ArrowFunctionExpression,
  AssignmentElement,
  AwaitExpression,
  BinaryExpression,
  BindingElement,
  BindingIdentifier,
  Block,
  BreakStatement,
  CallExpression,
  CallSignature,
  CaseClause,
  Catch,
  ClassDeclaration,
  ClassExpression,
  CommaExpression,
  ComprehensionFor,
  ComprehensionIf,
  ComputedPropertyName,
  ConditionalExpression,
  ConstructSignature,
  ConstructorType,
  ContinueStatement,
  CoverFormals,
  CoverInitializedName,
  DebuggerStatement,
  Annotation,
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
  ForOnStatement,
  ForStatement,
  FormalParameter,
  FormalParameterList,
  ForwardDefaultExport,
  FunctionBody,
  FunctionDeclaration,
  FunctionExpression,
  FunctionType,
  GeneratorComprehension,
  GetAccessor,
  IdentifierExpression,
  IfStatement,
  ImportClausePair,
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  ImportedBinding,
  IndexSignature,
  InterfaceDeclaration,
  LabelledStatement,
  LiteralExpression,
  LiteralPropertyName,
  MemberExpression,
  MemberLookupExpression,
  MethodSignature,
  Module,
  ModuleSpecifier,
  NameSpaceExport,
  NameSpaceImport,
  NamedExport,
  NewExpression,
  ObjectLiteralExpression,
  ObjectPattern,
  ObjectPatternField,
  ObjectType,
  ParenExpression,
  PostfixExpression,
  PredefinedType,
  PropertyMethodAssignment,
  PropertyNameAssignment,
  PropertyNameShorthand,
  PropertySignature,
  PropertyVariableDeclaration,
  RestParameter,
  ReturnStatement,
  Script,
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
  TypeArguments,
  TypeName,
  TypeParameter,
  TypeParameters,
  TypeReference,
  UnaryExpression,
  UnionType,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  WhileStatement,
  WithStatement,
  YieldExpression
}  from './trees/ParseTrees.js';
import {SLOPPY_MODE, STRICT_MODE, STRONG_MODE} from '../staticsemantics/LanguageMode.js';

/**
 * Differentiates between parsing for 'In' vs. 'NoIn'
 * Variants of expression grammars.
 */
const ALLOW_IN = true;
const NO_IN = false;

/**
 * Enum for determining if the initializer is needed in a variable declaration
 * with a destructuring pattern.
 */
const INITIALIZER_REQUIRED = true;
const INITIALIZER_OPTIONAL = false;

/**
 * Used to find invalid CoverInitializedName trees. This is used when we know
 * the tree is not going to be used as a pattern.
 */
class ValidateObjectLiteral extends FindVisitor {
  constructor() {
    super();
    this.errorToken = null;
  }

  visitCoverInitializedName(tree) {
    this.errorToken = tree.equalToken;
    this.found = true;
  }
}

/**
 * @param {Array.<VariableDeclaration>} declarations
 * @return {boolean}
 */
function containsInitializer(declarations) {
  return declarations.some((v) => v.initializer);
}

const FUNCTION_STATE_SCRIPT = 1;
const FUNCTION_STATE_MODULE = 1 << 1;
const FUNCTION_STATE_FUNCTION = 1 << 2;
const FUNCTION_STATE_ARROW = 1 << 3;
const FUNCTION_STATE_METHOD = 1 << 4;
const FUNCTION_STATE_DERIVED_CONSTRUCTOR = 1 << 5;
const FUNCTION_STATE_GENERATOR = 1 << 6;
const FUNCTION_STATE_ASYNC = 1 << 7;

const FUNCTION_STATE_LENIENT =
    FUNCTION_STATE_METHOD | FUNCTION_STATE_GENERATOR |
    FUNCTION_STATE_ASYNC | FUNCTION_STATE_DERIVED_CONSTRUCTOR;

/**
 * This is used to track the functions as the parser descends. It allows
 * us to determine if we are in a function and what kind of function it is.
 * This is used to determine if `return` and `super` are allowed.
 */
class FunctionState {
  constructor(outer, kind) {
    this.outer = outer;
    this.kind = kind;
  }

  isTopMost() {
    return this.kind & (FUNCTION_STATE_SCRIPT | FUNCTION_STATE_MODULE);
  }

  isMethod() {
    return this.kind & FUNCTION_STATE_METHOD;
  }

  isDerivedConstructor() {
    return this.kind & FUNCTION_STATE_DERIVED_CONSTRUCTOR;
  }

  isArrowFunction() {
    return this.kind & FUNCTION_STATE_ARROW;
  }

  isGenerator() {
    return this.kind & FUNCTION_STATE_GENERATOR;
  }

  isAsyncFunction() {
    return this.kind & FUNCTION_STATE_ASYNC;
  }

  isAsyncGenerator() {
    return this.kind & (FUNCTION_STATE_ASYNC | FUNCTION_STATE_GENERATOR);
  }
}

/**
 * Parses a javascript file.
 *
 * The various this.parseX_() methods never return null - even when parse errors
 * are encountered.Typically this.parseX_() will return a XTree ParseTree. Each
 * ParseTree that is created includes its source location. The typical pattern
 * for a this.parseX_() method is:
 *
 * XTree this.parseX_() {
 *   let start = this.getTreeStartLocation_();
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
 *   let elements = [];
 *   while (this.peekListElement_()) {
 *     elements.push(this.parseListElement_());
 *   }
 *   this.eat_(LIST_END);
 */
export class Parser {
  /**
   * @param {SourceFile} file
   * @param {ErrorReporter} errorReporter
   * @param {Options} options
   */
  constructor(file, errorReporter = new SyntaxErrorReporter(),
      options = new Options()) {
    this.errorReporter_ = errorReporter;
    this.scanner_ = new Scanner(errorReporter, file, this, options);
    this.options_ = options;

    // This is used in conjunction with ensureNoCoverInitializedNames_ to
    // determine  if there has been any added CoverInitializedName since last
    // time this was read.
    this.coverInitializedNameCount_ = 0;

    this.languageMode_ = SLOPPY_MODE;
    this.annotations_ = [];

    // TODO(arv): Use function state to track strict mode.
    this.functionState_ = null;
  }

  get allowYield_() {
    return this.functionState_.isGenerator();
  }

  get allowAwait_() {
    return this.functionState_.isAsyncFunction();
  }

  get allowForOn_() {
    return this.functionState_.isAsyncGenerator();
  }

  /**
   * Sets the language mode, ensuring that we can only make it stricter.
   */
  restrictLanguageMode_(mode) {
    if (mode > this.languageMode_) {
      this.languageMode_ = mode;
    }
  }

  isStrictMode_() {
    return this.languageMode_ >= STRICT_MODE;
  }

  isStrongMode_() {
    return this.options_.strongMode && this.languageMode_ === STRONG_MODE;
  }

  // 14 Script
  /**
   * @return {Script}
   */
  parseScript() {
    this.languageMode_ = SLOPPY_MODE;
    let start = this.getTreeStartLocation_();
    let fs = this.pushFunctionState_(FUNCTION_STATE_SCRIPT);
    let scriptItemList = this.parseStatementList_(true);
    this.eat_(END_OF_FILE);
    this.popFunctionState_(fs);
    return new Script(this.getTreeLocation_(start), scriptItemList, null);
  }

  pushFunctionState_(kind) {
    return this.functionState_ = new FunctionState(this.functionState_, kind);
  }

  popFunctionState_(fs) {
    if (fs !== this.functionState_) {
      throw new Error('Internal error');
    }
    this.functionState_ = this.functionState_.outer;
  }

  // StatementList :
  //   StatementListItem
  //   StatementList StatementListItem

  /**
   * @param {boolean} checkDirective
   * @return {Array.<ParseTree>}
   * @private
   */
  parseStatementList_(checkDirective) {
    let result = [];
    let type;

    // We do a lot of type assignment in loops like these for performance
    // reasons.
    while ((type = this.peekType_()) !== CLOSE_CURLY && type !== END_OF_FILE) {
      let statement = this.parseStatementListItem_(type);
      if (checkDirective) {
        checkDirective = this.checkDirective_(statement);
      }
      result.push(statement);
    }
    return result;
  }

  checkDirective_(statement) {
    if (!statement.isDirectivePrologue()) {
      return false;
    } else if (statement.isUseStrictDirective()) {
      this.restrictLanguageMode_(STRICT_MODE);
      return false;
    } else if (this.options_.strongMode &&
               statement.isUseStrongDirective()) {
      this.restrictLanguageMode_(STRONG_MODE);
      return false;
    }
    return true;
  }

  // ScriptItem :
  //   ImportDeclaration
  //   StatementListItem

  /**
   * @return {ParseTree}
   * @private
   */
  parseStatementListItem_(type) {
    // Declaration
    switch (type) {
      case LET:
      case CONST:
        if (this.options_.blockBinding) {
          return this.parseVariableStatement_();
        }
        break;

      case CLASS:
        if (this.options_.classes) {
          return this.parseClassDeclaration_();
        }
        break;

      case FUNCTION:
        return this.parseFunctionDeclaration_();
    }

    // Statement
    return this.parseStatementWithType_(type);
  }

  parseModule() {
    let start = this.getTreeStartLocation_();
    let fs = this.pushFunctionState_(FUNCTION_STATE_MODULE);
    let scriptItemList = this.parseModuleItemList_();
    this.eat_(END_OF_FILE);
    this.popFunctionState_(fs);
    return new Module(this.getTreeLocation_(start), scriptItemList, null);
  }

  parseModuleItemList_() {
    this.languageMode_ = STRICT_MODE;
    let result = [];
    let type;
    let checkDirective = true;

    while ((type = this.peekType_()) !== END_OF_FILE) {
      let statement = this.parseModuleItem_(type);
      if (checkDirective) {
        checkDirective = this.checkDirective_(statement);
      }
      result.push(statement);
    }
    return result;
  }

  parseModuleItem_(type) {
    switch (type) {
      case IMPORT:
        return this.parseImportDeclaration_();
      case EXPORT:
        return this.parseExportDeclaration_();
      case AT:
        if (this.options_.annotations)
          return this.parseAnnotatedDeclarations_(true);
        break;
    }
    return this.parseStatementListItem_(type);
  }

  parseModuleSpecifier_() {
    // ModuleSpecifier :
    //   StringLiteral
    let start = this.getTreeStartLocation_();
    let token = this.eat_(STRING);
    return new ModuleSpecifier(this.getTreeLocation_(start), token);
  }

  // ClassDeclaration
  // ImportDeclaration
  // ExportDeclaration
  // Statement (other than BlockStatement)
  // FunctionDeclaration

  // ImportDeclaration ::= "import" ImportDeclaration

  /**
   * @return {NameSpaceImport}
   */
  parseNameSpaceImport_() {
    let start = this.getTreeStartLocation_();
    this.eat_(STAR);
    this.eatId_(AS);
    let binding = this.parseImportedBinding_();
    return new NameSpaceImport(this.getTreeLocation_(start), binding);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseImportDeclaration_() {
    let start = this.getTreeStartLocation_();
    this.eat_(IMPORT);

    let importClause = null;
    if (!this.peek_(STRING)) {
      importClause = this.parseImportClause_(true);
      this.eatId_(FROM);
    }
    let moduleSpecifier = this.parseModuleSpecifier_();
    this.eatPossibleImplicitSemiColon_();
    return new ImportDeclaration(this.getTreeLocation_(start),
                                 importClause, moduleSpecifier);
  }

  parseImportClause_(allowImportedDefaultBinding) {
    switch (this.peekType_()) {
      case STAR:
        return this.parseNameSpaceImport_();
      case OPEN_CURLY:
        return this.parseImportSpecifierSet_();
      case IDENTIFIER:
        if (allowImportedDefaultBinding) {
          let start = this.getTreeStartLocation_();
          let importedBinding = this.parseImportedBinding_();
          if (this.eatIf_(COMMA)) {
            let second = this.parseImportClause_(false);
            return new ImportClausePair(this.getTreeLocation_(start),
                                        importedBinding, second);
          }
          return importedBinding;
        }
        break;
    }
    return this.parseUnexpectedToken_(this.peekToken_());
  }

  // https://bugs.ecmascript.org/show_bug.cgi?id=2287
  // ImportClause :
  //   ImportedBinding
  //   NamedImports

  parseImportSpecifierSet_() {
    let start = this.getTreeStartLocation_();
    let specifiers = [];
    this.eat_(OPEN_CURLY);
    while (!this.peek_(CLOSE_CURLY) && !this.isAtEnd()) {
      specifiers.push(this.parseImportSpecifier_());
      if (!this.eatIf_(COMMA))
        break;
    }
    this.eat_(CLOSE_CURLY);

    return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers);
  }

  parseImportedBinding_() {
    let start = this.getTreeStartLocation_();
    let binding = this.parseBindingIdentifier_();
    return new ImportedBinding(this.getTreeLocation_(start), binding);
  }

  // ImportSpecifier ::= IdentifierName ("as" Identifier)?
  //                     Identifier "as" Identifier
  /**
   * @return {ParseTree}
   * @private
   */
  parseImportSpecifier_() {
    let start = this.getTreeStartLocation_();
    let token = this.peekToken_();
    let isKeyword = token.isKeyword();
    let binding;
    let name = this.eatIdName_();
    if (isKeyword || this.peekPredefinedString_(AS)) {
      this.eatId_(AS);
      binding = this.parseImportedBinding_();
    } else {
      this.checkForStrongUndefinedBinding_(name);
      binding = new ImportedBinding(name.location,
          new BindingIdentifier(name.location, name));
      name = null;
    }
    return new ImportSpecifier(this.getTreeLocation_(start), binding, name);
  }

  // export VariableStatement
  // export FunctionDeclaration
  // export ConstStatement
  // export ClassDeclaration

  /**
   * @return {ParseTree}
   * @private
   */
  parseExportDeclaration_() {
    let start = this.getTreeStartLocation_();
    this.eat_(EXPORT);
    let exportTree;
    let annotations = this.popAnnotations_();
    let type = this.peekType_();
    switch (type) {
      case CONST:
      case LET:
        if (this.options_.blockBinding) {
          exportTree = this.parseVariableStatement_();
          break;
        }
        return this.parseUnexpectedToken_(this.peekToken_());
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
      case IDENTIFIER:
        if (this.options_.asyncFunctions && this.peekPredefinedString_(ASYNC)) {
          let asyncToken = this.eatId_();
          exportTree = this.parseAsyncFunctionDeclaration_(asyncToken);
        } else if (this.options_.exportFromExtended) {
          exportTree = this.parseNamedExport_();
        }
        break;
      default:
        return this.parseUnexpectedToken_(this.peekToken_());
    }
    return new ExportDeclaration(this.getTreeLocation_(start), exportTree,
                                 annotations);
  }

  parseExportDefault_() {
    // export default [lookahead ∉ {function, class, from}] AssignmentExpression[In] ;
    // export default AssignmentExpression ;
    let start = this.getTreeStartLocation_();
    let defaultToken = this.eat_(DEFAULT);
    if (this.options_.exportFromExtended && this.peekPredefinedString_(FROM)) {
      let idName = new IdentifierToken(defaultToken.location, DEFAULT);
      let namedExport = new ForwardDefaultExport(this.getTreeLocation_(start), idName);
      this.eatId_(FROM);
      let moduleSpecifier = this.parseModuleSpecifier_();

      return new NamedExport(this.getTreeLocation_(start), namedExport, moduleSpecifier);
    }

    let exportValue;
    switch (this.peekType_()) {
      case FUNCTION: {
        // Use FunctionExpression as a cover grammar. If it has a name it is
        // treated as a declaration.
        let tree = this.parseFunctionExpression_();
        if (tree.name) {
          tree = new FunctionDeclaration(tree.location, tree.name,
                                         tree.functionKind, tree.parameterList,
                                         tree.typeAnnotation, tree.annotations,
                                         tree.body);
        }
        exportValue = tree;
        break;
      }
      case CLASS: {
        if (!this.options_.classes) {
          return this.parseSyntaxError_('Unexpected reserved word');
        }

        // Use ClassExpression as a cover grammar. If it has a name it is
        // treated as a declaration.
        let tree = this.parseClassExpression_();
        if (tree.name) {
          tree = new ClassDeclaration(tree.location, tree.name,
                                      tree.superClass, tree.elements,
                                      tree.annotations, tree.typeParameters);
        }
        exportValue = tree;
        break;
      }
      default:
        exportValue = this.parseAssignmentExpression_(ALLOW_IN);
        this.eatPossibleImplicitSemiColon_();
    }

    return new ExportDefault(this.getTreeLocation_(start), exportValue);
  }

  parseNamedExport_() {
    // NamedExport ::=
    //   "*" "from" ModuleSpecifier
    //   ExportSpecifierSet
    //   "*" "from" ModuleSpecifier
    //   "*" "as" Identifier "from" ModuleSpecifier
    //   Identifier "from" ModuleSpecifier
    let start = this.getTreeStartLocation_();
    let exportClause, moduleSpecifier = null;

    switch (this.peekType_()) {
      case OPEN_CURLY:
        exportClause = this.parseExportSpecifierSet_();
        if (this.peekPredefinedString_(FROM)) {
          this.eatId_(FROM);
          moduleSpecifier = this.parseModuleSpecifier_();
        } else {
          // When there is no `from` the left hand side may not be a keyword
          // since it references a local binding.
          //
          //   export {notAKeyword as keywordOK};
          //
          this.validateExportSpecifierSet_(exportClause);
        }
        break;

      case IDENTIFIER:
        exportClause = this.parseForwardDefaultExport_();
        this.eatId_(FROM);
        moduleSpecifier = this.parseModuleSpecifier_();
        break;

      case STAR:
        exportClause = this.parseExportStar_();
        this.eatId_(FROM);
        moduleSpecifier = this.parseModuleSpecifier_();
        break;
    }

    this.eatPossibleImplicitSemiColon_();

    return new NamedExport(this.getTreeLocation_(start), exportClause,
                           moduleSpecifier);
  }

  parseExportStar_() {
    // *
    // * as IdentiferName
    let start = this.getTreeStartLocation_();
    this.eat_(STAR);
    if (this.peekPredefinedString_(AS)) {
      this.eatId_(AS);
      let name = this.eatIdName_();
      return new NameSpaceExport(this.getTreeLocation_(start), name);
    }
    return new ExportStar(this.getTreeLocation_(start));
  }

  parseExportSpecifierSet_() {
    // ExportSpecifierSet ::=
    //     "{" ExportSpecifier ("," ExportSpecifier)* ","? "}"

    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_CURLY);
    let specifiers = [this.parseExportSpecifier_()];
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
    // ExportSpecifier ::= IdentifierName
    //     | IdentifierName "as" IdentifierName

    let start = this.getTreeStartLocation_();
    let lhs = this.eatIdName_();
    let rhs = null;
    if (this.peekPredefinedString_(AS)) {
      this.eatId_();
      rhs = this.eatIdName_();
    }
    return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
  }

  parseForwardDefaultExport_() {
    // export IdentifierName from 'module'
    let start = this.getTreeStartLocation_();
    let idName = this.eatIdName_();
    return new ForwardDefaultExport(this.getTreeLocation_(start), idName);
  }

  validateExportSpecifierSet_(tree) {
    for (let i = 0; i < tree.specifiers.length; i++) {
      let specifier = tree.specifiers[i];
      // These are represented as IdentifierTokens because we used eatIdName.
      if (getKeywordType(specifier.lhs.value)) {
        this.reportError_(specifier.lhs.location,
            `Unexpected token ${specifier.lhs.value}`);
      }
    }
  }

  peekId_(type) {
    if (type === IDENTIFIER)
      return true;
    if (this.isStrictMode_())
      return false;
    return this.peekToken_().isStrictKeyword();
  }

  peekIdName_(token) {
    return token.type === IDENTIFIER || token.isKeyword();
  }

  parseClassShared_(constr) {
    let start = this.getTreeStartLocation_();
    let languageMode = this.languageMode_;
    this.restrictLanguageMode_(STRICT_MODE);
    this.eat_(CLASS);
    let name = null;
    let typeParameters = null;
    let annotations = [];
    // Name is optional for ClassExpression
    if (constr === ClassDeclaration ||
        !this.peek_(EXTENDS) && !this.peek_(OPEN_CURLY)) {
      name = this.parseBindingIdentifier_();
      if (this.options_.types) {
        typeParameters = this.parseTypeParametersOpt_();
      }
      annotations = this.popAnnotations_();
    }
    let superClass = null;
    if (this.eatIf_(EXTENDS)) {
      superClass = this.parseLeftHandSideExpression_();
      superClass = this.coverFormalsToParenExpression_(superClass);
    }
    this.eat_(OPEN_CURLY);
    let elements = this.parseClassElements_(superClass);
    this.eat_(CLOSE_CURLY);
    this.languageMode_ = languageMode;
    return new constr(this.getTreeLocation_(start), name, superClass,
                      elements, annotations, typeParameters);
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
  parseClassElements_(derivedClass) {
    let result = [];

    while (true) {
      let type = this.peekType_();
      if (type === SEMI_COLON) {
        this.nextToken_();
      } else if (this.peekClassElement_(this.peekType_())) {
        result.push(this.parseClassElement_(derivedClass));
      } else {
        break;
      }
    }

    return result;
  }

  peekClassElement_(type) {
    // PropertyName covers get, set and static too.
    return this.peekPropertyName_(type) ||
        type === STAR && this.options_.generators ||
        type === AT && this.options_.annotations;
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
    let start = this.getTreeStartLocation_();
    let token = this.nextToken_();
    return new LiteralPropertyName(this.getTreeLocation_(start), token);
  }

  // ComputedPropertyName :
  //   [ AssignmentExpression ]
  parseComputedPropertyName_() {
    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_SQUARE);
    let expression = this.parseAssignmentExpression_(ALLOW_IN);
    this.eat_(CLOSE_SQUARE);

    return new ComputedPropertyName(this.getTreeLocation_(start), expression);
  }

  /**
   * Parses a single statement. This statement might be a top level statement
   * in a Script or a Module as well as any other statement allowed in a
   * FunctionBody.
   * @return {ParseTree}
   */
  parseStatement() {
    // Allow return, yield and await.
    let fs = this.pushFunctionState_(FUNCTION_STATE_LENIENT);
    let result = this.parseModuleItem_(this.peekType_());
    this.popFunctionState_(fs);
    return result;
  }

  /**
   * Parses one or more statements. These might be top level statements in a
   * Script or a Module as well as any other statement allowed in a
   * FunctionBody.
   * @return {Array.<ParseTree>}
   */
  parseStatements() {
    // Allow return, yield and await.
    let fs = this.pushFunctionState_(FUNCTION_STATE_LENIENT);
    let result = this.parseModuleItemList_();
    this.popFunctionState_(fs);
    return result;
  }

  parseStatement_() {
    return this.parseStatementWithType_(this.peekType_());
  }

  parseSubStatement_() {
    let type = this.peekType_();
    if (type === SEMI_COLON && this.isStrongMode_()) {
      this.reportError_('Empty sub statements are not allowed in strong mode.' +
                        ' Please use {} instead.');
    }
    return this.parseStatementWithType_(type);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseStatementWithType_(type) {
    switch (type) {
      // Most common first (based on building Traceur).
      case RETURN:
        return this.parseReturnStatement_();
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

      // Rest are just alphabetical order.
      case AT:
        if (this.options_.annotations)
          return this.parseAnnotatedDeclarations_(false);
        break;
      case CONTINUE:
        return this.parseContinueStatement_();
      case DEBUGGER:
        return this.parseDebuggerStatement_();
      case DO:
        return this.parseDoWhileStatement_();
      case OPEN_CURLY:
        return this.parseBlock_();
      case SEMI_COLON:
        return this.parseEmptyStatement_();
      case TRY:
        return this.parseTryStatement_();
      case WITH:
        return this.parseWithStatement_();
      case INTERFACE:
        // TODO(arv): This should only be allowed at the top level.
        if (this.options_.types) {
          return this.parseInterfaceDeclaration_();
        }
    }
    return this.parseFallThroughStatement_();
  }

  // 13 Function Definition
  /**
   * @return {ParseTree}
   * @private
   */
  parseFunctionDeclaration_() {
    return this.parseFunction_(FunctionDeclaration);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseFunctionExpression_() {
    return this.parseFunction_(FunctionExpression);
  }

  parseAsyncFunctionDeclaration_(asyncToken) {
    return this.parseAsyncFunction_(asyncToken, FunctionDeclaration);
  }

  parseAsyncFunctionExpression_(asyncToken) {
    return this.parseAsyncFunction_(asyncToken, FunctionExpression);
  }

  parseAsyncFunction_(asyncToken, ctor) {
    let start = asyncToken.location.start;
    this.eat_(FUNCTION);
    let kind = FUNCTION_STATE_FUNCTION | FUNCTION_STATE_ASYNC;
    if (this.options_.asyncGenerators && this.peek_(STAR)) {
      kind |= FUNCTION_STATE_GENERATOR;
      this.eat_(STAR);
      asyncToken = new IdentifierToken(asyncToken.location, ASYNC_STAR);
    }
    let fs = this.pushFunctionState_(kind);
    let f = this.parseFunction2_(start, asyncToken, ctor);
    this.popFunctionState_(fs);
    return f;
  }

  parseFunction_(ctor) {
    let start = this.getTreeStartLocation_();
    this.eat_(FUNCTION);
    let functionKind = null;
    let kind = FUNCTION_STATE_FUNCTION;
    if (this.options_.generators && this.peek_(STAR)) {
      functionKind = this.eat_(STAR);
      kind |= FUNCTION_STATE_GENERATOR;
    }
    let fs = this.pushFunctionState_(kind);
    let f = this.parseFunction2_(start, functionKind, ctor);
    this.popFunctionState_(fs);
    return f;
  }

  parseFunction2_(start, functionKind, ctor) {
    let name = null;
    let annotations = [];
    if (ctor === FunctionDeclaration ||
        this.peekBindingIdentifier_(this.peekType_())) {
      name = this.parseBindingIdentifier_();
      annotations = this.popAnnotations_();
    }

    this.eat_(OPEN_PAREN);
    let parameters = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);

    let typeAnnotation = this.parseTypeAnnotationOpt_();
    let body = this.parseFunctionBody_(parameters);
    return new ctor(this.getTreeLocation_(start), name, functionKind,
                    parameters, typeAnnotation, annotations, body);
  }

  peekRest_(type) {
    return type === DOT_DOT_DOT && this.options_.restParameters;
  }

  /**
   * @return {FormalParameterList}
   * @private
   */
  parseFormalParameters_() {
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
    //   BindingPattern Initializeropt
    let start = this.getTreeStartLocation_();
    let formals = [];
    this.pushAnnotations_();
    let type = this.peekType_();
    if (this.peekRest_(type)) {
      formals.push(this.parseFormalRestParameter_());
    } else {
      if (this.peekFormalParameter_(this.peekType_()))
        formals.push(this.parseFormalParameter_(INITIALIZER_OPTIONAL));

      while (this.eatIf_(COMMA)) {
        this.pushAnnotations_();
        if (this.peekRest_(this.peekType_())) {
          formals.push(this.parseFormalRestParameter_());
          break;
        }
        formals.push(this.parseFormalParameter_(INITIALIZER_OPTIONAL));
      }
    }

    return new FormalParameterList(this.getTreeLocation_(start), formals);
  }

  peekFormalParameter_(type) {
    return this.peekBindingElement_(type);
  }

  parseFormalParameter_(initializerAllowed) {
    let start = this.getTreeStartLocation_();
    let binding = this.parseBindingElementBinding_();
    let typeAnnotation = this.parseTypeAnnotationOpt_();
    let initializer = this.parseBindingElementInitializer_(initializerAllowed);

    return new FormalParameter(this.getTreeLocation_(start),
        new BindingElement(this.getTreeLocation_(start), binding, initializer),
        typeAnnotation, this.popAnnotations_());
  }

  parseFormalRestParameter_() {
    let start = this.getTreeStartLocation_();
    let restParameter = this.parseRestParameter_();
    let typeAnnotation = this.parseTypeAnnotationOpt_();
    return new FormalParameter(this.getTreeLocation_(start), restParameter,
        typeAnnotation, this.popAnnotations_());
  }

  parseRestParameter_() {
    let start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    let id = this.parseBindingIdentifier_();
    let typeAnnotation = this.parseTypeAnnotationOpt_();
    return new RestParameter(this.getTreeLocation_(start), id, typeAnnotation);
  }

  /**
   * @return {Block}
   * @private
   */
  parseFunctionBody_(params) {
    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_CURLY);

    let languageMode = this.languageMode_;
    let result = this.parseStatementList_(languageMode < STRONG_MODE);

    if (!languageMode) {
      if (this.isStrongMode_()) {
        StrongParams.visit(params, this.errorReporter_);
      } else if (this.isStrictMode_()) {
        StrictParams.visit(params, this.errorReporter_);
      }
    }

    this.languageMode_ = languageMode;

    this.eat_(CLOSE_CURLY);
    return new FunctionBody(this.getTreeLocation_(start), result);
  }

  /**
   * @return {SpreadExpression}
   * @private
   */
  parseSpreadExpression_() {
    let start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    let operand = this.parseAssignmentExpression_(ALLOW_IN);
    return new SpreadExpression(this.getTreeLocation_(start), operand);
  }

  // 12.1 Block
  /**
   * @return {Block}
   * @private
   */
  parseBlock_() {
    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_CURLY);
    let result = this.parseStatementList_(false);
    this.eat_(CLOSE_CURLY);
    return new Block(this.getTreeLocation_(start), result);
  }

  // 12.2 Variable Statement
  /**
   * @return {VariableStatement}
   * @private
   */
  parseVariableStatement_() {
    let start = this.getTreeStartLocation_();
    let declarations =
        this.parseVariableDeclarationList_(ALLOW_IN, INITIALIZER_REQUIRED);
    this.checkInitializers_(declarations);
    this.eatPossibleImplicitSemiColon_();
    return new VariableStatement(this.getTreeLocation_(start), declarations);
  }

  /**
   * @param {boolean} allowIn
   * @param {boolean} initializerRequired Whether destructuring requires an
   *     initializer
   * @return {VariableDeclarationList}
   * @private
   */
  parseVariableDeclarationList_(allowIn, initializerRequired) {
    let type = this.peekType_();

    switch (type) {
      case CONST:
      case LET:
      case VAR:
        this.nextToken_();
        break;
      default:
        throw Error('unreachable');
    }

    if (this.isStrongMode_() && type === VAR) {
      this.reportError_('var is not allowed in strong mode. ' +
                        'Please use let or const instead.');
    }

    let start = this.getTreeStartLocation_();
    let declarations = [];

    declarations.push(this.parseVariableDeclaration_(type, allowIn,
                                                     initializerRequired));
    while (this.eatIf_(COMMA)) {
      declarations.push(this.parseVariableDeclaration_(type, allowIn,
                                                       initializerRequired));
    }
    return new VariableDeclarationList(
        this.getTreeLocation_(start), type, declarations);
  }

  /**
   * VariableDeclaration :
   *   BindingIdentifier Initializeropt
   *   BindingPattern Initializer
   *
   * VariableDeclarationNoIn :
   *   BindingIdentifier InitializerNoInopt
   *   BindingPattern InitializerNoIn
   *
   * @param {TokenType} binding
   * @param {boolean} noIn
   * @param {boolean} initializerRequired
   * @return {VariableDeclaration}
   * @private
   */
  parseVariableDeclaration_(binding, noIn, initializerRequired) {
    let initRequired = initializerRequired !== INITIALIZER_OPTIONAL;
    let start = this.getTreeStartLocation_();

    let lvalue;
    let typeAnnotation;
    if (this.peekPattern_(this.peekType_())) {
      lvalue = this.parseBindingPattern_();
      typeAnnotation = null;
    } else {
      lvalue = this.parseBindingIdentifier_();
      typeAnnotation = this.parseTypeAnnotationOpt_();
    }

    let init = null;
    if (this.peek_(EQUAL))
      init = this.parseInitializer_(noIn);
    else if (lvalue.isPattern() && initRequired)
      this.reportError_('destructuring must have an initializer');

    return new VariableDeclaration(this.getTreeLocation_(start), lvalue,
        typeAnnotation, init);
  }

  /**
   * @param {boolean} allowIn
   * @return {ParseTree}
   * @private
   */
  parseInitializer_(allowIn) {
    this.eat_(EQUAL);
    return this.parseAssignmentExpression_(allowIn);
  }

  parseInitializerOpt_(allowIn) {
    if (this.eatIf_(EQUAL))
      return this.parseAssignmentExpression_(allowIn);
    return null;
  }

  // 12.3 Empty Statement
  /**
   * @return {EmptyStatement}
   * @private
   */
  parseEmptyStatement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(SEMI_COLON);
    return new EmptyStatement(this.getTreeLocation_(start));
  }

  /**
   * @return {ExpressionStatement|LabelledStatement}
   * @private
   */
  parseFallThroughStatement_() {
    // ExpressionStatement :
    //   [lookahead ∉ {{, function, class, let [}] Expression ;

    let start = this.getTreeStartLocation_();
    let expression;

    switch (this.peekType_()) {
      case OPEN_CURLY:
        return this.parseUnexpectedToken_(this.peekToken_());
      case FUNCTION:
      case CLASS:
        return this.parseUnexpectedReservedWord_(this.peekToken_());
      case LET:
        if (this.peekLookahead_(OPEN_SQUARE)) {
          return this.parseSyntaxError_(
              `A statement cannot start with 'let ['`);
        }
    }

    // async [no line terminator] function ...
    if (this.options_.asyncFunctions && this.peekPredefinedString_(ASYNC) &&
        this.peekLookahead_(FUNCTION)) {
      // TODO(arv): This look ahead should not be needed.
      let asyncToken = this.eatId_();
      let functionToken = this.peekTokenNoLineTerminator_();
      if (functionToken !== null)
        return this.parseAsyncFunctionDeclaration_(asyncToken);

      expression = new IdentifierExpression(this.getTreeLocation_(start),
                                            asyncToken);
    } else {
      expression = this.parseExpression_(ALLOW_IN);
    }

    if (expression.type === IDENTIFIER_EXPRESSION) {
      // 12.12 Labelled Statement
      if (this.eatIf_(COLON)) {
        let nameToken = expression.identifierToken;
        let statement = this.parseStatement_();
        return new LabelledStatement(this.getTreeLocation_(start), nameToken,
                                     statement);
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
    let start = this.getTreeStartLocation_();
    this.eat_(IF);
    this.eat_(OPEN_PAREN);
    let condition = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    let ifClause = this.parseSubStatement_();
    let elseClause = null;
    if (this.eatIf_(ELSE)) {
      elseClause = this.parseSubStatement_();
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
    let start = this.getTreeStartLocation_();
    this.eat_(DO);
    let body = this.parseSubStatement_();
    this.eat_(WHILE);
    this.eat_(OPEN_PAREN);
    let condition = this.parseExpression_(ALLOW_IN);
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
    let start = this.getTreeStartLocation_();
    this.eat_(WHILE);
    this.eat_(OPEN_PAREN);
    let condition = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    let body = this.parseSubStatement_();
    return new WhileStatement(this.getTreeLocation_(start), condition, body);
  }

  // 12.6.3 The for Statement
  // 12.6.4 The for-in Statement
  // https://github.com/jhusain/asyncgenerator
  /**
   * @return {ParseTree}
   * @private
   */
  parseForStatement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(FOR);
    this.eat_(OPEN_PAREN);

    let type = this.peekType_();
    if (this.peekVariableDeclarationList_(type)) {
      let variables = this.parseVariableDeclarationList_(NO_IN,
                                                         INITIALIZER_OPTIONAL);

      let declarations = variables.declarations;
      if (declarations.length > 1 || containsInitializer(declarations)) {
        return this.parseForStatement2_(start, variables);
      }

      type = this.peekType_();
      if (type === IN) {
        return this.parseForInStatement_(start, variables);
      } else if (this.peekOf_()) {
        return this.parseForOfStatement_(start, variables);
      } else if (this.allowForOn_ && this.peekOn_()) {
        return this.parseForOnStatement_(start, variables);
      } else {
        // for statement: const must have initializers
        this.checkInitializers_(variables);
        return this.parseForStatement2_(start, variables);
      }
    }

    if (type === SEMI_COLON) {
      return this.parseForStatement2_(start, null);
    }

    let coverInitializedNameCount = this.coverInitializedNameCount_;
    let initializer = this.parseExpressionAllowPattern_(NO_IN);
    type = this.peekType_();
    if (initializer.isLeftHandSideExpression() &&
        (type === IN || this.peekOf_() ||
         this.allowForOn_ && this.peekOn_())) {
      initializer = this.transformLeftHandSideExpression_(initializer);
      if (this.peekOf_()) {
        return this.parseForOfStatement_(start, initializer);
      } else if (this.allowForOn_ && this.peekOn_()) {
        return this.parseForOnStatement_(start, initializer);
      }
      return this.parseForInStatement_(start, initializer);
    }

    this.ensureNoCoverInitializedNames_(initializer, coverInitializedNameCount);

    return this.parseForStatement2_(start, initializer);
  }

  peekOf_() {
    return this.options_.forOf && this.peekPredefinedString_(OF);
  }

  peekOn_() {
    return this.options_.forOn && this.peekPredefinedString_(ON);
  }

  // The for-each Statement
  // for  (  { let | let | const }  identifier  of  expression  )  statement
  /**
   * @param {SourcePosition} start
   * @param {ParseTree} initializer
   * @return {ParseTree}
   * @private
   */
  parseForOfStatement_(start, initializer) {
    this.eatId_(); // of
    let collection = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    let body = this.parseSubStatement_();
    return new ForOfStatement(this.getTreeLocation_(start), initializer,
                              collection, body);
  }

  // The for-on Statement
  // for  (  { let | let | const }  identifier  on  expression  )  statement
  /**
   * @param {SourcePosition} start
   * @param {ParseTree} initializer
   * @return {ParseTree}
   * @private
   */
  parseForOnStatement_(start, initializer) {
    this.eatId_(); // on
    let observable = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    let body = this.parseSubStatement_();
    return new ForOnStatement(this.getTreeLocation_(start), initializer,
                              observable, body);
  }

  /**
   * Checks variable declaration in variable and for statements.
   *
   * @param {VariableDeclarationList} variables
   * @return {void}
   * @private
   */
  checkInitializers_(variables) {
    if (this.options_.blockBinding &&
        variables.declarationType === CONST) {
      let type = variables.declarationType;
      for (let i = 0; i < variables.declarations.length; i++) {
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
    if (this.options_.blockBinding && type === CONST &&
        declaration.initializer === null) {
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
        return this.options_.blockBinding;
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

    let condition = null;
    if (!this.peek_(SEMI_COLON)) {
      condition = this.parseExpression_(ALLOW_IN);
    }
    this.eat_(SEMI_COLON);

    let increment = null;
    if (!this.peek_(CLOSE_PAREN)) {
      increment = this.parseExpression_(ALLOW_IN);
    }
    this.eat_(CLOSE_PAREN);
    let body = this.parseSubStatement_();
    return new ForStatement(this.getTreeLocation_(start), initializer,
                            condition, increment, body);
  }

  // 12.6.4 The for-in Statement
  /**
   * @param {SourcePosition} start
   * @param {ParseTree} initializer
   * @return {ParseTree}
   * @private
   */
  parseForInStatement_(start, initializer) {
    if (this.isStrongMode_()) {
      this.reportError_('for in loops are not allowed in strong mode');
    }
    this.eat_(IN);
    let collection = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    let body = this.parseSubStatement_();
    return new ForInStatement(this.getTreeLocation_(start), initializer,
                              collection, body);
  }

  // 12.7 The continue Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseContinueStatement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(CONTINUE);
    let name = null;
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
    let start = this.getTreeStartLocation_();
    this.eat_(BREAK);
    let name = null;
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
    let start = this.getTreeStartLocation_();
    if (this.functionState_.isTopMost()) {
      this.reportError_('Illegal return statement');
    }
    this.eat_(RETURN);
    let expression = null;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      expression = this.parseExpression_(ALLOW_IN);
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
    let start = this.getTreeStartLocation_();
    this.eat_(YIELD);
    let expression = null;
    let isYieldFor = false;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      isYieldFor = this.eatIf_(STAR);
      expression = this.parseAssignmentExpression_(ALLOW_IN);
    }

    return new YieldExpression(
        this.getTreeLocation_(start), expression, isYieldFor);
  }

  // 12.10 The with Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseWithStatement_() {
    if (this.isStrictMode_())
      this.reportError_('Strict mode code may not include a with statement');

    let start = this.getTreeStartLocation_();
    this.eat_(WITH);
    this.eat_(OPEN_PAREN);
    let expression = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    let body = this.parseSubStatement_();
    return new WithStatement(this.getTreeLocation_(start), expression, body);
  }

  // 12.11 The switch Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseSwitchStatement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(SWITCH);
    this.eat_(OPEN_PAREN);
    let expression = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    this.eat_(OPEN_CURLY);
    let caseClauses = this.parseCaseClauses_();
    this.eat_(CLOSE_CURLY);
    return new SwitchStatement(
        this.getTreeLocation_(start), expression, caseClauses);
  }

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseCaseClauses_() {
    let foundDefaultClause = false;
    let clauses = [];

    loop: while (true) {
      let start = this.getTreeStartLocation_();
      switch (this.peekType_()) {
        case CASE: {
          this.nextToken_();
          let expression = this.parseExpression_(ALLOW_IN);
          this.eat_(COLON);
          let statements = this.parseCaseStatementsOpt_();
          clauses.push(new CaseClause(this.getTreeLocation_(start),
                                      expression, statements));
          break;
        }
        case DEFAULT: {
          if (foundDefaultClause) {
            this.reportError_(
                'Switch statements may have at most one default clause');
          } else {
            foundDefaultClause = true;
          }
          this.nextToken_();
          this.eat_(COLON);
          let statements = this.parseCaseStatementsOpt_();
          clauses.push(
              new DefaultClause(this.getTreeLocation_(start), statements));
          break;
        }
        default:
          break loop;
      }
    }

    if (clauses.length <= 1 || !this.isStrongMode_()) {
      return clauses;
    }

    // Strong mode - All but last clause must end with break, continue,
    // return or throw.

    function isValid(tree, breakOk) {
      switch (tree.type) {
        case BREAK_STATEMENT:
          // TODO(arv): break label should be sufficient depending on the label.
          return breakOk;
        case RETURN_STATEMENT:
        case THROW_STATEMENT:
        case CONTINUE_STATEMENT:
          return true;
        case IF_STATEMENT:
          return isValid(tree.ifClause, breakOk) &&
                 tree.elseClause !== null && isValid(tree.elseClause, breakOk);
        case BLOCK:
          return tree.statements.length > 0 &&
              isValid(tree.statements[tree.statements.length - 1], breakOk);
        case SWITCH_STATEMENT: {
          // Last statement is a switch. All branches must exit. There must be
          // a default too.
          let clauses = tree.caseClauses;
          if (clauses.length === 0) {
            return false;
          }
          let foundDefaultClause = false;
          let foundExit = false;
          for (let i = 0; i < clauses.length; i++) {
            let clause = clauses[i];
            if (clause.type === DEFAULT_CLAUSE) {
              foundDefaultClause = true;  // Duplicate default already handled.
            }
            let statements = clause.statements;
            if (statements.length === 0) {
              if (i === clauses.length - 1) {
                // Last clause is not allowed to be fall through here.
                return false;
              }
              continue;
            }
            let lastStatement = statements[statements.length - 1];
            if (isValid(lastStatement, false)) {  // break is not sufficient.
              foundExit = true;
            } else {
              return false;
            }
          }
          return foundDefaultClause && foundExit;
        }
        default:
          return false;
      }
    }

    for (let i = 0; i < clauses.length - 1; i++) {
      let clause = clauses[i];
      if (clause.statements.length === 0) {
        // Empty clause is allowed.
        continue;
      }
      let lastStatement = clause.statements[clause.statements.length - 1];
      if (!isValid(lastStatement, true)) {
        this.reportError_(clauses[i + 1].location,
                          'Fall through is not allowed in strong mode');
      }
    }

    return clauses;
  }

  /**
   * @return {Array.<ParseTree>}
   * @private
   */
  parseCaseStatementsOpt_() {
    // CaseClause :
    //   case Expression : StatementList
    let result = [];
    let type;
    while (true) {
      switch (type = this.peekType_()) {
        case CASE:
        case DEFAULT:
        case CLOSE_CURLY:
        case END_OF_FILE:
          return result;
      }
      if (this.isStrongMode_()) {
        result.push(this.parseStatementWithType_(type));
      } else {
        result.push(this.parseStatementListItem_(type));
      }
    }
  }

  // 12.13 Throw Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseThrowStatement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(THROW);
    let value = null;
    if (!this.peekImplicitSemiColon_(this.peekType_())) {
      value = this.parseExpression_(ALLOW_IN);
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
    let start = this.getTreeStartLocation_();
    this.eat_(TRY);
    let body = this.parseBlock_();
    let catchBlock = null;
    if (this.peek_(CATCH)) {
      catchBlock = this.parseCatch_();
    }
    let finallyBlock = null;
    if (this.peek_(FINALLY)) {
      finallyBlock = this.parseFinallyBlock_();
    }
    if (catchBlock === null && finallyBlock === null) {
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
    let start = this.getTreeStartLocation_();
    let catchBlock;
    this.eat_(CATCH);
    this.eat_(OPEN_PAREN);
    let binding;
    if (this.peekPattern_(this.peekType_()))
      binding = this.parseBindingPattern_();
    else
      binding = this.parseBindingIdentifier_();
    this.eat_(CLOSE_PAREN);
    let catchBody = this.parseBlock_();
    catchBlock = new Catch(this.getTreeLocation_(start), binding,
                           catchBody);
    return catchBlock;
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parseFinallyBlock_() {
    let start = this.getTreeStartLocation_();
    this.eat_(FINALLY);
    let finallyBlock = this.parseBlock_();
    return new Finally(this.getTreeLocation_(start), finallyBlock);
  }

  // 12.15 The Debugger Statement
  /**
   * @return {ParseTree}
   * @private
   */
  parseDebuggerStatement_() {
    let start = this.getTreeStartLocation_();
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
        return this.options_.classes ?
            this.parseClassExpression_() :
            this.parseUnexpectedReservedWord_(this.peekToken_());
      case THIS:
        return this.parseThisExpression_();
      case IDENTIFIER: {
        let identifier = this.parseIdentifierExpression_();
        if (this.options_.asyncFunctions &&
            identifier.identifierToken.value === ASYNC) {
          let token = this.peekTokenNoLineTerminator_();
          if (token && token.type === FUNCTION) {
            let asyncToken = identifier.identifierToken;
            return this.parseAsyncFunctionExpression_(asyncToken);
          }
        }
        return identifier;
      }
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
        return this.parsePrimaryExpressionStartingWithParen_();
      case SLASH:
      case SLASH_EQUAL:
        return this.parseRegularExpressionLiteral_();
      case NO_SUBSTITUTION_TEMPLATE:
      case TEMPLATE_HEAD:
        if (this.options_.templateLiterals) {
          return this.parseTemplateLiteral_(null);
        }
        break;

      case IMPLEMENTS:
      case INTERFACE:
      case PACKAGE:
      case PRIVATE:
      case PROTECTED:
      case PUBLIC:
      case STATIC:
      case YIELD:
        if (this.isStrictMode_()) {
          this.reportReservedIdentifier_(this.nextToken_());
        }
        return this.parseIdentifierExpression_();

      case END_OF_FILE:
        return this.parseSyntaxError_('Unexpected end of input');
    }

    let token = this.peekToken_();
    if (token.isKeyword()) {
      return this.parseUnexpectedReservedWord_(token);
    }
    return this.parseUnexpectedToken_(token);
  }

  /**
   * @return {SuperExpression}
   * @private
   */
  parseSuperExpression_(isNew) {
    let start = this.getTreeStartLocation_();

    let fs = this.functionState_;
    while (fs && fs.isArrowFunction()) {
      fs = fs.outer;
    }
    if (!fs || !fs.isMethod()) {
      return this.parseSyntaxError_('super is only allowed in methods');
    }

    this.eat_(SUPER);
    let operand = new SuperExpression(this.getTreeLocation_(start));
    let type = this.peekType_();
    if (isNew) {
      // new super() is not allowed so we require a PERIOD or an OPEN_SQUARE.
      if (type === OPEN_SQUARE) {
        return this.parseMemberLookupExpression_(start, operand);
      }
      return this.parseMemberExpression_(start, operand);
    }

    switch (type) {
      case OPEN_SQUARE:
        return this.parseMemberLookupExpression_(start, operand);
      case PERIOD:
        return this.parseMemberExpression_(start, operand);
      case OPEN_PAREN: {
        let superCall = this.parseCallExpression_(start, operand);
        if (!fs.isDerivedConstructor()) {
          this.errorReporter_.reportError(start,
            'super call is only allowed in derived constructor');
        }
        return superCall;
      }
    }

    return this.parseUnexpectedToken_(this.peekToken_());
  }

  /**
   * @return {ThisExpression}
   * @private
   */
  parseThisExpression_() {
    let start = this.getTreeStartLocation_();
    this.eat_(THIS);
    return new ThisExpression(this.getTreeLocation_(start));
  }

  peekBindingIdentifier_(type) {
    return this.peekId_(type);
  }

  parseBindingIdentifier_() {
    let start = this.getTreeStartLocation_();
    let identifier = this.eatId_();
    this.checkForStrongUndefinedBinding_(identifier);
    return new BindingIdentifier(this.getTreeLocation_(start), identifier);
  }

  checkForStrongUndefinedBinding_(identifier) {
    if (this.isStrongMode_() && identifier.value === UNDEFINED) {
      this.reportError_(
          identifier.location,
          'In strong mode, binding or assigning to undefined is deprecated');
    }
  }

  /**
   * @return {IdentifierExpression}
   * @private
   */
  parseIdentifierExpression_() {
    let start = this.getTreeStartLocation_();
    let identifier = this.eatId_();
    return new IdentifierExpression(this.getTreeLocation_(start), identifier);
  }

  /**
   * Special case of parseIdentifierExpression_ which allows keywords.
   * @return {IdentifierExpression}
   * @private
   */
  parseIdentifierNameExpression_() {
    let start = this.getTreeStartLocation_();
    let identifier = this.eatIdName_();
    return new IdentifierExpression(this.getTreeLocation_(start), identifier);
  }

  /**
   * @return {LiteralExpression}
   * @private
   */
  parseLiteralExpression_() {
    let start = this.getTreeStartLocation_();
    let literal = this.nextLiteralToken_();
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
    let start = this.getTreeStartLocation_();
    let literal = this.nextRegularExpressionLiteralToken_();
    return new LiteralExpression(this.getTreeLocation_(start), literal);
  }

  peekSpread_(type) {
    return type === DOT_DOT_DOT && this.options_.spread;
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
    let start = this.getTreeStartLocation_();
    let expression;
    let elements = [];

    this.eat_(OPEN_SQUARE);

    let type = this.peekType_();
    if (type === FOR && this.options_.arrayComprehension)
      return this.parseArrayComprehension_(start);

    while (true) {
      type = this.peekType_();
      if (type === COMMA) {
        if (this.isStrongMode_()) {
          this.reportError_('Arrays with holes are not supported in strong ' +
                            'mode. Please use a Map instead.');
        }
        expression = null;
      } else if (this.peekSpread_(type)) {
        expression = this.parseSpreadExpression_();
      } else if (type === CLOSE_SQUARE || type === END_OF_FILE) {
        break;
      } else {
        expression = this.parseAssignmentExpression_(ALLOW_IN);
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
    let list = this.parseComprehensionList_();
    let expression = this.parseAssignmentExpression_(ALLOW_IN);
    this.eat_(CLOSE_SQUARE);
    return new ArrayComprehension(this.getTreeLocation_(start),
                                  list, expression);
  }

  parseComprehensionList_() {
    // Must start with for (...)
    let list = [this.parseComprehensionFor_()];
    while (true) {
      let type = this.peekType_();
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
    let start = this.getTreeStartLocation_();
    this.eat_(FOR);
    this.eat_(OPEN_PAREN);
    let left = this.parseForBinding_();
    this.eatId_(OF);
    let iterator = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    return new ComprehensionFor(this.getTreeLocation_(start), left, iterator);
  }

  parseComprehensionIf_() {
    let start = this.getTreeStartLocation_();
    this.eat_(IF);
    this.eat_(OPEN_PAREN);
    let expression = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_PAREN);
    return new ComprehensionIf(this.getTreeLocation_(start), expression);
  }

  // 11.1.4 Object Literal Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseObjectLiteral_() {
    let start = this.getTreeStartLocation_();
    let result = [];

    this.eat_(OPEN_CURLY);
    while (this.peekPropertyDefinition_(this.peekType_())) {
      let propertyDefinition = this.parsePropertyDefinition_();
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
   *   CoverInitializedName
   *   PropertyName : AssignmentExpression
   *   MethodDefinition
   */
  parsePropertyDefinition() {
    let fs = this.pushFunctionState_(FUNCTION_STATE_SCRIPT);
    let result = this.parsePropertyDefinition_();
    this.popFunctionState_(fs);
    return result;
  }
  parsePropertyDefinition_() {
    let start = this.getTreeStartLocation_();

    let functionKind = null;
    let isStatic = false;

    if (this.options_.generators && this.options_.propertyMethods &&
        this.peek_(STAR)) {
      let fs = this.pushFunctionState_(
          FUNCTION_STATE_METHOD | FUNCTION_STATE_GENERATOR);
      let m = this.parseGeneratorMethod_(start, isStatic, []);
      this.popFunctionState_(fs);
      return m;
    }

    let token = this.peekToken_();
    let name = this.parsePropertyName_();

    if (this.options_.propertyMethods && this.peek_(OPEN_PAREN)) {
      let fs = this.pushFunctionState_(FUNCTION_STATE_METHOD);
      let m = this.parseMethod_(start, isStatic, functionKind, name, []);
      this.popFunctionState_(fs);
      return m;
    }

    if (this.eatIf_(COLON)) {
      let value = this.parseAssignmentExpression_(ALLOW_IN);
      return new PropertyNameAssignment(this.getTreeLocation_(start), name,
                                        value);
    }

    let type = this.peekType_();
    if (name.type === LITERAL_PROPERTY_NAME) {
      let nameLiteral = name.literalToken;
      if (nameLiteral.value === GET &&
          this.peekPropertyName_(type)) {
        return this.parseGetAccessor_(start, isStatic, []);
      }

      if (nameLiteral.value === SET &&
          this.peekPropertyName_(type)) {
        return this.parseSetAccessor_(start, isStatic, []);
      }

      if (this.options_.asyncFunctions && nameLiteral.value === ASYNC &&
          this.peekPropertyName_(type)) {
        let async = nameLiteral;
        let name = this.parsePropertyName_();
        let fs = this.pushFunctionState_(
            FUNCTION_STATE_METHOD | FUNCTION_STATE_ASYNC);
        let m = this.parseMethod_(start, isStatic, async, name, []);
        this.popFunctionState_(fs);
        return m;
      }

      if (this.options_.propertyNameShorthand &&
          (nameLiteral.type === IDENTIFIER ||
           nameLiteral.isStrictKeyword() && !this.isStrictMode_() ||
           nameLiteral.type === YIELD && this.allowYield_)) {

        if (this.peek_(EQUAL)) {
          token = this.nextToken_();
          let coverInitializedNameCount = this.coverInitializedNameCount_;
          let expr = this.parseAssignmentExpression_(ALLOW_IN);
          this.ensureNoCoverInitializedNames_(expr, coverInitializedNameCount);

          this.coverInitializedNameCount_++;
          return new CoverInitializedName(this.getTreeLocation_(start),
                                          nameLiteral, token, expr);
        }

        return new PropertyNameShorthand(this.getTreeLocation_(start),
                                         nameLiteral);
      }

      if (this.isStrictMode_() && nameLiteral.isStrictKeyword())
        this.reportReservedIdentifier_(nameLiteral);
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
  parseClassElement_(derivedClass) {
    let start = this.getTreeStartLocation_();

    let annotations = this.parseAnnotations_();
    let type = this.peekType_();
    let isStatic = false, functionKind = null;
    switch (type) {
      case STATIC: {
        let staticToken = this.nextToken_();
        type = this.peekType_();
        switch (type) {
          case OPEN_PAREN: {
            let location = this.getTreeLocation_(start);
            let name = new LiteralPropertyName(location, staticToken);
            let fs = this.pushFunctionState_(FUNCTION_STATE_METHOD);
            let m = this.parseMethod_(start, isStatic, functionKind, name,
                                      annotations);
            this.popFunctionState_(fs);
            return m;
          }
          default:
            isStatic = true;
            if (type === STAR && this.options_.generators)
              return this.parseGeneratorMethod_(start, true, annotations);

            return this.parseClassElement2_(start, isStatic, annotations,
                                            derivedClass);
        }
        break;
      }

      case STAR:
        return this.parseGeneratorMethod_(start, isStatic, annotations);

      default:
        return this.parseClassElement2_(start, isStatic, annotations,
                                        derivedClass);
    }
  }

  parseGeneratorMethod_(start, isStatic, annotations) {
    let functionKind = this.eat_(STAR);
    let name = this.parsePropertyName_();
    let fs = this.pushFunctionState_(
        FUNCTION_STATE_METHOD | FUNCTION_STATE_GENERATOR);
    let m = this.parseMethod_(start, isStatic, functionKind, name, annotations);
    this.popFunctionState_(fs);
    return m;
  }

  parseMethod_(start, isStatic, functionKind, name, annotations) {
    this.eat_(OPEN_PAREN);
    let parameterList = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);
    let typeAnnotation = this.parseTypeAnnotationOpt_();
    let body = this.parseFunctionBody_(parameterList);
    return new PropertyMethodAssignment(this.getTreeLocation_(start),
        isStatic, functionKind, name, parameterList, typeAnnotation,
        annotations, body, null);
  }

  parsePropertyVariableDeclaration_(start, isStatic, name, annotations) {
    let typeAnnotation = this.parseTypeAnnotationOpt_();
    let initializer = this.parseInitializerOpt_(ALLOW_IN);
    this.eat_(SEMI_COLON);
    return new PropertyVariableDeclaration(this.getTreeLocation_(start),
        isStatic, name, typeAnnotation, annotations, initializer);
  }

  parseClassElement2_(start, isStatic, annotations, derivedClass) {
    let functionKind = null;
    let name = this.parsePropertyName_();
    let type = this.peekType_();

    // TODO(arv): Can we unify this with parsePropertyDefinition_?

    if (name.type === LITERAL_PROPERTY_NAME &&
        name.literalToken.value === GET &&
        this.peekPropertyName_(type)) {
      return this.parseGetAccessor_(start, isStatic, annotations);
    }

    if (name.type === LITERAL_PROPERTY_NAME &&
        name.literalToken.value === SET &&
        this.peekPropertyName_(type)) {
      return this.parseSetAccessor_(start, isStatic, annotations);
    }

    if (this.options_.asyncFunctions &&
        name.type === LITERAL_PROPERTY_NAME &&
        name.literalToken.value === ASYNC &&
        this.peekPropertyName_(type)) {
      let async = name.literalToken;
      name = this.parsePropertyName_();
      let fs = this.pushFunctionState_(
          FUNCTION_STATE_METHOD | FUNCTION_STATE_ASYNC);
      let m = this.parseMethod_(start, isStatic, async, name, annotations);
      this.popFunctionState_(fs);
      return m;
    }

    if (!this.options_.memberVariables || type === OPEN_PAREN) {
      let kind = FUNCTION_STATE_METHOD;
      let isDerivedConstructor = derivedClass && !isStatic &&
          functionKind === null && name.type === LITERAL_PROPERTY_NAME &&
          name.literalToken.value === CONSTRUCTOR;
      if (isDerivedConstructor) {
        kind |= FUNCTION_STATE_DERIVED_CONSTRUCTOR;
      }
      let fs = this.pushFunctionState_(kind);
      let m =
          this.parseMethod_(start, isStatic, functionKind, name, annotations);
      this.popFunctionState_(fs);
      if (isDerivedConstructor) {
        validateConstructor(m, this.errorReporter_);
      }
      return m;
    }

    return this.parsePropertyVariableDeclaration_(start, isStatic, name, annotations);
  }

  parseGetAccessor_(start, isStatic, annotations) {
    let name = this.parsePropertyName_();
    let fs = this.pushFunctionState_(FUNCTION_STATE_METHOD);
    this.eat_(OPEN_PAREN);
    this.eat_(CLOSE_PAREN);
    let typeAnnotation = this.parseTypeAnnotationOpt_();
    let body = this.parseFunctionBody_(null);
    this.popFunctionState_(fs);
    return new GetAccessor(this.getTreeLocation_(start), isStatic, name,
                           typeAnnotation, annotations, body);
  }

  parseSetAccessor_(start, isStatic, annotations) {
    let name = this.parsePropertyName_();
    let fs = this.pushFunctionState_(FUNCTION_STATE_METHOD);
    this.eat_(OPEN_PAREN);
    let parameterList = this.parsePropertySetParameterList_();
    this.eat_(CLOSE_PAREN);
    let body = this.parseFunctionBody_(parameterList);
    this.popFunctionState_(fs);
    return new SetAccessor(this.getTreeLocation_(start), isStatic, name,
                           parameterList, annotations, body);
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPropertyDefinition_(type) {
    return this.peekPropertyName_(type) ||
        type === STAR && this.options_.propertyMethods && this.options_.generators;
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
        return this.options_.computedPropertyNames;
      default:
        return this.peekToken_().isKeyword();
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPredefinedString_(string) {
    let token = this.peekToken_();
    return token.type === IDENTIFIER && token.value === string;
  }

  /**
   * PropertySetParameterList :
   *   BindingIdentifier
   *   BindingPattern
   */
  parsePropertySetParameterList_() {
    let start = this.getTreeStartLocation_();

    let binding;
    this.pushAnnotations_();
    if (this.peekPattern_(this.peekType_()))
      binding = this.parseBindingPattern_();
    else
      binding = this.parseBindingIdentifier_();

    let typeAnnotation = this.parseTypeAnnotationOpt_();
    let parameter = new FormalParameter(this.getTreeLocation_(start),
        new BindingElement(this.getTreeLocation_(start), binding, null),
        typeAnnotation, this.popAnnotations_());

    return new FormalParameterList(parameter.location, [parameter]);
  }

  /**
   * @return {ParseTree}
   * @private
   */
  parsePrimaryExpressionStartingWithParen_() {
    let start = this.getTreeStartLocation_();

    this.eat_(OPEN_PAREN);

    if (this.peek_(FOR) && this.options_.generatorComprehension)
      return this.parseGeneratorComprehension_(start);

    return this.parseCoverFormals_(start);
  }

  parseSyntaxError_(message) {
    let start = this.getTreeStartLocation_();
    this.reportError_(message);
    let token = this.nextToken_();
    return new SyntaxErrorTree(this.getTreeLocation_(start), token, message);
  }

  /**
   * @param {Token} token
   * @return {SyntaxErrorTree}
   */
  parseUnexpectedToken_(token) {
    if (token.type === NO_SUBSTITUTION_TEMPLATE) {
        return this.parseSyntaxError_('Unexpected token `');
    }
    return this.parseSyntaxError_(`Unexpected token ${token}`);
  }

  /**
   * @param {Token} token
   * @return {SyntaxErrorTree}
   */
  parseUnexpectedReservedWord_(token) {
    return this.parseSyntaxError_(`Unexpected reserved word ${token}`);
  }

  // 11.14 Expressions

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
  parseExpression_(allowIn) {
    let coverInitializedNameCount = this.coverInitializedNameCount_;
    let expression = this.parseExpressionAllowPattern_(allowIn);
    this.ensureNoCoverInitializedNames_(expression, coverInitializedNameCount);
    return expression;
  }

  parseExpression() {
    let fs = this.pushFunctionState_(FUNCTION_STATE_LENIENT);
    let expression = this.parseExpression_(ALLOW_IN);
    this.popFunctionState_(fs);
    return expression;
  }

  parseExpressionAllowPattern_(allowIn) {
    let start = this.getTreeStartLocation_();
    let expression = this.parseAssignmentExpression_(allowIn);
    if (this.peek_(COMMA)) {
      let expressions = [expression];
      while (this.eatIf_(COMMA)) {
        expressions.push(this.parseAssignmentExpression_(allowIn));
      }
      return new CommaExpression(this.getTreeLocation_(start), expressions);
    }

    return expression;
  }

  // 11.13 Assignment expressions

  /**
   * AssignmentExpression :
   *   ConditionalExpression
   *   YieldExpression
   *   ArrowFunction
   *   AsyncArrowFunction
   *   LeftHandSideExpression = AssignmentExpression
   *   LeftHandSideExpression AssignmentOperator AssignmentExpression
   *
   * AssignmentExpressionNoIn :
   *   ConditionalExpressionNoIn
   *   YieldExpression
   *   ArrowFunction
   *   AsyncArrowFunction
   *   LeftHandSideExpression = AssignmentExpressionNoIn
   *   LeftHandSideExpression AssignmentOperator AssignmentExpressionNoIn
   *
   * @param {boolean} allowIn
   * @return {ParseTree}
   */
  parseAssignmentExpression_(allowIn) {
    if (this.allowYield_ && this.peek_(YIELD))
      return this.parseYieldExpression_();

    let start = this.getTreeStartLocation_();

    let validAsyncParen = false;

    if (this.options_.asyncFunctions && this.peekPredefinedString_(ASYNC)) {
      let asyncToken = this.peekToken_();
      let maybeOpenParenToken = this.peekTokenLookahead_();
      validAsyncParen = maybeOpenParenToken.type === OPEN_PAREN &&
          asyncToken.location.end.line ===
              maybeOpenParenToken.location.start.line;
    }

    let left = this.parseConditional_(allowIn);
    let type = this.peekType_();

    if (this.options_.asyncFunctions && left.type === IDENTIFIER_EXPRESSION &&
        left.identifierToken.value === ASYNC && type === IDENTIFIER) {
      if (this.peekTokenNoLineTerminator_() !== null) {
        let bindingIdentifier = this.parseBindingIdentifier_();
        let asyncToken = left.identifierToken;
        return this.parseArrowFunction_(start, bindingIdentifier,
            asyncToken);
      }
    }

    if (type === ARROW && this.peekTokenNoLineTerminator_() !== null) {
      if (left.type === COVER_FORMALS || left.type === IDENTIFIER_EXPRESSION)
        return this.parseArrowFunction_(start, left, null);

      if (validAsyncParen && left.type === CALL_EXPRESSION) {
        let asyncToken = left.operand.identifierToken;
        return this.parseArrowFunction_(start, left.args, asyncToken);
      }
    }

    left = this.coverFormalsToParenExpression_(left);

    if (this.peekAssignmentOperator_(type)) {
      if (type === EQUAL) {
        left = this.transformLeftHandSideExpression_(left);
      }

      if (!left.isLeftHandSideExpression() && !left.isPattern()) {
        this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
      }

      if (left.type === IDENTIFIER_EXPRESSION) {
        this.checkForStrongUndefinedBinding_(left.identifierToken);
      }

      let operator = this.nextToken_();
      let right = this.parseAssignmentExpression_(allowIn);

      return new BinaryExpression(this.getTreeLocation_(start), left, operator, right);
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
        this.scanner_.index = tree.location.start.offset;
        // If we fail to parse as an AssignmentPattern then
        // parseAssignmentPattern_ will take care reporting errors.
        return this.parseAssignmentPattern_();
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
   * @param {boolean} allowIn
   * @return {ParseTree}
   * @private
   */
  parseConditional_(allowIn) {
    let start = this.getTreeStartLocation_();
    let condition = this.parseBinaryExpression_(allowIn);
    if (this.eatIf_(QUESTION)) {
      condition = this.toPrimaryExpression_(condition);
      let left = this.parseAssignmentExpression_(ALLOW_IN);
      this.eat_(COLON);
      let right = this.parseAssignmentExpression_(allowIn);
      return new ConditionalExpression(this.getTreeLocation_(start),
          condition, left, right);
    }
    return condition;
  }

  getPrecedence_(type, allowIn) {
    switch (type) {
      case OR:
        return 1;
      case AND:
        return 2;
      case BAR:
        return 3;
      case CARET:
        return 4;
      case AMPERSAND:
        return 5;
      case EQUAL_EQUAL:
      case NOT_EQUAL:
        if (this.isStrongMode_()) {
        this.reportError_(this.peekToken_().location,
                          `${type} is not allowed in strong mode`);
        }
        return 6;
      case EQUAL_EQUAL_EQUAL:
      case NOT_EQUAL_EQUAL:
        return 6;
      case CLOSE_ANGLE:
      case GREATER_EQUAL:
      case INSTANCEOF:
      case LESS_EQUAL:
      case OPEN_ANGLE:
        return 7;
      case IN:
        return allowIn ? 7 : 0;
      case LEFT_SHIFT:
      case RIGHT_SHIFT:
      case UNSIGNED_RIGHT_SHIFT:
        return 8;
      case MINUS:
      case PLUS:
        return 9;
      case SLASH:
      case STAR:
      case PERCENT:
        return 10;
      case STAR_STAR:
        return this.options_.exponentiation ? 11 : 0;
      default:
        return 0;
    }
  }

  parseBinaryExpression_(allowIn) {
    let start = this.getTreeStartLocation_();
    let left = this.parseUnaryExpression_();
    return this.parseBinaryExpressionHelper_(start, left, -1, allowIn);
  }

  parseBinaryExpressionHelper_(start, left, minPrec, allowIn) {
    let type = this.peekType_();
    let prec = this.getPrecedence_(type, allowIn);
    if (prec === 0) {
      return left;
    }

    // Only ** is right to left.
    let leftToRight = type !== STAR_STAR;

    if (leftToRight ? prec > minPrec : prec >= minPrec) {
      let token = this.nextToken_();  // Consumes the token.
      let rightStart = this.getTreeStartLocation_();
      let rightUnary = this.parseUnaryExpression_();
      let right = this.parseBinaryExpressionHelper_(rightStart, rightUnary,
                                                    prec, allowIn);

      left = this.toPrimaryExpression_(left);
      right = this.toPrimaryExpression_(right);
      let node = new BinaryExpression(this.getTreeLocation_(start), left, token,
                                      right);

      return this.parseBinaryExpressionHelper_(start, node, minPrec,
                                               allowIn);
    }
    return left;
  }

  // 11.4 Unary Operator
  /**
   * @return {ParseTree}
   * @private
   */
  parseUnaryExpression_() {
    let start = this.getTreeStartLocation_();

    if (this.allowAwait_ && this.peekPredefinedString_(AWAIT)) {
      this.eatId_();
      // no newline?

      let operand;
      if (this.allowYield_ && this.peek_(YIELD)) {
        operand = this.parseYieldExpression_();
      } else {
        operand = this.parseUnaryExpression_();
        operand = this.toPrimaryExpression_(operand);
      }
      return new AwaitExpression(this.getTreeLocation_(start), operand);
    }

    let type = this.peekType_();
    if (this.peekUnaryOperator_(type)) {
      let operator = this.nextToken_();
      if (type === DELETE && this.isStrongMode_()) {
        this.reportError_(operator, 'delete is not allowed in strong mode');
      }
      let operand = this.parseUnaryExpression_();
      operand = this.toPrimaryExpression_(operand);
      this.checkForStrongUndefinedPostPrefix_(type, operand);
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
    let start = this.getTreeStartLocation_();
    let operand = this.parseLeftHandSideExpression_();
    let type;
    while (this.peekPostfixOperator_(type = this.peekType_())) {
      operand = this.toPrimaryExpression_(operand);
      this.checkForStrongUndefinedPostPrefix_(type, operand);
      let operator = this.nextToken_();
      operand = new PostfixExpression(this.getTreeLocation_(start), operand, operator);
    }
    return operand;
  }

  checkForStrongUndefinedPostPrefix_(type, tree) {
    if ((type === PLUS_PLUS || type === MINUS_MINUS) &&
        tree.type === IDENTIFIER_EXPRESSION) {
      this.checkForStrongUndefinedBinding_(tree.identifierToken);
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  peekPostfixOperator_(type) {
    switch (type) {
      case PLUS_PLUS:
      case MINUS_MINUS: {
        let token = this.peekTokenNoLineTerminator_();
        return token !== null;
      }
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
    let start = this.getTreeStartLocation_();
    let operand = this.parseNewExpression_();

    // this test is equivalent to is member expression
    if (!(operand instanceof NewExpression) || operand.args !== null) {

      // The Call expression productions
      loop: while (true) {
        switch (this.peekType_()) {
          case OPEN_PAREN:
            operand = this.toPrimaryExpression_(operand);
            operand = this.parseCallExpression_(start, operand);
            break;

          case OPEN_SQUARE:
            operand = this.toPrimaryExpression_(operand);
            operand = this.parseMemberLookupExpression_(start, operand);
            break;

          case PERIOD:
            operand = this.toPrimaryExpression_(operand);
            operand = this.parseMemberExpression_(start, operand);
            break;

          case NO_SUBSTITUTION_TEMPLATE:
          case TEMPLATE_HEAD:
            if (!this.options_.templateLiterals)
              break loop;
            operand = this.toPrimaryExpression_(operand);
            if (this.options_.templateLiterals) {
              operand = this.parseTemplateLiteral_(operand);
            }
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
    let start = this.getTreeStartLocation_();
    let operand;
    if (this.peekType_() === FUNCTION) {
      operand = this.parseFunctionExpression_();
    } else {
      operand = this.parsePrimaryExpression_();
    }

    loop: while (true) {
      switch (this.peekType_()) {
        case OPEN_SQUARE:
          operand = this.toPrimaryExpression_(operand);
          operand = this.parseMemberLookupExpression_(start, operand);
          break;

        case PERIOD:
          operand = this.toPrimaryExpression_(operand);
          operand = this.parseMemberExpression_(start, operand);
          break;

        case NO_SUBSTITUTION_TEMPLATE:
        case TEMPLATE_HEAD:
          if (!this.options_.templateLiterals)
            break loop;
          operand = this.toPrimaryExpression_(operand);
          operand = this.parseTemplateLiteral_(operand);
          break;

        default:
          break loop;  // break out of loop.
      }
    }
    return operand;
  }

  parseMemberExpression_(start, operand) {
    this.eat_(PERIOD);
    let name = this.eatIdName_();
    return new MemberExpression(this.getTreeLocation_(start), operand, name);
  }

  parseMemberLookupExpression_(start, operand) {
    this.eat_(OPEN_SQUARE);
    let member = this.parseExpression_(ALLOW_IN);
    this.eat_(CLOSE_SQUARE);
    return new MemberLookupExpression(this.getTreeLocation_(start), operand,
                                      member);
  }

  parseCallExpression_(start, operand) {
    if (this.isStrongMode_() && operand.type === IDENTIFIER_EXPRESSION &&
        operand.identifierToken.value === EVAL) {
      this.reportError_(operand.location,
                        'Direct eval is not allowed in strong mode');
    }
    let args = this.parseArguments_();
    return new CallExpression(this.getTreeLocation_(start), operand, args);
  }

  // 11.2 New Expression
  /**
   * @return {ParseTree}
   * @private
   */
  parseNewExpression_() {
    let operand, start;
    switch (this.peekType_()) {
      case NEW: {
        start = this.getTreeStartLocation_();
        this.eat_(NEW);
        if (this.peek_(SUPER)) {
          operand = this.parseSuperExpression_(true);
        } else {
          operand = this.toPrimaryExpression_(this.parseNewExpression_());
        }
        let args = null;
        if (this.peek_(OPEN_PAREN)) {
          args = this.parseArguments_();
        }
        return new NewExpression(this.getTreeLocation_(start), operand, args);
      }

      case SUPER:
        return this.parseSuperExpression_(false);

      default:
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

    let start = this.getTreeStartLocation_();
    let args = [];

    this.eat_(OPEN_PAREN);

    if (!this.peek_(CLOSE_PAREN)) {
      args.push(this.parseArgument_());

      while (this.eatIf_(COMMA)) {
        args.push(this.parseArgument_());
      }
    }

    this.eat_(CLOSE_PAREN);
    return new ArgumentList(this.getTreeLocation_(start), args);
  }

  parseArgument_() {
    if (this.peekSpread_(this.peekType_()))
      return this.parseSpreadExpression_();
    return this.parseAssignmentExpression_(ALLOW_IN);
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
   *   ( ... BindingIdentifier )
   *   ( Expression , ... BindingIdentifier )
   *
   * ConciseBody :
   *   [lookahead not {] AssignmentExpression
   *   { FunctionBody }
   *
   *
   * @param {number} start
   * @param {ParseTree} tree
   * @param {Token}
   * @return {ParseTree}
   * @private
   */
  parseArrowFunction_(start, tree, asyncToken) {
    let formals;
    let kind = FUNCTION_STATE_ARROW;
    if (asyncToken && asyncToken.value === ASYNC) {
      kind |= FUNCTION_STATE_ASYNC;
    }
    let fs = this.pushFunctionState_(kind);
    let makeFormals = (tree) => {
      return new FormalParameterList(this.getTreeLocation_(start),
          [new FormalParameter(tree.location,
              new BindingElement(tree.location, tree, null), null, [])]);
    };
    switch (tree.type) {
      case IDENTIFIER_EXPRESSION:
        this.checkForStrongUndefinedBinding_(tree.identifierToken);
        formals = makeFormals(
              new BindingIdentifier(tree.location, tree.identifierToken));
        break;
      case BINDING_IDENTIFIER:
        formals = makeFormals(tree);
        break;
      case FORMAL_PARAMETER_LIST:
        formals = tree;
        break;
      default:
        formals = this.toFormalParameters_(start, tree, asyncToken);
    }

    this.eat_(ARROW);
    let body = this.parseConciseBody_(formals);
    this.popFunctionState_(fs);
    return new ArrowFunctionExpression(this.getTreeLocation_(start),
        asyncToken, formals, body);
  }

  parseCoverFormals_(start) {
    // CoverParenthesizedExpressionAndArrowParameterList :
    //   ( Expression )
    //   ()
    //   ( ... BindingIdentifier)
    //   (Expression, ... BindingIdentifier)
    //
    //   The leading OPEN_PAREN has already been consumed.

    let expressions = [];
    if (!this.peek_(CLOSE_PAREN)) {
      do {
        let type = this.peekType_();
        if (this.peekRest_(type)) {
          expressions.push(this.parseRestParameter_());
          break;
        } else {
          expressions.push(this.parseAssignmentExpression_(ALLOW_IN));
        }

        if (this.eatIf_(COMMA))
          continue;

      } while (!this.peek_(CLOSE_PAREN) && !this.isAtEnd())
    }

    this.eat_(CLOSE_PAREN);
    return new CoverFormals(this.getTreeLocation_(start), expressions);
  }

  ensureNoCoverInitializedNames_(tree, coverInitializedNameCount) {
    if (coverInitializedNameCount === this.coverInitializedNameCount_)
      return;

    let finder = new ValidateObjectLiteral();
    finder.visitAny(tree);
    if (finder.found) {
      let token = finder.errorToken;
      this.reportError_(token.location, `Unexpected token ${token}`);
    }
  }

  /**
   * When we have exhausted the cover grammar possibilities, this method
   * verifies the remaining grammar to produce a primary expression.
   */
  toPrimaryExpression_(tree) {
    if (tree.type === COVER_FORMALS)
      return this.coverFormalsToParenExpression_(tree);
    return tree;
  }

  validateCoverFormalsAsParenExpression_(tree) {
    for (let i = 0; i < tree.expressions.length; i++) {
      if (tree.expressions[i].type === REST_PARAMETER) {
        let token = new Token(DOT_DOT_DOT, tree.expressions[i].location);
        this.reportError_(token.location, `Unexpected token ${token}`);
        return;
      }
    }
  }

  coverFormalsToParenExpression_(tree) {
    if (tree.type === COVER_FORMALS) {
      let expressions = tree.expressions;
      if (expressions.length === 0) {
        let message = 'Unexpected token )';
        this.reportError_(tree.location, message);
      } else {
        this.validateCoverFormalsAsParenExpression_(tree);

        let expression;
        if (expressions.length > 1)
          expression = new CommaExpression(expressions[0].location, expressions);
        else
          expression = expressions[0];

        return new ParenExpression(tree.location, expression);
      }
    }

    return tree;
  }

  toFormalParameters_(start, tree, asyncToken) {
    this.scanner_.index = start.offset;
    return this.parseArrowFormalParameters_(asyncToken);
  }

  /**
   * ArrowFormalParameters[Yield, GeneratorParameter] :
   *   ( StrictFormalParameters[?Yield, ?GeneratorParameter] )
   */
  parseArrowFormalParameters_(asyncToken) {
    if (asyncToken)
      this.eat_(IDENTIFIER);
    this.eat_(OPEN_PAREN);
    let parameters = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);
    return parameters;
  }

  /** @returns {TokenType} */
  peekArrow_(type) {
    return type === ARROW && this.options_.arrowFunctions;
  }

  /**
   * ConciseBody :
   *   [lookahead not {] AssignmentExpression
   *   { FunctionBody }
   *
   * @param {ParseTree} params
   * @return {ParseTree}
   */
  parseConciseBody_(params) {
    // The body can be a block or an expression. A '{' is always treated as
    // the beginning of a block.
    if (this.peek_(OPEN_CURLY))
      return this.parseFunctionBody_(params);

    return this.parseAssignmentExpression_(ALLOW_IN);
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
    let comprehensionList = this.parseComprehensionList_();
    let expression = this.parseAssignmentExpression_(ALLOW_IN);
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
    return this.options_.destructuring && (this.peekObjectPattern_(type) ||
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
    return this.parsePattern_(true);
  }

  parsePattern_(useBinding) {
    if (this.peekArrayPattern_(this.peekType_()))
      return this.parseArrayPattern_(useBinding);
    return this.parseObjectPattern_(useBinding);
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
    return this.parseArrayPattern_(true);
  }

  parsePatternElement_(useBinding) {
    return useBinding ?
        this.parseBindingElement_() : this.parseAssignmentElement_();
  }

  parsePatternRestElement_(useBinding) {
    return useBinding ?
        this.parseBindingRestElement_() : this.parseAssignmentRestElement_();
  }

  parseArrayPattern_(useBinding) {
    let start = this.getTreeStartLocation_();
    let elements = [];
    this.eat_(OPEN_SQUARE);
    let type;
    while ((type = this.peekType_()) !== CLOSE_SQUARE && type !== END_OF_FILE) {
      this.parseElisionOpt_(elements);
      if (this.peekRest_(this.peekType_())) {
        elements.push(this.parsePatternRestElement_(useBinding));
        break;
      } else {
        elements.push(this.parsePatternElement_(useBinding));
        // Trailing commas are not allowed in patterns.
        if (this.peek_(COMMA) &&
            !this.peekLookahead_(CLOSE_SQUARE)) {
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
   *   BindingPattern Initializeropt
   *
   * SingleNameBinding :
   *   BindingIdentifier Initializeropt
   */
  peekBindingElement_(type) {
    return this.peekBindingIdentifier_(type) || this.peekPattern_(type);
  }

  /**
   * @return {ParseTree}
   */
  parseBindingElement_() {
    let start = this.getTreeStartLocation_();

    let binding = this.parseBindingElementBinding_();
    let initializer =
        this.parseBindingElementInitializer_(INITIALIZER_OPTIONAL);
    return new BindingElement(this.getTreeLocation_(start), binding,
        initializer);
  }

  parseBindingElementBinding_() {
    if (this.peekPattern_(this.peekType_()))
      return this.parseBindingPattern_();
    return this.parseBindingIdentifier_();
  }

  parseBindingElementInitializer_(initializerRequired) {
    if (this.peek_(EQUAL) || initializerRequired) {
      return this.parseInitializer_(ALLOW_IN);
    }

    return null;
  }

  /**
   * BindingRestElement :
   *   ... BindingIdentifier
   */
  parseBindingRestElement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    let identifier = this.parseBindingIdentifier_();
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
  parseObjectPattern_(useBinding) {
    let start = this.getTreeStartLocation_();
    let elements = [];
    this.eat_(OPEN_CURLY);
    let type;
    while ((type = this.peekType_()) !== CLOSE_CURLY && type !== END_OF_FILE) {
      elements.push(this.parsePatternProperty_(useBinding));
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
   *   BindingIdentifier Initializeropt
   */
  parsePatternProperty_(useBinding) {
    let start = this.getTreeStartLocation_();

    let name = this.parsePropertyName_();

    let requireColon = name.type !== LITERAL_PROPERTY_NAME ||
        !name.literalToken.isStrictKeyword() &&
        name.literalToken.type !== IDENTIFIER;
    if (requireColon || this.peek_(COLON)) {
      this.eat_(COLON);
      let element = this.parsePatternElement_(useBinding);
      // TODO(arv): Rename ObjectPatternField to BindingProperty
      return new ObjectPatternField(this.getTreeLocation_(start),
                                    name, element);
    }

    let token = name.literalToken;
    if (this.isStrictMode_() && token.isStrictKeyword()) {
      this.reportReservedIdentifier_(token);
    } else if (this.isStrongMode_()) {
      this.checkForStrongUndefinedBinding_(token);
    }

    if (useBinding) {
      let binding = new BindingIdentifier(name.location, token);
      let initializer = this.parseInitializerOpt_(ALLOW_IN);
      return new BindingElement(this.getTreeLocation_(start), binding,
                                initializer);
    }

    let assignment = new IdentifierExpression(name.location, token);
    let initializer = this.parseInitializerOpt_(ALLOW_IN);
    return new AssignmentElement(this.getTreeLocation_(start), assignment,
                                 initializer);
  }

  parseAssignmentPattern_() {
    return this.parsePattern_(false);
  }

  /**
   * ArrayAssignmentPattern[Yield] :
   *   [ Elisionopt AssignmentRestElement[?Yield]opt ]
   *   [ AssignmentElementList[?Yield] ]
   *   [ AssignmentElementList[?Yield] , Elisionopt AssignmentRestElement[?Yield]opt ]
   *
   * AssignmentRestElement[Yield] :
   *   ... DestructuringAssignmentTarget[?Yield]
   *
   * AssignmentElementList[Yield] :
   *   AssignmentElisionElement[?Yield]
   *   AssignmentElementList[?Yield] , AssignmentElisionElement[?Yield]
   *
   * AssignmentElisionElement[Yield] :
   *   Elisionopt AssignmentElement[?Yield]
   *
   * AssignmentElement[Yield] :
   *   DestructuringAssignmentTarget[?Yield] Initializer[In,?Yield]opt
   *
   * DestructuringAssignmentTarget[Yield] :
   *   LeftHandSideExpression[?Yield]
   */
  parseArrayAssignmentPattern_() {
    return this.parseArrayPattern_(false);
  }

  parseAssignmentElement_() {
    let start = this.getTreeStartLocation_();

    let assignment = this.parseDestructuringAssignmentTarget_();
    let initializer = this.parseInitializerOpt_(ALLOW_IN);
    return new AssignmentElement(this.getTreeLocation_(start), assignment,
        initializer);
  }

  parseDestructuringAssignmentTarget_() {
    switch (this.peekType_()) {
      case OPEN_SQUARE:
        return this.parseArrayAssignmentPattern_();
      case OPEN_CURLY:
        return this.parseObjectAssignmentPattern_();
    }
    let expression = this.parseLeftHandSideExpression_();
    expression = this.coverFormalsToParenExpression_(expression);
    if (expression.type === IDENTIFIER_EXPRESSION) {
      this.checkForStrongUndefinedBinding_(expression.identifierToken);
    }
    return expression;
  }

  parseAssignmentRestElement_() {
    let start = this.getTreeStartLocation_();
    this.eat_(DOT_DOT_DOT);
    let id = this.parseDestructuringAssignmentTarget_();
    return new SpreadPatternElement(this.getTreeLocation_(start), id);
  }

  /**
   * ObjectAssignmentPattern[Yield] :
   *   { }
   *   { AssignmentPropertyList[?Yield] }
   *   { AssignmentPropertyList[?Yield] , }
   *
   * AssignmentPropertyList[Yield] :
   *   AssignmentProperty[?Yield]
   *   AssignmentPropertyList[?Yield] , AssignmentProperty[?Yield]
   *
   * AssignmentProperty[Yield] :
   *   IdentifierReference[?Yield] Initializer[In,?Yield]opt
   *   PropertyName : AssignmentElement[?Yield]
   */
  parseObjectAssignmentPattern_() {
    return this.parseObjectPattern_(false);
  }

  parseAssignmentProperty_() {
    return this.parsePatternProperty_(false);
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
    let start = operand ?
        operand.location.start : this.getTreeStartLocation_();

    let token = this.nextToken_();
    let elements = [new TemplateLiteralPortion(token.location, token)];

    if (token.type === NO_SUBSTITUTION_TEMPLATE) {
      return new TemplateLiteralExpression(this.getTreeLocation_(start),
                                        operand, elements);
    }

    // `abc${
    let expression = this.parseExpression_(ALLOW_IN);
    elements.push(new TemplateSubstitution(expression.location, expression));

    while (expression.type !== SYNTAX_ERROR_TREE) {
      token = this.nextTemplateLiteralToken_();
      if (token.type === ERROR || token.type === END_OF_FILE)
        break;

      elements.push(new TemplateLiteralPortion(token.location, token));
      if (token.type === TEMPLATE_TAIL)
        break;

      expression = this.parseExpression_(ALLOW_IN);
      elements.push(new TemplateSubstitution(expression.location, expression));
    }

    return new TemplateLiteralExpression(this.getTreeLocation_(start),
                                      operand, elements);
  }

  parseTypeAnnotationOpt_() {
    if (this.options_.types && this.eatOpt_(COLON)) {
      return this.parseType_();
    }
    return null;
  }

  /**
   * Types
   *
   * Type:
   *   PrimaryOrUnionType
   *   FunctionType
   *   ConstructorType
   *
   * PrimaryOrUnionType:
   *   PrimaryType
   *   UnionType
   *
   * PrimaryType:
   *   ParenthesizedType
   *   PredefinedType
   *   TypeReference
   *   ObjectType
   *   ArrayType
   *   TupleType
   *   TypeQuery
   *
   * ParenthesizedType:
   *   ( Type )
   *
   * @return {ParseTree}
   * @private
   */
  parseType_() {
    switch (this.peekType_()) {
      case NEW:
        return this.parseConstructorType_();

      case OPEN_PAREN:
      case OPEN_ANGLE:
        return this.parseFunctionType_();
    }

    let start = this.getTreeStartLocation_();
    let elementType = this.parsePrimaryType_();
    return this.parseUnionTypeSuffix_(start, elementType);
  }

  parsePrimaryType_() {
    let start = this.getTreeStartLocation_();
    let elementType, token;
    switch (this.peekType_()) {
      case VOID:
        token = this.nextToken_();
        elementType = new PredefinedType(this.getTreeLocation_(start), token);
        break;

      case IDENTIFIER:
        switch (this.peekToken_().value) {
          case 'any':
          case 'boolean':
          case 'number':
          case 'string':
          case 'symbol':
            token = this.nextToken_();
            elementType =
                new PredefinedType(this.getTreeLocation_(start), token);
            break;
          default:
            elementType = this.parseTypeReference_();
        }
        break;

      case TYPEOF:
        elementType = this.parseTypeQuery_(start);
        break;

      case OPEN_CURLY:
        elementType = this.parseObjectType_();
        break;

      // TODO(arv): ParenthesizedType
      // case OPEN_PAREN:


      default:
        return this.parseUnexpectedToken_(this.peekToken_());
    }

    return this.parseArrayTypeSuffix_(start, elementType);
  }

  parseTypeReference_() {
    let start = this.getTreeStartLocation_();
    let typeName = this.parseTypeName_();
    let args = null;
    if (this.peek_(OPEN_ANGLE)) {
      let args = this.parseTypeArguments_();
      return new TypeReference(this.getTreeLocation_(start), typeName, args);
    }
    return typeName;
  }

  parseUnionTypeSuffix_(start, elementType) {
    if (this.peek_(BAR)) {
      let types = [elementType];
      this.eat_(BAR);
      while (true) {
        types.push(this.parsePrimaryType_());
        if (!this.eatIf_(BAR)) {
          break;
        }
      }
      return new UnionType(this.getTreeLocation_(start), types);
    }
    return elementType;
  }

  parseArrayTypeSuffix_(start, elementType) {
    let token = this.peekTokenNoLineTerminator_();
    if (token && token.type === OPEN_SQUARE) {
      this.eat_(OPEN_SQUARE);
      this.eat_(CLOSE_SQUARE);
      elementType = new ArrayType(this.getTreeLocation_(start), elementType);
      return this.parseArrayTypeSuffix_(start, elementType);
    }

    return elementType;
  }

  parseTypeArguments_() {
    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_ANGLE);
    let args = [this.parseType_()];
    while (this.peek_(COMMA)) {
      this.eat_(COMMA);
      args.push(this.parseType_());
    }

    let token = this.nextCloseAngle_();
    if (token.type !== CLOSE_ANGLE) {
      return this.parseUnexpectedToken_(token);
    }

    return new TypeArguments(this.getTreeLocation_(start), args);
  }

  parseConstructorType_() {
    let start = this.getTreeStartLocation_();
    this.eat_(NEW);
    let typeParameters = this.parseTypeParametersOpt_();
    this.eat_(OPEN_PAREN);
    let parameterList = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);
    this.eat_(ARROW);
    let returnType = this.parseType_();
    return new ConstructorType(this.getTreeLocation_(start), typeParameters,
                               parameterList, returnType);
  }

  // ObjectType:
  //   { TypeBodyopt }
  //
  // TypeBody:
  //   TypeMemberList ;opt
  //
  // TypeMemberList:
  //   TypeMember
  //   TypeMemberList ; TypeMember
  parseObjectType_() {
    let start = this.getTreeStartLocation_();
    let typeMembers = [];
    this.eat_(OPEN_CURLY);
    let type;
    while (this.peekTypeMember_(type = this.peekType_())) {
      typeMembers.push(this.parseTypeMember_(type));
      if (!this.eatIf_(SEMI_COLON)) {
        break;
      }
    }
    this.eat_(CLOSE_CURLY);

    return new ObjectType(this.getTreeLocation_(start), typeMembers);
  }

  peekTypeMember_(type) {
    switch (type) {
      case NEW:
      case OPEN_PAREN:
      case OPEN_ANGLE:
      case OPEN_SQUARE:
      case IDENTIFIER:
      case STRING:
      case NUMBER:
        return true;
      default:
        return this.peekToken_().isKeyword();
    }
  }

  // TypeMember:
  //   PropertySignature
  //   CallSignature
  //   ConstructSignature
  //   IndexSignature
  //   MethodSignature
  parseTypeMember_(type) {
    switch (type) {
      case NEW:
        return this.parseConstructSignature_();
      case OPEN_PAREN:
      case OPEN_ANGLE:
        return this.parseCallSignature_();
      case OPEN_SQUARE:
        return this.parseIndexSignature_();
    }

    let start = this.getTreeStartLocation_();
    let propertyName = this.parseLiteralPropertyName_();
    let isOpt = this.eatIf_(QUESTION);
    type = this.peekType_();
    if (type === OPEN_ANGLE || type === OPEN_PAREN) {
      let callSignature = this.parseCallSignature_();
      return new MethodSignature(this.getTreeLocation_(start), propertyName,
                                 isOpt, callSignature);
    }

    let typeAnnotation = this.parseTypeAnnotationOpt_();
    return new PropertySignature(this.getTreeLocation_(start), propertyName,
                                 isOpt, typeAnnotation);
  }

  parseCallSignature_() {
    let start = this.getTreeStartLocation_();
    let typeParameters = this.parseTypeParametersOpt_();
    this.eat_(OPEN_PAREN)
    let parameterList = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);
    let returnType = this.parseTypeAnnotationOpt_();
    return new CallSignature(this.getTreeLocation_(start), typeParameters,
                             parameterList, returnType);
  }

  parseConstructSignature_() {
    let start = this.getTreeStartLocation_();
    this.eat_(NEW);
    let typeParameters = this.parseTypeParametersOpt_();
    this.eat_(OPEN_PAREN)
    let parameterList = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);
    let returnType = this.parseTypeAnnotationOpt_();
    return new ConstructSignature(this.getTreeLocation_(start), typeParameters,
                                  parameterList, returnType);
  }

  parseIndexSignature_() {
    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_SQUARE);
    let id = this.eatId_();
    this.eat_(COLON);
    let typeName;
    let typeStart = this.getTreeStartLocation_();
    if (this.peekPredefinedString_('string')) {
      typeName = this.eatId_('string');
    } else {
      typeName = this.eatId_('number');
    }
    let indexType =
        new PredefinedType(this.getTreeLocation_(typeStart), typeName);
    this.eat_(CLOSE_SQUARE);
    this.eat_(COLON);
    let typeAnnotation = this.parseType_();
    return new IndexSignature(this.getTreeLocation_(start), id, indexType,
                              typeAnnotation);
  }

  parseFunctionType_() {
    let start = this.getTreeStartLocation_();
    let typeParameters = this.parseTypeParametersOpt_();
    this.eat_(OPEN_PAREN)
    let parameterList = this.parseFormalParameters_();
    this.eat_(CLOSE_PAREN);
    this.eat_(ARROW);
    let returnType = this.parseType_();
    return new FunctionType(this.getTreeLocation_(start), typeParameters,
                            parameterList, returnType);
  }

  parseTypeQuery_(start) {
    throw 'NYI';
  }

  // TypeParameters:
  //   < TypeParameterList >
  //
  // TypeParameterList:
  //   TypeParameter
  //   TypeParameterList , TypeParameter
  //
  // TypeParameter:
  //   Identifier Constraintopt
  //
  // Constraint:
  //   extends Type

  peekTypeParameters_() {
    return this.peek_(OPEN_ANGLE);
  }

  parseTypeParametersOpt_() {
    if (this.peek_(OPEN_ANGLE)) {
      return this.parseTypeParameters_();
    }
    return null;
  }

  parseTypeParameters_() {
    let start = this.getTreeStartLocation_();
    this.eat_(OPEN_ANGLE);
    let parameters = [this.parseTypeParameter_()];
    while (this.peek_(COMMA)) {
      this.eat_(COMMA);
      parameters.push(this.parseTypeParameter_());
    }
    this.eat_(CLOSE_ANGLE);
    return new TypeParameters(this.getTreeLocation_(start), parameters);
  }

  parseTypeParameter_() {
    let start = this.getTreeStartLocation_();
    let id = this.eatId_();
    let extendsType = null;
    if (this.eatIf_(EXTENDS) ) {
      extendsType = this.parseType_();
    }
    return new TypeParameter(this.getTreeLocation_(start), id, extendsType);
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
    let start = this.getTreeStartLocation_();

    switch (this.peekToken_().value) {
      case 'any':
      case 'number':
      case 'boolean':
      case 'string': {
        let token = this.nextToken_();
        return new PredefinedType(this.getTreeLocation_(start), token);
      }
      // void is handled in parseType
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
    let start = this.getTreeStartLocation_();
    let id = this.eatId_();
    let typeName = new TypeName(this.getTreeLocation_(start), null, id);
    while (this.eatIf_(PERIOD)) {
      let memberName = this.eatIdName_();
      typeName = new TypeName(this.getTreeLocation_(start), typeName,
      memberName);
    }
    return typeName;
  }

  /**
   * interface Identifier TypeParameters_opt InterfaceExtendsClause_opt
   *     ObjectType
   *
   * InterfaceExtendsClause:
   *   extends ClassOrInterfaceTypeList
   *
   * ClassOrInterfaceTypeList:
   *   ClassOrInterfaceType
   *   ClassOrInterfaceTypeList , ClassOrInterfaceType
   *
   * ClassOrInterfaceType:
   *   TypeReference
   */
  parseInterfaceDeclaration_() {
    let start = this.getTreeStartLocation_();
    this.eat_(INTERFACE);
    let name = this.eatId_();
    let typeParameters = this.parseTypeParametersOpt_();
    let extendsClause;
    if (this.eatIf_(EXTENDS)) {
      extendsClause = this.parseInterfaceExtendsClause_();
    } else {
      extendsClause = [];
    }
    let objectType = this.parseObjectType_();
    return new InterfaceDeclaration(this.getTreeLocation_(start),
        name, typeParameters, extendsClause, objectType);
  }

  parseInterfaceExtendsClause_() {
    let result = [this.parseTypeReference_()];
    while (this.eatIf_(COMMA)) {
      result.push(this.parseTypeReference_());
    }
     return result;
  }

  /**
   * Annotations extension
   *
   * @return {ParseTree}
   * @private
   */
  parseAnnotatedDeclarations_(parsingModuleItem) {
    this.pushAnnotations_();

    let declaration;
    let type = this.peekType_();
    if (parsingModuleItem) {
      declaration = this.parseModuleItem_(type);
    } else {
      declaration = this.parseStatementListItem_(type);
    }
    if (this.annotations_.length > 0) {
      return this.parseSyntaxError_('Unsupported annotated expression');
    }
    return declaration;
  }

  parseAnnotations_() {
    let annotations = [];
    while (this.eatIf_(AT)) {
      annotations.push(this.parseAnnotation_());
    }
    return annotations;
  }

  pushAnnotations_() {
    this.annotations_ = this.parseAnnotations_();
  }

  popAnnotations_() {
    let annotations = this.annotations_;
    this.annotations_ = [];
    return annotations;
  }

  parseAnnotation_() {
    let start = this.getTreeStartLocation_();
    let expression = this.parseMemberExpressionNoNew_();
    let args = null;

    if (this.peek_(OPEN_PAREN))
      args = this.parseArguments_();

    return new Annotation(this.getTreeLocation_(start), expression, args);
  }

  /**
   * Consume a (possibly implicit) semi-colon. Reports an error if a semi-colon
   * is not present.
   *
   * @return {void}
   * @private
   */
  eatPossibleImplicitSemiColon_() {
    let token = this.peekTokenNoLineTerminator_();
    if (!token)
      return;

    switch (token.type) {
      case SEMI_COLON:
        this.nextToken_();
        return;
      case END_OF_FILE:
      case CLOSE_CURLY:
        return;
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
    let token = this.peekTokenNoLineTerminator_();
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
    let token = this.nextToken_();
    if (!token) {
      if (expected)
        this.reportError_(this.peekToken_(), `expected '${expected}'`);
      return null;
    }

    if (token.type === IDENTIFIER) {
      if (expected && token.value !== expected)
        this.reportExpectedError_(token, expected);

      return token;
    }

    if (token.isStrictKeyword()) {
      if (this.isStrictMode_()) {
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
    let t = this.nextToken_();
    if (t.type !== IDENTIFIER) {
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
    let token = this.nextToken_();
    if (token.type !== expectedTokenType) {
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
    this.reportError_(token, `Unexpected token ${token}`);
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

  handleComment(range) {
    // TODO(arv): Attach to tree nodes.
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

  nextCloseAngle_() {
    return this.scanner_.nextCloseAngle();
  }

  isAtEnd() {
    return this.scanner_.isAtEnd();
  }

  /**
   * Returns true if the next token is of the expected type. Does not Consume
   * any tokens.
   *
   * @param {TokenType} expectedType
   * @return {boolean}
   * @private
   */
  peek_(expectedType) {
    return this.peekToken_().type === expectedType;
  }

  peekLookahead_(expectedType) {
    return this.peekTokenLookahead_().type === expectedType;
  }

  /**
   * Returns the TokenType of the next token. Does not consume any tokens.
   *
   * @return {TokenType}
   * @private
   */
  peekType_() {
    return this.peekToken_().type;
  }

  /**
   * Returns the next token. Does not consume any tokens.
   *
   * @return {Token}
   * @private
   */
  peekToken_() {
    return this.scanner_.peekToken();
  }

  peekTokenLookahead_() {
    return this.scanner_.peekTokenLookahead();
  }

  /**
   * Returns the next token. Does not allow any line terminator
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
  reportError_(...args) {
    if (args.length === 1) {
      this.errorReporter_.reportError(this.scanner_.getPosition(), args[0]);
    } else {
      // TODO(arv): Only allow a SourcePosition here.
      let location = args[0];
      if (location instanceof Token) {
        location = location.location;
      }
      this.errorReporter_.reportError(location.start, args[1]);
    }
  }

  reportReservedIdentifier_(token) {
    this.reportError_(token, `${token.type} is a reserved identifier`);
  }
}
