// Copyright 2012 Traceur Authors.
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

import {Symbol} from './Symbol.js';
import {SymbolType} from './SymbolType.js';

export class ModuleSymbol extends Symbol {
  /**
   * @param {string} name
   * @param {ModuleSymbol} parent
   * @param {ModuleDefinition} tree
   */
  constructor(name, parent, tree, url) {
    super(SymbolType.MODULE, tree, name);
    this.children_ = Object.create(null);
    this.exports_ = Object.create(null);
    this.parent = parent;
    this.tree = tree;
    if (!url) {
      // TODO(arv): Find offensive callers.
      console.error('Missing URL');
    }
    this.url = url;
  }

  /**
   * @param {ModuleSymbol} module
   * @return {void}
   */
  addModule(module) {
    this.addModuleWithName(module, module.name);
  }

  /**
   * @param {ModuleSymbol} module
   * @param {string} name
   * @return {void}
   */
  addModuleWithName(module, name) {
    this.children_[name] = module;
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasModule(name) {
    return name in this.children_;
  }

  /**
   * @param {string} name
   * @return {ModuleSymbol}
   */
  getModule(name) {
    return this.children_[name];
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasExport(name) {
    return name in this.exports_;
  }

  /**
   * @param {string} name
   * @return {ExportSymbol}
   */
  getExport(name) {
    return this.exports_[name];
  }

  /**
   * @param {string} name
   * @param {ExportSymbol} export
   * @return {void}
   */
  addExport(name, exp) {
    this.exports_[name] = exp;
  }

  /**
   * @return {Array.<ExportSymbol>}
   */
  getExports() {
    var exports = this.exports_;
    return Object.keys(exports).map((key) => exports[key]);
  }
}