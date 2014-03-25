import {WeakMap} from './WeakMap';

export class WeakSet {
  constructor(iterable, allowNonExtensibleObjects = false) {
    this.weakmap_ = new WeakMap();
    this.allowNonExtensibleObjects = allowNonExtensibleObjects;
    if (iterable) {
      for(var value of iterable) {
        this.add(value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.weakmap_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.weakmap_.allowNonExtensibleObjects = v; // true makes map O(N) and leaky
  }

  add(value) {
    this.weakmap_.set(value, true);
  }
  
  has(value) {
    return this.weakmap_.has(value);
  }
  
  delete(value) {
    this.weakmap_.delete(value);
  }
  
  clear() {
    this.weakmap_.clear();
  }
}
