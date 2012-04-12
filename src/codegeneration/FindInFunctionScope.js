// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;

  /**
   * This is used to find something in a tree. Extend this class and override
   * the desired visit functions to find what you are looking for. When the tree
   * you are looking for is found set |this.found| to true. This will abort the
   * search of the remaining sub trees.
   *
   * Does not search into nested functions.
   *
   * @param {ParseTree} tree
   * @extends {ParseTreeVisitor}
   * @constructor
   */
  function FindInFunctionScope(tree) {
    try {
      this.visitAny(tree);
    } catch (ex) {
      // This uses an exception to do early exits.
      if (ex !== foundSentinel)
        throw ex;
      this.found_ = true;
    }
  }

  // Object used as a sentinel. This is thrown to abort visiting the rest of the
  // tree.
  var foundSentinel = {};

  FindInFunctionScope.prototype = traceur.createObject(
      ParseTreeVisitor.prototype, {
    found_: false,

    /**
     * Whether the searched for tree was found. Setting this to true aborts the
     * search.
     * @type {boolean}
     */
    get found() {
      return this.found_;
    },
    set found(v) {
      if (v)
        throw foundSentinel;
    },

    // don't visit function children or bodies
    visitFunctionDeclaration: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {},
    visitPropertyMethodAssignment: function(tree) {}
  });

  return {
    FindInFunctionScope: FindInFunctionScope
  };
});
