// Copyright 2013 Traceur Authors.
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

import {ModuleAnalyzer} from '../semantics/ModuleAnalyzer';
import {ModuleSymbol} from '../semantics/symbols/ModuleSymbol';
import {Parser} from '../syntax/Parser';
import {ProgramTransformer} from '../codegeneration/ProgramTransformer';
import {Project} from '../semantics/symbols/Project';
import {SourceFile} from '../syntax/SourceFile';
import {TreeWriter} from '../outputgeneration/TreeWriter';

import {assert} from '../util/assert';

// TODO These CodeUnit (aka Load) states are used by code in this file
// that belongs in module-loader.
var NOT_STARTED = 0;
var LOADING = 1;
var LOADED = 2;
var PARSED = 3;
var TRANSFORMED = 4;
var COMPLETE = 5;
var ERROR = 6;


 // TODO Pick a better name, these are functions on System?
export class LoaderHooks {
  constructor(reporter, rootURL, identifierIndex) {
    this.reporter = reporter;
    this.project = new Project(rootURL);
    this.project.identifierGenerator.identifierIndex = identifierIndex || 0;
    this.analyzer_ = new ModuleAnalyzer(reporter, this.project);
  }

  parse(codeUnit) {
    var reporter = this.reporter;
    var project = this.project;
    var url = codeUnit.url;
    var program = codeUnit.text;
    var file = new SourceFile(url, program);
    project.addFile(file);
    codeUnit.file = file;  // TODO avoid this

    var parser = new Parser(reporter, file);
    if (codeUnit.type == 'module')
      codeUnit.tree = parser.parseModule();
    else
      codeUnit.tree = parser.parseScript();

    if (reporter.hadError()) {
      return false;
    }

    project.setParseTree(file, codeUnit.tree);
    return true;
  }

  transform(codeUnit) {
    return ProgramTransformer.transformFile(this.reporter, this.project,
                                            codeUnit.file);
  }

  evaluate(codeUnit) {
    // TODO(arv): Eval in the right context.
    return ('global', eval)(TreeWriter.write(codeUnit.transformedTree));
  }

  addExternalModule(codeUnit) {
    var project = this.project;
    var tree = codeUnit.tree;
    var url = codeUnit.url;
    // External modules have no parent module.
    codeUnit.moduleSymbol = new ModuleSymbol(tree, url);
    project.addExternalModule(codeUnit.moduleSymbol);
  }

  analyzeDependencies(dependencies) {
    var trees = [];
    var modules = [];
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];

      // We should not have gotten here if not all are PARSED or larget.
      assert(codeUnit.state >= PARSED);

      if (codeUnit.state == PARSED) {
        trees.push(codeUnit.tree);
        modules.push(codeUnit.moduleSymbol);
      }
    }

    this.analyzer_.analyzeTrees(trees, modules);
    this.checkForErrors(dependencies, 'analyze');
  }

  transformDependencies(dependencies) {
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];
      if (codeUnit.state >= TRANSFORMED) {
        continue;
      }

      codeUnit.transformedTree = this.transformCodeUnit(codeUnit);
      codeUnit.state = TRANSFORMED;
    }
    this.checkForErrors(dependencies, 'transform');
  }

  transformCodeUnit(codeUnit) {
    this.transformDependencies(codeUnit.dependencies); // depth first

    return codeUnit.transform();
  }

  checkForErrors(dependencies, phase) {
    if (this.reporter.hadError()) {
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        codeUnit.state = ERROR;
      }

      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state == ERROR) {
          codeUnit.dispatchError(phase);
        }
      }
    }
  }

}