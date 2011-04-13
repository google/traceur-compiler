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

  var MemberSymbol = traceur.semantics.symbols.MemberSymbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;

  /**
   * A property on a class or trait.
   *
   * @param {ParseTree} tree
   * @param {string} name
   * @param {AggregateSymbol} containingAggregate
   * @param {boolean} isStatic
   * @constructor
   * @extends {MemberSymbol}
   */
  function PropertySymbol(tree, name, containingAggregate, isStatic) {
    MemberSymbol.call(this, SymbolType.PROPERTY, tree, name,
                      containingAggregate, isStatic);
  }

  PropertySymbol.prototype = {
    __proto__: MemberSymbol.prototype
  };

  return {
    PropertySymbol: PropertySymbol
  };
});
