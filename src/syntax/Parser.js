// Copyright 2012 Google Inc.
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

  var MutedErrorReporter = traceur.util.MutedErrorReporter;
  var Keywords = traceur.syntax.Keywords;
  var PredefinedName = traceur.syntax.PredefinedName;
  var SourceRange = traceur.util.SourceRange;
  var Token = traceur.syntax.Token;
  var TokenType = traceur.syntax.TokenType;

  var ArgumentList = traceur.syntax.trees.ArgumentList;
  var ArrayComprehension = traceur.syntax.trees.ArrayComprehension;
  var ArrayLiteralExpression = traceur.syntax.trees.ArrayLiteralExpression;
  var ArrayPattern = traceur.syntax.trees.ArrayPattern;
  var ArrowFunctionExpression = traceur.syntax.trees.ArrowFunctionExpression;
  var AtNameDeclaration = traceur.syntax.trees.AtNameDeclaration;
  var AtNameExpression = traceur.syntax.trees.AtNameExpression;
  var AwaitStatement = traceur.syntax.trees.AwaitStatement;
  var BinaryOperator = traceur.syntax.trees.BinaryOperator;
  var BindThisParameter = traceur.syntax.trees.BindThisParameter;
  var BindingElement = traceur.syntax.trees.BindingElement;
  var BindingIdentifier = traceur.syntax.trees.BindingIdentifier;
  var Block = traceur.syntax.trees.Block;
  var BreakStatement = traceur.syntax.trees.BreakStatement;
  var CallExpression = traceur.syntax.trees.CallExpression;
  var CaseClause = traceur.syntax.trees.CaseClause;
  var Catch = traceur.syntax.trees.Catch;
  var CascadeExpression = traceur.syntax.trees.CascadeExpression;
  var ClassDeclaration = traceur.syntax.trees.ClassDeclaration;
  var ClassExpression = traceur.syntax.trees.ClassExpression;
  var CommaExpression = traceur.syntax.trees.CommaExpression;
  var ComprehensionFor = traceur.syntax.trees.ComprehensionFor;
  var ConditionalExpression = traceur.syntax.trees.ConditionalExpression;
  var ContinueStatement = traceur.syntax.trees.ContinueStatement;
  var DebuggerStatement = traceur.syntax.trees.DebuggerStatement;
  var DefaultClause = traceur.syntax.trees.DefaultClause;
  var DoWhileStatement = traceur.syntax.trees.DoWhileStatement;
  var EmptyStatement = traceur.syntax.trees.EmptyStatement;
  var ExportDeclaration = traceur.syntax.trees.ExportDeclaration;
  var ExportMapping = traceur.syntax.trees.ExportMapping;
  var ExportMappingList = traceur.syntax.trees.ExportMappingList;
  var ExportSpecifier = traceur.syntax.trees.ExportSpecifier;
  var ExportSpecifierSet = traceur.syntax.trees.ExportSpecifierSet;
  var ExpressionStatement = traceur.syntax.trees.ExpressionStatement;
  var Finally = traceur.syntax.trees.Finally;
  var ForOfStatement = traceur.syntax.trees.ForOfStatement;
  var ForInStatement = traceur.syntax.trees.ForInStatement;
  var ForStatement = traceur.syntax.trees.ForStatement;
  var FormalParameterList = traceur.syntax.trees.FormalParameterList;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GeneratorComprehension = traceur.syntax.trees.GeneratorComprehension;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var IdentifierExpression = traceur.syntax.trees.IdentifierExpression;
  var IdentifierToken = traceur.syntax.IdentifierToken;
  var IfStatement = traceur.syntax.trees.IfStatement;
  var ImportDeclaration = traceur.syntax.trees.ImportDeclaration;
  var ImportBinding = traceur.syntax.trees.ImportBinding;
  var ImportSpecifier = traceur.syntax.trees.ImportSpecifier;
  var ImportSpecifierSet = traceur.syntax.trees.ImportSpecifierSet;
  var LabelledStatement = traceur.syntax.trees.LabelledStatement;
  var LiteralExpression = traceur.syntax.trees.LiteralExpression;
  var MemberExpression = traceur.syntax.trees.MemberExpression;
  var MemberLookupExpression = traceur.syntax.trees.MemberLookupExpression;
  var MissingPrimaryExpression = traceur.syntax.trees.MissingPrimaryExpression;
  var ModuleDeclaration = traceur.syntax.trees.ModuleDeclaration;
  var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
  var ModuleExpression = traceur.syntax.trees.ModuleExpression;
  var ModuleRequire = traceur.syntax.trees.ModuleRequire;
  var ModuleSpecifier = traceur.syntax.trees.ModuleSpecifier;
  var NameStatement = traceur.syntax.trees.NameStatement;
  var NewExpression = traceur.syntax.trees.NewExpression;
  var NullTree = traceur.syntax.trees.NullTree;
  var ObjectLiteralExpression = traceur.syntax.trees.ObjectLiteralExpression;
  var ObjectPattern = traceur.syntax.trees.ObjectPattern;
  var ObjectPatternField = traceur.syntax.trees.ObjectPatternField;
  var ParenExpression = traceur.syntax.trees.ParenExpression;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PostfixExpression = traceur.syntax.trees.PostfixExpression;
  var Program = traceur.syntax.trees.Program;
  var PropertyMethodAssignment = traceur.syntax.trees.PropertyMethodAssignment;
  var PropertyNameAssignment = traceur.syntax.trees.PropertyNameAssignment;
  var PropertyNameShorthand = traceur.syntax.trees.PropertyNameShorthand;
  var QuasiLiteralExpression = traceur.syntax.trees.QuasiLiteralExpression;
  var QuasiLiteralPortion = traceur.syntax.trees.QuasiLiteralPortion;
  var QuasiSubstitution = traceur.syntax.trees.QuasiSubstitution;
  var RestParameter = traceur.syntax.trees.RestParameter;
  var ReturnStatement = traceur.syntax.trees.ReturnStatement;
  var SetAccessor = traceur.syntax.trees.SetAccessor;
  var SpreadExpression = traceur.syntax.trees.SpreadExpression;
  var SpreadPatternElement = traceur.syntax.trees.SpreadPatternElement;
  var SuperExpression = traceur.syntax.trees.SuperExpression;
  var SwitchStatement = traceur.syntax.trees.SwitchStatement;
  var ThisExpression = traceur.syntax.trees.ThisExpression;
  var ThrowStatement = traceur.syntax.trees.ThrowStatement;
  var TryStatement = traceur.syntax.trees.TryStatement;
  var UnaryExpression = traceur.syntax.trees.UnaryExpression;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;
  var VariableStatement = traceur.syntax.trees.VariableStatement;
  var WhileStatement = traceur.syntax.trees.WhileStatement;
  var WithStatement = traceur.syntax.trees.WithStatement;
  var YieldStatement = traceur.syntax.trees.YieldStatement;

  var createBindingIdentifier = traceur.codegeneration.ParseTreeFactory.createBindingIdentifier;

  var options = traceur.options.parse;

  /**
   * Parses a javascript file.
   *
   * The various this.parseX_() methods never return null - even when parse errors are encountered.
   * Typically this.parseX_() will return a XTree ParseTree. Each ParseTree that is created includes its
   * source location. The typical pattern for a this.parseX_() method is:
   *
   * XTree this.parseX_() {
   *   var start = this.getTreeStartLocation_();
   *   parse X grammar element and its children
   *   return new XTree(this.getTreeLocation_(start), children);
   * }
   *
   * this.parseX_() methods must consume at least 1 token - even in error cases. This prevents infinite
   * loops in the parser.
   *
   * Many this.parseX_() methods are matched by a 'boolean this.peekX_()' method which will return true if
   * the beginning of an X appears at the current location. There are also this.peek_() methods which
   * examine the next token. this.peek_() methods must not consume any tokens.
   *
   * The this.eat_() method consumes a token and reports an error if the consumed token is not of the
   * expected type. The this.eatOpt_() methods consume the next token iff the next token is of the expected
   * type and return the consumed token or null if no token was consumed.
   *
   * When parse errors are encountered, an error should be reported and the parse should return a best
   * guess at the current parse tree.
   *
   * When parsing lists, the preferred pattern is:
   *   this.eat_(LIST_START);
   *   var elements = [];
   *   while (this.peekListElement_()) {
   *     elements.push(this.parseListElement_());
   *   }
   *   this.eat_(LIST_END);
   */
  function Parser(errorReporter, var_args) {
    this.errorReporter_ = errorReporter;
    var scanner;
    if (arguments[1] instanceof traceur.syntax.Scanner) {
      scanner = arguments[1];
    } else {
      scanner = new traceur.syntax.Scanner(errorReporter, arguments[1],
                                           arguments[2]);
    }
    this.scanner_ = scanner;
  }

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

  function followedByCommaOrCloseSquare(token) {
    return token.type === TokenType.COMMA ||
        token.type === TokenType.CLOSE_SQUARE;
  }

  function followedByCommaOrCloseCurly(token) {
    return token.type === TokenType.COMMA ||
        token.type === TokenType.CLOSE_CURLY;
  }

  function followedByInOrOf(token) {
    return token.type === TokenType.IN ||
        token.type === TokenType.IDENTIFIER &&
        token.value === PredefinedName.OF;
  }

  /**
   * Enum used to determine if an initializer is allowed or not.
   * @enum {string}
   */
  var Initializer = {
    ALLOWED: 'ALLOWED',
    REQUIRED: 'REQUIRED'
  };

  Parser.prototype = {
    /**
     * Keeps track of whether we currently allow yield expressions.
     * @type {boolean}
     * @private
     */
    allowYield_: false,

    // 14 Program
    /**
     * @return {Program}
     */
    parseProgram: function(opt_load) {
      //var t = new Timer("Parse Program");
      var start = this.getTreeStartLocation_();
      var programElements = this.parseProgramElements_(!!opt_load);
      this.eat_(TokenType.END_OF_FILE);
      //t.end();
      return new Program(this.getTreeLocation_(start), programElements);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseProgramElements_: function(load) {
      var result = [];

      while (!this.peek_(TokenType.END_OF_FILE)) {
        var programElement = this.parseProgramElement_(load);
        if (!programElement) {
          return null;
        }
        result.push(programElement);
      }

      return result;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekProgramElement_: function() {
      return this.peekFunction_() ||
             this.peekVariableDeclarationList_() ||
             this.peekImportDeclaration_() ||
             this.peekExportDeclaration_() ||
             this.peekModuleDeclaration_() ||
             this.peekClassDeclaration_() ||
             this.peekStatement_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseProgramElement_: function(load) {
      if (this.peekVariableDeclarationList_()) {
        return this.parseVariableStatement_();
      }
      // Function is handled in parseStatement_
      // Class is handled in parseStatement_
      if (this.peekImportDeclaration_(load)) {
        return this.parseImportDeclaration_(load);
      }
      if (this.peekExportDeclaration_(load)) {
        return this.parseExportDeclaration_(load);
      }
      if (this.peekModuleDeclaration_(load)) {
        return this.parseModuleDeclaration_(load);
      }
      return this.parseStatement_();
    },

    // ClassDeclaration
    // ModuleDeclaration
    // TODO: ImportDeclaration
    // TODO: ScriptBlock
    // Statement (other than BlockStatement)
    // FunctionDeclaration
    /*
    peekScriptElement_: function() {
      return this.peekModuleDeclaration_() ||
              this.peekSourceElement_();
    }
  */

    // module  identifier { ModuleElement* }
    /**
    * @return {boolean}
    * @private
    */
    peekModuleDefinition_: function() {
      return this.peekPredefinedString_(PredefinedName.MODULE) &&
          this.peek_(TokenType.IDENTIFIER, 1) &&
          this.peek_(TokenType.OPEN_CURLY, 2);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseModuleDefinition_: function(load) {

      // ModuleDeclaration ::= "module" ModuleSpecifier(load) ("," ModuleSpecifier(load))* ";"
      //              | ModuleDefinition(load)
      // ModuleDefinition(load) ::= "module" Identifier "{" ModuleBody(load) "}"
      // ModuleSpecifier(load) ::= Identifier "from" ModuleExpression(load)

      var start = this.getTreeStartLocation_();
      this.eatId_(); // module
      var name = this.eatId_();
      this.eat_(TokenType.OPEN_CURLY);
      var result = [];
      while (this.peekModuleElement_()) {
        result.push(this.parseModuleElement_(load));
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ModuleDefinition(this.getTreeLocation_(start), name, result);
    },

    // ModuleSpecifier(load) ::= Identifier "from" ModuleExpression(load)
    parseModuleSpecifier_: function(load) {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      this.eatId_(PredefinedName.FROM);
      var expression = this.parseModuleExpression_(load);
      return new ModuleSpecifier(this.getTreeLocation_(start), identifier,
                                 expression);
    },

    parseModuleExpression_: function(load) {
      // ModuleExpression(load) ::= ModuleReference(load)
      //                         | ModuleExpression(load) "." IdentifierName
      var start = this.getTreeStartLocation_();
      var reference = this.parseModuleReference_(load);
      var identifierNames = [];
      while (this.peek_(TokenType.PERIOD) && this.peekIdName_(1)) {
        this.eat_(TokenType.PERIOD);
        identifierNames.push(this.eatIdName_());
      }
      return new ModuleExpression(this.getTreeLocation_(start), reference,
          identifierNames);
    },

    /**
     * @private
     * @return {ModeuleRequireTree|IdentifierExpression}
     */
    parseModuleReference_: function(load) {
      // ModuleReference(load) ::= Identifier
      //                        | [load = true] StringLiteral

      var start = this.getTreeStartLocation_();
      if (load && this.peek_(TokenType.STRING)) {
        var url = this.eat_(TokenType.STRING);
        return new ModuleRequire(this.getTreeLocation_(start), url);
      }
      return this.parseIdentifierExpression_();
    },

    // ClassDeclaration
    // ImportDeclaration
    // ExportDeclaration
    // ModuleDeclaration
    // TODO: ModuleBlock
    // Statement (other than BlockStatement)
    // FunctionDeclaration

    /**
     * @return {boolean}
     * @private
     */
    peekModuleElement_: function() {
      // ModuleElement is currently same as ProgramElement.
      return this.peekProgramElement_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseModuleElement_: function(load) {
      // ModuleElement is currently same as ProgramElement.
      return this.parseProgramElement_(load);
    },

    //  ImportDeclaration ::= 'import' ImportBinding (',' ImportBinding)* ';'
    /**
     * @return {boolean}
     * @private
     */
    peekImportDeclaration_: function() {
      return options.modules && this.peek_(TokenType.IMPORT);
    },

    // ImportDeclaration(load) ::= "import" ImportBinding(load)
    //                                     ("," ImportBinding(load))* ";"
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportDeclaration_: function(load) {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.IMPORT);
      var importBindings = [];

      importBindings.push(this.parseImportBinding_(load));
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        importBindings.push(this.parseImportBinding_(load));
      }
      this.eatPossibleImplicitSemiColon_();

      return new ImportDeclaration(this.getTreeLocation_(start),
          importBindings);
    },

    // ImportBinding(load) ::= ImportSpecifierSet "from" ModuleExpression(load)
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportBinding_: function(load) {
      var start = this.getTreeStartLocation_();
      var importSpecifierSet = this.parseImportSpecifierSet_();
      this.eatId_(PredefinedName.FROM);
      var moduleExpression = this.parseModuleExpression_(load);

      return new ImportBinding(this.getTreeLocation_(start),
          moduleExpression, importSpecifierSet);
    },

    //ImportSpecifierSet ::= "*"
    //                  | IdentifierName
    //                  | "{" (ImportSpecifier ("," ImportSpecifier)*)? ","? "}"
    /**
     * @param {SourcePosition} start
     * @param {Array.<IdentifierToken>} qualifiedPath
     * @return {ParseTree|Token|Array.<Token>}
     * @private
     */
    parseImportSpecifierSet_: function() {
      if (this.peek_(TokenType.OPEN_CURLY)) {
        var start = this.getTreeStartLocation_();
        this.eat_(TokenType.OPEN_CURLY);

        var specifiers = [this.parseImportSpecifier_()];
        while (this.peek_(TokenType.COMMA)) {
          this.eat_(TokenType.COMMA);
          if (this.peek_(TokenType.CLOSE_CURLY))
            break;
          specifiers.push(this.parseImportSpecifier_());
        }
        this.eat_(TokenType.CLOSE_CURLY);

        return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers);
      }

      if (this.peek_(TokenType.STAR)) {
        var star = this.eat_(TokenType.STAR);
        return new ImportSpecifierSet(this.getTreeLocation_(start), star);
      }

      return this.parseIdentifierNameExpression_();
    },

    // ImportSpecifier ::= IdentifierName (":" Identifier)?
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var lhs = this.eatIdName_();
      var rhs = null;
      if (this.peek_(TokenType.COLON)) {
        this.eat_(TokenType.COLON);
        rhs = this.eatId_();
      }
      return new ImportSpecifier(this.getTreeLocation_(start),
          lhs, rhs);
    },

    // export  VariableStatement
    // export  FunctionDeclaration
    // export  ConstStatement
    // export  ClassDeclaration
    // export  module ModuleDefinition
    /**
     * @return {boolean}
     * @private
     */
    peekExportDeclaration_: function(load) {
      return options.modules && this.peek_(TokenType.EXPORT);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseExportDeclaration_: function(load) {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.EXPORT);
      var exportTree;
      switch (this.peekType_()) {
        case TokenType.CONST:
        case TokenType.LET:
        case TokenType.VAR:
          exportTree = this.parseVariableStatement_();
          break;
        case TokenType.FUNCTION:
          exportTree = this.parseFunctionDeclaration_();
          break;
        case TokenType.CLASS:
          exportTree = this.parseClassDeclaration_();
          break;
        case TokenType.IDENTIFIER:
          if (this.peekModuleDeclaration_(load)) {
            exportTree = this.parseModuleDeclaration_(load);
          } else {
            exportTree = this.parseExportMappingList_();
          }
          break;
        case TokenType.OPEN_CURLY:
          exportTree = this.parseExportMappingList_();
          break;
        default:
          this.reportError_('Unexpected symbol \'' + this.peekToken_() + '\'');
          return null;
      }
      return new ExportDeclaration(this.getTreeLocation_(start), exportTree);
    },

    parseExportMappingList_: function() {
      // This is part of the ExportDeclaration production
      // ExportMapping ("," ExportMapping)*
      var start = this.getTreeStartLocation_();
      var mappings = [this.parseExportMapping_()];
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        mappings.push(this.parseExportMapping_());
      }
      this.eatPossibleImplicitSemiColon_();
      return new ExportMappingList(this.getTreeEndLocation_(start), mappings);
    },

    peekExportMapping_: function() {
      return this.peek_(TokenType.OPEN_CURLY) || this.peekId_();
    },

    parseExportMapping_: function() {
      // ExportMapping ::= ExportSpecifierSet ("from" ModuleExpression(false))?
      var start = this.getTreeStartLocation_();
      var specifierSet = this.parseExportSpecifierSet_();
      var expression = null;
      if (this.peekPredefinedString_(PredefinedName.FROM)) {
        this.eatId_(PredefinedName.FROM);
        expression = this.parseModuleExpression_(false);
      }
      return new ExportMapping(this.getTreeLocation_(start), expression,
                               specifierSet);
    },

    peekExportSpecifierSet_: function() {
      return this.peek_(TokenType.OPEN_CURLY) ||
          this.peekIdName_();
    },

    parseExportSpecifierSet_: function() {
      // ExportSpecifierSet ::= Identifier
      //     | "{" ExportSpecifier ("," ExportSpecifier)* ","? "}"

      if (!this.peek_(TokenType.OPEN_CURLY))
        return this.parseIdentifierExpression_();

      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);
      var specifiers = [this.parseExportSpecifier_()];
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        if (this.peek_(TokenType.CLOSE_CURLY))
          break;
        specifiers.push(this.parseExportSpecifier_());
      }
      this.eat_(TokenType.CLOSE_CURLY);

      return new ExportSpecifierSet(this.getTreeLocation_(start),
          specifiers);
    },

    parseExportSpecifier_: function() {
      // ExportSpecifier ::= Identifier
      //     | IdentifierName ":" Identifier

      var start = this.getTreeStartLocation_();
      var lhs, rhs = null;
      if (this.peek_(TokenType.COLON, 1)) {
        lhs = this.eatIdName_();
        this.eat_(TokenType.COLON);
        rhs = this.eatId_();
      } else {
        lhs = this.eatId_();
      }
      return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },

    peekId_: function(opt_index) {
      return this.peek_(TokenType.IDENTIFIER, opt_index);
    },

    peekIdName_: function(opt_index) {
      var type = this.peekType_(opt_index);
      return type == TokenType.IDENTIFIER || Keywords.isKeyword(type);
    },

    // TODO: ModuleLoadRedeclarationList
    // ModuleDefinition
    /**
     * @return {boolean}
     * @private
     */
    peekModuleDeclaration_: function() {
      // ModuleDeclaration ::= "module" ModuleSpecifier(load) ("," ModuleSpecifier(load))* ";"
      //                    | ModuleDefinition(load)
      // ModuleDefinition(load) ::= "module" Identifier "{" ModuleBody(load) "}"
      // ModuleSpecifier(load) ::= Identifier "from" ModuleExpression(load)
      return options.modules &&
          this.peekPredefinedString_(PredefinedName.MODULE) &&
          this.peek_(TokenType.IDENTIFIER, 1) &&
          (this.peekPredefinedString_(PredefinedName.FROM, 2) ||
           this.peek_(TokenType.OPEN_CURLY, 2));
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseModuleDeclaration_: function(load) {
      if (this.peekModuleDefinition_(load))
        return this.parseModuleDefinition_(load);

      var start = this.getTreeStartLocation_();
      this.eatId_(); // module

      var specifiers = [this.parseModuleSpecifier_(load)];
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        specifiers.push(this.parseModuleSpecifier_(load));
      }
      this.eatPossibleImplicitSemiColon_();
      return new ModuleDeclaration(this.getTreeLocation_(start),
          specifiers);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekClassDeclaration_: function() {
      return options.classes && this.peek_(TokenType.CLASS) && this.peekId_(1);
    },

    parseClassShared_: function(constr) {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.CLASS);
      var name = null;
      // Name is optional for ClassExpression
      if (constr == ClassDeclaration ||
          !this.peek_(TokenType.EXTENDS) && !this.peek_(TokenType.OPEN_CURLY)) {
        name = this.parseBindingIdentifier_();
      }
      var superClass = null;
      if (this.peek_(TokenType.EXTENDS)) {
        this.eat_(TokenType.EXTENDS);
        superClass = this.parseAssignmentExpression_();
      }
      this.eat_(TokenType.OPEN_CURLY);
      var elements = this.parseClassElements_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new constr(this.getTreeLocation_(start), name, superClass,
                        elements);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseClassDeclaration_: function() {
      return this.parseClassShared_(ClassDeclaration);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseClassExpression_: function() {
      return this.parseClassShared_(ClassExpression);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseClassElements_: function() {
      var result = [];

      while (this.peekClassElement_()) {
        result.push(this.parseClassElement_());
      }

      return result;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekClassElement_: function() {
      return options.classes && (this.peekPropertyMethodAssignment_() ||
          this.peekGetAccessor_() || this.peekSetAccessor_());
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseClassElement_: function() {
      if (this.peekGetAccessor_())
        return this.parseGetAccessor_();
      if (this.peekSetAccessor_())
        return this.parseSetAccessor_();
      return this.parsePropertyMethodAssignment_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseSourceElement_: function() {
      if (this.peekFunction_()) {
        return this.parseFunctionDeclaration_();
      }
      if (this.peekClassDeclaration_()) {
        return this.parseClassDeclaration_();
      }

      // Harmony let block scoped bindings. let can only appear in
      // a block, not as a standalone statement: if() let x ... illegal
      if (this.peekLet_()) {
        return this.parseVariableStatement_();
      }
      // const and var are handled inside parseStatement

      if (this.peekNameStatement_())
        return this.parseNameStatement_();

      return this.parseStatementStandard_();
    },

    peekLet_: function() {
      return options.blockBinding && this.peek_(TokenType.LET);
    },

    peekConst_: function() {
      return options.blockBinding && this.peek_(TokenType.CONST);
    },

    peekNameStatement_: function() {
      return options.privateNameSyntax &&
          this.peek_(TokenType.PRIVATE) &&
          this.peek_(TokenType.AT_NAME, 1);
    },

    peekAtNameExpression_: function() {
      return options.privateNameSyntax && this.peek_(TokenType.AT_NAME);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekSourceElement_: function() {
      return this.peekFunction_() || this.peekClassDeclaration_() ||
          this.peekStatementStandard_() || this.peekLet_() ||
          this.peekAtNameExpression_() ||
          this.peekNameStatement_();
    },

    /**
     * @return {boolean}
     * @private
     */
    peekFunction_: function(opt_index) {
      var index = opt_index || 0;
      // TODO: Remove # functions
      return this.peek_(TokenType.FUNCTION, index) || this.peek_(TokenType.POUND, index);
    },

    // 13 Function Definition
    /**
     * @return {ParseTree}
     * @private
     */
    parseFunctionDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.nextToken_(); // function or #
      var isGenerator = this.eatOpt_(TokenType.STAR) != null;
      return this.parseFunctionDeclarationTail_(start, isGenerator,
                                                this.parseBindingIdentifier_());
    },

    /**
     * @param {SourcePosition} start
     * @param {IdentifierToken} name
     * @return {ParseTree}
     * @private
     */
    parseFunctionDeclarationTail_: function(start, isGenerator, name) {
      this.eat_(TokenType.OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(TokenType.CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_(isGenerator);
      return new FunctionDeclaration(this.getTreeLocation_(start), name,
                                     isGenerator, formalParameterList,
                                     functionBody);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseFunctionExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.nextToken_(); // function or #
      var isGenerator = this.eatOpt_(TokenType.STAR) != null;
      var name = null;
      if (this.peekBindingIdentifier_()) {
        name = this.parseBindingIdentifier_();
      }
      this.eat_(TokenType.OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(TokenType.CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_(isGenerator);
      return new FunctionDeclaration(this.getTreeLocation_(start), name,
                                     isGenerator, formalParameterList,
                                     functionBody);
    },

    /**
     * @return {FormalParameterList}
     * @private
     */
    parseFormalParameterList_: function() {
      // FormalParameterList :
      //   ... Identifier
      //   FormalsList
      //   FormalsList , ... Identifier
      //
      // FormalsList :
      //   FormalParameter
      //   FormalsList , FormalParameter
      //
      //   FormalParameter :
      //     BindingIdentifier Initialiser?
      //     BindingPattern Initialiser?

      var start = this.getTreeStartLocation_();
      var formals;
      if (this.peekRest_()) {
        formals = [this.parseRestParameter_()];
      } else {
        formals = this.parseFormalsList_();
        if (this.peek_(TokenType.COMMA)) {
          this.eat_(TokenType.COMMA);
          formals.push(this.parseRestParameter_());
        }
      }

      return new FormalParameterList(this.getTreeLocation_(start), formals);
    },

    parseFormalsList_: function() {
      var formals = [];
      var initializerAllowed = Initializer.ALLOWED;
      while (this.peekFormalParameter_()) {
        var parameter = this.parseFormalParameter_(initializerAllowed);
        if (parameter.initializer)
            initializerAllowed = Initializer.REQUIRED;
        formals.push(parameter);
        // Lookahead to distinguish , ... and , ) which must not be consumed.
        if (this.peek_(TokenType.COMMA) && this.peekFormalParameter_(1))
          this.eat_(TokenType.COMMA);
      }
      return formals;
    },

    peekFormalParameter_: function(opt_index) {
      var index = opt_index || 0;
      return this.peekBindingIdentifier_(index) || this.peekPattern_(index);
    },

    parseFormalParameter_: function(opt_initializerAllowed) {
      return this.parseBindingElement_(opt_initializerAllowed);
    },

    parseRestParameter_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.DOT_DOT_DOT);
      return new RestParameter(this.getTreeLocation_(start),
                               this.parseBindingIdentifier_());
    },

    /**
     * @return {Block}
     * @private
     */
    parseFunctionBody_: function(isGenerator) {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);

      var allowYield = this.allowYield_;
      this.allowYield_ = isGenerator;
      var result = this.parseSourceElementList_();
      this.allowYield_ = allowYield;

      this.eat_(TokenType.CLOSE_CURLY);
      return new Block(this.getTreeLocation_(start), result);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseSourceElementList_: function() {
      var result = [];

      while (this.peekSourceElement_()) {
        var sourceElement = this.parseSourceElement_();
        if (!sourceElement) {
          return null;
        }
        result.push(sourceElement);
      }

      return result;
    },

    /**
     * @return {SpreadExpression}
     * @private
     */
    parseSpreadExpression_: function() {
      if (!options.spread) {
        return this.parseMissingPrimaryExpression_();
      }
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.DOT_DOT_DOT);
      var operand = this.parseAssignmentExpression_();
      return new SpreadExpression(this.getTreeLocation_(start), operand);
    },

    // 12 Statements

    /**
     * In V8, all source elements may appear where statements occur in the grammar.
     *
     * @return {ParseTree}
     * @private
     */
    parseStatement_: function() {
      return this.parseSourceElement_();
    },

    /**
     * This function reflects the ECMA standard. Most places use parseStatement instead.
     *
     * @return {ParseTree}
     * @private
     */
    parseStatementStandard_: function() {
      switch (this.peekType_()) {
        case TokenType.OPEN_CURLY:
          return this.parseBlock_();
        case TokenType.AWAIT:
          return this.parseAwaitStatement_();
        case TokenType.CONST:
          if (!options.blockBinding) {
            this.reportUnexpectedToken_();
            return null;
          }
          // Fall through.
        case TokenType.VAR:
          return this.parseVariableStatement_();
        case TokenType.SEMI_COLON:
          return this.parseEmptyStatement_();
        case TokenType.IF:
          return this.parseIfStatement_();
        case TokenType.DO:
          return this.parseDoWhileStatement_();
        case TokenType.WHILE:
          return this.parseWhileStatement_();
        case TokenType.FOR:
          return this.parseForStatement_();
        case TokenType.CONTINUE:
          return this.parseContinueStatement_();
        case TokenType.BREAK:
          return this.parseBreakStatement_();
        case TokenType.RETURN:
          return this.parseReturnStatement_();
        case TokenType.YIELD:
          return this.parseYieldStatement_();
        case TokenType.WITH:
          return this.parseWithStatement_();
        case TokenType.SWITCH:
          return this.parseSwitchStatement_();
        case TokenType.THROW:
          return this.parseThrowStatement_();
        case TokenType.TRY:
          return this.parseTryStatement_();
        case TokenType.DEBUGGER:
          return this.parseDebuggerStatement_();
        default:
          if (this.peekLabelledStatement_()) {
            return this.parseLabelledStatement_();
          }
          return this.parseExpressionStatement_();
      }
    },

    /**
     * In V8 all source elements may appear where statements appear in the grammar.
     *
     * @return {boolean}
     * @private
     */
    peekStatement_: function() {
      return this.peekSourceElement_();
    },

    /**
     * This function reflects the ECMA standard. Most places use peekStatement instead.
     *
     * @return {boolean}
     * @private
     */
    peekStatementStandard_: function() {
      switch (this.peekType_()) {
        case TokenType.CONST:
          return options.blockBinding;
        case TokenType.YIELD:
          return options.generators;
        case TokenType.AWAIT:
          return options.deferredFunctions;
        case TokenType.OPEN_CURLY:
        case TokenType.VAR:
        case TokenType.SEMI_COLON:
        case TokenType.IF:
        case TokenType.DO:
        case TokenType.WHILE:
        case TokenType.FOR:
        case TokenType.CONTINUE:
        case TokenType.BREAK:
        case TokenType.RETURN:
        case TokenType.WITH:
        case TokenType.SWITCH:
        case TokenType.THROW:
        case TokenType.TRY:
        case TokenType.DEBUGGER:
        case TokenType.IDENTIFIER:
        case TokenType.THIS:
        case TokenType.CLASS:
        case TokenType.SUPER:
        case TokenType.NUMBER:
        case TokenType.STRING:
        case TokenType.NULL:
        case TokenType.TRUE:
        case TokenType.SLASH: // regular expression literal
        case TokenType.SLASH_EQUAL: // regular expression literal
        case TokenType.FALSE:
        case TokenType.OPEN_SQUARE:
        case TokenType.OPEN_PAREN:
        case TokenType.NEW:
        case TokenType.DELETE:
        case TokenType.VOID:
        case TokenType.TYPEOF:
        case TokenType.PLUS_PLUS:
        case TokenType.MINUS_MINUS:
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.TILDE:
        case TokenType.BANG:
        case TokenType.BACK_QUOTE:
          return true;
        default:
          return false;
      }
    },

    // 12.1 Block
    /**
     * @return {Block}
     * @private
     */
    parseBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);
      // Spec says Statement list. However functions are also embedded in the wild.
      var result = this.parseSourceElementList_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new Block(this.getTreeLocation_(start), result);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseStatementList_: function() {
      var result = [];
      while (this.peekStatement_()) {
        result.push(this.parseStatement_());
      }
      return result;
    },

    // 12.2 Variable Statement
    /**
     * @return {VariableStatement}
     * @private
     */
    parseVariableStatement_: function() {
      var start = this.getTreeStartLocation_();
      var declarations = this.parseVariableDeclarationList_();
      this.checkInitializers_(declarations);
      this.eatPossibleImplicitSemiColon_();
      return new VariableStatement(this.getTreeLocation_(start), declarations);
    },

    /**
     * @param {Expression=} opt_expressionIn
     * @param {DestructuringInitializer} opt_initializer Whether destructuring
     *     requires an initializer
     * @return {VariableDeclarationList}
     * @private
     */
    parseVariableDeclarationList_: function(opt_expressionIn, opt_initializer) {
      var expressionIn = opt_expressionIn || Expression.NORMAL;
      var initializer = opt_initializer || DestructuringInitializer.REQUIRED;
      var token = this.peekType_();

      switch (token) {
        case TokenType.CONST:
        case TokenType.LET:
          if (!options.blockBinding)
            debugger;
        case TokenType.VAR:
          this.eat_(token);
          break;
        default:
          throw Error('unreachable');
      }

      var start = this.getTreeStartLocation_();
      var declarations = [];

      declarations.push(this.parseVariableDeclaration_(token, expressionIn,
                                                       initializer));
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        declarations.push(this.parseVariableDeclaration_(token, expressionIn,
                                                         initializer));
      }
      return new VariableDeclarationList(
          this.getTreeLocation_(start), token, declarations);
    },

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
     * @param {DestructuringInitializer=} opt_initializer
     * @return {VariableDeclaration}
     * @private
     */
    parseVariableDeclaration_: function(binding, expressionIn,
                                        opt_initializer) {
      var initRequired = opt_initializer !== DestructuringInitializer.OPTIONAL;
      var start = this.getTreeStartLocation_();

      var lvalue;
      if (this.peekPattern_())
        lvalue = this.parseBindingPattern_();
      else
        lvalue = this.parseBindingIdentifier_();

      var initializer = null;
      if (this.peek_(TokenType.EQUAL))
        initializer = this.parseInitializer_(expressionIn);
      else if (lvalue.isPattern() && initRequired)
        this.reportError_('destructuring must have an initializer');

      return new VariableDeclaration(this.getTreeLocation_(start), lvalue, initializer);
    },

    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseInitializer_: function(expressionIn) {
      this.eat_(TokenType.EQUAL);
      return this.parseAssignmentExpression_(expressionIn);
    },

    /**
     * NameStatement :
     *   name NameDeclarationList
     *
     * NameDeclarationList :
     *   AtName Initializeropt
     *   AtName Initializeropt , NameDeclarationList
     *
     * @return {AtNameDeclaration}
     */
    parseNameStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.PRIVATE);

      var declarations = [];
      declarations.push(this.parseAtNameDeclaration_());
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        declarations.push(this.parseAtNameDeclaration_());
      }
      this.eatPossibleImplicitSemiColon_();
      return new NameStatement(this.getTreeLocation_(start), declarations);
    },

    parseAtNameDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      var atName = this.eat_(TokenType.AT_NAME);
      var initializer = null;
      if (this.peek_(TokenType.EQUAL))
        initializer = this.parseInitializer_(Expression.IN);
      return new AtNameDeclaration(this.getTreeLocation_(start), atName,
                                   initializer);
    },

    // 12.3 Empty Statement
    /**
     * @return {EmptyStatement}
     * @private
     */
    parseEmptyStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SEMI_COLON);
      return new EmptyStatement(this.getTreeLocation_(start));
    },

    // 12.4 Expression Statement
    /**
     * @return {ExpressionStatement}
     * @private
     */
    parseExpressionStatement_: function() {
      var start = this.getTreeStartLocation_();
      var expression = this.parseExpression_();
      this.eatPossibleImplicitSemiColon_();
      return new ExpressionStatement(this.getTreeLocation_(start), expression);
    },

    // 12.5 If Statement
    /**
     * @return {IfStatement}
     * @private
     */
    parseIfStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.IF);
      this.eat_(TokenType.OPEN_PAREN);
      var condition = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var ifClause = this.parseStatement_();
      var elseClause = null;
      if (this.peek_(TokenType.ELSE)) {
        this.eat_(TokenType.ELSE);
        elseClause = this.parseStatement_();
      }
      return new IfStatement(this.getTreeLocation_(start), condition, ifClause, elseClause);
    },

    // 12.6 Iteration Statements

    // 12.6.1 The do-while Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseDoWhileStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.DO);
      var body = this.parseStatement_();
      this.eat_(TokenType.WHILE);
      this.eat_(TokenType.OPEN_PAREN);
      var condition = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      this.eatPossibleImplicitSemiColon_();
      return new DoWhileStatement(this.getTreeLocation_(start), body, condition);
    },

    // 12.6.2 The while Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseWhileStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.WHILE);
      this.eat_(TokenType.OPEN_PAREN);
      var condition = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new WhileStatement(this.getTreeLocation_(start), condition, body);
    },

    // 12.6.3 The for Statement
    // 12.6.4 The for-in Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseForStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.FOR);
      this.eat_(TokenType.OPEN_PAREN);

      var self = this;
      function validate(variables, kind) {
        if (variables.declarations.length > 1) {
          self.reportError_(kind +
              ' statement may not have more than one variable declaration');
        }
        var declaration = variables.declarations[0];
        if (declaration.lvalue.isPattern() && declaration.initializer) {
          self.reportError_(declaration.initializer.location,
              'initializer is not allowed in ' + kind + ' loop with pattern');
        }

      }

      if (this.peekVariableDeclarationList_()) {
        var variables =
           this.parseVariableDeclarationList_(
              Expression.NO_IN, DestructuringInitializer.OPTIONAL);
        if (this.peek_(TokenType.IN)) {
          // for-in: only one declaration allowed
          validate(variables, 'for-in');

          var declaration = variables.declarations[0];
          // for-in: if let/const binding used, initializer is illegal
          if (options.blockBinding &&
              (variables.declarationType == TokenType.LET ||
               variables.declarationType == TokenType.CONST)) {
            if (declaration.initializer != null) {
               this.reportError_('let/const in for-in statement may not have initializer');
            }
          }

          return this.parseForInStatement_(start, variables);
        } else if (this.peekOf_()) {
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

      if (this.peek_(TokenType.SEMI_COLON)) {
        return this.parseForStatement2_(start, null);
      }

      var initializer = this.parseExpression_(Expression.NO_IN);
      if (initializer.isLeftHandSideExpression() &&
          (this.peek_(TokenType.IN) || this.peekOf_())) {
        initializer = this.transformLeftHandSideExpression_(initializer);
        if (this.peekOf_())
          return this.parseForOfStatement_(start, initializer);
        return this.parseForInStatement_(start, initializer);
      }

      return this.parseForStatement2_(start, initializer);
    },

    peekOf_: function() {
      return options.forOf && this.peekPredefinedString_(PredefinedName.OF);
    },

    // The for-each Statement
    // for  (  { let | var }  identifier  of  expression  )  statement
    /**
     * @param {SourcePosition} start
     * @param {ParseTree} initializer
     * @return {ParseTree}
     * @private
     */
    parseForOfStatement_: function(start, initializer) {
      this.eatId_(); // of
      var collection = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new ForOfStatement(this.getTreeLocation_(start), initializer, collection, body);
    },

    /**
     * Checks variable declaration in variable and for statements.
     *
     * @param {VariableDeclarationList} variables
     * @return {void}
     * @private
     */
    checkInitializers_: function(variables) {
      if (options.blockBinding &&
          variables.declarationType == TokenType.CONST) {
        var type = variables.declarationType;
        for (var i = 0; i < variables.declarations.length; i++) {
          if (!this.checkInitializer_(type, variables.declarations[i])) {
            break;
          }
        }
      }
    },

    /**
     * Checks variable declaration
     *
     * @param {TokenType} type
     * @param {VariableDeclaration} declaration
     * @return {boolan} Whether the initializer is correct.
     * @private
     */
    checkInitializer_: function(type, declaration) {
      if (options.blockBinding && type == TokenType.CONST &&
          declaration.initializer == null) {
        this.reportError_('const variables must have an initializer');
        return false;
      }
      return true;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekVariableDeclarationList_: function() {
      switch (this.peekType_()) {
        case TokenType.VAR:
          return true;
        case TokenType.CONST:
        case TokenType.LET:
          return options.blockBinding;
        default:
          return false;
      }
    },

    // 12.6.3 The for Statement
    /**
     * @param {SourcePosition} start
     * @param {ParseTree} initializer
     * @return {ParseTree}
     * @private
     */
    parseForStatement2_: function(start, initializer) {
      this.eat_(TokenType.SEMI_COLON);

      var condition = null;
      if (!this.peek_(TokenType.SEMI_COLON)) {
        condition = this.parseExpression_();
      }
      this.eat_(TokenType.SEMI_COLON);

      var increment = null;
      if (!this.peek_(TokenType.CLOSE_PAREN)) {
        increment = this.parseExpression_();
      }
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new ForStatement(this.getTreeLocation_(start), initializer, condition, increment, body);
    },

    // 12.6.4 The for-in Statement
    /**
     * @param {SourcePosition} start
     * @param {ParseTree} initializer
     * @return {ParseTree}
     * @private
     */
    parseForInStatement_: function(start, initializer) {
      this.eat_(TokenType.IN);
      var collection = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new ForInStatement(this.getTreeLocation_(start), initializer, collection, body);
    },

    // 12.7 The continue Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseContinueStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.CONTINUE);
      var name = null;
      if (!this.peekImplicitSemiColon_()) {
        name = this.eatIdOpt_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ContinueStatement(this.getTreeLocation_(start), name);
    },

    // 12.8 The break Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseBreakStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.BREAK);
      var name = null;
      if (!this.peekImplicitSemiColon_()) {
        name = this.eatIdOpt_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new BreakStatement(this.getTreeLocation_(start), name);
    },

    //12.9 The return Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseReturnStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.RETURN);
      var expression = null;
      if (!this.peekImplicitSemiColon_()) {
        expression = this.parseExpression_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ReturnStatement(this.getTreeLocation_(start), expression);
    },

    // Harmony: The yield Statement
    //  yield  [expression];
    /**
     * @return {ParseTree}
     * @private
     */
    parseYieldStatement_: function() {
      if (!this.allowYield_) {
        return this.parseMissingPrimaryExpression_(
            "'yield' expressions are only allowed inside 'function*'");
      }

      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.YIELD);
      var expression = null;
      var isYieldFor = this.eatOpt_(TokenType.STAR) != null;
      if (isYieldFor || !this.peekImplicitSemiColon_()) {
        expression = this.parseExpression_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new YieldStatement(
          this.getTreeLocation_(start), expression, isYieldFor);
    },

    // Harmony?: The await Statement
    // TODO: await should be an expression, not a statement
    // await[ identifier = ] expression;
    /**
     * @return {ParseTree}
     * @private
     */
    parseAwaitStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.AWAIT);
      var identifier = null;
      if (this.peek_(TokenType.IDENTIFIER) && this.peek_(TokenType.EQUAL, 1)) {
        identifier = this.eatId_();
        this.eat_(TokenType.EQUAL);
      }
      var expression = this.parseExpression_();
      this.eatPossibleImplicitSemiColon_();
      return new AwaitStatement(this.getTreeLocation_(start), identifier, expression);
    },

    // 12.10 The with Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseWithStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.WITH);
      this.eat_(TokenType.OPEN_PAREN);
      var expression = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new WithStatement(this.getTreeLocation_(start), expression, body);
    },

    // 12.11 The switch Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseSwitchStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SWITCH);
      this.eat_(TokenType.OPEN_PAREN);
      var expression = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      this.eat_(TokenType.OPEN_CURLY);
      var caseClauses = this.parseCaseClauses_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new SwitchStatement(this.getTreeLocation_(start), expression, caseClauses);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseCaseClauses_: function() {
      var foundDefaultClause = false;
      var result = [];

      while (true) {
        var start = this.getTreeStartLocation_();
        switch (this.peekType_()) {
          case TokenType.CASE:
            this.eat_(TokenType.CASE);
            var expression = this.parseExpression_();
            this.eat_(TokenType.COLON);
            var statements = this.parseCaseStatementsOpt_();
            result.push(new CaseClause(this.getTreeLocation_(start), expression, statements));
            break;
          case TokenType.DEFAULT:
            if (foundDefaultClause) {
              this.reportError_('Switch statements may have at most one default clause');
            } else {
              foundDefaultClause = true;
            }
            this.eat_(TokenType.DEFAULT);
            this.eat_(TokenType.COLON);
            result.push(new DefaultClause(this.getTreeLocation_(start), this.parseCaseStatementsOpt_()));
            break;
          default:
            return result;
        }
      }
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseCaseStatementsOpt_: function() {
      return this.parseStatementList_();
    },

    // 12.12 Labelled Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseLabelledStatement_: function() {
      var start = this.getTreeStartLocation_();
      var name = this.eatId_();
      this.eat_(TokenType.COLON);
      return new LabelledStatement(this.getTreeLocation_(start), name,
                                   this.parseStatement_());
    },

    /**
     * @return {boolean}
     * @private
     */
    peekLabelledStatement_: function() {
      return this.peek_(TokenType.IDENTIFIER) &&
          this.peek_(TokenType.COLON, 1);
    },

    // 12.13 Throw Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseThrowStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.THROW);
      var value = null;
      if (!this.peekImplicitSemiColon_()) {
        value = this.parseExpression_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ThrowStatement(this.getTreeLocation_(start), value);
    },

    // 12.14 Try Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseTryStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.TRY);
      var body = this.parseBlock_();
      var catchBlock = null;
      if (this.peek_(TokenType.CATCH)) {
        catchBlock = this.parseCatch_();
      }
      var finallyBlock = null;
      if (this.peek_(TokenType.FINALLY)) {
        finallyBlock = this.parseFinallyBlock_();
      }
      if (catchBlock == null && finallyBlock == null) {
        this.reportError_("'catch' or 'finally' expected.");
      }
      return new TryStatement(this.getTreeLocation_(start), body, catchBlock, finallyBlock);
    },

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
    parseCatch_: function() {
      var start = this.getTreeStartLocation_();
      var catchBlock;
      this.eat_(TokenType.CATCH);
      this.eat_(TokenType.OPEN_PAREN);
      var binding;
      if (this.peekPattern_())
        binding = this.parseBindingPattern_();
      else
        binding = this.parseBindingIdentifier_();
      this.eat_(TokenType.CLOSE_PAREN);
      var catchBody = this.parseBlock_();
      catchBlock = new Catch(this.getTreeLocation_(start), binding,
                             catchBody);
      return catchBlock;
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseFinallyBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.FINALLY);
      var finallyBlock = this.parseBlock_();
      return new Finally(this.getTreeLocation_(start), finallyBlock);
    },

    // 12.15 The Debugger Statement
    /**
     * @return {ParseTree}
     * @private
     */
    parseDebuggerStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.DEBUGGER);
      this.eatPossibleImplicitSemiColon_();

      return new DebuggerStatement(this.getTreeLocation_(start));
    },

    // 11.1 Primary Expressions
    /**
     * @return {ParseTree}
     * @private
     */
    parsePrimaryExpression_: function() {
      switch (this.peekType_()) {
        case TokenType.CLASS:
          return options.classes ?
              this.parseClassExpression_() :
              this.parseMissingPrimaryExpression_();
        case TokenType.SUPER:
          return this.parseSuperExpression_();
        case TokenType.THIS:
          return this.parseThisExpression_();
        case TokenType.IDENTIFIER:
          return this.parseIdentifierExpression_();
        case TokenType.NUMBER:
        case TokenType.STRING:
        case TokenType.TRUE:
        case TokenType.FALSE:
        case TokenType.NULL:
          return this.parseLiteralExpression_();
        case TokenType.OPEN_SQUARE:
          return this.parseArrayLiteral_();
        case TokenType.OPEN_CURLY:
          return this.parseObjectLiteral_();
        case TokenType.OPEN_PAREN:
          return this.parseParenExpression_();
        case TokenType.SLASH:
        case TokenType.SLASH_EQUAL:
          return this.parseRegularExpressionLiteral_();
        case TokenType.BACK_QUOTE:
          return this.parseQuasiLiteral_(null);
        case TokenType.AT_NAME:
          return this.parseAtNameExpression_();
        default:
          return this.parseMissingPrimaryExpression_();
      }
    },

    /**
     * @return {SuperExpression}
     * @private
     */
    parseSuperExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SUPER);
      return new SuperExpression(this.getTreeLocation_(start));
    },

    /**
     * @return {ThisExpression}
     * @private
     */
    parseThisExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.THIS);
      return new ThisExpression(this.getTreeLocation_(start));
    },

    peekBindingIdentifier_: function(opt_index) {
      return this.peekId_(opt_index || 0);
    },

    parseBindingIdentifier_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new BindingIdentifier(this.getTreeLocation_(start), identifier);
    },

    /**
     * @return {IdentifierExpression}
     * @private
     */
    parseIdentifierExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new IdentifierExpression(this.getTreeLocation_(start), identifier);
    },

    /**
     * Special case of parseIdentifierExpression_ which allows keywords.
     * @return {IdentifierExpression}
     * @private
     */
    parseIdentifierNameExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatIdName_();
      return new IdentifierExpression(this.getTreeLocation_(start), identifier);
    },

    parseAtNameExpression_: function() {
      var start = this.getTreeStartLocation_();
      var atName = this.eat_(TokenType.AT_NAME);
      return new AtNameExpression(this.getTreeLocation_(start), atName);
    },

    /**
     * @return {LiteralExpression}
     * @private
     */
    parseLiteralExpression_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextLiteralToken_();
      return new LiteralExpression(this.getTreeLocation_(start), literal);
    },

    /**
     * @return {Token}
     * @private
     */
    nextLiteralToken_: function() {
      return this.nextToken_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseRegularExpressionLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextRegularExpressionLiteralToken_();
      return new LiteralExpression(this.getTreeLocation_(start), literal);
    },

    peekSpread_: function() {
      return this.peek_(TokenType.DOT_DOT_DOT);
    },

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
    parseArrayLiteral_: function() {

      var start = this.getTreeStartLocation_();
      var expression;
      var elements = [];
      var allowFor = options.arrayComprehension;

      this.eat_(TokenType.OPEN_SQUARE);
      while (this.peek_(TokenType.COMMA) ||
             this.peekSpread_() ||
             this.peekAssignmentExpression_()) {
        if (this.peek_(TokenType.COMMA)) {
          expression = new NullTree();
          allowFor = false;
        } else {
          expression = this.parseAssignmentOrSpread_();
        }

        if (allowFor && this.peek_(TokenType.FOR))
          return this.parseArrayComprehension_(start, expression);

        allowFor = false;
        elements.push(expression);

        if (!this.peek_(TokenType.CLOSE_SQUARE)) {
          this.eat_(TokenType.COMMA);
        }
      }
      this.eat_(TokenType.CLOSE_SQUARE);
      return new ArrayLiteralExpression(
          this.getTreeLocation_(start), elements);
    },

    /**
     * Continues parsing array comprehension.
     *
     * ArrayComprehension :
     *   [ Assignment ￼ ComprehensionForList ]
     *   [ AssignmentExpression ComprehensionForList if
     *
     * ComprehensionForList :
     *   ComprehensionFor
     *   ComprehensionForList ComprehensionFor
     *
     * ComprehensionFor :
     *   for ForBinding of Expression
     *
     * ForBinding :
     *   BindingIdentifier
     *   BindingPattern
     *
     * @param {Location} start
     * @param {[ParseTree} expression
     * @return {ParseTree}
     */
    parseArrayComprehension_: function(start, expression) {
      var comprehensionForList = this.parseComprehensionForList_();
      var ifExpression = this.parseComprehensionIf_();
      this.eat_(TokenType.CLOSE_SQUARE);
      return new ArrayComprehension(this.getTreeLocation_(start),
                                    expression,
                                    comprehensionForList,
                                    ifExpression);
    },

    // 11.1.4 Object Literal Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parseObjectLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var result = [];

      this.eat_(TokenType.OPEN_CURLY);
      while (this.peekPropertyAssignment_()) {
        if (this.peekGetAccessor_()) {
          result.push(this.parseGetAccessor_());
          if (!this.eatPropertyOptionalComma_())
            break;
        } else if (this.peekSetAccessor_()) {
          result.push(this.parseSetAccessor_());
          if (!this.eatPropertyOptionalComma_())
            break;

        // http://wiki.ecmascript.org/doku.php?id=harmony:concise_object_literal_extensions#methods
        } else if (this.peekPropertyMethodAssignment_()) {
          result.push(this.parsePropertyMethodAssignment_());
          if (!this.eatPropertyOptionalComma_())
            break;

        } else {
          result.push(this.parsePropertyNameAssignment_());
          // Comma is required after name assignment.
          if (!this.eatOpt_(TokenType.COMMA)) {
            break;
          }
        }
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
    },

    eatPropertyOptionalComma_: function() {
      return this.eatOpt_(TokenType.COMMA) || options.propertyOptionalComma;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPropertyAssignment_: function() {
      var index = +this.peek_(TokenType.STAR);
      return this.peekPropertyName_(index);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPropertyName_: function(tokenIndex) {
      var type = this.peekType_(tokenIndex);
      switch (type) {
        case TokenType.AT_NAME:
          return options.privateNameSyntax;
        case TokenType.IDENTIFIER:
        case TokenType.STRING:
        case TokenType.NUMBER:
          return true;
        default:
          return Keywords.isKeyword(type);
      }
    },

    /**
     * @return {boolean}
     * @private
     */
    peekGetAccessor_: function() {
      return this.peekPredefinedString_(PredefinedName.GET) &&
          this.peekPropertyName_(1);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPredefinedString_: function(string, opt_index) {
      var index = opt_index || 0;
      return this.peek_(TokenType.IDENTIFIER, index) && this.peekToken_(index).value === string;
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseGetAccessor_: function() {
      var start = this.getTreeStartLocation_();

      this.eatId_(); // get
      var propertyName = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseFunctionBody_(false);
      return new GetAccessor(this.getTreeLocation_(start), propertyName, body);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekSetAccessor_: function() {
      return this.peekPredefinedString_(PredefinedName.SET) &&
          this.peekPropertyName_(1);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseSetAccessor_: function() {
      var start = this.getTreeStartLocation_();
      this.eatId_(); // set
      var propertyName = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      var parameter = this.parsePropertySetParameterList_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseFunctionBody_(false);
      return new SetAccessor(this.getTreeLocation_(start), propertyName,
                             parameter, body);
    },

    /**
     * PropertySetParameterList :
     *   BindingIdentifier
     *   BindingPattern
     */
    parsePropertySetParameterList_: function() {
      var start = this.getTreeStartLocation_();

      var binding;
      if (this.peekPattern_())
        binding = this.parseBindingPattern_();
      else
        binding = this.parseBindingIdentifier_();

      return new BindingElement(this.getTreeLocation_(start), binding, null);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parsePropertyNameAssignment_: function() {
      var start = this.getTreeStartLocation_();
      // http://wiki.ecmascript.org/doku.php?id=strawman:object_initialiser_shorthand
      if (this.peek_(TokenType.COLON, 1)) {
        var name = this.nextToken_();
        this.eat_(TokenType.COLON);
        var value = this.parseAssignmentExpression_();
        return new PropertyNameAssignment(this.getTreeLocation_(start), name,
                                          value);
      } else {
        return this.parsePropertyNameShorthand_();
      }
    },

    peekPropertyMethodAssignment_: function() {
      var index = +this.peek_(TokenType.STAR);
      return options.propertyMethods &&
          this.peekPropertyName_(index) &&
          this.peek_(TokenType.OPEN_PAREN, index + 1);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parsePropertyMethodAssignment_: function() {
      var start = this.getTreeStartLocation_();
      // Note that parsePropertyAssignment_ already limits name to String,
      // Number & IdentfierName.
      var isGenerator = this.eatOpt_(TokenType.STAR) != null;
      var name = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(TokenType.CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_(isGenerator);
      return new PropertyMethodAssignment(this.getTreeLocation_(start),
          name, isGenerator, formalParameterList, functionBody);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parsePropertyNameShorthand_: function() {
      var start = this.getTreeStartLocation_();
      var name = this.eatId_();
      if (!options.propertyNameShorthand) {
        this.eat_(TokenType.COLON);
        return null;
      }

      return new PropertyNameShorthand(this.getTreeLocation_(start), name);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseParenExpression_: function() {
      // Parse arrow function will return a ParenExpression if there isn't an
      // arrow after the ( CoverFormals ).
      return this.parseArrowFunction_();
    },

    /**
     * @param {string=} opt_message Error message to report.
     * @return {ParseTree}
     * @private
     */
    parseMissingPrimaryExpression_: function(opt_message) {
      var start = this.getTreeStartLocation_();
      this.reportError_(opt_message || 'primary expression expected');
      var token = this.nextToken_();
      return new MissingPrimaryExpression(this.getTreeLocation_(start), token);
    },

    // 11.14 Expressions

    /**
     * @return {boolean}
     * @private
     */
    peekExpression_: function(opt_index) {
      switch (this.peekType_(opt_index || 0)) {
        case TokenType.BACK_QUOTE:
          return options.quasi;
        case TokenType.AT_NAME:
          return options.privateNameSyntax;
        case TokenType.BANG:
        case TokenType.CLASS:
        case TokenType.DELETE:
        case TokenType.FALSE:
        case TokenType.FUNCTION:
        case TokenType.IDENTIFIER:
        case TokenType.MINUS:
        case TokenType.MINUS_MINUS:
        case TokenType.NEW:
        case TokenType.NULL:
        case TokenType.NUMBER:
        case TokenType.OPEN_CURLY:
        case TokenType.OPEN_PAREN:
        case TokenType.OPEN_SQUARE:
        case TokenType.PLUS:
        case TokenType.PLUS_PLUS:
        case TokenType.SLASH: // regular expression literal
        case TokenType.SLASH_EQUAL:
        case TokenType.STRING:
        case TokenType.SUPER:
        case TokenType.THIS:
        case TokenType.TILDE:
        case TokenType.TRUE:
        case TokenType.TYPEOF:
        case TokenType.VOID:
          return true;
        default:
          return false;
      }
    },

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
     * @private
     */
    parseExpression_: function(opt_expressionIn) {
      var expressionIn = opt_expressionIn || Expression.IN;
      var start = this.getTreeStartLocation_();
      var result = this.parseAssignmentExpression_(expressionIn);
      if (this.peek_(TokenType.COMMA)) {
        var exprs = [];
        exprs.push(result);
        // Lookahead to prevent comma expression from consuming , ...
        while (this.peek_(TokenType.COMMA) &&
               this.peekAssignmentExpression_(1)) {
          this.eat_(TokenType.COMMA);
          exprs.push(this.parseAssignmentExpression_(expressionIn));
        }
        return new CommaExpression(this.getTreeLocation_(start), exprs);
      }
      return result;
    },

    // 11.13 Assignment expressions

    /**
     * @return {boolean}
     * @private
     */
    peekAssignmentExpression_: function(opt_index) {
      return this.peekExpression_(opt_index || 0);
    },

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
     * @private
     */
    parseAssignmentExpression_: function(opt_expressionIn) {
      if (this.peekBindingIdentifier_() && this.peekArrow_(1))
        return this.parseArrowFunction_();
      // The remaining arrow function cases are handled in
      // parseParenExpression_.

      var expressionIn = opt_expressionIn || Expression.NORMAL;
      var start = this.getTreeStartLocation_();

      var left = this.parseConditional_(expressionIn);
      if (this.peekAssignmentOperator_()) {
        if (this.peek_(TokenType.EQUAL))
          left = this.transformLeftHandSideExpression_(left);

        if (!left.isLeftHandSideExpression() && !left.isPattern()) {
          this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
        }
        var operator = this.nextToken_();
        var right = this.parseAssignmentExpression_(expressionIn);
        return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * Transforms a LeftHandSideExpression into a AssignmentPattern if possible.
     * This returns the transformed tree if it parses as an AssignmentPattern,
     * otherwise it returns the original tree.
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    transformLeftHandSideExpression_: function(tree) {
      switch (tree.type) {
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
          var errorReporter = new MutedErrorReporter();
          var p = new Parser(errorReporter,
                             this.scanner_.getFile(),
                             tree.location.start.offset);
          var transformedTree = p.parseAssignmentPattern_();
          if (!errorReporter.hadError())
            return transformedTree;
          break;

        case ParseTreeType.PAREN_EXPRESSION:
          var expression =
              this.transformLeftHandSideExpression_(tree.expression);
          if (expression !== tree.expression)
            return new ParenExpression(tree.location, expression);
      }
      return tree;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekAssignmentOperator_: function() {
      var token = this.peekToken_();
      return !!token && token.isAssignmentOperator();
    },

    // 11.12 Conditional Expression
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseConditional_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var condition = this.parseLogicalOR_(expressionIn);
      if (this.peek_(TokenType.QUESTION)) {
        this.eat_(TokenType.QUESTION);
        var left = this.parseAssignmentExpression_();
        this.eat_(TokenType.COLON);
        var right = this.parseAssignmentExpression_(expressionIn);
        return new ConditionalExpression(this.getTreeLocation_(start), condition, left, right);
      }
      return condition;
    },

    // 11.11 Logical OR
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseLogicalOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseLogicalAND_(expressionIn);
      while (this.peek_(TokenType.OR)) {
        var operator = this.eat_(TokenType.OR);
        var right = this.parseLogicalAND_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    // 11.11 Logical AND
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseLogicalAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseOR_(expressionIn);
      while (this.peek_(TokenType.AND)) {
        var operator = this.eat_(TokenType.AND);
        var right = this.parseBitwiseOR_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    // 11.10 Bitwise OR
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseBitwiseOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseXOR_(expressionIn);
      while (this.peek_(TokenType.BAR)) {
        var operator = this.eat_(TokenType.BAR);
        var right = this.parseBitwiseXOR_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    // 11.10 Bitwise XOR
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseBitwiseXOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseAND_(expressionIn);
      while (this.peek_(TokenType.CARET)) {
        var operator = this.eat_(TokenType.CARET);
        var right = this.parseBitwiseAND_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    // 11.10 Bitwise AND
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseBitwiseAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseEquality_(expressionIn);
      while (this.peek_(TokenType.AMPERSAND)) {
        var operator = this.eat_(TokenType.AMPERSAND);
        var right = this.parseEquality_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    // 11.9 Equality Expression
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseEquality_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseRelational_(expressionIn);
      while (this.peekEqualityOperator_()) {
        var operator = this.nextToken_();
        var right = this.parseRelational_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekEqualityOperator_: function() {
      switch (this.peekType_()) {
        case TokenType.EQUAL_EQUAL:
        case TokenType.NOT_EQUAL:
        case TokenType.EQUAL_EQUAL_EQUAL:
        case TokenType.NOT_EQUAL_EQUAL:
          return true;
        default:
          if (!options.isExpression)
            return false;
          var token = this.peekTokenNoLineTerminator_();
          return token && token.type === TokenType.IDENTIFIER &&
              (token.value === PredefinedName.IS ||
               token.value === PredefinedName.ISNT);
      }
    },

    // 11.8 Relational
    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseRelational_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseShiftExpression_();
      while (this.peekRelationalOperator_(expressionIn)) {
        var operator = this.nextToken_();
        var right = this.parseShiftExpression_();
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * @param {Expression} expressionIn
     * @return {boolean}
     * @private
     */
    peekRelationalOperator_: function(expressionIn) {
      switch (this.peekType_()) {
        case TokenType.OPEN_ANGLE:
        case TokenType.CLOSE_ANGLE:
        case TokenType.GREATER_EQUAL:
        case TokenType.LESS_EQUAL:
        case TokenType.INSTANCEOF:
          return true;
        case TokenType.IN:
          return expressionIn == Expression.NORMAL;
        default:
          return false;
      }
    },

    // 11.7 Shift Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parseShiftExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseAdditiveExpression_();
      while (this.peekShiftOperator_()) {
        var operator = this.nextToken_();
        var right = this.parseAdditiveExpression_();
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekShiftOperator_: function() {
      switch (this.peekType_()) {
        case TokenType.LEFT_SHIFT:
        case TokenType.RIGHT_SHIFT:
        case TokenType.UNSIGNED_RIGHT_SHIFT:
          return true;
        default:
          return false;
      }
    },

    // 11.6 Additive Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parseAdditiveExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseMultiplicativeExpression_();
      while (this.peekAdditiveOperator_()) {
        var operator = this.nextToken_();
        var right = this.parseMultiplicativeExpression_();
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekAdditiveOperator_: function() {
      switch (this.peekType_()) {
        case TokenType.PLUS:
        case TokenType.MINUS:
          return true;
        default:
          return false;
      }
    },

    // 11.5 Multiplicative Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parseMultiplicativeExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseUnaryExpression_();
      while (this.peekMultiplicativeOperator_()) {
        var operator = this.nextToken_();
        var right = this.parseUnaryExpression_();
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekMultiplicativeOperator_: function() {
      switch (this.peekType_()) {
        case TokenType.STAR:
        case TokenType.SLASH:
        case TokenType.PERCENT:
          return true;
        default:
          return false;
      }
    },

    // 11.4 Unary Operator
    /**
     * @return {ParseTree}
     * @private
     */
    parseUnaryExpression_: function() {
      var start = this.getTreeStartLocation_();
      if (this.peekUnaryOperator_()) {
        var operator = this.nextToken_();
        var operand = this.parseUnaryExpression_();
        return new UnaryExpression(this.getTreeLocation_(start), operator, operand);
      }
      return this.parsePostfixExpression_();
    },

    /**
     * @return {boolean}
     * @private
     */
    peekUnaryOperator_: function() {
      switch (this.peekType_()) {
        case TokenType.DELETE:
        case TokenType.VOID:
        case TokenType.TYPEOF:
        case TokenType.PLUS_PLUS:
        case TokenType.MINUS_MINUS:
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.TILDE:
        case TokenType.BANG:
          return true;
        default:
          return false;
      }
    },

    // 11.3 Postfix Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parsePostfixExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseLeftHandSideExpression_();
      while (this.peekPostfixOperator_()) {
        var operator = this.nextToken_();
        operand = new PostfixExpression(this.getTreeLocation_(start), operand, operator);
      }
      return operand;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPostfixOperator_: function() {
      if (this.peekImplicitSemiColon_()) {
        return false;
      }
      switch (this.peekType_()) {
        case TokenType.PLUS_PLUS:
        case TokenType.MINUS_MINUS:
          return true;
        default:
          return false;
      }
    },

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
    parseLeftHandSideExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseNewExpression_();

      // this test is equivalent to is member expression
      if (!(operand instanceof NewExpression) || operand.args != null) {

        // The Call expression productions
        while (this.peekCallSuffix_()) {
          switch (this.peekType_()) {
            case TokenType.OPEN_PAREN:
              var args = this.parseArguments_();
              operand = new CallExpression(this.getTreeLocation_(start),
                                           operand, args);
              break;
            case TokenType.OPEN_SQUARE:
              this.eat_(TokenType.OPEN_SQUARE);
              var member = this.parseExpression_();
              this.eat_(TokenType.CLOSE_SQUARE);
              operand = new MemberLookupExpression(this.getTreeLocation_(start),
                                                   operand, member);
              break;
            case TokenType.PERIOD:
              this.eat_(TokenType.PERIOD);
              operand = new MemberExpression(this.getTreeLocation_(start),
                                             operand, this.eatIdName_());
              break;
            case TokenType.PERIOD_OPEN_CURLY:
              var expressions = this.parseCascadeExpressions_();
              operand = new CascadeExpression(this.getTreeLocation_(start),
                                              operand, expressions);
              break;
            case TokenType.BACK_QUOTE:
              operand = this.parseQuasiLiteral_(operand);
              break;
          }
        }
      }
      return operand;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekCallSuffix_: function() {
      return this.peek_(TokenType.OPEN_PAREN) ||
          this.peek_(TokenType.OPEN_SQUARE) ||
          this.peek_(TokenType.PERIOD) ||
          options.quasi && this.peek_(TokenType.BACK_QUOTE) ||
          options.cascadeExpression && this.peek_(TokenType.PERIOD_OPEN_CURLY);
    },

    // 11.2 Member Expression without the new production
    /**
     * @return {ParseTree}
     * @private
     */
    parseMemberExpressionNoNew_: function() {
      var start = this.getTreeStartLocation_();
      var operand;
      if (this.peekFunction_()) {
        operand = this.parseFunctionExpression_();
      } else {
        operand = this.parsePrimaryExpression_();
      }

      while (this.peekMemberExpressionSuffix_()) {
        switch (this.peekType_()) {
          case TokenType.OPEN_SQUARE:
            this.eat_(TokenType.OPEN_SQUARE);
            var member = this.parseExpression_();
            this.eat_(TokenType.CLOSE_SQUARE);
            operand = new MemberLookupExpression(this.getTreeLocation_(start),
                                                 operand, member);
            break;

          case TokenType.PERIOD:
            this.eat_(TokenType.PERIOD);
            var name;
            if (this.peek_(TokenType.AT_NAME))
              name = this.eat_(TokenType.AT_NAME);
            else
              name = this.eatIdName_();
            operand = new MemberExpression(this.getTreeLocation_(start),
                                           operand, name);
            break;

          case TokenType.PERIOD_OPEN_CURLY:
            var expressions = this.parseCascadeExpressions_();
            operand = new CascadeExpression(this.getTreeLocation_(start),
                                            operand, expressions);
            break;

          case TokenType.BACK_QUOTE:
            operand = this.parseQuasiLiteral_(operand);
            break;
        }
      }
      return operand;
    },

    parseCascadeExpressions_: function() {
      this.eat_(TokenType.PERIOD_OPEN_CURLY);
      var expressions = [];
      while (this.peekId_() && this.peekAssignmentExpression_()) {
        expressions.push(this.parseCascadeExpression_());
        this.eatPossibleImplicitSemiColon_();
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return expressions;
    },

    parseCascadeExpression_: function() {
      var expr = this.parseAssignmentExpression_();
      var operand;
      switch (expr.type) {
        case ParseTreeType.CALL_EXPRESSION:
        case ParseTreeType.MEMBER_EXPRESSION:
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        case ParseTreeType.CASCADE_EXPRESSION:
          operand = expr.operand;
          break;
        case ParseTreeType.BINARY_OPERATOR:
          operand = expr.left;
          break;
        default:
          this.reportError_(expr.location,
                            'Invalid expression. Type: ' + expr.type);
      }

      if (operand) {
        switch (operand.type) {
          case ParseTreeType.MEMBER_EXPRESSION:
          case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
          case ParseTreeType.CALL_EXPRESSION:
          case ParseTreeType.CASCADE_EXPRESSION:
          case ParseTreeType.IDENTIFIER_EXPRESSION:
            break;
          default:
            this.reportError_(operand.location,
                              'Invalid expression: ' + operand.type);
        }
      }

      if (expr.type == ParseTreeType.BINARY_OPERATOR &&
          !expr.operator.isAssignmentOperator()) {
        this.reportError_(expr.operator, 'Invalid operator: ' + expr.operator);
      }

      return expr;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekMemberExpressionSuffix_: function() {
      return this.peek_(TokenType.OPEN_SQUARE) ||
          this.peek_(TokenType.PERIOD) ||
          options.quasi && this.peek_(TokenType.BACK_QUOTE) ||
          options.cascadeExpression && this.peek_(TokenType.PERIOD_OPEN_CURLY);
    },

    // 11.2 New Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parseNewExpression_: function() {
      if (this.peek_(TokenType.NEW)) {
        var start = this.getTreeStartLocation_();
        this.eat_(TokenType.NEW);
        var operand = this.parseNewExpression_();
        var args = null;
        if (this.peek_(TokenType.OPEN_PAREN)) {
          args = this.parseArguments_();
        }
        return new NewExpression(this.getTreeLocation_(start), operand, args);
      } else {
        return this.parseMemberExpressionNoNew_();
      }
    },

    /**
     * @return {ArgumentList}
     * @private
     */
    parseArguments_: function() {
      // ArgumentList :
      //   AssignmentOrSpreadExpression
      //   ArgumentList , AssignmentOrSpreadExpression
      //
      // AssignmentOrSpreadExpression :
      //   ... AssignmentExpression
      //   AssignmentExpression

      var start = this.getTreeStartLocation_();
      var args = [];

      this.eat_(TokenType.OPEN_PAREN);
      while (this.peekAssignmentOrRest_()) {
        args.push(this.parseAssignmentOrSpread_());

        if (!this.peek_(TokenType.CLOSE_PAREN)) {
          this.eat_(TokenType.COMMA);
        }
      }
      this.eat_(TokenType.CLOSE_PAREN);
      return new ArgumentList(this.getTreeLocation_(start), args);
    },

    peekRest_: function(opt_index) {
      return options.restParameters &&
          this.peek_(TokenType.DOT_DOT_DOT, opt_index || 0);
    },

    /**
     * Whether we have a spread expression or an assignment next.
     *
     * This does not peek the operand for the spread expression. This means that
     * {@code parseAssignmentOrSpred} might still fail when this returns true.
     *
     * @return {boolean}
     * @private
     */
    peekAssignmentOrRest_: function() {
      return this.peekRest_() || this.peekAssignmentExpression_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseAssignmentOrSpread_: function() {
      if (this.peekSpread_()) {
        return this.parseSpreadExpression_();
      }
      return this.parseAssignmentExpression_();
    },

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
     *   ( ArrowFormalParameterList )
     *
     * ArrowFormalParameterList :
     *   [empty]
     *   FunctionRestParameter
     *   CoverFormalsList
     *   CoverFormalsList, FunctionRestParameter
     *
     * ConciseBody :
     *   [lookahead not {] AssignmentExpression
     *   { FunctionBody }
     *
     * CoverFormalsList :
     *   Expression
     *
     * @param {Expression=} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseArrowFunction_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var formals, coverFormals;

      // BindingIdentifier =>
      if (this.peekBindingIdentifier_() && this.peekArrow_(1)) {
        var id = this.parseBindingIdentifier_();
        formals = [new BindingElement(id.location, id, null)];

      // We got here through a ParenExpression.
      } else {
        this.eat_(TokenType.OPEN_PAREN);

        // () =>
        if (this.peek_(TokenType.CLOSE_PAREN)) {
          this.eat_(TokenType.CLOSE_PAREN);
          formals = [];

        // (...
        } else if (this.peekRest_()) {
          formals = [this.parseRestParameter_()];
          this.eat_(TokenType.CLOSE_PAREN);
        } else {
          coverFormals = this.parseExpression_();
          if (coverFormals.type === ParseTreeType.MISSING_PRIMARY_EXPRESSION)
            return coverFormals;

          // ( CoverFormals , ...
          if (this.peek_(TokenType.COMMA) && this.peekRest_(1)) {
            this.eat_(TokenType.COMMA);
            formals = this.reparseAsFormalsList_(coverFormals);
            if (formals)
              formals.push(this.parseRestParameter_());
            this.eat_(TokenType.CLOSE_PAREN);

          // Generator comprehension
          // ( CoverFormals for
          } else if (this.peek_(TokenType.FOR) &&
                     options.generatorComprehension) {
            return this.parseGeneratorComprehension_(start, coverFormals);

          // ( CoverFormals )
          } else {
            this.eat_(TokenType.CLOSE_PAREN);
            // ( CoverFormals ) =>
            if (this.peek_(TokenType.ARROW))
              formals = this.reparseAsFormalsList_(coverFormals);
          }
        }
      }

      // The cover grammar could not be parsed as FormalsList.
      if (!formals)
        return new ParenExpression(this.getTreeLocation_(start), coverFormals);

      this.eat_(TokenType.ARROW);

      var body = this.parseConciseBody_();
      var startLoc = this.getTreeLocation_(start);
      return new ArrowFunctionExpression(startLoc,
          new FormalParameterList(startLoc, formals),
          body);
    },

    /**
     * Reparses the {@code coverFormals} as a FormalsList. This returns null if
     * {@code coverFormals} cannot be parsed or fully consumed as a FormalsList.
     * @param {ParseTree} coverFormals The expression that started after the
     *     opening paren in an arrow function.
     * @return {Array.<ParseTree>} An aray with the items to use in a
     *     FormalsList or {@code null} if there was an error.
     */
    reparseAsFormalsList_: function(coverFormals) {
      var errorReporter = new MutedErrorReporter();
      var p = new Parser(errorReporter,
                         this.scanner_.getFile(),
                         coverFormals.location.start.offset);
      var formals = p.parseFormalsList_();

      // We need to consume the whole coverFormals.
      if (errorReporter.hadError() || !formals.length ||
          formals[formals.length - 1].location.end.offset !==
              coverFormals.location.end.offset) {
        return null;
      }
      return formals;
    },

    /** @returns {TokenType} */
    peekArrow_: function(opt_index) {
      return options.arrowFunctions && this.peek_(TokenType.ARROW, opt_index);
    },

    /**
     * ConciseBody :
     *   [lookahead not {] AssignmentExpression
     *   { FunctionBody }
     *
     * @param {boolean} isGenerator
     * @return {ParseTree}
     *
     * @return {ParseTree} */
    parseConciseBody_: function() {
      // The body can be a block or an expression. A '{' is always treated as
      // the beginning of a block.
      if (this.peek_(TokenType.OPEN_CURLY))
        return this.parseBlock_();
      return this.parseAssignmentExpression_();
    },

    /**
     * Continues parsing generator exressions. The opening paren and the
     * expression is parsed by parseArrowFunction_.
     *
     * https://bugs.ecmascript.org/show_bug.cgi?id=381
     *
     * GeneratorComprehension :
     *   ( Expression ComprehensionForList )
     *   ( Expression ComprehensionForList if Expression )
     *
     * ComprehensionForList :
     *   ComprehensionFor
     *   ComprehensionForList ComprehensionFor
     *
     * ComprehensionFor :
     *   for ForBinding of Expression
     */
    parseGeneratorComprehension_: function(start, expression) {
      var comprehensionForList = this.parseComprehensionForList_();
      var ifExpression = this.parseComprehensionIf_();
      this.eat_(TokenType.CLOSE_PAREN);
      return new GeneratorComprehension(this.getTreeLocation_(start),
                                        expression,
                                        comprehensionForList,
                                        ifExpression);
    },

    parseComprehensionForList_: function() {
      var comprehensionForList = [];
      while (this.peek_(TokenType.FOR)) {
        this.eat_(TokenType.FOR);
        var innerStart = this.getTreeStartLocation_();
        var left = this.parseForBinding_();
        this.eatId_(PredefinedName.OF);
        var iterator = this.parseExpression_();
        comprehensionForList.push(
            new ComprehensionFor(this.getTreeLocation_(innerStart),
                                 left, iterator));
      }
      return comprehensionForList;
    },

    parseComprehensionIf_: function() {
      if (this.peek_(TokenType.IF)) {
        this.eat_(TokenType.IF);
        return this.parseExpression_();
      }
      return null;
    },

    /**
     * ForBinding :
     *   BindingIdentifier
     *   BindingPattern
     */
    parseForBinding_: function() {
      if (this.peekPattern_())
        return this.parseBindingPattern_();
      return this.parseBindingIdentifier_();
    },

    // Destructuring; see
    // http://wiki.ecmascript.org/doku.php?id=harmony:destructuring
    //
    // SpiderMonkey is much more liberal in where it allows
    // parenthesized patterns, for example, it allows [x, ([y, z])] but
    // those inner parentheses aren't allowed in the grammar on the ES
    // wiki. This implementation conservatively only allows parentheses
    // at the top-level of assignment statements.

    peekPattern_: function(opt_index) {
      var index = opt_index || 0;
      return options.destructuring && (this.peekObjectPattern_(index) ||
          this.peekArrayPattern_(index));
    },

    peekArrayPattern_: function(opt_index) {
      return this.peek_(TokenType.OPEN_SQUARE, opt_index || 0);
    },

    peekObjectPattern_: function(opt_index) {
      return this.peek_(TokenType.OPEN_CURLY, opt_index || 0);
    },

    /**
     * BindingPattern :
     *   ObjectBindingPattern
     *   ArrayBindingPattern
     */
    parseBindingPattern_: function() {
      if (this.peekArrayPattern_())
        return this.parseArrayBindingPattern_();
      return this.parseObjectBindingPattern_();
    },

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
    parseArrayBindingPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(TokenType.OPEN_SQUARE);
      while (this.peekBindingElement_() ||
             this.peek_(TokenType.COMMA) ||
             this.peekRest_()) {
        this.parseElisionOpt_(elements);
        if (this.peekRest_()) {
          elements.push(this.parseBindingRestElement_());
          break;
        } else {
          elements.push(this.parseBindingElement_());
          // Trailing commas are not allowed in patterns.
          if (this.peek_(TokenType.COMMA) &&
              !this.peek_(TokenType.CLOSE_SQUARE, 1)) {
            this.eat_(TokenType.COMMA);
          }
        }
      }
      this.eat_(TokenType.CLOSE_SQUARE);
      return new ArrayPattern(this.getTreeLocation_(start), elements);
    },

    /**
     * BindingElementList :
     *   Elisionopt BindingElement
     *   BindingElementList , Elisionopt BindingElement
     */
    parseBindingElementList_: function(elements) {
      this.parseElisionOpt_(elements);
      elements.push(this.parseBindingElement_());
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        this.parseElisionOpt_(elements);
        elements.push(this.parseBindingElement_());
      }
    },

    /**
     * Parses the elision opt production and appends null to the
     * {@code elements} array for every empty elision.
     *
     * @param {Array} elements The array to append to.
     */
    parseElisionOpt_: function(elements) {
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        elements.push(null);
      }
    },

    /**
     * BindingElement :
     *   SingleNameBinding
     *   BindingPattern Initialiseropt
     *
     * SingleNameBinding :
     *   BindingIdentifier Initialiseropt
     */
    peekBindingElement_: function() {
      return this.peekBindingIdentifier_() || this.peekPattern_();
    },

    /**
     * @param {Initializer} opt_initializer If left out the initializer is
     *     optional and allowed. If set to Initializer.REQUIRED there must be an
     *     initializer.
     * @return {ParseTree}
     */
    parseBindingElement_: function(opt_initializer) {
      var start = this.getTreeStartLocation_();
      var binding;
      if (this.peekPattern_())
        binding = this.parseBindingPattern_();
      else
        binding = this.parseBindingIdentifier_();
      var initializer = null;
      if (this.peek_(TokenType.EQUAL) ||
          opt_initializer === Initializer.REQUIRED) {
        initializer = this.parseInitializer_();
      }
      return new BindingElement(this.getTreeLocation_(start), binding,
                                                      initializer);
    },

    /**
     * BindingRestElement :
     *   ... BindingIdentifier
     */
    parseBindingRestElement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.DOT_DOT_DOT);
      var identifier = this.parseBindingIdentifier_();
      return new SpreadPatternElement(this.getTreeLocation_(start), identifier);
    },

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
    parseObjectBindingPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(TokenType.OPEN_CURLY);
      while (this.peekBindingProperty_()) {
        elements.push(this.parseBindingProperty_());
        if (!this.peek_(TokenType.COMMA))
          break;
        this.eat_(TokenType.COMMA);
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ObjectPattern(this.getTreeLocation_(start), elements);
    },

    /**
     * BindingProperty :
     *   SingleNameBinding
     *   PropertyName : BindingElement
     *
     * SingleNameBinding :
     *   BindingIdentifier Initialiseropt
     */
    peekBindingProperty_: function() {
      return this.peekBindingIdentifier_() || this.peekPropertyName_();
    },

    parseBindingProperty_: function() {
      var start = this.getTreeStartLocation_();
      if (this.peek_(TokenType.COLON, 1)) {
        var propertyName = this.nextToken_();
        this.eat_(TokenType.COLON);
        var binding = this.parseBindingElement_();
        // TODO(arv): Rename ObjectPatternField to BindingProperty
        return new ObjectPatternField(this.getTreeLocation_(start),
                                      propertyName, binding);
      }

      var binding = this.parseBindingIdentifier_();
      var initializer = null;
      if (this.peek_(TokenType.EQUAL))
        initializer = this.parseInitializer_();
      return new BindingElement(this.getTreeLocation_(start), binding,
                                initializer);
    },

    /**
     * AssignmentPattern :
     *   ObjectAssignmentPattern
     *   ArrayAssignmentPattern
     */
    parseAssignmentPattern_: function() {
      if (this.peekObjectPattern_())
        return this.parseObjectAssignmentPattern_();
      return this.parseArrayAssignmentPattern_();
    },

    /**
     * ObjectAssignmentPattern :
     *   {}
     *   { AssignmentPropertyList }
     *   { AssignmentPropertyList , }
     *
     * AssignmentPropertyList :
     *   AssignmentProperty
     *   AssignmentPropertyList , AssignmentProperty
     *
     * AssignmentProperty :
     *   Identifier
     *   PropertyName : LeftHandSideExpression
     */
    parseObjectAssignmentPattern_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);
      var fields = [];
      var field;
      while (this.peekId_() || this.peekPropertyName_()) {
        if (this.peek_(TokenType.COLON, 1)) {
          var fieldStart = this.getTreeStartLocation_();
          var name = this.nextToken_();
          this.eat_(TokenType.COLON);
          var left = this.parseLeftHandSideExpression_();
          left = this.transformLeftHandSideExpression_(left);
          field = new ObjectPatternField(this.getTreeLocation_(start),
                                         name, left);
        } else {
          field = this.parseIdentifierExpression_();
        }
        fields.push(field);
        if (this.peek_(TokenType.COMMA))
          this.eat_(TokenType.COMMA);
        else
          break;
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ObjectPattern(this.getTreeLocation_(start), fields);
    },

    /**
     * ArrayAssignmentPattern :
     *   [ Elisionopt AssignmentRestElementopt ]
     *   [ AssignmentElementList ]
     *   [ AssignmentElementList , Elisionopt AssignmentRestElementopt ]
     *
     * AssignmentElementList :
     *   Elisionopt AssignmentElement
     *   AssignmentElementList , Elisionopt AssignmentElement
     *
     * AssignmentElement :
     *   LeftHandSideExpression
     *
     * AssignmentRestElement :
     *   ... LeftHandSideExpression
     */
    parseArrayAssignmentPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(TokenType.OPEN_SQUARE);
      while (this.peek_(TokenType.COMMA) ||
             this.peekRest_() ||
             this.peekAssignmentExpression_()) {
        this.parseElisionOpt_(elements);
        if (this.peekRest_()) {
          elements.push(this.parseAssignmentRestElement_());
          break;
        } else {
          elements.push(this.parseAssignmentElement_());
          // Trailing commas are not allowed in patterns.
          if (this.peek_(TokenType.COMMA) &&
              !this.peek_(TokenType.CLOSE_SQUARE, 1)) {
            this.eat_(TokenType.COMMA);
          }
        }
      }
      this.eat_(TokenType.CLOSE_SQUARE);
      return new ArrayPattern(this.getTreeLocation_(start), elements);
    },

    parseAssignmentRestElement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.DOT_DOT_DOT);
      var left = this.parseLeftHandSideExpression_();
      left = this.transformLeftHandSideExpression_(left);
      return new SpreadPatternElement(this.getTreeLocation_(start), left);
    },

    parseAssignmentElement_: function() {
      var tree = this.parseLeftHandSideExpression_();
      return this.transformLeftHandSideExpression_(tree);
    },

    /**
     * Quasi Literals
     *
     * Quasi ::
     *   FullQuasi
     *   QuasiHead
     *
     * FullQuasi ::
     *   ` QuasiCharactersopt `
     *
     * QuasiHead ::
     *   ` QuasiCharactersopt ${
     *
     * QuasiSubstitutionTail ::
     *   QuasiMiddle
     *   QuasiTail
     *
     * QuasiMiddle ::
     *   } QuasiCharactersopt ${
     *
     * QuasiTail ::
     *   } QuasiCharactersopt `
     *
     * QuasiCharacters ::
     *   QuasiCharacter QuasiCharactersopt
     *
     * QuasiCharacter ::
     *   SourceCharacter but not one of ` or \ or $
     *   $ [lookahead not { ]
     *   \ EscapeSequence
     *   LineContinuation
     *
     * @param {ParseTree} operand
     * @return {ParseTree}
     * @private
     */
    parseQuasiLiteral_: function(operand) {
      if (!options.quasi) {
        return this.parseMissingPrimaryExpression_();
      }

      function pushSubst(tree) {
        elements.push(new QuasiSubstitution(tree.location, tree));
      }

      var start = operand ?
          operand.location.start : this.getTreeStartLocation_();

      this.eat_(TokenType.BACK_QUOTE);

      var elements = [];

      while (!this.peekEndOfQuasiLiteral_()) {
        var token = this.nextQuasiLiteralPortionToken_();
        // start is not the right SourcePosition but we cannot use
        // getTreeStartLocation_ here since it uses peek_ which is not safe to
        // use inside parseQuasiLiteral_.
        elements.push(new QuasiLiteralPortion(this.getTreeLocation_(start),
                                              token));

        if (!this.peekQuasiToken_(TokenType.DOLLAR))
          break;

        token = this.nextQuasiSubstitutionToken_();
        traceur.assert(token.type == TokenType.DOLLAR);

        this.eat_(TokenType.OPEN_CURLY);
        var expression = this.parseExpression_();
        if (!expression)
          return this.parseMissingPrimaryExpression_();
        pushSubst(expression);
        this.eat_(TokenType.CLOSE_CURLY);
      }

      this.eat_(TokenType.BACK_QUOTE);

      return new QuasiLiteralExpression(this.getTreeLocation_(start),
                                        operand, elements);
    },

    /**
     * Consume a (possibly implicit) semi-colon. Reports an error if a semi-colon is not present.
     *
     * @return {void}
     * @private
     */
    eatPossibleImplicitSemiColon_: function() {
      if (this.peek_(TokenType.SEMI_COLON) && this.peekToken_().location.start.line == this.getLastLine_()) {
        this.eat_(TokenType.SEMI_COLON);
        return;
      }
      if (this.peekImplicitSemiColon_()) {
        return;
      }

      this.reportError_('Semi-colon expected');
    },

    /**
     * Returns true if an implicit or explicit semi colon is at the current location.
     *
     * @return {boolean}
     * @private
     */
    peekImplicitSemiColon_: function() {
      return this.getNextLine_() > this.getLastLine_() ||
          this.peek_(TokenType.SEMI_COLON) ||
          this.peek_(TokenType.CLOSE_CURLY) ||
          this.peek_(TokenType.END_OF_FILE);
    },

    /**
     * Returns the line number of the most recently consumed token.
     *
     * @return {number}
     * @private
     */
    getLastLine_: function() {
      return this.scanner_.lastToken.location.end.line;
    },

    /**
     * Returns the line number of the next token.
     *
     * @return {number}
     * @private
     */
    getNextLine_: function() {
      return this.peekToken_().location.start.line;
    },

    /**
     * Consumes the next token if it is of the expected type. Otherwise returns null.
     * Never reports errors.
     *
     * @param {TokenType} expectedTokenType
     * @return {Token} The consumed token, or null if the next token is not of the expected type.
     * @private
     */
    eatOpt_: function(expectedTokenType) {
      if (this.peek_(expectedTokenType)) {
        return this.eat_(expectedTokenType);
      }
      return null;
    },

    /**
     * Shorthand for this.eatOpt_(TokenType.IDENTIFIER)
     *
     * @return {IdentifierToken}
     * @private
     */
    eatIdOpt_: function() {
      return (this.peek_(TokenType.IDENTIFIER)) ? this.eatId_() : null;
    },

    /**
     * Shorthand for this.eat_(TokenType.IDENTIFIER)
     * @param {string=} opt_expected
     * @return {IdentifierToken}
     * @private
     */
    eatId_: function(opt_expected) {
      var result = this.eat_(TokenType.IDENTIFIER);
      if (opt_expected) {
        if (!result || result.value !== opt_expected) {
          if (!result)
            result = this.peekToken_();
          this.reportError_(result, 'expected "' + opt_expected + '"');
          return null;
        }
      }
      return result;
    },

    /**
     * Eats an identifier or keyword. Equivalent to IdentifierName in the spec.
     *
     * @return {Token}
     * @private
     */
    eatIdName_: function() {
      var t = this.nextToken_();
      if (t.type != TokenType.IDENTIFIER) {
        if (!Keywords.isKeyword(t.type)) {
          this.reportExpectedError_(t, 'identifier');
          return null;
        }
        return new IdentifierToken(t.location, t.type);
      }
      return t;
    },

    /**
     * Consumes the next token. If the consumed token is not of the expected type then
     * report an error and return null. Otherwise return the consumed token.
     *
     * @param {TokenType} expectedTokenType
     * @return {Token} The consumed token, or null if the next token is not of the expected type.
     * @private
     */
    eat_: function(expectedTokenType) {
      var token = this.nextToken_();
      if (token.type != expectedTokenType) {
        this.reportExpectedError_(token, expectedTokenType);
        return null;
      }
      return token;
    },

    /**
     * Report a 'X' expected error message.
     * @param {Token} token The location to report the message at.
     * @param {Object} expected The thing that was expected.
     *
     * @return {void}
     * @private
     */
    reportExpectedError_: function(token, expected) {
      this.reportError_(token, "'" + expected + "' expected");
    },

    /**
     * Returns a SourcePosition for the start of a parse tree that starts at the current location.
     *
     * @return {SourcePosition}
     * @private
     */
    getTreeStartLocation_: function() {
      return this.peekToken_().location.start;
    },

    /**
     * Returns a SourcePosition for the end of a parse tree that ends at the current location.
     *
     * @return {SourcePosition}
     * @private
     */
    getTreeEndLocation_: function() {
      return this.scanner_.lastToken.location.end;
    },

    /**
     * Returns a SourceRange for a parse tree that starts at {start} and ends at the current location.
     *
     * @return {SourceRange}
     * @private
     */
    getTreeLocation_: function(start) {
      return new SourceRange(start, this.getTreeEndLocation_());
    },

    /**
     * Consumes the next token and returns it. Will return a never ending stream of
     * TokenType.END_OF_FILE at the end of the file so callers don't have to check for EOF explicitly.
     *
     * Tokenizing is contextual. this.nextToken_() will never return a regular expression literal.
     *
     * @return {Token}
     * @private
     */
    nextToken_: function() {
      return this.scanner_.nextToken();
    },

    /**
     * Consumes a regular expression literal token and returns it.
     *
     * @return {LiteralToken}
     * @private
     */
    nextRegularExpressionLiteralToken_: function() {
      return this.scanner_.nextRegularExpressionLiteralToken();
    },

    nextQuasiLiteralPortionToken_: function() {
      return this.scanner_.nextQuasiLiteralPortionToken();
    },

    nextQuasiIdentifier_: function() {
      return this.scanner_.nextQuasiIdentifier();
    },

    nextQuasiSubstitutionToken_: function() {
      return this.scanner_.nextQuasiSubstitutionToken();
    },

    peekEndOfQuasiLiteral_: function() {
      return this.peekQuasiToken_(TokenType.BACK_QUOTE) ||
          this.peekQuasiToken_(TokenType.END_OF_FILE);
    },

    peekQuasiToken_: function(type) {
      return this.scanner_.peekQuasiToken(type);
    },

    /**
     * Returns true if the index-th next token is of the expected type. Does not consume any tokens.
     *
     * @param {TokenType} expectedType
     * @param {number=} opt_index
     * @return {boolean}
     * @private
     */
    peek_: function(expectedType, opt_index) {
      return this.peekType_(opt_index || 0) == expectedType;
    },

    /**
     * Returns the TokenType of the index-th next token. Does not consume any tokens.
     *
     * @return {TokenType}
     * @private
     */
    peekType_: function(opt_index) {
      return this.peekToken_(opt_index || 0).type;
    },

    /**
     * Returns the index-th next token. Does not consume any tokens.
     *
     * @return {Token}
     * @private
     */
    peekToken_: function(opt_index) {
      return this.scanner_.peekToken(opt_index || 0);
    },

    /**
     * Returns the index-th next token. Does not allow any line terminator
     * before the next token. Does not consume any tokens. This returns null if
     * no token was found before the next line terminator.
     *
     * @return {Token}
     * @private
     */
    peekTokenNoLineTerminator_: function(opt_index) {
      return this.scanner_.peekTokenNoLineTerminator(opt_index || 0);
    },

    /**
     * Reports an error message at a given token.
     * @param {traceur.util.SourcePostion|Token} token The location to report
     *     the message at.
     * @param {string} message The message to report in String.format style.
     *
     * @return {void}
     * @private
     */
    reportError_: function(var_args) {
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
    },

    reportUnexpectedToken_: function() {
      this.reportError_(this.peekToken_(), 'Unexpected token');
    }
  };

  return {
    Parser: Parser
  };
});
