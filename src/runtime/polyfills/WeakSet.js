// Copyright 2015 Traceur Authors.
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
  deleteFrozen,
  getFrozen,
  setFrozen,
} from '../frozen-data.js';
import {
  isObject,
  registerPolyfill
} from './utils.js'

const {defineProperty, isExtensible} = Object;
const {hasNativeSymbol, newUniqueString} = $traceurRuntime;
const $TypeError = TypeError;
const {hasOwnProperty} = Object.prototype;

export class WeakSet {
  constructor() {
    this.name_ = newUniqueString();
    this.frozenData_ = [];
  }

  add(value) {
    if (!isObject(value)) throw new $TypeError('value must be an object');
    if (!isExtensible(value)) {
      setFrozen(this.frozenData_, value, value);
    } else {
      defineProperty(value, this.name_, {
        configurable: true,
        value: true,
        writable: true,
      });
    }
    return this;
  }

  delete(value) {
    if (!isObject(value)) return false;
    if (!isExtensible(value)) {
      return deleteFrozen(this.frozenData_, value);
    }
    return hasOwnProperty.call(value, this.name_) && delete value[this.name_];
  }

  has(value) {
    if (!isObject(value)) return false;
    if (!isExtensible(value)) {
      return getFrozen(this.frozenData_, value) === value;
    }
    return hasOwnProperty.call(value, this.name_);
  }
}

function needsPolyfill(global) {
  let {WeakSet, Symbol} = global;
  if (!WeakSet || !hasNativeSymbol()) {
    return true;
  }
  try {
    let o = {};
    let wm = new WeakSet([[o]]);
    return !wm.has(o);
  } catch (e) {
    return false;
  }
}

export function polyfillWeakSet(global) {
  if (needsPolyfill(global)) {
    global.WeakSet = WeakSet;
  }
}

registerPolyfill(polyfillWeakSet);
