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

import {InternalLoader} from './InternalLoader';

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
   * dependencies it imports.
   * @param {string} name, ModuleSpecifier-like name, not normalized.
   * @return {Promise.<Module>}
   */
  import(name, {referrerName, address} = {}) {
    return this.internalLoader_.load(name, referrerName, address, 'module').
        then((codeUnit) => this.get(codeUnit.normalizedName));
  }

  /**
   * module - Asynchronously run the script src, first loading any imported
   * modules that aren't already loaded.
   *
   * This is the same as import but without fetching the source.
   * @param {string} source code
   * @param {Object} properties referrerName and address passed to normalize.
   * @return {Promise.<Module>}
   */
  module(source, {referrerName, address} = {}) {
    return this.internalLoader_.module(source, referrerName, address);
  }

  /**
   * Asynchronously install a new module under `name` from the `source` code.
   * All dependencies are installed in the registry.
   * @param {string} normalizedName
   * @param {string} source, module code
   * @param {Object|undefined} May contain .address and .metadata. Pass to hooks
   * @return {Promise} fulfilled with undefined.
   */
  define(normalizedName, source, {address, metadata} = {}) {
    return this.internalLoader_.define(normalizedName, source, address,
                                       metadata);
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

  locate(load) {
    return this.loaderHooks_.locate(load);
  }

  fetch(load) {
    return this.loaderHooks_.fetch(load);
  }

  translate(load) {
    return this.loaderHooks_.translate(load);
  }

  instantiate(load) {
    return this.loaderHooks_.instantiate(load);
  }
}

export {LoaderHooks};

