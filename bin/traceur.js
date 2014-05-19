(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
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
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
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
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
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
  Symbol.iterator = Symbol();
  freeze(SymbolValue.prototype);
  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name] && !privateNames[name])
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
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
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
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (privateNames[name])
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
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
  function assertObject(x) {
    if (!isObject(x))
      throw $TypeError(x + ' is not an Object');
    return x;
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    assertObject: assertObject,
    createPrivateName: createPrivateName,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    privateNames: privateNames,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    keys: $keys
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  var toObject = $traceurRuntime.toObject;
  function spread() {
    var rv = [],
        k = 0;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = toObject(arguments[i]);
      for (var j = 0; j < valueToSpread.length; j++) {
        rv[k++] = valueToSpread[j];
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }
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
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
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
    throw new $TypeError();
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw new Error(("\"" + action + "\" on closed generator"));
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime.assertObject($traceurRuntime),
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      return this.value_ = this.func.call(global);
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur@0.0.43/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/utils";
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x | 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function toInteger(x) {
    x = +x;
    if (isNaN(x))
      return 0;
    if (!isFinite(x) || x === 0)
      return x;
    return x > 0 ? Math.floor(x) : Math.ceil(x);
  }
  var MAX_SAFE_LENGTH = Math.pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : Math.min(len, MAX_SAFE_LENGTH);
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    }
  };
});
System.register("traceur@0.0.43/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/Array";
  var $__3 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/utils")),
      toInteger = $__3.toInteger,
      toLength = $__3.toLength,
      toObject = $__3.toObject,
      isCallable = $__3.isCallable;
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      if (i in object) {
        var value = object[i];
        if (predicate.call(thisArg, value, i, object)) {
          return returnIndex ? i : value;
        }
      }
    }
    return returnIndex ? -1 : undefined;
  }
  return {
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    }
  };
});
System.register("traceur@0.0.43/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__5;
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/ArrayIterator";
  var $__6 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/utils")),
      toObject = $__6.toObject,
      toUint32 = $__6.toUint32;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__5 = {}, Object.defineProperty($__5, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__5, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__5), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur@0.0.43/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/Map";
  var isObject = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/utils")).isObject;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError("Constructor Map requires 'new'");
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError("Map can not be reentrantly initialised");
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      var iter = iterable[Symbol.iterator];
      if (iter !== undefined) {
        for (var $__8 = iterable[Symbol.iterator](),
            $__9; !($__9 = $__8.next()).done; ) {
          var $__10 = $traceurRuntime.assertObject($__9.value),
              key = $__10[0],
              value = $__10[1];
          {
            this.set(key, value);
          }
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
      }
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0,
          len = this.entries_.length; i < len; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    }
  }, {});
  return {get Map() {
      return Map;
    }};
});
System.register("traceur@0.0.43/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/Object";
  var $__11 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/utils")),
      toInteger = $__11.toInteger,
      toLength = $__11.toLength,
      toObject = $__11.toObject,
      isCallable = $__11.isCallable;
  var $__11 = $traceurRuntime.assertObject($traceurRuntime),
      defineProperty = $__11.defineProperty,
      getOwnPropertyDescriptor = $__11.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__11.getOwnPropertyNames,
      keys = $__11.keys,
      privateNames = $__11.privateNames;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (privateNames[name])
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (privateNames[name])
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    }
  };
});
System.register("traceur@0.0.43/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/node_modules/rsvp/lib/rsvp/asap";
  var $__default = function asap(callback, arg) {
    var length = queue.push([callback, arg]);
    if (length === 1) {
      scheduleFlush();
    }
  };
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = [];
  function flush() {
    for (var i = 0; i < queue.length; i++) {
      var tuple = queue[i];
      var callback = tuple[0],
          arg = tuple[1];
      callback(arg);
    }
    queue = [];
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur@0.0.43/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/Promise";
  var async = $traceurRuntime.assertObject(System.get("traceur@0.0.43/node_modules/rsvp/lib/rsvp/asap")).default;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    cast: function(x) {
      if (x instanceof this)
        return x;
      if (isPromise(x)) {
        var result = getDeferred(this);
        chain(x, result.resolve, result.reject);
        return result.promise;
      }
      return this.resolve(x);
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  return {get Promise() {
      return Promise;
    }};
});
System.register("traceur@0.0.43/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/String";
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
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
  }
  function fromCodePoint() {
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
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    }
  };
});
System.register("traceur@0.0.43/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfills/polyfills";
  var Map = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/Map")).Map;
  var Promise = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/Promise")).Promise;
  var $__14 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/String")),
      codePointAt = $__14.codePointAt,
      contains = $__14.contains,
      endsWith = $__14.endsWith,
      fromCodePoint = $__14.fromCodePoint,
      repeat = $__14.repeat,
      raw = $__14.raw,
      startsWith = $__14.startsWith;
  var $__14 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/Array")),
      fill = $__14.fill,
      find = $__14.find,
      findIndex = $__14.findIndex;
  var $__14 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/ArrayIterator")),
      entries = $__14.entries,
      keys = $__14.keys,
      values = $__14.values;
  var $__14 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/Object")),
      assign = $__14.assign,
      is = $__14.is,
      mixin = $__14.mixin;
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
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
  }
  function polyfillArray(Array, Symbol) {
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    if (Symbol && Symbol.iterator) {
      Object.defineProperty(Array.prototype, Symbol.iterator, {
        value: values,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }
  function polyfillObject(Object) {
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  function polyfill(global) {
    polyfillPromise(global);
    polyfillCollections(global);
    polyfillString(global.String);
    polyfillArray(global.Array, global.Symbol);
    polyfillObject(global.Object);
  }
  polyfill(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfill(global);
  };
  return {};
});
System.register("traceur@0.0.43/src/runtime/polyfill-import", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/polyfill-import";
  var $__16 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/polyfills/polyfills"));
  return {};
});
System.get("traceur@0.0.43/src/runtime/polyfill-import" + '');
System.register("traceur@0.0.43/src/options", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/options";
  var parseOptions = Object.create(null);
  var transformOptions = Object.create(null);
  var defaultValues = Object.create(null);
  var experimentalOptions = Object.create(null);
  var moduleOptions = ['amd', 'commonjs', 'instantiate', 'inline', 'register'];
  var options = {
    set experimental(v) {
      v = coerceOptionValue(v);
      Object.keys(experimentalOptions).forEach((function(name) {
        options[name] = v;
      }));
    },
    get experimental() {
      var value;
      Object.keys(experimentalOptions).every((function(name) {
        var currentValue = options[name];
        if (value === undefined) {
          value = currentValue;
          return true;
        }
        if (currentValue !== value) {
          value = null;
          return false;
        }
        return true;
      }));
      return value;
    },
    modules_: 'register',
    get modules() {
      return this.modules_;
    },
    set modules(value) {
      if (typeof value === 'boolean' && !value)
        value = 'register';
      if (moduleOptions.indexOf(value) === -1) {
        throw new Error('Invalid \'modules\' option \'' + value + '\', not in ' + moduleOptions.join(', '));
      }
      this.modules_ = value;
    },
    scripts: []
  };
  var descriptions = {experimental: 'Turns on all experimental features'};
  function reset() {
    var allOff = arguments[0];
    var useDefault = allOff === undefined;
    Object.keys(options).forEach((function(name) {
      options[name] = useDefault && defaultValues[name];
    }));
  }
  function fromString(s) {
    fromArgv(s.split(/\s+/));
  }
  function fromArgv(args) {
    args.forEach(parseCommand);
  }
  function setFromObject(object) {
    Object.keys(object).forEach((function(name) {
      options[name] = object[name];
    }));
  }
  function coerceOptionValue(v) {
    switch (v) {
      case 'false':
        return false;
      case 'true':
      case true:
        return true;
      default:
        return !!v && String(v);
    }
  }
  function setOption(name, value) {
    name = toCamelCase(name);
    value = coerceOptionValue(value);
    if (name in options) {
      options[name] = value;
    } else {
      throw Error('Unknown option: ' + name);
    }
  }
  function addOptions(flags) {
    Object.keys(options).forEach(function(name) {
      var dashedName = toDashCase(name);
      if ((name in parseOptions) && (name in transformOptions)) {
        flags.option('--' + dashedName + ' [true|false|parse]', descriptions[name]);
        flags.on(dashedName, (function(value) {
          return setOption(dashedName, value);
        }));
      } else if (options[name] !== null) {
        flags.option('--' + dashedName, descriptions[name]);
        flags.on(dashedName, (function() {
          return setOption(dashedName, true);
        }));
      }
    });
    flags.option('--referrer <name>', 'Bracket output code with System.referrerName=<name>', (function(name) {
      setOption('referrer', name);
      return name;
    }));
    flags.option('--type-assertion-module <path>', 'Absolute path to the type assertion module.', (function(path) {
      setOption('type-assertion-module', path);
      return path;
    }));
    flags.option('--script <fileName>', 'Parse as Script (must precede modules)', (function(fileName) {
      options.scripts.push(fileName);
    }));
  }
  function filterOption(dashedName) {
    var name = toCamelCase(dashedName);
    return name === 'experimental' || !(name in options);
  }
  Object.defineProperties(options, {
    reset: {value: reset},
    fromString: {value: fromString},
    fromArgv: {value: fromArgv},
    setFromObject: {value: setFromObject},
    addOptions: {value: addOptions},
    filterOption: {value: filterOption}
  });
  function parseCommand(s) {
    var re = /--([^=]+)(?:=(.+))?/;
    var m = re.exec(s);
    if (m)
      setOption(m[1], m[2] || true);
  }
  function toCamelCase(s) {
    return s.replace(/-\w/g, function(ch) {
      return ch[1].toUpperCase();
    });
  }
  function toDashCase(s) {
    return s.replace(/[A-W]/g, function(ch) {
      return '-' + ch.toLowerCase();
    });
  }
  var EXPERIMENTAL = 0;
  var ON_BY_DEFAULT = 1;
  function addFeatureOption(name, kind) {
    if (kind === EXPERIMENTAL)
      experimentalOptions[name] = true;
    Object.defineProperty(parseOptions, name, {
      get: function() {
        return !!options[name];
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(transformOptions, name, {
      get: function() {
        var v = options[name];
        if (v === 'parse')
          return false;
        return v;
      },
      enumerable: true,
      configurable: true
    });
    var defaultValue = options[name] || kind === ON_BY_DEFAULT;
    options[name] = defaultValue;
    defaultValues[name] = defaultValue;
  }
  function addBoolOption(name) {
    defaultValues[name] = false;
    options[name] = false;
  }
  addFeatureOption('arrayComprehension', ON_BY_DEFAULT);
  addFeatureOption('arrowFunctions', ON_BY_DEFAULT);
  addFeatureOption('classes', ON_BY_DEFAULT);
  addFeatureOption('computedPropertyNames', ON_BY_DEFAULT);
  addFeatureOption('defaultParameters', ON_BY_DEFAULT);
  addFeatureOption('destructuring', ON_BY_DEFAULT);
  addFeatureOption('forOf', ON_BY_DEFAULT);
  addFeatureOption('generatorComprehension', ON_BY_DEFAULT);
  addFeatureOption('generators', ON_BY_DEFAULT);
  addFeatureOption('modules', ON_BY_DEFAULT);
  addFeatureOption('numericLiterals', ON_BY_DEFAULT);
  addFeatureOption('propertyMethods', ON_BY_DEFAULT);
  addFeatureOption('propertyNameShorthand', ON_BY_DEFAULT);
  addFeatureOption('restParameters', ON_BY_DEFAULT);
  addFeatureOption('spread', ON_BY_DEFAULT);
  addFeatureOption('templateLiterals', ON_BY_DEFAULT);
  addFeatureOption('asyncFunctions', EXPERIMENTAL);
  addFeatureOption('blockBinding', EXPERIMENTAL);
  addFeatureOption('symbols', EXPERIMENTAL);
  addFeatureOption('types', EXPERIMENTAL);
  addFeatureOption('annotations', EXPERIMENTAL);
  addBoolOption('commentCallback');
  addBoolOption('debug');
  addBoolOption('freeVariableChecker');
  addBoolOption('sourceMaps');
  addBoolOption('typeAssertions');
  addBoolOption('validate');
  defaultValues.referrer = '';
  options.referrer = null;
  defaultValues.typeAssertionModule = null;
  options.typeAssertionModule = null;
  return {
    get parseOptions() {
      return parseOptions;
    },
    get transformOptions() {
      return transformOptions;
    },
    get options() {
      return options;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/TokenType", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/TokenType";
  var AMPERSAND = '&';
  var AMPERSAND_EQUAL = '&=';
  var AND = '&&';
  var ARROW = '=>';
  var AT = '@';
  var BACK_QUOTE = '`';
  var BANG = '!';
  var BAR = '|';
  var BAR_EQUAL = '|=';
  var BREAK = 'break';
  var CARET = '^';
  var CARET_EQUAL = '^=';
  var CASE = 'case';
  var CATCH = 'catch';
  var CLASS = 'class';
  var CLOSE_ANGLE = '>';
  var CLOSE_CURLY = '}';
  var CLOSE_PAREN = ')';
  var CLOSE_SQUARE = ']';
  var COLON = ':';
  var COMMA = ',';
  var CONST = 'const';
  var CONTINUE = 'continue';
  var DEBUGGER = 'debugger';
  var DEFAULT = 'default';
  var DELETE = 'delete';
  var DO = 'do';
  var DOT_DOT_DOT = '...';
  var ELSE = 'else';
  var END_OF_FILE = 'End of File';
  var ENUM = 'enum';
  var EQUAL = '=';
  var EQUAL_EQUAL = '==';
  var EQUAL_EQUAL_EQUAL = '===';
  var ERROR = 'error';
  var EXPORT = 'export';
  var EXTENDS = 'extends';
  var FALSE = 'false';
  var FINALLY = 'finally';
  var FOR = 'for';
  var FUNCTION = 'function';
  var GREATER_EQUAL = '>=';
  var IDENTIFIER = 'identifier';
  var IF = 'if';
  var IMPLEMENTS = 'implements';
  var IMPORT = 'import';
  var IN = 'in';
  var INSTANCEOF = 'instanceof';
  var INTERFACE = 'interface';
  var LEFT_SHIFT = '<<';
  var LEFT_SHIFT_EQUAL = '<<=';
  var LESS_EQUAL = '<=';
  var LET = 'let';
  var MINUS = '-';
  var MINUS_EQUAL = '-=';
  var MINUS_MINUS = '--';
  var NEW = 'new';
  var NO_SUBSTITUTION_TEMPLATE = 'no substitution template';
  var NOT_EQUAL = '!=';
  var NOT_EQUAL_EQUAL = '!==';
  var NULL = 'null';
  var NUMBER = 'number literal';
  var OPEN_ANGLE = '<';
  var OPEN_CURLY = '{';
  var OPEN_PAREN = '(';
  var OPEN_SQUARE = '[';
  var OR = '||';
  var PACKAGE = 'package';
  var PERCENT = '%';
  var PERCENT_EQUAL = '%=';
  var PERIOD = '.';
  var PLUS = '+';
  var PLUS_EQUAL = '+=';
  var PLUS_PLUS = '++';
  var PRIVATE = 'private';
  var PROTECTED = 'protected';
  var PUBLIC = 'public';
  var QUESTION = '?';
  var REGULAR_EXPRESSION = 'regular expression literal';
  var RETURN = 'return';
  var RIGHT_SHIFT = '>>';
  var RIGHT_SHIFT_EQUAL = '>>=';
  var SEMI_COLON = ';';
  var SLASH = '/';
  var SLASH_EQUAL = '/=';
  var STAR = '*';
  var STAR_EQUAL = '*=';
  var STATIC = 'static';
  var STRING = 'string literal';
  var SUPER = 'super';
  var SWITCH = 'switch';
  var TEMPLATE_HEAD = 'template head';
  var TEMPLATE_MIDDLE = 'template middle';
  var TEMPLATE_TAIL = 'template tail';
  var THIS = 'this';
  var THROW = 'throw';
  var TILDE = '~';
  var TRUE = 'true';
  var TRY = 'try';
  var TYPEOF = 'typeof';
  var UNSIGNED_RIGHT_SHIFT = '>>>';
  var UNSIGNED_RIGHT_SHIFT_EQUAL = '>>>=';
  var VAR = 'var';
  var VOID = 'void';
  var WHILE = 'while';
  var WITH = 'with';
  var YIELD = 'yield';
  return {
    get AMPERSAND() {
      return AMPERSAND;
    },
    get AMPERSAND_EQUAL() {
      return AMPERSAND_EQUAL;
    },
    get AND() {
      return AND;
    },
    get ARROW() {
      return ARROW;
    },
    get AT() {
      return AT;
    },
    get BACK_QUOTE() {
      return BACK_QUOTE;
    },
    get BANG() {
      return BANG;
    },
    get BAR() {
      return BAR;
    },
    get BAR_EQUAL() {
      return BAR_EQUAL;
    },
    get BREAK() {
      return BREAK;
    },
    get CARET() {
      return CARET;
    },
    get CARET_EQUAL() {
      return CARET_EQUAL;
    },
    get CASE() {
      return CASE;
    },
    get CATCH() {
      return CATCH;
    },
    get CLASS() {
      return CLASS;
    },
    get CLOSE_ANGLE() {
      return CLOSE_ANGLE;
    },
    get CLOSE_CURLY() {
      return CLOSE_CURLY;
    },
    get CLOSE_PAREN() {
      return CLOSE_PAREN;
    },
    get CLOSE_SQUARE() {
      return CLOSE_SQUARE;
    },
    get COLON() {
      return COLON;
    },
    get COMMA() {
      return COMMA;
    },
    get CONST() {
      return CONST;
    },
    get CONTINUE() {
      return CONTINUE;
    },
    get DEBUGGER() {
      return DEBUGGER;
    },
    get DEFAULT() {
      return DEFAULT;
    },
    get DELETE() {
      return DELETE;
    },
    get DO() {
      return DO;
    },
    get DOT_DOT_DOT() {
      return DOT_DOT_DOT;
    },
    get ELSE() {
      return ELSE;
    },
    get END_OF_FILE() {
      return END_OF_FILE;
    },
    get ENUM() {
      return ENUM;
    },
    get EQUAL() {
      return EQUAL;
    },
    get EQUAL_EQUAL() {
      return EQUAL_EQUAL;
    },
    get EQUAL_EQUAL_EQUAL() {
      return EQUAL_EQUAL_EQUAL;
    },
    get ERROR() {
      return ERROR;
    },
    get EXPORT() {
      return EXPORT;
    },
    get EXTENDS() {
      return EXTENDS;
    },
    get FALSE() {
      return FALSE;
    },
    get FINALLY() {
      return FINALLY;
    },
    get FOR() {
      return FOR;
    },
    get FUNCTION() {
      return FUNCTION;
    },
    get GREATER_EQUAL() {
      return GREATER_EQUAL;
    },
    get IDENTIFIER() {
      return IDENTIFIER;
    },
    get IF() {
      return IF;
    },
    get IMPLEMENTS() {
      return IMPLEMENTS;
    },
    get IMPORT() {
      return IMPORT;
    },
    get IN() {
      return IN;
    },
    get INSTANCEOF() {
      return INSTANCEOF;
    },
    get INTERFACE() {
      return INTERFACE;
    },
    get LEFT_SHIFT() {
      return LEFT_SHIFT;
    },
    get LEFT_SHIFT_EQUAL() {
      return LEFT_SHIFT_EQUAL;
    },
    get LESS_EQUAL() {
      return LESS_EQUAL;
    },
    get LET() {
      return LET;
    },
    get MINUS() {
      return MINUS;
    },
    get MINUS_EQUAL() {
      return MINUS_EQUAL;
    },
    get MINUS_MINUS() {
      return MINUS_MINUS;
    },
    get NEW() {
      return NEW;
    },
    get NO_SUBSTITUTION_TEMPLATE() {
      return NO_SUBSTITUTION_TEMPLATE;
    },
    get NOT_EQUAL() {
      return NOT_EQUAL;
    },
    get NOT_EQUAL_EQUAL() {
      return NOT_EQUAL_EQUAL;
    },
    get NULL() {
      return NULL;
    },
    get NUMBER() {
      return NUMBER;
    },
    get OPEN_ANGLE() {
      return OPEN_ANGLE;
    },
    get OPEN_CURLY() {
      return OPEN_CURLY;
    },
    get OPEN_PAREN() {
      return OPEN_PAREN;
    },
    get OPEN_SQUARE() {
      return OPEN_SQUARE;
    },
    get OR() {
      return OR;
    },
    get PACKAGE() {
      return PACKAGE;
    },
    get PERCENT() {
      return PERCENT;
    },
    get PERCENT_EQUAL() {
      return PERCENT_EQUAL;
    },
    get PERIOD() {
      return PERIOD;
    },
    get PLUS() {
      return PLUS;
    },
    get PLUS_EQUAL() {
      return PLUS_EQUAL;
    },
    get PLUS_PLUS() {
      return PLUS_PLUS;
    },
    get PRIVATE() {
      return PRIVATE;
    },
    get PROTECTED() {
      return PROTECTED;
    },
    get PUBLIC() {
      return PUBLIC;
    },
    get QUESTION() {
      return QUESTION;
    },
    get REGULAR_EXPRESSION() {
      return REGULAR_EXPRESSION;
    },
    get RETURN() {
      return RETURN;
    },
    get RIGHT_SHIFT() {
      return RIGHT_SHIFT;
    },
    get RIGHT_SHIFT_EQUAL() {
      return RIGHT_SHIFT_EQUAL;
    },
    get SEMI_COLON() {
      return SEMI_COLON;
    },
    get SLASH() {
      return SLASH;
    },
    get SLASH_EQUAL() {
      return SLASH_EQUAL;
    },
    get STAR() {
      return STAR;
    },
    get STAR_EQUAL() {
      return STAR_EQUAL;
    },
    get STATIC() {
      return STATIC;
    },
    get STRING() {
      return STRING;
    },
    get SUPER() {
      return SUPER;
    },
    get SWITCH() {
      return SWITCH;
    },
    get TEMPLATE_HEAD() {
      return TEMPLATE_HEAD;
    },
    get TEMPLATE_MIDDLE() {
      return TEMPLATE_MIDDLE;
    },
    get TEMPLATE_TAIL() {
      return TEMPLATE_TAIL;
    },
    get THIS() {
      return THIS;
    },
    get THROW() {
      return THROW;
    },
    get TILDE() {
      return TILDE;
    },
    get TRUE() {
      return TRUE;
    },
    get TRY() {
      return TRY;
    },
    get TYPEOF() {
      return TYPEOF;
    },
    get UNSIGNED_RIGHT_SHIFT() {
      return UNSIGNED_RIGHT_SHIFT;
    },
    get UNSIGNED_RIGHT_SHIFT_EQUAL() {
      return UNSIGNED_RIGHT_SHIFT_EQUAL;
    },
    get VAR() {
      return VAR;
    },
    get VOID() {
      return VOID;
    },
    get WHILE() {
      return WHILE;
    },
    get WITH() {
      return WITH;
    },
    get YIELD() {
      return YIELD;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/Token", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/Token";
  var $__18 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AMPERSAND_EQUAL = $__18.AMPERSAND_EQUAL,
      BAR_EQUAL = $__18.BAR_EQUAL,
      CARET_EQUAL = $__18.CARET_EQUAL,
      EQUAL = $__18.EQUAL,
      LEFT_SHIFT_EQUAL = $__18.LEFT_SHIFT_EQUAL,
      MINUS_EQUAL = $__18.MINUS_EQUAL,
      PERCENT_EQUAL = $__18.PERCENT_EQUAL,
      PLUS_EQUAL = $__18.PLUS_EQUAL,
      RIGHT_SHIFT_EQUAL = $__18.RIGHT_SHIFT_EQUAL,
      SLASH_EQUAL = $__18.SLASH_EQUAL,
      STAR_EQUAL = $__18.STAR_EQUAL,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__18.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var Token = function Token(type, location) {
    this.type = type;
    this.location = location;
  };
  ($traceurRuntime.createClass)(Token, {
    toString: function() {
      return this.type;
    },
    isAssignmentOperator: function() {
      return isAssignmentOperator(this.type);
    },
    isKeyword: function() {
      return false;
    },
    isStrictKeyword: function() {
      return false;
    }
  }, {});
  function isAssignmentOperator(type) {
    switch (type) {
      case AMPERSAND_EQUAL:
      case BAR_EQUAL:
      case CARET_EQUAL:
      case EQUAL:
      case LEFT_SHIFT_EQUAL:
      case MINUS_EQUAL:
      case PERCENT_EQUAL:
      case PLUS_EQUAL:
      case RIGHT_SHIFT_EQUAL:
      case SLASH_EQUAL:
      case STAR_EQUAL:
      case UNSIGNED_RIGHT_SHIFT_EQUAL:
        return true;
    }
    return false;
  }
  return {
    get Token() {
      return Token;
    },
    get isAssignmentOperator() {
      return isAssignmentOperator;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/IdentifierToken", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/IdentifierToken";
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var IDENTIFIER = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).IDENTIFIER;
  var IdentifierToken = function IdentifierToken(location, value) {
    this.location = location;
    this.value = value;
  };
  ($traceurRuntime.createClass)(IdentifierToken, {
    toString: function() {
      return this.value;
    },
    get type() {
      return IDENTIFIER;
    }
  }, {}, Token);
  return {get IdentifierToken() {
      return IdentifierToken;
    }};
});
System.register("traceur@0.0.43/src/syntax/ParseTreeVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/ParseTreeVisitor";
  var ParseTreeVisitor = function ParseTreeVisitor() {};
  ($traceurRuntime.createClass)(ParseTreeVisitor, {
    visitAny: function(tree) {
      tree && tree.visit(this);
    },
    visit: function(tree) {
      this.visitAny(tree);
    },
    visitList: function(list) {
      if (list) {
        for (var i = 0; i < list.length; i++) {
          this.visitAny(list[i]);
        }
      }
    },
    visitStateMachine: function(tree) {
      throw Error('State machines should not live outside of the GeneratorTransformer.');
    },
    visitAnnotation: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.args);
    },
    visitAnonBlock: function(tree) {
      this.visitList(tree.statements);
    },
    visitArgumentList: function(tree) {
      this.visitList(tree.args);
    },
    visitArrayComprehension: function(tree) {
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
    },
    visitArrayLiteralExpression: function(tree) {
      this.visitList(tree.elements);
    },
    visitArrayPattern: function(tree) {
      this.visitList(tree.elements);
    },
    visitArrowFunctionExpression: function(tree) {
      this.visitAny(tree.parameterList);
      this.visitAny(tree.functionBody);
    },
    visitAwaitExpression: function(tree) {
      this.visitAny(tree.expression);
    },
    visitBinaryOperator: function(tree) {
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      this.visitAny(tree.binding);
      this.visitAny(tree.initializer);
    },
    visitBindingIdentifier: function(tree) {},
    visitBlock: function(tree) {
      this.visitList(tree.statements);
    },
    visitBreakStatement: function(tree) {},
    visitCallExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitCaseClause: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.statements);
    },
    visitCatch: function(tree) {
      this.visitAny(tree.binding);
      this.visitAny(tree.catchBody);
    },
    visitClassDeclaration: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
      this.visitList(tree.annotations);
    },
    visitClassExpression: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
      this.visitList(tree.annotations);
    },
    visitCommaExpression: function(tree) {
      this.visitList(tree.expressions);
    },
    visitComprehensionFor: function(tree) {
      this.visitAny(tree.left);
      this.visitAny(tree.iterator);
    },
    visitComprehensionIf: function(tree) {
      this.visitAny(tree.expression);
    },
    visitComputedPropertyName: function(tree) {
      this.visitAny(tree.expression);
    },
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitContinueStatement: function(tree) {},
    visitCoverFormals: function(tree) {
      this.visitList(tree.expressions);
    },
    visitCoverInitialisedName: function(tree) {
      this.visitAny(tree.initializer);
    },
    visitDebuggerStatement: function(tree) {},
    visitDefaultClause: function(tree) {
      this.visitList(tree.statements);
    },
    visitDoWhileStatement: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.condition);
    },
    visitEmptyStatement: function(tree) {},
    visitExportDeclaration: function(tree) {
      this.visitAny(tree.declaration);
      this.visitList(tree.annotations);
    },
    visitExportDefault: function(tree) {
      this.visitAny(tree.expression);
    },
    visitExportSpecifier: function(tree) {},
    visitExportSpecifierSet: function(tree) {
      this.visitList(tree.specifiers);
    },
    visitExportStar: function(tree) {},
    visitExpressionStatement: function(tree) {
      this.visitAny(tree.expression);
    },
    visitFinally: function(tree) {
      this.visitAny(tree.block);
    },
    visitForInStatement: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },
    visitForOfStatement: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.collection);
      this.visitAny(tree.body);
    },
    visitForStatement: function(tree) {
      this.visitAny(tree.initializer);
      this.visitAny(tree.condition);
      this.visitAny(tree.increment);
      this.visitAny(tree.body);
    },
    visitFormalParameter: function(tree) {
      this.visitAny(tree.parameter);
      this.visitAny(tree.typeAnnotation);
      this.visitList(tree.annotations);
    },
    visitFormalParameterList: function(tree) {
      this.visitList(tree.parameters);
    },
    visitFunctionBody: function(tree) {
      this.visitList(tree.statements);
    },
    visitFunctionDeclaration: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.parameterList);
      this.visitAny(tree.typeAnnotation);
      this.visitList(tree.annotations);
      this.visitAny(tree.functionBody);
    },
    visitFunctionExpression: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.parameterList);
      this.visitAny(tree.typeAnnotation);
      this.visitList(tree.annotations);
      this.visitAny(tree.functionBody);
    },
    visitGeneratorComprehension: function(tree) {
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
    },
    visitGetAccessor: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.typeAnnotation);
      this.visitList(tree.annotations);
      this.visitAny(tree.body);
    },
    visitIdentifierExpression: function(tree) {},
    visitIfStatement: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.ifClause);
      this.visitAny(tree.elseClause);
    },
    visitImportedBinding: function(tree) {
      this.visitAny(tree.binding);
    },
    visitImportDeclaration: function(tree) {
      this.visitAny(tree.importClause);
      this.visitAny(tree.moduleSpecifier);
    },
    visitImportSpecifier: function(tree) {},
    visitImportSpecifierSet: function(tree) {
      this.visitList(tree.specifiers);
    },
    visitLabelledStatement: function(tree) {
      this.visitAny(tree.statement);
    },
    visitLiteralExpression: function(tree) {},
    visitLiteralPropertyName: function(tree) {},
    visitMemberExpression: function(tree) {
      this.visitAny(tree.operand);
    },
    visitMemberLookupExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.memberExpression);
    },
    visitModule: function(tree) {
      this.visitList(tree.scriptItemList);
    },
    visitModuleDeclaration: function(tree) {
      this.visitAny(tree.expression);
    },
    visitModuleSpecifier: function(tree) {},
    visitNamedExport: function(tree) {
      this.visitAny(tree.moduleSpecifier);
      this.visitAny(tree.specifierSet);
    },
    visitNewExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      this.visitList(tree.propertyNameAndValues);
    },
    visitObjectPattern: function(tree) {
      this.visitList(tree.fields);
    },
    visitObjectPatternField: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.element);
    },
    visitParenExpression: function(tree) {
      this.visitAny(tree.expression);
    },
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
    },
    visitPredefinedType: function(tree) {},
    visitScript: function(tree) {
      this.visitList(tree.scriptItemList);
    },
    visitPropertyMethodAssignment: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.parameterList);
      this.visitAny(tree.typeAnnotation);
      this.visitList(tree.annotations);
      this.visitAny(tree.functionBody);
    },
    visitPropertyNameAssignment: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.value);
    },
    visitPropertyNameShorthand: function(tree) {},
    visitRestParameter: function(tree) {
      this.visitAny(tree.identifier);
    },
    visitReturnStatement: function(tree) {
      this.visitAny(tree.expression);
    },
    visitSetAccessor: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.parameterList);
      this.visitList(tree.annotations);
      this.visitAny(tree.body);
    },
    visitSpreadExpression: function(tree) {
      this.visitAny(tree.expression);
    },
    visitSpreadPatternElement: function(tree) {
      this.visitAny(tree.lvalue);
    },
    visitSuperExpression: function(tree) {},
    visitSwitchStatement: function(tree) {
      this.visitAny(tree.expression);
      this.visitList(tree.caseClauses);
    },
    visitSyntaxErrorTree: function(tree) {},
    visitTemplateLiteralExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitList(tree.elements);
    },
    visitTemplateLiteralPortion: function(tree) {},
    visitTemplateSubstitution: function(tree) {
      this.visitAny(tree.expression);
    },
    visitThisExpression: function(tree) {},
    visitThrowStatement: function(tree) {
      this.visitAny(tree.value);
    },
    visitTryStatement: function(tree) {
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },
    visitTypeName: function(tree) {
      this.visitAny(tree.moduleName);
    },
    visitUnaryExpression: function(tree) {
      this.visitAny(tree.operand);
    },
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      this.visitAny(tree.typeAnnotation);
      this.visitAny(tree.initializer);
    },
    visitVariableDeclarationList: function(tree) {
      this.visitList(tree.declarations);
    },
    visitVariableStatement: function(tree) {
      this.visitAny(tree.declarations);
    },
    visitWhileStatement: function(tree) {
      this.visitAny(tree.condition);
      this.visitAny(tree.body);
    },
    visitWithStatement: function(tree) {
      this.visitAny(tree.expression);
      this.visitAny(tree.body);
    },
    visitYieldExpression: function(tree) {
      this.visitAny(tree.expression);
    }
  }, {});
  return {get ParseTreeVisitor() {
      return ParseTreeVisitor;
    }};
});
System.register("traceur@0.0.43/src/syntax/PredefinedName", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/PredefinedName";
  var $ARGUMENTS = '$arguments';
  var ANY = 'any';
  var APPLY = 'apply';
  var ARGUMENTS = 'arguments';
  var ARRAY = 'Array';
  var AS = 'as';
  var ASYNC = 'async';
  var AWAIT = 'await';
  var BIND = 'bind';
  var CALL = 'call';
  var CONFIGURABLE = 'configurable';
  var CONSTRUCTOR = 'constructor';
  var CREATE = 'create';
  var CURRENT = 'current';
  var DEFINE_PROPERTIES = 'defineProperties';
  var DEFINE_PROPERTY = 'defineProperty';
  var ENUMERABLE = 'enumerable';
  var FREEZE = 'freeze';
  var FROM = 'from';
  var FUNCTION = 'Function';
  var GET = 'get';
  var HAS = 'has';
  var LENGTH = 'length';
  var MODULE = 'module';
  var NEW = 'new';
  var OBJECT = 'Object';
  var OBJECT_NAME = 'Object';
  var OF = 'of';
  var PREVENT_EXTENSIONS = 'preventExtensions';
  var PROTOTYPE = 'prototype';
  var PUSH = 'push';
  var RAW = 'raw';
  var SET = 'set';
  var SLICE = 'slice';
  var THIS = 'this';
  var TRACEUR_RUNTIME = '$traceurRuntime';
  var UNDEFINED = 'undefined';
  var WRITABLE = 'writable';
  function getParameterName(index) {
    return '$' + index;
  }
  ;
  return {
    get $ARGUMENTS() {
      return $ARGUMENTS;
    },
    get ANY() {
      return ANY;
    },
    get APPLY() {
      return APPLY;
    },
    get ARGUMENTS() {
      return ARGUMENTS;
    },
    get ARRAY() {
      return ARRAY;
    },
    get AS() {
      return AS;
    },
    get ASYNC() {
      return ASYNC;
    },
    get AWAIT() {
      return AWAIT;
    },
    get BIND() {
      return BIND;
    },
    get CALL() {
      return CALL;
    },
    get CONFIGURABLE() {
      return CONFIGURABLE;
    },
    get CONSTRUCTOR() {
      return CONSTRUCTOR;
    },
    get CREATE() {
      return CREATE;
    },
    get CURRENT() {
      return CURRENT;
    },
    get DEFINE_PROPERTIES() {
      return DEFINE_PROPERTIES;
    },
    get DEFINE_PROPERTY() {
      return DEFINE_PROPERTY;
    },
    get ENUMERABLE() {
      return ENUMERABLE;
    },
    get FREEZE() {
      return FREEZE;
    },
    get FROM() {
      return FROM;
    },
    get FUNCTION() {
      return FUNCTION;
    },
    get GET() {
      return GET;
    },
    get HAS() {
      return HAS;
    },
    get LENGTH() {
      return LENGTH;
    },
    get MODULE() {
      return MODULE;
    },
    get NEW() {
      return NEW;
    },
    get OBJECT() {
      return OBJECT;
    },
    get OBJECT_NAME() {
      return OBJECT_NAME;
    },
    get OF() {
      return OF;
    },
    get PREVENT_EXTENSIONS() {
      return PREVENT_EXTENSIONS;
    },
    get PROTOTYPE() {
      return PROTOTYPE;
    },
    get PUSH() {
      return PUSH;
    },
    get RAW() {
      return RAW;
    },
    get SET() {
      return SET;
    },
    get SLICE() {
      return SLICE;
    },
    get THIS() {
      return THIS;
    },
    get TRACEUR_RUNTIME() {
      return TRACEUR_RUNTIME;
    },
    get UNDEFINED() {
      return UNDEFINED;
    },
    get WRITABLE() {
      return WRITABLE;
    },
    get getParameterName() {
      return getParameterName;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/trees/ParseTreeType", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/trees/ParseTreeType";
  var ANNOTATION = 'ANNOTATION';
  var ANON_BLOCK = 'ANON_BLOCK';
  var ARGUMENT_LIST = 'ARGUMENT_LIST';
  var ARRAY_COMPREHENSION = 'ARRAY_COMPREHENSION';
  var ARRAY_LITERAL_EXPRESSION = 'ARRAY_LITERAL_EXPRESSION';
  var ARRAY_PATTERN = 'ARRAY_PATTERN';
  var ARROW_FUNCTION_EXPRESSION = 'ARROW_FUNCTION_EXPRESSION';
  var AWAIT_EXPRESSION = 'AWAIT_EXPRESSION';
  var BINARY_OPERATOR = 'BINARY_OPERATOR';
  var BINDING_ELEMENT = 'BINDING_ELEMENT';
  var BINDING_IDENTIFIER = 'BINDING_IDENTIFIER';
  var BLOCK = 'BLOCK';
  var BREAK_STATEMENT = 'BREAK_STATEMENT';
  var CALL_EXPRESSION = 'CALL_EXPRESSION';
  var CASE_CLAUSE = 'CASE_CLAUSE';
  var CATCH = 'CATCH';
  var CLASS_DECLARATION = 'CLASS_DECLARATION';
  var CLASS_EXPRESSION = 'CLASS_EXPRESSION';
  var COMMA_EXPRESSION = 'COMMA_EXPRESSION';
  var COMPREHENSION_FOR = 'COMPREHENSION_FOR';
  var COMPREHENSION_IF = 'COMPREHENSION_IF';
  var COMPUTED_PROPERTY_NAME = 'COMPUTED_PROPERTY_NAME';
  var CONDITIONAL_EXPRESSION = 'CONDITIONAL_EXPRESSION';
  var CONTINUE_STATEMENT = 'CONTINUE_STATEMENT';
  var COVER_FORMALS = 'COVER_FORMALS';
  var COVER_INITIALISED_NAME = 'COVER_INITIALISED_NAME';
  var DEBUGGER_STATEMENT = 'DEBUGGER_STATEMENT';
  var DEFAULT_CLAUSE = 'DEFAULT_CLAUSE';
  var DO_WHILE_STATEMENT = 'DO_WHILE_STATEMENT';
  var EMPTY_STATEMENT = 'EMPTY_STATEMENT';
  var EXPORT_DECLARATION = 'EXPORT_DECLARATION';
  var EXPORT_DEFAULT = 'EXPORT_DEFAULT';
  var EXPORT_SPECIFIER = 'EXPORT_SPECIFIER';
  var EXPORT_SPECIFIER_SET = 'EXPORT_SPECIFIER_SET';
  var EXPORT_STAR = 'EXPORT_STAR';
  var EXPRESSION_STATEMENT = 'EXPRESSION_STATEMENT';
  var FINALLY = 'FINALLY';
  var FOR_IN_STATEMENT = 'FOR_IN_STATEMENT';
  var FOR_OF_STATEMENT = 'FOR_OF_STATEMENT';
  var FOR_STATEMENT = 'FOR_STATEMENT';
  var FORMAL_PARAMETER = 'FORMAL_PARAMETER';
  var FORMAL_PARAMETER_LIST = 'FORMAL_PARAMETER_LIST';
  var FUNCTION_BODY = 'FUNCTION_BODY';
  var FUNCTION_DECLARATION = 'FUNCTION_DECLARATION';
  var FUNCTION_EXPRESSION = 'FUNCTION_EXPRESSION';
  var GENERATOR_COMPREHENSION = 'GENERATOR_COMPREHENSION';
  var GET_ACCESSOR = 'GET_ACCESSOR';
  var IDENTIFIER_EXPRESSION = 'IDENTIFIER_EXPRESSION';
  var IF_STATEMENT = 'IF_STATEMENT';
  var IMPORT_DECLARATION = 'IMPORT_DECLARATION';
  var IMPORT_SPECIFIER = 'IMPORT_SPECIFIER';
  var IMPORT_SPECIFIER_SET = 'IMPORT_SPECIFIER_SET';
  var IMPORTED_BINDING = 'IMPORTED_BINDING';
  var LABELLED_STATEMENT = 'LABELLED_STATEMENT';
  var LITERAL_EXPRESSION = 'LITERAL_EXPRESSION';
  var LITERAL_PROPERTY_NAME = 'LITERAL_PROPERTY_NAME';
  var MEMBER_EXPRESSION = 'MEMBER_EXPRESSION';
  var MEMBER_LOOKUP_EXPRESSION = 'MEMBER_LOOKUP_EXPRESSION';
  var MODULE = 'MODULE';
  var MODULE_DECLARATION = 'MODULE_DECLARATION';
  var MODULE_SPECIFIER = 'MODULE_SPECIFIER';
  var NAMED_EXPORT = 'NAMED_EXPORT';
  var NEW_EXPRESSION = 'NEW_EXPRESSION';
  var OBJECT_LITERAL_EXPRESSION = 'OBJECT_LITERAL_EXPRESSION';
  var OBJECT_PATTERN = 'OBJECT_PATTERN';
  var OBJECT_PATTERN_FIELD = 'OBJECT_PATTERN_FIELD';
  var PAREN_EXPRESSION = 'PAREN_EXPRESSION';
  var POSTFIX_EXPRESSION = 'POSTFIX_EXPRESSION';
  var PREDEFINED_TYPE = 'PREDEFINED_TYPE';
  var PROPERTY_METHOD_ASSIGNMENT = 'PROPERTY_METHOD_ASSIGNMENT';
  var PROPERTY_NAME_ASSIGNMENT = 'PROPERTY_NAME_ASSIGNMENT';
  var PROPERTY_NAME_SHORTHAND = 'PROPERTY_NAME_SHORTHAND';
  var REST_PARAMETER = 'REST_PARAMETER';
  var RETURN_STATEMENT = 'RETURN_STATEMENT';
  var SCRIPT = 'SCRIPT';
  var SET_ACCESSOR = 'SET_ACCESSOR';
  var SPREAD_EXPRESSION = 'SPREAD_EXPRESSION';
  var SPREAD_PATTERN_ELEMENT = 'SPREAD_PATTERN_ELEMENT';
  var STATE_MACHINE = 'STATE_MACHINE';
  var SUPER_EXPRESSION = 'SUPER_EXPRESSION';
  var SWITCH_STATEMENT = 'SWITCH_STATEMENT';
  var SYNTAX_ERROR_TREE = 'SYNTAX_ERROR_TREE';
  var TEMPLATE_LITERAL_EXPRESSION = 'TEMPLATE_LITERAL_EXPRESSION';
  var TEMPLATE_LITERAL_PORTION = 'TEMPLATE_LITERAL_PORTION';
  var TEMPLATE_SUBSTITUTION = 'TEMPLATE_SUBSTITUTION';
  var THIS_EXPRESSION = 'THIS_EXPRESSION';
  var THROW_STATEMENT = 'THROW_STATEMENT';
  var TRY_STATEMENT = 'TRY_STATEMENT';
  var TYPE_NAME = 'TYPE_NAME';
  var UNARY_EXPRESSION = 'UNARY_EXPRESSION';
  var VARIABLE_DECLARATION = 'VARIABLE_DECLARATION';
  var VARIABLE_DECLARATION_LIST = 'VARIABLE_DECLARATION_LIST';
  var VARIABLE_STATEMENT = 'VARIABLE_STATEMENT';
  var WHILE_STATEMENT = 'WHILE_STATEMENT';
  var WITH_STATEMENT = 'WITH_STATEMENT';
  var YIELD_EXPRESSION = 'YIELD_EXPRESSION';
  return {
    get ANNOTATION() {
      return ANNOTATION;
    },
    get ANON_BLOCK() {
      return ANON_BLOCK;
    },
    get ARGUMENT_LIST() {
      return ARGUMENT_LIST;
    },
    get ARRAY_COMPREHENSION() {
      return ARRAY_COMPREHENSION;
    },
    get ARRAY_LITERAL_EXPRESSION() {
      return ARRAY_LITERAL_EXPRESSION;
    },
    get ARRAY_PATTERN() {
      return ARRAY_PATTERN;
    },
    get ARROW_FUNCTION_EXPRESSION() {
      return ARROW_FUNCTION_EXPRESSION;
    },
    get AWAIT_EXPRESSION() {
      return AWAIT_EXPRESSION;
    },
    get BINARY_OPERATOR() {
      return BINARY_OPERATOR;
    },
    get BINDING_ELEMENT() {
      return BINDING_ELEMENT;
    },
    get BINDING_IDENTIFIER() {
      return BINDING_IDENTIFIER;
    },
    get BLOCK() {
      return BLOCK;
    },
    get BREAK_STATEMENT() {
      return BREAK_STATEMENT;
    },
    get CALL_EXPRESSION() {
      return CALL_EXPRESSION;
    },
    get CASE_CLAUSE() {
      return CASE_CLAUSE;
    },
    get CATCH() {
      return CATCH;
    },
    get CLASS_DECLARATION() {
      return CLASS_DECLARATION;
    },
    get CLASS_EXPRESSION() {
      return CLASS_EXPRESSION;
    },
    get COMMA_EXPRESSION() {
      return COMMA_EXPRESSION;
    },
    get COMPREHENSION_FOR() {
      return COMPREHENSION_FOR;
    },
    get COMPREHENSION_IF() {
      return COMPREHENSION_IF;
    },
    get COMPUTED_PROPERTY_NAME() {
      return COMPUTED_PROPERTY_NAME;
    },
    get CONDITIONAL_EXPRESSION() {
      return CONDITIONAL_EXPRESSION;
    },
    get CONTINUE_STATEMENT() {
      return CONTINUE_STATEMENT;
    },
    get COVER_FORMALS() {
      return COVER_FORMALS;
    },
    get COVER_INITIALISED_NAME() {
      return COVER_INITIALISED_NAME;
    },
    get DEBUGGER_STATEMENT() {
      return DEBUGGER_STATEMENT;
    },
    get DEFAULT_CLAUSE() {
      return DEFAULT_CLAUSE;
    },
    get DO_WHILE_STATEMENT() {
      return DO_WHILE_STATEMENT;
    },
    get EMPTY_STATEMENT() {
      return EMPTY_STATEMENT;
    },
    get EXPORT_DECLARATION() {
      return EXPORT_DECLARATION;
    },
    get EXPORT_DEFAULT() {
      return EXPORT_DEFAULT;
    },
    get EXPORT_SPECIFIER() {
      return EXPORT_SPECIFIER;
    },
    get EXPORT_SPECIFIER_SET() {
      return EXPORT_SPECIFIER_SET;
    },
    get EXPORT_STAR() {
      return EXPORT_STAR;
    },
    get EXPRESSION_STATEMENT() {
      return EXPRESSION_STATEMENT;
    },
    get FINALLY() {
      return FINALLY;
    },
    get FOR_IN_STATEMENT() {
      return FOR_IN_STATEMENT;
    },
    get FOR_OF_STATEMENT() {
      return FOR_OF_STATEMENT;
    },
    get FOR_STATEMENT() {
      return FOR_STATEMENT;
    },
    get FORMAL_PARAMETER() {
      return FORMAL_PARAMETER;
    },
    get FORMAL_PARAMETER_LIST() {
      return FORMAL_PARAMETER_LIST;
    },
    get FUNCTION_BODY() {
      return FUNCTION_BODY;
    },
    get FUNCTION_DECLARATION() {
      return FUNCTION_DECLARATION;
    },
    get FUNCTION_EXPRESSION() {
      return FUNCTION_EXPRESSION;
    },
    get GENERATOR_COMPREHENSION() {
      return GENERATOR_COMPREHENSION;
    },
    get GET_ACCESSOR() {
      return GET_ACCESSOR;
    },
    get IDENTIFIER_EXPRESSION() {
      return IDENTIFIER_EXPRESSION;
    },
    get IF_STATEMENT() {
      return IF_STATEMENT;
    },
    get IMPORT_DECLARATION() {
      return IMPORT_DECLARATION;
    },
    get IMPORT_SPECIFIER() {
      return IMPORT_SPECIFIER;
    },
    get IMPORT_SPECIFIER_SET() {
      return IMPORT_SPECIFIER_SET;
    },
    get IMPORTED_BINDING() {
      return IMPORTED_BINDING;
    },
    get LABELLED_STATEMENT() {
      return LABELLED_STATEMENT;
    },
    get LITERAL_EXPRESSION() {
      return LITERAL_EXPRESSION;
    },
    get LITERAL_PROPERTY_NAME() {
      return LITERAL_PROPERTY_NAME;
    },
    get MEMBER_EXPRESSION() {
      return MEMBER_EXPRESSION;
    },
    get MEMBER_LOOKUP_EXPRESSION() {
      return MEMBER_LOOKUP_EXPRESSION;
    },
    get MODULE() {
      return MODULE;
    },
    get MODULE_DECLARATION() {
      return MODULE_DECLARATION;
    },
    get MODULE_SPECIFIER() {
      return MODULE_SPECIFIER;
    },
    get NAMED_EXPORT() {
      return NAMED_EXPORT;
    },
    get NEW_EXPRESSION() {
      return NEW_EXPRESSION;
    },
    get OBJECT_LITERAL_EXPRESSION() {
      return OBJECT_LITERAL_EXPRESSION;
    },
    get OBJECT_PATTERN() {
      return OBJECT_PATTERN;
    },
    get OBJECT_PATTERN_FIELD() {
      return OBJECT_PATTERN_FIELD;
    },
    get PAREN_EXPRESSION() {
      return PAREN_EXPRESSION;
    },
    get POSTFIX_EXPRESSION() {
      return POSTFIX_EXPRESSION;
    },
    get PREDEFINED_TYPE() {
      return PREDEFINED_TYPE;
    },
    get PROPERTY_METHOD_ASSIGNMENT() {
      return PROPERTY_METHOD_ASSIGNMENT;
    },
    get PROPERTY_NAME_ASSIGNMENT() {
      return PROPERTY_NAME_ASSIGNMENT;
    },
    get PROPERTY_NAME_SHORTHAND() {
      return PROPERTY_NAME_SHORTHAND;
    },
    get REST_PARAMETER() {
      return REST_PARAMETER;
    },
    get RETURN_STATEMENT() {
      return RETURN_STATEMENT;
    },
    get SCRIPT() {
      return SCRIPT;
    },
    get SET_ACCESSOR() {
      return SET_ACCESSOR;
    },
    get SPREAD_EXPRESSION() {
      return SPREAD_EXPRESSION;
    },
    get SPREAD_PATTERN_ELEMENT() {
      return SPREAD_PATTERN_ELEMENT;
    },
    get STATE_MACHINE() {
      return STATE_MACHINE;
    },
    get SUPER_EXPRESSION() {
      return SUPER_EXPRESSION;
    },
    get SWITCH_STATEMENT() {
      return SWITCH_STATEMENT;
    },
    get SYNTAX_ERROR_TREE() {
      return SYNTAX_ERROR_TREE;
    },
    get TEMPLATE_LITERAL_EXPRESSION() {
      return TEMPLATE_LITERAL_EXPRESSION;
    },
    get TEMPLATE_LITERAL_PORTION() {
      return TEMPLATE_LITERAL_PORTION;
    },
    get TEMPLATE_SUBSTITUTION() {
      return TEMPLATE_SUBSTITUTION;
    },
    get THIS_EXPRESSION() {
      return THIS_EXPRESSION;
    },
    get THROW_STATEMENT() {
      return THROW_STATEMENT;
    },
    get TRY_STATEMENT() {
      return TRY_STATEMENT;
    },
    get TYPE_NAME() {
      return TYPE_NAME;
    },
    get UNARY_EXPRESSION() {
      return UNARY_EXPRESSION;
    },
    get VARIABLE_DECLARATION() {
      return VARIABLE_DECLARATION;
    },
    get VARIABLE_DECLARATION_LIST() {
      return VARIABLE_DECLARATION_LIST;
    },
    get VARIABLE_STATEMENT() {
      return VARIABLE_STATEMENT;
    },
    get WHILE_STATEMENT() {
      return WHILE_STATEMENT;
    },
    get WITH_STATEMENT() {
      return WITH_STATEMENT;
    },
    get YIELD_EXPRESSION() {
      return YIELD_EXPRESSION;
    }
  };
});
System.register("traceur@0.0.43/src/util/JSON", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/JSON";
  function transform(v) {
    var replacer = arguments[1] !== (void 0) ? arguments[1] : (function(k, v) {
      return v;
    });
    return transform_(replacer('', v), replacer);
  }
  function transform_(v, replacer) {
    var rv,
        tv;
    if (Array.isArray(v)) {
      var len = v.length;
      rv = Array(len);
      for (var i = 0; i < len; i++) {
        tv = transform_(replacer(String(i), v[i]), replacer);
        rv[i] = tv === undefined ? null : tv;
      }
      return rv;
    }
    if (v instanceof Object) {
      rv = {};
      Object.keys(v).forEach((function(k) {
        tv = transform_(replacer(k, v[k]), replacer);
        if (tv !== undefined) {
          rv[k] = tv;
        }
      }));
      return rv;
    }
    return v;
  }
  return {get transform() {
      return transform;
    }};
});
System.register("traceur@0.0.43/src/syntax/trees/ParseTree", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/trees/ParseTree";
  var ParseTreeType = System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType");
  var $__23 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      IDENTIFIER = $__23.IDENTIFIER,
      STAR = $__23.STAR,
      STRING = $__23.STRING,
      VAR = $__23.VAR;
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var utilJSON = System.get("traceur@0.0.43/src/util/JSON");
  var ASYNC = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).ASYNC;
  var $__23 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      ARGUMENT_LIST = $__23.ARGUMENT_LIST,
      ARRAY_COMPREHENSION = $__23.ARRAY_COMPREHENSION,
      ARRAY_LITERAL_EXPRESSION = $__23.ARRAY_LITERAL_EXPRESSION,
      ARRAY_PATTERN = $__23.ARRAY_PATTERN,
      ARROW_FUNCTION_EXPRESSION = $__23.ARROW_FUNCTION_EXPRESSION,
      AWAIT_EXPRESSION = $__23.AWAIT_EXPRESSION,
      BINARY_OPERATOR = $__23.BINARY_OPERATOR,
      BINDING_ELEMENT = $__23.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__23.BINDING_IDENTIFIER,
      BLOCK = $__23.BLOCK,
      BREAK_STATEMENT = $__23.BREAK_STATEMENT,
      CALL_EXPRESSION = $__23.CALL_EXPRESSION,
      CASE_CLAUSE = $__23.CASE_CLAUSE,
      CATCH = $__23.CATCH,
      CLASS_DECLARATION = $__23.CLASS_DECLARATION,
      CLASS_EXPRESSION = $__23.CLASS_EXPRESSION,
      COMMA_EXPRESSION = $__23.COMMA_EXPRESSION,
      COMPREHENSION_FOR = $__23.COMPREHENSION_FOR,
      COMPREHENSION_IF = $__23.COMPREHENSION_IF,
      COMPUTED_PROPERTY_NAME = $__23.COMPUTED_PROPERTY_NAME,
      CONDITIONAL_EXPRESSION = $__23.CONDITIONAL_EXPRESSION,
      CONTINUE_STATEMENT = $__23.CONTINUE_STATEMENT,
      COVER_FORMALS = $__23.COVER_FORMALS,
      COVER_INITIALISED_NAME = $__23.COVER_INITIALISED_NAME,
      DEBUGGER_STATEMENT = $__23.DEBUGGER_STATEMENT,
      DEFAULT_CLAUSE = $__23.DEFAULT_CLAUSE,
      DO_WHILE_STATEMENT = $__23.DO_WHILE_STATEMENT,
      EMPTY_STATEMENT = $__23.EMPTY_STATEMENT,
      EXPORT_DECLARATION = $__23.EXPORT_DECLARATION,
      EXPORT_SPECIFIER = $__23.EXPORT_SPECIFIER,
      EXPORT_SPECIFIER_SET = $__23.EXPORT_SPECIFIER_SET,
      EXPORT_STAR = $__23.EXPORT_STAR,
      EXPRESSION_STATEMENT = $__23.EXPRESSION_STATEMENT,
      FINALLY = $__23.FINALLY,
      FOR_IN_STATEMENT = $__23.FOR_IN_STATEMENT,
      FOR_OF_STATEMENT = $__23.FOR_OF_STATEMENT,
      FOR_STATEMENT = $__23.FOR_STATEMENT,
      FORMAL_PARAMETER = $__23.FORMAL_PARAMETER,
      FORMAL_PARAMETER_LIST = $__23.FORMAL_PARAMETER_LIST,
      FUNCTION_BODY = $__23.FUNCTION_BODY,
      FUNCTION_DECLARATION = $__23.FUNCTION_DECLARATION,
      FUNCTION_EXPRESSION = $__23.FUNCTION_EXPRESSION,
      GENERATOR_COMPREHENSION = $__23.GENERATOR_COMPREHENSION,
      GET_ACCESSOR = $__23.GET_ACCESSOR,
      IDENTIFIER_EXPRESSION = $__23.IDENTIFIER_EXPRESSION,
      IF_STATEMENT = $__23.IF_STATEMENT,
      IMPORT_DECLARATION = $__23.IMPORT_DECLARATION,
      IMPORT_SPECIFIER = $__23.IMPORT_SPECIFIER,
      IMPORT_SPECIFIER_SET = $__23.IMPORT_SPECIFIER_SET,
      LABELLED_STATEMENT = $__23.LABELLED_STATEMENT,
      LITERAL_EXPRESSION = $__23.LITERAL_EXPRESSION,
      LITERAL_PROPERTY_NAME = $__23.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__23.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__23.MEMBER_LOOKUP_EXPRESSION,
      MODULE = $__23.MODULE,
      MODULE_DECLARATION = $__23.MODULE_DECLARATION,
      MODULE_SPECIFIER = $__23.MODULE_SPECIFIER,
      NAMED_EXPORT = $__23.NAMED_EXPORT,
      NEW_EXPRESSION = $__23.NEW_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__23.OBJECT_LITERAL_EXPRESSION,
      OBJECT_PATTERN = $__23.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__23.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__23.PAREN_EXPRESSION,
      POSTFIX_EXPRESSION = $__23.POSTFIX_EXPRESSION,
      PREDEFINED_TYPE = $__23.PREDEFINED_TYPE,
      PROPERTY_METHOD_ASSIGNMENT = $__23.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__23.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__23.PROPERTY_NAME_SHORTHAND,
      REST_PARAMETER = $__23.REST_PARAMETER,
      RETURN_STATEMENT = $__23.RETURN_STATEMENT,
      SCRIPT = $__23.SCRIPT,
      SET_ACCESSOR = $__23.SET_ACCESSOR,
      SPREAD_EXPRESSION = $__23.SPREAD_EXPRESSION,
      SPREAD_PATTERN_ELEMENT = $__23.SPREAD_PATTERN_ELEMENT,
      STATE_MACHINE = $__23.STATE_MACHINE,
      SUPER_EXPRESSION = $__23.SUPER_EXPRESSION,
      SWITCH_STATEMENT = $__23.SWITCH_STATEMENT,
      SYNTAX_ERROR_TREE = $__23.SYNTAX_ERROR_TREE,
      TEMPLATE_LITERAL_EXPRESSION = $__23.TEMPLATE_LITERAL_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__23.TEMPLATE_LITERAL_PORTION,
      TEMPLATE_SUBSTITUTION = $__23.TEMPLATE_SUBSTITUTION,
      THIS_EXPRESSION = $__23.THIS_EXPRESSION,
      THROW_STATEMENT = $__23.THROW_STATEMENT,
      TRY_STATEMENT = $__23.TRY_STATEMENT,
      TYPE_NAME = $__23.TYPE_NAME,
      UNARY_EXPRESSION = $__23.UNARY_EXPRESSION,
      VARIABLE_DECLARATION = $__23.VARIABLE_DECLARATION,
      VARIABLE_DECLARATION_LIST = $__23.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__23.VARIABLE_STATEMENT,
      WHILE_STATEMENT = $__23.WHILE_STATEMENT,
      WITH_STATEMENT = $__23.WITH_STATEMENT,
      YIELD_EXPRESSION = $__23.YIELD_EXPRESSION;
  ;
  var ParseTree = function ParseTree(type, location) {
    throw new Error("Don't use for now. 'super' is currently very slow.");
    this.type = type;
    this.location = location;
  };
  var $ParseTree = ParseTree;
  ($traceurRuntime.createClass)(ParseTree, {
    isPattern: function() {
      switch (this.type) {
        case ARRAY_PATTERN:
        case OBJECT_PATTERN:
          return true;
        case PAREN_EXPRESSION:
          return this.expression.isPattern();
        default:
          return false;
      }
    },
    isLeftHandSideExpression: function() {
      switch (this.type) {
        case THIS_EXPRESSION:
        case CLASS_EXPRESSION:
        case SUPER_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case ARRAY_LITERAL_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case NEW_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case CALL_EXPRESSION:
        case FUNCTION_EXPRESSION:
        case TEMPLATE_LITERAL_EXPRESSION:
          return true;
        case PAREN_EXPRESSION:
          return this.expression.isLeftHandSideExpression();
        default:
          return false;
      }
    },
    isAssignmentExpression: function() {
      switch (this.type) {
        case ARRAY_COMPREHENSION:
        case ARRAY_LITERAL_EXPRESSION:
        case ARROW_FUNCTION_EXPRESSION:
        case AWAIT_EXPRESSION:
        case BINARY_OPERATOR:
        case CALL_EXPRESSION:
        case CLASS_EXPRESSION:
        case CONDITIONAL_EXPRESSION:
        case FUNCTION_EXPRESSION:
        case GENERATOR_COMPREHENSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case NEW_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case PAREN_EXPRESSION:
        case POSTFIX_EXPRESSION:
        case TEMPLATE_LITERAL_EXPRESSION:
        case SUPER_EXPRESSION:
        case THIS_EXPRESSION:
        case UNARY_EXPRESSION:
        case YIELD_EXPRESSION:
          return true;
        default:
          return false;
      }
    },
    isMemberExpression: function() {
      switch (this.type) {
        case THIS_EXPRESSION:
        case CLASS_EXPRESSION:
        case SUPER_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case ARRAY_LITERAL_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case PAREN_EXPRESSION:
        case TEMPLATE_LITERAL_EXPRESSION:
        case FUNCTION_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case MEMBER_EXPRESSION:
        case CALL_EXPRESSION:
          return true;
        case NEW_EXPRESSION:
          return this.args != null;
      }
      return false;
    },
    isExpression: function() {
      return this.isAssignmentExpression() || this.type == COMMA_EXPRESSION;
    },
    isAssignmentOrSpread: function() {
      return this.isAssignmentExpression() || this.type == SPREAD_EXPRESSION;
    },
    isRestParameter: function() {
      return this.type == REST_PARAMETER || (this.type == FORMAL_PARAMETER && this.parameter.isRestParameter());
    },
    isSpreadPatternElement: function() {
      return this.type == SPREAD_PATTERN_ELEMENT;
    },
    isStatementListItem: function() {
      return this.isStatement() || this.isDeclaration();
    },
    isStatement: function() {
      switch (this.type) {
        case BLOCK:
        case VARIABLE_STATEMENT:
        case EMPTY_STATEMENT:
        case EXPRESSION_STATEMENT:
        case IF_STATEMENT:
        case CONTINUE_STATEMENT:
        case BREAK_STATEMENT:
        case RETURN_STATEMENT:
        case WITH_STATEMENT:
        case LABELLED_STATEMENT:
        case THROW_STATEMENT:
        case TRY_STATEMENT:
        case DEBUGGER_STATEMENT:
          return true;
      }
      return this.isBreakableStatement();
    },
    isDeclaration: function() {
      switch (this.type) {
        case FUNCTION_DECLARATION:
        case CLASS_DECLARATION:
          return true;
      }
      return this.isLexicalDeclaration();
    },
    isLexicalDeclaration: function() {
      switch (this.type) {
        case VARIABLE_STATEMENT:
          return this.declarations.declarationType !== VAR;
      }
      return false;
    },
    isBreakableStatement: function() {
      switch (this.type) {
        case SWITCH_STATEMENT:
          return true;
      }
      return this.isIterationStatement();
    },
    isIterationStatement: function() {
      switch (this.type) {
        case DO_WHILE_STATEMENT:
        case FOR_IN_STATEMENT:
        case FOR_OF_STATEMENT:
        case FOR_STATEMENT:
        case WHILE_STATEMENT:
          return true;
      }
      return false;
    },
    isScriptElement: function() {
      switch (this.type) {
        case CLASS_DECLARATION:
        case EXPORT_DECLARATION:
        case FUNCTION_DECLARATION:
        case IMPORT_DECLARATION:
        case MODULE_DECLARATION:
        case VARIABLE_DECLARATION:
          return true;
      }
      return this.isStatement();
    },
    isGenerator: function() {
      return this.functionKind !== null && this.functionKind.type === STAR;
    },
    isAsyncFunction: function() {
      return this.functionKind !== null && this.functionKind.type === IDENTIFIER && this.functionKind.value === ASYNC;
    },
    getDirectivePrologueStringToken_: function() {
      var tree = this;
      if (tree.type !== EXPRESSION_STATEMENT || !(tree = tree.expression))
        return null;
      if (tree.type !== LITERAL_EXPRESSION || !(tree = tree.literalToken))
        return null;
      if (tree.type !== STRING)
        return null;
      return tree;
    },
    isDirectivePrologue: function() {
      return this.getDirectivePrologueStringToken_() !== null;
    },
    isUseStrictDirective: function() {
      var token = this.getDirectivePrologueStringToken_();
      if (!token)
        return false;
      var v = token.value;
      return v === '"use strict"' || v === "'use strict'";
    },
    toJSON: function() {
      return utilJSON.transform(this, $ParseTree.replacer);
    },
    stringify: function() {
      var indent = arguments[0] !== (void 0) ? arguments[0] : 2;
      return JSON.stringify(this, $ParseTree.replacer, indent);
    }
  }, {
    stripLocation: function(key, value) {
      if (key === 'location') {
        return undefined;
      }
      return value;
    },
    replacer: function(k, v) {
      if (v instanceof $ParseTree || v instanceof Token) {
        var rv = {type: v.type};
        Object.keys(v).forEach(function(name) {
          if (name !== 'location')
            rv[name] = v[name];
        });
        return rv;
      }
      return v;
    }
  });
  return {
    get ParseTreeType() {
      return ParseTreeType;
    },
    get ParseTree() {
      return ParseTree;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/trees/ParseTrees", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/trees/ParseTrees";
  var ParseTree = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTree")).ParseTree;
  var ParseTreeType = System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType");
  var ANNOTATION = ParseTreeType.ANNOTATION;
  var Annotation = function Annotation(location, name, args) {
    this.location = location;
    this.name = name;
    this.args = args;
  };
  ($traceurRuntime.createClass)(Annotation, {
    transform: function(transformer) {
      return transformer.transformAnnotation(this);
    },
    visit: function(visitor) {
      visitor.visitAnnotation(this);
    },
    get type() {
      return ANNOTATION;
    }
  }, {}, ParseTree);
  var ANON_BLOCK = ParseTreeType.ANON_BLOCK;
  var AnonBlock = function AnonBlock(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  ($traceurRuntime.createClass)(AnonBlock, {
    transform: function(transformer) {
      return transformer.transformAnonBlock(this);
    },
    visit: function(visitor) {
      visitor.visitAnonBlock(this);
    },
    get type() {
      return ANON_BLOCK;
    }
  }, {}, ParseTree);
  var ARGUMENT_LIST = ParseTreeType.ARGUMENT_LIST;
  var ArgumentList = function ArgumentList(location, args) {
    this.location = location;
    this.args = args;
  };
  ($traceurRuntime.createClass)(ArgumentList, {
    transform: function(transformer) {
      return transformer.transformArgumentList(this);
    },
    visit: function(visitor) {
      visitor.visitArgumentList(this);
    },
    get type() {
      return ARGUMENT_LIST;
    }
  }, {}, ParseTree);
  var ARRAY_COMPREHENSION = ParseTreeType.ARRAY_COMPREHENSION;
  var ArrayComprehension = function ArrayComprehension(location, comprehensionList, expression) {
    this.location = location;
    this.comprehensionList = comprehensionList;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ArrayComprehension, {
    transform: function(transformer) {
      return transformer.transformArrayComprehension(this);
    },
    visit: function(visitor) {
      visitor.visitArrayComprehension(this);
    },
    get type() {
      return ARRAY_COMPREHENSION;
    }
  }, {}, ParseTree);
  var ARRAY_LITERAL_EXPRESSION = ParseTreeType.ARRAY_LITERAL_EXPRESSION;
  var ArrayLiteralExpression = function ArrayLiteralExpression(location, elements) {
    this.location = location;
    this.elements = elements;
  };
  ($traceurRuntime.createClass)(ArrayLiteralExpression, {
    transform: function(transformer) {
      return transformer.transformArrayLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitArrayLiteralExpression(this);
    },
    get type() {
      return ARRAY_LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var ARRAY_PATTERN = ParseTreeType.ARRAY_PATTERN;
  var ArrayPattern = function ArrayPattern(location, elements) {
    this.location = location;
    this.elements = elements;
  };
  ($traceurRuntime.createClass)(ArrayPattern, {
    transform: function(transformer) {
      return transformer.transformArrayPattern(this);
    },
    visit: function(visitor) {
      visitor.visitArrayPattern(this);
    },
    get type() {
      return ARRAY_PATTERN;
    }
  }, {}, ParseTree);
  var ARROW_FUNCTION_EXPRESSION = ParseTreeType.ARROW_FUNCTION_EXPRESSION;
  var ArrowFunctionExpression = function ArrowFunctionExpression(location, parameterList, functionBody) {
    this.location = location;
    this.parameterList = parameterList;
    this.functionBody = functionBody;
  };
  ($traceurRuntime.createClass)(ArrowFunctionExpression, {
    transform: function(transformer) {
      return transformer.transformArrowFunctionExpression(this);
    },
    visit: function(visitor) {
      visitor.visitArrowFunctionExpression(this);
    },
    get type() {
      return ARROW_FUNCTION_EXPRESSION;
    }
  }, {}, ParseTree);
  var AWAIT_EXPRESSION = ParseTreeType.AWAIT_EXPRESSION;
  var AwaitExpression = function AwaitExpression(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(AwaitExpression, {
    transform: function(transformer) {
      return transformer.transformAwaitExpression(this);
    },
    visit: function(visitor) {
      visitor.visitAwaitExpression(this);
    },
    get type() {
      return AWAIT_EXPRESSION;
    }
  }, {}, ParseTree);
  var BINARY_OPERATOR = ParseTreeType.BINARY_OPERATOR;
  var BinaryOperator = function BinaryOperator(location, left, operator, right) {
    this.location = location;
    this.left = left;
    this.operator = operator;
    this.right = right;
  };
  ($traceurRuntime.createClass)(BinaryOperator, {
    transform: function(transformer) {
      return transformer.transformBinaryOperator(this);
    },
    visit: function(visitor) {
      visitor.visitBinaryOperator(this);
    },
    get type() {
      return BINARY_OPERATOR;
    }
  }, {}, ParseTree);
  var BINDING_ELEMENT = ParseTreeType.BINDING_ELEMENT;
  var BindingElement = function BindingElement(location, binding, initializer) {
    this.location = location;
    this.binding = binding;
    this.initializer = initializer;
  };
  ($traceurRuntime.createClass)(BindingElement, {
    transform: function(transformer) {
      return transformer.transformBindingElement(this);
    },
    visit: function(visitor) {
      visitor.visitBindingElement(this);
    },
    get type() {
      return BINDING_ELEMENT;
    }
  }, {}, ParseTree);
  var BINDING_IDENTIFIER = ParseTreeType.BINDING_IDENTIFIER;
  var BindingIdentifier = function BindingIdentifier(location, identifierToken) {
    this.location = location;
    this.identifierToken = identifierToken;
  };
  ($traceurRuntime.createClass)(BindingIdentifier, {
    transform: function(transformer) {
      return transformer.transformBindingIdentifier(this);
    },
    visit: function(visitor) {
      visitor.visitBindingIdentifier(this);
    },
    get type() {
      return BINDING_IDENTIFIER;
    }
  }, {}, ParseTree);
  var BLOCK = ParseTreeType.BLOCK;
  var Block = function Block(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  ($traceurRuntime.createClass)(Block, {
    transform: function(transformer) {
      return transformer.transformBlock(this);
    },
    visit: function(visitor) {
      visitor.visitBlock(this);
    },
    get type() {
      return BLOCK;
    }
  }, {}, ParseTree);
  var BREAK_STATEMENT = ParseTreeType.BREAK_STATEMENT;
  var BreakStatement = function BreakStatement(location, name) {
    this.location = location;
    this.name = name;
  };
  ($traceurRuntime.createClass)(BreakStatement, {
    transform: function(transformer) {
      return transformer.transformBreakStatement(this);
    },
    visit: function(visitor) {
      visitor.visitBreakStatement(this);
    },
    get type() {
      return BREAK_STATEMENT;
    }
  }, {}, ParseTree);
  var CALL_EXPRESSION = ParseTreeType.CALL_EXPRESSION;
  var CallExpression = function CallExpression(location, operand, args) {
    this.location = location;
    this.operand = operand;
    this.args = args;
  };
  ($traceurRuntime.createClass)(CallExpression, {
    transform: function(transformer) {
      return transformer.transformCallExpression(this);
    },
    visit: function(visitor) {
      visitor.visitCallExpression(this);
    },
    get type() {
      return CALL_EXPRESSION;
    }
  }, {}, ParseTree);
  var CASE_CLAUSE = ParseTreeType.CASE_CLAUSE;
  var CaseClause = function CaseClause(location, expression, statements) {
    this.location = location;
    this.expression = expression;
    this.statements = statements;
  };
  ($traceurRuntime.createClass)(CaseClause, {
    transform: function(transformer) {
      return transformer.transformCaseClause(this);
    },
    visit: function(visitor) {
      visitor.visitCaseClause(this);
    },
    get type() {
      return CASE_CLAUSE;
    }
  }, {}, ParseTree);
  var CATCH = ParseTreeType.CATCH;
  var Catch = function Catch(location, binding, catchBody) {
    this.location = location;
    this.binding = binding;
    this.catchBody = catchBody;
  };
  ($traceurRuntime.createClass)(Catch, {
    transform: function(transformer) {
      return transformer.transformCatch(this);
    },
    visit: function(visitor) {
      visitor.visitCatch(this);
    },
    get type() {
      return CATCH;
    }
  }, {}, ParseTree);
  var CLASS_DECLARATION = ParseTreeType.CLASS_DECLARATION;
  var ClassDeclaration = function ClassDeclaration(location, name, superClass, elements, annotations) {
    this.location = location;
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
    this.annotations = annotations;
  };
  ($traceurRuntime.createClass)(ClassDeclaration, {
    transform: function(transformer) {
      return transformer.transformClassDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitClassDeclaration(this);
    },
    get type() {
      return CLASS_DECLARATION;
    }
  }, {}, ParseTree);
  var CLASS_EXPRESSION = ParseTreeType.CLASS_EXPRESSION;
  var ClassExpression = function ClassExpression(location, name, superClass, elements, annotations) {
    this.location = location;
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
    this.annotations = annotations;
  };
  ($traceurRuntime.createClass)(ClassExpression, {
    transform: function(transformer) {
      return transformer.transformClassExpression(this);
    },
    visit: function(visitor) {
      visitor.visitClassExpression(this);
    },
    get type() {
      return CLASS_EXPRESSION;
    }
  }, {}, ParseTree);
  var COMMA_EXPRESSION = ParseTreeType.COMMA_EXPRESSION;
  var CommaExpression = function CommaExpression(location, expressions) {
    this.location = location;
    this.expressions = expressions;
  };
  ($traceurRuntime.createClass)(CommaExpression, {
    transform: function(transformer) {
      return transformer.transformCommaExpression(this);
    },
    visit: function(visitor) {
      visitor.visitCommaExpression(this);
    },
    get type() {
      return COMMA_EXPRESSION;
    }
  }, {}, ParseTree);
  var COMPREHENSION_FOR = ParseTreeType.COMPREHENSION_FOR;
  var ComprehensionFor = function ComprehensionFor(location, left, iterator) {
    this.location = location;
    this.left = left;
    this.iterator = iterator;
  };
  ($traceurRuntime.createClass)(ComprehensionFor, {
    transform: function(transformer) {
      return transformer.transformComprehensionFor(this);
    },
    visit: function(visitor) {
      visitor.visitComprehensionFor(this);
    },
    get type() {
      return COMPREHENSION_FOR;
    }
  }, {}, ParseTree);
  var COMPREHENSION_IF = ParseTreeType.COMPREHENSION_IF;
  var ComprehensionIf = function ComprehensionIf(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ComprehensionIf, {
    transform: function(transformer) {
      return transformer.transformComprehensionIf(this);
    },
    visit: function(visitor) {
      visitor.visitComprehensionIf(this);
    },
    get type() {
      return COMPREHENSION_IF;
    }
  }, {}, ParseTree);
  var COMPUTED_PROPERTY_NAME = ParseTreeType.COMPUTED_PROPERTY_NAME;
  var ComputedPropertyName = function ComputedPropertyName(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ComputedPropertyName, {
    transform: function(transformer) {
      return transformer.transformComputedPropertyName(this);
    },
    visit: function(visitor) {
      visitor.visitComputedPropertyName(this);
    },
    get type() {
      return COMPUTED_PROPERTY_NAME;
    }
  }, {}, ParseTree);
  var CONDITIONAL_EXPRESSION = ParseTreeType.CONDITIONAL_EXPRESSION;
  var ConditionalExpression = function ConditionalExpression(location, condition, left, right) {
    this.location = location;
    this.condition = condition;
    this.left = left;
    this.right = right;
  };
  ($traceurRuntime.createClass)(ConditionalExpression, {
    transform: function(transformer) {
      return transformer.transformConditionalExpression(this);
    },
    visit: function(visitor) {
      visitor.visitConditionalExpression(this);
    },
    get type() {
      return CONDITIONAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var CONTINUE_STATEMENT = ParseTreeType.CONTINUE_STATEMENT;
  var ContinueStatement = function ContinueStatement(location, name) {
    this.location = location;
    this.name = name;
  };
  ($traceurRuntime.createClass)(ContinueStatement, {
    transform: function(transformer) {
      return transformer.transformContinueStatement(this);
    },
    visit: function(visitor) {
      visitor.visitContinueStatement(this);
    },
    get type() {
      return CONTINUE_STATEMENT;
    }
  }, {}, ParseTree);
  var COVER_FORMALS = ParseTreeType.COVER_FORMALS;
  var CoverFormals = function CoverFormals(location, expressions) {
    this.location = location;
    this.expressions = expressions;
  };
  ($traceurRuntime.createClass)(CoverFormals, {
    transform: function(transformer) {
      return transformer.transformCoverFormals(this);
    },
    visit: function(visitor) {
      visitor.visitCoverFormals(this);
    },
    get type() {
      return COVER_FORMALS;
    }
  }, {}, ParseTree);
  var COVER_INITIALISED_NAME = ParseTreeType.COVER_INITIALISED_NAME;
  var CoverInitialisedName = function CoverInitialisedName(location, name, equalToken, initializer) {
    this.location = location;
    this.name = name;
    this.equalToken = equalToken;
    this.initializer = initializer;
  };
  ($traceurRuntime.createClass)(CoverInitialisedName, {
    transform: function(transformer) {
      return transformer.transformCoverInitialisedName(this);
    },
    visit: function(visitor) {
      visitor.visitCoverInitialisedName(this);
    },
    get type() {
      return COVER_INITIALISED_NAME;
    }
  }, {}, ParseTree);
  var DEBUGGER_STATEMENT = ParseTreeType.DEBUGGER_STATEMENT;
  var DebuggerStatement = function DebuggerStatement(location) {
    this.location = location;
  };
  ($traceurRuntime.createClass)(DebuggerStatement, {
    transform: function(transformer) {
      return transformer.transformDebuggerStatement(this);
    },
    visit: function(visitor) {
      visitor.visitDebuggerStatement(this);
    },
    get type() {
      return DEBUGGER_STATEMENT;
    }
  }, {}, ParseTree);
  var DEFAULT_CLAUSE = ParseTreeType.DEFAULT_CLAUSE;
  var DefaultClause = function DefaultClause(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  ($traceurRuntime.createClass)(DefaultClause, {
    transform: function(transformer) {
      return transformer.transformDefaultClause(this);
    },
    visit: function(visitor) {
      visitor.visitDefaultClause(this);
    },
    get type() {
      return DEFAULT_CLAUSE;
    }
  }, {}, ParseTree);
  var DO_WHILE_STATEMENT = ParseTreeType.DO_WHILE_STATEMENT;
  var DoWhileStatement = function DoWhileStatement(location, body, condition) {
    this.location = location;
    this.body = body;
    this.condition = condition;
  };
  ($traceurRuntime.createClass)(DoWhileStatement, {
    transform: function(transformer) {
      return transformer.transformDoWhileStatement(this);
    },
    visit: function(visitor) {
      visitor.visitDoWhileStatement(this);
    },
    get type() {
      return DO_WHILE_STATEMENT;
    }
  }, {}, ParseTree);
  var EMPTY_STATEMENT = ParseTreeType.EMPTY_STATEMENT;
  var EmptyStatement = function EmptyStatement(location) {
    this.location = location;
  };
  ($traceurRuntime.createClass)(EmptyStatement, {
    transform: function(transformer) {
      return transformer.transformEmptyStatement(this);
    },
    visit: function(visitor) {
      visitor.visitEmptyStatement(this);
    },
    get type() {
      return EMPTY_STATEMENT;
    }
  }, {}, ParseTree);
  var EXPORT_DECLARATION = ParseTreeType.EXPORT_DECLARATION;
  var ExportDeclaration = function ExportDeclaration(location, declaration, annotations) {
    this.location = location;
    this.declaration = declaration;
    this.annotations = annotations;
  };
  ($traceurRuntime.createClass)(ExportDeclaration, {
    transform: function(transformer) {
      return transformer.transformExportDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitExportDeclaration(this);
    },
    get type() {
      return EXPORT_DECLARATION;
    }
  }, {}, ParseTree);
  var EXPORT_DEFAULT = ParseTreeType.EXPORT_DEFAULT;
  var ExportDefault = function ExportDefault(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ExportDefault, {
    transform: function(transformer) {
      return transformer.transformExportDefault(this);
    },
    visit: function(visitor) {
      visitor.visitExportDefault(this);
    },
    get type() {
      return EXPORT_DEFAULT;
    }
  }, {}, ParseTree);
  var EXPORT_SPECIFIER = ParseTreeType.EXPORT_SPECIFIER;
  var ExportSpecifier = function ExportSpecifier(location, lhs, rhs) {
    this.location = location;
    this.lhs = lhs;
    this.rhs = rhs;
  };
  ($traceurRuntime.createClass)(ExportSpecifier, {
    transform: function(transformer) {
      return transformer.transformExportSpecifier(this);
    },
    visit: function(visitor) {
      visitor.visitExportSpecifier(this);
    },
    get type() {
      return EXPORT_SPECIFIER;
    }
  }, {}, ParseTree);
  var EXPORT_SPECIFIER_SET = ParseTreeType.EXPORT_SPECIFIER_SET;
  var ExportSpecifierSet = function ExportSpecifierSet(location, specifiers) {
    this.location = location;
    this.specifiers = specifiers;
  };
  ($traceurRuntime.createClass)(ExportSpecifierSet, {
    transform: function(transformer) {
      return transformer.transformExportSpecifierSet(this);
    },
    visit: function(visitor) {
      visitor.visitExportSpecifierSet(this);
    },
    get type() {
      return EXPORT_SPECIFIER_SET;
    }
  }, {}, ParseTree);
  var EXPORT_STAR = ParseTreeType.EXPORT_STAR;
  var ExportStar = function ExportStar(location) {
    this.location = location;
  };
  ($traceurRuntime.createClass)(ExportStar, {
    transform: function(transformer) {
      return transformer.transformExportStar(this);
    },
    visit: function(visitor) {
      visitor.visitExportStar(this);
    },
    get type() {
      return EXPORT_STAR;
    }
  }, {}, ParseTree);
  var EXPRESSION_STATEMENT = ParseTreeType.EXPRESSION_STATEMENT;
  var ExpressionStatement = function ExpressionStatement(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ExpressionStatement, {
    transform: function(transformer) {
      return transformer.transformExpressionStatement(this);
    },
    visit: function(visitor) {
      visitor.visitExpressionStatement(this);
    },
    get type() {
      return EXPRESSION_STATEMENT;
    }
  }, {}, ParseTree);
  var FINALLY = ParseTreeType.FINALLY;
  var Finally = function Finally(location, block) {
    this.location = location;
    this.block = block;
  };
  ($traceurRuntime.createClass)(Finally, {
    transform: function(transformer) {
      return transformer.transformFinally(this);
    },
    visit: function(visitor) {
      visitor.visitFinally(this);
    },
    get type() {
      return FINALLY;
    }
  }, {}, ParseTree);
  var FOR_IN_STATEMENT = ParseTreeType.FOR_IN_STATEMENT;
  var ForInStatement = function ForInStatement(location, initializer, collection, body) {
    this.location = location;
    this.initializer = initializer;
    this.collection = collection;
    this.body = body;
  };
  ($traceurRuntime.createClass)(ForInStatement, {
    transform: function(transformer) {
      return transformer.transformForInStatement(this);
    },
    visit: function(visitor) {
      visitor.visitForInStatement(this);
    },
    get type() {
      return FOR_IN_STATEMENT;
    }
  }, {}, ParseTree);
  var FOR_OF_STATEMENT = ParseTreeType.FOR_OF_STATEMENT;
  var ForOfStatement = function ForOfStatement(location, initializer, collection, body) {
    this.location = location;
    this.initializer = initializer;
    this.collection = collection;
    this.body = body;
  };
  ($traceurRuntime.createClass)(ForOfStatement, {
    transform: function(transformer) {
      return transformer.transformForOfStatement(this);
    },
    visit: function(visitor) {
      visitor.visitForOfStatement(this);
    },
    get type() {
      return FOR_OF_STATEMENT;
    }
  }, {}, ParseTree);
  var FOR_STATEMENT = ParseTreeType.FOR_STATEMENT;
  var ForStatement = function ForStatement(location, initializer, condition, increment, body) {
    this.location = location;
    this.initializer = initializer;
    this.condition = condition;
    this.increment = increment;
    this.body = body;
  };
  ($traceurRuntime.createClass)(ForStatement, {
    transform: function(transformer) {
      return transformer.transformForStatement(this);
    },
    visit: function(visitor) {
      visitor.visitForStatement(this);
    },
    get type() {
      return FOR_STATEMENT;
    }
  }, {}, ParseTree);
  var FORMAL_PARAMETER = ParseTreeType.FORMAL_PARAMETER;
  var FormalParameter = function FormalParameter(location, parameter, typeAnnotation, annotations) {
    this.location = location;
    this.parameter = parameter;
    this.typeAnnotation = typeAnnotation;
    this.annotations = annotations;
  };
  ($traceurRuntime.createClass)(FormalParameter, {
    transform: function(transformer) {
      return transformer.transformFormalParameter(this);
    },
    visit: function(visitor) {
      visitor.visitFormalParameter(this);
    },
    get type() {
      return FORMAL_PARAMETER;
    }
  }, {}, ParseTree);
  var FORMAL_PARAMETER_LIST = ParseTreeType.FORMAL_PARAMETER_LIST;
  var FormalParameterList = function FormalParameterList(location, parameters) {
    this.location = location;
    this.parameters = parameters;
  };
  ($traceurRuntime.createClass)(FormalParameterList, {
    transform: function(transformer) {
      return transformer.transformFormalParameterList(this);
    },
    visit: function(visitor) {
      visitor.visitFormalParameterList(this);
    },
    get type() {
      return FORMAL_PARAMETER_LIST;
    }
  }, {}, ParseTree);
  var FUNCTION_BODY = ParseTreeType.FUNCTION_BODY;
  var FunctionBody = function FunctionBody(location, statements) {
    this.location = location;
    this.statements = statements;
  };
  ($traceurRuntime.createClass)(FunctionBody, {
    transform: function(transformer) {
      return transformer.transformFunctionBody(this);
    },
    visit: function(visitor) {
      visitor.visitFunctionBody(this);
    },
    get type() {
      return FUNCTION_BODY;
    }
  }, {}, ParseTree);
  var FUNCTION_DECLARATION = ParseTreeType.FUNCTION_DECLARATION;
  var FunctionDeclaration = function FunctionDeclaration(location, name, functionKind, parameterList, typeAnnotation, annotations, functionBody) {
    this.location = location;
    this.name = name;
    this.functionKind = functionKind;
    this.parameterList = parameterList;
    this.typeAnnotation = typeAnnotation;
    this.annotations = annotations;
    this.functionBody = functionBody;
  };
  ($traceurRuntime.createClass)(FunctionDeclaration, {
    transform: function(transformer) {
      return transformer.transformFunctionDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitFunctionDeclaration(this);
    },
    get type() {
      return FUNCTION_DECLARATION;
    }
  }, {}, ParseTree);
  var FUNCTION_EXPRESSION = ParseTreeType.FUNCTION_EXPRESSION;
  var FunctionExpression = function FunctionExpression(location, name, functionKind, parameterList, typeAnnotation, annotations, functionBody) {
    this.location = location;
    this.name = name;
    this.functionKind = functionKind;
    this.parameterList = parameterList;
    this.typeAnnotation = typeAnnotation;
    this.annotations = annotations;
    this.functionBody = functionBody;
  };
  ($traceurRuntime.createClass)(FunctionExpression, {
    transform: function(transformer) {
      return transformer.transformFunctionExpression(this);
    },
    visit: function(visitor) {
      visitor.visitFunctionExpression(this);
    },
    get type() {
      return FUNCTION_EXPRESSION;
    }
  }, {}, ParseTree);
  var GENERATOR_COMPREHENSION = ParseTreeType.GENERATOR_COMPREHENSION;
  var GeneratorComprehension = function GeneratorComprehension(location, comprehensionList, expression) {
    this.location = location;
    this.comprehensionList = comprehensionList;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(GeneratorComprehension, {
    transform: function(transformer) {
      return transformer.transformGeneratorComprehension(this);
    },
    visit: function(visitor) {
      visitor.visitGeneratorComprehension(this);
    },
    get type() {
      return GENERATOR_COMPREHENSION;
    }
  }, {}, ParseTree);
  var GET_ACCESSOR = ParseTreeType.GET_ACCESSOR;
  var GetAccessor = function GetAccessor(location, isStatic, name, typeAnnotation, annotations, body) {
    this.location = location;
    this.isStatic = isStatic;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.annotations = annotations;
    this.body = body;
  };
  ($traceurRuntime.createClass)(GetAccessor, {
    transform: function(transformer) {
      return transformer.transformGetAccessor(this);
    },
    visit: function(visitor) {
      visitor.visitGetAccessor(this);
    },
    get type() {
      return GET_ACCESSOR;
    }
  }, {}, ParseTree);
  var IDENTIFIER_EXPRESSION = ParseTreeType.IDENTIFIER_EXPRESSION;
  var IdentifierExpression = function IdentifierExpression(location, identifierToken) {
    this.location = location;
    this.identifierToken = identifierToken;
  };
  ($traceurRuntime.createClass)(IdentifierExpression, {
    transform: function(transformer) {
      return transformer.transformIdentifierExpression(this);
    },
    visit: function(visitor) {
      visitor.visitIdentifierExpression(this);
    },
    get type() {
      return IDENTIFIER_EXPRESSION;
    }
  }, {}, ParseTree);
  var IF_STATEMENT = ParseTreeType.IF_STATEMENT;
  var IfStatement = function IfStatement(location, condition, ifClause, elseClause) {
    this.location = location;
    this.condition = condition;
    this.ifClause = ifClause;
    this.elseClause = elseClause;
  };
  ($traceurRuntime.createClass)(IfStatement, {
    transform: function(transformer) {
      return transformer.transformIfStatement(this);
    },
    visit: function(visitor) {
      visitor.visitIfStatement(this);
    },
    get type() {
      return IF_STATEMENT;
    }
  }, {}, ParseTree);
  var IMPORTED_BINDING = ParseTreeType.IMPORTED_BINDING;
  var ImportedBinding = function ImportedBinding(location, binding) {
    this.location = location;
    this.binding = binding;
  };
  ($traceurRuntime.createClass)(ImportedBinding, {
    transform: function(transformer) {
      return transformer.transformImportedBinding(this);
    },
    visit: function(visitor) {
      visitor.visitImportedBinding(this);
    },
    get type() {
      return IMPORTED_BINDING;
    }
  }, {}, ParseTree);
  var IMPORT_DECLARATION = ParseTreeType.IMPORT_DECLARATION;
  var ImportDeclaration = function ImportDeclaration(location, importClause, moduleSpecifier) {
    this.location = location;
    this.importClause = importClause;
    this.moduleSpecifier = moduleSpecifier;
  };
  ($traceurRuntime.createClass)(ImportDeclaration, {
    transform: function(transformer) {
      return transformer.transformImportDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitImportDeclaration(this);
    },
    get type() {
      return IMPORT_DECLARATION;
    }
  }, {}, ParseTree);
  var IMPORT_SPECIFIER = ParseTreeType.IMPORT_SPECIFIER;
  var ImportSpecifier = function ImportSpecifier(location, lhs, rhs) {
    this.location = location;
    this.lhs = lhs;
    this.rhs = rhs;
  };
  ($traceurRuntime.createClass)(ImportSpecifier, {
    transform: function(transformer) {
      return transformer.transformImportSpecifier(this);
    },
    visit: function(visitor) {
      visitor.visitImportSpecifier(this);
    },
    get type() {
      return IMPORT_SPECIFIER;
    }
  }, {}, ParseTree);
  var IMPORT_SPECIFIER_SET = ParseTreeType.IMPORT_SPECIFIER_SET;
  var ImportSpecifierSet = function ImportSpecifierSet(location, specifiers) {
    this.location = location;
    this.specifiers = specifiers;
  };
  ($traceurRuntime.createClass)(ImportSpecifierSet, {
    transform: function(transformer) {
      return transformer.transformImportSpecifierSet(this);
    },
    visit: function(visitor) {
      visitor.visitImportSpecifierSet(this);
    },
    get type() {
      return IMPORT_SPECIFIER_SET;
    }
  }, {}, ParseTree);
  var LABELLED_STATEMENT = ParseTreeType.LABELLED_STATEMENT;
  var LabelledStatement = function LabelledStatement(location, name, statement) {
    this.location = location;
    this.name = name;
    this.statement = statement;
  };
  ($traceurRuntime.createClass)(LabelledStatement, {
    transform: function(transformer) {
      return transformer.transformLabelledStatement(this);
    },
    visit: function(visitor) {
      visitor.visitLabelledStatement(this);
    },
    get type() {
      return LABELLED_STATEMENT;
    }
  }, {}, ParseTree);
  var LITERAL_EXPRESSION = ParseTreeType.LITERAL_EXPRESSION;
  var LiteralExpression = function LiteralExpression(location, literalToken) {
    this.location = location;
    this.literalToken = literalToken;
  };
  ($traceurRuntime.createClass)(LiteralExpression, {
    transform: function(transformer) {
      return transformer.transformLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitLiteralExpression(this);
    },
    get type() {
      return LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var LITERAL_PROPERTY_NAME = ParseTreeType.LITERAL_PROPERTY_NAME;
  var LiteralPropertyName = function LiteralPropertyName(location, literalToken) {
    this.location = location;
    this.literalToken = literalToken;
  };
  ($traceurRuntime.createClass)(LiteralPropertyName, {
    transform: function(transformer) {
      return transformer.transformLiteralPropertyName(this);
    },
    visit: function(visitor) {
      visitor.visitLiteralPropertyName(this);
    },
    get type() {
      return LITERAL_PROPERTY_NAME;
    }
  }, {}, ParseTree);
  var MEMBER_EXPRESSION = ParseTreeType.MEMBER_EXPRESSION;
  var MemberExpression = function MemberExpression(location, operand, memberName) {
    this.location = location;
    this.operand = operand;
    this.memberName = memberName;
  };
  ($traceurRuntime.createClass)(MemberExpression, {
    transform: function(transformer) {
      return transformer.transformMemberExpression(this);
    },
    visit: function(visitor) {
      visitor.visitMemberExpression(this);
    },
    get type() {
      return MEMBER_EXPRESSION;
    }
  }, {}, ParseTree);
  var MEMBER_LOOKUP_EXPRESSION = ParseTreeType.MEMBER_LOOKUP_EXPRESSION;
  var MemberLookupExpression = function MemberLookupExpression(location, operand, memberExpression) {
    this.location = location;
    this.operand = operand;
    this.memberExpression = memberExpression;
  };
  ($traceurRuntime.createClass)(MemberLookupExpression, {
    transform: function(transformer) {
      return transformer.transformMemberLookupExpression(this);
    },
    visit: function(visitor) {
      visitor.visitMemberLookupExpression(this);
    },
    get type() {
      return MEMBER_LOOKUP_EXPRESSION;
    }
  }, {}, ParseTree);
  var MODULE = ParseTreeType.MODULE;
  var Module = function Module(location, scriptItemList, moduleName) {
    this.location = location;
    this.scriptItemList = scriptItemList;
    this.moduleName = moduleName;
  };
  ($traceurRuntime.createClass)(Module, {
    transform: function(transformer) {
      return transformer.transformModule(this);
    },
    visit: function(visitor) {
      visitor.visitModule(this);
    },
    get type() {
      return MODULE;
    }
  }, {}, ParseTree);
  var MODULE_DECLARATION = ParseTreeType.MODULE_DECLARATION;
  var ModuleDeclaration = function ModuleDeclaration(location, identifier, expression) {
    this.location = location;
    this.identifier = identifier;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ModuleDeclaration, {
    transform: function(transformer) {
      return transformer.transformModuleDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitModuleDeclaration(this);
    },
    get type() {
      return MODULE_DECLARATION;
    }
  }, {}, ParseTree);
  var MODULE_SPECIFIER = ParseTreeType.MODULE_SPECIFIER;
  var ModuleSpecifier = function ModuleSpecifier(location, token) {
    this.location = location;
    this.token = token;
  };
  ($traceurRuntime.createClass)(ModuleSpecifier, {
    transform: function(transformer) {
      return transformer.transformModuleSpecifier(this);
    },
    visit: function(visitor) {
      visitor.visitModuleSpecifier(this);
    },
    get type() {
      return MODULE_SPECIFIER;
    }
  }, {}, ParseTree);
  var NAMED_EXPORT = ParseTreeType.NAMED_EXPORT;
  var NamedExport = function NamedExport(location, moduleSpecifier, specifierSet) {
    this.location = location;
    this.moduleSpecifier = moduleSpecifier;
    this.specifierSet = specifierSet;
  };
  ($traceurRuntime.createClass)(NamedExport, {
    transform: function(transformer) {
      return transformer.transformNamedExport(this);
    },
    visit: function(visitor) {
      visitor.visitNamedExport(this);
    },
    get type() {
      return NAMED_EXPORT;
    }
  }, {}, ParseTree);
  var NEW_EXPRESSION = ParseTreeType.NEW_EXPRESSION;
  var NewExpression = function NewExpression(location, operand, args) {
    this.location = location;
    this.operand = operand;
    this.args = args;
  };
  ($traceurRuntime.createClass)(NewExpression, {
    transform: function(transformer) {
      return transformer.transformNewExpression(this);
    },
    visit: function(visitor) {
      visitor.visitNewExpression(this);
    },
    get type() {
      return NEW_EXPRESSION;
    }
  }, {}, ParseTree);
  var OBJECT_LITERAL_EXPRESSION = ParseTreeType.OBJECT_LITERAL_EXPRESSION;
  var ObjectLiteralExpression = function ObjectLiteralExpression(location, propertyNameAndValues) {
    this.location = location;
    this.propertyNameAndValues = propertyNameAndValues;
  };
  ($traceurRuntime.createClass)(ObjectLiteralExpression, {
    transform: function(transformer) {
      return transformer.transformObjectLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitObjectLiteralExpression(this);
    },
    get type() {
      return OBJECT_LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var OBJECT_PATTERN = ParseTreeType.OBJECT_PATTERN;
  var ObjectPattern = function ObjectPattern(location, fields) {
    this.location = location;
    this.fields = fields;
  };
  ($traceurRuntime.createClass)(ObjectPattern, {
    transform: function(transformer) {
      return transformer.transformObjectPattern(this);
    },
    visit: function(visitor) {
      visitor.visitObjectPattern(this);
    },
    get type() {
      return OBJECT_PATTERN;
    }
  }, {}, ParseTree);
  var OBJECT_PATTERN_FIELD = ParseTreeType.OBJECT_PATTERN_FIELD;
  var ObjectPatternField = function ObjectPatternField(location, name, element) {
    this.location = location;
    this.name = name;
    this.element = element;
  };
  ($traceurRuntime.createClass)(ObjectPatternField, {
    transform: function(transformer) {
      return transformer.transformObjectPatternField(this);
    },
    visit: function(visitor) {
      visitor.visitObjectPatternField(this);
    },
    get type() {
      return OBJECT_PATTERN_FIELD;
    }
  }, {}, ParseTree);
  var PAREN_EXPRESSION = ParseTreeType.PAREN_EXPRESSION;
  var ParenExpression = function ParenExpression(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ParenExpression, {
    transform: function(transformer) {
      return transformer.transformParenExpression(this);
    },
    visit: function(visitor) {
      visitor.visitParenExpression(this);
    },
    get type() {
      return PAREN_EXPRESSION;
    }
  }, {}, ParseTree);
  var POSTFIX_EXPRESSION = ParseTreeType.POSTFIX_EXPRESSION;
  var PostfixExpression = function PostfixExpression(location, operand, operator) {
    this.location = location;
    this.operand = operand;
    this.operator = operator;
  };
  ($traceurRuntime.createClass)(PostfixExpression, {
    transform: function(transformer) {
      return transformer.transformPostfixExpression(this);
    },
    visit: function(visitor) {
      visitor.visitPostfixExpression(this);
    },
    get type() {
      return POSTFIX_EXPRESSION;
    }
  }, {}, ParseTree);
  var PREDEFINED_TYPE = ParseTreeType.PREDEFINED_TYPE;
  var PredefinedType = function PredefinedType(location, typeToken) {
    this.location = location;
    this.typeToken = typeToken;
  };
  ($traceurRuntime.createClass)(PredefinedType, {
    transform: function(transformer) {
      return transformer.transformPredefinedType(this);
    },
    visit: function(visitor) {
      visitor.visitPredefinedType(this);
    },
    get type() {
      return PREDEFINED_TYPE;
    }
  }, {}, ParseTree);
  var SCRIPT = ParseTreeType.SCRIPT;
  var Script = function Script(location, scriptItemList, moduleName) {
    this.location = location;
    this.scriptItemList = scriptItemList;
    this.moduleName = moduleName;
  };
  ($traceurRuntime.createClass)(Script, {
    transform: function(transformer) {
      return transformer.transformScript(this);
    },
    visit: function(visitor) {
      visitor.visitScript(this);
    },
    get type() {
      return SCRIPT;
    }
  }, {}, ParseTree);
  var PROPERTY_METHOD_ASSIGNMENT = ParseTreeType.PROPERTY_METHOD_ASSIGNMENT;
  var PropertyMethodAssignment = function PropertyMethodAssignment(location, isStatic, functionKind, name, parameterList, typeAnnotation, annotations, functionBody) {
    this.location = location;
    this.isStatic = isStatic;
    this.functionKind = functionKind;
    this.name = name;
    this.parameterList = parameterList;
    this.typeAnnotation = typeAnnotation;
    this.annotations = annotations;
    this.functionBody = functionBody;
  };
  ($traceurRuntime.createClass)(PropertyMethodAssignment, {
    transform: function(transformer) {
      return transformer.transformPropertyMethodAssignment(this);
    },
    visit: function(visitor) {
      visitor.visitPropertyMethodAssignment(this);
    },
    get type() {
      return PROPERTY_METHOD_ASSIGNMENT;
    }
  }, {}, ParseTree);
  var PROPERTY_NAME_ASSIGNMENT = ParseTreeType.PROPERTY_NAME_ASSIGNMENT;
  var PropertyNameAssignment = function PropertyNameAssignment(location, name, value) {
    this.location = location;
    this.name = name;
    this.value = value;
  };
  ($traceurRuntime.createClass)(PropertyNameAssignment, {
    transform: function(transformer) {
      return transformer.transformPropertyNameAssignment(this);
    },
    visit: function(visitor) {
      visitor.visitPropertyNameAssignment(this);
    },
    get type() {
      return PROPERTY_NAME_ASSIGNMENT;
    }
  }, {}, ParseTree);
  var PROPERTY_NAME_SHORTHAND = ParseTreeType.PROPERTY_NAME_SHORTHAND;
  var PropertyNameShorthand = function PropertyNameShorthand(location, name) {
    this.location = location;
    this.name = name;
  };
  ($traceurRuntime.createClass)(PropertyNameShorthand, {
    transform: function(transformer) {
      return transformer.transformPropertyNameShorthand(this);
    },
    visit: function(visitor) {
      visitor.visitPropertyNameShorthand(this);
    },
    get type() {
      return PROPERTY_NAME_SHORTHAND;
    }
  }, {}, ParseTree);
  var REST_PARAMETER = ParseTreeType.REST_PARAMETER;
  var RestParameter = function RestParameter(location, identifier) {
    this.location = location;
    this.identifier = identifier;
  };
  ($traceurRuntime.createClass)(RestParameter, {
    transform: function(transformer) {
      return transformer.transformRestParameter(this);
    },
    visit: function(visitor) {
      visitor.visitRestParameter(this);
    },
    get type() {
      return REST_PARAMETER;
    }
  }, {}, ParseTree);
  var RETURN_STATEMENT = ParseTreeType.RETURN_STATEMENT;
  var ReturnStatement = function ReturnStatement(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(ReturnStatement, {
    transform: function(transformer) {
      return transformer.transformReturnStatement(this);
    },
    visit: function(visitor) {
      visitor.visitReturnStatement(this);
    },
    get type() {
      return RETURN_STATEMENT;
    }
  }, {}, ParseTree);
  var SET_ACCESSOR = ParseTreeType.SET_ACCESSOR;
  var SetAccessor = function SetAccessor(location, isStatic, name, parameterList, annotations, body) {
    this.location = location;
    this.isStatic = isStatic;
    this.name = name;
    this.parameterList = parameterList;
    this.annotations = annotations;
    this.body = body;
  };
  ($traceurRuntime.createClass)(SetAccessor, {
    transform: function(transformer) {
      return transformer.transformSetAccessor(this);
    },
    visit: function(visitor) {
      visitor.visitSetAccessor(this);
    },
    get type() {
      return SET_ACCESSOR;
    }
  }, {}, ParseTree);
  var SPREAD_EXPRESSION = ParseTreeType.SPREAD_EXPRESSION;
  var SpreadExpression = function SpreadExpression(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(SpreadExpression, {
    transform: function(transformer) {
      return transformer.transformSpreadExpression(this);
    },
    visit: function(visitor) {
      visitor.visitSpreadExpression(this);
    },
    get type() {
      return SPREAD_EXPRESSION;
    }
  }, {}, ParseTree);
  var SPREAD_PATTERN_ELEMENT = ParseTreeType.SPREAD_PATTERN_ELEMENT;
  var SpreadPatternElement = function SpreadPatternElement(location, lvalue) {
    this.location = location;
    this.lvalue = lvalue;
  };
  ($traceurRuntime.createClass)(SpreadPatternElement, {
    transform: function(transformer) {
      return transformer.transformSpreadPatternElement(this);
    },
    visit: function(visitor) {
      visitor.visitSpreadPatternElement(this);
    },
    get type() {
      return SPREAD_PATTERN_ELEMENT;
    }
  }, {}, ParseTree);
  var SUPER_EXPRESSION = ParseTreeType.SUPER_EXPRESSION;
  var SuperExpression = function SuperExpression(location) {
    this.location = location;
  };
  ($traceurRuntime.createClass)(SuperExpression, {
    transform: function(transformer) {
      return transformer.transformSuperExpression(this);
    },
    visit: function(visitor) {
      visitor.visitSuperExpression(this);
    },
    get type() {
      return SUPER_EXPRESSION;
    }
  }, {}, ParseTree);
  var SWITCH_STATEMENT = ParseTreeType.SWITCH_STATEMENT;
  var SwitchStatement = function SwitchStatement(location, expression, caseClauses) {
    this.location = location;
    this.expression = expression;
    this.caseClauses = caseClauses;
  };
  ($traceurRuntime.createClass)(SwitchStatement, {
    transform: function(transformer) {
      return transformer.transformSwitchStatement(this);
    },
    visit: function(visitor) {
      visitor.visitSwitchStatement(this);
    },
    get type() {
      return SWITCH_STATEMENT;
    }
  }, {}, ParseTree);
  var SYNTAX_ERROR_TREE = ParseTreeType.SYNTAX_ERROR_TREE;
  var SyntaxErrorTree = function SyntaxErrorTree(location, nextToken, message) {
    this.location = location;
    this.nextToken = nextToken;
    this.message = message;
  };
  ($traceurRuntime.createClass)(SyntaxErrorTree, {
    transform: function(transformer) {
      return transformer.transformSyntaxErrorTree(this);
    },
    visit: function(visitor) {
      visitor.visitSyntaxErrorTree(this);
    },
    get type() {
      return SYNTAX_ERROR_TREE;
    }
  }, {}, ParseTree);
  var TEMPLATE_LITERAL_EXPRESSION = ParseTreeType.TEMPLATE_LITERAL_EXPRESSION;
  var TemplateLiteralExpression = function TemplateLiteralExpression(location, operand, elements) {
    this.location = location;
    this.operand = operand;
    this.elements = elements;
  };
  ($traceurRuntime.createClass)(TemplateLiteralExpression, {
    transform: function(transformer) {
      return transformer.transformTemplateLiteralExpression(this);
    },
    visit: function(visitor) {
      visitor.visitTemplateLiteralExpression(this);
    },
    get type() {
      return TEMPLATE_LITERAL_EXPRESSION;
    }
  }, {}, ParseTree);
  var TEMPLATE_LITERAL_PORTION = ParseTreeType.TEMPLATE_LITERAL_PORTION;
  var TemplateLiteralPortion = function TemplateLiteralPortion(location, value) {
    this.location = location;
    this.value = value;
  };
  ($traceurRuntime.createClass)(TemplateLiteralPortion, {
    transform: function(transformer) {
      return transformer.transformTemplateLiteralPortion(this);
    },
    visit: function(visitor) {
      visitor.visitTemplateLiteralPortion(this);
    },
    get type() {
      return TEMPLATE_LITERAL_PORTION;
    }
  }, {}, ParseTree);
  var TEMPLATE_SUBSTITUTION = ParseTreeType.TEMPLATE_SUBSTITUTION;
  var TemplateSubstitution = function TemplateSubstitution(location, expression) {
    this.location = location;
    this.expression = expression;
  };
  ($traceurRuntime.createClass)(TemplateSubstitution, {
    transform: function(transformer) {
      return transformer.transformTemplateSubstitution(this);
    },
    visit: function(visitor) {
      visitor.visitTemplateSubstitution(this);
    },
    get type() {
      return TEMPLATE_SUBSTITUTION;
    }
  }, {}, ParseTree);
  var THIS_EXPRESSION = ParseTreeType.THIS_EXPRESSION;
  var ThisExpression = function ThisExpression(location) {
    this.location = location;
  };
  ($traceurRuntime.createClass)(ThisExpression, {
    transform: function(transformer) {
      return transformer.transformThisExpression(this);
    },
    visit: function(visitor) {
      visitor.visitThisExpression(this);
    },
    get type() {
      return THIS_EXPRESSION;
    }
  }, {}, ParseTree);
  var THROW_STATEMENT = ParseTreeType.THROW_STATEMENT;
  var ThrowStatement = function ThrowStatement(location, value) {
    this.location = location;
    this.value = value;
  };
  ($traceurRuntime.createClass)(ThrowStatement, {
    transform: function(transformer) {
      return transformer.transformThrowStatement(this);
    },
    visit: function(visitor) {
      visitor.visitThrowStatement(this);
    },
    get type() {
      return THROW_STATEMENT;
    }
  }, {}, ParseTree);
  var TRY_STATEMENT = ParseTreeType.TRY_STATEMENT;
  var TryStatement = function TryStatement(location, body, catchBlock, finallyBlock) {
    this.location = location;
    this.body = body;
    this.catchBlock = catchBlock;
    this.finallyBlock = finallyBlock;
  };
  ($traceurRuntime.createClass)(TryStatement, {
    transform: function(transformer) {
      return transformer.transformTryStatement(this);
    },
    visit: function(visitor) {
      visitor.visitTryStatement(this);
    },
    get type() {
      return TRY_STATEMENT;
    }
  }, {}, ParseTree);
  var TYPE_NAME = ParseTreeType.TYPE_NAME;
  var TypeName = function TypeName(location, moduleName, name) {
    this.location = location;
    this.moduleName = moduleName;
    this.name = name;
  };
  ($traceurRuntime.createClass)(TypeName, {
    transform: function(transformer) {
      return transformer.transformTypeName(this);
    },
    visit: function(visitor) {
      visitor.visitTypeName(this);
    },
    get type() {
      return TYPE_NAME;
    }
  }, {}, ParseTree);
  var UNARY_EXPRESSION = ParseTreeType.UNARY_EXPRESSION;
  var UnaryExpression = function UnaryExpression(location, operator, operand) {
    this.location = location;
    this.operator = operator;
    this.operand = operand;
  };
  ($traceurRuntime.createClass)(UnaryExpression, {
    transform: function(transformer) {
      return transformer.transformUnaryExpression(this);
    },
    visit: function(visitor) {
      visitor.visitUnaryExpression(this);
    },
    get type() {
      return UNARY_EXPRESSION;
    }
  }, {}, ParseTree);
  var VARIABLE_DECLARATION = ParseTreeType.VARIABLE_DECLARATION;
  var VariableDeclaration = function VariableDeclaration(location, lvalue, typeAnnotation, initializer) {
    this.location = location;
    this.lvalue = lvalue;
    this.typeAnnotation = typeAnnotation;
    this.initializer = initializer;
  };
  ($traceurRuntime.createClass)(VariableDeclaration, {
    transform: function(transformer) {
      return transformer.transformVariableDeclaration(this);
    },
    visit: function(visitor) {
      visitor.visitVariableDeclaration(this);
    },
    get type() {
      return VARIABLE_DECLARATION;
    }
  }, {}, ParseTree);
  var VARIABLE_DECLARATION_LIST = ParseTreeType.VARIABLE_DECLARATION_LIST;
  var VariableDeclarationList = function VariableDeclarationList(location, declarationType, declarations) {
    this.location = location;
    this.declarationType = declarationType;
    this.declarations = declarations;
  };
  ($traceurRuntime.createClass)(VariableDeclarationList, {
    transform: function(transformer) {
      return transformer.transformVariableDeclarationList(this);
    },
    visit: function(visitor) {
      visitor.visitVariableDeclarationList(this);
    },
    get type() {
      return VARIABLE_DECLARATION_LIST;
    }
  }, {}, ParseTree);
  var VARIABLE_STATEMENT = ParseTreeType.VARIABLE_STATEMENT;
  var VariableStatement = function VariableStatement(location, declarations) {
    this.location = location;
    this.declarations = declarations;
  };
  ($traceurRuntime.createClass)(VariableStatement, {
    transform: function(transformer) {
      return transformer.transformVariableStatement(this);
    },
    visit: function(visitor) {
      visitor.visitVariableStatement(this);
    },
    get type() {
      return VARIABLE_STATEMENT;
    }
  }, {}, ParseTree);
  var WHILE_STATEMENT = ParseTreeType.WHILE_STATEMENT;
  var WhileStatement = function WhileStatement(location, condition, body) {
    this.location = location;
    this.condition = condition;
    this.body = body;
  };
  ($traceurRuntime.createClass)(WhileStatement, {
    transform: function(transformer) {
      return transformer.transformWhileStatement(this);
    },
    visit: function(visitor) {
      visitor.visitWhileStatement(this);
    },
    get type() {
      return WHILE_STATEMENT;
    }
  }, {}, ParseTree);
  var WITH_STATEMENT = ParseTreeType.WITH_STATEMENT;
  var WithStatement = function WithStatement(location, expression, body) {
    this.location = location;
    this.expression = expression;
    this.body = body;
  };
  ($traceurRuntime.createClass)(WithStatement, {
    transform: function(transformer) {
      return transformer.transformWithStatement(this);
    },
    visit: function(visitor) {
      visitor.visitWithStatement(this);
    },
    get type() {
      return WITH_STATEMENT;
    }
  }, {}, ParseTree);
  var YIELD_EXPRESSION = ParseTreeType.YIELD_EXPRESSION;
  var YieldExpression = function YieldExpression(location, expression, isYieldFor) {
    this.location = location;
    this.expression = expression;
    this.isYieldFor = isYieldFor;
  };
  ($traceurRuntime.createClass)(YieldExpression, {
    transform: function(transformer) {
      return transformer.transformYieldExpression(this);
    },
    visit: function(visitor) {
      visitor.visitYieldExpression(this);
    },
    get type() {
      return YIELD_EXPRESSION;
    }
  }, {}, ParseTree);
  return {
    get Annotation() {
      return Annotation;
    },
    get AnonBlock() {
      return AnonBlock;
    },
    get ArgumentList() {
      return ArgumentList;
    },
    get ArrayComprehension() {
      return ArrayComprehension;
    },
    get ArrayLiteralExpression() {
      return ArrayLiteralExpression;
    },
    get ArrayPattern() {
      return ArrayPattern;
    },
    get ArrowFunctionExpression() {
      return ArrowFunctionExpression;
    },
    get AwaitExpression() {
      return AwaitExpression;
    },
    get BinaryOperator() {
      return BinaryOperator;
    },
    get BindingElement() {
      return BindingElement;
    },
    get BindingIdentifier() {
      return BindingIdentifier;
    },
    get Block() {
      return Block;
    },
    get BreakStatement() {
      return BreakStatement;
    },
    get CallExpression() {
      return CallExpression;
    },
    get CaseClause() {
      return CaseClause;
    },
    get Catch() {
      return Catch;
    },
    get ClassDeclaration() {
      return ClassDeclaration;
    },
    get ClassExpression() {
      return ClassExpression;
    },
    get CommaExpression() {
      return CommaExpression;
    },
    get ComprehensionFor() {
      return ComprehensionFor;
    },
    get ComprehensionIf() {
      return ComprehensionIf;
    },
    get ComputedPropertyName() {
      return ComputedPropertyName;
    },
    get ConditionalExpression() {
      return ConditionalExpression;
    },
    get ContinueStatement() {
      return ContinueStatement;
    },
    get CoverFormals() {
      return CoverFormals;
    },
    get CoverInitialisedName() {
      return CoverInitialisedName;
    },
    get DebuggerStatement() {
      return DebuggerStatement;
    },
    get DefaultClause() {
      return DefaultClause;
    },
    get DoWhileStatement() {
      return DoWhileStatement;
    },
    get EmptyStatement() {
      return EmptyStatement;
    },
    get ExportDeclaration() {
      return ExportDeclaration;
    },
    get ExportDefault() {
      return ExportDefault;
    },
    get ExportSpecifier() {
      return ExportSpecifier;
    },
    get ExportSpecifierSet() {
      return ExportSpecifierSet;
    },
    get ExportStar() {
      return ExportStar;
    },
    get ExpressionStatement() {
      return ExpressionStatement;
    },
    get Finally() {
      return Finally;
    },
    get ForInStatement() {
      return ForInStatement;
    },
    get ForOfStatement() {
      return ForOfStatement;
    },
    get ForStatement() {
      return ForStatement;
    },
    get FormalParameter() {
      return FormalParameter;
    },
    get FormalParameterList() {
      return FormalParameterList;
    },
    get FunctionBody() {
      return FunctionBody;
    },
    get FunctionDeclaration() {
      return FunctionDeclaration;
    },
    get FunctionExpression() {
      return FunctionExpression;
    },
    get GeneratorComprehension() {
      return GeneratorComprehension;
    },
    get GetAccessor() {
      return GetAccessor;
    },
    get IdentifierExpression() {
      return IdentifierExpression;
    },
    get IfStatement() {
      return IfStatement;
    },
    get ImportedBinding() {
      return ImportedBinding;
    },
    get ImportDeclaration() {
      return ImportDeclaration;
    },
    get ImportSpecifier() {
      return ImportSpecifier;
    },
    get ImportSpecifierSet() {
      return ImportSpecifierSet;
    },
    get LabelledStatement() {
      return LabelledStatement;
    },
    get LiteralExpression() {
      return LiteralExpression;
    },
    get LiteralPropertyName() {
      return LiteralPropertyName;
    },
    get MemberExpression() {
      return MemberExpression;
    },
    get MemberLookupExpression() {
      return MemberLookupExpression;
    },
    get Module() {
      return Module;
    },
    get ModuleDeclaration() {
      return ModuleDeclaration;
    },
    get ModuleSpecifier() {
      return ModuleSpecifier;
    },
    get NamedExport() {
      return NamedExport;
    },
    get NewExpression() {
      return NewExpression;
    },
    get ObjectLiteralExpression() {
      return ObjectLiteralExpression;
    },
    get ObjectPattern() {
      return ObjectPattern;
    },
    get ObjectPatternField() {
      return ObjectPatternField;
    },
    get ParenExpression() {
      return ParenExpression;
    },
    get PostfixExpression() {
      return PostfixExpression;
    },
    get PredefinedType() {
      return PredefinedType;
    },
    get Script() {
      return Script;
    },
    get PropertyMethodAssignment() {
      return PropertyMethodAssignment;
    },
    get PropertyNameAssignment() {
      return PropertyNameAssignment;
    },
    get PropertyNameShorthand() {
      return PropertyNameShorthand;
    },
    get RestParameter() {
      return RestParameter;
    },
    get ReturnStatement() {
      return ReturnStatement;
    },
    get SetAccessor() {
      return SetAccessor;
    },
    get SpreadExpression() {
      return SpreadExpression;
    },
    get SpreadPatternElement() {
      return SpreadPatternElement;
    },
    get SuperExpression() {
      return SuperExpression;
    },
    get SwitchStatement() {
      return SwitchStatement;
    },
    get SyntaxErrorTree() {
      return SyntaxErrorTree;
    },
    get TemplateLiteralExpression() {
      return TemplateLiteralExpression;
    },
    get TemplateLiteralPortion() {
      return TemplateLiteralPortion;
    },
    get TemplateSubstitution() {
      return TemplateSubstitution;
    },
    get ThisExpression() {
      return ThisExpression;
    },
    get ThrowStatement() {
      return ThrowStatement;
    },
    get TryStatement() {
      return TryStatement;
    },
    get TypeName() {
      return TypeName;
    },
    get UnaryExpression() {
      return UnaryExpression;
    },
    get VariableDeclaration() {
      return VariableDeclaration;
    },
    get VariableDeclarationList() {
      return VariableDeclarationList;
    },
    get VariableStatement() {
      return VariableStatement;
    },
    get WhileStatement() {
      return WhileStatement;
    },
    get WithStatement() {
      return WithStatement;
    },
    get YieldExpression() {
      return YieldExpression;
    }
  };
});
System.register("traceur@0.0.43/src/semantics/FreeVariableChecker", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/semantics/FreeVariableChecker";
  var ARGUMENTS = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).ARGUMENTS;
  var $__28 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BindingIdentifier = $__28.BindingIdentifier,
      IdentifierExpression = $__28.IdentifierExpression;
  var IdentifierToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/IdentifierToken")).IdentifierToken;
  var IDENTIFIER_EXPRESSION = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")).IDENTIFIER_EXPRESSION;
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var TYPEOF = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).TYPEOF;
  var global = this;
  var Scope = function Scope(parent) {
    this.parent = parent;
    this.references = Object.create(null);
    this.declarations = Object.create(null);
  };
  ($traceurRuntime.createClass)(Scope, {}, {});
  function getVariableName(name) {
    if (name instanceof IdentifierExpression) {
      name = name.identifierToken;
    } else if (name instanceof BindingIdentifier) {
      name = name.identifierToken;
    }
    if (name instanceof IdentifierToken) {
      name = name.value;
    }
    return name;
  }
  var FreeVariableChecker = function FreeVariableChecker(reporter) {
    $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "constructor", []);
    this.reporter_ = reporter;
    this.scope_ = null;
    this.disableChecksLevel_ = 0;
  };
  var $FreeVariableChecker = FreeVariableChecker;
  ($traceurRuntime.createClass)(FreeVariableChecker, {
    pushScope_: function() {
      return this.scope_ = new Scope(this.scope_);
    },
    pop_: function(scope) {
      if (this.scope_ != scope) {
        throw new Error('FreeVariableChecker scope mismatch');
      }
      this.validateScope_();
      this.scope_ = scope.parent;
    },
    visitScript: function(tree, global) {
      var scope = this.pushScope_();
      var object = global;
      while (object) {
        Object.getOwnPropertyNames(object).forEach(this.declareVariable_, this);
        object = Object.getPrototypeOf(object);
      }
      this.visitList(tree.scriptItemList);
      this.pop_(scope);
    },
    visitFunction_: function(name, parameterList, body) {
      var scope = this.pushScope_();
      this.visitAny(name);
      this.declareVariable_(ARGUMENTS);
      this.visitAny(parameterList);
      this.visitAny(body);
      this.pop_(scope);
    },
    visitFunctionDeclaration: function(tree) {
      this.declareVariable_(tree.name);
      this.visitFunction_(null, tree.parameterList, tree.functionBody);
    },
    visitFunctionExpression: function(tree) {
      this.visitFunction_(tree.name, tree.parameterList, tree.functionBody);
    },
    visitArrowFunctionExpression: function(tree) {
      this.visitFunction_(null, tree.parameterList, tree.functionBody);
    },
    visitGetAccessor: function(tree) {
      var scope = this.pushScope_();
      $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitGetAccessor", [tree]);
      this.pop_(scope);
    },
    visitSetAccessor: function(tree) {
      var scope = this.pushScope_();
      $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitSetAccessor", [tree]);
      this.pop_(scope);
    },
    visitCatch: function(tree) {
      var scope = this.pushScope_();
      $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitCatch", [tree]);
      this.pop_(scope);
    },
    visitBindingIdentifier: function(tree) {
      this.declareVariable_(tree);
    },
    visitIdentifierExpression: function(tree) {
      if (this.disableChecksLevel_)
        return;
      var name = getVariableName(tree);
      var scope = this.scope_;
      if (!(name in scope.references)) {
        scope.references[name] = tree.location;
      }
    },
    visitUnaryExpression: function(tree) {
      if (tree.operator.type === TYPEOF && tree.operand.type === IDENTIFIER_EXPRESSION) {
        this.declareVariable_(tree.operand);
      } else {
        $traceurRuntime.superCall(this, $FreeVariableChecker.prototype, "visitUnaryExpression", [tree]);
      }
    },
    visitWithStatement: function(tree) {
      this.visitAny(tree.expression);
      this.disableChecksLevel_++;
      this.visitAny(tree.body);
      this.disableChecksLevel_--;
    },
    declareVariable_: function(tree) {
      var name = getVariableName(tree);
      if (name) {
        var scope = this.scope_;
        if (!(name in scope.declarations)) {
          scope.declarations[name] = tree.location;
        }
      }
    },
    validateScope_: function() {
      var $__26 = this;
      if (this.disableChecksLevel_)
        return;
      var scope = this.scope_;
      var errors = [];
      for (var name in scope.references) {
        if (!(name in scope.declarations)) {
          var location = scope.references[name];
          if (!scope.parent) {
            if (!location) {
              throw new Error(("generated variable " + name + " is not defined"));
            }
            errors.push([location.start, (name + " is not defined")]);
          } else if (!(name in scope.parent.references)) {
            scope.parent.references[name] = location;
          }
        }
      }
      if (errors.length) {
        errors.sort((function(x, y) {
          return x[0].offset - y[0].offset;
        }));
        errors.forEach((function(args) {
          var $__29;
          ($__29 = $__26).reportError_.apply($__29, $traceurRuntime.toObject(args));
        }));
      }
    },
    reportError_: function(location, message) {
      this.reporter_.reportError(location, message);
    }
  }, {checkScript: function(reporter, tree) {
      new $FreeVariableChecker(reporter).visitScript(tree, global);
    }}, ParseTreeVisitor);
  return {
    get getVariableName() {
      return getVariableName;
    },
    get FreeVariableChecker() {
      return FreeVariableChecker;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/Keywords", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/Keywords";
  var keywords = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'enum', 'extends', 'null', 'true', 'false'];
  var strictKeywords = ['implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield'];
  var keywordsByName = Object.create(null);
  var NORMAL_KEYWORD = 1;
  var STRICT_KEYWORD = 2;
  keywords.forEach((function(value) {
    keywordsByName[value] = NORMAL_KEYWORD;
  }));
  strictKeywords.forEach((function(value) {
    keywordsByName[value] = STRICT_KEYWORD;
  }));
  function getKeywordType(value) {
    return keywordsByName[value];
  }
  function isStrictKeyword(value) {
    return getKeywordType(value) === STRICT_KEYWORD;
  }
  return {
    get NORMAL_KEYWORD() {
      return NORMAL_KEYWORD;
    },
    get STRICT_KEYWORD() {
      return STRICT_KEYWORD;
    },
    get getKeywordType() {
      return getKeywordType;
    },
    get isStrictKeyword() {
      return isStrictKeyword;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/KeywordToken", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/KeywordToken";
  var STRICT_KEYWORD = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Keywords")).STRICT_KEYWORD;
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var KeywordToken = function KeywordToken(type, keywordType, location) {
    this.type = type;
    this.location = location;
    this.isStrictKeyword_ = keywordType === STRICT_KEYWORD;
  };
  ($traceurRuntime.createClass)(KeywordToken, {
    isKeyword: function() {
      return true;
    },
    isStrictKeyword: function() {
      return this.isStrictKeyword_;
    }
  }, {}, Token);
  return {get KeywordToken() {
      return KeywordToken;
    }};
});
System.register("traceur@0.0.43/src/syntax/LiteralToken", [], function() {
  "use strict";
  var $__33;
  var __moduleName = "traceur@0.0.43/src/syntax/LiteralToken";
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var $__36 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      NULL = $__36.NULL,
      NUMBER = $__36.NUMBER,
      STRING = $__36.STRING;
  var StringParser = function StringParser(value) {
    this.value = value;
    this.index = 0;
  };
  ($traceurRuntime.createClass)(StringParser, ($__33 = {}, Object.defineProperty($__33, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__33, "next", {
    value: function() {
      if (++this.index >= this.value.length - 1)
        return {
          value: undefined,
          done: true
        };
      return {
        value: this.value[this.index],
        done: false
      };
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__33, "parse", {
    value: function() {
      if (this.value.indexOf('\\') === -1)
        return this.value.slice(1, -1);
      var result = '';
      for (var $__34 = this[Symbol.iterator](),
          $__35; !($__35 = $__34.next()).done; ) {
        var ch = $__35.value;
        {
          result += ch === '\\' ? this.parseEscapeSequence() : ch;
        }
      }
      return result;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__33, "parseEscapeSequence", {
    value: function() {
      var ch = this.next().value;
      switch (ch) {
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
          return '';
        case '0':
          return '\0';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case 'n':
          return '\n';
        case 'r':
          return '\r';
        case 't':
          return '\t';
        case 'v':
          return '\v';
        case 'x':
          return String.fromCharCode(parseInt(this.next().value + this.next().value, 16));
        case 'u':
          return String.fromCharCode(parseInt(this.next().value + this.next().value + this.next().value + this.next().value, 16));
        default:
          if (Number(ch) < 8)
            throw new Error('Octal literals are not supported');
          return ch;
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__33), {});
  var LiteralToken = function LiteralToken(type, value, location) {
    this.type = type;
    this.location = location;
    this.value = value;
  };
  ($traceurRuntime.createClass)(LiteralToken, {
    toString: function() {
      return this.value;
    },
    get processedValue() {
      switch (this.type) {
        case NULL:
          return null;
        case NUMBER:
          var value = this.value;
          if (value.charCodeAt(0) === 48) {
            switch (value.charCodeAt(1)) {
              case 66:
              case 98:
                return parseInt(this.value.slice(2), 2);
              case 79:
              case 111:
                return parseInt(this.value.slice(2), 8);
            }
          }
          return Number(this.value);
        case STRING:
          var parser = new StringParser(this.value);
          return parser.parse();
        default:
          throw new Error('Not implemented');
      }
    }
  }, {}, Token);
  return {get LiteralToken() {
      return LiteralToken;
    }};
});
System.register("traceur@0.0.43/src/syntax/unicode-tables", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/unicode-tables";
  var idStartTable = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 442, 443, 443, 444, 447, 448, 451, 452, 659, 660, 660, 661, 687, 688, 705, 710, 721, 736, 740, 748, 748, 750, 750, 880, 883, 884, 884, 886, 887, 890, 890, 891, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1599, 1600, 1600, 1601, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957, 1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069, 2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2208, 2208, 2210, 2220, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2417, 2418, 2423, 2425, 2431, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3653, 3654, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3807, 3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198, 4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4295, 4295, 4301, 4301, 4304, 4346, 4348, 4348, 4349, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6103, 6103, 6108, 6108, 6176, 6210, 6211, 6211, 6212, 6263, 6272, 6312, 6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516, 6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7098, 7141, 7168, 7203, 7245, 7247, 7258, 7287, 7288, 7293, 7401, 7404, 7406, 7409, 7413, 7414, 7424, 7467, 7468, 7530, 7531, 7543, 7544, 7544, 7545, 7578, 7579, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8472, 8472, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8494, 8494, 8495, 8500, 8501, 8504, 8505, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8578, 8579, 8580, 8581, 8584, 11264, 11310, 11312, 11358, 11360, 11387, 11388, 11389, 11390, 11492, 11499, 11502, 11506, 11507, 11520, 11557, 11559, 11559, 11565, 11565, 11568, 11623, 11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 12293, 12293, 12294, 12294, 12295, 12295, 12321, 12329, 12337, 12341, 12344, 12346, 12347, 12347, 12348, 12348, 12353, 12438, 12443, 12444, 12445, 12446, 12447, 12447, 12449, 12538, 12540, 12542, 12543, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 19893, 19968, 40908, 40960, 40980, 40981, 40981, 40982, 42124, 42192, 42231, 42232, 42237, 42240, 42507, 42508, 42508, 42512, 42527, 42538, 42539, 42560, 42605, 42606, 42606, 42623, 42623, 42624, 42647, 42656, 42725, 42726, 42735, 42775, 42783, 42786, 42863, 42864, 42864, 42865, 42887, 42888, 42888, 42891, 42894, 42896, 42899, 42912, 42922, 43000, 43001, 43002, 43002, 43003, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43631, 43632, 43632, 43633, 43638, 43642, 43642, 43648, 43695, 43697, 43697, 43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714, 43739, 43740, 43741, 43741, 43744, 43754, 43762, 43762, 43763, 43764, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44002, 44032, 55203, 55216, 55238, 55243, 55291, 63744, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65391, 65392, 65392, 65393, 65437, 65438, 65439, 65440, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594, 65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786, 65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334, 66352, 66368, 66369, 66369, 66370, 66377, 66378, 66378, 66432, 66461, 66464, 66499, 66504, 66511, 66513, 66517, 66560, 66639, 66640, 66717, 67584, 67589, 67592, 67592, 67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669, 67840, 67861, 67872, 67897, 67968, 68023, 68030, 68031, 68096, 68096, 68112, 68115, 68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405, 68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687, 69763, 69807, 69840, 69864, 69891, 69926, 70019, 70066, 70081, 70084, 71296, 71338, 73728, 74606, 74752, 74850, 77824, 78894, 92160, 92728, 93952, 94020, 94032, 94032, 94099, 94111, 110592, 110593, 119808, 119892, 119894, 119964, 119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980, 119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069, 120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121, 120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144, 120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570, 120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686, 120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779, 126464, 126467, 126469, 126495, 126497, 126498, 126500, 126500, 126503, 126503, 126505, 126514, 126516, 126519, 126521, 126521, 126523, 126523, 126530, 126530, 126535, 126535, 126537, 126537, 126539, 126539, 126541, 126543, 126545, 126546, 126548, 126548, 126551, 126551, 126553, 126553, 126555, 126555, 126557, 126557, 126559, 126559, 126561, 126562, 126564, 126564, 126567, 126570, 126572, 126578, 126580, 126583, 126585, 126588, 126590, 126590, 126592, 126601, 126603, 126619, 126625, 126627, 126629, 126633, 126635, 126651, 131072, 173782, 173824, 177972, 177984, 178205, 194560, 195101];
  var idContinueTable = [183, 183, 768, 879, 903, 903, 1155, 1159, 1425, 1469, 1471, 1471, 1473, 1474, 1476, 1477, 1479, 1479, 1552, 1562, 1611, 1631, 1632, 1641, 1648, 1648, 1750, 1756, 1759, 1764, 1767, 1768, 1770, 1773, 1776, 1785, 1809, 1809, 1840, 1866, 1958, 1968, 1984, 1993, 2027, 2035, 2070, 2073, 2075, 2083, 2085, 2087, 2089, 2093, 2137, 2139, 2276, 2302, 2304, 2306, 2307, 2307, 2362, 2362, 2363, 2363, 2364, 2364, 2366, 2368, 2369, 2376, 2377, 2380, 2381, 2381, 2382, 2383, 2385, 2391, 2402, 2403, 2406, 2415, 2433, 2433, 2434, 2435, 2492, 2492, 2494, 2496, 2497, 2500, 2503, 2504, 2507, 2508, 2509, 2509, 2519, 2519, 2530, 2531, 2534, 2543, 2561, 2562, 2563, 2563, 2620, 2620, 2622, 2624, 2625, 2626, 2631, 2632, 2635, 2637, 2641, 2641, 2662, 2671, 2672, 2673, 2677, 2677, 2689, 2690, 2691, 2691, 2748, 2748, 2750, 2752, 2753, 2757, 2759, 2760, 2761, 2761, 2763, 2764, 2765, 2765, 2786, 2787, 2790, 2799, 2817, 2817, 2818, 2819, 2876, 2876, 2878, 2878, 2879, 2879, 2880, 2880, 2881, 2884, 2887, 2888, 2891, 2892, 2893, 2893, 2902, 2902, 2903, 2903, 2914, 2915, 2918, 2927, 2946, 2946, 3006, 3007, 3008, 3008, 3009, 3010, 3014, 3016, 3018, 3020, 3021, 3021, 3031, 3031, 3046, 3055, 3073, 3075, 3134, 3136, 3137, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3170, 3171, 3174, 3183, 3202, 3203, 3260, 3260, 3262, 3262, 3263, 3263, 3264, 3268, 3270, 3270, 3271, 3272, 3274, 3275, 3276, 3277, 3285, 3286, 3298, 3299, 3302, 3311, 3330, 3331, 3390, 3392, 3393, 3396, 3398, 3400, 3402, 3404, 3405, 3405, 3415, 3415, 3426, 3427, 3430, 3439, 3458, 3459, 3530, 3530, 3535, 3537, 3538, 3540, 3542, 3542, 3544, 3551, 3570, 3571, 3633, 3633, 3636, 3642, 3655, 3662, 3664, 3673, 3761, 3761, 3764, 3769, 3771, 3772, 3784, 3789, 3792, 3801, 3864, 3865, 3872, 3881, 3893, 3893, 3895, 3895, 3897, 3897, 3902, 3903, 3953, 3966, 3967, 3967, 3968, 3972, 3974, 3975, 3981, 3991, 3993, 4028, 4038, 4038, 4139, 4140, 4141, 4144, 4145, 4145, 4146, 4151, 4152, 4152, 4153, 4154, 4155, 4156, 4157, 4158, 4160, 4169, 4182, 4183, 4184, 4185, 4190, 4192, 4194, 4196, 4199, 4205, 4209, 4212, 4226, 4226, 4227, 4228, 4229, 4230, 4231, 4236, 4237, 4237, 4239, 4239, 4240, 4249, 4250, 4252, 4253, 4253, 4957, 4959, 4969, 4977, 5906, 5908, 5938, 5940, 5970, 5971, 6002, 6003, 6068, 6069, 6070, 6070, 6071, 6077, 6078, 6085, 6086, 6086, 6087, 6088, 6089, 6099, 6109, 6109, 6112, 6121, 6155, 6157, 6160, 6169, 6313, 6313, 6432, 6434, 6435, 6438, 6439, 6440, 6441, 6443, 6448, 6449, 6450, 6450, 6451, 6456, 6457, 6459, 6470, 6479, 6576, 6592, 6600, 6601, 6608, 6617, 6618, 6618, 6679, 6680, 6681, 6683, 6741, 6741, 6742, 6742, 6743, 6743, 6744, 6750, 6752, 6752, 6753, 6753, 6754, 6754, 6755, 6756, 6757, 6764, 6765, 6770, 6771, 6780, 6783, 6783, 6784, 6793, 6800, 6809, 6912, 6915, 6916, 6916, 6964, 6964, 6965, 6965, 6966, 6970, 6971, 6971, 6972, 6972, 6973, 6977, 6978, 6978, 6979, 6980, 6992, 7001, 7019, 7027, 7040, 7041, 7042, 7042, 7073, 7073, 7074, 7077, 7078, 7079, 7080, 7081, 7082, 7082, 7083, 7083, 7084, 7085, 7088, 7097, 7142, 7142, 7143, 7143, 7144, 7145, 7146, 7148, 7149, 7149, 7150, 7150, 7151, 7153, 7154, 7155, 7204, 7211, 7212, 7219, 7220, 7221, 7222, 7223, 7232, 7241, 7248, 7257, 7376, 7378, 7380, 7392, 7393, 7393, 7394, 7400, 7405, 7405, 7410, 7411, 7412, 7412, 7616, 7654, 7676, 7679, 8255, 8256, 8276, 8276, 8400, 8412, 8417, 8417, 8421, 8432, 11503, 11505, 11647, 11647, 11744, 11775, 12330, 12333, 12334, 12335, 12441, 12442, 42528, 42537, 42607, 42607, 42612, 42621, 42655, 42655, 42736, 42737, 43010, 43010, 43014, 43014, 43019, 43019, 43043, 43044, 43045, 43046, 43047, 43047, 43136, 43137, 43188, 43203, 43204, 43204, 43216, 43225, 43232, 43249, 43264, 43273, 43302, 43309, 43335, 43345, 43346, 43347, 43392, 43394, 43395, 43395, 43443, 43443, 43444, 43445, 43446, 43449, 43450, 43451, 43452, 43452, 43453, 43456, 43472, 43481, 43561, 43566, 43567, 43568, 43569, 43570, 43571, 43572, 43573, 43574, 43587, 43587, 43596, 43596, 43597, 43597, 43600, 43609, 43643, 43643, 43696, 43696, 43698, 43700, 43703, 43704, 43710, 43711, 43713, 43713, 43755, 43755, 43756, 43757, 43758, 43759, 43765, 43765, 43766, 43766, 44003, 44004, 44005, 44005, 44006, 44007, 44008, 44008, 44009, 44010, 44012, 44012, 44013, 44013, 44016, 44025, 64286, 64286, 65024, 65039, 65056, 65062, 65075, 65076, 65101, 65103, 65296, 65305, 65343, 65343, 66045, 66045, 66720, 66729, 68097, 68099, 68101, 68102, 68108, 68111, 68152, 68154, 68159, 68159, 69632, 69632, 69633, 69633, 69634, 69634, 69688, 69702, 69734, 69743, 69760, 69761, 69762, 69762, 69808, 69810, 69811, 69814, 69815, 69816, 69817, 69818, 69872, 69881, 69888, 69890, 69927, 69931, 69932, 69932, 69933, 69940, 69942, 69951, 70016, 70017, 70018, 70018, 70067, 70069, 70070, 70078, 70079, 70080, 70096, 70105, 71339, 71339, 71340, 71340, 71341, 71341, 71342, 71343, 71344, 71349, 71350, 71350, 71351, 71351, 71360, 71369, 94033, 94078, 94095, 94098, 119141, 119142, 119143, 119145, 119149, 119154, 119163, 119170, 119173, 119179, 119210, 119213, 119362, 119364, 120782, 120831, 917760, 917999];
  return {
    get idStartTable() {
      return idStartTable;
    },
    get idContinueTable() {
      return idContinueTable;
    }
  };
});
System.register("traceur@0.0.43/src/syntax/Scanner", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/Scanner";
  var IdentifierToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/IdentifierToken")).IdentifierToken;
  var KeywordToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/KeywordToken")).KeywordToken;
  var LiteralToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LiteralToken")).LiteralToken;
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var getKeywordType = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Keywords")).getKeywordType;
  var $__38 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/unicode-tables")),
      idContinueTable = $__38.idContinueTable,
      idStartTable = $__38.idStartTable;
  var $__38 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")),
      options = $__38.options,
      parseOptions = $__38.parseOptions;
  var $__38 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AMPERSAND = $__38.AMPERSAND,
      AMPERSAND_EQUAL = $__38.AMPERSAND_EQUAL,
      AND = $__38.AND,
      ARROW = $__38.ARROW,
      AT = $__38.AT,
      BACK_QUOTE = $__38.BACK_QUOTE,
      BANG = $__38.BANG,
      BAR = $__38.BAR,
      BAR_EQUAL = $__38.BAR_EQUAL,
      BREAK = $__38.BREAK,
      CARET = $__38.CARET,
      CARET_EQUAL = $__38.CARET_EQUAL,
      CASE = $__38.CASE,
      CATCH = $__38.CATCH,
      CLASS = $__38.CLASS,
      CLOSE_ANGLE = $__38.CLOSE_ANGLE,
      CLOSE_CURLY = $__38.CLOSE_CURLY,
      CLOSE_PAREN = $__38.CLOSE_PAREN,
      CLOSE_SQUARE = $__38.CLOSE_SQUARE,
      COLON = $__38.COLON,
      COMMA = $__38.COMMA,
      CONST = $__38.CONST,
      CONTINUE = $__38.CONTINUE,
      DEBUGGER = $__38.DEBUGGER,
      DEFAULT = $__38.DEFAULT,
      DELETE = $__38.DELETE,
      DO = $__38.DO,
      DOT_DOT_DOT = $__38.DOT_DOT_DOT,
      ELSE = $__38.ELSE,
      END_OF_FILE = $__38.END_OF_FILE,
      ENUM = $__38.ENUM,
      EQUAL = $__38.EQUAL,
      EQUAL_EQUAL = $__38.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__38.EQUAL_EQUAL_EQUAL,
      ERROR = $__38.ERROR,
      EXPORT = $__38.EXPORT,
      EXTENDS = $__38.EXTENDS,
      FALSE = $__38.FALSE,
      FINALLY = $__38.FINALLY,
      FOR = $__38.FOR,
      FUNCTION = $__38.FUNCTION,
      GREATER_EQUAL = $__38.GREATER_EQUAL,
      IDENTIFIER = $__38.IDENTIFIER,
      IF = $__38.IF,
      IMPLEMENTS = $__38.IMPLEMENTS,
      IMPORT = $__38.IMPORT,
      IN = $__38.IN,
      INSTANCEOF = $__38.INSTANCEOF,
      INTERFACE = $__38.INTERFACE,
      LEFT_SHIFT = $__38.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__38.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__38.LESS_EQUAL,
      LET = $__38.LET,
      MINUS = $__38.MINUS,
      MINUS_EQUAL = $__38.MINUS_EQUAL,
      MINUS_MINUS = $__38.MINUS_MINUS,
      NEW = $__38.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__38.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__38.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__38.NOT_EQUAL_EQUAL,
      NULL = $__38.NULL,
      NUMBER = $__38.NUMBER,
      OPEN_ANGLE = $__38.OPEN_ANGLE,
      OPEN_CURLY = $__38.OPEN_CURLY,
      OPEN_PAREN = $__38.OPEN_PAREN,
      OPEN_SQUARE = $__38.OPEN_SQUARE,
      OR = $__38.OR,
      PACKAGE = $__38.PACKAGE,
      PERCENT = $__38.PERCENT,
      PERCENT_EQUAL = $__38.PERCENT_EQUAL,
      PERIOD = $__38.PERIOD,
      PLUS = $__38.PLUS,
      PLUS_EQUAL = $__38.PLUS_EQUAL,
      PLUS_PLUS = $__38.PLUS_PLUS,
      PRIVATE = $__38.PRIVATE,
      PROTECTED = $__38.PROTECTED,
      PUBLIC = $__38.PUBLIC,
      QUESTION = $__38.QUESTION,
      REGULAR_EXPRESSION = $__38.REGULAR_EXPRESSION,
      RETURN = $__38.RETURN,
      RIGHT_SHIFT = $__38.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__38.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__38.SEMI_COLON,
      SLASH = $__38.SLASH,
      SLASH_EQUAL = $__38.SLASH_EQUAL,
      STAR = $__38.STAR,
      STAR_EQUAL = $__38.STAR_EQUAL,
      STATIC = $__38.STATIC,
      STRING = $__38.STRING,
      SUPER = $__38.SUPER,
      SWITCH = $__38.SWITCH,
      TEMPLATE_HEAD = $__38.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__38.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__38.TEMPLATE_TAIL,
      THIS = $__38.THIS,
      THROW = $__38.THROW,
      TILDE = $__38.TILDE,
      TRUE = $__38.TRUE,
      TRY = $__38.TRY,
      TYPEOF = $__38.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__38.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__38.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__38.VAR,
      VOID = $__38.VOID,
      WHILE = $__38.WHILE,
      WITH = $__38.WITH,
      YIELD = $__38.YIELD;
  var isWhitespaceArray = [];
  for (var i = 0; i < 128; i++) {
    isWhitespaceArray[i] = i >= 9 && i <= 13 || i === 0x20;
  }
  var isWhitespaceArray = [];
  for (var i = 0; i < 128; i++) {
    isWhitespaceArray[i] = i >= 9 && i <= 13 || i === 0x20;
  }
  function isWhitespace(code) {
    if (code < 128)
      return isWhitespaceArray[code];
    switch (code) {
      case 0xA0:
      case 0xFEFF:
      case 0x2028:
      case 0x2029:
        return true;
    }
    return false;
  }
  function isLineTerminator(code) {
    switch (code) {
      case 10:
      case 13:
      case 0x2028:
      case 0x2029:
        return true;
    }
    return false;
  }
  function isDecimalDigit(code) {
    return code >= 48 && code <= 57;
  }
  var isHexDigitArray = [];
  for (var i = 0; i < 128; i++) {
    isHexDigitArray[i] = i >= 48 && i <= 57 || i >= 65 && i <= 70 || i >= 97 && i <= 102;
  }
  function isHexDigit(code) {
    return code < 128 && isHexDigitArray[code];
  }
  function isBinaryDigit(code) {
    return code === 48 || code === 49;
  }
  function isOctalDigit(code) {
    return code >= 48 && code <= 55;
  }
  var isIdentifierStartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierStartArray[i] = i === 36 || i >= 65 && i <= 90 || i === 95 || i >= 97 && i <= 122;
  }
  function isIdentifierStart(code) {
    return code < 128 ? isIdentifierStartArray[code] : inTable(idStartTable, code);
  }
  var isIdentifierPartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierPartArray[i] = isIdentifierStart(i) || isDecimalDigit(i);
  }
  function isIdentifierPart(code) {
    return code < 128 ? isIdentifierPartArray[code] : inTable(idStartTable, code) || inTable(idContinueTable, code) || code === 8204 || code === 8205;
  }
  function inTable(table, code) {
    for (var i = 0; i < table.length; ) {
      if (code < table[i++])
        return false;
      if (code <= table[i++])
        return true;
    }
    return false;
  }
  function isRegularExpressionChar(code) {
    switch (code) {
      case 47:
        return false;
      case 91:
      case 92:
        return true;
    }
    return !isLineTerminator(code);
  }
  function isRegularExpressionFirstChar(code) {
    return isRegularExpressionChar(code) && code !== 42;
  }
  var index,
      input,
      length,
      token,
      lastToken,
      lookaheadToken,
      currentCharCode,
      lineNumberTable,
      errorReporter,
      currentParser;
  var Scanner = function Scanner(reporter, file, parser) {
    errorReporter = reporter;
    lineNumberTable = file.lineNumberTable;
    input = file.contents;
    length = file.contents.length;
    index = 0;
    lastToken = null;
    token = null;
    lookaheadToken = null;
    updateCurrentCharCode();
    currentParser = parser;
  };
  ($traceurRuntime.createClass)(Scanner, {
    get lastToken() {
      return lastToken;
    },
    getPosition: function() {
      return getPosition(getOffset());
    },
    nextRegularExpressionLiteralToken: function() {
      lastToken = nextRegularExpressionLiteralToken();
      token = scanToken();
      return lastToken;
    },
    nextTemplateLiteralToken: function() {
      var t = nextTemplateLiteralToken();
      token = scanToken();
      return t;
    },
    nextToken: function() {
      return nextToken();
    },
    peekToken: function(opt_index) {
      return opt_index ? peekTokenLookahead() : peekToken();
    },
    peekTokenNoLineTerminator: function() {
      return peekTokenNoLineTerminator();
    },
    isAtEnd: function() {
      return isAtEnd();
    }
  }, {});
  function getPosition(offset) {
    return lineNumberTable.getSourcePosition(offset);
  }
  function getTokenRange(startOffset) {
    return lineNumberTable.getSourceRange(startOffset, index);
  }
  function getOffset() {
    return token ? token.location.start.offset : index;
  }
  function nextRegularExpressionLiteralToken() {
    var beginIndex = index - token.toString().length;
    if (!skipRegularExpressionBody()) {
      return new LiteralToken(REGULAR_EXPRESSION, getTokenString(beginIndex), getTokenRange(beginIndex));
    }
    if (currentCharCode !== 47) {
      reportError('Expected \'/\' in regular expression literal');
      return new LiteralToken(REGULAR_EXPRESSION, getTokenString(beginIndex), getTokenRange(beginIndex));
    }
    next();
    while (isIdentifierPart(currentCharCode)) {
      next();
    }
    return new LiteralToken(REGULAR_EXPRESSION, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function skipRegularExpressionBody() {
    if (!isRegularExpressionFirstChar(currentCharCode)) {
      reportError('Expected regular expression first char');
      return false;
    }
    while (!isAtEnd() && isRegularExpressionChar(currentCharCode)) {
      if (!skipRegularExpressionChar())
        return false;
    }
    return true;
  }
  function skipRegularExpressionChar() {
    switch (currentCharCode) {
      case 92:
        return skipRegularExpressionBackslashSequence();
      case 91:
        return skipRegularExpressionClass();
      default:
        next();
        return true;
    }
  }
  function skipRegularExpressionBackslashSequence() {
    next();
    if (isLineTerminator(currentCharCode) || isAtEnd()) {
      reportError('New line not allowed in regular expression literal');
      return false;
    }
    next();
    return true;
  }
  function skipRegularExpressionClass() {
    next();
    while (!isAtEnd() && peekRegularExpressionClassChar()) {
      if (!skipRegularExpressionClassChar()) {
        return false;
      }
    }
    if (currentCharCode !== 93) {
      reportError('\']\' expected');
      return false;
    }
    next();
    return true;
  }
  function peekRegularExpressionClassChar() {
    return currentCharCode !== 93 && !isLineTerminator(currentCharCode);
  }
  function skipRegularExpressionClassChar() {
    if (currentCharCode === 92) {
      return skipRegularExpressionBackslashSequence();
    }
    next();
    return true;
  }
  function skipTemplateCharacter() {
    while (!isAtEnd()) {
      switch (currentCharCode) {
        case 96:
          return;
        case 92:
          skipStringLiteralEscapeSequence();
          break;
        case 36:
          var code = input.charCodeAt(index + 1);
          if (code === 123)
            return;
        default:
          next();
      }
    }
  }
  function scanTemplateStart(beginIndex) {
    if (isAtEnd()) {
      reportError('Unterminated template literal');
      return lastToken = createToken(END_OF_FILE, beginIndex);
    }
    return nextTemplateLiteralTokenShared(NO_SUBSTITUTION_TEMPLATE, TEMPLATE_HEAD);
  }
  function nextTemplateLiteralToken() {
    if (isAtEnd()) {
      reportError('Expected \'}\' after expression in template literal');
      return createToken(END_OF_FILE, index);
    }
    if (token.type !== CLOSE_CURLY) {
      reportError('Expected \'}\' after expression in template literal');
      return createToken(ERROR, index);
    }
    return nextTemplateLiteralTokenShared(TEMPLATE_TAIL, TEMPLATE_MIDDLE);
  }
  function nextTemplateLiteralTokenShared(endType, middleType) {
    var beginIndex = index;
    skipTemplateCharacter();
    if (isAtEnd()) {
      reportError('Unterminated template literal');
      return createToken(ERROR, beginIndex);
    }
    var value = getTokenString(beginIndex);
    switch (currentCharCode) {
      case 96:
        next();
        return lastToken = new LiteralToken(endType, value, getTokenRange(beginIndex - 1));
      case 36:
        next();
        next();
        return lastToken = new LiteralToken(middleType, value, getTokenRange(beginIndex - 1));
    }
  }
  function nextToken() {
    var t = peekToken();
    token = lookaheadToken || scanToken();
    lookaheadToken = null;
    lastToken = t;
    return t;
  }
  function peekTokenNoLineTerminator() {
    var t = peekToken();
    var start = lastToken.location.end.offset;
    var end = t.location.start.offset;
    for (var i = start; i < end; i++) {
      var code = input.charCodeAt(i);
      if (isLineTerminator(code))
        return null;
      if (code === 47) {
        code = input.charCodeAt(++i);
        if (code === 47)
          return null;
        i = input.indexOf('*/', i) + 2;
      }
    }
    return t;
  }
  function peekToken() {
    return token || (token = scanToken());
  }
  function peekTokenLookahead() {
    if (!token)
      token = scanToken();
    if (!lookaheadToken)
      lookaheadToken = scanToken();
    return lookaheadToken;
  }
  function skipWhitespace() {
    while (!isAtEnd() && peekWhitespace()) {
      next();
    }
  }
  function peekWhitespace() {
    return isWhitespace(currentCharCode);
  }
  function skipComments() {
    while (skipComment()) {}
  }
  function skipComment() {
    skipWhitespace();
    var code = currentCharCode;
    if (code === 47) {
      code = input.charCodeAt(index + 1);
      switch (code) {
        case 47:
          skipSingleLineComment();
          return true;
        case 42:
          skipMultiLineComment();
          return true;
      }
    }
    return false;
  }
  function commentCallback(start, index) {
    if (options.commentCallback)
      currentParser.handleComment(lineNumberTable.getSourceRange(start, index));
  }
  function skipSingleLineComment() {
    var start = index;
    index += 2;
    while (!isAtEnd() && !isLineTerminator(input.charCodeAt(index++))) {}
    updateCurrentCharCode();
    commentCallback(start, index);
  }
  function skipMultiLineComment() {
    var start = index;
    var i = input.indexOf('*/', index + 2);
    if (i !== -1)
      index = i + 2;
    else
      index = length;
    updateCurrentCharCode();
    commentCallback(start, index);
  }
  function scanToken() {
    skipComments();
    var beginIndex = index;
    if (isAtEnd())
      return createToken(END_OF_FILE, beginIndex);
    var code = currentCharCode;
    next();
    switch (code) {
      case 123:
        return createToken(OPEN_CURLY, beginIndex);
      case 125:
        return createToken(CLOSE_CURLY, beginIndex);
      case 40:
        return createToken(OPEN_PAREN, beginIndex);
      case 41:
        return createToken(CLOSE_PAREN, beginIndex);
      case 91:
        return createToken(OPEN_SQUARE, beginIndex);
      case 93:
        return createToken(CLOSE_SQUARE, beginIndex);
      case 46:
        switch (currentCharCode) {
          case 46:
            if (input.charCodeAt(index + 1) === 46) {
              next();
              next();
              return createToken(DOT_DOT_DOT, beginIndex);
            }
            break;
          default:
            if (isDecimalDigit(currentCharCode))
              return scanNumberPostPeriod(beginIndex);
        }
        return createToken(PERIOD, beginIndex);
      case 59:
        return createToken(SEMI_COLON, beginIndex);
      case 44:
        return createToken(COMMA, beginIndex);
      case 126:
        return createToken(TILDE, beginIndex);
      case 63:
        return createToken(QUESTION, beginIndex);
      case 58:
        return createToken(COLON, beginIndex);
      case 60:
        switch (currentCharCode) {
          case 60:
            next();
            if (currentCharCode === 61) {
              next();
              return createToken(LEFT_SHIFT_EQUAL, beginIndex);
            }
            return createToken(LEFT_SHIFT, beginIndex);
          case 61:
            next();
            return createToken(LESS_EQUAL, beginIndex);
          default:
            return createToken(OPEN_ANGLE, beginIndex);
        }
      case 62:
        switch (currentCharCode) {
          case 62:
            next();
            switch (currentCharCode) {
              case 61:
                next();
                return createToken(RIGHT_SHIFT_EQUAL, beginIndex);
              case 62:
                next();
                if (currentCharCode === 61) {
                  next();
                  return createToken(UNSIGNED_RIGHT_SHIFT_EQUAL, beginIndex);
                }
                return createToken(UNSIGNED_RIGHT_SHIFT, beginIndex);
              default:
                return createToken(RIGHT_SHIFT, beginIndex);
            }
          case 61:
            next();
            return createToken(GREATER_EQUAL, beginIndex);
          default:
            return createToken(CLOSE_ANGLE, beginIndex);
        }
      case 61:
        if (currentCharCode === 61) {
          next();
          if (currentCharCode === 61) {
            next();
            return createToken(EQUAL_EQUAL_EQUAL, beginIndex);
          }
          return createToken(EQUAL_EQUAL, beginIndex);
        }
        if (currentCharCode === 62) {
          next();
          return createToken(ARROW, beginIndex);
        }
        return createToken(EQUAL, beginIndex);
      case 33:
        if (currentCharCode === 61) {
          next();
          if (currentCharCode === 61) {
            next();
            return createToken(NOT_EQUAL_EQUAL, beginIndex);
          }
          return createToken(NOT_EQUAL, beginIndex);
        }
        return createToken(BANG, beginIndex);
      case 42:
        if (currentCharCode === 61) {
          next();
          return createToken(STAR_EQUAL, beginIndex);
        }
        return createToken(STAR, beginIndex);
      case 37:
        if (currentCharCode === 61) {
          next();
          return createToken(PERCENT_EQUAL, beginIndex);
        }
        return createToken(PERCENT, beginIndex);
      case 94:
        if (currentCharCode === 61) {
          next();
          return createToken(CARET_EQUAL, beginIndex);
        }
        return createToken(CARET, beginIndex);
      case 47:
        if (currentCharCode === 61) {
          next();
          return createToken(SLASH_EQUAL, beginIndex);
        }
        return createToken(SLASH, beginIndex);
      case 43:
        switch (currentCharCode) {
          case 43:
            next();
            return createToken(PLUS_PLUS, beginIndex);
          case 61:
            next();
            return createToken(PLUS_EQUAL, beginIndex);
          default:
            return createToken(PLUS, beginIndex);
        }
      case 45:
        switch (currentCharCode) {
          case 45:
            next();
            return createToken(MINUS_MINUS, beginIndex);
          case 61:
            next();
            return createToken(MINUS_EQUAL, beginIndex);
          default:
            return createToken(MINUS, beginIndex);
        }
      case 38:
        switch (currentCharCode) {
          case 38:
            next();
            return createToken(AND, beginIndex);
          case 61:
            next();
            return createToken(AMPERSAND_EQUAL, beginIndex);
          default:
            return createToken(AMPERSAND, beginIndex);
        }
      case 124:
        switch (currentCharCode) {
          case 124:
            next();
            return createToken(OR, beginIndex);
          case 61:
            next();
            return createToken(BAR_EQUAL, beginIndex);
          default:
            return createToken(BAR, beginIndex);
        }
      case 96:
        return scanTemplateStart(beginIndex);
      case 64:
        return createToken(AT, beginIndex);
      case 48:
        return scanPostZero(beginIndex);
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return scanPostDigit(beginIndex);
      case 34:
      case 39:
        return scanStringLiteral(beginIndex, code);
      default:
        return scanIdentifierOrKeyword(beginIndex, code);
    }
  }
  function scanNumberPostPeriod(beginIndex) {
    skipDecimalDigits();
    return scanExponentOfNumericLiteral(beginIndex);
  }
  function scanPostDigit(beginIndex) {
    skipDecimalDigits();
    return scanFractionalNumericLiteral(beginIndex);
  }
  function scanPostZero(beginIndex) {
    switch (currentCharCode) {
      case 46:
        return scanFractionalNumericLiteral(beginIndex);
      case 88:
      case 120:
        next();
        if (!isHexDigit(currentCharCode)) {
          reportError('Hex Integer Literal must contain at least one digit');
        }
        skipHexDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 66:
      case 98:
        if (!parseOptions.numericLiterals)
          break;
        next();
        if (!isBinaryDigit(currentCharCode)) {
          reportError('Binary Integer Literal must contain at least one digit');
        }
        skipBinaryDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 79:
      case 111:
        if (!parseOptions.numericLiterals)
          break;
        next();
        if (!isOctalDigit(currentCharCode)) {
          reportError('Octal Integer Literal must contain at least one digit');
        }
        skipOctalDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return scanPostDigit(beginIndex);
    }
    return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function createToken(type, beginIndex) {
    return new Token(type, getTokenRange(beginIndex));
  }
  function readUnicodeEscapeSequence() {
    var beginIndex = index;
    if (currentCharCode === 117) {
      next();
      if (skipHexDigit() && skipHexDigit() && skipHexDigit() && skipHexDigit()) {
        return parseInt(getTokenString(beginIndex + 1), 16);
      }
    }
    reportError('Invalid unicode escape sequence in identifier', beginIndex - 1);
    return 0;
  }
  function scanIdentifierOrKeyword(beginIndex, code) {
    var escapedCharCodes;
    if (code === 92) {
      code = readUnicodeEscapeSequence();
      escapedCharCodes = [code];
    }
    if (!isIdentifierStart(code)) {
      reportError(("Character code '" + code + "' is not a valid identifier start char"), beginIndex);
      return createToken(ERROR, beginIndex);
    }
    for (; ; ) {
      code = currentCharCode;
      if (isIdentifierPart(code)) {
        next();
      } else if (code === 92) {
        next();
        code = readUnicodeEscapeSequence();
        if (!escapedCharCodes)
          escapedCharCodes = [];
        escapedCharCodes.push(code);
        if (!isIdentifierPart(code))
          return createToken(ERROR, beginIndex);
      } else {
        break;
      }
    }
    var value = input.slice(beginIndex, index);
    var keywordType = getKeywordType(value);
    if (keywordType)
      return new KeywordToken(value, keywordType, getTokenRange(beginIndex));
    if (escapedCharCodes) {
      var i = 0;
      value = value.replace(/\\u..../g, function(s) {
        return String.fromCharCode(escapedCharCodes[i++]);
      });
    }
    return new IdentifierToken(getTokenRange(beginIndex), value);
  }
  function scanStringLiteral(beginIndex, terminator) {
    while (peekStringLiteralChar(terminator)) {
      if (!skipStringLiteralChar()) {
        return new LiteralToken(STRING, getTokenString(beginIndex), getTokenRange(beginIndex));
      }
    }
    if (currentCharCode !== terminator) {
      reportError('Unterminated String Literal', beginIndex);
    } else {
      next();
    }
    return new LiteralToken(STRING, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function getTokenString(beginIndex) {
    return input.substring(beginIndex, index);
  }
  function peekStringLiteralChar(terminator) {
    return !isAtEnd() && currentCharCode !== terminator && !isLineTerminator(currentCharCode);
  }
  function skipStringLiteralChar() {
    if (currentCharCode === 92) {
      return skipStringLiteralEscapeSequence();
    }
    next();
    return true;
  }
  function skipStringLiteralEscapeSequence() {
    next();
    if (isAtEnd()) {
      reportError('Unterminated string literal escape sequence');
      return false;
    }
    if (isLineTerminator(currentCharCode)) {
      skipLineTerminator();
      return true;
    }
    var code = currentCharCode;
    next();
    switch (code) {
      case 39:
      case 34:
      case 92:
      case 98:
      case 102:
      case 110:
      case 114:
      case 116:
      case 118:
      case 48:
        return true;
      case 120:
        return skipHexDigit() && skipHexDigit();
      case 117:
        return skipHexDigit() && skipHexDigit() && skipHexDigit() && skipHexDigit();
      default:
        return true;
    }
  }
  function skipHexDigit() {
    if (!isHexDigit(currentCharCode)) {
      reportError('Hex digit expected');
      return false;
    }
    next();
    return true;
  }
  function skipLineTerminator() {
    var first = currentCharCode;
    next();
    if (first === 13 && currentCharCode === 10) {
      next();
    }
  }
  function scanFractionalNumericLiteral(beginIndex) {
    if (currentCharCode === 46) {
      next();
      skipDecimalDigits();
    }
    return scanExponentOfNumericLiteral(beginIndex);
  }
  function scanExponentOfNumericLiteral(beginIndex) {
    switch (currentCharCode) {
      case 101:
      case 69:
        next();
        switch (currentCharCode) {
          case 43:
          case 45:
            next();
            break;
        }
        if (!isDecimalDigit(currentCharCode)) {
          reportError('Exponent part must contain at least one digit');
        }
        skipDecimalDigits();
        break;
      default:
        break;
    }
    return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
  }
  function skipDecimalDigits() {
    while (isDecimalDigit(currentCharCode)) {
      next();
    }
  }
  function skipHexDigits() {
    while (isHexDigit(currentCharCode)) {
      next();
    }
  }
  function skipBinaryDigits() {
    while (isBinaryDigit(currentCharCode)) {
      next();
    }
  }
  function skipOctalDigits() {
    while (isOctalDigit(currentCharCode)) {
      next();
    }
  }
  function isAtEnd() {
    return index === length;
  }
  function next() {
    index++;
    updateCurrentCharCode();
  }
  function updateCurrentCharCode() {
    currentCharCode = input.charCodeAt(index);
  }
  function reportError(message) {
    var indexArg = arguments[1] !== (void 0) ? arguments[1] : index;
    var position = getPosition(indexArg);
    errorReporter.reportError(position, message);
  }
  return {
    get isWhitespace() {
      return isWhitespace;
    },
    get isLineTerminator() {
      return isLineTerminator;
    },
    get isIdentifierPart() {
      return isIdentifierPart;
    },
    get Scanner() {
      return Scanner;
    }
  };
});
System.register("traceur@0.0.43/src/outputgeneration/ParseTreeWriter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/outputgeneration/ParseTreeWriter";
  var $__40 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BLOCK = $__40.BLOCK,
      IF_STATEMENT = $__40.IF_STATEMENT,
      LITERAL_EXPRESSION = $__40.LITERAL_EXPRESSION,
      POSTFIX_EXPRESSION = $__40.POSTFIX_EXPRESSION,
      UNARY_EXPRESSION = $__40.UNARY_EXPRESSION;
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var $__40 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      AS = $__40.AS,
      ASYNC = $__40.ASYNC,
      AWAIT = $__40.AWAIT,
      FROM = $__40.FROM,
      GET = $__40.GET,
      OF = $__40.OF,
      MODULE = $__40.MODULE,
      SET = $__40.SET;
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var getKeywordType = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Keywords")).getKeywordType;
  var $__40 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Scanner")),
      isIdentifierPart = $__40.isIdentifierPart,
      isWhitespace = $__40.isWhitespace;
  var $__40 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AMPERSAND = $__40.AMPERSAND,
      AMPERSAND_EQUAL = $__40.AMPERSAND_EQUAL,
      AND = $__40.AND,
      ARROW = $__40.ARROW,
      AT = $__40.AT,
      BACK_QUOTE = $__40.BACK_QUOTE,
      BANG = $__40.BANG,
      BAR = $__40.BAR,
      BAR_EQUAL = $__40.BAR_EQUAL,
      BREAK = $__40.BREAK,
      CARET = $__40.CARET,
      CARET_EQUAL = $__40.CARET_EQUAL,
      CASE = $__40.CASE,
      CATCH = $__40.CATCH,
      CLASS = $__40.CLASS,
      CLOSE_ANGLE = $__40.CLOSE_ANGLE,
      CLOSE_CURLY = $__40.CLOSE_CURLY,
      CLOSE_PAREN = $__40.CLOSE_PAREN,
      CLOSE_SQUARE = $__40.CLOSE_SQUARE,
      COLON = $__40.COLON,
      COMMA = $__40.COMMA,
      CONST = $__40.CONST,
      CONTINUE = $__40.CONTINUE,
      DEBUGGER = $__40.DEBUGGER,
      DEFAULT = $__40.DEFAULT,
      DELETE = $__40.DELETE,
      DO = $__40.DO,
      DOT_DOT_DOT = $__40.DOT_DOT_DOT,
      ELSE = $__40.ELSE,
      END_OF_FILE = $__40.END_OF_FILE,
      ENUM = $__40.ENUM,
      EQUAL = $__40.EQUAL,
      EQUAL_EQUAL = $__40.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__40.EQUAL_EQUAL_EQUAL,
      ERROR = $__40.ERROR,
      EXPORT = $__40.EXPORT,
      EXTENDS = $__40.EXTENDS,
      FALSE = $__40.FALSE,
      FINALLY = $__40.FINALLY,
      FOR = $__40.FOR,
      FUNCTION = $__40.FUNCTION,
      GREATER_EQUAL = $__40.GREATER_EQUAL,
      IDENTIFIER = $__40.IDENTIFIER,
      IF = $__40.IF,
      IMPLEMENTS = $__40.IMPLEMENTS,
      IMPORT = $__40.IMPORT,
      IN = $__40.IN,
      INSTANCEOF = $__40.INSTANCEOF,
      INTERFACE = $__40.INTERFACE,
      LEFT_SHIFT = $__40.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__40.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__40.LESS_EQUAL,
      LET = $__40.LET,
      MINUS = $__40.MINUS,
      MINUS_EQUAL = $__40.MINUS_EQUAL,
      MINUS_MINUS = $__40.MINUS_MINUS,
      NEW = $__40.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__40.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__40.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__40.NOT_EQUAL_EQUAL,
      NULL = $__40.NULL,
      NUMBER = $__40.NUMBER,
      OPEN_ANGLE = $__40.OPEN_ANGLE,
      OPEN_CURLY = $__40.OPEN_CURLY,
      OPEN_PAREN = $__40.OPEN_PAREN,
      OPEN_SQUARE = $__40.OPEN_SQUARE,
      OR = $__40.OR,
      PACKAGE = $__40.PACKAGE,
      PERCENT = $__40.PERCENT,
      PERCENT_EQUAL = $__40.PERCENT_EQUAL,
      PERIOD = $__40.PERIOD,
      PLUS = $__40.PLUS,
      PLUS_EQUAL = $__40.PLUS_EQUAL,
      PLUS_PLUS = $__40.PLUS_PLUS,
      PRIVATE = $__40.PRIVATE,
      PROTECTED = $__40.PROTECTED,
      PUBLIC = $__40.PUBLIC,
      QUESTION = $__40.QUESTION,
      REGULAR_EXPRESSION = $__40.REGULAR_EXPRESSION,
      RETURN = $__40.RETURN,
      RIGHT_SHIFT = $__40.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__40.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__40.SEMI_COLON,
      SLASH = $__40.SLASH,
      SLASH_EQUAL = $__40.SLASH_EQUAL,
      STAR = $__40.STAR,
      STAR_EQUAL = $__40.STAR_EQUAL,
      STATIC = $__40.STATIC,
      STRING = $__40.STRING,
      SUPER = $__40.SUPER,
      SWITCH = $__40.SWITCH,
      TEMPLATE_HEAD = $__40.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__40.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__40.TEMPLATE_TAIL,
      THIS = $__40.THIS,
      THROW = $__40.THROW,
      TILDE = $__40.TILDE,
      TRUE = $__40.TRUE,
      TRY = $__40.TRY,
      TYPEOF = $__40.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__40.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__40.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__40.VAR,
      VOID = $__40.VOID,
      WHILE = $__40.WHILE,
      WITH = $__40.WITH,
      YIELD = $__40.YIELD;
  var NEW_LINE = '\n';
  var LINE_LENGTH = 80;
  var ParseTreeWriter = function ParseTreeWriter() {
    var $__41;
    var $__40 = $traceurRuntime.assertObject(arguments[0] !== (void 0) ? arguments[0] : {}),
        highlighted = ($__41 = $__40.highlighted) === void 0 ? false : $__41,
        showLineNumbers = ($__41 = $__40.showLineNumbers) === void 0 ? false : $__41,
        prettyPrint = ($__41 = $__40.prettyPrint) === void 0 ? true : $__41;
    $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "constructor", []);
    this.highlighted_ = highlighted;
    this.showLineNumbers_ = showLineNumbers;
    this.prettyPrint_ = prettyPrint;
    this.result_ = '';
    this.currentLine_ = '';
    this.currentLineComment_ = null;
    this.indentDepth_ = 0;
    this.currentParameterTypeAnnotation_ = null;
  };
  var $ParseTreeWriter = ParseTreeWriter;
  ($traceurRuntime.createClass)(ParseTreeWriter, {
    toString: function() {
      if (this.currentLine_.length > 0) {
        this.result_ += this.currentLine_;
        this.currentLine_ = '';
      }
      return this.result_;
    },
    visitAny: function(tree) {
      if (!tree) {
        return;
      }
      if (tree === this.highlighted_) {
        this.write_('\x1B[41m');
      }
      if (tree.location !== null && tree.location.start !== null && this.showLineNumbers_) {
        var line = tree.location.start.line + 1;
        var column = tree.location.start.column;
        this.currentLineComment_ = ("Line: " + line + "." + column);
      }
      $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "visitAny", [tree]);
      if (tree === this.highlighted_) {
        this.write_('\x1B[0m');
      }
    },
    visitAnnotation: function(tree) {
      this.write_(AT);
      this.visitAny(tree.name);
      if (tree.args !== null) {
        this.write_(OPEN_PAREN);
        this.writeList_(tree.args, COMMA, false);
        this.write_(CLOSE_PAREN);
      }
    },
    visitArgumentList: function(tree) {
      this.write_(OPEN_PAREN);
      this.writeList_(tree.args, COMMA, false);
      this.write_(CLOSE_PAREN);
    },
    visitArrayComprehension: function(tree) {
      this.write_(OPEN_SQUARE);
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
      this.write_(CLOSE_SQUARE);
    },
    visitArrayLiteralExpression: function(tree) {
      this.write_(OPEN_SQUARE);
      this.writeList_(tree.elements, COMMA, false);
      this.write_(CLOSE_SQUARE);
    },
    visitArrayPattern: function(tree) {
      this.write_(OPEN_SQUARE);
      this.writeList_(tree.elements, COMMA, false);
      this.write_(CLOSE_SQUARE);
    },
    visitArrowFunctionExpression: function(tree) {
      this.write_(OPEN_PAREN);
      this.visitAny(tree.parameterList);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.write_(ARROW);
      this.writeSpace_();
      this.visitAny(tree.functionBody);
    },
    visitAwaitExpression: function(tree) {
      this.write_(AWAIT);
      this.writeSpace_();
      this.visitAny(tree.expression);
    },
    visitBinaryOperator: function(tree) {
      var left = tree.left;
      this.visitAny(left);
      var operator = tree.operator;
      if (left.type === POSTFIX_EXPRESSION && requiresSpaceBetween(left.operator.type, operator.type)) {
        this.writeRequiredSpace_();
      } else {
        this.writeSpace_();
      }
      this.write_(operator);
      var right = tree.right;
      if (right.type === UNARY_EXPRESSION && requiresSpaceBetween(operator.type, right.operator.type)) {
        this.writeRequiredSpace_();
      } else {
        this.writeSpace_();
      }
      this.visitAny(right);
    },
    visitBindingElement: function(tree) {
      var typeAnnotation = this.currentParameterTypeAnnotation_;
      this.currentParameterTypeAnnotation_ = null;
      this.visitAny(tree.binding);
      this.writeTypeAnnotation_(typeAnnotation);
      if (tree.initializer) {
        this.writeSpace_();
        this.write_(EQUAL);
        this.writeSpace_();
        this.visitAny(tree.initializer);
      }
    },
    visitBindingIdentifier: function(tree) {
      this.write_(tree.identifierToken);
    },
    visitBlock: function(tree) {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.statements);
      this.write_(CLOSE_CURLY);
    },
    visitBreakStatement: function(tree) {
      this.write_(BREAK);
      if (tree.name !== null) {
        this.writeSpace_();
        this.write_(tree.name);
      }
      this.write_(SEMI_COLON);
    },
    visitCallExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitCaseClause: function(tree) {
      this.write_(CASE);
      this.writeSpace_();
      this.visitAny(tree.expression);
      this.write_(COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },
    visitCatch: function(tree) {
      this.write_(CATCH);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.binding);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.visitAny(tree.catchBody);
    },
    visitClassShared_: function(tree) {
      this.writeAnnotations_(tree.annotations);
      this.write_(CLASS);
      this.writeSpace_();
      this.visitAny(tree.name);
      if (tree.superClass !== null) {
        this.writeSpace_();
        this.write_(EXTENDS);
        this.writeSpace_();
        this.visitAny(tree.superClass);
      }
      this.writeSpace_();
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.elements);
      this.write_(CLOSE_CURLY);
    },
    visitClassDeclaration: function(tree) {
      this.visitClassShared_(tree);
    },
    visitClassExpression: function(tree) {
      this.visitClassShared_(tree);
    },
    visitCommaExpression: function(tree) {
      this.writeList_(tree.expressions, COMMA, false);
    },
    visitComprehensionFor: function(tree) {
      this.write_(FOR);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.left);
      this.writeSpace_();
      this.write_(OF);
      this.writeSpace_();
      this.visitAny(tree.iterator);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
    },
    visitComprehensionIf: function(tree) {
      this.write_(IF);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
    },
    visitComputedPropertyName: function(tree) {
      this.write_(OPEN_SQUARE);
      this.visitAny(tree.expression);
      this.write_(CLOSE_SQUARE);
    },
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.writeSpace_();
      this.write_(QUESTION);
      this.writeSpace_();
      this.visitAny(tree.left);
      this.writeSpace_();
      this.write_(COLON);
      this.writeSpace_();
      this.visitAny(tree.right);
    },
    visitContinueStatement: function(tree) {
      this.write_(CONTINUE);
      if (tree.name !== null) {
        this.writeSpace_();
        this.write_(tree.name);
      }
      this.write_(SEMI_COLON);
    },
    visitCoverInitialisedName: function(tree) {
      this.write_(tree.name);
      this.writeSpace_();
      this.write_(tree.equalToken);
      this.writeSpace_();
      this.visitAny(tree.initializer);
    },
    visitDebuggerStatement: function(tree) {
      this.write_(DEBUGGER);
      this.write_(SEMI_COLON);
    },
    visitDefaultClause: function(tree) {
      this.write_(DEFAULT);
      this.write_(COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },
    visitDoWhileStatement: function(tree) {
      this.write_(DO);
      this.visitAnyBlockOrIndent_(tree.body);
      this.writeSpace_();
      this.write_(WHILE);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.write_(SEMI_COLON);
    },
    visitEmptyStatement: function(tree) {
      this.write_(SEMI_COLON);
    },
    visitExportDeclaration: function(tree) {
      this.writeAnnotations_(tree.annotations);
      this.write_(EXPORT);
      this.writeSpace_();
      this.visitAny(tree.declaration);
    },
    visitExportDefault: function(tree) {
      this.write_(DEFAULT);
      this.writeSpace_();
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitNamedExport: function(tree) {
      this.visitAny(tree.specifierSet);
      if (tree.moduleSpecifier) {
        this.writeSpace_();
        this.write_(FROM);
        this.writeSpace_();
        this.visitAny(tree.moduleSpecifier);
      }
      this.write_(SEMI_COLON);
    },
    visitExportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs) {
        this.writeSpace_();
        this.write_(AS);
        this.writeSpace_();
        this.write_(tree.rhs);
      }
    },
    visitExportSpecifierSet: function(tree) {
      this.write_(OPEN_CURLY);
      this.writeList_(tree.specifiers, COMMA, false);
      this.write_(CLOSE_CURLY);
    },
    visitExportStar: function(tree) {
      this.write_(STAR);
    },
    visitExpressionStatement: function(tree) {
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitFinally: function(tree) {
      this.write_(FINALLY);
      this.writeSpace_();
      this.visitAny(tree.block);
    },
    visitForOfStatement: function(tree) {
      this.write_(FOR);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.writeSpace_();
      this.write_(OF);
      this.writeSpace_();
      this.visitAny(tree.collection);
      this.write_(CLOSE_PAREN);
      this.visitAnyBlockOrIndent_(tree.body);
    },
    visitForInStatement: function(tree) {
      this.write_(FOR);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.writeSpace_();
      this.write_(IN);
      this.writeSpace_();
      this.visitAny(tree.collection);
      this.write_(CLOSE_PAREN);
      this.visitAnyBlockOrIndent_(tree.body);
    },
    visitForStatement: function(tree) {
      this.write_(FOR);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(SEMI_COLON);
      this.writeSpace_();
      this.visitAny(tree.condition);
      this.write_(SEMI_COLON);
      this.writeSpace_();
      this.visitAny(tree.increment);
      this.write_(CLOSE_PAREN);
      this.visitAnyBlockOrIndent_(tree.body);
    },
    visitFormalParameterList: function(tree) {
      var first = true;
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        if (first) {
          first = false;
        } else {
          this.write_(COMMA);
          this.writeSpace_();
        }
        this.visitAny(parameter);
      }
    },
    visitFormalParameter: function(tree) {
      this.writeAnnotations_(tree.annotations, false);
      this.currentParameterTypeAnnotation_ = tree.typeAnnotation;
      this.visitAny(tree.parameter);
      this.currentParameterTypeAnnotation_ = null;
    },
    visitFunctionBody: function(tree) {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.statements);
      this.write_(CLOSE_CURLY);
    },
    visitFunctionDeclaration: function(tree) {
      this.visitFunction_(tree);
    },
    visitFunctionExpression: function(tree) {
      this.visitFunction_(tree);
    },
    visitFunction_: function(tree) {
      this.writeAnnotations_(tree.annotations);
      if (tree.isAsyncFunction())
        this.write_(tree.functionKind);
      this.write_(FUNCTION);
      if (tree.isGenerator())
        this.write_(tree.functionKind);
      if (tree.name) {
        this.writeSpace_();
        this.visitAny(tree.name);
      }
      this.write_(OPEN_PAREN);
      this.visitAny(tree.parameterList);
      this.write_(CLOSE_PAREN);
      this.writeTypeAnnotation_(tree.typeAnnotation);
      this.writeSpace_();
      this.visitAny(tree.functionBody);
    },
    visitGeneratorComprehension: function(tree) {
      this.write_(OPEN_PAREN);
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
    },
    visitGetAccessor: function(tree) {
      this.writeAnnotations_(tree.annotations);
      if (tree.isStatic) {
        this.write_(STATIC);
        this.writeSpace_();
      }
      this.write_(GET);
      this.writeSpace_();
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.writeTypeAnnotation_(tree.typeAnnotation);
      this.visitAny(tree.body);
    },
    visitIdentifierExpression: function(tree) {
      this.write_(tree.identifierToken);
    },
    visitIfStatement: function(tree) {
      this.write_(IF);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.visitAnyBlockOrIndent_(tree.ifClause);
      if (tree.elseClause) {
        if (tree.ifClause.type === BLOCK)
          this.writeSpace_();
        this.write_(ELSE);
        if (tree.elseClause.type === IF_STATEMENT) {
          this.writeSpace_();
          this.visitAny(tree.elseClause);
        } else {
          this.visitAnyBlockOrIndent_(tree.elseClause);
        }
      }
    },
    visitAnyBlockOrIndent_: function(tree) {
      if (tree.type === BLOCK) {
        this.writeSpace_();
        this.visitAny(tree);
      } else {
        this.visitAnyIndented_(tree);
      }
    },
    visitAnyIndented_: function(tree) {
      var indent = arguments[1] !== (void 0) ? arguments[1] : 1;
      if (this.prettyPrint_) {
        this.indentDepth_ += indent;
        this.writeln_();
      }
      this.visitAny(tree);
      if (this.prettyPrint_) {
        this.indentDepth_ -= indent;
        this.writeln_();
      }
    },
    visitImportDeclaration: function(tree) {
      this.write_(IMPORT);
      this.writeSpace_();
      if (tree.importClause) {
        this.visitAny(tree.importClause);
        this.writeSpace_();
        this.write_(FROM);
        this.writeSpace_();
      }
      this.visitAny(tree.moduleSpecifier);
      this.write_(SEMI_COLON);
    },
    visitImportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs !== null) {
        this.writeSpace_();
        this.write_(AS);
        this.writeSpace_();
        this.write_(tree.rhs);
      }
    },
    visitImportSpecifierSet: function(tree) {
      if (tree.specifiers.type == STAR) {
        this.write_(STAR);
      } else {
        this.write_(OPEN_CURLY);
        this.writelnList_(tree.specifiers, COMMA);
        this.write_(CLOSE_CURLY);
      }
    },
    visitLabelledStatement: function(tree) {
      this.write_(tree.name);
      this.write_(COLON);
      this.writeSpace_();
      this.visitAny(tree.statement);
    },
    visitLiteralExpression: function(tree) {
      this.write_(tree.literalToken);
    },
    visitLiteralPropertyName: function(tree) {
      this.write_(tree.literalToken);
    },
    visitMemberExpression: function(tree) {
      this.visitAny(tree.operand);
      if (tree.operand.type === LITERAL_EXPRESSION && tree.operand.literalToken.type === NUMBER) {
        if (!/\.|e|E/.test(tree.operand.literalToken.value))
          this.writeRequiredSpace_();
      }
      this.write_(PERIOD);
      this.write_(tree.memberName);
    },
    visitMemberLookupExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(OPEN_SQUARE);
      this.visitAny(tree.memberExpression);
      this.write_(CLOSE_SQUARE);
    },
    visitSyntaxErrorTree: function(tree) {
      this.write_('(function() {' + ("throw SyntaxError(" + JSON.stringify(tree.message) + ");") + '})()');
    },
    visitModule: function(tree) {
      this.writelnList_(tree.scriptItemList, null);
    },
    visitModuleSpecifier: function(tree) {
      this.write_(tree.token);
    },
    visitModuleDeclaration: function(tree) {
      this.write_(MODULE);
      this.writeSpace_();
      this.write_(tree.identifier);
      this.writeSpace_();
      this.write_(FROM);
      this.writeSpace_();
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitNewExpression: function(tree) {
      this.write_(NEW);
      this.writeSpace_();
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      this.write_(OPEN_CURLY);
      if (tree.propertyNameAndValues.length > 1)
        this.writeln_();
      this.writelnList_(tree.propertyNameAndValues, COMMA);
      if (tree.propertyNameAndValues.length > 1)
        this.writeln_();
      this.write_(CLOSE_CURLY);
    },
    visitObjectPattern: function(tree) {
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.fields, COMMA);
      this.write_(CLOSE_CURLY);
    },
    visitObjectPatternField: function(tree) {
      this.visitAny(tree.name);
      if (tree.element !== null) {
        this.write_(COLON);
        this.writeSpace_();
        this.visitAny(tree.element);
      }
    },
    visitParenExpression: function(tree) {
      this.write_(OPEN_PAREN);
      $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "visitParenExpression", [tree]);
      this.write_(CLOSE_PAREN);
    },
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
      if (tree.operand.type === POSTFIX_EXPRESSION && tree.operand.operator.type === tree.operator.type) {
        this.writeRequiredSpace_();
      }
      this.write_(tree.operator);
    },
    visitPredefinedType: function(tree) {
      this.write_(tree.typeToken);
    },
    visitScript: function(tree) {
      this.writelnList_(tree.scriptItemList, null);
    },
    visitPropertyMethodAssignment: function(tree) {
      this.writeAnnotations_(tree.annotations);
      if (tree.isStatic) {
        this.write_(STATIC);
        this.writeSpace_();
      }
      if (tree.isGenerator())
        this.write_(STAR);
      if (tree.isAsyncFunction())
        this.write_(ASYNC);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.parameterList);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.writeTypeAnnotation_(tree.typeAnnotation);
      this.visitAny(tree.functionBody);
    },
    visitPropertyNameAssignment: function(tree) {
      this.visitAny(tree.name);
      this.write_(COLON);
      this.writeSpace_();
      this.visitAny(tree.value);
    },
    visitPropertyNameShorthand: function(tree) {
      this.write_(tree.name);
    },
    visitTemplateLiteralExpression: function(tree) {
      if (tree.operand) {
        this.visitAny(tree.operand);
        this.writeSpace_();
      }
      this.writeRaw_(BACK_QUOTE);
      this.visitList(tree.elements);
      this.writeRaw_(BACK_QUOTE);
    },
    visitTemplateLiteralPortion: function(tree) {
      this.writeRaw_(tree.value);
    },
    visitTemplateSubstitution: function(tree) {
      this.writeRaw_('$');
      this.writeRaw_(OPEN_CURLY);
      this.visitAny(tree.expression);
      this.writeRaw_(CLOSE_CURLY);
    },
    visitReturnStatement: function(tree) {
      this.write_(RETURN);
      this.writeSpace_(tree.expression);
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitRestParameter: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.write_(tree.identifier.identifierToken);
      this.writeTypeAnnotation_(this.currentParameterTypeAnnotation_);
    },
    visitSetAccessor: function(tree) {
      this.writeAnnotations_(tree.annotations);
      if (tree.isStatic) {
        this.write_(STATIC);
        this.writeSpace_();
      }
      this.write_(SET);
      this.writeSpace_();
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.parameterList);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.visitAny(tree.body);
    },
    visitSpreadExpression: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.visitAny(tree.expression);
    },
    visitSpreadPatternElement: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.visitAny(tree.lvalue);
    },
    visitStateMachine: function(tree) {
      throw new Error('State machines cannot be converted to source');
    },
    visitSuperExpression: function(tree) {
      this.write_(SUPER);
    },
    visitSwitchStatement: function(tree) {
      this.write_(SWITCH);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.caseClauses);
      this.write_(CLOSE_CURLY);
    },
    visitThisExpression: function(tree) {
      this.write_(THIS);
    },
    visitThrowStatement: function(tree) {
      this.write_(THROW);
      this.writeSpace_();
      this.visitAny(tree.value);
      this.write_(SEMI_COLON);
    },
    visitTryStatement: function(tree) {
      this.write_(TRY);
      this.writeSpace_();
      this.visitAny(tree.body);
      if (tree.catchBlock) {
        this.writeSpace_();
        this.visitAny(tree.catchBlock);
      }
      if (tree.finallyBlock) {
        this.writeSpace_();
        this.visitAny(tree.finallyBlock);
      }
    },
    visitTypeName: function(tree) {
      if (tree.moduleName) {
        this.visitAny(tree.moduleName);
        this.write_(PERIOD);
      }
      this.write_(tree.name);
    },
    visitUnaryExpression: function(tree) {
      var op = tree.operator;
      this.write_(op);
      var operand = tree.operand;
      if (operand.type === UNARY_EXPRESSION && requiresSpaceBetween(op.type, operand.operator.type)) {
        this.writeRequiredSpace_();
      }
      this.visitAny(operand);
    },
    visitVariableDeclarationList: function(tree) {
      this.write_(tree.declarationType);
      this.writeSpace_();
      this.writeList_(tree.declarations, COMMA, true, 2);
    },
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      this.writeTypeAnnotation_(tree.typeAnnotation);
      if (tree.initializer !== null) {
        this.writeSpace_();
        this.write_(EQUAL);
        this.writeSpace_();
        this.visitAny(tree.initializer);
      }
    },
    visitVariableStatement: function(tree) {
      $traceurRuntime.superCall(this, $ParseTreeWriter.prototype, "visitVariableStatement", [tree]);
      this.write_(SEMI_COLON);
    },
    visitWhileStatement: function(tree) {
      this.write_(WHILE);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.visitAnyBlockOrIndent_(tree.body);
    },
    visitWithStatement: function(tree) {
      this.write_(WITH);
      this.writeSpace_();
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.writeSpace_();
      this.visitAny(tree.body);
    },
    visitYieldExpression: function(tree) {
      this.write_(YIELD);
      if (tree.isYieldFor)
        this.write_(STAR);
      if (tree.expression) {
        this.writeSpace_();
        this.visitAny(tree.expression);
      }
    },
    writeCurrentln_: function() {
      this.result_ += this.currentLine_ + NEW_LINE;
    },
    writeln_: function() {
      if (this.currentLineComment_) {
        while (this.currentLine_.length < LINE_LENGTH) {
          this.currentLine_ += ' ';
        }
        this.currentLine_ += ' // ' + this.currentLineComment_;
        this.currentLineComment_ = null;
      }
      if (this.currentLine_)
        this.writeCurrentln_();
      this.currentLine_ = '';
    },
    writelnList_: function(list, delimiter) {
      if (delimiter) {
        this.writeList_(list, delimiter, true);
      } else {
        if (list.length > 0)
          this.writeln_();
        this.writeList_(list, null, true);
        if (list.length > 0)
          this.writeln_();
      }
    },
    writeList_: function(list, delimiter, writeNewLine) {
      var indent = arguments[3] !== (void 0) ? arguments[3] : 0;
      var first = true;
      for (var i = 0; i < list.length; i++) {
        var element = list[i];
        if (first) {
          first = false;
        } else {
          if (delimiter !== null) {
            this.write_(delimiter);
            if (!writeNewLine)
              this.writeSpace_();
          }
          if (writeNewLine) {
            if (i === 1)
              this.indentDepth_ += indent;
            this.writeln_();
          }
        }
        this.visitAny(element);
      }
      if (writeNewLine && list.length > 1)
        this.indentDepth_ -= indent;
    },
    writeRaw_: function(value) {
      this.currentLine_ += value;
    },
    write_: function(value) {
      if (value === CLOSE_CURLY)
        this.indentDepth_--;
      if (value !== null) {
        if (this.prettyPrint_) {
          if (!this.currentLine_) {
            for (var i = 0,
                indent = this.indentDepth_; i < indent; i++) {
              this.currentLine_ += '  ';
            }
          }
        }
        if (this.needsSpace_(value))
          this.currentLine_ += ' ';
        this.currentLine_ += value;
      }
      if (value === OPEN_CURLY)
        this.indentDepth_++;
    },
    writeSpace_: function() {
      var useSpace = arguments[0] !== (void 0) ? arguments[0] : this.prettyPrint_;
      if (useSpace && !endsWithSpace(this.currentLine_))
        this.currentLine_ += ' ';
    },
    writeRequiredSpace_: function() {
      this.writeSpace_(true);
    },
    writeTypeAnnotation_: function(typeAnnotation) {
      if (typeAnnotation !== null) {
        this.write_(COLON);
        this.writeSpace_();
        this.visitAny(typeAnnotation);
      }
    },
    writeAnnotations_: function(annotations) {
      var writeNewLine = arguments[1] !== (void 0) ? arguments[1] : this.prettyPrint_;
      if (annotations.length > 0) {
        this.writeList_(annotations, null, writeNewLine);
        if (writeNewLine)
          this.writeln_();
      }
    },
    needsSpace_: function(token) {
      var line = this.currentLine_;
      if (!line)
        return false;
      var lastCode = line.charCodeAt(line.length - 1);
      if (isWhitespace(lastCode))
        return false;
      var firstCode = token.toString().charCodeAt(0);
      return isIdentifierPart(firstCode) && (isIdentifierPart(lastCode) || lastCode === 47);
    }
  }, {}, ParseTreeVisitor);
  function requiresSpaceBetween(first, second) {
    return (first === MINUS || first === MINUS_MINUS) && (second === MINUS || second === MINUS_MINUS) || (first === PLUS || first === PLUS_PLUS) && (second === PLUS || second === PLUS_PLUS);
  }
  function endsWithSpace(s) {
    return isWhitespace(s.charCodeAt(s.length - 1));
  }
  return {get ParseTreeWriter() {
      return ParseTreeWriter;
    }};
});
System.register("traceur@0.0.43/src/outputgeneration/ParseTreeMapWriter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/outputgeneration/ParseTreeMapWriter";
  var ParseTreeWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/ParseTreeWriter")).ParseTreeWriter;
  var ParseTreeMapWriter = function ParseTreeMapWriter(sourceMapGenerator) {
    var options = arguments[1];
    $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "constructor", [options]);
    this.sourceMapGenerator_ = sourceMapGenerator;
    this.outputLineCount_ = 1;
    this.isFirstMapping_ = true;
  };
  var $ParseTreeMapWriter = ParseTreeMapWriter;
  ($traceurRuntime.createClass)(ParseTreeMapWriter, {
    visitAny: function(tree) {
      if (!tree) {
        return;
      }
      if (tree.location)
        this.enterBranch(tree.location);
      $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "visitAny", [tree]);
      if (tree.location)
        this.exitBranch(tree.location);
    },
    writeCurrentln_: function() {
      $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "writeCurrentln_", []);
      this.flushMappings();
      this.outputLineCount_++;
      this.generated_ = {
        line: this.outputLineCount_,
        column: 1
      };
      this.flushMappings();
    },
    write_: function(value) {
      if (this.entered_) {
        this.generate();
        $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "write_", [value]);
        this.generate();
      } else {
        this.generate();
        $traceurRuntime.superCall(this, $ParseTreeMapWriter.prototype, "write_", [value]);
        this.generate();
      }
    },
    generate: function() {
      this.generated_ = {
        line: this.outputLineCount_,
        column: this.currentLine_.length
      };
      this.flushMappings();
    },
    enterBranch: function(location) {
      this.originate(location.start);
      this.entered_ = true;
    },
    exitBranch: function(location) {
      this.originate(location.end);
      this.entered_ = false;
    },
    originate: function(position) {
      var line = position.line + 1;
      if (this.original_ && this.original_.line !== line)
        this.flushMappings();
      this.original_ = {
        line: line,
        column: position.column || 0
      };
      if (position.source.name !== this.sourceName_) {
        this.sourceName_ = position.source.name;
        this.sourceMapGenerator_.setSourceContent(position.source.name, position.source.contents);
      }
      this.flushMappings();
    },
    flushMappings: function() {
      if (this.original_ && this.generated_) {
        this.addMapping();
        this.original_ = null;
        this.generated_ = null;
      }
    },
    isSame: function(lhs, rhs) {
      return lhs.line === rhs.line && lhs.column === rhs.column;
    },
    isSameMapping: function() {
      if (!this.previousMapping_)
        return false;
      if (this.isSame(this.previousMapping_.generated, this.generated_) && this.isSame(this.previousMapping_.original, this.original_))
        return true;
      ;
    },
    addMapping: function() {
      if (this.isSameMapping())
        return;
      var mapping = {
        generated: this.generated_,
        original: this.original_,
        source: this.sourceName_
      };
      this.sourceMapGenerator_.addMapping(mapping);
      this.previousMapping_ = mapping;
    }
  }, {}, ParseTreeWriter);
  return {get ParseTreeMapWriter() {
      return ParseTreeMapWriter;
    }};
});
System.register("traceur@0.0.43/src/outputgeneration/SourceMapIntegration", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/outputgeneration/SourceMapIntegration";
  function makeDefine(mapping, id) {
    var require = function(id) {
      return mapping[id];
    };
    var exports = mapping[id] = {};
    var module = null;
    return function(factory) {
      factory(require, exports, module);
    };
  }
  var define,
      m = {};
  define = makeDefine(m, './util');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    function getArg(aArgs, aName, aDefaultValue) {
      if (aName in aArgs) {
        return aArgs[aName];
      } else if (arguments.length === 3) {
        return aDefaultValue;
      } else {
        throw new Error('"' + aName + '" is a required argument.');
      }
    }
    exports.getArg = getArg;
    var urlRegexp = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
    var dataUrlRegexp = /^data:.+\,.+/;
    function urlParse(aUrl) {
      var match = aUrl.match(urlRegexp);
      if (!match) {
        return null;
      }
      return {
        scheme: match[1],
        auth: match[3],
        host: match[4],
        port: match[6],
        path: match[7]
      };
    }
    exports.urlParse = urlParse;
    function urlGenerate(aParsedUrl) {
      var url = aParsedUrl.scheme + "://";
      if (aParsedUrl.auth) {
        url += aParsedUrl.auth + "@";
      }
      if (aParsedUrl.host) {
        url += aParsedUrl.host;
      }
      if (aParsedUrl.port) {
        url += ":" + aParsedUrl.port;
      }
      if (aParsedUrl.path) {
        url += aParsedUrl.path;
      }
      return url;
    }
    exports.urlGenerate = urlGenerate;
    function join(aRoot, aPath) {
      var url;
      if (aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)) {
        return aPath;
      }
      if (aPath.charAt(0) === '/' && (url = urlParse(aRoot))) {
        url.path = aPath;
        return urlGenerate(url);
      }
      return aRoot.replace(/\/$/, '') + '/' + aPath;
    }
    exports.join = join;
    function toSetString(aStr) {
      return '$' + aStr;
    }
    exports.toSetString = toSetString;
    function fromSetString(aStr) {
      return aStr.substr(1);
    }
    exports.fromSetString = fromSetString;
    function relative(aRoot, aPath) {
      aRoot = aRoot.replace(/\/$/, '');
      var url = urlParse(aRoot);
      if (aPath.charAt(0) == "/" && url && url.path == "/") {
        return aPath.slice(1);
      }
      return aPath.indexOf(aRoot + '/') === 0 ? aPath.substr(aRoot.length + 1) : aPath;
    }
    exports.relative = relative;
    function strcmp(aStr1, aStr2) {
      var s1 = aStr1 || "";
      var s2 = aStr2 || "";
      return (s1 > s2) - (s1 < s2);
    }
    function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
      var cmp;
      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp || onlyCompareOriginal) {
        return cmp;
      }
      cmp = strcmp(mappingA.name, mappingB.name);
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp) {
        return cmp;
      }
      return mappingA.generatedColumn - mappingB.generatedColumn;
    }
    ;
    exports.compareByOriginalPositions = compareByOriginalPositions;
    function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
      var cmp;
      cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp || onlyCompareGenerated) {
        return cmp;
      }
      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp) {
        return cmp;
      }
      return strcmp(mappingA.name, mappingB.name);
    }
    ;
    exports.compareByGeneratedPositions = compareByGeneratedPositions;
  });
  define = makeDefine(m, './array-set');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var util = require('./util');
    function ArraySet() {
      this._array = [];
      this._set = {};
    }
    ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
      var set = new ArraySet();
      for (var i = 0,
          len = aArray.length; i < len; i++) {
        set.add(aArray[i], aAllowDuplicates);
      }
      return set;
    };
    ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
      var isDuplicate = this.has(aStr);
      var idx = this._array.length;
      if (!isDuplicate || aAllowDuplicates) {
        this._array.push(aStr);
      }
      if (!isDuplicate) {
        this._set[util.toSetString(aStr)] = idx;
      }
    };
    ArraySet.prototype.has = function ArraySet_has(aStr) {
      return Object.prototype.hasOwnProperty.call(this._set, util.toSetString(aStr));
    };
    ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
      if (this.has(aStr)) {
        return this._set[util.toSetString(aStr)];
      }
      throw new Error('"' + aStr + '" is not in the set.');
    };
    ArraySet.prototype.at = function ArraySet_at(aIdx) {
      if (aIdx >= 0 && aIdx < this._array.length) {
        return this._array[aIdx];
      }
      throw new Error('No element indexed by ' + aIdx);
    };
    ArraySet.prototype.toArray = function ArraySet_toArray() {
      return this._array.slice();
    };
    exports.ArraySet = ArraySet;
  });
  define = makeDefine(m, './base64');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var charToIntMap = {};
    var intToCharMap = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('').forEach(function(ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });
    exports.encode = function base64_encode(aNumber) {
      if (aNumber in intToCharMap) {
        return intToCharMap[aNumber];
      }
      throw new TypeError("Must be between 0 and 63: " + aNumber);
    };
    exports.decode = function base64_decode(aChar) {
      if (aChar in charToIntMap) {
        return charToIntMap[aChar];
      }
      throw new TypeError("Not a valid base 64 digit: " + aChar);
    };
  });
  define = makeDefine(m, './base64-vlq');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var base64 = require('./base64');
    var VLQ_BASE_SHIFT = 5;
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    var VLQ_BASE_MASK = VLQ_BASE - 1;
    var VLQ_CONTINUATION_BIT = VLQ_BASE;
    function toVLQSigned(aValue) {
      return aValue < 0 ? ((-aValue) << 1) + 1 : (aValue << 1) + 0;
    }
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative ? -shifted : shifted;
    }
    exports.encode = function base64VLQ_encode(aValue) {
      var encoded = "";
      var digit;
      var vlq = toVLQSigned(aValue);
      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base64.encode(digit);
      } while (vlq > 0);
      return encoded;
    };
    exports.decode = function base64VLQ_decode(aStr) {
      var i = 0;
      var strLen = aStr.length;
      var result = 0;
      var shift = 0;
      var continuation,
          digit;
      do {
        if (i >= strLen) {
          throw new Error("Expected more digits in base 64 VLQ value.");
        }
        digit = base64.decode(aStr.charAt(i++));
        continuation = !!(digit & VLQ_CONTINUATION_BIT);
        digit &= VLQ_BASE_MASK;
        result = result + (digit << shift);
        shift += VLQ_BASE_SHIFT;
      } while (continuation);
      return {
        value: fromVLQSigned(result),
        rest: aStr.slice(i)
      };
    };
  });
  define = makeDefine(m, './binary-search');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
      var mid = Math.floor((aHigh - aLow) / 2) + aLow;
      var cmp = aCompare(aNeedle, aHaystack[mid], true);
      if (cmp === 0) {
        return aHaystack[mid];
      } else if (cmp > 0) {
        if (aHigh - mid > 1) {
          return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
        }
        return aHaystack[mid];
      } else {
        if (mid - aLow > 1) {
          return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
        }
        return aLow < 0 ? null : aHaystack[aLow];
      }
    }
    exports.search = function search(aNeedle, aHaystack, aCompare) {
      return aHaystack.length > 0 ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare) : null;
    };
  });
  define = makeDefine(m, './source-map-generator');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var base64VLQ = require('./base64-vlq');
    var util = require('./util');
    var ArraySet = require('./array-set').ArraySet;
    function SourceMapGenerator(aArgs) {
      this._file = util.getArg(aArgs, 'file');
      this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
      this._sources = new ArraySet();
      this._names = new ArraySet();
      this._mappings = [];
      this._sourcesContents = null;
    }
    SourceMapGenerator.prototype._version = 3;
    SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function(mapping) {
        var newMapping = {generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }};
        if (mapping.source) {
          newMapping.source = mapping.source;
          if (sourceRoot) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }
          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };
          if (mapping.name) {
            newMapping.name = mapping.name;
          }
        }
        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };
    SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);
      this._validateMapping(generated, original, source, name);
      if (source && !this._sources.has(source)) {
        this._sources.add(source);
      }
      if (name && !this._names.has(name)) {
        this._names.add(name);
      }
      this._mappings.push({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };
    SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot) {
        source = util.relative(this._sourceRoot, source);
      }
      if (aSourceContent !== null) {
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else {
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };
    SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile) {
      if (!aSourceFile) {
        aSourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      if (sourceRoot) {
        aSourceFile = util.relative(sourceRoot, aSourceFile);
      }
      var newSources = new ArraySet();
      var newNames = new ArraySet();
      this._mappings.forEach(function(mapping) {
        if (mapping.source === aSourceFile && mapping.originalLine) {
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source !== null) {
            if (sourceRoot) {
              mapping.source = util.relative(sourceRoot, original.source);
            } else {
              mapping.source = original.source;
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name !== null && mapping.name !== null) {
              mapping.name = original.name;
            }
          }
        }
        var source = mapping.source;
        if (source && !newSources.has(source)) {
          newSources.add(source);
        }
        var name = mapping.name;
        if (name && !newNames.has(name)) {
          newNames.add(name);
        }
      }, this);
      this._sources = newSources;
      this._names = newNames;
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          if (sourceRoot) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };
    SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
        return;
      } else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated && aOriginal && 'line' in aOriginal && 'column' in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
        return;
      } else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          orginal: aOriginal,
          name: aName
        }));
      }
    };
    SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;
      this._mappings.sort(util.compareByGeneratedPositions);
      for (var i = 0,
          len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];
        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        } else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }
        result += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;
        if (mapping.source) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source) - previousSource);
          previousSource = this._sources.indexOf(mapping.source);
          result += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;
          result += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;
          if (mapping.name) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name) - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }
      return result;
    };
    SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function(source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
      }, this);
    };
    SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        file: this._file,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._sourceRoot) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }
      return map;
    };
    SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };
    exports.SourceMapGenerator = SourceMapGenerator;
  });
  define = makeDefine(m, './source-map-consumer');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var util = require('./util');
    var binarySearch = require('./binary-search');
    var ArraySet = require('./array-set').ArraySet;
    var base64VLQ = require('./base64-vlq');
    function SourceMapConsumer(aSourceMap) {
      var sourceMap = aSourceMap;
      if (typeof aSourceMap === 'string') {
        sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
      }
      var version = util.getArg(sourceMap, 'version');
      var sources = util.getArg(sourceMap, 'sources');
      var names = util.getArg(sourceMap, 'names');
      var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
      var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
      var mappings = util.getArg(sourceMap, 'mappings');
      var file = util.getArg(sourceMap, 'file', null);
      if (version !== this._version) {
        throw new Error('Unsupported version: ' + version);
      }
      this._names = ArraySet.fromArray(names, true);
      this._sources = ArraySet.fromArray(sources, true);
      this.sourceRoot = sourceRoot;
      this.sourcesContent = sourcesContent;
      this.file = file;
      this._generatedMappings = [];
      this._originalMappings = [];
      this._parseMappings(mappings, sourceRoot);
    }
    SourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);
      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
      smc.file = aSourceMap._file;
      smc._generatedMappings = aSourceMap._mappings.slice().sort(util.compareByGeneratedPositions);
      smc._originalMappings = aSourceMap._mappings.slice().sort(util.compareByOriginalPositions);
      return smc;
    };
    SourceMapConsumer.prototype._version = 3;
    Object.defineProperty(SourceMapConsumer.prototype, 'sources', {get: function() {
        return this._sources.toArray().map(function(s) {
          return this.sourceRoot ? util.join(this.sourceRoot, s) : s;
        }, this);
      }});
    SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;
      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        } else if (str.charAt(0) === ',') {
          str = str.slice(1);
        } else {
          mapping = {};
          mapping.generatedLine = generatedLine;
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;
          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            temp = base64VLQ.decode(str);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;
            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }
          this._generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this._originalMappings.push(mapping);
          }
        }
      }
      this._originalMappings.sort(util.compareByOriginalPositions);
    };
    SourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator) {
      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got ' + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got ' + aNeedle[aColumnName]);
      }
      return binarySearch.search(aNeedle, aMappings, aComparator);
    };
    SourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };
      var mapping = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositions);
      if (mapping) {
        var source = util.getArg(mapping, 'source', null);
        if (source && this.sourceRoot) {
          source = util.join(this.sourceRoot, source);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };
    SourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }
      if (this.sourceRoot) {
        aSource = util.relative(this.sourceRoot, aSource);
      }
      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }
      var url;
      if (this.sourceRoot && (url = util.urlParse(this.sourceRoot))) {
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
        }
        if ((!url.path || url.path == "/") && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };
    SourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };
      if (this.sourceRoot) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }
      var mapping = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions);
      if (mapping) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null)
        };
      }
      return {
        line: null,
        column: null
      };
    };
    SourceMapConsumer.GENERATED_ORDER = 1;
    SourceMapConsumer.ORIGINAL_ORDER = 2;
    SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
      var mappings;
      switch (order) {
        case SourceMapConsumer.GENERATED_ORDER:
          mappings = this._generatedMappings;
          break;
        case SourceMapConsumer.ORIGINAL_ORDER:
          mappings = this._originalMappings;
          break;
        default:
          throw new Error("Unknown order of iteration.");
      }
      var sourceRoot = this.sourceRoot;
      mappings.map(function(mapping) {
        var source = mapping.source;
        if (source && sourceRoot) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };
    exports.SourceMapConsumer = SourceMapConsumer;
  });
  define = makeDefine(m, './source-node');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
  }
  define(function(require, exports, module) {
    var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
    var util = require('./util');
    function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
      this.children = [];
      this.sourceContents = {};
      this.line = aLine === undefined ? null : aLine;
      this.column = aColumn === undefined ? null : aColumn;
      this.source = aSource === undefined ? null : aSource;
      this.name = aName === undefined ? null : aName;
      if (aChunks != null)
        this.add(aChunks);
    }
    SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer) {
      var node = new SourceNode();
      var remainingLines = aGeneratedCode.split('\n');
      var lastGeneratedLine = 1,
          lastGeneratedColumn = 0;
      var lastMapping = null;
      aSourceMapConsumer.eachMapping(function(mapping) {
        if (lastMapping === null) {
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(remainingLines.shift() + "\n");
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[0];
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
        } else {
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            do {
              code += remainingLines.shift() + "\n";
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } while (lastGeneratedLine < mapping.generatedLine);
            if (lastGeneratedColumn < mapping.generatedColumn) {
              var nextLine = remainingLines[0];
              code += nextLine.substr(0, mapping.generatedColumn);
              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
            }
            addMappingWithCode(lastMapping, code);
          } else {
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
          }
        }
        lastMapping = mapping;
      }, this);
      addMappingWithCode(lastMapping, remainingLines.join("\n"));
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          node.setSourceContent(sourceFile, content);
        }
      });
      return node;
      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, mapping.source, code, mapping.name));
        }
      }
    };
    SourceNode.prototype.add = function SourceNode_add(aChunk) {
      if (Array.isArray(aChunk)) {
        aChunk.forEach(function(chunk) {
          this.add(chunk);
        }, this);
      } else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
        if (aChunk) {
          this.children.push(aChunk);
        }
      } else {
        throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
      }
      return this;
    };
    SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
      if (Array.isArray(aChunk)) {
        for (var i = aChunk.length - 1; i >= 0; i--) {
          this.prepend(aChunk[i]);
        }
      } else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
        this.children.unshift(aChunk);
      } else {
        throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
      }
      return this;
    };
    SourceNode.prototype.walk = function SourceNode_walk(aFn) {
      var chunk;
      for (var i = 0,
          len = this.children.length; i < len; i++) {
        chunk = this.children[i];
        if (chunk instanceof SourceNode) {
          chunk.walk(aFn);
        } else {
          if (chunk !== '') {
            aFn(chunk, {
              source: this.source,
              line: this.line,
              column: this.column,
              name: this.name
            });
          }
        }
      }
    };
    SourceNode.prototype.join = function SourceNode_join(aSep) {
      var newChildren;
      var i;
      var len = this.children.length;
      if (len > 0) {
        newChildren = [];
        for (i = 0; i < len - 1; i++) {
          newChildren.push(this.children[i]);
          newChildren.push(aSep);
        }
        newChildren.push(this.children[i]);
        this.children = newChildren;
      }
      return this;
    };
    SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
      var lastChild = this.children[this.children.length - 1];
      if (lastChild instanceof SourceNode) {
        lastChild.replaceRight(aPattern, aReplacement);
      } else if (typeof lastChild === 'string') {
        this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
      } else {
        this.children.push(''.replace(aPattern, aReplacement));
      }
      return this;
    };
    SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };
    SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
      for (var i = 0,
          len = this.children.length; i < len; i++) {
        if (this.children[i] instanceof SourceNode) {
          this.children[i].walkSourceContents(aFn);
        }
      }
      var sources = Object.keys(this.sourceContents);
      for (var i = 0,
          len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };
    SourceNode.prototype.toString = function SourceNode_toString() {
      var str = "";
      this.walk(function(chunk) {
        str += chunk;
      });
      return str;
    };
    SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
      var generated = {
        code: "",
        line: 1,
        column: 0
      };
      var map = new SourceMapGenerator(aArgs);
      var sourceMappingActive = false;
      var lastOriginalSource = null;
      var lastOriginalLine = null;
      var lastOriginalColumn = null;
      var lastOriginalName = null;
      this.walk(function(chunk, original) {
        generated.code += chunk;
        if (original.source !== null && original.line !== null && original.column !== null) {
          if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
          lastOriginalSource = original.source;
          lastOriginalLine = original.line;
          lastOriginalColumn = original.column;
          lastOriginalName = original.name;
          sourceMappingActive = true;
        } else if (sourceMappingActive) {
          map.addMapping({generated: {
              line: generated.line,
              column: generated.column
            }});
          lastOriginalSource = null;
          sourceMappingActive = false;
        }
        chunk.split('').forEach(function(ch) {
          if (ch === '\n') {
            generated.line++;
            generated.column = 0;
          } else {
            generated.column++;
          }
        });
      });
      this.walkSourceContents(function(sourceFile, sourceContent) {
        map.setSourceContent(sourceFile, sourceContent);
      });
      return {
        code: generated.code,
        map: map
      };
    };
    exports.SourceNode = SourceNode;
  });
  var SourceMapGenerator = m['./source-map-generator'].SourceMapGenerator;
  var SourceMapConsumer = m['./source-map-consumer'].SourceMapConsumer;
  var SourceNode = m['./source-node'].SourceNode;
  return {
    get SourceMapGenerator() {
      return SourceMapGenerator;
    },
    get SourceMapConsumer() {
      return SourceMapConsumer;
    },
    get SourceNode() {
      return SourceNode;
    }
  };
});
System.register("traceur@0.0.43/src/outputgeneration/toSource", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/outputgeneration/toSource";
  var ParseTreeMapWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/ParseTreeMapWriter")).ParseTreeMapWriter;
  var ParseTreeWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/ParseTreeWriter")).ParseTreeWriter;
  var SourceMapGenerator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/SourceMapIntegration")).SourceMapGenerator;
  function toSource(tree) {
    var options = arguments[1];
    var sourceMapGenerator = options && options.sourceMapGenerator;
    if (!sourceMapGenerator && options && options.sourceMaps) {
      sourceMapGenerator = new SourceMapGenerator({
        file: options.filename,
        sourceRoot: null
      });
    }
    var writer;
    if (sourceMapGenerator)
      writer = new ParseTreeMapWriter(sourceMapGenerator, options);
    else
      writer = new ParseTreeWriter(options);
    writer.visitAny(tree);
    return [writer.toString(), sourceMapGenerator && sourceMapGenerator.toString()];
  }
  return {get toSource() {
      return toSource;
    }};
});
System.register("traceur@0.0.43/src/outputgeneration/TreeWriter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/outputgeneration/TreeWriter";
  var toSource = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/toSource")).toSource;
  function write(tree) {
    var options = arguments[1];
    var $__45 = $traceurRuntime.assertObject(toSource(tree, options)),
        result = $__45[0],
        sourceMap = $__45[1];
    if (sourceMap)
      options.sourceMap = sourceMap;
    return result;
  }
  var TreeWriter = function TreeWriter() {};
  ($traceurRuntime.createClass)(TreeWriter, {}, {});
  TreeWriter.write = write;
  return {
    get write() {
      return write;
    },
    get TreeWriter() {
      return TreeWriter;
    }
  };
});
System.register("traceur@0.0.43/src/util/assert", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/assert";
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  function assert(b) {
    if (!b && options.debug)
      throw Error('Assertion failed');
  }
  return {get assert() {
      return assert;
    }};
});
System.register("traceur@0.0.43/src/syntax/ParseTreeValidator", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/ParseTreeValidator";
  var NewExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).NewExpression;
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var TreeWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/TreeWriter")).TreeWriter;
  var $__48 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AMPERSAND = $__48.AMPERSAND,
      AMPERSAND_EQUAL = $__48.AMPERSAND_EQUAL,
      AND = $__48.AND,
      BAR = $__48.BAR,
      BAR_EQUAL = $__48.BAR_EQUAL,
      CARET = $__48.CARET,
      CARET_EQUAL = $__48.CARET_EQUAL,
      CLOSE_ANGLE = $__48.CLOSE_ANGLE,
      EQUAL = $__48.EQUAL,
      EQUAL_EQUAL = $__48.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__48.EQUAL_EQUAL_EQUAL,
      GREATER_EQUAL = $__48.GREATER_EQUAL,
      IDENTIFIER = $__48.IDENTIFIER,
      IN = $__48.IN,
      INSTANCEOF = $__48.INSTANCEOF,
      LEFT_SHIFT = $__48.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__48.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__48.LESS_EQUAL,
      MINUS = $__48.MINUS,
      MINUS_EQUAL = $__48.MINUS_EQUAL,
      NOT_EQUAL = $__48.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__48.NOT_EQUAL_EQUAL,
      NUMBER = $__48.NUMBER,
      OPEN_ANGLE = $__48.OPEN_ANGLE,
      OR = $__48.OR,
      PERCENT = $__48.PERCENT,
      PERCENT_EQUAL = $__48.PERCENT_EQUAL,
      PLUS = $__48.PLUS,
      PLUS_EQUAL = $__48.PLUS_EQUAL,
      RIGHT_SHIFT = $__48.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__48.RIGHT_SHIFT_EQUAL,
      SLASH = $__48.SLASH,
      SLASH_EQUAL = $__48.SLASH_EQUAL,
      STAR = $__48.STAR,
      STAR_EQUAL = $__48.STAR_EQUAL,
      STRING = $__48.STRING,
      UNSIGNED_RIGHT_SHIFT = $__48.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__48.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__48 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      ARRAY_PATTERN = $__48.ARRAY_PATTERN,
      BINDING_ELEMENT = $__48.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__48.BINDING_IDENTIFIER,
      BLOCK = $__48.BLOCK,
      CASE_CLAUSE = $__48.CASE_CLAUSE,
      CATCH = $__48.CATCH,
      CLASS_DECLARATION = $__48.CLASS_DECLARATION,
      COMPUTED_PROPERTY_NAME = $__48.COMPUTED_PROPERTY_NAME,
      DEFAULT_CLAUSE = $__48.DEFAULT_CLAUSE,
      EXPORT_DECLARATION = $__48.EXPORT_DECLARATION,
      EXPORT_DEFAULT = $__48.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__48.EXPORT_SPECIFIER,
      EXPORT_SPECIFIER_SET = $__48.EXPORT_SPECIFIER_SET,
      EXPORT_STAR = $__48.EXPORT_STAR,
      FINALLY = $__48.FINALLY,
      FORMAL_PARAMETER = $__48.FORMAL_PARAMETER,
      FORMAL_PARAMETER_LIST = $__48.FORMAL_PARAMETER_LIST,
      FUNCTION_BODY = $__48.FUNCTION_BODY,
      FUNCTION_DECLARATION = $__48.FUNCTION_DECLARATION,
      GET_ACCESSOR = $__48.GET_ACCESSOR,
      IDENTIFIER_EXPRESSION = $__48.IDENTIFIER_EXPRESSION,
      IMPORT_DECLARATION = $__48.IMPORT_DECLARATION,
      LITERAL_PROPERTY_NAME = $__48.LITERAL_PROPERTY_NAME,
      MODULE_DECLARATION = $__48.MODULE_DECLARATION,
      MODULE_SPECIFIER = $__48.MODULE_SPECIFIER,
      NAMED_EXPORT = $__48.NAMED_EXPORT,
      OBJECT_PATTERN = $__48.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__48.OBJECT_PATTERN_FIELD,
      PROPERTY_METHOD_ASSIGNMENT = $__48.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__48.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__48.PROPERTY_NAME_SHORTHAND,
      REST_PARAMETER = $__48.REST_PARAMETER,
      SET_ACCESSOR = $__48.SET_ACCESSOR,
      TEMPLATE_LITERAL_PORTION = $__48.TEMPLATE_LITERAL_PORTION,
      TEMPLATE_SUBSTITUTION = $__48.TEMPLATE_SUBSTITUTION,
      VARIABLE_DECLARATION_LIST = $__48.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__48.VARIABLE_STATEMENT;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var ValidationError = function ValidationError(tree, message) {
    this.tree = tree;
    this.message = message;
  };
  ($traceurRuntime.createClass)(ValidationError, {}, {}, Error);
  var ParseTreeValidator = function ParseTreeValidator() {
    $traceurRuntime.defaultSuperCall(this, $ParseTreeValidator.prototype, arguments);
  };
  var $ParseTreeValidator = ParseTreeValidator;
  ($traceurRuntime.createClass)(ParseTreeValidator, {
    fail_: function(tree, message) {
      throw new ValidationError(tree, message);
    },
    check_: function(condition, tree, message) {
      if (!condition) {
        this.fail_(tree, message);
      }
    },
    checkVisit_: function(condition, tree, message) {
      this.check_(condition, tree, message);
      this.visitAny(tree);
    },
    checkType_: function(type, tree, message) {
      this.checkVisit_(tree.type === type, tree, message);
    },
    visitArgumentList: function(tree) {
      for (var i = 0; i < tree.args.length; i++) {
        var argument = tree.args[i];
        this.checkVisit_(argument.isAssignmentOrSpread(), argument, 'assignment or spread expected');
      }
    },
    visitArrayLiteralExpression: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element === null || element.isAssignmentOrSpread(), element, 'assignment or spread expected');
      }
    },
    visitArrayPattern: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        this.checkVisit_(element === null || element.type === BINDING_ELEMENT || element.type == IDENTIFIER_EXPRESSION || element.isLeftHandSideExpression() || element.isPattern() || element.isSpreadPatternElement(), element, 'null, sub pattern, left hand side expression or spread expected');
        if (element && element.isSpreadPatternElement()) {
          this.check_(i === (tree.elements.length - 1), element, 'spread in array patterns must be the last element');
        }
      }
    },
    visitBinaryOperator: function(tree) {
      switch (tree.operator.type) {
        case EQUAL:
        case STAR_EQUAL:
        case SLASH_EQUAL:
        case PERCENT_EQUAL:
        case PLUS_EQUAL:
        case MINUS_EQUAL:
        case LEFT_SHIFT_EQUAL:
        case RIGHT_SHIFT_EQUAL:
        case UNSIGNED_RIGHT_SHIFT_EQUAL:
        case AMPERSAND_EQUAL:
        case CARET_EQUAL:
        case BAR_EQUAL:
          this.check_(tree.left.isLeftHandSideExpression() || tree.left.isPattern(), tree.left, 'left hand side expression or pattern expected');
          this.check_(tree.right.isAssignmentExpression(), tree.right, 'assignment expression expected');
          break;
        case AND:
        case OR:
        case BAR:
        case CARET:
        case AMPERSAND:
        case EQUAL_EQUAL:
        case NOT_EQUAL:
        case EQUAL_EQUAL_EQUAL:
        case NOT_EQUAL_EQUAL:
        case OPEN_ANGLE:
        case CLOSE_ANGLE:
        case GREATER_EQUAL:
        case LESS_EQUAL:
        case INSTANCEOF:
        case IN:
        case LEFT_SHIFT:
        case RIGHT_SHIFT:
        case UNSIGNED_RIGHT_SHIFT:
        case PLUS:
        case MINUS:
        case STAR:
        case SLASH:
        case PERCENT:
          this.check_(tree.left.isAssignmentExpression(), tree.left, 'assignment expression expected');
          this.check_(tree.right.isAssignmentExpression(), tree.right, 'assignment expression expected');
          break;
        default:
          this.fail_(tree, 'unexpected binary operator');
      }
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      var binding = tree.binding;
      this.checkVisit_(binding.type == BINDING_IDENTIFIER || binding.type == OBJECT_PATTERN || binding.type == ARRAY_PATTERN || binding.type == IDENTIFIER_EXPRESSION, binding, 'expected valid binding element');
      this.visitAny(tree.initializer);
    },
    visitBlock: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatementListItem(), statement, 'statement or function declaration expected');
      }
    },
    visitCallExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected');
      }
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitCaseClause: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement, 'statement expected');
      }
    },
    visitCatch: function(tree) {
      this.checkVisit_(tree.binding.isPattern() || tree.binding.type == BINDING_IDENTIFIER, tree.binding, 'binding identifier expected');
      this.checkVisit_(tree.catchBody.type === BLOCK, tree.catchBody, 'block expected');
    },
    visitClassDeclaration: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        switch (element.type) {
          case GET_ACCESSOR:
          case SET_ACCESSOR:
          case PROPERTY_METHOD_ASSIGNMENT:
            break;
          default:
            this.fail_(element, 'class element expected');
        }
        this.visitAny(element);
      }
    },
    visitCommaExpression: function(tree) {
      for (var i = 0; i < tree.expressions.length; i++) {
        var expression = tree.expressions[i];
        this.checkVisit_(expression.isAssignmentExpression(), expression, 'expression expected');
      }
    },
    visitConditionalExpression: function(tree) {
      this.checkVisit_(tree.condition.isAssignmentExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.left.isAssignmentExpression(), tree.left, 'expression expected');
      this.checkVisit_(tree.right.isAssignmentExpression(), tree.right, 'expression expected');
    },
    visitCoverFormals: function(tree) {
      this.fail_(tree, 'CoverFormals should have been removed');
    },
    visitCoverInitialisedName: function(tree) {
      this.fail_(tree, 'CoverInitialisedName should have been removed');
    },
    visitDefaultClause: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatement(), statement, 'statement expected');
      }
    },
    visitDoWhileStatement: function(tree) {
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
    },
    visitExportDeclaration: function(tree) {
      var declType = tree.declaration.type;
      this.checkVisit_(declType == VARIABLE_STATEMENT || declType == FUNCTION_DECLARATION || declType == MODULE_DECLARATION || declType == CLASS_DECLARATION || declType == NAMED_EXPORT || declType == EXPORT_DEFAULT, tree.declaration, 'expected valid export tree');
    },
    visitNamedExport: function(tree) {
      if (tree.moduleSpecifier) {
        this.checkVisit_(tree.moduleSpecifier.type == MODULE_SPECIFIER, tree.moduleSpecifier, 'module expression expected');
      }
      var specifierType = tree.specifierSet.type;
      this.checkVisit_(specifierType == EXPORT_SPECIFIER_SET || specifierType == EXPORT_STAR, tree.specifierSet, 'specifier set or identifier expected');
    },
    visitExportSpecifierSet: function(tree) {
      this.check_(tree.specifiers.length > 0, tree, 'expected at least one identifier');
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        this.checkVisit_(specifier.type == EXPORT_SPECIFIER || specifier.type == IDENTIFIER_EXPRESSION, specifier, 'expected valid export specifier');
      }
    },
    visitExpressionStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
    },
    visitFinally: function(tree) {
      this.checkVisit_(tree.block.type === BLOCK, tree.block, 'block expected');
    },
    visitForOfStatement: function(tree) {
      this.checkVisit_(tree.initializer.isPattern() || tree.initializer.type === IDENTIFIER_EXPRESSION || tree.initializer.type === VARIABLE_DECLARATION_LIST && tree.initializer.declarations.length === 1, tree.initializer, 'for-each statement may not have more than one variable declaration');
      this.checkVisit_(tree.collection.isExpression(), tree.collection, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitForInStatement: function(tree) {
      if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
        this.checkVisit_(tree.initializer.declarations.length <= 1, tree.initializer, 'for-in statement may not have more than one variable declaration');
      } else {
        this.checkVisit_(tree.initializer.isPattern() || tree.initializer.isExpression(), tree.initializer, 'variable declaration, expression or ' + 'pattern expected');
      }
      this.checkVisit_(tree.collection.isExpression(), tree.collection, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitFormalParameterList: function(tree) {
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        assert(parameter.type === FORMAL_PARAMETER);
        parameter = parameter.parameter;
        switch (parameter.type) {
          case BINDING_ELEMENT:
            break;
          case REST_PARAMETER:
            this.checkVisit_(i === tree.parameters.length - 1, parameter, 'rest parameters must be the last parameter in a parameter list');
            this.checkType_(BINDING_IDENTIFIER, parameter.identifier, 'binding identifier expected');
            break;
          default:
            this.fail_(parameter, 'parameters must be identifiers or rest' + (" parameters. Found: " + parameter.type));
            break;
        }
        this.visitAny(parameter);
      }
    },
    visitForStatement: function(tree) {
      if (tree.initializer !== null) {
        this.checkVisit_(tree.initializer.isExpression() || tree.initializer.type === VARIABLE_DECLARATION_LIST, tree.initializer, 'variable declaration list or expression expected');
      }
      if (tree.condition !== null) {
        this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
      }
      if (tree.increment !== null) {
        this.checkVisit_(tree.increment.isExpression(), tree.increment, 'expression expected');
      }
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitFunctionBody: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        this.checkVisit_(statement.isStatementListItem(), statement, 'statement expected');
      }
    },
    visitFunctionDeclaration: function(tree) {
      this.checkType_(BINDING_IDENTIFIER, tree.name, 'binding identifier expected');
      this.visitFunction_(tree);
    },
    visitFunctionExpression: function(tree) {
      if (tree.name !== null) {
        this.checkType_(BINDING_IDENTIFIER, tree.name, 'binding identifier expected');
      }
      this.visitFunction_(tree);
    },
    visitFunction_: function(tree) {
      this.checkType_(FORMAL_PARAMETER_LIST, tree.parameterList, 'formal parameters expected');
      this.checkType_(FUNCTION_BODY, tree.functionBody, 'function body expected');
    },
    visitGetAccessor: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkType_(FUNCTION_BODY, tree.body, 'function body expected');
    },
    visitIfStatement: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.ifClause.isStatement(), tree.ifClause, 'statement expected');
      if (tree.elseClause !== null) {
        this.checkVisit_(tree.elseClause.isStatement(), tree.elseClause, 'statement expected');
      }
    },
    visitLabelledStatement: function(tree) {
      this.checkVisit_(tree.statement.isStatement(), tree.statement, 'statement expected');
    },
    visitMemberExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected');
      }
      this.visitAny(tree.operand);
    },
    visitMemberLookupExpression: function(tree) {
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      if (tree.operand instanceof NewExpression) {
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected');
      }
      this.visitAny(tree.operand);
    },
    visitSyntaxErrorTree: function(tree) {
      this.fail_(tree, ("parse tree contains SyntaxError: " + tree.message));
    },
    visitModuleSpecifier: function(tree) {
      this.check_(tree.token.type == STRING || tree.moduleName, 'string or identifier expected');
    },
    visitModuleDeclaration: function(tree) {
      this.checkType_(MODULE_SPECIFIER, tree.expression, 'module expression expected');
    },
    visitNewExpression: function(tree) {
      this.checkVisit_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected');
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      for (var i = 0; i < tree.propertyNameAndValues.length; i++) {
        var propertyNameAndValue = tree.propertyNameAndValues[i];
        switch (propertyNameAndValue.type) {
          case GET_ACCESSOR:
          case SET_ACCESSOR:
          case PROPERTY_METHOD_ASSIGNMENT:
            this.check_(!propertyNameAndValue.isStatic, propertyNameAndValue, 'static is not allowed in object literal expression');
          case PROPERTY_NAME_ASSIGNMENT:
          case PROPERTY_NAME_SHORTHAND:
            break;
          default:
            this.fail_(propertyNameAndValue, 'accessor, property name ' + 'assignment or property method assigment expected');
        }
        this.visitAny(propertyNameAndValue);
      }
    },
    visitObjectPattern: function(tree) {
      for (var i = 0; i < tree.fields.length; i++) {
        var field = tree.fields[i];
        this.checkVisit_(field.type === OBJECT_PATTERN_FIELD || field.type === BINDING_ELEMENT || field.type === IDENTIFIER_EXPRESSION, field, 'object pattern field expected');
      }
    },
    visitObjectPatternField: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkVisit_(tree.element.type === BINDING_ELEMENT || tree.element.isPattern() || tree.element.isLeftHandSideExpression(), tree.element, 'binding element expected');
    },
    visitParenExpression: function(tree) {
      if (tree.expression.isPattern()) {
        this.visitAny(tree.expression);
      } else {
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      }
    },
    visitPostfixExpression: function(tree) {
      this.checkVisit_(tree.operand.isAssignmentExpression(), tree.operand, 'assignment expression expected');
    },
    visitPredefinedType: function(tree) {},
    visitScript: function(tree) {
      for (var i = 0; i < tree.scriptItemList.length; i++) {
        var scriptItemList = tree.scriptItemList[i];
        this.checkVisit_(scriptItemList.isScriptElement(), scriptItemList, 'global script item expected');
      }
    },
    checkPropertyName_: function(tree) {
      this.checkVisit_(tree.type === LITERAL_PROPERTY_NAME || tree.type === COMPUTED_PROPERTY_NAME, tree, 'property name expected');
    },
    visitPropertyNameAssignment: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkVisit_(tree.value.isAssignmentExpression(), tree.value, 'assignment expression expected');
    },
    visitPropertyNameShorthand: function(tree) {
      this.check_(tree.name.type === IDENTIFIER, tree, 'identifier token expected');
    },
    visitLiteralPropertyName: function(tree) {
      var type = tree.literalToken.type;
      this.check_(tree.literalToken.isKeyword() || type === IDENTIFIER || type === NUMBER || type === STRING, tree, 'Unexpected token in literal property name');
    },
    visitTemplateLiteralExpression: function(tree) {
      if (tree.operand) {
        this.checkVisit_(tree.operand.isMemberExpression(), tree.operand, 'member or call expression expected');
      }
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        if (i % 2) {
          this.checkType_(TEMPLATE_SUBSTITUTION, element, 'Template literal substitution expected');
        } else {
          this.checkType_(TEMPLATE_LITERAL_PORTION, element, 'Template literal portion expected');
        }
      }
    },
    visitReturnStatement: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      }
    },
    visitSetAccessor: function(tree) {
      this.checkPropertyName_(tree.name);
      this.checkType_(FUNCTION_BODY, tree.body, 'function body expected');
    },
    visitSpreadExpression: function(tree) {
      this.checkVisit_(tree.expression.isAssignmentExpression(), tree.expression, 'assignment expression expected');
    },
    visitStateMachine: function(tree) {
      this.fail_(tree, 'State machines are never valid outside of the ' + 'GeneratorTransformer pass.');
    },
    visitSwitchStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      var defaultCount = 0;
      for (var i = 0; i < tree.caseClauses.length; i++) {
        var caseClause = tree.caseClauses[i];
        if (caseClause.type === DEFAULT_CLAUSE) {
          ++defaultCount;
          this.checkVisit_(defaultCount <= 1, caseClause, 'no more than one default clause allowed');
        } else {
          this.checkType_(CASE_CLAUSE, caseClause, 'case or default clause expected');
        }
      }
    },
    visitThrowStatement: function(tree) {
      if (tree.value === null) {
        return;
      }
      this.checkVisit_(tree.value.isExpression(), tree.value, 'expression expected');
    },
    visitTryStatement: function(tree) {
      this.checkType_(BLOCK, tree.body, 'block expected');
      if (tree.catchBlock !== null) {
        this.checkType_(CATCH, tree.catchBlock, 'catch block expected');
      }
      if (tree.finallyBlock !== null) {
        this.checkType_(FINALLY, tree.finallyBlock, 'finally block expected');
      }
      if (tree.catchBlock === null && tree.finallyBlock === null) {
        this.fail_(tree, 'either catch or finally must be present');
      }
    },
    visitTypeName: function(tree) {},
    visitUnaryExpression: function(tree) {
      this.checkVisit_(tree.operand.isAssignmentExpression(), tree.operand, 'assignment expression expected');
    },
    visitVariableDeclaration: function(tree) {
      this.checkVisit_(tree.lvalue.isPattern() || tree.lvalue.type == BINDING_IDENTIFIER, tree.lvalue, 'binding identifier expected, found: ' + tree.lvalue.type);
      if (tree.initializer !== null) {
        this.checkVisit_(tree.initializer.isAssignmentExpression(), tree.initializer, 'assignment expression expected');
      }
    },
    visitWhileStatement: function(tree) {
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitWithStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
    },
    visitYieldExpression: function(tree) {
      if (tree.expression !== null) {
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected');
      }
    }
  }, {}, ParseTreeVisitor);
  ParseTreeValidator.validate = function(tree) {
    var validator = new ParseTreeValidator();
    try {
      validator.visitAny(tree);
    } catch (e) {
      if (!(e instanceof ValidationError)) {
        throw e;
      }
      var location = null;
      if (e.tree !== null) {
        location = e.tree.location;
      }
      if (location === null) {
        location = tree.location;
      }
      var locationString = location !== null ? location.start.toString() : '(unknown)';
      throw new Error(("Parse tree validation failure '" + e.message + "' at " + locationString + ":") + '\n\n' + TreeWriter.write(tree, {
        highlighted: e.tree,
        showLineNumbers: true
      }) + '\n');
    }
  };
  return {get ParseTreeValidator() {
      return ParseTreeValidator;
    }};
});
System.register("traceur@0.0.43/src/util/ObjectMap", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/ObjectMap";
  var ObjectMap = function ObjectMap() {
    this.keys_ = Object.create(null);
    this.values_ = Object.create(null);
  };
  ($traceurRuntime.createClass)(ObjectMap, {
    set: function(key, value) {
      var uid = key.uid;
      this.keys_[uid] = key;
      this.values_[uid] = value;
    },
    get: function(key) {
      return this.values_[key.uid];
    },
    has: function(key) {
      return key.uid in this.keys_;
    },
    addAll: function(other) {
      for (var uid in other.keys_) {
        this.keys_[uid] = other.keys_[uid];
        this.values_[uid] = other.values_[uid];
      }
    },
    keys: function() {
      var $__49 = this;
      return Object.keys(this.keys_).map((function(uid) {
        return $__49.keys_[uid];
      }));
    },
    values: function() {
      var $__49 = this;
      return Object.keys(this.values_).map((function(uid) {
        return $__49.values_[uid];
      }));
    },
    remove: function(key) {
      var uid = key.uid;
      delete this.keys_[uid];
      delete this.values_[uid];
    }
  }, {});
  return {get ObjectMap() {
      return ObjectMap;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ParseTreeFactory", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ParseTreeFactory";
  var IdentifierToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/IdentifierToken")).IdentifierToken;
  var LiteralToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LiteralToken")).LiteralToken;
  var $__53 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTree")),
      ParseTree = $__53.ParseTree,
      ParseTreeType = $__53.ParseTreeType;
  var $__53 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      BIND = $__53.BIND,
      CALL = $__53.CALL,
      CREATE = $__53.CREATE,
      DEFINE_PROPERTY = $__53.DEFINE_PROPERTY,
      FREEZE = $__53.FREEZE,
      OBJECT = $__53.OBJECT,
      PREVENT_EXTENSIONS = $__53.PREVENT_EXTENSIONS,
      UNDEFINED = $__53.UNDEFINED,
      getParameterName = $__53.getParameterName;
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var $__53 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      EQUAL = $__53.EQUAL,
      FALSE = $__53.FALSE,
      NULL = $__53.NULL,
      NUMBER = $__53.NUMBER,
      STRING = $__53.STRING,
      TRUE = $__53.TRUE,
      VOID = $__53.VOID;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var $__53 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ArgumentList = $__53.ArgumentList,
      ArrayComprehension = $__53.ArrayComprehension,
      ArrayLiteralExpression = $__53.ArrayLiteralExpression,
      ArrayPattern = $__53.ArrayPattern,
      ArrowFunctionExpression = $__53.ArrowFunctionExpression,
      BinaryOperator = $__53.BinaryOperator,
      BindingElement = $__53.BindingElement,
      BindingIdentifier = $__53.BindingIdentifier,
      Block = $__53.Block,
      BreakStatement = $__53.BreakStatement,
      CallExpression = $__53.CallExpression,
      CaseClause = $__53.CaseClause,
      Catch = $__53.Catch,
      ClassDeclaration = $__53.ClassDeclaration,
      ClassExpression = $__53.ClassExpression,
      CommaExpression = $__53.CommaExpression,
      ComprehensionFor = $__53.ComprehensionFor,
      ComprehensionIf = $__53.ComprehensionIf,
      ComputedPropertyName = $__53.ComputedPropertyName,
      ConditionalExpression = $__53.ConditionalExpression,
      ContinueStatement = $__53.ContinueStatement,
      CoverFormals = $__53.CoverFormals,
      CoverInitialisedName = $__53.CoverInitialisedName,
      DebuggerStatement = $__53.DebuggerStatement,
      DefaultClause = $__53.DefaultClause,
      DoWhileStatement = $__53.DoWhileStatement,
      EmptyStatement = $__53.EmptyStatement,
      ExportDeclaration = $__53.ExportDeclaration,
      ExportSpecifier = $__53.ExportSpecifier,
      ExportSpecifierSet = $__53.ExportSpecifierSet,
      ExportStar = $__53.ExportStar,
      ExpressionStatement = $__53.ExpressionStatement,
      Finally = $__53.Finally,
      ForInStatement = $__53.ForInStatement,
      ForOfStatement = $__53.ForOfStatement,
      ForStatement = $__53.ForStatement,
      FormalParameter = $__53.FormalParameter,
      FormalParameterList = $__53.FormalParameterList,
      FunctionBody = $__53.FunctionBody,
      FunctionDeclaration = $__53.FunctionDeclaration,
      FunctionExpression = $__53.FunctionExpression,
      GeneratorComprehension = $__53.GeneratorComprehension,
      GetAccessor = $__53.GetAccessor,
      IdentifierExpression = $__53.IdentifierExpression,
      IfStatement = $__53.IfStatement,
      ImportDeclaration = $__53.ImportDeclaration,
      ImportSpecifier = $__53.ImportSpecifier,
      ImportSpecifierSet = $__53.ImportSpecifierSet,
      LabelledStatement = $__53.LabelledStatement,
      LiteralExpression = $__53.LiteralExpression,
      LiteralPropertyName = $__53.LiteralPropertyName,
      MemberExpression = $__53.MemberExpression,
      MemberLookupExpression = $__53.MemberLookupExpression,
      Module = $__53.Module,
      ModuleDeclaration = $__53.ModuleDeclaration,
      ModuleSpecifier = $__53.ModuleSpecifier,
      NamedExport = $__53.NamedExport,
      NewExpression = $__53.NewExpression,
      ObjectLiteralExpression = $__53.ObjectLiteralExpression,
      ObjectPattern = $__53.ObjectPattern,
      ObjectPatternField = $__53.ObjectPatternField,
      ParenExpression = $__53.ParenExpression,
      PostfixExpression = $__53.PostfixExpression,
      PredefinedType = $__53.PredefinedType,
      Script = $__53.Script,
      PropertyMethodAssignment = $__53.PropertyMethodAssignment,
      PropertyNameAssignment = $__53.PropertyNameAssignment,
      PropertyNameShorthand = $__53.PropertyNameShorthand,
      RestParameter = $__53.RestParameter,
      ReturnStatement = $__53.ReturnStatement,
      SetAccessor = $__53.SetAccessor,
      SpreadExpression = $__53.SpreadExpression,
      SpreadPatternElement = $__53.SpreadPatternElement,
      SuperExpression = $__53.SuperExpression,
      SwitchStatement = $__53.SwitchStatement,
      SyntaxErrorTree = $__53.SyntaxErrorTree,
      TemplateLiteralExpression = $__53.TemplateLiteralExpression,
      TemplateLiteralPortion = $__53.TemplateLiteralPortion,
      TemplateSubstitution = $__53.TemplateSubstitution,
      ThisExpression = $__53.ThisExpression,
      ThrowStatement = $__53.ThrowStatement,
      TryStatement = $__53.TryStatement,
      TypeName = $__53.TypeName,
      UnaryExpression = $__53.UnaryExpression,
      VariableDeclaration = $__53.VariableDeclaration,
      VariableDeclarationList = $__53.VariableDeclarationList,
      VariableStatement = $__53.VariableStatement,
      WhileStatement = $__53.WhileStatement,
      WithStatement = $__53.WithStatement,
      YieldExpression = $__53.YieldExpression;
  var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  function createOperatorToken(operator) {
    return new Token(operator, null);
  }
  function createIdentifierToken(identifier) {
    return new IdentifierToken(null, identifier);
  }
  function createPropertyNameToken(name) {
    return createIdentifierToken(name);
  }
  function createStringLiteralToken(value) {
    return new LiteralToken(STRING, JSON.stringify(value), null);
  }
  function createBooleanLiteralToken(value) {
    return new Token(value ? TRUE : FALSE, null);
  }
  function createNullLiteralToken() {
    return new LiteralToken(NULL, 'null', null);
  }
  function createNumberLiteralToken(value) {
    return new LiteralToken(NUMBER, String(value), null);
  }
  function createEmptyParameters() {
    return [];
  }
  function createStatementList(statementsOrHead) {
    for (var args = [],
        $__51 = 1; $__51 < arguments.length; $__51++)
      args[$__51 - 1] = arguments[$__51];
    if (statementsOrHead instanceof Array)
      return $traceurRuntime.spread(statementsOrHead, args);
    return slice(arguments);
  }
  function createBindingElement(arg) {
    var binding = createBindingIdentifier(arg);
    return new BindingElement(null, binding, null);
  }
  function createFormalParameter(arg) {
    return new FormalParameter(null, createBindingElement(arg), null, []);
  }
  function createParameterList(arg0, var_args) {
    if (typeof arg0 == 'string') {
      var parameterList = map(arguments, createFormalParameter);
      return new FormalParameterList(null, parameterList);
    }
    if (typeof arg0 == 'number')
      return createParameterListHelper(arg0, false);
    if (arg0 instanceof IdentifierToken) {
      return new FormalParameterList(null, [createFormalParameter(arg0)]);
    }
    var builder = arg0.map(createFormalParameter);
    return new FormalParameterList(null, builder);
  }
  function createParameterListHelper(numberOfParameters, hasRestParams) {
    var builder = [];
    for (var index = 0; index < numberOfParameters; index++) {
      var parameterName = getParameterName(index);
      var isRestParameter = index == numberOfParameters - 1 && hasRestParams;
      builder.push(isRestParameter ? new FormalParameter(null, createRestParameter(parameterName), null, []) : createFormalParameter(parameterName));
    }
    return new FormalParameterList(null, builder);
  }
  function createParameterListWithRestParams(numberOfParameters) {
    return createParameterListHelper(numberOfParameters, true);
  }
  function createParameterReference(index) {
    return createIdentifierExpression(getParameterName(index));
  }
  function createEmptyParameterList() {
    return new FormalParameterList(null, []);
  }
  function createEmptyList() {
    return [];
  }
  function createArgumentList(numberListOrFirst, var_args) {
    if (typeof numberListOrFirst == 'number') {
      return createArgumentListFromParameterList(createParameterList(numberListOrFirst));
    }
    var list;
    if (numberListOrFirst instanceof Array)
      list = numberListOrFirst;
    else
      list = slice(arguments);
    return new ArgumentList(null, list);
  }
  function createArgumentListFromParameterList(parameterList) {
    var builder = parameterList.parameters.map(function(parameter) {
      if (parameter.isRestParameter()) {
        return createSpreadExpression(createIdentifierExpression(parameter.identifier));
      } else {
        return parameter;
      }
    });
    return new ArgumentList(null, builder);
  }
  function createEmptyArgumentList() {
    return new ArgumentList(null, createEmptyList());
  }
  function createArrayLiteralExpression(list) {
    return new ArrayLiteralExpression(null, list);
  }
  function createEmptyArrayLiteralExpression() {
    return createArrayLiteralExpression(createEmptyList());
  }
  function createArrayPattern(list) {
    return new ArrayPattern(null, list);
  }
  function createAssignmentExpression(lhs, rhs) {
    return new BinaryOperator(null, lhs, createOperatorToken(EQUAL), rhs);
  }
  function createBinaryOperator(left, operator, right) {
    return new BinaryOperator(null, left, operator, right);
  }
  function createBindingIdentifier(identifier) {
    if (typeof identifier === 'string')
      identifier = createIdentifierToken(identifier);
    else if (identifier.type === ParseTreeType.BINDING_IDENTIFIER)
      return identifier;
    else if (identifier.type === ParseTreeType.IDENTIFIER_EXPRESSION)
      return new BindingIdentifier(identifier.location, identifier.identifierToken);
    return new BindingIdentifier(null, identifier);
  }
  function createEmptyStatement() {
    return new EmptyStatement(null);
  }
  function createEmptyBlock() {
    return createBlock(createEmptyList());
  }
  function createBlock(statements) {
    if (statements instanceof ParseTree)
      statements = slice(arguments);
    return new Block(null, statements);
  }
  function createFunctionBody(statements) {
    return new FunctionBody(null, statements);
  }
  function createScopedExpression(body) {
    var scope = arguments[1] !== (void 0) ? arguments[1] : createThisExpression();
    assert(body.type === 'FUNCTION_BODY');
    return createCallCall(createParenExpression(createFunctionExpression(createEmptyParameterList(), body)), scope);
  }
  function createImmediatelyInvokedFunctionExpression(body) {
    assert(body.type === 'FUNCTION_BODY');
    return createCallExpression(createParenExpression(createFunctionExpression(createEmptyParameterList(), body)));
  }
  function createCallExpression(operand) {
    var args = arguments[1] !== (void 0) ? arguments[1] : createEmptyArgumentList();
    return new CallExpression(null, operand, args);
  }
  function createBoundCall(func, thisTree) {
    return createCallExpression(createMemberExpression(func.type == ParseTreeType.FUNCTION_EXPRESSION ? createParenExpression(func) : func, BIND), createArgumentList(thisTree));
  }
  function createBreakStatement() {
    var name = arguments[0] !== (void 0) ? arguments[0] : null;
    return new BreakStatement(null, name);
  }
  function createCallCall(func, thisExpression, args, var_args) {
    var $__54;
    if (args instanceof ParseTree)
      args = slice(arguments, 2);
    var builder = [thisExpression];
    if (args)
      ($__54 = builder).push.apply($__54, $traceurRuntime.toObject(args));
    return createCallExpression(createMemberExpression(func, CALL), createArgumentList(builder));
  }
  function createCallCallStatement(func, thisExpression) {
    for (var args = [],
        $__52 = 2; $__52 < arguments.length; $__52++)
      args[$__52 - 2] = arguments[$__52];
    return createExpressionStatement(createCallCall(func, thisExpression, args));
  }
  function createCaseClause(expression, statements) {
    return new CaseClause(null, expression, statements);
  }
  function createCatch(identifier, catchBody) {
    identifier = createBindingIdentifier(identifier);
    return new Catch(null, identifier, catchBody);
  }
  function createClassDeclaration(name, superClass, elements) {
    return new ClassDeclaration(null, name, superClass, elements, []);
  }
  function createCommaExpression(expressions) {
    return new CommaExpression(null, expressions);
  }
  function createConditionalExpression(condition, left, right) {
    return new ConditionalExpression(null, condition, left, right);
  }
  function createContinueStatement() {
    var name = arguments[0] !== (void 0) ? arguments[0] : null;
    return new ContinueStatement(null, name);
  }
  function createDefaultClause(statements) {
    return new DefaultClause(null, statements);
  }
  function createDoWhileStatement(body, condition) {
    return new DoWhileStatement(null, body, condition);
  }
  function createAssignmentStatement(lhs, rhs) {
    return createExpressionStatement(createAssignmentExpression(lhs, rhs));
  }
  function createCallStatement(operand) {
    var args = arguments[1];
    return createExpressionStatement(createCallExpression(operand, args));
  }
  function createExpressionStatement(expression) {
    return new ExpressionStatement(null, expression);
  }
  function createFinally(block) {
    return new Finally(null, block);
  }
  function createForOfStatement(initializer, collection, body) {
    return new ForOfStatement(null, initializer, collection, body);
  }
  function createForInStatement(initializer, collection, body) {
    return new ForInStatement(null, initializer, collection, body);
  }
  function createForStatement(variables, condition, increment, body) {
    return new ForStatement(null, variables, condition, increment, body);
  }
  function createFunctionExpression(parameterList, body) {
    assert(body.type === 'FUNCTION_BODY');
    return new FunctionExpression(null, null, false, parameterList, null, [], body);
  }
  function createGetAccessor(name, body) {
    if (typeof name == 'string')
      name = createPropertyNameToken(name);
    var isStatic = false;
    return new GetAccessor(null, isStatic, name, null, [], body);
  }
  function createIdentifierExpression(identifier) {
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    else if (identifier instanceof BindingIdentifier)
      identifier = identifier.identifierToken;
    return new IdentifierExpression(null, identifier);
  }
  function createUndefinedExpression() {
    return createIdentifierExpression(UNDEFINED);
  }
  function createIfStatement(condition, ifClause) {
    var elseClause = arguments[2] !== (void 0) ? arguments[2] : null;
    return new IfStatement(null, condition, ifClause, elseClause);
  }
  function createLabelledStatement(name, statement) {
    return new LabelledStatement(null, name, statement);
  }
  function createStringLiteral(value) {
    return new LiteralExpression(null, createStringLiteralToken(value));
  }
  function createBooleanLiteral(value) {
    return new LiteralExpression(null, createBooleanLiteralToken(value));
  }
  function createTrueLiteral() {
    return createBooleanLiteral(true);
  }
  function createFalseLiteral() {
    return createBooleanLiteral(false);
  }
  function createNullLiteral() {
    return new LiteralExpression(null, createNullLiteralToken());
  }
  function createNumberLiteral(value) {
    return new LiteralExpression(null, createNumberLiteralToken(value));
  }
  function createMemberExpression(operand, memberName, memberNames) {
    if (typeof operand == 'string' || operand instanceof IdentifierToken)
      operand = createIdentifierExpression(operand);
    if (typeof memberName == 'string')
      memberName = createIdentifierToken(memberName);
    if (memberName instanceof LiteralToken)
      memberName = new LiteralExpression(null, memberName);
    var tree = memberName instanceof LiteralExpression ? new MemberLookupExpression(null, operand, memberName) : new MemberExpression(null, operand, memberName);
    for (var i = 2; i < arguments.length; i++) {
      tree = createMemberExpression(tree, arguments[i]);
    }
    return tree;
  }
  function createMemberLookupExpression(operand, memberExpression) {
    return new MemberLookupExpression(null, operand, memberExpression);
  }
  function createThisExpression() {
    var memberName = arguments[0];
    var result = new ThisExpression(null);
    if (memberName) {
      result = createMemberExpression(result, memberName);
    }
    return result;
  }
  function createNewExpression(operand, args) {
    return new NewExpression(null, operand, args);
  }
  function createObjectFreeze(value) {
    return createCallExpression(createMemberExpression(OBJECT, FREEZE), createArgumentList(value));
  }
  function createObjectPreventExtensions(value) {
    return createCallExpression(createMemberExpression(OBJECT, PREVENT_EXTENSIONS), createArgumentList(value));
  }
  function createObjectCreate(protoExpression, descriptors) {
    var argumentList = [protoExpression];
    if (descriptors)
      argumentList.push(descriptors);
    return createCallExpression(createMemberExpression(OBJECT, CREATE), createArgumentList(argumentList));
  }
  function createPropertyDescriptor(descr) {
    var propertyNameAndValues = Object.keys(descr).map(function(name) {
      var value = descr[name];
      if (!(value instanceof ParseTree))
        value = createBooleanLiteral(!!value);
      return createPropertyNameAssignment(name, value);
    });
    return createObjectLiteralExpression(propertyNameAndValues);
  }
  function createDefineProperty(tree, name, descr) {
    if (typeof name === 'string')
      name = createStringLiteral(name);
    return createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTY), createArgumentList(tree, name, createPropertyDescriptor(descr)));
  }
  function createObjectLiteralExpression(propertyNameAndValues) {
    if (propertyNameAndValues instanceof ParseTree)
      propertyNameAndValues = slice(arguments);
    return new ObjectLiteralExpression(null, propertyNameAndValues);
  }
  function createObjectPattern(list) {
    return new ObjectPattern(null, list);
  }
  function createObjectPatternField(identifier, element) {
    identifier = createBindingIdentifier(identifier);
    return new ObjectPatternField(null, identifier, element);
  }
  function createParenExpression(expression) {
    return new ParenExpression(null, expression);
  }
  function createPostfixExpression(operand, operator) {
    return new PostfixExpression(null, operand, operator);
  }
  function createScript(scriptItemList) {
    return new Script(null, scriptItemList);
  }
  function createPropertyNameAssignment(identifier, value) {
    if (typeof identifier == 'string')
      identifier = createLiteralPropertyName(identifier);
    return new PropertyNameAssignment(null, identifier, value);
  }
  function createLiteralPropertyName(name) {
    return new LiteralPropertyName(null, createIdentifierToken(name));
  }
  function createRestParameter(identifier) {
    return new RestParameter(null, createBindingIdentifier(identifier));
  }
  function createReturnStatement(expression) {
    return new ReturnStatement(null, expression);
  }
  function createYieldStatement(expression, isYieldFor) {
    return createExpressionStatement(new YieldExpression(null, expression, isYieldFor));
  }
  function createSetAccessor(name, parameter, body) {
    if (typeof name == 'string')
      name = createPropertyNameToken(name);
    if (typeof parameter == 'string')
      parameter = createIdentifierToken(parameter);
    var parameterList = createParameterList(parameter);
    var isStatic = false;
    return new SetAccessor(null, isStatic, name, parameterList, [], body);
  }
  function createSpreadExpression(expression) {
    return new SpreadExpression(null, expression);
  }
  function createSpreadPatternElement(lvalue) {
    return new SpreadPatternElement(null, lvalue);
  }
  function createSwitchStatement(expression, caseClauses) {
    return new SwitchStatement(null, expression, caseClauses);
  }
  function createThrowStatement(value) {
    return new ThrowStatement(null, value);
  }
  function createTryStatement(body, catchBlock) {
    var finallyBlock = arguments[2] !== (void 0) ? arguments[2] : null;
    return new TryStatement(null, body, catchBlock, finallyBlock);
  }
  function createUnaryExpression(operator, operand) {
    return new UnaryExpression(null, operator, operand);
  }
  function createUseStrictDirective() {
    return createExpressionStatement(createStringLiteral('use strict'));
  }
  function createVariableDeclarationList(binding, identifierOrDeclarations, initializer) {
    if (identifierOrDeclarations instanceof Array) {
      var declarations = identifierOrDeclarations;
      return new VariableDeclarationList(null, binding, declarations);
    }
    var identifier = identifierOrDeclarations;
    return createVariableDeclarationList(binding, [createVariableDeclaration(identifier, initializer)]);
  }
  function createVariableDeclaration(identifier, initializer) {
    if (!(identifier instanceof ParseTree) || identifier.type !== ParseTreeType.BINDING_IDENTIFIER && identifier.type !== ParseTreeType.OBJECT_PATTERN && identifier.type !== ParseTreeType.ARRAY_PATTERN) {
      identifier = createBindingIdentifier(identifier);
    }
    return new VariableDeclaration(null, identifier, null, initializer);
  }
  function createVariableStatement(listOrBinding, identifier, initializer) {
    if (listOrBinding instanceof VariableDeclarationList)
      return new VariableStatement(null, listOrBinding);
    var binding = listOrBinding;
    var list = createVariableDeclarationList(binding, identifier, initializer);
    return createVariableStatement(list);
  }
  function createVoid0() {
    return createParenExpression(createUnaryExpression(createOperatorToken(VOID), createNumberLiteral(0)));
  }
  function createWhileStatement(condition, body) {
    return new WhileStatement(null, condition, body);
  }
  function createWithStatement(expression, body) {
    return new WithStatement(null, expression, body);
  }
  function createAssignStateStatement(state) {
    return createAssignmentStatement(createMemberExpression('$ctx', 'state'), createNumberLiteral(state));
  }
  return {
    get createOperatorToken() {
      return createOperatorToken;
    },
    get createIdentifierToken() {
      return createIdentifierToken;
    },
    get createPropertyNameToken() {
      return createPropertyNameToken;
    },
    get createStringLiteralToken() {
      return createStringLiteralToken;
    },
    get createBooleanLiteralToken() {
      return createBooleanLiteralToken;
    },
    get createNullLiteralToken() {
      return createNullLiteralToken;
    },
    get createNumberLiteralToken() {
      return createNumberLiteralToken;
    },
    get createEmptyParameters() {
      return createEmptyParameters;
    },
    get createStatementList() {
      return createStatementList;
    },
    get createBindingElement() {
      return createBindingElement;
    },
    get createFormalParameter() {
      return createFormalParameter;
    },
    get createParameterList() {
      return createParameterList;
    },
    get createParameterListWithRestParams() {
      return createParameterListWithRestParams;
    },
    get createParameterReference() {
      return createParameterReference;
    },
    get createEmptyParameterList() {
      return createEmptyParameterList;
    },
    get createEmptyList() {
      return createEmptyList;
    },
    get createArgumentList() {
      return createArgumentList;
    },
    get createArgumentListFromParameterList() {
      return createArgumentListFromParameterList;
    },
    get createEmptyArgumentList() {
      return createEmptyArgumentList;
    },
    get createArrayLiteralExpression() {
      return createArrayLiteralExpression;
    },
    get createEmptyArrayLiteralExpression() {
      return createEmptyArrayLiteralExpression;
    },
    get createArrayPattern() {
      return createArrayPattern;
    },
    get createAssignmentExpression() {
      return createAssignmentExpression;
    },
    get createBinaryOperator() {
      return createBinaryOperator;
    },
    get createBindingIdentifier() {
      return createBindingIdentifier;
    },
    get createEmptyStatement() {
      return createEmptyStatement;
    },
    get createEmptyBlock() {
      return createEmptyBlock;
    },
    get createBlock() {
      return createBlock;
    },
    get createFunctionBody() {
      return createFunctionBody;
    },
    get createScopedExpression() {
      return createScopedExpression;
    },
    get createImmediatelyInvokedFunctionExpression() {
      return createImmediatelyInvokedFunctionExpression;
    },
    get createCallExpression() {
      return createCallExpression;
    },
    get createBoundCall() {
      return createBoundCall;
    },
    get createBreakStatement() {
      return createBreakStatement;
    },
    get createCallCall() {
      return createCallCall;
    },
    get createCallCallStatement() {
      return createCallCallStatement;
    },
    get createCaseClause() {
      return createCaseClause;
    },
    get createCatch() {
      return createCatch;
    },
    get createClassDeclaration() {
      return createClassDeclaration;
    },
    get createCommaExpression() {
      return createCommaExpression;
    },
    get createConditionalExpression() {
      return createConditionalExpression;
    },
    get createContinueStatement() {
      return createContinueStatement;
    },
    get createDefaultClause() {
      return createDefaultClause;
    },
    get createDoWhileStatement() {
      return createDoWhileStatement;
    },
    get createAssignmentStatement() {
      return createAssignmentStatement;
    },
    get createCallStatement() {
      return createCallStatement;
    },
    get createExpressionStatement() {
      return createExpressionStatement;
    },
    get createFinally() {
      return createFinally;
    },
    get createForOfStatement() {
      return createForOfStatement;
    },
    get createForInStatement() {
      return createForInStatement;
    },
    get createForStatement() {
      return createForStatement;
    },
    get createFunctionExpression() {
      return createFunctionExpression;
    },
    get createGetAccessor() {
      return createGetAccessor;
    },
    get createIdentifierExpression() {
      return createIdentifierExpression;
    },
    get createUndefinedExpression() {
      return createUndefinedExpression;
    },
    get createIfStatement() {
      return createIfStatement;
    },
    get createLabelledStatement() {
      return createLabelledStatement;
    },
    get createStringLiteral() {
      return createStringLiteral;
    },
    get createBooleanLiteral() {
      return createBooleanLiteral;
    },
    get createTrueLiteral() {
      return createTrueLiteral;
    },
    get createFalseLiteral() {
      return createFalseLiteral;
    },
    get createNullLiteral() {
      return createNullLiteral;
    },
    get createNumberLiteral() {
      return createNumberLiteral;
    },
    get createMemberExpression() {
      return createMemberExpression;
    },
    get createMemberLookupExpression() {
      return createMemberLookupExpression;
    },
    get createThisExpression() {
      return createThisExpression;
    },
    get createNewExpression() {
      return createNewExpression;
    },
    get createObjectFreeze() {
      return createObjectFreeze;
    },
    get createObjectPreventExtensions() {
      return createObjectPreventExtensions;
    },
    get createObjectCreate() {
      return createObjectCreate;
    },
    get createPropertyDescriptor() {
      return createPropertyDescriptor;
    },
    get createDefineProperty() {
      return createDefineProperty;
    },
    get createObjectLiteralExpression() {
      return createObjectLiteralExpression;
    },
    get createObjectPattern() {
      return createObjectPattern;
    },
    get createObjectPatternField() {
      return createObjectPatternField;
    },
    get createParenExpression() {
      return createParenExpression;
    },
    get createPostfixExpression() {
      return createPostfixExpression;
    },
    get createScript() {
      return createScript;
    },
    get createPropertyNameAssignment() {
      return createPropertyNameAssignment;
    },
    get createLiteralPropertyName() {
      return createLiteralPropertyName;
    },
    get createRestParameter() {
      return createRestParameter;
    },
    get createReturnStatement() {
      return createReturnStatement;
    },
    get createYieldStatement() {
      return createYieldStatement;
    },
    get createSetAccessor() {
      return createSetAccessor;
    },
    get createSpreadExpression() {
      return createSpreadExpression;
    },
    get createSpreadPatternElement() {
      return createSpreadPatternElement;
    },
    get createSwitchStatement() {
      return createSwitchStatement;
    },
    get createThrowStatement() {
      return createThrowStatement;
    },
    get createTryStatement() {
      return createTryStatement;
    },
    get createUnaryExpression() {
      return createUnaryExpression;
    },
    get createUseStrictDirective() {
      return createUseStrictDirective;
    },
    get createVariableDeclarationList() {
      return createVariableDeclarationList;
    },
    get createVariableDeclaration() {
      return createVariableDeclaration;
    },
    get createVariableStatement() {
      return createVariableStatement;
    },
    get createVoid0() {
      return createVoid0;
    },
    get createWhileStatement() {
      return createWhileStatement;
    },
    get createWithStatement() {
      return createWithStatement;
    },
    get createAssignStateStatement() {
      return createAssignStateStatement;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/ParseTreeTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ParseTreeTransformer";
  var $__56 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      Annotation = $__56.Annotation,
      AnonBlock = $__56.AnonBlock,
      ArgumentList = $__56.ArgumentList,
      ArrayComprehension = $__56.ArrayComprehension,
      ArrayLiteralExpression = $__56.ArrayLiteralExpression,
      ArrayPattern = $__56.ArrayPattern,
      ArrowFunctionExpression = $__56.ArrowFunctionExpression,
      AwaitExpression = $__56.AwaitExpression,
      BinaryOperator = $__56.BinaryOperator,
      BindingElement = $__56.BindingElement,
      BindingIdentifier = $__56.BindingIdentifier,
      Block = $__56.Block,
      BreakStatement = $__56.BreakStatement,
      CallExpression = $__56.CallExpression,
      CaseClause = $__56.CaseClause,
      Catch = $__56.Catch,
      ClassDeclaration = $__56.ClassDeclaration,
      ClassExpression = $__56.ClassExpression,
      CommaExpression = $__56.CommaExpression,
      ComprehensionFor = $__56.ComprehensionFor,
      ComprehensionIf = $__56.ComprehensionIf,
      ComputedPropertyName = $__56.ComputedPropertyName,
      ConditionalExpression = $__56.ConditionalExpression,
      ContinueStatement = $__56.ContinueStatement,
      CoverFormals = $__56.CoverFormals,
      CoverInitialisedName = $__56.CoverInitialisedName,
      DebuggerStatement = $__56.DebuggerStatement,
      DefaultClause = $__56.DefaultClause,
      DoWhileStatement = $__56.DoWhileStatement,
      EmptyStatement = $__56.EmptyStatement,
      ExportDeclaration = $__56.ExportDeclaration,
      ExportDefault = $__56.ExportDefault,
      ExportSpecifier = $__56.ExportSpecifier,
      ExportSpecifierSet = $__56.ExportSpecifierSet,
      ExportStar = $__56.ExportStar,
      ExpressionStatement = $__56.ExpressionStatement,
      Finally = $__56.Finally,
      ForInStatement = $__56.ForInStatement,
      ForOfStatement = $__56.ForOfStatement,
      ForStatement = $__56.ForStatement,
      FormalParameter = $__56.FormalParameter,
      FormalParameterList = $__56.FormalParameterList,
      FunctionBody = $__56.FunctionBody,
      FunctionDeclaration = $__56.FunctionDeclaration,
      FunctionExpression = $__56.FunctionExpression,
      GeneratorComprehension = $__56.GeneratorComprehension,
      GetAccessor = $__56.GetAccessor,
      IdentifierExpression = $__56.IdentifierExpression,
      IfStatement = $__56.IfStatement,
      ImportedBinding = $__56.ImportedBinding,
      ImportDeclaration = $__56.ImportDeclaration,
      ImportSpecifier = $__56.ImportSpecifier,
      ImportSpecifierSet = $__56.ImportSpecifierSet,
      LabelledStatement = $__56.LabelledStatement,
      LiteralExpression = $__56.LiteralExpression,
      LiteralPropertyName = $__56.LiteralPropertyName,
      MemberExpression = $__56.MemberExpression,
      MemberLookupExpression = $__56.MemberLookupExpression,
      Module = $__56.Module,
      ModuleDeclaration = $__56.ModuleDeclaration,
      ModuleSpecifier = $__56.ModuleSpecifier,
      NamedExport = $__56.NamedExport,
      NewExpression = $__56.NewExpression,
      ObjectLiteralExpression = $__56.ObjectLiteralExpression,
      ObjectPattern = $__56.ObjectPattern,
      ObjectPatternField = $__56.ObjectPatternField,
      ParenExpression = $__56.ParenExpression,
      PostfixExpression = $__56.PostfixExpression,
      PredefinedType = $__56.PredefinedType,
      Script = $__56.Script,
      PropertyMethodAssignment = $__56.PropertyMethodAssignment,
      PropertyNameAssignment = $__56.PropertyNameAssignment,
      PropertyNameShorthand = $__56.PropertyNameShorthand,
      RestParameter = $__56.RestParameter,
      ReturnStatement = $__56.ReturnStatement,
      SetAccessor = $__56.SetAccessor,
      SpreadExpression = $__56.SpreadExpression,
      SpreadPatternElement = $__56.SpreadPatternElement,
      SuperExpression = $__56.SuperExpression,
      SwitchStatement = $__56.SwitchStatement,
      SyntaxErrorTree = $__56.SyntaxErrorTree,
      TemplateLiteralExpression = $__56.TemplateLiteralExpression,
      TemplateLiteralPortion = $__56.TemplateLiteralPortion,
      TemplateSubstitution = $__56.TemplateSubstitution,
      ThisExpression = $__56.ThisExpression,
      ThrowStatement = $__56.ThrowStatement,
      TryStatement = $__56.TryStatement,
      TypeName = $__56.TypeName,
      UnaryExpression = $__56.UnaryExpression,
      VariableDeclaration = $__56.VariableDeclaration,
      VariableDeclarationList = $__56.VariableDeclarationList,
      VariableStatement = $__56.VariableStatement,
      WhileStatement = $__56.WhileStatement,
      WithStatement = $__56.WithStatement,
      YieldExpression = $__56.YieldExpression;
  var ParseTreeTransformer = function ParseTreeTransformer() {};
  ($traceurRuntime.createClass)(ParseTreeTransformer, {
    transformAny: function(tree) {
      return tree && tree.transform(this);
    },
    transformList: function(list) {
      var $__57;
      var builder = null;
      for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var transformed = this.transformAny(element);
        if (builder != null || element != transformed) {
          if (builder == null) {
            builder = list.slice(0, index);
          }
          if (transformed instanceof AnonBlock)
            ($__57 = builder).push.apply($__57, $traceurRuntime.toObject(transformed.statements));
          else
            builder.push(transformed);
        }
      }
      return builder || list;
    },
    transformStateMachine: function(tree) {
      throw Error('State machines should not live outside of the GeneratorTransformer.');
    },
    transformAnnotation: function(tree) {
      var name = this.transformAny(tree.name);
      var args = this.transformAny(tree.args);
      if (name === tree.name && args === tree.args) {
        return tree;
      }
      return new Annotation(tree.location, name, args);
    },
    transformAnonBlock: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new AnonBlock(tree.location, statements);
    },
    transformArgumentList: function(tree) {
      var args = this.transformList(tree.args);
      if (args === tree.args) {
        return tree;
      }
      return new ArgumentList(tree.location, args);
    },
    transformArrayComprehension: function(tree) {
      var comprehensionList = this.transformList(tree.comprehensionList);
      var expression = this.transformAny(tree.expression);
      if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
        return tree;
      }
      return new ArrayComprehension(tree.location, comprehensionList, expression);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements) {
        return tree;
      }
      return new ArrayLiteralExpression(tree.location, elements);
    },
    transformArrayPattern: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements) {
        return tree;
      }
      return new ArrayPattern(tree.location, elements);
    },
    transformArrowFunctionExpression: function(tree) {
      var parameterList = this.transformAny(tree.parameterList);
      var functionBody = this.transformAny(tree.functionBody);
      if (parameterList === tree.parameterList && functionBody === tree.functionBody) {
        return tree;
      }
      return new ArrowFunctionExpression(tree.location, parameterList, functionBody);
    },
    transformAwaitExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new AwaitExpression(tree.location, expression);
    },
    transformBinaryOperator: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left === tree.left && right === tree.right) {
        return tree;
      }
      return new BinaryOperator(tree.location, left, tree.operator, right);
    },
    transformBindingElement: function(tree) {
      var binding = this.transformAny(tree.binding);
      var initializer = this.transformAny(tree.initializer);
      if (binding === tree.binding && initializer === tree.initializer) {
        return tree;
      }
      return new BindingElement(tree.location, binding, initializer);
    },
    transformBindingIdentifier: function(tree) {
      return tree;
    },
    transformBlock: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new Block(tree.location, statements);
    },
    transformBreakStatement: function(tree) {
      return tree;
    },
    transformCallExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand === tree.operand && args === tree.args) {
        return tree;
      }
      return new CallExpression(tree.location, operand, args);
    },
    transformCaseClause: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statements = this.transformList(tree.statements);
      if (expression === tree.expression && statements === tree.statements) {
        return tree;
      }
      return new CaseClause(tree.location, expression, statements);
    },
    transformCatch: function(tree) {
      var binding = this.transformAny(tree.binding);
      var catchBody = this.transformAny(tree.catchBody);
      if (binding === tree.binding && catchBody === tree.catchBody) {
        return tree;
      }
      return new Catch(tree.location, binding, catchBody);
    },
    transformClassDeclaration: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      var annotations = this.transformList(tree.annotations);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements && annotations === tree.annotations) {
        return tree;
      }
      return new ClassDeclaration(tree.location, name, superClass, elements, annotations);
    },
    transformClassExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      var annotations = this.transformList(tree.annotations);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements && annotations === tree.annotations) {
        return tree;
      }
      return new ClassExpression(tree.location, name, superClass, elements, annotations);
    },
    transformCommaExpression: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions) {
        return tree;
      }
      return new CommaExpression(tree.location, expressions);
    },
    transformComprehensionFor: function(tree) {
      var left = this.transformAny(tree.left);
      var iterator = this.transformAny(tree.iterator);
      if (left === tree.left && iterator === tree.iterator) {
        return tree;
      }
      return new ComprehensionFor(tree.location, left, iterator);
    },
    transformComprehensionIf: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ComprehensionIf(tree.location, expression);
    },
    transformComputedPropertyName: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ComputedPropertyName(tree.location, expression);
    },
    transformConditionalExpression: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition === tree.condition && left === tree.left && right === tree.right) {
        return tree;
      }
      return new ConditionalExpression(tree.location, condition, left, right);
    },
    transformContinueStatement: function(tree) {
      return tree;
    },
    transformCoverFormals: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions) {
        return tree;
      }
      return new CoverFormals(tree.location, expressions);
    },
    transformCoverInitialisedName: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      if (initializer === tree.initializer) {
        return tree;
      }
      return new CoverInitialisedName(tree.location, tree.name, tree.equalToken, initializer);
    },
    transformDebuggerStatement: function(tree) {
      return tree;
    },
    transformDefaultClause: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new DefaultClause(tree.location, statements);
    },
    transformDoWhileStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var condition = this.transformAny(tree.condition);
      if (body === tree.body && condition === tree.condition) {
        return tree;
      }
      return new DoWhileStatement(tree.location, body, condition);
    },
    transformEmptyStatement: function(tree) {
      return tree;
    },
    transformExportDeclaration: function(tree) {
      var declaration = this.transformAny(tree.declaration);
      var annotations = this.transformList(tree.annotations);
      if (declaration === tree.declaration && annotations === tree.annotations) {
        return tree;
      }
      return new ExportDeclaration(tree.location, declaration, annotations);
    },
    transformExportDefault: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ExportDefault(tree.location, expression);
    },
    transformExportSpecifier: function(tree) {
      return tree;
    },
    transformExportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers === tree.specifiers) {
        return tree;
      }
      return new ExportSpecifierSet(tree.location, specifiers);
    },
    transformExportStar: function(tree) {
      return tree;
    },
    transformExpressionStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ExpressionStatement(tree.location, expression);
    },
    transformFinally: function(tree) {
      var block = this.transformAny(tree.block);
      if (block === tree.block) {
        return tree;
      }
      return new Finally(tree.location, block);
    },
    transformForInStatement: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer === tree.initializer && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ForInStatement(tree.location, initializer, collection, body);
    },
    transformForOfStatement: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer === tree.initializer && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ForOfStatement(tree.location, initializer, collection, body);
    },
    transformForStatement: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var condition = this.transformAny(tree.condition);
      var increment = this.transformAny(tree.increment);
      var body = this.transformAny(tree.body);
      if (initializer === tree.initializer && condition === tree.condition && increment === tree.increment && body === tree.body) {
        return tree;
      }
      return new ForStatement(tree.location, initializer, condition, increment, body);
    },
    transformFormalParameter: function(tree) {
      var parameter = this.transformAny(tree.parameter);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var annotations = this.transformList(tree.annotations);
      if (parameter === tree.parameter && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations) {
        return tree;
      }
      return new FormalParameter(tree.location, parameter, typeAnnotation, annotations);
    },
    transformFormalParameterList: function(tree) {
      var parameters = this.transformList(tree.parameters);
      if (parameters === tree.parameters) {
        return tree;
      }
      return new FormalParameterList(tree.location, parameters);
    },
    transformFunctionBody: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements) {
        return tree;
      }
      return new FunctionBody(tree.location, statements);
    },
    transformFunctionDeclaration: function(tree) {
      var name = this.transformAny(tree.name);
      var parameterList = this.transformAny(tree.parameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var annotations = this.transformList(tree.annotations);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && parameterList === tree.parameterList && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, name, tree.functionKind, parameterList, typeAnnotation, annotations, functionBody);
    },
    transformFunctionExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var parameterList = this.transformAny(tree.parameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var annotations = this.transformList(tree.annotations);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && parameterList === tree.parameterList && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionExpression(tree.location, name, tree.functionKind, parameterList, typeAnnotation, annotations, functionBody);
    },
    transformGeneratorComprehension: function(tree) {
      var comprehensionList = this.transformList(tree.comprehensionList);
      var expression = this.transformAny(tree.expression);
      if (comprehensionList === tree.comprehensionList && expression === tree.expression) {
        return tree;
      }
      return new GeneratorComprehension(tree.location, comprehensionList, expression);
    },
    transformGetAccessor: function(tree) {
      var name = this.transformAny(tree.name);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var annotations = this.transformList(tree.annotations);
      var body = this.transformAny(tree.body);
      if (name === tree.name && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && body === tree.body) {
        return tree;
      }
      return new GetAccessor(tree.location, tree.isStatic, name, typeAnnotation, annotations, body);
    },
    transformIdentifierExpression: function(tree) {
      return tree;
    },
    transformIfStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var ifClause = this.transformAny(tree.ifClause);
      var elseClause = this.transformAny(tree.elseClause);
      if (condition === tree.condition && ifClause === tree.ifClause && elseClause === tree.elseClause) {
        return tree;
      }
      return new IfStatement(tree.location, condition, ifClause, elseClause);
    },
    transformImportedBinding: function(tree) {
      var binding = this.transformAny(tree.binding);
      if (binding === tree.binding) {
        return tree;
      }
      return new ImportedBinding(tree.location, binding);
    },
    transformImportDeclaration: function(tree) {
      var importClause = this.transformAny(tree.importClause);
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      if (importClause === tree.importClause && moduleSpecifier === tree.moduleSpecifier) {
        return tree;
      }
      return new ImportDeclaration(tree.location, importClause, moduleSpecifier);
    },
    transformImportSpecifier: function(tree) {
      return tree;
    },
    transformImportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers === tree.specifiers) {
        return tree;
      }
      return new ImportSpecifierSet(tree.location, specifiers);
    },
    transformLabelledStatement: function(tree) {
      var statement = this.transformAny(tree.statement);
      if (statement === tree.statement) {
        return tree;
      }
      return new LabelledStatement(tree.location, tree.name, statement);
    },
    transformLiteralExpression: function(tree) {
      return tree;
    },
    transformLiteralPropertyName: function(tree) {
      return tree;
    },
    transformMemberExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new MemberExpression(tree.location, operand, tree.memberName);
    },
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (operand === tree.operand && memberExpression === tree.memberExpression) {
        return tree;
      }
      return new MemberLookupExpression(tree.location, operand, memberExpression);
    },
    transformModule: function(tree) {
      var scriptItemList = this.transformList(tree.scriptItemList);
      if (scriptItemList === tree.scriptItemList) {
        return tree;
      }
      return new Module(tree.location, scriptItemList, tree.moduleName);
    },
    transformModuleDeclaration: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ModuleDeclaration(tree.location, tree.identifier, expression);
    },
    transformModuleSpecifier: function(tree) {
      return tree;
    },
    transformNamedExport: function(tree) {
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      var specifierSet = this.transformAny(tree.specifierSet);
      if (moduleSpecifier === tree.moduleSpecifier && specifierSet === tree.specifierSet) {
        return tree;
      }
      return new NamedExport(tree.location, moduleSpecifier, specifierSet);
    },
    transformNewExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand === tree.operand && args === tree.args) {
        return tree;
      }
      return new NewExpression(tree.location, operand, args);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues === tree.propertyNameAndValues) {
        return tree;
      }
      return new ObjectLiteralExpression(tree.location, propertyNameAndValues);
    },
    transformObjectPattern: function(tree) {
      var fields = this.transformList(tree.fields);
      if (fields === tree.fields) {
        return tree;
      }
      return new ObjectPattern(tree.location, fields);
    },
    transformObjectPatternField: function(tree) {
      var name = this.transformAny(tree.name);
      var element = this.transformAny(tree.element);
      if (name === tree.name && element === tree.element) {
        return tree;
      }
      return new ObjectPatternField(tree.location, name, element);
    },
    transformParenExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ParenExpression(tree.location, expression);
    },
    transformPostfixExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new PostfixExpression(tree.location, operand, tree.operator);
    },
    transformPredefinedType: function(tree) {
      return tree;
    },
    transformScript: function(tree) {
      var scriptItemList = this.transformList(tree.scriptItemList);
      if (scriptItemList === tree.scriptItemList) {
        return tree;
      }
      return new Script(tree.location, scriptItemList, tree.moduleName);
    },
    transformPropertyMethodAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var parameterList = this.transformAny(tree.parameterList);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var annotations = this.transformList(tree.annotations);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && parameterList === tree.parameterList && typeAnnotation === tree.typeAnnotation && annotations === tree.annotations && functionBody === tree.functionBody) {
        return tree;
      }
      return new PropertyMethodAssignment(tree.location, tree.isStatic, tree.functionKind, name, parameterList, typeAnnotation, annotations, functionBody);
    },
    transformPropertyNameAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var value = this.transformAny(tree.value);
      if (name === tree.name && value === tree.value) {
        return tree;
      }
      return new PropertyNameAssignment(tree.location, name, value);
    },
    transformPropertyNameShorthand: function(tree) {
      return tree;
    },
    transformRestParameter: function(tree) {
      var identifier = this.transformAny(tree.identifier);
      if (identifier === tree.identifier) {
        return tree;
      }
      return new RestParameter(tree.location, identifier);
    },
    transformReturnStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new ReturnStatement(tree.location, expression);
    },
    transformSetAccessor: function(tree) {
      var name = this.transformAny(tree.name);
      var parameterList = this.transformAny(tree.parameterList);
      var annotations = this.transformList(tree.annotations);
      var body = this.transformAny(tree.body);
      if (name === tree.name && parameterList === tree.parameterList && annotations === tree.annotations && body === tree.body) {
        return tree;
      }
      return new SetAccessor(tree.location, tree.isStatic, name, parameterList, annotations, body);
    },
    transformSpreadExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new SpreadExpression(tree.location, expression);
    },
    transformSpreadPatternElement: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      if (lvalue === tree.lvalue) {
        return tree;
      }
      return new SpreadPatternElement(tree.location, lvalue);
    },
    transformSuperExpression: function(tree) {
      return tree;
    },
    transformSwitchStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var caseClauses = this.transformList(tree.caseClauses);
      if (expression === tree.expression && caseClauses === tree.caseClauses) {
        return tree;
      }
      return new SwitchStatement(tree.location, expression, caseClauses);
    },
    transformSyntaxErrorTree: function(tree) {
      return tree;
    },
    transformTemplateLiteralExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var elements = this.transformList(tree.elements);
      if (operand === tree.operand && elements === tree.elements) {
        return tree;
      }
      return new TemplateLiteralExpression(tree.location, operand, elements);
    },
    transformTemplateLiteralPortion: function(tree) {
      return tree;
    },
    transformTemplateSubstitution: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new TemplateSubstitution(tree.location, expression);
    },
    transformThisExpression: function(tree) {
      return tree;
    },
    transformThrowStatement: function(tree) {
      var value = this.transformAny(tree.value);
      if (value === tree.value) {
        return tree;
      }
      return new ThrowStatement(tree.location, value);
    },
    transformTryStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var catchBlock = this.transformAny(tree.catchBlock);
      var finallyBlock = this.transformAny(tree.finallyBlock);
      if (body === tree.body && catchBlock === tree.catchBlock && finallyBlock === tree.finallyBlock) {
        return tree;
      }
      return new TryStatement(tree.location, body, catchBlock, finallyBlock);
    },
    transformTypeName: function(tree) {
      var moduleName = this.transformAny(tree.moduleName);
      if (moduleName === tree.moduleName) {
        return tree;
      }
      return new TypeName(tree.location, moduleName, tree.name);
    },
    transformUnaryExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand) {
        return tree;
      }
      return new UnaryExpression(tree.location, tree.operator, operand);
    },
    transformVariableDeclaration: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var typeAnnotation = this.transformAny(tree.typeAnnotation);
      var initializer = this.transformAny(tree.initializer);
      if (lvalue === tree.lvalue && typeAnnotation === tree.typeAnnotation && initializer === tree.initializer) {
        return tree;
      }
      return new VariableDeclaration(tree.location, lvalue, typeAnnotation, initializer);
    },
    transformVariableDeclarationList: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations === tree.declarations) {
        return tree;
      }
      return new VariableDeclarationList(tree.location, tree.declarationType, declarations);
    },
    transformVariableStatement: function(tree) {
      var declarations = this.transformAny(tree.declarations);
      if (declarations === tree.declarations) {
        return tree;
      }
      return new VariableStatement(tree.location, declarations);
    },
    transformWhileStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var body = this.transformAny(tree.body);
      if (condition === tree.condition && body === tree.body) {
        return tree;
      }
      return new WhileStatement(tree.location, condition, body);
    },
    transformWithStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var body = this.transformAny(tree.body);
      if (expression === tree.expression && body === tree.body) {
        return tree;
      }
      return new WithStatement(tree.location, expression, body);
    },
    transformYieldExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new YieldExpression(tree.location, expression, tree.isYieldFor);
    }
  }, {});
  return {get ParseTreeTransformer() {
      return ParseTreeTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/AssignmentPatternTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/AssignmentPatternTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__59 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ArrayPattern = $__59.ArrayPattern,
      BindingElement = $__59.BindingElement,
      BindingIdentifier = $__59.BindingIdentifier,
      IdentifierExpression = $__59.IdentifierExpression,
      ObjectPattern = $__59.ObjectPattern,
      ObjectPatternField = $__59.ObjectPatternField,
      SpreadPatternElement = $__59.SpreadPatternElement;
  var EQUAL = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).EQUAL;
  var AssignmentPatternTransformerError = function AssignmentPatternTransformerError() {
    $traceurRuntime.defaultSuperCall(this, $AssignmentPatternTransformerError.prototype, arguments);
  };
  var $AssignmentPatternTransformerError = AssignmentPatternTransformerError;
  ($traceurRuntime.createClass)(AssignmentPatternTransformerError, {}, {}, Error);
  var AssignmentPatternTransformer = function AssignmentPatternTransformer() {
    $traceurRuntime.defaultSuperCall(this, $AssignmentPatternTransformer.prototype, arguments);
  };
  var $AssignmentPatternTransformer = AssignmentPatternTransformer;
  ($traceurRuntime.createClass)(AssignmentPatternTransformer, {
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== EQUAL)
        throw new AssignmentPatternTransformerError();
      var bindingElement = this.transformAny(tree.left);
      if (bindingElement instanceof BindingElement)
        bindingElement = bindingElement.binding;
      return new BindingElement(tree.location, bindingElement, tree.right);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      return new ArrayPattern(tree.location, elements);
    },
    transformCoverInitialisedName: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.name.location, tree.name), tree.initializer);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      return new ObjectPattern(tree.location, propertyNameAndValues);
    },
    transformPropertyNameAssignment: function(tree) {
      return new ObjectPatternField(tree.location, tree.name, this.transformAny(tree.value));
    },
    transformPropertyNameShorthand: function(tree) {
      return new IdentifierExpression(tree.location, tree.name);
    },
    transformSpreadExpression: function(tree) {
      return new SpreadPatternElement(tree.location, tree.expression);
    },
    transformSyntaxErrorTree: function(tree) {
      throw new AssignmentPatternTransformerError();
    }
  }, {}, ParseTreeTransformer);
  return {
    get AssignmentPatternTransformerError() {
      return AssignmentPatternTransformerError;
    },
    get AssignmentPatternTransformer() {
      return AssignmentPatternTransformer;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/CoverFormalsTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/CoverFormalsTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__61 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ArrayPattern = $__61.ArrayPattern,
      BindingElement = $__61.BindingElement,
      BindingIdentifier = $__61.BindingIdentifier,
      CommaExpression = $__61.CommaExpression,
      FormalParameter = $__61.FormalParameter,
      FormalParameterList = $__61.FormalParameterList,
      ObjectPattern = $__61.ObjectPattern,
      ObjectPatternField = $__61.ObjectPatternField,
      ParenExpression = $__61.ParenExpression,
      RestParameter = $__61.RestParameter,
      SpreadPatternElement = $__61.SpreadPatternElement;
  var EQUAL = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).EQUAL;
  var IDENTIFIER_EXPRESSION = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")).IDENTIFIER_EXPRESSION;
  var AssignmentPatternTransformerError = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AssignmentPatternTransformer")).AssignmentPatternTransformerError;
  var CoverFormalsTransformerError = function CoverFormalsTransformerError(location, message) {
    this.location = location;
    this.message = message;
  };
  ($traceurRuntime.createClass)(CoverFormalsTransformerError, {}, {}, Error);
  var ToFormalParametersTransformer = function ToFormalParametersTransformer() {
    this.isValid = true;
    this.inArrayPattern_ = false;
  };
  ($traceurRuntime.createClass)(ToFormalParametersTransformer, {
    transformCoverFormals: function(tree) {
      var expressions = this.transformList(tree.expressions).map((function(expression) {
        return new FormalParameter(expression.location, expression, null, []);
      }));
      return new FormalParameterList(tree.location, expressions);
    },
    transformIdentifierExpression: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.identifierToken), null);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== EQUAL)
        throw new CoverFormalsTransformerError(tree.operator, ("Unexpected token " + tree.operator));
      var bindingElement = this.transformAny(tree.left);
      if (bindingElement instanceof BindingElement)
        bindingElement = bindingElement.binding;
      return new BindingElement(tree.location, bindingElement, tree.right);
    },
    transformArrayLiteralExpression: function(tree) {
      var wasInArrayPattern = this.inArrayPattern_;
      this.inArrayPattern_ = true;
      var elements = this.transformList(tree.elements);
      this.inArrayPattern_ = wasInArrayPattern;
      var okIndex = elements.length - 1;
      for (var i = 0; i < okIndex; i++) {
        if (elements[i] instanceof SpreadPatternElement)
          throw new CoverFormalsTransformerError(elements[i].location, 'Unexpected token ...');
      }
      return new BindingElement(tree.location, new ArrayPattern(tree.location, elements), null);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      return new BindingElement(tree.location, new ObjectPattern(tree.location, propertyNameAndValues), null);
    },
    transformCoverInitialisedName: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.name), tree.initializer);
    },
    transformPropertyNameAssignment: function(tree) {
      return new ObjectPatternField(tree.location, tree.name, this.transformAny(tree.value));
    },
    transformPropertyNameShorthand: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.name), null);
    },
    transformSpreadExpression: function(tree) {
      if (tree.expression.type !== IDENTIFIER_EXPRESSION)
        throw new CoverFormalsTransformerError(tree.expression.location, 'identifier expected');
      var bindingIdentifier = new BindingIdentifier(tree.expression.location, tree.expression.identifierToken);
      if (this.inArrayPattern_)
        return new SpreadPatternElement(tree.location, bindingIdentifier);
      return new RestParameter(tree.location, bindingIdentifier);
    },
    transformSyntaxErrorTree: function(tree) {
      throw new AssignmentPatternTransformerError();
    }
  }, {}, ParseTreeTransformer);
  function toParenExpression(tree) {
    var expressions = tree.expressions;
    var length = expressions.length;
    if (length === 0)
      throw new CoverFormalsTransformerError(tree.location, 'Unexpected token )');
    for (var i = 0; i < length; i++) {
      if (expressions[i].isRestParameter())
        throw new CoverFormalsTransformerError(expressions[i].location, 'Unexpected token ...');
    }
    var expression;
    if (expressions.length > 1) {
      expression = new CommaExpression(expressions[0].location, expressions);
    } else {
      expression = expressions[0];
    }
    return new ParenExpression(tree.location, expression);
  }
  function toFormalParameters(tree) {
    var transformer = new ToFormalParametersTransformer();
    return transformer.transformAny(tree);
  }
  return {
    get CoverFormalsTransformerError() {
      return CoverFormalsTransformerError;
    },
    get toParenExpression() {
      return toParenExpression;
    },
    get toFormalParameters() {
      return toFormalParameters;
    }
  };
});
System.register("traceur@0.0.43/src/staticsemantics/StrictParams", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/staticsemantics/StrictParams";
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var isStrictKeyword = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Keywords")).isStrictKeyword;
  var StrictParams = function StrictParams(errorReporter) {
    $traceurRuntime.superCall(this, $StrictParams.prototype, "constructor", []);
    this.errorReporter = errorReporter;
  };
  var $StrictParams = StrictParams;
  ($traceurRuntime.createClass)(StrictParams, {visitBindingIdentifier: function(tree) {
      var name = tree.identifierToken.toString();
      if (isStrictKeyword(name)) {
        this.errorReporter.reportError(tree.location.start, (name + " is a reserved identifier"));
      }
    }}, {visit: function(tree, errorReporter) {
      new $StrictParams(errorReporter).visitAny(tree);
    }}, ParseTreeVisitor);
  return {get StrictParams() {
      return StrictParams;
    }};
});
System.register("traceur@0.0.43/src/util/SourceRange", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/SourceRange";
  var SourceRange = function SourceRange(start, end) {
    this.start = start;
    this.end = end;
  };
  ($traceurRuntime.createClass)(SourceRange, {toString: function() {
      var str = this.start.source.contents;
      return str.slice(this.start.offset, this.end.offset);
    }}, {});
  return {get SourceRange() {
      return SourceRange;
    }};
});
System.register("traceur@0.0.43/src/util/ErrorReporter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/ErrorReporter";
  var ErrorReporter = function ErrorReporter() {
    this.hadError_ = false;
  };
  ($traceurRuntime.createClass)(ErrorReporter, {
    reportError: function(location, message) {
      this.hadError_ = true;
      this.reportMessageInternal(location, message);
    },
    reportMessageInternal: function(location, message) {
      if (location)
        message = (location + ": " + message);
      console.error(message);
    },
    hadError: function() {
      return this.hadError_;
    },
    clearError: function() {
      this.hadError_ = false;
    }
  }, {});
  function format(location, text) {
    var args = arguments[2];
    var i = 0;
    text = text.replace(/%./g, function(s) {
      switch (s) {
        case '%s':
          return args && args[i++];
        case '%%':
          return '%';
      }
      return s;
    });
    if (location)
      text = (location + ": " + text);
    return text;
  }
  ;
  ErrorReporter.format = format;
  return {
    get ErrorReporter() {
      return ErrorReporter;
    },
    get format() {
      return format;
    }
  };
});
System.register("traceur@0.0.43/src/util/SyntaxErrorReporter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/SyntaxErrorReporter";
  var $__67 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ErrorReporter")),
      ErrorReporter = $__67.ErrorReporter,
      format = $__67.format;
  var SyntaxErrorReporter = function SyntaxErrorReporter() {
    $traceurRuntime.defaultSuperCall(this, $SyntaxErrorReporter.prototype, arguments);
  };
  var $SyntaxErrorReporter = SyntaxErrorReporter;
  ($traceurRuntime.createClass)(SyntaxErrorReporter, {reportMessageInternal: function(location, message) {
      var s = format(location, message);
      throw new SyntaxError(s);
    }}, {}, ErrorReporter);
  return {get SyntaxErrorReporter() {
      return SyntaxErrorReporter;
    }};
});
System.register("traceur@0.0.43/src/syntax/Parser", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/Parser";
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AssignmentPatternTransformer")),
      AssignmentPatternTransformer = $__71.AssignmentPatternTransformer,
      AssignmentPatternTransformerError = $__71.AssignmentPatternTransformerError;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/CoverFormalsTransformer")),
      toFormalParameters = $__71.toFormalParameters,
      toParenExpression = $__71.toParenExpression,
      CoverFormalsTransformerError = $__71.CoverFormalsTransformerError;
  var IdentifierToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/IdentifierToken")).IdentifierToken;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      ARRAY_LITERAL_EXPRESSION = $__71.ARRAY_LITERAL_EXPRESSION,
      BINARY_OPERATOR = $__71.BINARY_OPERATOR,
      CALL_EXPRESSION = $__71.CALL_EXPRESSION,
      CLASS_DECLARATION = $__71.CLASS_DECLARATION,
      COMMA_EXPRESSION = $__71.COMMA_EXPRESSION,
      COMPUTED_PROPERTY_NAME = $__71.COMPUTED_PROPERTY_NAME,
      COVER_FORMALS = $__71.COVER_FORMALS,
      FORMAL_PARAMETER_LIST = $__71.FORMAL_PARAMETER_LIST,
      FUNCTION_DECLARATION = $__71.FUNCTION_DECLARATION,
      IDENTIFIER_EXPRESSION = $__71.IDENTIFIER_EXPRESSION,
      LITERAL_PROPERTY_NAME = $__71.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__71.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__71.MEMBER_LOOKUP_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__71.OBJECT_LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__71.PAREN_EXPRESSION,
      PROPERTY_NAME_ASSIGNMENT = $__71.PROPERTY_NAME_ASSIGNMENT,
      REST_PARAMETER = $__71.REST_PARAMETER,
      SYNTAX_ERROR_TREE = $__71.SYNTAX_ERROR_TREE;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      AS = $__71.AS,
      ASYNC = $__71.ASYNC,
      AWAIT = $__71.AWAIT,
      FROM = $__71.FROM,
      GET = $__71.GET,
      MODULE = $__71.MODULE,
      OF = $__71.OF,
      SET = $__71.SET;
  var SyntaxErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/SyntaxErrorReporter")).SyntaxErrorReporter;
  var Scanner = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Scanner")).Scanner;
  var SourceRange = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/SourceRange")).SourceRange;
  var StrictParams = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/staticsemantics/StrictParams")).StrictParams;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")),
      Token = $__71.Token,
      isAssignmentOperator = $__71.isAssignmentOperator;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")),
      parseOptions = $__71.parseOptions,
      options = $__71.options;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AMPERSAND = $__71.AMPERSAND,
      AMPERSAND_EQUAL = $__71.AMPERSAND_EQUAL,
      AND = $__71.AND,
      ARROW = $__71.ARROW,
      AT = $__71.AT,
      BACK_QUOTE = $__71.BACK_QUOTE,
      BANG = $__71.BANG,
      BAR = $__71.BAR,
      BAR_EQUAL = $__71.BAR_EQUAL,
      BREAK = $__71.BREAK,
      CARET = $__71.CARET,
      CARET_EQUAL = $__71.CARET_EQUAL,
      CASE = $__71.CASE,
      CATCH = $__71.CATCH,
      CLASS = $__71.CLASS,
      CLOSE_ANGLE = $__71.CLOSE_ANGLE,
      CLOSE_CURLY = $__71.CLOSE_CURLY,
      CLOSE_PAREN = $__71.CLOSE_PAREN,
      CLOSE_SQUARE = $__71.CLOSE_SQUARE,
      COLON = $__71.COLON,
      COMMA = $__71.COMMA,
      CONST = $__71.CONST,
      CONTINUE = $__71.CONTINUE,
      DEBUGGER = $__71.DEBUGGER,
      DEFAULT = $__71.DEFAULT,
      DELETE = $__71.DELETE,
      DO = $__71.DO,
      DOT_DOT_DOT = $__71.DOT_DOT_DOT,
      ELSE = $__71.ELSE,
      END_OF_FILE = $__71.END_OF_FILE,
      ENUM = $__71.ENUM,
      EQUAL = $__71.EQUAL,
      EQUAL_EQUAL = $__71.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__71.EQUAL_EQUAL_EQUAL,
      ERROR = $__71.ERROR,
      EXPORT = $__71.EXPORT,
      EXTENDS = $__71.EXTENDS,
      FALSE = $__71.FALSE,
      FINALLY = $__71.FINALLY,
      FOR = $__71.FOR,
      FUNCTION = $__71.FUNCTION,
      GREATER_EQUAL = $__71.GREATER_EQUAL,
      IDENTIFIER = $__71.IDENTIFIER,
      IF = $__71.IF,
      IMPLEMENTS = $__71.IMPLEMENTS,
      IMPORT = $__71.IMPORT,
      IN = $__71.IN,
      INSTANCEOF = $__71.INSTANCEOF,
      INTERFACE = $__71.INTERFACE,
      LEFT_SHIFT = $__71.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__71.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__71.LESS_EQUAL,
      LET = $__71.LET,
      MINUS = $__71.MINUS,
      MINUS_EQUAL = $__71.MINUS_EQUAL,
      MINUS_MINUS = $__71.MINUS_MINUS,
      NEW = $__71.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__71.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__71.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__71.NOT_EQUAL_EQUAL,
      NULL = $__71.NULL,
      NUMBER = $__71.NUMBER,
      OPEN_ANGLE = $__71.OPEN_ANGLE,
      OPEN_CURLY = $__71.OPEN_CURLY,
      OPEN_PAREN = $__71.OPEN_PAREN,
      OPEN_SQUARE = $__71.OPEN_SQUARE,
      OR = $__71.OR,
      PACKAGE = $__71.PACKAGE,
      PERCENT = $__71.PERCENT,
      PERCENT_EQUAL = $__71.PERCENT_EQUAL,
      PERIOD = $__71.PERIOD,
      PLUS = $__71.PLUS,
      PLUS_EQUAL = $__71.PLUS_EQUAL,
      PLUS_PLUS = $__71.PLUS_PLUS,
      PRIVATE = $__71.PRIVATE,
      PROTECTED = $__71.PROTECTED,
      PUBLIC = $__71.PUBLIC,
      QUESTION = $__71.QUESTION,
      REGULAR_EXPRESSION = $__71.REGULAR_EXPRESSION,
      RETURN = $__71.RETURN,
      RIGHT_SHIFT = $__71.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__71.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__71.SEMI_COLON,
      SLASH = $__71.SLASH,
      SLASH_EQUAL = $__71.SLASH_EQUAL,
      STAR = $__71.STAR,
      STAR_EQUAL = $__71.STAR_EQUAL,
      STATIC = $__71.STATIC,
      STRING = $__71.STRING,
      SUPER = $__71.SUPER,
      SWITCH = $__71.SWITCH,
      TEMPLATE_HEAD = $__71.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__71.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__71.TEMPLATE_TAIL,
      THIS = $__71.THIS,
      THROW = $__71.THROW,
      TILDE = $__71.TILDE,
      TRUE = $__71.TRUE,
      TRY = $__71.TRY,
      TYPEOF = $__71.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__71.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__71.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__71.VAR,
      VOID = $__71.VOID,
      WHILE = $__71.WHILE,
      WITH = $__71.WITH,
      YIELD = $__71.YIELD;
  var $__71 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ArgumentList = $__71.ArgumentList,
      ArrayComprehension = $__71.ArrayComprehension,
      ArrayLiteralExpression = $__71.ArrayLiteralExpression,
      ArrayPattern = $__71.ArrayPattern,
      ArrowFunctionExpression = $__71.ArrowFunctionExpression,
      AwaitExpression = $__71.AwaitExpression,
      BinaryOperator = $__71.BinaryOperator,
      BindingElement = $__71.BindingElement,
      BindingIdentifier = $__71.BindingIdentifier,
      Block = $__71.Block,
      BreakStatement = $__71.BreakStatement,
      CallExpression = $__71.CallExpression,
      CaseClause = $__71.CaseClause,
      Catch = $__71.Catch,
      ClassDeclaration = $__71.ClassDeclaration,
      ClassExpression = $__71.ClassExpression,
      CommaExpression = $__71.CommaExpression,
      ComprehensionFor = $__71.ComprehensionFor,
      ComprehensionIf = $__71.ComprehensionIf,
      ComputedPropertyName = $__71.ComputedPropertyName,
      ConditionalExpression = $__71.ConditionalExpression,
      ContinueStatement = $__71.ContinueStatement,
      CoverFormals = $__71.CoverFormals,
      CoverInitialisedName = $__71.CoverInitialisedName,
      DebuggerStatement = $__71.DebuggerStatement,
      Annotation = $__71.Annotation,
      DefaultClause = $__71.DefaultClause,
      DoWhileStatement = $__71.DoWhileStatement,
      EmptyStatement = $__71.EmptyStatement,
      ExportDeclaration = $__71.ExportDeclaration,
      ExportDefault = $__71.ExportDefault,
      ExportSpecifier = $__71.ExportSpecifier,
      ExportSpecifierSet = $__71.ExportSpecifierSet,
      ExportStar = $__71.ExportStar,
      ExpressionStatement = $__71.ExpressionStatement,
      Finally = $__71.Finally,
      ForInStatement = $__71.ForInStatement,
      ForOfStatement = $__71.ForOfStatement,
      ForStatement = $__71.ForStatement,
      FormalParameter = $__71.FormalParameter,
      FormalParameterList = $__71.FormalParameterList,
      FunctionBody = $__71.FunctionBody,
      FunctionDeclaration = $__71.FunctionDeclaration,
      FunctionExpression = $__71.FunctionExpression,
      GeneratorComprehension = $__71.GeneratorComprehension,
      GetAccessor = $__71.GetAccessor,
      IdentifierExpression = $__71.IdentifierExpression,
      IfStatement = $__71.IfStatement,
      ImportDeclaration = $__71.ImportDeclaration,
      ImportSpecifier = $__71.ImportSpecifier,
      ImportSpecifierSet = $__71.ImportSpecifierSet,
      ImportedBinding = $__71.ImportedBinding,
      LabelledStatement = $__71.LabelledStatement,
      LiteralExpression = $__71.LiteralExpression,
      LiteralPropertyName = $__71.LiteralPropertyName,
      MemberExpression = $__71.MemberExpression,
      MemberLookupExpression = $__71.MemberLookupExpression,
      Module = $__71.Module,
      ModuleDeclaration = $__71.ModuleDeclaration,
      ModuleSpecifier = $__71.ModuleSpecifier,
      NamedExport = $__71.NamedExport,
      NewExpression = $__71.NewExpression,
      ObjectLiteralExpression = $__71.ObjectLiteralExpression,
      ObjectPattern = $__71.ObjectPattern,
      ObjectPatternField = $__71.ObjectPatternField,
      ParenExpression = $__71.ParenExpression,
      PostfixExpression = $__71.PostfixExpression,
      PredefinedType = $__71.PredefinedType,
      Script = $__71.Script,
      PropertyMethodAssignment = $__71.PropertyMethodAssignment,
      PropertyNameAssignment = $__71.PropertyNameAssignment,
      PropertyNameShorthand = $__71.PropertyNameShorthand,
      RestParameter = $__71.RestParameter,
      ReturnStatement = $__71.ReturnStatement,
      SetAccessor = $__71.SetAccessor,
      SpreadExpression = $__71.SpreadExpression,
      SpreadPatternElement = $__71.SpreadPatternElement,
      SuperExpression = $__71.SuperExpression,
      SwitchStatement = $__71.SwitchStatement,
      SyntaxErrorTree = $__71.SyntaxErrorTree,
      TemplateLiteralExpression = $__71.TemplateLiteralExpression,
      TemplateLiteralPortion = $__71.TemplateLiteralPortion,
      TemplateSubstitution = $__71.TemplateSubstitution,
      ThisExpression = $__71.ThisExpression,
      ThrowStatement = $__71.ThrowStatement,
      TryStatement = $__71.TryStatement,
      TypeName = $__71.TypeName,
      UnaryExpression = $__71.UnaryExpression,
      VariableDeclaration = $__71.VariableDeclaration,
      VariableDeclarationList = $__71.VariableDeclarationList,
      VariableStatement = $__71.VariableStatement,
      WhileStatement = $__71.WhileStatement,
      WithStatement = $__71.WithStatement,
      YieldExpression = $__71.YieldExpression;
  var Expression = {
    NO_IN: 'NO_IN',
    NORMAL: 'NORMAL'
  };
  var DestructuringInitializer = {
    REQUIRED: 'REQUIRED',
    OPTIONAL: 'OPTIONAL'
  };
  var Initializer = {
    ALLOWED: 'ALLOWED',
    REQUIRED: 'REQUIRED'
  };
  var Parser = function Parser(file) {
    var errorReporter = arguments[1] !== (void 0) ? arguments[1] : new SyntaxErrorReporter();
    this.errorReporter_ = errorReporter;
    this.scanner_ = new Scanner(errorReporter, file, this);
    this.allowYield_ = false;
    this.allowAwait_ = false;
    this.strictMode_ = false;
    this.coverInitialisedName_ = null;
    this.annotations_ = [];
  };
  ($traceurRuntime.createClass)(Parser, {
    parseScript: function() {
      this.strictMode_ = false;
      var start = this.getTreeStartLocation_();
      var scriptItemList = this.parseScriptItemList_();
      this.eat_(END_OF_FILE);
      return new Script(this.getTreeLocation_(start), scriptItemList);
    },
    parseScriptItemList_: function() {
      var result = [];
      var type;
      var checkUseStrictDirective = true;
      while ((type = this.peekType_()) !== END_OF_FILE) {
        var scriptItem = this.parseScriptItem_(type, false);
        if (checkUseStrictDirective) {
          if (!scriptItem.isDirectivePrologue()) {
            checkUseStrictDirective = false;
          } else if (scriptItem.isUseStrictDirective()) {
            this.strictMode_ = true;
            checkUseStrictDirective = false;
          }
        }
        result.push(scriptItem);
      }
      return result;
    },
    parseScriptItem_: function(type, allowModuleItem) {
      return this.parseStatement_(type, allowModuleItem, true);
    },
    parseModule: function() {
      var start = this.getTreeStartLocation_();
      var scriptItemList = this.parseModuleItemList_();
      this.eat_(END_OF_FILE);
      return new Module(this.getTreeLocation_(start), scriptItemList);
    },
    parseModuleItemList_: function() {
      this.strictMode_ = true;
      var result = [];
      var type;
      while ((type = this.peekType_()) !== END_OF_FILE) {
        var scriptItem = this.parseScriptItem_(type, true);
        result.push(scriptItem);
      }
      return result;
    },
    parseModuleSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var token = this.eat_(STRING);
      return new ModuleSpecifier(this.getTreeLocation_(start), token);
    },
    parseImportDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(IMPORT);
      var importClause = null;
      if (this.peekImportClause_(this.peekType_())) {
        importClause = this.parseImportClause_();
        this.eatId_(FROM);
      }
      var moduleSpecifier = this.parseModuleSpecifier_();
      this.eatPossibleImplicitSemiColon_();
      return new ImportDeclaration(this.getTreeLocation_(start), importClause, moduleSpecifier);
    },
    peekImportClause_: function(type) {
      return type === OPEN_CURLY || this.peekBindingIdentifier_(type);
    },
    parseImportClause_: function() {
      var start = this.getTreeStartLocation_();
      if (this.eatIf_(OPEN_CURLY)) {
        var specifiers = [];
        while (!this.peek_(CLOSE_CURLY) && !this.isAtEnd()) {
          specifiers.push(this.parseImportSpecifier_());
          if (!this.eatIf_(COMMA))
            break;
        }
        this.eat_(CLOSE_CURLY);
        return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers);
      }
      var binding = this.parseBindingIdentifier_();
      return new ImportedBinding(this.getTreeLocation_(start), binding);
    },
    parseImportSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var token = this.peekToken_();
      var isKeyword = token.isKeyword();
      var lhs = this.eatIdName_();
      var rhs = null;
      if (isKeyword || this.peekPredefinedString_(AS)) {
        this.eatId_(AS);
        rhs = this.eatId_();
      }
      return new ImportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },
    parseExportDeclaration_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(EXPORT);
      var exportTree;
      var annotations = this.popAnnotations_();
      var type = this.peekType_();
      switch (type) {
        case CONST:
        case LET:
        case VAR:
          exportTree = this.parseVariableStatement_();
          break;
        case FUNCTION:
          exportTree = this.parseFunctionDeclaration_();
          break;
        case CLASS:
          exportTree = this.parseClassDeclaration_();
          break;
        case DEFAULT:
          exportTree = this.parseExportDefault_();
          break;
        case OPEN_CURLY:
        case STAR:
          exportTree = this.parseNamedExport_();
          break;
        case IDENTIFIER:
          if (options.asyncFunctions && this.peekPredefinedString_(ASYNC)) {
            var asyncToken = this.eatId_();
            exportTree = this.parseAsyncFunctionDeclaration_(asyncToken);
            break;
          }
        default:
          return this.parseUnexpectedToken_(type);
      }
      return new ExportDeclaration(this.getTreeLocation_(start), exportTree, annotations);
    },
    parseExportDefault_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DEFAULT);
      var expression = this.parseAssignmentExpression();
      this.eatPossibleImplicitSemiColon_();
      return new ExportDefault(this.getTreeLocation_(start), expression);
    },
    parseNamedExport_: function() {
      var start = this.getTreeStartLocation_();
      var specifierSet,
          expression;
      if (this.peek_(OPEN_CURLY)) {
        specifierSet = this.parseExportSpecifierSet_();
        expression = this.parseFromModuleSpecifierOpt_(false);
      } else {
        this.eat_(STAR);
        specifierSet = new ExportStar(this.getTreeLocation_(start));
        expression = this.parseFromModuleSpecifierOpt_(true);
      }
      this.eatPossibleImplicitSemiColon_();
      return new NamedExport(this.getTreeLocation_(start), expression, specifierSet);
    },
    parseFromModuleSpecifierOpt_: function(required) {
      if (required || this.peekPredefinedString_(FROM)) {
        this.eatId_(FROM);
        return this.parseModuleSpecifier_();
      }
      return null;
    },
    parseExportSpecifierSet_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var specifiers = [this.parseExportSpecifier_()];
      while (this.eatIf_(COMMA)) {
        if (this.peek_(CLOSE_CURLY))
          break;
        specifiers.push(this.parseExportSpecifier_());
      }
      this.eat_(CLOSE_CURLY);
      return new ExportSpecifierSet(this.getTreeLocation_(start), specifiers);
    },
    parseExportSpecifier_: function() {
      var start = this.getTreeStartLocation_();
      var lhs = this.eatId_();
      var rhs = null;
      if (this.peekPredefinedString_(AS)) {
        this.eatId_();
        rhs = this.eatIdName_();
      }
      return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },
    peekId_: function(type) {
      if (type === IDENTIFIER)
        return true;
      if (this.strictMode_)
        return false;
      return this.peekToken_().isStrictKeyword();
    },
    peekIdName_: function(token) {
      return token.type === IDENTIFIER || token.isKeyword();
    },
    parseClassShared_: function(constr) {
      var start = this.getTreeStartLocation_();
      var strictMode = this.strictMode_;
      this.strictMode_ = true;
      this.eat_(CLASS);
      var name = null;
      var annotations = [];
      if (constr == ClassDeclaration || !this.peek_(EXTENDS) && !this.peek_(OPEN_CURLY)) {
        name = this.parseBindingIdentifier_();
        annotations = this.popAnnotations_();
      }
      var superClass = null;
      if (this.eatIf_(EXTENDS)) {
        superClass = this.parseAssignmentExpression();
      }
      this.eat_(OPEN_CURLY);
      var elements = this.parseClassElements_();
      this.eat_(CLOSE_CURLY);
      this.strictMode_ = strictMode;
      return new constr(this.getTreeLocation_(start), name, superClass, elements, annotations);
    },
    parseClassDeclaration_: function() {
      return this.parseClassShared_(ClassDeclaration);
    },
    parseClassExpression_: function() {
      return this.parseClassShared_(ClassExpression);
    },
    parseClassElements_: function() {
      var result = [];
      while (true) {
        var type = this.peekType_();
        if (type === SEMI_COLON) {
          this.nextToken_();
        } else if (this.peekClassElement_(this.peekType_())) {
          result.push(this.parseClassElement_());
        } else {
          break;
        }
      }
      return result;
    },
    peekClassElement_: function(type) {
      return this.peekPropertyName_(type) || type === STAR && parseOptions.generators || type === AT && parseOptions.annotations;
    },
    parsePropertyName_: function() {
      if (this.peek_(OPEN_SQUARE))
        return this.parseComputedPropertyName_();
      return this.parseLiteralPropertyName_();
    },
    parseLiteralPropertyName_: function() {
      var start = this.getTreeStartLocation_();
      var token = this.nextToken_();
      return new LiteralPropertyName(this.getTreeLocation_(start), token);
    },
    parseComputedPropertyName_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_SQUARE);
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_SQUARE);
      return new ComputedPropertyName(this.getTreeLocation_(start), expression);
    },
    parseStatement: function() {
      return this.parseStatement_(this.peekType_(), false, false);
    },
    parseStatement_: function(type, allowModuleItem, allowScriptItem) {
      switch (type) {
        case RETURN:
          return this.parseReturnStatement_();
        case CONST:
        case LET:
          if (!parseOptions.blockBinding)
            break;
        case VAR:
          return this.parseVariableStatement_();
        case IF:
          return this.parseIfStatement_();
        case FOR:
          return this.parseForStatement_();
        case BREAK:
          return this.parseBreakStatement_();
        case SWITCH:
          return this.parseSwitchStatement_();
        case THROW:
          return this.parseThrowStatement_();
        case WHILE:
          return this.parseWhileStatement_();
        case FUNCTION:
          return this.parseFunctionDeclaration_();
        case AT:
          if (parseOptions.annotations)
            return this.parseAnnotatedDeclarations_(allowModuleItem, allowScriptItem);
          break;
        case CLASS:
          if (parseOptions.classes)
            return this.parseClassDeclaration_();
          break;
        case CONTINUE:
          return this.parseContinueStatement_();
        case DEBUGGER:
          return this.parseDebuggerStatement_();
        case DO:
          return this.parseDoWhileStatement_();
        case EXPORT:
          if (allowModuleItem && parseOptions.modules)
            return this.parseExportDeclaration_();
          break;
        case IMPORT:
          if (allowScriptItem && parseOptions.modules)
            return this.parseImportDeclaration_();
          break;
        case OPEN_CURLY:
          return this.parseBlock_();
        case SEMI_COLON:
          return this.parseEmptyStatement_();
        case TRY:
          return this.parseTryStatement_();
        case WITH:
          return this.parseWithStatement_();
      }
      return this.parseFallThroughStatement_(allowScriptItem);
    },
    parseFunctionDeclaration_: function() {
      return this.parseFunction_(FunctionDeclaration);
    },
    parseFunctionExpression_: function() {
      return this.parseFunction_(FunctionExpression);
    },
    parseAsyncFunctionDeclaration_: function(asyncToken) {
      return this.parseAsyncFunction_(asyncToken, FunctionDeclaration);
    },
    parseAsyncFunctionExpression_: function(asyncToken) {
      return this.parseAsyncFunction_(asyncToken, FunctionExpression);
    },
    parseAsyncFunction_: function(asyncToken, ctor) {
      var start = asyncToken.location.start;
      this.eat_(FUNCTION);
      return this.parseFunction2_(start, asyncToken, ctor);
    },
    parseFunction_: function(ctor) {
      var start = this.getTreeStartLocation_();
      this.eat_(FUNCTION);
      var functionKind = null;
      if (parseOptions.generators && this.peek_(STAR))
        functionKind = this.eat_(STAR);
      return this.parseFunction2_(start, functionKind, ctor);
    },
    parseFunction2_: function(start, functionKind, ctor) {
      var name = null;
      var annotations = [];
      if (ctor === FunctionDeclaration || this.peekBindingIdentifier_(this.peekType_())) {
        name = this.parseBindingIdentifier_();
        annotations = this.popAnnotations_();
      }
      this.eat_(OPEN_PAREN);
      var parameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var functionBody = this.parseFunctionBody_(functionKind, parameterList);
      return new ctor(this.getTreeLocation_(start), name, functionKind, parameterList, typeAnnotation, annotations, functionBody);
    },
    peekRest_: function(type) {
      return type === DOT_DOT_DOT && parseOptions.restParameters;
    },
    parseFormalParameterList_: function() {
      var start = this.getTreeStartLocation_();
      var formals = [];
      this.pushAnnotations_();
      var type = this.peekType_();
      if (this.peekRest_(type)) {
        formals.push(this.parseFormalRestParameter_());
      } else {
        if (this.peekFormalParameter_(this.peekType_()))
          formals.push(this.parseFormalParameter_());
        while (this.eatIf_(COMMA)) {
          this.pushAnnotations_();
          if (this.peekRest_(this.peekType_())) {
            formals.push(this.parseFormalRestParameter_());
            break;
          }
          formals.push(this.parseFormalParameter_());
        }
      }
      return new FormalParameterList(this.getTreeLocation_(start), formals);
    },
    peekFormalParameter_: function(type) {
      return this.peekBindingElement_(type);
    },
    parseFormalParameter_: function() {
      var initializerAllowed = arguments[0];
      var start = this.getTreeStartLocation_();
      var binding = this.parseBindingElementBinding_();
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var initializer = this.parseBindingElementInitializer_(initializerAllowed);
      return new FormalParameter(this.getTreeLocation_(start), new BindingElement(this.getTreeLocation_(start), binding, initializer), typeAnnotation, this.popAnnotations_());
    },
    parseFormalRestParameter_: function() {
      var start = this.getTreeStartLocation_();
      var restParameter = this.parseRestParameter_();
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      return new FormalParameter(this.getTreeLocation_(start), restParameter, typeAnnotation, this.popAnnotations_());
    },
    parseRestParameter_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var id = this.parseBindingIdentifier_();
      return new RestParameter(this.getTreeLocation_(start), id);
    },
    parseFunctionBody_: function(functionKind, params) {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var allowYield = this.allowYield_;
      var allowAwait = this.allowAwait_;
      var strictMode = this.strictMode_;
      this.allowYield_ = functionKind && functionKind.type === STAR;
      this.allowAwait_ = functionKind && functionKind.type === IDENTIFIER && functionKind.value === ASYNC;
      var result = this.parseStatementList_(!strictMode);
      if (!strictMode && this.strictMode_ && params)
        StrictParams.visit(params, this.errorReporter_);
      this.strictMode_ = strictMode;
      this.allowYield_ = allowYield;
      this.allowAwait_ = allowAwait;
      this.eat_(CLOSE_CURLY);
      return new FunctionBody(this.getTreeLocation_(start), result);
    },
    parseStatements: function() {
      return this.parseStatementList_(false);
    },
    parseStatementList_: function(checkUseStrictDirective) {
      var result = [];
      var type;
      while ((type = this.peekType_()) !== CLOSE_CURLY && type !== END_OF_FILE) {
        var statement = this.parseStatement_(type, false, false);
        if (checkUseStrictDirective) {
          if (!statement.isDirectivePrologue()) {
            checkUseStrictDirective = false;
          } else if (statement.isUseStrictDirective()) {
            this.strictMode_ = true;
            checkUseStrictDirective = false;
          }
        }
        result.push(statement);
      }
      return result;
    },
    parseSpreadExpression_: function() {
      if (!parseOptions.spread)
        return this.parseUnexpectedToken_(DOT_DOT_DOT);
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var operand = this.parseAssignmentExpression();
      return new SpreadExpression(this.getTreeLocation_(start), operand);
    },
    parseBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var result = this.parseStatementList_(false);
      this.eat_(CLOSE_CURLY);
      return new Block(this.getTreeLocation_(start), result);
    },
    parseVariableStatement_: function() {
      var start = this.getTreeStartLocation_();
      var declarations = this.parseVariableDeclarationList_();
      this.checkInitializers_(declarations);
      this.eatPossibleImplicitSemiColon_();
      return new VariableStatement(this.getTreeLocation_(start), declarations);
    },
    parseVariableDeclarationList_: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0] : Expression.NORMAL;
      var initializer = arguments[1] !== (void 0) ? arguments[1] : DestructuringInitializer.REQUIRED;
      var type = this.peekType_();
      switch (type) {
        case CONST:
        case LET:
          if (!parseOptions.blockBinding)
            debugger;
        case VAR:
          this.nextToken_();
          break;
        default:
          throw Error('unreachable');
      }
      var start = this.getTreeStartLocation_();
      var declarations = [];
      declarations.push(this.parseVariableDeclaration_(type, expressionIn, initializer));
      while (this.eatIf_(COMMA)) {
        declarations.push(this.parseVariableDeclaration_(type, expressionIn, initializer));
      }
      return new VariableDeclarationList(this.getTreeLocation_(start), type, declarations);
    },
    parseVariableDeclaration_: function(binding, expressionIn) {
      var initializer = arguments[2] !== (void 0) ? arguments[2] : DestructuringInitializer.REQUIRED;
      var initRequired = initializer !== DestructuringInitializer.OPTIONAL;
      var start = this.getTreeStartLocation_();
      var lvalue;
      var typeAnnotation;
      if (this.peekPattern_(this.peekType_())) {
        lvalue = this.parseBindingPattern_();
        typeAnnotation = null;
      } else {
        lvalue = this.parseBindingIdentifier_();
        typeAnnotation = this.parseTypeAnnotationOpt_();
      }
      var initializer = null;
      if (this.peek_(EQUAL))
        initializer = this.parseInitializer_(expressionIn);
      else if (lvalue.isPattern() && initRequired)
        this.reportError_('destructuring must have an initializer');
      return new VariableDeclaration(this.getTreeLocation_(start), lvalue, typeAnnotation, initializer);
    },
    parseInitializer_: function(expressionIn) {
      this.eat_(EQUAL);
      return this.parseAssignmentExpression(expressionIn);
    },
    parseEmptyStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(SEMI_COLON);
      return new EmptyStatement(this.getTreeLocation_(start));
    },
    parseFallThroughStatement_: function(allowScriptItem) {
      var start = this.getTreeStartLocation_();
      var expression;
      if (parseOptions.asyncFunctions && this.peekPredefinedString_(ASYNC) && this.peek_(FUNCTION, 1)) {
        var asyncToken = this.eatId_();
        var functionToken = this.peekTokenNoLineTerminator_();
        if (functionToken !== null)
          return this.parseAsyncFunctionDeclaration_(asyncToken);
        expression = new IdentifierExpression(this.getTreeLocation_(start), asyncToken);
      } else {
        expression = this.parseExpression();
      }
      if (expression.type === IDENTIFIER_EXPRESSION) {
        var nameToken = expression.identifierToken;
        if (this.eatIf_(COLON)) {
          var statement = this.parseStatement();
          return new LabelledStatement(this.getTreeLocation_(start), nameToken, statement);
        }
        if (allowScriptItem && nameToken.value === MODULE && parseOptions.modules) {
          var token = this.peekTokenNoLineTerminator_();
          if (token !== null && token.type === IDENTIFIER) {
            var name = this.eatId_();
            this.eatId_(FROM);
            var moduleSpecifier = this.parseModuleSpecifier_();
            this.eatPossibleImplicitSemiColon_();
            return new ModuleDeclaration(this.getTreeLocation_(start), name, moduleSpecifier);
          }
        }
      }
      this.eatPossibleImplicitSemiColon_();
      return new ExpressionStatement(this.getTreeLocation_(start), expression);
    },
    parseIfStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(IF);
      this.eat_(OPEN_PAREN);
      var condition = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var ifClause = this.parseStatement();
      var elseClause = null;
      if (this.eatIf_(ELSE)) {
        elseClause = this.parseStatement();
      }
      return new IfStatement(this.getTreeLocation_(start), condition, ifClause, elseClause);
    },
    parseDoWhileStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DO);
      var body = this.parseStatement();
      this.eat_(WHILE);
      this.eat_(OPEN_PAREN);
      var condition = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      this.eatPossibleImplicitSemiColon_();
      return new DoWhileStatement(this.getTreeLocation_(start), body, condition);
    },
    parseWhileStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(WHILE);
      this.eat_(OPEN_PAREN);
      var condition = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new WhileStatement(this.getTreeLocation_(start), condition, body);
    },
    parseForStatement_: function() {
      var $__68 = this;
      var start = this.getTreeStartLocation_();
      this.eat_(FOR);
      this.eat_(OPEN_PAREN);
      var validate = (function(variables, kind) {
        if (variables.declarations.length > 1) {
          $__68.reportError_(kind + ' statement may not have more than one variable declaration');
        }
        var declaration = variables.declarations[0];
        if (declaration.lvalue.isPattern() && declaration.initializer) {
          $__68.reportError_(declaration.initializer.location, ("initializer is not allowed in " + kind + " loop with pattern"));
        }
      });
      var type = this.peekType_();
      if (this.peekVariableDeclarationList_(type)) {
        var variables = this.parseVariableDeclarationList_(Expression.NO_IN, DestructuringInitializer.OPTIONAL);
        type = this.peekType_();
        if (type === IN) {
          validate(variables, 'for-in');
          var declaration = variables.declarations[0];
          if (parseOptions.blockBinding && (variables.declarationType == LET || variables.declarationType == CONST)) {
            if (declaration.initializer != null) {
              this.reportError_('let/const in for-in statement may not have initializer');
            }
          }
          return this.parseForInStatement_(start, variables);
        } else if (this.peekOf_(type)) {
          validate(variables, 'for-of');
          var declaration = variables.declarations[0];
          if (declaration.initializer != null) {
            this.reportError_('for-of statement may not have initializer');
          }
          return this.parseForOfStatement_(start, variables);
        } else {
          this.checkInitializers_(variables);
          return this.parseForStatement2_(start, variables);
        }
      }
      if (type === SEMI_COLON) {
        return this.parseForStatement2_(start, null);
      }
      var initializer = this.parseExpression(Expression.NO_IN);
      type = this.peekType_();
      if (initializer.isLeftHandSideExpression() && (type === IN || this.peekOf_(type))) {
        initializer = this.transformLeftHandSideExpression_(initializer);
        if (this.peekOf_(type))
          return this.parseForOfStatement_(start, initializer);
        return this.parseForInStatement_(start, initializer);
      }
      return this.parseForStatement2_(start, initializer);
    },
    peekOf_: function(type) {
      return type === IDENTIFIER && parseOptions.forOf && this.peekToken_().value === OF;
    },
    parseForOfStatement_: function(start, initializer) {
      this.eatId_();
      var collection = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new ForOfStatement(this.getTreeLocation_(start), initializer, collection, body);
    },
    checkInitializers_: function(variables) {
      if (parseOptions.blockBinding && variables.declarationType == CONST) {
        var type = variables.declarationType;
        for (var i = 0; i < variables.declarations.length; i++) {
          if (!this.checkInitializer_(type, variables.declarations[i])) {
            break;
          }
        }
      }
    },
    checkInitializer_: function(type, declaration) {
      if (parseOptions.blockBinding && type == CONST && declaration.initializer == null) {
        this.reportError_('const variables must have an initializer');
        return false;
      }
      return true;
    },
    peekVariableDeclarationList_: function(type) {
      switch (type) {
        case VAR:
          return true;
        case CONST:
        case LET:
          return parseOptions.blockBinding;
        default:
          return false;
      }
    },
    parseForStatement2_: function(start, initializer) {
      this.eat_(SEMI_COLON);
      var condition = null;
      if (!this.peek_(SEMI_COLON)) {
        condition = this.parseExpression();
      }
      this.eat_(SEMI_COLON);
      var increment = null;
      if (!this.peek_(CLOSE_PAREN)) {
        increment = this.parseExpression();
      }
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new ForStatement(this.getTreeLocation_(start), initializer, condition, increment, body);
    },
    parseForInStatement_: function(start, initializer) {
      this.eat_(IN);
      var collection = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new ForInStatement(this.getTreeLocation_(start), initializer, collection, body);
    },
    parseContinueStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(CONTINUE);
      var name = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        name = this.eatIdOpt_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ContinueStatement(this.getTreeLocation_(start), name);
    },
    parseBreakStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(BREAK);
      var name = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        name = this.eatIdOpt_();
      }
      this.eatPossibleImplicitSemiColon_();
      return new BreakStatement(this.getTreeLocation_(start), name);
    },
    parseReturnStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(RETURN);
      var expression = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        expression = this.parseExpression();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ReturnStatement(this.getTreeLocation_(start), expression);
    },
    parseYieldExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(YIELD);
      var expression = null;
      var isYieldFor = false;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        isYieldFor = this.eatIf_(STAR);
        expression = this.parseAssignmentExpression();
      }
      return new YieldExpression(this.getTreeLocation_(start), expression, isYieldFor);
    },
    parseWithStatement_: function() {
      if (this.strictMode_)
        this.reportError_('Strict mode code may not include a with statement');
      var start = this.getTreeStartLocation_();
      this.eat_(WITH);
      this.eat_(OPEN_PAREN);
      var expression = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      var body = this.parseStatement();
      return new WithStatement(this.getTreeLocation_(start), expression, body);
    },
    parseSwitchStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(SWITCH);
      this.eat_(OPEN_PAREN);
      var expression = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      this.eat_(OPEN_CURLY);
      var caseClauses = this.parseCaseClauses_();
      this.eat_(CLOSE_CURLY);
      return new SwitchStatement(this.getTreeLocation_(start), expression, caseClauses);
    },
    parseCaseClauses_: function() {
      var foundDefaultClause = false;
      var result = [];
      while (true) {
        var start = this.getTreeStartLocation_();
        switch (this.peekType_()) {
          case CASE:
            this.nextToken_();
            var expression = this.parseExpression();
            this.eat_(COLON);
            var statements = this.parseCaseStatementsOpt_();
            result.push(new CaseClause(this.getTreeLocation_(start), expression, statements));
            break;
          case DEFAULT:
            if (foundDefaultClause) {
              this.reportError_('Switch statements may have at most one default clause');
            } else {
              foundDefaultClause = true;
            }
            this.nextToken_();
            this.eat_(COLON);
            result.push(new DefaultClause(this.getTreeLocation_(start), this.parseCaseStatementsOpt_()));
            break;
          default:
            return result;
        }
      }
    },
    parseCaseStatementsOpt_: function() {
      var result = [];
      var type;
      while (true) {
        switch (type = this.peekType_()) {
          case CASE:
          case DEFAULT:
          case CLOSE_CURLY:
          case END_OF_FILE:
            return result;
        }
        result.push(this.parseStatement_(type, false, false));
      }
    },
    parseThrowStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(THROW);
      var value = null;
      if (!this.peekImplicitSemiColon_(this.peekType_())) {
        value = this.parseExpression();
      }
      this.eatPossibleImplicitSemiColon_();
      return new ThrowStatement(this.getTreeLocation_(start), value);
    },
    parseTryStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(TRY);
      var body = this.parseBlock_();
      var catchBlock = null;
      if (this.peek_(CATCH)) {
        catchBlock = this.parseCatch_();
      }
      var finallyBlock = null;
      if (this.peek_(FINALLY)) {
        finallyBlock = this.parseFinallyBlock_();
      }
      if (catchBlock == null && finallyBlock == null) {
        this.reportError_("'catch' or 'finally' expected.");
      }
      return new TryStatement(this.getTreeLocation_(start), body, catchBlock, finallyBlock);
    },
    parseCatch_: function() {
      var start = this.getTreeStartLocation_();
      var catchBlock;
      this.eat_(CATCH);
      this.eat_(OPEN_PAREN);
      var binding;
      if (this.peekPattern_(this.peekType_()))
        binding = this.parseBindingPattern_();
      else
        binding = this.parseBindingIdentifier_();
      this.eat_(CLOSE_PAREN);
      var catchBody = this.parseBlock_();
      catchBlock = new Catch(this.getTreeLocation_(start), binding, catchBody);
      return catchBlock;
    },
    parseFinallyBlock_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(FINALLY);
      var finallyBlock = this.parseBlock_();
      return new Finally(this.getTreeLocation_(start), finallyBlock);
    },
    parseDebuggerStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DEBUGGER);
      this.eatPossibleImplicitSemiColon_();
      return new DebuggerStatement(this.getTreeLocation_(start));
    },
    parsePrimaryExpression_: function() {
      switch (this.peekType_()) {
        case CLASS:
          return parseOptions.classes ? this.parseClassExpression_() : this.parseSyntaxError_('Unexpected reserved word');
        case THIS:
          return this.parseThisExpression_();
        case IDENTIFIER:
          var identifier = this.parseIdentifierExpression_();
          if (parseOptions.asyncFunctions && identifier.identifierToken.value === ASYNC) {
            var token = this.peekTokenNoLineTerminator_();
            if (token && token.type === FUNCTION) {
              var asyncToken = identifier.identifierToken;
              return this.parseAsyncFunctionExpression_(asyncToken);
            }
          }
          return identifier;
        case NUMBER:
        case STRING:
        case TRUE:
        case FALSE:
        case NULL:
          return this.parseLiteralExpression_();
        case OPEN_SQUARE:
          return this.parseArrayLiteral_();
        case OPEN_CURLY:
          return this.parseObjectLiteral_();
        case OPEN_PAREN:
          return this.parsePrimaryExpressionStartingWithParen_();
        case SLASH:
        case SLASH_EQUAL:
          return this.parseRegularExpressionLiteral_();
        case NO_SUBSTITUTION_TEMPLATE:
        case TEMPLATE_HEAD:
          return this.parseTemplateLiteral_(null);
        case IMPLEMENTS:
        case INTERFACE:
        case PACKAGE:
        case PRIVATE:
        case PROTECTED:
        case PUBLIC:
        case STATIC:
        case YIELD:
          if (!this.strictMode_)
            return this.parseIdentifierExpression_();
          this.reportReservedIdentifier_(this.nextToken_());
        case END_OF_FILE:
          return this.parseSyntaxError_('Unexpected end of input');
        default:
          return this.parseUnexpectedToken_(this.peekToken_());
      }
    },
    parseSuperExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(SUPER);
      return new SuperExpression(this.getTreeLocation_(start));
    },
    parseThisExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(THIS);
      return new ThisExpression(this.getTreeLocation_(start));
    },
    peekBindingIdentifier_: function(type) {
      return this.peekId_(type);
    },
    parseBindingIdentifier_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new BindingIdentifier(this.getTreeLocation_(start), identifier);
    },
    parseIdentifierExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatId_();
      return new IdentifierExpression(this.getTreeLocation_(start), identifier);
    },
    parseIdentifierNameExpression_: function() {
      var start = this.getTreeStartLocation_();
      var identifier = this.eatIdName_();
      return new IdentifierExpression(this.getTreeLocation_(start), identifier);
    },
    parseLiteralExpression_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextLiteralToken_();
      return new LiteralExpression(this.getTreeLocation_(start), literal);
    },
    nextLiteralToken_: function() {
      return this.nextToken_();
    },
    parseRegularExpressionLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var literal = this.nextRegularExpressionLiteralToken_();
      return new LiteralExpression(this.getTreeLocation_(start), literal);
    },
    peekSpread_: function(type) {
      return type === DOT_DOT_DOT && parseOptions.spread;
    },
    parseArrayLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var expression;
      var elements = [];
      this.eat_(OPEN_SQUARE);
      var type = this.peekType_();
      if (type === FOR && parseOptions.arrayComprehension)
        return this.parseArrayComprehension_(start);
      while (true) {
        type = this.peekType_();
        if (type === COMMA) {
          expression = null;
        } else if (this.peekSpread_(type)) {
          expression = this.parseSpreadExpression_();
        } else if (this.peekAssignmentExpression_(type)) {
          expression = this.parseAssignmentExpression();
        } else {
          break;
        }
        elements.push(expression);
        type = this.peekType_();
        if (type !== CLOSE_SQUARE)
          this.eat_(COMMA);
      }
      this.eat_(CLOSE_SQUARE);
      return new ArrayLiteralExpression(this.getTreeLocation_(start), elements);
    },
    parseArrayComprehension_: function(start) {
      var list = this.parseComprehensionList_();
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_SQUARE);
      return new ArrayComprehension(this.getTreeLocation_(start), list, expression);
    },
    parseComprehensionList_: function() {
      var list = [this.parseComprehensionFor_()];
      while (true) {
        var type = this.peekType_();
        switch (type) {
          case FOR:
            list.push(this.parseComprehensionFor_());
            break;
          case IF:
            list.push(this.parseComprehensionIf_());
            break;
          default:
            return list;
        }
      }
    },
    parseComprehensionFor_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(FOR);
      this.eat_(OPEN_PAREN);
      var left = this.parseForBinding_();
      this.eatId_(OF);
      var iterator = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      return new ComprehensionFor(this.getTreeLocation_(start), left, iterator);
    },
    parseComprehensionIf_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(IF);
      this.eat_(OPEN_PAREN);
      var expression = this.parseExpression();
      this.eat_(CLOSE_PAREN);
      return new ComprehensionIf(this.getTreeLocation_(start), expression);
    },
    parseObjectLiteral_: function() {
      var start = this.getTreeStartLocation_();
      var result = [];
      this.eat_(OPEN_CURLY);
      while (this.peekPropertyDefinition_(this.peekType_())) {
        var propertyDefinition = this.parsePropertyDefinition();
        result.push(propertyDefinition);
        if (!this.eatIf_(COMMA))
          break;
      }
      this.eat_(CLOSE_CURLY);
      return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
    },
    parsePropertyDefinition: function() {
      var start = this.getTreeStartLocation_();
      var functionKind = null;
      var isStatic = false;
      if (parseOptions.generators && parseOptions.propertyMethods && this.peek_(STAR)) {
        return this.parseGeneratorMethod_(start, isStatic, []);
      }
      var token = this.peekToken_();
      var name = this.parsePropertyName_();
      if (parseOptions.propertyMethods && this.peek_(OPEN_PAREN))
        return this.parseMethod_(start, isStatic, functionKind, name, []);
      if (this.eatIf_(COLON)) {
        var value = this.parseAssignmentExpression();
        return new PropertyNameAssignment(this.getTreeLocation_(start), name, value);
      }
      var type = this.peekType_();
      if (name.type === LITERAL_PROPERTY_NAME) {
        var nameLiteral = name.literalToken;
        if (nameLiteral.value === GET && this.peekPropertyName_(type)) {
          return this.parseGetAccessor_(start, isStatic, []);
        }
        if (nameLiteral.value === SET && this.peekPropertyName_(type)) {
          return this.parseSetAccessor_(start, isStatic, []);
        }
        if (parseOptions.asyncFunctions && nameLiteral.value === ASYNC && this.peekPropertyName_(type)) {
          var async = nameLiteral;
          var name = this.parsePropertyName_();
          return this.parseMethod_(start, isStatic, async, name, []);
        }
        if (parseOptions.propertyNameShorthand && nameLiteral.type === IDENTIFIER || !this.strictMode_ && nameLiteral.type === YIELD) {
          if (this.peek_(EQUAL)) {
            token = this.nextToken_();
            var expr = this.parseAssignmentExpression();
            return this.coverInitialisedName_ = new CoverInitialisedName(this.getTreeLocation_(start), nameLiteral, token, expr);
          }
          if (nameLiteral.type === YIELD)
            nameLiteral = new IdentifierToken(nameLiteral.location, YIELD);
          return new PropertyNameShorthand(this.getTreeLocation_(start), nameLiteral);
        }
        if (this.strictMode_ && nameLiteral.isStrictKeyword())
          this.reportReservedIdentifier_(nameLiteral);
      }
      if (name.type === COMPUTED_PROPERTY_NAME)
        token = this.peekToken_();
      return this.parseUnexpectedToken_(token);
    },
    parseClassElement_: function() {
      var start = this.getTreeStartLocation_();
      var annotations = this.parseAnnotations_();
      var type = this.peekType_();
      var isStatic = false,
          functionKind = null;
      switch (type) {
        case STATIC:
          var staticToken = this.nextToken_();
          type = this.peekType_();
          switch (type) {
            case OPEN_PAREN:
              var name = new LiteralPropertyName(start, staticToken);
              return this.parseMethod_(start, isStatic, functionKind, name, annotations);
            default:
              isStatic = true;
              if (type === STAR && parseOptions.generators)
                return this.parseGeneratorMethod_(start, true, annotations);
              return this.parseGetSetOrMethod_(start, isStatic, annotations);
          }
          break;
        case STAR:
          return this.parseGeneratorMethod_(start, isStatic, annotations);
        default:
          return this.parseGetSetOrMethod_(start, isStatic, annotations);
      }
    },
    parseGeneratorMethod_: function(start, isStatic, annotations) {
      var functionKind = this.eat_(STAR);
      var name = this.parsePropertyName_();
      return this.parseMethod_(start, isStatic, functionKind, name, annotations);
    },
    parseMethod_: function(start, isStatic, functionKind, name, annotations) {
      this.eat_(OPEN_PAREN);
      var parameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var functionBody = this.parseFunctionBody_(functionKind, parameterList);
      return new PropertyMethodAssignment(this.getTreeLocation_(start), isStatic, functionKind, name, parameterList, typeAnnotation, annotations, functionBody);
    },
    parseGetSetOrMethod_: function(start, isStatic, annotations) {
      var functionKind = null;
      var name = this.parsePropertyName_();
      var type = this.peekType_();
      if (name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === GET && this.peekPropertyName_(type)) {
        return this.parseGetAccessor_(start, isStatic, annotations);
      }
      if (name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === SET && this.peekPropertyName_(type)) {
        return this.parseSetAccessor_(start, isStatic, annotations);
      }
      if (parseOptions.asyncFunctions && name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === ASYNC && this.peekPropertyName_(type)) {
        var async = name.literalToken;
        var name = this.parsePropertyName_();
        return this.parseMethod_(start, isStatic, async, name, annotations);
      }
      return this.parseMethod_(start, isStatic, functionKind, name, annotations);
    },
    parseGetAccessor_: function(start, isStatic, annotations) {
      var functionKind = null;
      var name = this.parsePropertyName_();
      this.eat_(OPEN_PAREN);
      this.eat_(CLOSE_PAREN);
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var body = this.parseFunctionBody_(functionKind, null);
      return new GetAccessor(this.getTreeLocation_(start), isStatic, name, typeAnnotation, annotations, body);
    },
    parseSetAccessor_: function(start, isStatic, annotations) {
      var functionKind = null;
      var name = this.parsePropertyName_();
      this.eat_(OPEN_PAREN);
      var parameterList = this.parsePropertySetParameterList_();
      this.eat_(CLOSE_PAREN);
      var body = this.parseFunctionBody_(functionKind, parameterList);
      return new SetAccessor(this.getTreeLocation_(start), isStatic, name, parameterList, annotations, body);
    },
    peekPropertyDefinition_: function(type) {
      return this.peekPropertyName_(type) || type == STAR && parseOptions.propertyMethods && parseOptions.generators;
    },
    peekPropertyName_: function(type) {
      switch (type) {
        case IDENTIFIER:
        case STRING:
        case NUMBER:
          return true;
        case OPEN_SQUARE:
          return parseOptions.computedPropertyNames;
        default:
          return this.peekToken_().isKeyword();
      }
    },
    peekPredefinedString_: function(string) {
      var token = this.peekToken_();
      return token.type === IDENTIFIER && token.value === string;
    },
    parsePropertySetParameterList_: function() {
      var start = this.getTreeStartLocation_();
      var binding;
      this.pushAnnotations_();
      if (this.peekPattern_(this.peekType_()))
        binding = this.parseBindingPattern_();
      else
        binding = this.parseBindingIdentifier_();
      var typeAnnotation = this.parseTypeAnnotationOpt_();
      var parameter = new FormalParameter(this.getTreeLocation_(start), new BindingElement(this.getTreeLocation_(start), binding, null), typeAnnotation, this.popAnnotations_());
      return new FormalParameterList(parameter.location, [parameter]);
    },
    parsePrimaryExpressionStartingWithParen_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_PAREN);
      if (this.peek_(FOR) && parseOptions.generatorComprehension)
        return this.parseGeneratorComprehension_(start);
      return this.parseCoverFormals_(start);
    },
    parseSyntaxError_: function(message) {
      var start = this.getTreeStartLocation_();
      this.reportError_(message);
      var token = this.nextToken_();
      return new SyntaxErrorTree(this.getTreeLocation_(start), token, message);
    },
    parseUnexpectedToken_: function(name) {
      return this.parseSyntaxError_(("Unexpected token " + name));
    },
    peekExpression_: function(type) {
      switch (type) {
        case NO_SUBSTITUTION_TEMPLATE:
        case TEMPLATE_HEAD:
          return parseOptions.templateLiterals;
        case BANG:
        case CLASS:
        case DELETE:
        case FALSE:
        case FUNCTION:
        case IDENTIFIER:
        case MINUS:
        case MINUS_MINUS:
        case NEW:
        case NULL:
        case NUMBER:
        case OPEN_CURLY:
        case OPEN_PAREN:
        case OPEN_SQUARE:
        case PLUS:
        case PLUS_PLUS:
        case SLASH:
        case SLASH_EQUAL:
        case STRING:
        case SUPER:
        case THIS:
        case TILDE:
        case TRUE:
        case TYPEOF:
        case VOID:
        case YIELD:
          return true;
        default:
          return false;
      }
    },
    parseExpression: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0] : Expression.IN;
      var start = this.getTreeStartLocation_();
      var result = this.parseAssignmentExpression(expressionIn);
      if (this.peek_(COMMA)) {
        var exprs = [result];
        while (this.eatIf_(COMMA)) {
          exprs.push(this.parseAssignmentExpression(expressionIn));
        }
        return new CommaExpression(this.getTreeLocation_(start), exprs);
      }
      return result;
    },
    peekAssignmentExpression_: function(type) {
      return this.peekExpression_(type);
    },
    parseAssignmentExpression: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0] : Expression.NORMAL;
      var allowCoverGrammar = arguments[1];
      if (this.allowYield_ && this.peek_(YIELD))
        return this.parseYieldExpression_();
      var start = this.getTreeStartLocation_();
      var left = this.parseConditional_(expressionIn);
      var type = this.peekType_();
      if (type === ARROW && (left.type === COVER_FORMALS || left.type === IDENTIFIER_EXPRESSION)) {
        return this.parseArrowFunction_(start, left);
      }
      if (this.peekAssignmentOperator_(type)) {
        if (type === EQUAL)
          left = this.transformLeftHandSideExpression_(left);
        else
          left = this.toParenExpression_(left);
        if (!allowCoverGrammar)
          this.ensureAssignmenExpression_();
        if (!left.isLeftHandSideExpression() && !left.isPattern()) {
          this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
        }
        var operator = this.nextToken_();
        var right = this.parseAssignmentExpression(expressionIn);
        return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      left = this.toParenExpression_(left);
      if (!allowCoverGrammar)
        this.ensureAssignmenExpression_();
      return left;
    },
    ensureAssignmenExpression_: function() {
      if (this.coverInitialisedName_) {
        var token = this.coverInitialisedName_.equalToken;
        this.reportError_(token.location, ("Unexpected token '" + token + "'"));
        this.coverInitialisedName_ = null;
      }
    },
    transformLeftHandSideExpression_: function(tree) {
      switch (tree.type) {
        case ARRAY_LITERAL_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
          var transformer = new AssignmentPatternTransformer();
          var transformedTree;
          try {
            transformedTree = transformer.transformAny(tree);
          } catch (ex) {
            if (!(ex instanceof AssignmentPatternTransformerError))
              throw ex;
          }
          if (transformedTree) {
            this.coverInitialisedName_ = null;
            return transformedTree;
          }
          break;
        case PAREN_EXPRESSION:
          var expression = this.transformLeftHandSideExpression_(tree.expression);
          if (expression !== tree.expression)
            return new ParenExpression(tree.location, expression);
      }
      return tree;
    },
    peekAssignmentOperator_: function(type) {
      return isAssignmentOperator(type);
    },
    parseConditional_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var condition = this.parseLogicalOR_(expressionIn);
      if (this.eatIf_(QUESTION)) {
        condition = this.toParenExpression_(condition);
        var left = this.parseAssignmentExpression();
        this.eat_(COLON);
        var right = this.parseAssignmentExpression(expressionIn);
        return new ConditionalExpression(this.getTreeLocation_(start), condition, left, right);
      }
      return condition;
    },
    newBinaryOperator_: function(start, left, operator, right) {
      left = this.toParenExpression_(left);
      right = this.toParenExpression_(right);
      return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
    },
    parseLogicalOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseLogicalAND_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(OR)) {
        var right = this.parseLogicalAND_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseLogicalAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseOR_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(AND)) {
        var right = this.parseBitwiseOR_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseBitwiseOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseXOR_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(BAR)) {
        var right = this.parseBitwiseXOR_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseBitwiseXOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseAND_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(CARET)) {
        var right = this.parseBitwiseAND_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseBitwiseAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseEquality_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(AMPERSAND)) {
        var right = this.parseEquality_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    parseEquality_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseRelational_(expressionIn);
      while (this.peekEqualityOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseRelational_(expressionIn);
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekEqualityOperator_: function(type) {
      switch (type) {
        case EQUAL_EQUAL:
        case NOT_EQUAL:
        case EQUAL_EQUAL_EQUAL:
        case NOT_EQUAL_EQUAL:
          return true;
      }
      return false;
    },
    parseRelational_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseShiftExpression_();
      while (this.peekRelationalOperator_(expressionIn)) {
        var operator = this.nextToken_();
        var right = this.parseShiftExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekRelationalOperator_: function(expressionIn) {
      switch (this.peekType_()) {
        case OPEN_ANGLE:
        case CLOSE_ANGLE:
        case GREATER_EQUAL:
        case LESS_EQUAL:
        case INSTANCEOF:
          return true;
        case IN:
          return expressionIn == Expression.NORMAL;
        default:
          return false;
      }
    },
    parseShiftExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseAdditiveExpression_();
      while (this.peekShiftOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseAdditiveExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekShiftOperator_: function(type) {
      switch (type) {
        case LEFT_SHIFT:
        case RIGHT_SHIFT:
        case UNSIGNED_RIGHT_SHIFT:
          return true;
        default:
          return false;
      }
    },
    parseAdditiveExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseMultiplicativeExpression_();
      while (this.peekAdditiveOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseMultiplicativeExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekAdditiveOperator_: function(type) {
      switch (type) {
        case PLUS:
        case MINUS:
          return true;
        default:
          return false;
      }
    },
    parseMultiplicativeExpression_: function() {
      var start = this.getTreeStartLocation_();
      var left = this.parseUnaryExpression_();
      while (this.peekMultiplicativeOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseUnaryExpression_();
        left = this.newBinaryOperator_(start, left, operator, right);
      }
      return left;
    },
    peekMultiplicativeOperator_: function(type) {
      switch (type) {
        case STAR:
        case SLASH:
        case PERCENT:
          return true;
        default:
          return false;
      }
    },
    parseUnaryExpression_: function() {
      var start = this.getTreeStartLocation_();
      if (this.allowAwait_ && this.peekPredefinedString_(AWAIT)) {
        this.eatId_();
        var operand = this.parseUnaryExpression_();
        operand = this.toParenExpression_(operand);
        return new AwaitExpression(this.getTreeLocation_(start), operand);
      }
      if (this.peekUnaryOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var operand = this.parseUnaryExpression_();
        operand = this.toParenExpression_(operand);
        return new UnaryExpression(this.getTreeLocation_(start), operator, operand);
      }
      return this.parsePostfixExpression_();
    },
    peekUnaryOperator_: function(type) {
      switch (type) {
        case DELETE:
        case VOID:
        case TYPEOF:
        case PLUS_PLUS:
        case MINUS_MINUS:
        case PLUS:
        case MINUS:
        case TILDE:
        case BANG:
          return true;
        default:
          return false;
      }
    },
    parsePostfixExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseLeftHandSideExpression_();
      while (this.peekPostfixOperator_(this.peekType_())) {
        operand = this.toParenExpression_(operand);
        var operator = this.nextToken_();
        operand = new PostfixExpression(this.getTreeLocation_(start), operand, operator);
      }
      return operand;
    },
    peekPostfixOperator_: function(type) {
      switch (type) {
        case PLUS_PLUS:
        case MINUS_MINUS:
          var token = this.peekTokenNoLineTerminator_();
          return token !== null;
      }
      return false;
    },
    parseLeftHandSideExpression_: function() {
      var start = this.getTreeStartLocation_();
      var operand = this.parseNewExpression_();
      if (!(operand instanceof NewExpression) || operand.args != null) {
        loop: while (true) {
          switch (this.peekType_()) {
            case OPEN_PAREN:
              operand = this.toParenExpression_(operand);
              operand = this.parseCallExpression_(start, operand);
              break;
            case OPEN_SQUARE:
              operand = this.toParenExpression_(operand);
              operand = this.parseMemberLookupExpression_(start, operand);
              break;
            case PERIOD:
              operand = this.toParenExpression_(operand);
              operand = this.parseMemberExpression_(start, operand);
              break;
            case NO_SUBSTITUTION_TEMPLATE:
            case TEMPLATE_HEAD:
              if (!parseOptions.templateLiterals)
                break loop;
              operand = this.toParenExpression_(operand);
              operand = this.parseTemplateLiteral_(operand);
              break;
            default:
              break loop;
          }
        }
      }
      return operand;
    },
    parseMemberExpressionNoNew_: function() {
      var start = this.getTreeStartLocation_();
      var operand;
      if (this.peekType_() === FUNCTION) {
        operand = this.parseFunctionExpression_();
      } else {
        operand = this.parsePrimaryExpression_();
      }
      loop: while (true) {
        switch (this.peekType_()) {
          case OPEN_SQUARE:
            operand = this.toParenExpression_(operand);
            operand = this.parseMemberLookupExpression_(start, operand);
            break;
          case PERIOD:
            operand = this.toParenExpression_(operand);
            operand = this.parseMemberExpression_(start, operand);
            break;
          case NO_SUBSTITUTION_TEMPLATE:
          case TEMPLATE_HEAD:
            if (!parseOptions.templateLiterals)
              break loop;
            operand = this.toParenExpression_(operand);
            operand = this.parseTemplateLiteral_(operand);
            break;
          default:
            break loop;
        }
      }
      return operand;
    },
    parseMemberExpression_: function(start, operand) {
      this.nextToken_();
      var name = this.eatIdName_();
      return new MemberExpression(this.getTreeLocation_(start), operand, name);
    },
    parseMemberLookupExpression_: function(start, operand) {
      this.nextToken_();
      var member = this.parseExpression();
      this.eat_(CLOSE_SQUARE);
      return new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
    },
    parseCallExpression_: function(start, operand) {
      var args = this.parseArguments_();
      return new CallExpression(this.getTreeLocation_(start), operand, args);
    },
    parseNewExpression_: function() {
      var operand;
      switch (this.peekType_()) {
        case NEW:
          var start = this.getTreeStartLocation_();
          this.eat_(NEW);
          if (this.peek_(SUPER))
            operand = this.parseSuperExpression_();
          else
            operand = this.toParenExpression_(this.parseNewExpression_());
          var args = null;
          if (this.peek_(OPEN_PAREN)) {
            args = this.parseArguments_();
          }
          return new NewExpression(this.getTreeLocation_(start), operand, args);
        case SUPER:
          operand = this.parseSuperExpression_();
          var type = this.peekType_();
          switch (type) {
            case OPEN_SQUARE:
              return this.parseMemberLookupExpression_(start, operand);
            case PERIOD:
              return this.parseMemberExpression_(start, operand);
            case OPEN_PAREN:
              return this.parseCallExpression_(start, operand);
            default:
              return this.parseUnexpectedToken_(type);
          }
          break;
        default:
          return this.parseMemberExpressionNoNew_();
      }
    },
    parseArguments_: function() {
      var start = this.getTreeStartLocation_();
      var args = [];
      this.eat_(OPEN_PAREN);
      if (!this.peek_(CLOSE_PAREN)) {
        args.push(this.parseArgument_());
        while (this.eatIf_(COMMA)) {
          args.push(this.parseArgument_());
        }
      }
      this.eat_(CLOSE_PAREN);
      return new ArgumentList(this.getTreeLocation_(start), args);
    },
    parseArgument_: function() {
      if (this.peekSpread_(this.peekType_()))
        return this.parseSpreadExpression_();
      return this.parseAssignmentExpression();
    },
    parseArrowFunction_: function(start, tree) {
      var formals;
      if (tree.type === IDENTIFIER_EXPRESSION) {
        var id = new BindingIdentifier(tree.location, tree.identifierToken);
        var formals = new FormalParameterList(this.getTreeLocation_(start), [new FormalParameter(id.location, new BindingElement(id.location, id, null), null, [])]);
      } else {
        formals = this.toFormalParameters_(tree);
      }
      this.eat_(ARROW);
      var body = this.parseConciseBody_();
      return new ArrowFunctionExpression(this.getTreeLocation_(start), formals, body);
    },
    parseCoverFormals_: function(start) {
      var expressions = [];
      if (!this.peek_(CLOSE_PAREN)) {
        do {
          var type = this.peekType_();
          if (this.peekRest_(type)) {
            expressions.push(this.parseRestParameter_());
            break;
          } else {
            expressions.push(this.parseAssignmentExpression(Expression.NORMAL, true));
          }
          if (this.eatIf_(COMMA))
            continue;
        } while (!this.peek_(CLOSE_PAREN) && !this.isAtEnd());
      }
      this.eat_(CLOSE_PAREN);
      return new CoverFormals(this.getTreeLocation_(start), expressions);
    },
    transformCoverFormals_: function(f, tree) {
      try {
        return f(tree);
      } catch (ex) {
        if (!(ex instanceof CoverFormalsTransformerError))
          throw ex;
        this.reportError_(ex.location, ex.message);
        return new SyntaxErrorTree(ex.location, null, ex.message);
      }
    },
    toParenExpression_: function(tree) {
      if (tree.type !== COVER_FORMALS)
        return tree;
      return this.transformCoverFormals_(toParenExpression, tree);
    },
    toFormalParameters_: function(tree) {
      if (tree.type !== COVER_FORMALS)
        return tree;
      var transformed = this.transformCoverFormals_(toFormalParameters, tree);
      this.coverInitialisedName_ = null;
      return transformed;
    },
    transformCoverFormalsToArrowFormals_: function(coverFormals) {
      var formals = null;
      try {
        formals = toFormalParameters(coverFormals);
      } catch (ex) {
        if (!(ex instanceof CoverFormalsTransformerError))
          throw ex;
      }
      return formals;
    },
    peekArrow_: function(type) {
      return type === ARROW && parseOptions.arrowFunctions;
    },
    parseConciseBody_: function() {
      if (this.peek_(OPEN_CURLY))
        return this.parseFunctionBody_();
      return this.parseAssignmentExpression();
    },
    parseGeneratorComprehension_: function(start) {
      var comprehensionList = this.parseComprehensionList_();
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_PAREN);
      return new GeneratorComprehension(this.getTreeLocation_(start), comprehensionList, expression);
    },
    parseForBinding_: function() {
      if (this.peekPattern_(this.peekType_()))
        return this.parseBindingPattern_();
      return this.parseBindingIdentifier_();
    },
    peekPattern_: function(type) {
      return parseOptions.destructuring && (this.peekObjectPattern_(type) || this.peekArrayPattern_(type));
    },
    peekArrayPattern_: function(type) {
      return type === OPEN_SQUARE;
    },
    peekObjectPattern_: function(type) {
      return type === OPEN_CURLY;
    },
    parseBindingPattern_: function() {
      if (this.peekArrayPattern_(this.peekType_()))
        return this.parseArrayBindingPattern_();
      return this.parseObjectBindingPattern_();
    },
    parseArrayBindingPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(OPEN_SQUARE);
      var type;
      while ((type = this.peekType_()) === COMMA || this.peekBindingElement_(type) || this.peekRest_(type)) {
        this.parseElisionOpt_(elements);
        if (this.peekRest_(this.peekType_())) {
          elements.push(this.parseBindingRestElement_());
          break;
        } else {
          elements.push(this.parseBindingElement_());
          if (this.peek_(COMMA) && !this.peek_(CLOSE_SQUARE, 1)) {
            this.nextToken_();
          }
        }
      }
      this.eat_(CLOSE_SQUARE);
      return new ArrayPattern(this.getTreeLocation_(start), elements);
    },
    parseBindingElementList_: function(elements) {
      this.parseElisionOpt_(elements);
      elements.push(this.parseBindingElement_());
      while (this.eatIf_(COMMA)) {
        this.parseElisionOpt_(elements);
        elements.push(this.parseBindingElement_());
      }
    },
    parseElisionOpt_: function(elements) {
      while (this.eatIf_(COMMA)) {
        elements.push(null);
      }
    },
    peekBindingElement_: function(type) {
      return this.peekBindingIdentifier_(type) || this.peekPattern_(type);
    },
    parseBindingElement_: function() {
      var initializer = arguments[0] !== (void 0) ? arguments[0] : Initializer.OPTIONAL;
      var start = this.getTreeStartLocation_();
      var binding = this.parseBindingElementBinding_();
      var initializer = this.parseBindingElementInitializer_(initializer);
      return new BindingElement(this.getTreeLocation_(start), binding, initializer);
    },
    parseBindingElementBinding_: function() {
      if (this.peekPattern_(this.peekType_()))
        return this.parseBindingPattern_();
      return this.parseBindingIdentifier_();
    },
    parseBindingElementInitializer_: function() {
      var initializer = arguments[0] !== (void 0) ? arguments[0] : Initializer.OPTIONAL;
      if (this.peek_(EQUAL) || initializer === Initializer.REQUIRED) {
        return this.parseInitializer_();
      }
      return null;
    },
    parseBindingRestElement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var identifier = this.parseBindingIdentifier_();
      return new SpreadPatternElement(this.getTreeLocation_(start), identifier);
    },
    parseObjectBindingPattern_: function() {
      var start = this.getTreeStartLocation_();
      var elements = [];
      this.eat_(OPEN_CURLY);
      while (this.peekBindingProperty_(this.peekType_())) {
        elements.push(this.parseBindingProperty_());
        if (!this.eatIf_(COMMA))
          break;
      }
      this.eat_(CLOSE_CURLY);
      return new ObjectPattern(this.getTreeLocation_(start), elements);
    },
    peekBindingProperty_: function(type) {
      return this.peekBindingIdentifier_(type) || this.peekPropertyName_(type);
    },
    parseBindingProperty_: function() {
      var start = this.getTreeStartLocation_();
      var name = this.parsePropertyName_();
      var requireColon = name.type !== LITERAL_PROPERTY_NAME || !name.literalToken.isStrictKeyword() && name.literalToken.type !== IDENTIFIER;
      if (requireColon || this.peek_(COLON)) {
        this.eat_(COLON);
        var binding = this.parseBindingElement_();
        return new ObjectPatternField(this.getTreeLocation_(start), name, binding);
      }
      var token = name.literalToken;
      if (this.strictMode_ && token.isStrictKeyword())
        this.reportReservedIdentifier_(token);
      var binding = new BindingIdentifier(name.location, token);
      var initializer = null;
      if (this.peek_(EQUAL))
        initializer = this.parseInitializer_();
      return new BindingElement(this.getTreeLocation_(start), binding, initializer);
    },
    parseTemplateLiteral_: function(operand) {
      if (!parseOptions.templateLiterals)
        return this.parseUnexpectedToken_('`');
      var start = operand ? operand.location.start : this.getTreeStartLocation_();
      var token = this.nextToken_();
      var elements = [new TemplateLiteralPortion(token.location, token)];
      if (token.type === NO_SUBSTITUTION_TEMPLATE) {
        return new TemplateLiteralExpression(this.getTreeLocation_(start), operand, elements);
      }
      var expression = this.parseExpression();
      elements.push(new TemplateSubstitution(expression.location, expression));
      while (expression.type !== SYNTAX_ERROR_TREE) {
        token = this.nextTemplateLiteralToken_();
        if (token.type === ERROR || token.type === END_OF_FILE)
          break;
        elements.push(new TemplateLiteralPortion(token.location, token));
        if (token.type === TEMPLATE_TAIL)
          break;
        expression = this.parseExpression();
        elements.push(new TemplateSubstitution(expression.location, expression));
      }
      return new TemplateLiteralExpression(this.getTreeLocation_(start), operand, elements);
    },
    parseTypeAnnotationOpt_: function() {
      if (parseOptions.types && this.eatOpt_(COLON)) {
        return this.parseType_();
      }
      return null;
    },
    parseType_: function() {
      var start = this.getTreeStartLocation_();
      var elementType;
      switch (this.peekType_()) {
        case IDENTIFIER:
          elementType = this.parseNamedOrPredefinedType_();
          break;
        case NEW:
          elementType = this.parseConstructorType_();
          break;
        case OPEN_CURLY:
          elementType = this.parseObjectType_();
          break;
        case OPEN_PAREN:
          elementType = this.parseFunctionType_();
          break;
        case VOID:
          var token = this.nextToken_();
          return new PredefinedType(this.getTreeLocation_(start), token);
        default:
          return this.parseUnexpectedToken_(this.peekToken_());
      }
      return this.parseArrayTypeSuffix_(start, elementType);
    },
    parseArrayTypeSuffix_: function(start, elementType) {
      return elementType;
    },
    parseConstructorType_: function() {
      throw 'NYI';
    },
    parseObjectType_: function() {
      throw 'NYI';
    },
    parseFunctionType_: function() {
      throw 'NYI';
    },
    parseNamedOrPredefinedType_: function() {
      var start = this.getTreeStartLocation_();
      switch (this.peekToken_().value) {
        case 'any':
        case 'number':
        case 'boolean':
        case 'string':
          var token = this.nextToken_();
          return new PredefinedType(this.getTreeLocation_(start), token);
        default:
          return this.parseTypeName_();
      }
    },
    parseTypeName_: function() {
      var start = this.getTreeStartLocation_();
      var typeName = new TypeName(this.getTreeLocation_(start), null, this.eatId_());
      while (this.eatIf_(PERIOD)) {
        var memberName = this.eatIdName_();
        typeName = new TypeName(this.getTreeLocation_(start), typeName, memberName);
      }
      return typeName;
    },
    parseAnnotatedDeclarations_: function(allowModuleItem, allowScriptItem) {
      this.pushAnnotations_();
      var declaration = this.parseStatement_(this.peekType_(), allowModuleItem, allowScriptItem);
      if (this.annotations_.length > 0)
        return this.parseSyntaxError_('Unsupported annotated expression');
      return declaration;
    },
    parseAnnotations_: function() {
      var annotations = [];
      while (this.eatIf_(AT)) {
        annotations.push(this.parseAnnotation_());
      }
      return annotations;
    },
    pushAnnotations_: function() {
      this.annotations_ = this.parseAnnotations_();
    },
    popAnnotations_: function() {
      var annotations = this.annotations_;
      this.annotations_ = [];
      return annotations;
    },
    parseAnnotation_: function() {
      var start = this.getTreeStartLocation_();
      var expression = this.parseMemberExpressionNoNew_();
      var args = null;
      if (this.peek_(OPEN_PAREN))
        args = this.parseArguments_();
      return new Annotation(this.getTreeLocation_(start), expression, args);
    },
    eatPossibleImplicitSemiColon_: function() {
      var token = this.peekTokenNoLineTerminator_();
      if (!token)
        return;
      switch (token.type) {
        case SEMI_COLON:
          this.nextToken_();
          return;
        case END_OF_FILE:
        case CLOSE_CURLY:
          return;
      }
      this.reportError_('Semi-colon expected');
    },
    peekImplicitSemiColon_: function() {
      switch (this.peekType_()) {
        case SEMI_COLON:
        case CLOSE_CURLY:
        case END_OF_FILE:
          return true;
      }
      var token = this.peekTokenNoLineTerminator_();
      return token === null;
    },
    eatOpt_: function(expectedTokenType) {
      if (this.peek_(expectedTokenType))
        return this.nextToken_();
      return null;
    },
    eatIdOpt_: function() {
      return this.peek_(IDENTIFIER) ? this.eatId_() : null;
    },
    eatId_: function() {
      var expected = arguments[0];
      var token = this.nextToken_();
      if (!token) {
        if (expected)
          this.reportError_(this.peekToken_(), ("expected '" + expected + "'"));
        return null;
      }
      if (token.type === IDENTIFIER) {
        if (expected && token.value !== expected)
          this.reportExpectedError_(token, expected);
        return token;
      }
      if (token.isStrictKeyword()) {
        if (this.strictMode_) {
          this.reportReservedIdentifier_(token);
        } else {
          return new IdentifierToken(token.location, token.type);
        }
      } else {
        this.reportExpectedError_(token, expected || 'identifier');
      }
      return token;
    },
    eatIdName_: function() {
      var t = this.nextToken_();
      if (t.type != IDENTIFIER) {
        if (!t.isKeyword()) {
          this.reportExpectedError_(t, 'identifier');
          return null;
        }
        return new IdentifierToken(t.location, t.type);
      }
      return t;
    },
    eat_: function(expectedTokenType) {
      var token = this.nextToken_();
      if (token.type != expectedTokenType) {
        this.reportExpectedError_(token, expectedTokenType);
        return null;
      }
      return token;
    },
    eatIf_: function(expectedTokenType) {
      if (this.peek_(expectedTokenType)) {
        this.nextToken_();
        return true;
      }
      return false;
    },
    reportExpectedError_: function(token, expected) {
      this.reportError_(token, "'" + expected + "' expected");
    },
    getTreeStartLocation_: function() {
      return this.peekToken_().location.start;
    },
    getTreeEndLocation_: function() {
      return this.scanner_.lastToken.location.end;
    },
    getTreeLocation_: function(start) {
      return new SourceRange(start, this.getTreeEndLocation_());
    },
    handleComment: function(range) {},
    nextToken_: function() {
      return this.scanner_.nextToken();
    },
    nextRegularExpressionLiteralToken_: function() {
      return this.scanner_.nextRegularExpressionLiteralToken();
    },
    nextTemplateLiteralToken_: function() {
      return this.scanner_.nextTemplateLiteralToken();
    },
    isAtEnd: function() {
      return this.scanner_.isAtEnd();
    },
    peek_: function(expectedType, opt_index) {
      return this.peekToken_(opt_index).type === expectedType;
    },
    peekType_: function() {
      return this.peekToken_().type;
    },
    peekToken_: function(opt_index) {
      return this.scanner_.peekToken(opt_index);
    },
    peekTokenNoLineTerminator_: function() {
      return this.scanner_.peekTokenNoLineTerminator();
    },
    reportError_: function() {
      for (var args = [],
          $__70 = 0; $__70 < arguments.length; $__70++)
        args[$__70] = arguments[$__70];
      if (args.length == 1) {
        this.errorReporter_.reportError(this.scanner_.getPosition(), args[0]);
      } else {
        var location = args[0];
        if (location instanceof Token) {
          location = location.location;
        }
        this.errorReporter_.reportError(location.start, args[1]);
      }
    },
    reportReservedIdentifier_: function(token) {
      this.reportError_(token, (token.type + " is a reserved identifier"));
    }
  }, {});
  return {get Parser() {
      return Parser;
    }};
});
System.register("traceur@0.0.43/src/util/uid", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/uid";
  var uidCounter = 0;
  function getUid() {
    return uidCounter++;
  }
  return {get getUid() {
      return getUid;
    }};
});
System.register("traceur@0.0.43/src/util/SourcePosition", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/SourcePosition";
  var SourcePosition = function SourcePosition(source, offset) {
    this.source = source;
    this.offset = offset;
    this.line_ = -1;
    this.column_ = -1;
  };
  ($traceurRuntime.createClass)(SourcePosition, {
    get line() {
      if (this.line_ === -1)
        this.line_ = this.source.lineNumberTable.getLine(this.offset);
      return this.line_;
    },
    get column() {
      if (this.column_ === -1)
        this.column_ = this.source.lineNumberTable.getColumn(this.offset);
      return this.column_;
    },
    toString: function() {
      var name = this.source ? this.source.name : '';
      return (name + ":" + (this.line + 1) + ":" + (this.column + 1));
    }
  }, {});
  return {get SourcePosition() {
      return SourcePosition;
    }};
});
System.register("traceur@0.0.43/src/syntax/LineNumberTable", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/LineNumberTable";
  var SourcePosition = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/SourcePosition")).SourcePosition;
  var SourceRange = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/SourceRange")).SourceRange;
  var isLineTerminator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Scanner")).isLineTerminator;
  var MAX_INT_REPRESENTATION = 9007199254740992;
  function computeLineStartOffsets(source) {
    var lineStartOffsets = [0];
    var k = 1;
    for (var index = 0; index < source.length; index++) {
      var code = source.charCodeAt(index);
      if (isLineTerminator(code)) {
        if (code === 13 && source.charCodeAt(index + 1) === 10) {
          index++;
        }
        lineStartOffsets[k++] = index + 1;
      }
    }
    lineStartOffsets[k++] = MAX_INT_REPRESENTATION;
    return lineStartOffsets;
  }
  var LineNumberTable = function LineNumberTable(sourceFile) {
    this.sourceFile_ = sourceFile;
    this.lineStartOffsets_ = null;
    this.lastLine_ = 0;
    this.lastOffset_ = -1;
  };
  ($traceurRuntime.createClass)(LineNumberTable, {
    ensureLineStartOffsets_: function() {
      if (!this.lineStartOffsets_) {
        this.lineStartOffsets_ = computeLineStartOffsets(this.sourceFile_.contents);
      }
    },
    getSourcePosition: function(offset) {
      return new SourcePosition(this.sourceFile_, offset);
    },
    getLine: function(offset) {
      if (offset === this.lastOffset_)
        return this.lastLine_;
      this.ensureLineStartOffsets_();
      if (offset < 0)
        return 0;
      var line;
      if (offset < this.lastOffset_) {
        for (var i = this.lastLine_; i >= 0; i--) {
          if (this.lineStartOffsets_[i] <= offset) {
            line = i;
            break;
          }
        }
      } else {
        for (var i = this.lastLine_; true; i++) {
          if (this.lineStartOffsets_[i] > offset) {
            line = i - 1;
            break;
          }
        }
      }
      this.lastLine_ = line;
      this.lastOffset_ = offset;
      return line;
    },
    offsetOfLine: function(line) {
      this.ensureLineStartOffsets_();
      return this.lineStartOffsets_[line];
    },
    getColumn: function(offset) {
      var line = this.getLine(offset);
      return offset - this.lineStartOffsets_[line];
    },
    getSourceRange: function(startOffset, endOffset) {
      return new SourceRange(this.getSourcePosition(startOffset), this.getSourcePosition(endOffset));
    }
  }, {});
  return {get LineNumberTable() {
      return LineNumberTable;
    }};
});
System.register("traceur@0.0.43/src/syntax/SourceFile", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/SourceFile";
  var LineNumberTable = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LineNumberTable")).LineNumberTable;
  var getUid = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/uid")).getUid;
  var SourceFile = function SourceFile(name, contents) {
    this.name = name;
    this.contents = contents;
    this.lineNumberTable = new LineNumberTable(this);
    this.uid = getUid();
  };
  ($traceurRuntime.createClass)(SourceFile, {}, {});
  return {get SourceFile() {
      return SourceFile;
    }};
});
System.register("traceur@0.0.43/src/util/ArrayMap", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/ArrayMap";
  var ArrayMap = function ArrayMap() {
    this.values_ = [];
    this.keys_ = [];
  };
  ($traceurRuntime.createClass)(ArrayMap, {
    has: function(key) {
      return this.keys_.indexOf(key) != -1;
    },
    get: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        return undefined;
      }
      return this.values_[index];
    },
    set: function(key, value) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        this.keys_.push(key);
        this.values_.push(value);
      } else {
        this.values_[index] = value;
      }
    },
    addAll: function(other) {
      var keys = other.keys();
      var values = other.values();
      for (var i = 0; i < keys.length; i++) {
        this.set(keys[i], values[i]);
      }
    },
    remove: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        return;
      }
      this.keys_.splice(index, 1);
      this.values_.splice(index, 1);
    },
    keys: function() {
      return this.keys_.concat();
    },
    values: function() {
      return this.values_.concat();
    }
  }, {});
  return {get ArrayMap() {
      return ArrayMap;
    }};
});
System.register("traceur@0.0.43/src/util/MutedErrorReporter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/MutedErrorReporter";
  var ErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ErrorReporter")).ErrorReporter;
  var MutedErrorReporter = function MutedErrorReporter() {
    $traceurRuntime.defaultSuperCall(this, $MutedErrorReporter.prototype, arguments);
  };
  var $MutedErrorReporter = MutedErrorReporter;
  ($traceurRuntime.createClass)(MutedErrorReporter, {reportMessageInternal: function(location, format, args) {}}, {}, ErrorReporter);
  return {get MutedErrorReporter() {
      return MutedErrorReporter;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/PlaceholderParser", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/PlaceholderParser";
  var ArrayMap = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ArrayMap")).ArrayMap;
  var $__85 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      ARGUMENT_LIST = $__85.ARGUMENT_LIST,
      BLOCK = $__85.BLOCK,
      EXPRESSION_STATEMENT = $__85.EXPRESSION_STATEMENT,
      IDENTIFIER_EXPRESSION = $__85.IDENTIFIER_EXPRESSION;
  var IdentifierToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/IdentifierToken")).IdentifierToken;
  var LiteralToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LiteralToken")).LiteralToken;
  var MutedErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/MutedErrorReporter")).MutedErrorReporter;
  var ParseTree = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTree")).ParseTree;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var Parser = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Parser")).Parser;
  var $__85 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      LiteralExpression = $__85.LiteralExpression,
      LiteralPropertyName = $__85.LiteralPropertyName,
      PropertyMethodAssignment = $__85.PropertyMethodAssignment,
      PropertyNameAssignment = $__85.PropertyNameAssignment,
      PropertyNameShorthand = $__85.PropertyNameShorthand;
  var SourceFile = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/SourceFile")).SourceFile;
  var IDENTIFIER = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).IDENTIFIER;
  var $__85 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArrayLiteralExpression = $__85.createArrayLiteralExpression,
      createBindingIdentifier = $__85.createBindingIdentifier,
      createBlock = $__85.createBlock,
      createBooleanLiteral = $__85.createBooleanLiteral,
      createCommaExpression = $__85.createCommaExpression,
      createExpressionStatement = $__85.createExpressionStatement,
      createFunctionBody = $__85.createFunctionBody,
      createGetAccessor = $__85.createGetAccessor,
      createIdentifierExpression = $__85.createIdentifierExpression,
      createIdentifierToken = $__85.createIdentifierToken,
      createMemberExpression = $__85.createMemberExpression,
      createNullLiteral = $__85.createNullLiteral,
      createNumberLiteral = $__85.createNumberLiteral,
      createParenExpression = $__85.createParenExpression,
      createSetAccessor = $__85.createSetAccessor,
      createStringLiteral = $__85.createStringLiteral,
      createVoid0 = $__85.createVoid0;
  var NOT_FOUND = {};
  var PREFIX = '$__placeholder__';
  var cache = new ArrayMap();
  function parseExpression(sourceLiterals) {
    for (var values = [],
        $__81 = 1; $__81 < arguments.length; $__81++)
      values[$__81 - 1] = arguments[$__81];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseExpression(sourceLiterals);
    }));
  }
  function parseStatement(sourceLiterals) {
    for (var values = [],
        $__82 = 1; $__82 < arguments.length; $__82++)
      values[$__82 - 1] = arguments[$__82];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseStatement(sourceLiterals);
    }));
  }
  function parseStatements(sourceLiterals) {
    for (var values = [],
        $__83 = 1; $__83 < arguments.length; $__83++)
      values[$__83 - 1] = arguments[$__83];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseStatements(sourceLiterals);
    }));
  }
  function parsePropertyDefinition(sourceLiterals) {
    for (var values = [],
        $__84 = 1; $__84 < arguments.length; $__84++)
      values[$__84 - 1] = arguments[$__84];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parsePropertyDefinition(sourceLiterals);
    }));
  }
  function parse(sourceLiterals, values, doParse) {
    var tree = cache.get(sourceLiterals);
    if (!tree) {
      tree = doParse();
      cache.set(sourceLiterals, tree);
    }
    if (!values.length)
      return tree;
    if (tree instanceof ParseTree)
      return new PlaceholderTransformer(values).transformAny(tree);
    return new PlaceholderTransformer(values).transformList(tree);
  }
  var counter = 0;
  var PlaceholderParser = function PlaceholderParser() {};
  ($traceurRuntime.createClass)(PlaceholderParser, {
    parseExpression: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parseExpression();
      }));
    },
    parseStatement: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parseStatement();
      }));
    },
    parseStatements: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parseStatements();
      }));
    },
    parsePropertyDefinition: function(sourceLiterals) {
      return this.parse_(sourceLiterals, (function(p) {
        return p.parsePropertyDefinition();
      }));
    },
    parse_: function(sourceLiterals, doParse) {
      var source = sourceLiterals[0];
      for (var i = 1; i < sourceLiterals.length; i++) {
        source += PREFIX + (i - 1) + sourceLiterals[i];
      }
      var file = new SourceFile('@traceur/generated/TemplateParser/' + counter++, source);
      var errorReporter = new MutedErrorReporter();
      var parser = new Parser(file, errorReporter);
      var tree = doParse(parser);
      if (errorReporter.hadError() || !tree || !parser.isAtEnd())
        throw new Error(("Internal error trying to parse:\n\n" + source));
      return tree;
    }
  }, {});
  function convertValueToExpression(value) {
    if (value instanceof ParseTree)
      return value;
    if (value instanceof IdentifierToken)
      return createIdentifierExpression(value);
    if (value instanceof LiteralToken)
      return new LiteralExpression(value.location, value);
    if (Array.isArray(value)) {
      if (value[0] instanceof ParseTree) {
        if (value.length === 1)
          return value[0];
        if (value[0].isStatement())
          return createBlock(value);
        else
          return createParenExpression(createCommaExpression(value));
      }
      return createArrayLiteralExpression(value.map(convertValueToExpression));
    }
    if (value === null)
      return createNullLiteral();
    if (value === undefined)
      return createVoid0();
    switch (typeof value) {
      case 'string':
        return createStringLiteral(value);
      case 'boolean':
        return createBooleanLiteral(value);
      case 'number':
        return createNumberLiteral(value);
    }
    throw new Error('Not implemented');
  }
  function convertValueToIdentifierToken(value) {
    if (value instanceof IdentifierToken)
      return value;
    return createIdentifierToken(value);
  }
  var PlaceholderTransformer = function PlaceholderTransformer(values) {
    $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "constructor", []);
    this.values = values;
  };
  var $PlaceholderTransformer = PlaceholderTransformer;
  ($traceurRuntime.createClass)(PlaceholderTransformer, {
    getValueAt: function(index) {
      return this.values[index];
    },
    getValue_: function(str) {
      if (str.indexOf(PREFIX) !== 0)
        return NOT_FOUND;
      return this.getValueAt(Number(str.slice(PREFIX.length)));
    },
    transformIdentifierExpression: function(tree) {
      var value = this.getValue_(tree.identifierToken.value);
      if (value === NOT_FOUND)
        return tree;
      return convertValueToExpression(value);
    },
    transformBindingIdentifier: function(tree) {
      var value = this.getValue_(tree.identifierToken.value);
      if (value === NOT_FOUND)
        return tree;
      return createBindingIdentifier(value);
    },
    transformExpressionStatement: function(tree) {
      if (tree.expression.type === IDENTIFIER_EXPRESSION) {
        var transformedExpression = this.transformIdentifierExpression(tree.expression);
        if (transformedExpression === tree.expression)
          return tree;
        if (transformedExpression.isStatement())
          return transformedExpression;
        return createExpressionStatement(transformedExpression);
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformExpressionStatement", [tree]);
    },
    transformBlock: function(tree) {
      if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
        var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
        if (transformedStatement === tree.statements[0])
          return tree;
        if (transformedStatement.type === BLOCK)
          return transformedStatement;
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformBlock", [tree]);
    },
    transformFunctionBody: function(tree) {
      if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
        var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
        if (transformedStatement === tree.statements[0])
          return tree;
        if (transformedStatement.type === BLOCK)
          return createFunctionBody(transformedStatement.statements);
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformFunctionBody", [tree]);
    },
    transformMemberExpression: function(tree) {
      var value = this.getValue_(tree.memberName.value);
      if (value === NOT_FOUND)
        return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformMemberExpression", [tree]);
      var operand = this.transformAny(tree.operand);
      return createMemberExpression(operand, value);
    },
    transformLiteralPropertyName: function(tree) {
      if (tree.literalToken.type === IDENTIFIER) {
        var value = this.getValue_(tree.literalToken.value);
        if (value !== NOT_FOUND) {
          return new LiteralPropertyName(null, convertValueToIdentifierToken(value));
        }
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformLiteralPropertyName", [tree]);
    },
    transformArgumentList: function(tree) {
      if (tree.args.length === 1 && tree.args[0].type === IDENTIFIER_EXPRESSION) {
        var arg0 = this.transformAny(tree.args[0]);
        if (arg0 === tree.args[0])
          return tree;
        if (arg0.type === ARGUMENT_LIST)
          return arg0;
      }
      return $traceurRuntime.superCall(this, $PlaceholderTransformer.prototype, "transformArgumentList", [tree]);
    }
  }, {}, ParseTreeTransformer);
  return {
    get parseExpression() {
      return parseExpression;
    },
    get parseStatement() {
      return parseStatement;
    },
    get parseStatements() {
      return parseStatements;
    },
    get parsePropertyDefinition() {
      return parsePropertyDefinition;
    },
    get PlaceholderParser() {
      return PlaceholderParser;
    },
    get PlaceholderTransformer() {
      return PlaceholderTransformer;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/PrependStatements", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/PrependStatements";
  var $__87 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      EXPRESSION_STATEMENT = $__87.EXPRESSION_STATEMENT,
      LITERAL_EXPRESSION = $__87.LITERAL_EXPRESSION;
  var STRING = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).STRING;
  function isStringExpressionStatement(tree) {
    return tree.type === EXPRESSION_STATEMENT && tree.expression.type === LITERAL_EXPRESSION && tree.expression.literalToken.type === STRING;
  }
  function prependStatements(statements) {
    for (var statementsToPrepend = [],
        $__86 = 1; $__86 < arguments.length; $__86++)
      statementsToPrepend[$__86 - 1] = arguments[$__86];
    if (!statements.length)
      return statementsToPrepend;
    if (!statementsToPrepend.length)
      return statements;
    var transformed = [];
    var inProlog = true;
    statements.forEach((function(statement) {
      var $__88;
      if (inProlog && !isStringExpressionStatement(statement)) {
        ($__88 = transformed).push.apply($__88, $traceurRuntime.toObject(statementsToPrepend));
        inProlog = false;
      }
      transformed.push(statement);
    }));
    return transformed;
  }
  return {get prependStatements() {
      return prependStatements;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/TempVarTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/TempVarTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__90 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      Module = $__90.Module,
      Script = $__90.Script;
  var ARGUMENTS = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).ARGUMENTS;
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var $__90 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createFunctionBody = $__90.createFunctionBody,
      createThisExpression = $__90.createThisExpression,
      createIdentifierExpression = $__90.createIdentifierExpression,
      createVariableDeclaration = $__90.createVariableDeclaration,
      createVariableDeclarationList = $__90.createVariableDeclarationList,
      createVariableStatement = $__90.createVariableStatement;
  var prependStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PrependStatements")).prependStatements;
  function getVars(self) {
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1];
    if (!vars)
      throw new Error('Invalid use of addTempVar');
    return vars;
  }
  var TempVarStatement = function TempVarStatement(name, initializer) {
    this.name = name;
    this.initializer = initializer;
  };
  ($traceurRuntime.createClass)(TempVarStatement, {}, {});
  var TempScope = function TempScope() {
    this.thisName = null;
    this.argumentName = null;
    this.identifiers = [];
  };
  ($traceurRuntime.createClass)(TempScope, {
    push: function(identifier) {
      this.identifiers.push(identifier);
    },
    pop: function() {
      return this.identifiers.pop();
    },
    release: function(obj) {
      for (var i = this.identifiers.length - 1; i >= 0; i--) {
        obj.release_(this.identifiers[i]);
      }
    }
  }, {});
  var TempVarTransformer = function TempVarTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $TempVarTransformer.prototype, "constructor", []);
    this.identifierGenerator = identifierGenerator;
    this.tempVarStack_ = [[]];
    this.tempScopeStack_ = [new TempScope()];
    this.namePool_ = [];
  };
  var $TempVarTransformer = TempVarTransformer;
  ($traceurRuntime.createClass)(TempVarTransformer, {
    transformStatements_: function(statements) {
      this.tempVarStack_.push([]);
      var transformedStatements = this.transformList(statements);
      var vars = this.tempVarStack_.pop();
      if (!vars.length)
        return transformedStatements;
      var seenNames = Object.create(null);
      vars = vars.filter((function(tempVarStatement) {
        var $__90 = $traceurRuntime.assertObject(tempVarStatement),
            name = $__90.name,
            initializer = $__90.initializer;
        if (name in seenNames) {
          if (seenNames[name].initializer || initializer)
            throw new Error('Invalid use of TempVarTransformer');
          return false;
        }
        seenNames[name] = tempVarStatement;
        return true;
      }));
      var variableStatement = createVariableStatement(createVariableDeclarationList(VAR, vars.map((function($__90) {
        var name = $__90.name,
            initializer = $__90.initializer;
        return createVariableDeclaration(name, initializer);
      }))));
      return prependStatements(transformedStatements, variableStatement);
    },
    transformScript: function(tree) {
      var scriptItemList = this.transformStatements_(tree.scriptItemList);
      if (scriptItemList == tree.scriptItemList) {
        return tree;
      }
      return new Script(tree.location, scriptItemList, tree.moduleName);
    },
    transformModule: function(tree) {
      var scriptItemList = this.transformStatements_(tree.scriptItemList);
      if (scriptItemList == tree.scriptItemList) {
        return tree;
      }
      return new Module(tree.location, scriptItemList, tree.moduleName);
    },
    transformFunctionBody: function(tree) {
      this.pushTempVarState();
      var statements = this.transformStatements_(tree.statements);
      this.popTempVarState();
      if (statements == tree.statements)
        return tree;
      return createFunctionBody(statements);
    },
    getTempIdentifier: function() {
      var name = this.namePool_.length ? this.namePool_.pop() : this.identifierGenerator.generateUniqueIdentifier();
      this.tempScopeStack_[this.tempScopeStack_.length - 1].push(name);
      return name;
    },
    addTempVar: function() {
      var initializer = arguments[0] !== (void 0) ? arguments[0] : null;
      var vars = getVars(this);
      var uid = this.getTempIdentifier();
      vars.push(new TempVarStatement(uid, initializer));
      return uid;
    },
    addTempVarForThis: function() {
      var tempScope = this.tempScopeStack_[this.tempScopeStack_.length - 1];
      return tempScope.thisName || (tempScope.thisName = this.addTempVar(createThisExpression()));
    },
    addTempVarForArguments: function() {
      var tempScope = this.tempScopeStack_[this.tempScopeStack_.length - 1];
      return tempScope.argumentName || (tempScope.argumentName = this.addTempVar(createIdentifierExpression(ARGUMENTS)));
    },
    pushTempVarState: function() {
      this.tempScopeStack_.push(new TempScope());
    },
    popTempVarState: function() {
      this.tempScopeStack_.pop().release(this);
    },
    release_: function(name) {
      this.namePool_.push(name);
    }
  }, {}, ParseTreeTransformer);
  return {get TempVarTransformer() {
      return TempVarTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/ModuleSymbol", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/ModuleSymbol";
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var ExportsList = function ExportsList(normalizedName) {
    this.exports_ = Object.create(null);
    if (normalizedName !== null)
      this.normalizedName = normalizedName.replace(/\\/g, '/');
    else
      this.normalizedName = null;
  };
  ($traceurRuntime.createClass)(ExportsList, {
    addExport: function(name, tree) {
      assert(!this.exports_[name]);
      this.exports_[name] = tree;
    },
    getExport: function(name) {
      return this.exports_[name];
    },
    getExports: function() {
      return Object.keys(this.exports_);
    }
  }, {});
  var ModuleDescription = function ModuleDescription(normalizedName, module) {
    var $__91 = this;
    $traceurRuntime.superCall(this, $ModuleDescription.prototype, "constructor", [normalizedName]);
    Object.getOwnPropertyNames(module).forEach((function(name) {
      $__91.addExport(name, true);
    }));
  };
  var $ModuleDescription = ModuleDescription;
  ($traceurRuntime.createClass)(ModuleDescription, {}, {}, ExportsList);
  var ModuleSymbol = function ModuleSymbol(tree, normalizedName) {
    $traceurRuntime.superCall(this, $ModuleSymbol.prototype, "constructor", [normalizedName]);
    this.tree = tree;
    this.imports_ = Object.create(null);
  };
  var $ModuleSymbol = ModuleSymbol;
  ($traceurRuntime.createClass)(ModuleSymbol, {
    addImport: function(name, tree) {
      assert(!this.imports_[name]);
      this.imports_[name] = tree;
    },
    getImport: function(name) {
      return this.imports_[name];
    }
  }, {}, ExportsList);
  return {
    get ModuleDescription() {
      return ModuleDescription;
    },
    get ModuleSymbol() {
      return ModuleSymbol;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/module/ModuleVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/ModuleVisitor";
  var ModuleDescription = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ModuleSymbol")).ModuleDescription;
  var ParseTree = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTree")).ParseTree;
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var $__95 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      MODULE_DECLARATION = $__95.MODULE_DECLARATION,
      EXPORT_DECLARATION = $__95.EXPORT_DECLARATION,
      IMPORT_DECLARATION = $__95.IMPORT_DECLARATION;
  var ModuleVisitor = function ModuleVisitor(reporter, loader, moduleSymbol) {
    this.reporter = reporter;
    this.loader_ = loader;
    this.moduleSymbol = moduleSymbol;
  };
  ($traceurRuntime.createClass)(ModuleVisitor, {
    getModuleDescriptionFromCodeUnit_: function(name, codeUnitToModuleInfo) {
      var referrer = this.moduleSymbol.normalizedName;
      var codeUnit = this.loader_.getCodeUnitForModuleSpecifier(name, referrer);
      var moduleDescription = codeUnitToModuleInfo(codeUnit);
      if (!moduleDescription) {
        var msg = (name + " is not a module, required by " + referrer);
        this.reportError(codeUnit.metadata.tree, msg);
        return null;
      }
      return moduleDescription;
    },
    getModuleSymbolForModuleSpecifier: function(name) {
      return this.getModuleDescriptionFromCodeUnit_(name, (function(codeUnit) {
        return codeUnit.metadata.moduleSymbol;
      }));
    },
    getModuleDescriptionForModuleSpecifier: function(name) {
      return this.getModuleDescriptionFromCodeUnit_(name, (function(codeUnit) {
        var moduleDescription = codeUnit.metadata.moduleSymbol;
        if (!moduleDescription && codeUnit.result) {
          moduleDescription = new ModuleDescription(codeUnit.normalizedName, codeUnit.result);
        }
        return moduleDescription;
      }));
    },
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitFunctionBody: function(tree) {},
    visitBlock: function(tree) {},
    visitClassDeclaration: function(tree) {},
    visitClassExpression: function(tree) {},
    visitModuleElement_: function(element) {
      switch (element.type) {
        case MODULE_DECLARATION:
        case EXPORT_DECLARATION:
        case IMPORT_DECLARATION:
          this.visitAny(element);
      }
    },
    visitScript: function(tree) {
      tree.scriptItemList.forEach(this.visitModuleElement_, this);
    },
    visitModule: function(tree) {
      tree.scriptItemList.forEach(this.visitModuleElement_, this);
    },
    reportError: function(tree, message) {
      this.reporter.reportError(tree.location.start, message);
    }
  }, {}, ParseTreeVisitor);
  return {get ModuleVisitor() {
      return ModuleVisitor;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/ExportVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/ExportVisitor";
  var ModuleVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ModuleVisitor")).ModuleVisitor;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var ExportVisitor = function ExportVisitor(reporter, loaderHooks, moduleSymbol) {
    $traceurRuntime.superCall(this, $ExportVisitor.prototype, "constructor", [reporter, loaderHooks, moduleSymbol]);
    this.inExport_ = false;
    this.moduleSpecifier = null;
  };
  var $ExportVisitor = ExportVisitor;
  ($traceurRuntime.createClass)(ExportVisitor, {
    addExport_: function(name, tree) {
      assert(typeof name == 'string');
      if (this.inExport_)
        this.addExport(name, tree);
    },
    addExport: function(name, tree) {
      var moduleSymbol = this.moduleSymbol;
      var existingExport = moduleSymbol.getExport(name);
      if (existingExport) {
        this.reportError(tree, ("Duplicate export. '" + name + "' was previously ") + ("exported at " + existingExport.location.start));
      } else {
        moduleSymbol.addExport(name, tree);
      }
    },
    visitClassDeclaration: function(tree) {
      this.addExport_(tree.name.identifierToken.value, tree);
    },
    visitExportDeclaration: function(tree) {
      this.inExport_ = true;
      this.visitAny(tree.declaration);
      this.inExport_ = false;
    },
    visitNamedExport: function(tree) {
      this.moduleSpecifier = tree.moduleSpecifier;
      this.visitAny(tree.specifierSet);
      this.moduleSpecifier = null;
    },
    visitExportDefault: function(tree) {
      this.addExport_('default', tree);
    },
    visitExportSpecifier: function(tree) {
      this.addExport_((tree.rhs || tree.lhs).value, tree);
    },
    visitExportStar: function(tree) {
      var $__96 = this;
      var name = this.moduleSpecifier.token.processedValue;
      var moduleDescription = this.getModuleDescriptionForModuleSpecifier(name);
      if (moduleDescription) {
        moduleDescription.getExports().forEach((function(name) {
          $__96.addExport(name, tree);
        }));
      }
    },
    visitFunctionDeclaration: function(tree) {
      this.addExport_(tree.name.identifierToken.value, tree);
    },
    visitModuleDeclaration: function(tree) {
      this.addExport_(tree.identifier.value, tree);
    },
    visitVariableDeclaration: function(tree) {
      this.addExport_(tree.lvalue.identifierToken.value, tree);
    }
  }, {}, ModuleVisitor);
  return {get ExportVisitor() {
      return ExportVisitor;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/DirectExportVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/DirectExportVisitor";
  var ExportVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ExportVisitor")).ExportVisitor;
  var DirectExportVisitor = function DirectExportVisitor() {
    $traceurRuntime.superCall(this, $DirectExportVisitor.prototype, "constructor", [null, null, null]);
    this.namedExports = [];
    this.starExports = [];
  };
  var $DirectExportVisitor = DirectExportVisitor;
  ($traceurRuntime.createClass)(DirectExportVisitor, {
    addExport: function(name, tree) {
      this.namedExports.push({
        name: name,
        tree: tree,
        moduleSpecifier: this.moduleSpecifier
      });
    },
    visitExportStar: function(tree) {
      this.starExports.push(this.moduleSpecifier);
    },
    hasExports: function() {
      return this.namedExports.length != 0 || this.starExports.length != 0;
    }
  }, {}, ExportVisitor);
  return {get DirectExportVisitor() {
      return DirectExportVisitor;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ModuleTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ModuleTransformer";
  var $__101 = Object.freeze(Object.defineProperties(["var __moduleName = ", ";"], {raw: {value: Object.freeze(["var __moduleName = ", ";"])}})),
      $__102 = Object.freeze(Object.defineProperties(["function() {\n      ", "\n    }"], {raw: {value: Object.freeze(["function() {\n      ", "\n    }"])}})),
      $__103 = Object.freeze(Object.defineProperties(["$traceurRuntime.ModuleStore.getAnonymousModule(\n              ", ");"], {raw: {value: Object.freeze(["$traceurRuntime.ModuleStore.getAnonymousModule(\n              ", ");"])}})),
      $__104 = Object.freeze(Object.defineProperties(["System.register(", ", [], ", ");"], {raw: {value: Object.freeze(["System.register(", ", [], ", ");"])}})),
      $__105 = Object.freeze(Object.defineProperties(["get ", "() { return ", "; }"], {raw: {value: Object.freeze(["get ", "() { return ", "; }"])}})),
      $__106 = Object.freeze(Object.defineProperties(["$traceurRuntime.exportStar(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.exportStar(", ")"])}})),
      $__107 = Object.freeze(Object.defineProperties(["return ", ""], {raw: {value: Object.freeze(["return ", ""])}})),
      $__108 = Object.freeze(Object.defineProperties(["var $__default = ", ""], {raw: {value: Object.freeze(["var $__default = ", ""])}})),
      $__109 = Object.freeze(Object.defineProperties(["System.get(", ")"], {raw: {value: Object.freeze(["System.get(", ")"])}}));
  var $__112 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BindingElement = $__112.BindingElement,
      BindingIdentifier = $__112.BindingIdentifier,
      EmptyStatement = $__112.EmptyStatement,
      LiteralPropertyName = $__112.LiteralPropertyName,
      ObjectPattern = $__112.ObjectPattern,
      ObjectPatternField = $__112.ObjectPatternField,
      Script = $__112.Script;
  var DirectExportVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/DirectExportVisitor")).DirectExportVisitor;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__112 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      EXPORT_DEFAULT = $__112.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__112.EXPORT_SPECIFIER;
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var $__112 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArgumentList = $__112.createArgumentList,
      createBindingIdentifier = $__112.createBindingIdentifier,
      createExpressionStatement = $__112.createExpressionStatement,
      createIdentifierExpression = $__112.createIdentifierExpression,
      createIdentifierToken = $__112.createIdentifierToken,
      createMemberExpression = $__112.createMemberExpression,
      createObjectLiteralExpression = $__112.createObjectLiteralExpression,
      createUseStrictDirective = $__112.createUseStrictDirective,
      createVariableStatement = $__112.createVariableStatement;
  var $__112 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__112.parseExpression,
      parsePropertyDefinition = $__112.parsePropertyDefinition,
      parseStatement = $__112.parseStatement,
      parseStatements = $__112.parseStatements;
  var ModuleTransformer = function ModuleTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $ModuleTransformer.prototype, "constructor", [identifierGenerator]);
    this.exportVisitor_ = new DirectExportVisitor();
    this.moduleSpecifierKind_ = null;
    this.moduleName = null;
  };
  var $ModuleTransformer = ModuleTransformer;
  ($traceurRuntime.createClass)(ModuleTransformer, {
    getTempVarNameForModuleName: function(moduleName) {
      return '$__' + moduleName.replace(/[^a-zA-Z0-9$]/g, function(c) {
        return '_' + c.charCodeAt(0) + '_';
      }) + '__';
    },
    getTempVarNameForModuleSpecifier: function(moduleSpecifier) {
      var normalizedName = System.normalize(moduleSpecifier.token.processedValue, this.moduleName);
      return this.getTempVarNameForModuleName(normalizedName);
    },
    transformScript: function(tree) {
      this.moduleName = tree.moduleName;
      return $traceurRuntime.superCall(this, $ModuleTransformer.prototype, "transformScript", [tree]);
    },
    transformModule: function(tree) {
      this.moduleName = tree.moduleName;
      this.pushTempVarState();
      var statements = this.transformList(tree.scriptItemList);
      statements = this.appendExportStatement(statements);
      this.popTempVarState();
      statements = this.wrapModule(this.moduleProlog().concat(statements));
      return new Script(tree.location, statements);
    },
    moduleProlog: function() {
      var statements = [createUseStrictDirective()];
      if (this.moduleName)
        statements.push(parseStatement($__101, this.moduleName));
      return statements;
    },
    wrapModule: function(statements) {
      var functionExpression = parseExpression($__102, statements);
      if (this.moduleName === null) {
        return parseStatements($__103, functionExpression);
      }
      return parseStatements($__104, this.moduleName, functionExpression);
    },
    getGetterExport: function($__112) {
      var name = $__112.name,
          tree = $__112.tree,
          moduleSpecifier = $__112.moduleSpecifier;
      var returnExpression;
      switch (tree.type) {
        case EXPORT_DEFAULT:
          returnExpression = createIdentifierExpression('$__default');
          break;
        case EXPORT_SPECIFIER:
          if (moduleSpecifier) {
            var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
            returnExpression = createMemberExpression(idName, tree.lhs);
          } else {
            returnExpression = createIdentifierExpression(tree.lhs);
          }
          break;
        default:
          returnExpression = createIdentifierExpression(name);
          break;
      }
      return parsePropertyDefinition($__105, name, returnExpression);
    },
    getExportProperties: function() {
      var $__110 = this;
      return this.exportVisitor_.namedExports.map((function(exp) {
        return $__110.getGetterExport(exp);
      })).concat(this.exportVisitor_.namedExports.map((function(exp) {
        return $__110.getSetterExport(exp);
      }))).filter((function(e) {
        return e;
      }));
    },
    getSetterExport: function($__113) {
      var name = $__113.name,
          tree = $__113.tree,
          moduleSpecifier = $__113.moduleSpecifier;
      return null;
    },
    getExportObject: function() {
      var $__110 = this;
      var exportObject = createObjectLiteralExpression(this.getExportProperties());
      if (this.exportVisitor_.starExports.length) {
        var starExports = this.exportVisitor_.starExports;
        var starIdents = starExports.map((function(moduleSpecifier) {
          return createIdentifierExpression($__110.getTempVarNameForModuleSpecifier(moduleSpecifier));
        }));
        var args = createArgumentList.apply(null, $traceurRuntime.spread([exportObject], starIdents));
        return parseExpression($__106, args);
      }
      return exportObject;
    },
    appendExportStatement: function(statements) {
      var exportObject = this.getExportObject();
      statements.push(parseStatement($__107, exportObject));
      return statements;
    },
    hasExports: function() {
      return this.exportVisitor_.hasExports();
    },
    transformExportDeclaration: function(tree) {
      this.exportVisitor_.visitAny(tree);
      return this.transformAny(tree.declaration);
    },
    transformExportDefault: function(tree) {
      return parseStatement($__108, tree.expression);
    },
    transformNamedExport: function(tree) {
      var moduleSpecifier = tree.moduleSpecifier;
      if (moduleSpecifier) {
        var expression = this.transformAny(moduleSpecifier);
        var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
        return createVariableStatement(VAR, idName, expression);
      }
      return new EmptyStatement(null);
    },
    transformModuleSpecifier: function(tree) {
      assert(this.moduleName);
      var name = tree.token.processedValue;
      var normalizedName = System.normalize(name, this.moduleName);
      return parseExpression($__109, normalizedName);
    },
    transformModuleDeclaration: function(tree) {
      this.moduleSpecifierKind_ = 'module';
      var initializer = this.transformAny(tree.expression);
      return createVariableStatement(VAR, tree.identifier, initializer);
    },
    transformImportedBinding: function(tree) {
      var bindingElement = new BindingElement(tree.location, tree.binding, null);
      var name = new LiteralPropertyName(null, createIdentifierToken('default'));
      return new ObjectPattern(null, [new ObjectPatternField(null, name, bindingElement)]);
    },
    transformImportDeclaration: function(tree) {
      this.moduleSpecifierKind_ = 'import';
      if (!tree.importClause)
        return createExpressionStatement(this.transformAny(tree.moduleSpecifier));
      var binding = this.transformAny(tree.importClause);
      var initializer = this.transformAny(tree.moduleSpecifier);
      return createVariableStatement(VAR, binding, initializer);
    },
    transformImportSpecifierSet: function(tree) {
      var fields = this.transformList(tree.specifiers);
      return new ObjectPattern(null, fields);
    },
    transformImportSpecifier: function(tree) {
      if (tree.rhs) {
        var binding = new BindingIdentifier(tree.location, tree.rhs);
        var bindingElement = new BindingElement(tree.location, binding, null);
        var name = new LiteralPropertyName(tree.lhs.location, tree.lhs);
        return new ObjectPatternField(tree.location, name, bindingElement);
      }
      return new BindingElement(tree.location, createBindingIdentifier(tree.lhs), null);
    }
  }, {}, TempVarTransformer);
  return {get ModuleTransformer() {
      return ModuleTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/globalThis", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/globalThis";
  var $__114 = Object.freeze(Object.defineProperties(["typeof global !== 'undefined' ? global : this"], {raw: {value: Object.freeze(["typeof global !== 'undefined' ? global : this"])}}));
  var parseExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseExpression;
  var expr;
  function globalThis() {
    if (!expr)
      expr = parseExpression($__114);
    return expr;
  }
  var $__default = globalThis;
  return {get default() {
      return $__default;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/FindVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/FindVisitor";
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var FindVisitor = function FindVisitor(tree) {
    var keepOnGoing = arguments[1];
    this.found_ = false;
    this.shouldContinue_ = true;
    this.keepOnGoing_ = keepOnGoing;
    this.visitAny(tree);
  };
  ($traceurRuntime.createClass)(FindVisitor, {
    get found() {
      return this.found_;
    },
    set found(v) {
      if (v) {
        this.found_ = true;
        if (!this.keepOnGoing_)
          this.shouldContinue_ = false;
      }
    },
    visitAny: function(tree) {
      this.shouldContinue_ && tree && tree.visit(this);
    },
    visitList: function(list) {
      if (list) {
        for (var i = 0; this.shouldContinue_ && i < list.length; i++) {
          this.visitAny(list[i]);
        }
      }
    }
  }, {}, ParseTreeVisitor);
  return {get FindVisitor() {
      return FindVisitor;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/FindInFunctionScope", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/FindInFunctionScope";
  var FindVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindVisitor")).FindVisitor;
  var FindInFunctionScope = function FindInFunctionScope() {
    $traceurRuntime.defaultSuperCall(this, $FindInFunctionScope.prototype, arguments);
  };
  var $FindInFunctionScope = FindInFunctionScope;
  ($traceurRuntime.createClass)(FindInFunctionScope, {
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {},
    visitPropertyMethodAssignment: function(tree) {}
  }, {}, FindVisitor);
  return {get FindInFunctionScope() {
      return FindInFunctionScope;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/scopeContainsThis", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/scopeContainsThis";
  var FindInFunctionScope = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindInFunctionScope")).FindInFunctionScope;
  var FindThis = function FindThis() {
    $traceurRuntime.defaultSuperCall(this, $FindThis.prototype, arguments);
  };
  var $FindThis = FindThis;
  ($traceurRuntime.createClass)(FindThis, {visitThisExpression: function(tree) {
      this.found = true;
    }}, {}, FindInFunctionScope);
  function scopeContainsThis(tree) {
    var visitor = new FindThis(tree);
    return visitor.found;
  }
  var $__default = scopeContainsThis;
  return {get default() {
      return $__default;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/AmdTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/AmdTransformer";
  var $__122 = Object.freeze(Object.defineProperties(["__esModule: true"], {raw: {value: Object.freeze(["__esModule: true"])}})),
      $__123 = Object.freeze(Object.defineProperties(["if (!", " || !", ".__esModule)\n            ", " = { 'default': ", " }"], {raw: {value: Object.freeze(["if (!", " || !", ".__esModule)\n            ", " = { 'default': ", " }"])}})),
      $__124 = Object.freeze(Object.defineProperties(["function(", ") {\n      ", "\n    }"], {raw: {value: Object.freeze(["function(", ") {\n      ", "\n    }"])}})),
      $__125 = Object.freeze(Object.defineProperties(["", ".bind(", ")"], {raw: {value: Object.freeze(["", ".bind(", ")"])}})),
      $__126 = Object.freeze(Object.defineProperties(["define(", ", ", ", ", ");"], {raw: {value: Object.freeze(["define(", ", ", ", ", ");"])}})),
      $__127 = Object.freeze(Object.defineProperties(["define(", ", ", ");"], {raw: {value: Object.freeze(["define(", ", ", ");"])}}));
  var ModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ModuleTransformer")).ModuleTransformer;
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var $__129 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createBindingIdentifier = $__129.createBindingIdentifier,
      createIdentifierExpression = $__129.createIdentifierExpression;
  var globalThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/globalThis")).default;
  var $__129 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__129.parseExpression,
      parseStatement = $__129.parseStatement,
      parseStatements = $__129.parseStatements,
      parsePropertyDefinition = $__129.parsePropertyDefinition;
  var scopeContainsThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/scopeContainsThis")).default;
  var AmdTransformer = function AmdTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $AmdTransformer.prototype, "constructor", [identifierGenerator]);
    this.dependencies = [];
  };
  var $AmdTransformer = AmdTransformer;
  ($traceurRuntime.createClass)(AmdTransformer, {
    getExportProperties: function() {
      var properties = $traceurRuntime.superCall(this, $AmdTransformer.prototype, "getExportProperties", []);
      if (this.exportVisitor_.hasExports())
        properties.push(parsePropertyDefinition($__122));
      return properties;
    },
    moduleProlog: function() {
      var locals = this.dependencies.map((function(dep) {
        var local = createIdentifierExpression(dep.local);
        return parseStatement($__123, local, local, local, local);
      }));
      return $traceurRuntime.superCall(this, $AmdTransformer.prototype, "moduleProlog", []).concat(locals);
    },
    wrapModule: function(statements) {
      var depPaths = this.dependencies.map((function(dep) {
        return dep.path;
      }));
      var depLocals = this.dependencies.map((function(dep) {
        return dep.local;
      }));
      var hasTopLevelThis = statements.some(scopeContainsThis);
      var func = parseExpression($__124, depLocals, statements);
      if (hasTopLevelThis)
        func = parseExpression($__125, func, globalThis());
      if (this.moduleName) {
        return parseStatements($__126, this.moduleName, depPaths, func);
      } else {
        return parseStatements($__127, depPaths, func);
      }
    },
    transformModuleSpecifier: function(tree) {
      var localName = this.getTempIdentifier();
      this.dependencies.push({
        path: tree.token,
        local: localName
      });
      return createBindingIdentifier(localName);
    }
  }, {}, ModuleTransformer);
  return {get AmdTransformer() {
      return AmdTransformer;
    }};
});
System.register("traceur@0.0.43/src/staticsemantics/PropName", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/staticsemantics/PropName";
  var $__130 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      COMPUTED_PROPERTY_NAME = $__130.COMPUTED_PROPERTY_NAME,
      GET_ACCESSOR = $__130.GET_ACCESSOR,
      LITERAL_PROPERTY_NAME = $__130.LITERAL_PROPERTY_NAME,
      PROPERTY_METHOD_ASSIGNMENT = $__130.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__130.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__130.PROPERTY_NAME_SHORTHAND,
      SET_ACCESSOR = $__130.SET_ACCESSOR;
  var IDENTIFIER = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).IDENTIFIER;
  function propName(tree) {
    switch (tree.type) {
      case LITERAL_PROPERTY_NAME:
        var token = tree.literalToken;
        if (token.isKeyword() || token.type === IDENTIFIER)
          return token.toString();
        return String(tree.literalToken.processedValue);
      case COMPUTED_PROPERTY_NAME:
        return '';
      case PROPERTY_NAME_SHORTHAND:
        return tree.name.toString();
      case PROPERTY_METHOD_ASSIGNMENT:
      case PROPERTY_NAME_ASSIGNMENT:
      case GET_ACCESSOR:
      case SET_ACCESSOR:
        return propName(tree.name);
    }
  }
  return {get propName() {
      return propName;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/AnnotationsTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/AnnotationsTransformer";
  var $__131 = Object.freeze(Object.defineProperties(["Object.getOwnPropertyDescriptor(", ")"], {raw: {value: Object.freeze(["Object.getOwnPropertyDescriptor(", ")"])}}));
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var CONSTRUCTOR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).CONSTRUCTOR;
  var $__134 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      IDENTIFIER = $__134.IDENTIFIER,
      STRING = $__134.STRING;
  var $__134 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      AnonBlock = $__134.AnonBlock,
      ClassDeclaration = $__134.ClassDeclaration,
      ExportDeclaration = $__134.ExportDeclaration,
      FormalParameter = $__134.FormalParameter,
      FunctionDeclaration = $__134.FunctionDeclaration,
      GetAccessor = $__134.GetAccessor,
      LiteralExpression = $__134.LiteralExpression,
      PropertyMethodAssignment = $__134.PropertyMethodAssignment,
      SetAccessor = $__134.SetAccessor;
  var $__134 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINDING_IDENTIFIER = $__134.BINDING_IDENTIFIER,
      IDENTIFIER_EXPRESSION = $__134.IDENTIFIER_EXPRESSION;
  var propName = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/staticsemantics/PropName")).propName;
  var $__134 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArgumentList = $__134.createArgumentList,
      createArrayLiteralExpression = $__134.createArrayLiteralExpression,
      createAssignmentStatement = $__134.createAssignmentStatement,
      createIdentifierExpression = $__134.createIdentifierExpression,
      createMemberExpression = $__134.createMemberExpression,
      createNewExpression = $__134.createNewExpression,
      createStatementList = $__134.createStatementList,
      createStringLiteralToken = $__134.createStringLiteralToken;
  var parseExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseExpression;
  var AnnotationsScope = function AnnotationsScope() {
    this.className = null;
    this.isExport = false;
    this.constructorParameters = [];
    this.annotations = [];
    this.metadata = [];
  };
  ($traceurRuntime.createClass)(AnnotationsScope, {get inClassScope() {
      return this.className !== null;
    }}, {});
  var AnnotationsTransformer = function AnnotationsTransformer() {
    this.stack_ = [new AnnotationsScope()];
  };
  var $AnnotationsTransformer = AnnotationsTransformer;
  ($traceurRuntime.createClass)(AnnotationsTransformer, {
    transformExportDeclaration: function(tree) {
      var $__135;
      var scope = this.pushAnnotationScope_();
      scope.isExport = true;
      ($__135 = scope.annotations).push.apply($__135, $traceurRuntime.toObject(tree.annotations));
      var declaration = this.transformAny(tree.declaration);
      if (declaration !== tree.declaration || tree.annotations.length > 0)
        tree = new ExportDeclaration(tree.location, declaration, []);
      return this.appendMetadata_(tree);
    },
    transformClassDeclaration: function(tree) {
      var $__135;
      var elementsChanged = false;
      var exportAnnotations = this.scope.isExport ? this.scope.annotations : [];
      var scope = this.pushAnnotationScope_();
      scope.className = tree.name;
      ($__135 = scope.annotations).push.apply($__135, $traceurRuntime.spread(exportAnnotations, tree.annotations));
      tree = $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformClassDeclaration", [tree]);
      ($__135 = scope.metadata).unshift.apply($__135, $traceurRuntime.toObject(this.transformMetadata_(createIdentifierExpression(tree.name), scope.annotations, scope.constructorParameters)));
      if (tree.annotations.length > 0) {
        tree = new ClassDeclaration(tree.location, tree.name, tree.superClass, tree.elements, []);
      }
      return this.appendMetadata_(tree);
    },
    transformFunctionDeclaration: function(tree) {
      var $__135;
      var exportAnnotations = this.scope.isExport ? this.scope.annotations : [];
      var scope = this.pushAnnotationScope_();
      ($__135 = scope.annotations).push.apply($__135, $traceurRuntime.spread(exportAnnotations, tree.annotations));
      ($__135 = scope.metadata).push.apply($__135, $traceurRuntime.toObject(this.transformMetadata_(createIdentifierExpression(tree.name), scope.annotations, tree.parameterList.parameters)));
      tree = $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformFunctionDeclaration", [tree]);
      if (tree.annotations.length > 0) {
        tree = new FunctionDeclaration(tree.location, tree.name, tree.functionKind, tree.parameterList, tree.typeAnnotation, [], tree.functionBody);
      }
      return this.appendMetadata_(tree);
    },
    transformFormalParameter: function(tree) {
      if (tree.annotations.length > 0) {
        tree = new FormalParameter(tree.location, tree.parameter, tree.typeAnnotation, []);
      }
      return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformFormalParameter", [tree]);
    },
    transformGetAccessor: function(tree) {
      var $__135;
      if (!this.scope.inClassScope)
        return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformGetAccessor", [tree]);
      ($__135 = this.scope.metadata).push.apply($__135, $traceurRuntime.toObject(this.transformMetadata_(this.transformAccessor_(tree, this.scope.className, 'get'), tree.annotations, [])));
      if (tree.annotations.length > 0) {
        tree = new GetAccessor(tree.location, tree.isStatic, tree.name, tree.typeAnnotation, [], tree.body);
      }
      return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformGetAccessor", [tree]);
    },
    transformSetAccessor: function(tree) {
      var $__135;
      if (!this.scope.inClassScope)
        return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformSetAccessor", [tree]);
      ($__135 = this.scope.metadata).push.apply($__135, $traceurRuntime.toObject(this.transformMetadata_(this.transformAccessor_(tree, this.scope.className, 'set'), tree.annotations, tree.parameterList.parameters)));
      var parameterList = this.transformAny(tree.parameterList);
      if (parameterList !== tree.parameterList || tree.annotations.length > 0) {
        tree = new SetAccessor(tree.location, tree.isStatic, tree.name, parameterList, [], tree.body);
      }
      return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformSetAccessor", [tree]);
    },
    transformPropertyMethodAssignment: function(tree) {
      var $__135;
      if (!this.scope.inClassScope)
        return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
      if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
        ($__135 = this.scope.annotations).push.apply($__135, $traceurRuntime.toObject(tree.annotations));
        this.scope.constructorParameters = tree.parameterList.parameters;
      } else {
        ($__135 = this.scope.metadata).push.apply($__135, $traceurRuntime.toObject(this.transformMetadata_(this.transformPropertyMethod_(tree, this.scope.className), tree.annotations, tree.parameterList.parameters)));
      }
      var parameterList = this.transformAny(tree.parameterList);
      if (parameterList !== tree.parameterList || tree.annotations.length > 0) {
        tree = new PropertyMethodAssignment(tree.location, tree.isStatic, tree.functionKind, tree.name, parameterList, tree.typeAnnotation, [], tree.functionBody);
      }
      return $traceurRuntime.superCall(this, $AnnotationsTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
    },
    appendMetadata_: function(tree) {
      var $__135;
      var metadata = this.stack_.pop().metadata;
      if (metadata.length > 0) {
        if (this.scope.isExport) {
          ($__135 = this.scope.metadata).push.apply($__135, $traceurRuntime.toObject(metadata));
        } else {
          tree = new AnonBlock(null, $traceurRuntime.spread([tree], metadata));
        }
      }
      return tree;
    },
    transformClassReference_: function(tree, className) {
      var parent = createIdentifierExpression(className);
      if (!tree.isStatic)
        parent = createMemberExpression(parent, 'prototype');
      return parent;
    },
    transformPropertyMethod_: function(tree, className) {
      return createMemberExpression(this.transformClassReference_(tree, className), tree.name.literalToken);
    },
    transformAccessor_: function(tree, className, accessor) {
      var args = createArgumentList([this.transformClassReference_(tree, className), this.createLiteralStringExpression_(tree.name)]);
      var descriptor = parseExpression($__131, args);
      return createMemberExpression(descriptor, accessor);
    },
    transformParameters_: function(parameters) {
      var $__132 = this;
      var hasParameterMetadata = false;
      parameters = parameters.map((function(param) {
        var $__135;
        var metadata = [];
        if (param.typeAnnotation)
          metadata.push($__132.transformAny(param.typeAnnotation));
        if (param.annotations && param.annotations.length > 0)
          ($__135 = metadata).push.apply($__135, $traceurRuntime.toObject($__132.transformAnnotations_(param.annotations)));
        if (metadata.length > 0) {
          hasParameterMetadata = true;
          return createArrayLiteralExpression(metadata);
        }
        return createArrayLiteralExpression([]);
      }));
      return hasParameterMetadata ? parameters : [];
    },
    transformAnnotations_: function(annotations) {
      return annotations.map((function(annotation) {
        return createNewExpression(annotation.name, annotation.args);
      }));
    },
    transformMetadata_: function(target, annotations, parameters) {
      var metadataStatements = [];
      if (annotations !== null) {
        annotations = this.transformAnnotations_(annotations);
        if (annotations.length > 0) {
          metadataStatements.push(createAssignmentStatement(createMemberExpression(target, 'annotations'), createArrayLiteralExpression(annotations)));
        }
      }
      if (parameters !== null) {
        parameters = this.transformParameters_(parameters);
        if (parameters.length > 0) {
          metadataStatements.push(createAssignmentStatement(createMemberExpression(target, 'parameters'), createArrayLiteralExpression(parameters)));
        }
      }
      return metadataStatements;
    },
    createLiteralStringExpression_: function(tree) {
      var token = tree.literalToken;
      if (tree.literalToken.type !== STRING)
        token = createStringLiteralToken(tree.literalToken.value);
      return new LiteralExpression(null, token);
    },
    get scope() {
      return this.stack_[this.stack_.length - 1];
    },
    pushAnnotationScope_: function() {
      var scope = new AnnotationsScope();
      this.stack_.push(scope);
      return scope;
    }
  }, {}, ParseTreeTransformer);
  return {get AnnotationsTransformer() {
      return AnnotationsTransformer;
    }};
});
System.register("traceur@0.0.43/src/semantics/VariableBinder", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/semantics/VariableBinder";
  var $__137 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      ARRAY_PATTERN = $__137.ARRAY_PATTERN,
      BINDING_ELEMENT = $__137.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__137.BINDING_IDENTIFIER,
      FORMAL_PARAMETER = $__137.FORMAL_PARAMETER,
      OBJECT_PATTERN = $__137.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__137.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__137.PAREN_EXPRESSION,
      SPREAD_PATTERN_ELEMENT = $__137.SPREAD_PATTERN_ELEMENT;
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  function variablesInBlock(tree, includeFunctionScope) {
    var binder = new VariableBinder(includeFunctionScope, tree);
    binder.visitAny(tree);
    return binder.identifiers_;
  }
  ;
  function variablesInFunction(tree) {
    var binder = new VariableBinder(true, tree.functionBody);
    binder.bindVariablesInFunction_(tree);
    return binder.identifiers_;
  }
  ;
  var VariableBinder = function VariableBinder(includeFunctionScope, scope) {
    $traceurRuntime.superCall(this, $VariableBinder.prototype, "constructor", []);
    this.includeFunctionScope_ = includeFunctionScope;
    this.scope_ = scope || null;
    this.block_ = null;
    this.identifiers_ = Object.create(null);
  };
  var $VariableBinder = VariableBinder;
  ($traceurRuntime.createClass)(VariableBinder, {
    bindVariablesInFunction_: function(tree) {
      var parameters = tree.parameterList.parameters;
      for (var i = 0; i < parameters.length; i++) {
        this.bindParameter_(parameters[i]);
      }
      this.visitAny(tree.functionBody);
    },
    visitBlock: function(tree) {
      var parentBlock = this.block_;
      this.block_ = tree;
      this.visitList(tree.statements);
      this.block_ = parentBlock;
    },
    visitFunctionDeclaration: function(tree) {
      if (this.block_ == this.scope_)
        this.bind_(tree.name.identifierToken);
    },
    visitFunctionExpression: function(tree) {},
    visitVariableDeclarationList: function(tree) {
      if ((tree.declarationType == VAR && this.includeFunctionScope_) || (tree.declarationType != VAR && this.block_ == this.scope_)) {
        $traceurRuntime.superCall(this, $VariableBinder.prototype, "visitVariableDeclarationList", [tree]);
      } else {
        var decls = tree.declarations;
        for (var i = 0; i < decls.length; i++) {
          this.visitAny(decls[i].initializer);
        }
      }
    },
    visitVariableDeclaration: function(tree) {
      this.bindVariableDeclaration_(tree.lvalue);
      $traceurRuntime.superCall(this, $VariableBinder.prototype, "visitVariableDeclaration", [tree]);
    },
    bind_: function(identifier) {
      assert(typeof identifier.value == 'string');
      this.identifiers_[identifier.value] = true;
    },
    bindParameter_: function(parameter) {
      if (parameter.type === FORMAL_PARAMETER)
        parameter = parameter.parameter;
      if (parameter.isRestParameter()) {
        this.bind_(parameter.identifier);
      } else {
        this.bindVariableDeclaration_(parameter.binding);
      }
    },
    bindVariableDeclaration_: function(tree) {
      switch (tree.type) {
        case BINDING_ELEMENT:
          this.bindVariableDeclaration_(tree.binding);
          break;
        case BINDING_IDENTIFIER:
          this.bind_(tree.identifierToken);
          break;
        case ARRAY_PATTERN:
          var elements = tree.elements;
          for (var i = 0; i < elements.length; i++) {
            this.bindVariableDeclaration_(elements[i]);
          }
          break;
        case SPREAD_PATTERN_ELEMENT:
          this.bindVariableDeclaration_(tree.lvalue);
          break;
        case OBJECT_PATTERN:
          var fields = tree.fields;
          for (var i = 0; i < fields.length; i++) {
            this.bindVariableDeclaration_(fields[i]);
          }
          break;
        case OBJECT_PATTERN_FIELD:
          var field = tree;
          if (field.element == null) {
            this.bind_(field.name);
          } else {
            this.bindVariableDeclaration_(field.element);
          }
          break;
        case PAREN_EXPRESSION:
          this.bindVariableDeclaration_(tree.expression);
          break;
        default:
          throw new Error('unreachable');
      }
    }
  }, {}, ParseTreeVisitor);
  return {
    get variablesInBlock() {
      return variablesInBlock;
    },
    get variablesInFunction() {
      return variablesInFunction;
    },
    get VariableBinder() {
      return VariableBinder;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/AlphaRenamer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/AlphaRenamer";
  var $__139 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      FunctionDeclaration = $__139.FunctionDeclaration,
      FunctionExpression = $__139.FunctionExpression;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__139 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      ARGUMENTS = $__139.ARGUMENTS,
      THIS = $__139.THIS;
  var createIdentifierExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createIdentifierExpression;
  var $__139 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/VariableBinder")),
      variablesInBlock = $__139.variablesInBlock,
      variablesInFunction = $__139.variablesInFunction;
  var AlphaRenamer = function AlphaRenamer(oldName, newName) {
    $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "constructor", []);
    this.oldName_ = oldName;
    this.newName_ = newName;
  };
  var $AlphaRenamer = AlphaRenamer;
  ($traceurRuntime.createClass)(AlphaRenamer, {
    transformBlock: function(tree) {
      if (this.oldName_ in variablesInBlock(tree)) {
        return tree;
      } else {
        return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformBlock", [tree]);
      }
    },
    transformIdentifierExpression: function(tree) {
      if (this.oldName_ == tree.identifierToken.value) {
        return createIdentifierExpression(this.newName_);
      } else {
        return tree;
      }
    },
    transformThisExpression: function(tree) {
      if (this.oldName_ !== THIS)
        return tree;
      return createIdentifierExpression(this.newName_);
    },
    transformFunctionDeclaration: function(tree) {
      if (this.oldName_ === tree.name) {
        tree = new FunctionDeclaration(tree.location, this.newName_, tree.functionKind, tree.parameterList, tree.typeAnnotation, tree.annotations, tree.functionBody);
      }
      if (this.getDoNotRecurse(tree))
        return tree;
      return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      if (this.oldName_ === tree.name) {
        tree = new FunctionExpression(tree.location, this.newName_, tree.functionKind, tree.parameterList, tree.typeAnnotation, tree.annotations, tree.functionBody);
      }
      if (this.getDoNotRecurse(tree))
        return tree;
      return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformFunctionExpression", [tree]);
    },
    getDoNotRecurse: function(tree) {
      return this.oldName_ === ARGUMENTS || this.oldName_ === THIS || this.oldName_ in variablesInFunction(tree);
    },
    transformCatch: function(tree) {
      if (!tree.binding.isPattern() && this.oldName_ === tree.binding.identifierToken.value) {
        return tree;
      }
      return $traceurRuntime.superCall(this, $AlphaRenamer.prototype, "transformCatch", [tree]);
    }
  }, {rename: function(tree, oldName, newName) {
      return new $AlphaRenamer(oldName, newName).transformAny(tree);
    }}, ParseTreeTransformer);
  return {get AlphaRenamer() {
      return AlphaRenamer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/alphaRenameThisAndArguments", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/alphaRenameThisAndArguments";
  var $__141 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      ARGUMENTS = $__141.ARGUMENTS,
      THIS = $__141.THIS;
  var AlphaRenamer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AlphaRenamer")).AlphaRenamer;
  var FindInFunctionScope = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindInFunctionScope")).FindInFunctionScope;
  var FindThisOrArguments = function FindThisOrArguments(tree) {
    this.foundThis = false;
    this.foundArguments = false;
    $traceurRuntime.superCall(this, $FindThisOrArguments.prototype, "constructor", [tree]);
  };
  var $FindThisOrArguments = FindThisOrArguments;
  ($traceurRuntime.createClass)(FindThisOrArguments, {
    visitThisExpression: function(tree) {
      this.foundThis = true;
      this.found = this.foundArguments;
    },
    visitIdentifierExpression: function(tree) {
      if (tree.identifierToken.value === ARGUMENTS) {
        this.foundArguments = true;
        this.found = this.foundThis;
      }
    }
  }, {}, FindInFunctionScope);
  var $__default = function alphaRenameThisAndArguments(tempVarTransformer, tree) {
    var finder = new FindThisOrArguments(tree);
    if (finder.foundArguments) {
      var argumentsTempName = tempVarTransformer.addTempVarForArguments();
      tree = AlphaRenamer.rename(tree, ARGUMENTS, argumentsTempName);
    }
    if (finder.foundThis) {
      var thisTempName = tempVarTransformer.addTempVarForThis();
      tree = AlphaRenamer.rename(tree, THIS, thisTempName);
    }
    return tree;
  };
  return {get default() {
      return $__default;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ComprehensionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ComprehensionTransformer";
  var alphaRenameThisAndArguments = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/alphaRenameThisAndArguments")).default;
  var FunctionExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).FunctionExpression;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__143 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      LET = $__143.LET,
      STAR = $__143.STAR,
      VAR = $__143.VAR;
  var $__143 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      COMPREHENSION_FOR = $__143.COMPREHENSION_FOR,
      COMPREHENSION_IF = $__143.COMPREHENSION_IF;
  var Token = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Token")).Token;
  var $__143 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createCallExpression = $__143.createCallExpression,
      createEmptyParameterList = $__143.createEmptyParameterList,
      createForOfStatement = $__143.createForOfStatement,
      createFunctionBody = $__143.createFunctionBody,
      createIfStatement = $__143.createIfStatement,
      createParenExpression = $__143.createParenExpression,
      createVariableDeclarationList = $__143.createVariableDeclarationList;
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  var ComprehensionTransformer = function ComprehensionTransformer() {
    $traceurRuntime.defaultSuperCall(this, $ComprehensionTransformer.prototype, arguments);
  };
  var $ComprehensionTransformer = ComprehensionTransformer;
  ($traceurRuntime.createClass)(ComprehensionTransformer, {transformComprehension: function(tree, statement, isGenerator) {
      var prefix = arguments[3];
      var suffix = arguments[4];
      var bindingKind = isGenerator || !options.blockBinding ? VAR : LET;
      var statements = prefix ? [prefix] : [];
      for (var i = tree.comprehensionList.length - 1; i >= 0; i--) {
        var item = tree.comprehensionList[i];
        switch (item.type) {
          case COMPREHENSION_IF:
            var expression = this.transformAny(item.expression);
            statement = createIfStatement(expression, statement);
            break;
          case COMPREHENSION_FOR:
            var left = this.transformAny(item.left);
            var iterator = this.transformAny(item.iterator);
            var initializer = createVariableDeclarationList(bindingKind, left, null);
            statement = createForOfStatement(initializer, iterator, statement);
            break;
          default:
            throw new Error('Unreachable.');
        }
      }
      statement = alphaRenameThisAndArguments(this, statement);
      statements.push(statement);
      if (suffix)
        statements.push(suffix);
      var functionKind = isGenerator ? new Token(STAR, null) : null;
      var func = new FunctionExpression(null, null, functionKind, createEmptyParameterList(), null, [], createFunctionBody(statements));
      return createParenExpression(createCallExpression(func));
    }}, {}, TempVarTransformer);
  return {get ComprehensionTransformer() {
      return ComprehensionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ArrayComprehensionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ArrayComprehensionTransformer";
  var $__144 = Object.freeze(Object.defineProperties(["var ", " = 0, ", " = [];"], {raw: {value: Object.freeze(["var ", " = 0, ", " = [];"])}})),
      $__145 = Object.freeze(Object.defineProperties(["", "[", "++] = ", ";"], {raw: {value: Object.freeze(["", "[", "++] = ", ";"])}})),
      $__146 = Object.freeze(Object.defineProperties(["return ", ";"], {raw: {value: Object.freeze(["return ", ";"])}}));
  var ComprehensionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ComprehensionTransformer")).ComprehensionTransformer;
  var createIdentifierExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createIdentifierExpression;
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  var ArrayComprehensionTransformer = function ArrayComprehensionTransformer() {
    $traceurRuntime.defaultSuperCall(this, $ArrayComprehensionTransformer.prototype, arguments);
  };
  var $ArrayComprehensionTransformer = ArrayComprehensionTransformer;
  ($traceurRuntime.createClass)(ArrayComprehensionTransformer, {transformArrayComprehension: function(tree) {
      this.pushTempVarState();
      var expression = this.transformAny(tree.expression);
      var index = createIdentifierExpression(this.getTempIdentifier());
      var result = createIdentifierExpression(this.getTempIdentifier());
      var tempVarsStatatement = parseStatement($__144, index, result);
      var statement = parseStatement($__145, result, index, expression);
      var returnStatement = parseStatement($__146, result);
      var functionKind = null;
      var result = this.transformComprehension(tree, statement, functionKind, tempVarsStatatement, returnStatement);
      this.popTempVarState();
      return result;
    }}, {}, ComprehensionTransformer);
  return {get ArrayComprehensionTransformer() {
      return ArrayComprehensionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ArrowFunctionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ArrowFunctionTransformer";
  var FormalParameterList = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).FormalParameterList;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__150 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      FUNCTION_BODY = $__150.FUNCTION_BODY,
      FUNCTION_EXPRESSION = $__150.FUNCTION_EXPRESSION;
  var alphaRenameThisAndArguments = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/alphaRenameThisAndArguments")).default;
  var $__150 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createFunctionBody = $__150.createFunctionBody,
      createFunctionExpression = $__150.createFunctionExpression,
      createParenExpression = $__150.createParenExpression,
      createReturnStatement = $__150.createReturnStatement;
  var ArrowFunctionTransformer = function ArrowFunctionTransformer() {
    $traceurRuntime.defaultSuperCall(this, $ArrowFunctionTransformer.prototype, arguments);
  };
  var $ArrowFunctionTransformer = ArrowFunctionTransformer;
  ($traceurRuntime.createClass)(ArrowFunctionTransformer, {transformArrowFunctionExpression: function(tree) {
      var parameters;
      if (tree.parameterList) {
        parameters = this.transformAny(tree.parameterList).parameters;
      } else {
        parameters = [];
      }
      var alphaRenamed = alphaRenameThisAndArguments(this, tree);
      var functionBody = this.transformAny(alphaRenamed.functionBody);
      if (functionBody.type != FUNCTION_BODY) {
        functionBody = createFunctionBody([createReturnStatement(functionBody)]);
      }
      return createParenExpression(createFunctionExpression(new FormalParameterList(null, parameters), functionBody));
    }}, {}, TempVarTransformer);
  return {get ArrowFunctionTransformer() {
      return ArrowFunctionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/BlockBindingTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/BlockBindingTransformer";
  var AlphaRenamer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AlphaRenamer")).AlphaRenamer;
  var $__153 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINDING_IDENTIFIER = $__153.BINDING_IDENTIFIER,
      BLOCK = $__153.BLOCK,
      VARIABLE_DECLARATION_LIST = $__153.VARIABLE_DECLARATION_LIST;
  var $__153 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      FunctionDeclaration = $__153.FunctionDeclaration,
      FunctionExpression = $__153.FunctionExpression;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__153 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      CONST = $__153.CONST,
      LET = $__153.LET,
      VAR = $__153.VAR;
  var $__153 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentExpression = $__153.createAssignmentExpression,
      createBindingIdentifier = $__153.createBindingIdentifier,
      createBlock = $__153.createBlock,
      createCatch = $__153.createCatch,
      createEmptyStatement = $__153.createEmptyStatement,
      createExpressionStatement = $__153.createExpressionStatement,
      createFinally = $__153.createFinally,
      createForInStatement = $__153.createForInStatement,
      createForStatement = $__153.createForStatement,
      createFunctionBody = $__153.createFunctionBody,
      createIdentifierExpression = $__153.createIdentifierExpression,
      createIdentifierToken = $__153.createIdentifierToken,
      createThrowStatement = $__153.createThrowStatement,
      createTryStatement = $__153.createTryStatement,
      createUndefinedExpression = $__153.createUndefinedExpression,
      createVariableDeclaration = $__153.createVariableDeclaration,
      createVariableDeclarationList = $__153.createVariableDeclarationList,
      createVariableStatement = $__153.createVariableStatement;
  var ScopeType = {
    SCRIPT: 'SCRIPT',
    FUNCTION: 'FUNCTION',
    BLOCK: 'BLOCK'
  };
  var Scope = function Scope(parent, type) {
    this.parent = parent;
    this.type = type;
    this.blockVariables = null;
  };
  ($traceurRuntime.createClass)(Scope, {addBlockScopedVariable: function(value) {
      if (!this.blockVariables) {
        this.blockVariables = Object.create(null);
      }
      this.blockVariables[value] = true;
    }}, {});
  ;
  var Rename = function Rename(oldName, newName) {
    this.oldName = oldName;
    this.newName = newName;
  };
  ($traceurRuntime.createClass)(Rename, {}, {});
  function renameAll(renames, tree) {
    renames.forEach((function(rename) {
      tree = AlphaRenamer.rename(tree, rename.oldName, rename.newName);
    }));
    return tree;
  }
  function toBlock(statement) {
    return statement.type == BLOCK ? statement : createBlock(statement);
  }
  var BlockBindingTransformer = function BlockBindingTransformer(stateAllocator) {
    $traceurRuntime.superCall(this, $BlockBindingTransformer.prototype, "constructor", []);
    this.scope_ = null;
  };
  var $BlockBindingTransformer = BlockBindingTransformer;
  ($traceurRuntime.createClass)(BlockBindingTransformer, {
    createScriptScope_: function() {
      return new Scope(this.scope_, ScopeType.SCRIPT);
    },
    createFunctionScope_: function() {
      if (this.scope_ == null) {
        throw new Error('Top level function scope found.');
      }
      return new Scope(this.scope_, ScopeType.FUNCTION);
    },
    createBlockScope_: function() {
      if (this.scope_ == null) {
        throw new Error('Top level block scope found.');
      }
      return new Scope(this.scope_, ScopeType.BLOCK);
    },
    push_: function(scope) {
      this.scope_ = scope;
      return scope;
    },
    pop_: function(scope) {
      if (this.scope_ != scope) {
        throw new Error('BlockBindingTransformer scope mismatch');
      }
      this.scope_ = scope.parent;
    },
    transformBlock: function(tree) {
      var scope = this.push_(this.createBlockScope_());
      var statements = this.transformList(tree.statements);
      if (scope.blockVariables != null) {
        tree = toBlock(this.rewriteAsCatch_(scope.blockVariables, createBlock(statements)));
      } else if (statements != tree.statements) {
        tree = createBlock(statements);
      }
      this.pop_(scope);
      return tree;
    },
    rewriteAsCatch_: function(blockVariables, statement) {
      for (var variable in blockVariables) {
        statement = createTryStatement(createBlock(createThrowStatement(createUndefinedExpression())), createCatch(createBindingIdentifier(variable), toBlock(statement)), null);
      }
      return statement;
    },
    transformClassDeclaration: function(tree) {
      throw new Error('ClassDeclaration should be transformed away.');
    },
    transformForInStatement: function(tree) {
      var treeBody = tree.body;
      var initializer;
      if (tree.initializer != null && tree.initializer.type == VARIABLE_DECLARATION_LIST) {
        var variables = tree.initializer;
        if (variables.declarations.length != 1) {
          throw new Error('for .. in has != 1 variables');
        }
        var variable = variables.declarations[0];
        var variableName = this.getVariableName_(variable);
        switch (variables.declarationType) {
          case LET:
          case CONST:
            {
              if (variable.initializer != null) {
                throw new Error('const/let in for-in may not have an initializer');
              }
              initializer = createVariableDeclarationList(VAR, ("$" + variableName), null);
              treeBody = this.prependToBlock_(createVariableStatement(LET, variableName, createIdentifierExpression(("$" + variableName))), treeBody);
              break;
            }
          case VAR:
            initializer = this.transformVariables_(variables);
            break;
          default:
            throw new Error('Unreachable.');
        }
      } else {
        initializer = this.transformAny(tree.initializer);
      }
      var result = tree;
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(treeBody);
      if (initializer != tree.initializer || collection != tree.collection || body != tree.body) {
        result = createForInStatement(initializer, collection, body);
      }
      return result;
    },
    prependToBlock_: function(statement, body) {
      if (body.type == BLOCK) {
        var block = body;
        var list = $traceurRuntime.spread([statement], block.statements);
        return createBlock(list);
      } else {
        return createBlock(statement, body);
      }
    },
    transformForStatement: function(tree) {
      var initializer;
      if (tree.initializer != null && tree.initializer.type == VARIABLE_DECLARATION_LIST) {
        var variables = tree.initializer;
        switch (variables.declarationType) {
          case LET:
          case CONST:
            return this.transformForLet_(tree, variables);
          case VAR:
            initializer = this.transformVariables_(variables);
            break;
          default:
            throw new Error('Reached unreachable.');
        }
      } else {
        initializer = this.transformAny(tree.initializer);
      }
      var condition = this.transformAny(tree.condition);
      var increment = this.transformAny(tree.increment);
      var body = this.transformAny(tree.body);
      var result = tree;
      if (initializer != tree.initializer || condition != tree.condition || increment != tree.increment || body != tree.body) {
        result = createForStatement(initializer, condition, increment, body);
      }
      return result;
    },
    transformForLet_: function(tree, variables) {
      var $__151 = this;
      var copyFwd = [];
      var copyBak = [];
      var hoisted = [];
      var renames = [];
      variables.declarations.forEach((function(variable) {
        var variableName = $__151.getVariableName_(variable);
        var hoistedName = ("$" + variableName);
        var initializer = renameAll(renames, variable.initializer);
        hoisted.push(createVariableDeclaration(hoistedName, initializer));
        copyFwd.push(createVariableDeclaration(variableName, createIdentifierExpression(hoistedName)));
        copyBak.push(createExpressionStatement(createAssignmentExpression(createIdentifierExpression(hoistedName), createIdentifierExpression(variableName))));
        renames.push(new Rename(variableName, hoistedName));
      }));
      var condition = renameAll(renames, tree.condition);
      var increment = renameAll(renames, tree.increment);
      var transformedForLoop = createBlock(createVariableStatement(createVariableDeclarationList(LET, hoisted)), createForStatement(null, condition, increment, createBlock(createVariableStatement(createVariableDeclarationList(LET, copyFwd)), createTryStatement(toBlock(tree.body), null, createFinally(createBlock(copyBak))))));
      return this.transformAny(transformedForLoop);
    },
    transformFunctionDeclaration: function(tree) {
      var body = this.transformFunctionBody(tree.functionBody);
      var parameterList = this.transformAny(tree.parameterList);
      if (this.scope_.type === ScopeType.BLOCK) {
        this.scope_.addBlockScopedVariable(tree.name.identifierToken.value);
        return createExpressionStatement(createAssignmentExpression(createIdentifierExpression(tree.name.identifierToken), new FunctionExpression(tree.location, null, tree.functionKind, parameterList, tree.typeAnnotation, tree.annotations, body)));
      }
      if (body === tree.functionBody && parameterList === tree.parameterList) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, tree.name, tree.functionKind, parameterList, tree.typeAnnotation, tree.annotations, body);
    },
    transformScript: function(tree) {
      var scope = this.push_(this.createScriptScope_());
      var result = $traceurRuntime.superCall(this, $BlockBindingTransformer.prototype, "transformScript", [tree]);
      this.pop_(scope);
      return result;
    },
    transformVariableDeclaration: function(tree) {
      throw new Error('Should never see variable declaration tree.');
    },
    transformVariableDeclarationList: function(tree) {
      throw new Error('Should never see variable declaration list.');
    },
    transformVariableStatement: function(tree) {
      if (this.scope_.type == ScopeType.BLOCK) {
        switch (tree.declarations.declarationType) {
          case CONST:
          case LET:
            return this.transformBlockVariables_(tree.declarations);
          default:
            break;
        }
      }
      var variables = this.transformVariables_(tree.declarations);
      if (variables != tree.declarations) {
        tree = createVariableStatement(variables);
      }
      return tree;
    },
    transformBlockVariables_: function(tree) {
      var $__151 = this;
      var variables = tree.declarations;
      var comma = [];
      variables.forEach((function(variable) {
        switch (tree.declarationType) {
          case LET:
          case CONST:
            break;
          default:
            throw new Error('Only let/const allowed here.');
        }
        var variableName = $__151.getVariableName_(variable);
        $__151.scope_.addBlockScopedVariable(variableName);
        var initializer = $__151.transformAny(variable.initializer);
        if (initializer != null) {
          comma.push(createAssignmentExpression(createIdentifierExpression(variableName), initializer));
        }
      }));
      switch (comma.length) {
        case 0:
          return createEmptyStatement();
        case 1:
          return createExpressionStatement(comma[0]);
        default:
          for (var i = 0; i < comma.length; i++) {
            comma[i] = createExpressionStatement(comma[i]);
          }
          return createBlock(comma);
      }
    },
    transformVariables_: function(tree) {
      var variables = tree.declarations;
      var transformed = null;
      for (var index = 0; index < variables.length; index++) {
        var variable = variables[index];
        var variableName = this.getVariableName_(variable);
        var initializer = this.transformAny(variable.initializer);
        if (transformed != null || initializer != variable.initializer) {
          if (transformed == null) {
            transformed = variables.slice(0, index);
          }
          transformed.push(createVariableDeclaration(createIdentifierToken(variableName), initializer));
        }
      }
      if (transformed != null || tree.declarationType != VAR) {
        var declarations = transformed != null ? transformed : tree.declarations;
        var declarationType = tree.declarationType != VAR ? VAR : tree.declarationType;
        tree = createVariableDeclarationList(declarationType, declarations);
      }
      return tree;
    },
    transformFunctionBody: function(body) {
      var scope = this.push_(this.createFunctionScope_());
      body = this.transformFunctionBodyStatements_(body);
      this.pop_(scope);
      return body;
    },
    transformFunctionBodyStatements_: function(tree) {
      var statements = this.transformList(tree.statements);
      if (this.scope_.blockVariables != null) {
        tree = this.rewriteAsCatch_(this.scope_.blockVariables, createBlock(statements));
      } else if (statements != tree.statements) {
        tree = createFunctionBody(statements);
      }
      return tree;
    },
    getVariableName_: function(variable) {
      var lvalue = variable.lvalue;
      if (lvalue.type == BINDING_IDENTIFIER) {
        return lvalue.identifierToken.value;
      }
      throw new Error('Unexpected destructuring declaration found.');
    }
  }, {}, ParseTreeTransformer);
  return {get BlockBindingTransformer() {
      return BlockBindingTransformer;
    }};
});
System.register("traceur@0.0.43/src/semantics/util", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/semantics/util";
  var $__154 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      IDENTIFIER_EXPRESSION = $__154.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__154.LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__154.PAREN_EXPRESSION,
      UNARY_EXPRESSION = $__154.UNARY_EXPRESSION;
  var UNDEFINED = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).UNDEFINED;
  var VOID = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VOID;
  function hasUseStrict(list) {
    for (var i = 0; i < list.length; i++) {
      if (!list[i].isDirectivePrologue())
        return false;
      if (list[i].isUseStrictDirective())
        return true;
    }
    return false;
  }
  function isUndefined(tree) {
    if (tree.type === PAREN_EXPRESSION)
      return isUndefined(tree.expression);
    return tree.type === IDENTIFIER_EXPRESSION && tree.identifierToken.value === UNDEFINED;
  }
  function isVoidExpression(tree) {
    if (tree.type === PAREN_EXPRESSION)
      return isVoidExpression(tree.expression);
    return tree.type === UNARY_EXPRESSION && tree.operator.type === VOID && isLiteralExpression(tree.operand);
  }
  function isLiteralExpression(tree) {
    if (tree.type === PAREN_EXPRESSION)
      return isLiteralExpression(tree.expression);
    return tree.type === LITERAL_EXPRESSION;
  }
  return {
    get hasUseStrict() {
      return hasUseStrict;
    },
    get isUndefined() {
      return isUndefined;
    },
    get isVoidExpression() {
      return isVoidExpression;
    },
    get isLiteralExpression() {
      return isLiteralExpression;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/MakeStrictTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/MakeStrictTransformer";
  var $__156 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      FunctionBody = $__156.FunctionBody,
      Script = $__156.Script;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var createUseStrictDirective = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createUseStrictDirective;
  var hasUseStrict = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/util")).hasUseStrict;
  function prepend(statements) {
    return $traceurRuntime.spread([createUseStrictDirective()], statements);
  }
  var MakeStrictTransformer = function MakeStrictTransformer() {
    $traceurRuntime.defaultSuperCall(this, $MakeStrictTransformer.prototype, arguments);
  };
  var $MakeStrictTransformer = MakeStrictTransformer;
  ($traceurRuntime.createClass)(MakeStrictTransformer, {
    transformScript: function(tree) {
      if (hasUseStrict(tree.scriptItemList))
        return tree;
      return new Script(tree.location, prepend(tree.scriptItemList));
    },
    transformFunctionBody: function(tree) {
      if (hasUseStrict(tree.statements))
        return tree;
      return new FunctionBody(tree.location, prepend(tree.statements));
    }
  }, {transformTree: function(tree) {
      return new $MakeStrictTransformer().transformAny(tree);
    }}, ParseTreeTransformer);
  return {get MakeStrictTransformer() {
      return MakeStrictTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/assignmentOperatorToBinaryOperator", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/assignmentOperatorToBinaryOperator";
  var $__157 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AMPERSAND = $__157.AMPERSAND,
      AMPERSAND_EQUAL = $__157.AMPERSAND_EQUAL,
      BAR = $__157.BAR,
      BAR_EQUAL = $__157.BAR_EQUAL,
      CARET = $__157.CARET,
      CARET_EQUAL = $__157.CARET_EQUAL,
      LEFT_SHIFT = $__157.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__157.LEFT_SHIFT_EQUAL,
      MINUS = $__157.MINUS,
      MINUS_EQUAL = $__157.MINUS_EQUAL,
      PERCENT = $__157.PERCENT,
      PERCENT_EQUAL = $__157.PERCENT_EQUAL,
      PLUS = $__157.PLUS,
      PLUS_EQUAL = $__157.PLUS_EQUAL,
      RIGHT_SHIFT = $__157.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__157.RIGHT_SHIFT_EQUAL,
      SLASH = $__157.SLASH,
      SLASH_EQUAL = $__157.SLASH_EQUAL,
      STAR = $__157.STAR,
      STAR_EQUAL = $__157.STAR_EQUAL,
      UNSIGNED_RIGHT_SHIFT = $__157.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__157.UNSIGNED_RIGHT_SHIFT_EQUAL;
  function assignmentOperatorToBinaryOperator(type) {
    switch (type) {
      case STAR_EQUAL:
        return STAR;
      case SLASH_EQUAL:
        return SLASH;
      case PERCENT_EQUAL:
        return PERCENT;
      case PLUS_EQUAL:
        return PLUS;
      case MINUS_EQUAL:
        return MINUS;
      case LEFT_SHIFT_EQUAL:
        return LEFT_SHIFT;
      case RIGHT_SHIFT_EQUAL:
        return RIGHT_SHIFT;
      case UNSIGNED_RIGHT_SHIFT_EQUAL:
        return UNSIGNED_RIGHT_SHIFT;
      case AMPERSAND_EQUAL:
        return AMPERSAND;
      case CARET_EQUAL:
        return CARET;
      case BAR_EQUAL:
        return BAR;
      default:
        throw Error('unreachable');
    }
  }
  var $__default = assignmentOperatorToBinaryOperator;
  return {get default() {
      return $__default;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ExplodeExpressionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ExplodeExpressionTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__159 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentExpression = $__159.createAssignmentExpression,
      createCommaExpression = $__159.createCommaExpression,
      id = $__159.createIdentifierExpression,
      createMemberExpression = $__159.createMemberExpression,
      createNumberLiteral = $__159.createNumberLiteral,
      createOperatorToken = $__159.createOperatorToken,
      createParenExpression = $__159.createParenExpression;
  var $__159 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      AND = $__159.AND,
      EQUAL = $__159.EQUAL,
      MINUS = $__159.MINUS,
      MINUS_EQUAL = $__159.MINUS_EQUAL,
      MINUS_MINUS = $__159.MINUS_MINUS,
      OR = $__159.OR,
      PLUS = $__159.PLUS,
      PLUS_EQUAL = $__159.PLUS_EQUAL,
      PLUS_PLUS = $__159.PLUS_PLUS;
  var $__159 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      COMMA_EXPRESSION = $__159.COMMA_EXPRESSION,
      IDENTIFIER_EXPRESSION = $__159.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__159.LITERAL_EXPRESSION,
      MEMBER_EXPRESSION = $__159.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__159.MEMBER_LOOKUP_EXPRESSION,
      PROPERTY_NAME_ASSIGNMENT = $__159.PROPERTY_NAME_ASSIGNMENT,
      SPREAD_EXPRESSION = $__159.SPREAD_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__159.TEMPLATE_LITERAL_PORTION;
  var $__159 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ArgumentList = $__159.ArgumentList,
      ArrayLiteralExpression = $__159.ArrayLiteralExpression,
      AwaitExpression = $__159.AwaitExpression,
      BinaryOperator = $__159.BinaryOperator,
      CallExpression = $__159.CallExpression,
      ConditionalExpression = $__159.ConditionalExpression,
      MemberExpression = $__159.MemberExpression,
      MemberLookupExpression = $__159.MemberLookupExpression,
      NewExpression = $__159.NewExpression,
      ObjectLiteralExpression = $__159.ObjectLiteralExpression,
      PropertyNameAssignment = $__159.PropertyNameAssignment,
      SpreadExpression = $__159.SpreadExpression,
      TemplateLiteralExpression = $__159.TemplateLiteralExpression,
      TemplateSubstitution = $__159.TemplateSubstitution,
      UnaryExpression = $__159.UnaryExpression,
      YieldExpression = $__159.YieldExpression;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var assignmentOperatorToBinaryOperator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/assignmentOperatorToBinaryOperator")).default;
  var CommaExpressionBuilder = function CommaExpressionBuilder(tempVar) {
    this.tempVar = tempVar;
    this.expressions = [];
  };
  ($traceurRuntime.createClass)(CommaExpressionBuilder, {
    add: function(tree) {
      var $__160;
      if (tree.type === COMMA_EXPRESSION)
        ($__160 = this.expressions).push.apply($__160, $traceurRuntime.toObject(getExpressions(tree)));
      return this;
    },
    build: function(tree) {
      var tempVar = this.tempVar;
      this.expressions.push(createAssignmentExpression(tempVar, tree), tempVar);
      return createCommaExpression(this.expressions);
    }
  }, {});
  function getResult(tree) {
    if (tree.type === COMMA_EXPRESSION)
      return tree.expressions[tree.expressions.length - 1];
    return tree;
  }
  function getExpressions(tree) {
    if (tree.type === COMMA_EXPRESSION)
      return tree.expressions.slice(0, -1);
    return [];
  }
  var ExplodeExpressionTransformer = function ExplodeExpressionTransformer(tempVarTransformer) {
    $traceurRuntime.superCall(this, $ExplodeExpressionTransformer.prototype, "constructor", []);
    this.tempVarTransformer_ = tempVarTransformer;
  };
  var $ExplodeExpressionTransformer = ExplodeExpressionTransformer;
  ($traceurRuntime.createClass)(ExplodeExpressionTransformer, {
    addTempVar: function() {
      var tmpId = this.tempVarTransformer_.addTempVar();
      return id(tmpId);
    },
    transformUnaryExpression: function(tree) {
      if (tree.operator.type == PLUS_PLUS)
        return this.transformUnaryNumeric(tree, PLUS_EQUAL);
      if (tree.operator.type == MINUS_MINUS)
        return this.transformUnaryNumeric(tree, MINUS_EQUAL);
      var operand = this.transformAny(tree.operand);
      if (operand === tree.operand)
        return tree;
      var expressions = $traceurRuntime.spread(getExpressions(operand), [new UnaryExpression(tree.location, tree.operator, getResult(operand))]);
      return createCommaExpression(expressions);
    },
    transformUnaryNumeric: function(tree, operator) {
      return this.transformAny(new BinaryOperator(tree.location, tree.operand, createOperatorToken(operator), createNumberLiteral(1)));
    },
    transformPostfixExpression: function(tree) {
      if (tree.operand.type === MEMBER_EXPRESSION)
        return this.transformPostfixMemberExpression(tree);
      if (tree.operand.type === MEMBER_LOOKUP_EXPRESSION)
        return this.transformPostfixMemberLookupExpression(tree);
      assert(tree.operand.type === IDENTIFIER_EXPRESSION);
      var operand = tree.operand;
      var tmp = this.addTempVar();
      var operator = tree.operator.type === PLUS_PLUS ? PLUS : MINUS;
      var expressions = [createAssignmentExpression(tmp, operand), createAssignmentExpression(operand, new BinaryOperator(tree.location, tmp, createOperatorToken(operator), createNumberLiteral(1))), tmp];
      return createCommaExpression(expressions);
    },
    transformPostfixMemberExpression: function(tree) {
      var memberName = tree.operand.memberName;
      var operand = this.transformAny(tree.operand.operand);
      var tmp = this.addTempVar();
      var memberExpression = new MemberExpression(tree.operand.location, getResult(operand), memberName);
      var operator = tree.operator.type === PLUS_PLUS ? PLUS : MINUS;
      var expressions = $traceurRuntime.spread(getExpressions(operand), [createAssignmentExpression(tmp, memberExpression), createAssignmentExpression(memberExpression, new BinaryOperator(tree.location, tmp, createOperatorToken(operator), createNumberLiteral(1))), tmp]);
      return createCommaExpression(expressions);
    },
    transformPostfixMemberLookupExpression: function(tree) {
      var memberExpression = this.transformAny(tree.operand.memberExpression);
      var operand = this.transformAny(tree.operand.operand);
      var tmp = this.addTempVar();
      var memberLookupExpression = new MemberLookupExpression(null, getResult(operand), getResult(memberExpression));
      var operator = tree.operator.type === PLUS_PLUS ? PLUS : MINUS;
      var expressions = $traceurRuntime.spread(getExpressions(operand), getExpressions(memberExpression), [createAssignmentExpression(tmp, memberLookupExpression), createAssignmentExpression(memberLookupExpression, new BinaryOperator(tree.location, tmp, createOperatorToken(operator), createNumberLiteral(1))), tmp]);
      return createCommaExpression(expressions);
    },
    transformYieldExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      return this.createCommaExpressionBuilder().add(expression).build(new YieldExpression(tree.location, getResult(expression), tree.isYieldFor));
    },
    transformAwaitExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      return this.createCommaExpressionBuilder().add(expression).build(new AwaitExpression(tree.location, getResult(expression)));
    },
    transformParenExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression)
        return tree;
      var result = getResult(expression);
      if (result.type === IDENTIFIER_EXPRESSION)
        return expression;
      return this.createCommaExpressionBuilder().add(expression).build(result);
    },
    transformCommaExpression: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions === tree.expressions)
        return tree;
      var builder = new CommaExpressionBuilder(null);
      for (var i = 0; i < expressions.length; i++) {
        builder.add(expressions[i]);
      }
      return createCommaExpression($traceurRuntime.spread(builder.expressions, [getResult(expressions[expressions.length - 1])]));
    },
    transformMemberExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      return this.createCommaExpressionBuilder().add(operand).build(new MemberExpression(tree.location, getResult(operand), tree.memberName));
    },
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      return this.createCommaExpressionBuilder().add(operand).add(memberExpression).build(new MemberLookupExpression(tree.location, getResult(operand), getResult(memberExpression)));
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.isAssignmentOperator())
        return this.transformAssignmentExpression(tree);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left === tree.left && right === tree.right)
        return tree;
      if (tree.operator.type === OR)
        return this.transformOr(left, right);
      if (tree.operator.type === AND)
        return this.transformAnd(left, right);
      var expressions = $traceurRuntime.spread(getExpressions(left), getExpressions(right), [new BinaryOperator(tree.location, getResult(left), tree.operator, getResult(right))]);
      return createCommaExpression(expressions);
    },
    transformAssignmentExpression: function(tree) {
      var left = tree.left;
      if (left.type === MEMBER_EXPRESSION)
        return this.transformAssignMemberExpression(tree);
      if (left.type === MEMBER_LOOKUP_EXPRESSION)
        return this.transformAssignMemberLookupExpression(tree);
      assert(tree.left.type === IDENTIFIER_EXPRESSION);
      if (tree.operator.type === EQUAL) {
        var left = this.transformAny(left);
        var right = this.transformAny(tree.right);
        var expressions = $traceurRuntime.spread(getExpressions(right), [createAssignmentExpression(left, getResult(right)), getResult(right)]);
        return createCommaExpression(expressions);
      }
      var right = this.transformAny(tree.right);
      var tmp = this.addTempVar();
      var binop = createOperatorToken(assignmentOperatorToBinaryOperator(tree.operator.type));
      var expressions = $traceurRuntime.spread(getExpressions(right), [createAssignmentExpression(tmp, new BinaryOperator(tree.location, left, binop, getResult(right))), createAssignmentExpression(left, tmp), tmp]);
      return createCommaExpression(expressions);
    },
    transformAssignMemberExpression: function(tree) {
      var left = tree.left;
      if (tree.operator.type === EQUAL) {
        var operand = this.transformAny(left.operand);
        var right = this.transformAny(tree.right);
        var expressions = $traceurRuntime.spread(getExpressions(operand), getExpressions(right), [new BinaryOperator(tree.location, new MemberExpression(left.location, getResult(operand), left.memberName), tree.operator, getResult(right)), getResult(right)]);
        return createCommaExpression(expressions);
      }
      var operand = this.transformAny(left.operand);
      var right = this.transformAny(tree.right);
      var tmp = this.addTempVar();
      var memberExpression = new MemberExpression(left.location, getResult(operand), left.memberName);
      var tmp2 = this.addTempVar();
      var binop = createOperatorToken(assignmentOperatorToBinaryOperator(tree.operator.type));
      var expressions = $traceurRuntime.spread(getExpressions(operand), getExpressions(right), [createAssignmentExpression(tmp, memberExpression), createAssignmentExpression(tmp2, new BinaryOperator(tree.location, tmp, binop, getResult(right))), createAssignmentExpression(memberExpression, tmp2), tmp2]);
      return createCommaExpression(expressions);
    },
    transformAssignMemberLookupExpression: function(tree) {
      var left = tree.left;
      if (tree.operator.type === EQUAL) {
        var operand = this.transformAny(left.operand);
        var memberExpression = this.transformAny(left.memberExpression);
        var right = this.transformAny(tree.right);
        var expressions = $traceurRuntime.spread(getExpressions(operand), getExpressions(memberExpression), getExpressions(right), [new BinaryOperator(tree.location, new MemberLookupExpression(left.location, getResult(operand), getResult(memberExpression)), tree.operator, getResult(right)), getResult(right)]);
        return createCommaExpression(expressions);
      }
      var operand = this.transformAny(left.operand);
      var memberExpression = this.transformAny(left.memberExpression);
      var right = this.transformAny(tree.right);
      var tmp = this.addTempVar();
      var memberLookupExpression = new MemberLookupExpression(left.location, getResult(operand), getResult(memberExpression));
      var tmp2 = this.addTempVar();
      var binop = createOperatorToken(assignmentOperatorToBinaryOperator(tree.operator.type));
      var expressions = $traceurRuntime.spread(getExpressions(operand), getExpressions(memberExpression), getExpressions(right), [createAssignmentExpression(tmp, memberLookupExpression), createAssignmentExpression(tmp2, new BinaryOperator(tree.location, tmp, binop, getResult(right))), createAssignmentExpression(memberLookupExpression, tmp2), tmp2]);
      return createCommaExpression(expressions);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements === tree.elements)
        return tree;
      var builder = this.createCommaExpressionBuilder();
      var results = [];
      for (var i = 0; i < elements.length; i++) {
        builder.add(elements[i]);
        results.push(getResult(elements[i]));
      }
      return builder.build(new ArrayLiteralExpression(tree.location, results));
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues === tree.propertyNameAndValues)
        return tree;
      var builder = this.createCommaExpressionBuilder();
      var results = [];
      for (var i = 0; i < propertyNameAndValues.length; i++) {
        if (propertyNameAndValues[i].type === PROPERTY_NAME_ASSIGNMENT) {
          builder.add(propertyNameAndValues[i].value);
          results.push(new PropertyNameAssignment(propertyNameAndValues[i].location, propertyNameAndValues[i].name, getResult(propertyNameAndValues[i].value)));
        } else {
          results.push(propertyNameAndValues[i]);
        }
      }
      return builder.build(new ObjectLiteralExpression(tree.location, results));
    },
    transformTemplateLiteralExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var elements = this.transformList(tree.elements);
      if (!operand && operand === tree.operand && elements === tree.elements)
        return tree;
      var builder = this.createCommaExpressionBuilder();
      if (operand)
        builder.add(operand);
      var results = [];
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].type === TEMPLATE_LITERAL_PORTION) {
          results.push(elements[i]);
        } else {
          var expression = elements[i].expression;
          builder.add(expression);
          var result = getResult(expression);
          results.push(new TemplateSubstitution(expression.location, result));
        }
      }
      return builder.build(new TemplateLiteralExpression(tree.location, operand && getResult(operand), results));
    },
    transformCallExpression: function(tree) {
      if (tree.operand.type === MEMBER_EXPRESSION)
        return this.transformCallMemberExpression(tree);
      if (tree.operand.type === MEMBER_LOOKUP_EXPRESSION)
        return this.transformCallMemberLookupExpression(tree);
      return this.transformCallAndNew_(tree, CallExpression);
    },
    transformNewExpression: function(tree) {
      return this.transformCallAndNew_(tree, NewExpression);
    },
    transformCallAndNew_: function(tree, ctor) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      var builder = this.createCommaExpressionBuilder().add(operand);
      var argResults = [];
      args.args.forEach((function(arg) {
        builder.add(arg);
        argResults.push(getResult(arg));
      }));
      return builder.build(new ctor(tree.location, getResult(operand), new ArgumentList(args.location, argResults)));
    },
    transformCallMemberExpression: function(tree) {
      var memberName = tree.operand.memberName;
      var operand = this.transformAny(tree.operand.operand);
      var tmp = this.addTempVar();
      var memberExpresssion = new MemberExpression(tree.operand.location, getResult(operand), memberName);
      var args = this.transformAny(tree.args);
      var expressions = $traceurRuntime.spread(getExpressions(operand), [createAssignmentExpression(tmp, memberExpresssion)]);
      var argResults = [getResult(operand)];
      args.args.forEach((function(arg) {
        var $__160;
        ($__160 = expressions).push.apply($__160, $traceurRuntime.toObject(getExpressions(arg)));
        argResults.push(getResult(arg));
      }));
      var callExpression = new CallExpression(tree.location, createMemberExpression(tmp, 'call'), new ArgumentList(args.location, argResults));
      var tmp2 = this.addTempVar();
      expressions.push(createAssignmentExpression(tmp2, callExpression), tmp2);
      return createCommaExpression(expressions);
    },
    transformCallMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand.operand);
      var memberExpression = this.transformAny(tree.operand.memberExpression);
      var tmp = this.addTempVar();
      var lookupExpresssion = new MemberLookupExpression(tree.operand.location, getResult(operand), getResult(memberExpression));
      var args = this.transformAny(tree.args);
      var expressions = $traceurRuntime.spread(getExpressions(operand), getExpressions(memberExpression), [createAssignmentExpression(tmp, lookupExpresssion)]);
      var argResults = [getResult(operand)];
      args.args.forEach((function(arg, i) {
        var $__160;
        ($__160 = expressions).push.apply($__160, $traceurRuntime.toObject(getExpressions(arg)));
        var result = getResult(arg);
        if (tree.args.args[i].type === SPREAD_EXPRESSION)
          result = new SpreadExpression(arg.location, result);
        argResults.push(result);
      }));
      var callExpression = new CallExpression(tree.location, createMemberExpression(tmp, 'call'), new ArgumentList(args.location, argResults));
      var tmp2 = this.addTempVar();
      expressions.push(createAssignmentExpression(tmp2, callExpression), tmp2);
      return createCommaExpression(expressions);
    },
    transformConditionalExpression: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition === tree.condition && left === tree.left && right === tree.right)
        return tree;
      var res = this.addTempVar();
      var leftTree = createCommaExpression($traceurRuntime.spread(getExpressions(left), [createAssignmentExpression(res, getResult(left))]));
      var rightTree = createCommaExpression($traceurRuntime.spread(getExpressions(right), [createAssignmentExpression(res, getResult(right))]));
      var expressions = $traceurRuntime.spread(getExpressions(condition), [new ConditionalExpression(tree.location, getResult(condition), createParenExpression(leftTree), createParenExpression(rightTree)), res]);
      return createCommaExpression(expressions);
    },
    transformOr: function(left, right) {
      var res = this.addTempVar();
      var leftTree = createCommaExpression([createAssignmentExpression(res, getResult(left))]);
      var rightTree = createCommaExpression($traceurRuntime.spread(getExpressions(right), [createAssignmentExpression(res, getResult(right))]));
      var expressions = $traceurRuntime.spread(getExpressions(left), [new ConditionalExpression(left.location, getResult(left), createParenExpression(leftTree), createParenExpression(rightTree)), res]);
      return createCommaExpression(expressions);
    },
    transformAnd: function(left, right) {
      var res = this.addTempVar();
      var leftTree = createCommaExpression($traceurRuntime.spread(getExpressions(right), [createAssignmentExpression(res, getResult(right))]));
      var rightTree = createCommaExpression([createAssignmentExpression(res, getResult(left))]);
      var expressions = $traceurRuntime.spread(getExpressions(left), [new ConditionalExpression(left.location, getResult(left), createParenExpression(leftTree), createParenExpression(rightTree)), res]);
      return createCommaExpression(expressions);
    },
    transformSpreadExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression)
        return tree;
      var result = getResult(expression);
      if (result.type !== SPREAD_EXPRESSION)
        result = new SpreadExpression(result.location, result);
      var expressions = $traceurRuntime.spread(getExpressions(expression), [result]);
      return createCommaExpression(expressions);
    },
    createCommaExpressionBuilder: function() {
      return new CommaExpressionBuilder(this.addTempVar());
    }
  }, {}, ParseTreeTransformer);
  return {get ExplodeExpressionTransformer() {
      return ExplodeExpressionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/SuperTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/SuperTransformer";
  var $__161 = Object.freeze(Object.defineProperties(["$traceurRuntime.superCall(", ", ", ", ", ",\n                                   ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.superCall(", ", ", ", ", ",\n                                   ", ")"])}})),
      $__162 = Object.freeze(Object.defineProperties(["$traceurRuntime.superGet(", ", ", ", ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.superGet(", ", ", ", ", ")"])}})),
      $__163 = Object.freeze(Object.defineProperties(["$traceurRuntime.superSet(", ", ", ", ", ",\n                                    ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.superSet(", ", ", ", ", ",\n                                    ", ")"])}}));
  var ExplodeExpressionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ExplodeExpressionTransformer")).ExplodeExpressionTransformer;
  var $__165 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      FunctionDeclaration = $__165.FunctionDeclaration,
      FunctionExpression = $__165.FunctionExpression;
  var $__165 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      LITERAL_PROPERTY_NAME = $__165.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__165.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__165.MEMBER_LOOKUP_EXPRESSION,
      SUPER_EXPRESSION = $__165.SUPER_EXPRESSION;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__165 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      EQUAL = $__165.EQUAL,
      MINUS_MINUS = $__165.MINUS_MINUS,
      PLUS_PLUS = $__165.PLUS_PLUS;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var $__165 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArrayLiteralExpression = $__165.createArrayLiteralExpression,
      createIdentifierExpression = $__165.createIdentifierExpression,
      createParenExpression = $__165.createParenExpression,
      createStringLiteral = $__165.createStringLiteral,
      createThisExpression = $__165.createThisExpression;
  var parseExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseExpression;
  var ExplodeSuperExpression = function ExplodeSuperExpression() {
    $traceurRuntime.defaultSuperCall(this, $ExplodeSuperExpression.prototype, arguments);
  };
  var $ExplodeSuperExpression = ExplodeSuperExpression;
  ($traceurRuntime.createClass)(ExplodeSuperExpression, {
    transformArrowFunctionExpression: function(tree) {
      return tree;
    },
    transformClassExpression: function(tree) {
      return tree;
    },
    transformFunctionBody: function(tree) {
      return tree;
    }
  }, {}, ExplodeExpressionTransformer);
  var SuperTransformer = function SuperTransformer(tempVarTransformer, protoName, methodTree, thisName) {
    this.tempVarTransformer_ = tempVarTransformer;
    this.protoName_ = protoName;
    this.method_ = methodTree;
    this.superCount_ = 0;
    this.thisVar_ = createIdentifierExpression(thisName);
    this.inNestedFunc_ = 0;
    this.nestedSuperCount_ = 0;
  };
  var $SuperTransformer = SuperTransformer;
  ($traceurRuntime.createClass)(SuperTransformer, {
    get hasSuper() {
      return this.superCount_ > 0;
    },
    get nestedSuper() {
      return this.nestedSuperCount_ > 0;
    },
    transformFunctionDeclaration: function(tree) {
      return this.transformFunction_(tree, FunctionDeclaration);
    },
    transformFunctionExpression: function(tree) {
      return this.transformFunction_(tree, FunctionExpression);
    },
    transformFunction_: function(tree, constructor) {
      var oldSuperCount = this.superCount_;
      this.inNestedFunc_++;
      var transformedTree = constructor === FunctionExpression ? $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformFunctionExpression", [tree]) : $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformFunctionDeclaration", [tree]);
      this.inNestedFunc_--;
      if (oldSuperCount !== this.superCount_)
        this.nestedSuperCount_ += this.superCount_ - oldSuperCount;
      return transformedTree;
    },
    transformGetAccessor: function(tree) {
      return tree;
    },
    transformSetAccessor: function(tree) {
      return tree;
    },
    transformPropertyMethodAssignMent: function(tree) {
      return tree;
    },
    transformCallExpression: function(tree) {
      if (this.method_ && tree.operand.type == SUPER_EXPRESSION) {
        this.superCount_++;
        assert(this.method_.name.type === LITERAL_PROPERTY_NAME);
        var methodName = this.method_.name.literalToken.value;
        return this.createSuperCallExpression_(methodName, tree);
      }
      if (hasSuperMemberExpression(tree.operand)) {
        this.superCount_++;
        var name;
        if (tree.operand.type == MEMBER_EXPRESSION)
          name = tree.operand.memberName.value;
        else
          name = tree.operand.memberExpression;
        return this.createSuperCallExpression_(name, tree);
      }
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformCallExpression", [tree]);
    },
    createSuperCallExpression_: function(methodName, tree) {
      var thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
      var args = createArrayLiteralExpression(tree.args.args);
      return this.createSuperCallExpression(thisExpr, this.protoName_, methodName, args);
    },
    createSuperCallExpression: function(thisExpr, protoName, methodName, args) {
      return parseExpression($__161, thisExpr, protoName, methodName, args);
    },
    transformMemberShared_: function(tree, name) {
      var thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
      return parseExpression($__162, thisExpr, this.protoName_, name);
    },
    transformMemberExpression: function(tree) {
      if (tree.operand.type === SUPER_EXPRESSION) {
        this.superCount_++;
        return this.transformMemberShared_(tree, createStringLiteral(tree.memberName.value));
      }
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformMemberExpression", [tree]);
    },
    transformMemberLookupExpression: function(tree) {
      if (tree.operand.type === SUPER_EXPRESSION)
        return this.transformMemberShared_(tree, tree.memberExpression);
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformMemberLookupExpression", [tree]);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.isAssignmentOperator() && hasSuperMemberExpression(tree.left)) {
        if (tree.operator.type !== EQUAL) {
          var exploded = new ExplodeSuperExpression(this.tempVarTransformer_).transformAny(tree);
          return this.transformAny(createParenExpression(exploded));
        }
        this.superCount_++;
        var name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ? tree.left.memberExpression : createStringLiteral(tree.left.memberName.value);
        var thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
        var right = this.transformAny(tree.right);
        return parseExpression($__163, thisExpr, this.protoName_, name, right);
      }
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformBinaryOperator", [tree]);
    },
    transformUnaryExpression: function(tree) {
      var transformed = this.transformIncrementDecrement_(tree);
      if (transformed)
        return transformed;
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformUnaryExpression", [tree]);
    },
    transformPostfixExpression: function(tree) {
      var transformed = this.transformIncrementDecrement_(tree);
      if (transformed)
        return transformed;
      return $traceurRuntime.superCall(this, $SuperTransformer.prototype, "transformPostfixExpression", [tree]);
    },
    transformIncrementDecrement_: function(tree) {
      var operator = tree.operator;
      var operand = tree.operand;
      if ((operator.type === PLUS_PLUS || operator.type === MINUS_MINUS) && hasSuperMemberExpression(operand)) {
        var exploded = new ExplodeSuperExpression(this.tempVarTransformer_).transformAny(tree);
        if (exploded !== tree)
          exploded = createParenExpression(exploded);
        return this.transformAny(exploded);
      }
      return null;
    }
  }, {}, ParseTreeTransformer);
  function hasSuperMemberExpression(tree) {
    if (tree.type !== MEMBER_EXPRESSION && tree.type !== MEMBER_LOOKUP_EXPRESSION)
      return false;
    return tree.operand.type === SUPER_EXPRESSION;
  }
  return {get SuperTransformer() {
      return SuperTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ClassTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ClassTransformer";
  var $__166 = Object.freeze(Object.defineProperties(["($traceurRuntime.createClass)(", ", ", ", ", ",\n                                       ", ")"], {raw: {value: Object.freeze(["($traceurRuntime.createClass)(", ", ", ", ", ",\n                                       ", ")"])}})),
      $__167 = Object.freeze(Object.defineProperties(["($traceurRuntime.createClass)(", ", ", ", ", ")"], {raw: {value: Object.freeze(["($traceurRuntime.createClass)(", ", ", ", ", ")"])}})),
      $__168 = Object.freeze(Object.defineProperties(["var ", " = ", ""], {raw: {value: Object.freeze(["var ", " = ", ""])}})),
      $__169 = Object.freeze(Object.defineProperties(["var ", " = ", ""], {raw: {value: Object.freeze(["var ", " = ", ""])}})),
      $__170 = Object.freeze(Object.defineProperties(["function($__super) {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ", $__super);\n      }(", ")"], {raw: {value: Object.freeze(["function($__super) {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ", $__super);\n      }(", ")"])}})),
      $__171 = Object.freeze(Object.defineProperties(["function() {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ");\n      }()"], {raw: {value: Object.freeze(["function() {\n        var ", " = ", ";\n        return ($traceurRuntime.createClass)(", ", ", ",\n                                             ", ");\n      }()"])}})),
      $__172 = Object.freeze(Object.defineProperties(["$traceurRuntime.defaultSuperCall(this,\n                ", ".prototype, arguments)"], {raw: {value: Object.freeze(["$traceurRuntime.defaultSuperCall(this,\n                ", ".prototype, arguments)"])}}));
  var AlphaRenamer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AlphaRenamer")).AlphaRenamer;
  var CONSTRUCTOR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).CONSTRUCTOR;
  var $__175 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      AnonBlock = $__175.AnonBlock,
      ExportDeclaration = $__175.ExportDeclaration,
      FunctionExpression = $__175.FunctionExpression,
      GetAccessor = $__175.GetAccessor,
      PropertyMethodAssignment = $__175.PropertyMethodAssignment,
      SetAccessor = $__175.SetAccessor;
  var $__175 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      GET_ACCESSOR = $__175.GET_ACCESSOR,
      PROPERTY_METHOD_ASSIGNMENT = $__175.PROPERTY_METHOD_ASSIGNMENT,
      SET_ACCESSOR = $__175.SET_ACCESSOR;
  var SuperTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/SuperTransformer")).SuperTransformer;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var MakeStrictTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/MakeStrictTransformer")).MakeStrictTransformer;
  var $__175 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createEmptyParameterList = $__175.createEmptyParameterList,
      createExpressionStatement = $__175.createExpressionStatement,
      createFunctionBody = $__175.createFunctionBody,
      id = $__175.createIdentifierExpression,
      createMemberExpression = $__175.createMemberExpression,
      createObjectLiteralExpression = $__175.createObjectLiteralExpression,
      createParenExpression = $__175.createParenExpression,
      createThisExpression = $__175.createThisExpression,
      createVariableStatement = $__175.createVariableStatement;
  var hasUseStrict = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/util")).hasUseStrict;
  var parseOptions = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).parseOptions;
  var $__175 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__175.parseExpression,
      parseStatement = $__175.parseStatement,
      parseStatements = $__175.parseStatements;
  var propName = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/staticsemantics/PropName")).propName;
  function classCall(func, object, staticObject, superClass) {
    if (superClass) {
      return parseExpression($__166, func, object, staticObject, superClass);
    }
    return parseExpression($__167, func, object, staticObject);
  }
  var ClassTransformer = function ClassTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $ClassTransformer.prototype, "constructor", [identifierGenerator]);
    this.strictCount_ = 0;
    this.state_ = null;
  };
  var $ClassTransformer = ClassTransformer;
  ($traceurRuntime.createClass)(ClassTransformer, {
    transformExportDeclaration: function(tree) {
      var transformed = $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformExportDeclaration", [tree]);
      if (transformed === tree)
        return tree;
      var declaration = transformed.declaration;
      if (declaration instanceof AnonBlock) {
        var statements = $traceurRuntime.spread([new ExportDeclaration(null, declaration.statements[0], [])], declaration.statements.slice(1));
        return new AnonBlock(null, statements);
      }
      return transformed;
    },
    transformModule: function(tree) {
      this.strictCount_ = 1;
      return $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformModule", [tree]);
    },
    transformScript: function(tree) {
      this.strictCount_ = +hasUseStrict(tree.scriptItemList);
      return $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformScript", [tree]);
    },
    transformFunctionBody: function(tree) {
      var useStrict = +hasUseStrict(tree.statements);
      this.strictCount_ += useStrict;
      var result = $traceurRuntime.superCall(this, $ClassTransformer.prototype, "transformFunctionBody", [tree]);
      this.strictCount_ -= useStrict;
      return result;
    },
    makeStrict_: function(tree) {
      if (this.strictCount_)
        return tree;
      return MakeStrictTransformer.transformTree(tree);
    },
    transformClassElements_: function(tree, internalName) {
      var $__173 = this;
      var oldState = this.state_;
      this.state_ = {hasSuper: false};
      var superClass = this.transformAny(tree.superClass);
      var hasConstructor = false;
      var protoElements = [],
          staticElements = [];
      var constructorBody,
          constructorParams;
      tree.elements.forEach((function(tree) {
        var elements,
            homeObject;
        if (tree.isStatic) {
          elements = staticElements;
          homeObject = internalName;
        } else {
          elements = protoElements;
          homeObject = createMemberExpression(internalName, 'prototype');
        }
        switch (tree.type) {
          case GET_ACCESSOR:
            elements.push($__173.transformGetAccessor_(tree, homeObject));
            break;
          case SET_ACCESSOR:
            elements.push($__173.transformSetAccessor_(tree, homeObject));
            break;
          case PROPERTY_METHOD_ASSIGNMENT:
            var transformed = $__173.transformPropertyMethodAssignment_(tree, homeObject);
            if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
              hasConstructor = true;
              constructorParams = transformed.parameterList;
              constructorBody = transformed.functionBody;
            } else {
              elements.push(transformed);
            }
            break;
          default:
            throw new Error(("Unexpected class element: " + tree.type));
        }
      }));
      var object = createObjectLiteralExpression(protoElements);
      var staticObject = createObjectLiteralExpression(staticElements);
      var func;
      if (!hasConstructor) {
        func = this.getDefaultConstructor_(tree, internalName);
      } else {
        func = new FunctionExpression(tree.location, tree.name, false, constructorParams, null, [], constructorBody);
      }
      var state = this.state_;
      this.state_ = oldState;
      return {
        func: func,
        superClass: superClass,
        object: object,
        staticObject: staticObject,
        hasSuper: state.hasSuper
      };
    },
    transformClassDeclaration: function(tree) {
      var name = tree.name.identifierToken;
      var internalName = id(("$" + name));
      var renamed = AlphaRenamer.rename(tree, name.value, internalName.identifierToken.value);
      var referencesClassName = renamed !== tree;
      var tree = renamed;
      var $__175 = $traceurRuntime.assertObject(this.transformClassElements_(tree, internalName)),
          func = $__175.func,
          hasSuper = $__175.hasSuper,
          object = $__175.object,
          staticObject = $__175.staticObject,
          superClass = $__175.superClass;
      var statements = parseStatements($__168, name, func);
      var expr = classCall(name, object, staticObject, superClass);
      if (hasSuper || referencesClassName) {
        statements.push(parseStatement($__169, internalName, name));
      }
      statements.push(createExpressionStatement(expr));
      var anonBlock = new AnonBlock(null, statements);
      return this.makeStrict_(anonBlock);
    },
    transformClassExpression: function(tree) {
      this.pushTempVarState();
      var name;
      if (tree.name)
        name = tree.name.identifierToken;
      else
        name = id(this.getTempIdentifier());
      var $__175 = $traceurRuntime.assertObject(this.transformClassElements_(tree, name)),
          func = $__175.func,
          hasSuper = $__175.hasSuper,
          object = $__175.object,
          staticObject = $__175.staticObject,
          superClass = $__175.superClass;
      var expression;
      if (hasSuper) {
        expression = parseExpression($__170, name, func, name, object, staticObject, superClass);
      } else if (tree.name) {
        expression = parseExpression($__171, name, func, name, object, staticObject);
      } else {
        expression = classCall(func, object, staticObject, superClass);
      }
      this.popTempVarState();
      return createParenExpression(this.makeStrict_(expression));
    },
    transformPropertyMethodAssignment_: function(tree, internalName) {
      var parameterList = this.transformAny(tree.parameterList);
      var functionBody = this.transformSuperInFunctionBody_(tree, tree.functionBody, internalName);
      if (!tree.isStatic && parameterList === tree.parameterList && functionBody === tree.functionBody) {
        return tree;
      }
      var isStatic = false;
      return new PropertyMethodAssignment(tree.location, isStatic, tree.functionKind, tree.name, parameterList, tree.typeAnnotation, tree.annotations, functionBody);
    },
    transformGetAccessor_: function(tree, internalName) {
      var body = this.transformSuperInFunctionBody_(tree, tree.body, internalName);
      if (!tree.isStatic && body === tree.body)
        return tree;
      return new GetAccessor(tree.location, false, tree.name, tree.typeAnnotation, tree.annotations, body);
    },
    transformSetAccessor_: function(tree, internalName) {
      var parameterList = this.transformAny(tree.parameterList);
      var body = this.transformSuperInFunctionBody_(tree, tree.body, internalName);
      if (!tree.isStatic && body === tree.body)
        return tree;
      return new SetAccessor(tree.location, false, tree.name, parameterList, tree.annotations, body);
    },
    transformSuperInFunctionBody_: function(methodTree, tree, internalName) {
      this.pushTempVarState();
      var thisName = this.getTempIdentifier();
      var thisDecl = createVariableStatement(VAR, thisName, createThisExpression());
      var superTransformer = new SuperTransformer(this, internalName, methodTree, thisName);
      var transformedTree = superTransformer.transformFunctionBody(this.transformFunctionBody(tree));
      if (superTransformer.hasSuper)
        this.state_.hasSuper = true;
      this.popTempVarState();
      if (superTransformer.nestedSuper)
        return createFunctionBody([thisDecl].concat(transformedTree.statements));
      return transformedTree;
    },
    getDefaultConstructor_: function(tree, internalName) {
      var constructorParams = createEmptyParameterList();
      var constructorBody;
      if (tree.superClass) {
        var statement = parseStatement($__172, internalName);
        constructorBody = createFunctionBody([statement]);
        this.state_.hasSuper = true;
      } else {
        constructorBody = createFunctionBody([]);
      }
      return new FunctionExpression(tree.location, tree.name, false, constructorParams, null, [], constructorBody);
    }
  }, {}, TempVarTransformer);
  return {get ClassTransformer() {
      return ClassTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/CommonJsModuleTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/CommonJsModuleTransformer";
  var $__176 = Object.freeze(Object.defineProperties(["module.exports = function() {\n            ", "\n          }.call(", ");"], {raw: {value: Object.freeze(["module.exports = function() {\n            ", "\n          }.call(", ");"])}})),
      $__177 = Object.freeze(Object.defineProperties(["Object.defineProperties(exports, ", ");"], {raw: {value: Object.freeze(["Object.defineProperties(exports, ", ");"])}})),
      $__178 = Object.freeze(Object.defineProperties(["{get: ", "}"], {raw: {value: Object.freeze(["{get: ", "}"])}})),
      $__179 = Object.freeze(Object.defineProperties(["{value: ", "}"], {raw: {value: Object.freeze(["{value: ", "}"])}})),
      $__180 = Object.freeze(Object.defineProperties(["require(", ")"], {raw: {value: Object.freeze(["require(", ")"])}})),
      $__181 = Object.freeze(Object.defineProperties(["__esModule: true"], {raw: {value: Object.freeze(["__esModule: true"])}}));
  var ModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ModuleTransformer")).ModuleTransformer;
  var $__183 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      GET_ACCESSOR = $__183.GET_ACCESSOR,
      OBJECT_LITERAL_EXPRESSION = $__183.OBJECT_LITERAL_EXPRESSION,
      PROPERTY_NAME_ASSIGNMENT = $__183.PROPERTY_NAME_ASSIGNMENT,
      RETURN_STATEMENT = $__183.RETURN_STATEMENT;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var globalThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/globalThis")).default;
  var $__183 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__183.parseExpression,
      parsePropertyDefinition = $__183.parsePropertyDefinition,
      parseStatement = $__183.parseStatement,
      parseStatements = $__183.parseStatements;
  var scopeContainsThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/scopeContainsThis")).default;
  var $__183 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createEmptyParameterList = $__183.createEmptyParameterList,
      createFunctionExpression = $__183.createFunctionExpression,
      createObjectLiteralExpression = $__183.createObjectLiteralExpression,
      createPropertyNameAssignment = $__183.createPropertyNameAssignment;
  var prependStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PrependStatements")).prependStatements;
  var CommonJsModuleTransformer = function CommonJsModuleTransformer() {
    $traceurRuntime.defaultSuperCall(this, $CommonJsModuleTransformer.prototype, arguments);
  };
  var $CommonJsModuleTransformer = CommonJsModuleTransformer;
  ($traceurRuntime.createClass)(CommonJsModuleTransformer, {
    wrapModule: function(statements) {
      var needsIife = statements.some(scopeContainsThis);
      if (needsIife) {
        return parseStatements($__176, statements, globalThis());
      }
      var last = statements[statements.length - 1];
      statements = statements.slice(0, -1);
      assert(last.type === RETURN_STATEMENT);
      var exportObject = last.expression;
      if (this.hasExports()) {
        var descriptors = this.transformObjectLiteralToDescriptors(exportObject);
        var exportStatement = parseStatement($__177, descriptors);
        statements = prependStatements(statements, exportStatement);
      }
      return statements;
    },
    transformObjectLiteralToDescriptors: function(literalTree) {
      assert(literalTree.type === OBJECT_LITERAL_EXPRESSION);
      var props = literalTree.propertyNameAndValues.map((function(exp) {
        var descriptor;
        switch (exp.type) {
          case GET_ACCESSOR:
            var getterFunction = createFunctionExpression(createEmptyParameterList(), exp.body);
            descriptor = parseExpression($__178, getterFunction);
            break;
          case PROPERTY_NAME_ASSIGNMENT:
            descriptor = parseExpression($__179, exp.value);
            break;
          default:
            throw new Error(("Unexpected property type " + exp.type));
        }
        return createPropertyNameAssignment(exp.name, descriptor);
      }));
      return createObjectLiteralExpression(props);
    },
    transformModuleSpecifier: function(tree) {
      return parseExpression($__180, tree.token);
    },
    getExportProperties: function() {
      var properties = $traceurRuntime.superCall(this, $CommonJsModuleTransformer.prototype, "getExportProperties", []);
      if (this.exportVisitor_.hasExports())
        properties.push(parsePropertyDefinition($__181));
      return properties;
    }
  }, {}, ModuleTransformer);
  return {get CommonJsModuleTransformer() {
      return CommonJsModuleTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ParameterTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ParameterTransformer";
  var FunctionBody = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).FunctionBody;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var prependStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PrependStatements")).prependStatements;
  var stack = [];
  var ParameterTransformer = function ParameterTransformer() {
    $traceurRuntime.defaultSuperCall(this, $ParameterTransformer.prototype, arguments);
  };
  var $ParameterTransformer = ParameterTransformer;
  ($traceurRuntime.createClass)(ParameterTransformer, {
    transformArrowFunctionExpression: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformArrowFunctionExpression", [tree]);
    },
    transformFunctionDeclaration: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformFunctionExpression", [tree]);
    },
    transformGetAccessor: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformGetAccessor", [tree]);
    },
    transformSetAccessor: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformSetAccessor", [tree]);
    },
    transformPropertyMethodAssignment: function(tree) {
      stack.push([]);
      return $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
    },
    transformFunctionBody: function(tree) {
      var transformedTree = $traceurRuntime.superCall(this, $ParameterTransformer.prototype, "transformFunctionBody", [tree]);
      var statements = stack.pop();
      if (!statements.length)
        return transformedTree;
      statements = prependStatements.apply(null, $traceurRuntime.spread([transformedTree.statements], statements));
      return new FunctionBody(transformedTree.location, statements);
    },
    get parameterStatements() {
      return stack[stack.length - 1];
    }
  }, {}, TempVarTransformer);
  return {get ParameterTransformer() {
      return ParameterTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/DefaultParametersTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/DefaultParametersTransformer";
  var $__187 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/util")),
      isUndefined = $__187.isUndefined,
      isVoidExpression = $__187.isVoidExpression;
  var FormalParameterList = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).FormalParameterList;
  var ParameterTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParameterTransformer")).ParameterTransformer;
  var ARGUMENTS = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).ARGUMENTS;
  var $__187 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      FORMAL_PARAMETER = $__187.FORMAL_PARAMETER,
      REST_PARAMETER = $__187.REST_PARAMETER;
  var $__187 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      NOT_EQUAL_EQUAL = $__187.NOT_EQUAL_EQUAL,
      VAR = $__187.VAR;
  var $__187 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createBinaryOperator = $__187.createBinaryOperator,
      createConditionalExpression = $__187.createConditionalExpression,
      createIdentifierExpression = $__187.createIdentifierExpression,
      createMemberLookupExpression = $__187.createMemberLookupExpression,
      createNumberLiteral = $__187.createNumberLiteral,
      createOperatorToken = $__187.createOperatorToken,
      createVariableStatement = $__187.createVariableStatement,
      createVoid0 = $__187.createVoid0;
  var prependStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PrependStatements")).prependStatements;
  function createDefaultAssignment(index, binding, initializer) {
    var argumentsExpression = createMemberLookupExpression(createIdentifierExpression(ARGUMENTS), createNumberLiteral(index));
    var assignmentExpression;
    if (initializer === null || isUndefined(initializer) || isVoidExpression(initializer)) {
      assignmentExpression = argumentsExpression;
    } else {
      assignmentExpression = createConditionalExpression(createBinaryOperator(argumentsExpression, createOperatorToken(NOT_EQUAL_EQUAL), createVoid0()), argumentsExpression, initializer);
    }
    return createVariableStatement(VAR, binding, assignmentExpression);
  }
  var DefaultParametersTransformer = function DefaultParametersTransformer() {
    $traceurRuntime.defaultSuperCall(this, $DefaultParametersTransformer.prototype, arguments);
  };
  var $DefaultParametersTransformer = DefaultParametersTransformer;
  ($traceurRuntime.createClass)(DefaultParametersTransformer, {transformFormalParameterList: function(tree) {
      var parameters = [];
      var changed = false;
      var defaultToUndefined = false;
      for (var i = 0; i < tree.parameters.length; i++) {
        var param = this.transformAny(tree.parameters[i]);
        if (param !== tree.parameters[i])
          changed = true;
        if (param.isRestParameter() || !param.parameter.initializer && !defaultToUndefined) {
          parameters.push(param);
        } else {
          defaultToUndefined = true;
          changed = true;
          this.parameterStatements.push(createDefaultAssignment(i, param.parameter.binding, param.parameter.initializer));
        }
      }
      if (!changed)
        return tree;
      return new FormalParameterList(tree.location, parameters);
    }}, {}, ParameterTransformer);
  return {get DefaultParametersTransformer() {
      return DefaultParametersTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/DestructuringTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/DestructuringTransformer";
  var $__188 = Object.freeze(Object.defineProperties(["$traceurRuntime.assertObject(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.assertObject(", ")"])}})),
      $__189 = Object.freeze(Object.defineProperties(["", " = ", ""], {raw: {value: Object.freeze(["", " = ", ""])}})),
      $__190 = Object.freeze(Object.defineProperties(["Array.prototype.slice.call(", ", ", ")"], {raw: {value: Object.freeze(["Array.prototype.slice.call(", ", ", ")"])}})),
      $__191 = Object.freeze(Object.defineProperties(["(", " = ", ".", ") === void 0 ?\n        ", " : ", ""], {raw: {value: Object.freeze(["(", " = ", ".", ") === void 0 ?\n        ", " : ", ""])}})),
      $__192 = Object.freeze(Object.defineProperties(["(", " = ", "[", "]) === void 0 ?\n        ", " : ", ""], {raw: {value: Object.freeze(["(", " = ", "[", "]) === void 0 ?\n        ", " : ", ""])}}));
  var $__195 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      ARRAY_COMPREHENSION = $__195.ARRAY_COMPREHENSION,
      ARRAY_LITERAL_EXPRESSION = $__195.ARRAY_LITERAL_EXPRESSION,
      ARRAY_PATTERN = $__195.ARRAY_PATTERN,
      ARROW_FUNCTION_EXPRESSION = $__195.ARROW_FUNCTION_EXPRESSION,
      BINDING_ELEMENT = $__195.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__195.BINDING_IDENTIFIER,
      BLOCK = $__195.BLOCK,
      CALL_EXPRESSION = $__195.CALL_EXPRESSION,
      CLASS_EXPRESSION = $__195.CLASS_EXPRESSION,
      COMPUTED_PROPERTY_NAME = $__195.COMPUTED_PROPERTY_NAME,
      FUNCTION_EXPRESSION = $__195.FUNCTION_EXPRESSION,
      GENERATOR_COMPREHENSION = $__195.GENERATOR_COMPREHENSION,
      IDENTIFIER_EXPRESSION = $__195.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__195.LITERAL_EXPRESSION,
      MEMBER_EXPRESSION = $__195.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__195.MEMBER_LOOKUP_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__195.OBJECT_LITERAL_EXPRESSION,
      OBJECT_PATTERN = $__195.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__195.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__195.PAREN_EXPRESSION,
      THIS_EXPRESSION = $__195.THIS_EXPRESSION,
      VARIABLE_DECLARATION_LIST = $__195.VARIABLE_DECLARATION_LIST;
  var $__195 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BindingElement = $__195.BindingElement,
      Catch = $__195.Catch,
      ForInStatement = $__195.ForInStatement,
      ForOfStatement = $__195.ForOfStatement,
      LiteralExpression = $__195.LiteralExpression;
  var ParameterTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParameterTransformer")).ParameterTransformer;
  var $__195 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      EQUAL = $__195.EQUAL,
      IDENTIFIER = $__195.IDENTIFIER,
      LET = $__195.LET,
      REGULAR_EXPRESSION = $__195.REGULAR_EXPRESSION,
      VAR = $__195.VAR;
  var $__195 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentExpression = $__195.createAssignmentExpression,
      createBindingIdentifier = $__195.createBindingIdentifier,
      createBlock = $__195.createBlock,
      createCommaExpression = $__195.createCommaExpression,
      createExpressionStatement = $__195.createExpressionStatement,
      createIdentifierExpression = $__195.createIdentifierExpression,
      createMemberExpression = $__195.createMemberExpression,
      createMemberLookupExpression = $__195.createMemberLookupExpression,
      createNumberLiteral = $__195.createNumberLiteral,
      createParenExpression = $__195.createParenExpression,
      createVariableDeclaration = $__195.createVariableDeclaration,
      createVariableDeclarationList = $__195.createVariableDeclarationList,
      createVariableStatement = $__195.createVariableStatement;
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  var parseExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseExpression;
  var Desugaring = function Desugaring(rvalue) {
    this.rvalue = rvalue;
  };
  ($traceurRuntime.createClass)(Desugaring, {}, {});
  var AssignmentExpressionDesugaring = function AssignmentExpressionDesugaring(rvalue) {
    $traceurRuntime.superCall(this, $AssignmentExpressionDesugaring.prototype, "constructor", [rvalue]);
    this.expressions = [];
  };
  var $AssignmentExpressionDesugaring = AssignmentExpressionDesugaring;
  ($traceurRuntime.createClass)(AssignmentExpressionDesugaring, {assign: function(lvalue, rvalue) {
      lvalue = lvalue instanceof BindingElement ? lvalue.binding : lvalue;
      this.expressions.push(createAssignmentExpression(lvalue, rvalue));
    }}, {}, Desugaring);
  var VariableDeclarationDesugaring = function VariableDeclarationDesugaring(rvalue) {
    $traceurRuntime.superCall(this, $VariableDeclarationDesugaring.prototype, "constructor", [rvalue]);
    this.declarations = [];
  };
  var $VariableDeclarationDesugaring = VariableDeclarationDesugaring;
  ($traceurRuntime.createClass)(VariableDeclarationDesugaring, {assign: function(lvalue, rvalue) {
      if (lvalue instanceof BindingElement) {
        this.declarations.push(createVariableDeclaration(lvalue.binding, rvalue));
        return;
      }
      if (lvalue.type == IDENTIFIER_EXPRESSION)
        lvalue = createBindingIdentifier(lvalue);
      this.declarations.push(createVariableDeclaration(lvalue, rvalue));
    }}, {}, Desugaring);
  function staticallyKnownObject(tree) {
    switch (tree.type) {
      case OBJECT_LITERAL_EXPRESSION:
      case ARRAY_LITERAL_EXPRESSION:
      case ARRAY_COMPREHENSION:
      case GENERATOR_COMPREHENSION:
      case ARROW_FUNCTION_EXPRESSION:
      case FUNCTION_EXPRESSION:
      case CLASS_EXPRESSION:
      case THIS_EXPRESSION:
        return true;
      case LITERAL_EXPRESSION:
        return tree.literalToken.type === REGULAR_EXPRESSION;
    }
    return false;
  }
  function createGuardedExpression(tree) {
    if (staticallyKnownObject(tree))
      return tree;
    return parseExpression($__188, tree);
  }
  function createGuardedAssignment(lvalue, rvalue) {
    return parseExpression($__189, lvalue, createGuardedExpression(rvalue));
  }
  var DestructuringTransformer = function DestructuringTransformer() {
    $traceurRuntime.defaultSuperCall(this, $DestructuringTransformer.prototype, arguments);
  };
  var $DestructuringTransformer = DestructuringTransformer;
  ($traceurRuntime.createClass)(DestructuringTransformer, {
    transformArrayPattern: function(tree) {
      throw new Error('unreachable');
    },
    transformObjectPattern: function(tree) {
      throw new Error('unreachable');
    },
    transformBinaryOperator: function(tree) {
      this.pushTempVarState();
      var rv;
      if (tree.operator.type == EQUAL && tree.left.isPattern()) {
        rv = this.transformAny(this.desugarAssignment_(tree.left, tree.right));
      } else {
        rv = $traceurRuntime.superCall(this, $DestructuringTransformer.prototype, "transformBinaryOperator", [tree]);
      }
      this.popTempVarState();
      return rv;
    },
    desugarAssignment_: function(lvalue, rvalue) {
      var tempIdent = createIdentifierExpression(this.addTempVar());
      var desugaring = new AssignmentExpressionDesugaring(tempIdent);
      this.desugarPattern_(desugaring, lvalue);
      desugaring.expressions.unshift(createGuardedAssignment(tempIdent, rvalue));
      desugaring.expressions.push(tempIdent);
      return createParenExpression(createCommaExpression(desugaring.expressions));
    },
    transformVariableDeclarationList: function(tree) {
      var $__193 = this;
      if (!this.destructuringInDeclaration_(tree)) {
        return $traceurRuntime.superCall(this, $DestructuringTransformer.prototype, "transformVariableDeclarationList", [tree]);
      }
      this.pushTempVarState();
      var desugaredDeclarations = [];
      tree.declarations.forEach((function(declaration) {
        var $__196;
        if (declaration.lvalue.isPattern()) {
          ($__196 = desugaredDeclarations).push.apply($__196, $traceurRuntime.toObject($__193.desugarVariableDeclaration_(declaration)));
        } else {
          desugaredDeclarations.push(declaration);
        }
      }));
      var transformedTree = this.transformVariableDeclarationList(createVariableDeclarationList(tree.declarationType, desugaredDeclarations));
      this.popTempVarState();
      return transformedTree;
    },
    transformForInStatement: function(tree) {
      return this.transformForInOrOf_(tree, $traceurRuntime.superGet(this, $DestructuringTransformer.prototype, "transformForInStatement"), ForInStatement);
    },
    transformForOfStatement: function(tree) {
      return this.transformForInOrOf_(tree, $traceurRuntime.superGet(this, $DestructuringTransformer.prototype, "transformForOfStatement"), ForOfStatement);
    },
    transformForInOrOf_: function(tree, superMethod, constr) {
      var $__196;
      if (!tree.initializer.isPattern() && (tree.initializer.type !== VARIABLE_DECLARATION_LIST || !this.destructuringInDeclaration_(tree.initializer))) {
        return superMethod.call(this, tree);
      }
      this.pushTempVarState();
      var declarationType,
          lvalue;
      if (tree.initializer.isPattern()) {
        declarationType = null;
        lvalue = tree.initializer;
      } else {
        declarationType = tree.initializer.declarationType;
        lvalue = tree.initializer.declarations[0].lvalue;
      }
      var statements = [];
      var binding = this.desugarBinding_(lvalue, statements, declarationType);
      var initializer = createVariableDeclarationList(VAR, binding, null);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (body.type !== BLOCK)
        body = createBlock(body);
      ($__196 = statements).push.apply($__196, $traceurRuntime.toObject(body.statements));
      body = createBlock(statements);
      this.popTempVarState();
      return new constr(tree.location, initializer, collection, body);
    },
    transformBindingElement: function(tree) {
      if (!tree.binding.isPattern() || tree.initializer)
        return tree;
      var statements = this.parameterStatements;
      var binding = this.desugarBinding_(tree.binding, statements, VAR);
      return new BindingElement(null, binding, null);
    },
    transformCatch: function(tree) {
      var $__196;
      if (!tree.binding.isPattern())
        return $traceurRuntime.superCall(this, $DestructuringTransformer.prototype, "transformCatch", [tree]);
      var body = this.transformAny(tree.catchBody);
      var statements = [];
      var kind = options.blockBinding ? LET : VAR;
      var binding = this.desugarBinding_(tree.binding, statements, kind);
      ($__196 = statements).push.apply($__196, $traceurRuntime.toObject(body.statements));
      return new Catch(tree.location, binding, createBlock(statements));
    },
    desugarBinding_: function(bindingTree, statements, declarationType) {
      var varName = this.getTempIdentifier();
      var binding = createBindingIdentifier(varName);
      var idExpr = createIdentifierExpression(varName);
      var desugaring;
      if (declarationType === null)
        desugaring = new AssignmentExpressionDesugaring(idExpr);
      else
        desugaring = new VariableDeclarationDesugaring(idExpr);
      this.desugarPattern_(desugaring, bindingTree);
      if (declarationType === null) {
        statements.push(createExpressionStatement(createCommaExpression(desugaring.expressions)));
      } else {
        statements.push(createVariableStatement(this.transformVariableDeclarationList(createVariableDeclarationList(declarationType, desugaring.declarations))));
      }
      return binding;
    },
    destructuringInDeclaration_: function(tree) {
      return tree.declarations.some((function(declaration) {
        return declaration.lvalue.isPattern();
      }));
    },
    desugarVariableDeclaration_: function(tree) {
      var tempRValueName = this.getTempIdentifier();
      var tempRValueIdent = createIdentifierExpression(tempRValueName);
      var desugaring;
      var initializer;
      switch (tree.initializer.type) {
        case ARRAY_LITERAL_EXPRESSION:
        case CALL_EXPRESSION:
        case IDENTIFIER_EXPRESSION:
        case LITERAL_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case OBJECT_LITERAL_EXPRESSION:
        case PAREN_EXPRESSION:
          initializer = tree.initializer;
        default:
          desugaring = new VariableDeclarationDesugaring(tempRValueIdent);
          desugaring.assign(desugaring.rvalue, createGuardedExpression(tree.initializer));
          var initializerFound = this.desugarPattern_(desugaring, tree.lvalue);
          if (initializerFound || desugaring.declarations.length > 2)
            return desugaring.declarations;
          initializer = createGuardedExpression(initializer || tree.initializer);
          desugaring = new VariableDeclarationDesugaring(initializer);
          this.desugarPattern_(desugaring, tree.lvalue);
          return desugaring.declarations;
      }
    },
    desugarPattern_: function(desugaring, tree) {
      var $__193 = this;
      var initializerFound = false;
      switch (tree.type) {
        case ARRAY_PATTERN:
          {
            var pattern = tree;
            for (var i = 0; i < pattern.elements.length; i++) {
              var lvalue = pattern.elements[i];
              if (lvalue === null) {
                continue;
              } else if (lvalue.isSpreadPatternElement()) {
                desugaring.assign(lvalue.lvalue, parseExpression($__190, desugaring.rvalue, i));
              } else {
                if (lvalue.initializer)
                  initializerFound = true;
                desugaring.assign(lvalue, this.createConditionalMemberLookupExpression(desugaring.rvalue, createNumberLiteral(i), lvalue.initializer));
              }
            }
            break;
          }
        case OBJECT_PATTERN:
          {
            var pattern = tree;
            pattern.fields.forEach((function(field) {
              var lookup;
              switch (field.type) {
                case BINDING_ELEMENT:
                  if (field.initializer)
                    initializerFound = true;
                  lookup = $__193.createConditionalMemberExpression(desugaring.rvalue, field.binding, field.initializer);
                  desugaring.assign(createIdentifierExpression(field.binding), lookup);
                  break;
                case OBJECT_PATTERN_FIELD:
                  if (field.element.initializer)
                    initializerFound = true;
                  var name = field.name;
                  lookup = $__193.createConditionalMemberExpression(desugaring.rvalue, name, field.element.initializer);
                  desugaring.assign(field.element, lookup);
                  break;
                case IDENTIFIER_EXPRESSION:
                  lookup = createMemberExpression(desugaring.rvalue, field.identifierToken);
                  desugaring.assign(field, lookup);
                  break;
                default:
                  throw Error('unreachable');
              }
            }));
            break;
          }
        case PAREN_EXPRESSION:
          return this.desugarPattern_(desugaring, tree.expression);
        default:
          throw new Error('unreachable');
      }
      if (desugaring instanceof VariableDeclarationDesugaring && desugaring.declarations.length === 0) {
        desugaring.assign(createBindingIdentifier(this.getTempIdentifier()), desugaring.rvalue);
      }
      return initializerFound;
    },
    createConditionalMemberExpression: function(rvalue, name, initializer) {
      if (name.type === COMPUTED_PROPERTY_NAME) {
        return this.createConditionalMemberLookupExpression(rvalue, name.expression, initializer);
      }
      var token;
      if (name.type == BINDING_IDENTIFIER) {
        token = name.identifierToken;
      } else {
        token = name.literalToken;
      }
      if (!initializer)
        return createMemberExpression(rvalue, token);
      this.pushTempVarState();
      var tempIdent = createIdentifierExpression(this.addTempVar());
      this.popTempVarState();
      return parseExpression($__191, tempIdent, rvalue, token, initializer, tempIdent);
    },
    createConditionalMemberLookupExpression: function(rvalue, index, initializer) {
      if (!initializer)
        return createMemberLookupExpression(rvalue, index);
      var tempIdent = createIdentifierExpression(this.addTempVar());
      return parseExpression($__192, tempIdent, rvalue, index, initializer, tempIdent);
    }
  }, {}, ParameterTransformer);
  return {get DestructuringTransformer() {
      return DestructuringTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ForOfTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ForOfTransformer";
  var $__197 = Object.freeze(Object.defineProperties(["", " = ", ".value;"], {raw: {value: Object.freeze(["", " = ", ".value;"])}})),
      $__198 = Object.freeze(Object.defineProperties(["\n        for (var ", " =\n                 ", "[Symbol.iterator](),\n                 ", ";\n             !(", " = ", ".next()).done; ) {\n          ", ";\n          ", ";\n        }"], {raw: {value: Object.freeze(["\n        for (var ", " =\n                 ", "[Symbol.iterator](),\n                 ", ";\n             !(", " = ", ".next()).done; ) {\n          ", ";\n          ", ";\n        }"])}}));
  var VARIABLE_DECLARATION_LIST = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")).VARIABLE_DECLARATION_LIST;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__200 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      id = $__200.createIdentifierExpression,
      createMemberExpression = $__200.createMemberExpression,
      createVariableStatement = $__200.createVariableStatement;
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  var ForOfTransformer = function ForOfTransformer() {
    $traceurRuntime.defaultSuperCall(this, $ForOfTransformer.prototype, arguments);
  };
  var $ForOfTransformer = ForOfTransformer;
  ($traceurRuntime.createClass)(ForOfTransformer, {transformForOfStatement: function(original) {
      var tree = $traceurRuntime.superCall(this, $ForOfTransformer.prototype, "transformForOfStatement", [original]);
      var iter = id(this.getTempIdentifier());
      var result = id(this.getTempIdentifier());
      var assignment;
      if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
        assignment = createVariableStatement(tree.initializer.declarationType, tree.initializer.declarations[0].lvalue, createMemberExpression(result, 'value'));
      } else {
        assignment = parseStatement($__197, tree.initializer, result);
      }
      return parseStatement($__198, iter, tree.collection, result, result, iter, assignment, tree.body);
    }}, {}, TempVarTransformer);
  return {get ForOfTransformer() {
      return ForOfTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/GeneratorComprehensionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/GeneratorComprehensionTransformer";
  var ComprehensionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ComprehensionTransformer")).ComprehensionTransformer;
  var createYieldStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createYieldStatement;
  var GeneratorComprehensionTransformer = function GeneratorComprehensionTransformer() {
    $traceurRuntime.defaultSuperCall(this, $GeneratorComprehensionTransformer.prototype, arguments);
  };
  var $GeneratorComprehensionTransformer = GeneratorComprehensionTransformer;
  ($traceurRuntime.createClass)(GeneratorComprehensionTransformer, {transformGeneratorComprehension: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statement = createYieldStatement(expression);
      var isGenerator = true;
      return this.transformComprehension(tree, statement, isGenerator);
    }}, {}, ComprehensionTransformer);
  return {get GeneratorComprehensionTransformer() {
      return GeneratorComprehensionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/State", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/State";
  var $__203 = Object.freeze(Object.defineProperties(["$ctx.finallyFallThrough = ", ""], {raw: {value: Object.freeze(["$ctx.finallyFallThrough = ", ""])}}));
  var $__205 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignStateStatement = $__205.createAssignStateStatement,
      createAssignmentStatement = $__205.createAssignmentStatement,
      createBreakStatement = $__205.createBreakStatement,
      createCaseClause = $__205.createCaseClause,
      createIdentifierExpression = $__205.createIdentifierExpression,
      createNumberLiteral = $__205.createNumberLiteral,
      createStatementList = $__205.createStatementList;
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  var State = function State(id) {
    this.id = id;
  };
  ($traceurRuntime.createClass)(State, {
    transformMachineState: function(enclosingFinally, machineEndState, reporter) {
      return createCaseClause(createNumberLiteral(this.id), this.transform(enclosingFinally, machineEndState, reporter));
    },
    transformBreak: function(labelSet, breakState) {
      return this;
    },
    transformBreakOrContinue: function(labelSet) {
      var breakState = arguments[1];
      var continueState = arguments[2];
      return this;
    }
  }, {});
  State.START_STATE = 0;
  State.INVALID_STATE = -1;
  State.END_STATE = -2;
  State.RETHROW_STATE = -3;
  State.generateJump = function(enclosingFinally, fallThroughState) {
    return createStatementList(State.generateAssignState(enclosingFinally, fallThroughState), createBreakStatement());
  };
  State.generateAssignState = function(enclosingFinally, fallThroughState) {
    var assignState;
    if (State.isFinallyExit(enclosingFinally, fallThroughState)) {
      assignState = generateAssignStateOutOfFinally(enclosingFinally, fallThroughState);
    } else {
      assignState = createStatementList(createAssignStateStatement(fallThroughState));
    }
    return assignState;
  };
  State.isFinallyExit = function(enclosingFinally, destination) {
    return enclosingFinally != null && enclosingFinally.tryStates.indexOf(destination) < 0;
  };
  function generateAssignStateOutOfFinally(enclosingFinally, destination) {
    var finallyState = enclosingFinally.finallyState;
    return createStatementList(createAssignStateStatement(finallyState), parseStatement($__203, destination));
  }
  State.replaceStateList = function(oldStates, oldState, newState) {
    var states = [];
    for (var i = 0; i < oldStates.length; i++) {
      states.push(State.replaceStateId(oldStates[i], oldState, newState));
    }
    return states;
  };
  State.replaceStateId = function(current, oldState, newState) {
    return current == oldState ? newState : current;
  };
  State.replaceAllStates = function(exceptionBlocks, oldState, newState) {
    var result = [];
    for (var i = 0; i < exceptionBlocks.length; i++) {
      result.push(exceptionBlocks[i].replaceState(oldState, newState));
    }
    return result;
  };
  return {get State() {
      return State;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/TryState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/TryState";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var Kind = {
    CATCH: 'catch',
    FINALLY: 'finally'
  };
  var TryState = function TryState(kind, tryStates, nestedTrys) {
    this.kind = kind;
    this.tryStates = tryStates;
    this.nestedTrys = nestedTrys;
  };
  ($traceurRuntime.createClass)(TryState, {
    replaceAllStates: function(oldState, newState) {
      return State.replaceStateList(this.tryStates, oldState, newState);
    },
    replaceNestedTrys: function(oldState, newState) {
      var states = [];
      for (var i = 0; i < this.nestedTrys.length; i++) {
        states.push(this.nestedTrys[i].replaceState(oldState, newState));
      }
      return states;
    }
  }, {});
  TryState.Kind = Kind;
  return {get TryState() {
      return TryState;
    }};
});
System.register("traceur@0.0.43/src/syntax/trees/StateMachine", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/syntax/trees/StateMachine";
  var ParseTree = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTree")).ParseTree;
  var STATE_MACHINE = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")).STATE_MACHINE;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var TryState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/TryState")).TryState;
  function addCatchOrFinallyStates(kind, enclosingMap, tryStates) {
    for (var i = 0; i < tryStates.length; i++) {
      var tryState = tryStates[i];
      if (tryState.kind == kind) {
        for (var j = 0; j < tryState.tryStates.length; j++) {
          var id = tryState.tryStates[j];
          enclosingMap[id] = tryState;
        }
      }
      addCatchOrFinallyStates(kind, enclosingMap, tryState.nestedTrys);
    }
  }
  function addAllCatchStates(tryStates, catches) {
    for (var i = 0; i < tryStates.length; i++) {
      var tryState = tryStates[i];
      if (tryState.kind == TryState.Kind.CATCH) {
        catches.push(tryState);
      }
      addAllCatchStates(tryState.nestedTrys, catches);
    }
  }
  var StateMachine = function StateMachine(startState, fallThroughState, states, exceptionBlocks) {
    this.location = null;
    this.startState = startState;
    this.fallThroughState = fallThroughState;
    this.states = states;
    this.exceptionBlocks = exceptionBlocks;
  };
  var $StateMachine = StateMachine;
  ($traceurRuntime.createClass)(StateMachine, {
    get type() {
      return STATE_MACHINE;
    },
    transform: function(transformer) {
      return transformer.transformStateMachine(this);
    },
    visit: function(visitor) {
      visitor.visitStateMachine(this);
    },
    getAllStateIDs: function() {
      var result = [];
      for (var i = 0; i < this.states.length; i++) {
        result.push(this.states[i].id);
      }
      return result;
    },
    getEnclosingFinallyMap: function() {
      var enclosingMap = Object.create(null);
      addCatchOrFinallyStates(TryState.Kind.FINALLY, enclosingMap, this.exceptionBlocks);
      return enclosingMap;
    },
    allCatchStates: function() {
      var catches = [];
      addAllCatchStates(this.exceptionBlocks, catches);
      return catches;
    },
    replaceStateId: function(oldState, newState) {
      return new $StateMachine(State.replaceStateId(this.startState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), State.replaceAllStates(this.states, oldState, newState), State.replaceAllStates(this.exceptionBlocks, oldState, newState));
    },
    replaceStartState: function(newState) {
      return this.replaceStateId(this.startState, newState);
    },
    replaceFallThroughState: function(newState) {
      return this.replaceStateId(this.fallThroughState, newState);
    },
    append: function(nextMachine) {
      var states = $traceurRuntime.spread(this.states);
      for (var i = 0; i < nextMachine.states.length; i++) {
        var otherState = nextMachine.states[i];
        states.push(otherState.replaceState(nextMachine.startState, this.fallThroughState));
      }
      var exceptionBlocks = $traceurRuntime.spread(this.exceptionBlocks);
      for (var i = 0; i < nextMachine.exceptionBlocks.length; i++) {
        var tryState = nextMachine.exceptionBlocks[i];
        exceptionBlocks.push(tryState.replaceState(nextMachine.startState, this.fallThroughState));
      }
      return new $StateMachine(this.startState, nextMachine.fallThroughState, states, exceptionBlocks);
    }
  }, {}, ParseTree);
  return {get StateMachine() {
      return StateMachine;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/AwaitState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/AwaitState";
  var $__210 = Object.freeze(Object.defineProperties(["Promise.resolve(", ").then(\n              $ctx.createCallback(", "), $ctx.errback);\n          return"], {raw: {value: Object.freeze(["Promise.resolve(", ").then(\n              $ctx.createCallback(", "), $ctx.errback);\n          return"])}}));
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var parseStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatements;
  var AwaitState = function AwaitState(id, callbackState, expression) {
    $traceurRuntime.superCall(this, $AwaitState.prototype, "constructor", [id]), this.callbackState = callbackState;
    this.expression = expression;
    this.statements_ = null;
  };
  var $AwaitState = AwaitState;
  ($traceurRuntime.createClass)(AwaitState, {
    get statements() {
      if (!this.statements_) {
        this.statements_ = parseStatements($__210, this.expression, this.callbackState);
      }
      return this.statements_;
    },
    replaceState: function(oldState, newState) {
      return new $AwaitState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.callbackState, oldState, newState), this.expression);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return this.statements;
    }
  }, {}, State);
  return {get AwaitState() {
      return AwaitState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/HoistVariablesTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/HoistVariablesTransformer";
  var $__214 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      AnonBlock = $__214.AnonBlock,
      Catch = $__214.Catch,
      FunctionBody = $__214.FunctionBody,
      ForInStatement = $__214.ForInStatement,
      ForOfStatement = $__214.ForOfStatement,
      VariableDeclarationList = $__214.VariableDeclarationList,
      VariableStatement = $__214.VariableStatement;
  var $__214 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINDING_IDENTIFIER = $__214.BINDING_IDENTIFIER,
      OBJECT_PATTERN = $__214.OBJECT_PATTERN,
      VARIABLE_DECLARATION_LIST = $__214.VARIABLE_DECLARATION_LIST;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var $__214 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentExpression = $__214.createAssignmentExpression,
      createCommaExpression = $__214.createCommaExpression,
      createExpressionStatement = $__214.createExpressionStatement,
      id = $__214.createIdentifierExpression,
      createParenExpression = $__214.createParenExpression,
      createVariableDeclaration = $__214.createVariableDeclaration;
  var prependStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PrependStatements")).prependStatements;
  var HoistVariablesTransformer = function HoistVariablesTransformer() {
    $traceurRuntime.superCall(this, $HoistVariablesTransformer.prototype, "constructor", []);
    this.hoistedVariables_ = Object.create(null);
    this.keepBindingIdentifiers_ = false;
  };
  var $HoistVariablesTransformer = HoistVariablesTransformer;
  ($traceurRuntime.createClass)(HoistVariablesTransformer, {
    transformFunctionBody: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements === tree.statements)
        return tree;
      var prepended = this.prependVariables(statements);
      return new FunctionBody(tree.location, prepended);
    },
    addVariable: function(name) {
      this.hoistedVariables_[name] = true;
    },
    hasVariables: function() {
      for (var key in this.hoistedVariables_) {
        return true;
      }
      return false;
    },
    getVariableNames: function() {
      return Object.keys(this.hoistedVariables_);
    },
    getVariableStatement: function() {
      if (!this.hasVariables())
        return null;
      var declarations = this.getVariableNames().map((function(name) {
        return createVariableDeclaration(name, null);
      }));
      return new VariableStatement(null, new VariableDeclarationList(null, VAR, declarations));
    },
    prependVariables: function(statements) {
      if (!this.hasVariables())
        return statements;
      return prependStatements(statements, this.getVariableStatement());
    },
    transformVariableStatement: function(tree) {
      var declarations = this.transformAny(tree.declarations);
      if (declarations == tree.declarations)
        return tree;
      if (declarations === null)
        return new AnonBlock(null, []);
      if (declarations.type === VARIABLE_DECLARATION_LIST)
        return new VariableStatement(tree.location, declarations);
      return createExpressionStatement(declarations);
    },
    transformVariableDeclaration: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var initializer = this.transformAny(tree.initializer);
      if (initializer) {
        var expression = createAssignmentExpression(lvalue, initializer);
        if (lvalue.type === OBJECT_PATTERN)
          expression = createParenExpression(expression);
        return expression;
      }
      return null;
    },
    transformObjectPattern: function(tree) {
      var keepBindingIdentifiers = this.keepBindingIdentifiers_;
      this.keepBindingIdentifiers_ = true;
      var transformed = $traceurRuntime.superCall(this, $HoistVariablesTransformer.prototype, "transformObjectPattern", [tree]);
      this.keepBindingIdentifiers_ = keepBindingIdentifiers;
      return transformed;
    },
    transformArrayPattern: function(tree) {
      var keepBindingIdentifiers = this.keepBindingIdentifiers_;
      this.keepBindingIdentifiers_ = true;
      var transformed = $traceurRuntime.superCall(this, $HoistVariablesTransformer.prototype, "transformArrayPattern", [tree]);
      this.keepBindingIdentifiers_ = keepBindingIdentifiers;
      return transformed;
    },
    transformBindingIdentifier: function(tree) {
      var idToken = tree.identifierToken;
      this.addVariable(idToken.value);
      if (this.keepBindingIdentifiers_)
        return tree;
      return id(idToken);
    },
    transformVariableDeclarationList: function(tree) {
      if (tree.declarationType == VAR) {
        var expressions = this.transformList(tree.declarations);
        expressions = expressions.filter((function(tree) {
          return tree;
        }));
        if (expressions.length === 0)
          return null;
        if (expressions.length == 1)
          return expressions[0];
        return createCommaExpression(expressions);
      }
      return $traceurRuntime.superCall(this, $HoistVariablesTransformer.prototype, "transformVariableDeclarationList", [tree]);
    },
    transformCatch: function(tree) {
      var catchBody = this.transformAny(tree.catchBody);
      if (catchBody === tree.catchBody)
        return tree;
      return new Catch(tree.location, tree.binding, catchBody);
    },
    transformForInStatement: function(tree) {
      return this.transformLoop_(tree, ForInStatement);
    },
    transformForOfStatement: function(tree) {
      return this.transformLoop_(tree, ForOfStatement);
    },
    transformLoop_: function(tree, ctor) {
      var initializer = this.transformLoopIninitaliser_(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer === tree.initializer && collection === tree.collection && body === tree.body) {
        return tree;
      }
      return new ctor(tree.location, initializer, collection, body);
    },
    transformLoopIninitaliser_: function(tree) {
      if (tree.type !== VARIABLE_DECLARATION_LIST)
        return tree;
      return this.transformAny(tree.declarations[0].lvalue);
    },
    addMachineVariable: function(name) {
      this.machineVariables_[name] = true;
    },
    transformClassDeclaration: function(tree) {
      return tree;
    },
    transformClassExpression: function(tree) {
      return tree;
    },
    transformFunctionDeclaration: function(tree) {
      return tree;
    },
    transformFunctionExpression: function(tree) {
      return tree;
    },
    transformGetAccessor: function(tree) {
      return tree;
    },
    transformSetAccessor: function(tree) {
      return tree;
    },
    transformPropertyMethodAssignment: function(tree) {
      return tree;
    },
    transformArrowFunctionExpression: function(tree) {
      return tree;
    },
    transformComprehensionFor: function(tree) {
      return tree;
    }
  }, {}, ParseTreeTransformer);
  var $__default = HoistVariablesTransformer;
  return {get default() {
      return $__default;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/FallThroughState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/FallThroughState";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var FallThroughState = function FallThroughState(id, fallThroughState, statements) {
    $traceurRuntime.superCall(this, $FallThroughState.prototype, "constructor", [id]);
    this.fallThroughState = fallThroughState;
    this.statements = statements;
  };
  var $FallThroughState = FallThroughState;
  ($traceurRuntime.createClass)(FallThroughState, {
    replaceState: function(oldState, newState) {
      return new $FallThroughState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.statements);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return $traceurRuntime.spread(this.statements, State.generateJump(enclosingFinally, this.fallThroughState));
    }
  }, {}, State);
  return {get FallThroughState() {
      return FallThroughState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/BreakState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/BreakState";
  var FallThroughState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FallThroughState")).FallThroughState;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var createStatementList = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createStatementList;
  var BreakState = function BreakState(id, label) {
    $traceurRuntime.superCall(this, $BreakState.prototype, "constructor", [id]);
    this.label = label;
  };
  var $BreakState = BreakState;
  ($traceurRuntime.createClass)(BreakState, {
    replaceState: function(oldState, newState) {
      return new $BreakState(State.replaceStateId(this.id, oldState, newState), this.label);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },
    transformBreak: function(labelSet) {
      var breakState = arguments[1];
      if (this.label == null)
        return new FallThroughState(this.id, breakState, []);
      if (this.label in labelSet) {
        return new FallThroughState(this.id, labelSet[this.label].fallThroughState, []);
      }
      return this;
    },
    transformBreakOrContinue: function(labelSet) {
      var breakState = arguments[1];
      var continueState = arguments[2];
      return this.transformBreak(labelSet, breakState);
    }
  }, {}, State);
  return {get BreakState() {
      return BreakState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/ContinueState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/ContinueState";
  var FallThroughState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FallThroughState")).FallThroughState;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var createStatementList = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createStatementList;
  var ContinueState = function ContinueState(id, label) {
    $traceurRuntime.superCall(this, $ContinueState.prototype, "constructor", [id]);
    this.label = label;
  };
  var $ContinueState = ContinueState;
  ($traceurRuntime.createClass)(ContinueState, {
    replaceState: function(oldState, newState) {
      return new $ContinueState(State.replaceStateId(this.id, oldState, newState), this.label);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },
    transformBreakOrContinue: function(labelSet) {
      var breakState = arguments[1];
      var continueState = arguments[2];
      if (this.label == null)
        return new FallThroughState(this.id, continueState, []);
      if (this.label in labelSet) {
        return new FallThroughState(this.id, labelSet[this.label].continueState, []);
      }
      return this;
    }
  }, {}, State);
  return {get ContinueState() {
      return ContinueState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/BreakContinueTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/BreakContinueTransformer";
  var BreakState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/BreakState")).BreakState;
  var ContinueState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/ContinueState")).ContinueState;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var StateMachine = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/StateMachine")).StateMachine;
  function safeGetLabel(tree) {
    return tree.name ? tree.name.value : null;
  }
  var BreakContinueTransformer = function BreakContinueTransformer(stateAllocator) {
    $traceurRuntime.superCall(this, $BreakContinueTransformer.prototype, "constructor", []);
    this.transformBreaks_ = true;
    this.stateAllocator_ = stateAllocator;
  };
  var $BreakContinueTransformer = BreakContinueTransformer;
  ($traceurRuntime.createClass)(BreakContinueTransformer, {
    allocateState_: function() {
      return this.stateAllocator_.allocateState();
    },
    stateToStateMachine_: function(newState) {
      var fallThroughState = this.allocateState_();
      return new StateMachine(newState.id, fallThroughState, [newState], []);
    },
    transformBreakStatement: function(tree) {
      return this.transformBreaks_ || tree.name ? this.stateToStateMachine_(new BreakState(this.allocateState_(), safeGetLabel(tree))) : tree;
    },
    transformContinueStatement: function(tree) {
      return this.stateToStateMachine_(new ContinueState(this.allocateState_(), safeGetLabel(tree)));
    },
    transformDoWhileStatement: function(tree) {
      return tree;
    },
    transformForOfStatement: function(tree) {
      return tree;
    },
    transformForStatement: function(tree) {
      return tree;
    },
    transformFunctionDeclaration: function(tree) {
      return tree;
    },
    transformFunctionExpression: function(tree) {
      return tree;
    },
    transformStateMachine: function(tree) {
      return tree;
    },
    transformSwitchStatement: function(tree) {
      var oldState = this.transformBreaks_;
      this.transformBreaks_ = false;
      var result = $traceurRuntime.superCall(this, $BreakContinueTransformer.prototype, "transformSwitchStatement", [tree]);
      this.transformBreaks_ = oldState;
      return result;
    },
    transformWhileStatement: function(tree) {
      return tree;
    }
  }, {}, ParseTreeTransformer);
  return {get BreakContinueTransformer() {
      return BreakContinueTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/CatchState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/CatchState";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var TryState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/TryState")).TryState;
  var CatchState = function CatchState(identifier, catchState, fallThroughState, allStates, nestedTrys) {
    $traceurRuntime.superCall(this, $CatchState.prototype, "constructor", [TryState.Kind.CATCH, allStates, nestedTrys]);
    this.identifier = identifier;
    this.catchState = catchState;
    this.fallThroughState = fallThroughState;
  };
  var $CatchState = CatchState;
  ($traceurRuntime.createClass)(CatchState, {replaceState: function(oldState, newState) {
      return new $CatchState(this.identifier, State.replaceStateId(this.catchState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
    }}, {}, TryState);
  return {get CatchState() {
      return CatchState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/ConditionalState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/ConditionalState";
  var $__225 = Object.freeze(Object.defineProperties(["$ctx.state = (", ") ? ", " : ", ";\n        break"], {raw: {value: Object.freeze(["$ctx.state = (", ") ? ", " : ", ";\n        break"])}}));
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var $__227 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createBlock = $__227.createBlock,
      createIfStatement = $__227.createIfStatement;
  var parseStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatements;
  var ConditionalState = function ConditionalState(id, ifState, elseState, condition) {
    $traceurRuntime.superCall(this, $ConditionalState.prototype, "constructor", [id]);
    this.ifState = ifState;
    this.elseState = elseState;
    this.condition = condition;
  };
  var $ConditionalState = ConditionalState;
  ($traceurRuntime.createClass)(ConditionalState, {
    replaceState: function(oldState, newState) {
      return new $ConditionalState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.ifState, oldState, newState), State.replaceStateId(this.elseState, oldState, newState), this.condition);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      if (State.isFinallyExit(enclosingFinally, this.ifState) || State.isFinallyExit(enclosingFinally, this.elseState)) {
        return [createIfStatement(this.condition, createBlock(State.generateJump(enclosingFinally, this.ifState)), createBlock(State.generateJump(enclosingFinally, this.elseState)))];
      }
      return parseStatements($__225, this.condition, this.ifState, this.elseState);
    }
  }, {}, State);
  return {get ConditionalState() {
      return ConditionalState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/FinallyFallThroughState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/FinallyFallThroughState";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var FinallyFallThroughState = function FinallyFallThroughState() {
    $traceurRuntime.defaultSuperCall(this, $FinallyFallThroughState.prototype, arguments);
  };
  var $FinallyFallThroughState = FinallyFallThroughState;
  ($traceurRuntime.createClass)(FinallyFallThroughState, {
    replaceState: function(oldState, newState) {
      return new $FinallyFallThroughState(State.replaceStateId(this.id, oldState, newState));
    },
    transformMachineState: function(enclosingFinally, machineEndState, reporter) {
      return null;
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('these are generated in addFinallyFallThroughDispatches');
    }
  }, {}, State);
  return {get FinallyFallThroughState() {
      return FinallyFallThroughState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/FinallyState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/FinallyState";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var TryState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/TryState")).TryState;
  var FinallyState = function FinallyState(finallyState, fallThroughState, allStates, nestedTrys) {
    $traceurRuntime.superCall(this, $FinallyState.prototype, "constructor", [TryState.Kind.FINALLY, allStates, nestedTrys]);
    this.finallyState = finallyState;
    this.fallThroughState = fallThroughState;
  };
  var $FinallyState = FinallyState;
  ($traceurRuntime.createClass)(FinallyState, {replaceState: function(oldState, newState) {
      return new $FinallyState(State.replaceStateId(this.finallyState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
    }}, {}, TryState);
  return {get FinallyState() {
      return FinallyState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/StateAllocator", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/StateAllocator";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var StateAllocator = function StateAllocator() {
    this.nextState_ = State.START_STATE + 1;
  };
  ($traceurRuntime.createClass)(StateAllocator, {allocateState: function() {
      return this.nextState_++;
    }}, {});
  return {get StateAllocator() {
      return StateAllocator;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/SwitchState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/SwitchState";
  var $__235 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      CaseClause = $__235.CaseClause,
      DefaultClause = $__235.DefaultClause,
      SwitchStatement = $__235.SwitchStatement;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var $__235 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createBreakStatement = $__235.createBreakStatement,
      createStatementList = $__235.createStatementList;
  var SwitchClause = function SwitchClause(first, second) {
    this.first = first;
    this.second = second;
  };
  ($traceurRuntime.createClass)(SwitchClause, {}, {});
  var SwitchState = function SwitchState(id, expression, clauses) {
    $traceurRuntime.superCall(this, $SwitchState.prototype, "constructor", [id]);
    this.expression = expression;
    this.clauses = clauses;
  };
  var $SwitchState = SwitchState;
  ($traceurRuntime.createClass)(SwitchState, {
    replaceState: function(oldState, newState) {
      var clauses = this.clauses.map((function(clause) {
        return new SwitchClause(clause.first, State.replaceStateId(clause.second, oldState, newState));
      }));
      return new $SwitchState(State.replaceStateId(this.id, oldState, newState), this.expression, clauses);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      var clauses = [];
      for (var i = 0; i < this.clauses.length; i++) {
        var clause = this.clauses[i];
        if (clause.first == null) {
          clauses.push(new DefaultClause(null, State.generateJump(enclosingFinally, clause.second)));
        } else {
          clauses.push(new CaseClause(null, clause.first, State.generateJump(enclosingFinally, clause.second)));
        }
      }
      return createStatementList(new SwitchStatement(null, this.expression, clauses), createBreakStatement());
    }
  }, {}, State);
  return {
    get SwitchClause() {
      return SwitchClause;
    },
    get SwitchState() {
      return SwitchState;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/generator/CPSTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/CPSTransformer";
  var $__236 = Object.freeze(Object.defineProperties(["$ctx.pushTry(\n            ", ",\n            ", ");"], {raw: {value: Object.freeze(["$ctx.pushTry(\n            ", ",\n            ", ");"])}})),
      $__237 = Object.freeze(Object.defineProperties(["$ctx.popTry();"], {raw: {value: Object.freeze(["$ctx.popTry();"])}})),
      $__238 = Object.freeze(Object.defineProperties(["\n              $ctx.popTry();\n              ", " = $ctx.storedException;"], {raw: {value: Object.freeze(["\n              $ctx.popTry();\n              ", " = $ctx.storedException;"])}})),
      $__239 = Object.freeze(Object.defineProperties(["$ctx.popTry();"], {raw: {value: Object.freeze(["$ctx.popTry();"])}})),
      $__240 = Object.freeze(Object.defineProperties(["function($ctx) {\n      while (true) ", "\n    }"], {raw: {value: Object.freeze(["function($ctx) {\n      while (true) ", "\n    }"])}})),
      $__241 = Object.freeze(Object.defineProperties(["var $arguments = arguments;"], {raw: {value: Object.freeze(["var $arguments = arguments;"])}})),
      $__242 = Object.freeze(Object.defineProperties(["return ", "(\n              ", ",\n              ", ", this);"], {raw: {value: Object.freeze(["return ", "(\n              ", ",\n              ", ", this);"])}})),
      $__243 = Object.freeze(Object.defineProperties(["return ", "(\n              ", ", this);"], {raw: {value: Object.freeze(["return ", "(\n              ", ", this);"])}})),
      $__244 = Object.freeze(Object.defineProperties(["return $ctx.end()"], {raw: {value: Object.freeze(["return $ctx.end()"])}})),
      $__245 = Object.freeze(Object.defineProperties(["\n                  $ctx.state = $ctx.finallyFallThrough;\n                  $ctx.finallyFallThrough = ", ";\n                  break;"], {raw: {value: Object.freeze(["\n                  $ctx.state = $ctx.finallyFallThrough;\n                  $ctx.finallyFallThrough = ", ";\n                  break;"])}})),
      $__246 = Object.freeze(Object.defineProperties(["\n                      $ctx.state = $ctx.finallyFallThrough;\n                      break;"], {raw: {value: Object.freeze(["\n                      $ctx.state = $ctx.finallyFallThrough;\n                      break;"])}}));
  var AlphaRenamer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AlphaRenamer")).AlphaRenamer;
  var BreakContinueTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/BreakContinueTransformer")).BreakContinueTransformer;
  var $__249 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BLOCK = $__249.BLOCK,
      BREAK_STATEMENT = $__249.BREAK_STATEMENT,
      CASE_CLAUSE = $__249.CASE_CLAUSE,
      CONDITIONAL_EXPRESSION = $__249.CONDITIONAL_EXPRESSION,
      CONTINUE_STATEMENT = $__249.CONTINUE_STATEMENT,
      EXPRESSION_STATEMENT = $__249.EXPRESSION_STATEMENT,
      PAREN_EXPRESSION = $__249.PAREN_EXPRESSION,
      STATE_MACHINE = $__249.STATE_MACHINE;
  var $__249 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      AnonBlock = $__249.AnonBlock,
      Block = $__249.Block,
      CaseClause = $__249.CaseClause,
      IfStatement = $__249.IfStatement,
      SwitchStatement = $__249.SwitchStatement;
  var CatchState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/CatchState")).CatchState;
  var ConditionalState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/ConditionalState")).ConditionalState;
  var ExplodeExpressionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ExplodeExpressionTransformer")).ExplodeExpressionTransformer;
  var FallThroughState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FallThroughState")).FallThroughState;
  var FinallyFallThroughState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FinallyFallThroughState")).FinallyFallThroughState;
  var FinallyState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FinallyState")).FinallyState;
  var FindInFunctionScope = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindInFunctionScope")).FindInFunctionScope;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var $__249 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__249.parseExpression,
      parseStatement = $__249.parseStatement,
      parseStatements = $__249.parseStatements;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var StateAllocator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/StateAllocator")).StateAllocator;
  var StateMachine = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/StateMachine")).StateMachine;
  var $__249 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/SwitchState")),
      SwitchClause = $__249.SwitchClause,
      SwitchState = $__249.SwitchState;
  var TryState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/TryState")).TryState;
  var $__249 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignStateStatement = $__249.createAssignStateStatement,
      createBreakStatement = $__249.createBreakStatement,
      createCaseClause = $__249.createCaseClause,
      createDefaultClause = $__249.createDefaultClause,
      createExpressionStatement = $__249.createExpressionStatement,
      createFunctionBody = $__249.createFunctionBody,
      id = $__249.createIdentifierExpression,
      createMemberExpression = $__249.createMemberExpression,
      createNumberLiteral = $__249.createNumberLiteral,
      createStatementList = $__249.createStatementList,
      createSwitchStatement = $__249.createSwitchStatement;
  var HoistVariablesTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/HoistVariablesTransformer")).default;
  var LabelState = function LabelState(name, continueState, fallThroughState) {
    this.name = name;
    this.continueState = continueState;
    this.fallThroughState = fallThroughState;
  };
  ($traceurRuntime.createClass)(LabelState, {}, {});
  var NeedsStateMachine = function NeedsStateMachine() {
    $traceurRuntime.defaultSuperCall(this, $NeedsStateMachine.prototype, arguments);
  };
  var $NeedsStateMachine = NeedsStateMachine;
  ($traceurRuntime.createClass)(NeedsStateMachine, {
    visitBreakStatement: function(tree) {
      this.found = true;
    },
    visitContinueStatement: function(tree) {
      this.found = true;
    },
    visitStateMachine: function(tree) {
      this.found = true;
    },
    visitYieldExpression: function(tee) {
      this.found = true;
    }
  }, {}, FindInFunctionScope);
  function needsStateMachine(tree) {
    var visitor = new NeedsStateMachine(tree);
    return visitor.found;
  }
  var HoistVariables = function HoistVariables() {
    $traceurRuntime.defaultSuperCall(this, $HoistVariables.prototype, arguments);
  };
  var $HoistVariables = HoistVariables;
  ($traceurRuntime.createClass)(HoistVariables, {prependVariables: function(statements) {
      return statements;
    }}, {}, HoistVariablesTransformer);
  var CPSTransformer = function CPSTransformer(identifierGenerator, reporter) {
    $traceurRuntime.superCall(this, $CPSTransformer.prototype, "constructor", [identifierGenerator]);
    this.reporter = reporter;
    this.stateAllocator_ = new StateAllocator();
    this.labelSet_ = Object.create(null);
    this.currentLabel_ = null;
    this.hoistVariablesTransformer_ = new HoistVariables();
  };
  var $CPSTransformer = CPSTransformer;
  ($traceurRuntime.createClass)(CPSTransformer, {
    expressionNeedsStateMachine: function(tree) {
      return false;
    },
    allocateState: function() {
      return this.stateAllocator_.allocateState();
    },
    transformBlock: function(tree) {
      var labels = this.getLabels_();
      var label = this.clearCurrentLabel_();
      var transformedTree = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformBlock", [tree]);
      var machine = this.transformStatementList_(transformedTree.statements);
      if (machine === null)
        return transformedTree;
      if (label) {
        var states = [];
        for (var i = 0; i < machine.states.length; i++) {
          var state = machine.states[i];
          states.push(state.transformBreakOrContinue(labels));
        }
        machine = new StateMachine(machine.startState, machine.fallThroughState, states, machine.exceptionBlocks);
      }
      return machine;
    },
    transformFunctionBody: function(tree) {
      this.pushTempVarState();
      var oldLabels = this.clearLabels_();
      var transformedTree = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformFunctionBody", [tree]);
      var machine = this.transformStatementList_(transformedTree.statements);
      this.restoreLabels_(oldLabels);
      this.popTempVarState();
      return machine == null ? transformedTree : machine;
    },
    transformStatementList_: function(trees) {
      var groups = [];
      var newMachine;
      for (var i = 0; i < trees.length; i++) {
        if (trees[i].type === STATE_MACHINE) {
          groups.push(trees[i]);
        } else if (needsStateMachine(trees[i])) {
          newMachine = this.ensureTransformed_(trees[i]);
          groups.push(newMachine);
        } else {
          var last = groups[groups.length - 1];
          if (!(last instanceof Array))
            groups.push(last = []);
          last.push(trees[i]);
        }
      }
      if (groups.length === 1 && groups[0] instanceof Array)
        return null;
      var machine = null;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i] instanceof Array) {
          newMachine = this.statementsToStateMachine_(groups[i]);
        } else {
          newMachine = groups[i];
        }
        if (i === 0)
          machine = newMachine;
        else
          machine = machine.append(newMachine);
      }
      return machine;
    },
    needsStateMachine_: function(statements) {
      if (statements instanceof Array) {
        for (var i = 0; i < statements.length; i++) {
          if (needsStateMachine(statements[i]))
            return true;
        }
        return false;
      }
      assert(statements instanceof SwitchStatement);
      return needsStateMachine(statements);
    },
    transformCaseClause: function(tree) {
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformCaseClause", [tree]);
      var machine = this.transformStatementList_(result.statements);
      return machine == null ? result : new CaseClause(null, result.expression, createStatementList(machine));
    },
    transformDoWhileStatement: function(tree) {
      var $__250;
      var $__249;
      var labels = this.getLabels_();
      var label = this.clearCurrentLabel_();
      var machine,
          condition,
          body;
      if (this.expressionNeedsStateMachine(tree.condition)) {
        (($__249 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.condition)), machine = $__249.machine, condition = $__249.expression, $__249));
        body = this.transformAny(tree.body);
      } else {
        var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformDoWhileStatement", [tree]);
        (($__249 = $traceurRuntime.assertObject(result), condition = $__249.condition, body = $__249.body, $__249));
        if (body.type != STATE_MACHINE)
          return result;
      }
      var loopBodyMachine = this.ensureTransformed_(body);
      var startState = loopBodyMachine.startState;
      var conditionState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();
      var states = [];
      this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState, labels, states);
      if (machine) {
        machine = machine.replaceStartState(conditionState);
        conditionState = machine.fallThroughState;
        ($__250 = states).push.apply($__250, $traceurRuntime.toObject(machine.states));
      }
      states.push(new ConditionalState(conditionState, startState, fallThroughState, condition));
      var machine = new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
      if (label)
        machine = machine.replaceStateId(conditionState, label.continueState);
      return machine;
    },
    addLoopBodyStates_: function(loopBodyMachine, continueState, breakState, labels, states) {
      for (var i = 0; i < loopBodyMachine.states.length; i++) {
        var state = loopBodyMachine.states[i];
        states.push(state.transformBreakOrContinue(labels, breakState, continueState));
      }
    },
    transformForStatement: function(tree) {
      var $__250;
      var labels = this.getLabels_();
      var label = this.clearCurrentLabel_();
      var tmp;
      var initializer = null,
          initializerMachine;
      if (tree.initializer) {
        if (this.expressionNeedsStateMachine(tree.initializer)) {
          tmp = this.expressionToStateMachine(tree.initializer);
          initializer = tmp.expression;
          initializerMachine = tmp.machine;
        } else {
          initializer = this.transformAny(tree.initializer);
        }
      }
      var condition = null,
          conditionMachine;
      if (tree.condition) {
        if (this.expressionNeedsStateMachine(tree.condition)) {
          tmp = this.expressionToStateMachine(tree.condition);
          condition = tmp.expression;
          conditionMachine = tmp.machine;
        } else {
          condition = this.transformAny(tree.condition);
        }
      }
      var increment = null,
          incrementMachine;
      if (tree.increment) {
        if (this.expressionNeedsStateMachine(tree.increment)) {
          tmp = this.expressionToStateMachine(tree.increment);
          increment = tmp.expression;
          incrementMachine = tmp.machine;
        } else {
          increment = this.transformAny(tree.increment);
        }
      }
      var body = this.transformAny(tree.body);
      if (initializer === tree.initializer && condition === tree.condition && increment === tree.increment && body === tree.body) {
        return tree;
      }
      if (!initializerMachine && !conditionMachine && !incrementMachine && body.type !== STATE_MACHINE) {
        return new ForStatement(tree.location, initializer, condition, increment, body);
      }
      var loopBodyMachine = this.ensureTransformed_(body);
      var bodyFallThroughId = loopBodyMachine.fallThroughState;
      var fallThroughId = this.allocateState();
      var startId;
      var initializerStartId = initializer ? this.allocateState() : State.INVALID_STATE;
      var conditionStartId = increment ? this.allocateState() : bodyFallThroughId;
      var loopStartId = loopBodyMachine.startState;
      var incrementStartId = bodyFallThroughId;
      var states = [];
      if (initializer) {
        startId = initializerStartId;
        var initialiserFallThroughId;
        if (condition)
          initialiserFallThroughId = conditionStartId;
        else
          initialiserFallThroughId = loopStartId;
        var tmpId = initializerStartId;
        if (initializerMachine) {
          initializerMachine = initializerMachine.replaceStartState(initializerStartId);
          tmpId = initializerMachine.fallThroughState;
          ($__250 = states).push.apply($__250, $traceurRuntime.toObject(initializerMachine.states));
        }
        states.push(new FallThroughState(tmpId, initialiserFallThroughId, createStatementList(createExpressionStatement(initializer))));
      }
      if (condition) {
        if (!initializer)
          startId = conditionStartId;
        var tmpId = conditionStartId;
        if (conditionMachine) {
          conditionMachine = conditionMachine.replaceStartState(conditionStartId);
          tmpId = conditionMachine.fallThroughState;
          ($__250 = states).push.apply($__250, $traceurRuntime.toObject(conditionMachine.states));
        }
        states.push(new ConditionalState(tmpId, loopStartId, fallThroughId, condition));
      }
      if (increment) {
        var incrementFallThroughId;
        if (condition)
          incrementFallThroughId = conditionStartId;
        else
          incrementFallThroughId = loopStartId;
        var tmpId = incrementStartId;
        if (incrementMachine) {
          incrementMachine = incrementMachine.replaceStartState(incrementStartId);
          tmpId = incrementMachine.fallThroughState;
          ($__250 = states).push.apply($__250, $traceurRuntime.toObject(incrementMachine.states));
        }
        states.push(new FallThroughState(tmpId, incrementFallThroughId, createStatementList(createExpressionStatement(increment))));
      }
      if (!initializer && !condition)
        startId = loopStartId;
      var continueId;
      if (increment)
        continueId = incrementStartId;
      else if (condition)
        continueId = conditionStartId;
      else
        continueId = loopStartId;
      if (!increment && !condition) {
        loopBodyMachine = loopBodyMachine.replaceFallThroughState(loopBodyMachine.startState);
      }
      this.addLoopBodyStates_(loopBodyMachine, continueId, fallThroughId, labels, states);
      var machine = new StateMachine(startId, fallThroughId, states, loopBodyMachine.exceptionBlocks);
      if (label)
        machine = machine.replaceStateId(continueId, label.continueState);
      return machine;
    },
    transformForInStatement: function(tree) {
      return tree;
    },
    transformForOfStatement: function(tree) {
      throw new Error('for of statements should be transformed before this pass');
    },
    transformIfStatement: function(tree) {
      var $__250;
      var $__249;
      var machine,
          condition,
          ifClause,
          elseClause;
      if (this.expressionNeedsStateMachine(tree.condition)) {
        (($__249 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.condition)), machine = $__249.machine, condition = $__249.expression, $__249));
        ifClause = this.transformAny(tree.ifClause);
        elseClause = this.transformAny(tree.elseClause);
      } else {
        var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformIfStatement", [tree]);
        (($__249 = $traceurRuntime.assertObject(result), condition = $__249.condition, ifClause = $__249.ifClause, elseClause = $__249.elseClause, $__249));
        if (ifClause.type !== STATE_MACHINE && (elseClause === null || elseClause.type !== STATE_MACHINE)) {
          return result;
        }
      }
      ifClause = this.ensureTransformed_(ifClause);
      elseClause = this.ensureTransformed_(elseClause);
      var startState = this.allocateState();
      var fallThroughState = ifClause.fallThroughState;
      var ifState = ifClause.startState;
      var elseState = elseClause == null ? fallThroughState : elseClause.startState;
      var states = [];
      var exceptionBlocks = [];
      states.push(new ConditionalState(startState, ifState, elseState, condition));
      ($__250 = states).push.apply($__250, $traceurRuntime.toObject(ifClause.states));
      ($__250 = exceptionBlocks).push.apply($__250, $traceurRuntime.toObject(ifClause.exceptionBlocks));
      if (elseClause != null) {
        this.replaceAndAddStates_(elseClause.states, elseClause.fallThroughState, fallThroughState, states);
        ($__250 = exceptionBlocks).push.apply($__250, $traceurRuntime.toObject(State.replaceAllStates(elseClause.exceptionBlocks, elseClause.fallThroughState, fallThroughState)));
      }
      var ifMachine = new StateMachine(startState, fallThroughState, states, exceptionBlocks);
      if (machine)
        ifMachine = machine.append(ifMachine);
      return ifMachine;
    },
    removeEmptyStates: function(oldStates) {
      var emptyStates = [],
          newStates = [];
      for (var i = 0; i < oldStates.length; i++) {
        if (oldStates[i] instanceof FallThroughState && oldStates[i].statements.length === 0) {
          emptyStates.push(oldStates[i]);
        } else {
          newStates.push(oldStates[i]);
        }
      }
      for (i = 0; i < newStates.length; i++) {
        newStates[i] = emptyStates.reduce((function(state, $__249) {
          var id = $__249.id,
              fallThroughState = $__249.fallThroughState;
          return state.replaceState(id, fallThroughState);
        }), newStates[i]);
      }
      return newStates;
    },
    replaceAndAddStates_: function(oldStates, oldState, newState, newStates) {
      for (var i = 0; i < oldStates.length; i++) {
        newStates.push(oldStates[i].replaceState(oldState, newState));
      }
    },
    transformLabelledStatement: function(tree) {
      var startState = this.allocateState();
      var continueState = this.allocateState();
      var fallThroughState = this.allocateState();
      var label = new LabelState(tree.name.value, continueState, fallThroughState);
      var oldLabels = this.addLabel_(label);
      this.currentLabel_ = label;
      var result = this.transformAny(tree.statement);
      if (result === tree.statement) {
        result = tree;
      } else if (result.type === STATE_MACHINE) {
        result = result.replaceStartState(startState);
        result = result.replaceFallThroughState(fallThroughState);
      }
      this.restoreLabels_(oldLabels);
      return result;
    },
    getLabels_: function() {
      return this.labelSet_;
    },
    restoreLabels_: function(oldLabels) {
      this.labelSet_ = oldLabels;
    },
    addLabel_: function(label) {
      var oldLabels = this.labelSet_;
      var labelSet = Object.create(null);
      for (var k in this.labelSet_) {
        labelSet[k] = this.labelSet_[k];
      }
      labelSet[label.name] = label;
      this.labelSet_ = labelSet;
      return oldLabels;
    },
    clearLabels_: function() {
      var result = this.labelSet_;
      this.labelSet_ = Object.create(null);
      return result;
    },
    clearCurrentLabel_: function() {
      var result = this.currentLabel_;
      this.currentLabel_ = null;
      return result;
    },
    transformSwitchStatement: function(tree) {
      var $__249;
      var labels = this.getLabels_();
      var expression,
          machine,
          caseClauses;
      if (this.expressionNeedsStateMachine(tree.expression)) {
        (($__249 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.expression)), expression = $__249.expression, machine = $__249.machine, $__249));
        caseClauses = this.transformList(tree.caseClauses);
      } else {
        var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformSwitchStatement", [tree]);
        if (!needsStateMachine(result))
          return result;
        (($__249 = $traceurRuntime.assertObject(result), expression = $__249.expression, caseClauses = $__249.caseClauses, $__249));
      }
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      var nextState = fallThroughState;
      var states = [];
      var clauses = [];
      var tryStates = [];
      var hasDefault = false;
      for (var index = caseClauses.length - 1; index >= 0; index--) {
        var clause = caseClauses[index];
        if (clause.type == CASE_CLAUSE) {
          var caseClause = clause;
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState, labels, caseClause.statements, states, tryStates);
          clauses.push(new SwitchClause(caseClause.expression, nextState));
        } else {
          hasDefault = true;
          var defaultClause = clause;
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState, labels, defaultClause.statements, states, tryStates);
          clauses.push(new SwitchClause(null, nextState));
        }
      }
      if (!hasDefault) {
        clauses.push(new SwitchClause(null, fallThroughState));
      }
      states.push(new SwitchState(startState, expression, clauses.reverse()));
      var switchMachine = new StateMachine(startState, fallThroughState, states.reverse(), tryStates);
      if (machine)
        switchMachine = machine.append(switchMachine);
      return switchMachine;
    },
    addSwitchClauseStates_: function(nextState, fallThroughState, labels, statements, states, tryStates) {
      var $__250;
      var machine = this.ensureTransformedList_(statements);
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var transformedState = state.transformBreak(labels, fallThroughState);
        states.push(transformedState.replaceState(machine.fallThroughState, nextState));
      }
      ($__250 = tryStates).push.apply($__250, $traceurRuntime.toObject(machine.exceptionBlocks));
      return machine.startState;
    },
    transformTryStatement: function(tree) {
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformTryStatement", [tree]);
      var $__249 = $traceurRuntime.assertObject(result),
          body = $__249.body,
          catchBlock = $__249.catchBlock,
          finallyBlock = $__249.finallyBlock;
      if (body.type != STATE_MACHINE && (catchBlock == null || catchBlock.catchBody.type != STATE_MACHINE) && (finallyBlock == null || finallyBlock.block.type != STATE_MACHINE)) {
        return result;
      }
      var outerCatchState = this.allocateState();
      var outerFinallyState = this.allocateState();
      var pushTryState = this.statementToStateMachine_(parseStatement($__236, (catchBlock && outerCatchState), (finallyBlock && outerFinallyState)));
      var tryMachine = this.ensureTransformed_(body);
      tryMachine = pushTryState.append(tryMachine);
      if (catchBlock !== null) {
        var popTry = this.statementToStateMachine_(parseStatement($__237));
        tryMachine = tryMachine.append(popTry);
        var exceptionName = catchBlock.binding.identifierToken.value;
        var catchMachine = this.ensureTransformed_(catchBlock.catchBody);
        var catchStart = this.allocateState();
        this.addMachineVariable(exceptionName);
        var states = $traceurRuntime.spread(tryMachine.states, [new FallThroughState(catchStart, catchMachine.startState, parseStatements($__238, id(exceptionName)))]);
        this.replaceAndAddStates_(catchMachine.states, catchMachine.fallThroughState, tryMachine.fallThroughState, states);
        tryMachine = new StateMachine(tryMachine.startState, tryMachine.fallThroughState, states, [new CatchState(exceptionName, catchStart, tryMachine.fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]);
        tryMachine = tryMachine.replaceStateId(catchStart, outerCatchState);
      }
      if (finallyBlock != null) {
        var finallyMachine = this.ensureTransformed_(finallyBlock.block);
        var popTry = this.statementToStateMachine_(parseStatement($__239));
        finallyMachine = popTry.append(finallyMachine);
        var states = $traceurRuntime.spread(tryMachine.states, finallyMachine.states, [new FinallyFallThroughState(finallyMachine.fallThroughState)]);
        tryMachine = new StateMachine(tryMachine.startState, tryMachine.fallThroughState, states, [new FinallyState(finallyMachine.startState, finallyMachine.fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]);
        tryMachine = tryMachine.replaceStateId(finallyMachine.startState, outerFinallyState);
      }
      return tryMachine;
    },
    transformWhileStatement: function(tree) {
      var $__250;
      var $__249;
      var labels = this.getLabels_();
      var label = this.clearCurrentLabel_();
      var condition,
          machine,
          body;
      if (this.expressionNeedsStateMachine(tree.condition)) {
        (($__249 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.condition)), machine = $__249.machine, condition = $__249.expression, $__249));
        body = this.transformAny(tree.body);
      } else {
        var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformWhileStatement", [tree]);
        (($__249 = $traceurRuntime.assertObject(result), condition = $__249.condition, body = $__249.body, $__249));
        if (body.type !== STATE_MACHINE)
          return result;
      }
      var loopBodyMachine = this.ensureTransformed_(body);
      var startState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();
      var states = [];
      var conditionStart = startState;
      if (machine) {
        machine = machine.replaceStartState(startState);
        conditionStart = machine.fallThroughState;
        ($__250 = states).push.apply($__250, $traceurRuntime.toObject(machine.states));
      }
      states.push(new ConditionalState(conditionStart, loopBodyMachine.startState, fallThroughState, condition));
      this.addLoopBodyStates_(loopBodyMachine, startState, fallThroughState, labels, states);
      var machine = new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
      if (label)
        machine = machine.replaceStateId(startState, label.continueState);
      return machine;
    },
    transformWithStatement: function(tree) {
      var result = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformWithStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      throw new Error('Unreachable - with statement not allowed in strict mode/harmony');
    },
    generateMachineInnerFunction: function(machine) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var SwitchStatement = createSwitchStatement(createMemberExpression('$ctx', 'state'), this.transformMachineStates(machine, State.END_STATE, State.RETHROW_STATE, enclosingFinallyState));
      return parseExpression($__240, SwitchStatement);
    },
    addTempVar: function() {
      var name = this.getTempIdentifier();
      this.addMachineVariable(name);
      return name;
    },
    addMachineVariable: function(name) {
      this.hoistVariablesTransformer_.addVariable(name);
    },
    transformCpsFunctionBody: function(tree, runtimeMethod) {
      var functionRef = arguments[2];
      var alphaRenamedTree = AlphaRenamer.rename(tree, 'arguments', '$arguments');
      var hasArguments = alphaRenamedTree !== tree;
      var hoistedTree = this.hoistVariablesTransformer_.transformAny(alphaRenamedTree);
      var maybeMachine = this.transformAny(hoistedTree);
      if (this.reporter.hadError())
        return tree;
      var machine;
      if (maybeMachine.type !== STATE_MACHINE) {
        machine = this.statementsToStateMachine_(maybeMachine.statements);
      } else {
        machine = new StateMachine(maybeMachine.startState, maybeMachine.fallThroughState, this.removeEmptyStates(maybeMachine.states), maybeMachine.exceptionBlocks);
      }
      machine = machine.replaceFallThroughState(State.END_STATE).replaceStartState(State.START_STATE);
      var statements = [];
      if (this.hoistVariablesTransformer_.hasVariables())
        statements.push(this.hoistVariablesTransformer_.getVariableStatement());
      if (hasArguments)
        statements.push(parseStatement($__241));
      if (functionRef) {
        statements.push(parseStatement($__242, runtimeMethod, this.generateMachineInnerFunction(machine), functionRef));
      } else {
        statements.push(parseStatement($__243, runtimeMethod, this.generateMachineInnerFunction(machine)));
      }
      return createFunctionBody(statements);
    },
    transformFunctionDeclaration: function(tree) {
      return tree;
    },
    transformFunctionExpression: function(tree) {
      return tree;
    },
    transformGetAccessor: function(tree) {
      return tree;
    },
    transformSetAccessor: function(tree) {
      return tree;
    },
    transformStateMachine: function(tree) {
      return tree;
    },
    statementToStateMachine_: function(statement) {
      var statements;
      if (statement.type === BLOCK)
        statements = statement.statements;
      else
        statements = [statement];
      return this.statementsToStateMachine_(statements);
    },
    statementsToStateMachine_: function(statements) {
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(new FallThroughState(startState, fallThroughState, statements), fallThroughState);
    },
    stateToStateMachine_: function(newState, fallThroughState) {
      return new StateMachine(newState.id, fallThroughState, [newState], []);
    },
    transformMachineStates: function(machine, machineEndState, rethrowState, enclosingFinallyState) {
      var cases = [];
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var stateCase = state.transformMachineState(enclosingFinallyState[state.id], machineEndState, this.reporter);
        if (stateCase != null) {
          cases.push(stateCase);
        }
      }
      this.addFinallyFallThroughDispatches(null, machine.exceptionBlocks, cases);
      cases.push(createDefaultClause(parseStatements($__244)));
      return cases;
    },
    addFinallyFallThroughDispatches: function(enclosingFinallyState, tryStates, cases) {
      for (var i = 0; i < tryStates.length; i++) {
        var tryState = tryStates[i];
        if (tryState.kind == TryState.Kind.FINALLY) {
          var finallyState = tryState;
          if (enclosingFinallyState != null) {
            var caseClauses = [];
            var index = 0;
            for (var j = 0; j < enclosingFinallyState.tryStates.length; j++) {
              var destination = enclosingFinallyState.tryStates[j];
              index++;
              var statements;
              if (index < enclosingFinallyState.tryStates.length) {
                statements = createStatementList();
              } else {
                statements = parseStatements($__245, State.INVALID_STATE);
              }
              caseClauses.push(createCaseClause(createNumberLiteral(destination), statements));
            }
            caseClauses.push(createDefaultClause(createStatementList(createAssignStateStatement(enclosingFinallyState.finallyState), createBreakStatement())));
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createSwitchStatement(createMemberExpression('$ctx', 'finallyFallThrough'), caseClauses), createBreakStatement())));
          } else {
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), parseStatements($__246)));
          }
          this.addFinallyFallThroughDispatches(finallyState, finallyState.nestedTrys, cases);
        } else {
          this.addFinallyFallThroughDispatches(enclosingFinallyState, tryState.nestedTrys, cases);
        }
      }
    },
    transformVariableDeclarationList: function(tree) {
      this.reporter.reportError(tree.location && tree.location.start, 'Traceur: const/let declarations in a block containing a yield are ' + 'not yet implemented');
      return tree;
    },
    maybeTransformStatement_: function(maybeTransformedStatement) {
      var breakContinueTransformed = new BreakContinueTransformer(this.stateAllocator_).transformAny(maybeTransformedStatement);
      if (breakContinueTransformed != maybeTransformedStatement) {
        breakContinueTransformed = this.transformAny(breakContinueTransformed);
      }
      return breakContinueTransformed;
    },
    ensureTransformed_: function(statement) {
      if (statement == null) {
        return null;
      }
      var maybeTransformed = this.maybeTransformStatement_(statement);
      return maybeTransformed.type == STATE_MACHINE ? maybeTransformed : this.statementToStateMachine_(maybeTransformed);
    },
    ensureTransformedList_: function(statements) {
      var maybeTransformedStatements = [];
      var foundMachine = false;
      for (var i = 0; i < statements.length; i++) {
        var statement = statements[i];
        var maybeTransformedStatement = this.maybeTransformStatement_(statement);
        maybeTransformedStatements.push(maybeTransformedStatement);
        if (maybeTransformedStatement.type == STATE_MACHINE) {
          foundMachine = true;
        }
      }
      if (!foundMachine) {
        return this.statementsToStateMachine_(statements);
      }
      return this.transformStatementList_(maybeTransformedStatements);
    },
    expressionToStateMachine: function(tree) {
      var commaExpression = new ExplodeExpressionTransformer(this).transformAny(tree);
      var statements = $traceurRuntime.assertObject(new NormalizeCommaExpressionToStatementTransformer().transformAny(commaExpression)).statements;
      var lastStatement = statements.pop();
      assert(lastStatement.type === EXPRESSION_STATEMENT);
      var expression = lastStatement.expression;
      statements = $traceurRuntime.superCall(this, $CPSTransformer.prototype, "transformList", [statements]);
      var machine = this.transformStatementList_(statements);
      return {
        expression: expression,
        machine: machine
      };
    }
  }, {}, TempVarTransformer);
  var NormalizeCommaExpressionToStatementTransformer = function NormalizeCommaExpressionToStatementTransformer() {
    $traceurRuntime.defaultSuperCall(this, $NormalizeCommaExpressionToStatementTransformer.prototype, arguments);
  };
  var $NormalizeCommaExpressionToStatementTransformer = NormalizeCommaExpressionToStatementTransformer;
  ($traceurRuntime.createClass)(NormalizeCommaExpressionToStatementTransformer, {
    transformCommaExpression: function(tree) {
      var $__247 = this;
      var statements = tree.expressions.map((function(expr) {
        if (expr.type === CONDITIONAL_EXPRESSION)
          return $__247.transformAny(expr);
        return createExpressionStatement(expr);
      }));
      return new AnonBlock(tree.location, statements);
    },
    transformConditionalExpression: function(tree) {
      var ifBlock = this.transformAny(tree.left);
      var elseBlock = this.transformAny(tree.right);
      return new IfStatement(tree.location, tree.condition, anonBlockToBlock(ifBlock), anonBlockToBlock(elseBlock));
    }
  }, {}, ParseTreeTransformer);
  function anonBlockToBlock(tree) {
    if (tree.type === PAREN_EXPRESSION)
      return anonBlockToBlock(tree.expression);
    return new Block(tree.location, tree.statements);
  }
  return {get CPSTransformer() {
      return CPSTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/EndState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/EndState";
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var EndState = function EndState() {
    $traceurRuntime.defaultSuperCall(this, $EndState.prototype, arguments);
  };
  var $EndState = EndState;
  ($traceurRuntime.createClass)(EndState, {
    replaceState: function(oldState, newState) {
      return new $EndState(State.replaceStateId(this.id, oldState, newState));
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return State.generateJump(enclosingFinally, machineEndState);
    }
  }, {}, State);
  return {get EndState() {
      return EndState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/AsyncTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/AsyncTransformer";
  var $__253 = Object.freeze(Object.defineProperties(["$ctx.value"], {raw: {value: Object.freeze(["$ctx.value"])}})),
      $__254 = Object.freeze(Object.defineProperties(["$ctx.returnValue = ", ""], {raw: {value: Object.freeze(["$ctx.returnValue = ", ""])}})),
      $__255 = Object.freeze(Object.defineProperties(["$ctx.resolve(", ")"], {raw: {value: Object.freeze(["$ctx.resolve(", ")"])}})),
      $__256 = Object.freeze(Object.defineProperties(["$traceurRuntime.asyncWrap"], {raw: {value: Object.freeze(["$traceurRuntime.asyncWrap"])}}));
  var AwaitState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/AwaitState")).AwaitState;
  var $__258 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BinaryOperator = $__258.BinaryOperator,
      ExpressionStatement = $__258.ExpressionStatement,
      IdentifierExpression = $__258.IdentifierExpression;
  var CPSTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/CPSTransformer")).CPSTransformer;
  var EndState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/EndState")).EndState;
  var FallThroughState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FallThroughState")).FallThroughState;
  var $__258 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      AWAIT_EXPRESSION = $__258.AWAIT_EXPRESSION,
      BINARY_OPERATOR = $__258.BINARY_OPERATOR,
      STATE_MACHINE = $__258.STATE_MACHINE;
  var $__258 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__258.parseExpression,
      parseStatement = $__258.parseStatement,
      parseStatements = $__258.parseStatements;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var StateMachine = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/StateMachine")).StateMachine;
  var $__258 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      EQUAL = $__258.EQUAL,
      VAR = $__258.VAR;
  var FindInFunctionScope = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindInFunctionScope")).FindInFunctionScope;
  var $__258 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignStateStatement = $__258.createAssignStateStatement,
      createBreakStatement = $__258.createBreakStatement,
      createOperatorToken = $__258.createOperatorToken,
      createReturnStatement = $__258.createReturnStatement,
      createStatementList = $__258.createStatementList,
      createUndefinedExpression = $__258.createUndefinedExpression;
  function isAwaitAssign(tree) {
    return tree.type === BINARY_OPERATOR && tree.operator.isAssignmentOperator() && tree.right.type === AWAIT_EXPRESSION && tree.left.isLeftHandSideExpression();
  }
  var AwaitFinder = function AwaitFinder() {
    $traceurRuntime.defaultSuperCall(this, $AwaitFinder.prototype, arguments);
  };
  var $AwaitFinder = AwaitFinder;
  ($traceurRuntime.createClass)(AwaitFinder, {visitAwaitExpression: function(tree) {
      this.found = true;
    }}, {}, FindInFunctionScope);
  function scopeContainsAwait(tree) {
    return new AwaitFinder(tree).found;
  }
  var AsyncTransformer = function AsyncTransformer() {
    $traceurRuntime.defaultSuperCall(this, $AsyncTransformer.prototype, arguments);
  };
  var $AsyncTransformer = AsyncTransformer;
  ($traceurRuntime.createClass)(AsyncTransformer, {
    expressionNeedsStateMachine: function(tree) {
      if (tree === null)
        return false;
      return scopeContainsAwait(tree);
    },
    transformExpressionStatement: function(tree) {
      var expression = tree.expression;
      if (expression.type === AWAIT_EXPRESSION)
        return this.transformAwaitExpression_(expression);
      if (isAwaitAssign(expression))
        return this.transformAwaitAssign_(expression);
      if (this.expressionNeedsStateMachine(expression)) {
        return this.expressionToStateMachine(expression).machine;
      }
      return $traceurRuntime.superCall(this, $AsyncTransformer.prototype, "transformExpressionStatement", [tree]);
    },
    transformAwaitExpression: function(tree) {
      throw new Error('Internal error');
    },
    transformAwaitExpression_: function(tree) {
      return this.transformAwait_(tree, tree.expression, null, null);
    },
    transformAwaitAssign_: function(tree) {
      return this.transformAwait_(tree, tree.right.expression, tree.left, tree.operator);
    },
    transformAwait_: function(tree, expression, left, operator) {
      var createTaskState = this.allocateState();
      var callbackState = this.allocateState();
      var fallThroughState = this.allocateState();
      if (!left)
        callbackState = fallThroughState;
      var states = [];
      var expression = this.transformAny(expression);
      states.push(new AwaitState(createTaskState, callbackState, expression));
      if (left) {
        var statement = new ExpressionStatement(tree.location, new BinaryOperator(tree.location, left, operator, parseExpression($__253)));
        var assignment = [statement];
        states.push(new FallThroughState(callbackState, fallThroughState, assignment));
      }
      return new StateMachine(createTaskState, fallThroughState, states, []);
    },
    transformFinally: function(tree) {
      var result = $traceurRuntime.superCall(this, $AsyncTransformer.prototype, "transformFinally", [tree]);
      if (result.block.type != STATE_MACHINE) {
        return result;
      }
      this.reporter.reportError(tree.location.start, 'await not permitted within a finally block.');
      return result;
    },
    transformReturnStatement: function(tree) {
      var $__258;
      var expression,
          machine;
      if (this.expressionNeedsStateMachine(tree.expression)) {
        (($__258 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.expression)), expression = $__258.expression, machine = $__258.machine, $__258));
      } else {
        expression = tree.expression || createUndefinedExpression();
      }
      var startState = this.allocateState();
      var endState = this.allocateState();
      var completeState = new FallThroughState(startState, endState, parseStatements($__254, expression));
      var end = new EndState(endState);
      var returnMachine = new StateMachine(startState, this.allocateState(), [completeState, end], []);
      if (machine)
        returnMachine = machine.append(returnMachine);
      return returnMachine;
    },
    createCompleteTask_: function(result) {
      return parseStatement($__255, result);
    },
    transformAsyncBody: function(tree) {
      var runtimeFunction = parseExpression($__256);
      return this.transformCpsFunctionBody(tree, runtimeFunction);
    }
  }, {transformAsyncBody: function(identifierGenerator, reporter, body) {
      return new $AsyncTransformer(identifierGenerator, reporter).transformAsyncBody(body);
    }}, CPSTransformer);
  ;
  return {get AsyncTransformer() {
      return AsyncTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/ForInTransformPass", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/ForInTransformPass";
  var $__260 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BLOCK = $__260.BLOCK,
      VARIABLE_DECLARATION_LIST = $__260.VARIABLE_DECLARATION_LIST,
      IDENTIFIER_EXPRESSION = $__260.IDENTIFIER_EXPRESSION;
  var $__260 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      LENGTH = $__260.LENGTH,
      PUSH = $__260.PUSH;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__260 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      BANG = $__260.BANG,
      IN = $__260.IN,
      OPEN_ANGLE = $__260.OPEN_ANGLE,
      PLUS_PLUS = $__260.PLUS_PLUS,
      VAR = $__260.VAR;
  var $__260 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArgumentList = $__260.createArgumentList,
      createAssignmentStatement = $__260.createAssignmentStatement,
      createBinaryOperator = $__260.createBinaryOperator,
      createBlock = $__260.createBlock,
      createCallStatement = $__260.createCallStatement,
      createContinueStatement = $__260.createContinueStatement,
      createEmptyArrayLiteralExpression = $__260.createEmptyArrayLiteralExpression,
      createForInStatement = $__260.createForInStatement,
      createForStatement = $__260.createForStatement,
      createIdentifierExpression = $__260.createIdentifierExpression,
      createIfStatement = $__260.createIfStatement,
      createMemberExpression = $__260.createMemberExpression,
      createMemberLookupExpression = $__260.createMemberLookupExpression,
      createNumberLiteral = $__260.createNumberLiteral,
      createOperatorToken = $__260.createOperatorToken,
      createParenExpression = $__260.createParenExpression,
      createPostfixExpression = $__260.createPostfixExpression,
      createUnaryExpression = $__260.createUnaryExpression,
      createVariableDeclarationList = $__260.createVariableDeclarationList,
      createVariableStatement = $__260.createVariableStatement;
  var ForInTransformPass = function ForInTransformPass() {
    $traceurRuntime.defaultSuperCall(this, $ForInTransformPass.prototype, arguments);
  };
  var $ForInTransformPass = ForInTransformPass;
  ($traceurRuntime.createClass)(ForInTransformPass, {transformForInStatement: function(original) {
      var $__261;
      var tree = original;
      var bodyStatements = [];
      var body = this.transformAny(tree.body);
      if (body.type == BLOCK) {
        ($__261 = bodyStatements).push.apply($__261, $traceurRuntime.toObject(body.statements));
      } else {
        bodyStatements.push(body);
      }
      var elements = [];
      var keys = this.getTempIdentifier();
      elements.push(createVariableStatement(VAR, keys, createEmptyArrayLiteralExpression()));
      var collection = this.getTempIdentifier();
      elements.push(createVariableStatement(VAR, collection, tree.collection));
      var p = this.getTempIdentifier();
      elements.push(createForInStatement(createVariableDeclarationList(VAR, p, null), createIdentifierExpression(collection), createCallStatement(createMemberExpression(keys, PUSH), createArgumentList(createIdentifierExpression(p)))));
      var i = this.getTempIdentifier();
      var lookup = createMemberLookupExpression(createIdentifierExpression(keys), createIdentifierExpression(i));
      var originalKey,
          assignOriginalKey;
      if (tree.initializer.type == VARIABLE_DECLARATION_LIST) {
        var decList = tree.initializer;
        originalKey = createIdentifierExpression(decList.declarations[0].lvalue);
        assignOriginalKey = createVariableStatement(decList.declarationType, originalKey.identifierToken, lookup);
      } else if (tree.initializer.type == IDENTIFIER_EXPRESSION) {
        originalKey = tree.initializer;
        assignOriginalKey = createAssignmentStatement(tree.initializer, lookup);
      } else {
        throw new Error('Invalid left hand side of for in loop');
      }
      var innerBlock = [];
      innerBlock.push(assignOriginalKey);
      innerBlock.push(createIfStatement(createUnaryExpression(createOperatorToken(BANG), createParenExpression(createBinaryOperator(originalKey, createOperatorToken(IN), createIdentifierExpression(collection)))), createContinueStatement(), null));
      ($__261 = innerBlock).push.apply($__261, $traceurRuntime.toObject(bodyStatements));
      elements.push(createForStatement(createVariableDeclarationList(VAR, i, createNumberLiteral(0)), createBinaryOperator(createIdentifierExpression(i), createOperatorToken(OPEN_ANGLE), createMemberExpression(keys, LENGTH)), createPostfixExpression(createIdentifierExpression(i), createOperatorToken(PLUS_PLUS)), createBlock(innerBlock)));
      return createBlock(elements);
    }}, {}, TempVarTransformer);
  return {get ForInTransformPass() {
      return ForInTransformPass;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/YieldState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/YieldState";
  var $__262 = Object.freeze(Object.defineProperties(["return ", ""], {raw: {value: Object.freeze(["return ", ""])}}));
  var CURRENT = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).CURRENT;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var $__264 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentStatement = $__264.createAssignmentStatement,
      createIdentifierExpression = $__264.createIdentifierExpression,
      createMemberExpression = $__264.createMemberExpression,
      createReturnStatement = $__264.createReturnStatement,
      createThisExpression = $__264.createThisExpression,
      createTrueLiteral = $__264.createTrueLiteral;
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  var YieldState = function YieldState(id, fallThroughState, expression) {
    $traceurRuntime.superCall(this, $YieldState.prototype, "constructor", [id]);
    this.fallThroughState = fallThroughState;
    this.expression = expression;
  };
  var $YieldState = YieldState;
  ($traceurRuntime.createClass)(YieldState, {
    replaceState: function(oldState, newState) {
      return new this.constructor(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.expression);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return $traceurRuntime.spread(State.generateAssignState(enclosingFinally, this.fallThroughState), [parseStatement($__262, this.expression)]);
    }
  }, {}, State);
  return {get YieldState() {
      return YieldState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/ReturnState", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/ReturnState";
  var $__265 = Object.freeze(Object.defineProperties(["$ctx.returnValue = ", ""], {raw: {value: Object.freeze(["$ctx.returnValue = ", ""])}}));
  var $__267 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/util")),
      isUndefined = $__267.isUndefined,
      isVoidExpression = $__267.isVoidExpression;
  var YieldState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/YieldState")).YieldState;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var $__267 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentStatement = $__267.createAssignmentStatement,
      createMemberExpression = $__267.createMemberExpression,
      createThisExpression = $__267.createThisExpression;
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  var ReturnState = function ReturnState() {
    $traceurRuntime.defaultSuperCall(this, $ReturnState.prototype, arguments);
  };
  var $ReturnState = ReturnState;
  ($traceurRuntime.createClass)(ReturnState, {transform: function(enclosingFinally, machineEndState, reporter) {
      var $__268;
      var e = this.expression;
      var statements = [];
      if (e && !isUndefined(e) && !isVoidExpression(e))
        statements.push(parseStatement($__265, this.expression));
      ($__268 = statements).push.apply($__268, $traceurRuntime.toObject(State.generateJump(enclosingFinally, machineEndState)));
      return statements;
    }}, {}, YieldState);
  return {get ReturnState() {
      return ReturnState;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/generator/GeneratorTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/generator/GeneratorTransformer";
  var $__269 = Object.freeze(Object.defineProperties(["\n        ", " = ", "[Symbol.iterator]();\n        // received = void 0;\n        $ctx.sent = void 0;\n        // send = true; // roughly equivalent\n        $ctx.action = 'next';\n\n        for (;;) {\n          ", " = ", "[$ctx.action]($ctx.sentIgnoreThrow);\n          if (", ".done) {\n            $ctx.sent = ", ".value;\n            break;\n          }\n          ", ";\n        }"], {raw: {value: Object.freeze(["\n        ", " = ", "[Symbol.iterator]();\n        // received = void 0;\n        $ctx.sent = void 0;\n        // send = true; // roughly equivalent\n        $ctx.action = 'next';\n\n        for (;;) {\n          ", " = ", "[$ctx.action]($ctx.sentIgnoreThrow);\n          if (", ".done) {\n            $ctx.sent = ", ".value;\n            break;\n          }\n          ", ";\n        }"])}})),
      $__270 = Object.freeze(Object.defineProperties(["$ctx.sentIgnoreThrow"], {raw: {value: Object.freeze(["$ctx.sentIgnoreThrow"])}})),
      $__271 = Object.freeze(Object.defineProperties(["$ctx.sent"], {raw: {value: Object.freeze(["$ctx.sent"])}})),
      $__272 = Object.freeze(Object.defineProperties(["$ctx.maybeThrow()"], {raw: {value: Object.freeze(["$ctx.maybeThrow()"])}})),
      $__273 = Object.freeze(Object.defineProperties(["$traceurRuntime.createGeneratorInstance"], {raw: {value: Object.freeze(["$traceurRuntime.createGeneratorInstance"])}}));
  var CPSTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/CPSTransformer")).CPSTransformer;
  var $__275 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINARY_OPERATOR = $__275.BINARY_OPERATOR,
      STATE_MACHINE = $__275.STATE_MACHINE,
      YIELD_EXPRESSION = $__275.YIELD_EXPRESSION;
  var $__275 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BinaryOperator = $__275.BinaryOperator,
      ExpressionStatement = $__275.ExpressionStatement;
  var ExplodeExpressionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ExplodeExpressionTransformer")).ExplodeExpressionTransformer;
  var FallThroughState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/FallThroughState")).FallThroughState;
  var FindInFunctionScope = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindInFunctionScope")).FindInFunctionScope;
  var ReturnState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/ReturnState")).ReturnState;
  var State = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/State")).State;
  var StateMachine = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/StateMachine")).StateMachine;
  var YieldState = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/YieldState")).YieldState;
  var $__275 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignStateStatement = $__275.createAssignStateStatement,
      createFunctionBody = $__275.createFunctionBody,
      id = $__275.createIdentifierExpression,
      createMemberExpression = $__275.createMemberExpression,
      createStatementList = $__275.createStatementList,
      createUndefinedExpression = $__275.createUndefinedExpression,
      createYieldStatement = $__275.createYieldStatement;
  var $__275 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__275.parseExpression,
      parseStatement = $__275.parseStatement,
      parseStatements = $__275.parseStatements;
  function isYieldAssign(tree) {
    return tree.type === BINARY_OPERATOR && tree.operator.isAssignmentOperator() && tree.right.type === YIELD_EXPRESSION && tree.left.isLeftHandSideExpression();
  }
  var YieldFinder = function YieldFinder() {
    $traceurRuntime.defaultSuperCall(this, $YieldFinder.prototype, arguments);
  };
  var $YieldFinder = YieldFinder;
  ($traceurRuntime.createClass)(YieldFinder, {visitYieldExpression: function(tree) {
      this.found = true;
    }}, {}, FindInFunctionScope);
  function scopeContainsYield(tree) {
    return new YieldFinder(tree).found;
  }
  var GeneratorTransformer = function GeneratorTransformer(identifierGenerator, reporter) {
    $traceurRuntime.superCall(this, $GeneratorTransformer.prototype, "constructor", [identifierGenerator, reporter]);
    this.shouldAppendThrowCloseState_ = true;
  };
  var $GeneratorTransformer = GeneratorTransformer;
  ($traceurRuntime.createClass)(GeneratorTransformer, {
    expressionNeedsStateMachine: function(tree) {
      if (tree === null)
        return false;
      return scopeContainsYield(tree);
    },
    transformYieldExpression_: function(tree) {
      var $__275;
      var expression,
          machine;
      if (this.expressionNeedsStateMachine(tree.expression)) {
        (($__275 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.expression)), expression = $__275.expression, machine = $__275.machine, $__275));
      } else {
        expression = this.transformAny(tree.expression);
        if (!expression)
          expression = createUndefinedExpression();
      }
      if (tree.isYieldFor)
        return this.transformYieldForExpression_(expression, machine);
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      var yieldMachine = this.stateToStateMachine_(new YieldState(startState, fallThroughState, this.transformAny(expression)), fallThroughState);
      if (machine)
        yieldMachine = machine.append(yieldMachine);
      if (this.shouldAppendThrowCloseState_)
        yieldMachine = yieldMachine.append(this.createThrowCloseState_());
      return yieldMachine;
    },
    transformYieldForExpression_: function(expression) {
      var machine = arguments[1];
      var gName = this.getTempIdentifier();
      this.addMachineVariable(gName);
      var g = id(gName);
      var nextName = this.getTempIdentifier();
      this.addMachineVariable(nextName);
      var next = id(nextName);
      var statements = parseStatements($__269, g, expression, next, g, next, next, createYieldStatement(createMemberExpression(next, 'value')));
      var shouldAppendThrowCloseState = this.shouldAppendThrowCloseState_;
      this.shouldAppendThrowCloseState_ = false;
      statements = this.transformList(statements);
      var yieldMachine = this.transformStatementList_(statements);
      this.shouldAppendThrowCloseState_ = shouldAppendThrowCloseState;
      if (machine)
        yieldMachine = machine.append(yieldMachine);
      return yieldMachine;
    },
    transformYieldExpression: function(tree) {
      this.reporter.reportError(tree.location.start, 'Only \'a = yield b\' and \'var a = yield b\' currently supported.');
      return tree;
    },
    transformYieldAssign_: function(tree) {
      var shouldAppendThrowCloseState = this.shouldAppendThrowCloseState_;
      this.shouldAppendThrowCloseState_ = false;
      var machine = this.transformYieldExpression_(tree.right);
      var left = this.transformAny(tree.left);
      var sentExpression = tree.right.isYieldFor ? parseExpression($__270) : parseExpression($__271);
      var statement = new ExpressionStatement(tree.location, new BinaryOperator(tree.location, left, tree.operator, sentExpression));
      var assignMachine = this.statementToStateMachine_(statement);
      this.shouldAppendThrowCloseState_ = shouldAppendThrowCloseState;
      return machine.append(assignMachine);
    },
    createThrowCloseState_: function() {
      return this.statementToStateMachine_(parseStatement($__272));
    },
    transformExpressionStatement: function(tree) {
      var expression = tree.expression;
      if (expression.type === YIELD_EXPRESSION)
        return this.transformYieldExpression_(expression);
      if (isYieldAssign(expression))
        return this.transformYieldAssign_(expression);
      if (this.expressionNeedsStateMachine(expression)) {
        return this.expressionToStateMachine(expression).machine;
      }
      return $traceurRuntime.superCall(this, $GeneratorTransformer.prototype, "transformExpressionStatement", [tree]);
    },
    transformAwaitStatement: function(tree) {
      this.reporter.reportError(tree.location.start, 'Generator function may not have an await statement.');
      return tree;
    },
    transformReturnStatement: function(tree) {
      var $__275;
      var expression,
          machine;
      if (this.expressionNeedsStateMachine(tree.expression))
        (($__275 = $traceurRuntime.assertObject(this.expressionToStateMachine(tree.expression)), expression = $__275.expression, machine = $__275.machine, $__275));
      else
        expression = tree.expression;
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      var returnMachine = this.stateToStateMachine_(new ReturnState(startState, fallThroughState, this.transformAny(expression)), fallThroughState);
      if (machine)
        return machine.append(returnMachine);
      return returnMachine;
    },
    transformGeneratorBody: function(tree, name) {
      var runtimeFunction = parseExpression($__273);
      return this.transformCpsFunctionBody(tree, runtimeFunction, name);
    }
  }, {transformGeneratorBody: function(identifierGenerator, reporter, body, name) {
      return new $GeneratorTransformer(identifierGenerator, reporter).transformGeneratorBody(body, name);
    }}, CPSTransformer);
  ;
  return {get GeneratorTransformer() {
      return GeneratorTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/GeneratorTransformPass", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/GeneratorTransformPass";
  var $__276 = Object.freeze(Object.defineProperties(["$traceurRuntime.initGeneratorFunction(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.initGeneratorFunction(", ")"])}})),
      $__277 = Object.freeze(Object.defineProperties(["var ", " = ", ""], {raw: {value: Object.freeze(["var ", " = ", ""])}})),
      $__278 = Object.freeze(Object.defineProperties(["$traceurRuntime.initGeneratorFunction(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.initGeneratorFunction(", ")"])}}));
  var AsyncTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/AsyncTransformer")).AsyncTransformer;
  var ForInTransformPass = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/ForInTransformPass")).ForInTransformPass;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      GetAccessor = $__280.GetAccessor,
      SetAccessor = $__280.SetAccessor;
  var GeneratorTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/generator/GeneratorTransformer")).GeneratorTransformer;
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__280.parseExpression,
      parseStatement = $__280.parseStatement;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      EQUAL = $__280.EQUAL,
      STAR = $__280.STAR;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINARY_OPERATOR = $__280.BINARY_OPERATOR,
      COMMA_EXPRESSION = $__280.COMMA_EXPRESSION,
      PAREN_EXPRESSION = $__280.PAREN_EXPRESSION,
      YIELD_EXPRESSION = $__280.YIELD_EXPRESSION;
  var FindInFunctionScope = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindInFunctionScope")).FindInFunctionScope;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      AnonBlock = $__280.AnonBlock,
      FunctionDeclaration = $__280.FunctionDeclaration,
      FunctionExpression = $__280.FunctionExpression;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentExpression = $__280.createAssignmentExpression,
      createAssignmentStatement = $__280.createAssignmentStatement,
      createBindingIdentifier = $__280.createBindingIdentifier,
      createBlock = $__280.createBlock,
      createCommaExpression = $__280.createCommaExpression,
      createExpressionStatement = $__280.createExpressionStatement,
      id = $__280.createIdentifierExpression,
      createIdentifierToken = $__280.createIdentifierToken,
      createMemberExpression = $__280.createMemberExpression,
      createVariableDeclaration = $__280.createVariableDeclaration,
      createVariableDeclarationList = $__280.createVariableDeclarationList,
      createVariableStatement = $__280.createVariableStatement,
      createYieldStatement = $__280.createYieldStatement;
  var prependStatements = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PrependStatements")).prependStatements;
  var $__280 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")),
      transformOptions = $__280.transformOptions,
      options = $__280.options;
  var ForInFinder = function ForInFinder() {
    $traceurRuntime.defaultSuperCall(this, $ForInFinder.prototype, arguments);
  };
  var $ForInFinder = ForInFinder;
  ($traceurRuntime.createClass)(ForInFinder, {visitForInStatement: function(tree) {
      this.found = true;
    }}, {}, FindInFunctionScope);
  function needsTransform(tree) {
    return transformOptions.generators && tree.isGenerator() || transformOptions.asyncFunctions && tree.isAsyncFunction();
  }
  var GeneratorTransformPass = function GeneratorTransformPass(identifierGenerator, reporter) {
    $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "constructor", [identifierGenerator]);
    this.reporter_ = reporter;
    this.inBlock_ = false;
  };
  var $GeneratorTransformPass = GeneratorTransformPass;
  ($traceurRuntime.createClass)(GeneratorTransformPass, {
    transformFunctionDeclaration: function(tree) {
      if (!needsTransform(tree))
        return $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "transformFunctionDeclaration", [tree]);
      if (tree.isGenerator())
        return this.transformGeneratorDeclaration_(tree);
      return this.transformFunction_(tree, FunctionDeclaration, null);
    },
    transformGeneratorDeclaration_: function(tree) {
      var nameIdExpression = id(tree.name.identifierToken);
      var setupPrototypeExpression = parseExpression($__276, nameIdExpression);
      var tmpVar = id(this.inBlock_ ? this.getTempIdentifier() : this.addTempVar(setupPrototypeExpression));
      var funcDecl = this.transformFunction_(tree, FunctionDeclaration, tmpVar);
      if (!this.inBlock_)
        return funcDecl;
      return new AnonBlock(null, [funcDecl, parseStatement($__277, tmpVar, setupPrototypeExpression)]);
    },
    transformFunctionExpression: function(tree) {
      if (!needsTransform(tree))
        return $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "transformFunctionExpression", [tree]);
      if (tree.isGenerator())
        return this.transformGeneratorExpression_(tree);
      return this.transformFunction_(tree, FunctionExpression, null);
    },
    transformGeneratorExpression_: function(tree) {
      var name;
      if (!tree.name) {
        name = createIdentifierToken(this.getTempIdentifier());
        tree = new FunctionExpression(tree.location, createBindingIdentifier(name), tree.functionKind, tree.parameterList, tree.typeAnnotation, tree.annotations, tree.functionBody);
      } else {
        name = tree.name.identifierToken;
      }
      var functionExpression = this.transformFunction_(tree, FunctionExpression, id(name));
      return parseExpression($__278, functionExpression);
    },
    transformFunction_: function(tree, constructor, nameExpression) {
      var body = $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "transformAny", [tree.functionBody]);
      var finder = new ForInFinder(body);
      if (finder.found) {
        body = new ForInTransformPass(this.identifierGenerator).transformAny(body);
      }
      if (transformOptions.generators && tree.isGenerator()) {
        body = GeneratorTransformer.transformGeneratorBody(this.identifierGenerator, this.reporter_, body, nameExpression);
      } else if (transformOptions.asyncFunctions && tree.isAsyncFunction()) {
        body = AsyncTransformer.transformAsyncBody(this.identifierGenerator, this.reporter_, body);
      }
      var functionKind = null;
      return new constructor(tree.location, tree.name, functionKind, tree.parameterList, tree.typeAnnotation, tree.annotations, body);
    },
    transformBlock: function(tree) {
      var inBlock = this.inBlock_;
      this.inBlock_ = true;
      var rv = $traceurRuntime.superCall(this, $GeneratorTransformPass.prototype, "transformBlock", [tree]);
      this.inBlock_ = inBlock;
      return rv;
    }
  }, {}, TempVarTransformer);
  return {get GeneratorTransformPass() {
      return GeneratorTransformPass;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/InlineModuleTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/InlineModuleTransformer";
  var VAR = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).VAR;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var ModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ModuleTransformer")).ModuleTransformer;
  var $__282 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createBindingIdentifier = $__282.createBindingIdentifier,
      createEmptyStatement = $__282.createEmptyStatement,
      createFunctionBody = $__282.createFunctionBody,
      createImmediatelyInvokedFunctionExpression = $__282.createImmediatelyInvokedFunctionExpression,
      createScopedExpression = $__282.createScopedExpression,
      createVariableStatement = $__282.createVariableStatement;
  var globalThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/globalThis")).default;
  var scopeContainsThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/scopeContainsThis")).default;
  var InlineModuleTransformer = function InlineModuleTransformer() {
    $traceurRuntime.defaultSuperCall(this, $InlineModuleTransformer.prototype, arguments);
  };
  var $InlineModuleTransformer = InlineModuleTransformer;
  ($traceurRuntime.createClass)(InlineModuleTransformer, {
    wrapModule: function(statements) {
      assert(this.moduleName);
      var idName = this.getTempVarNameForModuleName(this.moduleName);
      var body = createFunctionBody(statements);
      var moduleExpression;
      if (statements.some(scopeContainsThis)) {
        moduleExpression = createScopedExpression(body, globalThis());
      } else {
        moduleExpression = createImmediatelyInvokedFunctionExpression(body);
      }
      return [createVariableStatement(VAR, idName, moduleExpression)];
    },
    transformNamedExport: function(tree) {
      return createEmptyStatement();
    },
    transformModuleSpecifier: function(tree) {
      return createBindingIdentifier(this.getTempVarNameForModuleSpecifier(tree));
    }
  }, {}, ModuleTransformer);
  return {get InlineModuleTransformer() {
      return InlineModuleTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/InstantiateModuleTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/InstantiateModuleTransformer";
  var $__283 = Object.freeze(Object.defineProperties(["", " = ", ""], {raw: {value: Object.freeze(["", " = ", ""])}})),
      $__284 = Object.freeze(Object.defineProperties(["System.register(", ", ", ", function(", ") {\n          ", "\n        });"], {raw: {value: Object.freeze(["System.register(", ", ", ", function(", ") {\n          ", "\n        });"])}})),
      $__285 = Object.freeze(Object.defineProperties(["System.register(", ", function(", ") {\n          ", "\n        });"], {raw: {value: Object.freeze(["System.register(", ", function(", ") {\n          ", "\n        });"])}})),
      $__286 = Object.freeze(Object.defineProperties(["function() {\n      ", "\n    }"], {raw: {value: Object.freeze(["function() {\n      ", "\n    }"])}})),
      $__287 = Object.freeze(Object.defineProperties(["function() {}"], {raw: {value: Object.freeze(["function() {}"])}})),
      $__288 = Object.freeze(Object.defineProperties(["return {\n        exports: ", ",\n        exportStar: ", ",\n        execute: ", "\n      }"], {raw: {value: Object.freeze(["return {\n        exports: ", ",\n        exportStar: ", ",\n        execute: ", "\n      }"])}})),
      $__289 = Object.freeze(Object.defineProperties(["return {\n        exports: ", ",\n        execute: ", "\n      }"], {raw: {value: Object.freeze(["return {\n        exports: ", ",\n        execute: ", "\n      }"])}})),
      $__290 = Object.freeze(Object.defineProperties(["", "[", "][", "]"], {raw: {value: Object.freeze(["", "[", "][", "]"])}})),
      $__291 = Object.freeze(Object.defineProperties(["", "[", "]"], {raw: {value: Object.freeze(["", "[", "]"])}})),
      $__292 = Object.freeze(Object.defineProperties(["set ", "(value) { ", " = value; }"], {raw: {value: Object.freeze(["set ", "(value) { ", " = value; }"])}})),
      $__293 = Object.freeze(Object.defineProperties(["get ", "() { return ", "; }"], {raw: {value: Object.freeze(["get ", "() { return ", "; }"])}}));
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var $__296 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ClassExpression = $__296.ClassExpression,
      EmptyStatement = $__296.EmptyStatement,
      NamedExport = $__296.NamedExport;
  var THIS = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")).THIS;
  var $__296 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      EXPORT_DEFAULT = $__296.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__296.EXPORT_SPECIFIER,
      EXPORT_STAR = $__296.EXPORT_STAR;
  var AlphaRenamer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AlphaRenamer")).AlphaRenamer;
  var $__296 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createIdentifierExpression = $__296.createIdentifierExpression,
      createMemberExpression = $__296.createMemberExpression,
      createObjectLiteralExpression = $__296.createObjectLiteralExpression;
  var ModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ModuleTransformer")).ModuleTransformer;
  var $__296 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__296.parseExpression,
      parsePropertyDefinition = $__296.parsePropertyDefinition,
      parseStatement = $__296.parseStatement,
      parseStatements = $__296.parseStatements;
  var HoistVariablesTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/HoistVariablesTransformer")).default;
  var DeclarationExtractionTransformer = function DeclarationExtractionTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $DeclarationExtractionTransformer.prototype, "constructor", []);
    this.identifierGenerator = identifierGenerator;
    this.declarations_ = [];
  };
  var $DeclarationExtractionTransformer = DeclarationExtractionTransformer;
  ($traceurRuntime.createClass)(DeclarationExtractionTransformer, {
    getDeclarationStatements: function() {
      return $traceurRuntime.spread([this.getVariableStatement()], this.declarations_);
    },
    addDeclaration: function(tree) {
      this.declarations_.push(tree);
    },
    transformFunctionDeclaration: function(tree) {
      this.addDeclaration(tree);
      return new EmptyStatement(null);
    },
    transformClassDeclaration: function(tree) {
      this.addVariable(tree.name.identifierToken.value);
      tree = new ClassExpression(tree.location, tree.name, tree.superClass, tree.elements, tree.annotations);
      return parseStatement($__283, tree.name.identifierToken, tree);
    }
  }, {}, HoistVariablesTransformer);
  var ReplaceIdentifierExpressionTransformer = function ReplaceIdentifierExpressionTransformer(oldName, newExpression) {
    $traceurRuntime.superCall(this, $ReplaceIdentifierExpressionTransformer.prototype, "constructor", []);
    this.oldName_ = oldName;
    this.newExpression_ = newExpression;
  };
  var $ReplaceIdentifierExpressionTransformer = ReplaceIdentifierExpressionTransformer;
  ($traceurRuntime.createClass)(ReplaceIdentifierExpressionTransformer, {
    transformIdentifierExpression: function(tree) {
      if (this.oldName_ == tree.identifierToken.value) {
        return this.newExpression_;
      } else {
        return tree;
      }
    },
    transformThisExpression: function(tree) {
      if (this.oldName_ !== THIS)
        return tree;
      return this.newExpression_;
    }
  }, {rename: function(tree, oldName, newExpression) {
      return new $ReplaceIdentifierExpressionTransformer(oldName, newExpression).transformAny(tree);
    }}, AlphaRenamer);
  var InstantiateModuleTransformer = function InstantiateModuleTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $InstantiateModuleTransformer.prototype, "constructor", [identifierGenerator]);
    this.declarationExtractionTransformer = new DeclarationExtractionTransformer(identifierGenerator, this.moduleBindings_);
    this.dependencies = [];
    this.depMapIdentifier = createIdentifierExpression(this.identifierGenerator.generateUniqueIdentifier());
    this.moduleBindings_ = [];
  };
  var $InstantiateModuleTransformer = InstantiateModuleTransformer;
  ($traceurRuntime.createClass)(InstantiateModuleTransformer, {
    wrapModule: function(statements) {
      if (this.moduleName) {
        return parseStatements($__284, this.moduleName, this.dependencies, this.depMapIdentifier, statements);
      } else {
        return parseStatements($__285, this.dependencies, this.depMapIdentifier, statements);
      }
    },
    appendExportStatement: function(statements) {
      var $__294 = this;
      var executionStatements = statements.map((function(statement) {
        return $__294.declarationExtractionTransformer.transformAny(statement);
      }));
      var executionFunction = executionStatements.length ? parseExpression($__286, executionStatements) : parseExpression($__287);
      var declarationStatements = this.declarationExtractionTransformer.getDeclarationStatements();
      var exportStarDeps = this.exportVisitor_.starExports.map((function(moduleSpecifier) {
        return moduleSpecifier.token.processedValue;
      }));
      if (exportStarDeps.length) {
        declarationStatements.push(parseStatement($__288, this.getExportObject(), exportStarDeps, executionFunction));
      } else {
        declarationStatements.push(parseStatement($__289, this.getExportObject(), executionFunction));
      }
      this.moduleBindings_.forEach((function(binding) {
        var moduleMemberExpression = parseExpression($__290, $__294.depMapIdentifier, binding.depIndex, binding.importName);
        declarationStatements = declarationStatements.map((function(statement) {
          return ReplaceIdentifierExpressionTransformer.rename(statement, binding.variableName, moduleMemberExpression);
        }));
      }));
      return declarationStatements;
    },
    getExportObject: function() {
      return createObjectLiteralExpression(this.getExportProperties());
    },
    addModuleBinding: function(moduleBinding) {
      this.moduleBindings_.push(moduleBinding);
    },
    getOrCreateDependencyIndex: function(moduleSpecifier) {
      var name = moduleSpecifier.token.processedValue;
      var depIndex = this.dependencies.indexOf(name);
      if (depIndex == -1) {
        depIndex = this.dependencies.length;
        this.dependencies.push(name);
      }
      return depIndex;
    },
    transformModuleSpecifier: function(tree) {
      var depIndex = this.getOrCreateDependencyIndex(tree);
      return parseExpression($__291, this.depMapIdentifier, depIndex);
    },
    getExportExpression: function($__296) {
      var name = $__296.name,
          tree = $__296.tree,
          moduleSpecifier = $__296.moduleSpecifier;
      switch (tree.type) {
        case EXPORT_DEFAULT:
          return createIdentifierExpression('$__default');
        case EXPORT_SPECIFIER:
          if (moduleSpecifier) {
            return createMemberExpression(moduleSpecifier, tree.lhs);
          }
          return createIdentifierExpression(tree.lhs);
        default:
          return createIdentifierExpression(name);
      }
    },
    getSetterExport: function(exp) {
      return parsePropertyDefinition($__292, exp.name, this.getExportExpression(exp));
    },
    getGetterExport: function(exp) {
      return parsePropertyDefinition($__293, exp.name, this.getExportExpression(exp));
    },
    transformExportDeclaration: function(tree) {
      if (!tree.declaration.specifierSet) {
        this.exportVisitor_.visitAny(tree);
        return this.transformAny(tree.declaration);
      }
      if (tree.declaration.specifierSet.type != EXPORT_STAR) {
        tree.declaration = this.transformAny(tree.declaration);
        tree.annotations = this.transformList(tree.annotations);
      }
      this.exportVisitor_.visitAny(tree);
      return new EmptyStatement(null);
    },
    transformNamedExport: function(tree) {
      var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
      var specifierSet = this.transformAny(tree.specifierSet);
      if (moduleSpecifier === tree.moduleSpecifier && specifierSet === tree.specifierSet) {
        return tree;
      }
      return new NamedExport(tree.location, moduleSpecifier, specifierSet);
    },
    transformImportDeclaration: function(tree) {
      this.moduleSpecifierKind_ = 'import';
      this.curDepIndex_ = this.getOrCreateDependencyIndex(tree.moduleSpecifier);
      this.transformAny(tree.importClause);
      return new EmptyStatement(tree.location);
    },
    transformImportedBinding: function(tree) {
      this.addModuleBinding({
        variableName: tree.binding.identifierToken.value,
        depIndex: this.curDepIndex_,
        importName: 'default'
      });
      return tree;
    },
    transformImportSpecifier: function(tree) {
      var importName;
      var localName;
      if (tree.rhs) {
        localName = tree.rhs.value;
        importName = tree.lhs.value;
      } else {
        localName = importName = tree.lhs.value;
      }
      this.addModuleBinding({
        variableName: localName,
        depIndex: this.curDepIndex_,
        importName: importName
      });
    }
  }, {}, ModuleTransformer);
  return {get InstantiateModuleTransformer() {
      return InstantiateModuleTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/MultiTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/MultiTransformer";
  var ParseTreeValidator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeValidator")).ParseTreeValidator;
  var MultiTransformer = function MultiTransformer(reporter, validate) {
    this.reporter_ = reporter;
    this.validate_ = validate;
    this.treeTransformers_ = [];
  };
  ($traceurRuntime.createClass)(MultiTransformer, {
    append: function(treeTransformer) {
      this.treeTransformers_.push(treeTransformer);
    },
    transform: function(tree) {
      var reporter = this.reporter_;
      var validate = this.validate_;
      this.treeTransformers_.every((function(transformTree) {
        tree = transformTree(tree);
        if (reporter.hadError())
          return false;
        if (validate)
          ParseTreeValidator.validate(tree);
        return true;
      }));
      return tree;
    }
  }, {});
  return {get MultiTransformer() {
      return MultiTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/NumericLiteralTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/NumericLiteralTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__300 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      LiteralExpression = $__300.LiteralExpression,
      LiteralPropertyName = $__300.LiteralPropertyName;
  var LiteralToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LiteralToken")).LiteralToken;
  var NUMBER = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).NUMBER;
  function needsTransform(token) {
    return token.type === NUMBER && /^0[bBoO]/.test(token.value);
  }
  function transformToken(token) {
    return new LiteralToken(NUMBER, String(token.processedValue), token.location);
  }
  var NumericLiteralTransformer = function NumericLiteralTransformer() {
    $traceurRuntime.defaultSuperCall(this, $NumericLiteralTransformer.prototype, arguments);
  };
  var $NumericLiteralTransformer = NumericLiteralTransformer;
  ($traceurRuntime.createClass)(NumericLiteralTransformer, {
    transformLiteralExpression: function(tree) {
      var token = tree.literalToken;
      if (needsTransform(token))
        return new LiteralExpression(tree.location, transformToken(token));
      return tree;
    },
    transformLiteralPropertyName: function(tree) {
      var token = tree.literalToken;
      if (needsTransform(token))
        return new LiteralPropertyName(tree.location, transformToken(token));
      return tree;
    }
  }, {}, ParseTreeTransformer);
  return {get NumericLiteralTransformer() {
      return NumericLiteralTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/ObjectLiteralTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/ObjectLiteralTransformer";
  var FindVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FindVisitor")).FindVisitor;
  var $__302 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      FormalParameterList = $__302.FormalParameterList,
      FunctionExpression = $__302.FunctionExpression,
      IdentifierExpression = $__302.IdentifierExpression,
      LiteralExpression = $__302.LiteralExpression;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__302 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      IDENTIFIER = $__302.IDENTIFIER,
      STRING = $__302.STRING;
  var $__302 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      COMPUTED_PROPERTY_NAME = $__302.COMPUTED_PROPERTY_NAME,
      LITERAL_PROPERTY_NAME = $__302.LITERAL_PROPERTY_NAME;
  var $__302 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createAssignmentExpression = $__302.createAssignmentExpression,
      createCommaExpression = $__302.createCommaExpression,
      createDefineProperty = $__302.createDefineProperty,
      createEmptyParameterList = $__302.createEmptyParameterList,
      createFunctionExpression = $__302.createFunctionExpression,
      createIdentifierExpression = $__302.createIdentifierExpression,
      createObjectCreate = $__302.createObjectCreate,
      createObjectLiteralExpression = $__302.createObjectLiteralExpression,
      createParenExpression = $__302.createParenExpression,
      createPropertyNameAssignment = $__302.createPropertyNameAssignment,
      createStringLiteral = $__302.createStringLiteral;
  var propName = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/staticsemantics/PropName")).propName;
  var transformOptions = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).transformOptions;
  var FindAdvancedProperty = function FindAdvancedProperty(tree) {
    this.protoExpression = null;
    $traceurRuntime.superCall(this, $FindAdvancedProperty.prototype, "constructor", [tree, true]);
  };
  var $FindAdvancedProperty = FindAdvancedProperty;
  ($traceurRuntime.createClass)(FindAdvancedProperty, {
    visitPropertyNameAssignment: function(tree) {
      if (isProtoName(tree.name))
        this.protoExpression = tree.value;
      else
        $traceurRuntime.superCall(this, $FindAdvancedProperty.prototype, "visitPropertyNameAssignment", [tree]);
    },
    visitComputedPropertyName: function(tree) {
      if (transformOptions.computedPropertyNames)
        this.found = true;
    }
  }, {}, FindVisitor);
  function isProtoName(tree) {
    return propName(tree) === '__proto__';
  }
  var ObjectLiteralTransformer = function ObjectLiteralTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "constructor", [identifierGenerator]);
    this.protoExpression = null;
    this.needsAdvancedTransform = false;
    this.seenAccessors = null;
  };
  var $ObjectLiteralTransformer = ObjectLiteralTransformer;
  ($traceurRuntime.createClass)(ObjectLiteralTransformer, {
    findSeenAccessor_: function(name) {
      if (name.type === COMPUTED_PROPERTY_NAME)
        return null;
      var s = propName(name);
      return this.seenAccessors[s];
    },
    removeSeenAccessor_: function(name) {
      if (name.type === COMPUTED_PROPERTY_NAME)
        return;
      var s = propName(name);
      delete this.seenAccessors[s];
    },
    addSeenAccessor_: function(name, descr) {
      if (name.type === COMPUTED_PROPERTY_NAME)
        return;
      var s = propName(name);
      this.seenAccessors[s] = descr;
    },
    createProperty_: function(name, descr) {
      var expression;
      if (name.type === LITERAL_PROPERTY_NAME) {
        if (this.needsAdvancedTransform)
          expression = this.getPropertyName_(name);
        else
          expression = name;
      } else {
        expression = name.expression;
      }
      if (descr.get || descr.set) {
        var oldAccessor = this.findSeenAccessor_(name);
        if (oldAccessor) {
          oldAccessor.get = descr.get || oldAccessor.get;
          oldAccessor.set = descr.set || oldAccessor.set;
          this.removeSeenAccessor_(name);
          return null;
        } else {
          this.addSeenAccessor_(name, descr);
        }
      }
      return [expression, descr];
    },
    getPropertyName_: function(nameTree) {
      var token = nameTree.literalToken;
      switch (token.type) {
        case IDENTIFIER:
          return createStringLiteral(token.value);
        default:
          if (token.isKeyword())
            return createStringLiteral(token.type);
          return new LiteralExpression(token.location, token);
      }
    },
    transformClassDeclaration: function(tree) {
      return tree;
    },
    transformClassExpression: function(tree) {
      return tree;
    },
    transformObjectLiteralExpression: function(tree) {
      var oldNeedsTransform = this.needsAdvancedTransform;
      var oldSeenAccessors = this.seenAccessors;
      try {
        var finder = new FindAdvancedProperty(tree);
        if (!finder.found) {
          this.needsAdvancedTransform = false;
          return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformObjectLiteralExpression", [tree]);
        }
        this.needsAdvancedTransform = true;
        this.seenAccessors = Object.create(null);
        var properties = this.transformList(tree.propertyNameAndValues);
        properties = properties.filter((function(tree) {
          return tree;
        }));
        var tempVar = this.addTempVar();
        var tempVarIdentifierExpression = createIdentifierExpression(tempVar);
        var expressions = properties.map((function(property) {
          var expression = property[0];
          var descr = property[1];
          return createDefineProperty(tempVarIdentifierExpression, expression, descr);
        }));
        var protoExpression = this.transformAny(finder.protoExpression);
        var objectExpression;
        if (protoExpression)
          objectExpression = createObjectCreate(protoExpression);
        else
          objectExpression = createObjectLiteralExpression([]);
        expressions.unshift(createAssignmentExpression(tempVarIdentifierExpression, objectExpression));
        expressions.push(tempVarIdentifierExpression);
        return createParenExpression(createCommaExpression(expressions));
      } finally {
        this.needsAdvancedTransform = oldNeedsTransform;
        this.seenAccessors = oldSeenAccessors;
      }
    },
    transformPropertyNameAssignment: function(tree) {
      if (!this.needsAdvancedTransform)
        return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformPropertyNameAssignment", [tree]);
      if (isProtoName(tree.name))
        return null;
      return this.createProperty_(tree.name, {
        value: this.transformAny(tree.value),
        configurable: true,
        enumerable: true,
        writable: true
      });
    },
    transformGetAccessor: function(tree) {
      if (!this.needsAdvancedTransform)
        return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformGetAccessor", [tree]);
      var body = this.transformAny(tree.body);
      var func = createFunctionExpression(createEmptyParameterList(), body);
      return this.createProperty_(tree.name, {
        get: func,
        configurable: true,
        enumerable: true
      });
    },
    transformSetAccessor: function(tree) {
      if (!this.needsAdvancedTransform)
        return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformSetAccessor", [tree]);
      var body = this.transformAny(tree.body);
      var parameterList = this.transformAny(tree.parameterList);
      var func = createFunctionExpression(parameterList, body);
      return this.createProperty_(tree.name, {
        set: func,
        configurable: true,
        enumerable: true
      });
    },
    transformPropertyMethodAssignment: function(tree) {
      var func = new FunctionExpression(tree.location, null, tree.functionKind, this.transformAny(tree.parameterList), tree.typeAnnotation, [], this.transformAny(tree.functionBody));
      if (!this.needsAdvancedTransform) {
        return createPropertyNameAssignment(tree.name, func);
      }
      var expression = this.transformAny(tree.name);
      return this.createProperty_(tree.name, {
        value: func,
        configurable: true,
        enumerable: true,
        writable: true
      });
    },
    transformPropertyNameShorthand: function(tree) {
      if (!this.needsAdvancedTransform)
        return $traceurRuntime.superCall(this, $ObjectLiteralTransformer.prototype, "transformPropertyNameShorthand", [tree]);
      var expression = this.transformAny(tree.name);
      return this.createProperty_(tree.name, {
        value: new IdentifierExpression(tree.location, tree.name.identifierToken),
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }, {}, TempVarTransformer);
  return {get ObjectLiteralTransformer() {
      return ObjectLiteralTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/PropertyNameShorthandTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/PropertyNameShorthandTransformer";
  var $__304 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      IdentifierExpression = $__304.IdentifierExpression,
      LiteralPropertyName = $__304.LiteralPropertyName,
      PropertyNameAssignment = $__304.PropertyNameAssignment;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var PropertyNameShorthandTransformer = function PropertyNameShorthandTransformer() {
    $traceurRuntime.defaultSuperCall(this, $PropertyNameShorthandTransformer.prototype, arguments);
  };
  var $PropertyNameShorthandTransformer = PropertyNameShorthandTransformer;
  ($traceurRuntime.createClass)(PropertyNameShorthandTransformer, {transformPropertyNameShorthand: function(tree) {
      return new PropertyNameAssignment(tree.location, new LiteralPropertyName(tree.location, tree.name), new IdentifierExpression(tree.location, tree.name));
    }}, {}, ParseTreeTransformer);
  return {get PropertyNameShorthandTransformer() {
      return PropertyNameShorthandTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/RestParameterTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/RestParameterTransformer";
  var $__305 = Object.freeze(Object.defineProperties(["\n            for (var ", " = [], ", " = ", ";\n                 ", " < arguments.length; ", "++)\n              ", "[", " - ", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n            for (var ", " = [], ", " = ", ";\n                 ", " < arguments.length; ", "++)\n              ", "[", " - ", "] = arguments[", "];"])}})),
      $__306 = Object.freeze(Object.defineProperties(["\n            for (var ", " = [], ", " = 0;\n                 ", " < arguments.length; ", "++)\n              ", "[", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n            for (var ", " = [], ", " = 0;\n                 ", " < arguments.length; ", "++)\n              ", "[", "] = arguments[", "];"])}}));
  var FormalParameterList = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).FormalParameterList;
  var ParameterTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParameterTransformer")).ParameterTransformer;
  var createIdentifierToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createIdentifierToken;
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  function hasRestParameter(parameterList) {
    var parameters = parameterList.parameters;
    return parameters.length > 0 && parameters[parameters.length - 1].isRestParameter();
  }
  function getRestParameterLiteralToken(parameterList) {
    var parameters = parameterList.parameters;
    return parameters[parameters.length - 1].parameter.identifier.identifierToken;
  }
  var RestParameterTransformer = function RestParameterTransformer() {
    $traceurRuntime.defaultSuperCall(this, $RestParameterTransformer.prototype, arguments);
  };
  var $RestParameterTransformer = RestParameterTransformer;
  ($traceurRuntime.createClass)(RestParameterTransformer, {transformFormalParameterList: function(tree) {
      var transformed = $traceurRuntime.superCall(this, $RestParameterTransformer.prototype, "transformFormalParameterList", [tree]);
      if (hasRestParameter(transformed)) {
        var parametersWithoutRestParam = new FormalParameterList(transformed.location, transformed.parameters.slice(0, -1));
        var startIndex = transformed.parameters.length - 1;
        var i = createIdentifierToken(this.getTempIdentifier());
        var name = getRestParameterLiteralToken(transformed);
        var loop;
        if (startIndex) {
          loop = parseStatement($__305, name, i, startIndex, i, i, name, i, startIndex, i);
        } else {
          loop = parseStatement($__306, name, i, i, i, name, i, i);
        }
        this.parameterStatements.push(loop);
        return parametersWithoutRestParam;
      }
      return transformed;
    }}, {}, ParameterTransformer);
  return {get RestParameterTransformer() {
      return RestParameterTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/SpreadTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/SpreadTransformer";
  var $__309 = Object.freeze(Object.defineProperties(["$traceurRuntime.toObject(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.toObject(", ")"])}})),
      $__310 = Object.freeze(Object.defineProperties(["$traceurRuntime.spread(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.spread(", ")"])}}));
  var $__312 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      APPLY = $__312.APPLY,
      BIND = $__312.BIND,
      FUNCTION = $__312.FUNCTION,
      PROTOTYPE = $__312.PROTOTYPE;
  var $__312 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      MEMBER_EXPRESSION = $__312.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__312.MEMBER_LOOKUP_EXPRESSION,
      SPREAD_EXPRESSION = $__312.SPREAD_EXPRESSION;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__312 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArgumentList = $__312.createArgumentList,
      createArrayLiteralExpression = $__312.createArrayLiteralExpression,
      createAssignmentExpression = $__312.createAssignmentExpression,
      createCallExpression = $__312.createCallExpression,
      createEmptyArgumentList = $__312.createEmptyArgumentList,
      createIdentifierExpression = $__312.createIdentifierExpression,
      createMemberExpression = $__312.createMemberExpression,
      createMemberLookupExpression = $__312.createMemberLookupExpression,
      createNewExpression = $__312.createNewExpression,
      createNullLiteral = $__312.createNullLiteral,
      createParenExpression = $__312.createParenExpression;
  var parseExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseExpression;
  function hasSpreadMember(trees) {
    return trees.some((function(tree) {
      return tree && tree.type == SPREAD_EXPRESSION;
    }));
  }
  var SpreadTransformer = function SpreadTransformer() {
    $traceurRuntime.defaultSuperCall(this, $SpreadTransformer.prototype, arguments);
  };
  var $SpreadTransformer = SpreadTransformer;
  ($traceurRuntime.createClass)(SpreadTransformer, {
    createArrayFromElements_: function(elements, needsNewArray) {
      var length = elements.length;
      if (length === 1 && !needsNewArray) {
        var args = createArgumentList(this.transformAny(elements[0].expression));
        return parseExpression($__309, args);
      }
      var args = [];
      var lastArray;
      for (var i = 0; i < length; i++) {
        if (elements[i] && elements[i].type === SPREAD_EXPRESSION) {
          if (lastArray) {
            args.push(createArrayLiteralExpression(lastArray));
            lastArray = null;
          }
          args.push(this.transformAny(elements[i].expression));
        } else {
          if (!lastArray)
            lastArray = [];
          lastArray.push(this.transformAny(elements[i]));
        }
      }
      if (lastArray)
        args.push(createArrayLiteralExpression(lastArray));
      return parseExpression($__310, createArgumentList(args));
    },
    desugarCallSpread_: function(tree) {
      var operand = this.transformAny(tree.operand);
      var functionObject,
          contextObject;
      this.pushTempVarState();
      if (operand.type == MEMBER_EXPRESSION) {
        var tempIdent = createIdentifierExpression(this.addTempVar());
        var parenExpression = createParenExpression(createAssignmentExpression(tempIdent, operand.operand));
        var memberName = operand.memberName;
        contextObject = tempIdent;
        functionObject = createMemberExpression(parenExpression, memberName);
      } else if (tree.operand.type == MEMBER_LOOKUP_EXPRESSION) {
        var tempIdent = createIdentifierExpression(this.addTempVar());
        var parenExpression = createParenExpression(createAssignmentExpression(tempIdent, operand.operand));
        var memberExpression = this.transformAny(operand.memberExpression);
        contextObject = tempIdent;
        functionObject = createMemberLookupExpression(parenExpression, memberExpression);
      } else {
        contextObject = createNullLiteral();
        functionObject = operand;
      }
      this.popTempVarState();
      var arrayExpression = this.createArrayFromElements_(tree.args.args, false);
      return createCallExpression(createMemberExpression(functionObject, APPLY), createArgumentList(contextObject, arrayExpression));
    },
    desugarNewSpread_: function(tree) {
      var arrayExpression = $traceurRuntime.spread([createNullLiteral()], tree.args.args);
      arrayExpression = this.createArrayFromElements_(arrayExpression, false);
      return createNewExpression(createParenExpression(createCallExpression(createMemberExpression(FUNCTION, PROTOTYPE, BIND, APPLY), createArgumentList(this.transformAny(tree.operand), arrayExpression))), createEmptyArgumentList());
    },
    transformArrayLiteralExpression: function(tree) {
      if (hasSpreadMember(tree.elements)) {
        return this.createArrayFromElements_(tree.elements, true);
      }
      return $traceurRuntime.superCall(this, $SpreadTransformer.prototype, "transformArrayLiteralExpression", [tree]);
    },
    transformCallExpression: function(tree) {
      if (hasSpreadMember(tree.args.args)) {
        return this.desugarCallSpread_(tree);
      }
      return $traceurRuntime.superCall(this, $SpreadTransformer.prototype, "transformCallExpression", [tree]);
    },
    transformNewExpression: function(tree) {
      if (tree.args != null && hasSpreadMember(tree.args.args)) {
        return this.desugarNewSpread_(tree);
      }
      return $traceurRuntime.superCall(this, $SpreadTransformer.prototype, "transformNewExpression", [tree]);
    }
  }, {}, TempVarTransformer);
  return {get SpreadTransformer() {
      return SpreadTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/SymbolTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/SymbolTransformer";
  var $__313 = Object.freeze(Object.defineProperties(["$traceurRuntime.toProperty(", ") in ", ""], {raw: {value: Object.freeze(["$traceurRuntime.toProperty(", ") in ", ""])}})),
      $__314 = Object.freeze(Object.defineProperties(["$traceurRuntime.setProperty(", ",\n          ", ", ", ")"], {raw: {value: Object.freeze(["$traceurRuntime.setProperty(", ",\n          ", ", ", ")"])}})),
      $__315 = Object.freeze(Object.defineProperties(["", "[$traceurRuntime.toProperty(", ")]"], {raw: {value: Object.freeze(["", "[$traceurRuntime.toProperty(", ")]"])}})),
      $__316 = Object.freeze(Object.defineProperties(["$traceurRuntime.typeof(", ")"], {raw: {value: Object.freeze(["$traceurRuntime.typeof(", ")"])}})),
      $__317 = Object.freeze(Object.defineProperties(["(typeof ", " === 'undefined' ?\n          'undefined' : ", ")"], {raw: {value: Object.freeze(["(typeof ", " === 'undefined' ?\n          'undefined' : ", ")"])}}));
  var $__319 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BinaryOperator = $__319.BinaryOperator,
      MemberLookupExpression = $__319.MemberLookupExpression,
      UnaryExpression = $__319.UnaryExpression;
  var ExplodeExpressionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ExplodeExpressionTransformer")).ExplodeExpressionTransformer;
  var $__319 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      IDENTIFIER_EXPRESSION = $__319.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__319.LITERAL_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__319.MEMBER_LOOKUP_EXPRESSION,
      UNARY_EXPRESSION = $__319.UNARY_EXPRESSION;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__319 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      EQUAL = $__319.EQUAL,
      EQUAL_EQUAL = $__319.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__319.EQUAL_EQUAL_EQUAL,
      IN = $__319.IN,
      NOT_EQUAL = $__319.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__319.NOT_EQUAL_EQUAL,
      STRING = $__319.STRING,
      TYPEOF = $__319.TYPEOF;
  var createParenExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")).createParenExpression;
  var parseExpression = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseExpression;
  var ExplodeSymbolExpression = function ExplodeSymbolExpression() {
    $traceurRuntime.defaultSuperCall(this, $ExplodeSymbolExpression.prototype, arguments);
  };
  var $ExplodeSymbolExpression = ExplodeSymbolExpression;
  ($traceurRuntime.createClass)(ExplodeSymbolExpression, {
    transformArrowFunctionExpression: function(tree) {
      return tree;
    },
    transformClassExpression: function(tree) {
      return tree;
    },
    transformFunctionBody: function(tree) {
      return tree;
    }
  }, {}, ExplodeExpressionTransformer);
  function isEqualityExpression(tree) {
    switch (tree.operator.type) {
      case EQUAL_EQUAL:
      case EQUAL_EQUAL_EQUAL:
      case NOT_EQUAL:
      case NOT_EQUAL_EQUAL:
        return true;
    }
    return false;
  }
  function isTypeof(tree) {
    return tree.type === UNARY_EXPRESSION && tree.operator.type === TYPEOF;
  }
  function isSafeTypeofString(tree) {
    if (tree.type !== LITERAL_EXPRESSION)
      return false;
    var value = tree.literalToken.processedValue;
    switch (value) {
      case 'symbol':
      case 'object':
        return false;
    }
    return true;
  }
  var SymbolTransformer = function SymbolTransformer() {
    $traceurRuntime.defaultSuperCall(this, $SymbolTransformer.prototype, arguments);
  };
  var $SymbolTransformer = SymbolTransformer;
  ($traceurRuntime.createClass)(SymbolTransformer, {
    transformTypeofOperand_: function(tree) {
      var operand = this.transformAny(tree.operand);
      return new UnaryExpression(tree.location, tree.operator, operand);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.type === IN) {
        var name = this.transformAny(tree.left);
        var object = this.transformAny(tree.right);
        if (name.type === LITERAL_EXPRESSION)
          return new BinaryOperator(tree.location, name, tree.operator, object);
        return parseExpression($__313, name, object);
      }
      if (isEqualityExpression(tree)) {
        if (isTypeof(tree.left) && isSafeTypeofString(tree.right)) {
          var left = this.transformTypeofOperand_(tree.left);
          var right = tree.right;
          return new BinaryOperator(tree.location, left, tree.operator, right);
        }
        if (isTypeof(tree.right) && isSafeTypeofString(tree.left)) {
          var left = tree.left;
          var right = this.transformTypeofOperand_(tree.right);
          return new BinaryOperator(tree.location, left, tree.operator, right);
        }
      }
      if (tree.left.type === MEMBER_LOOKUP_EXPRESSION && tree.operator.isAssignmentOperator()) {
        if (tree.operator.type !== EQUAL) {
          var exploded = new ExplodeSymbolExpression(this).transformAny(tree);
          return this.transformAny(createParenExpression(exploded));
        }
        var operand = this.transformAny(tree.left.operand);
        var memberExpression = this.transformAny(tree.left.memberExpression);
        var value = this.transformAny(tree.right);
        return parseExpression($__314, operand, memberExpression, value);
      }
      return $traceurRuntime.superCall(this, $SymbolTransformer.prototype, "transformBinaryOperator", [tree]);
    },
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (memberExpression.type === LITERAL_EXPRESSION && memberExpression.literalToken.type !== STRING) {
        return new MemberLookupExpression(tree.location, operand, memberExpression);
      }
      return parseExpression($__315, operand, memberExpression);
    },
    transformUnaryExpression: function(tree) {
      if (tree.operator.type !== TYPEOF)
        return $traceurRuntime.superCall(this, $SymbolTransformer.prototype, "transformUnaryExpression", [tree]);
      var operand = this.transformAny(tree.operand);
      var expression = parseExpression($__316, operand);
      if (operand.type === IDENTIFIER_EXPRESSION) {
        return parseExpression($__317, operand, expression);
      }
      return expression;
    }
  }, {}, TempVarTransformer);
  return {get SymbolTransformer() {
      return SymbolTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/TemplateLiteralTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/TemplateLiteralTransformer";
  var $__321 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINARY_OPERATOR = $__321.BINARY_OPERATOR,
      COMMA_EXPRESSION = $__321.COMMA_EXPRESSION,
      CONDITIONAL_EXPRESSION = $__321.CONDITIONAL_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__321.TEMPLATE_LITERAL_PORTION;
  var $__321 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      LiteralExpression = $__321.LiteralExpression,
      ParenExpression = $__321.ParenExpression;
  var LiteralToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LiteralToken")).LiteralToken;
  var $__321 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/PredefinedName")),
      DEFINE_PROPERTIES = $__321.DEFINE_PROPERTIES,
      OBJECT = $__321.OBJECT,
      RAW = $__321.RAW;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var TempVarTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TempVarTransformer")).TempVarTransformer;
  var $__321 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")),
      PERCENT = $__321.PERCENT,
      PLUS = $__321.PLUS,
      SLASH = $__321.SLASH,
      STAR = $__321.STAR,
      STRING = $__321.STRING;
  var $__321 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArgumentList = $__321.createArgumentList,
      createArrayLiteralExpression = $__321.createArrayLiteralExpression,
      createBinaryOperator = $__321.createBinaryOperator,
      createCallExpression = $__321.createCallExpression,
      createIdentifierExpression = $__321.createIdentifierExpression,
      createMemberExpression = $__321.createMemberExpression,
      createObjectFreeze = $__321.createObjectFreeze,
      createObjectLiteralExpression = $__321.createObjectLiteralExpression,
      createOperatorToken = $__321.createOperatorToken,
      createPropertyDescriptor = $__321.createPropertyDescriptor,
      createPropertyNameAssignment = $__321.createPropertyNameAssignment,
      createStringLiteral = $__321.createStringLiteral;
  function createCallSiteIdObject(tree) {
    var elements = tree.elements;
    return createObjectFreeze(createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTIES), createArgumentList(createCookedStringArray(elements), createObjectLiteralExpression(createPropertyNameAssignment(RAW, createPropertyDescriptor({value: createObjectFreeze(createRawStringArray(elements))}))))));
  }
  function maybeAddEmptyStringAtEnd(elements, items) {
    var length = elements.length;
    if (!length || elements[length - 1].type !== TEMPLATE_LITERAL_PORTION)
      items.push(createStringLiteral(''));
  }
  function createRawStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      var str = replaceRaw(JSON.stringify(elements[i].value.value));
      var loc = elements[i].location;
      var expr = new LiteralExpression(loc, new LiteralToken(STRING, str, loc));
      items.push(expr);
    }
    maybeAddEmptyStringAtEnd(elements, items);
    return createArrayLiteralExpression(items);
  }
  function createCookedStringLiteralExpression(tree) {
    var str = cookString(tree.value.value);
    var loc = tree.location;
    return new LiteralExpression(loc, new LiteralToken(STRING, str, loc));
  }
  function createCookedStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      items.push(createCookedStringLiteralExpression(elements[i]));
    }
    maybeAddEmptyStringAtEnd(elements, items);
    return createArrayLiteralExpression(items);
  }
  function replaceRaw(s) {
    return s.replace(/\u2028|\u2029/g, function(c) {
      switch (c) {
        case '\u2028':
          return '\\u2028';
        case '\u2029':
          return '\\u2029';
        default:
          throw Error('Not reachable');
      }
    });
  }
  function cookString(s) {
    var sb = ['"'];
    var i = 0,
        k = 1,
        c,
        c2;
    while (i < s.length) {
      c = s[i++];
      switch (c) {
        case '\\':
          c2 = s[i++];
          switch (c2) {
            case '\n':
            case '\u2028':
            case '\u2029':
              break;
            case '\r':
              if (s[i + 1] === '\n') {
                i++;
              }
              break;
            default:
              sb[k++] = c;
              sb[k++] = c2;
          }
          break;
        case '"':
          sb[k++] = '\\"';
          break;
        case '\n':
          sb[k++] = '\\n';
          break;
        case '\r':
          sb[k++] = '\\r';
          break;
        case '\t':
          sb[k++] = '\\t';
          break;
        case '\f':
          sb[k++] = '\\f';
          break;
        case '\b':
          sb[k++] = '\\b';
          break;
        case '\u2028':
          sb[k++] = '\\u2028';
          break;
        case '\u2029':
          sb[k++] = '\\u2029';
          break;
        default:
          sb[k++] = c;
      }
    }
    sb[k++] = '"';
    return sb.join('');
  }
  var TemplateLiteralTransformer = function TemplateLiteralTransformer() {
    $traceurRuntime.defaultSuperCall(this, $TemplateLiteralTransformer.prototype, arguments);
  };
  var $TemplateLiteralTransformer = TemplateLiteralTransformer;
  ($traceurRuntime.createClass)(TemplateLiteralTransformer, {
    transformFunctionBody: function(tree) {
      return ParseTreeTransformer.prototype.transformFunctionBody.call(this, tree);
    },
    transformTemplateLiteralExpression: function(tree) {
      if (!tree.operand)
        return this.createDefaultTemplateLiteral(tree);
      var operand = this.transformAny(tree.operand);
      var elements = tree.elements;
      var callsiteIdObject = createCallSiteIdObject(tree);
      var idName = this.addTempVar(callsiteIdObject);
      var args = [createIdentifierExpression(idName)];
      for (var i = 1; i < elements.length; i += 2) {
        args.push(this.transformAny(elements[i]));
      }
      return createCallExpression(operand, createArgumentList(args));
    },
    transformTemplateSubstitution: function(tree) {
      var transformedTree = this.transformAny(tree.expression);
      switch (transformedTree.type) {
        case BINARY_OPERATOR:
          switch (transformedTree.operator.type) {
            case STAR:
            case PERCENT:
            case SLASH:
              return transformedTree;
          }
        case COMMA_EXPRESSION:
        case CONDITIONAL_EXPRESSION:
          return new ParenExpression(null, transformedTree);
      }
      return transformedTree;
    },
    transformTemplateLiteralPortion: function(tree) {
      return createCookedStringLiteralExpression(tree);
    },
    createDefaultTemplateLiteral: function(tree) {
      var length = tree.elements.length;
      if (length === 0) {
        var loc = tree.location;
        return new LiteralExpression(loc, new LiteralToken(STRING, '""', loc));
      }
      var firstNonEmpty = tree.elements[0].value.value === '' ? -1 : 0;
      var binaryExpression = this.transformAny(tree.elements[0]);
      if (length == 1)
        return binaryExpression;
      var plusToken = createOperatorToken(PLUS);
      for (var i = 1; i < length; i++) {
        var element = tree.elements[i];
        if (element.type === TEMPLATE_LITERAL_PORTION) {
          if (element.value.value === '')
            continue;
          else if (firstNonEmpty < 0 && i === 2)
            binaryExpression = binaryExpression.right;
        }
        var transformedTree = this.transformAny(tree.elements[i]);
        binaryExpression = createBinaryOperator(binaryExpression, plusToken, transformedTree);
      }
      return new ParenExpression(null, binaryExpression);
    }
  }, {}, TempVarTransformer);
  return {get TemplateLiteralTransformer() {
      return TemplateLiteralTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/TypeAssertionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/TypeAssertionTransformer";
  var $__322 = Object.freeze(Object.defineProperties(["assert.type(", ", ", ")"], {raw: {value: Object.freeze(["assert.type(", ", ", ")"])}})),
      $__323 = Object.freeze(Object.defineProperties(["assert.argumentTypes(", ")"], {raw: {value: Object.freeze(["assert.argumentTypes(", ")"])}})),
      $__324 = Object.freeze(Object.defineProperties(["return assert.returnType((", "), ", ")"], {raw: {value: Object.freeze(["return assert.returnType((", "), ", ")"])}})),
      $__325 = Object.freeze(Object.defineProperties(["$traceurRuntime.type.any"], {raw: {value: Object.freeze(["$traceurRuntime.type.any"])}}));
  var $__327 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTreeType")),
      BINDING_ELEMENT = $__327.BINDING_ELEMENT,
      REST_PARAMETER = $__327.REST_PARAMETER;
  var $__327 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      ImportDeclaration = $__327.ImportDeclaration,
      ImportSpecifier = $__327.ImportSpecifier,
      ImportSpecifierSet = $__327.ImportSpecifierSet,
      Module = $__327.Module,
      ModuleSpecifier = $__327.ModuleSpecifier,
      ReturnStatement = $__327.ReturnStatement,
      Script = $__327.Script,
      VariableDeclaration = $__327.VariableDeclaration;
  var $__327 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createArgumentList = $__327.createArgumentList,
      createExpressionStatement = $__327.createExpressionStatement,
      createIdentifierExpression = $__327.createIdentifierExpression,
      createIdentifierToken = $__327.createIdentifierToken,
      createStringLiteralToken = $__327.createStringLiteralToken;
  var $__327 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")),
      parseExpression = $__327.parseExpression,
      parseStatement = $__327.parseStatement;
  var ParameterTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParameterTransformer")).ParameterTransformer;
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  var TypeAssertionTransformer = function TypeAssertionTransformer(identifierGenerator) {
    $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "constructor", [identifierGenerator]);
    this.returnTypeStack_ = [];
    this.parametersStack_ = [];
    this.assertionAdded_ = false;
  };
  var $TypeAssertionTransformer = TypeAssertionTransformer;
  ($traceurRuntime.createClass)(TypeAssertionTransformer, {
    transformScript: function(tree) {
      return this.prependAssertionImport_($traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformScript", [tree]), Script);
    },
    transformModule: function(tree) {
      return this.prependAssertionImport_($traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformModule", [tree]), Module);
    },
    transformVariableDeclaration: function(tree) {
      if (tree.typeAnnotation && tree.initializer) {
        var assert = parseExpression($__322, tree.initializer, tree.typeAnnotation);
        tree = new VariableDeclaration(tree.location, tree.lvalue, tree.typeAnnotation, assert);
        this.assertionAdded_ = true;
      }
      return $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformVariableDeclaration", [tree]);
    },
    transformFormalParameterList: function(tree) {
      this.parametersStack_.push({
        atLeastOneParameterTyped: false,
        arguments: []
      });
      var transformed = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformFormalParameterList", [tree]);
      var params = this.parametersStack_.pop();
      if (params.atLeastOneParameterTyped) {
        var argumentList = createArgumentList(params.arguments);
        var assertStatement = parseStatement($__323, argumentList);
        this.parameterStatements.push(assertStatement);
        this.assertionAdded_ = true;
      }
      return transformed;
    },
    transformFormalParameter: function(tree) {
      var transformed = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformFormalParameter", [tree]);
      switch (transformed.parameter.type) {
        case BINDING_ELEMENT:
          this.transformBindingElementParameter_(transformed.parameter, transformed.typeAnnotation);
          break;
        case REST_PARAMETER:
          break;
      }
      return transformed;
    },
    transformGetAccessor: function(tree) {
      this.pushReturnType_(tree.typeAnnotation);
      tree = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformGetAccessor", [tree]);
      this.popReturnType_();
      return tree;
    },
    transformPropertyMethodAssignment: function(tree) {
      this.pushReturnType_(tree.typeAnnotation);
      tree = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
      this.popReturnType_();
      return tree;
    },
    transformFunctionDeclaration: function(tree) {
      this.pushReturnType_(tree.typeAnnotation);
      tree = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformFunctionDeclaration", [tree]);
      this.popReturnType_();
      return tree;
    },
    transformFunctionExpression: function(tree) {
      this.pushReturnType_(tree.typeAnnotation);
      tree = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformFunctionExpression", [tree]);
      this.popReturnType_();
      return tree;
    },
    transformReturnStatement: function(tree) {
      tree = $traceurRuntime.superCall(this, $TypeAssertionTransformer.prototype, "transformReturnStatement", [tree]);
      if (this.returnType_ && tree.expression) {
        this.assertionAdded_ = true;
        return parseStatement($__324, tree.expression, this.returnType_);
      }
      return tree;
    },
    transformBindingElementParameter_: function(element, typeAnnotation) {
      if (!element.binding.isPattern()) {
        if (typeAnnotation) {
          this.paramTypes_.atLeastOneParameterTyped = true;
        } else {
          typeAnnotation = parseExpression($__325);
        }
        this.paramTypes_.arguments.push(createIdentifierExpression(element.binding.identifierToken), typeAnnotation);
        return;
      }
    },
    pushReturnType_: function(typeAnnotation) {
      this.returnTypeStack_.push(this.transformAny(typeAnnotation));
    },
    prependAssertionImport_: function(tree, Ctor) {
      if (!this.assertionAdded_ || options.typeAssertionModule === null)
        return tree;
      var importStatement = new ImportDeclaration(null, new ImportSpecifierSet(null, [new ImportSpecifier(null, createIdentifierToken('assert'), null)]), new ModuleSpecifier(null, createStringLiteralToken(options.typeAssertionModule)));
      tree = new Ctor(tree.location, $traceurRuntime.spread([importStatement], tree.scriptItemList), tree.moduleName);
      return tree;
    },
    popReturnType_: function() {
      return this.returnTypeStack_.pop();
    },
    get returnType_() {
      return this.returnTypeStack_.length > 0 ? this.returnTypeStack_[this.returnTypeStack_.length - 1] : null;
    },
    get paramTypes_() {
      return this.parametersStack_[this.parametersStack_.length - 1];
    }
  }, {}, ParameterTransformer);
  return {get TypeAssertionTransformer() {
      return TypeAssertionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/TypeToExpressionTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/TypeToExpressionTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__329 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeFactory")),
      createIdentifierExpression = $__329.createIdentifierExpression,
      createMemberExpression = $__329.createMemberExpression;
  var TypeToExpressionTransformer = function TypeToExpressionTransformer() {
    $traceurRuntime.defaultSuperCall(this, $TypeToExpressionTransformer.prototype, arguments);
  };
  var $TypeToExpressionTransformer = TypeToExpressionTransformer;
  ($traceurRuntime.createClass)(TypeToExpressionTransformer, {
    transformTypeName: function(tree) {
      return createIdentifierExpression(tree.name);
    },
    transformPredefinedType: function(tree) {
      return createMemberExpression('$traceurRuntime', 'type', tree.typeToken);
    }
  }, {}, ParseTreeTransformer);
  return {get TypeToExpressionTransformer() {
      return TypeToExpressionTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/TypeTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/TypeTransformer";
  var $__331 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      FormalParameter = $__331.FormalParameter,
      FunctionDeclaration = $__331.FunctionDeclaration,
      FunctionExpression = $__331.FunctionExpression,
      GetAccessor = $__331.GetAccessor,
      PropertyMethodAssignment = $__331.PropertyMethodAssignment,
      VariableDeclaration = $__331.VariableDeclaration;
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var TypeTransformer = function TypeTransformer() {
    $traceurRuntime.defaultSuperCall(this, $TypeTransformer.prototype, arguments);
  };
  var $TypeTransformer = TypeTransformer;
  ($traceurRuntime.createClass)(TypeTransformer, {
    transformVariableDeclaration: function(tree) {
      if (tree.typeAnnotation) {
        tree = new VariableDeclaration(tree.location, tree.lvalue, null, tree.initializer);
      }
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformVariableDeclaration", [tree]);
    },
    transformFormalParameter: function(tree) {
      if (tree.typeAnnotation !== null)
        return new FormalParameter(tree.location, tree.parameter, null, []);
      return tree;
    },
    transformFunctionDeclaration: function(tree) {
      if (tree.typeAnnotation) {
        tree = new FunctionDeclaration(tree.location, tree.name, tree.functionKind, tree.parameterList, null, tree.annotations, tree.functionBody);
      }
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      if (tree.typeAnnotation) {
        tree = new FunctionExpression(tree.location, tree.name, tree.functionKind, tree.parameterList, null, tree.annotations, tree.functionBody);
      }
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformFunctionExpression", [tree]);
    },
    transformPropertyMethodAssignment: function(tree) {
      if (tree.typeAnnotation) {
        tree = new PropertyMethodAssignment(tree.location, tree.isStatic, tree.functionKind, tree.name, tree.parameterList, null, tree.annotations, tree.functionBody);
      }
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformPropertyMethodAssignment", [tree]);
    },
    transformGetAccessor: function(tree) {
      if (tree.typeAnnotation) {
        tree = new GetAccessor(tree.location, tree.isStatic, tree.name, null, tree.annotations, tree.body);
      }
      return $traceurRuntime.superCall(this, $TypeTransformer.prototype, "transformGetAccessor", [tree]);
    }
  }, {}, ParseTreeTransformer);
  return {get TypeTransformer() {
      return TypeTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/UniqueIdentifierGenerator", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/UniqueIdentifierGenerator";
  var UniqueIdentifierGenerator = function UniqueIdentifierGenerator() {
    this.identifierIndex = 0;
  };
  ($traceurRuntime.createClass)(UniqueIdentifierGenerator, {generateUniqueIdentifier: function() {
      return ("$__" + this.identifierIndex++);
    }}, {});
  return {get UniqueIdentifierGenerator() {
      return UniqueIdentifierGenerator;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/FromOptionsTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/FromOptionsTransformer";
  var AmdTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AmdTransformer")).AmdTransformer;
  var AnnotationsTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AnnotationsTransformer")).AnnotationsTransformer;
  var ArrayComprehensionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ArrayComprehensionTransformer")).ArrayComprehensionTransformer;
  var ArrowFunctionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ArrowFunctionTransformer")).ArrowFunctionTransformer;
  var BlockBindingTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/BlockBindingTransformer")).BlockBindingTransformer;
  var ClassTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ClassTransformer")).ClassTransformer;
  var CommonJsModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/CommonJsModuleTransformer")).CommonJsModuleTransformer;
  var DefaultParametersTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/DefaultParametersTransformer")).DefaultParametersTransformer;
  var DestructuringTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/DestructuringTransformer")).DestructuringTransformer;
  var ForOfTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ForOfTransformer")).ForOfTransformer;
  var FreeVariableChecker = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/FreeVariableChecker")).FreeVariableChecker;
  var GeneratorComprehensionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/GeneratorComprehensionTransformer")).GeneratorComprehensionTransformer;
  var GeneratorTransformPass = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/GeneratorTransformPass")).GeneratorTransformPass;
  var InlineModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/InlineModuleTransformer")).InlineModuleTransformer;
  var ModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ModuleTransformer")).ModuleTransformer;
  var MultiTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/MultiTransformer")).MultiTransformer;
  var NumericLiteralTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/NumericLiteralTransformer")).NumericLiteralTransformer;
  var ObjectLiteralTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ObjectLiteralTransformer")).ObjectLiteralTransformer;
  var ObjectMap = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ObjectMap")).ObjectMap;
  var ParseTreeValidator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeValidator")).ParseTreeValidator;
  var PropertyNameShorthandTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PropertyNameShorthandTransformer")).PropertyNameShorthandTransformer;
  var InstantiateModuleTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/InstantiateModuleTransformer")).InstantiateModuleTransformer;
  var RestParameterTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/RestParameterTransformer")).RestParameterTransformer;
  var SpreadTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/SpreadTransformer")).SpreadTransformer;
  var SymbolTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/SymbolTransformer")).SymbolTransformer;
  var TemplateLiteralTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TemplateLiteralTransformer")).TemplateLiteralTransformer;
  var TypeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TypeTransformer")).TypeTransformer;
  var TypeAssertionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TypeAssertionTransformer")).TypeAssertionTransformer;
  var TypeToExpressionTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TypeToExpressionTransformer")).TypeToExpressionTransformer;
  var UniqueIdentifierGenerator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/UniqueIdentifierGenerator")).UniqueIdentifierGenerator;
  var $__335 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")),
      options = $__335.options,
      transformOptions = $__335.transformOptions;
  var FromOptionsTransformer = function FromOptionsTransformer(reporter) {
    var idGenerator = arguments[1] !== (void 0) ? arguments[1] : new UniqueIdentifierGenerator();
    var $__333 = this;
    $traceurRuntime.superCall(this, $FromOptionsTransformer.prototype, "constructor", [reporter, options.validate]);
    var append = (function(transformer) {
      $__333.append((function(tree) {
        return new transformer(idGenerator, reporter).transformAny(tree);
      }));
    });
    if (transformOptions.numericLiterals)
      append(NumericLiteralTransformer);
    if (transformOptions.templateLiterals)
      append(TemplateLiteralTransformer);
    if (options.types) {
      append(TypeToExpressionTransformer);
    }
    if (transformOptions.annotations)
      append(AnnotationsTransformer);
    if (options.typeAssertions)
      append(TypeAssertionTransformer);
    if (transformOptions.modules) {
      switch (transformOptions.modules) {
        case 'commonjs':
          append(CommonJsModuleTransformer);
          break;
        case 'amd':
          append(AmdTransformer);
          break;
        case 'inline':
          append(InlineModuleTransformer);
          break;
        case 'instantiate':
          append(InstantiateModuleTransformer);
          break;
        case 'register':
          append(ModuleTransformer);
          break;
        default:
          throw new Error('Invalid modules transform option');
      }
    }
    if (transformOptions.arrowFunctions)
      append(ArrowFunctionTransformer);
    if (transformOptions.classes)
      append(ClassTransformer);
    if (transformOptions.propertyNameShorthand)
      append(PropertyNameShorthandTransformer);
    if (transformOptions.propertyMethods || transformOptions.computedPropertyNames) {
      append(ObjectLiteralTransformer);
    }
    if (transformOptions.generatorComprehension)
      append(GeneratorComprehensionTransformer);
    if (transformOptions.arrayComprehension)
      append(ArrayComprehensionTransformer);
    if (transformOptions.forOf)
      append(ForOfTransformer);
    if (transformOptions.restParameters)
      append(RestParameterTransformer);
    if (transformOptions.defaultParameters)
      append(DefaultParametersTransformer);
    if (transformOptions.destructuring)
      append(DestructuringTransformer);
    if (transformOptions.types)
      append(TypeTransformer);
    if (transformOptions.spread)
      append(SpreadTransformer);
    if (transformOptions.blockBinding)
      append(BlockBindingTransformer);
    if (transformOptions.generators || transformOptions.asyncFuntions)
      append(GeneratorTransformPass);
    if (transformOptions.symbols)
      append(SymbolTransformer);
    if (options.freeVariableChecker) {
      this.append((function(tree) {
        FreeVariableChecker.checkScript(reporter, tree);
        return tree;
      }));
    }
  };
  var $FromOptionsTransformer = FromOptionsTransformer;
  ($traceurRuntime.createClass)(FromOptionsTransformer, {}, {}, MultiTransformer);
  return {get FromOptionsTransformer() {
      return FromOptionsTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/AttachModuleNameTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/AttachModuleNameTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__337 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      Module = $__337.Module,
      Script = $__337.Script;
  var AttachModuleNameTransformer = function AttachModuleNameTransformer(moduleName) {
    this.moduleName_ = moduleName;
  };
  ($traceurRuntime.createClass)(AttachModuleNameTransformer, {
    transformModule: function(tree) {
      return new Module(tree.location, tree.scriptItemList, this.moduleName_);
    },
    transformScript: function(tree) {
      return new Script(tree.location, tree.scriptItemList, this.moduleName_);
    }
  }, {}, ParseTreeTransformer);
  return {get AttachModuleNameTransformer() {
      return AttachModuleNameTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/ValidationVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/ValidationVisitor";
  var ModuleVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ModuleVisitor")).ModuleVisitor;
  var ValidationVisitor = function ValidationVisitor() {
    $traceurRuntime.defaultSuperCall(this, $ValidationVisitor.prototype, arguments);
  };
  var $ValidationVisitor = ValidationVisitor;
  ($traceurRuntime.createClass)(ValidationVisitor, {
    checkExport_: function(tree, name) {
      var description = this.validatingModuleDescription_;
      if (description && !description.getExport(name)) {
        var moduleName = description.normalizedName;
        this.reportError(tree, ("'" + name + "' is not exported by '" + moduleName + "'"));
      }
    },
    checkImport_: function(tree, name) {
      var existingImport = this.moduleSymbol.getImport(name);
      if (existingImport) {
        this.reportError(tree, ("'" + name + "' was previously imported at " + existingImport.location.start));
      } else {
        this.moduleSymbol.addImport(name, tree);
      }
    },
    visitAndValidate_: function(moduleDescription, tree) {
      var validatingModuleDescription = this.validatingModuleDescription_;
      this.validatingModuleDescription_ = moduleDescription;
      this.visitAny(tree);
      this.validatingModuleDescription_ = validatingModuleDescription;
    },
    visitNamedExport: function(tree) {
      if (tree.moduleSpecifier) {
        var name = tree.moduleSpecifier.token.processedValue;
        var moduleDescription = this.getModuleDescriptionForModuleSpecifier(name);
        this.visitAndValidate_(moduleDescription, tree.specifierSet);
      }
    },
    visitExportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    },
    visitImportDeclaration: function(tree) {
      var name = tree.moduleSpecifier.token.processedValue;
      var moduleDescription = this.getModuleDescriptionForModuleSpecifier(name);
      this.visitAndValidate_(moduleDescription, tree.importClause);
    },
    visitImportSpecifier: function(tree) {
      var importName = tree.rhs ? tree.rhs.value : tree.lhs.value;
      this.checkImport_(tree, importName);
      this.checkExport_(tree, tree.lhs.value);
    },
    visitImportedBinding: function(tree) {
      var importName = tree.binding.identifierToken.value;
      this.checkImport_(tree, importName);
      this.checkExport_(tree, 'default');
    }
  }, {}, ModuleVisitor);
  return {get ValidationVisitor() {
      return ValidationVisitor;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/ExportListBuilder", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/ExportListBuilder";
  var ExportVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ExportVisitor")).ExportVisitor;
  var ValidationVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ValidationVisitor")).ValidationVisitor;
  var transformOptions = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).transformOptions;
  var ExportListBuilder = function ExportListBuilder(reporter) {
    this.reporter_ = reporter;
  };
  ($traceurRuntime.createClass)(ExportListBuilder, {buildExportList: function(deps, loader) {
      if (!transformOptions.modules)
        return;
      var reporter = this.reporter_;
      function doVisit(ctor) {
        for (var i = 0; i < deps.length; i++) {
          var visitor = new ctor(reporter, loader, deps[i].moduleSymbol);
          visitor.visitAny(deps[i].tree);
        }
      }
      function reverseVisit(ctor) {
        for (var i = deps.length - 1; i >= 0; i--) {
          var visitor = new ctor(reporter, loader, deps[i].moduleSymbol);
          visitor.visitAny(deps[i].tree);
        }
      }
      reverseVisit(ExportVisitor);
      doVisit(ValidationVisitor);
    }}, {});
  return {get ExportListBuilder() {
      return ExportListBuilder;
    }};
});
System.register("traceur@0.0.43/src/util/url", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/url";
  var canonicalizeUrl = $traceurRuntime.canonicalizeUrl;
  var isAbsolute = $traceurRuntime.isAbsolute;
  var removeDotSegments = $traceurRuntime.removeDotSegments;
  var resolveUrl = $traceurRuntime.resolveUrl;
  return {
    get canonicalizeUrl() {
      return canonicalizeUrl;
    },
    get isAbsolute() {
      return isAbsolute;
    },
    get removeDotSegments() {
      return removeDotSegments;
    },
    get resolveUrl() {
      return resolveUrl;
    }
  };
});
System.register("traceur@0.0.43/src/codegeneration/module/ModuleSpecifierVisitor", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/ModuleSpecifierVisitor";
  var ParseTreeVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/ParseTreeVisitor")).ParseTreeVisitor;
  var STRING = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/TokenType")).STRING;
  var LiteralToken = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/LiteralToken")).LiteralToken;
  var canonicalizeUrl = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/url")).canonicalizeUrl;
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  var ModuleSpecifierVisitor = function ModuleSpecifierVisitor(reporter) {
    $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "constructor", []);
    this.moduleSpecifiers_ = Object.create(null);
  };
  var $ModuleSpecifierVisitor = ModuleSpecifierVisitor;
  ($traceurRuntime.createClass)(ModuleSpecifierVisitor, {
    get moduleSpecifiers() {
      return Object.keys(this.moduleSpecifiers_);
    },
    visitModuleSpecifier: function(tree) {
      this.moduleSpecifiers_[tree.token.processedValue] = true;
    },
    visitVariableDeclaration: function(tree) {
      this.addTypeAssertionDependency_(tree.typeAnnotation);
      return $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "visitVariableDeclaration", [tree]);
    },
    visitFormalParameter: function(tree) {
      this.addTypeAssertionDependency_(tree.typeAnnotation);
      return $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "visitFormalParameter", [tree]);
    },
    visitGetAccessor: function(tree) {
      this.addTypeAssertionDependency_(tree.typeAnnotation);
      return $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "visitGetAccessor", [tree]);
    },
    visitPropertyMethodAssignment: function(tree) {
      this.addTypeAssertionDependency_(tree.typeAnnotation);
      return $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "visitPropertyMethodAssignment", [tree]);
    },
    visitFunctionDeclaration: function(tree) {
      this.addTypeAssertionDependency_(tree.typeAnnotation);
      return $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "visitFunctionDeclaration", [tree]);
    },
    visitFunctionExpression: function(tree) {
      this.addTypeAssertionDependency_(tree.typeAnnotation);
      return $traceurRuntime.superCall(this, $ModuleSpecifierVisitor.prototype, "visitFunctionExpression", [tree]);
    },
    addTypeAssertionDependency_: function(typeAnnotation) {
      if (typeAnnotation !== null && options.typeAssertionModule !== null)
        this.moduleSpecifiers_[options.typeAssertionModule] = true;
    }
  }, {}, ParseTreeVisitor);
  return {get ModuleSpecifierVisitor() {
      return ModuleSpecifierVisitor;
    }};
});
System.register("traceur@0.0.43/src/runtime/system-map", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/system-map";
  function prefixMatchLength(name, prefix) {
    var prefixParts = prefix.split('/');
    var nameParts = name.split('/');
    if (prefixParts.length > nameParts.length)
      return 0;
    for (var i = 0; i < prefixParts.length; i++) {
      if (nameParts[i] != prefixParts[i])
        return 0;
    }
    return prefixParts.length;
  }
  function applyMap(map, name, parentName) {
    var curMatch,
        curMatchLength = 0;
    var curParent,
        curParentMatchLength = 0;
    if (parentName) {
      var mappedName;
      Object.getOwnPropertyNames(map).some(function(p) {
        var curMap = map[p];
        if (curMap && typeof curMap === 'object') {
          if (prefixMatchLength(parentName, p) <= curParentMatchLength)
            return;
          Object.getOwnPropertyNames(curMap).forEach(function(q) {
            if (prefixMatchLength(name, q) > curMatchLength) {
              curMatch = q;
              curMatchLength = q.split('/').length;
              curParent = p;
              curParentMatchLength = p.split('/').length;
            }
          });
        }
        if (curMatch) {
          var subPath = name.split('/').splice(curMatchLength).join('/');
          mappedName = map[curParent][curMatch] + (subPath ? '/' + subPath : '');
          return mappedName;
        }
      });
    }
    if (mappedName)
      return mappedName;
    Object.getOwnPropertyNames(map).forEach(function(p) {
      var curMap = map[p];
      if (curMap && typeof curMap === 'string') {
        if (prefixMatchLength(name, p) > curMatchLength) {
          curMatch = p;
          curMatchLength = p.split('/').length;
        }
      }
    });
    if (!curMatch)
      return name;
    var subPath = name.split('/').splice(curMatchLength).join('/');
    return map[curMatch] + (subPath ? '/' + subPath : '');
  }
  var systemjs = {applyMap: applyMap};
  return {get systemjs() {
      return systemjs;
    }};
});
System.register("traceur@0.0.43/src/runtime/webLoader", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/webLoader";
  var webLoader = {load: function(url, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = (function() {
        if (xhr.status == 200 || xhr.status == 0) {
          callback(xhr.responseText);
        } else {
          var err;
          if (xhr.status === 404)
            err = 'File not found \'' + url + '\'';
          else
            err = xhr.status + xhr.statusText;
          errback(err);
        }
        xhr = null;
      });
      xhr.onerror = (function(err) {
        errback(err);
      });
      xhr.open('GET', url, true);
      xhr.send();
      return (function() {
        xhr && xhr.abort();
      });
    }};
  return {get webLoader() {
      return webLoader;
    }};
});
System.register("traceur@0.0.43/src/runtime/LoaderHooks", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/LoaderHooks";
  var AttachModuleNameTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/AttachModuleNameTransformer")).AttachModuleNameTransformer;
  var FromOptionsTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FromOptionsTransformer")).FromOptionsTransformer;
  var ExportListBuilder = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ExportListBuilder")).ExportListBuilder;
  var ModuleSpecifierVisitor = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ModuleSpecifierVisitor")).ModuleSpecifierVisitor;
  var ModuleSymbol = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/ModuleSymbol")).ModuleSymbol;
  var Parser = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Parser")).Parser;
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  var SourceFile = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/SourceFile")).SourceFile;
  var systemjs = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/system-map")).systemjs;
  var UniqueIdentifierGenerator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/UniqueIdentifierGenerator")).UniqueIdentifierGenerator;
  var $__346 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/url")),
      isAbsolute = $__346.isAbsolute,
      resolveUrl = $__346.resolveUrl;
  var webLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/webLoader")).webLoader;
  var assert = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/assert")).assert;
  var NOT_STARTED = 0;
  var LOADING = 1;
  var LOADED = 2;
  var PARSED = 3;
  var TRANSFORMING = 4;
  var TRANSFORMED = 5;
  var COMPLETE = 6;
  var ERROR = 7;
  var identifierGenerator = new UniqueIdentifierGenerator();
  var LoaderHooks = function LoaderHooks(reporter, baseURL) {
    var fileLoader = arguments[2] !== (void 0) ? arguments[2] : webLoader;
    var moduleStore = arguments[3] !== (void 0) ? arguments[3] : $traceurRuntime.ModuleStore;
    this.reporter = reporter;
    this.baseURL_ = baseURL;
    this.moduleStore_ = moduleStore;
    this.fileLoader = fileLoader;
    this.exportListBuilder_ = new ExportListBuilder(this.reporter);
  };
  ($traceurRuntime.createClass)(LoaderHooks, {
    get: function(normalizedName) {
      return this.moduleStore_.get(normalizedName);
    },
    set: function(normalizedName, module) {
      this.moduleStore_.set(normalizedName, module);
    },
    normalize: function(name, referrerName, referrerAddress) {
      var normalizedName = this.moduleStore_.normalize(name, referrerName, referrerAddress);
      if (System.map)
        return systemjs.applyMap(System.map, normalizedName, referrerName);
      else
        return normalizedName;
    },
    get baseURL() {
      return this.baseURL_;
    },
    set baseURL(value) {
      this.baseURL_ = String(value);
    },
    getModuleSpecifiers: function(codeUnit) {
      if (!this.parse(codeUnit))
        return;
      codeUnit.state = PARSED;
      var moduleSpecifierVisitor = new ModuleSpecifierVisitor(this.reporter);
      moduleSpecifierVisitor.visit(codeUnit.metadata.tree);
      return moduleSpecifierVisitor.moduleSpecifiers;
    },
    parse: function(codeUnit) {
      assert(!codeUnit.metadata.tree);
      var reporter = this.reporter;
      var normalizedName = codeUnit.normalizedName;
      var program = codeUnit.source;
      var url = codeUnit.url || normalizedName;
      var file = new SourceFile(url, program);
      var parser = new Parser(file, reporter);
      if (codeUnit.type == 'module')
        codeUnit.metadata.tree = parser.parseModule();
      else
        codeUnit.metadata.tree = parser.parseScript();
      codeUnit.metadata.moduleSymbol = new ModuleSymbol(codeUnit.metadata.tree, normalizedName);
      return !reporter.hadError();
    },
    transform: function(codeUnit) {
      var transformer = new AttachModuleNameTransformer(codeUnit.normalizedName);
      var transformedTree = transformer.transformAny(codeUnit.metadata.tree);
      transformer = new FromOptionsTransformer(this.reporter, identifierGenerator);
      return transformer.transform(transformedTree);
    },
    fetch: function(load) {
      var $__344 = this;
      return new Promise((function(resolve, reject) {
        if (!load)
          reject(new TypeError('fetch requires argument object'));
        else if (!load.address || typeof load.address !== 'string')
          reject(new TypeError('fetch({address}) missing required string.'));
        else
          $__344.fileLoader.load(load.address, resolve, reject);
      }));
    },
    translate: function(load) {
      return new Promise((function(resolve, reject) {
        resolve(load.source);
      }));
    },
    instantiate: function($__346) {
      var name = $__346.name,
          metadata = $__346.metadata,
          address = $__346.address,
          source = $__346.source,
          sourceMap = $__346.sourceMap;
      return new Promise((function(resolve, reject) {
        resolve(undefined);
      }));
    },
    locate: function(load) {
      load.url = this.locate_(load);
      return load.url;
    },
    locate_: function(load) {
      var normalizedModuleName = load.normalizedName;
      var asJS;
      if (load.type === 'script') {
        asJS = normalizedModuleName;
      } else {
        asJS = normalizedModuleName + '.js';
      }
      if (options.referrer) {
        if (asJS.indexOf(options.referrer) === 0) {
          asJS = asJS.slice(options.referrer.length);
          load.metadata.locateMap = {
            pattern: options.referrer,
            replacement: ''
          };
        }
      }
      if (isAbsolute(asJS))
        return asJS;
      var baseURL = load.metadata && load.metadata.baseURL;
      baseURL = baseURL || this.baseURL;
      if (baseURL) {
        load.metadata.baseURL = baseURL;
        return resolveUrl(baseURL, asJS);
      }
      return asJS;
    },
    nameTrace: function(load) {
      var trace = '';
      if (load.metadata.locateMap) {
        trace += this.locateMapTrace(load);
      }
      var base = load.metadata.baseURL || this.baseURL;
      if (base) {
        trace += this.baseURLTrace(base);
      } else {
        trace += 'No baseURL\n';
      }
      return trace;
    },
    locateMapTrace: function(load) {
      var map = load.metadata.locateMap;
      return ("LoaderHooks.locate found \'" + map.pattern + "\' -> \'" + map.replacement + "\'\n");
    },
    baseURLTrace: function(base) {
      return 'LoaderHooks.locate resolved against base \'' + base + '\'\n';
    },
    evaluateCodeUnit: function(codeUnit) {
      var result = ('global', eval)(codeUnit.metadata.transcoded);
      codeUnit.metadata.transformedTree = null;
      return result;
    },
    analyzeDependencies: function(dependencies, loader) {
      var deps = [];
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        assert(codeUnit.state >= PARSED);
        if (codeUnit.state == PARSED) {
          deps.push(codeUnit.metadata);
        }
      }
      this.exportListBuilder_.buildExportList(deps, loader);
    },
    get options() {
      return options;
    },
    bundledModule: function(name) {
      return this.moduleStore_.bundleStore[name];
    }
  }, {});
  return {get LoaderHooks() {
      return LoaderHooks;
    }};
});
System.register("traceur@0.0.43/src/runtime/InterceptOutputLoaderHooks", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/InterceptOutputLoaderHooks";
  var LoaderHooks = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/LoaderHooks")).LoaderHooks;
  var InterceptOutputLoaderHooks = function InterceptOutputLoaderHooks() {
    for (var args = [],
        $__348 = 0; $__348 < arguments.length; $__348++)
      args[$__348] = arguments[$__348];
    $traceurRuntime.superCall(this, $InterceptOutputLoaderHooks.prototype, "constructor", $traceurRuntime.spread(args));
    this.sourceMap = null;
    this.transcoded = null;
    this.onTranscoded = (function() {});
  };
  var $InterceptOutputLoaderHooks = InterceptOutputLoaderHooks;
  ($traceurRuntime.createClass)(InterceptOutputLoaderHooks, {instantiate: function($__349) {
      var metadata = $__349.metadata,
          url = $__349.url;
      this.sourceMap = metadata.sourceMap;
      this.transcoded = metadata.transcoded;
      this.onTranscoded(metadata, url);
      return undefined;
    }}, {}, LoaderHooks);
  return {get InterceptOutputLoaderHooks() {
      return InterceptOutputLoaderHooks;
    }};
});
System.register("traceur@0.0.43/src/runtime/InternalLoader", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/InternalLoader";
  var ArrayMap = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ArrayMap")).ArrayMap;
  var LoaderHooks = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/LoaderHooks")).LoaderHooks;
  var ObjectMap = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ObjectMap")).ObjectMap;
  var $__352 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/url")),
      canonicalizeUrl = $__352.canonicalizeUrl,
      isAbsolute = $__352.isAbsolute,
      resolveUrl = $__352.resolveUrl;
  var getUid = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/uid")).getUid;
  var toSource = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/toSource")).toSource;
  var NOT_STARTED = 0;
  var LOADING = 1;
  var LOADED = 2;
  var PARSED = 3;
  var TRANSFORMING = 4;
  var TRANSFORMED = 5;
  var COMPLETE = 6;
  var ERROR = 7;
  var global = this;
  var CodeUnit = function CodeUnit(loaderHooks, normalizedName, type, state, name, referrerName, address) {
    var $__350 = this;
    this.promise = new Promise((function(res, rej) {
      $__350.loaderHooks = loaderHooks;
      $__350.normalizedName = normalizedName;
      $__350.type = type;
      $__350.name_ = name;
      $__350.referrerName_ = referrerName;
      $__350.address = address;
      $__350.url = InternalLoader.uniqueName(normalizedName, address);
      $__350.uid = getUid();
      $__350.state_ = state || NOT_STARTED;
      $__350.error = null;
      $__350.result = null;
      $__350.data_ = {};
      $__350.dependencies = [];
      $__350.resolve = res;
      $__350.reject = rej;
    }));
  };
  ($traceurRuntime.createClass)(CodeUnit, {
    get state() {
      return this.state_;
    },
    set state(state) {
      if (state < this.state_) {
        throw new Error('Invalid state change');
      }
      this.state_ = state;
    },
    get metadata() {
      return this.data_;
    },
    nameTrace: function() {
      var trace = this.specifiedAs();
      if (isAbsolute(this.name_)) {
        return trace + 'An absolute name.\n';
      }
      if (this.referrerName_) {
        return trace + this.importedBy() + this.normalizesTo();
      }
      return trace + this.normalizesTo();
    },
    specifiedAs: function() {
      return ("Specified as " + this.name_ + ".\n");
    },
    importedBy: function() {
      return ("Imported by " + this.referrerName_ + ".\n");
    },
    normalizesTo: function() {
      return 'Normalizes to ' + this.normalizedName + '\n';
    },
    transform: function() {
      return this.loaderHooks.transform(this);
    },
    instantiate: function(load) {
      return this.loaderHooks.instantiate(this);
    }
  }, {});
  var PreCompiledCodeUnit = function PreCompiledCodeUnit(loaderHooks, normalizedName, name, referrerName, address, module) {
    $traceurRuntime.superCall(this, $PreCompiledCodeUnit.prototype, "constructor", [loaderHooks, normalizedName, 'module', COMPLETE, name, referrerName, address]);
    this.result = module;
    this.resolve(this.result);
  };
  var $PreCompiledCodeUnit = PreCompiledCodeUnit;
  ($traceurRuntime.createClass)(PreCompiledCodeUnit, {}, {}, CodeUnit);
  var BundledCodeUnit = function BundledCodeUnit(loaderHooks, normalizedName, name, referrerName, address, deps, execute) {
    $traceurRuntime.superCall(this, $BundledCodeUnit.prototype, "constructor", [loaderHooks, normalizedName, 'module', TRANSFORMED, name, referrerName, address]);
    this.deps = deps;
    this.execute = execute;
  };
  var $BundledCodeUnit = BundledCodeUnit;
  ($traceurRuntime.createClass)(BundledCodeUnit, {
    getModuleSpecifiers: function() {
      return this.deps;
    },
    evaluate: function() {
      var $__350 = this;
      var normalizedNames = this.deps.map((function(name) {
        return $__350.loaderHooks.normalize(name);
      }));
      var module = this.execute.apply(global, normalizedNames);
      System.set(this.normalizedName, module);
      return module;
    }
  }, {}, CodeUnit);
  var HookedCodeUnit = function HookedCodeUnit() {
    $traceurRuntime.defaultSuperCall(this, $HookedCodeUnit.prototype, arguments);
  };
  var $HookedCodeUnit = HookedCodeUnit;
  ($traceurRuntime.createClass)(HookedCodeUnit, {
    getModuleSpecifiers: function() {
      return this.loaderHooks.getModuleSpecifiers(this);
    },
    evaluate: function() {
      return this.loaderHooks.evaluateCodeUnit(this);
    }
  }, {}, CodeUnit);
  var LoadCodeUnit = function LoadCodeUnit(loaderHooks, normalizedName, name, referrerName, address) {
    $traceurRuntime.superCall(this, $LoadCodeUnit.prototype, "constructor", [loaderHooks, normalizedName, 'module', NOT_STARTED, name, referrerName, address]);
  };
  var $LoadCodeUnit = LoadCodeUnit;
  ($traceurRuntime.createClass)(LoadCodeUnit, {}, {}, HookedCodeUnit);
  var EvalCodeUnit = function EvalCodeUnit(loaderHooks, code) {
    var type = arguments[2] !== (void 0) ? arguments[2] : 'script';
    var normalizedName = arguments[3];
    var referrerName = arguments[4];
    var address = arguments[5];
    $traceurRuntime.superCall(this, $EvalCodeUnit.prototype, "constructor", [loaderHooks, normalizedName, type, LOADED, null, referrerName, address]);
    this.source = code;
  };
  var $EvalCodeUnit = EvalCodeUnit;
  ($traceurRuntime.createClass)(EvalCodeUnit, {}, {}, HookedCodeUnit);
  var uniqueNameCount = 0;
  var InternalLoader = function InternalLoader(loaderHooks) {
    this.loaderHooks = loaderHooks;
    this.reporter = loaderHooks.reporter;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;
  };
  ($traceurRuntime.createClass)(InternalLoader, {
    load: function(name) {
      var referrerName = arguments[1] !== (void 0) ? arguments[1] : this.loaderHooks.baseURL;
      var address = arguments[2];
      var type = arguments[3] !== (void 0) ? arguments[3] : 'script';
      var codeUnit = this.load_(name, referrerName, address, type);
      return codeUnit.promise.then((function() {
        return codeUnit;
      }));
    },
    load_: function(name, referrerName, address, type) {
      var $__350 = this;
      var codeUnit = this.getCodeUnit_(name, referrerName, address, type);
      if (codeUnit.state === ERROR) {
        return codeUnit;
      }
      if (codeUnit.state === TRANSFORMED) {
        this.handleCodeUnitLoaded(codeUnit);
      } else {
        if (codeUnit.state !== NOT_STARTED)
          return codeUnit;
        codeUnit.state = LOADING;
        codeUnit.address = this.loaderHooks.locate(codeUnit);
        this.loaderHooks.fetch(codeUnit).then((function(text) {
          codeUnit.source = text;
          return codeUnit;
        })).then(this.loaderHooks.translate.bind(this.loaderHooks)).then((function(source) {
          codeUnit.source = source;
          codeUnit.state = LOADED;
          $__350.handleCodeUnitLoaded(codeUnit);
          return codeUnit;
        })).catch((function(err) {
          try {
            codeUnit.state = ERROR;
            codeUnit.abort = function() {};
            codeUnit.err = err;
            $__350.handleCodeUnitLoadError(codeUnit);
          } catch (ex) {
            console.error('Internal Error ' + (ex.stack || ex));
          }
        }));
      }
      return codeUnit;
    },
    module: function(code, referrerName, address) {
      var codeUnit = new EvalCodeUnit(this.loaderHooks, code, 'module', null, referrerName, address);
      this.cache.set({}, codeUnit);
      this.handleCodeUnitLoaded(codeUnit);
      return codeUnit.promise;
    },
    define: function(normalizedName, code, address) {
      var codeUnit = new EvalCodeUnit(this.loaderHooks, code, 'module', normalizedName, null, address);
      var key = this.getKey(normalizedName, 'module');
      this.cache.set(key, codeUnit);
      this.handleCodeUnitLoaded(codeUnit);
      return codeUnit.promise;
    },
    script: function(code, name, referrerName, address) {
      var normalizedName = System.normalize(name || '', referrerName, address);
      var codeUnit = new EvalCodeUnit(this.loaderHooks, code, 'script', normalizedName, referrerName, address);
      var key = {};
      if (name)
        key = this.getKey(normalizedName, 'script');
      this.cache.set(key, codeUnit);
      this.handleCodeUnitLoaded(codeUnit);
      return codeUnit.promise;
    },
    get options() {
      return this.loaderHooks.options;
    },
    sourceMapInfo: function(normalizedName, type) {
      var key = this.getKey(normalizedName, type);
      var codeUnit = this.cache.get(key);
      return {
        sourceMap: codeUnit && codeUnit.metadata && codeUnit.metadata.sourceMap,
        url: codeUnit && codeUnit.url
      };
    },
    getKey: function(url, type) {
      var combined = type + ':' + url;
      if (combined in this.urlToKey) {
        return this.urlToKey[combined];
      }
      return this.urlToKey[combined] = {};
    },
    getCodeUnit_: function(name, referrerName, address, type) {
      var normalizedName = System.normalize(name, referrerName, address);
      var key = this.getKey(normalizedName, type);
      var cacheObject = this.cache.get(key);
      if (!cacheObject) {
        var module = this.loaderHooks.get(normalizedName);
        if (module) {
          cacheObject = new PreCompiledCodeUnit(this.loaderHooks, normalizedName, name, referrerName, address, module);
          cacheObject.type = 'module';
        } else {
          var bundledModule = this.loaderHooks.bundledModule(name);
          if (bundledModule) {
            cacheObject = new BundledCodeUnit(this.loaderHooks, normalizedName, name, referrerName, address, bundledModule.deps, bundledModule.execute);
          } else {
            cacheObject = new LoadCodeUnit(this.loaderHooks, normalizedName, name, referrerName, address);
            cacheObject.type = type;
          }
        }
        this.cache.set(key, cacheObject);
      }
      return cacheObject;
    },
    areAll: function(state) {
      return this.cache.values().every((function(codeUnit) {
        return codeUnit.state >= state;
      }));
    },
    getCodeUnitForModuleSpecifier: function(name, referrerName) {
      return this.getCodeUnit_(name, referrerName, null, 'module');
    },
    handleCodeUnitLoaded: function(codeUnit) {
      var $__350 = this;
      var referrerName = codeUnit.normalizedName;
      var moduleSpecifiers = codeUnit.getModuleSpecifiers();
      if (!moduleSpecifiers) {
        this.abortAll(("No module specifiers in " + referrerName));
        return;
      }
      codeUnit.dependencies = moduleSpecifiers.sort().map((function(name) {
        return $__350.getCodeUnit_(name, referrerName, null, 'module');
      }));
      codeUnit.dependencies.forEach((function(dependency) {
        $__350.load(dependency.normalizedName, null, null, 'module');
      }));
      if (this.areAll(PARSED)) {
        this.analyze();
        this.transform();
        this.evaluate();
      }
    },
    handleCodeUnitLoadError: function(codeUnit) {
      var message = codeUnit.err ? String(codeUnit.err) + '\n' : ("Failed to load '" + codeUnit.address + "'.\n");
      message += codeUnit.nameTrace() + this.loaderHooks.nameTrace(codeUnit);
      this.reporter.reportError(null, message);
      this.abortAll(message);
      codeUnit.error = message;
      codeUnit.reject(this.toError(message));
    },
    toError: function(maybeError) {
      return maybeError instanceof Error ? maybeError : new Error(maybeError);
    },
    abortAll: function(errorMessage) {
      var $__350 = this;
      this.cache.values().forEach((function(codeUnit) {
        if (codeUnit.abort) {
          codeUnit.abort();
          codeUnit.state = ERROR;
        }
      }));
      this.cache.values().forEach((function(codeUnit) {
        codeUnit.reject($__350.toError(codeUnit.error));
      }));
    },
    analyze: function() {
      this.loaderHooks.analyzeDependencies(this.cache.values(), this);
      this.checkForErrors(this.cache.values(), 'build-export-list');
    },
    transform: function() {
      this.transformDependencies(this.cache.values());
    },
    transformDependencies: function(dependencies, dependentName) {
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= TRANSFORMED) {
          continue;
        }
        if (codeUnit.state === TRANSFORMING) {
          var cir = codeUnit.normalizedName;
          var cle = dependentName;
          this.reporter.reportError(codeUnit.metadata.tree, ("Unsupported circular dependency between " + cir + " and " + cle));
          break;
        }
        codeUnit.state = TRANSFORMING;
        this.transformCodeUnit(codeUnit);
        codeUnit.instantiate();
      }
      this.checkForErrors(dependencies, 'transform');
    },
    transformCodeUnit: function(codeUnit) {
      var $__352;
      this.transformDependencies(codeUnit.dependencies, codeUnit.normalizedName);
      if (codeUnit.state === ERROR)
        return;
      var metadata = codeUnit.metadata;
      metadata.transformedTree = codeUnit.transform();
      codeUnit.state = TRANSFORMED;
      var filename = codeUnit.address || codeUnit.normalizedName;
      ($__352 = $traceurRuntime.assertObject(toSource(metadata.transformedTree, this.options, filename)), metadata.transcoded = $__352[0], metadata.sourceMap = $__352[1], $__352);
      if (codeUnit.address && metadata.transcoded)
        metadata.transcoded += '//# sourceURL=' + codeUnit.address;
    },
    checkForErrors: function(dependencies, phase) {
      if (this.reporter.hadError()) {
        for (var i = 0; i < dependencies.length; i++) {
          var codeUnit = dependencies[i];
          if (codeUnit.state >= COMPLETE) {
            continue;
          }
          codeUnit.state = ERROR;
        }
        for (var i = 0; i < dependencies.length; i++) {
          var codeUnit = dependencies[i];
          if (codeUnit.state == ERROR)
            codeUnit.reject(this.toError(codeUnit.error));
        }
        return true;
      }
      return false;
    },
    orderDependencies: function() {
      var visited = new ObjectMap();
      var ordered = [];
      function orderCodeUnits(codeUnit) {
        if (visited.has(codeUnit)) {
          return;
        }
        visited.set(codeUnit, true);
        codeUnit.dependencies.forEach(orderCodeUnits);
        ordered.push(codeUnit);
      }
      this.cache.values().forEach(orderCodeUnits);
      return ordered;
    },
    evaluate: function() {
      var dependencies = this.orderDependencies();
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        var result;
        try {
          result = codeUnit.evaluate();
        } catch (ex) {
          codeUnit.error = ex;
          this.abortAll();
          codeUnit.reject(codeUnit.error);
          return;
        }
        codeUnit.result = result;
        codeUnit.source = null;
      }
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        codeUnit.state = COMPLETE;
        codeUnit.resolve(codeUnit.result);
      }
    }
  }, {uniqueName: function(normalizedName, referrerAddress) {
      var importerAddress = referrerAddress || System.baseURL;
      if (!importerAddress)
        throw new Error('The System.baseURL is an empty string');
      var path = normalizedName || String(uniqueNameCount++);
      return resolveUrl(importerAddress, path);
    }});
  var SystemLoaderHooks = LoaderHooks;
  var internals = {
    CodeUnit: CodeUnit,
    EvalCodeUnit: EvalCodeUnit,
    LoadCodeUnit: LoadCodeUnit,
    LoaderHooks: LoaderHooks
  };
  return {
    get InternalLoader() {
      return InternalLoader;
    },
    get internals() {
      return internals;
    }
  };
});
System.register("traceur@0.0.43/src/runtime/Loader", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/Loader";
  var InternalLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/InternalLoader")).InternalLoader;
  var Loader = function Loader(loaderHooks) {
    this.internalLoader_ = new InternalLoader(loaderHooks);
    this.loaderHooks_ = loaderHooks;
  };
  ($traceurRuntime.createClass)(Loader, {
    import: function(name) {
      var $__355 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
          referrerName = $__355.referrerName,
          address = $__355.address;
      var $__353 = this;
      return this.internalLoader_.load(name, referrerName, address, 'module').then((function(codeUnit) {
        return $__353.get(codeUnit.normalizedName);
      }));
    },
    module: function(source) {
      var $__355 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
          referrerName = $__355.referrerName,
          address = $__355.address;
      return this.internalLoader_.module(source, referrerName, address);
    },
    define: function(normalizedName, source) {
      var $__355 = $traceurRuntime.assertObject(arguments[2] !== (void 0) ? arguments[2] : {}),
          address = $__355.address,
          metadata = $__355.metadata;
      return this.internalLoader_.define(normalizedName, source, address, metadata);
    },
    get: function(normalizedName) {
      return this.loaderHooks_.get(normalizedName);
    },
    set: function(normalizedName, module) {
      this.loaderHooks_.set(normalizedName, module);
    },
    normalize: function(name, referrerName, referrerAddress) {
      return this.loaderHooks_.normalize(name, referrerName, referrerAddress);
    },
    locate: function(load) {
      return this.loaderHooks_.locate(load);
    },
    fetch: function(load) {
      return this.loaderHooks_.fetch(load);
    },
    translate: function(load) {
      return this.loaderHooks_.translate(load);
    },
    instantiate: function(load) {
      return this.loaderHooks_.instantiate(load);
    }
  }, {});
  ;
  return {
    get Loader() {
      return Loader;
    },
    get LoaderHooks() {
      return LoaderHooks;
    }
  };
});
System.register("traceur@0.0.43/src/WebPageTranscoder", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/WebPageTranscoder";
  var Loader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/Loader")).Loader;
  var ErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ErrorReporter")).ErrorReporter;
  var InterceptOutputLoaderHooks = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/InterceptOutputLoaderHooks")).InterceptOutputLoaderHooks;
  var webLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/webLoader")).webLoader;
  var WebPageTranscoder = function WebPageTranscoder(url) {
    this.url = url;
    this.numPending_ = 0;
    this.numberInlined_ = 0;
  };
  ($traceurRuntime.createClass)(WebPageTranscoder, {
    asyncLoad_: function(url, fncOfContent, onScriptsReady) {
      var $__356 = this;
      this.numPending_++;
      webLoader.load(url, (function(content) {
        if (content)
          fncOfContent(content);
        else
          console.warn('Failed to load', url);
        if (--$__356.numPending_ <= 0)
          onScriptsReady();
      }), (function(error) {
        console.error('WebPageTranscoder FAILED to load ' + url, error.stack || error);
      }));
    },
    addFileFromScriptElement: function(scriptElement, name, content) {
      var nameInfo = {
        address: name,
        referrerName: window.location.href
      };
      this.loader.module(content, nameInfo).catch(function(error) {
        console.error(error.stack || error);
      });
    },
    nextInlineScriptName_: function() {
      this.numberInlined_ += 1;
      if (!this.inlineScriptNameBase_) {
        var segments = this.url.split('.');
        segments.pop();
        this.inlineScriptNameBase_ = segments.join('.');
      }
      return this.inlineScriptNameBase_ + '_' + this.numberInlined_ + '.js';
    },
    addFilesFromScriptElements: function(scriptElements, onScriptsReady) {
      for (var i = 0,
          length = scriptElements.length; i < length; i++) {
        var scriptElement = scriptElements[i];
        if (!scriptElement.src) {
          var name = this.nextInlineScriptName_();
          var content = scriptElement.textContent;
          this.addFileFromScriptElement(scriptElement, name, content);
        } else {
          var name = scriptElement.src;
          this.asyncLoad_(name, this.addFileFromScriptElement.bind(this, scriptElement, name), onScriptsReady);
        }
      }
      if (this.numPending_ <= 0)
        onScriptsReady();
    },
    get reporter() {
      if (!this.reporter_) {
        this.reporter_ = new ErrorReporter();
      }
      return this.reporter_;
    },
    get loader() {
      if (!this.loader_) {
        var loaderHooks = new InterceptOutputLoaderHooks(this.reporter, this.url);
        this.loader_ = new Loader(loaderHooks);
      }
      return this.loader_;
    },
    putFile: function(file) {
      var scriptElement = document.createElement('script');
      scriptElement.setAttribute('data-traceur-src-url', file.name);
      scriptElement.textContent = file.generatedSource;
      var parent = file.scriptElement.parentNode;
      parent.insertBefore(scriptElement, file.scriptElement || null);
    },
    selectAndProcessScripts: function(done) {
      var selector = 'script[type="module"]';
      var scripts = document.querySelectorAll(selector);
      if (!scripts.length) {
        done();
        return;
      }
      this.addFilesFromScriptElements(scripts, (function() {
        done();
      }));
    },
    run: function() {
      var done = arguments[0] !== (void 0) ? arguments[0] : (function() {});
      var $__356 = this;
      var ready = document.readyState;
      if (ready === 'complete' || ready === 'loaded') {
        this.selectAndProcessScripts(done);
      } else {
        document.addEventListener('DOMContentLoaded', (function() {
          return $__356.selectAndProcessScripts(done);
        }), false);
      }
    }
  }, {});
  return {get WebPageTranscoder() {
      return WebPageTranscoder;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/CloneTreeTransformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/CloneTreeTransformer";
  var ParseTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/ParseTreeTransformer")).ParseTreeTransformer;
  var $__360 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")),
      BindingIdentifier = $__360.BindingIdentifier,
      BreakStatement = $__360.BreakStatement,
      ContinueStatement = $__360.ContinueStatement,
      DebuggerStatement = $__360.DebuggerStatement,
      EmptyStatement = $__360.EmptyStatement,
      ExportSpecifier = $__360.ExportSpecifier,
      ExportStar = $__360.ExportStar,
      IdentifierExpression = $__360.IdentifierExpression,
      ImportSpecifier = $__360.ImportSpecifier,
      LiteralExpression = $__360.LiteralExpression,
      ModuleSpecifier = $__360.ModuleSpecifier,
      PredefinedType = $__360.PredefinedType,
      PropertyNameShorthand = $__360.PropertyNameShorthand,
      TemplateLiteralPortion = $__360.TemplateLiteralPortion,
      RestParameter = $__360.RestParameter,
      SuperExpression = $__360.SuperExpression,
      ThisExpression = $__360.ThisExpression;
  var CloneTreeTransformer = function CloneTreeTransformer() {
    $traceurRuntime.defaultSuperCall(this, $CloneTreeTransformer.prototype, arguments);
  };
  var $CloneTreeTransformer = CloneTreeTransformer;
  ($traceurRuntime.createClass)(CloneTreeTransformer, {
    transformBindingIdentifier: function(tree) {
      return new BindingIdentifier(tree.location, tree.identifierToken);
    },
    transformBreakStatement: function(tree) {
      return new BreakStatement(tree.location, tree.name);
    },
    transformContinueStatement: function(tree) {
      return new ContinueStatement(tree.location, tree.name);
    },
    transformDebuggerStatement: function(tree) {
      return new DebuggerStatement(tree.location);
    },
    transformEmptyStatement: function(tree) {
      return new EmptyStatement(tree.location);
    },
    transformExportSpecifier: function(tree) {
      return new ExportSpecifier(tree.location, tree.lhs, tree.rhs);
    },
    transformExportStar: function(tree) {
      return new ExportStar(tree.location);
    },
    transformIdentifierExpression: function(tree) {
      return new IdentifierExpression(tree.location, tree.identifierToken);
    },
    transformImportSpecifier: function(tree) {
      return new ImportSpecifier(tree.location, tree.lhs, tree.rhs);
    },
    transformList: function(list) {
      if (!list) {
        return null;
      } else if (list.length == 0) {
        return [];
      } else {
        return $traceurRuntime.superCall(this, $CloneTreeTransformer.prototype, "transformList", [list]);
      }
    },
    transformLiteralExpression: function(tree) {
      return new LiteralExpression(tree.location, tree.literalToken);
    },
    transformModuleSpecifier: function(tree) {
      return new ModuleSpecifier(tree.location, tree.token);
    },
    transformPredefinedType: function(tree) {
      return new PredefinedType(tree.location, tree.typeToken);
    },
    transformPropertyNameShorthand: function(tree) {
      return new PropertyNameShorthand(tree.location, tree.name);
    },
    transformTemplateLiteralPortion: function(tree) {
      return new TemplateLiteralPortion(tree.location, tree.value);
    },
    transformSuperExpression: function(tree) {
      return new SuperExpression(tree.location);
    },
    transformThisExpression: function(tree) {
      return new ThisExpression(tree.location);
    }
  }, {}, ParseTreeTransformer);
  CloneTreeTransformer.cloneTree = function(tree) {
    return new CloneTreeTransformer().transformAny(tree);
  };
  return {get CloneTreeTransformer() {
      return CloneTreeTransformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/PureES6Transformer", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/PureES6Transformer";
  var AnnotationsTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/AnnotationsTransformer")).AnnotationsTransformer;
  var FreeVariableChecker = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/semantics/FreeVariableChecker")).FreeVariableChecker;
  var MultiTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/MultiTransformer")).MultiTransformer;
  var TypeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/TypeTransformer")).TypeTransformer;
  var UniqueIdentifierGenerator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/UniqueIdentifierGenerator")).UniqueIdentifierGenerator;
  var $__363 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")),
      options = $__363.options,
      transformOptions = $__363.transformOptions;
  var PureES6Transformer = function PureES6Transformer(reporter) {
    var idGenerator = arguments[1] !== (void 0) ? arguments[1] : new UniqueIdentifierGenerator();
    var $__361 = this;
    $traceurRuntime.superCall(this, $PureES6Transformer.prototype, "constructor", [reporter, options.validate]);
    var append = (function(transformer) {
      $__361.append((function(tree) {
        return new transformer(idGenerator, reporter).transformAny(tree);
      }));
    });
    append(AnnotationsTransformer);
    append(TypeTransformer);
    if (options.freeVariableChecker) {
      this.append((function(tree) {
        FreeVariableChecker.checkScript(reporter, tree);
        return tree;
      }));
    }
  };
  var $PureES6Transformer = PureES6Transformer;
  ($traceurRuntime.createClass)(PureES6Transformer, {}, {}, MultiTransformer);
  return {get PureES6Transformer() {
      return PureES6Transformer;
    }};
});
System.register("traceur@0.0.43/src/codegeneration/module/createModuleEvaluationStatement", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/codegeneration/module/createModuleEvaluationStatement";
  var $__364 = Object.freeze(Object.defineProperties(["System.get(", " +'')"], {raw: {value: Object.freeze(["System.get(", " +'')"])}}));
  var parseStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PlaceholderParser")).parseStatement;
  function createModuleEvaluationStatement(normalizedName) {
    return parseStatement($__364, normalizedName);
  }
  return {get createModuleEvaluationStatement() {
      return createModuleEvaluationStatement;
    }};
});
System.register("traceur@0.0.43/src/runtime/TraceurLoader", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/TraceurLoader";
  var InternalLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/InternalLoader")).InternalLoader;
  var Loader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/Loader")).Loader;
  var version = __moduleName.slice(0, __moduleName.indexOf('/'));
  var TraceurLoader = function TraceurLoader(loaderHooks) {
    if (loaderHooks.translateSynchronous) {
      loaderHooks.translate = function(load) {
        return new Promise((function(resolve, reject) {
          resolve(loaderHooks.translateSynchronous(load));
        }));
      };
    }
    $traceurRuntime.superCall(this, $TraceurLoader.prototype, "constructor", [loaderHooks]);
  };
  var $TraceurLoader = TraceurLoader;
  ($traceurRuntime.createClass)(TraceurLoader, {
    importAll: function(names) {
      var $__368 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
          referrerName = $__368.referrerName,
          address = $__368.address;
      var $__366 = this;
      return Promise.all(names.map((function(name) {
        return $__366.import(name, {
          referrerName: referrerName,
          address: address
        });
      })));
    },
    loadAsScript: function(name) {
      var $__368 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
          referrerName = $__368.referrerName,
          address = $__368.address;
      return this.internalLoader_.load(name, referrerName, address, 'script').then((function(codeUnit) {
        return codeUnit.result;
      }));
    },
    loadAsScriptAll: function(names) {
      var $__368 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
          referrerName = $__368.referrerName,
          address = $__368.address;
      var $__366 = this;
      return Promise.all(names.map((function(name) {
        return $__366.loadAsScript(name, {
          referrerName: referrerName,
          address: address
        });
      })));
    },
    script: function(source) {
      var $__368 = $traceurRuntime.assertObject(arguments[1] !== (void 0) ? arguments[1] : {}),
          name = $__368.name,
          referrerName = $__368.referrerName,
          address = $__368.address;
      return this.internalLoader_.script(source, name, referrerName, address);
    },
    semVerRegExp_: function() {
      return /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;
    },
    semverMap: function(normalizedName) {
      var slash = normalizedName.indexOf('/');
      var version = normalizedName.slice(0, slash);
      var at = version.indexOf('@');
      if (at !== -1) {
        var semver = version.slice(at + 1);
        var m = this.semVerRegExp_().exec(semver);
        if (m) {
          var major = m[1];
          var minor = m[2];
          var packageName = version.slice(0, at);
          var map = Object.create(null);
          map[packageName] = version;
          map[packageName + '@' + major] = version;
          map[packageName + '@' + major + '.' + minor] = version;
        }
      }
      return map;
    },
    get version() {
      return version;
    },
    get options() {
      return this.internalLoader_.options;
    },
    sourceMapInfo: function(normalizedName, type) {
      return this.internalLoader_.sourceMapInfo(normalizedName, type);
    },
    register: function(normalizedName, deps, factoryFunction) {
      $traceurRuntime.ModuleStore.register(normalizedName, deps, factoryFunction);
    },
    get baseURL() {
      return this.loaderHooks_.baseURL;
    },
    set baseURL(value) {
      this.loaderHooks_.baseURL = value;
    }
  }, {}, Loader);
  return {get TraceurLoader() {
      return TraceurLoader;
    }};
});
System.register("traceur@0.0.43/src/runtime/System", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/runtime/System";
  var globalThis = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/globalThis")).default;
  var ErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ErrorReporter")).ErrorReporter;
  var TraceurLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/TraceurLoader")).TraceurLoader;
  var LoaderHooks = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/LoaderHooks")).LoaderHooks;
  var options = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/options")).options;
  var webLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/webLoader")).webLoader;
  var url;
  var fileLoader;
  if (typeof window !== 'undefined' && window.location) {
    url = window.location.href;
    fileLoader = webLoader;
  }
  var loaderHooks = new LoaderHooks(new ErrorReporter(), url, fileLoader);
  var traceurLoader = new TraceurLoader(loaderHooks);
  if (typeof window !== 'undefined')
    window.System = traceurLoader;
  if (typeof global !== 'undefined')
    global.System = traceurLoader;
  ;
  traceurLoader.map = traceurLoader.semverMap(__moduleName);
  return {get System() {
      return traceurLoader;
    }};
});
System.register("traceur@0.0.43/src/util/TestErrorReporter", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/util/TestErrorReporter";
  var $__372 = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ErrorReporter")),
      ErrorReporter = $__372.ErrorReporter,
      format = $__372.format;
  var TestErrorReporter = function TestErrorReporter() {
    var pathRe = arguments[0];
    this.errors = [];
    this.pathRe = pathRe;
  };
  ($traceurRuntime.createClass)(TestErrorReporter, {
    reportMessageInternal: function(location, message) {
      this.errors.push(format(location, message));
    },
    hasMatchingError: function(expected) {
      var $__370 = this;
      var m;
      if (!this.pathRe || !(m = this.pathRe.exec(expected)))
        return this.errors.some((function(error) {
          return error.indexOf(expected) !== -1;
        }));
      var expectedPath = m[1];
      var expectedNonPath = expected.replace(expectedPath, '<PATH>');
      return this.errors.some((function(error) {
        var m = $__370.pathRe.exec(error);
        if (!m)
          return false;
        var actualPath = m[1];
        var actualNonPath = error.replace(actualPath, '<PATH>');
        if (actualNonPath.indexOf(expectedNonPath) === -1)
          return false;
        actualPath = actualPath.replace(/\\/g, '/');
        return actualPath.indexOf(expectedPath) !== -1;
      }));
    }
  }, {}, ErrorReporter);
  return {get TestErrorReporter() {
      return TestErrorReporter;
    }};
});
System.register("traceur@0.0.43/src/traceur", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/traceur";
  System.get("traceur@0.0.43/src/runtime/System");
  var $___64_traceur_47_src_47_runtime_47_ModuleStore__ = System.get("@traceur/src/runtime/ModuleStore");
  ;
  var $__traceur_64_0_46_0_46_43_47_src_47_WebPageTranscoder__ = System.get("traceur@0.0.43/src/WebPageTranscoder");
  var $__traceur_64_0_46_0_46_43_47_src_47_options__ = System.get("traceur@0.0.43/src/options");
  var ErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/ErrorReporter")).ErrorReporter;
  var TestErrorReporter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/util/TestErrorReporter")).TestErrorReporter;
  var util = {
    ErrorReporter: ErrorReporter,
    TestErrorReporter: TestErrorReporter
  };
  var Parser = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Parser")).Parser;
  var Scanner = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/Scanner")).Scanner;
  var Script = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/trees/ParseTrees")).Script;
  var SourceFile = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/syntax/SourceFile")).SourceFile;
  var syntax = {
    Parser: Parser,
    Scanner: Scanner,
    SourceFile: SourceFile,
    trees: {Script: Script}
  };
  var ParseTreeMapWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/ParseTreeMapWriter")).ParseTreeMapWriter;
  var ParseTreeWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/ParseTreeWriter")).ParseTreeWriter;
  var SourceMapConsumer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/SourceMapIntegration")).SourceMapConsumer;
  var SourceMapGenerator = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/SourceMapIntegration")).SourceMapGenerator;
  var TreeWriter = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/outputgeneration/TreeWriter")).TreeWriter;
  var outputgeneration = {
    ParseTreeMapWriter: ParseTreeMapWriter,
    ParseTreeWriter: ParseTreeWriter,
    SourceMapConsumer: SourceMapConsumer,
    SourceMapGenerator: SourceMapGenerator,
    TreeWriter: TreeWriter
  };
  var AttachModuleNameTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/AttachModuleNameTransformer")).AttachModuleNameTransformer;
  var CloneTreeTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/CloneTreeTransformer")).CloneTreeTransformer;
  var FromOptionsTransformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/FromOptionsTransformer")).FromOptionsTransformer;
  var PureES6Transformer = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/PureES6Transformer")).PureES6Transformer;
  var createModuleEvaluationStatement = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/codegeneration/module/createModuleEvaluationStatement")).createModuleEvaluationStatement;
  var codegeneration = {
    CloneTreeTransformer: CloneTreeTransformer,
    FromOptionsTransformer: FromOptionsTransformer,
    PureES6Transformer: PureES6Transformer,
    module: {
      AttachModuleNameTransformer: AttachModuleNameTransformer,
      createModuleEvaluationStatement: createModuleEvaluationStatement
    }
  };
  var Loader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/Loader")).Loader;
  var LoaderHooks = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/LoaderHooks")).LoaderHooks;
  var InterceptOutputLoaderHooks = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/InterceptOutputLoaderHooks")).InterceptOutputLoaderHooks;
  var TraceurLoader = $traceurRuntime.assertObject(System.get("traceur@0.0.43/src/runtime/TraceurLoader")).TraceurLoader;
  var runtime = {
    InterceptOutputLoaderHooks: InterceptOutputLoaderHooks,
    Loader: Loader,
    LoaderHooks: LoaderHooks,
    TraceurLoader: TraceurLoader
  };
  return {
    get ModuleStore() {
      return $___64_traceur_47_src_47_runtime_47_ModuleStore__.ModuleStore;
    },
    get System() {
      return System;
    },
    get WebPageTranscoder() {
      return $__traceur_64_0_46_0_46_43_47_src_47_WebPageTranscoder__.WebPageTranscoder;
    },
    get options() {
      return $__traceur_64_0_46_0_46_43_47_src_47_options__.options;
    },
    get util() {
      return util;
    },
    get syntax() {
      return syntax;
    },
    get outputgeneration() {
      return outputgeneration;
    },
    get codegeneration() {
      return codegeneration;
    },
    get runtime() {
      return runtime;
    }
  };
});
System.register("traceur@0.0.43/src/traceur-import", [], function() {
  "use strict";
  var __moduleName = "traceur@0.0.43/src/traceur-import";
  var traceur = System.get("traceur@0.0.43/src/traceur");
  this.traceur = traceur;
  $traceurRuntime.ModuleStore.set('traceur@', traceur);
  return {};
});
System.get("traceur@0.0.43/src/traceur-import" + '');
