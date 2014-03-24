
var hashSymbol = Symbol.hashSymbol; 
var defineHashObject = $traceurRuntime.defineHashObject;
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
		this._id = hashMapCurrent++;
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
		if (hashObj = obj[hashSymbol]) { // if object contains hashes
			var data = hashObj[this._id];
			if (data) {
				if (data.timestamp > this._clearTS) {
					var plainHash = data.value;
					return plainHash;
				} else {
					return undefined;
				}
			} else {
				return undefined;
			}
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
		var plainHash;
		if (hashObj = obj[hashSymbol]) {
			var data = hashObj[this._id];
			if (data) {
				if (data.timestamp > this._clearTS) {
					var plainHash = data.value;
					return plainHash;
				} else {
				    var plainHash = this._currentHash++;
					data.timestamp = getTimestamp();
					data.value = plainHash;
					return plainHash;
				}
			} else {
				var plainHash = this._currentHash++;
				hashObj[this._id] = {
					value: plainHash,
					timestamp: getTimestamp()
				};
			}
		} else {
			if (Object.isExtensible(obj)) { // if object extensible we may not check hash in store
				var plainHash = this._currentHash++;
				var hashObj = defineHashObject(obj);
				hashObj[this._id] = {
					value: plainHash,
					timestamp: getTimestamp()
				};
			} else {
				if (this.allowNonExtensibleObjects) {
					plainHash = this._store.get(obj);
					if (plainHash !== undefined) {
						plainHash = this._currentHash++;
						this._store.set(obj, plainHash);
					}
				} else {
					throw nonExtensibleError();
				}
			}
		}
		return plainHash;
	}
	
	_deletePlainHash(obj) {
		var hashObj = obj[hashSymbol];
		if (hashObj) {
			delete hashObj[this._id];
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
		var boxedIsNew = {};
		var before = this._currentHash;
		var plainHash = this._getPlainHash(key, boxedIsNew);
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
