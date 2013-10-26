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

System.set('@traceur/module', (function() {
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

  // Now it is safe to override System.{get,set} to use resolveUrl.
  var $get = System.get;
  var $set = System.set;

  System.get = function(name) {
    if (isStandardModuleUrl(name))
      return $get(name);

    var url = resolveUrl(refererUrl, name);
    var module = modules[url];
    if (module instanceof PendingModule)
      return modules[url] = module.toModule();
    return module;
  };

  System.set = function(name, object) {
    if (isStandardModuleUrl(name))
      $set(name, object);
    else
      modules[resolveUrl(refererUrl, name)] = object;
  };

  return {
    getRefererUrl,
    registerModule,
    setRefererUrl,
  };
})());
