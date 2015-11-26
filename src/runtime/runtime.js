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
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $apply = Function.prototype.call.bind(Function.prototype.apply)
  var $random = Math.random;
  var $getOwnPropertySymbols = $Object.getOwnPropertySymbols;
  var $Symbol = global.Symbol;
  var $WeakMap = global.WeakMap;

  var hasNativeSymbol = $getOwnPropertySymbols && typeof $Symbol === 'function';
  var hasNativeWeakMap = typeof $WeakMap === 'function';

  function $bind(operand, thisArg, args) {
    // args may be an arguments-like object
    var argArray = [thisArg];
    for (var i = 0; i < args.length; i++) {
      argArray[i + 1] = args[i];
    }
    var func = $apply(Function.prototype.bind, operand, argArray);
    return func; // prevent tail call
  }

  function $construct(func, argArray) {
    var object = new ($bind(func, null, argArray));
    return object; // prevent tail call
  }

  // ### Support for proper tail recursion
  //
  // This has to come before any function below that uses tail recursion.
  // Every call is the following functions is deliberately not in tail position.

  var counter = Date.now() % 1e9;

  /**
   * Generates a new unique string.
   * @return {string}
   */
  function newUniqueString() {
    return '__$' + ($random() * 1e9 >>> 1) + '$' + ++counter + '$__';
  }

  var createPrivateSymbol, deletePrivate, getPrivate, hasPrivate,
      isPrivateSymbol, setPrivate;

  if (hasNativeWeakMap) {
    isPrivateSymbol = function(s) {
      return false;
    };

    // This creates a Symbol that we filter out in getOwnPropertySymbols.
    createPrivateSymbol = function() {
      return new $WeakMap();
    };

    // Provide abstraction so that we can replace the symbol with a WeakMap in
    // the future.
    hasPrivate = function(obj, sym) {
      return sym.has(obj);
    };

    deletePrivate = function(obj, sym) {
      return sym.delete(obj);
    };

    setPrivate = function(obj, sym, val) {
      sym.set(obj, val);
    };

    getPrivate = function(obj, sym) {
      return sym.get(obj);
    };
  } else {
    // Uses Symbol or Symbol polyfill.
    // We override getOwnPropertySymbols to filter out these private symbols.

    var privateNames = $create(null);

    isPrivateSymbol = function(s) {
      return privateNames[s];
    };

    // This creates a Symbol that we filter out in getOwnPropertySymbols.
    createPrivateSymbol = function() {
      var s = hasNativeSymbol ? $Symbol() : newUniqueString();
      privateNames[s] = true;
      return s;
    };

    // Provide abstraction so that we can replace the symbol with a WeakMap in
    // the future.
    hasPrivate = function(obj, sym) {
      return hasOwnProperty.call(obj, sym);
    };

    deletePrivate = function(obj, sym) {
      if (!hasPrivate(obj, sym)) {
        return false;
      }
      delete obj[sym];
      return true;
    };

    setPrivate = function(obj, sym, val) {
      obj[sym] = val;
    };

    getPrivate = function(obj, sym) {
      var val = obj[sym];
      if (val === undefined) return undefined;
      return hasOwnProperty.call(obj, sym) ? val : undefined;
    };
  }

  (function () {
    // This has to be an IIFE as calls to initTailRecursiveFunction are hoisted
    // and should not appear before it is set above.

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
    // Symbols just use toString as their internal representation, making them
    // work but leak as enumerable properties.

    // The string used for the real property.
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();

    // Used for the Symbol wrapper
    var symbolDataProperty = newUniqueString();

    // All symbol values are kept in this map. This is so that we can get back to
    // the symbol object if all we have is the string key representing the symbol.
    var symbolValues = $create(null);

    /**
     * Creates a new unique symbol object.
     * @param {string=} string Optional string used for toString.
     * @constructor
     */
    let SymbolImpl = function Symbol(description) {
      var value = new SymbolValue(description);
      if (!(this instanceof SymbolImpl))
        return value;

      // new Symbol should throw.
      //
      // There are two ways to get a wrapper to a symbol. Either by doing
      // Object(symbol) or call a non strict function using a symbol value as
      // this. To correctly handle these two would require a lot of work for very
      // little gain so we are not doing those at the moment.
      throw new TypeError('Symbol cannot be new\'ed');
    };

    $defineProperty(SymbolImpl.prototype, 'constructor', nonEnum(SymbolImpl));
    $defineProperty(SymbolImpl.prototype, 'toString', method(function() {
      var symbolValue = this[symbolDataProperty];
      return symbolValue[symbolInternalProperty];
      /* The implementation of toString below matches the spec, but prevents
      use of Symbols in eg generators unless --symbol is set. To simplify our
      code we deliberately go against the spec here.
      if (!symbolValue)
        throw TypeError('Conversion from symbol to string');
      var desc = symbolValue[symbolDescriptionProperty];
      if (desc === undefined)
        desc = '';
      return 'Symbol(' + desc + ')';
      */
    }));
    $defineProperty(SymbolImpl.prototype, 'valueOf', method(function() {
      var symbolValue = this[symbolDataProperty];
      if (!symbolValue)
        throw TypeError('Conversion from symbol to string');
      return symbolValue[symbolInternalProperty];
    }));

    function SymbolValue(description) {
      var key = newUniqueString();
      $defineProperty(this, symbolDataProperty, {value: this});
      $defineProperty(this, symbolInternalProperty, {value: key});
      $defineProperty(this, symbolDescriptionProperty, {value: description});
      $freeze(this);
      symbolValues[key] = this;
    }
    $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(SymbolImpl));
    $defineProperty(SymbolValue.prototype, 'toString', {
      value: SymbolImpl.prototype.toString,
      enumerable: false
    });
    $defineProperty(SymbolValue.prototype, 'valueOf', {
      value: SymbolImpl.prototype.valueOf,
      enumerable: false
    });

    $freeze(SymbolValue.prototype);

    /**
     * Checks if the string is a string that is used to represent an emulated
     * symbol. This is used to filter out symbols in Object.keys,
     * getOwnPropertyKeys and for-in loops.
     */
    function isSymbolString(s) {
      return symbolValues[s] || isPrivateSymbol(s);
    }

    function removeSymbolKeys(array) {
      var rv = [];
      for (var i = 0; i < array.length; i++) {
        if (!isSymbolString(array[i])) {
          rv.push(array[i]);
        }
      }
      return rv;
    }

    // Override getOwnPropertyNames to filter out symbols keys.
    function getOwnPropertyNames(object) {
      return removeSymbolKeys($getOwnPropertyNames(object));
    }

    function keys(object) {
      return removeSymbolKeys($keys(object));
    }

    var getOwnPropertySymbolsEmulate = function getOwnPropertySymbols(object) {
      var rv = [];
      var names = $getOwnPropertyNames(object);
      for (var i = 0; i < names.length; i++) {
        var symbol = symbolValues[names[i]];
        if (symbol) {
          rv.push(symbol);
        }
      }
      return rv;
    };

    var getOwnPropertySymbolsPrivate = function getOwnPropertySymbols(object) {
      var rv = [];
      var symbols = $getOwnPropertySymbols(object);
      for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (!isPrivateSymbol(symbol)) {
          rv.push(symbol);
        }
      }
      return rv;
    };

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

    function polyfillSymbol(global) {
      if (!hasNativeSymbol) {
        global.Symbol = SymbolImpl;
        let {Object} = global;
        Object.getOwnPropertyNames = getOwnPropertyNames;
        Object.keys = keys;
        $defineProperty(Object, 'getOwnPropertySymbols',
            nonEnum(getOwnPropertySymbolsEmulate));
      } else if (!hasNativeWeakMap) {
        // We have native symbols but we are overriding getOwnPropertySymbols
        // to filter out the symbols we use for private state.
        $defineProperty(Object, 'getOwnPropertySymbols',
            nonEnum(getOwnPropertySymbolsPrivate));
      }

      if (!global.Symbol.iterator) {
        global.Symbol.iterator = Symbol('Symbol.iterator');
      }
      if (!global.Symbol.observer) {
        global.Symbol.observer = Symbol('Symbol.observer');
      }
    }

    function hasNativeSymbolFunc() {
      return hasNativeSymbol;
    }

    function setupGlobals(global) {
      polyfillSymbol(global)
      global.Reflect = global.Reflect || {};
      global.Reflect.global = global.Reflect.global || global;
    }

    setupGlobals(global);

    var typeOf = hasNativeSymbol ? x => typeof x :
        x => x instanceof SymbolValue ? 'symbol' : typeof x;

    global.$traceurRuntime = {
      checkObjectCoercible: checkObjectCoercible,
      createPrivateSymbol: createPrivateSymbol,
      deletePrivate: deletePrivate,
      getPrivate: getPrivate,
      hasNativeSymbol: hasNativeSymbolFunc,
      hasPrivate: hasPrivate,
      isSymbolString: isSymbolString,
      options: {},
      setPrivate: setPrivate,
      setupGlobals: setupGlobals,
      toObject: toObject,
      typeof: typeOf,
    };
  })();
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
