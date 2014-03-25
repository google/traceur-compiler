import {Map} from './Map';

var global = this;

export class Set {
  constructor(iterable, allowNonExtensibleObjects = false) {
    this.map_ = new Map();
    this.allowNonExtensibleObjects = allowNonExtensibleObjects;
    if (iterable) {
      for(var value of iterable) {
        this.add(value);
      }
    }
  }
  
  get allowNonExtensibleObjects() {
    return this.map_.allowNonExtensibleObjects;
  }
  
  set allowNonExtensibleObjects(v) {
    this.map_.allowNonExtensibleObjects = v;
  }
  
  get size() {
    return this.map_.size;
  }


  add(value) {
    this.map_.set(value, value);
  }
  
  has(value) {
    return this.map_.has(value);
  }
  
  delete(value) {
    this.map_.delete(value);
  }
  
  clear() {
    this.map_.clear();
  }
  
  entries() {
    return this.map_.entries();
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
