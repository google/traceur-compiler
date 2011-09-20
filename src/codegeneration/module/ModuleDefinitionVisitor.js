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

traceur.define('codegeneration.module', function() {
  'use strict';

  var ModuleVisitor = traceur.codegeneration.module.ModuleVisitor;

  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;

  /**
   * Visits a parse tree and adds all the module definitions.
   *
   *   module m { ... }
   *
   * @param {traceur.util.ErrorReporter} reporter
   * @param {ProjectSymbol} project
   * @param {ModuleSymbol} module The root of the module system.
   * @constructor
   * @extends {ModuleVisitor}
   */
  function ModuleDefinitionVisitor(reporter, project, module) {
    ModuleVisitor.call(this, reporter, project, module);
  }

  ModuleDefinitionVisitor.prototype = traceur.createObject(
      ModuleVisitor.prototype, {

    visitModuleDefinition: function(tree) {
      var name = tree.name.value;
      if (this.checkForDuplicateModule_(name, tree)) {
        var parent = this.currentModule;
        var module = new ModuleSymbol(name, parent, tree, parent.url);
        parent.addModule(module);
      }

      ModuleVisitor.prototype.visitModuleDefinition.call(this, tree);
    }
  });

  return {
    ModuleDefinitionVisitor: ModuleDefinitionVisitor
  };
});
