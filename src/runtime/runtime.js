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

  var $create = Object.create;
  var $defineProperty = Object.defineProperty;
  var $defineProperties = Object.defineProperties;
  var $freeze = Object.freeze;
  var $getOwnPropertyNames = Object.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }

  var method = nonEnum;

  function polyfillString(String) {
    // Harmony String Extras
    // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
    $defineProperties(String.prototype, {
      startsWith: method(function(s) {
       return this.lastIndexOf(s, 0) === 0;
      }),
      endsWith: method(function(s) {
        var t = String(s);
        var l = this.length - t.length;
        return l >= 0 && this.indexOf(t, l) === l;
      }),
      contains: method(function(s) {
        return this.indexOf(s) !== -1;
      }),
      toArray: method(function() {
        return this.split('');
      }),
      codePointAt: method(function(position) {
        /*! http://mths.be/codepointat v0.1.0 by @mathias */
        var string = String(this);
        var size = string.length;
        // `ToInteger`
        var index = position ? Number(position) : 0;
        if (isNaN(index)) {
          index = 0;
        }
        // Account for out-of-bounds indices:
        if (index < 0 || index >= size) {
          return undefined;
        }
        // Get the first code unit
        var first = string.charCodeAt(index);
        var second;
        if ( // check if it’s the start of a surrogate pair
          first >= 0xD800 && first <= 0xDBFF && // high surrogate
          size > index + 1 // there is a next code unit
        ) {
          second = string.charCodeAt(index + 1);
          if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
          }
        }
        return first;
      })
    });

    $defineProperties(String, {
      // 21.1.2.4 String.raw(callSite, ...substitutions)
      raw: method(function(callsite) {
        var raw = callsite.raw;
        var len = raw.length >>> 0;  // ToUint
        if (len === 0)
          return '';
        var s = '';
        var i = 0;
        while (true) {
          s += raw[i];
          if (i + 1 === len)
            return s;
          s += arguments[++i];
        }
      }),
      // 21.1.2.2 String.fromCodePoint(...codePoints)
      fromCodePoint: method(function() {
        // http://mths.be/fromcodepoint v0.1.0 by @mathias
        var codeUnits = [];
        var floor = Math.floor;
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
          return '';
        }
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (
            !isFinite(codePoint) ||  // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 ||  // not a valid Unicode code point
            codePoint > 0x10FFFF ||  // not a valid Unicode code point
            floor(codePoint) != codePoint  // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint);
          }
          if (codePoint <= 0xFFFF) {  // BMP code point
            codeUnits.push(codePoint);
          } else {  // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = (codePoint % 0x400) + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
        }
        return String.fromCharCode.apply(null, codeUnits);
      })
    });
  }

  var counter = 0;

  /**
   * Generates a new unique string.
   * @return {string}
   */
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }

  var nameRe = /^__\$(?:\d+)\$(?:\d+)\$__$/;

  var internalStringValueName = newUniqueString();

  /**
   * Creates a new private name object.
   * @param {string=} string Optional string used for toString.
   * @constructor
   */
  function Name(string) {
    if (!string)
      string = newUniqueString();
    $defineProperty(this, internalStringValueName, {value: newUniqueString()});

    function toString() {
      return string;
    }
    $freeze(toString);
    $freeze(toString.prototype);
    var toStringDescr = method(toString);
    $defineProperty(this, 'toString', toStringDescr);

    this.public = $freeze($create(null, {
      toString: method($freeze(function toString() {
        return string;
      }))
    }));
    $freeze(this.public.toString.prototype);

    $freeze(this);
  };
  $freeze(Name);
  $freeze(Name.prototype);

  function assertName(val) {
    if (!NameModule.isName(val))
      throw new TypeError(val + ' is not a Name');
    return val;
  }

  // Private name.

  // Collection getters and setters
  var elementDeleteName = new Name();
  var elementGetName = new Name();
  var elementSetName = new Name();

  // HACK: We should use runtime/modules/std/name.js or something like that.
  var NameModule = $freeze({
    Name: function(str) {
      return new Name(str);
    },
    isName: function(x) {
      return x instanceof Name;
    },
    elementGet: elementGetName,
    elementSet: elementSetName,
    elementDelete: elementDeleteName
  });

  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);

  // Override getOwnPropertyNames to filter out private name keys.
  function getOwnPropertyNames(object) {
    return filter($getOwnPropertyNames(object), function(str) {
      return !nameRe.test(str);
    });
  }

  // Override Object.prototpe.hasOwnProperty to always return false for
  // private names.
  function hasOwnProperty(name) {
    if (NameModule.isName(name) || nameRe.test(name))
      return false;
    return $hasOwnProperty.call(this, name);
  }

  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }

  function elementDelete(object, name) {
    if (getOption('trapMemberLookup') &&
        hasPrivateNameProperty(object, elementDeleteName)) {
      return getProperty(object, elementDeleteName).call(object, name);
    }
    return deleteProperty(object, name);
  }

  function elementGet(object, name) {
    if (getOption('trapMemberLookup') &&
        hasPrivateNameProperty(object, elementGetName)) {
      return getProperty(object, elementGetName).call(object, name);
    }
    return getProperty(object, name);
  }

  function elementHas(object, name) {
    // Should we allow trapping this too?
    return has(object, name);
  }

  function elementSet(object, name, value) {
    if (getOption('trapMemberLookup') &&
        hasPrivateNameProperty(object, elementSetName)) {
      getProperty(object, elementSetName).call(object, name, value);
    } else {
      setProperty(object, name, value);
    }
    return value;
  }

  function assertNotName(s) {
    if (nameRe.test(s))
      throw Error('Invalid access to private name');
  }

  function deleteProperty(object, name) {
    if (NameModule.isName(name))
      return delete object[name[internalStringValueName]];
    if (nameRe.test(name))
      return true;
    return delete object[name];
  }

  function getProperty(object, name) {
    if (NameModule.isName(name))
      return object[name[internalStringValueName]];
    if (nameRe.test(name))
      return undefined;
    return object[name];
  }

  function hasPrivateNameProperty(object, name) {
    return name[internalStringValueName] in Object(object);
  }

  function has(object, name) {
    if (NameModule.isName(name) || nameRe.test(name))
      return false;
    return name in Object(object);
  }

  // This is a bit simplistic.
  // http://wiki.ecmascript.org/doku.php?id=strawman:refactoring_put#object._get_set_property_built-ins
  function setProperty(object, name, value) {
    if (NameModule.isName(name)) {
      var descriptor = $getPropertyDescriptor(object,
                                              [name[internalStringValueName]]);
      if (descriptor)
        object[name[internalStringValueName]] = value;
      else
        $defineProperty(object, name[internalStringValueName], nonEnum(value));
    } else {
      assertNotName(name);
      object[name] = value;
    }
  }

  function defineProperty(object, name, descriptor) {
    if (NameModule.isName(name)) {
      // Private names should never be enumerable.
      if (descriptor.enumerable) {
        descriptor = Object.create(descriptor, {
          enumerable: {value: false}
        });
      }
      $defineProperty(object, name[internalStringValueName], descriptor);
    } else {
      assertNotName(name);
      $defineProperty(object, name, descriptor);
    }
    return object;
  }

  function $getPropertyDescriptor(obj, name) {
    while (obj !== null) {
      var result = $getOwnPropertyDescriptor(obj, name);
      if (result)
        return result;
      obj = $getPrototypeOf(obj);
    }
    return undefined;
  }

  function getPropertyDescriptor(obj, name) {
    if (NameModule.isName(name))
      return undefined;
    assertNotName(name);
    return $getPropertyDescriptor(obj, name);
  }

  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'deleteProperty', method(deleteProperty));
    $defineProperty(Object, 'getOwnPropertyNames',
                    {value: getOwnPropertyNames});
    $defineProperty(Object, 'getProperty', method(getProperty));
    $defineProperty(Object, 'getPropertyDescriptor',
                    method(getPropertyDescriptor));
    $defineProperty(Object, 'has', method(has));
    $defineProperty(Object, 'setProperty', method(setProperty));
    $defineProperty(Object.prototype, 'hasOwnProperty',
                    {value: hasOwnProperty});

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

  // Iterators.
  var iteratorName = new Name('iterator');

  var IterModule = {
    get iterator() {
      return getOption('privateNames') ? iteratorName : '@@iterator';
    },
    // TODO: Implement the rest of @iter and move it to a different file that
    // gets compiled.
  };

  function getIterator(collection) {
    return getProperty(collection, IterModule.iterator).call(collection);
  }

  function returnThis() {
    return this;
  }

  function addIterator(object) {
    // Generator instances are iterable.
    setProperty(object, IterModule.iterator, returnThis);
    return object;
  }

  function polyfillArray(Array) {
    // Make arrays iterable.
    // TODO(arv): This is not very robust to changes in the private names
    // option but fortunately this is not something that is expected to change
    // at runtime outside of tests.
    defineProperty(Array.prototype, IterModule.iterator, method(function() {
      var index = 0;
      var array = this;
      return {
        next: function() {
          if (index < array.length) {
            return {value: array[index++], done: false};
          }
          return {value: undefined, done: true};
        }
      };
    }));
  }

  /**
   * @param {Function} canceller
   * @constructor
   */
  function Deferred(canceller) {
    this.canceller_ = canceller;
    this.listeners_ = [];
  }

  function notify(self) {
    while (self.listeners_.length > 0) {
      var current = self.listeners_.shift();
      var currentResult = undefined;
      try {
        try {
          if (self.result_[1]) {
            if (current.errback)
              currentResult = current.errback.call(undefined, self.result_[0]);
          } else {
            if (current.callback)
              currentResult = current.callback.call(undefined, self.result_[0]);
          }
          current.deferred.callback(currentResult);
        } catch (err) {
          current.deferred.errback(err);
        }
      } catch (unused) {}
    }
  }

  function fire(self, value, isError) {
    if (self.fired_)
      throw new Error('already fired');

    self.fired_ = true;
    self.result_ = [value, isError];
    notify(self);
  }

  Deferred.prototype = {
    constructor: Deferred,

    fired_: false,
    result_: undefined,

    createPromise: function() {
      return {then: this.then.bind(this), cancel: this.cancel.bind(this)};
    },

    callback: function(value) {
      fire(this, value, false);
    },

    errback: function(err) {
      fire(this, err, true);
    },

    then: function(callback, errback) {
      var result = new Deferred(this.cancel.bind(this));
      this.listeners_.push({
        deferred: result,
        callback: callback,
        errback: errback
      });
      if (this.fired_)
        notify(this);
      return result.createPromise();
    },

    cancel: function() {
      if (this.fired_)
        throw new Error('already finished');
      var result;
      if (this.canceller_) {
        result = this.canceller_(this);
        if (!result instanceof Error)
          result = new Error(result);
      } else {
        result = new Error('cancelled');
      }
      if (!this.fired_) {
        this.result_ = [result, true];
        notify(this);
      }
    }
  };

  // System.get/set and @traceur/module gets overridden in @traceur/modules to
  // be more correct.

  function LazyInitializedModule(func, self) {
    this.func = func;
    this.self = self;
  }
  LazyInitializedModule.prototype = {
    toModule: function() {
      return this.func.call(this.self);
    }
  };

  var modules = {
    '@name': NameModule,
    '@iter': IterModule,
    '@traceur/module': {
      LazyInitializedModule: LazyInitializedModule,
      registerModule: function(url, func, self) {
        modules[url] = new LazyInitializedModule(func, self);
      }
    }
  };

  var System = {
    get: function(name) {
      var module = modules[name];
      if (module instanceof LazyInitializedModule)
        return modules[name] = module.toModule();
      return module || null;
    },
    set: function(name, object) {
      modules[name] = object;
    }
  };

  function setupGlobals(global) {
    polyfillString(global.String);
    polyfillObject(global.Object);
    polyfillArray(global.Array);
    global.System = System;
    // TODO(arv): Don't export this.
    global.Deferred = Deferred;
  }

  setupGlobals(global);

  // Return the runtime namespace.
  var runtime = {
    Deferred: Deferred,
    addIterator: addIterator,
    assertName: assertName,
    createName: NameModule.Name,
    deleteProperty: deleteProperty,
    elementDelete: elementDelete,
    elementGet: elementGet,
    elementHas: elementHas,
    elementSet: elementSet,
    getIterator: getIterator,
    getProperty: getProperty,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    has: has,
  };

  // This file is sometimes used without traceur.js.
  global.$traceurRuntime = runtime;

})(typeof global !== 'undefined' ? global : this);
