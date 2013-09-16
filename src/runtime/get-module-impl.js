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

  var resolveUrl = global.$__traceurUrl.resolveUrl;

  var modules = Object.create(null);

  var standardModuleUrlRegExp = /^@\w+$/;

  /**
   * This is used to find the module for a require url ModuleSpecifier.
   * @param {string} url
   * @return {Object} A module instance object for the given url in the current
   *     code loader.
   */
  function getModuleInstanceByUrl(name) {
    if (standardModuleUrlRegExp.test(name))
      return $traceurRuntime.modules[name] || null;

    var url = resolveUrl(currentUrl, name);

    var module = modules[url];
    if (module instanceof PendingModule)
      return modules[url] = module.toModule();
    return module;
  }

  var currentUrl = './';

  function setCurrentUrl(url) {
    currentUrl = url || './';
  }

  function getCurrentUrl() {
    return currentUrl;
  }

  class PendingModule {
    constructor(name, func, self) {
      this.name = name;
      this.func = func;
      this.self = self;
    }
    toModule() {
      var oldName = currentUrl;
      currentUrl = this.name;
      try {
        return this.func.call(this.self);
      } finally {
        currentUrl = oldName
      }
    }
  }

  function registerModule(name, func, self) {
    var url = resolveUrl(currentUrl, name);
    modules[url] = new PendingModule(name, func, self);
  }

  var $traceurModules = global.$traceurModules = {
    getCurrentUrl,
    getModuleInstanceByUrl,
    registerModule,
    setCurrentUrl,
    standardModuleUrlRegExp,
  };

})(typeof global !== 'undefined' ? global : this);
