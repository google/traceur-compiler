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

  var SourceRange = traceur.util.SourceRange;

  var TokenType = traceur.syntax.TokenType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var MutedErrorReporter = traceur.util.MutedErrorReporter;
  var Keywords = traceur.syntax.Keywords;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var IdentifierToken = traceur.syntax.IdentifierToken;

  var ArgumentListTree = traceur.syntax.trees.ArgumentListTree;
  var ArrayLiteralExpressionTree = traceur.syntax.trees.ArrayLiteralExpressionTree;
  var ArrayPatternTree = traceur.syntax.trees.ArrayPatternTree;
  var AwaitStatementTree = traceur.syntax.trees.AwaitStatementTree;
  var BinaryOperatorTree = traceur.syntax.trees.BinaryOperatorTree;
  var BlockTree = traceur.syntax.trees.BlockTree;
  var BreakStatementTree = traceur.syntax.trees.BreakStatementTree;
  var CallExpressionTree = traceur.syntax.trees.CallExpressionTree;
  var CaseClauseTree = traceur.syntax.trees.CaseClauseTree;
  var CatchTree = traceur.syntax.trees.CatchTree;
  var ClassDeclarationTree = traceur.syntax.trees.ClassDeclarationTree;
  var ClassExpressionTree = traceur.syntax.trees.ClassExpressionTree;
  var CommaExpressionTree = traceur.syntax.trees.CommaExpressionTree;
  var ConditionalExpressionTree = traceur.syntax.trees.ConditionalExpressionTree;
  var ContinueStatementTree = traceur.syntax.trees.ContinueStatementTree;
  var DebuggerStatementTree = traceur.syntax.trees.DebuggerStatementTree;
  var DefaultClauseTree = traceur.syntax.trees.DefaultClauseTree;
  var DefaultParameterTree = traceur.syntax.trees.DefaultParameterTree;
  var DoWhileStatementTree = traceur.syntax.trees.DoWhileStatementTree;
  var EmptyStatementTree = traceur.syntax.trees.EmptyStatementTree;
  var ExportDeclarationTree = traceur.syntax.trees.ExportDeclarationTree;
  var ExpressionStatementTree = traceur.syntax.trees.ExpressionStatementTree;
  var FieldDeclarationTree = traceur.syntax.trees.FieldDeclarationTree;
  var FinallyTree = traceur.syntax.trees.FinallyTree;
  var ForEachStatementTree = traceur.syntax.trees.ForEachStatementTree;
  var ForInStatementTree = traceur.syntax.trees.ForInStatementTree;
  var ForStatementTree = traceur.syntax.trees.ForStatementTree;
  var FormalParameterListTree = traceur.syntax.trees.FormalParameterListTree;
  var FunctionDeclarationTree = traceur.syntax.trees.FunctionDeclarationTree;
  var GetAccessorTree = traceur.syntax.trees.GetAccessorTree;
  var IdentifierExpressionTree = traceur.syntax.trees.IdentifierExpressionTree;
  var IfStatementTree = traceur.syntax.trees.IfStatementTree;
  var ImportDeclarationTree = traceur.syntax.trees.ImportDeclarationTree;
  var ImportPathTree = traceur.syntax.trees.ImportPathTree;
  var ImportSpecifierTree = traceur.syntax.trees.ImportSpecifierTree;
  var LabelledStatementTree = traceur.syntax.trees.LabelledStatementTree;
  var LiteralExpressionTree = traceur.syntax.trees.LiteralExpressionTree;
  var MemberExpressionTree = traceur.syntax.trees.MemberExpressionTree;
  var MemberLookupExpressionTree = traceur.syntax.trees.MemberLookupExpressionTree;
  var MissingPrimaryExpressionTree = traceur.syntax.trees.MissingPrimaryExpressionTree;
  var MixinResolveListTree = traceur.syntax.trees.MixinResolveListTree;
  var MixinResolveTree = traceur.syntax.trees.MixinResolveTree;
  var MixinTree = traceur.syntax.trees.MixinTree;
  var ModuleDefinitionTree = traceur.syntax.trees.ModuleDefinitionTree;
  var NewExpressionTree = traceur.syntax.trees.NewExpressionTree;
  var NullTree = traceur.syntax.trees.NullTree;
  var ObjectLiteralExpressionTree = traceur.syntax.trees.ObjectLiteralExpressionTree;
  var ObjectPatternFieldTree = traceur.syntax.trees.ObjectPatternFieldTree;
  var ObjectPatternTree = traceur.syntax.trees.ObjectPatternTree;
  var ParenExpressionTree = traceur.syntax.trees.ParenExpressionTree;
  var PostfixExpressionTree = traceur.syntax.trees.PostfixExpressionTree;
  var ProgramTree = traceur.syntax.trees.ProgramTree;
  var PropertyNameAssignmentTree = traceur.syntax.trees.PropertyNameAssignmentTree;
  var RequiresMemberTree = traceur.syntax.trees.RequiresMemberTree;
  var RestParameterTree = traceur.syntax.trees.RestParameterTree;
  var ReturnStatementTree = traceur.syntax.trees.ReturnStatementTree;
  var SetAccessorTree = traceur.syntax.trees.SetAccessorTree;
  var SpreadExpressionTree = traceur.syntax.trees.SpreadExpressionTree;
  var SpreadPatternElementTree = traceur.syntax.trees.SpreadPatternElementTree;
  var SuperExpressionTree = traceur.syntax.trees.SuperExpressionTree;
  var SwitchStatementTree = traceur.syntax.trees.SwitchStatementTree;
  var ThisExpressionTree = traceur.syntax.trees.ThisExpressionTree;
  var ThrowStatementTree = traceur.syntax.trees.ThrowStatementTree;
  var TraitDeclarationTree = traceur.syntax.trees.TraitDeclarationTree;
  var TryStatementTree = traceur.syntax.trees.TryStatementTree;
  var UnaryExpressionTree = traceur.syntax.trees.UnaryExpressionTree;
  var VariableDeclarationListTree = traceur.syntax.trees.VariableDeclarationListTree;
  var VariableDeclarationTree = traceur.syntax.trees.VariableDeclarationTree;
  var VariableStatementTree = traceur.syntax.trees.VariableStatementTree;
  var WhileStatementTree = traceur.syntax.trees.WhileStatementTree;
  var WithStatementTree = traceur.syntax.trees.WithStatementTree;
  var YieldStatementTree = traceur.syntax.trees.YieldStatementTree;


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
     * @return {ProgramTree}
     */
    parseProgram: function() {
      //var t = new Timer("Parse Program");
      var start = this.getTreeStartLocation_();
      var sourceElements = this.parseGlobalSourceElements_();
      this.eat_(TokenType.END_OF_FILE);
      //t.end();
      return new ProgramTree(this.getTreeLocation_(start), sourceElements);
    },

    /**
     * @return {Array.<ParseTree>}
     * @private
     */
    parseGlobalSourceElements_: function() {
      var result = [];

      while (!this.peek_(TokenType.END_OF_FILE)) {
        result.push(this.parseScriptElement_());
      }

      return result;
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
      return this.peekClassDeclaration_() ||
              this.peekTraitDeclaration_() ||
              this.peekModuleDeclaration_() ||
              this.peekSourceElement_();
    }
  */

    /**
   * @return {ParseTree}
   * @private
   */
    parseScriptElement_: function() {
      if (this.peekClassDeclaration_()) {
        return this.parseClassDeclaration_();
      }
      if (this.peekTraitDeclaration_()) {
        return this.parseTraitDeclaration_();
      }
      if (this.peekModuleDeclaration_()) {
        return this.parseModuleDeclaration_();
      }

      return this.parseSourceElement_();
    },

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
    parseModuleDefinition_: function() {
      var start = this.getTreeStartLocation_();
      this.eatId_(); // module
      var name = this.eatId_();
      this.eat_(TokenType.OPEN_CURLY);
      var result = [];
      while (this.peekModuleElement_()) {
        result.push(this.parseModuleElement_());
      }
      this.eat_(TokenType.CLOSE_CURLY);
      return new ModuleDefinitionTree(this.getTreeLocation_(start), name, result);
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
      return this.peekClassDeclaration_() ||
             this.peekTraitDeclaration_() ||
             this.peekImportDeclaration_() ||
             this.peekExportDeclaration_() ||
             this.peekModuleDeclaration_() ||
             this.peekSourceElement_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseModuleElement_: function() {
      if (this.peekModuleDeclaration_()) {
        return this.parseModuleDeclaration_();
      }
      if (this.peekImportDeclaration_()) {
        return this.parseImportDeclaration_();
      }
      if (this.peekExportDeclaration_()) {
        return this.parseExportDeclaration_();
      }
      return this.parseScriptElement_();
    },


    //  ImportDeclaration ::= 'import' ImportPath (',' ImportPath)* ';'
    /**
     * @return {boolean}
     * @private
     */
    peekImportDeclaration_: function() {
      return this.peek_(TokenType.IMPORT);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseImportDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.IMPORT);
      var result = [];

      result.push(this.parseImportPath_());
      while (this.peek_(TokenType.COMMA)) {
        this.eat_(TokenType.COMMA);
        result.push(this.parseImportPath_());
      }
      this.eatPossibleImplicitSemiColon_();

      return new ImportDeclarationTree(this.getTreeLocation_(start), result);
    },

    //  ImportPath ::= QualifiedPath ('.' ImportSpecifierSet)?
    //  QualifiedPath ::= Identifier
    //                 |  QualifiedPath '.' Identifier
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportPath_: function() {
      var start = this.getTreeStartLocation_();
      var qualifiedPath = [];
      qualifiedPath.push(this.eatId_());
      while (this.peek_(TokenType.PERIOD) && this.peek_(TokenType.IDENTIFIER, 1)) {
        this.eat_(TokenType.PERIOD);
        qualifiedPath.push(this.eatId_());
      }
      if (this.peek_(TokenType.PERIOD)) {
        this.eat_(TokenType.PERIOD);
        return this.parseImportSpecifierSet_(start, qualifiedPath);
      }
      return new ImportPathTree(this.getTreeLocation_(start), qualifiedPath, ImportPathTree.Kind.NONE);
    },

    //  ImportSpecifierSet ::= '{' (ImportSpecifier (',' ImportSpecifier)*)? '}'
    //                      |  '*'
    /**
     * @param {SourcePosition} start
     * @param {Array.<IdentifierToken>} qualifiedPath
     * @return {ParseTree}
     * @private
     */
    parseImportSpecifierSet_: function(start, qualifiedPath) {
      if (this.peek_(TokenType.OPEN_CURLY)) {
        var elements = [];
        this.eat_(TokenType.OPEN_CURLY);
        elements.push(this.parseImportSpecifier_());
        while (this.peek_(TokenType.COMMA)) {
          this.eat_(TokenType.COMMA);
          elements.push(this.parseImportSpecifier_());
        }
        this.eat_(TokenType.CLOSE_CURLY);
        return new ImportPathTree(this.getTreeLocation_(start), qualifiedPath, elements);
      } else {
        this.eat_(TokenType.STAR);
        return new ImportPathTree(this.getTreeLocation_(start), qualifiedPath, ImportPathTree.Kind.ALL);
      }
    },

    //  ImportSpecifier ::= Identifier (':' Identifier)?
    /**
     * @return {ParseTree}
     * @private
     */
    parseImportSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var importedName = this.eatId_();
      var destinationName = null;
      if (this.peek_(TokenType.COLON)) {
        this.eat_(TokenType.COLON);
        destinationName = this.eatId_();
      }
      return new ImportSpecifierTree(this.getTreeLocation_(start), importedName, destinationName);
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
    peekExportDeclaration_: function() {
      return this.peek_(TokenType.EXPORT);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseExportDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.EXPORT);
      var exportVar;
      switch (this.peekType_()) {
        case TokenType.VAR:
        case TokenType.CONST:
          exportVar = this.parseVariableStatement_();
          break;
        case TokenType.FUNCTION:
        case TokenType.POUND:
          exportVar = this.parseFunctionDeclaration_();
          break;
        case TokenType.CLASS:
          exportVar = this.parseClassDeclaration_();
          break;
        case TokenType.IDENTIFIER:
          if (this.peekModuleDefinition_()) {
            exportVar = this.parseModuleDefinition_();
          } else if (this.peekTraitDeclaration_()) {
            exportVar = this.parseTraitDeclaration_();
          } else {
            throw Error('UNDONE: export ModuleLoad | ExportPath');
          }
          break;
        default:
          // unreachable
          exportVar = null;
          break;
      }
      return new ExportDeclarationTree(this.getTreeLocation_(start), exportVar);
    },

    // TODO: ModuleLoadRedeclarationList
    // ModuleDefinition
    /**
     * @return {boolean}
     * @private
     */
    peekModuleDeclaration_: function() {
      return this.peekModuleDefinition_();
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseModuleDeclaration_: function() {
      return this.parseModuleDefinition_();
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
      return new TraitDeclarationTree(this.getTreeLocation_(start), name, elements);
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
      return new RequiresMemberTree(this.getTreeLocation_(start), name);
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
      return new ClassDeclarationTree(this.getTreeLocation_(start), name, superClass, elements);
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
        case TokenType.STATIC:
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

      var isStatic = this.eatOpt_(TokenType.STATIC) != null;

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
      return new FieldDeclarationTree(
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
      return new MixinTree(this.getTreeLocation_(start), name, mixinResolves);
    },

    /**
     * @return {MixinResolveListTree}
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

      return new MixinResolveListTree(this.getTreeLocation_(start), result);
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
      return new MixinResolveTree(this.getTreeLocation_(start), from, to);
    },

    /**
     * @param {boolean} allowStatic
     * @return {ParseTree}
     * @private
     */
    parseMethodDeclaration_: function(allowStatic) {
      var start = this.getTreeStartLocation_();
      var isStatic = allowStatic && this.eatOpt_(TokenType.STATIC) != null;
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
      var index = this.peek_(TokenType.STATIC) ? 1 : 0;
      return this.peekFunction_(index) ||
          (this.peek_(TokenType.IDENTIFIER, index) && this.peek_(TokenType.OPEN_PAREN, index + 1));
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseConstructorDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      return this.parseFunctionDeclarationTail_(start, false, this.eatIdName_());
    },

    /**
     * @return {boolean}
     * @private
     */
    peekConstructorDeclaration_: function() {
      return this.peek_(TokenType.NEW) && this.peek_(TokenType.OPEN_PAREN, 1);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseSourceElement_: function() {
      if (this.peekFunction_()) {
        return this.parseFunctionDeclaration_();
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
      return this.peekFunction_() || this.peekStatementStandard_() || this.peek_(TokenType.LET);
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
      return new FunctionDeclarationTree(this.getTreeLocation_(start), name, isStatic, formalParameterList, functionBody);
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
      return new FunctionDeclarationTree(this.getTreeLocation_(start), name, false, formalParameterList, functionBody);
    },

    /**
     * @return {FormalParameterListTree}
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
          result.push(new RestParameterTree(this.getTreeLocation_(start), this.eatId_()));

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

      return new FormalParameterListTree(null, result);
    },

    /**
     * @return {DefaultParameterTree}
     * @private
     */
    parseDefaultParameter_: function() {
      var start = this.getTreeStartLocation_();
      var ident = this.parseIdentifierExpression_();
      this.eat_(TokenType.EQUAL);
      var expr = this.parseAssignmentExpression_();
      return new DefaultParameterTree(this.getTreeLocation_(start), ident, expr);
    },

    /**
     * @return {BlockTree}
     * @private
     */
    parseFunctionBody_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);
      var result = this.parseSourceElementList_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new BlockTree(this.getTreeLocation_(start), result);
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
     * @return {SpreadExpressionTree}
     * @private
     */
    parseSpreadExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SPREAD);
      var operand = this.parseAssignmentExpression_();
      return new SpreadExpressionTree(this.getTreeLocation_(start), operand);
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
     * @return {BlockTree}
     * @private
     */
    parseBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.OPEN_CURLY);
      // Spec says Statement list. However functions are also embedded in the wild.
      var result = this.parseSourceElementList_();
      this.eat_(TokenType.CLOSE_CURLY);
      return new BlockTree(this.getTreeLocation_(start), result);
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
     * @return {VariableStatementTree}
     * @private
     */
    parseVariableStatement_: function() {
      var start = this.getTreeStartLocation_();
      var declarations = this.parseVariableDeclarationList_();
      this.checkInitializers_(declarations);
      this.eatPossibleImplicitSemiColon_();
      return new VariableStatementTree(this.getTreeLocation_(start), declarations);
    },

    /**
     * @return {VariableDeclarationListTree}
     * @private
     */
    parseVariableDeclarationListNoIn_: function() {
      return this.parseVariableDeclarationList_(Expression.NO_IN);
    },

    /**
     * @param {Expression=} opt_expressionIn
     * @return {VariableDeclarationListTree}
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
      return new VariableDeclarationListTree(
          this.getTreeLocation_(start), token, declarations);
    },

    /**
     * @param {boolean} isStatic
     * @param {TokenType} binding
     * @param {Expression} expressionIn
     * @return {VariableDeclarationTree}
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
      return new VariableDeclarationTree(this.getTreeLocation_(start), lvalue, initializer);
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
     * @return {EmptyStatementTree}
     * @private
     */
    parseEmptyStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SEMI_COLON);
      return new EmptyStatementTree(this.getTreeLocation_(start));
    },

    // 12.4 Expression Statement
    /**
     * @return {ExpressionStatementTree}
     * @private
     */
    parseExpressionStatement_: function() {
      var start = this.getTreeStartLocation_();
      var expression = this.parseExpression_();
      this.eatPossibleImplicitSemiColon_();
      return new ExpressionStatementTree(this.getTreeLocation_(start), expression);
    },

    // 12.5 If Statement
    /**
     * @return {IfStatementTree}
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
      return new IfStatementTree(this.getTreeLocation_(start), condition, ifClause, elseClause);
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
      return new DoWhileStatementTree(this.getTreeLocation_(start), body, condition);
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
      return new WhileStatementTree(this.getTreeLocation_(start), condition, body);
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
     * @param {VariableDeclarationListTree} initializer
     * @return {ParseTree}
     * @private
     */
    parseForEachStatement_: function(start, initializer) {
      this.eat_(TokenType.COLON);
      var collection = this.parseExpression_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseStatement_();
      return new ForEachStatementTree(this.getTreeLocation_(start), initializer, collection, body);
    },

    /**
     * Checks variable declaration in variable and for statements.
     *
     * @param {VariableDeclarationListTree} variables
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
      return new ForStatementTree(this.getTreeLocation_(start), initializer, condition, increment, body);
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
      return new ForInStatementTree(this.getTreeLocation_(start), initializer, collection, body);
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
      return new ContinueStatementTree(this.getTreeLocation_(start), name);
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
      return new BreakStatementTree(this.getTreeLocation_(start), name);
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
      return new ReturnStatementTree(this.getTreeLocation_(start), expression);
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
      if (!this.peekImplicitSemiColon_()) {
        expression = this.parseExpression_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new YieldStatementTree(this.getTreeLocation_(start), expression);
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
      return new AwaitStatementTree(this.getTreeLocation_(start), identifier, expression);
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
      return new WithStatementTree(this.getTreeLocation_(start), expression, body);
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
      return new SwitchStatementTree(this.getTreeLocation_(start), expression, caseClauses);
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
            result.push(new CaseClauseTree(this.getTreeLocation_(start), expression, statements));
            break;
          case TokenType.DEFAULT:
            if (foundDefaultClause) {
              this.reportError_('Switch statements may have at most one default clause');
            } else {
              foundDefaultClause = true;
            }
            this.eat_(TokenType.DEFAULT);
            this.eat_(TokenType.COLON);
            result.push(new DefaultClauseTree(this.getTreeLocation_(start), this.parseCaseStatementsOpt_()));
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
      return new LabelledStatementTree(this.getTreeLocation_(start), name, this.parseStatement_());
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
      return new ThrowStatementTree(this.getTreeLocation_(start), value);
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
      return new TryStatementTree(this.getTreeLocation_(start), body, catchBlock, finallyBlock);
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
      catchBlock = new CatchTree(this.getTreeLocation_(start), exceptionName, catchBody);
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
      return new FinallyTree(this.getTreeLocation_(start), finallyBlock);
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

      return new DebuggerStatementTree(this.getTreeLocation_(start));
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
      return new ClassExpressionTree(this.getTreeLocation_(start));
    },

    /**
     * @return {SuperExpressionTree}
     * @private
     */
    parseSuperExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.SUPER);
      return new SuperExpressionTree(this.getTreeLocation_(start));
    },

    /**
     * @return {ThisExpressionTree}
     * @private
     */
    parseThisExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TokenType.THIS);
      return new ThisExpressionTree(this.getTreeLocation_(start));
    },

    /**
     * @return {IdentifierExpressionTree}
     * @private
     */
    parseIdentifierExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new IdentifierExpressionTree(this.getTreeLocation_(start), identifier);
    },

    /**
     * @return {LiteralExpressionTree}
     * @private
     */
    parseLiteralExpression_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextLiteralToken_();
      return new LiteralExpressionTree(this.getTreeLocation_(start), literal);
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
      return new LiteralExpressionTree(this.getTreeLocation_(start), literal);
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
      return new ArrayLiteralExpressionTree(
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
      return new ObjectLiteralExpressionTree(this.getTreeLocation_(start), result);
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
      var index = allowStatic && this.peek_(TokenType.STATIC) ? 1 : 0;
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
      var isStatic = this.eatOpt_(TokenType.STATIC) != null;
      this.eatId_(); // get
      var propertyName = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseFunctionBody_();
      return new GetAccessorTree(this.getTreeLocation_(start), propertyName, isStatic, body);
    },

    /**
     *@param {boolean} allowStatic
     * @return {boolean}
     * @private
     */
    peekSetAccessor_: function(allowStatic) {
      var index = allowStatic && this.peek_(TokenType.STATIC) ? 1 : 0;
      return this.peekPredefinedString_(PredefinedName.SET, index) && this.peekPropertyName_(index + 1);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseSetAccessor_: function() {
      var start = this.getTreeStartLocation_();
      var isStatic = this.eatOpt_(TokenType.STATIC) != null;
      this.eatId_(); // set
      var propertyName = this.nextToken_();
      this.eat_(TokenType.OPEN_PAREN);
      var parameter = this.eatId_();
      this.eat_(TokenType.CLOSE_PAREN);
      var body = this.parseFunctionBody_();
      return new SetAccessorTree(this.getTreeLocation_(start), propertyName, isStatic, parameter, body);
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
      return new PropertyNameAssignmentTree(this.getTreeLocation_(start), name, value);
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
      return new ParenExpressionTree(this.getTreeLocation_(start), result);
    },

    /**
     * @return {ParseTree}
     * @private
     */
    parseMissingPrimaryExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.reportError_('primary expression expected');
      var token = this.nextToken_();
      return new MissingPrimaryExpressionTree(this.getTreeLocation_(start), token);
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
        return new CommaExpressionTree(this.getTreeLocation_(start), exprs);
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
        return new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        return new ConditionalExpressionTree(this.getTreeLocation_(start), condition, left, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperatorTree(this.getTreeLocation_(start), left, operator, right);
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
        return new UnaryExpressionTree(this.getTreeLocation_(start), operator, operand);
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
        operand = new PostfixExpressionTree(this.getTreeLocation_(start), operand, operator);
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
      if (!(operand instanceof NewExpressionTree) ||
          operand.args != null) {

        // The Call expression productions
        while (this.peekCallSuffix_()) {
          switch (this.peekType_()) {
            case TokenType.OPEN_PAREN:
              var args = this.parseArguments_();
              operand = new CallExpressionTree(this.getTreeLocation_(start), operand, args);
              break;
            case TokenType.OPEN_SQUARE:
              this.eat_(TokenType.OPEN_SQUARE);
              var member = this.parseExpression_();
              this.eat_(TokenType.CLOSE_SQUARE);
              operand = new MemberLookupExpressionTree(this.getTreeLocation_(start), operand, member);
              break;
            case TokenType.PERIOD:
              this.eat_(TokenType.PERIOD);
              operand = new MemberExpressionTree(this.getTreeLocation_(start), operand, this.eatIdName_());
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
          operand = new MemberLookupExpressionTree(this.getTreeLocation_(start), operand, member);
        } else {
          this.eat_(TokenType.PERIOD);
          operand = new MemberExpressionTree(this.getTreeLocation_(start), operand, this.eatIdName_());
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
        return new NewExpressionTree(this.getTreeLocation_(start), operand, args);
      } else {
        return this.parseMemberExpressionNoNew_();
      }
    },

    /**
     * @return {ArgumentListTree}
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
      return new ArgumentListTree(this.getTreeLocation_(start), args);
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
        return new ParenExpressionTree(this.getTreeLocation_(start), result);
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
          new SpreadPatternElementTree(this.getTreeLocation_(start), lvalue) :
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
      return new ArrayPatternTree(this.getTreeLocation_(start), elements);
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
      return new ObjectPatternTree(this.getTreeLocation_(start), fields);
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
      return new ObjectPatternFieldTree(this.getTreeLocation_(start),
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
      return this.getNextLine_() > this.getLastLine_() || this.peek_(TokenType.SEMI_COLON) || this.peek_(TokenType.CLOSE_CURLY);
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
