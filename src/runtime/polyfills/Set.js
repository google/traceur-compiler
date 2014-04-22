import {isObject} from './utils'
import {Map} from './Map'

var getOwnHashObject = $traceurRuntime.getOwnHashObject;
var $hasOwnProperty = Object.prototype.hasOwnProperty;

function initSet(set) {
  set.map_ = new Map(); // every odd index is key, every even index is value
}

export class Set {
  constructor(iterable = undefined) {
    if (!isObject(this))
      throw new TypeError("Constructor Set requires 'new'");
    
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }

    initSet(this);

    if (iterable !== null && iterable !== undefined) {
      var iter = iterable[Symbol.iterator];
      if (iter !== undefined) {
        for (var item of iterable) {
          this.add(item);
        }
      }
    }
  }

  get size() {
    return this.map_.size;
  }

  has(key) {
    return this.map_.has(key);
  }

  add(key) {
    return this.map_.set(key, true);
  }

  delete(key) {
    return this.map_.delete(key);
  }

  clear() {
    return this.map_.clear();
  }

  forEach(callbackFn, thisArg = undefined) {
    return this.map_.forEach((val, key) => callbackFn.call(thisArg, key, this));
  }

  *values() {
    yield* this.map_.keys();
  }
}

Object.defineProperty(Set.prototype, Symbol.iterator, {configurable: true, writable: true, value: Set.prototype.values});
