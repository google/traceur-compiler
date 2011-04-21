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
   * @param {FieldDeclaration} field
   * @param {VariableDeclaration} tree
   * @param {string} name
   * @param {AggregateSymbol} containingAggregate
   * @constructor
   * @extends {MemberSymbol}
   */
  function FieldSymbol(field, tree, name, containingAggregate) {
    MemberSymbol.call(this, SymbolType.FIELD, tree, name, containingAggregate,
                      field.isStatic);
    this.field = field;
    this.tree = tree;
  }

  FieldSymbol.prototype = {
    __proto__: MemberSymbol.prototype,

    /**
     * @return {boolean}
     */
    isConst: function() {
      return this.field.isConst;
    }
  };

  return {
    FieldSymbol: FieldSymbol
  };
});
