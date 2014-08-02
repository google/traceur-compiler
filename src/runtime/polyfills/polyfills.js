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

import {Map} from './Map';
import {Set} from './Set';
import {Promise} from './Promise';
import {
  codePointAt,
  contains,
  endsWith,
  fromCodePoint,
  repeat,
  raw,
  startsWith,
  stringPrototypeIterator
} from './String';
import {fill, find, findIndex, from} from './Array';
import {entries, keys, values} from './ArrayIterator';
import {assign, is, mixin} from './Object';
import {
  MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER,
  EPSILON,
  isFinite,
  isInteger,
  isNaN,
  isSafeInteger
} from './Number';

var {getPrototypeOf} = Object;

function maybeDefine(object, name, descr) {
  if (!(name in object)) {
    Object.defineProperty(object, name, descr);
  }
}

function maybeDefineMethod(object, name, value) {
  maybeDefine(object, name, {
    value: value,
    configurable: true,
    enumerable: false,
    writable: true
  });
}

function maybeDefineConst(object, name, value) {
  maybeDefine(object, name, {
    value: value,
    configurable: false,
    enumerable: false,
    writable: false
  });
}

function maybeAddFunctions(object, functions) {
  for (var i = 0; i < functions.length; i += 2) {
    var name = functions[i];
    var value = functions[i + 1];
    maybeDefineMethod(object, name, value);
  }
}

function maybeAddConsts(object, consts) {
  for (var i = 0; i < consts.length; i += 2) {
    var name = consts[i];
    var value = consts[i + 1];
    maybeDefineConst(object, name, value);
  }
}

function maybeAddIterator(object, func, Symbol) {
  if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
    return;

  // Firefox does not have symbols so they use a hack.
  if (object['@@iterator'])
    func = object['@@iterator'];

  Object.defineProperty(object, Symbol.iterator, {
    value: func,
    configurable: true,
    enumerable: false,
    writable: true
  });
}

function polyfillPromise(global) {
  if (!global.Promise)
    global.Promise = Promise;
}

function polyfillCollections(global, Symbol) {
  if (!global.Map)
    global.Map = Map;
  var mapPrototype = global.Map.prototype;
  if (mapPrototype.entries) {
    maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
    maybeAddIterator(getPrototypeOf(new global.Map().entries()),
        function() { return this; }, Symbol);
  }

  if (!global.Set)
    global.Set = Set;
  var setPrototype = global.Set.prototype;
  if (setPrototype.values) {
    maybeAddIterator(setPrototype, setPrototype.values, Symbol);
    maybeAddIterator(getPrototypeOf(new global.Set().values()),
        function() { return this; }, Symbol);
  }
}

function polyfillString(String) {
  maybeAddFunctions(String.prototype, [
    'codePointAt', codePointAt,
    'contains', contains,
    'endsWith', endsWith,
    'startsWith', startsWith,
    'repeat', repeat,
  ]);

  maybeAddFunctions(String, [
    'fromCodePoint', fromCodePoint,
    'raw', raw,
  ]);

  maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
}

function polyfillArray(Array, Symbol) {
  maybeAddFunctions(Array.prototype, [
    'entries', entries,
    'keys', keys,
    'values', values,
    'fill', fill,
    'find', find,
    'findIndex', findIndex,
  ]);

  maybeAddFunctions(Array, [
    'from', from
  ]);

  maybeAddIterator(Array.prototype, values, Symbol);
  maybeAddIterator(getPrototypeOf([].values()),
      function() { return this; }, Symbol);
}

function polyfillObject(Object) {
  maybeAddFunctions(Object, [
    'assign', assign,
    'is', is,
    'mixin', mixin,
  ]);
}

function polyfillNumber(Number) {
  maybeAddConsts(Number, [
    'MAX_SAFE_INTEGER', MAX_SAFE_INTEGER,
    'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER,
    'EPSILON', EPSILON,
  ]);
  maybeAddFunctions(Number, [
    'isFinite', isFinite,
    'isInteger', isInteger,
    'isNaN', isNaN,
    'isSafeInteger', isSafeInteger,
  ]);
}

function polyfill(global) {
  polyfillPromise(global);
  polyfillCollections(global, global.Symbol);
  polyfillString(global.String);
  polyfillArray(global.Array, global.Symbol);
  polyfillObject(global.Object);
  polyfillNumber(global.Number);
}

polyfill(this);

// Override setupGlobals so that we can add our polyfills.
var setupGlobals = $traceurRuntime.setupGlobals;
$traceurRuntime.setupGlobals = function(global) {
  setupGlobals(global);
  polyfill(global);
};
