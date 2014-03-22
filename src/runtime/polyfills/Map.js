import {HashMap} from './HashMap';
import {PrimitivesMap} from './PrimitivesMap';

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
var hm = Symbol();
var pm = Symbol();

export class Map {
	constructor(iterable) {
		this[hm] = new HashMap();
		this[pm] = new PrimitivesMap();
		if (iterable) {
			for(var [key, value] of iterable) {
				this.set(key, value);
			}
		}
	}
	
	get allowNonExtensibleObjects() {
		return this[hm].allowNonExtensibleObjects;
	}
	
	set allowNonExtensibleObjects(v) {
		this[hm].allowNonExtensibleObjects = v;
	}
	
	get size() {
		return this[hm].size + this[pm].size;
	}

	get(key, defaultValue) {
		if (key instanceof Object)
			return this[hm].get(key, [null, defaultValue])[1];
		else {
			return this[pm].get(key, defaultValue);
		}
	}

	set(key, value) {
		if (key instanceof Object)
			this[hm].set(key, [key, value]);
		else {
			this[pm].set(key, value);
		}
	}
	
	has(key) {
		if (key instanceof Object)
			return this[hm].has(key);
		else {
			return this[pm].has(key);
		}
	}
	
	delete(key) {
		if (key instanceof Object)
			this[hm].delete(key);
		else {
			this[pm].delete(key);
		}
		
	}
	
	clear() {
		this[hm].clear();
		this[pm].clear();
	}
	
	entries() {
		return (function* () {
			var vals = this[hm].values();
			for(var entry of vals) {
				yield entry;
			}
			for(var entry of this[pm]) {
				yield entry;
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
