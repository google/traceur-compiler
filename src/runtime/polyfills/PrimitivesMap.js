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

var global = this;

function primitiveHash(p) {
  return (typeof p) + ' ' + p;
}

export class PrimitivesMap {
  constructor() {
    this.primitivesMap_ = {};
    this.primitivesSize_ = 0;
  }
  
  get size() {
    return this.primitivesSize_;
  }

  get(key, defaultValue) {
    var h = primitiveHash(key);
    if (this.primitivesMap_.hasOwnProperty(h))
      return this.primitivesMap_[h][1];
    else 
      return defaultValue;
  }

  set(key, value) {
    var h = primitiveHash(key);
    if (!this.primitivesMap_.hasOwnProperty(h)) {
      this.primitivesSize_++;
    }
    this.primitivesMap_[h] = [key, value];
  }
  
  has(key) {
    var h = primitiveHash(key);
    return this.primitivesMap_.hasOwnProperty(h);
  }
  
  delete(key) {
    var h = primitiveHash(key);
    if (this.primitivesMap_.hasOwnProperty(h)) {
      this.primitivesSize_--;
    }
    delete this.primitivesMap_[h];
  }
  
  clear() {
    this.primitivesMap_ = {};
    this.primitivesSize_ = 0;
  }
  
  entries() {
    return (function* () {
      for (var i in this.primitivesMap_) {
        yield this.primitivesMap_[i];
      }
    }).call(this);
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
    return this.entries();
  }
}
