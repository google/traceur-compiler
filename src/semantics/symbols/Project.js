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

  var ExportSymbol = traceur.semantics.symbols.ExportSymbol;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var ObjectMap = traceur.util.ObjectMap;
  var ArrayMap = traceur.util.ArrayMap;

  var resolveUrl = traceur.util.resolveUrl;

  function addAll(self, other) {
    for (var key in other) {
      self[key] = other[key];
    }
  }

  function values(map) {
    return Object.keys(map).map(function(key) {
      return map[key];
    });
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
      var moduleInstance = traceur.runtime.modules[url];
      Object.keys(moduleInstance).forEach(function(name) {
        symbol.addExport(name, new ExportSymbol(null, name, null));
      });
      standardModuleCache[url] = symbol;
    }
    return standardModuleCache[url];
  }

  /**
   * The root data structure for all semantic and syntactic information for a
   * single compilation.
   * @param {string} url The base URL of the project. This is used for resolving
   *    URLs for external modules.
   * @constructor
   */
  function Project(url) {
    this.sourceFiles_ = Object.create(null);
    this.parseTrees_ = new ObjectMap();
    this.rootModule_ = new ModuleSymbol(null, null, null, url);
    this.modulesByUrl_ = Object.create(null);
    this.moduleExports_ = new ArrayMap();
  }

  Project.prototype = {
    get url() {
      return this.rootModule_.url;
    },

    /**
     * @return {Project}
     */
    createClone: function() {
      var p = new Project(this.url);
      addAll(p.sourceFiles_, this.sourceFiles_);
      p.parseTrees_.addAll(this.parseTrees_);
      // push(...)
      p.objectClass_ = this.objectClass_;
      return p;
    },

    /**
     * @param {string} name
     * @return {boolean}
     */
    hasFile: function(name) {
      return name in this.sourceFiles_;
    },

    /**
     * @param {SourceFile} file
     * @return {void}
     */
    addFile: function(file) {
      this.sourceFiles_[file.name] = file;
    },

    /**
     * @param {string} name
     * @return {SourceFile}
     */
    getFile: function(name) {
      return this.sourceFiles_[name];
    },

    /**
     * @return {Array.<SourceFile>}
     */
    getSourceFiles: function() {
      return values(this.sourceFiles_);
    },

    /**
     * @return {Array.<Program>}
     */
    getSourceTrees: function() {
      return this.parseTrees_.values();
    },

    /**
     * @param {SourceFile} file
     * @param {Program} tree
     * @return {void}
     */
    setParseTree: function(file, tree) {
      if (this.sourceFiles_[file.name] != file) {
        throw new Error();
      }
      this.parseTrees_.put(file, tree);
    },

    /**
     * @param {SourceFile} file
     * @return {Program}
     */
    getParseTree: function(file) {
      return this.parseTrees_.get(file);
    },

    /**
     * @return {ModuleSymbol}
     */
    getRootModule: function() {
      return this.rootModule_;
    },

    addExternalModule: function(module) {
      traceur.assert(!this.hasModuleForUrl(module.url));
      this.modulesByUrl_[module.url] = module;
    },

    getModuleForUrl: function(url) {
      url = resolveUrl(this.url, url);
      traceur.assert(this.hasModuleForUrl(url));
      if (standardModuleUrlRegExp.test(url))
        return getStandardModule(url);

      return this.modulesByUrl_[url];
    },

    hasModuleForUrl: function(url) {
      if (standardModuleUrlRegExp.test(url))
        return url in traceur.runtime.modules;

      url = resolveUrl(this.url, url);
      return url in this.modulesByUrl_;
    },

    setModuleForStarTree: function(tree, symbol) {
      this.moduleExports_.put(tree, symbol);
    },

    getModuleForStarTree: function(tree) {
      return this.moduleExports_.get(tree);
    }
  };

  return {
    Project: Project
  };
});
