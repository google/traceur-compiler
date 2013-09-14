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

// Parts of this file is taken from:
// https://github.com/ModuleLoader/es6-module-loader/blob/master/lib/es6-module-loader.js
// Licensed under the MIT license.

import {
  canonicalizeUrl,
  isAbsoluteUrl,
  resolveUrl,
} from './url.js';

var jsFileRe = /\.js^/;

export class Loader {

  /**
   * @param {string} name
   * @param {string=} referer URL of the script doing the request.
   * @return {string}}
   */
  normalize(name, referer = null) {
    if (isAbsoluteUrl(name))
      return canonicalizeUrl(name);
    if (jsFileRe.test(name))
      name = name.slice(0, -3);
    if (name[0] === '.') {
      return referer ? resolveUrl(referer, name) : name;
    }
    return name;
  }

  /**
   * @param {string} normalized
   * @return {string}
   */
  resolve(normalized) {
    if (isAbsoluteUrl(normalized))
      return normalized;
    return resolveUrl(this.baseURL, normalized +'.js');
  }
}