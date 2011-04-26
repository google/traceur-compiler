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

  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var Project = traceur.semantics.symbols.Project;

  var SymbolType = traceur.semantics.symbols.SymbolType;
  var Symbol = traceur.semantics.symbols.Symbol;
  var ExportSymbol = traceur.semantics.symbols.ExportSymbol;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var MODULE_DECLARATION = traceur.syntax.trees.ParseTreeType.MODULE_DECLARATION;
  var MODULE_DEFINITION = traceur.syntax.trees.ParseTreeType.MODULE_DEFINITION;
  var EXPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.EXPORT_DECLARATION;
  var EXPORT_PATH_LIST = traceur.syntax.trees.ParseTreeType.EXPORT_PATH_LIST;
  var VARIABLE_STATEMENT = ParseTreeType.VARIABLE_STATEMENT;
  var FUNCTION_DECLARATION = ParseTreeType.FUNCTION_DECLARATION;
  var CLASS_DECLARATION = ParseTreeType.CLASS_DECLARATION;
  var TRAIT_DECLARATION = ParseTreeType.TRAIT_DECLARATION;
  var IDENTIFIER = TokenType.IDENTIFIER;
  var STRING = TokenType.STRING;
  var NUMBER = TokenType.NUMBER;
  var IDENTIFIER_EXPRESSION = ParseTreeType.IDENTIFIER_EXPRESSION;

  /**
   * A specialized parse tree visitor for use with modules.
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ParseTreeVisitor}
   */
  function ModuleVisitor(reporter, module) {
    ParseTreeVisitor.call(this);
    this.reporter_ = reporter;
    this.currentModule_ = module;
  }

  ModuleVisitor.prototype = {
    __proto__: ParseTreeVisitor.prototype,

    get currentModule() {
      return this.currentModule_;
    },

    /**
     * Finds a module by name. This walks the lexical scope chain of the
     * {@code currentModule} and returns first matching module or null if none
     * is found.
     * @param {string} name
     * @return {ModuleSymbol}
     */
    getModuleByName: function(name) {
      var module = this.currentModule;
      while (module) {
        if (module.hasModule(name)) {
          return module.getModule(name);
        }
        module = module.parent;
      }
      return null;
    },

    /**
     * @param {ModuleExpression} tree
     * @param {boolean=} reportErorrors If false no errors are reported.
     * @return {ModuleSymbol}
     */
    getModuleForModuleExpression: function(tree, reportErrors) {
      // require("url").b.c
      if (tree.reference.type == ParseTreeType.MODULE_REQUIRE) {
        throw Error('Not implemented');
      }

      // a.b.c

      var self = this;
      function getNext(parent, identifierToken) {
        var name = identifierToken.value;

        if (!parent.hasModule(name)) {
          if (reportErrors) {
            self.reportError_(tree, '\'%s\' is not a module', name);
          }
          return null;
        }

        if (!parent.hasExport(name)) {
          if (reportErrors) {
            self.reportError_(tree, '\'%s\' is not exported', name);
          }
          return null;
        }

        return parent.getModule(name);
      }

      var name = tree.reference.identifierToken.value;
      var parent = this.getModuleByName(name);
      if (!parent) {
        if (reportErrors) {
          this.reportError_(tree, '\'%s\' is not a module', name);
        }
        return null;
      }

      for (var i = 0; i < tree.identifiers.length; i++) {
        parent = getNext(parent, tree.identifiers[i]);
        if (!parent) {
          return null;
        }
      }

      return parent;
    },

    // Limit the trees to visit.
    visitFunctionDeclaration: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {},

    visitModuleElement_: function(element) {
      switch (element.type) {
        case MODULE_DECLARATION:
        case MODULE_DEFINITION:
        case EXPORT_DECLARATION:
          this.visitAny(element);
      }
    },

    visitProgram: function(tree) {
      tree.sourceElements.forEach(this.visitModuleElement_, this);
    },

    visitModuleDefinition: function(tree) {
      var current = this.currentModule_;
      var name = tree.name.value;
      var module = current.getModule(name);
      traceur.assert(module);
      this.currentModule_ = module;
      tree.elements.forEach(this.visitModuleElement_, this);
      this.currentModule_ = current;
    },

    checkForDuplicateModule_: function(name, tree) {
      var parent = this.currentModule;
      if (parent.hasModule(name)) {
        this.reportError_(tree, 'Duplicate module declaration \'%s\'', name);
        this.reportRelatedError_(parent.getModule(name).tree);
        return false;
      }
      return true;
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
      if (symbolOrTree instanceof Symbol) {
        tree = symbol.tree;
      } else {
        tree = symbolOrTree;
      }

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
  }

  /**
   * Visits a parse tree and adds all the module definitions.
   *
   *   module m { ... }
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ModuleDefinitionVisitor(reporter, module) {
    ModuleVisitor.call(this, reporter, module);
  }

  ModuleDefinitionVisitor.prototype = {
    __proto__: ModuleVisitor.prototype,

    visitModuleDefinition: function(tree) {
      var name = tree.name.value;
      if (this.checkForDuplicateModule_(name, tree)) {
        var parent = this.currentModule;
        var module = new ModuleSymbol(name, parent, tree);
        parent.addModule(module);
      }

      ModuleVisitor.prototype.visitModuleDefinition.call(this, tree);
    }
  };

  /**
   * Visits a parse tree and adds all the module definitions.
   *
   *   module m { ... }
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ExportVisitor(reporter, module) {
    ModuleVisitor.call(this, reporter, module);
    this.inExport_ = false;
    this.relatedTree_ = null;
  }

  ExportVisitor.prototype = {
    __proto__: ModuleVisitor.prototype,

    addExport_: function(name, tree) {
      if (!this.inExport_) {
        return;
      }

      traceur.assert(typeof name == 'string');

      var parent = this.currentModule;
      if (parent.hasExport(name)) {
        this.reportError_(tree, 'Duplicate export declaration \'%s\'', name);
        this.reportRelatedError_(parent.getExport(name));
        return;
      }
      parent.addExport(name, new ExportSymbol(tree, name, this.relatedTree_));
    },

    visitClassDeclaration: function(tree) {
      this.addExport_(tree.name.value, tree);
    },

    visitExportDeclaration: function(tree) {
      this.inExport_ = true;
      this.visitAny(tree.declaration);
      this.inExport_ = false;
    },

    visitExportPath: function(tree) {
      this.relatedTree_ = tree.moduleExpression;
      this.visitAny(tree.specifier);
      this.relatedTree_ = null;
    },

    visitExportPathList: function(tree) {
      for (var i = 0; i < tree.paths.length; i++) {
        var path = tree.paths[i];
        if (path.type == ParseTreeType.IDENTIFIER_EXPRESSION) {
          this.addExport_(path.identifierToken.value, path);
        } else {
          this.visitAny(path);
        }
      }
    },

    visitExportPathSpecifier: function(tree) {
      this.addExport_(tree.identifier.value, tree.specifier);
    },

    visitExportSpecifier: function(tree) {
      this.addExport_(tree.lhs.value, tree);
    },

    visitFunctionDeclaration: function(tree) {
      if (tree.name) {
        this.addExport_(tree.name.value, tree);
      }
    },

    visitIdentifierExpression: function(tree) {
      this.addExport_(tree.identifierToken.value, tree);
    },

    // TODO(arv): visitImport

    visitModuleDefinition: function(tree) {
      this.addExport_(tree.name.value, tree);
      var inExport = this.inExport_;
      this.inExport_ = false;
      ModuleVisitor.prototype.visitModuleDefinition.call(this, tree);
      this.inExport_ = inExport;
    },

    visitModuleSpecifier: function(tree) {
      this.addExport_(tree.identifier.value, tree);
    },

    visitTraitDeclaration: function(tree) {
      this.addExport_(tree.name.value, tree);
    },

    visitVariableDeclaration: function(tree) {
      this.addExport_(tree.lvalue.identifierToken.value, tree);
    }
  };

  /**
   * Visits a parse tree and adds all the module declarations.
   *
   *   module m = n, o = p.q.r
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ModuleDeclarationVisitor(reporter, module) {
    ModuleVisitor.call(this, reporter, module);
  }

  ModuleDeclarationVisitor.prototype = {
    __proto__: ModuleVisitor.prototype,

    visitModuleSpecifier: function(tree) {
      var name = tree.identifier.value;
      var parent = this.currentModule;
      var module = this.getModuleForModuleExpression(tree.expression);
      if (!module) {
        return;
      }
      parent.addModuleWithName(module, name);
    }
  };

  /**
   * Visits a parse tree and validates all module expressions.
   *
   *   module m = n, o = p.q.r
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ValidationVisitor(reporter, module) {
    ModuleVisitor.call(this, reporter, module);
  }

  ValidationVisitor.prototype = {
    __proto__: ModuleVisitor.prototype,

    checkExport_: function(tree, name) {
      if (this.validatingModule_ && !this.validatingModule_.hasExport(name)) {
        this.reportError_(tree, '\'%s\' is not exported', name);
        this.reportRelatedError_(this.validatingModule_);
      }
    },

    /**
     * @param {ModuleSymbol} module
     * @param {ParseTree} tree
     * @param {string=} name
     */
    visitAndValidate_: function(module, tree, name) {
      var validatingModule = this.validatingModule_;
      this.validatingModule_ = module;
      if (name) {
        this.checkExport_(tree, name);
      } else {
        this.visitAny(tree);
      }
      this.validatingModule_ = validatingModule;
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPath: function(tree) {
      this.visitAny(tree.moduleExpression);
      var module = this.getModuleForModuleExpression(tree.moduleExpression);
      this.visitAndValidate_(module, tree.specifier);
    },

    visitExportSpecifier: function(tree) {
      var token = tree.rhs || tree.lhs;
      this.checkExport_(tree, token.value);
    },

    visitIdentifierExpression: function(tree) {
      this.checkExport_(tree, tree.identifierToken.value);
    },

    visitModuleExpression: function(tree) {
      this.getModuleForModuleExpression(tree, true /* reportErrors */);
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      this.visitAny(tree.moduleExpression);
      var module = this.getModuleForModuleExpression(tree.moduleExpression);
      this.visitAndValidate_(module, tree, tree.identifier.value);
    }
  };

  // TODO(arv): import
  // TODO(arv): Validate that there are no free variables
  // TODO(arv): Validate that the exported reference exists

  /**
   * Builds up all module symbols and validates them.
   *
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @constructor
   */
  function ModuleAnalyzer(reporter, project) {
    this.reporter_ = reporter;
    this.project_ = project;
  }

  ModuleAnalyzer.prototype = {
    /**
     * @return {void}
     */
    analyze: function() {
      var root = this.project_.getRootModule();
      var visitor = new ModuleDefinitionVisitor(this.reporter_, root);
      this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);

      if (!this.reporter_.hadError()) {
        visitor = new ExportVisitor(this.reporter_, root);
        this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);
      }

      if (!this.reporter_.hadError()) {
        visitor = new ModuleDeclarationVisitor(this.reporter_, root);
        this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);
      }

      if (!this.reporter_.hadError()) {
        visitor = new ValidationVisitor(this.reporter_, root);
        this.project_.getSourceTrees().forEach(visitor.visitAny, visitor);
      }
    },

    /**
     * @param {SourceFile} sourceFile
     * @return {void}
     */
    analyzeFile: function(sourceFile) {
      // TODO(arv): Remove or keep?
      console.error('Fix me');
    }
  };

  return {
    ModuleAnalyzer: ModuleAnalyzer
  };
});
