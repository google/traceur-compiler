/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1(the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is GCLI.
 *
 * The Initial Developer of the Original Code is
 * The Mozilla Foundation
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Joe Walker <jwalker@mozilla.com> (Original Author)
 *   Nick Fitzgerald <nfitzgerald@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Define a module along with a payload.
 * @param {string} moduleName Name for the payload
 * @param {ignored} deps Ignored. For compatibility with CommonJS AMD Spec
 * @param {function} payload Function with (require, exports, module) params
 */
function define(moduleName, deps, payload) {
  if (typeof moduleName != "string") {
    throw new TypeError('Expected string, got: ' + moduleName);
  }

  if (arguments.length == 2) {
    payload = deps;
  }

  if (moduleName in define.modules) {
    throw new Error("Module already defined: " + moduleName);
  }
  define.modules[moduleName] = payload;
};

/**
 * The global store of un-instantiated modules
 */
define.modules = {};


/**
 * We invoke require() in the context of a Domain so we can have multiple
 * sets of modules running separate from each other.
 * This contrasts with JSMs which are singletons, Domains allows us to
 * optionally load a CommonJS module twice with separate data each time.
 * Perhaps you want 2 command lines with a different set of commands in each,
 * for example.
 */
function Domain() {
  this.modules = {};
  this._currentModule = null;
}

(function () {

  /**
   * Lookup module names and resolve them by calling the definition function if
   * needed.
   * There are 2 ways to call this, either with an array of dependencies and a
   * callback to call when the dependencies are found (which can happen
   * asynchronously in an in-page context) or with a single string an no callback
   * where the dependency is resolved synchronously and returned.
   * The API is designed to be compatible with the CommonJS AMD spec and
   * RequireJS.
   * @param {string[]|string} deps A name, or names for the payload
   * @param {function|undefined} callback Function to call when the dependencies
   * are resolved
   * @return {undefined|object} The module required or undefined for
   * array/callback method
   */
  Domain.prototype.require = function(deps, callback) {
    if (Array.isArray(deps)) {
      var params = deps.map(function(dep) {
        return this.lookup(dep);
      }, this);
      if (callback) {
        callback.apply(null, params);
      }
      return undefined;
    }
    else {
      return this.lookup(deps);
    }
  };

  function normalize(path) {
    var bits = path.split('/');
    var i = 1;
    while (i < bits.length) {
      if (bits[i] === '..') {
        bits.splice(i-1, 1);
      } else if (bits[i] === '.') {
        bits.splice(i, 1);
      } else {
        i++;
      }
    }
    return bits.join('/');
  }

  function join(a, b) {
    a = a.trim();
    b = b.trim();
    if (/^\//.test(b)) {
      return b;
    } else {
      return a.replace(/\/*$/, '/') + b;
    }
  }

  function dirname(path) {
    var bits = path.split('/');
    bits.pop();
    return bits.join('/');
  }

  /**
   * Lookup module names and resolve them by calling the definition function if
   * needed.
   * @param {string} moduleName A name for the payload to lookup
   * @return {object} The module specified by aModuleName or null if not found.
   */
  Domain.prototype.lookup = function(moduleName) {
    if (/^\./.test(moduleName)) {
      moduleName = normalize(join(dirname(this._currentModule), moduleName));
    }

    if (moduleName in this.modules) {
      var module = this.modules[moduleName];
      return module;
    }

    if (!(moduleName in define.modules)) {
      throw new Error("Module not defined: " + moduleName);
    }

    var module = define.modules[moduleName];

    if (typeof module == "function") {
      var exports = {};
      var previousModule = this._currentModule;
      this._currentModule = moduleName;
      module(this.require.bind(this), exports, { id: moduleName, uri: "" });
      this._currentModule = previousModule;
      module = exports;
    }

    // cache the resulting module object for next time
    this.modules[moduleName] = module;

    return module;
  };

}());

define.Domain = Domain;
define.globalDomain = new Domain();
var require = define.globalDomain.require.bind(define.globalDomain);
