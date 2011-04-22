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

  var Kind = {
    ALL: 'ALL',
    SET: 'SET',
    NONE: 'NONE'
  };

  /**
   * @param {traceur.util.SourceRange} location
   * @param {Array.<traceur.syntax.IdentifierToken>} qualifiedPath
   * @param {Kind|Array.<traceur.syntax.IdentifierToken>} kindOrImportSpecifierSet
   * @constructor
   * @extends {ParseTree}
   */
  function ImportPath(location, qualifiedPath, kindOrImportSpecifierSet) {
    ParseTree.call(this, ParseTreeType.IMPORT_PATH, location);
    this.qualifiedPath = qualifiedPath;

    if (kindOrImportSpecifierSet instanceof Array) {
      this.kind = Kind.SET;
      this.importSpecifierSet = kindOrImportSpecifierSet;
    } else {
      this.kind = kindOrImportSpecifierSet;
      this.importSpecifierSet = null;
    }
    Object.freeze(this);
  }

  ImportPath.Kind = Kind;
  ImportPath.prototype = {
    __proto__: ParseTree.prototype
  };

  return {
    ImportPath: ImportPath
  };
});
