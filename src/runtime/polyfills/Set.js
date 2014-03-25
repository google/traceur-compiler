import {Map} from './Map';

var global = this;

// private properties
var m = Symbol().toString();

export class Set {
	constructor(iterable, allowNonExtensibleObjects = false) {
		this[m] = new Map();
		this.allowNonExtensibleObjects = allowNonExtensibleObjects;
		if (iterable) {
			for(var value of iterable) {
				this.add(value);
			}
		}
	}
	
	get allowNonExtensibleObjects() {
		return this[m].allowNonExtensibleObjects;
	}
	
	set allowNonExtensibleObjects(v) {
		this[m].allowNonExtensibleObjects = v;
	}
	
	get size() {
		return this[m].size;
	}


	add(value) {
		this[m].set(value, value);
	}
	
	has(value) {
		return this[m].has(value);
	}
	
	delete(value) {
		this[m].delete(value);
	}
	
	clear() {
		this[m].clear();
	}
	
	entries() {
		return this[m].entries();
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
		return this.keys();
	}
}
