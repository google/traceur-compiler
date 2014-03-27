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

var deletedSentinel = {};

export class PrimitivesMap {
  constructor() {
    this.clear();
  }
  
  get size() {
    return (this.entries_.length >> 1) - this.deletedItemsCount_;
  }

  get(key, defaultValue) {
    var index;
    
    if (typeof key === 'string')
      index = this.stringIndex_[key];
    else
      index = this.primitiveIndex_[key];
    
    if (index !== undefined)
      return this.entries_[index+1];

    return defaultValue;
  }

  set(key, value) {
    var stringMode = typeof key === 'string';
    var index;
    
    if (stringMode)
      index = this.stringIndex_[key];
    else
      index = this.primitiveIndex_[key];
      
    if (index !== undefined) {
      this.entries_[index+1] = value;
    } else {
      index = this.entries_.length;
      this.entries_[index] = key;
      this.entries_[index+1] = value;
      
      if (stringMode)
        this.stringIndex_[key] = index;
      else
        this.primitiveIndex_[key] = index;
    }
  }
  
  has(key) {
    var stringMode = typeof key === 'string';
    var index;
    
    if (stringMode)
      index = this.stringIndex_[key];
    else
      index = this.primitiveIndex_[key];
      
    return index !== undefined;
  }
  
  delete(key) {
    var stringMode = typeof key === 'string';
    var index;
    
    if (stringMode) {
      index = this.stringIndex_[key];
      delete this.stringIndex_[key];
    } else {
      index = this.primitiveIndex_[key];
      delete this.primitiveIndex_[key];
    }
    
    if (index !== undefined) {
      this.entries_[index] = deletedSentinel;
      // remove possible reference to value to avoid memory leaks
      this.entries_[index+1] = undefined;
      
      this.deletedItemsCount_++;
    }
  }
  
  clear() {
    this.entries_ = []; // every odd index is key, every even index is value
    this.stringIndex_ = Object.create(null); // avoid prototype's properties
    this.primitiveIndex_ = Object.create(null);
    this.deletedItemsCount_ = 0;
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
      for (var i = 0, len = this.entries_.length; i < len; ) {
        var key = this.entries_[i++];
        var value = this.entries_[i++];
        
        if (key === deletedSentinel)
          continue;
          
        yield value;
      }
    }).call(this);
  }
  
  keys() {
    return (function* () {
      for (var i = 0, len = this.entries_.length; i < len; i += 2) {
        var key = this.entries_[i];
        
        if (key === deletedSentinel)
          continue;
          
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
