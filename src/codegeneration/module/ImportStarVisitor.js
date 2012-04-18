// Copyright 2012 Google Inc.
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

traceur.define('codegeneration.module', function() {
  'use strict';

  var ModuleVisitor = traceur.codegeneration.module.ModuleVisitor;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var TokenType = traceur.syntax.TokenType;

  /**
   * Finds all 'import * from moduleExpression' and associates the tree with
   * the module symbol.
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ImportStarVisitor(reporter, project, module) {
    ModuleVisitor.call(this, reporter, project, module);
  }

  ImportStarVisitor.prototype = traceur.createObject(
      ModuleVisitor.prototype, {

    visitImportBinding: function(tree) {
      // If we find an 'import * from m' we associate the tree with the module
      // so that we can have access to it during the transformation phase.
      var importSpecifierSet = tree.importSpecifierSet;
      if (importSpecifierSet.type === ParseTreeType.IMPORT_SPECIFIER_SET &&
          importSpecifierSet.specifiers.type === TokenType.STAR) {

        var module = this.getModuleForModuleExpression(tree.moduleExpression);
        this.project.setModuleForStarTree(importSpecifierSet, module);
      }
    }
  });

  return {
    ImportStarVisitor: ImportStarVisitor
  };
});
