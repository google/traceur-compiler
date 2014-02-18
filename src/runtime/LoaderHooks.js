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

import {
  AttachModuleNameTransformer
} from '../codegeneration/module/AttachModuleNameTransformer';
import {FromOptionsTransformer} from '../codegeneration/FromOptionsTransformer';
import {ExportListBuilder} from '../codegeneration/module/ExportListBuilder';
import {ModuleSpecifierVisitor} from
    '../codegeneration/module/ModuleSpecifierVisitor';
import {ModuleSymbol} from '../codegeneration/module/ModuleSymbol';
import {Parser} from '../syntax/Parser';
import {options} from '../options';
import {SourceFile} from '../syntax/SourceFile';
import {systemjs} from '../runtime/system-map';
import {UniqueIdentifierGenerator} from
    '../codegeneration/UniqueIdentifierGenerator';
import {isAbsolute, resolveUrl} from '../util/url';
import {webLoader} from './webLoader';

import {assert} from '../util/assert';

// TODO These CodeUnit (aka Load) states are used by code in this file
// that belongs in Loader.
var NOT_STARTED = 0;
var LOADING = 1;
var LOADED = 2;
var PARSED = 3;
var TRANSFORMING = 4
var TRANSFORMED = 5;
var COMPLETE = 6;
var ERROR = 7;

var identifierGenerator = new UniqueIdentifierGenerator();

export class LoaderHooks {
  constructor(reporter, rootUrl,
      fileLoader = webLoader,
      moduleStore = $traceurRuntime.ModuleStore) {
    this.reporter = reporter;
    this.rootUrl_ = rootUrl;
    this.moduleStore_ = moduleStore;
    this.fileLoader = fileLoader;
    this.exportListBuilder_ = new ExportListBuilder(this.reporter);
  }

  get(normalizedName) {
    return this.moduleStore_.get(normalizedName);
  }

  set(normalizedName, module) {
    this.moduleStore_.set(normalizedName, module);
  }

  normalize(name, referrerName, referrerAddress) {
    var normalizedName =
        this.moduleStore_.normalize(name, referrerName, referrerAddress);
    if (System.map)
      return systemjs.applyMap(System.map, normalizedName, referrerName);
    else
      return normalizedName;
  }

  // TODO Used for eval(): can we get the function call to supply callerURL?
  rootUrl() {
    return this.rootUrl_;
  }

  getModuleSpecifiers(codeUnit) {
    // Parse
    if (!this.parse(codeUnit))
      return;

    codeUnit.state = PARSED;

    // Analyze to find dependencies
    var moduleSpecifierVisitor = new ModuleSpecifierVisitor(this.reporter);
    moduleSpecifierVisitor.visit(codeUnit.metadata.tree);
    return moduleSpecifierVisitor.moduleSpecifiers;
  }

  parse(codeUnit) {
    assert(!codeUnit.metadata.tree);
    var reporter = this.reporter;
    var normalizedName = codeUnit.normalizedName;
    var program = codeUnit.text;
    // For error reporting, prefer loader URL, fallback if we did not load text.
    var url = codeUnit.url || normalizedName;
    var file = new SourceFile(url, program);
    var parser = new Parser(file, reporter);
    if (codeUnit.type == 'module')
      codeUnit.metadata.tree = parser.parseModule();
    else
      codeUnit.metadata.tree = parser.parseScript();

    codeUnit.metadata.moduleSymbol =
      new ModuleSymbol(codeUnit.metadata.tree, normalizedName);

    return !reporter.hadError();
  }

  transform(codeUnit) {
    var transformer = new AttachModuleNameTransformer(codeUnit.normalizedName);
    var transformedTree = transformer.transformAny(codeUnit.metadata.tree);
    transformer = new FromOptionsTransformer(this.reporter,
        identifierGenerator);

    return transformer.transform(transformedTree);
  }

  fetch({address}, callback, errback) {
    this.fileLoader.load(address, callback, errback);
  }

  instantiate({name, metadata, address, source, sourceMap}) {
    return undefined;
  }

  locate(load) {
    load.url = this.locate_(load);
    return load.url;
  }

  locate_(load) {
    var normalizedModuleName = load.normalizedName;
    var asJS = normalizedModuleName + '.js';
    if (options.referrer) {
      if (asJS.indexOf(options.referrer) === 0) {
        asJS = asJS.slice(options.referrer.length);
        load.metadata.locateMap = {
          pattern: options.referrer,
          replacement: ''
        };
      }
    }
    if (isAbsolute(asJS))
      return asJS;
    var baseURL = load.metadata && load.metadata.baseURL;
    baseURL = baseURL || this.rootUrl();
    if (baseURL) {
      load.metadata.baseURL = baseURL;
      return resolveUrl(baseURL, asJS);
    }
    return asJS;
  }

  nameTrace(load) {
    var trace = '';
    if (load.metadata.locateMap) {
      trace += this.locateMapTrace(load);
    }
    if (load.metadata.baseURL) {
      trace += this.baseURLTrace(load);
    }
    return trace;
  }

  locateMapTrace(load) {
    var map = load.metadata.locateMap;
    return `LoaderHooks.locate found \'${map.pattern}\' -> \'${map.replacement}\'\n`;
  }

  baseURLTrace(load) {
    return 'LoaderHooks.locate resolved against \'' + load.metadata.baseURL + '\'\n';
  }

  evaluateCodeUnit(codeUnit) {
    // Source for modules compile into calls to registerModule(url, fnc).
    //
    // TODO(arv): Eval in the right context.
    var result = ('global', eval)(codeUnit.metadata.transcoded);
    codeUnit.metadata.transformedTree = null;
    return result;
  }

  analyzeDependencies(dependencies, loader) {
    var deps = [];  // metadata for each dependency
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];

      // We should not have gotten here if not all are PARSED or larget.
      assert(codeUnit.state >= PARSED);

      if (codeUnit.state == PARSED) {
        deps.push(codeUnit.metadata);
      }
    }

    this.exportListBuilder_.buildExportList(deps, loader);
  }

  get options() {
    return options;
  }

  bundledModule(name) {
    return this.moduleStore_.bundleStore[name];
  }

}
