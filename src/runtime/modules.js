// Copyright 2012 Traceur Authors.
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

import {ArrayMap} from '../util/ArrayMap.js';
import {ModuleAnalyzer} from '../semantics/ModuleAnalyzer.js';
import {ModuleRequireVisitor} from
    '../codegeneration/module/ModuleRequireVisitor.js';
import {ModuleSymbol} from '../semantics/symbols/ModuleSymbol.js';
import {ObjectMap} from '../util/ObjectMap.js';
import {Parser} from '../syntax/Parser.js';
import {ProgramTransformer} from '../codegeneration/ProgramTransformer.js';
import {Project} from '../semantics/symbols/Project.js';
import {SourceFile} from '../syntax/SourceFile.js';
import {TreeWriter} from '../outputgeneration/TreeWriter.js';
import {WebLoader} from './WebLoader.js';
import {getUid} from '../util/uid.js';
import {resolveUrl} from '../util/url.js';
import {
  standardModuleUrlRegExp,
  getModuleInstanceByUrl,
  getCurrentCodeUnit,
  setCurrentCodeUnit
} from './get-module.js';

// TODO(arv): I stripped the resolvers to make this simpler for now.

// TODO(arv): Implement
var base = Object.freeze(Object.create(null, {
  Array: {value: Array},
  Boolean: {value: Boolean},
  Date: {value: Date},
  Error: {value: Error},
  EvalError: {value: EvalError},
  Function: {value: Function},
  JSON: {value: JSON},
  Math: {value: Math},
  Number: {value: Number},
  Object: {value: Object},
  RangeError: {value: RangeError},
  ReferenceError: {value: ReferenceError},
  RegExp: {value: RegExp},
  String: {value: String},
  SyntaxError: {value: SyntaxError},
  TypeError: {value: TypeError},
  URIError: {value: URIError},

  undefined: {value: void 0}
}));


var NOT_STARTED = 0;
var LOADING = 1;
var LOADED = 2;
var PARSED = 3;
var TRANSFORMED = 4;
var COMPLETE = 5;
var ERROR = 6;

/**
 * Base class representing a piece of code that is to be loaded or evaluated.
 */
class CodeUnit {
  /**
   * @param {InternalLoader} loader The loader that is managing this dependency.
   * @param {string} url The URL of this dependency. If this is evaluated code
   *     the URL is the URL of the loader.
   * @param {number} state
   */
  constructor(loader, url, state) {
    this.loader = loader;
    this.url = url;
    this.state = state;
    this.uid = getUid();
    this.state_ = NOT_STARTED;
  }

  get state() {
    return this.state_;
  }
  set state(state) {
    if (state < this.state_) {
      throw new Error('Invalid state change');
    }
    this.state_ = state;
  }

  get reporter() {
    return this.loader.reporter;
  }

  get project() {
    return this.loader.project;
  }

  get tree() {
    return this.project.getParseTree(this.file);
  }

  get moduleSymbol() {
    // TODO(arv): This is not correct. What module is eval code
    // evaluated in?
    return this.project.getRootModule();
  }

  /**
   * Adds callback for COMPLETE and ERROR.
   */
  addListener(callback, errback) {
    // TODO(arv): Handle this case?
    if (this.state >= COMPLETE)
      throw Error(`${this.url} is already loaded`);
    if (!this.listeners) {
      this.listeners = [];
    }
    this.listeners.push(callback, errback);
  }

  dispatchError(value) {
    this.dispatch_(value, 1);
  }

  dispatchComplete(value) {
    this.dispatch_(value, 0);
  }

  dispatch_(value, error) {
    var listeners = this.listeners;
    if (!listeners) {
      return;
    }
    // Clone to prevent mutations during dispatch
    listeners = listeners.concat();
    this.listeners = [];

    for (var i = error; i < listeners.length; i += 2) {
      var f = listeners[i];
      if (f) {
        f(value);
      }
    }
  }

  /**
   * Parses the codeUnit
   * @return {boolean} Whether the parse succeeded.
   */
  parse() {
    var reporter = this.reporter;
    var project = this.project;
    var url = this.url;
    var program = this.text;
    var file = new SourceFile(url, program);
    project.addFile(file);
    this.file = file;

    var parser = new Parser(reporter, file);
    var tree = parser.parseProgram(this.allowLoad);

    if (reporter.hadError()) {
      this.error = 'Parse error';
      return false;
    }

    project.setParseTree(file, tree);

    this.state = PARSED;

    return true;
  }

  transform() {
    return ProgramTransformer.transformFile(this.reporter, this.project,
                                            this.file);
  }
}

/**
 * CodeUnit used for {@code Loader.load}.
 */
class LoadCodeUnit extends CodeUnit {
  /**
   * @param {InternalLoader} loader
   * @param {string} url
   */
  constructor(loader, url) {
    super(loader, url, NOT_STARTED);
    this.allowLoad = true;
    if (standardModuleUrlRegExp.test(url)) {
      this.state = COMPLETE;
      this.dependencies = [];
    }
  }

  get moduleSymbol() {
    return this.project.getModuleForUrl(this.url);
  }

  /**
   * Override to add parse tree as an external module symbol.
   * @return {boolean}
   * @override
   */
  parse() {
    if (!super.parse()) {
      return false;
    }

    var project = this.loader.project;
    var tree = this.tree;
    var url = this.url;
    // External modules have no parent module.
    var moduleSymbol = new ModuleSymbol(null, null, tree, url);
    project.addExternalModule(moduleSymbol);

    return true;
  }

  transform() {
    return ProgramTransformer.transformFileAsModule(this.reporter,
        this.project, this.moduleSymbol, this.file);
  }
}

/**
 * CodeUnit used for {@code Loader.eval}.
 */
class EvalCodeUnit extends CodeUnit {
  /**
   * @param {InternalLoader} loader
   * @param {string} code
   */
  constructor(loader, code) {
    super(loader, loader.url, LOADED);
    this.text = code;
    this.allowLoad = false;
  }
}

/**
 * CodeUnit used for {@code Loader.evalLoad}.
 */
class EvalLoadCodeUnit extends CodeUnit {
  /**
   * @param {InternalLoader} loader
   * @param {string} code
   */
  constructor(loader, code) {
    CodeUnit.call(this, loader, loader.url, LOADED);
    this.text = code;
    this.allowLoad = true;
  }
}

/**
 * The internal implementation of the code loader.
 */
class InternalLoader {
  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project.
   */
  constructor(reporter, project, fileLoader = new InternalLoader.FileLoader) {
    this.reporter = reporter;
    this.project = project;
    this.fileLoader = fileLoader;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;

  }

  get url() {
    return this.project.url;
  }

  loadTextFile(url, callback, errback) {
    return this.fileLoader.load(url, callback, errback);
  }

  loadTextFileSync(url) {
    return this.fileLoader.loadSync(url);
  }

  load(url) {
    url = resolveUrl(this.url, url);
    var codeUnit = this.getCodeUnit(url);
    if (codeUnit.state != NOT_STARTED || codeUnit.state == ERROR) {
      return codeUnit;
    }

    codeUnit.state = LOADING;
    if (this.sync_) {
      try {
        codeUnit.text = this.loadTextFileSync(url);
        codeUnit.state = LOADED;
        this.handleCodeUnitLoaded(codeUnit);
      } catch(e) {
        codeUnit.state = ERROR;
        this.handleCodeUnitLoadError(codeUnit);
      }
      return codeUnit;
    }
    var loader = this;
    codeUnit.abort = this.loadTextFile(url, function(text) {
      codeUnit.text = text;
      codeUnit.state = LOADED;
      loader.handleCodeUnitLoaded(codeUnit);
    }, function() {
      codeUnit.state = ERROR;
      loader.handleCodeUnitLoadError(codeUnit);
    });
    return codeUnit;
  }

  loadSync(url) {
    this.sync_ = true;
    var loaded = this.load(url);
    this.sync_ = false;
    return loaded;
  }

  evalLoad(code) {
    var codeUnit = new EvalLoadCodeUnit(this, code);
    this.cache.set({}, codeUnit);
    return codeUnit;
  }

  eval(code) {
    var codeUnit = new EvalCodeUnit(this, code);
    this.cache.set({}, codeUnit);
    this.handleCodeUnitLoaded(codeUnit);
    return codeUnit;
  }

  getKey(url) {
    if (url in this.urlToKey) {
      return this.urlToKey[url];
    }

    return this.urlToKey[url] = {};
  }

  getCodeUnit(url) {
    var key = this.getKey(url);
    var cacheObject = this.cache.get(key);
    if (!cacheObject) {
      cacheObject = new LoadCodeUnit(this, url);
      this.cache.set(key, cacheObject);
    }
    return cacheObject;
  }

  areAll(state) {
    return this.cache.values().every((codeUnit) => codeUnit.state >= state);
  }

  /**
   * This is called when a codeUnit is loaded.
   * @param {CodeUnit} codeUnit
   */
  handleCodeUnitLoaded(codeUnit) {
    // Parse
    if (!codeUnit.parse()) {
      this.abortAll();
      return;
    }

    // Analyze to find dependencies
    var requireVisitor = new ModuleRequireVisitor(this.reporter);
    requireVisitor.visit(codeUnit.tree);
    var baseUrl = codeUnit.url;
    codeUnit.dependencies = requireVisitor.requireUrls.map((url) => {
      url = resolveUrl(baseUrl, url);
      return this.getCodeUnit(url);
    });
    codeUnit.dependencies.forEach((dependency) => {
      this.load(dependency.url);
    });

    if (this.areAll(PARSED)) {
      this.analyze();
      this.transform();
      this.evaluate();
    }
  }

  /**
   * This is called when a code unit failed to load.
   * @param {CodeUnit} codeUnit
   */
  handleCodeUnitLoadError(codeUnit) {
    this.error = codeUnit.error = 'Failed to load \'' + codeUnit.url + '\'';
    this.abortAll();
  }

  /**
   * Aborts all loading code units.
   */
  abortAll() {
    this.cache.values().forEach((codeUnit) => {
      if (codeUnit.abort) {
        codeUnit.abort();
        codeUnit.state = ERROR;
      }
    });

    this.cache.values().forEach((codeUnit) => {
      codeUnit.dispatchError(codeUnit.error);
    });
  }

  analyze() {
    var dependencies = this.cache.values();
    var trees = [];
    var modules = [];
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];

      // We should not have gotten here if not all are PARSED or larget.
      traceur.assert(codeUnit.state >= PARSED);

      if (codeUnit.state == PARSED) {
        trees.push(codeUnit.tree);
        modules.push(codeUnit.moduleSymbol);
      }
    }

    var analyzer = new ModuleAnalyzer(this.reporter, this.project);
    analyzer.analyzeModuleTrees(trees, modules);

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
          codeUnit.dispatchError('Failed to analyze');
        }
      }
    }
  }

  transform() {
    var dependencies = this.cache.values();
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];
      if (codeUnit.state >= TRANSFORMED) {
        continue;
      }

      codeUnit.transformedTree = this.transformCodeUnit(codeUnit);
      codeUnit.state = TRANSFORMED;
    }
  }

  transformCodeUnit(codeUnit) {
    var results = codeUnit.transform();
    return results.get(codeUnit.file);
  }

  evaluate() {
    // Order the dependencies.
    var visited = new ObjectMap();
    var ordered = [];
    function orderCodeUnits(codeUnit) {
      // Cyclic dependency.
      if (visited.has(codeUnit)) {
        return;
      }

      visited.set(codeUnit, true);
      codeUnit.dependencies.forEach(orderCodeUnits);
      ordered.push(codeUnit);
    }
    this.cache.values().forEach(orderCodeUnits);
    var dependencies = ordered;

    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];
      if (codeUnit.state >= COMPLETE) {
        continue;
      }

      traceur.assert(getCurrentCodeUnit() === undefined);
      setCurrentCodeUnit(codeUnit);
      var result;

      try {
        result = this.evalCodeUnit(codeUnit);
      } catch (ex) {
        codeUnit.error = ex.message;
        this.abortAll();
        return;
      } finally {
        // Ensure that we always clean up currentCodeUnit.
        traceur.assert(getCurrentCodeUnit() === codeUnit);
        setCurrentCodeUnit(undefined);
      }

      codeUnit.result = result;
      codeUnit.transformedTree = null;
      codeUnit.text = null;
    }

    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];
      if (codeUnit.state >= COMPLETE) {
        continue;
      }
      codeUnit.state = COMPLETE;
      codeUnit.dispatchComplete(codeUnit.result);
    }
  }

  evalCodeUnit(codeUnit) {
    // TODO(arv): Eval in the right context.
    // Module bodies are always strict.
    return ('global', eval)("'use strict';" +
        TreeWriter.write(codeUnit.transformedTree));
  }

  static set FileLoader(v) {
    FileLoader = v;
  }

  static get FileLoader() {
    return FileLoader;
  }
}

var FileLoader = WebLoader;

export class CodeLoader {
  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {CodeLoader} parentLoader The parent loader or null if this is
   *     the initial loader.
   * @param {*=} resolver
   */
  constructor(reporter, project, parentLoader, resolver = undefined) {
    // TODO(arv): Implement parent loader
    // TODO(arv): Implement resolver
    this.internalLoader_ = new InternalLoader(reporter, project);
  }

  /**
   * The load method takes a string representing a module URL and a callback
   * that receives the result of loading, compiling, and executing the module
   * at that URL. The compiled code is statically associated with this loader,
   * and its URL is the given URL. The additional callback is used if an error
   * occurs.
   */
  load(url, callback, errback = undefined) {
    var codeUnit = this.internalLoader_.load(url);
    codeUnit.addListener(callback, errback);
  }

  /**
   * The eval method takes a string representing a Program(false) (that is, a
   * program that cannot load external modules) and returns the result of
   * compiling and executing the program. The compiled code is statically
   * associated with this loader, and its URL is the base URL of this loader.
   *
   * @param {string} program The source code to eval.
   * @return {*} The completion value of evaluating the code.
   */
  eval(program) {
    var codeUnit = this.internalLoader_.eval(program);
    return codeUnit.result;
  }

  /**
   * The evalLoad method takes a string representing a Program(true) (this is,
   * a program that can load external modules) and a callback that receives
   * the result of compiling and executing the program. The compiled code is
   * statically associated with this loader, and its URL is the base URL of
   * this loader. The additional callback is used if an error occurs.
   */
  evalLoad(program, callback, errback = undefined) {
    var codeUnit = this.internalLoader_.evalLoad(program);
    codeUnit.addListener(callback, errback);
    this.internalLoader_.handleCodeUnitLoaded(codeUnit);
  }

  /**
   * The import method takes a module instance object and dynamically imports
   * its non-module exports into the global namespace encapsulated by this
   * loader. (In other words, it dynamically performs the equivalent of
   * import m.*.)
   */
  import(moduleInstanceObject) {
    throw Error('Not implemented');
  }

  /**
   * The defineGlobal method defines a global binding in the global namespace
   * encapsulated by this loader.
   */
  defineGlobal(name, value) {
    throw Error('Not implemented');
  }

  /**
   * The defineModule method takes a string name and a module instance object
   * and defines a global module binding in the global namespace encapsulated
   * by this loader. If the optional third argument is provided, it is used as
   * a key and the module instance is stored in the module instance cache with
   * that key.
   * @return {void}
   */
  defineModule(name, moduleInstanceObject, cacheKey = undefined) {
    throw Error('Not implemented');
  }

  /**
   * The create method creates a child loader, i.e. a new loader whose parent
   * is this loader.
   *
   * The first argument is a module instance object representing the base
   * library (containing the Object, Array, String, etc. standard libraries).
   * This module must contain bindings for all the global functions and
   * constructors of the standard library.
   * The second, optional argument is a resolver, which may contain
   * compilation hooks (see below).
   *
   * @return {CodeLoader}
   */
  create(moduleInstanceObject, resolver = undefined) {
    var url = this.project_.url;
    var project = new Project(url);
    var loader = new CodeLoader(this.reporter, project, this, resolver);
    // TODO(arv): Implement globals
    // TODO(arv): Implement resolver
    return loader;
  }

  /**
   * The createBase method creates a fresh base library.
   *
   * Note that this does not include a Loader binding. When creating a child
   * loader, no loader is exposed to its global namespace by default. A loader
   * can easily be shared via defineGlobal.
   */
  createBase() {
    return base;
  }
}

export module internals {
  export CodeUnit;
  export EvalCodeUnit;
  export EvalLoadCodeUnit;
  export InternalLoader;
  export LoadCodeUnit;
};
