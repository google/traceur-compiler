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

traceur.define('codegeneration.module', function() {
  'use strict';

  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var Symbol = traceur.semantics.symbols.Symbol;
  var evaluateStringLiteral = traceur.util.evaluateStringLiteral;
  var resolveUrl = traceur.util.resolveUrl;

  function getFriendlyName(module) {
    return module.name || module.url;
  }

  /**
   * A specialized parse tree visitor for use with modules.
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ParseTreeVisitor}
   */
  function ModuleVisitor(reporter, project, module) {
    ParseTreeVisitor.call(this);
    this.reporter_ = reporter;
    this.project = project;
    this.currentModule_ = module;
  }

  ModuleVisitor.prototype = traceur.createObject(ParseTreeVisitor.prototype, {

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
      // "url".b.c
      if (tree.reference.type == ParseTreeType.MODULE_REQUIRE) {
        var url = evaluateStringLiteral(tree.reference.url);
        url = resolveUrl(this.currentModule.url, url);
        return this.project.getModuleForUrl(url);
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
            self.reportError_(tree, '\'%s\' is not exported by %s', name,
                getFriendlyName(parent));
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
        case ParseTreeType.MODULE_DECLARATION:
        case ParseTreeType.MODULE_DEFINITION:
        case ParseTreeType.EXPORT_DECLARATION:
        case ParseTreeType.IMPORT_DECLARATION:
          this.visitAny(element);
      }
    },

    visitProgram: function(tree) {
      tree.programElements.forEach(this.visitModuleElement_, this);
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
        tree = symbolOrTree.tree;
      } else {
        tree = symbolOrTree;
      }

      var args = Array.prototype.slice.call(arguments);
      args[0] = tree.location.start;

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
        var tree = symbolOrTree.tree;
        if (tree) {
          this.reportRelatedError_(tree);
        } else {
          this.reporter_.reportError(null,
              'Module related to previous error: ' + symbolOrTree.url);
        }
      }
    }
  });

  return {
    ModuleVisitor: ModuleVisitor
  };
});
