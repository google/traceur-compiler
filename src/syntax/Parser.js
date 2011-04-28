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

  var MutedErrorReporter = traceur.util.MutedErrorReporter;
  var SourceRange = traceur.util.SourceRange;

  var Keywords = traceur.syntax.Keywords;
  var TokenType = traceur.syntax.TokenType;
  var PredefinedName = traceur.syntax.PredefinedName;

  var ArgumentList = traceur.syntax.trees.ArgumentList;
  var ArrayLiteralExpression = traceur.syntax.trees.ArrayLiteralExpression;
  var ArrayPattern = traceur.syntax.trees.ArrayPattern;
  var AwaitStatement = traceur.syntax.trees.AwaitStatement;
  var BinaryOperator = traceur.syntax.trees.BinaryOperator;
  var Block = traceur.syntax.trees.Block;
  var BreakStatement = traceur.syntax.trees.BreakStatement;
  var CallExpression = traceur.syntax.trees.CallExpression;
  var CaseClause = traceur.syntax.trees.CaseClause;
  var Catch = traceur.syntax.trees.Catch;
  var ClassDeclaration = traceur.syntax.trees.ClassDeclaration;
  var ClassExpression = traceur.syntax.trees.ClassExpression;
  var CommaExpression = traceur.syntax.trees.CommaExpression;
  var ConditionalExpression = traceur.syntax.trees.ConditionalExpression;
  var ContinueStatement = traceur.syntax.trees.ContinueStatement;
  var DebuggerStatement = traceur.syntax.trees.DebuggerStatement;
  var DefaultClause = traceur.syntax.trees.DefaultClause;
  var DefaultParameter = traceur.syntax.trees.DefaultParameter;
  var DoWhileStatement = traceur.syntax.trees.DoWhileStatement;
  var EmptyStatement = traceur.syntax.trees.EmptyStatement;
  var ExportDeclaration = traceur.syntax.trees.ExportDeclaration;
  var ExportPath = traceur.syntax.trees.ExportPath;
  var ExportPathList = traceur.syntax.trees.ExportPathList;
  var ExportPathSpecifier = traceur.syntax.trees.ExportPathSpecifier;
  var ExportPathSpecifierSet = traceur.syntax.trees.ExportPathSpecifierSet;
  var ExportSpecifier = traceur.syntax.trees.ExportSpecifier;
  var ExportSpecifierSet = traceur.syntax.trees.ExportSpecifierSet;
  var ExpressionStatement = traceur.syntax.trees.ExpressionStatement;
  var FieldDeclaration = traceur.syntax.trees.FieldDeclaration;
  var Finally = traceur.syntax.trees.Finally;
  var ForEachStatement = traceur.syntax.trees.ForEachStatement;
  var ForInStatement = traceur.syntax.trees.ForInStatement;
  var ForStatement = traceur.syntax.trees.ForStatement;
  var FormalParameterList = traceur.syntax.trees.FormalParameterList;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var IdentifierExpression = traceur.syntax.trees.IdentifierExpression;
  var IdentifierToken = traceur.syntax.IdentifierToken;
  var IfStatement = traceur.syntax.trees.IfStatement;
  var ImportDeclaration = traceur.syntax.trees.ImportDeclaration;
  var ImportPath = traceur.syntax.trees.ImportPath;
  var ImportSpecifier = traceur.syntax.trees.ImportSpecifier;
  var ImportSpecifierSet = traceur.syntax.trees.ImportSpecifierSet;
  var LabelledStatement = traceur.syntax.trees.LabelledStatement;
  var LiteralExpression = traceur.syntax.trees.LiteralExpression;
  var MemberExpression = traceur.syntax.trees.MemberExpression;
  var MemberLookupExpression = traceur.syntax.trees.MemberLookupExpression;
  var MissingPrimaryExpression = traceur.syntax.trees.MissingPrimaryExpression;
  var Mixin = traceur.syntax.trees.Mixin;
  var MixinResolve = traceur.syntax.trees.MixinResolve;
  var MixinResolveList = traceur.syntax.trees.MixinResolveList;
  var ModuleDeclaration = traceur.syntax.trees.ModuleDeclaration;
  var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
  var ModuleExpression = traceur.syntax.trees.ModuleExpression;
  var ModuleRequire = traceur.syntax.trees.ModuleRequire;
  var ModuleSpecifier = traceur.syntax.trees.ModuleSpecifier;
  var NewExpression = traceur.syntax.trees.NewExpression;
  var NullTree = traceur.syntax.trees.NullTree;
  var ObjectLiteralExpression = traceur.syntax.trees.ObjectLiteralExpression;
  var ObjectPattern = traceur.syntax.trees.ObjectPattern;
  var ObjectPatternField = traceur.syntax.trees.ObjectPatternField;
  var ParenExpression = traceur.syntax.trees.ParenExpression;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PostfixExpression = traceur.syntax.trees.PostfixExpression;
  var Program = traceur.syntax.trees.Program;
  var PropertyNameAssignment = traceur.syntax.trees.PropertyNameAssignment;
  var QualifiedReference = traceur.syntax.trees.QualifiedReference;
  var RequiresMember = traceur.syntax.trees.RequiresMember;
  var RestParameter = traceur.syntax.trees.RestParameter;
  var ReturnStatement = traceur.syntax.trees.ReturnStatement;
  var SetAccessor = traceur.syntax.trees.SetAccessor;
  var SpreadExpression = traceur.syntax.trees.SpreadExpression;
  var SpreadPatternElement = traceur.syntax.trees.SpreadPatternElement;
  var SuperExpression = traceur.syntax.trees.SuperExpression;
  var SwitchStatement = traceur.syntax.trees.SwitchStatement;
  var ThisExpression = traceur.syntax.trees.ThisExpression;
  var ThrowStatement = traceur.syntax.trees.ThrowStatement;
  var TraitDeclaration = traceur.syntax.trees.TraitDeclaration;
  var TryStatement = traceur.syntax.trees.TryStatement;
  var UnaryExpression = traceur.syntax.trees.UnaryExpression;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;
  var VariableStatement = traceur.syntax.trees.VariableStatement;
  var WhileStatement = traceur.syntax.trees.WhileStatement;
  var WithStatement = traceur.syntax.trees.WithStatement;
  var YieldStatement = traceur.syntax.trees.YieldStatement;

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

  // Kinds of destructuring patterns
  var PatternKind = {
    // A var, let, const; catch head; or formal parameter list--only
    // identifiers are allowed as lvalues
    INITIALIZER: 'INITIALIZER',
    // An assignment or for-in initializer--any lvalue is allowed
    ANY: 'ANY'
  };

  function declarationDestructuringFollow(token) {
    return token === TokenType.EQUAL;
  }

  function arraySubPatternFollowSet(token) {
    return token === TokenType.COMMA || token === TokenType.CLOSE_SQUARE;
  }

  function objectSubPatternFollowSet(token) {
    return token === TokenType.COMMA || token === TokenType.CLOSE_CURLY;
  }

  Parser.prototype = {
    /**
     * @type {Token}
     * @private
     */
    lastToken_: null,

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
        result.push(this.parseProgramElement_(load));
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
             this.peekTraitDeclaration_() ||
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
      // Trait is handled in parseStatement_
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
    // TraitDeclaration
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
      // ModuleSpecifier(load) ::= Identifier "=" ModuleExpression(load)

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

    // ModuleSpecifier(load) ::= Identifier "=" ModuleExpression(load)
    parseModuleSpecifier_: function(load) {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      this.eat_(TokenType.EQUAL);
      var expression = this.parseModuleExpression_(load, false);
      return new ModuleSpecifier(this.getTreeLocation_(start), identifier,
                                 expression);
    },

    parseModuleExpression_: function(load, leaveTrailingIdentifier) {
      // ModuleExpression(load) ::= ModuleReference(load)
      //                         | ModuleExpression(load) "." IdentifierName
      var start = this.getTreeStartLocation_();
      var reference = this.parseModuleReference_(load);
      var identifierNames = [];
      while (this.peek_(TokenType.PERIOD) && this.peekIdName_(1)) {
        if (leaveTrailingIdentifier && !this.peek_(TokenType.PERIOD, 2)) {
          break;
        }
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
      //                        | [load = true] "require" "(" StringLiteral ")"

      var start = this.getTreeStartLocation_();
      if (load && this.peekPredefinedString_(PredefinedName.REQUIRE)) {
        this.eat_(TokenType.IDENTIFIER); // require
        this.eat_(TokenType.OPEN_PAREN);
        var url = this.eat_(TokenType.STRING);
        this.eat_(TokenType.CLOSE_PAREN);
        return new ModuleRequire(this.getTreeLocation_(start), url);
      }
      return this.parseIdentifierExpression_();
    },

    // ClassDeclaration
    // TraitDeclaration
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

    //  ImportDeclaration ::= 'import' ImportPath (',' ImportPath)* ';'
    /**
     * @return {boolean}
     * @private
     */
    peekImportDeclaration_: function() {
      return this.peek_(TokenType.IMPORT);
    },

    // ImportDeclaration(load) ::= "import" ImportPath(load)
    //                                     ("," ImportPath(load))* ";"
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportDeclaration_: function(load) {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.IMPORT);
      var importPathList = [];

      importPathList.push(this.parseImportPath_(load));
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        importPathList.push(this.parseImportPath_(load));
      }
      this.eatPossibleImplicitSemiColon_();

      return new ImportDeclaration(this.getTreeLocation_(start),
          importPathList);
    },

    // ImportPath(load) ::= ModuleExpression(load) "." ImportSpecifierSet
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportPath_: function(load) {
      var start = this.getTreeStartLocation_();

      var moduleExpression = this.parseModuleExpression_(load, true);
      this.eat_(TokenType.PERIOD);
      var importSpecifierSet = this.parseImportSpecifierSet_();

      return new ImportPath(this.getTreeLocation_(start),
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

      return this.parseIdentifierExpression_();
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
    // export  TraitDeclaration
    // export  module  ModuleDefinition
    // TODO: export  module ModuleLoad (',' ModuleLoad)* ';'
    // TODO: export  ExportPath (',' ExportPath)* ';'
    /**
     * @return {boolean}
     * @private
     */
    peekExportDeclaration_: function(load) {
      return this.peek_(TokenType.EXPORT);
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
        case TokenType.VAR:
        case TokenType.CONST:
          exportTree = this.parseVariableStatement_();
          break;
        case TokenType.FUNCTION:
        case TokenType.POUND:
          exportTree = this.parseFunctionDeclaration_();
          break;
        case TokenType.CLASS:
          exportTree = this.parseClassDeclaration_();
          break;
        case TokenType.IDENTIFIER:
          if (this.peekModuleDeclaration_(load)) {
            exportTree = this.parseModuleDeclaration_(load);
          } else if (this.peekTraitDeclaration_()) {
            exportTree = this.parseTraitDeclaration_();
          } else if (this.peekExportPath_()) {
            exportTree = this.parseExportPathList_();
            this.eatPossibleImplicitSemiColon_();
          } else {
            throw Error('unreached');
          }
          break;
        case TokenType.OPEN_CURLY:
          exportTree = this.parseExportPathList_();
          this.eatPossibleImplicitSemiColon_();
          break;
        default:
          this.reportError_('Unexpected symbol \'' + this.peekToken_() + '\'');
          return null;
      }
      return new ExportDeclaration(this.getTreeLocation_(start), exportTree);
    },

    parseExportPathList_: function() {
      // This is part of the ExportDeclaration production
      // ExportPath ("," ExportPath)*
      var start = this.getTreeStartLocation_();
      var paths = [this.parseExportPath_()];
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        paths.push(this.parseExportPath_());
      }
      return new ExportPathList(this.getTreeEndLocation_(start), paths);
    },

    peekExportPath_: function() {
      return this.peek_(TokenType.OPEN_CURLY) || this.peekId_();
    },

    parseExportPath_: function() {
      // ExportPath ::= ModuleExpression(false) "." ExportSpecifierSet
      //             | ExportPathSpecifierSet
      //             | Identifier

      if (this.peek_(TokenType.OPEN_CURLY))
        return this.parseExportPathSpecifierSet_();

      if (this.peek_(TokenType.PERIOD, 1)) {
        var start = this.getTreeStartLocation_();
        var expression = this.parseModuleExpression_(false, true);
        this.eat_(TokenType.PERIOD);
        var specifierSet = this.parseExportSpecifierSet_();
        return new ExportPath(start, expression, specifierSet);
      }

      return this.parseIdentifierExpression_();
    },

    peekExportSpecifierSet_: function() {
      return this.peek_(TokenType.OPEN_CURLY) ||
          this.peekIdName_();
    },

    parseExportSpecifierSet_: function() {
      // ExportSpecifierSet ::= IdentifierName
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
      // ExportSpecifier ::= IdentifierName (":" IdentifierName)?

      var start = this.getTreeStartLocation_();
      var lhs = this.eatIdName_();
      var rhs = null;
      if (this.peek_(TokenType.COLON)) {
        this.eat_(TokenType.COLON);
        rhs = this.eatIdName_();
      }
      return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },

    peekId_: function() {
      return this.peek_(TokenType.IDENTIFIER);
    },

    peekIdName_: function(opt_index) {
      var type = this.peekType_(opt_index);
      return type == TokenType.IDENTIFIER || Keywords.isKeyword(type);
    },

    peekExportPathSpecifierSet_: function() {
      return this.peek_(TokenType.OPEN_CURLY) && this.peekExportPathSpecifier_(1);
    },

    parseExportPathSpecifierSet_: function() {
      // ExportPathSpecifierSet ::= "{" ExportPathSpecifier ("," ExportPathSpecifier)* ","? "}"
      var start = this.getTreeStartLocation_();

      this.eat_(TokenType.OPEN_CURLY);
      var specifiers = [this.parseExportPathSpecifier_()];
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        if (this.peek_(TokenType.CLOSE_CURLY))
          break;
        specifiers.push(this.parseExportPathSpecifier_());
      }
      this.eat_(TokenType.CLOSE_CURLY);

      return new ExportPathSpecifierSet(this.getTreeLocation_(start),
                                        specifiers);
    },

    peekExportPathSpecifier_: function(opt_index) {
      return this.peekIdName_(opt_index);
    },

    parseExportPathSpecifier_: function() {
      // ExportPathSpecifier ::= Identifier
      //                      | IdentifierName ":" Identifier
      //                      | IdentifierName ":" QualifiedReference

      if (!this.peek_(TokenType.COLON, 1))
        return this.parseIdentifierExpression_();

      var start = this.getTreeStartLocation_();
      var identifier = this.eatIdName_();
      this.eat_(TokenType.COLON);

      var specifier;
      if (this.peek_(TokenType.PERIOD, 1))
        specifier = this.parseQualifiedReference_();
      else
        specifier = this.parseIdentifierExpression_();

      return new ExportPathSpecifier(this.getTreeLocation_(start),
                                     identifier, specifier);
    },

    parseQualifiedReference_: function() {
      // QualifiedReference ::= ModuleExpression(false) "." IdentifierName

      var start = this.getTreeStartLocation_();
      var moduleExpression = this.parseModuleExpression_(false, true);
      this.eat_(TokenType.PERIOD);
      var identifierName = this.eatIdName_();

      return new QualifiedReference(this.getTreeLocation_(start),
          moduleExpression, identifierName);
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
      // ModuleSpecifier(load) ::= Identifier "=" ModuleExpression(load)
      return this.peekPredefinedString_(PredefinedName.MODULE) &&
          this.peek_(TokenType.IDENTIFIER, 1) &&
          (this.peek_(TokenType.EQUAL, 2) ||
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
    peekTraitDeclaration_: function() {
      return this.peekPredefinedString_(PredefinedName.TRAIT);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseTraitDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eatId_(); // trait
      var name = this.eatId_();
      this.eat_(TokenType.OPEN_CURLY);
      var elements = this.parseTraitElements_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new TraitDeclaration(this.getTreeLocation_(start), name, elements);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseTraitElements_: function() {
      var result = [];

      while (this.peekTraitElement_()) {
        result.push(this.parseTraitElement_());
      }

      return result;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekTraitElement_: function() {
      // TODO: require statement
      // TODO: mixin statement
      // TODO: access modifiers
      switch (this.peekType_()) {
        case TokenType.FUNCTION:
        case TokenType.POUND:
        case TokenType.IDENTIFIER:
          return true;
        default:
          return false;
      }
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseTraitElement_: function() {
      // TODO: fields?
      // TODO: allow static in traits?
      // TODO: access modifiers
      if (this.peekGetAccessor_(false)) {
        return this.parseGetAccessor_();
      }
      if (this.peekSetAccessor_(false)) {
        return this.parseSetAccessor_();
      }
      if (this.peekMixin_()) {
        return this.parseMixin_();
      }
      if (this.peekRequiresMember_()) {
        return this.parseRequiresMember_();
      }

      return this.parseMethodDeclaration_(false);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekRequiresMember_: function() {
      return this.peekPredefinedString_(PredefinedName.REQUIRES) && this.peek_(TokenType.IDENTIFIER, 1);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseRequiresMember_: function() {
      var start = this.getTreeStartLocation_();
      this.eatId_(); // requires
      var name = this.eatId_();
      this.eat_(TokenType.SEMI_COLON);
      return new RequiresMember(this.getTreeLocation_(start), name);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekMixin_: function() {
      return this.peekPredefinedString_(PredefinedName.MIXIN) && this.peek_(TokenType.IDENTIFIER, 1);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekClassDeclaration_: function() {
      return this.peek_(TokenType.CLASS);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseClassDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.CLASS);
      var name = this.eatId_();
      var superClass = null;
      if (this.peek_(TokenType.COLON)) {
        this.eat_(TokenType.COLON);
        superClass = this.parseExpression_();
      }
      this.eat_(TokenType.OPEN_CURLY);
      var elements = this.parseClassElements_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new ClassDeclaration(this.getTreeLocation_(start), name, superClass, elements);
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
      switch (this.peekType_()) {
        case TokenType.FUNCTION:
        case TokenType.POUND:
        case TokenType.IDENTIFIER:
        case TokenType.VAR:
        case TokenType.CONST:
        case TokenType.CLASS:
        case TokenType.NEW:
          return true;
        default:
          return false;
      }
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseClassElement_: function() {
      if (this.peekConstructorDeclaration_()) {
        return this.parseConstructorDeclaration_();
      }
      if (this.peekMethodDeclaration_()) {
        return this.parseMethodDeclaration_(true);
      }
      // TODO: access modifiers
      if (this.peekGetAccessor_(true)) {
        return this.parseGetAccessor_();
      }
      if (this.peekSetAccessor_(true)) {
        return this.parseSetAccessor_();
      }
      if (this.peekMixin_()) {
        return this.parseMixin_();
      }
      if (this.peekRequiresMember_()) {
        return this.parseRequiresMember_();
      }

      return this.parseFieldDeclaration_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseFieldDeclaration_: function() {
      var start = this.getTreeStartLocation_();

      var isStatic = this.eatOpt_(TokenType.CLASS) != null;

      var binding = this.peekType_();
      var isConst = false;
      switch (binding) {
        case TokenType.CONST:
          this.eat_(TokenType.CONST);
          isConst = true;
          break;
        case TokenType.VAR:
          this.eat_(TokenType.VAR);
          break;
      }

      var declarations = [];

      declarations.push(this.parseVariableDeclaration_(isStatic, binding, Expression.NORMAL));
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        declarations.push(this.parseVariableDeclaration_(isStatic, binding, Expression.NORMAL));
      }
      this.eat_(TokenType.SEMI_COLON);
      return new FieldDeclaration(
          this.getTreeLocation_(start), isStatic, isConst, declarations);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseMixin_: function() {
      var start = this.getTreeStartLocation_();
      this.eatId_(); // mixin
      var name = this.eatId_();
      var mixinResolves = null;
      if (this.peek_(TokenType.OPEN_CURLY)) {
        mixinResolves = this.parseMixinResolves_();
      }
      this.eat_(TokenType.SEMI_COLON);
      return new Mixin(this.getTreeLocation_(start), name, mixinResolves);
    },

    /**
     * @return {MixinResolveList}
     * @private
     */
    parseMixinResolves_: function() {
      var start = this.getTreeStartLocation_();
      var result = [];

      this.eat_(TokenType.OPEN_CURLY);
      while (this.peek_(TokenType.IDENTIFIER)) {
        result.push(this.parseMixinResolve_());
        if (null == this.eatOpt_(TokenType.COMMA)) {
          break;
        }
      }
      this.eat_(TokenType.CLOSE_CURLY);

      return new MixinResolveList(this.getTreeLocation_(start), result);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseMixinResolve_: function() {
      var start = this.getTreeStartLocation_();
      // TODO: need distinguishing syntax for 'requires' resolves
      // requires x,
      var from = this.eatId_();
      this.eat_(TokenType.COLON);
      var to = this.eatId_();
      return new MixinResolve(this.getTreeLocation_(start), from, to);
    },

    /**
     * @param {boolean} allowStatic
     * @return {ParseTree}
     * @private
     */
    parseMethodDeclaration_: function(allowStatic) {
      var start = this.getTreeStartLocation_();
      var isStatic = allowStatic && this.eatOpt_(TokenType.CLASS) != null;
      if (this.peekFunction_()) {
        this.nextToken_(); // function or #
      }
      return this.parseFunctionDeclarationTail_(start, isStatic, this.eatId_());
    },

    /**
     * @return {boolean}
     * @private
     */
    peekMethodDeclaration_: function() {
      var index = this.peek_(TokenType.CLASS) ? 1 : 0;
      return this.peekFunction_(index) ||
          (this.peek_(TokenType.IDENTIFIER, index) && this.peek_(TokenType.OPEN_PAREN, index + 1));
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseConstructorDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      var isStatic = this.eatOpt_(TokenType.CLASS) != null;
      return this.parseFunctionDeclarationTail_(start, isStatic, this.eatIdName_());
    },

    /**
     * @return {boolean}
     * @private
     */
    peekConstructorDeclaration_: function() {
      var index = this.peek_(TokenType.CLASS) ? 1 : 0;
      return this.peek_(TokenType.NEW, index) &&
          this.peek_(TokenType.OPEN_PAREN, index + 1);
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
      if (this.peekTraitDeclaration_()) {
        return this.parseTraitDeclaration_();
      }

      // Harmony let block scoped bindings. let can only appear in
      // a block, not as a standalone statement: if() let x ... illegal
      if (this.peek_(TokenType.LET)) {
        return this.parseVariableStatement_();
      }
      // const and var are handled inside parseStatement

      return this.parseStatementStandard_();
    },

    /**
     * @return {boolean}
     * @private
     */
    peekSourceElement_: function() {
      return this.peekFunction_() || this.peekClassDeclaration_() ||
          this.peekTraitDeclaration_() || this.peekStatementStandard_() ||
          this.peek_(TokenType.LET);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekFunction_: function(opt_index) {
      var index = opt_index || 0;
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
      return this.parseFunctionDeclarationTail_(start, false, this.eatId_());
    },

    /**
     * @param {SourcePosition} start
     * @param {boolean} isStatic
     * @param {IdentifierToken} name
     * @return {ParseTree}
     * @private
     */
    parseFunctionDeclarationTail_: function(start, isStatic, name) {
      this.eat_(TokenType.OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(TokenType.CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_();
      return new FunctionDeclaration(this.getTreeLocation_(start), name, isStatic, formalParameterList, functionBody);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseFunctionExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.nextToken_(); // function or #
      var name = this.eatIdOpt_();
      this.eat_(TokenType.OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(TokenType.CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_();
      return new FunctionDeclaration(this.getTreeLocation_(start), name, false, formalParameterList, functionBody);
    },

    /**
     * @return {FormalParameterList}
     * @private
     */
    parseFormalParameterList_: function() {
      // FormalParameterList :
      //   ... Identifier
      //   FormalParameterListNoRest
      //   FormalParameterListNoRest , ... Identifier
      //
      // FormalParameterListNoRest :
      //   Identifier
      //   Identifier = AssignmentExprssion
      //   FormalParameterListNoRest , Identifier
      var result = [];

      var hasDefaultParameters = false;

      while (this.peek_(TokenType.IDENTIFIER) || this.peek_(TokenType.SPREAD)) {
        if (this.peek_(TokenType.SPREAD)) {
          var start = this.getTreeStartLocation_();
          this.eat_(TokenType.SPREAD);
          result.push(new RestParameter(this.getTreeLocation_(start), this.eatId_()));

          // Rest parameters must be the last parameter; so we must be done.
          break;
        } else {
          // TODO: implement pattern parsing here

          // Once we have seen a default parameter all remaining params must either be default or
          // rest parameters.
          if (hasDefaultParameters || this.peek_(TokenType.EQUAL, 1)) {
            result.push(this.parseDefaultParameter_());
            hasDefaultParameters = true;
          } else {
            result.push(this.parseIdentifierExpression_());
          }
        }

        if (!this.peek_(TokenType.CLOSE_PAREN)) {
          this.eat_(TokenType.COMMA);
        }
      }

      return new FormalParameterList(null, result);
    },

    /**
     * @return {DefaultParameter}
     * @private
     */
    parseDefaultParameter_: function() {
      var start = this.getTreeStartLocation_();
      var ident = this.parseIdentifierExpression_();
      this.eat_(TokenType.EQUAL);
      var expr = this.parseAssignmentExpression_();
      return new DefaultParameter(this.getTreeLocation_(start), ident, expr);
    },

    /**
     * @return {Block}
     * @private
     */
    parseFunctionBody_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);
      var result = this.parseSourceElementList_();
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
        result.push(this.parseSourceElement_());
      }

      return result;
    },

    /**
     * @return {SpreadExpression}
     * @private
     */
    parseSpreadExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SPREAD);
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
        case TokenType.OPEN_CURLY:
        case TokenType.AWAIT:
        case TokenType.VAR:
        case TokenType.CONST:
        case TokenType.SEMI_COLON:
        case TokenType.IF:
        case TokenType.DO:
        case TokenType.WHILE:
        case TokenType.FOR:
        case TokenType.CONTINUE:
        case TokenType.BREAK:
        case TokenType.RETURN:
        case TokenType.YIELD:
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
     * @return {VariableDeclarationList}
     * @private
     */
    parseVariableDeclarationListNoIn_: function() {
      return this.parseVariableDeclarationList_(Expression.NO_IN);
    },

    /**
     * @param {Expression=} opt_expressionIn
     * @return {VariableDeclarationList}
     * @private
     */
    parseVariableDeclarationList_: function(opt_expressionIn) {
      var expressionIn = opt_expressionIn || Expression.NORMAL;
      var token = this.peekType_();

      switch (token) {
        case TokenType.CONST:
        case TokenType.LET:
        case TokenType.VAR:
          this.eat_(token);
          break;
        default:
          throw Error('unreachable');
      }

      var start = this.getTreeStartLocation_();
      var declarations = [];

      declarations.push(this.parseVariableDeclaration_(false, token, expressionIn));
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        declarations.push(this.parseVariableDeclaration_(false, token, expressionIn));
      }
      return new VariableDeclarationList(
          this.getTreeLocation_(start), token, declarations);
    },

    /**
     * @param {boolean} isStatic
     * @param {TokenType} binding
     * @param {Expression} expressionIn
     * @return {VariableDeclaration}
     * @private
     */
    parseVariableDeclaration_: function(isStatic, binding, expressionIn) {
      var start = this.getTreeStartLocation_();
      var lvalue;
      if (this.peekPattern_(PatternKind.INITIALIZER, declarationDestructuringFollow)) {
        lvalue = this.parsePattern_(PatternKind.INITIALIZER);
      } else {
        lvalue = this.parseIdentifierExpression_();
      }
      var initializer = null;
      if (this.peek_(TokenType.EQUAL)) {
        initializer = this.parseInitializer_(expressionIn);
      } else if (binding == TokenType.CONST) {
        this.reportError_('const variables must have an initializer');
      } else if (lvalue.isPattern()) {
        this.reportError_('destructuring must have an initializer');
      }
      return new VariableDeclaration(this.getTreeLocation_(start), lvalue, initializer);
    },

    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseInitializer_: function(expressionIn) {
      this.eat_(TokenType.EQUAL);
      return this.parseAssignment_(expressionIn);
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
      if (this.peekVariableDeclarationList_()) {
        var variables = this.parseVariableDeclarationListNoIn_();
        if (this.peek_(TokenType.IN)) {
          // for-in: only one declaration allowed
          if (variables.declarations.length > 1) {
            this.reportError_('for-in statement may not have more than one variable declaration');
          }
          // for-in: if let/const binding used, initializer is illegal
          if ((variables.declarationType == TokenType.LET ||
               variables.declarationType == TokenType.CONST)) {
            var declaration = variables.declarations[0];
            if (declaration.initializer != null) {
              this.reportError_('let/const in for-in statement may not have initializer');
            }
          }

          return this.parseForInStatement_(start, variables);
        } else if (this.peek_(TokenType.COLON)) {
          // for-in: only one declaration allowed
          if (variables.declarations.length > 1) {
            this.reportError_('for-each statement may not have more than one variable declaration');
          }
          // for-each: initializer is illegal
          var declaration = variables.declarations[0];
          if (declaration.initializer != null) {
            this.reportError_('for-each statement may not have initializer');
          }

          return this.parseForEachStatement_(start, variables);
        } else {
          // for statement: let and const must have initializers
          this.checkInitializers_(variables);
          return this.parseForStatement2_(start, variables);
        }
      }

      if (this.peek_(TokenType.SEMI_COLON)) {
        return this.parseForStatement2_(start, null);
      }

      var initializer = this.parseExpressionNoIn_();
      if (this.peek_(TokenType.IN)) {
        return this.parseForInStatement_(start, initializer);
      }

      return this.parseForStatement2_(start, initializer);
    },

    // The for-each Statement
    // for  (  { let | var }  identifier  :  expression  )  statement
    /**
     * @param {SourcePosition} start
     * @param {VariableDeclarationList} initializer
     * @return {ParseTree}
     * @private
     */
    parseForEachStatement_: function(start, initializer) {
      this.eat_(TokenType.COLON);
      var collection = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new ForEachStatement(this.getTreeLocation_(start), initializer, collection, body);
    },

    /**
     * Checks variable declaration in variable and for statements.
     *
     * @param {VariableDeclarationList} variables
     * @return {void}
     * @private
     */
    checkInitializers_: function(variables) {
      if (variables.declarationType == TokenType.LET ||
          variables.declarationType == TokenType.CONST) {
        for (var i = 0; i < variables.declarations.length; i++) {
          var declaration = variables.declarations[i];
          if (declaration.initializer == null) {
            this.reportError_('let/const in for statement must have an initializer');
            break;
          }
        }
      }
    },

    /**
     * @return {boolean}
     * @private
     */
    peekVariableDeclarationList_: function() {
      switch (this.peekType_()) {
        case TokenType.VAR:
        case TokenType.CONST:
        case TokenType.LET:
          return true;
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
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.YIELD);
      var expression = null;
      var isYieldFor = false;
      if (this.peek_(TokenType.FOR)) {
        this.eat_(TokenType.FOR);
        isYieldFor = true;
      }
      if (!this.peekImplicitSemiColon_()) {
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
      return new LabelledStatement(this.getTreeLocation_(start), name, this.parseStatement_());
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
     * @return {ParseTree}
     * @private
     */
    parseCatch_: function() {
      var start = this.getTreeStartLocation_();
      var catchBlock;
      this.eat_(TokenType.CATCH);
      this.eat_(TokenType.OPEN_PAREN);
      var exceptionName = this.eatId_();
      this.eat_(TokenType.CLOSE_PAREN);
      var catchBody = this.parseBlock_();
      catchBlock = new Catch(this.getTreeLocation_(start), exceptionName, catchBody);
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
          return this.parseClassExpression_();
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
        default:
          return this.parseMissingPrimaryExpression_();
      }
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseClassExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.CLASS);
      return new ClassExpression(this.getTreeLocation_(start));
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

    // 11.1.4 Array Literal Expression
    /**
     * @return {ParseTree}
     * @private
     */
    parseArrayLiteral_: function() {
      // ArrayLiteral :
      //   [ Elisionopt ]
      //   [ ElementList ]
      //   [ ElementList , Elisionopt ]
      //
      // ElementList :
      //   Elisionopt AssignmentOrSpreadExpression
      //   ElementList , Elisionopt AssignmentOrSpreadExpression
      //
      // Elision :
      //   ,
      //   Elision ,

      var start = this.getTreeStartLocation_();
      var elements = [];

      this.eat_(TokenType.OPEN_SQUARE);
      while (this.peek_(TokenType.COMMA) || this.peek_(TokenType.SPREAD) || this.peekAssignmentExpression_()) {
        if (this.peek_(TokenType.COMMA)) {
          elements.push(new NullTree());
        } else {
          if (this.peek_(TokenType.SPREAD)) {
            elements.push(this.parseSpreadExpression_());
          } else {
            elements.push(this.parseAssignmentExpression_());
          }
        }
        if (!this.peek_(TokenType.CLOSE_SQUARE)) {
          this.eat_(TokenType.COMMA);
        }
      }
      this.eat_(TokenType.CLOSE_SQUARE);
      return new ArrayLiteralExpression(
          this.getTreeLocation_(start), elements);
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
        result.push(this.parsePropertyAssignment_());
        if (this.eatOpt_(TokenType.COMMA) == null) {
          break;
        }
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPropertyAssignment_: function() {
      return this.peekPropertyName_(0);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPropertyName_: function(tokenIndex) {
      var type = this.peekType_(tokenIndex);
      switch (type) {
        case TokenType.IDENTIFIER:
        case TokenType.STRING:
        case TokenType.NUMBER:
          return true;
        default:
          return Keywords.isKeyword(type);
      }
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parsePropertyAssignment_: function() {
      var type = this.peekType_();
      switch (type) {
        case TokenType.STRING:
        case TokenType.NUMBER:
          return this.parsePropertyNameAssignment_();
        default:
          traceur.assert(type == TokenType.IDENTIFIER ||
              Keywords.isKeyword(type));
          if (this.peekGetAccessor_(false)) {
            return this.parseGetAccessor_();
          } else if (this.peekSetAccessor_(false)) {
            return this.parseSetAccessor_();
          } else {
            return this.parsePropertyNameAssignment_();
          }
      }
    },

    /**
     * @param {boolean} allowStatic
     * @return {boolean}
     * @private
     */
    peekGetAccessor_: function(allowStatic) {
      var index = allowStatic && this.peek_(TokenType.CLASS) ? 1 : 0;
      return this.peekPredefinedString_(PredefinedName.GET, index) && this.peekPropertyName_(index + 1);
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
      var isStatic = this.eatOpt_(TokenType.CLASS) != null;
      this.eatId_(); // get
      var propertyName = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseFunctionBody_();
      return new GetAccessor(this.getTreeLocation_(start), propertyName, isStatic, body);
    },

    /**
     *@param {boolean} allowStatic
     * @return {boolean}
     * @private
     */
    peekSetAccessor_: function(allowStatic) {
      var index = allowStatic && this.peek_(TokenType.CLASS) ? 1 : 0;
      return this.peekPredefinedString_(PredefinedName.SET, index) && this.peekPropertyName_(index + 1);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseSetAccessor_: function() {
      var start = this.getTreeStartLocation_();
      var isStatic = this.eatOpt_(TokenType.CLASS) != null;
      this.eatId_(); // set
      var propertyName = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      var parameter = this.eatId_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseFunctionBody_();
      return new SetAccessor(this.getTreeLocation_(start), propertyName, isStatic, parameter, body);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parsePropertyNameAssignment_: function() {
      var start = this.getTreeStartLocation_();
      var name = this.nextToken_();
      this.eat_(TokenType.COLON);
      var value = this.parseAssignmentExpression_();
      return new PropertyNameAssignment(this.getTreeLocation_(start), name, value);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseParenExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_PAREN);
      var result = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      return new ParenExpression(this.getTreeLocation_(start), result);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseMissingPrimaryExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.reportError_('primary expression expected');
      var token = this.nextToken_();
      return new MissingPrimaryExpression(this.getTreeLocation_(start), token);
    },

    // 11.14 Expressions
    /**
     * @return {ParseTree}
     * @private
     */
    parseExpressionNoIn_: function() {
      return this.parse_(Expression.NO_IN);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseExpression_: function() {
      return this.parse_(Expression.NORMAL);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekExpression_: function() {
      switch (this.peekType_()) {
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
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parse_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var result = this.parseAssignment_(expressionIn);
      if (this.peek_(TokenType.COMMA)) {
        var exprs = [];
        exprs.push(result);
        while (this.peek_(TokenType.COMMA)) {
          this.eat_(TokenType.COMMA);
          exprs.push(this.parseAssignment_(expressionIn));
        }
        return new CommaExpression(this.getTreeLocation_(start), exprs);
      }
      return result;
    },

    // 11.13 Assignment expressions
    /**
     * @return {ParseTree}
     * @private
     */
    parseAssignmentExpression_: function() {
      return this.parseAssignment_(Expression.NORMAL);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekAssignmentExpression_: function() {
      return this.peekExpression_();
    },

    /**
     * @param {Expression} expressionIn
     * @return {ParseTree}
     * @private
     */
    parseAssignment_: function(expressionIn) {
      var start = this.getTreeStartLocation_();

      var left = this.peekParenPatternAssignment_() ?
          this.parseParenPattern_() :
          this.parseConditional_(expressionIn);

      if (this.peekAssignmentOperator_()) {
        if (!left.isLeftHandSideExpression() && !left.isPattern()) {
          this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
        }
        var operator = this.nextToken_();
        var right = this.parseAssignment_(expressionIn);
        return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekAssignmentOperator_: function() {
      switch (this.peekType_()) {
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
          return true;
        default:
          return false;
      }
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
        var left = this.parseAssignment_(expressionIn);
        this.eat_(TokenType.COLON);
        var right = this.parseAssignment_(expressionIn);
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
          return false;
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
     * @return {ParseTree}
     * @private
     */
    parseLeftHandSideExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseNewExpression_();

      // this test is equivalent to is member expression
      if (!(operand instanceof NewExpression) ||
          operand.args != null) {

        // The Call expression productions
        while (this.peekCallSuffix_()) {
          switch (this.peekType_()) {
            case TokenType.OPEN_PAREN:
              var args = this.parseArguments_();
              operand = new CallExpression(this.getTreeLocation_(start), operand, args);
              break;
            case TokenType.OPEN_SQUARE:
              this.eat_(TokenType.OPEN_SQUARE);
              var member = this.parseExpression_();
              this.eat_(TokenType.CLOSE_SQUARE);
              operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
              break;
            case TokenType.PERIOD:
              this.eat_(TokenType.PERIOD);
              operand = new MemberExpression(this.getTreeLocation_(start), operand, this.eatIdName_());
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
          this.peek_(TokenType.PERIOD);
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
        if (this.peek_(TokenType.OPEN_SQUARE)) {
          this.eat_(TokenType.OPEN_SQUARE);
          var member = this.parseExpression_();
          this.eat_(TokenType.CLOSE_SQUARE);
          operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
        } else {
          this.eat_(TokenType.PERIOD);
          operand = new MemberExpression(this.getTreeLocation_(start), operand, this.eatIdName_());
        }
      }
      return operand;
    },

    /**
     * @return {boolean}
     * @private
     */
    peekMemberExpressionSuffix_: function() {
      return this.peek_(TokenType.OPEN_SQUARE) || this.peek_(TokenType.PERIOD);
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
      while (this.peekAssignmentOrSpread_()) {
        args.push(this.parseAssignmentOrSpead_());

        if (!this.peek_(TokenType.CLOSE_PAREN)) {
          this.eat_(TokenType.COMMA);
        }
      }
      this.eat_(TokenType.CLOSE_PAREN);
      return new ArgumentList(this.getTreeLocation_(start), args);
    },

    /**
     * Whether we have a spread expression or an assignment next.
     *
     * This does not peek the operand for the spread expression. This means that
     * {@code parseAssignmentOrSpred} might still fail when this returns true.
     */
    /**
     * @return {boolean}
     * @private
     */
    peekAssignmentOrSpread_: function() {
      return this.peek_(TokenType.SPREAD) || this.peekAssignmentExpression_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseAssignmentOrSpead_: function() {
      if (this.peek_(TokenType.SPREAD)) {
        return this.parseSpreadExpression_();
      }
      return this.parseAssignmentExpression_();
    },

    // Destructuring; see
    // http://wiki.ecmascript.org/doku.php?id=harmony:destructuring
    //
    // SpiderMonkey is much more liberal in where it allows
    // parenthesized patterns, for example, it allows [x, ([y, z])] but
    // those inner parentheses aren't allowed in the grammar on the ES
    // wiki. This implementation conservatively only allows parentheses
    // at the top-level of assignment statements.
    //
    // Rhino has some destructuring support, but it lags SpiderMonkey;
    // for example, Rhino crashes parsing ({x: f().foo}) = {x: 123}.

    // TODO: implement numbers and strings as labels in object destructuring
    // TODO: implement destructuring bind in formal parameter lists
    // TODO: implement destructuring bind in catch headers
    // TODO: implement destructuring bind in for-in when iterators are
    // supported
    // TODO: implement destructuring bind in let bindings when let
    // bindings are supported

    /**
     * @return {boolean}
     * @private
     */
    peekParenPatternAssignment_: function() {
      if (!this.peekParenPatternStart_()) {
        return false;
      }
      var p = this.createLookaheadParser_();
      p.parseParenPattern_();
      return !p.errorReporter_.hadError() && p.peek_(TokenType.EQUAL);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekParenPatternStart_: function() {
      var index = 0;
      while (this.peek_(TokenType.OPEN_PAREN, index)) {
        index++;
      }
      return this.peekPatternStart_(index);
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPatternStart_: function(opt_index) {
      var index = opt_index || 0;
      return this.peek_(TokenType.OPEN_SQUARE, index) || this.peek_(TokenType.OPEN_CURLY, index);
    },

    /**
     * @param {PatternKind=} opt_kind
     * @return {ParseTree}
     * @private
     */
    parseParenPattern_: function(opt_kind) {
      var kind = opt_kind || PatternKind.ANY;
      if (this.peek_(TokenType.OPEN_PAREN)) {
        var start = this.getTreeStartLocation_();
        this.eat_(TokenType.OPEN_PAREN);
        var result = this.parseParenPattern_(kind);
        this.eat_(TokenType.CLOSE_PAREN);
        return new ParenExpression(this.getTreeLocation_(start), result);
      } else {
        return this.parsePattern_(kind);
      }
    },

    /**
     * @param {PatternKind} kind
     * @param {function(TokenType) : boolean} follow
     * @return {boolean}
     * @private
     */
    peekPattern_: function(kind, follow) {
      if (!this.peekPatternStart_()) {
        return false;
      }
      var p = this.createLookaheadParser_();
      p.parsePattern_(kind);
      return !p.errorReporter_.hadError() && follow(p.peekType_());
    },

    /**
     * @param {PatternKind} kind
     * @param {function(TokenType) : boolean} follow
     * @return {boolean}
     * @private
     */
    peekParenPattern_: function(kind, follow) {
      if (!this.peekParenPatternStart_()) {
        return false;
      }
      var p = this.createLookaheadParser_();
      p.parsePattern_(kind);
      return !p.errorReporter_.hadError() && follow(p.peekType_());
    },

    /**
     * @param {PatternKind} kind
     * @return {ParseTree}
     * @private
     */
    parsePattern_: function(kind) {
      switch (this.peekType_()) {
        case TokenType.OPEN_SQUARE:
          return this.parseArrayPattern_(kind);
        case TokenType.OPEN_CURLY:
        default:
          return this.parseObjectPattern_(kind);
      }
    },

    /**
     * @return {boolean}
     * @private
     */
    peekPatternElement_: function() {
      return this.peekExpression_() || this.peek_(TokenType.SPREAD);
    },

    // Element ::= Pattern | LValue | ... LValue
    /**
     * @param {PatternKind} kind
     * @param {function(TokenType) : boolean} follow
     * @return {ParseTree}
     * @private
     */
    parsePatternElement_: function(kind, follow) {
      // [ or { are preferably the start of a sub-pattern
      if (this.peekParenPattern_(kind, follow)) {
        return this.parseParenPattern_(kind);
      }

      // An element that's not a sub-pattern

      var spread = false;
      var start = this.getTreeStartLocation_();
      if (this.peek_(TokenType.SPREAD)) {
        this.eat_(TokenType.SPREAD);
        spread = true;
      }

      var lvalue = this.parseLeftHandSideExpression_();

      if (kind == PatternKind.INITIALIZER &&
          lvalue.type != ParseTreeType.IDENTIFIER_EXPRESSION) {
        this.reportError_('lvalues in initializer patterns must be identifiers');
      }

      return spread ?
          new SpreadPatternElement(this.getTreeLocation_(start), lvalue) :
          lvalue;
    },

    // Pattern ::= ... | "[" Element? ("," Element?)* "]"
    /**
     * @param {PatternKind} kind
     * @return {ParseTree}
     * @private
     */
    parseArrayPattern_: function(kind) {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(TokenType.OPEN_SQUARE);
      while (this.peek_(TokenType.COMMA) || this.peekPatternElement_()) {
        if (this.peek_(TokenType.COMMA)) {
          this.eat_(TokenType.COMMA);
          elements.push(new NullTree());
        } else {
          var element = this.parsePatternElement_(kind, arraySubPatternFollowSet);
          elements.push(element);

          if (element.isSpreadPatternElement()) {
            // Spread can only appear in the posterior, so we must be done
            break;
          } else if (this.peek_(TokenType.COMMA)) {
            // Consume the comma separator
            this.eat_(TokenType.COMMA);
          } else {
            // Otherwise we must be done
            break;
          }
        }
      }
      this.eat_(TokenType.CLOSE_SQUARE);
      return new ArrayPattern(this.getTreeLocation_(start), elements);
    },

    // Pattern ::= "{" (Field ("," Field)* ","?)? "}" | ...
    /**
     * @param {PatternKind} kind
     * @return {ParseTree}
     * @private
     */
    parseObjectPattern_: function(kind) {
      var start = this.getTreeStartLocation_();
      var fields = [];
      this.eat_(TokenType.OPEN_CURLY);
      while (this.peekObjectPatternField_(kind)) {
        fields.push(this.parseObjectPatternField_(kind));

        if (this.peek_(TokenType.COMMA)) {
          // Consume the comma separator
          this.eat_(TokenType.COMMA);
        } else {
          // Otherwise we must be done
          break;
        }
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ObjectPattern(this.getTreeLocation_(start), fields);
    },

    /**
     * @param {PatternKind} kind
     * @return {boolean}
     * @private
     */
    peekObjectPatternField_: function(kind) {
      return this.peek_(TokenType.IDENTIFIER);
    },

    /**
     * @param {PatternKind} kind
     * @return {ParseTree}
     * @private
     */
    parseObjectPatternField_: function(kind) {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      var element = null;
      if (this.peek_(TokenType.COLON)) {
        this.eat_(TokenType.COLON);
        element = this.parsePatternElement_(kind, objectSubPatternFollowSet);

        if (element.isSpreadPatternElement()) {
          this.reportError_('Rest can not be used in object patterns');
        }
      }
      return new ObjectPatternField(this.getTreeLocation_(start),
          identifier, element);
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
      return this.lastToken_.location.end.line;
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
     *
     * @return {IdentifierToken}
     * @private
     */
    eatId_: function() {
      var result = this.eat_(TokenType.IDENTIFIER);
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
      return this.lastToken_.location.end;
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
      this.lastToken_ = this.scanner_.nextToken();
      return this.lastToken_;
    },

    /**
     * Consumes a regular expression literal token and returns it.
     *
     * @return {LiteralToken}
     * @private
     */
    nextRegularExpressionLiteralToken_: function() {
      var lastToken = this.scanner_.nextRegularExpressionLiteralToken();
      this.lastToken_ = lastToken;
      return lastToken;
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
     * Forks the parser at the current point and returns a new
     * parser. The new parser observes but does not report errors. This
     * can be used for speculative parsing:
     *
     * <pre>
     * var p = this.createLookaheadParser_();
     * if (p.parseX() != null &amp;&amp; !p.errorReporter_.hadError()) {
     *   return this.parseX_();  // speculation succeeded, so roll forward
     * } else {
     *   return this.parseY_();  // try something else
     * }
     * </pre>
     *
     * @return {Parser}
     * @private
     */
    createLookaheadParser_: function() {
      return new Parser(new MutedErrorReporter(),
                        this.scanner_.getFile(),
                        this.scanner_.getOffset());
    },

    /**
     * Reports an error message at a given token.
     * @param {traceur.util.SourcePostion} token The location to report the message at.
     * @param {string} message The message to report in String.format style.
     *
     * @return {void}
     * @private
     */
    reportError_: function(var_args) {
      if (arguments.length == 1)
        this.errorReporter_.reportError(this.scanner_.getPosition(), arguments[0]);
      else
        this.errorReporter_.reportError(arguments[0].getStart(), arguments[1]);
    }
  };

  return {
    Parser: Parser
  };
});
