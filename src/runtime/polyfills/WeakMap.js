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

import {ArrayMap} from '../../util/ArrayMap';
import {isObject} from './utils'

var getOwnHashObject = $traceurRuntime.getOwnHashObject;


function keyIsNotObjectError() {
  return new TypeError('Key must be an object');
}

function validateKey(key) {
  if (!isObject(key))
    throw keyIsNotObjectError();
}

var undefinedSentinel = {};
var weakMapCounter = 0;

export class WeakMap {
  constructor(iterable, lifetimeDependsOnCollection = false) {
    this.lifetimeDependsOnCollection = lifetimeDependsOnCollection;
    this.id_ = weakMapCounter++;
    this.store_ = new ArrayMap();
    this.container_ = Object.create(null);
    
    if (iterable) {
      for(var [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }

  get(key, defaultValue) {
    validateKey(key);
    
    var hashObject = getOwnHashObject(key);
    if (hashObject) {
      var value = hashObject[this.id_];
      if (value !== undefined) {
        return value === undefinedSentinel ?
            undefined :
            value;
      }
      
      var value = this.container_[hashObject.hash];
      
      return value === undefined ?
          defaultValue :
          value === undefinedSentinel ?
          undefined :
          value;
    }
    
    return this.store_.get(key, defaultValue);
  }

  set(key, value, lifetimeDependsOnCollection = undefined) {
    validateKey(key);
    
    lifetimeDependsOnCollection = 
        lifetimeDependsOnCollection === undefined ?
        this.lifetimeDependsOnCollection :
        lifetimeDependsOnCollection;
    
    var hashObject = getOwnHashObject(key);
    if (hashObject) {
      value = value !== undefined ? value : undefinedSentinel;
      
      if (lifetimeDependsOnCollection)
        this.container_[hashObject.hash] = value;
      else
        hashObject[this.id_] = value;
      
    } else {
      this.store_.set(key, value);
    }
  }
  
  has(key) {
    validateKey(key);
    
    var hashObject = getOwnHashObject(key);
    if (hashObject) {
      return hashObject[this.id_] !== undefined || 
          this.container_[hashObject.hash] !== undefined;
    }
    
    return this.store_.has(key);
  }
  
  delete(key) {
    validateKey(key);
    
    var hashObject = getOwnHashObject(key);
    if (hashObject) {
      var hash = hashObject.hash;
      
      if (hashObject[this.id_] !== undefined)
        delete hashObject[this.id_];
      else if (this.container_[hash] !== undefined)
        delete this.container_[hash];
        
    } else {
      this.store_.remove(key);
    }
  }
  
  clear() {
    this.id_ = weakMapCounter++;
    this.store_ = new ArrayMap();
    this.container_ = Object.create(null);
  }
}
