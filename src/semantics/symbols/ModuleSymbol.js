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

traceur.define('semantics.symbols', function() {
  'use strict';

  var Symbol = traceur.semantics.symbols.Symbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;

  /**
   * @param {string} name
   * @param {ModuleSymbol} parent
   * @param {ModuleDefinition} tree
   * @constructor
   * @extends {Symbol}
   */
  function ModuleSymbol(name, parent, tree) {
    Symbol.call(this, SymbolType.MODULE, tree, name);
    this.children_ = Object.create(null);
    this.exports_ = Object.create(null);
    this.parent = parent;
    this.tree = tree;
  }

  ModuleSymbol.prototype = {
    __proto__: Symbol.prototype,

    /**
     * @param {ModuleSymbol} module
     * @return {void}
     */
    addModule: function(module) {
      this.addModuleWithName(module, module.name);
    },

    /**
     * @param {ModuleSymbol} module
     * @param {string} name
     * @return {void}
     */
    addModuleWithName: function(module, name) {
      this.children_[name] = module;
    },

    /**
     * @param {string} name
     * @return {boolean}
     */
    hasModule: function(name) {
      return name in this.children_;
    },

    /**
     * @param {string} name
     * @return {ModuleSymbol}
     */
    getModule: function(name) {
      return this.children_[name];
    },

    /**
     * @param {string} name
     * @return {boolean}
     */
    hasExport: function(name) {
      return name in this.exports_;
    },

    /**
     * @param {string} name
     * @return {ExportSymbol}
     */
    getExport: function(name) {
      return this.exports_[name];
    },

    /**
     * @param {string} name
     * @param {ExportSymbol} export
     * @return {void}
     */
    addExport: function(name, exp) {
      this.exports_[name] = exp;
    },

    /**
     * @return {Array.<ExportSymbol>}
     */
    getExports: function() {
      var exports = this.exports_;
      return Object.keys(exports).map(function(key) {
        return exports[key];
      });
    }
  };

  return {
    ModuleSymbol: ModuleSymbol
  };
});
