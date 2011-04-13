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
   * A requires member of a class or trait.
   *
   * Similar to an abstract member - a requires member is a member that
   * must be implemented either by a derived class (if the member is a class member) or by the mixing
   * in class (if the member is a trait member).
   *
   * @param {ParseTree} tree
   * @param {string|MemberSymbol} nameOrFrom
   * @param {AggregateSymbol} containingAggregate
   * @constructor
   * @extends {MemberSymbol}
   */
  function RequiresSymbol(tree, nameOrFrom, containingAggregate) {
    var name, from;
    if (typeof nameOrFrom == 'string') {
      name = nameOrFrom;
      from = null;
    } else {
      from = nameOrFrom;
      name = from.name;
    }

    MemberSymbol.call(this, SymbolType.REQUIRES, tree, name,
                      containingAggregate, false);
    this.from_ = from;
  }

  RequiresSymbol.prototype = {
    __proto__: MemberSymbol.prototype
  };

  return {
    RequiresSymbol: RequiresSymbol
  };
});
