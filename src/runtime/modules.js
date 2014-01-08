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

  var moduleInstantiators = Object.create(null);

  // Until ecmascript defines System.normalize/resolve we follow requirejs
  // for module ids, http://requirejs.org/docs/api.html
  // "default baseURL is the directory that contains the HTML page"
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';

  class UncoatedModuleEntry {
    constructor(url, uncoatedModule) {
      this.url = url;
      this.value_ = uncoatedModule;
    }
  }

  class UncoatedModuleInstantiator extends UncoatedModuleEntry {
    constructor(url, func) {
      super(url, null);
      this.func = func;
    }

    getUncoatedModule() {
      if (this.value_)
        return this.value_;
      return this.value_ = this.func.call(global);
    }
  }

  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = System.normalize(name);
    return moduleInstantiators[url];
  };

  var moduleInstances = Object.create(null);

  var liveModuleSentinel = {};

  function Module(uncoatedModule, isLive = undefined) {
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((name) => {
      var getter, value;
      // Module instances acquired using `module m from 'name'` should have live
      // references so when we create these internally we pass a sentinel.
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        // Some internal modules do not use getters at this point.
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }

      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    });
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }

  var System = {

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

    get(name) {

      var m = getUncoatedModuleInstantiator(name);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;

      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },

    set(name, uncoatedModule) {
      name = String(name);
      moduleInstantiators[name] = new UncoatedModuleEntry(name, uncoatedModule);
    },

    get baseURL() {
      return baseURL;
    },

    set baseURL(v) {
      baseURL = String(v);
    },

    // -- Non standard extensions to System.

    registerModule(name, func) {
      var normalizedName = System.normalize(name);
      moduleInstantiators[normalizedName] =
          new UncoatedModuleInstantiator(normalizedName, func);
    }

  };

  // Override setupGlobals so that System is added to future globals.
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  global.System = System;

  // TODO(jjb): remove
  $traceurRuntime.registerModule = System.registerModule;
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };

})(typeof global !== 'undefined' ? global : this);
