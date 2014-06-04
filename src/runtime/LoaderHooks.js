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
import {buildExportList} from '../codegeneration/module/ExportListBuilder';
import {CollectingErrorReporter} from '../util/CollectingErrorReporter';
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
  constructor(reporter, baseURL,
      fileLoader = webLoader,
      moduleStore = $traceurRuntime.ModuleStore) {
    this.baseURL_ = baseURL;
    this.moduleStore_ = moduleStore;
    this.fileLoader = fileLoader;
    this.eventHandlers = {
      complete: []
    }
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

  get baseURL() {
    return this.baseURL_;
  }

  set baseURL(value) {
    this.baseURL_ = String(value);
  }

  getModuleSpecifiers(codeUnit) {
    this.parse(codeUnit);
    codeUnit.state = PARSED;

    // Analyze to find dependencies
    var moduleSpecifierVisitor = new ModuleSpecifierVisitor();
    moduleSpecifierVisitor.visit(codeUnit.metadata.tree);
    return moduleSpecifierVisitor.moduleSpecifiers;
  }

  parse(codeUnit) {
    assert(!codeUnit.metadata.tree);
    var reporter = new CollectingErrorReporter();
    var normalizedName = codeUnit.normalizedName;
    var program = codeUnit.source;
    // For error reporting, prefer loader URL, fallback if we did not load text.
    var url = codeUnit.url || normalizedName;
    var file = new SourceFile(url, program);
    this.checkForErrors((reporter) => {
      var parser = new Parser(file, reporter);
      if (codeUnit.type == 'module')
        codeUnit.metadata.tree = parser.parseModule();
      else
        codeUnit.metadata.tree = parser.parseScript();
    });

    codeUnit.metadata.moduleSymbol =
      new ModuleSymbol(codeUnit.metadata.tree, normalizedName);
  }

  transform(codeUnit) {
    var transformer = new AttachModuleNameTransformer(codeUnit.normalizedName);
    var transformedTree = transformer.transformAny(codeUnit.metadata.tree);

    return this.checkForErrors((reporter) => {
      transformer = new FromOptionsTransformer(reporter,
          identifierGenerator);

      return transformer.transform(transformedTree);
    });
  }

  fetch(load) {
    return new Promise((resolve, reject) => {
      if (!load)
        reject(new TypeError('fetch requires argument object'));
      else if (!load.address || typeof load.address !== 'string')
        reject(new TypeError('fetch({address}) missing required string.'));
      else this.fileLoader.load(load.address, resolve, reject);
    });
  }

  translate(load) {
    return new Promise((resolve, reject) => {
      resolve(load.source);
    });
  }

  instantiate({name, metadata, address, source, sourceMap}) {
    return new Promise((resolve, reject) => {
      resolve(undefined);
    });
  }

  locate(load) {
    load.url = this.locate_(load);
    return load.url;
  }

  locate_(load) {
    var normalizedModuleName = load.normalizedName;
    var asJS;
    if (load.type === 'script') {
      asJS = normalizedModuleName;
    } else {
      asJS = normalizedModuleName + '.js';
    }

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
    baseURL = baseURL || this.baseURL;
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
    var base = load.metadata.baseURL || this.baseURL;
    if (base) {
      trace += this.baseURLTrace(base);
    } else {
      trace += 'No baseURL\n';
    }
    return trace;
  }

  locateMapTrace(load) {
    var map = load.metadata.locateMap;
    return `LoaderHooks.locate found \'${map.pattern}\' -> \'${map.replacement}\'\n`;
  }

  baseURLTrace(base) {
    return 'LoaderHooks.locate resolved against base \'' + base + '\'\n';
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

    this.checkForErrors((reporter) => buildExportList(deps, loader, reporter));
  }

  get options() {
    return options;
  }

  bundledModule(name) {
    return this.moduleStore_.bundleStore[name];
  }

  checkForErrors(fncOfReporter) {
    var reporter = new CollectingErrorReporter();
    var result = fncOfReporter(reporter);
    if (reporter.hadError())
      throw reporter.toException();
    return result;
  }

  on(eventName, callback) {
    if (this.eventHandlers.hasOwnPropertyName(eventName)) {
      this.eventHandlers[eventName].push(callback);
    } else {
      throw new Error('LoaderHooks has no event named ' + eventName);
    }
  }

  onComplete(codeUnit) {
    this.eventHandlers.complete.forEach((handler) => handler(codeUnit));
  }

}
