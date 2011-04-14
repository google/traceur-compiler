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
   * Members of an aggregate(class, trait or mixin).
   *
   * @param {SymbolType} type
   * @param {ParseTree} tree
   * @param {string} name
   * @param {AggregateSymbol} containingAggregate
   * @param {boolean} isStatic
   * @constructor
   * @extends {Symbol}
   */
  function MemberSymbol(type, tree, name, containingAggregate, isStatic) {
    Symbol.call(this, type, tree, name);
    this.containingAggregate = containingAggregate;
    this.isStatic = isStatic;
    containingAggregate.addMember(this);
  }

  MemberSymbol.prototype = {
    __proto__: Symbol.prototype,

    /**
     * For most members the implementation is just the member itself. For members which are added
     * by mixing in a trait, the implementation is the trait member which implements the class member.
     *
     * @return {MemberSymbol}
     */
    getImplementation: function() {
      return this;
    },

    /**
     * Is this a requires member, or a mixin of a requires member.
     *
     * @return {boolean}
     */
    isRequires: function() {
      return this.getImplementation().type == SymbolType.REQUIRES;
    },

    /**
     * Return a name suitable for error reporting purposes.
     *
     * @return {string}
     */
    getQualifiedName: function() {
      return this.containingAggregate.name + '.' + name;
    }
  };

  return {
    MemberSymbol: MemberSymbol
  };
});
