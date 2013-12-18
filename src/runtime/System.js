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
import {UniqueIdentifierGenerator} from
    '../codegeneration/UniqueIdentifierGenerator';

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

var identifierGenerator = new UniqueIdentifierGenerator();

 // TODO Pick a better name, these are functions on System?
export class LoaderHooks {
  constructor(reporter, rootUrl, outputOptions) {
    this.reporter = reporter;
    this.project_ = new Project(rootUrl, identifierGenerator);
    this.analyzer_ = new ModuleAnalyzer(reporter, this.project_, this);
    this.outputOptions_ = outputOptions;
  }

  // TODO Used for eval(): can we get the function call to supply callerURL?
  rootUrl() {
    return this.project_.url;
  }

  parse(codeUnit) {
    var reporter = this.reporter;
    var project = this.project_;
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
    return ProgramTransformer.transformFile(this.reporter, this.project_,
                                            codeUnit.file);
  }

  instantiate({name, metadata, address, source, sourceMap}) {
    return undefined;
  }

  evaluate(codeUnit) {
    // TODO(arv): Eval in the right context.
    return ('global', eval)(codeUnit.transcoded);
  }

  addExternalModule(codeUnit) {
    var project = this.project_;
    var tree = codeUnit.tree;
    var url = codeUnit.url || this.project_.url; // eval needs this.
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

  // TODO(jjb): this function belongs in module-loader
  transformDependencies(dependencies) {
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];
      if (codeUnit.state >= TRANSFORMED) {
        continue;
      }
      this.transformCodeUnit(codeUnit);
      this.instantiate(codeUnit);
    }
    this.checkForErrors(dependencies, 'transform');
  }

  transformCodeUnit(codeUnit) {
    this.transformDependencies(codeUnit.dependencies); // depth first
    codeUnit.transformedTree = codeUnit.transform();
    codeUnit.state = TRANSFORMED;
    codeUnit.transcoded =  TreeWriter.write(codeUnit.transformedTree,
        this.outputOptions_);
    if (codeUnit.url)
      codeUnit.transcoded += '//# sourceURL=' + codeUnit.url;
    // TODO(jjb): return sourcemaps not sideeffect
    codeUnit.sourceMap = this.outputOptions_ && this.outputOptions_.sourceMap;
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

  getModuleForModuleSpecifier(name, referrer) {
    var url = System.normalResolve(name, referrer);
    return this.project_.getModuleForResolvedUrl(url);
  }
}
