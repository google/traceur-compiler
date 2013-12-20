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
  var $getPrototypeOf = $Object.getPrototypeOf;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;

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

  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }

  function typeOf(v) {
    if (isSymbol(v))
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
    $freeze(this);
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
  $freeze(SymbolValue.prototype);

  Symbol.iterator = Symbol();

  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }

  // Override getOwnPropertyNames to filter out private name keys.
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name])
        rv.push(name);
    }
    return rv;
  }

  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }

  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol)
        rv.push(symbol);
    }
    return rv;
  }

  // Override Object.prototpe.hasOwnProperty to always return false for
  // private names.
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }

  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }

  function setProperty(object, name, value) {
    var sym, desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
      $defineProperty(object, name, {enumerable: false});
    return value;
  }

  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      // Symbols should not be enumerable. We need to create a new descriptor
      // before calling the original defineProperty because the property might
      // be made non configurable.
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {
          enumerable: {value: false}
        });
      }
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

    Object.getOwnPropertySymbols = getOwnPropertySymbols;

    // Object.is

    // Unlike === this returns true for (NaN, NaN) and false for (0, -0).
    function is(left, right) {
      if (left === right)
        return left !== 0 || 1 / left === 1 / right;
      return left !== left && right !== right;
    }

    $defineProperty(Object, 'is', method(is));

    // Object.assign (19.1.3.1)
    function assign(target, source) {
      var props = $getOwnPropertyNames(source);
      var p, length = props.length;
      for (p = 0; p < length; p++) {
        target[props[p]] = source[props[p]];
      }
      return target;
    }

    $defineProperty(Object, 'assign', method(assign));

    // Object.mixin (19.1.3.15)
    function mixin(target, source) {
      var props = $getOwnPropertyNames(source);
      var p, descriptor, length = props.length;
      for (p = 0; p < length; p++) {
        descriptor = $getOwnPropertyDescriptor(source, props[p]);
        $defineProperty(target, props[p], descriptor);
      }
      return target;
    }

    $defineProperty(Object, 'mixin', method(mixin));
  }

  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
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

  function toObject(value) {
    if (value == null)
      throw $TypeError();
    return $Object(value);
  }

  function spread() {
    var rv = [], k = 0;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = toObject(arguments[i]);
      for (var j = 0; j < valueToSpread.length; j++) {
        rv[k++] = valueToSpread[j];
      }
    }
    return rv;
  }

  function getPropertyDescriptor(object, name) {
    while (object !== null) {
      var result = $getOwnPropertyDescriptor(object, name);
      if (result)
        return result;
      object = $getPrototypeOf(object);
    }
    return undefined;
  }

  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    if (!proto)
      throw $TypeError('super is null');
    return getPropertyDescriptor(proto, name);
  }

  function superCall(self, homeObject, name, args) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if ('value' in descriptor)
        return descriptor.value.apply(self, args);
      if (descriptor.get)
        return descriptor.get.call(self).apply(self, args);
    }
    throw $TypeError("super has no method '" + name + "'.");
  }

  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (descriptor.get)
        return descriptor.get.call(self);
      else if ('value' in descriptor)
        return descriptor.value;
    }
    return undefined;
  }

  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }

  function getDescriptors(object) {
    var descriptors = {}, name, names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }

  // The next three functions are more or less identical to
  // ClassDefinitionEvaluation in the ES6 draft.

  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
       configurable: true,
       enumerable: false,
       writable: true
    });

    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass),
                               getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {configurable: false, writable: false});
    return $defineProperties(ctor, getDescriptors(staticObject));
  }

  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
    }
    if (superClass === null)
      return null;
    throw new TypeError();
  }

  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }

  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var ACTION_SEND = 0;
  var ACTION_THROW = 1;

  function addIterator(object) {
    // This needs the non native defineProperty to handle symbols correctly.
    return defineProperty(object, Symbol.iterator, nonEnum(function() {
      return this;
    }));
  }

  function generatorWrap(generator) {
    return addIterator({
      next: function(x) {
        switch (generator.GState) {
          case ST_EXECUTING:
            throw new Error('"next" on executing generator');
          case ST_CLOSED:
            throw new Error('"next" on closed generator');
          case ST_NEWBORN:
            if (x !== undefined) {
              throw $TypeError('Sent value to newborn generator');
            }
            // fall through
          case ST_SUSPENDED:
            generator.GState = ST_EXECUTING;
            if (generator.moveNext(x, ACTION_SEND)) {
              generator.GState = ST_SUSPENDED;
              return {value: generator.current, done: false};
            }
            generator.GState = ST_CLOSED;
            return {value: generator.yieldReturn, done: true};
        }
      },

      throw: function(x) {
        switch (generator.GState) {
          case ST_EXECUTING:
            throw new Error('"throw" on executing generator');
          case ST_CLOSED:
            throw new Error('"throw" on closed generator');
          case ST_NEWBORN:
            generator.GState = ST_CLOSED;
            throw x;
          case ST_SUSPENDED:
            generator.GState = ST_EXECUTING;
            if (generator.moveNext(x, ACTION_THROW)) {
              generator.GState = ST_SUSPENDED;
              return {value: generator.current, done: false};
            }
            generator.GState = ST_CLOSED;
            return {value: generator.yieldReturn, done: true};
        }
      }
    });
  }


  function setupGlobals(global) {
    global.Symbol = Symbol;

    polyfillObject(global.Object);
  }

  setupGlobals(global);

  global.$traceurRuntime = {
    createClass: createClass,
    defaultSuperCall: defaultSuperCall,
    exportStar: exportStar,
    generatorWrap: generatorWrap,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    spread: spread,
    superCall: superCall,
    superGet: superGet,
    superSet: superSet,
    toObject: toObject,
    toProperty: toProperty,
    typeof: typeOf,
  };

})(typeof global !== 'undefined' ? global : this);
