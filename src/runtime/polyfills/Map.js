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

var getOwnHashObject = $traceurRuntime.getOwnHashObject;
var $hasOwnProperty = Object.prototype.hasOwnProperty;
var deletedSentinel = {};

function lookupIndex(map, key) {
  if (isObject(key)) {
    var hashObject = getOwnHashObject(key);
    return hashObject && map.objectIndex_[hashObject.hash];
  } 
  if (typeof key === 'string')
    return map.stringIndex_[key];
  return map.primitiveIndex_[key];
}

function initMap(map) {
  map.entries_ = []; // every odd index is key, every even index is value
  map.objectIndex_ = Object.create(null); // avoid prototype's properties
  map.stringIndex_ = Object.create(null);
  map.primitiveIndex_ = Object.create(null);
  map.deletedCount_ = 0;
}

export class Map {
  constructor(iterable = undefined) {
    if (!isObject(this))
      throw new TypeError("Constructor Map requires 'new'");
    
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError("Map can not be reentrantly initialised");
    }
    
    initMap(this);
    
    if (iterable !== null && iterable !== undefined) {
      var iter = iterable[Symbol.iterator];
      if (iter !== undefined) {
        for (var [key, value] of iterable) {
          this.set(key, value);
        }
      }
    }
  }
  
  get size() {
    return this.entries_.length / 2 - this.deletedCount_;
  }

  get(key) {
    var index = lookupIndex(this, key);
    
    if (index !== undefined) 
      return this.entries_[index + 1];
  }

  set(key, value) {
    var objectMode = isObject(key);
    var stringMode = typeof key === 'string';
    
    var index = lookupIndex(this, key);
    
    if (index !== undefined) {
      this.entries_[index + 1] = value;
    } else {
      index = this.entries_.length;
      this.entries_[index] = key;
      this.entries_[index + 1] = value;
      
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        var hash = hashObject.hash;
        this.objectIndex_[hash] = index;
      } else if (stringMode) {
        this.stringIndex_[key] = index;
      } else {
        this.primitiveIndex_[key] = index;
      }
    }
    return this; // 23.1.3.9.11
  }
  
  has(key) {
    return lookupIndex(this, key) !== undefined;
  }
  
  delete(key) {
    var objectMode = isObject(key);
    var stringMode = typeof key === 'string';
    
    var index;
    var hash;
    
    if (objectMode) {
      var hashObject = getOwnHashObject(key);
      if (hashObject) {
        index = this.objectIndex_[hash = hashObject.hash];
        delete this.objectIndex_[hash];
      }
    } else if (stringMode) {
      index = this.stringIndex_[key];
      delete this.stringIndex_[key];
    } else {
      index = this.primitiveIndex_[key];
      delete this.primitiveIndex_[key]
    }
    
    if (index !== undefined) {
      this.entries_[index] = deletedSentinel;
      // remove possible reference to value to avoid memory leaks
      this.entries_[index + 1] = undefined;
      
      this.deletedCount_++;
    }
  }
  
  clear() {
    initMap(this);
  }
  
  forEach(callbackFn, thisArg = undefined) {
    for (var i = 0, len = this.entries_.length; i < len; i += 2) {
      var key = this.entries_[i];
      var value = this.entries_[i + 1];
      
      if (key === deletedSentinel)
        continue;
      
      callbackFn.call(thisArg, value, key, this);
    }
  }
}
