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

traceur.define('syntax.trees', function() {
  'use strict';

  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  /**
   * @param {traceur.util.SourceRange} location
   * @param {Array.<ParseTree>} parameters
   * @constructor
   * @extends {ParseTree}
   */
  function FormalParameterListTree(location, parameters) {
    ParseTree.call(this, ParseTreeType.FORMAL_PARAMETER_LIST, location);
    this.parameters = parameters;
  }

  FormalParameterListTree.prototype = {
    __proto__: ParseTree.prototype,
    
    /** @returns {RestParameterTree} */
    getRestParameter: function() {
      if (this.hasRestParameter()) {
        return this.getLastParameter().asRestParameter();
      } else {
        throw Error("formal parameter list has no rest parameter");
      }
    },
    
    /** @returns {boolean */
    hasRestParameter: function() {
      return this.parameters.length > 0 && this.getLastParameter().isRestParameter();
    },
    
    /** @returns {ParseTree} */
    getLastParameter: function() {
      return this.parameters[this.parameters.length - 1];
    }
  };

  return {
    FormalParameterListTree: FormalParameterListTree
  };
});
