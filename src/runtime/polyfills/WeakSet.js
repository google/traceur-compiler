import {WeakMap} from './WeakMap';

// private properties
var wm = Symbol();

export class WeakSet {
	constructor(iterable, allowNonExtensibleObjects = false) {
		this[wm] = new WeakMap();
		this.allowNonExtensibleObjects = allowNonExtensibleObjects;
		if (iterable) {
			for(var value of iterable) {
				this.add(value);
			}
		}
	}
	
	get allowNonExtensibleObjects() {
		return this[wm].allowNonExtensibleObjects;
	}
	
	set allowNonExtensibleObjects(v) {
		this[wm].allowNonExtensibleObjects = v; // true makes map O(N) and leaky
	}

	add(value) {
		this[wm].set(value, true);
	}
	
	has(value) {
		return this[wm].has(value);
	}
	
	delete(value) {
		this[wm].delete(value);
	}
	
	clear() {
		this[wm].clear();
	}
}
