 
var defineHashObject = $traceurRuntime.defineHashObject;
var getHashObject = $traceurRuntime.getHashObject;
var getTimestamp = (function () {
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

var DeletedObject = {};

function nonExtensibleError() {
  return new TypeError('Object must not be natively freezed or flag "allowNonExtensibleObjects" in collection must be true');
}

function keyIsNotObjectError() {
  return new TypeError('Key must be an object');
}

function validateKey(key) {
  if (!(key instanceof Object))
    throw keyIsNotObjectError();
}

// TODO: same as for HashStore - Bidirectional linked list instead of array
//       for fast delete and avoid from special DeletedObject constant
export class HashMap {
  constructor() {
    this._id = hashMapCurrent;
    this._tsId = this._id+1;
    hashMapCurrent+=2;
    this._store = new HashStore();
    //this._hashObjs = []; // [plainHash] == { this._id: plainHash } // { plainHash: { this._id: plainHash } } // for delete
    this._clearTS = getTimestamp();
    this._container = [];
    this._size = 0;
    this.allowNonExtensibleObjects = false;
    this._currentHash = 0; // avoid 0 because of it falsy
  }
  
  get size() {
    return this._size;
  }
  
  _tryGetPlainHash(obj) {
    var hashObj;
    if (hashObj = getHashObject(obj)) { // if object contains hashes
      var timestamp = hashObj[this._tsId];
      if (timestamp > this._clearTS) // false if timestamp === undefined
        return hashObj[this._id];
      else
        return undefined;
    } else if (Object.isExtensible(obj)) { // if object extensible and it doesnt contains hash object - it could not be in hashmap
      return undefined;
    } else {
      if (!this.allowNonExtensibleObjects)
        throw nonExtensibleError();
      else {
        return this._store.get(obj);
      }
    }
  }
  
  _getPlainHash(obj) {
    var hashObj;
    if (hashObj = getHashObject(obj)) {
    
      var timestamp = hashObj[this._tsId];
      if (timestamp > this._clearTS)
        return hashObj[this._id];
      
      hashObj[this._tsId] = getTimestamp();
      return hashObj[this._id] = this._currentHash++;
    
    } else if (Object.isExtensible(obj)) { // if object extensible we may not check hash in store
      
      var hashObj = defineHashObject(obj);
      hashObj[this._tsId] = getTimestamp();
      return hashObj[this._id] = this._currentHash++;
    
    } else if (this.allowNonExtensibleObjects) {
    
      var plainHash = this._store.get(obj);
      if (plainHash !== undefined) {
        plainHash = this._currentHash++;
        this._store.set(obj, plainHash);
      }
      return plainHash;
      
    } else {
      throw nonExtensibleError();
    }
  }
  
  _deletePlainHash(obj) {
    var hashObj = getHashObject(obj);
    if (hashObj) {
      delete hashObj[this._id];
      delete hashObj[this._tsId];
    } else {
      if (!this.allowNonExtensibleObjects)
        throw nonExtensibleError();
      else {
        this._store.deleteByKey(obj);
      }
    }
  }

  get(key, defaultValue) {
    validateKey(key);
    var plainHash = this._tryGetPlainHash(key);
    
    var result;
    if (plainHash !== undefined && ((result = this._container[plainHash]) !== DeletedObject)) {
      return result;
    } else {
      return defaultValue;
    }
  }

  set(key, value) {
    validateKey(key);
    var before = this._currentHash;
    var plainHash = this._getPlainHash(key);
    var after = this._currentHash;
    
    if (after > before) // if hash was added
      this._size++;
    
    if (plainHash === undefined)
      throw new Error('Internal error in HashMap');
      
    this._container[plainHash] = value;
  }
  
  has(key) {
    validateKey(key);
    var plainHash = this._tryGetPlainHash(key);
    return plainHash !== undefined && this._container[plainHash] !== DeletedObject;
  }
  
  delete(key) {
    validateKey(key);
    var plainHash = this._tryGetPlainHash(key);
    if (plainHash !== undefined) {
      this._size--;
      this._deletePlainHash(key);
      this._container[plainHash] = DeletedObject;
    }
  }
  
  clear() {
    var container = this._container;
    this._store.clear();
    this._container = [];
    this._clearTS = getTimestamp();
    this._size = 0;
  }
  
  values() {
    var container = this._container;
    function* gen() {
      for (var i = 0, len = container.length; i < len; i++) {
        var v = container[i];
        if (v === DeletedObject) {
          continue;
        }
        yield container[i];
      }
    }
    return gen();
  }
}
