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

  var assert = traceur.assert;

  /**
   * A symbol is a named program element. Currently symbols include classes, traits, fields,
   * methods and properties.
   *
   * Symbols are plain old data structures only. They have methods for querying their contents, but
   * symbols do not implement more sophisticated semantics than simple data access.
   *
   * @param {SymbolType} type
   * @param {ParseTree} tree
   * @param {string} name
   * @constructor
   */
  function Symbol(type, tree, name) {
    this.type = type;
    this.tree = tree;
    this.name = name;
  }

  Symbol.prototype = {

    /**
     * @return {ClassSymbol}
     */
    asClass: function() {
      assert(this instanceof traceur.semantics.symbols.ClassSymbol);
      return this;
    },

    /**
     * @return {ExportSymbol}
     */
    asExport: function() {
      assert(this instanceof traceur.semantics.symbols.ExportSymbol);
      return this;
    },

    /**
     * @return {FieldSymbol}
     */
    asField: function() {
      assert(this instanceof traceur.semantics.symbols.FieldSymbol);
      return this;
    },

    /**
     * @return {MethodSymbol}
     */
    asMethod: function() {
      assert(this instanceof traceur.semantics.symbols.MethodSymbol);
      return this;
    },

    /**
     * @return {MixinMemberSymbol}
     */
    asMixinMember: function() {
      assert(this instanceof traceur.semantics.symbols.MixinMemberSymbol);
      return this;
    },

    /**
     * @return {ModuleSymbol}
     */
    asModuleSymbol: function() {
      assert(this instanceof traceur.semantics.symbols.ModuleSymbol);
      return this;
    },

    /**
     * @return {PropertySymbol}
     */
    asProperty: function() {
      assert(this instanceof traceur.semantics.symbols.PropertySymbol);
      return this;
    },

    /**
     * @return {RequiresSymbol}
     */
    asRequires: function() {
      assert(this instanceof traceur.semantics.symbols.RequiresSymbol);
      return this;
    },

    /**
     * @return {TraitSymbol}
     */
    asTrait: function() {
      assert(this instanceof traceur.semantics.symbols.TraitSymbol);
      return this;
    },

    /**
     * @return {Array.<ParseTree>}
     */
    getRelatedLocations: function() {
      return [this.tree];
    }
  };

  return {
    Symbol: Symbol
  };
});
