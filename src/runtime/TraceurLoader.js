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
import {Loader} from '../runtime/Loader';

export class TraceurLoader extends Loader {

  /**
   * @param {!Object=} loaderHooks
   */
  constructor(loaderHooks) {
    super(loaderHooks);
  }

  /**
   * See https://github.com/jorendorff/js-loaders/issues/92
   * loadAsScript - Asynchronously load and run a script. If the script
   * calls Loader.import(),  this can cause modules to be loaded, linked,
   * and evaluated.
   *
   * This function is the same as import(), with one exception: the text of
   * the initial load is parsed to goal 'Script' rather than 'Module'
   *
   * On success, pass the result of evaluating the script to the success
   * callback.
   * @param {string} name, ModuleSpecifier-like name, not normalized.
   */
  loadAsScript(name,
       {referrerName, address} = {},
       callback = (result) => {},
       errback = (ex) => { throw ex; }) {
    var codeUnit = this.internalLoader_.load(name, referrerName,
        address, 'script');
    codeUnit.addListener(function(result) {
      callback(result);
    }, errback);
  }

  /**
   * script - Evaluate the source as a 'script'. Same as function module(),
   * but the source is parsed as 'script' rather than 'module'.
   *
   * This function is similar to built-in eval() except that all the Loader
   * callbacks, eg translate() are applied before evaluation.
   *
   * src may import modules, but if it directly or indirectly imports a module
   * that is not already loaded, a SyntaxError is thrown.
   *
   * @param {string} source The source code to eval.
   * @param {string} name name for the script
   * @return {*} The completion value of evaluating the code.
   */
  script(source, name,
      {referrerName, address} = {},
      callback = (result) => {},
      errback = (ex) => { throw ex; }) {
    try {
      var codeUnit =
          this.internalLoader_.script(source, name, referrerName, address);
      callback(codeUnit.result);
    } catch (ex) {
      errback(ex);
    }
  }
}