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

import {assert} from '../util/assert';

export class ModuleSymbol {
  /**
   * @param {Module} tree
   * @param {string} normalizedName
   */
  constructor(tree, normalizedName) {
    this.tree = tree;
    this.exports_ = Object.create(null);
    this.imports_ = Object.create(null);
    assert(normalizedName);
    this.normalizedName = normalizedName.replace(/\\/g, '/');
  }

  /**
   * @param {string} name
   * @param {ParseTree} tree
   */
  addExport(name, tree) {
    // Duplicate exports should have been checked already.
    assert(!this.exports_[name]);
    this.exports_[name] = tree;
  }

  /**
   * @param {string} name
   * @return {ParseTree}
   */
  getExport(name) {
    return this.exports_[name];
  }

  /**
   * @return {Array.<string>}
   */
  getExports() {
    return Object.keys(this.exports_);
  }

  /**
   * @param {string} name
   * @param {ParseTree} tree
   */
  addImport(name, tree) {
    // Duplicate imports should have been checked already.
    assert(!this.imports_[name]);
    this.imports_[name] = tree;
  }

  /**
   * @param {string} name
   * @return {ParseTree}
   */
  getImport(name) {
    return this.imports_[name];
  }
}
