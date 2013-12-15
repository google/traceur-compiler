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
(function(global) {
  'use strict';

  var {
    canonicalizeUrl,
    resolveUrl,
    isAbsolute,
  } = $traceurRuntime;

  var moduleImplementations = Object.create(null);

  // Until ecmascript defines System.normalize/resolve we follow requirejs
  // for module ids, http://requirejs.org/docs/api.html
  // "default baseURL is the directory that contains the HTML page"
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';

  class ModuleImpl {
    constructor(url, func, self) {
      this.url = url;
      this.func = func;
      this.self = self;
      this.value_ = null;
    }

    get value() {
      if (this.value_)
        return this.value_;
      return this.value_ = this.func.call(this.self);
    }
  }

  function registerModule(url, func, self) {
    url = System.normalResolve(url);
    moduleImplementations[url] = new ModuleImpl(url, func, self);
  }

  function getModuleImpl(name) {
    if (!name)
      return;
    var url = System.normalResolve(name);
    return moduleImplementations[url];
  };

  var moduleInstances = Object.create(null);

  var liveModuleSentinel = {};

  function Module(obj, isLive = undefined) {
    // Module instances acquired using `module m from 'name'` should have live
    // references so when we create these internally we pass a sentinel.
    Object.getOwnPropertyNames(obj).forEach((name) => {
      var getter, value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(obj, name);
        // Some internal modules do not use getters at this point.
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = obj[name];
        getter = function() {
          return value;
        };
      }

      Object.defineProperty(this, name, {
        get: getter,
        enumerable: true
      });
    });
    this.__proto__ = null;
    Object.preventExtensions(this);
  }

  var System = {
    get baseURL() {
      return baseURL;
    },

    set baseURL(v) {
      baseURL = String(v);
    },

    normalize(name, refererName, refererAddress) {
      if (typeof name !== "string")
          throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if(/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },

    locate(load) {
      var normalizedModuleName = load.name;
      if (isAbsolute(normalizedModuleName))
        return normalizedModuleName;
      var asJS = normalizedModuleName + '.js';
      // ----- Hack for self-hosting compiler -----
      if (/\.js$/.test(normalizedModuleName))
        asJS = normalizedModuleName;
      // ------------------------------------------
      var baseURL = load.metadata && load.metadata.baseURL;
      if (baseURL)
        return resolveUrl(baseURL, asJS);
      return asJS;
    },

    // Non-standard API, remove see issue #393
    normalResolve(name, refererName) {
      var options = {
        baseURL: baseURL
      };
      if (isAbsolute(refererName)) {
        options.baseURL = refererName;
        refererName = undefined;
      }

      var load = {
        name: System.normalize(name, refererName),
        metadata: options
      }
      return System.locate(load);
    },

    get(name) {
      var m = getModuleImpl(name);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;

      moduleInstance = new Module(m.value, liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },

    set(name, object) {
      name = String(name);
      moduleImplementations[name] = {
        url: name,
        value: object
      };
    }
  };

  // Override setupGlobals so that System is added to future globals.
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  global.System = System;

  $traceurRuntime.registerModule = registerModule;
  $traceurRuntime.getModuleImpl = function(name) {
    return getModuleImpl(name).value;
  };

})(typeof global !== 'undefined' ? global : this);
