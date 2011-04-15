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
  var Symbol = traceur.semantics.symbols.Symbol;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var PredefinedName = traceur.syntax.PredefinedName;
  var SourceFile = traceur.syntax.SourceFile;

  function addAll(self, other) {
    for (key in other) {
      self[key] = other[key];
    };
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
    this.aggregatesByName_ = Object.create(null);
    this.userDefinedAggregates_ = [];
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
      addAll(p.aggregatesByName_, aggregatesByName_);
      // push(...)
      p.userDefinedAggregates_.push.apply(p.userDefinedAggregates_,
                                          userDefinedAggregates_);
      p.objectClass_ = objectClass_;
      return p;
    },

    /**
     * @param {Array.<AggregateSymbol>} syms
     * @return {void}
     */
    addAllPredefinedAggregates: function(syms) {
      syms.forEach(function(symbol) {
        this.addAggregate(symbol);
      }, this);
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
     * @param {AggregateSymbol} symbol
     * @return {void}
     */
    addUserDefinedAggregate: function(symbol) {
      this.addAggregate_(symbol);
      this.userDefinedAggregates_.push(symbol);
    },

    /**
     * @param {AggregateSymbol} symbol
     * @return {void}
     * @private
     */
    addAggregate_: function(symbol) {
      this.aggregatesByName_[symbol.name] = symbol;
    },

    /**
     * @param {string} name
     * @return {boolean}
     */
    hasAggregate: function(name) {
      return name in this.aggregatesByName_;
    },

    /**
     * @param {string} name
     * @return {AggregateSymbol}
     */
    getAggregate: function(name) {
      return this.aggregatesByName_[name];
    },

    /**
     * @return {ClassSymbol}
     */
    getObjectClass: function() {
      if (this.objectClass_ != null) {
        return this.objectClass_;
      }
      return this.objectClass_ =
          this.aggregatesByName_[PredefinedName.OBJECT_NAME];
    },

    /**
     * @return {Array.<AggregateSymbol>}
     */
    getUserDefinedAggregates: function() {
      return this.userDefinedAggregates_;
    },

    /**
     * @return {Array.<ProgramTree>}
     */
    getSourceTrees: function() {
      return this.parseTrees_.values();
    },

    /**
     * @param {SourceFile} file
     * @param {ProgramTree} tree
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
     * @return {ProgramTree}
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
