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

  var {resolveUrl, isStandardModuleUrl} = System.get('@traceur/url');

  var modules = Object.create(null);

  var refererUrl = './';

  function setRefererUrl(url) {
    refererUrl = url || './';
  }

  function getRefererUrl() {
    return refererUrl;
  }

  // Until ecmascript defines System.normalize/resolve we follow requirejs
  // for module ids, http://requirejs.org/docs/api.html
  // "default baseUrl is the directory that contains the HTML page"
  var baseUrl;
  if (global.location && global.location.href)
    baseUrl = resolveUrl(global.location.href, './');
  else
    baseUrl = '';

  class PendingModule {
    constructor(url, func, self) {
      this.url = url;
      this.func = func;
      this.self = self;
    }
    toModule() {
      var oldUrl = refererUrl;
      refererUrl = this.url;
      try {
        return this.func.call(this.self);
      } finally {
        refererUrl = oldUrl;
      }
    }
  }

  function registerModule(url, func, self) {
    modules[url] = new PendingModule(url, func, self);
  }

  System.normalize = function(requestedModuleName, options) {
    var importingModuleName = options && options.referer && options.referer.name;
    importingModuleName = importingModuleName || refererUrl;
    if (importingModuleName && requestedModuleName)
      return resolveUrl(importingModuleName, requestedModuleName);
    return requestedModuleName;
  }

  System.resolve = function(normalizedModuleName, opt_referer, opt_any) {
    if (isStandardModuleUrl(normalizedModuleName))
      return normalizedModuleName;
    var asJS = normalizedModuleName + '.js';
    // ----- Hack for self-hosting compiler -----
    if (/\.js$/.test(normalizedModuleName))
      asJS = normalizedModuleName;
    // ----------------------------------------------------
    if (baseUrl)
      return resolveUrl(baseUrl, asJS);
    return asJS;
  }

  // Now it is safe to override System.{get,set} to use resolveUrl.
  var $get = System.get;
  var $set = System.set;

  // Non-standard API, remove see issue #393
  System.normalResolve = function(name, importingModuleName) {
    if (/@.*\.js/.test(name))
      throw new Error(`System.normalResolve illegal standard module name ${name}`);
    var options = {
      referer: {
        name: importingModuleName || refererUrl
      }
    };
    return System.resolve(System.normalize(name, options));
  }

  System.get = function(name) {
    if (!name)
      return;
    if (isStandardModuleUrl(name))
      return $get(name);
    var url = System.normalResolve(name);
    var module = modules[url];
    if (module instanceof PendingModule)
      return modules[url] = module.toModule();
    return module;
  };

  System.set = function(name, object) {
    if (!name)
      return;
    if (isStandardModuleUrl(name)) {
      $set(name, object);
    } else {
      var url = System.normalResolve(name);
      if (url)
        modules[url] = object;
    }
  };

  return {
    getRefererUrl,
    registerModule,
    setRefererUrl,
  };
})(this));