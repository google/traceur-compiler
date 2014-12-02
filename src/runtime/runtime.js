// Copyright 2012 Traceur Authors.
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

/**
 * The traceur runtime.
 */
(function(global) {
  'use strict';

  if (global.$traceurRuntime) {
    // Prevents from being executed multiple times.
    return;
  }

  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;

  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }

  var method = nonEnum;

  // ### Symbols
  //
  // Symbols are emulated using an object which is an instance of SymbolValue.
  // Calling Symbol as a function returns a symbol value object.
  //
  // If options.symbols is enabled then all property accesses are transformed
  // into runtime calls which uses the internal string as the real property
  // name.
  //
  // If options.symbols is disabled symbols just toString as their internal
  // representation, making them work but leak as enumerable properties.

  var counter = 0;

  /**
   * Generates a new unique string.
   * @return {string}
   */
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }

  // The string used for the real property.
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();

  // Used for the Symbol wrapper
  var symbolDataProperty = newUniqueString();

  // All symbol values are kept in this map. This is so that we can get back to
  // the symbol object if all we have is the string key representing the symbol.
  var symbolValues = $create(null);

  // Private names are a bit simpler than Symbol since it is not supposed to be
  // exposed to user code.
  var privateNames = $create(null);

  function isPrivateName(s) {
    return privateNames[s];
  }

  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }

  /**
   * Whether symbol is an emulated symbol.
   */
  function isShimSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }

  function typeOf(v) {
    if (isShimSymbol(v))
      return 'symbol';
    return typeof v;
  }

  /**
   * Creates a new unique symbol object.
   * @param {string=} string Optional string used for toString.
   * @constructor
   */
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;

    // new Symbol should throw.
    //
    // There are two ways to get a wrapper to a symbol. Either by doing
    // Object(symbol) or call a non strict function using a symbol value as
    // this. To correctly handle these two would require a lot of work for very
    // little gain so we are not doing those at the moment.
    throw new TypeError('Symbol cannot be new\'ed');
  }

  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));

  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });

  var hashProperty = createPrivateName();

  // cached objects to avoid allocation of new object in defineHashObject
  var hashPropertyDescriptor = {
    value: undefined
  };
  var hashObjectProperties = {
    hash: {
      value: undefined
    },
    self: {
      value: undefined
    }
  };

  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    // Make sure we got the own property
    if (hashObject && hashObject.self === object)
      return hashObject;

    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;

      hashPropertyDescriptor.value = $create(null, hashObjectProperties);

      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }

    return undefined;
  }

  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }

  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }

  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }

  freeze(SymbolValue.prototype);

  /**
   * Checks if the string is a string that is used to represent an emulated
   * symbol. This is used to filter out symbols in Object.keys,
   * getOwnPropertyKeys and for-in loops.
   */
  function isSymbolString(s) {
    return symbolValues[s] || privateNames[s];
  }

  function toProperty(name) {
    if (isShimSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }

  // Override getOwnPropertyNames to filter out symbols keys.
  function removeSymbolKeys(array) {
    var rv = [];
    for (var i = 0; i < array.length; i++) {
      if (!isSymbolString(array[i])) {
        rv.push(array[i]);
      }
    }
    return rv;
  }

  function getOwnPropertyNames(object) {
    return removeSymbolKeys($getOwnPropertyNames(object));
  }

  function keys(object) {
    return removeSymbolKeys($keys(object));
  }

  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) {
        rv.push(symbol);
      }
    }
    return rv;
  }

  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }

  // Override Object.prototpe.hasOwnProperty to always return false for
  // private names.
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }

  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }

  function defineProperty(object, name, descriptor) {
    if (isShimSymbol(name)) {
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }

  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames',
                    {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor',
                    {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty',
                    {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    $defineProperty(Object, 'keys', {value: keys});
    // getOwnPropertySymbols is added in polyfillSymbol.
  }

  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (isSymbolString(name)) continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() { return mod[name]; },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }

  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }

  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }

  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-checkobjectcoercible
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }

  function polyfillSymbol(global, Symbol) {
    if (!global.Symbol) {
      global.Symbol = Symbol;
      Object.getOwnPropertySymbols = getOwnPropertySymbols;
    }
    if (!global.Symbol.iterator) {
      global.Symbol.iterator = Symbol('Symbol.iterator');
    }
  }

  function setupGlobals(global) {
    polyfillSymbol(global, Symbol)
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;

    polyfillObject(global.Object);
  }

  setupGlobals(global);

  global.$traceurRuntime = {
    checkObjectCoercible: checkObjectCoercible,
    createPrivateName: createPrivateName,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    isObject: isObject,
    isPrivateName: isPrivateName,
    isSymbolString: isSymbolString,
    keys: $keys,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    typeof: typeOf,
  };

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
