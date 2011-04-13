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

  var AggregateSymbol = traceur.semantics.symbols.AggregateSymbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;

  /**
   * MixinSymbol's are a short lived symbol used during the member declaration phase of
   * semantic analysis.
   *
   * For Example, in the code:
   *   class C {
   *     mixin T { a : x, b : requires }
   *     var z;
   *   }
   *
   * There is a ClassSymbol representing C, a TraitSymbol representing T and a MixinSymbol
   * representing 'mixin T { a : x, b : requires }'.
   *
   * A MixinSymbol maintains the set of members which are mixed in, renamed or
   * required. After the MixinSymbol members are added to the containing class the MixinSymbol
   * is discarded.
   *
   * @param {MixinTree} tree
   * @param {TraitSymbol} trait
   * @constructor
   * @extends {AggregateSymbol}
   */
  function MixinSymbol(tree, trait) {
    AggregateSymbol.call(this, SymbolType.MIXIN, tree, trait.name);
    this.trait = trait;
    this.tree = tree;
  }

  MixinSymbol.prototype = {
    __proto__: AggregateSymbol.prototype
  };

  return {
    MixinSymbol: MixinSymbol
  };
});
