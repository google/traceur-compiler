
/*var hashSymbol = Symbol(); 

function defineHashObject(object) {
	var hashObj = {};
	if (!object[hashSymbol]) {
		Object.defineProperty(object, hashSymbol, {
			configurable: false,
			enumerable: false,
			writable: false,
			value: hashObj
		});
	}
	return hashObj;
}

(function () {
	// workaround for work with for frozen objects fast
	var $Object_freeze = Object.freeze;
	var $Object_preventExtensions = Object.preventExtensions;
	var $Object_seal = Object.seal;
	
	function freeze(object) {
		defineHashObject(object);
		return $Object_freeze.apply(this, arguments);
	}
	
	function preventExtensions(object) {
		defineHashObject(object)
		return $Object_preventExtensions.apply(this, arguments);
	}
	
	function seal(object) {
		defineHashObject(object)
		return $Object_seal.apply(this, arguments);
	}
	
	Object.defineProperty(Object, 'freeze', { value: freeze });
	Object.defineProperty(Object, 'preventExtensions', { value: preventExtensions });
	Object.defineProperty(Object, 'seal', { value: seal });
})();*/

var hashSymbol = Symbol.hashSymbol; 
var defineHashObject = $traceurRuntime.defineHashObject;


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
		this._hashObjs = []; // [plainHash] == { this._id: plainHash } // { plainHash: { this._id: plainHash } } // for delete
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
			var plainHash = hashObj[this._id];
			return plainHash;
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
	
	_getPlainHash(obj, boxedIsNew) {
		var hashObj;
		var plainHash;
		boxedIsNew.value = false;
		if (hashObj = obj[hashSymbol]) {
			plainHash = obj[hashSymbol][this._id];
			if (plainHash === undefined) {
				plainHash = this._currentHash++;
				obj[hashSymbol][this._id] = plainHash;
				boxedIsNew.value = true;
			}
			this._hashObjs[plainHash] = hashObj;
		} else {
			if (Object.isExtensible(obj)) { // if object extensible we may not check hash in store
				plainHash = this._currentHash++;
				var hashObj = defineHashObject(obj);
				hashObj[this._id] = plainHash;
				boxedIsNew.value = true;
				this._hashObjs[plainHash] = hashObj;
			} else {
				if (this.allowNonExtensibleObjects) {
					plainHash = this._store.get(obj);
					if (plainHash !== undefined) {
						plainHash = this._currentHash++;
						this._store.set(obj, plainHash);
						boxedIsNew.value = true;
					}
				} else {
					throw nonExtensibleError();
				}
			}
		}
		return plainHash;
	}
	
	_deletePlainHash(plainHash) {
		var hashObj = this._hashObjs[plainHash];
		if (hashObj) {
			delete hashObj[this._id];
			delete this._hashObjs[plainHash];
		} else {
			if (!this.allowNonExtensibleObjects)
				throw nonExtensibleError();
			else {
				this._store.delete(plainHash);
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
		var plainHash = this._getPlainHash(key, boxedIsNew);
		
		if (boxedIsNew.value)
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
			this._deletePlainHash(plainHash);
			this._container[plainHash] = DeletedObject;
		}
	}
	
	clear() {
		var container = this._container;
		this._store.clear();
		for (var i = 0, len = container.length; i < len; i++) {
			var plainHash = i;
			var v = container[i];
			if (v !== DeletedObject) {
				this._deletePlainHash(plainHash);
			}
		}
		this._container = [];
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
