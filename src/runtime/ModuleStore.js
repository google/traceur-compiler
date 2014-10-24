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

  class ModuleEvaluationError extends Error {

    constructor(erroneousModuleName, cause) {
      this.message =
          this.constructor.name + ': ' + this.stripCause(cause) +
          ' in ' + erroneousModuleName;

      if (!(cause instanceof ModuleEvaluationError) && cause.stack)
        this.stack = this.stripStack(cause.stack);
      else
        this.stack = '';
    }

    stripError(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    }

    stripCause(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    }

    loadedBy(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    }

    stripStack(causeStack) {
      var stack = [];
      causeStack.split('\n').some((frame) => {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      });
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
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
      try {
        return this.value_ = this.func.call(global);
      } catch(ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }
  }

  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  };

  var moduleInstances = Object.create(null);

  var liveModuleSentinel = {};

  function Module(uncoatedModule, isLive = undefined) {
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((name) => {
      var getter, value;
      // Module instances acquired using `import * as m from 'name'` should have
      // live references so when we create these internally we pass a sentinel.
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

  var ModuleStore = {

    normalize(name, refererName, refererAddress) {
      if (typeof name !== "string")
          throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if(/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },

    get(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;

      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },

    set(normalizedName, module) {
      normalizedName = String(normalizedName);  // Req. by spec., why?
      moduleInstantiators[normalizedName] =
          new UncoatedModuleInstantiator(normalizedName, () => module);
      moduleInstances[normalizedName] = module;
    },

    get baseURL() {
      return baseURL;
    },

    set baseURL(v) {
      baseURL = String(v);
    },

    // -- Non standard extensions to ModuleStore.

    registerModule(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] =
          new UncoatedModuleInstantiator(normalizedName, func);
    },

    bundleStore: Object.create(null),

    register(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        // Traceur System.register
        this.registerModule(name, func);
      } else {
        // System.register instantiate form
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var depMap = {};
            deps.forEach((dep, index) => depMap[dep] = arguments[index]);

            // TODO: separate into two-phase declaration / execution
            var registryEntry = func.call(this, depMap);

            registryEntry.execute.call(this);

            return registryEntry.exports;
          }
        };
      }
    },

    getAnonymousModule(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },

    /**
     *  A 'backdoor' access function for traceur's own modules. Our
     * modules are stored under names like 'traceur@0.0.n/<path>',
     * where n varies with every commit to master. Rather than send
     * the verion number to every test, we allow tests to call this
     * function with just th <path> part of the name.
    **/
    getForTesting(name) {
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some( (key) => {
          // Extract the version-dependent prefix from the first traceur
          // module matching our naming convention.
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            this.testingPrefix_ = m[1];
            return true;
          }
        });
      }
      return this.get(this.testingPrefix_ + name);
    }

  };


  ModuleStore.set('@traceur/src/runtime/ModuleStore',
      new Module({ModuleStore: ModuleStore}));

  // Override setupGlobals so that System is added to future globals.
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;

  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize,
  };

  // TODO(jjb): remove after next npm release
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };

})(typeof global !== 'undefined' ? global : this);
