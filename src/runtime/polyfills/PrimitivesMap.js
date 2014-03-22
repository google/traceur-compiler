
var global = this;

function primitiveHash(p) {
	var hashStr = (typeof p) + ' ';
    if (p === null) {
        hashStr += 'null';
    } else if (p === undefined) {
		hashStr += 'undefined';
	} else {
        hashStr += p.toString();
    }
    return hashStr;
}

// private properties
var primitivesMap = Symbol();
var primitivesSize = Symbol();

export class PrimitivesMap {
	constructor() {
		this[primitivesMap] = {};
		this[primitivesSize] = 0;
	}
	
	get size() {
		return this[primitivesSize];
	}

	get(key, defaultValue) {
		var h = primitiveHash(key);
		if (this[primitivesMap].hasOwnProperty(h))
			return this[primitivesMap][h][1];
		else 
			return defaultValue;
	}

	set(key, value) {
		var h = primitiveHash(key);
		if (!this[primitivesMap].hasOwnProperty(h)) {
			this[primitivesSize]++;
		}
		this[primitivesMap][h] = [key, value];
	}
	
	has(key) {
		var h = primitiveHash(key);
		return this[primitivesMap].hasOwnProperty(h);
	}
	
	delete(key) {
		var h = primitiveHash(key);
		if (this[primitivesMap].hasOwnProperty(h)) {
			this[primitivesSize]--;
		}
		delete this[primitivesMap][h];
	}
	
	clear() {
		this[primitivesMap] = {};
		this[primitivesSize] = 0;
	}
	
	entries() {
		return (function* () {
			for(var i in this[primitivesMap]) {
				yield this[primitivesMap][i];
			}
		}).call(this);
	}
	
	values() {
		return (function* () {
			for(var [key, value] of this.entries()) {
				yield value;
			}
		}).call(this);
	}
	
	keys() {
		return (function* () {
			for(var [key, value] of this.entries()) {
				yield key;
			}
		}).call(this);
	}
	
	forEach(callbackFn, thisArg) {
		for(var [key, value] of this.entries()) {
			callbackFn.call(global, key, value, this);
		}
	}
	
	[Symbol.iterator]() {
		return this.entries();
	}
}
