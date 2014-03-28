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

var getOwnHash = $traceurRuntime.getOwnHash;

class ArrayMap {
  constructor() {
    this.clear();
  }
  
  get size() {
    return this.keys_.length;
  }
  
  set(key, value) {
    var index = this.keys_.push(key) - 1;
    this.values_[index] = value;
  }
  
  get(key, defaultValue) {
    var index = this.keys_.indexOf(key);
    if (index == -1) {
      return defaultValue;
    }
    return this.values_[index];
  }
  
  has(key) {
    return this.keys_.indexOf(key) !== -1;
  }
  
  delete(key) {
    var index = this.keys_.indexOf(key);
    if (index != -1) {
      this.keys_.splice(index, 1);
      this.values_.splice(index, 1);
    }
  }
  
  clear() {
    this.keys_ = [];
    this.values_ = [];
  }
}

var undefinedSentinel = {};

function keyIsNotObjectError() {
  return new TypeError('Key must be an object');
}

function validateKey(key) {
  if (!isObject(key))
    throw keyIsNotObjectError();
}

export class HashMap {
  constructor() {
    this.store_ = new ArrayMap();
    this.container_ = Object.create(null);
    this.size_ = 0;
  }
  
  get size() {
    return this.size_ + this.store_.size;
  }
  
  get(key, defaultValue) {
    validateKey(key);
    
    var hash = getOwnHash(key);
    if (hash !== undefined) {
      var value = this.container_[hash];
      
      return value === undefined ?
          defaultValue :
          value === undefinedSentinel ?
          undefined :
          value;
    } else {
      return this.store_.get(key, defaultValue);
    }
  }

  set(key, value) {
    validateKey(key);
    
    var hash = getOwnHash(key);
    if (hash !== undefined) {
      if (this.container_[hash] === undefined)
        this.size_++;
      this.container_[hash] = value !== undefined ? value : undefinedSentinel;
    } else {
      this.store_.set(key, value);
    }
  }
  
  has(key) {
    validateKey(key);
    
    var hash = getOwnHash(key);
    if (hash !== undefined) {
      return this.container_[hash] !== undefined;
    } else {
      return this.store_.has(key);
    }
  }
  
  delete(key) {
    validateKey(key);
    
    var hash = getOwnHash(key);
    if (hash !== undefined) {
      if (this.container_[hash] !== undefined) {
        this.size_--;
        delete this.container_[hash];
      }
    } else {
      return this.store_.delete(key);
    }
  }
  
  clear() {
    this.store_.clear();
    this.container_ = [];
    this.size_ = 0;
  }
}
