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

export class WeakMap {
  constructor(iterable, allowNonExtensibleObjects = false) {
    this.hashmap_ = new HashMap();
    this.allowNonExtensibleObjects = allowNonExtensibleObjects;
    if (iterable) {
      for(var [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.hashmap_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.hashmap_.allowNonExtensibleObjects = v; //true makes map O(N) and leaky
  }

  get(key, defaultValue) {
    return this.hashmap_.get(key, defaultValue);
  }

  set(key, value) {
    this.hashmap_.set(key, value);
  }
  
  has(key) {
    return this.hashmap_.has(key);
  }
  
  delete(key) {
    this.hashmap_.delete(key);
  }
  
  clear() {
    this.hashmap_.clear();
  }
}
