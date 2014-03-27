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

import {HashMap} from './HashMap';
import {PrimitivesMap} from './PrimitivesMap';

var global = this;

export class Map {
  constructor(iterable) {
    this.hashmap_ = new HashMap();
    this.primitivesmap_ = new PrimitivesMap();
    if (iterable) {
      for (var [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.hashmap_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.hashmap_.allowNonExtensibleObjects = v;
  }
  
  get size() {
    return this.hashmap_.size + this.primitivesmap_.size;
  }

  get(key, defaultValue) {
    if (key instanceof Object)
      return this.hashmap_.get(key, [null, defaultValue])[1];
    else {
      return this.primitivesmap_.get(key, defaultValue);
    }
  }

  set(key, value) {
    if (key instanceof Object)
      this.hashmap_.set(key, [key, value]);
    else {
      this.primitivesmap_.set(key, value);
    }
  }
  
  has(key) {
    if (key instanceof Object)
      return this.hashmap_.has(key);
    else {
      return this.primitivesmap_.has(key);
    }
  }
  
  delete(key) {
    if (key instanceof Object)
      this.hashmap_.delete(key);
    else {
      this.primitivesmap_.delete(key);
    }
    
  }
  
  clear() {
    this.hashmap_.clear();
    this.primitivesmap_.clear();
  }
  
  entries() {
    return (function* () {
      var vals = this.hashmap_.values();
      for (var entry of vals) {
        yield entry;
      }
      for (var entry of this.primitivesmap_) {
        yield entry;
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
