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
import {Promise} from './Promise';
import {
  codePointAt,
  contains,
  endsWith,
  fromCodePoint,
  repeat,
  raw,
  startsWith
} from './String';
import {entries, keys, values} from './ArrayIterator';

function maybeDefineMethod(object, name, value) {
  if (!(name in object)) {
    Object.defineProperty(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
}

function maybeAddFunctions(object, functions) {
  for (var i = 0; i < functions.length; i += 2) {
    var name = functions[i];
    var value = functions[i + 1];
    maybeDefineMethod(object, name, value);
  }
}

function polyfillPromise(global) {
  if (!global.Promise)
    global.Promise = Promise;
}

function polyfillCollections(global) {
  if (!global.Map)
    global.Map = Map;
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
}

function polyfillArray(Array, Symbol) {
  maybeAddFunctions(Array.prototype, [
    'entries', entries,
    'keys', keys,
    'values', values,
  ]);

  if (Symbol && Symbol.iterator) {
    // Use Object.defineProperty so that the Symbol override can do its thing.
    Object.defineProperty(Array.prototype, Symbol.iterator, {
      value: values,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
}

function polyfill(global) {
  polyfillPromise(global);
  polyfillCollections(global);
  polyfillString(global.String);
  polyfillArray(global.Array, global.Symbol);
}

polyfill(this);

// Override setupGlobals so that we can add our polyfills.
var setupGlobals = $traceurRuntime.setupGlobals;
$traceurRuntime.setupGlobals = function(global) {
  setupGlobals(global);
  polyfill(global);
};
