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
import {LoaderHooks} from '../runtime/LoaderHooks';
import {ModuleSpecifierVisitor} from
    '../codegeneration/module/ModuleSpecifierVisitor';
import {ObjectMap} from '../util/ObjectMap';
import {webLoader} from './webLoader';
import {getUid} from '../util/uid';

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
 * Similar to js-loader Load object
 */
class CodeUnit {
  /**
   * @param {LoaderHooks} loaderHooks, callbacks for parsing/transforming.
   * @param {string} url The URL of this dependency. If this is evaluated code
   *     the URL is the URL of the loader.
   * @param {string} type Either 'script' or 'module'. This determinse how to
   *     parse the code.
   * @param {number} state
   */
  constructor(loaderHooks, url, type, state) {
    this.loaderHooks = loaderHooks;
    this.url = url;
    this.type = type;
    this.state = state;
    this.uid = getUid();
    this.state_ = NOT_STARTED;
    this.error = null;
    this.result = null;
    this.data_ = {};
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

  /**
   * @return opaque value set and used by loaderHooks
   */
  get data() {
    return this.data_;
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
    if (this.loaderHooks.parse(this)) {
      this.state = PARSED;
      return true;
    } else {
      this.error = 'Parse error';
      return false;
    }
  }

  transform() {
    return this.loaderHooks.transform(this);
  }

  instantiate() {
    if (this.loaderHooks.instantiate(this))
      throw new Error('instantiate() with factory return not implemented.');
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
  constructor(loaderHooks, url) {
    super(loaderHooks, url, 'module', NOT_STARTED);
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
    this.loaderHooks.addExternalModule(this);
    return true;
  }
}

/**
 * CodeUnit used for {@code Loader.eval} and {@code Loader.module}.
 */
class EvalCodeUnit extends CodeUnit {
  /**
   * @param {LoaderHooks} loaderHooks
   * @param {string} code
   * @param {string} root script name
   */
  constructor(loaderHooks, code, name = loaderHooks.rootUrl()) {
    super(loaderHooks, name, LOADED);
    this.text = code;
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
    this.loaderHooks.addExternalModule(this);
    return true;
  }
}

/**
 * The internal implementation of the code loader.
 */
class InternalLoader {
  /**
   * @param {loaderHooks} loaderHooks
   */
  constructor(loaderHooks) {
    this.loaderHooks = loaderHooks;
    // TODO(jjb): fix API
    this.loaderHooks.setLoader(this);
    this.reporter = loaderHooks.reporter;
    this.fileLoader = loaderHooks.fileLoader || InternalLoader.fileLoader;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;
    this.translateHook = loaderHooks.translate || defaultTranslate;
  }

  loadTextFile(url, callback, errback) {
    return this.fileLoader.load(url, callback, errback);
  }

  loadTextFileSync(url) {
    return this.fileLoader.loadSync(url);
  }

  load(url, type = 'script') {
    url = System.normalResolve(url, this.loaderHooks.rootUrl());
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

  module(code, options) {
    var codeUnit = new EvalCodeUnit(this.loaderHooks, code, options.address);
    this.cache.set({}, codeUnit);
    return codeUnit;
  }

  eval(code, name) {
    var codeUnit = new EvalCodeUnit(this.loaderHooks, code, name);
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
      cacheObject = new LoadCodeUnit(this.loaderHooks, url);
      cacheObject.type = type;
      this.cache.set(key, cacheObject);
    }
    return cacheObject;
  }

  areAll(state) {
    return this.cache.values().every((codeUnit) => codeUnit.state >= state);
  }

  // To System
  getModuleSpecifiers(codeUnit) {
    // Parse
    if (!codeUnit.parse())
      return;

    // Analyze to find dependencies
    var moduleSpecifierVisitor = new ModuleSpecifierVisitor(this.reporter);
    moduleSpecifierVisitor.visit(codeUnit.tree);
    return moduleSpecifierVisitor.moduleSpecifiers;
  }

  getModuleSymbolForModuleSpecifier(name, referrer) {
    var url = System.normalResolve(name, referrer);
    var codeUnit = this.getCodeUnit(url, 'module');
    return codeUnit.data.moduleSymbol;
  }

  /**
   * This is called when a codeUnit is loaded.
   * @param {CodeUnit} codeUnit
   */
  handleCodeUnitLoaded(codeUnit) {
    var baseUrl = codeUnit.url;
    var moduleSpecifiers = this.getModuleSpecifiers(codeUnit);
    if (!moduleSpecifiers) {
      this.abortAll()
      return;
    }
    codeUnit.dependencies = moduleSpecifiers.sort().map((name) => {
      name = System.normalResolve(name, baseUrl);
      return this.getCodeUnit(name, 'module');
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
    codeUnit.dispatchError(codeUnit.error);
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
    // Notify all codeUnit listeners (else tests hang til timeout).
    this.cache.values().forEach((codeUnit) => {
      codeUnit.dispatchError(codeUnit.error);
    });
  }

  analyze() {
    this.loaderHooks.analyzeDependencies(this.cache.values());
  }

  transform() {
    this.loaderHooks.transformDependencies(this.cache.values());
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
        codeUnit.dispatchError(codeUnit.error);
        return;
      }

      codeUnit.result = result;
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
    // TODO correct loaderHooks function
    return this.loaderHooks.evaluate(codeUnit);
  }

  static set fileLoader(v) {
    fileLoader = v;
  }

  static get fileLoader() {
    return fileLoader;
  }
}

var fileLoader = webLoader;

function defaultTranslate(source) {
  return source;
}

// jjb I don't understand why this is needed.
var SystemLoaderHooks = LoaderHooks;

export class Loader {
  /**
   * ES6 Loader Constructor
   * @param {!Object=} options
   */
  constructor(loaderHooks) {
    this.internalLoader_ = new InternalLoader(loaderHooks);
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
   * @param {string} source The source code to eval.
   * @param {string} name  name for the script
   * @return {*} The completion value of evaluating the code.
   */
  eval(source, name) {
    var codeUnit = this.internalLoader_.eval(source, name);
    return codeUnit.result;
  }

  /**
   * module - Asynchronously run the script src, first loading any imported
   * modules that aren't already loaded.
   *
   * This is the same as load but without fetching the initial script. On
   * success, the result of evaluating the source is passed to callback.
   */
  module(source, options, callback, errback = undefined) {
    var codeUnit = this.internalLoader_.module(source, options);
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

export {LoaderHooks};

export var internals = {
  CodeUnit,
  EvalCodeUnit,
  InternalLoader,
  LoadCodeUnit,
  LoaderHooks
};
