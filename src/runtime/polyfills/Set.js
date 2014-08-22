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
  isObject,
  maybeAddIterator,
  registerPolyfill
} from './utils'
import {Map} from './Map'

var getOwnHashObject = $traceurRuntime.getOwnHashObject;
var $hasOwnProperty = Object.prototype.hasOwnProperty;

function initSet(set) {
  set.map_ = new Map();
}

export class Set {
  constructor(iterable = undefined) {
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');

    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }

    initSet(this);

    if (iterable !== null && iterable !== undefined) {
      for (var item of iterable) {
        this.add(item);
      }
    }
  }

  get size() {
    return this.map_.size;
  }

  has(key) {
    return this.map_.has(key);
  }

  add(key) {
    this.map_.set(key, key);

    return this; // 23.2.3.1
  }

  delete(key) {
    return this.map_.delete(key);
  }

  clear() {
    return this.map_.clear();
  }

  forEach(callbackFn, thisArg = undefined) {
    return this.map_.forEach((value, key) => {
      callbackFn.call(thisArg, key, key, this);
    });
  }

  *values() {
    yield* this.map_.keys();
  }

  *entries() {
    yield* this.map_.entries();
  }
}

Object.defineProperty(Set.prototype, Symbol.iterator, {
  configurable: true,
  writable: true,
  value: Set.prototype.values
});

Object.defineProperty(Set.prototype, 'keys', {
  configurable: true,
  writable: true,
  value: Set.prototype.values
});

export function polyfillSet(global) {
  var {Object, Symbol} = global;
  if (!global.Set)
    global.Set = Set;
  var setPrototype = global.Set.prototype;
  if (setPrototype.values) {
    maybeAddIterator(setPrototype, setPrototype.values, Symbol);
    maybeAddIterator(Object.getPrototypeOf(new global.Set().values()),
        function() { return this; }, Symbol);
  }
}

registerPolyfill(polyfillSet);
