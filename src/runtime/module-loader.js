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

import {ArrayMap} from '../util/ArrayMap';
import {ModuleAnalyzer} from '../semantics/ModuleAnalyzer';
import {ModuleRequireVisitor} from
    '../codegeneration/module/ModuleRequireVisitor';
import {ModuleSymbol} from '../semantics/symbols/ModuleSymbol';
import {ObjectMap} from '../util/ObjectMap';
import {Parser} from '../syntax/Parser';
import {ProgramTransformer} from '../codegeneration/ProgramTransformer';
import {Project} from '../semantics/symbols/Project';
import {SourceFile} from '../syntax/SourceFile';
import {TreeWriter} from '../outputgeneration/TreeWriter';
import {WebLoader} from './WebLoader';
import {assert} from '../util/assert';
import {getUid} from '../util/uid';
import {isStandardModuleUrl} from '../util/url';

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
   * @param {string} type Either 'script' or 'module'. This determinse how to
   *     parse the code.
   * @param {number} state
   */
  constructor(loader, url, type, state) {
    this.loader = loader;
    this.url = url;
    this.type = type;
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
    var tree;
    if (this.type == 'module')
      tree = parser.parseModule();
    else
      tree = parser.parseScript();

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
    super(loader, url, 'module', NOT_STARTED);
    if (isStandardModuleUrl(url)) {
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
    var moduleSymbol = new ModuleSymbol(tree, url);
    project.addExternalModule(moduleSymbol);

    return true;
  }

  transform() {
    if (this.type === 'module') {
      return ProgramTransformer.transformFileAsModule(this.reporter,
          this.project, this.moduleSymbol, this.file);
    }
    return ProgramTransformer.transformFile(this.reporter, this.project,
        this.file);
  }
}

/**
 * CodeUnit used for {@code Loader.eval} and {@code Loader.evalAsync}.
 */
class EvalCodeUnit extends CodeUnit {
  /**
   * @param {InternalLoader} loader
   * @param {string} code
   */
  constructor(loader, code) {
    super(loader, loader.url, 'script', LOADED);
    this.text = code;
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
  constructor(reporter, project,
              fileLoader = new InternalLoader.FileLoader,
              options = {}) {
    this.reporter = reporter;
    this.project = project;
    this.fileLoader = fileLoader;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;
    this.translateHook = options.translate || defaultTranslate;
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

  load(url, type = 'script') {
    url = System.normalResolve(url, this.url);
    var codeUnit = this.getCodeUnit(url, type);
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
    var translate = this.translateHook;
    codeUnit.abort = this.loadTextFile(url, function(text) {
      codeUnit.text = translate(text);
      codeUnit.state = LOADED;
      loader.handleCodeUnitLoaded(codeUnit);
    }, function() {
      codeUnit.state = ERROR;
      loader.handleCodeUnitLoadError(codeUnit);
    });
    return codeUnit;
  }

  loadSync(url, type = 'script') {
    this.sync_ = true;
    var loaded = this.load(url, type);
    this.sync_ = false;
    return loaded;
  }

  evalAsync(code) {
    var codeUnit = new EvalCodeUnit(this, code);
    this.cache.set({}, codeUnit);
    return codeUnit;
  }

  eval(code) {
    var codeUnit = new EvalCodeUnit(this, code);
    this.cache.set({}, codeUnit);
    // assert that there are no dependencies that are loading?
    this.handleCodeUnitLoaded(codeUnit);
    return codeUnit;
  }

  getKey(url, type) {
    var combined = type + ':' + url;
    if (combined in this.urlToKey) {
      return this.urlToKey[combined];
    }

    return this.urlToKey[combined] = {};
  }

  getCodeUnit(url, type) {
    var key = this.getKey(url, type);
    var cacheObject = this.cache.get(key);
    if (!cacheObject) {
      cacheObject = new LoadCodeUnit(this, url);
      cacheObject.type = type;
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
    codeUnit.dependencies = requireVisitor.requireUrls.sort().map((url) => {
      url = System.normalResolve(url, baseUrl);
      return this.getCodeUnit(url, 'module');
    });
    codeUnit.dependencies.forEach((dependency) => {
      this.load(dependency.url, 'module');
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
    // TODO(arv): Store location for load.
    codeUnit.error = 'Failed to load \'' + codeUnit.url + '\'';
    this.reporter.reportError(null, codeUnit.error);
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
      assert(codeUnit.state >= PARSED);

      if (codeUnit.state == PARSED) {
        trees.push(codeUnit.tree);
        modules.push(codeUnit.moduleSymbol);
      }
    }

    var analyzer = new ModuleAnalyzer(this.reporter, this.project);
    analyzer.analyzeTrees(trees, modules);

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
    this.transformDependencies(this.cache.values());
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
  }

  transformCodeUnit(codeUnit) {
    this.transformDependencies(codeUnit.dependencies); // depth first

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

      var result;
      try {
        result = this.evalCodeUnit(codeUnit);
      } catch (ex) {
        codeUnit.error = ex;
        this.reporter.reportError(null, String(ex));
        this.abortAll();
        return;
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
    return ('global', eval)(TreeWriter.write(codeUnit.transformedTree));
  }

  static set FileLoader(v) {
    FileLoader = v;
  }

  static get FileLoader() {
    return FileLoader;
  }
}

var FileLoader = WebLoader;

function defaultTranslate(source) {
  return source;
}

export class CodeLoader {
  /**
   * @param {ErrorReporter} reporter
   * @param {Project} project
   * @param {CodeLoader} parentLoader The parent loader or null if this is
   *     the initial loader.
   * @param {!Object=} options
   */
  constructor(reporter, project, parentLoader, options = {}) {
    // TODO(arv): Implement parent loader
    this.internalLoader_ = new InternalLoader(reporter, project,
                                              undefined, options);
  }

  /**
   * load - Asynchronously load and run a script. If the script contains import
   * declarations, this can cause modules to be loaded, linked, and evaluated.
   *
   * On success, pass the result of evaluating the script to the success
   * callback.
   *
   * This is the same as asyncEval, but first fetching the script.
   */
  load(url,
       callback = (result) => {},
       errback = (ex) => { throw ex; }) {
    var codeUnit = this.internalLoader_.load(url, 'script');
    codeUnit.addListener(function(result) {
      callback(result);
    }, errback);
  }

  /**
   * eval - Evaluate the script src.
   *
   * src may import modules, but if it directly or indirectly imports a module
   * that is not already loaded, a SyntaxError is thrown.
   *
   * @param {string} program The source code to eval.
   * @return {*} The completion value of evaluating the code.
   */
  eval(program) {
    var codeUnit = this.internalLoader_.eval(program);
    return codeUnit.result;
  }

  /**
   * evalAsync - Asynchronously run the script src, first loading any imported
   * modules that aren't already loaded.
   *
   * This is the same as load but without fetching the initial script. On
   * success, the result of evaluating the program is passed to callback.
   */
  evalAsync(program, callback, errback = undefined) {
    var codeUnit = this.internalLoader_.evalAsync(program);
    codeUnit.addListener(callback, errback);
    this.internalLoader_.handleCodeUnitLoaded(codeUnit);
  }

  /**
   * import - Asynchronously load, link, and evaluate a module and any
   * dependencies it imports. On success, pass the Module object to the success
   * callback.
   */
  import(url,
         callback = (module) => {},
         errback = (ex) => { throw ex; }) {
    var codeUnit = this.internalLoader_.load(url, 'module');
    codeUnit.addListener(function() {
      callback(System.get(codeUnit.url));
    }, errback);
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

export var internals = {
  CodeUnit,
  EvalCodeUnit,
  InternalLoader,
  LoadCodeUnit
};
