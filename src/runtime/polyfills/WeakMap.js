import {HashMap} from './HashMap';

// private properties
var hm = Symbol().toString();

export class WeakMap {
	constructor(iterable, allowNonExtensibleObjects = false) {
		this[hm] = new HashMap();
		this.allowNonExtensibleObjects = allowNonExtensibleObjects;
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
		this[hm].allowNonExtensibleObjects = v; // true makes map O(N) and leaky
	}

	get(key, defaultValue) {
		return this[hm].get(key, defaultValue);
	}

	set(key, value) {
		this[hm].set(key, value);
	}
	
	has(key) {
		return this[hm].has(key);
	}
	
	delete(key) {
		this[hm].delete(key);
	}
	
	clear() {
		this[hm].clear();
	}
}
