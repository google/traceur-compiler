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
   * A symbol representing a class definition.
   *
   * Classes can be user defined or predefined(defined by the compiler/DOM).
   *
   * @param {string} name
   * @param {ClassDeclaration} tree
   * @constructor
   * @extends {AggregateSymbol}
   */
  function ClassSymbol(name, tree) {
    AggregateSymbol.call(this, SymbolType.CLASS, tree, name);
    this.tree = tree;
  }

  ClassSymbol.prototype = {
    __proto__: AggregateSymbol.prototype
  };

  return {
    ClassSymbol: ClassSymbol
  };
});
