// Copyright 2013 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Based on:
//   https://github.com/rossberg-chromium/js-promise/blob/master/promise.js
//   https://github.com/slightlyoff/Promises/blob/master/src/Promise.js
//   https://github.com/domenic/promises-unwrapping/blob/master/testable-implementation.js

import {async} from '../../../node_modules/rsvp/lib/rsvp/async';

// Core functionality.

function IsPromise(x) {
  return x && 'status_' in Object(x);
}

export class Promise {
  constructor(resolver) {
    this.status_ = 'pending';
    this.onResolve_ = [];
    this.onReject_ = [];
    resolver((x) => { promiseResolve(this, x) },
             (r) => { promiseReject(this, r) });
  }

  // Simple chaining (a.k.a. flatMap).

  chain(onResolve = (x) => x, onReject = (e) => { throw e; }) {
    var deferred = Promise.deferred.call(this.constructor);
    switch (this.status_) {
      case undefined:
        throw TypeError;
      case 'pending':
        this.onResolve_.push([deferred, onResolve]);
        this.onReject_.push([deferred, onReject]);
        break;
      case 'resolved':
        promiseReact(deferred, onResolve, this.value_);
        break;
      case 'rejected':
        promiseReact(deferred, onReject, this.value_);
        break;
    }
    return deferred.promise;
  }

  catch(onReject) {
    return this.chain(undefined, onReject)
  }

  // Extended functionality for multi-unwrapping chaining and coercive 'then'.
  then(onResolve = (x) => x, onReject) {
    var constructor = this.constructor;
    return this.chain((x) => {
      x = promiseCoerce(constructor, x);
      return x === this ? onReject(new TypeError) :
          IsPromise(x) ? x.then(onResolve, onReject) : onResolve(x)
    }, onReject);
  }

  // Convenience.

  static resolved(x) {
    return new this((resolve, reject) => { resolve(x); });
  }

  static rejected(r) {
    return new this((resolve, reject) => { reject(r); });
  }

  static deferred() {  // Seems useful to expose as a method, too
    var result = {}
    result.promise = new this((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
    });
    return result;
  }

  // Combinators.

  static cast(x) {
    if (x instanceof this)
      return x;
    if (IsPromise(x)) {
      var result = this.deferred();
      x.chain(result.resolve, result.reject);
      return result.promise;
    }
    return this.resolved(x);

  }

  static all(values) {
    var deferred = this.deferred();
    var count = 0;
    var resolutions = [];
    for (var i in values) {
      ++count;
      this.cast(values[i]).chain(
          function(i, x) {
            resolutions[i] = x;
            if (--count === 0)
              deferred.resolve(resolutions);
          }.bind(undefined, i),
          (r) => {
            if (count > 0)
              count = 0; deferred.reject(r);
          });
    }
    if (count === 0)
      deferred.resolve(resolutions);
    return deferred.promise;
  }

  static one(values) {  // a.k.a. Promise.race
    var deferred = this.deferred();
    var done = false;
    for (var i in values) {
      this.cast(values[i]).chain(
          (x) => {
            if (!done) {
              done = true;
              deferred.resolve(x);
            }
          },
          (r) => {
            if (!done) {
              done = true;
              deferred.reject(r);
            }
          });
    }
    return deferred.promise;
  }
}

function promiseResolve(promise, x) {
  promiseDone(promise, 'resolved', x, promise.onResolve_);
}

function promiseReject(promise, r) {
  promiseDone(promise, 'rejected', r, promise.onReject_);
}

function promiseDone(promise, status, value, reactions) {
  if (promise.status_ !== 'pending')
    return;
  for (var i in reactions) {
    promiseReact(reactions[i][0], reactions[i][1], value);
  }
  promise.status_ = status;
  promise.value_ = value;
  promise.onResolve_ = promise.onReject_ = undefined;
}

function promiseReact(deferred, handler, x) {
  async(() => {
    try {
      var y = handler(x);
      if (y === deferred.promise)
        throw new TypeError;
      else if (IsPromise(y))
        y.chain(deferred.resolve, deferred.reject);
      else
        deferred.resolve(y);
    } catch (e) {
      deferred.reject(e);
    }
  });
}

// This should really be a WeakMap.
var thenableSymbol = '@@thenable';

function promiseCoerce(constructor, x) {
  if (IsPromise(x)) {
    return x;
  } else if (x && 'then' in Object(x)) {  // can't test for callable
    var p = x[thenableSymbol];
    if (p) {
      return p;
    } else {
      var deferred = constructor.deferred();
      x[thenableSymbol] = deferred.promise;
      try {
        x.then(deferred.resolve, deferred.reject);
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  } else {
    return x;
  }
}
