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

  var ObjectMap = traceur.util.ObjectMap;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;

  function addAll(self, other) {
    for (key in other) {
      self[key] = other[key];
    }
  }

  function values(map) {
    return Object.keys(map).map(function(key) {
      return map[key];
    });
  }

  /**
   * The root data structure for all semantic and syntactic information for a
   * single compilation.
   *
   * @constructor
   */
  function Project() {
    this.sourceFiles_ = Object.create(null);
    this.parseTrees_ = new ObjectMap();
    this.rootModule_ = new ModuleSymbol(null, null, null);
  }

  Project.prototype = {
    /**
     * @return {Project}
     */
    createClone: function() {
      var p = new Project();
      addAll(p.sourceFiles_, this.sourceFiles_);
      p.parseTrees_.addAll(this.parseTrees_);
      // push(...)
      p.objectClass_ = objectClass_;
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
    }
  };

  return {
    Project: Project
  };
});
