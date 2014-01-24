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

import {InternalLoader} from '../runtime/InternalLoader';

export class Loader {
  /**
   * ES6 Loader Constructor
   * @param {!Object=} options
   */
  constructor(loaderHooks) {
    this.internalLoader_ = new InternalLoader(loaderHooks);
    this.loaderHooks_ = loaderHooks;
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
    codeUnit.addListener(function() {
      callback(System.get(codeUnit.normalizedName));
    }, errback);
    this.internalLoader_.handleCodeUnitLoaded(codeUnit);
  }

  get(normalizedName) {
    return this.loaderHooks_.get(normalizedName);
  }

  set(normalizedName, module) {
    this.loaderHooks_.set(normalizedName, module);
  }

  normalize(name, referrerName, referrerAddress) {
    return this.loaderHooks_.normalize(name, referrerName, referrerAddress);
  }
}

export {LoaderHooks};

