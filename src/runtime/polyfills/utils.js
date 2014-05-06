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

export var toObject = $traceurRuntime.toObject;

export function toUint32(x) {
  return x | 0;
}

export function isObject(x) {
  return x && (typeof x === 'object' || typeof x === 'function');
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
export function isCallable(x) {
    return isObject(x) && (Object.prototype.toString.call(x.call) === '[object Function]');
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
export function toLength(num) {
    var len = parseInt(num, 10);
    return len < 0 ? 0 : Math.min(len, Math.pow(2, 53) - 1);
}
