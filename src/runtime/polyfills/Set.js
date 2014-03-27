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

import {Map} from './Map';

var global = this;

export class Set {
  constructor(iterable, allowNonExtensibleObjects = false) {
    this.map_ = new Map();
    this.allowNonExtensibleObjects = allowNonExtensibleObjects;
    if (iterable) {
      for (var value of iterable) {
        this.add(value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.map_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.map_.allowNonExtensibleObjects = v;
  }
  
  get size() {
    return this.map_.size;
  }


  add(value) {
    this.map_.set(value, value);
  }
  
  has(value) {
    return this.map_.has(value);
  }
  
  delete(value) {
    this.map_.delete(value);
  }
  
  clear() {
    this.map_.clear();
  }
  
  entries() {
    return this.map_.entries();
  }
  
  values() {
    return (function* () {
      for (var [key, value] of this.entries()) {
        yield value;
      }
    }).call(this);
  }
  
  keys() {
    return (function* () {
      for (var [key, value] of this.entries()) {
        yield key;
      }
    }).call(this);
  }
  
  forEach(callbackFn, thisArg) {
    for (var [key, value] of this.entries()) {
      callbackFn.call(global, key, value, this);
    }
  }
  
  [Symbol.iterator]() {
    return this.keys();
  }
}
