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

import {isObject} from './utils'
import {HashMap} from './HashMap';
import {PrimitivesMap} from './PrimitivesMap';

var global = this;

var deletedSentinel = {};

export class Map {
  constructor(iterable) {
    this.entries_ = []; // every odd index is key, every even index is value
    this.objectIndex_ = new HashMap();
    this.primitiveIndex_ = new PrimitivesMap();
    if (iterable) {
      for (var [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.objectIndex_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.objectIndex_.allowNonExtensibleObjects = v;
  }
  
  get size() {
    return this.objectIndex_.size + this.primitiveIndex_.size;
  }

  get(key, defaultValue) {
    var index;
    if (isObject(key))
      index = this.objectIndex_.get(key, -1);
    else
      index = this.primitiveIndex_.get(key, -1);
    
    if (index !== -1) 
      return this.entries_[index+1];
      
    return defaultValue;
  }

  set(key, value) {
    var objectMode = isObject(key);
    var index;
    
    if (objectMode)
      index = this.objectIndex_.get(key, -1);
    else
      index = this.primitiveIndex_.get(key, -1);
    
    if (index !== -1) {
      this.entries_[index+1] = value;
    } else {
      index = this.entries_.length;
      this.entries_[index] = key;
      this.entries_[index+1] = value;
      
      if (objectMode)
        this.objectIndex_.set(key, index);
      else
        this.primitiveIndex_.set(key, index);
    }
  }
  
  has(key) {
    var objectMode = isObject(key);
    
    if (objectMode)
      return this.objectIndex_.has(key);
    
    return this.primitiveIndex_.has(key);
  }
  
  delete(key) {
    var objectMode = isObject(key);
    var index;
    
    if (objectMode) {
      index = this.objectIndex_.get(key, -1);
      this.objectIndex_.delete(key);
    } else {
      index = this.primitiveIndex_.get(key, -1);
      this.primitiveIndex_.delete(key);
    }
    
    if (index !== -1) {
      this.entries_[index] = deletedSentinel;
      // remove possible reference to value to avoid memory leaks
      this.entries_[index+1] = undefined;
    }
  }
  
  clear() {
    this.entries_ = [];
    this.objectIndex_.clear();
    this.primitiveIndex_.clear();
  }
  
  entries() {
    return (function* () {
      for (var i = 0, len = this.entries_.length; i < len; ) {
        var key = this.entries_[i++];
        var value = this.entries_[i++];
        
        if (key === deletedSentinel)
          continue;
          
        yield [key, value];
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
