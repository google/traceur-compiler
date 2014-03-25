import {HashMap} from './HashMap';

export class WeakMap {
  constructor(iterable, allowNonExtensibleObjects = false) {
    this.hashmap_ = new HashMap();
    this.allowNonExtensibleObjects = allowNonExtensibleObjects;
    if (iterable) {
      for(var [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.hashmap_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.hashmap_.allowNonExtensibleObjects = v; // true makes map O(N) and leaky
  }

  get(key, defaultValue) {
    return this.hashmap_.get(key, defaultValue);
  }

  set(key, value) {
    this.hashmap_.set(key, value);
  }
  
  has(key) {
    return this.hashmap_.has(key);
  }
  
  delete(key) {
    this.hashmap_.delete(key);
  }
  
  clear() {
    this.hashmap_.clear();
  }
}
