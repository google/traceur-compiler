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
 
var defineHashObject = $traceurRuntime.defineHashObject;
var getHashObject = $traceurRuntime.getHashObject;
var getTimestamp = (function () {
    // it is hidden to prevent direct use anywhere except getTimestamp function
    var current = 0; 
    return function getTimestamp() {
      return current++;
    }
  })();

// This data structure contains { key <=> value } pairs, where
// key is a (frozen) object and value is a primitive
// delete by value
// no any validation
// TODO: replace arrays by indexed bidirectional linked list:
//       index: Object { [value]: LinkedListItem }
//       data: BiDirLinkedList { LinkedListItem { 'key': key, 'value': value } }
//       It will make delete operation compexity O(1)
class HashStore {
  constructor() {
    this.clear();
  }
  
  set(obj, plainHash) {
    var index = this.keys_.push(obj) - 1;
    this.values_[index] = plainHash;
    this.index_[plainHash] = index;
  }
  
  get(obj) {
    var index = this.keys_.indexOf(key);
    if (index == -1) {
      return undefined;
    }
    return this.values_[index];
  }
  
  delete(plainHash) {
    var index = this.index_[plainHash];
    this.keys_.splice(index, 1);
    this.values_.splice(index, 1);
    delete this.index_[plainHash];
  }
  
  deleteByKey(obj) {
    var index = this.keys_.indexOf(obj);
    if (index != -1) {
      var plainHash = index;
      this.keys_.splice(index, 1);
      this.values_.splice(index, 1);
      delete this.index_[plainHash];
    }
  }
  
  clear() {
    this.keys_ = [];
    this.values_ = [];
    this.index_ = {}; // for speed
  }
}

var hashMapCurrent = 0;

var deletedSentinel = {};

function nonExtensibleError() {
  return new TypeError('Object must not be natively freezed or flag '+
      '"allowNonExtensibleObjects" in collection must be true');
}

function keyIsNotObjectError() {
  return new TypeError('Key must be an object');
}

function validateKey(key) {
  if (!(key instanceof Object))
    throw keyIsNotObjectError();
}

// TODO: same as for HashStore - Bidirectional linked list instead of array
//       for fast delete and avoid from special deletedSentinel constant
export class HashMap {
  constructor() {
    this.id_ = hashMapCurrent;
    this.tsId_ = this.id_+1;
    hashMapCurrent+=2;
    this.store_ = new HashStore();
    this.clearTS_ = getTimestamp();
    this.container_ = [];
    this.size_ = 0;
    this.allowNonExtensibleObjects = false;
    this.currentHash_ = 0; 
  }
  
  get size() {
    return this.size_;
  }
  
  tryGetPlainHash_(obj) {
    var hashObj;
    if (hashObj = getHashObject(obj)) { // if object contains hashes
      var timestamp = hashObj[this.tsId_];
      if (timestamp > this.clearTS_) // false if timestamp === undefined
        return hashObj[this.id_];
      return undefined;
    } else if (Object.isExtensible(obj)) {
      // if object extensible and it doesnt contains hash object - it could not
      // be in hashmap
      return undefined;
    } else {
      if (this.allowNonExtensibleObjects)
        return this.store_.get(obj);
      
      throw nonExtensibleError();
    }
  }
  
  getPlainHash_(obj) {
    var hashObj;
    if (hashObj = getHashObject(obj)) {
    
      var timestamp = hashObj[this.tsId_];
      if (timestamp > this.clearTS_)
        return hashObj[this.id_];
      
      hashObj[this.tsId_] = getTimestamp();
      return hashObj[this.id_] = this.currentHash_++;
    
    } else if (Object.isExtensible(obj)) {
      
      var hashObj = defineHashObject(obj);
      hashObj[this.tsId_] = getTimestamp();
      return hashObj[this.id_] = this.currentHash_++;
    
    } else if (this.allowNonExtensibleObjects) {
    
      var plainHash = this.store_.get(obj);
      if (plainHash !== undefined) {
        plainHash = this.currentHash_++;
        this.store_.set(obj, plainHash);
      }
      return plainHash;
      
    }
    
    throw nonExtensibleError();
  }
  
  deletePlainHash_(obj) {
    var hashObj = getHashObject(obj);
    if (hashObj) {
      delete hashObj[this.id_];
      delete hashObj[this.tsId_];
    } else {
      if (!this.allowNonExtensibleObjects)
        throw nonExtensibleError();
      else {
        this.store_.deleteByKey(obj);
      }
    }
  }

  get(key, defaultValue) {
    validateKey(key);
    var plainHash = this.tryGetPlainHash_(key);
    
    var result;
    if (plainHash !== undefined &&
        ((result = this.container_[plainHash]) !== deletedSentinel)) {
      return result;
    } else {
      return defaultValue;
    }
  }

  set(key, value) {
    validateKey(key);
    var before = this.currentHash_;
    var plainHash = this.getPlainHash_(key);
    var after = this.currentHash_;
    
    if (after > before) // if hash was added
      this.size_++;
    
    if (plainHash === undefined)
      throw new Error('Internal error in HashMap');
      
    this.container_[plainHash] = value;
  }
  
  has(key) {
    validateKey(key);
    var plainHash = this.tryGetPlainHash_(key);
    return plainHash !== undefined && 
        this.container_[plainHash] !== deletedSentinel;
  }
  
  delete(key) {
    validateKey(key);
    var plainHash = this.tryGetPlainHash_(key);
    if (plainHash !== undefined) {
      this.size_--;
      this.deletePlainHash_(key);
      this.container_[plainHash] = deletedSentinel;
    }
  }
  
  clear() {
    var container = this.container_;
    this.store_.clear();
    this.container_ = [];
    this.clearTS_ = getTimestamp();
    this.size_ = 0;
  }
  
  values() {
    var container = this.container_;
    function* gen() {
      for (var i = 0, len = container.length; i < len; i++) {
        var v = container[i];
        if (v === deletedSentinel) {
          continue;
        }
        yield container[i];
      }
    }
    return gen();
  }
}
