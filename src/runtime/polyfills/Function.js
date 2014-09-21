// Copyright 2014 Traceur Authors.
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

import {
  registerPolyfill
} from './utils';

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-name
var fnNameExp = /function ([^\(]+)/;

export function getFunctionName(fn) {
    var matchResults = fnNameExp.exec(fn.toString());
    if (matchResults)
        return matchResults[1];
    else
        return undefined;
}

export function polyfillFunction(global) {
  var {Function} = global;
  if (Function.prototype.name === undefined) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function(){ return getFunctionName(this); },
        configurable: false,
        enumerable: false
    });
  }
}

registerPolyfill(polyfillFunction);