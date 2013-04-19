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

import {ArrayMap} from '../../util/ArrayMap.js';
import {ExportSymbol} from './ExportSymbol.js';
import {ModuleSymbol} from './ModuleSymbol.js';
import {ObjectMap} from '../../util/ObjectMap.js';
import {RuntimeInliner} from '../../codegeneration/RuntimeInliner.js';
import {UniqueIdentifierGenerator} from
    '../../codegeneration/UniqueIdentifierGenerator.js';
import {resolveUrl} from '../../util/url.js';

function addAll(self, other) {
  for (var key in other) {
    self[key] = other[key];
  }
}

function values(map) {
  return Object.keys(map).map((key) => map[key]);
}

var standardModuleUrlRegExp = /^@\w+$/;
var standardModuleCache = Object.create(null);

/**
 * Gets a ModuleSymbol for a standard module. We cache the Symbol so that
 * future accesses to this returns the same symbol.
 * @param  {string} url
 * @return {ModuleSymbol}
 */
function getStandardModule(url) {
  if (!(url in standardModuleCache)) {
    var symbol = new ModuleSymbol(null, null, null, url);
    var moduleInstance = $traceurRuntime.modules[url];
    Object.keys(moduleInstance).forEach((name) => {
      symbol.addExport(name, new ExportSymbol(null, name, null));
    });
    standardModuleCache[url] = symbol;
  }
  return standardModuleCache[url];
}

/**
 * The root data structure for all semantic and syntactic information for a
 * single compilation.
 */
export class Project {
  /**
   * @param {string} url The base URL of the project. This is used for resolving
   *    URLs for external modules.
   */
  constructor(url) {
    this.identifierGenerator = new UniqueIdentifierGenerator();
    this.runtimeInliner = new RuntimeInliner(this.identifierGenerator);

    this.sourceFiles_ = Object.create(null);
    this.parseTrees_ = new ObjectMap();
    this.rootModule_ = new ModuleSymbol(null, null, null, url);
    this.modulesByUrl_ = Object.create(null);
    this.moduleExports_ = new ArrayMap();
  }

  get url() {
    return this.rootModule_.url;
  }

  /**
   * @return {Project}
   */
  createClone() {
    var p = new Project(this.url);
    addAll(p.sourceFiles_, this.sourceFiles_);
    p.parseTrees_.addAll(this.parseTrees_);
    // push(...)
    p.objectClass_ = this.objectClass_;
    return p;
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasFile(name) {
    return name in this.sourceFiles_;
  }

  /**
   * @param {SourceFile} file
   * @return {void}
   */
  addFile(file) {
    this.sourceFiles_[file.name] = file;
  }

  /**
   * @param {string} name
   * @return {SourceFile}
   */
  getFile(name) {
    return this.sourceFiles_[name];
  }

  /**
   * @return {Array.<SourceFile>}
   */
  getSourceFiles() {
    return values(this.sourceFiles_);
  }

  /**
   * @return {Array.<Program>}
   */
  getParseTrees() {
    return this.parseTrees_.values();
  }

  /**
   * @param {SourceFile} file
   * @param {Program} tree
   * @return {void}
   */
  setParseTree(file, tree) {
    if (this.sourceFiles_[file.name] != file) {
      throw new Error();
    }
    this.parseTrees_.set(file, tree);
  }

  /**
   * @param {SourceFile} file
   * @return {Program}
   */
  getParseTree(file) {
    return this.parseTrees_.get(file);
  }

  /**
   * @return {ModuleSymbol}
   */
  getRootModule() {
    return this.rootModule_;
  }

  addExternalModule(module) {
    traceur.assert(!this.hasModuleForUrl(module.url));
    this.modulesByUrl_[module.url] = module;
  }

  getModuleForUrl(url) {
    url = resolveUrl(this.url, url);
    traceur.assert(this.hasModuleForUrl(url));
    if (standardModuleUrlRegExp.test(url))
      return getStandardModule(url);

    return this.modulesByUrl_[url];
  }

  hasModuleForUrl(url) {
    if (standardModuleUrlRegExp.test(url))
      return url in $traceurRuntime.modules;

    url = resolveUrl(this.url, url);
    return url in this.modulesByUrl_;
  }

  setModuleForStarTree(tree, symbol) {
    this.moduleExports_.set(tree, symbol);
  }

  getModuleForStarTree(tree) {
    return this.moduleExports_.get(tree);
  }
}
