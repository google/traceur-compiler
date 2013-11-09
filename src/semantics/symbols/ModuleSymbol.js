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

import {Symbol} from './Symbol';
import {MODULE} from './SymbolType';
import {assert} from '../../util/assert';

export class ModuleSymbol extends Symbol {
  /**
   * @param {Module} tree
   * @param {string} url
   */
  constructor(tree, url) {
    // assert(tree === null || tree.type === 'module');
    super(MODULE, tree);
    this.exports_ = Object.create(null);
    assert(url);
    this.url = url.replace(/\\/g, '/');
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
   * @param {ExportSymbol} export
   * @return {void}
   */
  addExport(exp) {
    this.exports_[exp.name] = exp;
  }

  /**
   * @return {Array.<ExportSymbol>}
   */
  getExports() {
    var exports = this.exports_;
    return Object.keys(exports).map((key) => exports[key]);
  }
}