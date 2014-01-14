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
import {ObjectMap} from '../util/ObjectMap';
import {canonicalizeUrl, isAbsolute, resolveUrl} from '../util/url';
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
   * @param {string} name The normalized name of this dependency.
   * @param {string} type Either 'script' or 'module'. This determinse how to
   *     parse the code.
   * @param {number} state
   */
  constructor(loaderHooks, normalizedName, type, state, 
      name, referrerName, address) {
    this.loaderHooks = loaderHooks;
    this.normalizedName = normalizedName;
    this.type = type;
    this.state = state;
    this.name_ = name;
    this.referrerName_ = referrerName;
    this.address_ = address;
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
  get metadata() {
    return this.data_;
  }

  nameTrace() {
    var trace = this.specifiedAs();
    if (isAbsolute(this.name_)) {
      return trace + 'An absolute name.\n';
    }
    if (this.referrerName_) {
      return trace + this.importedBy() + this.normalizesTo();
    }
    return trace + this.normalizesTo();
  }

  specifiedAs() {
    return `Specified as ${this.name_}.\n`;
  }

  importedBy() {
    return `Imported by ${this.referrerName_}.\n`;
  }

  normalizesTo(name) {
    return 'Normalizes to ' + this.normalizedName + '\n';
  }

  /**
   * Adds callback for COMPLETE and ERROR.
   */
  addListener(callback, errback) {
    // TODO(arv): Handle this case?
    if (this.state >= COMPLETE)
      throw Error(`${this.name} is already loaded`);
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
   * @param {string} normalizedName
   */
  constructor(loaderHooks, normalizedName, name, referrerName, address) {
    super(loaderHooks, normalizedName, 'module', NOT_STARTED, 
        name, referrerName, address);
  }

}

/**
 * CodeUnit used for {@code Loader.eval} and {@code Loader.module}.
 */
class EvalCodeUnit extends CodeUnit {
  /**
   * @param {LoaderHooks} loaderHooks
   * @param {string} code
   * @param {string} caller script or module name
   */
  constructor(loaderHooks, code, normalizedName = loaderHooks.rootUrl(),
      name, referrerName, address) {
    super(loaderHooks, normalizedName, 'script', LOADED, 
        name, referrerName, address);
    this.text = code;
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
    this.reporter = loaderHooks.reporter;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;
    this.translateHook = loaderHooks.translate || defaultTranslate;
  }

  loadTextFile(url, callback, errback) {
    return this.loaderHooks.fetch({address: url}, callback, errback);
  }

  load(name, referrerName = this.loaderHooks.rootUrl(),
      address, type = 'script') {
    var codeUnit = this.getCodeUnit_(name, referrerName, address, type);
    if (codeUnit.state != NOT_STARTED || codeUnit.state == ERROR) {
      return codeUnit;
    }

    codeUnit.state = LOADING;
    var loader = this;
    var translate = this.translateHook;
    var url = this.loaderHooks.locate(codeUnit);
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

  module(code, name, referrerName, address) {
    var normalizedName = System.normalize(name, referrerName, address);
    var codeUnit = new EvalCodeUnit(this.loaderHooks, code, normalizedName,
        name, referrerName, address);
    this.cache.set({}, codeUnit);
    return codeUnit;
  }

  /**
   * @param {string} code, source to be compiled as 'Script'
   * @param {string} name,  ModuleSpecifier-like name, not normalized.
   */
  script(code, name = this.loaderHooks.rootUrl(), referrerName, address) {
    var normalizedName = System.normalize(name, referrerName, address);
    var codeUnit =
        new EvalCodeUnit(this.loaderHooks, code, normalizedName,
            name, referrerName, address);
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

  getCodeUnit_(name, referrerName, address, type) {
    var normalizedName = System.normalize(name, referrerName, address);
    var key = this.getKey(normalizedName, type);
    var cacheObject = this.cache.get(key);
    if (!cacheObject) {
      cacheObject = new LoadCodeUnit(this.loaderHooks, normalizedName,
          name, referrerName, address);
      cacheObject.type = type;
      this.cache.set(key, cacheObject);
    }
    return cacheObject;
  }

  areAll(state) {
    return this.cache.values().every((codeUnit) => codeUnit.state >= state);
  }

  getCodeUnitForModuleSpecifier(name, referrerName) {
    return this.getCodeUnit_(name, referrerName, null, 'module');
  }

  /**
   * This is called when a codeUnit is loaded.
   * @param {CodeUnit} codeUnit
   */
  handleCodeUnitLoaded(codeUnit) {
    var referrerName = codeUnit.normalizedName;
    var moduleSpecifiers = this.loaderHooks.getModuleSpecifiers(codeUnit);
    if (!moduleSpecifiers) {
      this.abortAll()
      return;
    }
    codeUnit.dependencies = moduleSpecifiers.sort().map((name) => {
      return this.getCodeUnit_(name, referrerName, null, 'module');
    });
    codeUnit.dependencies.forEach((dependency) => {
      this.load(dependency.normalizedName, null, null, 'module');
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
    var message = `Failed to load '${codeUnit.url}'.\n` +
        codeUnit.nameTrace() + this.loaderHooks.nameTrace(codeUnit);

    this.reporter.reportError(null, message);
    this.abortAll();
    codeUnit.error = message;
    codeUnit.dispatchError(message);
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
    this.loaderHooks.analyzeDependencies(this.cache.values(), this);
  }

  transform() {
    this.loaderHooks.transformDependencies(this.cache.values());
  }

  orderDependencies(codeUnit) {
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
    return ordered;
  }

  evaluate() {
    var dependencies = this.orderDependencies(codeUnit);

    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];
      if (codeUnit.state >= COMPLETE) {
        continue;
      }

      var result;
      try {
        result = this.loaderHooks.evaluateCodeUnit(codeUnit);
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
}

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
   * import - Asynchronously load, link, and evaluate a module and any
   * dependencies it imports. On success, pass the Module object to the success
   * callback.
   * @param {string} name, ModuleSpecifier-like name, not normalized.
   */
  import(name,
         {referrerName, address} = {},
         callback = (module) => {},
         errback = (ex) => { throw ex; }) {
    var codeUnit = this.internalLoader_.load(name, referrerName,
        address, 'module');
    codeUnit.addListener(function() {
      callback(System.get(codeUnit.normalizedName));
    }, errback);
  }

  /**
   * module - Asynchronously run the script src, first loading any imported
   * modules that aren't already loaded.
   *
   * This is the same as import but without fetching the source. On
   * success, the result of evaluating the source is passed to callback.
   */
  module(source, name,
      {referrerName, address} = {},
      callback = (module) => {},
      errback = (ex) => { throw ex; }) {
    var codeUnit = this.internalLoader_.module(source, name,
        referrerName, address);
    codeUnit.addListener(callback, errback);
    this.internalLoader_.handleCodeUnitLoaded(codeUnit);
  }

  /**
   * Not part of current spec.
   * See https://github.com/jorendorff/js-loaders/issues/92
   * loadAsScript - Asynchronously load and run a script. If the script
   * calls Loader.import(),  this can cause modules to be loaded, linked,
   * and evaluated.
   *
   * This function is the same as import(), with one exception: the text of
   * the initial load is parsed to goal 'Script' rather than 'Module'
   *
   * On success, pass the result of evaluating the script to the success
   * callback.
   * @param {string} name, ModuleSpecifier-like name, not normalized.
   */
  loadAsScript(name,
       {referrerName, address} = {},
       callback = (result) => {},
       errback = (ex) => { throw ex; }) {
    var codeUnit = this.internalLoader_.load(name, referrerName,
        address, 'script');
    codeUnit.addListener(function(result) {
      callback(result);
    }, errback);
  }

  /**
   * Not part of current spec.
   * script - Evaluate the source as a 'script'. Same as function module(),
   * but the source is parsed as 'script' rather than 'module'.
   *
   * This function is similar to built-in eval() except that all the Loader
   * callbacks, eg translate() are applied before evaluation.
   *
   * src may import modules, but if it directly or indirectly imports a module
   * that is not already loaded, a SyntaxError is thrown.
   *
   * @param {string} source The source code to eval.
   * @param {string} name name for the script
   * @return {*} The completion value of evaluating the code.
   */
  script(source, name,
      {referrerName, address} = {},
      callback = (result) => {},
      errback = (ex) => { throw ex; }) {
    try {
      var codeUnit =
          this.internalLoader_.script(source, name, referrerName, address);
      callback(codeUnit.result);
    } catch (ex) {
      errback(ex);
    }
  }

}

export {LoaderHooks};

export var internals = {
  CodeUnit,
  EvalCodeUnit,
  Loader,
  LoadCodeUnit,
  LoaderHooks
};
