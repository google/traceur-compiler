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

var $ceil = Math.ceil;
var $floor = Math.floor;
var $isFinite = isFinite;
var $isNaN = isNaN;
var $pow = Math.pow;
var $min = Math.min;

export var toObject = $traceurRuntime.toObject;

export function toUint32(x) {
  return x >>> 0;
}

export function isObject(x) {
  return x && (typeof x === 'object' || typeof x === 'function');
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
export function isCallable(x) {
  return typeof x === 'function';
}

export function isNumber(x) {
  return typeof x === 'number';
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
export function toInteger(x) {
  x = +x;
  if ($isNaN(x)) return 0;
  if (x === 0 || !$isFinite(x)) return x;
  return x > 0 ? $floor(x) : $ceil(x);
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
var MAX_SAFE_LENGTH = $pow(2, 53) - 1;

export function toLength(x) {
  var len = toInteger(x);
  return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-checkiterable
export function checkIterable(x) {
  return !isObject(x) ? undefined : x[Symbol.iterator];
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
export function isConstructor(x) {
  return isCallable(x);
}
