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
System.set('@traceur/module', (function(global) {
  'use strict';

  var {ModuleImpl} = System.get('@traceur/module');

  var {
    canonicalizeUrl,
    resolveUrl,
    isAbsolute,
    isStandardModuleUrl
  } = System.get('@traceur/url');

  var moduleImplementations = Object.create(null);

  // Until ecmascript defines System.normalize/resolve we follow requirejs
  // for module ids, http://requirejs.org/docs/api.html
  // "default baseURL is the directory that contains the HTML page"
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';

  function registerModule(url, func, self) {
    url = System.normalResolve(url);
    moduleImplementations[url] = new ModuleImpl(url, func, self);

  }

  Object.defineProperty(System, 'baseURL', {
    get: function() {
      return baseURL;
    },
    set: function(v) {
      baseURL = String(v);
    },
    enumerable: true,
    configurable: true
  });

  System.normalize = function(name, refererName, refererAddress) {
    if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
    if (isStandardModuleUrl(name))
      return name;
    if (isAbsolute(name))
      return canonicalizeUrl(name);
    if(/[^\.]\/\.\.\//.test(name)) {
      throw new Error('module name embeds /../: ' + name);
    }
    if (refererName)
      return resolveUrl(refererName, name);
    return canonicalizeUrl(name);
  };

  System.locate = function(load) {
    var normalizedModuleName = load.name;
    if (isStandardModuleUrl(normalizedModuleName))
      return normalizedModuleName;
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
  };

  // Now it is safe to override System.{get,set} to use resolveUrl.
  var $get = System.get;
  var $set = System.set;

  // Non-standard API, remove see issue #393
  System.normalResolve = function(name, refererName) {
    if (/@.*\.js/.test(name))
      throw new Error(`System.normalResolve illegal standard module name ${name}`);
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
  };

  function getModuleImpl(name) {
    if (!name)
      return;
    if (isStandardModuleUrl(name))
      return {url: name, value: $get(name)};
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

  System.get = function(name) {
    var m = getModuleImpl(name);
    if (!m)
      return undefined;
    var moduleInstance = moduleInstances[m.url];
    if (moduleInstance)
      return moduleInstance;

    moduleInstance = new Module(m.value, liveModuleSentinel);
    return moduleInstances[m.url] = moduleInstance;
  };

  System.set = function(name, object) {
    name = String(name);
    if (isStandardModuleUrl(name)) {
      $set(name, object);
    } else {
      moduleImplementations[name] = {
        url: name,
        value: object
      };
    }
  };

  return {
    registerModule,
    getModuleImpl(name) {
      return getModuleImpl(name).value;
    }
  };
})(this));
