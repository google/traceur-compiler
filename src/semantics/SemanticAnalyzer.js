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
  var ExportSymbol = traceur.semantics.symbols.ExportSymbol;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var MODULE_DECLARATION = traceur.syntax.trees.ParseTreeType.MODULE_DECLARATION;
  var MODULE_DEFINITION = traceur.syntax.trees.ParseTreeType.MODULE_DEFINITION;
  var EXPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.EXPORT_DECLARATION;
  var VARIABLE_STATEMENT = ParseTreeType.VARIABLE_STATEMENT;
  var FUNCTION_DECLARATION = ParseTreeType.FUNCTION_DECLARATION;
  var CLASS_DECLARATION = ParseTreeType.CLASS_DECLARATION;
  var TRAIT_DECLARATION = ParseTreeType.TRAIT_DECLARATION;
  var IDENTIFIER = TokenType.IDENTIFIER;
  var STRING = TokenType.STRING;
  var NUMBER = TokenType.NUMBER;
  var IDENTIFIER_EXPRESSION = ParseTreeType.IDENTIFIER_EXPRESSION;

  // TODO(arv): Update comment and name since this is only used for modules at
  // the moment.

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
      this.declareAllModuleDefinitions_();
      this.declareAllModuleDeclarations_();
      this.validateAllModules_();
    },

    /**
     * @param {ProgramTree=} opt_tree
     * @return {void}
     * @private
     */
    declareAllModuleDefinitions_: function(opt_tree) {
      if (opt_tree) {
        opt_tree.sourceElements.forEach(function(element) {
          switch (element.type) {
            case MODULE_DEFINITION:
              this.declareModuleDefinition_(this.project_.getRootModule(),
                                            element.asModuleDefinition());
              break;
          }
        }, this);
      } else {
        this.project_.getSourceTrees().forEach(
            this.declareAllModuleDefinitions_, this);
      }
    },

    /**
     * @param {ProgramTree=} opt_tree
     * @return {void}
     * @private
     */
    declareAllModuleDeclarations_: function(opt_tree) {
      if (opt_tree) {
        opt_tree.sourceElements.forEach(function(element) {
          switch (element.type) {
            case MODULE_DECLARATION:
              this.declareModuleDeclaration_(this.project_.getRootModule(),
                                             element.asModuleDeclaration());
              break;
          }
        }, this);
      } else {
        this.project_.getSourceTrees().forEach(
            this.declareAllModuleDeclarations_, this);
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
            this.declareModuleDefinition_(module, element.asModuleDefinition());
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
        case MODULE_DECLARATION:
          exp.specifiers.forEach(function(specifier) {
            this.declareExport_(module, specifier, specifier.identifier.value);
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
        this.declareModuleDefinition_(module, tree.asModuleDefinition());
      }
      module.addExport(name, new ExportSymbol(tree, name));
    },

    /**
     * @param {ModuleSymbol} parent
     * @param {ModuleDefinitionTree} tree
     * @private
     */
    declareModuleDefinition_: function(parent, tree) {
      var name = tree.name.value;
      if (!this.checkForDuplicateModule_(tree, parent, name)) {
        return;
      }
      var module = new ModuleSymbol(name, parent, tree);
      parent.addModule(module);
      this.declareSubModulesAndExports_(module);
    },

    /**
     * @param {ModuleSymbol} parent
     * @param {ModuleDeclarationTree} tree
     * @private
     */
    declareModuleDeclaration_: function(parent, tree) {
      tree.specifiers.forEach(function(specifier) {
        var name = specifier.identifier.value;
        if (!this.checkForDuplicateModule_(tree, parent, name)) {
          return;
        }

        var module = this.getModuleSymbolFromModuleExpression_(
            parent, specifier.expression);
        if (!module)
          return;

        var name = specifier.identifier.value;
        parent.addModuleWithName(module, name);
      }, this);
    },

    /**
     * Returns the module symbol for the RHS in a module specifier. For example
     *
     *   m = n.o
     *
     * as in
     *
     *   module m = n.o
     *
     * will return the module o inside n.
     *
     * @param {ModuleSymbol} parent
     * @param {ModuleExpression} tree
     * @return {ModuleSymbol}
     * @private
     */
    getModuleSymbolFromModuleExpression_: function(parent, tree) {
      if (tree.reference.type == ParseTreeType.MODULE_REQUIRE)
        throw Error('Not implemented');

      var self = this;
      function getNext(parent, identifierToken) {
        var name = identifierToken.value;
        if (!parent.hasModule(name)) {
          // This will get reported in the anylize phase.
          return null;
        }
        return parent.getModule(name);
      }

      parent = getNext(parent, tree.reference.identifierToken);
      if (!parent) {
        // TODO(arv): Walk up lexical scope?
        return null;
      }

      for (var i = 0; i < tree.identifiers.length; i++) {
        parent = getNext(parent, tree.identifiers[i]);
        if (!parent)
          return null;
      }

      return parent;
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
     * @param {ProgramTree=} opt_tree
     * @return {void}
     * @private
     */
    validateAllModules_: function(opt_tree) {
      if (opt_tree) {
        var parent = this.project_.getRootModule();
        this.validateModuleElements_(parent, opt_tree.sourceElements);
      } else {
        this.project_.getSourceTrees().forEach(this.validateAllModules_, this);
      }
    },

    /**
     * @param {ModuleSymbol} parent
     * @param {ParseTree} element
     * @private
     */
    validateModuleElement_: function(parent, tree) {
      switch (tree.type) {
        case MODULE_DECLARATION:
          this.validateModuleDeclaration_(parent, tree);
          break;
        case MODULE_DEFINITION:
          var name = tree.name.value;
          var module = parent.getModule(name);
          this.validateModuleElements_(module, tree.elements);
          break;
        case EXPORT_DECLARATION:
          this.validateModuleElement_(parent, tree.declaration);
          break;
      }
    },

    /**
     * @param {ModuleSymbol} parent
     * @param {Array.<ParseTree>} elements
     * @private
     */
    validateModuleElements_: function(parent, elements) {
      elements.forEach(function(element) {
        this.validateModuleElement_(parent, element);
      }, this);
    },

    /**
     * Validates that the RHS is all modules.
     * @param {ModuleDeclarationTree} tree
     * @param {ModuleSymbol} parent
     * @private
     */
    validateModuleDeclaration_: function(parent, tree) {
      // module m = a.b.c, n = d.e;
      tree.specifiers.forEach(function(specifier) {
        this.validateModuleExpression_(parent, specifier.expression);
      }, this);
    },

    /**
     * Validates that the RHS is all modules references.
     * @param {ModuleSpecifierTree} tree
     * @param {ModuleSymbol} parent
     * @private
     */
    validateModuleExpression_: function(parent, tree) {;
      // require("url").b.c
      if (tree.reference.type == ParseTreeType.MODULE_REQUIRE)
        throw Error('Not implemented');

      // a.b.c

      var self = this;
      function getNext(parent, identifierToken) {
        var name = identifierToken.value;
        if (!parent.hasModule(name)) {
          self.reportError_(tree, '\'%s\' is not a module', name);
          return null;
        }
        return parent.getModule(name);
      }

      function validateNext(identifierToken) {
        var name = identifierToken.value;
        if (!parent.hasModule(name)) {
          self.reportError_(tree, '\'%s\' is not a module', name);
          return false;
        }
        parent = parent.getModule(name);
        return true;
      }

      parent = getNext(parent, tree.reference.identifierToken);
      if (!parent) {
        // TODO(arv): Walk up lexical scope?
        return;
      }

      for (var i = 0; i < tree.identifiers.length; i++) {
        parent = getNext(parent, tree.identifiers[i]);
        if (!parent)
          return;
      }
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
