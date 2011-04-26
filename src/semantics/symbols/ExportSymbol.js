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
   * @param {ParseTree} tree
   * @param {string} name
   * @param {ParseTree=} relatedTree
   * @constructor
   * @extends {Symbol}
   */
  function ExportSymbol(tree, name, relatedTree) {
    Symbol.call(this, SymbolType.EXPORT, tree, name);
    this.relatedTree = relatedTree;
  }

  ExportSymbol.prototype = {
    __proto__: Symbol.prototype
  };

  return {
    ExportSymbol: ExportSymbol
  };
});
