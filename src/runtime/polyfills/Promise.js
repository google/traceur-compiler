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

import async from '../../../node_modules/rsvp/lib/rsvp/asap';

function isPromise(x) {
  return x && typeof x === 'object' && x.status_ !== undefined;
}

// Simple chaining (a.k.a. flatMap).
function chain(promise, onResolve = (x) => x, onReject = (e) => { throw e; }) {
  var deferred = getDeferred(promise.constructor);
  switch (promise.status_) {
    case undefined:
      throw TypeError;
    case 'pending':
      promise.onResolve_.push([deferred, onResolve]);
      promise.onReject_.push([deferred, onReject]);
      break;
    case 'resolved':
      promiseReact(deferred, onResolve, promise.value_);
      break;
    case 'rejected':
      promiseReact(deferred, onReject, promise.value_);
      break;
  }
  return deferred.promise;
}

function getDeferred(C) {
  var result = {};
  result.promise = new C((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}

export class Promise {
  constructor(resolver) {
    this.status_ = 'pending';
    this.onResolve_ = [];
    this.onReject_ = [];
    resolver((x) => { promiseResolve(this, x) },
             (r) => { promiseReject(this, r) });
  }

  catch(onReject) {
    return this.then(undefined, onReject)
  }

  // Extended functionality for multi-unwrapping chaining and coercive 'then'.
  then(onResolve = (x) => x, onReject) {
    var constructor = this.constructor;
    return chain(this, (x) => {
      x = promiseCoerce(constructor, x);
      return x === this ? onReject(new TypeError) :
          isPromise(x) ? x.then(onResolve, onReject) : onResolve(x)
    }, onReject);
  }

  // Convenience.

  static resolve(x) {
    return new this((resolve, reject) => { resolve(x); });
  }

  static reject(r) {
    return new this((resolve, reject) => { reject(r); });
  }

  // Combinators.

  static cast(x) {
    if (x instanceof this)
      return x;
    if (isPromise(x)) {
      var result = getDeferred(this);
      chain(x, result.resolve, result.reject);
      return result.promise;
    }
    return this.resolve(x);

  }

  static all(values) {
    var deferred = getDeferred(this);
    var count = 0;
    var resolutions = [];
    try {
      for (var i = 0; i < values.length; i++) {
        ++count;
        this.cast(values[i]).then(
            function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i),
            (r) => {
              if (count > 0)
                count = 0;
              deferred.reject(r);
            });
      }
      if (count === 0)
        deferred.resolve(resolutions);
    } catch (e) {
      deferred.reject(e);
    }
    return deferred.promise;
  }

  static race(values) {
    var deferred = getDeferred(this);
    try {
      for (var i = 0; i < values.length; i++) {
        this.cast(values[i]).then(
            (x) => { deferred.resolve(x); },
            (r) => { deferred.reject(r); });
      }
    } catch (e) {
      deferred.reject(e);
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
  for (var i = 0; i < reactions.length; i++) {
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
      else if (isPromise(y))
        chain(y, deferred.resolve, deferred.reject);
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
  if (isPromise(x)) {
    return x;
  } else if (x && typeof x.then === 'function') {
    var p = x[thenableSymbol];
    if (p) {
      return p;
    } else {
      var deferred = getDeferred(constructor);
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
