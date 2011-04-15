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

traceur.define('semantics', function() {
  'use strict';

  var TokenType = traceur.syntax.TokenType;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  var SymbolType = traceur.semantics.symbols.SymbolType;
  var Symbol = traceur.semantics.symbols.Symbol;
  var ClassSymbol = traceur.semantics.symbols.ClassSymbol;
  var ExportSymbol = traceur.semantics.symbols.ExportSymbol;
  var FieldSymbol = traceur.semantics.symbols.FieldSymbol;
  var MethodSymbol = traceur.semantics.symbols.MethodSymbol;
  var MixinMemberSymbol = traceur.semantics.symbols.MixinMemberSymbol;
  var MixinSymbol = traceur.semantics.symbols.MixinSymbol;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var PropertySymbol = traceur.semantics.symbols.PropertySymbol;
  var RequiresSymbol = traceur.semantics.symbols.RequiresSymbol;
  var TraitSymbol = traceur.semantics.symbols.TraitSymbol;
  var MODULE_DEFINITION = traceur.syntax.trees.ParseTreeType.MODULE_DEFINITION;
  var EXPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.EXPORT_DECLARATION;
  var GET_ACCESSOR = ParseTreeType.GET_ACCESSOR;
  var VARIABLE_STATEMENT = ParseTreeType.VARIABLE_STATEMENT;
  var FUNCTION_DECLARATION = ParseTreeType.FUNCTION_DECLARATION;
  var CLASS_DECLARATION = ParseTreeType.CLASS_DECLARATION;
  var SET_ACCESSOR = ParseTreeType.SET_ACCESSOR;
  var TRAIT_DECLARATION = ParseTreeType.TRAIT_DECLARATION;
  var MIXIN = ParseTreeType.MIXIN;
  var REQUIRES_MEMBER = ParseTreeType.REQUIRES_MEMBER;
  var IDENTIFIER = TokenType.IDENTIFIER;
  var STRING = TokenType.STRING;
  var NUMBER = TokenType.NUMBER;
  var IDENTIFIER_EXPRESSION = ParseTreeType.IDENTIFIER_EXPRESSION;
  var SetAccessor = traceur.semantics.symbols.SetAccessor;
  var GetAccessor = traceur.semantics.symbols.GetAccessor;

  /**
   * Builds up all symbols for a project and reports all semantic errors.
   *
   * Ordinarily Javascript is processed in the order that script tags/source
   * files are encountered. In normal ordered mode it is an error to reference
   * a symbol before it is defined.
   *
   * The semantic analyzer can also operate in optimistic/unordered mode. In
   * this mode it will resolve symbols in order of base class to super class or
   * it will report an error if no such ordering exists. Unordered mode is
   * useful when you just want to throw a directory of files at the compiler and
   * you want the compiler to just compile them all. It is then up to the user
   * to reference the generated compiler output in an order that defines symbols
   * before they are referenced.
   *
   * Semantic analysis proceeds in phases. Currently the phases are:
   *   declare aggregates - just create the symbols for all classes and traits.
   *   resolve inheritance - resolve the inheritance for all classes and detect
   *                         inheritance cycles
   *   declare members - declare all members of classes and traits. Mixin all
   *                     trait members into classes.
   *
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {boolean} inOrder
   * @constructor
   */
  function SemanticAnalyzer(reporter, project) {
    this.reporter_ = reporter;
    this.project_ = project;
    this.typesBeingDeclared_ = [];
  }

  SemanticAnalyzer.prototype = {
    /**
     * @return {void}
     */
    analyze: function() {
      this.declareAllModules_();
    },

    /**
     * @param {ProgramTree=} opt_tree
     * @return {void}
     * @private
     */
    declareAllModules_: function(opt_tree) {
      if (opt_tree) {
        opt_tree.sourceElements.forEach(function(element) {
          switch (element.type) {
            case MODULE_DEFINITION:
              this.declareModule_(this.project_.getRootModule(),
                                  element.asModuleDefinition());
              break;
          }
        }, this);
      } else {
        this.project_.getSourceTrees().forEach(this.declareAllModules_, this);
      }
    },

    /**
     * @param {ModuleSymbol} module
     * @return {void}
     * @private
     */
    declareSubModulesAndExports_: function(module) {
      module.tree.elements.forEach(function(element) {
        switch (element.type) {
          case MODULE_DEFINITION:
            this.declareModule_(module, element.asModuleDefinition());
            break;
          case EXPORT_DECLARATION:
            this.declareExport_(module, element.asExportDeclaration());
            break;
        }
      }, this);
    },

    /**
     * @param {ModuleSymbol} module
     * @param {ExportDeclarationTree} tree
     * @param {string} opt_name
     * @return {void}
     * @private
     */
    declareExport_: function(module, tree, opt_name) {
      if (opt_name) {
        this.declareExportWithName_(module, tree, opt_name);
        return;
      }

      var exp = tree.declaration;
      switch (exp.type) {
        case VARIABLE_STATEMENT:
          var statement = exp.asVariableStatement();
          statement.declarations.declarations.forEach(function(declaration) {
            // An IdentifierExpressionTree, UNDONE: ArrayPatternTree or
            // UNDONE ObjectLiteralTree
            this.declareExport_(module, declaration,
                declaration.lvalue.asIdentifierExpression().
                identifierToken.value);
          }, this);
          break;
        case MODULE_DEFINITION:
          this.declareExport_(module, exp, exp.asModuleDefinition().name.value);
          break;
        case FUNCTION_DECLARATION:
          this.declareExport_(module, exp,
                              exp.asFunctionDeclaration().name.value);
          break;
        case CLASS_DECLARATION:
          this.declareExport_(module, exp, exp.asClassDeclaration().name.value);
          break;
        case TRAIT_DECLARATION:
          this.declareExport_(module, exp, exp.asTraitDeclaration().name.value);
          break;
        default:
          throw new Error('Not implemented: ModuleLoad | ExportPath');
      }
    },

    /**
     * @param {ModuleSymbol} module
     * @param {ParseTree} tree
     * @param {string} name
     * @return {void}
     * @private
     */
    declareExportWithName_: function(module, tree, name) {
      if (module.hasModule(name)) {
        this.reportError_(tree, 'Export \'%s\' conflicts with module', name);
        this.reportRelatedError_(module.getModule(name).tree);
        return;
      }
      if (module.hasExport(name)) {
        this.reportError_(tree, 'Export \'%s\' conflicts with export', name);
        this.reportRelatedError_(module.getExport(name));
        return;
      }
      if (tree.type == ParseTreeType.MODULE_DEFINITION) {
        this.declareModule_(module, tree.asModuleDefinition());
      }
      module.addExport(name, new ExportSymbol(tree, name));
    },

    /**
     * @param {ModuleSymbol} parent
     * @param {ModuleDefinitionTree} tree
     * @return {ModuleSymbol}
     * @private
     */
    declareModule_: function(parent, tree) {
      var name = tree.name.value;
      if (!this.checkForDuplicateModule_(tree, parent, name)) {
        return null;
      }
      var module = new ModuleSymbol(name, parent, tree);
      parent.addModule(module);
      this.declareSubModulesAndExports_(module);
      return module;
    },

    /**
     * @param {ModuleDefinitionTree} tree
     * @param {ModuleSymbol} parent
     * @param {string} name
     * @return {boolean}
     * @private
     */
    checkForDuplicateModule_: function(tree, parent, name) {
      if (parent.hasModule(name)) {
        this.reportError_(tree, 'Duplicate module declaration \'%s\'', name);
        this.reportRelatedError_(parent.getModule(name).tree);
        return false;
      }
      if (parent.hasExport(name)) {
        this.reportError_(tree, 'Module \'%s\' has the same name as an export',
                          name);
        this.reportRelatedError_(parent.getExport(name));
        return false;
      }
      return true;
    },

    /**
     * @param {SourceFile} sourceFile
     * @return {void}
     */
    analyzeFile: function(sourceFile) {
      // TODO(arv): Remove or keep?
    },

    /**
     * @param {Symbol|ParseTree} symbolOrTree
     * @param {string} format
     * @param {...Object} var_args
     * @return {void}
     * @private
     */
    reportError_: function(symbolOrTree, format, var_args) {
      var tree;
      if (symbolOrTree instanceof Symbol)
        tree = symbol.tree;
      else
        tree = symbolOrTree;

      var args = Array.prototype.slice.call(arguments);
      args[0] = tree;

      this.reporter_.reportError.apply(this.reporter_, args);
    },

    /**
     * @param {Symbol|ParseTree} symbolOrTree
     * @return {void}
     * @private
     */
    reportRelatedError_: function(symbolOrTree) {
      if (symbolOrTree instanceof ParseTree) {
        this.reportError_(symbolOrTree, 'Location related to previous error');
      } else {
        symbolOrTree.getRelatedLocations().forEach(this.reportRelatedError_,
                                                   this);
      }
    }
  };

  return {
    SemanticAnalyzer: SemanticAnalyzer
  };
});
