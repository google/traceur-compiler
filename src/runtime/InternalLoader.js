// Copyright 2014 Traceur Authors.
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

var NOT_STARTED = 0;
var LOADING = 1;
var LOADED = 2;
var PARSED = 3;
var TRANSFORMING = 4
var TRANSFORMED = 5;
var COMPLETE = 6;
var ERROR = 7;

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
    this.name_ = name;
    this.referrerName_ = referrerName;
    this.address_ = address;
    this.uid = getUid();
    this.state_ = state || NOT_STARTED;
    this.error = null;
    this.result = null;
    this.data_ = {};
    this.dependencies = [];
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

  normalizesTo() {
    return 'Normalizes to ' + this.normalizedName + '\n';
  }

  /**
   * Adds callback for COMPLETE and ERROR.
   */
  addListener(callback, errback) {
    if (!this.listeners) {
      this.listeners = [];
    }
    this.listeners.push(callback, errback);
    if (this.state >= COMPLETE) {
      this.dispatchComplete(this.result);
    }
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
 * CodeUnit coming from {@code Loader.set}.
 */
class PreCompiledCodeUnit extends CodeUnit {
  constructor(loaderHooks, normalizedName, name, referrerName, address,
      module) {
    super(loaderHooks, normalizedName, 'module', COMPLETE,
        name, referrerName, address);
    this.result = module;
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
  constructor(loaderHooks, code, type = 'script',
      normalizedName, referrerName, address) {
    super(loaderHooks, normalizedName, type,
      LOADED, null, referrerName, address);
    this.text = code;
  }
}

/**
 * The internal implementation of the code loader.
 */
export class InternalLoader {
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

  module(code, referrerName, address) {
    var codeUnit = new EvalCodeUnit(this.loaderHooks, code, 'module',
                                      null, referrerName, address);
    this.cache.set({}, codeUnit);
    return codeUnit;
  }

  define(normalizedName, code, address, metadata) {
    var codeUnit = new EvalCodeUnit(this.loaderHooks, code, 'module',
                                    normalizedName, null, address);
    if (metadata) {
      Object.getOwnPropertyNames(metadata).forEach(function(prop) {
        codeUnit.metadata[prop] = metadata[prop];
      });
    }
    var key = this.getKey(normalizedName, 'module');

    this.cache.set(key, codeUnit);
    return codeUnit;
  }

  /**
   * @param {string} code, source to be compiled as 'Script'
   * @param {string} name,  ModuleSpecifier-like name, not normalized.
   */
  script(code, referrerName, address) {
    var codeUnit = new EvalCodeUnit(this.loaderHooks, code, 'script',
                                    null, referrerName, address);
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
      var module = this.loaderHooks.get(normalizedName);
      if (module) {
        cacheObject = new PreCompiledCodeUnit(this.loaderHooks, normalizedName,
            name, referrerName, address, module);
        cacheObject.type = 'module';
      } else {
        cacheObject = new LoadCodeUnit(this.loaderHooks, normalizedName,
            name, referrerName, address);
        cacheObject.type = type;
      }
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
      codeUnit.dispatchError(codeUnit.error || 'Error in dependency');
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

export var internals = {
  CodeUnit,
  EvalCodeUnit,
  LoadCodeUnit,
  LoaderHooks
};
