(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
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
        return this.indexOf(s) !== - 1;
      }),
      toArray: method(function() {
        return this.split('');
      }),
      codePointAt: method(function(position) {
        var string = String(this);
        var size = string.length;
        var index = position ? Number(position): 0;
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
      })
    });
    $defineProperties(String, {
      raw: method(function(callsite) {
        var raw = callsite.raw;
        var len = raw.length >>> 0;
        if (len === 0) return '';
        var s = '';
        var i = 0;
        while (true) {
          s += raw[i];
          if (i + 1 === len) return s;
          s += arguments[++i];
        }
      }),
      fromCodePoint: method(function() {
        var codeUnits = [];
        var floor = Math.floor;
        var highSurrogate;
        var lowSurrogate;
        var index = - 1;
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
      })
    });
  }
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var nameRe = /^__\$(?:\d+)\$(?:\d+)\$__$/;
  var internalStringValueName = newUniqueString();
  function Name(string) {
    if (!string) string = newUniqueString();
    $defineProperty(this, internalStringValueName, {value: newUniqueString()});
    function toString() {
      return string;
    }
    $freeze(toString);
    $freeze(toString.prototype);
    var toStringDescr = method(toString);
    $defineProperty(this, 'toString', toStringDescr);
    this.public = $freeze($create(null, {toString: method($freeze(function toString() {
        return string;
      }))}));
    $freeze(this.public.toString.prototype);
    $freeze(this);
  }
  ;
  $freeze(Name);
  $freeze(Name.prototype);
  function assertName(val) {
    if (!NameModule.isName(val)) throw new TypeError(val + ' is not a Name');
    return val;
  }
  var elementDeleteName = new Name();
  var elementGetName = new Name();
  var elementSetName = new Name();
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
  function getOwnPropertyNames(object) {
    return filter($getOwnPropertyNames(object), function(str) {
      return !nameRe.test(str);
    });
  }
  function hasOwnProperty(name) {
    if (NameModule.isName(name) || nameRe.test(name)) return false;
    return $hasOwnProperty.call(this, name);
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function elementDelete(object, name) {
    if (getOption('trapMemberLookup') && hasPrivateNameProperty(object, elementDeleteName)) {
      return getProperty(object, elementDeleteName).call(object, name);
    }
    return deleteProperty(object, name);
  }
  function elementGet(object, name) {
    if (getOption('trapMemberLookup') && hasPrivateNameProperty(object, elementGetName)) {
      return getProperty(object, elementGetName).call(object, name);
    }
    return getProperty(object, name);
  }
  function elementHas(object, name) {
    return has(object, name);
  }
  function elementSet(object, name, value) {
    if (getOption('trapMemberLookup') && hasPrivateNameProperty(object, elementSetName)) {
      getProperty(object, elementSetName).call(object, name, value);
    } else {
      setProperty(object, name, value);
    }
    return value;
  }
  function assertNotName(s) {
    if (nameRe.test(s)) throw Error('Invalid access to private name');
  }
  function deleteProperty(object, name) {
    if (NameModule.isName(name)) return delete object[name[internalStringValueName]];
    if (nameRe.test(name)) return true;
    return delete object[name];
  }
  function getProperty(object, name) {
    if (NameModule.isName(name)) return object[name[internalStringValueName]];
    if (nameRe.test(name)) return undefined;
    return object[name];
  }
  function hasPrivateNameProperty(object, name) {
    return name[internalStringValueName]in Object(object);
  }
  function has(object, name) {
    if (NameModule.isName(name) || nameRe.test(name)) return false;
    return name in Object(object);
  }
  function setProperty(object, name, value) {
    if (NameModule.isName(name)) {
      var descriptor = $getPropertyDescriptor(object, [name[internalStringValueName]]);
      if (descriptor) object[name[internalStringValueName]] = value; else $defineProperty(object, name[internalStringValueName], nonEnum(value));
    } else {
      assertNotName(name);
      object[name] = value;
    }
  }
  function defineProperty(object, name, descriptor) {
    if (NameModule.isName(name)) {
      if (descriptor.enumerable) {
        descriptor = Object.create(descriptor, {enumerable: {value: false}});
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
      if (result) return result;
      obj = $getPrototypeOf(obj);
    }
    return undefined;
  }
  function getPropertyDescriptor(obj, name) {
    if (NameModule.isName(name)) return undefined;
    assertNotName(name);
    return $getPropertyDescriptor(obj, name);
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'deleteProperty', method(deleteProperty));
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getProperty', method(getProperty));
    $defineProperty(Object, 'getPropertyDescriptor', method(getPropertyDescriptor));
    $defineProperty(Object, 'has', method(has));
    $defineProperty(Object, 'setProperty', method(setProperty));
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    function is(left, right) {
      if (left === right) return left !== 0 || 1 / left === 1 / right;
      return left !== left && right !== right;
    }
    $defineProperty(Object, 'is', method(is));
    function assign(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        target[props[p]] = source[props[p]];
      }
      return target;
    }
    $defineProperty(Object, 'assign', method(assign));
    function mixin(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          descriptor,
          length = props.length;
      for (p = 0; p < length; p++) {
        descriptor = $getOwnPropertyDescriptor(source, props[p]);
        $defineProperty(target, props[p], descriptor);
      }
      return target;
    }
    $defineProperty(Object, 'mixin', method(mixin));
  }
  var iteratorName = new Name('iterator');
  var IterModule = {get iterator() {
      return getOption('privateNames') ? iteratorName: '@@iterator';
    }};
  function getIterator(collection) {
    return getProperty(collection, IterModule.iterator).call(collection);
  }
  function returnThis() {
    return this;
  }
  function addIterator(object) {
    setProperty(object, IterModule.iterator, returnThis);
    return object;
  }
  function polyfillArray(Array) {
    defineProperty(Array.prototype, IterModule.iterator, method(function() {
      var index = 0;
      var array = this;
      return {next: function() {
          if (index < array.length) {
            return {
              value: array[index++],
              done: false
            };
          }
          return {
            value: undefined,
            done: true
          };
        }};
    }));
  }
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
            if (current.errback) currentResult = current.errback.call(undefined, self.result_[0]);
          } else {
            if (current.callback) currentResult = current.callback.call(undefined, self.result_[0]);
          }
          current.deferred.callback(currentResult);
        } catch (err) {
          current.deferred.errback(err);
        }
      } catch (unused) {}
    }
  }
  function fire(self, value, isError) {
    if (self.fired_) throw new Error('already fired');
    self.fired_ = true;
    self.result_ = [value, isError];
    notify(self);
  }
  Deferred.prototype = {
    constructor: Deferred,
    fired_: false,
    result_: undefined,
    createPromise: function() {
      return {
        then: this.then.bind(this),
        cancel: this.cancel.bind(this)
      };
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
      if (this.fired_) notify(this);
      return result.createPromise();
    },
    cancel: function() {
      if (this.fired_) throw new Error('already finished');
      var result;
      if (this.canceller_) {
        result = this.canceller_(this);
        if (!result instanceof Error) result = new Error(result);
      } else {
        result = new Error('cancelled');
      }
      if (!this.fired_) {
        this.result_ = [result, true];
        notify(this);
      }
    }
  };
  function PendingModule(func, self) {
    this.func = func;
    this.self = self;
  }
  PendingModule.prototype = {toModule: function() {
      return this.func.call(this.self);
    }};
  var modules = {
    '@name': NameModule,
    '@iter': IterModule,
    '@traceur/module': {
      PendingModule: PendingModule,
      registerModule: function(url, func, self) {
        modules[url] = new PendingModule(func, self);
      }
    }
  };
  var System = {
    get: function(name) {
      var module = modules[name];
      if (module instanceof PendingModule) return modules[name] = module.toModule();
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
    global.Deferred = Deferred;
  }
  setupGlobals(global);
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
    has: has
  };
  global.$traceurRuntime = runtime;
})(typeof global !== 'undefined' ? global: this);
System.set('@traceur/url', (function() {
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
    if (path === '/') return '/';
    var leadingSlash = path[0] === '/' ? '/': '';
    var trailingSlash = path.slice(- 1) === '/' ? '/': '';
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
          if (out.length) out.pop(); else up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0) out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH];
    path = removeDotSegments(path.replace(/\/\//.g, '/'));
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function isStandardModuleUrl(s) {
    return s[0] === '@';
  }
  function resolveUrl(base, url) {
    if (isStandardModuleUrl(url)) return url;
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
  return {
    canonicalizeUrl: canonicalizeUrl,
    isStandardModuleUrl: isStandardModuleUrl,
    removeDotSegments: removeDotSegments,
    resolveUrl: resolveUrl
  };
})());
System.set('@traceur/module', (function(global) {
  'use strict';
  var PendingModule = System.get('@traceur/module').PendingModule;
  var $__0 = System.get('@traceur/url'),
      resolveUrl = $__0.resolveUrl,
      isStandardModuleUrl = $__0.isStandardModuleUrl;
  var modules = Object.create(null);
  var baseURL;
  if (global.location && global.location.href) baseURL = resolveUrl(global.location.href, './'); else baseURL = '';
  function registerModule(url, func, self) {
    url = System.normalResolve(url);
    modules[url] = new PendingModule(func, self);
  }
  Object.defineProperty(System, 'baseURL', {
    get: function() {
      return baseURL;
    },
    set: function(v) {
      baseURL = String(v);
    },
    enumerable: true,
    configurable: true
  });
  System.normalize = function(requestedModuleName, options) {
    var importingModuleName = options && options.referer && options.referer.name;
    importingModuleName = importingModuleName || baseURL;
    if (importingModuleName && requestedModuleName) return resolveUrl(importingModuleName, requestedModuleName);
    return requestedModuleName;
  };
  System.resolve = function(normalizedModuleName) {
    if (isStandardModuleUrl(normalizedModuleName)) return normalizedModuleName;
    var asJS = normalizedModuleName + '.js';
    if (/\.js$/.test(normalizedModuleName)) asJS = normalizedModuleName;
    if (baseURL) return resolveUrl(baseURL, asJS);
    return asJS;
  };
  var $get = System.get;
  var $set = System.set;
  System.normalResolve = function(name, importingModuleName) {
    if (/@.*\.js/.test(name)) throw new Error(("System.normalResolve illegal standard module name " + name));
    var options = {referer: {name: importingModuleName || baseURL}};
    return System.resolve(System.normalize(name, options));
  };
  System.get = function(name) {
    if (!name) return;
    if (isStandardModuleUrl(name)) return $get(name);
    var url = System.normalResolve(name);
    var module = modules[url];
    if (module instanceof PendingModule) return modules[url] = module.toModule();
    return module || null;
  };
  System.set = function(name, object) {
    if (!name) return;
    if (isStandardModuleUrl(name)) {
      $set(name, object);
    } else {
      var url = System.normalResolve(name);
      if (url) modules[url] = object;
    }
  };
  return {registerModule: registerModule};
})(this));
var $__Object = Object,
    $__ObjectPrototype = $__Object.prototype,
    $__Function = Function,
    $__FunctionPrototype = $__Function.prototype,
    $__TypeError = TypeError,
    $__getProtoParent = function(superClass) {
      if (typeof superClass === 'function') {
        var prototype = superClass.prototype;
        if (Object(prototype) === prototype || prototype === null) return prototype;
      }
      if (superClass === null) return null;
      throw new $__TypeError();
    },
    $__defineProperty = $__Object.defineProperty,
    $__getOwnPropertyNames = $__Object.getOwnPropertyNames,
    $__getOwnPropertyDescriptor = $__Object.getOwnPropertyDescriptor,
    $__getDescriptors = function(object) {
      var descriptors = {},
          names = $__getOwnPropertyNames(object);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        descriptors[name] = $__getOwnPropertyDescriptor(object, name);
      }
      return descriptors;
    },
    $__defineProperties = $__Object.defineProperties,
    $__class = function(ctor, object, staticObject, superClass, protoParent) {
      $__defineProperty(object, 'constructor', {
        value: ctor,
        configurable: true,
        writable: true,
        enumerable: false
      });
      if (arguments.length > 3) {
        if (typeof superClass === 'function') ctor.__proto__ = superClass;
        ctor.prototype = Object.create(protoParent || $__getProtoParent(superClass), $__getDescriptors(object));
      } else {
        ctor.prototype = object;
      }
      return $__defineProperties(ctor, $__getDescriptors(staticObject));
    };
System.get('@traceur/module').registerModule("../src/semantics/symbols/Symbol.js", function() {
  "use strict";
  function Symbol(type, tree) {
    this.type = type;
    this.tree = tree;
  }
  ($__class)(Symbol, {}, {});
  return Object.preventExtensions(Object.create(null, {Symbol: {
      get: function() {
        return Symbol;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/symbols/SymbolType.js", function() {
  "use strict";
  var EXPORT = 'EXPORT';
  var MODULE = 'MODULE';
  return Object.preventExtensions(Object.create(null, {
    EXPORT: {
      get: function() {
        return EXPORT;
      },
      enumerable: true
    },
    MODULE: {
      get: function() {
        return MODULE;
      },
      enumerable: true
    }
  }));
}, this);
var $__getPrototypeOf = $__Object.getPrototypeOf,
    $__getPropertyDescriptor = function(object, name) {
      while (object !== null) {
        var result = $__getOwnPropertyDescriptor(object, name);
        if (result) return result;
        object = $__getPrototypeOf(object);
      }
      return undefined;
    },
    $__superDescriptor = function(proto, name) {
      if (!proto) throw new $__TypeError('super is null');
      return $__getPropertyDescriptor(proto, name);
    },
    $__superCall = function(self, proto, name, args) {
      var descriptor = $__superDescriptor(proto, name);
      if (descriptor) {
        if ('value'in descriptor) return descriptor.value.apply(self, args);
        if (descriptor.get) return descriptor.get.call(self).apply(self, args);
      }
      throw new $__TypeError("Object has no method '" + name + "'.");
    };
System.get('@traceur/module').registerModule("../src/semantics/symbols/ExportSymbol.js", function() {
  "use strict";
  var Symbol = System.get("../src/semantics/symbols/Symbol.js").Symbol;
  var EXPORT = System.get("../src/semantics/symbols/SymbolType.js").EXPORT;
  function ExportSymbol(name, tree, relatedTree) {
    $__superCall(this, $__ExportSymbol__proto, "constructor", [EXPORT, tree]);
    this.name = name;
    this.relatedTree = relatedTree;
  }
  var $__ExportSymbol__super = Symbol;
  var $__ExportSymbol__proto = $__getProtoParent($__ExportSymbol__super);
  ($__class)(ExportSymbol, {}, {}, $__ExportSymbol__super, $__ExportSymbol__proto);
  return Object.preventExtensions(Object.create(null, {ExportSymbol: {
      get: function() {
        return ExportSymbol;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/options.js", function() {
  "use strict";
  var parseOptions = Object.create(null);
  var transformOptions = Object.create(null);
  var defaultValues = Object.create(null);
  var experimentalOptions = Object.create(null);
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
    }
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
      case false:
        return false;
      case 'parse':
        return 'parse';
      default:
        return true;
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
  function optionCallback(name, value) {
    setOption(name, value);
  }
  function addOptions(flags) {
    Object.keys(options).forEach(function(name) {
      var dashedName = toDashCase(name);
      if ((name in parseOptions) && (name in transformOptions)) flags.option('--' + dashedName + ' [true|false|parse]', descriptions[name]); else flags.option('--' + dashedName, descriptions[name]);
      flags.on(dashedName, optionCallback.bind(null, dashedName));
    });
  }
  function filterOption(dashedName) {
    var name = toCamelCase(dashedName);
    return name === 'experimental' || !(name in options);
  }
  Object.defineProperties(options, {
    parse: {value: parseOptions},
    transform: {value: transformOptions},
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
    if (m) setOption(m[1], m[2]);
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
    if (kind === EXPERIMENTAL) experimentalOptions[name] = true;
    Object.defineProperty(options, name, {
      get: function() {
        if (parseOptions[name] === transformOptions[name]) {
          return parseOptions[name];
        }
        return 'parse';
      },
      set: function(v) {
        if (v === 'parse') {
          parseOptions[name] = true;
          transformOptions[name] = false;
        } else {
          parseOptions[name] = transformOptions[name] = Boolean(v);
        }
      },
      enumerable: true,
      configurable: true
    });
    var defaultValue = kind === ON_BY_DEFAULT;
    defaultValues[name] = defaultValue;
    parseOptions[name] = defaultValue;
    transformOptions[name] = defaultValue;
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
  addFeatureOption('blockBinding', EXPERIMENTAL);
  addFeatureOption('privateNames', EXPERIMENTAL);
  addFeatureOption('cascadeExpression', EXPERIMENTAL);
  addFeatureOption('trapMemberLookup', EXPERIMENTAL);
  addFeatureOption('deferredFunctions', EXPERIMENTAL);
  addFeatureOption('propertyOptionalComma', EXPERIMENTAL);
  addFeatureOption('types', EXPERIMENTAL);
  addBoolOption('debug');
  addBoolOption('sourceMaps');
  addBoolOption('freeVariableChecker');
  addBoolOption('validate');
  addBoolOption('strictSemicolons');
  addBoolOption('unstarredGenerators');
  addBoolOption('ignoreNolint');
  return Object.preventExtensions(Object.create(null, {
    parseOptions: {
      get: function() {
        return parseOptions;
      },
      enumerable: true
    },
    transformOptions: {
      get: function() {
        return transformOptions;
      },
      enumerable: true
    },
    options: {
      get: function() {
        return options;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/util/assert.js", function() {
  "use strict";
  var options = System.get("../src/options.js").options;
  function assert(b) {
    if (!b && options.debug) throw Error('Assertion failed');
  }
  return Object.preventExtensions(Object.create(null, {assert: {
      get: function() {
        return assert;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/ParseTreeVisitor.js", function() {
  "use strict";
  function ParseTreeVisitor() {}
  ($__class)(ParseTreeVisitor, {
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
      this.visitAny(tree.formalParameters);
      this.visitAny(tree.functionBody);
    },
    visitAwaitStatement: function(tree) {
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
    visitCascadeExpression: function(tree) {
      this.visitAny(tree.operand);
      this.visitList(tree.expressions);
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
    },
    visitClassExpression: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.superClass);
      this.visitList(tree.elements);
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
    visitFormalParameterList: function(tree) {
      this.visitList(tree.parameters);
    },
    visitFunctionBody: function(tree) {
      this.visitList(tree.statements);
    },
    visitFunctionDeclaration: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.functionBody);
    },
    visitFunctionExpression: function(tree) {
      this.visitAny(tree.name);
      this.visitAny(tree.formalParameterList);
      this.visitAny(tree.functionBody);
    },
    visitGeneratorComprehension: function(tree) {
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
    },
    visitGetAccessor: function(tree) {
      this.visitAny(tree.name);
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
      this.visitAny(tree.formalParameterList);
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
      this.visitAny(tree.parameter);
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
  return Object.preventExtensions(Object.create(null, {ParseTreeVisitor: {
      get: function() {
        return ParseTreeVisitor;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/JSON.js", function() {
  "use strict";
  function transform(v) {
    var replacer = arguments[1] !== (void 0) ? arguments[1]: (function(k, v) {
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
        rv[i] = tv === undefined ? null: tv;
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
  return Object.preventExtensions(Object.create(null, {transform: {
      get: function() {
        return transform;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/TokenType.js", function() {
  "use strict";
  var AMPERSAND = '&';
  var AMPERSAND_EQUAL = '&=';
  var AND = '&&';
  var ARROW = '=>';
  var AWAIT = 'await';
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
  var PERIOD_OPEN_CURLY = '.{';
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
  return Object.preventExtensions(Object.create(null, {
    AMPERSAND: {
      get: function() {
        return AMPERSAND;
      },
      enumerable: true
    },
    AMPERSAND_EQUAL: {
      get: function() {
        return AMPERSAND_EQUAL;
      },
      enumerable: true
    },
    AND: {
      get: function() {
        return AND;
      },
      enumerable: true
    },
    ARROW: {
      get: function() {
        return ARROW;
      },
      enumerable: true
    },
    AWAIT: {
      get: function() {
        return AWAIT;
      },
      enumerable: true
    },
    BACK_QUOTE: {
      get: function() {
        return BACK_QUOTE;
      },
      enumerable: true
    },
    BANG: {
      get: function() {
        return BANG;
      },
      enumerable: true
    },
    BAR: {
      get: function() {
        return BAR;
      },
      enumerable: true
    },
    BAR_EQUAL: {
      get: function() {
        return BAR_EQUAL;
      },
      enumerable: true
    },
    BREAK: {
      get: function() {
        return BREAK;
      },
      enumerable: true
    },
    CARET: {
      get: function() {
        return CARET;
      },
      enumerable: true
    },
    CARET_EQUAL: {
      get: function() {
        return CARET_EQUAL;
      },
      enumerable: true
    },
    CASE: {
      get: function() {
        return CASE;
      },
      enumerable: true
    },
    CATCH: {
      get: function() {
        return CATCH;
      },
      enumerable: true
    },
    CLASS: {
      get: function() {
        return CLASS;
      },
      enumerable: true
    },
    CLOSE_ANGLE: {
      get: function() {
        return CLOSE_ANGLE;
      },
      enumerable: true
    },
    CLOSE_CURLY: {
      get: function() {
        return CLOSE_CURLY;
      },
      enumerable: true
    },
    CLOSE_PAREN: {
      get: function() {
        return CLOSE_PAREN;
      },
      enumerable: true
    },
    CLOSE_SQUARE: {
      get: function() {
        return CLOSE_SQUARE;
      },
      enumerable: true
    },
    COLON: {
      get: function() {
        return COLON;
      },
      enumerable: true
    },
    COMMA: {
      get: function() {
        return COMMA;
      },
      enumerable: true
    },
    CONST: {
      get: function() {
        return CONST;
      },
      enumerable: true
    },
    CONTINUE: {
      get: function() {
        return CONTINUE;
      },
      enumerable: true
    },
    DEBUGGER: {
      get: function() {
        return DEBUGGER;
      },
      enumerable: true
    },
    DEFAULT: {
      get: function() {
        return DEFAULT;
      },
      enumerable: true
    },
    DELETE: {
      get: function() {
        return DELETE;
      },
      enumerable: true
    },
    DO: {
      get: function() {
        return DO;
      },
      enumerable: true
    },
    DOT_DOT_DOT: {
      get: function() {
        return DOT_DOT_DOT;
      },
      enumerable: true
    },
    ELSE: {
      get: function() {
        return ELSE;
      },
      enumerable: true
    },
    END_OF_FILE: {
      get: function() {
        return END_OF_FILE;
      },
      enumerable: true
    },
    ENUM: {
      get: function() {
        return ENUM;
      },
      enumerable: true
    },
    EQUAL: {
      get: function() {
        return EQUAL;
      },
      enumerable: true
    },
    EQUAL_EQUAL: {
      get: function() {
        return EQUAL_EQUAL;
      },
      enumerable: true
    },
    EQUAL_EQUAL_EQUAL: {
      get: function() {
        return EQUAL_EQUAL_EQUAL;
      },
      enumerable: true
    },
    ERROR: {
      get: function() {
        return ERROR;
      },
      enumerable: true
    },
    EXPORT: {
      get: function() {
        return EXPORT;
      },
      enumerable: true
    },
    EXTENDS: {
      get: function() {
        return EXTENDS;
      },
      enumerable: true
    },
    FALSE: {
      get: function() {
        return FALSE;
      },
      enumerable: true
    },
    FINALLY: {
      get: function() {
        return FINALLY;
      },
      enumerable: true
    },
    FOR: {
      get: function() {
        return FOR;
      },
      enumerable: true
    },
    FUNCTION: {
      get: function() {
        return FUNCTION;
      },
      enumerable: true
    },
    GREATER_EQUAL: {
      get: function() {
        return GREATER_EQUAL;
      },
      enumerable: true
    },
    IDENTIFIER: {
      get: function() {
        return IDENTIFIER;
      },
      enumerable: true
    },
    IF: {
      get: function() {
        return IF;
      },
      enumerable: true
    },
    IMPLEMENTS: {
      get: function() {
        return IMPLEMENTS;
      },
      enumerable: true
    },
    IMPORT: {
      get: function() {
        return IMPORT;
      },
      enumerable: true
    },
    IN: {
      get: function() {
        return IN;
      },
      enumerable: true
    },
    INSTANCEOF: {
      get: function() {
        return INSTANCEOF;
      },
      enumerable: true
    },
    INTERFACE: {
      get: function() {
        return INTERFACE;
      },
      enumerable: true
    },
    LEFT_SHIFT: {
      get: function() {
        return LEFT_SHIFT;
      },
      enumerable: true
    },
    LEFT_SHIFT_EQUAL: {
      get: function() {
        return LEFT_SHIFT_EQUAL;
      },
      enumerable: true
    },
    LESS_EQUAL: {
      get: function() {
        return LESS_EQUAL;
      },
      enumerable: true
    },
    LET: {
      get: function() {
        return LET;
      },
      enumerable: true
    },
    MINUS: {
      get: function() {
        return MINUS;
      },
      enumerable: true
    },
    MINUS_EQUAL: {
      get: function() {
        return MINUS_EQUAL;
      },
      enumerable: true
    },
    MINUS_MINUS: {
      get: function() {
        return MINUS_MINUS;
      },
      enumerable: true
    },
    NEW: {
      get: function() {
        return NEW;
      },
      enumerable: true
    },
    NO_SUBSTITUTION_TEMPLATE: {
      get: function() {
        return NO_SUBSTITUTION_TEMPLATE;
      },
      enumerable: true
    },
    NOT_EQUAL: {
      get: function() {
        return NOT_EQUAL;
      },
      enumerable: true
    },
    NOT_EQUAL_EQUAL: {
      get: function() {
        return NOT_EQUAL_EQUAL;
      },
      enumerable: true
    },
    NULL: {
      get: function() {
        return NULL;
      },
      enumerable: true
    },
    NUMBER: {
      get: function() {
        return NUMBER;
      },
      enumerable: true
    },
    OPEN_ANGLE: {
      get: function() {
        return OPEN_ANGLE;
      },
      enumerable: true
    },
    OPEN_CURLY: {
      get: function() {
        return OPEN_CURLY;
      },
      enumerable: true
    },
    OPEN_PAREN: {
      get: function() {
        return OPEN_PAREN;
      },
      enumerable: true
    },
    OPEN_SQUARE: {
      get: function() {
        return OPEN_SQUARE;
      },
      enumerable: true
    },
    OR: {
      get: function() {
        return OR;
      },
      enumerable: true
    },
    PACKAGE: {
      get: function() {
        return PACKAGE;
      },
      enumerable: true
    },
    PERCENT: {
      get: function() {
        return PERCENT;
      },
      enumerable: true
    },
    PERCENT_EQUAL: {
      get: function() {
        return PERCENT_EQUAL;
      },
      enumerable: true
    },
    PERIOD: {
      get: function() {
        return PERIOD;
      },
      enumerable: true
    },
    PERIOD_OPEN_CURLY: {
      get: function() {
        return PERIOD_OPEN_CURLY;
      },
      enumerable: true
    },
    PLUS: {
      get: function() {
        return PLUS;
      },
      enumerable: true
    },
    PLUS_EQUAL: {
      get: function() {
        return PLUS_EQUAL;
      },
      enumerable: true
    },
    PLUS_PLUS: {
      get: function() {
        return PLUS_PLUS;
      },
      enumerable: true
    },
    PRIVATE: {
      get: function() {
        return PRIVATE;
      },
      enumerable: true
    },
    PROTECTED: {
      get: function() {
        return PROTECTED;
      },
      enumerable: true
    },
    PUBLIC: {
      get: function() {
        return PUBLIC;
      },
      enumerable: true
    },
    QUESTION: {
      get: function() {
        return QUESTION;
      },
      enumerable: true
    },
    REGULAR_EXPRESSION: {
      get: function() {
        return REGULAR_EXPRESSION;
      },
      enumerable: true
    },
    RETURN: {
      get: function() {
        return RETURN;
      },
      enumerable: true
    },
    RIGHT_SHIFT: {
      get: function() {
        return RIGHT_SHIFT;
      },
      enumerable: true
    },
    RIGHT_SHIFT_EQUAL: {
      get: function() {
        return RIGHT_SHIFT_EQUAL;
      },
      enumerable: true
    },
    SEMI_COLON: {
      get: function() {
        return SEMI_COLON;
      },
      enumerable: true
    },
    SLASH: {
      get: function() {
        return SLASH;
      },
      enumerable: true
    },
    SLASH_EQUAL: {
      get: function() {
        return SLASH_EQUAL;
      },
      enumerable: true
    },
    STAR: {
      get: function() {
        return STAR;
      },
      enumerable: true
    },
    STAR_EQUAL: {
      get: function() {
        return STAR_EQUAL;
      },
      enumerable: true
    },
    STATIC: {
      get: function() {
        return STATIC;
      },
      enumerable: true
    },
    STRING: {
      get: function() {
        return STRING;
      },
      enumerable: true
    },
    SUPER: {
      get: function() {
        return SUPER;
      },
      enumerable: true
    },
    SWITCH: {
      get: function() {
        return SWITCH;
      },
      enumerable: true
    },
    TEMPLATE_HEAD: {
      get: function() {
        return TEMPLATE_HEAD;
      },
      enumerable: true
    },
    TEMPLATE_MIDDLE: {
      get: function() {
        return TEMPLATE_MIDDLE;
      },
      enumerable: true
    },
    TEMPLATE_TAIL: {
      get: function() {
        return TEMPLATE_TAIL;
      },
      enumerable: true
    },
    THIS: {
      get: function() {
        return THIS;
      },
      enumerable: true
    },
    THROW: {
      get: function() {
        return THROW;
      },
      enumerable: true
    },
    TILDE: {
      get: function() {
        return TILDE;
      },
      enumerable: true
    },
    TRUE: {
      get: function() {
        return TRUE;
      },
      enumerable: true
    },
    TRY: {
      get: function() {
        return TRY;
      },
      enumerable: true
    },
    TYPEOF: {
      get: function() {
        return TYPEOF;
      },
      enumerable: true
    },
    UNSIGNED_RIGHT_SHIFT: {
      get: function() {
        return UNSIGNED_RIGHT_SHIFT;
      },
      enumerable: true
    },
    UNSIGNED_RIGHT_SHIFT_EQUAL: {
      get: function() {
        return UNSIGNED_RIGHT_SHIFT_EQUAL;
      },
      enumerable: true
    },
    VAR: {
      get: function() {
        return VAR;
      },
      enumerable: true
    },
    VOID: {
      get: function() {
        return VOID;
      },
      enumerable: true
    },
    WHILE: {
      get: function() {
        return WHILE;
      },
      enumerable: true
    },
    WITH: {
      get: function() {
        return WITH;
      },
      enumerable: true
    },
    YIELD: {
      get: function() {
        return YIELD;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/Token.js", function() {
  "use strict";
  var $__7 = System.get("../src/syntax/TokenType.js"),
      AMPERSAND_EQUAL = $__7.AMPERSAND_EQUAL,
      BAR_EQUAL = $__7.BAR_EQUAL,
      CARET_EQUAL = $__7.CARET_EQUAL,
      EQUAL = $__7.EQUAL,
      LEFT_SHIFT_EQUAL = $__7.LEFT_SHIFT_EQUAL,
      MINUS_EQUAL = $__7.MINUS_EQUAL,
      PERCENT_EQUAL = $__7.PERCENT_EQUAL,
      PLUS_EQUAL = $__7.PLUS_EQUAL,
      RIGHT_SHIFT_EQUAL = $__7.RIGHT_SHIFT_EQUAL,
      SLASH_EQUAL = $__7.SLASH_EQUAL,
      STAR_EQUAL = $__7.STAR_EQUAL,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__7.UNSIGNED_RIGHT_SHIFT_EQUAL;
  function Token(type, location) {
    this.type = type;
    this.location = location;
  }
  ($__class)(Token, {
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
  return Object.preventExtensions(Object.create(null, {
    Token: {
      get: function() {
        return Token;
      },
      enumerable: true
    },
    isAssignmentOperator: {
      get: function() {
        return isAssignmentOperator;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/trees/ParseTreeType.js", function() {
  "use strict";
  var ANON_BLOCK = 'ANON_BLOCK';
  var ARGUMENT_LIST = 'ARGUMENT_LIST';
  var ARRAY_COMPREHENSION = 'ARRAY_COMPREHENSION';
  var ARRAY_LITERAL_EXPRESSION = 'ARRAY_LITERAL_EXPRESSION';
  var ARRAY_PATTERN = 'ARRAY_PATTERN';
  var ARROW_FUNCTION_EXPRESSION = 'ARROW_FUNCTION_EXPRESSION';
  var AWAIT_STATEMENT = 'AWAIT_STATEMENT';
  var BINARY_OPERATOR = 'BINARY_OPERATOR';
  var BINDING_ELEMENT = 'BINDING_ELEMENT';
  var BINDING_IDENTIFIER = 'BINDING_IDENTIFIER';
  var BLOCK = 'BLOCK';
  var BREAK_STATEMENT = 'BREAK_STATEMENT';
  var CALL_EXPRESSION = 'CALL_EXPRESSION';
  var CASCADE_EXPRESSION = 'CASCADE_EXPRESSION';
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
  return Object.preventExtensions(Object.create(null, {
    ANON_BLOCK: {
      get: function() {
        return ANON_BLOCK;
      },
      enumerable: true
    },
    ARGUMENT_LIST: {
      get: function() {
        return ARGUMENT_LIST;
      },
      enumerable: true
    },
    ARRAY_COMPREHENSION: {
      get: function() {
        return ARRAY_COMPREHENSION;
      },
      enumerable: true
    },
    ARRAY_LITERAL_EXPRESSION: {
      get: function() {
        return ARRAY_LITERAL_EXPRESSION;
      },
      enumerable: true
    },
    ARRAY_PATTERN: {
      get: function() {
        return ARRAY_PATTERN;
      },
      enumerable: true
    },
    ARROW_FUNCTION_EXPRESSION: {
      get: function() {
        return ARROW_FUNCTION_EXPRESSION;
      },
      enumerable: true
    },
    AWAIT_STATEMENT: {
      get: function() {
        return AWAIT_STATEMENT;
      },
      enumerable: true
    },
    BINARY_OPERATOR: {
      get: function() {
        return BINARY_OPERATOR;
      },
      enumerable: true
    },
    BINDING_ELEMENT: {
      get: function() {
        return BINDING_ELEMENT;
      },
      enumerable: true
    },
    BINDING_IDENTIFIER: {
      get: function() {
        return BINDING_IDENTIFIER;
      },
      enumerable: true
    },
    BLOCK: {
      get: function() {
        return BLOCK;
      },
      enumerable: true
    },
    BREAK_STATEMENT: {
      get: function() {
        return BREAK_STATEMENT;
      },
      enumerable: true
    },
    CALL_EXPRESSION: {
      get: function() {
        return CALL_EXPRESSION;
      },
      enumerable: true
    },
    CASCADE_EXPRESSION: {
      get: function() {
        return CASCADE_EXPRESSION;
      },
      enumerable: true
    },
    CASE_CLAUSE: {
      get: function() {
        return CASE_CLAUSE;
      },
      enumerable: true
    },
    CATCH: {
      get: function() {
        return CATCH;
      },
      enumerable: true
    },
    CLASS_DECLARATION: {
      get: function() {
        return CLASS_DECLARATION;
      },
      enumerable: true
    },
    CLASS_EXPRESSION: {
      get: function() {
        return CLASS_EXPRESSION;
      },
      enumerable: true
    },
    COMMA_EXPRESSION: {
      get: function() {
        return COMMA_EXPRESSION;
      },
      enumerable: true
    },
    COMPREHENSION_FOR: {
      get: function() {
        return COMPREHENSION_FOR;
      },
      enumerable: true
    },
    COMPREHENSION_IF: {
      get: function() {
        return COMPREHENSION_IF;
      },
      enumerable: true
    },
    COMPUTED_PROPERTY_NAME: {
      get: function() {
        return COMPUTED_PROPERTY_NAME;
      },
      enumerable: true
    },
    CONDITIONAL_EXPRESSION: {
      get: function() {
        return CONDITIONAL_EXPRESSION;
      },
      enumerable: true
    },
    CONTINUE_STATEMENT: {
      get: function() {
        return CONTINUE_STATEMENT;
      },
      enumerable: true
    },
    COVER_FORMALS: {
      get: function() {
        return COVER_FORMALS;
      },
      enumerable: true
    },
    COVER_INITIALISED_NAME: {
      get: function() {
        return COVER_INITIALISED_NAME;
      },
      enumerable: true
    },
    DEBUGGER_STATEMENT: {
      get: function() {
        return DEBUGGER_STATEMENT;
      },
      enumerable: true
    },
    DEFAULT_CLAUSE: {
      get: function() {
        return DEFAULT_CLAUSE;
      },
      enumerable: true
    },
    DO_WHILE_STATEMENT: {
      get: function() {
        return DO_WHILE_STATEMENT;
      },
      enumerable: true
    },
    EMPTY_STATEMENT: {
      get: function() {
        return EMPTY_STATEMENT;
      },
      enumerable: true
    },
    EXPORT_DECLARATION: {
      get: function() {
        return EXPORT_DECLARATION;
      },
      enumerable: true
    },
    EXPORT_DEFAULT: {
      get: function() {
        return EXPORT_DEFAULT;
      },
      enumerable: true
    },
    EXPORT_SPECIFIER: {
      get: function() {
        return EXPORT_SPECIFIER;
      },
      enumerable: true
    },
    EXPORT_SPECIFIER_SET: {
      get: function() {
        return EXPORT_SPECIFIER_SET;
      },
      enumerable: true
    },
    EXPORT_STAR: {
      get: function() {
        return EXPORT_STAR;
      },
      enumerable: true
    },
    EXPRESSION_STATEMENT: {
      get: function() {
        return EXPRESSION_STATEMENT;
      },
      enumerable: true
    },
    FINALLY: {
      get: function() {
        return FINALLY;
      },
      enumerable: true
    },
    FOR_IN_STATEMENT: {
      get: function() {
        return FOR_IN_STATEMENT;
      },
      enumerable: true
    },
    FOR_OF_STATEMENT: {
      get: function() {
        return FOR_OF_STATEMENT;
      },
      enumerable: true
    },
    FOR_STATEMENT: {
      get: function() {
        return FOR_STATEMENT;
      },
      enumerable: true
    },
    FORMAL_PARAMETER_LIST: {
      get: function() {
        return FORMAL_PARAMETER_LIST;
      },
      enumerable: true
    },
    FUNCTION_BODY: {
      get: function() {
        return FUNCTION_BODY;
      },
      enumerable: true
    },
    FUNCTION_DECLARATION: {
      get: function() {
        return FUNCTION_DECLARATION;
      },
      enumerable: true
    },
    FUNCTION_EXPRESSION: {
      get: function() {
        return FUNCTION_EXPRESSION;
      },
      enumerable: true
    },
    GENERATOR_COMPREHENSION: {
      get: function() {
        return GENERATOR_COMPREHENSION;
      },
      enumerable: true
    },
    GET_ACCESSOR: {
      get: function() {
        return GET_ACCESSOR;
      },
      enumerable: true
    },
    IDENTIFIER_EXPRESSION: {
      get: function() {
        return IDENTIFIER_EXPRESSION;
      },
      enumerable: true
    },
    IF_STATEMENT: {
      get: function() {
        return IF_STATEMENT;
      },
      enumerable: true
    },
    IMPORT_DECLARATION: {
      get: function() {
        return IMPORT_DECLARATION;
      },
      enumerable: true
    },
    IMPORT_SPECIFIER: {
      get: function() {
        return IMPORT_SPECIFIER;
      },
      enumerable: true
    },
    IMPORT_SPECIFIER_SET: {
      get: function() {
        return IMPORT_SPECIFIER_SET;
      },
      enumerable: true
    },
    IMPORTED_BINDING: {
      get: function() {
        return IMPORTED_BINDING;
      },
      enumerable: true
    },
    LABELLED_STATEMENT: {
      get: function() {
        return LABELLED_STATEMENT;
      },
      enumerable: true
    },
    LITERAL_EXPRESSION: {
      get: function() {
        return LITERAL_EXPRESSION;
      },
      enumerable: true
    },
    LITERAL_PROPERTY_NAME: {
      get: function() {
        return LITERAL_PROPERTY_NAME;
      },
      enumerable: true
    },
    MEMBER_EXPRESSION: {
      get: function() {
        return MEMBER_EXPRESSION;
      },
      enumerable: true
    },
    MEMBER_LOOKUP_EXPRESSION: {
      get: function() {
        return MEMBER_LOOKUP_EXPRESSION;
      },
      enumerable: true
    },
    MODULE: {
      get: function() {
        return MODULE;
      },
      enumerable: true
    },
    MODULE_DECLARATION: {
      get: function() {
        return MODULE_DECLARATION;
      },
      enumerable: true
    },
    MODULE_SPECIFIER: {
      get: function() {
        return MODULE_SPECIFIER;
      },
      enumerable: true
    },
    NAMED_EXPORT: {
      get: function() {
        return NAMED_EXPORT;
      },
      enumerable: true
    },
    NEW_EXPRESSION: {
      get: function() {
        return NEW_EXPRESSION;
      },
      enumerable: true
    },
    OBJECT_LITERAL_EXPRESSION: {
      get: function() {
        return OBJECT_LITERAL_EXPRESSION;
      },
      enumerable: true
    },
    OBJECT_PATTERN: {
      get: function() {
        return OBJECT_PATTERN;
      },
      enumerable: true
    },
    OBJECT_PATTERN_FIELD: {
      get: function() {
        return OBJECT_PATTERN_FIELD;
      },
      enumerable: true
    },
    PAREN_EXPRESSION: {
      get: function() {
        return PAREN_EXPRESSION;
      },
      enumerable: true
    },
    POSTFIX_EXPRESSION: {
      get: function() {
        return POSTFIX_EXPRESSION;
      },
      enumerable: true
    },
    PREDEFINED_TYPE: {
      get: function() {
        return PREDEFINED_TYPE;
      },
      enumerable: true
    },
    PROPERTY_METHOD_ASSIGNMENT: {
      get: function() {
        return PROPERTY_METHOD_ASSIGNMENT;
      },
      enumerable: true
    },
    PROPERTY_NAME_ASSIGNMENT: {
      get: function() {
        return PROPERTY_NAME_ASSIGNMENT;
      },
      enumerable: true
    },
    PROPERTY_NAME_SHORTHAND: {
      get: function() {
        return PROPERTY_NAME_SHORTHAND;
      },
      enumerable: true
    },
    REST_PARAMETER: {
      get: function() {
        return REST_PARAMETER;
      },
      enumerable: true
    },
    RETURN_STATEMENT: {
      get: function() {
        return RETURN_STATEMENT;
      },
      enumerable: true
    },
    SCRIPT: {
      get: function() {
        return SCRIPT;
      },
      enumerable: true
    },
    SET_ACCESSOR: {
      get: function() {
        return SET_ACCESSOR;
      },
      enumerable: true
    },
    SPREAD_EXPRESSION: {
      get: function() {
        return SPREAD_EXPRESSION;
      },
      enumerable: true
    },
    SPREAD_PATTERN_ELEMENT: {
      get: function() {
        return SPREAD_PATTERN_ELEMENT;
      },
      enumerable: true
    },
    STATE_MACHINE: {
      get: function() {
        return STATE_MACHINE;
      },
      enumerable: true
    },
    SUPER_EXPRESSION: {
      get: function() {
        return SUPER_EXPRESSION;
      },
      enumerable: true
    },
    SWITCH_STATEMENT: {
      get: function() {
        return SWITCH_STATEMENT;
      },
      enumerable: true
    },
    SYNTAX_ERROR_TREE: {
      get: function() {
        return SYNTAX_ERROR_TREE;
      },
      enumerable: true
    },
    TEMPLATE_LITERAL_EXPRESSION: {
      get: function() {
        return TEMPLATE_LITERAL_EXPRESSION;
      },
      enumerable: true
    },
    TEMPLATE_LITERAL_PORTION: {
      get: function() {
        return TEMPLATE_LITERAL_PORTION;
      },
      enumerable: true
    },
    TEMPLATE_SUBSTITUTION: {
      get: function() {
        return TEMPLATE_SUBSTITUTION;
      },
      enumerable: true
    },
    THIS_EXPRESSION: {
      get: function() {
        return THIS_EXPRESSION;
      },
      enumerable: true
    },
    THROW_STATEMENT: {
      get: function() {
        return THROW_STATEMENT;
      },
      enumerable: true
    },
    TRY_STATEMENT: {
      get: function() {
        return TRY_STATEMENT;
      },
      enumerable: true
    },
    TYPE_NAME: {
      get: function() {
        return TYPE_NAME;
      },
      enumerable: true
    },
    UNARY_EXPRESSION: {
      get: function() {
        return UNARY_EXPRESSION;
      },
      enumerable: true
    },
    VARIABLE_DECLARATION: {
      get: function() {
        return VARIABLE_DECLARATION;
      },
      enumerable: true
    },
    VARIABLE_DECLARATION_LIST: {
      get: function() {
        return VARIABLE_DECLARATION_LIST;
      },
      enumerable: true
    },
    VARIABLE_STATEMENT: {
      get: function() {
        return VARIABLE_STATEMENT;
      },
      enumerable: true
    },
    WHILE_STATEMENT: {
      get: function() {
        return WHILE_STATEMENT;
      },
      enumerable: true
    },
    WITH_STATEMENT: {
      get: function() {
        return WITH_STATEMENT;
      },
      enumerable: true
    },
    YIELD_EXPRESSION: {
      get: function() {
        return YIELD_EXPRESSION;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/trees/ParseTree.js", function() {
  "use strict";
  var ParseTreeType = System.get("../src/syntax/trees/ParseTreeType.js");
  var $__9 = System.get("../src/syntax/TokenType.js"),
      STRING = $__9.STRING,
      VAR = $__9.VAR;
  var Token = System.get("../src/syntax/Token.js").Token;
  var utilJSON = System.get("../src/util/JSON.js");
  var $__9 = System.get("../src/syntax/trees/ParseTreeType.js"),
      ARGUMENT_LIST = $__9.ARGUMENT_LIST,
      ARRAY_COMPREHENSION = $__9.ARRAY_COMPREHENSION,
      ARRAY_LITERAL_EXPRESSION = $__9.ARRAY_LITERAL_EXPRESSION,
      ARRAY_PATTERN = $__9.ARRAY_PATTERN,
      ARROW_FUNCTION_EXPRESSION = $__9.ARROW_FUNCTION_EXPRESSION,
      AWAIT_STATEMENT = $__9.AWAIT_STATEMENT,
      BINARY_OPERATOR = $__9.BINARY_OPERATOR,
      BINDING_ELEMENT = $__9.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__9.BINDING_IDENTIFIER,
      BLOCK = $__9.BLOCK,
      BREAK_STATEMENT = $__9.BREAK_STATEMENT,
      CALL_EXPRESSION = $__9.CALL_EXPRESSION,
      CASCADE_EXPRESSION = $__9.CASCADE_EXPRESSION,
      CASE_CLAUSE = $__9.CASE_CLAUSE,
      CATCH = $__9.CATCH,
      CLASS_DECLARATION = $__9.CLASS_DECLARATION,
      CLASS_EXPRESSION = $__9.CLASS_EXPRESSION,
      COMMA_EXPRESSION = $__9.COMMA_EXPRESSION,
      COMPREHENSION_FOR = $__9.COMPREHENSION_FOR,
      COMPREHENSION_IF = $__9.COMPREHENSION_IF,
      COMPUTED_PROPERTY_NAME = $__9.COMPUTED_PROPERTY_NAME,
      CONDITIONAL_EXPRESSION = $__9.CONDITIONAL_EXPRESSION,
      CONTINUE_STATEMENT = $__9.CONTINUE_STATEMENT,
      COVER_FORMALS = $__9.COVER_FORMALS,
      COVER_INITIALISED_NAME = $__9.COVER_INITIALISED_NAME,
      DEBUGGER_STATEMENT = $__9.DEBUGGER_STATEMENT,
      DEFAULT_CLAUSE = $__9.DEFAULT_CLAUSE,
      DO_WHILE_STATEMENT = $__9.DO_WHILE_STATEMENT,
      EMPTY_STATEMENT = $__9.EMPTY_STATEMENT,
      EXPORT_DECLARATION = $__9.EXPORT_DECLARATION,
      EXPORT_SPECIFIER = $__9.EXPORT_SPECIFIER,
      EXPORT_SPECIFIER_SET = $__9.EXPORT_SPECIFIER_SET,
      EXPORT_STAR = $__9.EXPORT_STAR,
      EXPRESSION_STATEMENT = $__9.EXPRESSION_STATEMENT,
      FINALLY = $__9.FINALLY,
      FOR_IN_STATEMENT = $__9.FOR_IN_STATEMENT,
      FOR_OF_STATEMENT = $__9.FOR_OF_STATEMENT,
      FOR_STATEMENT = $__9.FOR_STATEMENT,
      FORMAL_PARAMETER_LIST = $__9.FORMAL_PARAMETER_LIST,
      FUNCTION_BODY = $__9.FUNCTION_BODY,
      FUNCTION_DECLARATION = $__9.FUNCTION_DECLARATION,
      FUNCTION_EXPRESSION = $__9.FUNCTION_EXPRESSION,
      GENERATOR_COMPREHENSION = $__9.GENERATOR_COMPREHENSION,
      GET_ACCESSOR = $__9.GET_ACCESSOR,
      IDENTIFIER_EXPRESSION = $__9.IDENTIFIER_EXPRESSION,
      IF_STATEMENT = $__9.IF_STATEMENT,
      IMPORT_DECLARATION = $__9.IMPORT_DECLARATION,
      IMPORT_SPECIFIER = $__9.IMPORT_SPECIFIER,
      IMPORT_SPECIFIER_SET = $__9.IMPORT_SPECIFIER_SET,
      LABELLED_STATEMENT = $__9.LABELLED_STATEMENT,
      LITERAL_EXPRESSION = $__9.LITERAL_EXPRESSION,
      LITERAL_PROPERTY_NAME = $__9.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__9.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__9.MEMBER_LOOKUP_EXPRESSION,
      MODULE = $__9.MODULE,
      MODULE_DECLARATION = $__9.MODULE_DECLARATION,
      MODULE_SPECIFIER = $__9.MODULE_SPECIFIER,
      NAMED_EXPORT = $__9.NAMED_EXPORT,
      NEW_EXPRESSION = $__9.NEW_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__9.OBJECT_LITERAL_EXPRESSION,
      OBJECT_PATTERN = $__9.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__9.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__9.PAREN_EXPRESSION,
      POSTFIX_EXPRESSION = $__9.POSTFIX_EXPRESSION,
      PREDEFINED_TYPE = $__9.PREDEFINED_TYPE,
      PROPERTY_METHOD_ASSIGNMENT = $__9.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__9.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__9.PROPERTY_NAME_SHORTHAND,
      REST_PARAMETER = $__9.REST_PARAMETER,
      RETURN_STATEMENT = $__9.RETURN_STATEMENT,
      SCRIPT = $__9.SCRIPT,
      SET_ACCESSOR = $__9.SET_ACCESSOR,
      SPREAD_EXPRESSION = $__9.SPREAD_EXPRESSION,
      SPREAD_PATTERN_ELEMENT = $__9.SPREAD_PATTERN_ELEMENT,
      STATE_MACHINE = $__9.STATE_MACHINE,
      SUPER_EXPRESSION = $__9.SUPER_EXPRESSION,
      SWITCH_STATEMENT = $__9.SWITCH_STATEMENT,
      SYNTAX_ERROR_TREE = $__9.SYNTAX_ERROR_TREE,
      TEMPLATE_LITERAL_EXPRESSION = $__9.TEMPLATE_LITERAL_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__9.TEMPLATE_LITERAL_PORTION,
      TEMPLATE_SUBSTITUTION = $__9.TEMPLATE_SUBSTITUTION,
      THIS_EXPRESSION = $__9.THIS_EXPRESSION,
      THROW_STATEMENT = $__9.THROW_STATEMENT,
      TRY_STATEMENT = $__9.TRY_STATEMENT,
      TYPE_NAME = $__9.TYPE_NAME,
      UNARY_EXPRESSION = $__9.UNARY_EXPRESSION,
      VARIABLE_DECLARATION = $__9.VARIABLE_DECLARATION,
      VARIABLE_DECLARATION_LIST = $__9.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__9.VARIABLE_STATEMENT,
      WHILE_STATEMENT = $__9.WHILE_STATEMENT,
      WITH_STATEMENT = $__9.WITH_STATEMENT,
      YIELD_EXPRESSION = $__9.YIELD_EXPRESSION;
  ;
  function ParseTree(type, location) {
    throw new Error("Don't use for now. 'super' is currently very slow.");
    this.type = type;
    this.location = location;
  }
  ($__class)(ParseTree, {
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
    isArrowFunctionExpression: function() {
      switch (this.type) {
        case ARRAY_COMPREHENSION:
        case ARRAY_LITERAL_EXPRESSION:
        case ARROW_FUNCTION_EXPRESSION:
        case BINARY_OPERATOR:
        case CALL_EXPRESSION:
        case CASCADE_EXPRESSION:
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
        case CASCADE_EXPRESSION:
          return true;
        case NEW_EXPRESSION:
          return this.args != null;
      }
      return false;
    },
    isExpression: function() {
      return this.isArrowFunctionExpression() || this.type == COMMA_EXPRESSION;
    },
    isAssignmentOrSpread: function() {
      return this.isArrowFunctionExpression() || this.type == SPREAD_EXPRESSION;
    },
    isRestParameter: function() {
      return this.type == REST_PARAMETER;
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
        case AWAIT_STATEMENT:
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
    getDirectivePrologueStringToken_: function() {
      var tree = this;
      if (tree.type !== EXPRESSION_STATEMENT || !(tree = tree.expression)) return null;
      if (tree.type !== LITERAL_EXPRESSION || !(tree = tree.literalToken)) return null;
      if (tree.type !== STRING) return null;
      return tree;
    },
    isDirectivePrologue: function() {
      return this.getDirectivePrologueStringToken_() !== null;
    },
    isUseStrictDirective: function() {
      var token = this.getDirectivePrologueStringToken_();
      if (!token) return false;
      var v = token.value;
      return v === '"use strict"' || v === "'use strict'";
    },
    toJSON: function() {
      return utilJSON.transform(this, ParseTree.replacer);
    },
    stringify: function() {
      var indent = arguments[0] !== (void 0) ? arguments[0]: 2;
      return JSON.stringify(this, ParseTree.replacer, indent);
    }
  }, {
    stripLocation: function(key, value) {
      if (key === 'location') {
        return undefined;
      }
      return value;
    },
    replacer: function(k, v) {
      if (v instanceof ParseTree || v instanceof Token) {
        var rv = {type: v.type};
        Object.keys(v).forEach(function(name) {
          if (name !== 'location') rv[name] = v[name];
        });
        return rv;
      }
      return v;
    }
  });
  return Object.preventExtensions(Object.create(null, {
    ParseTreeType: {
      get: function() {
        return ParseTreeType;
      },
      enumerable: true
    },
    ParseTree: {
      get: function() {
        return ParseTree;
      },
      enumerable: true
    }
  }));
}, this);
var $__toObject = function(value) {
  if (value == null) throw $__TypeError();
  return $__Object(value);
},
    $__spread = function() {
      var rv = [],
          k = 0;
      for (var i = 0; i < arguments.length; i++) {
        var value = $__toObject(arguments[i]);
        for (var j = 0; j < value.length; j++) {
          rv[k++] = value[j];
        }
      }
      return rv;
    };
System.get('@traceur/module').registerModule("../src/codegeneration/module/ModuleVisitor.js", function() {
  "use strict";
  var ParseTree = System.get("../src/syntax/trees/ParseTree.js").ParseTree;
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var $__12 = System.get("../src/syntax/trees/ParseTreeType.js"),
      MODULE_DECLARATION = $__12.MODULE_DECLARATION,
      EXPORT_DECLARATION = $__12.EXPORT_DECLARATION,
      IMPORT_DECLARATION = $__12.IMPORT_DECLARATION;
  var Symbol = System.get("../src/semantics/symbols/Symbol.js").Symbol;
  function ModuleVisitor(reporter, project, module) {
    $__superCall(this, $__ModuleVisitor__proto, "constructor", []);
    this.reporter_ = reporter;
    this.project = project;
    this.currentModule_ = module;
  }
  var $__ModuleVisitor__super = ParseTreeVisitor;
  var $__ModuleVisitor__proto = $__getProtoParent($__ModuleVisitor__super);
  ($__class)(ModuleVisitor, {
    get currentModule() {
      return this.currentModule_;
    },
    getModuleForModuleSpecifier: function(tree, reportErrors) {
      var url = System.normalResolve(tree.token.processedValue, this.currentModule.url);
      var module = this.project.getModuleForResolvedUrl(url);
      if (!module) {
        if (reportErrors) {
          this.reportError_(tree, '\'%s\' is not a module', url || name);
        }
        return null;
      }
      return module;
    },
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {},
    visitBlock: function(tree) {},
    visitClassDeclaration: function(tree) {},
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
    checkForDuplicateModule_: function(name, tree) {
      var parent = this.currentModule;
      if (parent.hasModule(name)) {
        this.reportError_(tree, 'Duplicate module declaration \'%s\'', name);
        this.reportRelatedError_(parent.getModule(name).tree);
        return false;
      }
      return true;
    },
    reportError_: function(symbolOrTree, format) {
      var $__13;
      for (var args = [],
          $__11 = 2; $__11 < arguments.length; $__11++) args[$__11 - 2] = arguments[$__11];
      var tree;
      if (symbolOrTree instanceof Symbol) {
        tree = symbolOrTree.tree;
      } else {
        tree = symbolOrTree;
      }
      ($__13 = this.reporter_).reportError.apply($__13, $__spread([tree.location.start, format], args));
    },
    reportRelatedError_: function(symbolOrTree) {
      if (symbolOrTree instanceof ParseTree) {
        this.reportError_(symbolOrTree, 'Location related to previous error');
      } else {
        var tree = symbolOrTree.tree;
        if (tree) {
          this.reportRelatedError_(tree);
        } else {
          this.reporter_.reportError(null, ("Module related to previous error: " + symbolOrTree.url));
        }
      }
    }
  }, {}, $__ModuleVisitor__super, $__ModuleVisitor__proto);
  return Object.preventExtensions(Object.create(null, {ModuleVisitor: {
      get: function() {
        return ModuleVisitor;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/module/ExportVisitor.js", function() {
  "use strict";
  var ExportSymbol = System.get("../src/semantics/symbols/ExportSymbol.js").ExportSymbol;
  var ModuleVisitor = System.get("../src/codegeneration/module/ModuleVisitor.js").ModuleVisitor;
  var assert = System.get("../src/util/assert.js").assert;
  function ExportVisitor(reporter, project, module) {
    $__superCall(this, $__ExportVisitor__proto, "constructor", [reporter, project, module]);
    this.inExport_ = false;
    this.relatedTree_ = null;
  }
  var $__ExportVisitor__super = ModuleVisitor;
  var $__ExportVisitor__proto = $__getProtoParent($__ExportVisitor__super);
  ($__class)(ExportVisitor, {
    addExport_: function(name, tree) {
      if (!this.inExport_) {
        return;
      }
      assert(typeof name == 'string');
      var parent = this.currentModule;
      if (parent.hasExport(name)) {
        this.reportError_(tree, 'Duplicate export declaration \'%s\'', name);
        this.reportRelatedError_(parent.getExport(name));
        return;
      }
      parent.addExport(new ExportSymbol(name, tree, this.relatedTree_));
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
      this.relatedTree_ = tree.moduleSpecifier;
      this.visitAny(tree.specifierSet);
      this.relatedTree_ = null;
    },
    visitExportDefault: function(tree) {
      this.addExport_('default', tree);
    },
    visitExportSpecifier: function(tree) {
      this.addExport_((tree.rhs || tree.lhs).value, tree);
    },
    visitExportStar: function(tree) {
      var module = this.getModuleForModuleSpecifier(this.relatedTree_);
      module.getExports().forEach((function($__15) {
        var name = $__15.name;
        this.addExport_(name, tree);
      }).bind(this));
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
  }, {}, $__ExportVisitor__super, $__ExportVisitor__proto);
  return Object.preventExtensions(Object.create(null, {ExportVisitor: {
      get: function() {
        return ExportVisitor;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/module/ValidationVisitor.js", function() {
  "use strict";
  var ModuleVisitor = System.get("../src/codegeneration/module/ModuleVisitor.js").ModuleVisitor;
  function getFriendlyName(module) {
    return "'" + module.url + "'";
  }
  function ValidationVisitor() {
    $__ValidationVisitor__proto !== null && $__superCall(this, $__ValidationVisitor__proto, "constructor", arguments);
  }
  var $__ValidationVisitor__super = ModuleVisitor;
  var $__ValidationVisitor__proto = $__getProtoParent($__ValidationVisitor__super);
  ($__class)(ValidationVisitor, {
    checkExport_: function(tree, name) {
      if (this.validatingModule_ && !this.validatingModule_.hasExport(name)) {
        this.reportError_(tree, '\'%s\' is not exported by %s', name, getFriendlyName(this.validatingModule_));
      }
    },
    visitAndValidate_: function(module, tree) {
      var validatingModule = this.validatingModule_;
      this.validatingModule_ = module;
      this.visitAny(tree);
      this.validatingModule_ = validatingModule;
    },
    visitNamedExport: function(tree) {
      if (tree.moduleSpecifier) {
        var module = this.getModuleForModuleSpecifier(tree.moduleSpecifier, true);
        this.visitAndValidate_(module, tree.specifierSet);
      }
    },
    visitExportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    },
    visitModuleSpecifier: function(tree) {
      this.getModuleForModuleSpecifier(tree, true);
    },
    visitImportDeclaration: function(tree) {
      var module = this.getModuleForModuleSpecifier(tree.moduleSpecifier, true);
      this.visitAndValidate_(module, tree.importClause);
    },
    visitImportSpecifier: function(tree) {
      this.checkExport_(tree, tree.lhs.value);
    },
    visitImportedBinding: function(tree) {
      this.checkExport_(tree, 'default');
    }
  }, {}, $__ValidationVisitor__super, $__ValidationVisitor__proto);
  return Object.preventExtensions(Object.create(null, {ValidationVisitor: {
      get: function() {
        return ValidationVisitor;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/ModuleAnalyzer.js", function() {
  "use strict";
  var ExportVisitor = System.get("../src/codegeneration/module/ExportVisitor.js").ExportVisitor;
  var ValidationVisitor = System.get("../src/codegeneration/module/ValidationVisitor.js").ValidationVisitor;
  var transformOptions = System.get("../src/options.js").transformOptions;
  function ModuleAnalyzer(reporter, project) {
    this.reporter_ = reporter;
    this.project_ = project;
  }
  ($__class)(ModuleAnalyzer, {
    analyze: function() {
      this.analyzeTrees(this.project_.getParseTrees());
    },
    analyzeFile: function(sourceFile) {
      var trees = [this.project_.getParseTree(sourceFile)];
      this.analyzeTrees(trees);
    },
    analyzeTrees: function(trees) {
      var roots = arguments[1];
      if (!transformOptions.modules) return;
      var reporter = this.reporter_;
      var project = this.project_;
      var root = project.getRootModule();
      function getRoot(i) {
        return roots ? roots[i]: root;
      }
      function doVisit(ctor) {
        for (var i = 0; i < trees.length; i++) {
          var visitor = new ctor(reporter, project, getRoot(i));
          visitor.visitAny(trees[i]);
        }
      }
      function reverseVisit(ctor) {
        for (var i = trees.length - 1; i >= 0; i--) {
          var visitor = new ctor(reporter, project, getRoot(i));
          visitor.visitAny(trees[i]);
        }
      }
      reverseVisit(ExportVisitor);
      doVisit(ValidationVisitor);
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {ModuleAnalyzer: {
      get: function() {
        return ModuleAnalyzer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/trees/ParseTrees.js", function() {
  "use strict";
  var ParseTree = System.get("../src/syntax/trees/ParseTree.js").ParseTree;
  var ParseTreeType = System.get("../src/syntax/trees/ParseTreeType.js");
  var ANON_BLOCK = ParseTreeType.ANON_BLOCK;
  function AnonBlock(location, statements) {
    this.location = location;
    this.statements = statements;
  }
  ($__class)(AnonBlock, {
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
  function ArgumentList(location, args) {
    this.location = location;
    this.args = args;
  }
  ($__class)(ArgumentList, {
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
  function ArrayComprehension(location, comprehensionList, expression) {
    this.location = location;
    this.comprehensionList = comprehensionList;
    this.expression = expression;
  }
  ($__class)(ArrayComprehension, {
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
  function ArrayLiteralExpression(location, elements) {
    this.location = location;
    this.elements = elements;
  }
  ($__class)(ArrayLiteralExpression, {
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
  function ArrayPattern(location, elements) {
    this.location = location;
    this.elements = elements;
  }
  ($__class)(ArrayPattern, {
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
  function ArrowFunctionExpression(location, formalParameters, functionBody) {
    this.location = location;
    this.formalParameters = formalParameters;
    this.functionBody = functionBody;
  }
  ($__class)(ArrowFunctionExpression, {
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
  var AWAIT_STATEMENT = ParseTreeType.AWAIT_STATEMENT;
  function AwaitStatement(location, identifier, expression) {
    this.location = location;
    this.identifier = identifier;
    this.expression = expression;
  }
  ($__class)(AwaitStatement, {
    transform: function(transformer) {
      return transformer.transformAwaitStatement(this);
    },
    visit: function(visitor) {
      visitor.visitAwaitStatement(this);
    },
    get type() {
      return AWAIT_STATEMENT;
    }
  }, {}, ParseTree);
  var BINARY_OPERATOR = ParseTreeType.BINARY_OPERATOR;
  function BinaryOperator(location, left, operator, right) {
    this.location = location;
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  ($__class)(BinaryOperator, {
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
  function BindingElement(location, binding, initializer) {
    this.location = location;
    this.binding = binding;
    this.initializer = initializer;
  }
  ($__class)(BindingElement, {
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
  function BindingIdentifier(location, identifierToken) {
    this.location = location;
    this.identifierToken = identifierToken;
  }
  ($__class)(BindingIdentifier, {
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
  function Block(location, statements) {
    this.location = location;
    this.statements = statements;
  }
  ($__class)(Block, {
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
  function BreakStatement(location, name) {
    this.location = location;
    this.name = name;
  }
  ($__class)(BreakStatement, {
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
  function CallExpression(location, operand, args) {
    this.location = location;
    this.operand = operand;
    this.args = args;
  }
  ($__class)(CallExpression, {
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
  var CASCADE_EXPRESSION = ParseTreeType.CASCADE_EXPRESSION;
  function CascadeExpression(location, operand, expressions) {
    this.location = location;
    this.operand = operand;
    this.expressions = expressions;
  }
  ($__class)(CascadeExpression, {
    transform: function(transformer) {
      return transformer.transformCascadeExpression(this);
    },
    visit: function(visitor) {
      visitor.visitCascadeExpression(this);
    },
    get type() {
      return CASCADE_EXPRESSION;
    }
  }, {}, ParseTree);
  var CASE_CLAUSE = ParseTreeType.CASE_CLAUSE;
  function CaseClause(location, expression, statements) {
    this.location = location;
    this.expression = expression;
    this.statements = statements;
  }
  ($__class)(CaseClause, {
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
  function Catch(location, binding, catchBody) {
    this.location = location;
    this.binding = binding;
    this.catchBody = catchBody;
  }
  ($__class)(Catch, {
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
  function ClassDeclaration(location, name, superClass, elements) {
    this.location = location;
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
  }
  ($__class)(ClassDeclaration, {
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
  function ClassExpression(location, name, superClass, elements) {
    this.location = location;
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
  }
  ($__class)(ClassExpression, {
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
  function CommaExpression(location, expressions) {
    this.location = location;
    this.expressions = expressions;
  }
  ($__class)(CommaExpression, {
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
  function ComprehensionFor(location, left, iterator) {
    this.location = location;
    this.left = left;
    this.iterator = iterator;
  }
  ($__class)(ComprehensionFor, {
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
  function ComprehensionIf(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(ComprehensionIf, {
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
  function ComputedPropertyName(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(ComputedPropertyName, {
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
  function ConditionalExpression(location, condition, left, right) {
    this.location = location;
    this.condition = condition;
    this.left = left;
    this.right = right;
  }
  ($__class)(ConditionalExpression, {
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
  function ContinueStatement(location, name) {
    this.location = location;
    this.name = name;
  }
  ($__class)(ContinueStatement, {
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
  function CoverFormals(location, expressions) {
    this.location = location;
    this.expressions = expressions;
  }
  ($__class)(CoverFormals, {
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
  function CoverInitialisedName(location, name, equalToken, initializer) {
    this.location = location;
    this.name = name;
    this.equalToken = equalToken;
    this.initializer = initializer;
  }
  ($__class)(CoverInitialisedName, {
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
  function DebuggerStatement(location) {
    this.location = location;
  }
  ($__class)(DebuggerStatement, {
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
  function DefaultClause(location, statements) {
    this.location = location;
    this.statements = statements;
  }
  ($__class)(DefaultClause, {
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
  function DoWhileStatement(location, body, condition) {
    this.location = location;
    this.body = body;
    this.condition = condition;
  }
  ($__class)(DoWhileStatement, {
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
  function EmptyStatement(location) {
    this.location = location;
  }
  ($__class)(EmptyStatement, {
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
  function ExportDeclaration(location, declaration) {
    this.location = location;
    this.declaration = declaration;
  }
  ($__class)(ExportDeclaration, {
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
  function ExportDefault(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(ExportDefault, {
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
  function ExportSpecifier(location, lhs, rhs) {
    this.location = location;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  ($__class)(ExportSpecifier, {
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
  function ExportSpecifierSet(location, specifiers) {
    this.location = location;
    this.specifiers = specifiers;
  }
  ($__class)(ExportSpecifierSet, {
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
  function ExportStar(location) {
    this.location = location;
  }
  ($__class)(ExportStar, {
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
  function ExpressionStatement(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(ExpressionStatement, {
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
  function Finally(location, block) {
    this.location = location;
    this.block = block;
  }
  ($__class)(Finally, {
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
  function ForInStatement(location, initializer, collection, body) {
    this.location = location;
    this.initializer = initializer;
    this.collection = collection;
    this.body = body;
  }
  ($__class)(ForInStatement, {
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
  function ForOfStatement(location, initializer, collection, body) {
    this.location = location;
    this.initializer = initializer;
    this.collection = collection;
    this.body = body;
  }
  ($__class)(ForOfStatement, {
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
  function ForStatement(location, initializer, condition, increment, body) {
    this.location = location;
    this.initializer = initializer;
    this.condition = condition;
    this.increment = increment;
    this.body = body;
  }
  ($__class)(ForStatement, {
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
  var FORMAL_PARAMETER_LIST = ParseTreeType.FORMAL_PARAMETER_LIST;
  function FormalParameterList(location, parameters) {
    this.location = location;
    this.parameters = parameters;
  }
  ($__class)(FormalParameterList, {
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
  function FunctionBody(location, statements) {
    this.location = location;
    this.statements = statements;
  }
  ($__class)(FunctionBody, {
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
  function FunctionDeclaration(location, name, isGenerator, formalParameterList, functionBody) {
    this.location = location;
    this.name = name;
    this.isGenerator = isGenerator;
    this.formalParameterList = formalParameterList;
    this.functionBody = functionBody;
  }
  ($__class)(FunctionDeclaration, {
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
  function FunctionExpression(location, name, isGenerator, formalParameterList, functionBody) {
    this.location = location;
    this.name = name;
    this.isGenerator = isGenerator;
    this.formalParameterList = formalParameterList;
    this.functionBody = functionBody;
  }
  ($__class)(FunctionExpression, {
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
  function GeneratorComprehension(location, comprehensionList, expression) {
    this.location = location;
    this.comprehensionList = comprehensionList;
    this.expression = expression;
  }
  ($__class)(GeneratorComprehension, {
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
  function GetAccessor(location, isStatic, name, body) {
    this.location = location;
    this.isStatic = isStatic;
    this.name = name;
    this.body = body;
  }
  ($__class)(GetAccessor, {
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
  function IdentifierExpression(location, identifierToken) {
    this.location = location;
    this.identifierToken = identifierToken;
  }
  ($__class)(IdentifierExpression, {
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
  function IfStatement(location, condition, ifClause, elseClause) {
    this.location = location;
    this.condition = condition;
    this.ifClause = ifClause;
    this.elseClause = elseClause;
  }
  ($__class)(IfStatement, {
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
  function ImportedBinding(location, binding) {
    this.location = location;
    this.binding = binding;
  }
  ($__class)(ImportedBinding, {
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
  function ImportDeclaration(location, importClause, moduleSpecifier) {
    this.location = location;
    this.importClause = importClause;
    this.moduleSpecifier = moduleSpecifier;
  }
  ($__class)(ImportDeclaration, {
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
  function ImportSpecifier(location, lhs, rhs) {
    this.location = location;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  ($__class)(ImportSpecifier, {
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
  function ImportSpecifierSet(location, specifiers) {
    this.location = location;
    this.specifiers = specifiers;
  }
  ($__class)(ImportSpecifierSet, {
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
  function LabelledStatement(location, name, statement) {
    this.location = location;
    this.name = name;
    this.statement = statement;
  }
  ($__class)(LabelledStatement, {
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
  function LiteralExpression(location, literalToken) {
    this.location = location;
    this.literalToken = literalToken;
  }
  ($__class)(LiteralExpression, {
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
  function LiteralPropertyName(location, literalToken) {
    this.location = location;
    this.literalToken = literalToken;
  }
  ($__class)(LiteralPropertyName, {
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
  function MemberExpression(location, operand, memberName) {
    this.location = location;
    this.operand = operand;
    this.memberName = memberName;
  }
  ($__class)(MemberExpression, {
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
  function MemberLookupExpression(location, operand, memberExpression) {
    this.location = location;
    this.operand = operand;
    this.memberExpression = memberExpression;
  }
  ($__class)(MemberLookupExpression, {
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
  function Module(location, scriptItemList) {
    this.location = location;
    this.scriptItemList = scriptItemList;
  }
  ($__class)(Module, {
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
  function ModuleDeclaration(location, identifier, expression) {
    this.location = location;
    this.identifier = identifier;
    this.expression = expression;
  }
  ($__class)(ModuleDeclaration, {
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
  function ModuleSpecifier(location, token) {
    this.location = location;
    this.token = token;
  }
  ($__class)(ModuleSpecifier, {
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
  function NamedExport(location, moduleSpecifier, specifierSet) {
    this.location = location;
    this.moduleSpecifier = moduleSpecifier;
    this.specifierSet = specifierSet;
  }
  ($__class)(NamedExport, {
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
  function NewExpression(location, operand, args) {
    this.location = location;
    this.operand = operand;
    this.args = args;
  }
  ($__class)(NewExpression, {
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
  function ObjectLiteralExpression(location, propertyNameAndValues) {
    this.location = location;
    this.propertyNameAndValues = propertyNameAndValues;
  }
  ($__class)(ObjectLiteralExpression, {
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
  function ObjectPattern(location, fields) {
    this.location = location;
    this.fields = fields;
  }
  ($__class)(ObjectPattern, {
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
  function ObjectPatternField(location, name, element) {
    this.location = location;
    this.name = name;
    this.element = element;
  }
  ($__class)(ObjectPatternField, {
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
  function ParenExpression(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(ParenExpression, {
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
  function PostfixExpression(location, operand, operator) {
    this.location = location;
    this.operand = operand;
    this.operator = operator;
  }
  ($__class)(PostfixExpression, {
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
  function PredefinedType(location, typeToken) {
    this.location = location;
    this.typeToken = typeToken;
  }
  ($__class)(PredefinedType, {
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
  function Script(location, scriptItemList) {
    this.location = location;
    this.scriptItemList = scriptItemList;
  }
  ($__class)(Script, {
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
  function PropertyMethodAssignment(location, isStatic, isGenerator, name, formalParameterList, functionBody) {
    this.location = location;
    this.isStatic = isStatic;
    this.isGenerator = isGenerator;
    this.name = name;
    this.formalParameterList = formalParameterList;
    this.functionBody = functionBody;
  }
  ($__class)(PropertyMethodAssignment, {
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
  function PropertyNameAssignment(location, name, value) {
    this.location = location;
    this.name = name;
    this.value = value;
  }
  ($__class)(PropertyNameAssignment, {
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
  function PropertyNameShorthand(location, name) {
    this.location = location;
    this.name = name;
  }
  ($__class)(PropertyNameShorthand, {
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
  function RestParameter(location, identifier) {
    this.location = location;
    this.identifier = identifier;
  }
  ($__class)(RestParameter, {
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
  function ReturnStatement(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(ReturnStatement, {
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
  function SetAccessor(location, isStatic, name, parameter, body) {
    this.location = location;
    this.isStatic = isStatic;
    this.name = name;
    this.parameter = parameter;
    this.body = body;
  }
  ($__class)(SetAccessor, {
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
  function SpreadExpression(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(SpreadExpression, {
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
  function SpreadPatternElement(location, lvalue) {
    this.location = location;
    this.lvalue = lvalue;
  }
  ($__class)(SpreadPatternElement, {
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
  function SuperExpression(location) {
    this.location = location;
  }
  ($__class)(SuperExpression, {
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
  function SwitchStatement(location, expression, caseClauses) {
    this.location = location;
    this.expression = expression;
    this.caseClauses = caseClauses;
  }
  ($__class)(SwitchStatement, {
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
  function SyntaxErrorTree(location, nextToken, message) {
    this.location = location;
    this.nextToken = nextToken;
    this.message = message;
  }
  ($__class)(SyntaxErrorTree, {
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
  function TemplateLiteralExpression(location, operand, elements) {
    this.location = location;
    this.operand = operand;
    this.elements = elements;
  }
  ($__class)(TemplateLiteralExpression, {
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
  function TemplateLiteralPortion(location, value) {
    this.location = location;
    this.value = value;
  }
  ($__class)(TemplateLiteralPortion, {
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
  function TemplateSubstitution(location, expression) {
    this.location = location;
    this.expression = expression;
  }
  ($__class)(TemplateSubstitution, {
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
  function ThisExpression(location) {
    this.location = location;
  }
  ($__class)(ThisExpression, {
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
  function ThrowStatement(location, value) {
    this.location = location;
    this.value = value;
  }
  ($__class)(ThrowStatement, {
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
  function TryStatement(location, body, catchBlock, finallyBlock) {
    this.location = location;
    this.body = body;
    this.catchBlock = catchBlock;
    this.finallyBlock = finallyBlock;
  }
  ($__class)(TryStatement, {
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
  function TypeName(location, moduleName, name) {
    this.location = location;
    this.moduleName = moduleName;
    this.name = name;
  }
  ($__class)(TypeName, {
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
  function UnaryExpression(location, operator, operand) {
    this.location = location;
    this.operator = operator;
    this.operand = operand;
  }
  ($__class)(UnaryExpression, {
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
  function VariableDeclaration(location, lvalue, typeAnnotation, initializer) {
    this.location = location;
    this.lvalue = lvalue;
    this.typeAnnotation = typeAnnotation;
    this.initializer = initializer;
  }
  ($__class)(VariableDeclaration, {
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
  function VariableDeclarationList(location, declarationType, declarations) {
    this.location = location;
    this.declarationType = declarationType;
    this.declarations = declarations;
  }
  ($__class)(VariableDeclarationList, {
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
  function VariableStatement(location, declarations) {
    this.location = location;
    this.declarations = declarations;
  }
  ($__class)(VariableStatement, {
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
  function WhileStatement(location, condition, body) {
    this.location = location;
    this.condition = condition;
    this.body = body;
  }
  ($__class)(WhileStatement, {
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
  function WithStatement(location, expression, body) {
    this.location = location;
    this.expression = expression;
    this.body = body;
  }
  ($__class)(WithStatement, {
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
  function YieldExpression(location, expression, isYieldFor) {
    this.location = location;
    this.expression = expression;
    this.isYieldFor = isYieldFor;
  }
  ($__class)(YieldExpression, {
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
  return Object.preventExtensions(Object.create(null, {
    AnonBlock: {
      get: function() {
        return AnonBlock;
      },
      enumerable: true
    },
    ArgumentList: {
      get: function() {
        return ArgumentList;
      },
      enumerable: true
    },
    ArrayComprehension: {
      get: function() {
        return ArrayComprehension;
      },
      enumerable: true
    },
    ArrayLiteralExpression: {
      get: function() {
        return ArrayLiteralExpression;
      },
      enumerable: true
    },
    ArrayPattern: {
      get: function() {
        return ArrayPattern;
      },
      enumerable: true
    },
    ArrowFunctionExpression: {
      get: function() {
        return ArrowFunctionExpression;
      },
      enumerable: true
    },
    AwaitStatement: {
      get: function() {
        return AwaitStatement;
      },
      enumerable: true
    },
    BinaryOperator: {
      get: function() {
        return BinaryOperator;
      },
      enumerable: true
    },
    BindingElement: {
      get: function() {
        return BindingElement;
      },
      enumerable: true
    },
    BindingIdentifier: {
      get: function() {
        return BindingIdentifier;
      },
      enumerable: true
    },
    Block: {
      get: function() {
        return Block;
      },
      enumerable: true
    },
    BreakStatement: {
      get: function() {
        return BreakStatement;
      },
      enumerable: true
    },
    CallExpression: {
      get: function() {
        return CallExpression;
      },
      enumerable: true
    },
    CascadeExpression: {
      get: function() {
        return CascadeExpression;
      },
      enumerable: true
    },
    CaseClause: {
      get: function() {
        return CaseClause;
      },
      enumerable: true
    },
    Catch: {
      get: function() {
        return Catch;
      },
      enumerable: true
    },
    ClassDeclaration: {
      get: function() {
        return ClassDeclaration;
      },
      enumerable: true
    },
    ClassExpression: {
      get: function() {
        return ClassExpression;
      },
      enumerable: true
    },
    CommaExpression: {
      get: function() {
        return CommaExpression;
      },
      enumerable: true
    },
    ComprehensionFor: {
      get: function() {
        return ComprehensionFor;
      },
      enumerable: true
    },
    ComprehensionIf: {
      get: function() {
        return ComprehensionIf;
      },
      enumerable: true
    },
    ComputedPropertyName: {
      get: function() {
        return ComputedPropertyName;
      },
      enumerable: true
    },
    ConditionalExpression: {
      get: function() {
        return ConditionalExpression;
      },
      enumerable: true
    },
    ContinueStatement: {
      get: function() {
        return ContinueStatement;
      },
      enumerable: true
    },
    CoverFormals: {
      get: function() {
        return CoverFormals;
      },
      enumerable: true
    },
    CoverInitialisedName: {
      get: function() {
        return CoverInitialisedName;
      },
      enumerable: true
    },
    DebuggerStatement: {
      get: function() {
        return DebuggerStatement;
      },
      enumerable: true
    },
    DefaultClause: {
      get: function() {
        return DefaultClause;
      },
      enumerable: true
    },
    DoWhileStatement: {
      get: function() {
        return DoWhileStatement;
      },
      enumerable: true
    },
    EmptyStatement: {
      get: function() {
        return EmptyStatement;
      },
      enumerable: true
    },
    ExportDeclaration: {
      get: function() {
        return ExportDeclaration;
      },
      enumerable: true
    },
    ExportDefault: {
      get: function() {
        return ExportDefault;
      },
      enumerable: true
    },
    ExportSpecifier: {
      get: function() {
        return ExportSpecifier;
      },
      enumerable: true
    },
    ExportSpecifierSet: {
      get: function() {
        return ExportSpecifierSet;
      },
      enumerable: true
    },
    ExportStar: {
      get: function() {
        return ExportStar;
      },
      enumerable: true
    },
    ExpressionStatement: {
      get: function() {
        return ExpressionStatement;
      },
      enumerable: true
    },
    Finally: {
      get: function() {
        return Finally;
      },
      enumerable: true
    },
    ForInStatement: {
      get: function() {
        return ForInStatement;
      },
      enumerable: true
    },
    ForOfStatement: {
      get: function() {
        return ForOfStatement;
      },
      enumerable: true
    },
    ForStatement: {
      get: function() {
        return ForStatement;
      },
      enumerable: true
    },
    FormalParameterList: {
      get: function() {
        return FormalParameterList;
      },
      enumerable: true
    },
    FunctionBody: {
      get: function() {
        return FunctionBody;
      },
      enumerable: true
    },
    FunctionDeclaration: {
      get: function() {
        return FunctionDeclaration;
      },
      enumerable: true
    },
    FunctionExpression: {
      get: function() {
        return FunctionExpression;
      },
      enumerable: true
    },
    GeneratorComprehension: {
      get: function() {
        return GeneratorComprehension;
      },
      enumerable: true
    },
    GetAccessor: {
      get: function() {
        return GetAccessor;
      },
      enumerable: true
    },
    IdentifierExpression: {
      get: function() {
        return IdentifierExpression;
      },
      enumerable: true
    },
    IfStatement: {
      get: function() {
        return IfStatement;
      },
      enumerable: true
    },
    ImportedBinding: {
      get: function() {
        return ImportedBinding;
      },
      enumerable: true
    },
    ImportDeclaration: {
      get: function() {
        return ImportDeclaration;
      },
      enumerable: true
    },
    ImportSpecifier: {
      get: function() {
        return ImportSpecifier;
      },
      enumerable: true
    },
    ImportSpecifierSet: {
      get: function() {
        return ImportSpecifierSet;
      },
      enumerable: true
    },
    LabelledStatement: {
      get: function() {
        return LabelledStatement;
      },
      enumerable: true
    },
    LiteralExpression: {
      get: function() {
        return LiteralExpression;
      },
      enumerable: true
    },
    LiteralPropertyName: {
      get: function() {
        return LiteralPropertyName;
      },
      enumerable: true
    },
    MemberExpression: {
      get: function() {
        return MemberExpression;
      },
      enumerable: true
    },
    MemberLookupExpression: {
      get: function() {
        return MemberLookupExpression;
      },
      enumerable: true
    },
    Module: {
      get: function() {
        return Module;
      },
      enumerable: true
    },
    ModuleDeclaration: {
      get: function() {
        return ModuleDeclaration;
      },
      enumerable: true
    },
    ModuleSpecifier: {
      get: function() {
        return ModuleSpecifier;
      },
      enumerable: true
    },
    NamedExport: {
      get: function() {
        return NamedExport;
      },
      enumerable: true
    },
    NewExpression: {
      get: function() {
        return NewExpression;
      },
      enumerable: true
    },
    ObjectLiteralExpression: {
      get: function() {
        return ObjectLiteralExpression;
      },
      enumerable: true
    },
    ObjectPattern: {
      get: function() {
        return ObjectPattern;
      },
      enumerable: true
    },
    ObjectPatternField: {
      get: function() {
        return ObjectPatternField;
      },
      enumerable: true
    },
    ParenExpression: {
      get: function() {
        return ParenExpression;
      },
      enumerable: true
    },
    PostfixExpression: {
      get: function() {
        return PostfixExpression;
      },
      enumerable: true
    },
    PredefinedType: {
      get: function() {
        return PredefinedType;
      },
      enumerable: true
    },
    Script: {
      get: function() {
        return Script;
      },
      enumerable: true
    },
    PropertyMethodAssignment: {
      get: function() {
        return PropertyMethodAssignment;
      },
      enumerable: true
    },
    PropertyNameAssignment: {
      get: function() {
        return PropertyNameAssignment;
      },
      enumerable: true
    },
    PropertyNameShorthand: {
      get: function() {
        return PropertyNameShorthand;
      },
      enumerable: true
    },
    RestParameter: {
      get: function() {
        return RestParameter;
      },
      enumerable: true
    },
    ReturnStatement: {
      get: function() {
        return ReturnStatement;
      },
      enumerable: true
    },
    SetAccessor: {
      get: function() {
        return SetAccessor;
      },
      enumerable: true
    },
    SpreadExpression: {
      get: function() {
        return SpreadExpression;
      },
      enumerable: true
    },
    SpreadPatternElement: {
      get: function() {
        return SpreadPatternElement;
      },
      enumerable: true
    },
    SuperExpression: {
      get: function() {
        return SuperExpression;
      },
      enumerable: true
    },
    SwitchStatement: {
      get: function() {
        return SwitchStatement;
      },
      enumerable: true
    },
    SyntaxErrorTree: {
      get: function() {
        return SyntaxErrorTree;
      },
      enumerable: true
    },
    TemplateLiteralExpression: {
      get: function() {
        return TemplateLiteralExpression;
      },
      enumerable: true
    },
    TemplateLiteralPortion: {
      get: function() {
        return TemplateLiteralPortion;
      },
      enumerable: true
    },
    TemplateSubstitution: {
      get: function() {
        return TemplateSubstitution;
      },
      enumerable: true
    },
    ThisExpression: {
      get: function() {
        return ThisExpression;
      },
      enumerable: true
    },
    ThrowStatement: {
      get: function() {
        return ThrowStatement;
      },
      enumerable: true
    },
    TryStatement: {
      get: function() {
        return TryStatement;
      },
      enumerable: true
    },
    TypeName: {
      get: function() {
        return TypeName;
      },
      enumerable: true
    },
    UnaryExpression: {
      get: function() {
        return UnaryExpression;
      },
      enumerable: true
    },
    VariableDeclaration: {
      get: function() {
        return VariableDeclaration;
      },
      enumerable: true
    },
    VariableDeclarationList: {
      get: function() {
        return VariableDeclarationList;
      },
      enumerable: true
    },
    VariableStatement: {
      get: function() {
        return VariableStatement;
      },
      enumerable: true
    },
    WhileStatement: {
      get: function() {
        return WhileStatement;
      },
      enumerable: true
    },
    WithStatement: {
      get: function() {
        return WithStatement;
      },
      enumerable: true
    },
    YieldExpression: {
      get: function() {
        return YieldExpression;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ParseTreeTransformer.js", function() {
  "use strict";
  var $__23 = System.get("../src/syntax/trees/ParseTrees.js"),
      AnonBlock = $__23.AnonBlock,
      ArgumentList = $__23.ArgumentList,
      ArrayComprehension = $__23.ArrayComprehension,
      ArrayLiteralExpression = $__23.ArrayLiteralExpression,
      ArrayPattern = $__23.ArrayPattern,
      ArrowFunctionExpression = $__23.ArrowFunctionExpression,
      AwaitStatement = $__23.AwaitStatement,
      BinaryOperator = $__23.BinaryOperator,
      BindingElement = $__23.BindingElement,
      BindingIdentifier = $__23.BindingIdentifier,
      Block = $__23.Block,
      BreakStatement = $__23.BreakStatement,
      CallExpression = $__23.CallExpression,
      CascadeExpression = $__23.CascadeExpression,
      CaseClause = $__23.CaseClause,
      Catch = $__23.Catch,
      ClassDeclaration = $__23.ClassDeclaration,
      ClassExpression = $__23.ClassExpression,
      CommaExpression = $__23.CommaExpression,
      ComprehensionFor = $__23.ComprehensionFor,
      ComprehensionIf = $__23.ComprehensionIf,
      ComputedPropertyName = $__23.ComputedPropertyName,
      ConditionalExpression = $__23.ConditionalExpression,
      ContinueStatement = $__23.ContinueStatement,
      CoverFormals = $__23.CoverFormals,
      CoverInitialisedName = $__23.CoverInitialisedName,
      DebuggerStatement = $__23.DebuggerStatement,
      DefaultClause = $__23.DefaultClause,
      DoWhileStatement = $__23.DoWhileStatement,
      EmptyStatement = $__23.EmptyStatement,
      ExportDeclaration = $__23.ExportDeclaration,
      ExportDefault = $__23.ExportDefault,
      ExportSpecifier = $__23.ExportSpecifier,
      ExportSpecifierSet = $__23.ExportSpecifierSet,
      ExportStar = $__23.ExportStar,
      ExpressionStatement = $__23.ExpressionStatement,
      Finally = $__23.Finally,
      ForInStatement = $__23.ForInStatement,
      ForOfStatement = $__23.ForOfStatement,
      ForStatement = $__23.ForStatement,
      FormalParameterList = $__23.FormalParameterList,
      FunctionBody = $__23.FunctionBody,
      FunctionDeclaration = $__23.FunctionDeclaration,
      FunctionExpression = $__23.FunctionExpression,
      GeneratorComprehension = $__23.GeneratorComprehension,
      GetAccessor = $__23.GetAccessor,
      IdentifierExpression = $__23.IdentifierExpression,
      IfStatement = $__23.IfStatement,
      ImportedBinding = $__23.ImportedBinding,
      ImportDeclaration = $__23.ImportDeclaration,
      ImportSpecifier = $__23.ImportSpecifier,
      ImportSpecifierSet = $__23.ImportSpecifierSet,
      LabelledStatement = $__23.LabelledStatement,
      LiteralExpression = $__23.LiteralExpression,
      LiteralPropertyName = $__23.LiteralPropertyName,
      MemberExpression = $__23.MemberExpression,
      MemberLookupExpression = $__23.MemberLookupExpression,
      Module = $__23.Module,
      ModuleDeclaration = $__23.ModuleDeclaration,
      ModuleSpecifier = $__23.ModuleSpecifier,
      NamedExport = $__23.NamedExport,
      NewExpression = $__23.NewExpression,
      ObjectLiteralExpression = $__23.ObjectLiteralExpression,
      ObjectPattern = $__23.ObjectPattern,
      ObjectPatternField = $__23.ObjectPatternField,
      ParenExpression = $__23.ParenExpression,
      PostfixExpression = $__23.PostfixExpression,
      PredefinedType = $__23.PredefinedType,
      Script = $__23.Script,
      PropertyMethodAssignment = $__23.PropertyMethodAssignment,
      PropertyNameAssignment = $__23.PropertyNameAssignment,
      PropertyNameShorthand = $__23.PropertyNameShorthand,
      RestParameter = $__23.RestParameter,
      ReturnStatement = $__23.ReturnStatement,
      SetAccessor = $__23.SetAccessor,
      SpreadExpression = $__23.SpreadExpression,
      SpreadPatternElement = $__23.SpreadPatternElement,
      SuperExpression = $__23.SuperExpression,
      SwitchStatement = $__23.SwitchStatement,
      SyntaxErrorTree = $__23.SyntaxErrorTree,
      TemplateLiteralExpression = $__23.TemplateLiteralExpression,
      TemplateLiteralPortion = $__23.TemplateLiteralPortion,
      TemplateSubstitution = $__23.TemplateSubstitution,
      ThisExpression = $__23.ThisExpression,
      ThrowStatement = $__23.ThrowStatement,
      TryStatement = $__23.TryStatement,
      TypeName = $__23.TypeName,
      UnaryExpression = $__23.UnaryExpression,
      VariableDeclaration = $__23.VariableDeclaration,
      VariableDeclarationList = $__23.VariableDeclarationList,
      VariableStatement = $__23.VariableStatement,
      WhileStatement = $__23.WhileStatement,
      WithStatement = $__23.WithStatement,
      YieldExpression = $__23.YieldExpression;
  function ParseTreeTransformer() {}
  ($__class)(ParseTreeTransformer, {
    transformAny: function(tree) {
      return tree && tree.transform(this);
    },
    transformList: function(list) {
      var $__24;
      var builder = null;
      for (var index = 0; index < list.length; index++) {
        var element = list[index];
        var transformed = this.transformAny(element);
        if (builder != null || element != transformed) {
          if (builder == null) {
            builder = list.slice(0, index);
          }
          if (transformed instanceof AnonBlock)($__24 = builder).push.apply($__24, $__toObject(transformed.statements)); else builder.push(transformed);
        }
      }
      return builder || list;
    },
    transformStateMachine: function(tree) {
      throw Error('State machines should not live outside of the GeneratorTransformer.');
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
      var formalParameters = this.transformAny(tree.formalParameters);
      var functionBody = this.transformAny(tree.functionBody);
      if (formalParameters === tree.formalParameters && functionBody === tree.functionBody) {
        return tree;
      }
      return new ArrowFunctionExpression(tree.location, formalParameters, functionBody);
    },
    transformAwaitStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression === tree.expression) {
        return tree;
      }
      return new AwaitStatement(tree.location, tree.identifier, expression);
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
    transformCascadeExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var expressions = this.transformList(tree.expressions);
      if (operand === tree.operand && expressions === tree.expressions) {
        return tree;
      }
      return new CascadeExpression(tree.location, operand, expressions);
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
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements) {
        return tree;
      }
      return new ClassDeclaration(tree.location, name, superClass, elements);
    },
    transformClassExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (name === tree.name && superClass === tree.superClass && elements === tree.elements) {
        return tree;
      }
      return new ClassExpression(tree.location, name, superClass, elements);
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
      if (declaration === tree.declaration) {
        return tree;
      }
      return new ExportDeclaration(tree.location, declaration);
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
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, name, tree.isGenerator, formalParameterList, functionBody);
    },
    transformFunctionExpression: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
        return tree;
      }
      return new FunctionExpression(tree.location, name, tree.isGenerator, formalParameterList, functionBody);
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
      var body = this.transformAny(tree.body);
      if (name === tree.name && body === tree.body) {
        return tree;
      }
      return new GetAccessor(tree.location, tree.isStatic, name, body);
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
      return new Module(tree.location, scriptItemList);
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
      return new Script(tree.location, scriptItemList);
    },
    transformPropertyMethodAssignment: function(tree) {
      var name = this.transformAny(tree.name);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformAny(tree.functionBody);
      if (name === tree.name && formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
        return tree;
      }
      return new PropertyMethodAssignment(tree.location, tree.isStatic, tree.isGenerator, name, formalParameterList, functionBody);
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
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformAny(tree.body);
      if (name === tree.name && parameter === tree.parameter && body === tree.body) {
        return tree;
      }
      return new SetAccessor(tree.location, tree.isStatic, name, parameter, body);
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
  return Object.preventExtensions(Object.create(null, {ParseTreeTransformer: {
      get: function() {
        return ParseTreeTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/AssignmentPatternTransformer.js", function() {
  "use strict";
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__26 = System.get("../src/syntax/trees/ParseTrees.js"),
      ArrayPattern = $__26.ArrayPattern,
      BindingElement = $__26.BindingElement,
      BindingIdentifier = $__26.BindingIdentifier,
      IdentifierExpression = $__26.IdentifierExpression,
      ObjectPattern = $__26.ObjectPattern,
      ObjectPatternField = $__26.ObjectPatternField,
      SpreadPatternElement = $__26.SpreadPatternElement;
  var EQUAL = System.get("../src/syntax/TokenType.js").EQUAL;
  function AssignmentPatternTransformerError() {
    $__AssignmentPatternTransformerError__proto !== null && $__superCall(this, $__AssignmentPatternTransformerError__proto, "constructor", arguments);
  }
  var $__AssignmentPatternTransformerError__super = Error;
  var $__AssignmentPatternTransformerError__proto = $__getProtoParent($__AssignmentPatternTransformerError__super);
  ($__class)(AssignmentPatternTransformerError, {}, {}, $__AssignmentPatternTransformerError__super, $__AssignmentPatternTransformerError__proto);
  function AssignmentPatternTransformer() {
    $__AssignmentPatternTransformer__proto !== null && $__superCall(this, $__AssignmentPatternTransformer__proto, "constructor", arguments);
  }
  var $__AssignmentPatternTransformer__super = ParseTreeTransformer;
  var $__AssignmentPatternTransformer__proto = $__getProtoParent($__AssignmentPatternTransformer__super);
  ($__class)(AssignmentPatternTransformer, {
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== EQUAL) throw new AssignmentPatternTransformerError();
      var bindingElement = this.transformAny(tree.left);
      if (bindingElement instanceof BindingElement) bindingElement = bindingElement.binding;
      return new BindingElement(tree.location, bindingElement, tree.right);
    },
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      return new ArrayPattern(tree.location, elements);
    },
    transformCoverInitialisedName: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.name.location, tree.name), this.transformAny(tree.initializer));
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
  }, {}, $__AssignmentPatternTransformer__super, $__AssignmentPatternTransformer__proto);
  return Object.preventExtensions(Object.create(null, {
    AssignmentPatternTransformerError: {
      get: function() {
        return AssignmentPatternTransformerError;
      },
      enumerable: true
    },
    AssignmentPatternTransformer: {
      get: function() {
        return AssignmentPatternTransformer;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/CoverFormalsTransformer.js", function() {
  "use strict";
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__28 = System.get("../src/syntax/trees/ParseTrees.js"),
      ArrayPattern = $__28.ArrayPattern,
      BindingElement = $__28.BindingElement,
      BindingIdentifier = $__28.BindingIdentifier,
      FormalParameterList = $__28.FormalParameterList,
      ObjectPattern = $__28.ObjectPattern,
      ObjectPatternField = $__28.ObjectPatternField,
      RestParameter = $__28.RestParameter,
      SpreadPatternElement = $__28.SpreadPatternElement;
  var EQUAL = System.get("../src/syntax/TokenType.js").EQUAL;
  var IDENTIFIER_EXPRESSION = System.get("../src/syntax/trees/ParseTreeType.js").IDENTIFIER_EXPRESSION;
  var AssignmentPatternTransformerError = System.get("../src/codegeneration/AssignmentPatternTransformer.js").AssignmentPatternTransformerError;
  function CoverFormalsTransformerError() {
    $__CoverFormalsTransformerError__proto !== null && $__superCall(this, $__CoverFormalsTransformerError__proto, "constructor", arguments);
  }
  var $__CoverFormalsTransformerError__super = Error;
  var $__CoverFormalsTransformerError__proto = $__getProtoParent($__CoverFormalsTransformerError__super);
  ($__class)(CoverFormalsTransformerError, {}, {}, $__CoverFormalsTransformerError__super, $__CoverFormalsTransformerError__proto);
  function CoverFormalsTransformer() {
    this.isValid = true;
    this.inArrayPattern_ = false;
  }
  ($__class)(CoverFormalsTransformer, {
    transformCoverFormals: function(tree) {
      var expressions = this.transformList(tree.expressions);
      return new FormalParameterList(tree.location, expressions);
    },
    transformIdentifierExpression: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.identifierToken), null);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.type !== EQUAL) throw new CoverFormalsTransformerError();
      var bindingElement = this.transformAny(tree.left);
      if (bindingElement instanceof BindingElement) bindingElement = bindingElement.binding;
      return new BindingElement(tree.location, bindingElement, tree.right);
    },
    transformArrayLiteralExpression: function(tree) {
      var wasInArrayPattern = this.inArrayPattern_;
      this.inArrayPattern_ = true;
      var elements = this.transformList(tree.elements);
      this.inArrayPattern_ = wasInArrayPattern;
      var okIndex = elements.length - 1;
      for (var i = 0; i < okIndex; i++) {
        if (elements[i]instanceof SpreadPatternElement) throw new CoverFormalsTransformerError();
      }
      return new BindingElement(tree.location, new ArrayPattern(tree.location, elements), null);
    },
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      return new BindingElement(tree.location, new ObjectPattern(tree.location, propertyNameAndValues), null);
    },
    transformPropertyNameAssignment: function(tree) {
      return new ObjectPatternField(tree.location, tree.name, this.transformAny(tree.value));
    },
    transformPropertyNameShorthand: function(tree) {
      return new BindingElement(tree.location, new BindingIdentifier(tree.location, tree.name), null);
    },
    transformSpreadExpression: function(tree) {
      if (tree.expression.type !== IDENTIFIER_EXPRESSION) throw new CoverFormalsTransformerError();
      var bindingIdentifier = new BindingIdentifier(tree.expression.location, tree.expression.identifierToken);
      if (this.inArrayPattern_) return new SpreadPatternElement(tree.location, bindingIdentifier);
      return new RestParameter(tree.location, bindingIdentifier);
    },
    transformSyntaxErrorTree: function(tree) {
      throw new AssignmentPatternTransformerError();
    }
  }, {}, ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {
    CoverFormalsTransformerError: {
      get: function() {
        return CoverFormalsTransformerError;
      },
      enumerable: true
    },
    CoverFormalsTransformer: {
      get: function() {
        return CoverFormalsTransformer;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/Keywords.js", function() {
  "use strict";
  var keywords = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'enum', 'extends', 'null', 'true', 'false', 'await'];
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
  return Object.preventExtensions(Object.create(null, {
    NORMAL_KEYWORD: {
      get: function() {
        return NORMAL_KEYWORD;
      },
      enumerable: true
    },
    STRICT_KEYWORD: {
      get: function() {
        return STRICT_KEYWORD;
      },
      enumerable: true
    },
    getKeywordType: {
      get: function() {
        return getKeywordType;
      },
      enumerable: true
    },
    isStrictKeyword: {
      get: function() {
        return isStrictKeyword;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/staticsemantics/StrictParams.js", function() {
  "use strict";
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var isStrictKeyword = System.get("../src/syntax/Keywords.js").isStrictKeyword;
  function StrictParams(errorReporter) {
    $__superCall(this, $__StrictParams__proto, "constructor", []);
    this.errorReporter = errorReporter;
  }
  var $__StrictParams__super = ParseTreeVisitor;
  var $__StrictParams__proto = $__getProtoParent($__StrictParams__super);
  ($__class)(StrictParams, {visitBindingIdentifier: function(tree) {
      var name = tree.identifierToken.toString();
      if (isStrictKeyword(name)) {
        this.errorReporter.reportError(tree.location.start, (name + " is a reserved identifier"));
      }
    }}, {visit: function(tree, errorReporter) {
      new StrictParams(errorReporter).visitAny(tree);
    }}, $__StrictParams__super, $__StrictParams__proto);
  return Object.preventExtensions(Object.create(null, {StrictParams: {
      get: function() {
        return StrictParams;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/SourceRange.js", function() {
  "use strict";
  function SourceRange(start, end) {
    this.start = start;
    this.end = end;
  }
  ($__class)(SourceRange, {}, {});
  return Object.preventExtensions(Object.create(null, {SourceRange: {
      get: function() {
        return SourceRange;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/IdentifierToken.js", function() {
  "use strict";
  var Token = System.get("../src/syntax/Token.js").Token;
  var IDENTIFIER = System.get("../src/syntax/TokenType.js").IDENTIFIER;
  function IdentifierToken(location, value) {
    this.location = location;
    this.value = value;
  }
  ($__class)(IdentifierToken, {
    toString: function() {
      return this.value;
    },
    get type() {
      return IDENTIFIER;
    }
  }, {}, Token);
  return Object.preventExtensions(Object.create(null, {IdentifierToken: {
      get: function() {
        return IdentifierToken;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/PredefinedName.js", function() {
  "use strict";
  var ANY = 'any';
  var $ARGUMENTS = '$arguments';
  var $THAT = '$that';
  var $VALUE = '$value';
  var ADD_CONTINUATION = 'addContinuation';
  var APPLY = 'apply';
  var ARGUMENTS = 'arguments';
  var ARRAY = 'Array';
  var AS = 'as';
  var ASSERT_NAME = 'assertName';
  var BIND = 'bind';
  var BOOL = 'bool';
  var CALL = 'call';
  var CALLBACK = 'callback';
  var CAUGHT_EXCEPTION = '$caughtException';
  var CLOSE = 'close';
  var CONFIGURABLE = 'configurable';
  var CONSTRUCTOR = 'constructor';
  var CONTINUATION = '$continuation';
  var CREATE = 'create';
  var CREATE_CALLBACK = '$createCallback';
  var CREATE_ERRBACK = '$createErrback';
  var CREATE_PROMISE = 'createPromise';
  var CURRENT = 'current';
  var DEFERRED = 'Deferred';
  var DEFINE_PROPERTIES = 'defineProperties';
  var DEFINE_PROPERTY = 'defineProperty';
  var DELETE_PROPERTY = 'deleteProperty';
  var ELEMENT_DELETE = 'elementDelete';
  var ELEMENT_GET = 'elementGet';
  var ELEMENT_HAS = 'elementHas';
  var ELEMENT_SET = 'elementSet';
  var ENUMERABLE = 'enumerable';
  var ERR = '$err';
  var ERRBACK = 'errback';
  var FINALLY_FALL_THROUGH = '$finallyFallThrough';
  var FREEZE = 'freeze';
  var FROM = 'from';
  var FUNCTION = 'Function';
  var GET = 'get';
  var HAS = 'has';
  var LENGTH = 'length';
  var MODULE = 'module';
  var NEW = 'new';
  var NEW_STATE = '$newState';
  var NUMBER = 'number';
  var OBJECT = 'Object';
  var OBJECT_NAME = 'Object';
  var OF = 'of';
  var PREVENT_EXTENSIONS = 'preventExtensions';
  var PROTOTYPE = 'prototype';
  var PUSH = 'push';
  var RAW = 'raw';
  var RESULT = '$result';
  var SET = 'set';
  var SLICE = 'slice';
  var SPREAD = 'spread';
  var SPREAD_NEW = 'spreadNew';
  var STATE = '$state';
  var STORED_EXCEPTION = '$storedException';
  var STRING = 'string';
  var THEN = 'then';
  var THIS = 'this';
  var TRACEUR_RUNTIME = '$traceurRuntime';
  var UNDEFINED = 'undefined';
  var WAIT_TASK = '$waitTask';
  var WRITABLE = 'writable';
  var YIELD_ACTION = '$yieldAction';
  var YIELD_RETURN = 'yieldReturn';
  var YIELD_SENT = '$yieldSent';
  function getParameterName(index) {
    return '$' + index;
  }
  ;
  var ACTION_SEND = 0;
  var ACTION_THROW = 1;
  return Object.preventExtensions(Object.create(null, {
    ANY: {
      get: function() {
        return ANY;
      },
      enumerable: true
    },
    $ARGUMENTS: {
      get: function() {
        return $ARGUMENTS;
      },
      enumerable: true
    },
    $THAT: {
      get: function() {
        return $THAT;
      },
      enumerable: true
    },
    $VALUE: {
      get: function() {
        return $VALUE;
      },
      enumerable: true
    },
    ADD_CONTINUATION: {
      get: function() {
        return ADD_CONTINUATION;
      },
      enumerable: true
    },
    APPLY: {
      get: function() {
        return APPLY;
      },
      enumerable: true
    },
    ARGUMENTS: {
      get: function() {
        return ARGUMENTS;
      },
      enumerable: true
    },
    ARRAY: {
      get: function() {
        return ARRAY;
      },
      enumerable: true
    },
    AS: {
      get: function() {
        return AS;
      },
      enumerable: true
    },
    ASSERT_NAME: {
      get: function() {
        return ASSERT_NAME;
      },
      enumerable: true
    },
    BIND: {
      get: function() {
        return BIND;
      },
      enumerable: true
    },
    BOOL: {
      get: function() {
        return BOOL;
      },
      enumerable: true
    },
    CALL: {
      get: function() {
        return CALL;
      },
      enumerable: true
    },
    CALLBACK: {
      get: function() {
        return CALLBACK;
      },
      enumerable: true
    },
    CAUGHT_EXCEPTION: {
      get: function() {
        return CAUGHT_EXCEPTION;
      },
      enumerable: true
    },
    CLOSE: {
      get: function() {
        return CLOSE;
      },
      enumerable: true
    },
    CONFIGURABLE: {
      get: function() {
        return CONFIGURABLE;
      },
      enumerable: true
    },
    CONSTRUCTOR: {
      get: function() {
        return CONSTRUCTOR;
      },
      enumerable: true
    },
    CONTINUATION: {
      get: function() {
        return CONTINUATION;
      },
      enumerable: true
    },
    CREATE: {
      get: function() {
        return CREATE;
      },
      enumerable: true
    },
    CREATE_CALLBACK: {
      get: function() {
        return CREATE_CALLBACK;
      },
      enumerable: true
    },
    CREATE_ERRBACK: {
      get: function() {
        return CREATE_ERRBACK;
      },
      enumerable: true
    },
    CREATE_PROMISE: {
      get: function() {
        return CREATE_PROMISE;
      },
      enumerable: true
    },
    CURRENT: {
      get: function() {
        return CURRENT;
      },
      enumerable: true
    },
    DEFERRED: {
      get: function() {
        return DEFERRED;
      },
      enumerable: true
    },
    DEFINE_PROPERTIES: {
      get: function() {
        return DEFINE_PROPERTIES;
      },
      enumerable: true
    },
    DEFINE_PROPERTY: {
      get: function() {
        return DEFINE_PROPERTY;
      },
      enumerable: true
    },
    DELETE_PROPERTY: {
      get: function() {
        return DELETE_PROPERTY;
      },
      enumerable: true
    },
    ELEMENT_DELETE: {
      get: function() {
        return ELEMENT_DELETE;
      },
      enumerable: true
    },
    ELEMENT_GET: {
      get: function() {
        return ELEMENT_GET;
      },
      enumerable: true
    },
    ELEMENT_HAS: {
      get: function() {
        return ELEMENT_HAS;
      },
      enumerable: true
    },
    ELEMENT_SET: {
      get: function() {
        return ELEMENT_SET;
      },
      enumerable: true
    },
    ENUMERABLE: {
      get: function() {
        return ENUMERABLE;
      },
      enumerable: true
    },
    ERR: {
      get: function() {
        return ERR;
      },
      enumerable: true
    },
    ERRBACK: {
      get: function() {
        return ERRBACK;
      },
      enumerable: true
    },
    FINALLY_FALL_THROUGH: {
      get: function() {
        return FINALLY_FALL_THROUGH;
      },
      enumerable: true
    },
    FREEZE: {
      get: function() {
        return FREEZE;
      },
      enumerable: true
    },
    FROM: {
      get: function() {
        return FROM;
      },
      enumerable: true
    },
    FUNCTION: {
      get: function() {
        return FUNCTION;
      },
      enumerable: true
    },
    GET: {
      get: function() {
        return GET;
      },
      enumerable: true
    },
    HAS: {
      get: function() {
        return HAS;
      },
      enumerable: true
    },
    LENGTH: {
      get: function() {
        return LENGTH;
      },
      enumerable: true
    },
    MODULE: {
      get: function() {
        return MODULE;
      },
      enumerable: true
    },
    NEW: {
      get: function() {
        return NEW;
      },
      enumerable: true
    },
    NEW_STATE: {
      get: function() {
        return NEW_STATE;
      },
      enumerable: true
    },
    NUMBER: {
      get: function() {
        return NUMBER;
      },
      enumerable: true
    },
    OBJECT: {
      get: function() {
        return OBJECT;
      },
      enumerable: true
    },
    OBJECT_NAME: {
      get: function() {
        return OBJECT_NAME;
      },
      enumerable: true
    },
    OF: {
      get: function() {
        return OF;
      },
      enumerable: true
    },
    PREVENT_EXTENSIONS: {
      get: function() {
        return PREVENT_EXTENSIONS;
      },
      enumerable: true
    },
    PROTOTYPE: {
      get: function() {
        return PROTOTYPE;
      },
      enumerable: true
    },
    PUSH: {
      get: function() {
        return PUSH;
      },
      enumerable: true
    },
    RAW: {
      get: function() {
        return RAW;
      },
      enumerable: true
    },
    RESULT: {
      get: function() {
        return RESULT;
      },
      enumerable: true
    },
    SET: {
      get: function() {
        return SET;
      },
      enumerable: true
    },
    SLICE: {
      get: function() {
        return SLICE;
      },
      enumerable: true
    },
    SPREAD: {
      get: function() {
        return SPREAD;
      },
      enumerable: true
    },
    SPREAD_NEW: {
      get: function() {
        return SPREAD_NEW;
      },
      enumerable: true
    },
    STATE: {
      get: function() {
        return STATE;
      },
      enumerable: true
    },
    STORED_EXCEPTION: {
      get: function() {
        return STORED_EXCEPTION;
      },
      enumerable: true
    },
    STRING: {
      get: function() {
        return STRING;
      },
      enumerable: true
    },
    THEN: {
      get: function() {
        return THEN;
      },
      enumerable: true
    },
    THIS: {
      get: function() {
        return THIS;
      },
      enumerable: true
    },
    TRACEUR_RUNTIME: {
      get: function() {
        return TRACEUR_RUNTIME;
      },
      enumerable: true
    },
    UNDEFINED: {
      get: function() {
        return UNDEFINED;
      },
      enumerable: true
    },
    WAIT_TASK: {
      get: function() {
        return WAIT_TASK;
      },
      enumerable: true
    },
    WRITABLE: {
      get: function() {
        return WRITABLE;
      },
      enumerable: true
    },
    YIELD_ACTION: {
      get: function() {
        return YIELD_ACTION;
      },
      enumerable: true
    },
    YIELD_RETURN: {
      get: function() {
        return YIELD_RETURN;
      },
      enumerable: true
    },
    YIELD_SENT: {
      get: function() {
        return YIELD_SENT;
      },
      enumerable: true
    },
    getParameterName: {
      get: function() {
        return getParameterName;
      },
      enumerable: true
    },
    ACTION_SEND: {
      get: function() {
        return ACTION_SEND;
      },
      enumerable: true
    },
    ACTION_THROW: {
      get: function() {
        return ACTION_THROW;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/KeywordToken.js", function() {
  "use strict";
  var STRICT_KEYWORD = System.get("../src/syntax/Keywords.js").STRICT_KEYWORD;
  var Token = System.get("../src/syntax/Token.js").Token;
  function KeywordToken(type, keywordType, location) {
    this.type = type;
    this.location = location;
    this.isStrictKeyword_ = keywordType === STRICT_KEYWORD;
  }
  ($__class)(KeywordToken, {
    isKeyword: function() {
      return true;
    },
    isStrictKeyword: function() {
      return this.isStrictKeyword_;
    }
  }, {}, Token);
  return Object.preventExtensions(Object.create(null, {KeywordToken: {
      get: function() {
        return KeywordToken;
      },
      enumerable: true
    }}));
}, this);
var $__iterator = '@@iterator',
    $__getIterator = function(object) {
      return object[$__iterator]();
    };
System.get('@traceur/module').registerModule("../src/syntax/LiteralToken.js", function() {
  "use strict";
  var Token = System.get("../src/syntax/Token.js").Token;
  var $__39 = System.get("../src/syntax/TokenType.js"),
      NULL = $__39.NULL,
      NUMBER = $__39.NUMBER,
      STRING = $__39.STRING;
  var iterator = System.get("@iter").iterator;
  function StringParser(value) {
    this.value = value;
    this.index = 0;
    Object.setProperty(this, iterator, (function() {
      return this;
    }).bind(this));
  }
  ($__class)(StringParser, {
    next: function() {
      if (++this.index >= this.value.length - 1) return {
        value: undefined,
        done: true
      };
      return {
        value: this.value[this.index],
        done: false
      };
    },
    parse: function() {
      if (this.value.indexOf('\\') === - 1) return this.value.slice(1, - 1);
      var result = '';
      for (var $__37 = $__getIterator(this),
          $__38; !($__38 = $__37.next()).done;) {
        var ch = $__38.value;
        {
          result += ch === '\\' ? this.parseEscapeSequence(): ch;
        }
      }
      return result;
    },
    parseEscapeSequence: function() {
      var ch = this.next();
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
          return String.fromCharCode(parseInt(this.next() + this.next(), 16));
        case 'u':
          return String.fromCharCode(parseInt(this.next() + this.next() + this.next() + this.next(), 16));
        default:
          if (Number(ch) < 8) throw new Error('Octal literals are not supported');
          return ch;
      }
    }
  }, {});
  function LiteralToken(type, value, location) {
    this.type = type;
    this.location = location;
    this.value = value;
  }
  ($__class)(LiteralToken, {
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
  return Object.preventExtensions(Object.create(null, {LiteralToken: {
      get: function() {
        return LiteralToken;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/unicode-tables.js", function() {
  "use strict";
  var idStartTable = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 442, 443, 443, 444, 447, 448, 451, 452, 659, 660, 660, 661, 687, 688, 705, 710, 721, 736, 740, 748, 748, 750, 750, 880, 883, 884, 884, 886, 887, 890, 890, 891, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1599, 1600, 1600, 1601, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957, 1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069, 2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2208, 2208, 2210, 2220, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2417, 2418, 2423, 2425, 2431, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3653, 3654, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3807, 3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198, 4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4295, 4295, 4301, 4301, 4304, 4346, 4348, 4348, 4349, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6103, 6103, 6108, 6108, 6176, 6210, 6211, 6211, 6212, 6263, 6272, 6312, 6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516, 6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7098, 7141, 7168, 7203, 7245, 7247, 7258, 7287, 7288, 7293, 7401, 7404, 7406, 7409, 7413, 7414, 7424, 7467, 7468, 7530, 7531, 7543, 7544, 7544, 7545, 7578, 7579, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8472, 8472, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8494, 8494, 8495, 8500, 8501, 8504, 8505, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8578, 8579, 8580, 8581, 8584, 11264, 11310, 11312, 11358, 11360, 11387, 11388, 11389, 11390, 11492, 11499, 11502, 11506, 11507, 11520, 11557, 11559, 11559, 11565, 11565, 11568, 11623, 11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 12293, 12293, 12294, 12294, 12295, 12295, 12321, 12329, 12337, 12341, 12344, 12346, 12347, 12347, 12348, 12348, 12353, 12438, 12443, 12444, 12445, 12446, 12447, 12447, 12449, 12538, 12540, 12542, 12543, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 19893, 19968, 40908, 40960, 40980, 40981, 40981, 40982, 42124, 42192, 42231, 42232, 42237, 42240, 42507, 42508, 42508, 42512, 42527, 42538, 42539, 42560, 42605, 42606, 42606, 42623, 42623, 42624, 42647, 42656, 42725, 42726, 42735, 42775, 42783, 42786, 42863, 42864, 42864, 42865, 42887, 42888, 42888, 42891, 42894, 42896, 42899, 42912, 42922, 43000, 43001, 43002, 43002, 43003, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43631, 43632, 43632, 43633, 43638, 43642, 43642, 43648, 43695, 43697, 43697, 43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714, 43739, 43740, 43741, 43741, 43744, 43754, 43762, 43762, 43763, 43764, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44002, 44032, 55203, 55216, 55238, 55243, 55291, 63744, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65391, 65392, 65392, 65393, 65437, 65438, 65439, 65440, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594, 65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786, 65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334, 66352, 66368, 66369, 66369, 66370, 66377, 66378, 66378, 66432, 66461, 66464, 66499, 66504, 66511, 66513, 66517, 66560, 66639, 66640, 66717, 67584, 67589, 67592, 67592, 67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669, 67840, 67861, 67872, 67897, 67968, 68023, 68030, 68031, 68096, 68096, 68112, 68115, 68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405, 68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687, 69763, 69807, 69840, 69864, 69891, 69926, 70019, 70066, 70081, 70084, 71296, 71338, 73728, 74606, 74752, 74850, 77824, 78894, 92160, 92728, 93952, 94020, 94032, 94032, 94099, 94111, 110592, 110593, 119808, 119892, 119894, 119964, 119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980, 119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069, 120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121, 120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144, 120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570, 120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686, 120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779, 126464, 126467, 126469, 126495, 126497, 126498, 126500, 126500, 126503, 126503, 126505, 126514, 126516, 126519, 126521, 126521, 126523, 126523, 126530, 126530, 126535, 126535, 126537, 126537, 126539, 126539, 126541, 126543, 126545, 126546, 126548, 126548, 126551, 126551, 126553, 126553, 126555, 126555, 126557, 126557, 126559, 126559, 126561, 126562, 126564, 126564, 126567, 126570, 126572, 126578, 126580, 126583, 126585, 126588, 126590, 126590, 126592, 126601, 126603, 126619, 126625, 126627, 126629, 126633, 126635, 126651, 131072, 173782, 173824, 177972, 177984, 178205, 194560, 195101];
  var idContinueTable = [183, 183, 768, 879, 903, 903, 1155, 1159, 1425, 1469, 1471, 1471, 1473, 1474, 1476, 1477, 1479, 1479, 1552, 1562, 1611, 1631, 1632, 1641, 1648, 1648, 1750, 1756, 1759, 1764, 1767, 1768, 1770, 1773, 1776, 1785, 1809, 1809, 1840, 1866, 1958, 1968, 1984, 1993, 2027, 2035, 2070, 2073, 2075, 2083, 2085, 2087, 2089, 2093, 2137, 2139, 2276, 2302, 2304, 2306, 2307, 2307, 2362, 2362, 2363, 2363, 2364, 2364, 2366, 2368, 2369, 2376, 2377, 2380, 2381, 2381, 2382, 2383, 2385, 2391, 2402, 2403, 2406, 2415, 2433, 2433, 2434, 2435, 2492, 2492, 2494, 2496, 2497, 2500, 2503, 2504, 2507, 2508, 2509, 2509, 2519, 2519, 2530, 2531, 2534, 2543, 2561, 2562, 2563, 2563, 2620, 2620, 2622, 2624, 2625, 2626, 2631, 2632, 2635, 2637, 2641, 2641, 2662, 2671, 2672, 2673, 2677, 2677, 2689, 2690, 2691, 2691, 2748, 2748, 2750, 2752, 2753, 2757, 2759, 2760, 2761, 2761, 2763, 2764, 2765, 2765, 2786, 2787, 2790, 2799, 2817, 2817, 2818, 2819, 2876, 2876, 2878, 2878, 2879, 2879, 2880, 2880, 2881, 2884, 2887, 2888, 2891, 2892, 2893, 2893, 2902, 2902, 2903, 2903, 2914, 2915, 2918, 2927, 2946, 2946, 3006, 3007, 3008, 3008, 3009, 3010, 3014, 3016, 3018, 3020, 3021, 3021, 3031, 3031, 3046, 3055, 3073, 3075, 3134, 3136, 3137, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3170, 3171, 3174, 3183, 3202, 3203, 3260, 3260, 3262, 3262, 3263, 3263, 3264, 3268, 3270, 3270, 3271, 3272, 3274, 3275, 3276, 3277, 3285, 3286, 3298, 3299, 3302, 3311, 3330, 3331, 3390, 3392, 3393, 3396, 3398, 3400, 3402, 3404, 3405, 3405, 3415, 3415, 3426, 3427, 3430, 3439, 3458, 3459, 3530, 3530, 3535, 3537, 3538, 3540, 3542, 3542, 3544, 3551, 3570, 3571, 3633, 3633, 3636, 3642, 3655, 3662, 3664, 3673, 3761, 3761, 3764, 3769, 3771, 3772, 3784, 3789, 3792, 3801, 3864, 3865, 3872, 3881, 3893, 3893, 3895, 3895, 3897, 3897, 3902, 3903, 3953, 3966, 3967, 3967, 3968, 3972, 3974, 3975, 3981, 3991, 3993, 4028, 4038, 4038, 4139, 4140, 4141, 4144, 4145, 4145, 4146, 4151, 4152, 4152, 4153, 4154, 4155, 4156, 4157, 4158, 4160, 4169, 4182, 4183, 4184, 4185, 4190, 4192, 4194, 4196, 4199, 4205, 4209, 4212, 4226, 4226, 4227, 4228, 4229, 4230, 4231, 4236, 4237, 4237, 4239, 4239, 4240, 4249, 4250, 4252, 4253, 4253, 4957, 4959, 4969, 4977, 5906, 5908, 5938, 5940, 5970, 5971, 6002, 6003, 6068, 6069, 6070, 6070, 6071, 6077, 6078, 6085, 6086, 6086, 6087, 6088, 6089, 6099, 6109, 6109, 6112, 6121, 6155, 6157, 6160, 6169, 6313, 6313, 6432, 6434, 6435, 6438, 6439, 6440, 6441, 6443, 6448, 6449, 6450, 6450, 6451, 6456, 6457, 6459, 6470, 6479, 6576, 6592, 6600, 6601, 6608, 6617, 6618, 6618, 6679, 6680, 6681, 6683, 6741, 6741, 6742, 6742, 6743, 6743, 6744, 6750, 6752, 6752, 6753, 6753, 6754, 6754, 6755, 6756, 6757, 6764, 6765, 6770, 6771, 6780, 6783, 6783, 6784, 6793, 6800, 6809, 6912, 6915, 6916, 6916, 6964, 6964, 6965, 6965, 6966, 6970, 6971, 6971, 6972, 6972, 6973, 6977, 6978, 6978, 6979, 6980, 6992, 7001, 7019, 7027, 7040, 7041, 7042, 7042, 7073, 7073, 7074, 7077, 7078, 7079, 7080, 7081, 7082, 7082, 7083, 7083, 7084, 7085, 7088, 7097, 7142, 7142, 7143, 7143, 7144, 7145, 7146, 7148, 7149, 7149, 7150, 7150, 7151, 7153, 7154, 7155, 7204, 7211, 7212, 7219, 7220, 7221, 7222, 7223, 7232, 7241, 7248, 7257, 7376, 7378, 7380, 7392, 7393, 7393, 7394, 7400, 7405, 7405, 7410, 7411, 7412, 7412, 7616, 7654, 7676, 7679, 8255, 8256, 8276, 8276, 8400, 8412, 8417, 8417, 8421, 8432, 11503, 11505, 11647, 11647, 11744, 11775, 12330, 12333, 12334, 12335, 12441, 12442, 42528, 42537, 42607, 42607, 42612, 42621, 42655, 42655, 42736, 42737, 43010, 43010, 43014, 43014, 43019, 43019, 43043, 43044, 43045, 43046, 43047, 43047, 43136, 43137, 43188, 43203, 43204, 43204, 43216, 43225, 43232, 43249, 43264, 43273, 43302, 43309, 43335, 43345, 43346, 43347, 43392, 43394, 43395, 43395, 43443, 43443, 43444, 43445, 43446, 43449, 43450, 43451, 43452, 43452, 43453, 43456, 43472, 43481, 43561, 43566, 43567, 43568, 43569, 43570, 43571, 43572, 43573, 43574, 43587, 43587, 43596, 43596, 43597, 43597, 43600, 43609, 43643, 43643, 43696, 43696, 43698, 43700, 43703, 43704, 43710, 43711, 43713, 43713, 43755, 43755, 43756, 43757, 43758, 43759, 43765, 43765, 43766, 43766, 44003, 44004, 44005, 44005, 44006, 44007, 44008, 44008, 44009, 44010, 44012, 44012, 44013, 44013, 44016, 44025, 64286, 64286, 65024, 65039, 65056, 65062, 65075, 65076, 65101, 65103, 65296, 65305, 65343, 65343, 66045, 66045, 66720, 66729, 68097, 68099, 68101, 68102, 68108, 68111, 68152, 68154, 68159, 68159, 69632, 69632, 69633, 69633, 69634, 69634, 69688, 69702, 69734, 69743, 69760, 69761, 69762, 69762, 69808, 69810, 69811, 69814, 69815, 69816, 69817, 69818, 69872, 69881, 69888, 69890, 69927, 69931, 69932, 69932, 69933, 69940, 69942, 69951, 70016, 70017, 70018, 70018, 70067, 70069, 70070, 70078, 70079, 70080, 70096, 70105, 71339, 71339, 71340, 71340, 71341, 71341, 71342, 71343, 71344, 71349, 71350, 71350, 71351, 71351, 71360, 71369, 94033, 94078, 94095, 94098, 119141, 119142, 119143, 119145, 119149, 119154, 119163, 119170, 119173, 119179, 119210, 119213, 119362, 119364, 120782, 120831, 917760, 917999];
  return Object.preventExtensions(Object.create(null, {
    idStartTable: {
      get: function() {
        return idStartTable;
      },
      enumerable: true
    },
    idContinueTable: {
      get: function() {
        return idContinueTable;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/Scanner.js", function() {
  "use strict";
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var KeywordToken = System.get("../src/syntax/KeywordToken.js").KeywordToken;
  var LiteralToken = System.get("../src/syntax/LiteralToken.js").LiteralToken;
  var Token = System.get("../src/syntax/Token.js").Token;
  var getKeywordType = System.get("../src/syntax/Keywords.js").getKeywordType;
  var $__41 = System.get("../src/syntax/unicode-tables.js"),
      idContinueTable = $__41.idContinueTable,
      idStartTable = $__41.idStartTable;
  var parseOptions = System.get("../src/options.js").parseOptions;
  var $__41 = System.get("../src/syntax/TokenType.js"),
      AMPERSAND = $__41.AMPERSAND,
      AMPERSAND_EQUAL = $__41.AMPERSAND_EQUAL,
      AND = $__41.AND,
      ARROW = $__41.ARROW,
      AWAIT = $__41.AWAIT,
      BACK_QUOTE = $__41.BACK_QUOTE,
      BANG = $__41.BANG,
      BAR = $__41.BAR,
      BAR_EQUAL = $__41.BAR_EQUAL,
      BREAK = $__41.BREAK,
      CARET = $__41.CARET,
      CARET_EQUAL = $__41.CARET_EQUAL,
      CASE = $__41.CASE,
      CATCH = $__41.CATCH,
      CLASS = $__41.CLASS,
      CLOSE_ANGLE = $__41.CLOSE_ANGLE,
      CLOSE_CURLY = $__41.CLOSE_CURLY,
      CLOSE_PAREN = $__41.CLOSE_PAREN,
      CLOSE_SQUARE = $__41.CLOSE_SQUARE,
      COLON = $__41.COLON,
      COMMA = $__41.COMMA,
      CONST = $__41.CONST,
      CONTINUE = $__41.CONTINUE,
      DEBUGGER = $__41.DEBUGGER,
      DEFAULT = $__41.DEFAULT,
      DELETE = $__41.DELETE,
      DO = $__41.DO,
      DOT_DOT_DOT = $__41.DOT_DOT_DOT,
      ELSE = $__41.ELSE,
      END_OF_FILE = $__41.END_OF_FILE,
      ENUM = $__41.ENUM,
      EQUAL = $__41.EQUAL,
      EQUAL_EQUAL = $__41.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__41.EQUAL_EQUAL_EQUAL,
      ERROR = $__41.ERROR,
      EXPORT = $__41.EXPORT,
      EXTENDS = $__41.EXTENDS,
      FALSE = $__41.FALSE,
      FINALLY = $__41.FINALLY,
      FOR = $__41.FOR,
      FUNCTION = $__41.FUNCTION,
      GREATER_EQUAL = $__41.GREATER_EQUAL,
      IDENTIFIER = $__41.IDENTIFIER,
      IF = $__41.IF,
      IMPLEMENTS = $__41.IMPLEMENTS,
      IMPORT = $__41.IMPORT,
      IN = $__41.IN,
      INSTANCEOF = $__41.INSTANCEOF,
      INTERFACE = $__41.INTERFACE,
      LEFT_SHIFT = $__41.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__41.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__41.LESS_EQUAL,
      LET = $__41.LET,
      MINUS = $__41.MINUS,
      MINUS_EQUAL = $__41.MINUS_EQUAL,
      MINUS_MINUS = $__41.MINUS_MINUS,
      NEW = $__41.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__41.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__41.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__41.NOT_EQUAL_EQUAL,
      NULL = $__41.NULL,
      NUMBER = $__41.NUMBER,
      OPEN_ANGLE = $__41.OPEN_ANGLE,
      OPEN_CURLY = $__41.OPEN_CURLY,
      OPEN_PAREN = $__41.OPEN_PAREN,
      OPEN_SQUARE = $__41.OPEN_SQUARE,
      OR = $__41.OR,
      PACKAGE = $__41.PACKAGE,
      PERCENT = $__41.PERCENT,
      PERCENT_EQUAL = $__41.PERCENT_EQUAL,
      PERIOD = $__41.PERIOD,
      PERIOD_OPEN_CURLY = $__41.PERIOD_OPEN_CURLY,
      PLUS = $__41.PLUS,
      PLUS_EQUAL = $__41.PLUS_EQUAL,
      PLUS_PLUS = $__41.PLUS_PLUS,
      PRIVATE = $__41.PRIVATE,
      PROTECTED = $__41.PROTECTED,
      PUBLIC = $__41.PUBLIC,
      QUESTION = $__41.QUESTION,
      REGULAR_EXPRESSION = $__41.REGULAR_EXPRESSION,
      RETURN = $__41.RETURN,
      RIGHT_SHIFT = $__41.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__41.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__41.SEMI_COLON,
      SLASH = $__41.SLASH,
      SLASH_EQUAL = $__41.SLASH_EQUAL,
      STAR = $__41.STAR,
      STAR_EQUAL = $__41.STAR_EQUAL,
      STATIC = $__41.STATIC,
      STRING = $__41.STRING,
      SUPER = $__41.SUPER,
      SWITCH = $__41.SWITCH,
      TEMPLATE_HEAD = $__41.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__41.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__41.TEMPLATE_TAIL,
      THIS = $__41.THIS,
      THROW = $__41.THROW,
      TILDE = $__41.TILDE,
      TRUE = $__41.TRUE,
      TRY = $__41.TRY,
      TYPEOF = $__41.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__41.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__41.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__41.VAR,
      VOID = $__41.VOID,
      WHILE = $__41.WHILE,
      WITH = $__41.WITH,
      YIELD = $__41.YIELD;
  var isWhitespaceArray = [];
  for (var i = 0; i < 128; i++) {
    isWhitespaceArray[i] = i >= 9 && i <= 13 || i === 0x20;
  }
  var isWhitespaceArray = [];
  for (var i = 0; i < 128; i++) {
    isWhitespaceArray[i] = i >= 9 && i <= 13 || i === 0x20;
  }
  function isWhitespace(code) {
    if (code < 128) return isWhitespaceArray[code];
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
    return code < 128 ? isIdentifierStartArray[code]: inTable(idStartTable, code);
  }
  var isIdentifierPartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierPartArray[i] = isIdentifierStart(i) || isDecimalDigit(i);
  }
  function isIdentifierPart(code) {
    return code < 128 ? isIdentifierPartArray[code]: inTable(idStartTable, code) || inTable(idContinueTable, code) || code === 8204 || code === 8205;
  }
  function inTable(table, code) {
    for (var i = 0; i < table.length;) {
      if (code < table[i++]) return false;
      if (code <= table[i++]) return true;
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
  function Scanner(reporter, file, parser) {
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
  }
  ($__class)(Scanner, {
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
      return opt_index ? peekTokenLookahead(): peekToken();
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
    return token ? token.location.start.offset: index;
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
      if (!skipRegularExpressionChar()) return false;
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
    if (isLineTerminator(currentCharCode)) {
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
          if (code === 123) return;
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
      if (isLineTerminator(code)) return null;
      if (code === 47) {
        code = input.charCodeAt(++i);
        if (code === 47) return null;
        i = input.indexOf('*/', i) + 2;
      }
    }
    return t;
  }
  function peekToken() {
    return token || (token = scanToken());
  }
  function peekTokenLookahead() {
    if (!token) token = scanToken();
    if (!lookaheadToken) lookaheadToken = scanToken();
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
  function skipSingleLineComment() {
    var start = index;
    index += 2;
    while (!isAtEnd() && !isLineTerminator(input.charCodeAt(index++))) {}
    updateCurrentCharCode();
    currentParser.handleSingleLineComment(input, start, index - 1);
  }
  function skipMultiLineComment() {
    var i = input.indexOf('*/', index + 2);
    if (i !== - 1) index = i + 2; else index = length;
    updateCurrentCharCode();
  }
  function scanToken() {
    skipComments();
    var beginIndex = index;
    if (isAtEnd()) return createToken(END_OF_FILE, beginIndex);
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
          case 123:
            next();
            return createToken(PERIOD_OPEN_CURLY, beginIndex);
          default:
            if (isDecimalDigit(currentCharCode)) return scanNumberPostPeriod(beginIndex);
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
        if (!parseOptions.numericLiterals) break;
        next();
        if (!isBinaryDigit(currentCharCode)) {
          reportError('Binary Integer Literal must contain at least one digit');
        }
        skipBinaryDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 79:
      case 111:
        if (!parseOptions.numericLiterals) break;
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
    for (;;) {
      code = currentCharCode;
      if (isIdentifierPart(code)) {
        next();
      } else if (code === 92) {
        next();
        code = readUnicodeEscapeSequence();
        if (!escapedCharCodes) escapedCharCodes = [];
        escapedCharCodes.push(code);
        if (!isIdentifierPart(code)) return createToken(ERROR, beginIndex);
      } else {
        break;
      }
    }
    var value = input.slice(beginIndex, index);
    var keywordType = getKeywordType(value);
    if (keywordType) return new KeywordToken(value, keywordType, getTokenRange(beginIndex));
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
    var indexArg = arguments[1] !== (void 0) ? arguments[1]: index;
    var position = getPosition(indexArg);
    errorReporter.reportError(position, message);
  }
  return Object.preventExtensions(Object.create(null, {
    isLineTerminator: {
      get: function() {
        return isLineTerminator;
      },
      enumerable: true
    },
    Scanner: {
      get: function() {
        return Scanner;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/Parser.js", function() {
  "use strict";
  var $__43 = System.get("../src/codegeneration/AssignmentPatternTransformer.js"),
      AssignmentPatternTransformer = $__43.AssignmentPatternTransformer,
      AssignmentPatternTransformerError = $__43.AssignmentPatternTransformerError;
  var $__43 = System.get("../src/codegeneration/CoverFormalsTransformer.js"),
      CoverFormalsTransformer = $__43.CoverFormalsTransformer,
      CoverFormalsTransformerError = $__43.CoverFormalsTransformerError;
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var $__43 = System.get("../src/syntax/trees/ParseTreeType.js"),
      ARRAY_LITERAL_EXPRESSION = $__43.ARRAY_LITERAL_EXPRESSION,
      BINARY_OPERATOR = $__43.BINARY_OPERATOR,
      CALL_EXPRESSION = $__43.CALL_EXPRESSION,
      CASCADE_EXPRESSION = $__43.CASCADE_EXPRESSION,
      COMMA_EXPRESSION = $__43.COMMA_EXPRESSION,
      COMPUTED_PROPERTY_NAME = $__43.COMPUTED_PROPERTY_NAME,
      FORMAL_PARAMETER_LIST = $__43.FORMAL_PARAMETER_LIST,
      IDENTIFIER_EXPRESSION = $__43.IDENTIFIER_EXPRESSION,
      LITERAL_PROPERTY_NAME = $__43.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__43.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__43.MEMBER_LOOKUP_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__43.OBJECT_LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__43.PAREN_EXPRESSION,
      PROPERTY_NAME_ASSIGNMENT = $__43.PROPERTY_NAME_ASSIGNMENT,
      REST_PARAMETER = $__43.REST_PARAMETER,
      SYNTAX_ERROR_TREE = $__43.SYNTAX_ERROR_TREE;
  var $__43 = System.get("../src/syntax/PredefinedName.js"),
      ANY = $__43.ANY,
      AS = $__43.AS,
      BOOL = $__43.BOOL,
      FROM = $__43.FROM,
      GET = $__43.GET,
      MODULE = $__43.MODULE,
      NUMBER = $__43.NUMBER,
      OF = $__43.OF,
      SET = $__43.SET,
      STRING = $__43.STRING;
  var Scanner = System.get("../src/syntax/Scanner.js").Scanner;
  var SourceRange = System.get("../src/util/SourceRange.js").SourceRange;
  var StrictParams = System.get("../src/staticsemantics/StrictParams.js").StrictParams;
  var $__43 = System.get("../src/syntax/Token.js"),
      Token = $__43.Token,
      isAssignmentOperator = $__43.isAssignmentOperator;
  var $__43 = System.get("../src/options.js"),
      parseOptions = $__43.parseOptions,
      options = $__43.options;
  var $__43 = System.get("../src/syntax/TokenType.js"),
      AMPERSAND = $__43.AMPERSAND,
      AMPERSAND_EQUAL = $__43.AMPERSAND_EQUAL,
      AND = $__43.AND,
      ARROW = $__43.ARROW,
      AWAIT = $__43.AWAIT,
      BACK_QUOTE = $__43.BACK_QUOTE,
      BANG = $__43.BANG,
      BAR = $__43.BAR,
      BAR_EQUAL = $__43.BAR_EQUAL,
      BREAK = $__43.BREAK,
      CARET = $__43.CARET,
      CARET_EQUAL = $__43.CARET_EQUAL,
      CASE = $__43.CASE,
      CATCH = $__43.CATCH,
      CLASS = $__43.CLASS,
      CLOSE_ANGLE = $__43.CLOSE_ANGLE,
      CLOSE_CURLY = $__43.CLOSE_CURLY,
      CLOSE_PAREN = $__43.CLOSE_PAREN,
      CLOSE_SQUARE = $__43.CLOSE_SQUARE,
      COLON = $__43.COLON,
      COMMA = $__43.COMMA,
      CONST = $__43.CONST,
      CONTINUE = $__43.CONTINUE,
      DEBUGGER = $__43.DEBUGGER,
      DEFAULT = $__43.DEFAULT,
      DELETE = $__43.DELETE,
      DO = $__43.DO,
      DOT_DOT_DOT = $__43.DOT_DOT_DOT,
      ELSE = $__43.ELSE,
      END_OF_FILE = $__43.END_OF_FILE,
      ENUM = $__43.ENUM,
      EQUAL = $__43.EQUAL,
      EQUAL_EQUAL = $__43.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__43.EQUAL_EQUAL_EQUAL,
      ERROR = $__43.ERROR,
      EXPORT = $__43.EXPORT,
      EXTENDS = $__43.EXTENDS,
      FALSE = $__43.FALSE,
      FINALLY = $__43.FINALLY,
      FOR = $__43.FOR,
      FUNCTION = $__43.FUNCTION,
      GREATER_EQUAL = $__43.GREATER_EQUAL,
      IDENTIFIER = $__43.IDENTIFIER,
      IF = $__43.IF,
      IMPLEMENTS = $__43.IMPLEMENTS,
      IMPORT = $__43.IMPORT,
      IN = $__43.IN,
      INSTANCEOF = $__43.INSTANCEOF,
      INTERFACE = $__43.INTERFACE,
      LEFT_SHIFT = $__43.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__43.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__43.LESS_EQUAL,
      LET = $__43.LET,
      MINUS = $__43.MINUS,
      MINUS_EQUAL = $__43.MINUS_EQUAL,
      MINUS_MINUS = $__43.MINUS_MINUS,
      NEW = $__43.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__43.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__43.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__43.NOT_EQUAL_EQUAL,
      NULL = $__43.NULL,
      NUMBER = $__43.NUMBER,
      OPEN_ANGLE = $__43.OPEN_ANGLE,
      OPEN_CURLY = $__43.OPEN_CURLY,
      OPEN_PAREN = $__43.OPEN_PAREN,
      OPEN_SQUARE = $__43.OPEN_SQUARE,
      OR = $__43.OR,
      PACKAGE = $__43.PACKAGE,
      PERCENT = $__43.PERCENT,
      PERCENT_EQUAL = $__43.PERCENT_EQUAL,
      PERIOD = $__43.PERIOD,
      PERIOD_OPEN_CURLY = $__43.PERIOD_OPEN_CURLY,
      PLUS = $__43.PLUS,
      PLUS_EQUAL = $__43.PLUS_EQUAL,
      PLUS_PLUS = $__43.PLUS_PLUS,
      PRIVATE = $__43.PRIVATE,
      PROTECTED = $__43.PROTECTED,
      PUBLIC = $__43.PUBLIC,
      QUESTION = $__43.QUESTION,
      REGULAR_EXPRESSION = $__43.REGULAR_EXPRESSION,
      RETURN = $__43.RETURN,
      RIGHT_SHIFT = $__43.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__43.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__43.SEMI_COLON,
      SLASH = $__43.SLASH,
      SLASH_EQUAL = $__43.SLASH_EQUAL,
      STAR = $__43.STAR,
      STAR_EQUAL = $__43.STAR_EQUAL,
      STATIC = $__43.STATIC,
      STRING = $__43.STRING,
      SUPER = $__43.SUPER,
      SWITCH = $__43.SWITCH,
      TEMPLATE_HEAD = $__43.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__43.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__43.TEMPLATE_TAIL,
      THIS = $__43.THIS,
      THROW = $__43.THROW,
      TILDE = $__43.TILDE,
      TRUE = $__43.TRUE,
      TRY = $__43.TRY,
      TYPEOF = $__43.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__43.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__43.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__43.VAR,
      VOID = $__43.VOID,
      WHILE = $__43.WHILE,
      WITH = $__43.WITH,
      YIELD = $__43.YIELD;
  var $__43 = System.get("../src/syntax/trees/ParseTrees.js"),
      ArgumentList = $__43.ArgumentList,
      ArrayComprehension = $__43.ArrayComprehension,
      ArrayLiteralExpression = $__43.ArrayLiteralExpression,
      ArrayPattern = $__43.ArrayPattern,
      ArrowFunctionExpression = $__43.ArrowFunctionExpression,
      AwaitStatement = $__43.AwaitStatement,
      BinaryOperator = $__43.BinaryOperator,
      BindingElement = $__43.BindingElement,
      BindingIdentifier = $__43.BindingIdentifier,
      Block = $__43.Block,
      BreakStatement = $__43.BreakStatement,
      CallExpression = $__43.CallExpression,
      CascadeExpression = $__43.CascadeExpression,
      CaseClause = $__43.CaseClause,
      Catch = $__43.Catch,
      ClassDeclaration = $__43.ClassDeclaration,
      ClassExpression = $__43.ClassExpression,
      CommaExpression = $__43.CommaExpression,
      ComprehensionFor = $__43.ComprehensionFor,
      ComprehensionIf = $__43.ComprehensionIf,
      ComputedPropertyName = $__43.ComputedPropertyName,
      ConditionalExpression = $__43.ConditionalExpression,
      ContinueStatement = $__43.ContinueStatement,
      CoverFormals = $__43.CoverFormals,
      CoverInitialisedName = $__43.CoverInitialisedName,
      DebuggerStatement = $__43.DebuggerStatement,
      DefaultClause = $__43.DefaultClause,
      DoWhileStatement = $__43.DoWhileStatement,
      EmptyStatement = $__43.EmptyStatement,
      ExportDeclaration = $__43.ExportDeclaration,
      ExportDefault = $__43.ExportDefault,
      ExportSpecifier = $__43.ExportSpecifier,
      ExportSpecifierSet = $__43.ExportSpecifierSet,
      ExportStar = $__43.ExportStar,
      ExpressionStatement = $__43.ExpressionStatement,
      Finally = $__43.Finally,
      ForInStatement = $__43.ForInStatement,
      ForOfStatement = $__43.ForOfStatement,
      ForStatement = $__43.ForStatement,
      FormalParameterList = $__43.FormalParameterList,
      FunctionBody = $__43.FunctionBody,
      FunctionDeclaration = $__43.FunctionDeclaration,
      FunctionExpression = $__43.FunctionExpression,
      GeneratorComprehension = $__43.GeneratorComprehension,
      GetAccessor = $__43.GetAccessor,
      IdentifierExpression = $__43.IdentifierExpression,
      IfStatement = $__43.IfStatement,
      ImportDeclaration = $__43.ImportDeclaration,
      ImportSpecifier = $__43.ImportSpecifier,
      ImportSpecifierSet = $__43.ImportSpecifierSet,
      ImportedBinding = $__43.ImportedBinding,
      LabelledStatement = $__43.LabelledStatement,
      LiteralExpression = $__43.LiteralExpression,
      LiteralPropertyName = $__43.LiteralPropertyName,
      MemberExpression = $__43.MemberExpression,
      MemberLookupExpression = $__43.MemberLookupExpression,
      Module = $__43.Module,
      ModuleDeclaration = $__43.ModuleDeclaration,
      ModuleSpecifier = $__43.ModuleSpecifier,
      NamedExport = $__43.NamedExport,
      NewExpression = $__43.NewExpression,
      ObjectLiteralExpression = $__43.ObjectLiteralExpression,
      ObjectPattern = $__43.ObjectPattern,
      ObjectPatternField = $__43.ObjectPatternField,
      ParenExpression = $__43.ParenExpression,
      PostfixExpression = $__43.PostfixExpression,
      PredefinedType = $__43.PredefinedType,
      Script = $__43.Script,
      PropertyMethodAssignment = $__43.PropertyMethodAssignment,
      PropertyNameAssignment = $__43.PropertyNameAssignment,
      PropertyNameShorthand = $__43.PropertyNameShorthand,
      RestParameter = $__43.RestParameter,
      ReturnStatement = $__43.ReturnStatement,
      SetAccessor = $__43.SetAccessor,
      SpreadExpression = $__43.SpreadExpression,
      SpreadPatternElement = $__43.SpreadPatternElement,
      SuperExpression = $__43.SuperExpression,
      SwitchStatement = $__43.SwitchStatement,
      SyntaxErrorTree = $__43.SyntaxErrorTree,
      TemplateLiteralExpression = $__43.TemplateLiteralExpression,
      TemplateLiteralPortion = $__43.TemplateLiteralPortion,
      TemplateSubstitution = $__43.TemplateSubstitution,
      ThisExpression = $__43.ThisExpression,
      ThrowStatement = $__43.ThrowStatement,
      TryStatement = $__43.TryStatement,
      TypeName = $__43.TypeName,
      UnaryExpression = $__43.UnaryExpression,
      VariableDeclaration = $__43.VariableDeclaration,
      VariableDeclarationList = $__43.VariableDeclarationList,
      VariableStatement = $__43.VariableStatement,
      WhileStatement = $__43.WhileStatement,
      WithStatement = $__43.WithStatement,
      YieldExpression = $__43.YieldExpression;
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
  function Parser(errorReporter, file) {
    this.errorReporter_ = errorReporter;
    this.scanner_ = new Scanner(errorReporter, file, this);
    this.allowYield_ = options.unstarredGenerators;
    this.strictMode_ = false;
    this.noLint = false;
    this.noLintChanged_ = false;
    this.strictSemicolons_ = options.strictSemicolons;
    this.coverInitialisedName_ = null;
    this.assignmentExpressionDepth_ = 0;
  }
  ($__class)(Parser, {
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
      while ((type = this.peekType_()) !== END_OF_FILE && type !== CLOSE_CURLY) {
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
      var importClause = this.parseImportClause_();
      this.eatId_(FROM);
      var moduleSpecifier = this.parseModuleSpecifier_();
      this.eatPossibleImplicitSemiColon_();
      return new ImportDeclaration(this.getTreeLocation_(start), importClause, moduleSpecifier);
    },
    parseImportClause_: function() {
      var start = this.getTreeStartLocation_();
      if (this.eatIf_(OPEN_CURLY)) {
        var specifiers = [this.parseImportSpecifier_()];
        while (this.eatIf_(COMMA)) {
          if (this.peek_(CLOSE_CURLY)) break;
          specifiers.push(this.parseImportSpecifier_());
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
        default:
          return this.parseUnexpectedToken_(type);
      }
      return new ExportDeclaration(this.getTreeLocation_(start), exportTree);
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
        if (this.peek_(CLOSE_CURLY)) break;
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
        this.eatId_(AS);
        rhs = this.eatIdName_();
      }
      return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs);
    },
    peekId_: function(type) {
      if (type === IDENTIFIER) return true;
      if (this.strictMode_) return false;
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
      if (constr == ClassDeclaration || !this.peek_(EXTENDS) && !this.peek_(OPEN_CURLY)) {
        name = this.parseBindingIdentifier_();
      }
      var superClass = null;
      if (this.eatIf_(EXTENDS)) {
        superClass = this.parseAssignmentExpression();
      }
      this.eat_(OPEN_CURLY);
      var elements = this.parseClassElements_();
      this.eat_(CLOSE_CURLY);
      this.strictMode_ = strictMode;
      return new constr(this.getTreeLocation_(start), name, superClass, elements);
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
      return this.peekPropertyName_(type) || type === STAR && parseOptions.generators;
    },
    parsePropertyName_: function() {
      if (this.peek_(OPEN_SQUARE)) return this.parseComputedPropertyName_();
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
          if (!parseOptions.blockBinding) break;
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
        case AWAIT:
          if (parseOptions.deferredFunctions) return this.parseAwaitStatement_();
          break;
        case CLASS:
          if (parseOptions.classes) return this.parseClassDeclaration_();
          break;
        case CONTINUE:
          return this.parseContinueStatement_();
        case DEBUGGER:
          return this.parseDebuggerStatement_();
        case DO:
          return this.parseDoWhileStatement_();
        case EXPORT:
          if (allowModuleItem && parseOptions.modules) return this.parseExportDeclaration_();
          break;
        case IMPORT:
          if (allowScriptItem && parseOptions.modules) return this.parseImportDeclaration_();
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
      var start = this.getTreeStartLocation_();
      this.nextToken_();
      var isGenerator = parseOptions.generators && this.eatIf_(STAR);
      return this.parseFunctionDeclarationTail_(start, isGenerator, this.parseBindingIdentifier_());
    },
    parseFunctionDeclarationTail_: function(start, isGenerator, name) {
      this.eat_(OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_(isGenerator, formalParameterList);
      return new FunctionDeclaration(this.getTreeLocation_(start), name, isGenerator, formalParameterList, functionBody);
    },
    parseFunctionExpression_: function() {
      var start = this.getTreeStartLocation_();
      this.nextToken_();
      var isGenerator = parseOptions.generators && this.eatIf_(STAR);
      var name = null;
      if (this.peekBindingIdentifier_(this.peekType_())) {
        name = this.parseBindingIdentifier_();
      }
      this.eat_(OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_(isGenerator, formalParameterList);
      return new FunctionExpression(this.getTreeLocation_(start), name, isGenerator, formalParameterList, functionBody);
    },
    parseFormalParameterList_: function() {
      var start = this.getTreeStartLocation_();
      var formals = [];
      var type = this.peekType_();
      if (this.peekRest_(type)) {
        formals.push(this.parseRestParameter_());
      } else {
        if (this.peekFormalParameter_(this.peekType_())) formals.push(this.parseFormalParameter_());
        while (this.eatIf_(COMMA)) {
          if (this.peekRest_(this.peekType_())) {
            formals.push(this.parseRestParameter_());
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
      return this.parseBindingElement_(initializerAllowed);
    },
    parseRestParameter_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(DOT_DOT_DOT);
      var id = this.parseBindingIdentifier_();
      return new RestParameter(this.getTreeLocation_(start), id);
    },
    parseFunctionBody_: function(isGenerator, params) {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_CURLY);
      var allowYield = this.allowYield_;
      var strictMode = this.strictMode_;
      this.allowYield_ = isGenerator || options.unstarredGenerators;
      var result = this.parseStatementList_(!strictMode);
      if (!strictMode && this.strictMode_ && params) StrictParams.visit(params, this.errorReporter_);
      this.strictMode_ = strictMode;
      this.allowYield_ = allowYield;
      this.eat_(CLOSE_CURLY);
      return new FunctionBody(this.getTreeLocation_(start), result);
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
      if (!parseOptions.spread) return this.parseUnexpectedToken_(DOT_DOT_DOT);
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
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.NORMAL;
      var initializer = arguments[1] !== (void 0) ? arguments[1]: DestructuringInitializer.REQUIRED;
      var type = this.peekType_();
      switch (type) {
        case CONST:
        case LET:
          if (!parseOptions.blockBinding) debugger;
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
      var initializer = arguments[2] !== (void 0) ? arguments[2]: DestructuringInitializer.REQUIRED;
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
      if (this.peek_(EQUAL)) initializer = this.parseInitializer_(expressionIn); else if (lvalue.isPattern() && initRequired) this.reportError_('destructuring must have an initializer');
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
      var expression = this.parseExpression();
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
      var start = this.getTreeStartLocation_();
      this.eat_(FOR);
      this.eat_(OPEN_PAREN);
      var validate = (function(variables, kind) {
        if (variables.declarations.length > 1) {
          this.reportError_(kind + ' statement may not have more than one variable declaration');
        }
        var declaration = variables.declarations[0];
        if (declaration.lvalue.isPattern() && declaration.initializer) {
          this.reportError_(declaration.initializer.location, ("initializer is not allowed in " + kind + " loop with pattern"));
        }
      }).bind(this);
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
        if (this.peekOf_(type)) return this.parseForOfStatement_(start, initializer);
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
      if (!this.allowYield_) {
        return this.parseSyntaxError_("'yield' expressions are only allowed inside 'function*'");
      }
      var start = this.getTreeStartLocation_();
      this.eat_(YIELD);
      var expression = null;
      var isYieldFor = this.eatIf_(STAR);
      if (isYieldFor || !this.peekImplicitSemiColon_(this.peekType_())) {
        expression = this.parseAssignmentExpression();
      }
      return new YieldExpression(this.getTreeLocation_(start), expression, isYieldFor);
    },
    parseAwaitStatement_: function() {
      var start = this.getTreeStartLocation_();
      this.eat_(AWAIT);
      var identifier = null;
      if (this.peek_(IDENTIFIER) && this.peek_(EQUAL, 1)) {
        identifier = this.eatId_();
        this.eat_(EQUAL);
      }
      var expression = this.parseExpression();
      this.eatPossibleImplicitSemiColon_();
      return new AwaitStatement(this.getTreeLocation_(start), identifier, expression);
    },
    parseWithStatement_: function() {
      if (this.strictMode_) this.reportError_('Strict mode code may not include a with statement');
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
      if (this.peekPattern_(this.peekType_())) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_();
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
          return parseOptions.classes ? this.parseClassExpression_(): this.parseSyntaxError_('Unexpected reserved word');
        case SUPER:
          return this.parseSuperExpression_();
        case THIS:
          return this.parseThisExpression_();
        case IDENTIFIER:
          return this.parseIdentifierExpression_();
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
          return this.parseParenExpression_();
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
          if (!this.strictMode_) return this.parseIdentifierExpression_();
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
      if (type === FOR && parseOptions.arrayComprehension) return this.parseArrayComprehension_(start);
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
        if (type !== CLOSE_SQUARE) this.eat_(COMMA);
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
        if (!this.eatIf_(COMMA)) break;
      }
      this.eat_(CLOSE_CURLY);
      return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
    },
    parsePropertyDefinition: function() {
      var start = this.getTreeStartLocation_();
      var isGenerator = false;
      var isStatic = false;
      if (parseOptions.generators && parseOptions.propertyMethods && this.peek_(STAR)) {
        return this.parseGeneratorMethod_(start, isStatic);
      }
      var token = this.peekToken_();
      var name = this.parsePropertyName_();
      if (parseOptions.propertyMethods && this.peek_(OPEN_PAREN)) return this.parseMethod_(start, isStatic, isGenerator, name);
      if (this.eatIf_(COLON)) {
        var value = this.parseAssignmentExpression();
        return new PropertyNameAssignment(this.getTreeLocation_(start), name, value);
      }
      var type = this.peekType_();
      if (name.type === LITERAL_PROPERTY_NAME) {
        var nameLiteral = name.literalToken;
        if (nameLiteral.value === GET && this.peekPropertyName_(type)) {
          return this.parseGetAccessor_(start, isStatic);
        }
        if (nameLiteral.value === SET && this.peekPropertyName_(type)) {
          return this.parseSetAccessor_(start, isStatic);
        }
        if (parseOptions.propertyNameShorthand && nameLiteral.type === IDENTIFIER) {
          if (this.peek_(EQUAL)) {
            token = this.nextToken_();
            var expr = this.parseAssignmentExpression();
            return this.coverInitialisedName_ = new CoverInitialisedName(this.getTreeLocation_(start), nameLiteral, token, expr);
          }
          return new PropertyNameShorthand(this.getTreeLocation_(start), nameLiteral);
        }
      }
      if (name.type === COMPUTED_PROPERTY_NAME) token = this.peekToken_();
      return this.parseUnexpectedToken_(token);
    },
    parseClassElement_: function() {
      var start = this.getTreeStartLocation_();
      var type = this.peekType_();
      var isStatic = false,
          isGenerator = false;
      switch (type) {
        case STATIC:
          var staticToken = this.nextToken_();
          type = this.peekType_();
          switch (type) {
            case OPEN_PAREN:
              var name = new LiteralPropertyName(start, staticToken);
              return this.parseMethod_(start, isStatic, isGenerator, name);
            default:
              isStatic = true;
              if (type === STAR && parseOptions.generators) return this.parseGeneratorMethod_(start, true);
              return this.parseGetSetOrMethod_(start, isStatic);
          }
          break;
        case STAR:
          return this.parseGeneratorMethod_(start, isStatic);
        default:
          return this.parseGetSetOrMethod_(start, isStatic);
      }
    },
    parseGeneratorMethod_: function(start, isStatic) {
      var isGenerator = true;
      this.eat_(STAR);
      var name = this.parsePropertyName_();
      return this.parseMethod_(start, isStatic, isGenerator, name);
    },
    parseMethod_: function(start, isStatic, isGenerator, name) {
      this.eat_(OPEN_PAREN);
      var formalParameterList = this.parseFormalParameterList_();
      this.eat_(CLOSE_PAREN);
      var functionBody = this.parseFunctionBody_(isGenerator, formalParameterList);
      return new PropertyMethodAssignment(this.getTreeLocation_(start), isStatic, isGenerator, name, formalParameterList, functionBody);
    },
    parseGetSetOrMethod_: function(start, isStatic) {
      var isGenerator = false;
      var name = this.parsePropertyName_();
      var type = this.peekType_();
      if (name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === GET && this.peekPropertyName_(type)) {
        return this.parseGetAccessor_(start, isStatic);
      }
      if (name.type === LITERAL_PROPERTY_NAME && name.literalToken.value === SET && this.peekPropertyName_(type)) {
        return this.parseSetAccessor_(start, isStatic);
      }
      return this.parseMethod_(start, isStatic, isGenerator, name);
    },
    parseGetAccessor_: function(start, isStatic) {
      var isGenerator = false;
      var name = this.parsePropertyName_();
      this.eat_(OPEN_PAREN);
      this.eat_(CLOSE_PAREN);
      var body = this.parseFunctionBody_(isGenerator, null);
      return new GetAccessor(this.getTreeLocation_(start), isStatic, name, body);
    },
    parseSetAccessor_: function(start, isStatic) {
      var isGenerator = false;
      var name = this.parsePropertyName_();
      this.eat_(OPEN_PAREN);
      var parameter = this.parsePropertySetParameterList_();
      this.eat_(CLOSE_PAREN);
      var body = this.parseFunctionBody_(isGenerator, parameter);
      return new SetAccessor(this.getTreeLocation_(start), isStatic, name, parameter, body);
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
      if (this.peekPattern_(this.peekType_())) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_();
      return new BindingElement(this.getTreeLocation_(start), binding, null);
    },
    parseParenExpression_: function() {
      return this.parseArrowFunction_();
    },
    parseSyntaxError_: function(message) {
      var start = this.getTreeStartLocation_();
      this.reportError_(message);
      var token = this.nextToken_();
      return new SyntaxErrorTree(this.getTreeLocation_(start), token, message);
    },
    parseUnexpectedToken_: function(name) {
      return this.parseSyntaxError_(("unexpected token " + name));
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
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.IN;
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
    parseExpressionForCoverFormals_: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.IN;
      var start = this.getTreeStartLocation_();
      var exprs = [this.parseAssignmentExpression(expressionIn)];
      if (this.peek_(COMMA)) {
        while (this.eatIf_(COMMA)) {
          if (this.peekRest_(this.peekType_())) {
            exprs.push(this.parseRestParameter_());
            break;
          }
          exprs.push(this.parseAssignmentExpression(expressionIn));
        }
      }
      return new CoverFormals(this.getTreeLocation_(start), exprs);
    },
    peekAssignmentExpression_: function(type) {
      return this.peekExpression_(type);
    },
    parseAssignmentExpression: function() {
      var expressionIn = arguments[0] !== (void 0) ? arguments[0]: Expression.NORMAL;
      if (this.allowYield_ && this.peek_(YIELD)) return this.parseYieldExpression_();
      this.assignmentExpressionDepth_++;
      var start = this.getTreeStartLocation_();
      var left = this.parseConditional_(expressionIn);
      var type = this.peekType_();
      if (this.peekAssignmentOperator_(type)) {
        if (type === EQUAL) left = this.transformLeftHandSideExpression_(left);
        if (!left.isLeftHandSideExpression() && !left.isPattern()) {
          this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern');
        }
        var operator = this.nextToken_();
        var right = this.parseAssignmentExpression(expressionIn);
        this.assignmentExpressionDepth_--;
        this.coverInitialisedName_ = null;
        return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      this.assignmentExpressionDepth_--;
      if (this.assignmentExpressionDepth_ === 0 && this.coverInitialisedName_) {
        var token = this.coverInitialisedName_.equalToken;
        this.reportError_(token.location, ("Unexpected token '" + token + "'"));
        this.coverInitialisedName_ = null;
      }
      if (left && left.type === IDENTIFIER_EXPRESSION && this.peekArrow_(type)) {
        this.nextToken_();
        var id = new BindingIdentifier(left.location, left.identifierToken);
        var formals = [new BindingElement(id.location, id, null)];
        var body = this.parseConciseBody_();
        var startLoc = left.location;
        return new ArrowFunctionExpression(startLoc, new FormalParameterList(startLoc, formals), body);
      }
      return left;
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
            if (!(ex instanceof AssignmentPatternTransformerError)) throw ex;
          }
          if (transformedTree) return transformedTree;
          break;
        case PAREN_EXPRESSION:
          var expression = this.transformLeftHandSideExpression_(tree.expression);
          if (expression !== tree.expression) return new ParenExpression(tree.location, expression);
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
        var left = this.parseAssignmentExpression();
        this.eat_(COLON);
        var right = this.parseAssignmentExpression(expressionIn);
        return new ConditionalExpression(this.getTreeLocation_(start), condition, left, right);
      }
      return condition;
    },
    parseLogicalOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseLogicalAND_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(OR)) {
        var right = this.parseLogicalAND_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },
    parseLogicalAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseOR_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(AND)) {
        var right = this.parseBitwiseOR_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },
    parseBitwiseOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseXOR_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(BAR)) {
        var right = this.parseBitwiseXOR_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },
    parseBitwiseXOR_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseBitwiseAND_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(CARET)) {
        var right = this.parseBitwiseAND_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },
    parseBitwiseAND_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseEquality_(expressionIn);
      var operator;
      while (operator = this.eatOpt_(AMPERSAND)) {
        var right = this.parseEquality_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
      }
      return left;
    },
    parseEquality_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      var left = this.parseRelational_(expressionIn);
      while (this.peekEqualityOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var right = this.parseRelational_(expressionIn);
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
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
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
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
      if (this.peekUnaryOperator_(this.peekType_())) {
        var operator = this.nextToken_();
        var operand = this.parseUnaryExpression_();
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
              var args = this.parseArguments_();
              operand = new CallExpression(this.getTreeLocation_(start), operand, args);
              break;
            case OPEN_SQUARE:
              this.nextToken_();
              var member = this.parseExpression();
              this.eat_(CLOSE_SQUARE);
              operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
              break;
            case PERIOD:
              this.nextToken_();
              var memberName = this.eatIdName_();
              operand = new MemberExpression(this.getTreeLocation_(start), operand, memberName);
              break;
            case PERIOD_OPEN_CURLY:
              if (!parseOptions.cascadeExpression) break loop;
              var expressions = this.parseCascadeExpressions_();
              operand = new CascadeExpression(this.getTreeLocation_(start), operand, expressions);
              break;
            case NO_SUBSTITUTION_TEMPLATE:
            case TEMPLATE_HEAD:
              if (!parseOptions.templateLiterals) break loop;
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
            this.nextToken_();
            var member = this.parseExpression();
            this.eat_(CLOSE_SQUARE);
            operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member);
            break;
          case PERIOD:
            this.nextToken_();
            var name;
            name = this.eatIdName_();
            operand = new MemberExpression(this.getTreeLocation_(start), operand, name);
            break;
          case PERIOD_OPEN_CURLY:
            if (!parseOptions.cascadeExpression) break loop;
            var expressions = this.parseCascadeExpressions_();
            operand = new CascadeExpression(this.getTreeLocation_(start), operand, expressions);
            break;
          case NO_SUBSTITUTION_TEMPLATE:
          case TEMPLATE_HEAD:
            if (!parseOptions.templateLiterals) break loop;
            operand = this.parseTemplateLiteral_(operand);
            break;
          default:
            break loop;
        }
      }
      return operand;
    },
    parseCascadeExpressions_: function() {
      this.eat_(PERIOD_OPEN_CURLY);
      var expressions = [];
      var type;
      while (this.peekId_(type = this.peekType_()) && this.peekAssignmentExpression_(type)) {
        expressions.push(this.parseCascadeExpression_());
        this.eatPossibleImplicitSemiColon_();
      }
      this.eat_(CLOSE_CURLY);
      return expressions;
    },
    parseCascadeExpression_: function() {
      var expr = this.parseAssignmentExpression();
      var operand;
      switch (expr.type) {
        case CALL_EXPRESSION:
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
        case CASCADE_EXPRESSION:
          operand = expr.operand;
          break;
        case BINARY_OPERATOR:
          operand = expr.left;
          break;
        default:
          this.reportError_(expr.location, ("Invalid expression. Type: " + expr.type));
      }
      if (operand) {
        switch (operand.type) {
          case MEMBER_EXPRESSION:
          case MEMBER_LOOKUP_EXPRESSION:
          case CALL_EXPRESSION:
          case CASCADE_EXPRESSION:
          case IDENTIFIER_EXPRESSION:
            break;
          default:
            this.reportError_(operand.location, ("Invalid expression: " + operand.type));
        }
      }
      if (expr.type == BINARY_OPERATOR && !expr.operator.isAssignmentOperator()) {
        this.reportError_(expr.operator, ("Invalid operator: " + expr.operator));
      }
      return expr;
    },
    parseNewExpression_: function() {
      if (this.peek_(NEW)) {
        var start = this.getTreeStartLocation_();
        this.eat_(NEW);
        var operand = this.parseNewExpression_();
        var args = null;
        if (this.peek_(OPEN_PAREN)) {
          args = this.parseArguments_();
        }
        return new NewExpression(this.getTreeLocation_(start), operand, args);
      } else {
        return this.parseMemberExpressionNoNew_();
      }
    },
    parseArguments_: function() {
      var start = this.getTreeStartLocation_();
      var args = [];
      this.eat_(OPEN_PAREN);
      while (true) {
        var type = this.peekType_();
        if (this.peekRest_(type)) {
          args.push(this.parseSpreadExpression_());
        } else if (this.peekAssignmentExpression_(type)) {
          args.push(this.parseAssignmentExpression());
        } else {
          break;
        }
        if (!this.peek_(CLOSE_PAREN)) {
          this.eat_(COMMA);
        }
      }
      this.eat_(CLOSE_PAREN);
      return new ArgumentList(this.getTreeLocation_(start), args);
    },
    peekRest_: function(type) {
      return type === DOT_DOT_DOT && parseOptions.restParameters;
    },
    parseArrowFunction_: function(expressionIn) {
      var start = this.getTreeStartLocation_();
      this.eat_(OPEN_PAREN);
      if (this.peek_(FOR) && parseOptions.generatorComprehension) return this.parseGeneratorComprehension_(start);
      var formals;
      var coverFormals = this.parseCoverFormals_();
      var expressions = coverFormals.expressions;
      this.eat_(CLOSE_PAREN);
      var mustBeArrow = expressions.length === 0 || expressions[expressions.length - 1].type === REST_PARAMETER;
      if (mustBeArrow || this.peekArrow_(this.peekType_())) {
        formals = this.transformCoverFormals_(coverFormals);
        if (!formals && mustBeArrow) {
          return this.parseUnexpectedToken_(DOT_DOT_DOT);
        }
      }
      if (!formals) {
        var expression;
        if (expressions.length > 1) expression = new CommaExpression(coverFormals.location, expressions); else expression = expressions[0];
        return new ParenExpression(this.getTreeLocation_(start), expression);
      }
      this.eat_(ARROW);
      var body = this.parseConciseBody_();
      var startLoc = this.getTreeLocation_(start);
      return new ArrowFunctionExpression(startLoc, formals, body);
    },
    parseCoverFormals_: function() {
      var start = this.getTreeStartLocation_();
      var type = this.peekType_();
      if (type === CLOSE_PAREN) return new CoverFormals(this.getTreeLocation_(start), []);
      if (this.peekRest_(type)) {
        var parameter = this.parseRestParameter_();
        return new CoverFormals(this.getTreeLocation_(start), [parameter]);
      }
      return this.parseExpressionForCoverFormals_();
    },
    transformCoverFormals_: function(coverFormals) {
      var transformer = new CoverFormalsTransformer();
      var formals = null;
      try {
        formals = transformer.transformAny(coverFormals);
      } catch (ex) {
        if (!(ex instanceof CoverFormalsTransformerError)) throw ex;
      }
      return formals;
    },
    peekArrow_: function(type) {
      return type === ARROW && parseOptions.arrowFunctions;
    },
    parseConciseBody_: function() {
      if (this.peek_(OPEN_CURLY)) return this.parseFunctionBody_();
      return this.parseAssignmentExpression();
    },
    parseGeneratorComprehension_: function(start) {
      var comprehensionList = this.parseComprehensionList_();
      var expression = this.parseAssignmentExpression();
      this.eat_(CLOSE_PAREN);
      return new GeneratorComprehension(this.getTreeLocation_(start), comprehensionList, expression);
    },
    parseForBinding_: function() {
      if (this.peekPattern_(this.peekType_())) return this.parseBindingPattern_();
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
      if (this.peekArrayPattern_(this.peekType_())) return this.parseArrayBindingPattern_();
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
      var initializer = arguments[0] !== (void 0) ? arguments[0]: Initializer.OPTIONAL;
      var start = this.getTreeStartLocation_();
      var binding;
      if (this.peekPattern_(this.peekType_())) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_();
      var initializer = null;
      if (this.peek_(EQUAL) || initializer === Initializer.REQUIRED) {
        initializer = this.parseInitializer_();
      }
      return new BindingElement(this.getTreeLocation_(start), binding, initializer);
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
        if (!this.eatIf_(COMMA)) break;
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
      if (this.strictMode_ && token.isStrictKeyword()) this.reportReservedIdentifier_(token);
      var binding = new BindingIdentifier(name.location, token);
      var initializer = null;
      if (this.peek_(EQUAL)) initializer = this.parseInitializer_();
      return new BindingElement(this.getTreeLocation_(start), binding, initializer);
    },
    parseTemplateLiteral_: function(operand) {
      if (!parseOptions.templateLiterals) return this.parseUnexpectedToken_('`');
      var start = operand ? operand.location.start: this.getTreeStartLocation_();
      var token = this.nextToken_();
      var elements = [new TemplateLiteralPortion(token.location, token)];
      if (token.type === NO_SUBSTITUTION_TEMPLATE) {
        return new TemplateLiteralExpression(this.getTreeLocation_(start), operand, elements);
      }
      var expression = this.parseExpression();
      elements.push(new TemplateSubstitution(expression.location, expression));
      while (expression.type !== SYNTAX_ERROR_TREE) {
        token = this.nextTemplateLiteralToken_();
        if (token.type === ERROR || token.type === END_OF_FILE) break;
        elements.push(new TemplateLiteralPortion(token.location, token));
        if (token.type === TEMPLATE_TAIL) break;
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
        case ANY:
        case NUMBER:
        case BOOL:
        case STRING:
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
    eatPossibleImplicitSemiColon_: function() {
      var strictSemicolons = this.strictSemicolons_;
      var token = this.peekTokenNoLineTerminator_();
      if (!token) {
        if (this.noLintChanged_) strictSemicolons = !strictSemicolons;
        if (!strictSemicolons) return;
      } else {
        switch (token.type) {
          case SEMI_COLON:
            this.nextToken_();
            return;
          case END_OF_FILE:
          case CLOSE_CURLY:
            if (this.noLintChanged_) strictSemicolons = !strictSemicolons;
            if (!strictSemicolons) return;
        }
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
      if (this.peek_(expectedTokenType)) return this.nextToken_();
      return null;
    },
    eatIdOpt_: function() {
      return this.peek_(IDENTIFIER) ? this.eatId_(): null;
    },
    eatId_: function() {
      var expected = arguments[0];
      var token = this.nextToken_();
      if (!token) {
        if (expected) this.reportError_(this.peekToken_(), ("expected '" + expected + "'"));
        return null;
      }
      if (token.type === IDENTIFIER) return token;
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
    handleSingleLineComment: function(input, start, end) {
      if (input.charCodeAt(start += 2) === 58 && !options.ignoreNolint) {
        var text = input.slice(start + 1, start + 8);
        if (text.search(/^(?:no)?lint\b/) === 0) {
          var noLint = text[0] === 'n';
          if (noLint !== this.noLint) {
            this.noLintChanged_ = !this.noLintChanged_;
            this.noLint = noLint;
            this.strictSemicolons_ = options.strictSemicolons && !this.noLint;
          }
        }
      }
    },
    nextToken_: function() {
      this.noLintChanged_ = false;
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
    reportError_: function(var_args) {
      if (arguments.length == 1) {
        this.errorReporter_.reportError(this.scanner_.getPosition(), arguments[0]);
      } else {
        var location = arguments[0];
        if (location instanceof Token) {
          location = location.location;
        }
        this.errorReporter_.reportError(location.start, arguments[1]);
      }
    },
    reportReservedIdentifier_: function(token) {
      this.reportError_(token, (token.type + " is a reserved identifier"));
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {Parser: {
      get: function() {
        return Parser;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/uid.js", function() {
  "use strict";
  var uidCounter = 0;
  function getUid() {
    return uidCounter++;
  }
  return Object.preventExtensions(Object.create(null, {getUid: {
      get: function() {
        return getUid;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/SourcePosition.js", function() {
  "use strict";
  function SourcePosition(source, offset) {
    this.source = source;
    this.offset = offset;
    this.line_ = - 1;
    this.column_ = - 1;
  }
  ($__class)(SourcePosition, {
    get line() {
      if (this.line_ === - 1) this.line_ = this.source.lineNumberTable.getLine(this.offset);
      return this.line_;
    },
    get column() {
      if (this.column_ === - 1) this.column_ = this.source.lineNumberTable.getColumn(this.offset);
      return this.column_;
    },
    toString: function() {
      var name = this.source ? this.source.name: '';
      return (name + ":" + (this.line + 1) + ":" + (this.column + 1));
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {SourcePosition: {
      get: function() {
        return SourcePosition;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/LineNumberTable.js", function() {
  "use strict";
  var SourcePosition = System.get("../src/util/SourcePosition.js").SourcePosition;
  var SourceRange = System.get("../src/util/SourceRange.js").SourceRange;
  var isLineTerminator = System.get("../src/syntax/Scanner.js").isLineTerminator;
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
  function LineNumberTable(sourceFile) {
    this.sourceFile_ = sourceFile;
    this.lineStartOffsets_ = null;
    this.lastLine_ = 0;
    this.lastOffset_ = - 1;
  }
  ($__class)(LineNumberTable, {
    ensureLineStartOffsets_: function() {
      if (!this.lineStartOffsets_) {
        this.lineStartOffsets_ = computeLineStartOffsets(this.sourceFile_.contents);
      }
    },
    getSourcePosition: function(offset) {
      return new SourcePosition(this.sourceFile_, offset);
    },
    getLine: function(offset) {
      if (offset === this.lastOffset_) return this.lastLine_;
      this.ensureLineStartOffsets_();
      if (offset < 0) return 0;
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
  return Object.preventExtensions(Object.create(null, {LineNumberTable: {
      get: function() {
        return LineNumberTable;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/SourceFile.js", function() {
  "use strict";
  var LineNumberTable = System.get("../src/syntax/LineNumberTable.js").LineNumberTable;
  var getUid = System.get("../src/util/uid.js").getUid;
  function SourceFile(name, contents) {
    this.name = name;
    this.contents = contents;
    this.lineNumberTable = new LineNumberTable(this);
    this.uid = getUid();
  }
  ($__class)(SourceFile, {}, {});
  return Object.preventExtensions(Object.create(null, {SourceFile: {
      get: function() {
        return SourceFile;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/ErrorReporter.js", function() {
  "use strict";
  function ErrorReporter() {
    this.hadError_ = false;
  }
  ($__class)(ErrorReporter, {
    reportError: function(location, format) {
      for (var args = [],
          $__50 = 2; $__50 < arguments.length; $__50++) args[$__50 - 2] = arguments[$__50];
      this.hadError_ = true;
      this.reportMessageInternal(location, format, args);
    },
    reportMessageInternal: function(location, format, args) {
      var $__51;
      if (location) format = (location + ": " + format);
      ($__51 = console).error.apply($__51, $__spread([format], args));
    },
    hadError: function() {
      return this.hadError_;
    },
    clearError: function() {
      this.hadError_ = false;
    }
  }, {});
  ErrorReporter.format = function(location, text) {
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
    if (location) text = (location + ": " + text);
    return text;
  };
  return Object.preventExtensions(Object.create(null, {ErrorReporter: {
      get: function() {
        return ErrorReporter;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/MutedErrorReporter.js", function() {
  "use strict";
  var ErrorReporter = System.get("../src/util/ErrorReporter.js").ErrorReporter;
  function MutedErrorReporter() {
    $__MutedErrorReporter__proto !== null && $__superCall(this, $__MutedErrorReporter__proto, "constructor", arguments);
  }
  var $__MutedErrorReporter__super = ErrorReporter;
  var $__MutedErrorReporter__proto = $__getProtoParent($__MutedErrorReporter__super);
  ($__class)(MutedErrorReporter, {reportMessageInternal: function(location, format, args) {}}, {}, $__MutedErrorReporter__super, $__MutedErrorReporter__proto);
  return Object.preventExtensions(Object.create(null, {MutedErrorReporter: {
      get: function() {
        return MutedErrorReporter;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ParseTreeFactory.js", function() {
  "use strict";
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var LiteralToken = System.get("../src/syntax/LiteralToken.js").LiteralToken;
  var $__56 = System.get("../src/syntax/trees/ParseTree.js"),
      ParseTree = $__56.ParseTree,
      ParseTreeType = $__56.ParseTreeType;
  var $__56 = System.get("../src/syntax/PredefinedName.js"),
      BIND = $__56.BIND,
      CALL = $__56.CALL,
      CREATE = $__56.CREATE,
      DEFINE_PROPERTY = $__56.DEFINE_PROPERTY,
      FREEZE = $__56.FREEZE,
      OBJECT = $__56.OBJECT,
      PREVENT_EXTENSIONS = $__56.PREVENT_EXTENSIONS,
      STATE = $__56.STATE,
      UNDEFINED = $__56.UNDEFINED,
      getParameterName = $__56.getParameterName;
  var Token = System.get("../src/syntax/Token.js").Token;
  var $__56 = System.get("../src/syntax/TokenType.js"),
      EQUAL = $__56.EQUAL,
      FALSE = $__56.FALSE,
      NULL = $__56.NULL,
      NUMBER = $__56.NUMBER,
      STRING = $__56.STRING,
      TRUE = $__56.TRUE,
      VOID = $__56.VOID;
  var assert = System.get("../src/util/assert.js").assert;
  var $__56 = System.get("../src/syntax/trees/ParseTrees.js"),
      ArgumentList = $__56.ArgumentList,
      ArrayComprehension = $__56.ArrayComprehension,
      ArrayLiteralExpression = $__56.ArrayLiteralExpression,
      ArrayPattern = $__56.ArrayPattern,
      ArrowFunctionExpression = $__56.ArrowFunctionExpression,
      AwaitStatement = $__56.AwaitStatement,
      BinaryOperator = $__56.BinaryOperator,
      BindingElement = $__56.BindingElement,
      BindingIdentifier = $__56.BindingIdentifier,
      Block = $__56.Block,
      BreakStatement = $__56.BreakStatement,
      CallExpression = $__56.CallExpression,
      CascadeExpression = $__56.CascadeExpression,
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
      ExportSpecifier = $__56.ExportSpecifier,
      ExportSpecifierSet = $__56.ExportSpecifierSet,
      ExportStar = $__56.ExportStar,
      ExpressionStatement = $__56.ExpressionStatement,
      Finally = $__56.Finally,
      ForInStatement = $__56.ForInStatement,
      ForOfStatement = $__56.ForOfStatement,
      ForStatement = $__56.ForStatement,
      FormalParameterList = $__56.FormalParameterList,
      FunctionBody = $__56.FunctionBody,
      FunctionDeclaration = $__56.FunctionDeclaration,
      FunctionExpression = $__56.FunctionExpression,
      GeneratorComprehension = $__56.GeneratorComprehension,
      GetAccessor = $__56.GetAccessor,
      IdentifierExpression = $__56.IdentifierExpression,
      IfStatement = $__56.IfStatement,
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
    return new Token(value ? TRUE: FALSE, null);
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
        $__54 = 1; $__54 < arguments.length; $__54++) args[$__54 - 1] = arguments[$__54];
    if (statementsOrHead instanceof Array) return $__spread(statementsOrHead, args);
    return slice(arguments);
  }
  function createBindingElement(arg) {
    var binding = createBindingIdentifier(arg);
    return new BindingElement(null, binding, null);
  }
  function createParameterList(arg0, var_args) {
    if (typeof arg0 == 'string') {
      var parameterList = map(arguments, createBindingElement);
      return new FormalParameterList(null, parameterList);
    }
    if (typeof arg0 == 'number') return createParameterListHelper(arg0, false);
    if (arg0 instanceof IdentifierToken) {
      return new FormalParameterList(null, [createBindingElement(arg0)]);
    }
    var builder = arg0.map(createBindingElement);
    return new FormalParameterList(null, builder);
  }
  function createParameterListHelper(numberOfParameters, hasRestParams) {
    var builder = [];
    for (var index = 0; index < numberOfParameters; index++) {
      var parameterName = getParameterName(index);
      var isRestParameter = index == numberOfParameters - 1 && hasRestParams;
      builder.push(isRestParameter ? createRestParameter(parameterName): createBindingElement(parameterName));
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
    if (numberListOrFirst instanceof Array) list = numberListOrFirst; else list = slice(arguments);
    return new ArgumentList(null, list);
  }
  function createArgumentListFromParameterList(formalParameterList) {
    var builder = formalParameterList.parameters.map(function(parameter) {
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
    if (typeof identifier === 'string') identifier = createIdentifierToken(identifier); else if (identifier.type === ParseTreeType.BINDING_IDENTIFIER) return identifier; else if (identifier.type === ParseTreeType.IDENTIFIER_EXPRESSION) return new BindingIdentifier(identifier.location, identifier.identifierToken);
    return new BindingIdentifier(null, identifier);
  }
  function createEmptyStatement() {
    return new EmptyStatement(null);
  }
  function createEmptyBlock() {
    return createBlock(createEmptyList());
  }
  function createBlock(statements) {
    if (statements instanceof ParseTree) statements = slice(arguments);
    return new Block(null, statements);
  }
  function createFunctionBody(statements) {
    return new FunctionBody(null, statements);
  }
  function createScopedExpression(body) {
    assert(body.type === 'FUNCTION_BODY');
    return createCallCall(createParenExpression(createFunctionExpression(createEmptyParameterList(), body)), createThisExpression());
  }
  function createCallExpression(operand) {
    var args = arguments[1] !== (void 0) ? arguments[1]: createEmptyArgumentList();
    return new CallExpression(null, operand, args);
  }
  function createBoundCall(func, thisTree) {
    return createCallExpression(createMemberExpression(func.type == ParseTreeType.FUNCTION_EXPRESSION ? createParenExpression(func): func, BIND), createArgumentList(thisTree));
  }
  function createBreakStatement() {
    var name = arguments[0] !== (void 0) ? arguments[0]: null;
    return new BreakStatement(null, name);
  }
  function createCallCall(func, thisExpression, args, var_args) {
    var $__57;
    if (args instanceof ParseTree) args = slice(arguments, 2);
    var builder = [thisExpression];
    if (args)($__57 = builder).push.apply($__57, $__toObject(args));
    return createCallExpression(createMemberExpression(func, CALL), createArgumentList(builder));
  }
  function createCallCallStatement(func, thisExpression) {
    for (var args = [],
        $__55 = 2; $__55 < arguments.length; $__55++) args[$__55 - 2] = arguments[$__55];
    return createExpressionStatement(createCallCall(func, thisExpression, args));
  }
  function createCaseClause(expression, statements) {
    return new CaseClause(null, expression, statements);
  }
  function createCatch(identifier, catchBody) {
    identifier = createBindingIdentifier(identifier);
    return new Catch(null, identifier, catchBody);
  }
  function createCascadeExpression(operand, expressions) {
    return new CascadeExpression(null, operand, expressions);
  }
  function createClassDeclaration(name, superClass, elements) {
    return new ClassDeclaration(null, name, superClass, elements);
  }
  function createCommaExpression(expressions) {
    return new CommaExpression(null, expressions);
  }
  function createConditionalExpression(condition, left, right) {
    return new ConditionalExpression(null, condition, left, right);
  }
  function createContinueStatement() {
    var name = arguments[0] !== (void 0) ? arguments[0]: null;
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
  function createFunctionExpression(formalParameterList, body) {
    assert(body.type === 'FUNCTION_BODY');
    return new FunctionExpression(null, null, false, formalParameterList, body);
  }
  function createGetAccessor(name, body) {
    if (typeof name == 'string') name = createPropertyNameToken(name);
    var isStatic = false;
    return new GetAccessor(null, isStatic, name, body);
  }
  function createIdentifierExpression(identifier) {
    if (typeof identifier == 'string') identifier = createIdentifierToken(identifier); else if (identifier instanceof BindingIdentifier) identifier = identifier.identifierToken;
    return new IdentifierExpression(null, identifier);
  }
  function createUndefinedExpression() {
    return createIdentifierExpression(UNDEFINED);
  }
  function createIfStatement(condition, ifClause) {
    var elseClause = arguments[2] !== (void 0) ? arguments[2]: null;
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
    if (typeof operand == 'string' || operand instanceof IdentifierToken) operand = createIdentifierExpression(operand);
    if (typeof memberName == 'string') memberName = createIdentifierToken(memberName);
    var tree = new MemberExpression(null, operand, memberName);
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
    if (descriptors) argumentList.push(descriptors);
    return createCallExpression(createMemberExpression(OBJECT, CREATE), createArgumentList(argumentList));
  }
  function createPropertyDescriptor(descr) {
    var propertyNameAndValues = Object.keys(descr).map(function(name) {
      var value = descr[name];
      if (!(value instanceof ParseTree)) value = createBooleanLiteral(!!value);
      return createPropertyNameAssignment(name, value);
    });
    return createObjectLiteralExpression(propertyNameAndValues);
  }
  function createDefineProperty(tree, name, descr) {
    if (typeof name === 'string') name = createStringLiteral(name);
    return createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTY), createArgumentList(tree, name, createPropertyDescriptor(descr)));
  }
  function createObjectLiteralExpression(propertyNameAndValues) {
    if (propertyNameAndValues instanceof ParseTree) propertyNameAndValues = slice(arguments);
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
    if (typeof identifier == 'string') identifier = createLiteralPropertyName(identifier);
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
    if (typeof name == 'string') name = createPropertyNameToken(name);
    if (typeof parameter == 'string') parameter = createIdentifierToken(parameter);
    var isStatic = false;
    return new SetAccessor(null, isStatic, name, parameter, body);
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
    var finallyBlock = arguments[2] !== (void 0) ? arguments[2]: null;
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
    if (listOrBinding instanceof VariableDeclarationList) return new VariableStatement(null, listOrBinding);
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
    return createAssignmentStatement(createIdentifierExpression(STATE), createNumberLiteral(state));
  }
  return Object.preventExtensions(Object.create(null, {
    createOperatorToken: {
      get: function() {
        return createOperatorToken;
      },
      enumerable: true
    },
    createIdentifierToken: {
      get: function() {
        return createIdentifierToken;
      },
      enumerable: true
    },
    createPropertyNameToken: {
      get: function() {
        return createPropertyNameToken;
      },
      enumerable: true
    },
    createStringLiteralToken: {
      get: function() {
        return createStringLiteralToken;
      },
      enumerable: true
    },
    createBooleanLiteralToken: {
      get: function() {
        return createBooleanLiteralToken;
      },
      enumerable: true
    },
    createNullLiteralToken: {
      get: function() {
        return createNullLiteralToken;
      },
      enumerable: true
    },
    createNumberLiteralToken: {
      get: function() {
        return createNumberLiteralToken;
      },
      enumerable: true
    },
    createEmptyParameters: {
      get: function() {
        return createEmptyParameters;
      },
      enumerable: true
    },
    createStatementList: {
      get: function() {
        return createStatementList;
      },
      enumerable: true
    },
    createBindingElement: {
      get: function() {
        return createBindingElement;
      },
      enumerable: true
    },
    createParameterList: {
      get: function() {
        return createParameterList;
      },
      enumerable: true
    },
    createParameterListWithRestParams: {
      get: function() {
        return createParameterListWithRestParams;
      },
      enumerable: true
    },
    createParameterReference: {
      get: function() {
        return createParameterReference;
      },
      enumerable: true
    },
    createEmptyParameterList: {
      get: function() {
        return createEmptyParameterList;
      },
      enumerable: true
    },
    createEmptyList: {
      get: function() {
        return createEmptyList;
      },
      enumerable: true
    },
    createArgumentList: {
      get: function() {
        return createArgumentList;
      },
      enumerable: true
    },
    createArgumentListFromParameterList: {
      get: function() {
        return createArgumentListFromParameterList;
      },
      enumerable: true
    },
    createEmptyArgumentList: {
      get: function() {
        return createEmptyArgumentList;
      },
      enumerable: true
    },
    createArrayLiteralExpression: {
      get: function() {
        return createArrayLiteralExpression;
      },
      enumerable: true
    },
    createEmptyArrayLiteralExpression: {
      get: function() {
        return createEmptyArrayLiteralExpression;
      },
      enumerable: true
    },
    createArrayPattern: {
      get: function() {
        return createArrayPattern;
      },
      enumerable: true
    },
    createAssignmentExpression: {
      get: function() {
        return createAssignmentExpression;
      },
      enumerable: true
    },
    createBinaryOperator: {
      get: function() {
        return createBinaryOperator;
      },
      enumerable: true
    },
    createBindingIdentifier: {
      get: function() {
        return createBindingIdentifier;
      },
      enumerable: true
    },
    createEmptyStatement: {
      get: function() {
        return createEmptyStatement;
      },
      enumerable: true
    },
    createEmptyBlock: {
      get: function() {
        return createEmptyBlock;
      },
      enumerable: true
    },
    createBlock: {
      get: function() {
        return createBlock;
      },
      enumerable: true
    },
    createFunctionBody: {
      get: function() {
        return createFunctionBody;
      },
      enumerable: true
    },
    createScopedExpression: {
      get: function() {
        return createScopedExpression;
      },
      enumerable: true
    },
    createCallExpression: {
      get: function() {
        return createCallExpression;
      },
      enumerable: true
    },
    createBoundCall: {
      get: function() {
        return createBoundCall;
      },
      enumerable: true
    },
    createBreakStatement: {
      get: function() {
        return createBreakStatement;
      },
      enumerable: true
    },
    createCallCall: {
      get: function() {
        return createCallCall;
      },
      enumerable: true
    },
    createCallCallStatement: {
      get: function() {
        return createCallCallStatement;
      },
      enumerable: true
    },
    createCaseClause: {
      get: function() {
        return createCaseClause;
      },
      enumerable: true
    },
    createCatch: {
      get: function() {
        return createCatch;
      },
      enumerable: true
    },
    createCascadeExpression: {
      get: function() {
        return createCascadeExpression;
      },
      enumerable: true
    },
    createClassDeclaration: {
      get: function() {
        return createClassDeclaration;
      },
      enumerable: true
    },
    createCommaExpression: {
      get: function() {
        return createCommaExpression;
      },
      enumerable: true
    },
    createConditionalExpression: {
      get: function() {
        return createConditionalExpression;
      },
      enumerable: true
    },
    createContinueStatement: {
      get: function() {
        return createContinueStatement;
      },
      enumerable: true
    },
    createDefaultClause: {
      get: function() {
        return createDefaultClause;
      },
      enumerable: true
    },
    createDoWhileStatement: {
      get: function() {
        return createDoWhileStatement;
      },
      enumerable: true
    },
    createAssignmentStatement: {
      get: function() {
        return createAssignmentStatement;
      },
      enumerable: true
    },
    createCallStatement: {
      get: function() {
        return createCallStatement;
      },
      enumerable: true
    },
    createExpressionStatement: {
      get: function() {
        return createExpressionStatement;
      },
      enumerable: true
    },
    createFinally: {
      get: function() {
        return createFinally;
      },
      enumerable: true
    },
    createForOfStatement: {
      get: function() {
        return createForOfStatement;
      },
      enumerable: true
    },
    createForInStatement: {
      get: function() {
        return createForInStatement;
      },
      enumerable: true
    },
    createForStatement: {
      get: function() {
        return createForStatement;
      },
      enumerable: true
    },
    createFunctionExpression: {
      get: function() {
        return createFunctionExpression;
      },
      enumerable: true
    },
    createGetAccessor: {
      get: function() {
        return createGetAccessor;
      },
      enumerable: true
    },
    createIdentifierExpression: {
      get: function() {
        return createIdentifierExpression;
      },
      enumerable: true
    },
    createUndefinedExpression: {
      get: function() {
        return createUndefinedExpression;
      },
      enumerable: true
    },
    createIfStatement: {
      get: function() {
        return createIfStatement;
      },
      enumerable: true
    },
    createLabelledStatement: {
      get: function() {
        return createLabelledStatement;
      },
      enumerable: true
    },
    createStringLiteral: {
      get: function() {
        return createStringLiteral;
      },
      enumerable: true
    },
    createBooleanLiteral: {
      get: function() {
        return createBooleanLiteral;
      },
      enumerable: true
    },
    createTrueLiteral: {
      get: function() {
        return createTrueLiteral;
      },
      enumerable: true
    },
    createFalseLiteral: {
      get: function() {
        return createFalseLiteral;
      },
      enumerable: true
    },
    createNullLiteral: {
      get: function() {
        return createNullLiteral;
      },
      enumerable: true
    },
    createNumberLiteral: {
      get: function() {
        return createNumberLiteral;
      },
      enumerable: true
    },
    createMemberExpression: {
      get: function() {
        return createMemberExpression;
      },
      enumerable: true
    },
    createMemberLookupExpression: {
      get: function() {
        return createMemberLookupExpression;
      },
      enumerable: true
    },
    createThisExpression: {
      get: function() {
        return createThisExpression;
      },
      enumerable: true
    },
    createNewExpression: {
      get: function() {
        return createNewExpression;
      },
      enumerable: true
    },
    createObjectFreeze: {
      get: function() {
        return createObjectFreeze;
      },
      enumerable: true
    },
    createObjectPreventExtensions: {
      get: function() {
        return createObjectPreventExtensions;
      },
      enumerable: true
    },
    createObjectCreate: {
      get: function() {
        return createObjectCreate;
      },
      enumerable: true
    },
    createPropertyDescriptor: {
      get: function() {
        return createPropertyDescriptor;
      },
      enumerable: true
    },
    createDefineProperty: {
      get: function() {
        return createDefineProperty;
      },
      enumerable: true
    },
    createObjectLiteralExpression: {
      get: function() {
        return createObjectLiteralExpression;
      },
      enumerable: true
    },
    createObjectPattern: {
      get: function() {
        return createObjectPattern;
      },
      enumerable: true
    },
    createObjectPatternField: {
      get: function() {
        return createObjectPatternField;
      },
      enumerable: true
    },
    createParenExpression: {
      get: function() {
        return createParenExpression;
      },
      enumerable: true
    },
    createPostfixExpression: {
      get: function() {
        return createPostfixExpression;
      },
      enumerable: true
    },
    createScript: {
      get: function() {
        return createScript;
      },
      enumerable: true
    },
    createPropertyNameAssignment: {
      get: function() {
        return createPropertyNameAssignment;
      },
      enumerable: true
    },
    createLiteralPropertyName: {
      get: function() {
        return createLiteralPropertyName;
      },
      enumerable: true
    },
    createRestParameter: {
      get: function() {
        return createRestParameter;
      },
      enumerable: true
    },
    createReturnStatement: {
      get: function() {
        return createReturnStatement;
      },
      enumerable: true
    },
    createYieldStatement: {
      get: function() {
        return createYieldStatement;
      },
      enumerable: true
    },
    createSetAccessor: {
      get: function() {
        return createSetAccessor;
      },
      enumerable: true
    },
    createSpreadExpression: {
      get: function() {
        return createSpreadExpression;
      },
      enumerable: true
    },
    createSpreadPatternElement: {
      get: function() {
        return createSpreadPatternElement;
      },
      enumerable: true
    },
    createSwitchStatement: {
      get: function() {
        return createSwitchStatement;
      },
      enumerable: true
    },
    createThrowStatement: {
      get: function() {
        return createThrowStatement;
      },
      enumerable: true
    },
    createTryStatement: {
      get: function() {
        return createTryStatement;
      },
      enumerable: true
    },
    createUnaryExpression: {
      get: function() {
        return createUnaryExpression;
      },
      enumerable: true
    },
    createUseStrictDirective: {
      get: function() {
        return createUseStrictDirective;
      },
      enumerable: true
    },
    createVariableDeclarationList: {
      get: function() {
        return createVariableDeclarationList;
      },
      enumerable: true
    },
    createVariableDeclaration: {
      get: function() {
        return createVariableDeclaration;
      },
      enumerable: true
    },
    createVariableStatement: {
      get: function() {
        return createVariableStatement;
      },
      enumerable: true
    },
    createVoid0: {
      get: function() {
        return createVoid0;
      },
      enumerable: true
    },
    createWhileStatement: {
      get: function() {
        return createWhileStatement;
      },
      enumerable: true
    },
    createWithStatement: {
      get: function() {
        return createWithStatement;
      },
      enumerable: true
    },
    createAssignStateStatement: {
      get: function() {
        return createAssignStateStatement;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/PrependStatements.js", function() {
  "use strict";
  var $__59 = System.get("../src/syntax/trees/ParseTreeType.js"),
      EXPRESSION_STATEMENT = $__59.EXPRESSION_STATEMENT,
      LITERAL_EXPRESSION = $__59.LITERAL_EXPRESSION;
  var STRING = System.get("../src/syntax/TokenType.js").STRING;
  function isStringExpressionStatement(tree) {
    return tree.type === EXPRESSION_STATEMENT && tree.expression.type === LITERAL_EXPRESSION && tree.expression.literalToken.type === STRING;
  }
  function prependStatements(statements) {
    for (var statementsToPrepend = [],
        $__58 = 1; $__58 < arguments.length; $__58++) statementsToPrepend[$__58 - 1] = arguments[$__58];
    if (!statements.length) return statementsToPrepend;
    if (!statementsToPrepend.length) return statements;
    var transformed = [];
    var inProlog = true;
    statements.forEach((function(statement) {
      var $__60;
      if (inProlog && !isStringExpressionStatement(statement)) {
        ($__60 = transformed).push.apply($__60, $__toObject(statementsToPrepend));
        inProlog = false;
      }
      transformed.push(statement);
    }));
    return transformed;
  }
  return Object.preventExtensions(Object.create(null, {prependStatements: {
      get: function() {
        return prependStatements;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/RuntimeInliner.js", function() {
  "use strict";
  var MutedErrorReporter = System.get("../src/util/MutedErrorReporter.js").MutedErrorReporter;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var Parser = System.get("../src/syntax/Parser.js").Parser;
  var $__62 = System.get("../src/syntax/trees/ParseTrees.js"),
      Script = $__62.Script,
      Module = $__62.Module;
  var SourceFile = System.get("../src/syntax/SourceFile.js").SourceFile;
  var VAR = System.get("../src/syntax/TokenType.js").VAR;
  var assert = System.get("../src/util/assert.js").assert;
  var $__62 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createIdentifierExpression = $__62.createIdentifierExpression,
      createVariableDeclaration = $__62.createVariableDeclaration,
      createVariableDeclarationList = $__62.createVariableDeclarationList,
      createVariableStatement = $__62.createVariableStatement;
  var prependStatements = System.get("../src/codegeneration/PrependStatements.js").prependStatements;
  var shared = {
    Function: "Function",
    FunctionPrototype: "%Function.prototype",
    Object: "Object",
    ObjectPrototype: "%Object.prototype",
    TypeError: "TypeError",
    defineProperties: "%Object.defineProperties",
    defineProperty: "%Object.defineProperty",
    getOwnPropertyDescriptor: "%Object.getOwnPropertyDescriptor",
    getOwnPropertyNames: "%Object.getOwnPropertyNames",
    getPrototypeOf: "%Object.getPrototypeOf",
    iterator: "'@@iterator'",
    returnThis: "function() { return this; }",
    toObject: "function(value) {\n        if (value == null)\n          throw %TypeError();\n        return %Object(value);\n      }",
    getDescriptors: "function(object) {\n        var descriptors = {}, names = %getOwnPropertyNames(object);\n        for (var i = 0; i < names.length; i++) {\n          var name = names[i];\n          descriptors[name] = %getOwnPropertyDescriptor(object, name);\n        }\n        return descriptors;\n      }",
    getPropertyDescriptor: "function(object, name) {\n        while (object !== null) {\n          var result = %getOwnPropertyDescriptor(object, name);\n          if (result)\n            return result;\n          object = %getPrototypeOf(object);\n        }\n        return undefined;\n      }"
  };
  function parse(source, name) {
    var file = new SourceFile('@traceur/generated/' + name, source);
    var errorReporter = new MutedErrorReporter();
    return new Parser(errorReporter, file).parseAssignmentExpression();
  }
  function prependRuntimeVariables(map, statements) {
    var names = Object.keys(map);
    if (!names.length) return statements;
    var vars = names.filter((function(name) {
      return !map[name].inserted;
    })).map((function(name) {
      var item = map[name];
      item.inserted = true;
      return createVariableDeclaration(item.uid, item.expression);
    }));
    if (!vars.length) return statements;
    return prependStatements(statements, createVariableStatement(createVariableDeclarationList(VAR, vars)));
  }
  function RuntimeInliner(identifierGenerator) {
    $__superCall(this, $__RuntimeInliner__proto, "constructor", []);
    this.identifierGenerator = identifierGenerator;
    this.map_ = Object.create(null);
  }
  var $__RuntimeInliner__super = ParseTreeTransformer;
  var $__RuntimeInliner__proto = $__getProtoParent($__RuntimeInliner__super);
  ($__class)(RuntimeInliner, {
    transformScript: function(tree) {
      var statements = prependRuntimeVariables(this.map_, tree.scriptItemList);
      if (statements === tree.scriptItemList) return tree;
      return new Script(tree.location, statements);
    },
    transformModule: function(tree) {
      var statements = prependRuntimeVariables(this.map_, tree.scriptItemList);
      if (statements === tree.scriptItemList) return tree;
      return new Module(tree.location, statements);
    },
    register: function(name, source) {
      if (name in this.map_) return;
      var self = this;
      source = source.replace(/%([a-zA-Z0-9_$]+)/g, function(_, name) {
        if (name in shared) {
          self.register(name, shared[name]);
        }
        return self.getAsString(name);
      });
      var uid = this.identifierGenerator.getUniqueIdentifier(name);
      this.map_[name] = {
        expression: parse(source, name),
        uid: uid,
        inserted: false
      };
    },
    getAsIdentifierExpression: function(name) {
      return createIdentifierExpression(this.map_[name].uid);
    },
    getAsString: function(name) {
      return this.map_[name].uid;
    },
    get: function(name) {
      var source = arguments[1];
      if (!(name in this.map_)) {
        if (name in shared) source = shared[name];
        assert(source);
        this.register(name, source);
      }
      return this.getAsIdentifierExpression(name);
    }
  }, {}, $__RuntimeInliner__super, $__RuntimeInliner__proto);
  return Object.preventExtensions(Object.create(null, {RuntimeInliner: {
      get: function() {
        return RuntimeInliner;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/UniqueIdentifierGenerator.js", function() {
  "use strict";
  function UniqueIdentifierGenerator() {
    this.identifierIndex = 0;
  }
  ($__class)(UniqueIdentifierGenerator, {
    generateUniqueIdentifier: function() {
      return ("$__" + this.identifierIndex++);
    },
    getUniqueIdentifier: function(name) {
      if (name[0] === '@') return ("$___" + name.slice(1));
      return ("$__" + name);
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {UniqueIdentifierGenerator: {
      get: function() {
        return UniqueIdentifierGenerator;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/ArrayMap.js", function() {
  "use strict";
  function ArrayMap() {
    this.values_ = [];
    this.keys_ = [];
  }
  ($__class)(ArrayMap, {
    has: function(key) {
      return this.keys_.indexOf(key) != - 1;
    },
    get: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == - 1) {
        return undefined;
      }
      return this.values_[index];
    },
    set: function(key, value) {
      var index = this.keys_.indexOf(key);
      if (index == - 1) {
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
      if (index == - 1) {
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
  return Object.preventExtensions(Object.create(null, {ArrayMap: {
      get: function() {
        return ArrayMap;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/ObjectMap.js", function() {
  "use strict";
  function ObjectMap() {
    this.keys_ = Object.create(null);
    this.values_ = Object.create(null);
  }
  ($__class)(ObjectMap, {
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
      return Object.keys(this.keys_).map((function(uid) {
        return this.keys_[uid];
      }).bind(this));
    },
    values: function() {
      return Object.keys(this.values_).map((function(uid) {
        return this.values_[uid];
      }).bind(this));
    },
    remove: function(key) {
      var uid = key.uid;
      delete this.keys_[uid];
      delete this.values_[uid];
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {ObjectMap: {
      get: function() {
        return ObjectMap;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/util/url.js", function() {
  "use strict";
  var $___64_traceur_47_url__ = System.get("@traceur/url");
  return Object.preventExtensions(Object.create(null, {
    canonicalizeUrl: {
      get: function() {
        return $___64_traceur_47_url__.canonicalizeUrl;
      },
      enumerable: true
    },
    isStandardModuleUrl: {
      get: function() {
        return $___64_traceur_47_url__.isStandardModuleUrl;
      },
      enumerable: true
    },
    removeDotSegments: {
      get: function() {
        return $___64_traceur_47_url__.removeDotSegments;
      },
      enumerable: true
    },
    resolveUrl: {
      get: function() {
        return $___64_traceur_47_url__.resolveUrl;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/symbols/ModuleSymbol.js", function() {
  "use strict";
  var Symbol = System.get("../src/semantics/symbols/Symbol.js").Symbol;
  var MODULE = System.get("../src/semantics/symbols/SymbolType.js").MODULE;
  var assert = System.get("../src/util/assert.js").assert;
  function ModuleSymbol(tree, url) {
    $__superCall(this, $__ModuleSymbol__proto, "constructor", [MODULE, tree]);
    this.exports_ = Object.create(null);
    assert(url);
    this.url = url.replace(/\\/g, '/');
  }
  var $__ModuleSymbol__super = Symbol;
  var $__ModuleSymbol__proto = $__getProtoParent($__ModuleSymbol__super);
  ($__class)(ModuleSymbol, {
    hasExport: function(name) {
      return name in this.exports_;
    },
    getExport: function(name) {
      return this.exports_[name];
    },
    addExport: function(exp) {
      this.exports_[exp.name] = exp;
    },
    getExports: function() {
      var exports = this.exports_;
      return Object.keys(exports).map((function(key) {
        return exports[key];
      }));
    }
  }, {}, $__ModuleSymbol__super, $__ModuleSymbol__proto);
  return Object.preventExtensions(Object.create(null, {ModuleSymbol: {
      get: function() {
        return ModuleSymbol;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/symbols/Project.js", function() {
  "use strict";
  var ArrayMap = System.get("../src/util/ArrayMap.js").ArrayMap;
  var ExportSymbol = System.get("../src/semantics/symbols/ExportSymbol.js").ExportSymbol;
  var ModuleSymbol = System.get("../src/semantics/symbols/ModuleSymbol.js").ModuleSymbol;
  var ObjectMap = System.get("../src/util/ObjectMap.js").ObjectMap;
  var RuntimeInliner = System.get("../src/codegeneration/RuntimeInliner.js").RuntimeInliner;
  var UniqueIdentifierGenerator = System.get("../src/codegeneration/UniqueIdentifierGenerator.js").UniqueIdentifierGenerator;
  var assert = System.get("../src/util/assert.js").assert;
  var isStandardModuleUrl = System.get("../src/util/url.js").isStandardModuleUrl;
  function addAll(self, other) {
    for (var key in other) {
      self[key] = other[key];
    }
  }
  function values(map) {
    return Object.keys(map).map((function(key) {
      return map[key];
    }));
  }
  var standardModuleCache = Object.create(null);
  function getStandardModule(url) {
    if (!(url in standardModuleCache)) {
      var symbol = new ModuleSymbol(null, url);
      var moduleInstance = System.get(url);
      if (!moduleInstance) throw new Error(("Internal error, no standard module for " + url));
      Object.keys(moduleInstance).forEach((function(name) {
        symbol.addExport(new ExportSymbol(name, null, null));
      }));
      standardModuleCache[url] = symbol;
    }
    return standardModuleCache[url];
  }
  function Project(url) {
    this.identifierGenerator = new UniqueIdentifierGenerator();
    this.runtimeInliner = new RuntimeInliner(this.identifierGenerator);
    this.sourceFiles_ = Object.create(null);
    this.parseTrees_ = new ObjectMap();
    this.rootModule_ = new ModuleSymbol(null, url);
    this.modulesByResolvedUrl_ = Object.create(null);
    this.moduleExports_ = new ArrayMap();
  }
  ($__class)(Project, {
    get url() {
      return this.rootModule_.url;
    },
    createClone: function() {
      var p = new Project(this.url);
      addAll(p.sourceFiles_, this.sourceFiles_);
      p.parseTrees_.addAll(this.parseTrees_);
      p.objectClass_ = this.objectClass_;
      return p;
    },
    hasFile: function(name) {
      return name in this.sourceFiles_;
    },
    addFile: function(file) {
      this.sourceFiles_[file.name] = file;
    },
    getFile: function(name) {
      return this.sourceFiles_[name];
    },
    getSourceFiles: function() {
      return values(this.sourceFiles_);
    },
    getParseTrees: function() {
      return this.parseTrees_.values();
    },
    setParseTree: function(file, tree) {
      if (this.sourceFiles_[file.name] != file) {
        throw new Error();
      }
      this.parseTrees_.set(file, tree);
    },
    getParseTree: function(file) {
      return this.parseTrees_.get(file);
    },
    getRootModule: function() {
      return this.rootModule_;
    },
    addExternalModule: function(module) {
      assert(!this.hasModuleForResolvedUrl(module.url));
      this.modulesByResolvedUrl_[module.url] = module;
    },
    getModuleForUrl: function(url) {
      return this.getModuleForResolvedUrl(System.normalResolve(url, this.url));
    },
    getModuleForResolvedUrl: function(url) {
      if (isStandardModuleUrl(url)) return getStandardModule(url);
      return this.modulesByResolvedUrl_[url];
    },
    hasModuleForResolvedUrl: function(url) {
      if (isStandardModuleUrl(url)) return System.get(url) != null;
      return url in this.modulesByResolvedUrl_;
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {Project: {
      get: function() {
        return Project;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/FreeVariableChecker.js", function() {
  "use strict";
  var ARGUMENTS = System.get("../src/syntax/PredefinedName.js").ARGUMENTS;
  var $__72 = System.get("../src/syntax/trees/ParseTrees.js"),
      BindingIdentifier = $__72.BindingIdentifier,
      IdentifierExpression = $__72.IdentifierExpression;
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var IDENTIFIER_EXPRESSION = System.get("../src/syntax/trees/ParseTreeType.js").IDENTIFIER_EXPRESSION;
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var TYPEOF = System.get("../src/syntax/TokenType.js").TYPEOF;
  var global = this;
  function Scope(parent) {
    this.parent = parent;
    this.references = Object.create(null);
    this.declarations = Object.create(null);
  }
  ($__class)(Scope, {}, {});
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
  function FreeVariableChecker(reporter) {
    $__superCall(this, $__FreeVariableChecker__proto, "constructor", []);
    this.reporter_ = reporter;
    this.scope_ = null;
    this.disableChecksLevel_ = 0;
  }
  var $__FreeVariableChecker__super = ParseTreeVisitor;
  var $__FreeVariableChecker__proto = $__getProtoParent($__FreeVariableChecker__super);
  ($__class)(FreeVariableChecker, {
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
    visitFunction_: function(name, formalParameterList, body) {
      var scope = this.pushScope_();
      this.visitAny(name);
      this.declareVariable_(ARGUMENTS);
      this.visitAny(formalParameterList);
      this.visitAny(body);
      this.pop_(scope);
    },
    visitFunctionDeclaration: function(tree) {
      this.declareVariable_(tree.name);
      this.visitFunction_(null, tree.formalParameterList, tree.functionBody);
    },
    visitFunctionExpression: function(tree) {
      this.visitFunction_(tree.name, tree.formalParameterList, tree.functionBody);
    },
    visitArrowFunctionExpression: function(tree) {
      this.visitFunction_(null, tree.formalParameters, tree.functionBody);
    },
    visitGetAccessor: function(tree) {
      var scope = this.pushScope_();
      $__superCall(this, $__FreeVariableChecker__proto, "visitGetAccessor", [tree]);
      this.pop_(scope);
    },
    visitSetAccessor: function(tree) {
      var scope = this.pushScope_();
      $__superCall(this, $__FreeVariableChecker__proto, "visitSetAccessor", [tree]);
      this.pop_(scope);
    },
    visitCatch: function(tree) {
      var scope = this.pushScope_();
      $__superCall(this, $__FreeVariableChecker__proto, "visitCatch", [tree]);
      this.pop_(scope);
    },
    visitBindingIdentifier: function(tree) {
      this.declareVariable_(tree);
    },
    visitIdentifierExpression: function(tree) {
      if (this.disableChecksLevel_) return;
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
        $__superCall(this, $__FreeVariableChecker__proto, "visitUnaryExpression", [tree]);
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
      if (this.disableChecksLevel_) return;
      var scope = this.scope_;
      var errors = [];
      for (var name in scope.references) {
        if (!(name in scope.declarations)) {
          var location = scope.references[name];
          if (!scope.parent) {
            if (!location) {
              throw new Error(("generated variable " + name + " is not defined"));
            }
            errors.push([location.start, '%s is not defined', name]);
          } else if (!(name in scope.parent.references)) {
            scope.parent.references[name] = location;
          }
        }
      }
      if (errors.length) {
        errors.sort((function(x, y) {
          return x[0].offset - y[0].offset;
        }));
        errors.forEach((function(e) {
          var $__73;
          ($__73 = this).reportError_.apply($__73, $__toObject(e));
        }).bind(this));
      }
    },
    reportError_: function() {
      var $__73;
      for (var args = [],
          $__71 = 0; $__71 < arguments.length; $__71++) args[$__71] = arguments[$__71];
      ($__73 = this.reporter_).reportError.apply($__73, $__toObject(args));
    }
  }, {checkScript: function(reporter, tree) {
      new FreeVariableChecker(reporter).visitScript(tree, global);
    }}, $__FreeVariableChecker__super, $__FreeVariableChecker__proto);
  return Object.preventExtensions(Object.create(null, {FreeVariableChecker: {
      get: function() {
        return FreeVariableChecker;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/outputgeneration/ParseTreeWriter.js", function() {
  "use strict";
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var $__75 = System.get("../src/syntax/PredefinedName.js"),
      AS = $__75.AS,
      FROM = $__75.FROM,
      GET = $__75.GET,
      OF = $__75.OF,
      MODULE = $__75.MODULE,
      SET = $__75.SET;
  var Token = System.get("../src/syntax/Token.js").Token;
  var getKeywordType = System.get("../src/syntax/Keywords.js").getKeywordType;
  var $__75 = System.get("../src/syntax/TokenType.js"),
      AMPERSAND = $__75.AMPERSAND,
      AMPERSAND_EQUAL = $__75.AMPERSAND_EQUAL,
      AND = $__75.AND,
      ARROW = $__75.ARROW,
      AWAIT = $__75.AWAIT,
      BACK_QUOTE = $__75.BACK_QUOTE,
      BANG = $__75.BANG,
      BAR = $__75.BAR,
      BAR_EQUAL = $__75.BAR_EQUAL,
      BREAK = $__75.BREAK,
      CARET = $__75.CARET,
      CARET_EQUAL = $__75.CARET_EQUAL,
      CASE = $__75.CASE,
      CATCH = $__75.CATCH,
      CLASS = $__75.CLASS,
      CLOSE_ANGLE = $__75.CLOSE_ANGLE,
      CLOSE_CURLY = $__75.CLOSE_CURLY,
      CLOSE_PAREN = $__75.CLOSE_PAREN,
      CLOSE_SQUARE = $__75.CLOSE_SQUARE,
      COLON = $__75.COLON,
      COMMA = $__75.COMMA,
      CONST = $__75.CONST,
      CONTINUE = $__75.CONTINUE,
      DEBUGGER = $__75.DEBUGGER,
      DEFAULT = $__75.DEFAULT,
      DELETE = $__75.DELETE,
      DO = $__75.DO,
      DOT_DOT_DOT = $__75.DOT_DOT_DOT,
      ELSE = $__75.ELSE,
      END_OF_FILE = $__75.END_OF_FILE,
      ENUM = $__75.ENUM,
      EQUAL = $__75.EQUAL,
      EQUAL_EQUAL = $__75.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__75.EQUAL_EQUAL_EQUAL,
      ERROR = $__75.ERROR,
      EXPORT = $__75.EXPORT,
      EXTENDS = $__75.EXTENDS,
      FALSE = $__75.FALSE,
      FINALLY = $__75.FINALLY,
      FOR = $__75.FOR,
      FUNCTION = $__75.FUNCTION,
      GREATER_EQUAL = $__75.GREATER_EQUAL,
      IDENTIFIER = $__75.IDENTIFIER,
      IF = $__75.IF,
      IMPLEMENTS = $__75.IMPLEMENTS,
      IMPORT = $__75.IMPORT,
      IN = $__75.IN,
      INSTANCEOF = $__75.INSTANCEOF,
      INTERFACE = $__75.INTERFACE,
      LEFT_SHIFT = $__75.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__75.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__75.LESS_EQUAL,
      LET = $__75.LET,
      MINUS = $__75.MINUS,
      MINUS_EQUAL = $__75.MINUS_EQUAL,
      MINUS_MINUS = $__75.MINUS_MINUS,
      NEW = $__75.NEW,
      NO_SUBSTITUTION_TEMPLATE = $__75.NO_SUBSTITUTION_TEMPLATE,
      NOT_EQUAL = $__75.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__75.NOT_EQUAL_EQUAL,
      NULL = $__75.NULL,
      NUMBER = $__75.NUMBER,
      OPEN_ANGLE = $__75.OPEN_ANGLE,
      OPEN_CURLY = $__75.OPEN_CURLY,
      OPEN_PAREN = $__75.OPEN_PAREN,
      OPEN_SQUARE = $__75.OPEN_SQUARE,
      OR = $__75.OR,
      PACKAGE = $__75.PACKAGE,
      PERCENT = $__75.PERCENT,
      PERCENT_EQUAL = $__75.PERCENT_EQUAL,
      PERIOD = $__75.PERIOD,
      PERIOD_OPEN_CURLY = $__75.PERIOD_OPEN_CURLY,
      PLUS = $__75.PLUS,
      PLUS_EQUAL = $__75.PLUS_EQUAL,
      PLUS_PLUS = $__75.PLUS_PLUS,
      PRIVATE = $__75.PRIVATE,
      PROTECTED = $__75.PROTECTED,
      PUBLIC = $__75.PUBLIC,
      QUESTION = $__75.QUESTION,
      REGULAR_EXPRESSION = $__75.REGULAR_EXPRESSION,
      RETURN = $__75.RETURN,
      RIGHT_SHIFT = $__75.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__75.RIGHT_SHIFT_EQUAL,
      SEMI_COLON = $__75.SEMI_COLON,
      SLASH = $__75.SLASH,
      SLASH_EQUAL = $__75.SLASH_EQUAL,
      STAR = $__75.STAR,
      STAR_EQUAL = $__75.STAR_EQUAL,
      STATIC = $__75.STATIC,
      STRING = $__75.STRING,
      SUPER = $__75.SUPER,
      SWITCH = $__75.SWITCH,
      TEMPLATE_HEAD = $__75.TEMPLATE_HEAD,
      TEMPLATE_MIDDLE = $__75.TEMPLATE_MIDDLE,
      TEMPLATE_TAIL = $__75.TEMPLATE_TAIL,
      THIS = $__75.THIS,
      THROW = $__75.THROW,
      TILDE = $__75.TILDE,
      TRUE = $__75.TRUE,
      TRY = $__75.TRY,
      TYPEOF = $__75.TYPEOF,
      UNSIGNED_RIGHT_SHIFT = $__75.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__75.UNSIGNED_RIGHT_SHIFT_EQUAL,
      VAR = $__75.VAR,
      VOID = $__75.VOID,
      WHILE = $__75.WHILE,
      WITH = $__75.WITH,
      YIELD = $__75.YIELD;
  var NEW_LINE = '\n';
  var PRETTY_PRINT = true;
  function ParseTreeWriter(highlighted, showLineNumbers) {
    $__superCall(this, $__ParseTreeWriter__proto, "constructor", []);
    this.highlighted_ = highlighted;
    this.showLineNumbers_ = showLineNumbers;
    this.result_ = '';
    this.currentLine_ = '';
    this.currentLineComment_ = null;
    this.indentDepth_ = 0;
    this.lastToken_ = null;
  }
  var $__ParseTreeWriter__super = ParseTreeVisitor;
  var $__ParseTreeWriter__proto = $__getProtoParent($__ParseTreeWriter__super);
  ($__class)(ParseTreeWriter, {
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
      this.currentLocation = tree.location;
      $__superCall(this, $__ParseTreeWriter__proto, "visitAny", [tree]);
      if (tree === this.highlighted_) {
        this.write_('\x1B[0m');
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
      this.visitAny(tree.formalParameters);
      this.write_(CLOSE_PAREN);
      this.write_(ARROW);
      this.visitAny(tree.functionBody);
    },
    visitAwaitStatement: function(tree) {
      this.write_(AWAIT);
      if (tree.identifier !== null) {
        this.write_(tree.identifier);
        this.write_(EQUAL);
      }
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitBinaryOperator: function(tree) {
      this.visitAny(tree.left);
      this.write_(tree.operator);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      this.visitAny(tree.binding);
      if (tree.initializer) {
        this.write_(EQUAL);
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
      this.visitAny(tree.expression);
      this.write_(COLON);
      this.indentDepth_++;
      this.writelnList_(tree.statements);
      this.indentDepth_--;
    },
    visitCatch: function(tree) {
      this.write_(CATCH);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.binding);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.catchBody);
    },
    visitCascadeExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(PERIOD_OPEN_CURLY);
      this.writelnList_(tree.expressions, SEMI_COLON);
      this.write_(CLOSE_CURLY);
    },
    visitClassShared_: function(tree) {
      this.write_(CLASS);
      this.visitAny(tree.name);
      if (tree.superClass !== null) {
        this.write_(EXTENDS);
        this.visitAny(tree.superClass);
      }
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
      this.write_(OPEN_PAREN);
      this.visitAny(tree.left);
      this.write_(OF);
      this.visitAny(tree.iterator);
      this.write_(CLOSE_PAREN);
    },
    visitComprehensionIf: function(tree) {
      this.write_(IF);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
    },
    visitComputedPropertyName: function(tree) {
      this.write_(OPEN_SQUARE);
      this.visitAny(tree.expression);
      this.write_(CLOSE_SQUARE);
    },
    visitConditionalExpression: function(tree) {
      this.visitAny(tree.condition);
      this.write_(QUESTION);
      this.visitAny(tree.left);
      this.write_(COLON);
      this.visitAny(tree.right);
    },
    visitContinueStatement: function(tree) {
      this.write_(CONTINUE);
      if (tree.name !== null) {
        this.write_(tree.name);
      }
      this.write_(SEMI_COLON);
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
      this.visitAny(tree.body);
      this.write_(WHILE);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.write_(SEMI_COLON);
    },
    visitEmptyStatement: function(tree) {
      this.write_(SEMI_COLON);
    },
    visitExportDeclaration: function(tree) {
      this.write_(EXPORT);
      this.visitAny(tree.declaration);
    },
    visitExportDefault: function(tree) {
      this.write_(DEFAULT);
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitNamedExport: function(tree) {
      this.visitAny(tree.specifierSet);
      if (tree.moduleSpecifier) {
        this.write_(FROM);
        this.visitAny(tree.moduleSpecifier);
      }
      this.write_(SEMI_COLON);
    },
    visitExportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs) {
        this.write_(AS);
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
      this.visitAny(tree.block);
    },
    visitForOfStatement: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(OF);
      this.visitAny(tree.collection);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitForInStatement: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(IN);
      this.visitAny(tree.collection);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitForStatement: function(tree) {
      this.write_(FOR);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.initializer);
      this.write_(SEMI_COLON);
      this.visitAny(tree.condition);
      this.write_(SEMI_COLON);
      this.visitAny(tree.increment);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitFormalParameterList: function(tree) {
      var first = true;
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        if (first) {
          first = false;
        } else {
          this.write_(COMMA);
        }
        this.visitAny(parameter);
      }
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
      this.write_(FUNCTION);
      if (tree.isGenerator) {
        this.write_(STAR);
      }
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.functionBody);
    },
    visitGeneratorComprehension: function(tree) {
      this.write_(OPEN_PAREN);
      this.visitList(tree.comprehensionList);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
    },
    visitGetAccessor: function(tree) {
      if (tree.isStatic) this.write_(STATIC);
      this.write_(GET);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitIdentifierExpression: function(tree) {
      this.write_(tree.identifierToken);
    },
    visitIfStatement: function(tree) {
      this.write_(IF);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.ifClause);
      if (tree.elseClause) {
        this.write_(ELSE);
        this.visitAny(tree.elseClause);
      }
    },
    visitImportDeclaration: function(tree) {
      this.write_(IMPORT);
      this.visitAny(tree.importClause);
      if (tree.moduleSpecifier) {
        this.write_(FROM);
        this.visitAny(tree.moduleSpecifier);
      }
      this.write_(SEMI_COLON);
    },
    visitImportSpecifier: function(tree) {
      this.write_(tree.lhs);
      if (tree.rhs !== null) {
        this.write_(AS);
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
      this.write_(tree.identifier);
      this.write_(FROM);
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitNewExpression: function(tree) {
      this.write_(NEW);
      this.visitAny(tree.operand);
      this.visitAny(tree.args);
    },
    visitObjectLiteralExpression: function(tree) {
      this.write_(OPEN_CURLY);
      if (tree.propertyNameAndValues.length > 1) this.writeln_();
      this.writelnList_(tree.propertyNameAndValues, COMMA);
      if (tree.propertyNameAndValues.length > 1) this.writeln_();
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
        this.visitAny(tree.element);
      }
    },
    visitParenExpression: function(tree) {
      this.write_(OPEN_PAREN);
      $__superCall(this, $__ParseTreeWriter__proto, "visitParenExpression", [tree]);
      this.write_(CLOSE_PAREN);
    },
    visitPostfixExpression: function(tree) {
      this.visitAny(tree.operand);
      this.write_(tree.operator);
    },
    visitPredefinedType: function(tree) {
      this.write_(tree.typeToken);
    },
    visitScript: function(tree) {
      this.writelnList_(tree.scriptItemList, null);
    },
    visitPropertyMethodAssignment: function(tree) {
      if (tree.isStatic) this.write_(STATIC);
      if (tree.isGenerator) this.write_(STAR);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.formalParameterList);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.functionBody);
    },
    visitPropertyNameAssignment: function(tree) {
      this.visitAny(tree.name);
      this.write_(COLON);
      this.visitAny(tree.value);
    },
    visitPropertyNameShorthand: function(tree) {
      this.write_(tree.name);
    },
    visitTemplateLiteralExpression: function(tree) {
      this.visitAny(tree.operand);
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
      this.visitAny(tree.expression);
      this.write_(SEMI_COLON);
    },
    visitRestParameter: function(tree) {
      this.write_(DOT_DOT_DOT);
      this.write_(tree.identifier.identifierToken);
    },
    visitSetAccessor: function(tree) {
      if (tree.isStatic) this.write_(STATIC);
      this.write_(SET);
      this.visitAny(tree.name);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.parameter);
      this.write_(CLOSE_PAREN);
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
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.write_(OPEN_CURLY);
      this.writelnList_(tree.caseClauses);
      this.write_(CLOSE_CURLY);
    },
    visitThisExpression: function(tree) {
      this.write_(THIS);
    },
    visitThrowStatement: function(tree) {
      this.write_(THROW);
      this.visitAny(tree.value);
      this.write_(SEMI_COLON);
    },
    visitTryStatement: function(tree) {
      this.write_(TRY);
      this.visitAny(tree.body);
      this.visitAny(tree.catchBlock);
      this.visitAny(tree.finallyBlock);
    },
    visitTypeName: function(tree) {
      if (tree.moduleName) {
        this.visitAny(tree.moduleName);
        this.write_(PERIOD);
      }
      this.write_(tree.name);
    },
    visitUnaryExpression: function(tree) {
      this.write_(tree.operator);
      this.visitAny(tree.operand);
    },
    visitVariableDeclarationList: function(tree) {
      this.write_(tree.declarationType);
      this.writeList_(tree.declarations, COMMA, true, 2);
    },
    visitVariableDeclaration: function(tree) {
      this.visitAny(tree.lvalue);
      if (tree.typeAnnotation !== null) {
        this.write_(COLON);
        this.visitAny(tree.typeAnnotation);
      }
      if (tree.initializer !== null) {
        this.write_(EQUAL);
        this.visitAny(tree.initializer);
      }
    },
    visitVariableStatement: function(tree) {
      $__superCall(this, $__ParseTreeWriter__proto, "visitVariableStatement", [tree]);
      this.write_(SEMI_COLON);
    },
    visitWhileStatement: function(tree) {
      this.write_(WHILE);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.condition);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitWithStatement: function(tree) {
      this.write_(WITH);
      this.write_(OPEN_PAREN);
      this.visitAny(tree.expression);
      this.write_(CLOSE_PAREN);
      this.visitAny(tree.body);
    },
    visitYieldExpression: function(tree) {
      this.write_(YIELD);
      if (tree.isYieldFor) {
        this.write_(STAR);
      }
      this.visitAny(tree.expression);
    },
    writeCurrentln_: function() {
      this.result_ += this.currentLine_ + NEW_LINE;
    },
    writeln_: function() {
      if (this.currentLineComment_) {
        while (this.currentLine_.length < 80) {
          this.currentLine_ += ' ';
        }
        this.currentLine_ += ' // ' + this.currentLineComment_;
        this.currentLineComment_ = null;
      }
      if (this.currentLine_) this.writeCurrentln_();
      this.currentLine_ = '';
    },
    writelnList_: function(list, delimiter) {
      if (delimiter) {
        this.writeList_(list, delimiter, true);
      } else {
        if (list.length > 0) this.writeln_();
        this.writeList_(list, null, true);
        if (list.length > 0) this.writeln_();
      }
    },
    writeList_: function(list, delimiter, writeNewLine) {
      var indent = arguments[3] !== (void 0) ? arguments[3]: 0;
      var first = true;
      for (var i = 0; i < list.length; i++) {
        var element = list[i];
        if (first) {
          first = false;
        } else {
          if (delimiter !== null) {
            this.write_(delimiter);
          }
          if (writeNewLine) {
            if (i === 1) this.indentDepth_ += indent;
            this.writeln_();
          }
        }
        this.visitAny(element);
      }
      if (writeNewLine && list.length > 1) this.indentDepth_ -= indent;
    },
    writeRaw_: function(value) {
      if (value !== null) this.currentLine_ += value;
    },
    write_: function(value) {
      if (value === CLOSE_CURLY) {
        this.indentDepth_--;
      }
      if (value !== null) {
        if (PRETTY_PRINT) {
          if (!this.currentLine_) {
            this.lastToken_ = '';
            for (var i = 0,
                indent = this.indentDepth_; i < indent; i++) {
              this.currentLine_ += '  ';
            }
          }
        }
        if (this.needsSpace_(value)) this.currentLine_ += ' ';
        this.lastToken_ = value;
        this.currentLine_ += value;
      }
      if (value === OPEN_CURLY) {
        this.indentDepth_++;
      }
    },
    isIdentifierNameOrNumber_: function(token) {
      if (token instanceof Token) {
        if (token.isKeyword()) return true;
        switch (token.type) {
          case IDENTIFIER:
          case NUMBER:
            return true;
        }
      }
      var value = token.toString();
      switch (value) {
        case AS:
        case FROM:
        case GET:
        case OF:
        case MODULE:
        case SET:
          return true;
      }
      return !!getKeywordType(value);
    },
    needsSpace_: function(token) {
      if (!this.lastToken_) return false;
      if (this.lastToken_.type === REGULAR_EXPRESSION && this.isIdentifierNameOrNumber_(token)) {
        return true;
      }
      var value = token.toString();
      var lastValue = this.lastToken_.toString();
      switch (value) {
        case CLOSE_CURLY:
        case CLOSE_PAREN:
        case CLOSE_SQUARE:
        case COLON:
        case COMMA:
        case PERIOD:
        case PERIOD_OPEN_CURLY:
        case SEMI_COLON:
          return false;
        case CATCH:
        case ELSE:
        case FINALLY:
        case WHILE:
          return PRETTY_PRINT;
        case OPEN_CURLY:
          switch (lastValue) {
            case OPEN_CURLY:
            case OPEN_PAREN:
            case OPEN_SQUARE:
              return false;
          }
          return PRETTY_PRINT;
      }
      switch (lastValue) {
        case OPEN_CURLY:
        case OPEN_PAREN:
        case OPEN_SQUARE:
          return false;
        case CATCH:
        case COLON:
        case COMMA:
        case DO:
        case FINALLY:
        case FOR:
        case IF:
        case SEMI_COLON:
        case SWITCH:
        case TRY:
        case WHILE:
        case WITH:
          return PRETTY_PRINT;
        case CASE:
        case CLASS:
        case CONST:
        case DELETE:
        case ELSE:
        case ENUM:
        case EXPORT:
        case EXTENDS:
        case IMPLEMENTS:
        case IMPORT:
        case IN:
        case INSTANCEOF:
        case INTERFACE:
        case LET:
        case NEW:
        case PACKAGE:
        case PRIVATE:
        case PROTECTED:
        case PUBLIC:
        case RETURN:
        case STATIC:
        case THROW:
        case TYPEOF:
        case VAR:
        case VOID:
        case YIELD:
        case FROM:
        case OF:
        case MODULE:
          return PRETTY_PRINT || this.isIdentifierNameOrNumber_(token);
      }
      if ((lastValue == PLUS || lastValue == PLUS_PLUS) && (value == PLUS || value == PLUS_PLUS) || (lastValue == MINUS || lastValue == MINUS_MINUS) && (value == MINUS || value == MINUS_MINUS)) {
        return true;
      }
      if (this.spaceArround_(lastValue) || this.spaceArround_(value)) return true;
      if (this.isIdentifierNameOrNumber_(token)) {
        if (lastValue === CLOSE_PAREN) return PRETTY_PRINT;
        return this.isIdentifierNameOrNumber_(this.lastToken_);
      }
      return false;
    },
    spaceArround_: function(value) {
      switch (value) {
        case AMPERSAND:
        case AMPERSAND_EQUAL:
        case AND:
        case ARROW:
        case AWAIT:
        case BAR:
        case BAR_EQUAL:
        case CARET_EQUAL:
        case CLOSE_ANGLE:
        case EQUAL:
        case EQUAL_EQUAL:
        case EQUAL_EQUAL_EQUAL:
        case GREATER_EQUAL:
        case LEFT_SHIFT:
        case LEFT_SHIFT_EQUAL:
        case LESS_EQUAL:
        case MINUS:
        case MINUS_EQUAL:
        case NOT_EQUAL:
        case NOT_EQUAL_EQUAL:
        case OPEN_ANGLE:
        case OR:
        case PERCENT:
        case PERCENT_EQUAL:
        case PLUS:
        case PLUS_EQUAL:
        case QUESTION:
        case RIGHT_SHIFT:
        case RIGHT_SHIFT_EQUAL:
        case SLASH:
        case SLASH_EQUAL:
        case STAR:
        case STAR_EQUAL:
        case UNSIGNED_RIGHT_SHIFT:
        case UNSIGNED_RIGHT_SHIFT_EQUAL:
          return PRETTY_PRINT;
      }
      return false;
    }
  }, {}, $__ParseTreeWriter__super, $__ParseTreeWriter__proto);
  return Object.preventExtensions(Object.create(null, {ParseTreeWriter: {
      get: function() {
        return ParseTreeWriter;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/outputgeneration/ParseTreeMapWriter.js", function() {
  "use strict";
  var ParseTreeWriter = System.get("../src/outputgeneration/ParseTreeWriter.js").ParseTreeWriter;
  function ParseTreeMapWriter(highlighted, showLineNumbers, sourceMapGenerator) {
    $__superCall(this, $__ParseTreeMapWriter__proto, "constructor", [highlighted, showLineNumbers]);
    this.sourceMapGenerator_ = sourceMapGenerator;
    this.outputLineCount_ = 1;
  }
  var $__ParseTreeMapWriter__super = ParseTreeWriter;
  var $__ParseTreeMapWriter__proto = $__getProtoParent($__ParseTreeMapWriter__super);
  ($__class)(ParseTreeMapWriter, {
    write_: function(value) {
      if (this.currentLocation) {
        this.addMapping();
      }
      $__superCall(this, $__ParseTreeMapWriter__proto, "write_", [value]);
    },
    writeCurrentln_: function() {
      $__superCall(this, $__ParseTreeMapWriter__proto, "writeCurrentln_", []);
      this.outputLineCount_++;
    },
    addMapping: function() {
      var start = this.currentLocation.start;
      var mapping = {
        generated: {
          line: this.outputLineCount_,
          column: this.currentLine_.length
        },
        original: {
          line: start.line + 1,
          column: start.column
        },
        source: start.source.name
      };
      this.sourceMapGenerator_.addMapping(mapping);
      this.sourceMapGenerator_.setSourceContent(start.source.name, start.source.contents);
    }
  }, {}, $__ParseTreeMapWriter__super, $__ParseTreeMapWriter__proto);
  return Object.preventExtensions(Object.create(null, {ParseTreeMapWriter: {
      get: function() {
        return ParseTreeMapWriter;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/outputgeneration/TreeWriter.js", function() {
  "use strict";
  var ParseTreeMapWriter = System.get("../src/outputgeneration/ParseTreeMapWriter.js").ParseTreeMapWriter;
  var ParseTreeWriter = System.get("../src/outputgeneration/ParseTreeWriter.js").ParseTreeWriter;
  function write(tree) {
    var options = arguments[1];
    var showLineNumbers;
    var highlighted = null;
    var sourceMapGenerator;
    if (options) {
      showLineNumbers = options.showLineNumbers;
      highlighted = options.highlighted || null;
      sourceMapGenerator = options.sourceMapGenerator;
    }
    var writer;
    if (sourceMapGenerator) {
      writer = new ParseTreeMapWriter(highlighted, showLineNumbers, sourceMapGenerator);
    } else {
      writer = new ParseTreeWriter(highlighted, showLineNumbers);
    }
    writer.visitAny(tree);
    if (writer.currentLine_.length > 0) {
      writer.writeln_();
    }
    if (sourceMapGenerator) {
      options.sourceMap = sourceMapGenerator.toString();
    }
    return writer.result_.toString();
  }
  function TreeWriter() {}
  ($__class)(TreeWriter, {}, {});
  TreeWriter.write = write;
  return Object.preventExtensions(Object.create(null, {
    write: {
      get: function() {
        return write;
      },
      enumerable: true
    },
    TreeWriter: {
      get: function() {
        return TreeWriter;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/ParseTreeValidator.js", function() {
  "use strict";
  var NewExpression = System.get("../src/syntax/trees/ParseTrees.js").NewExpression;
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var TreeWriter = System.get("../src/outputgeneration/TreeWriter.js").TreeWriter;
  var $__80 = System.get("../src/syntax/TokenType.js"),
      AMPERSAND = $__80.AMPERSAND,
      AMPERSAND_EQUAL = $__80.AMPERSAND_EQUAL,
      AND = $__80.AND,
      BAR = $__80.BAR,
      BAR_EQUAL = $__80.BAR_EQUAL,
      CARET = $__80.CARET,
      CARET_EQUAL = $__80.CARET_EQUAL,
      CLOSE_ANGLE = $__80.CLOSE_ANGLE,
      EQUAL = $__80.EQUAL,
      EQUAL_EQUAL = $__80.EQUAL_EQUAL,
      EQUAL_EQUAL_EQUAL = $__80.EQUAL_EQUAL_EQUAL,
      GREATER_EQUAL = $__80.GREATER_EQUAL,
      IDENTIFIER = $__80.IDENTIFIER,
      IN = $__80.IN,
      INSTANCEOF = $__80.INSTANCEOF,
      LEFT_SHIFT = $__80.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__80.LEFT_SHIFT_EQUAL,
      LESS_EQUAL = $__80.LESS_EQUAL,
      MINUS = $__80.MINUS,
      MINUS_EQUAL = $__80.MINUS_EQUAL,
      NOT_EQUAL = $__80.NOT_EQUAL,
      NOT_EQUAL_EQUAL = $__80.NOT_EQUAL_EQUAL,
      NUMBER = $__80.NUMBER,
      OPEN_ANGLE = $__80.OPEN_ANGLE,
      OR = $__80.OR,
      PERCENT = $__80.PERCENT,
      PERCENT_EQUAL = $__80.PERCENT_EQUAL,
      PLUS = $__80.PLUS,
      PLUS_EQUAL = $__80.PLUS_EQUAL,
      RIGHT_SHIFT = $__80.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__80.RIGHT_SHIFT_EQUAL,
      SLASH = $__80.SLASH,
      SLASH_EQUAL = $__80.SLASH_EQUAL,
      STAR = $__80.STAR,
      STAR_EQUAL = $__80.STAR_EQUAL,
      STRING = $__80.STRING,
      UNSIGNED_RIGHT_SHIFT = $__80.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__80.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__80 = System.get("../src/syntax/trees/ParseTreeType.js"),
      ARRAY_PATTERN = $__80.ARRAY_PATTERN,
      BINDING_ELEMENT = $__80.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__80.BINDING_IDENTIFIER,
      BLOCK = $__80.BLOCK,
      CASE_CLAUSE = $__80.CASE_CLAUSE,
      CATCH = $__80.CATCH,
      CLASS_DECLARATION = $__80.CLASS_DECLARATION,
      COMPUTED_PROPERTY_NAME = $__80.COMPUTED_PROPERTY_NAME,
      DEFAULT_CLAUSE = $__80.DEFAULT_CLAUSE,
      EXPORT_DECLARATION = $__80.EXPORT_DECLARATION,
      EXPORT_DEFAULT = $__80.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__80.EXPORT_SPECIFIER,
      EXPORT_SPECIFIER_SET = $__80.EXPORT_SPECIFIER_SET,
      EXPORT_STAR = $__80.EXPORT_STAR,
      FINALLY = $__80.FINALLY,
      FORMAL_PARAMETER_LIST = $__80.FORMAL_PARAMETER_LIST,
      FUNCTION_BODY = $__80.FUNCTION_BODY,
      FUNCTION_DECLARATION = $__80.FUNCTION_DECLARATION,
      GET_ACCESSOR = $__80.GET_ACCESSOR,
      IDENTIFIER_EXPRESSION = $__80.IDENTIFIER_EXPRESSION,
      IMPORT_DECLARATION = $__80.IMPORT_DECLARATION,
      LITERAL_PROPERTY_NAME = $__80.LITERAL_PROPERTY_NAME,
      MODULE_DECLARATION = $__80.MODULE_DECLARATION,
      MODULE_DECLARATION = $__80.MODULE_DECLARATION,
      MODULE_SPECIFIER = $__80.MODULE_SPECIFIER,
      NAMED_EXPORT = $__80.NAMED_EXPORT,
      OBJECT_PATTERN = $__80.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__80.OBJECT_PATTERN_FIELD,
      PROPERTY_METHOD_ASSIGNMENT = $__80.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__80.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__80.PROPERTY_NAME_SHORTHAND,
      REST_PARAMETER = $__80.REST_PARAMETER,
      SET_ACCESSOR = $__80.SET_ACCESSOR,
      TEMPLATE_LITERAL_PORTION = $__80.TEMPLATE_LITERAL_PORTION,
      TEMPLATE_SUBSTITUTION = $__80.TEMPLATE_SUBSTITUTION,
      VARIABLE_DECLARATION_LIST = $__80.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__80.VARIABLE_STATEMENT;
  function ValidationError(tree, message) {
    this.tree = tree;
    this.message = message;
  }
  ($__class)(ValidationError, {}, {}, Error);
  function ParseTreeValidator() {
    $__ParseTreeValidator__proto !== null && $__superCall(this, $__ParseTreeValidator__proto, "constructor", arguments);
  }
  var $__ParseTreeValidator__super = ParseTreeVisitor;
  var $__ParseTreeValidator__proto = $__getProtoParent($__ParseTreeValidator__super);
  ($__class)(ParseTreeValidator, {
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
    visitAwaitStatement: function(tree) {
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'await must be expression');
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
          this.check_(tree.right.isArrowFunctionExpression(), tree.right, 'assignment expression expected');
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
          this.check_(tree.left.isArrowFunctionExpression(), tree.left, 'assignment expression expected');
          this.check_(tree.right.isArrowFunctionExpression(), tree.right, 'assignment expression expected');
          break;
        default:
          this.fail_(tree, 'unexpected binary operator');
      }
      this.visitAny(tree.left);
      this.visitAny(tree.right);
    },
    visitBindingElement: function(tree) {
      var binding = tree.binding;
      this.checkVisit_(binding.type == BINDING_IDENTIFIER || binding.type == OBJECT_PATTERN || binding.type == ARRAY_PATTERN, binding, 'expected valid binding element');
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
        this.checkVisit_(expression.isArrowFunctionExpression(), expression, 'expression expected');
      }
    },
    visitConditionalExpression: function(tree) {
      this.checkVisit_(tree.condition.isArrowFunctionExpression(), tree.condition, 'expression expected');
      this.checkVisit_(tree.left.isArrowFunctionExpression(), tree.left, 'expression expected');
      this.checkVisit_(tree.right.isArrowFunctionExpression(), tree.right, 'expression expected');
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
      this.checkType_(FORMAL_PARAMETER_LIST, tree.formalParameterList, 'formal parameters expected');
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
      this.check_(tree.token.type == STRING || tree.url, 'string or identifier expected');
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
      this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand, 'assignment expression expected');
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
      this.checkVisit_(tree.value.isArrowFunctionExpression(), tree.value, 'assignment expression expected');
    },
    visitPropertyNameShorthand: function(tree) {
      this.check_(tree.name.type === IDENTIFIER, tree, 'identifier token expected');
    },
    visitLiteralPropertyName: function(tree) {
      var type = tree.literalToken.type;
      this.check_(tree.literalToken.isKeyword() || type === IDENTIFIER || type === NUMBER || type === STRING, tree, 'unexpected token in literal property name');
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
      this.checkVisit_(tree.expression.isArrowFunctionExpression(), tree.expression, 'assignment expression expected');
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
      this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand, 'assignment expression expected');
    },
    visitVariableDeclaration: function(tree) {
      this.checkVisit_(tree.lvalue.isPattern() || tree.lvalue.type == BINDING_IDENTIFIER, tree.lvalue, 'binding identifier expected, found: ' + tree.lvalue.type);
      if (tree.initializer !== null) {
        this.checkVisit_(tree.initializer.isArrowFunctionExpression(), tree.initializer, 'assignment expression expected');
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
  }, {}, $__ParseTreeValidator__super, $__ParseTreeValidator__proto);
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
      var locationString = location !== null ? location.start.toString(): '(unknown)';
      throw new Error(("Parse tree validation failure '" + e.message + "' at " + locationString + ":") + '\n\n' + TreeWriter.write(tree, {
        highlighted: e.tree,
        showLineNumbers: true
      }) + '\n');
    }
  };
  return Object.preventExtensions(Object.create(null, {ParseTreeValidator: {
      get: function() {
        return ParseTreeValidator;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/VariableBinder.js", function() {
  "use strict";
  var $__82 = System.get("../src/syntax/trees/ParseTreeType.js"),
      ARRAY_PATTERN = $__82.ARRAY_PATTERN,
      BINDING_IDENTIFIER = $__82.BINDING_IDENTIFIER,
      OBJECT_PATTERN = $__82.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__82.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__82.PAREN_EXPRESSION,
      SPREAD_PATTERN_ELEMENT = $__82.SPREAD_PATTERN_ELEMENT;
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var VAR = System.get("../src/syntax/TokenType.js").VAR;
  var assert = System.get("../src/util/assert.js").assert;
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
  function VariableBinder(includeFunctionScope, scope) {
    $__superCall(this, $__VariableBinder__proto, "constructor", []);
    this.includeFunctionScope_ = includeFunctionScope;
    this.scope_ = scope || null;
    this.block_ = null;
    this.identifiers_ = Object.create(null);
  }
  var $__VariableBinder__super = ParseTreeVisitor;
  var $__VariableBinder__proto = $__getProtoParent($__VariableBinder__super);
  ($__class)(VariableBinder, {
    bindVariablesInFunction_: function(tree) {
      var parameters = tree.formalParameterList.parameters;
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
      if (this.block_ == this.scope_) this.bind_(tree.name.identifierToken);
    },
    visitFunctionExpression: function(tree) {},
    visitVariableDeclarationList: function(tree) {
      if ((tree.declarationType == VAR && this.includeFunctionScope_) || (tree.declarationType != VAR && this.block_ == this.scope_)) {
        $__superCall(this, $__VariableBinder__proto, "visitVariableDeclarationList", [tree]);
      } else {
        var decls = tree.declarations;
        for (var i = 0; i < decls.length; i++) {
          this.visitAny(decls[i].initializer);
        }
      }
    },
    visitVariableDeclaration: function(tree) {
      this.bindVariableDeclaration_(tree.lvalue);
      $__superCall(this, $__VariableBinder__proto, "visitVariableDeclaration", [tree]);
    },
    bind_: function(identifier) {
      assert(typeof identifier.value == 'string');
      this.identifiers_[identifier.value] = true;
    },
    bindParameter_: function(parameter) {
      if (parameter.isRestParameter()) {
        this.bind_(parameter.identifier);
      } else {
        this.bindVariableDeclaration_(parameter.binding);
      }
    },
    bindVariableDeclaration_: function(tree) {
      switch (tree.type) {
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
  }, {}, $__VariableBinder__super, $__VariableBinder__proto);
  return Object.preventExtensions(Object.create(null, {
    variablesInBlock: {
      get: function() {
        return variablesInBlock;
      },
      enumerable: true
    },
    variablesInFunction: {
      get: function() {
        return variablesInFunction;
      },
      enumerable: true
    },
    VariableBinder: {
      get: function() {
        return VariableBinder;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/AlphaRenamer.js", function() {
  "use strict";
  var $__84 = System.get("../src/syntax/trees/ParseTrees.js"),
      FunctionDeclaration = $__84.FunctionDeclaration,
      FunctionExpression = $__84.FunctionExpression;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__84 = System.get("../src/syntax/PredefinedName.js"),
      ARGUMENTS = $__84.ARGUMENTS,
      THIS = $__84.THIS;
  var createIdentifierExpression = System.get("../src/codegeneration/ParseTreeFactory.js").createIdentifierExpression;
  var $__84 = System.get("../src/semantics/VariableBinder.js"),
      variablesInBlock = $__84.variablesInBlock,
      variablesInFunction = $__84.variablesInFunction;
  function AlphaRenamer(oldName, newName) {
    $__superCall(this, $__AlphaRenamer__proto, "constructor", []);
    this.oldName_ = oldName;
    this.newName_ = newName;
  }
  var $__AlphaRenamer__super = ParseTreeTransformer;
  var $__AlphaRenamer__proto = $__getProtoParent($__AlphaRenamer__super);
  ($__class)(AlphaRenamer, {
    transformBlock: function(tree) {
      if (this.oldName_ in variablesInBlock(tree)) {
        return tree;
      } else {
        return $__superCall(this, $__AlphaRenamer__proto, "transformBlock", [tree]);
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
      if (this.oldName_ !== THIS) return tree;
      return createIdentifierExpression(this.newName_);
    },
    transformFunctionDeclaration: function(tree) {
      if (this.oldName_ === tree.name) {
        tree = new FunctionDeclaration(tree.location, this.newName_, tree.isGenerator, tree.formalParameterList, tree.functionBody);
      }
      if (this.getDoNotRecurse(tree)) return tree;
      return $__superCall(this, $__AlphaRenamer__proto, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      if (this.oldName_ === tree.name) {
        tree = new FunctionExpression(tree.location, this.newName_, tree.isGenerator, tree.formalParameterList, tree.functionBody);
      }
      if (this.getDoNotRecurse(tree)) return tree;
      return $__superCall(this, $__AlphaRenamer__proto, "transformFunctionExpression", [tree]);
    },
    getDoNotRecurse: function(tree) {
      return this.oldName_ === ARGUMENTS || this.oldName_ === THIS || this.oldName_ in variablesInFunction(tree);
    },
    transformCatch: function(tree) {
      if (!tree.binding.isPattern() && this.oldName_ === tree.binding.identifierToken.value) {
        return tree;
      }
      return $__superCall(this, $__AlphaRenamer__proto, "transformCatch", [tree]);
    }
  }, {}, $__AlphaRenamer__super, $__AlphaRenamer__proto);
  AlphaRenamer.rename = function(tree, oldName, newName) {
    return new AlphaRenamer(oldName, newName).transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {AlphaRenamer: {
      get: function() {
        return AlphaRenamer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/FindVisitor.js", function() {
  "use strict";
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var foundSentinel = {};
  function FindVisitor(tree, keepOnGoing) {
    this.found_ = false;
    this.keepOnGoing_ = keepOnGoing;
    try {
      this.visitAny(tree);
    } catch (ex) {
      if (ex !== foundSentinel) throw ex;
    }
  }
  ($__class)(FindVisitor, {
    get found() {
      return this.found_;
    },
    set found(v) {
      if (v) {
        this.found_ = true;
        if (!this.keepOnGoing_) throw foundSentinel;
      }
    }
  }, {}, ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {FindVisitor: {
      get: function() {
        return FindVisitor;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/FindInFunctionScope.js", function() {
  "use strict";
  var FindVisitor = System.get("../src/codegeneration/FindVisitor.js").FindVisitor;
  function FindInFunctionScope() {
    $__FindInFunctionScope__proto !== null && $__superCall(this, $__FindInFunctionScope__proto, "constructor", arguments);
  }
  var $__FindInFunctionScope__super = FindVisitor;
  var $__FindInFunctionScope__proto = $__getProtoParent($__FindInFunctionScope__super);
  ($__class)(FindInFunctionScope, {
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {},
    visitPropertyMethodAssignment: function(tree) {}
  }, {}, $__FindInFunctionScope__super, $__FindInFunctionScope__proto);
  return Object.preventExtensions(Object.create(null, {FindInFunctionScope: {
      get: function() {
        return FindInFunctionScope;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/TempVarTransformer.js", function() {
  "use strict";
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__90 = System.get("../src/syntax/trees/ParseTrees.js"),
      Module = $__90.Module,
      Script = $__90.Script;
  var VAR = System.get("../src/syntax/TokenType.js").VAR;
  var $__90 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createFunctionBody = $__90.createFunctionBody,
      createVariableDeclaration = $__90.createVariableDeclaration,
      createVariableDeclarationList = $__90.createVariableDeclarationList,
      createVariableStatement = $__90.createVariableStatement;
  var prependStatements = System.get("../src/codegeneration/PrependStatements.js").prependStatements;
  function getVars(self) {
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1];
    if (!vars) throw new Error('Invalid use of addTempVar');
    return vars;
  }
  function TempVarStatement(name, initializer) {
    this.name = name;
    this.initializer = initializer;
  }
  ($__class)(TempVarStatement, {}, {});
  function TempVarTransformer(identifierGenerator) {
    $__superCall(this, $__TempVarTransformer__proto, "constructor", []);
    this.identifierGenerator = identifierGenerator;
    this.tempVarStack_ = [[]];
    this.tempIdentifierStack_ = [[]];
    this.pool_ = [];
  }
  var $__TempVarTransformer__super = ParseTreeTransformer;
  var $__TempVarTransformer__proto = $__getProtoParent($__TempVarTransformer__super);
  ($__class)(TempVarTransformer, {
    transformStatements_: function(statements) {
      this.tempVarStack_.push([]);
      var transformedStatements = this.transformList(statements);
      var vars = this.tempVarStack_.pop();
      if (!vars.length) return transformedStatements;
      var seenNames = Object.create(null);
      vars = vars.filter((function(tempVarStatement) {
        var $__90 = tempVarStatement,
            name = $__90.name,
            initializer = $__90.initializer;
        if (name in seenNames) {
          if (seenNames[name].initializer || initializer) throw new Error('Invalid use of TempVarTransformer');
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
      return new Script(tree.location, scriptItemList);
    },
    transformModule: function(tree) {
      var scriptItemList = this.transformStatements_(tree.scriptItemList);
      if (scriptItemList == tree.scriptItemList) {
        return tree;
      }
      return new Module(tree.location, scriptItemList);
    },
    transformFunctionBody: function(tree) {
      this.pushTempVarState();
      var statements = this.transformStatements_(tree.statements);
      this.popTempVarState();
      if (statements == tree.statements) return tree;
      return createFunctionBody(statements);
    },
    getTempIdentifier: function() {
      var name = this.pool_.length ? this.pool_.pop(): this.identifierGenerator.generateUniqueIdentifier();
      this.tempIdentifierStack_[this.tempIdentifierStack_.length - 1].push(name);
      return name;
    },
    addTempVar: function() {
      var initializer = arguments[0] !== (void 0) ? arguments[0]: null;
      var vars = getVars(this);
      var uid = this.getTempIdentifier();
      vars.push(new TempVarStatement(uid, initializer));
      return uid;
    },
    pushTempVarState: function() {
      this.tempIdentifierStack_.push([]);
    },
    popTempVarState: function() {
      this.tempIdentifierStack_.pop().forEach(this.release_, this);
    },
    release_: function(name) {
      this.pool_.push(name);
    }
  }, {}, $__TempVarTransformer__super, $__TempVarTransformer__proto);
  return Object.preventExtensions(Object.create(null, {TempVarTransformer: {
      get: function() {
        return TempVarTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ComprehensionTransformer.js", function() {
  "use strict";
  var $__92 = System.get("../src/syntax/PredefinedName.js"),
      ARGUMENTS = $__92.ARGUMENTS,
      THIS = $__92.THIS;
  var AlphaRenamer = System.get("../src/codegeneration/AlphaRenamer.js").AlphaRenamer;
  var FindInFunctionScope = System.get("../src/codegeneration/FindInFunctionScope.js").FindInFunctionScope;
  var FunctionExpression = System.get("../src/syntax/trees/ParseTrees.js").FunctionExpression;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__92 = System.get("../src/syntax/TokenType.js"),
      LET = $__92.LET,
      VAR = $__92.VAR;
  var $__92 = System.get("../src/syntax/trees/ParseTreeType.js"),
      COMPREHENSION_FOR = $__92.COMPREHENSION_FOR,
      COMPREHENSION_IF = $__92.COMPREHENSION_IF;
  var $__92 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createCallExpression = $__92.createCallExpression,
      createEmptyParameterList = $__92.createEmptyParameterList,
      createForOfStatement = $__92.createForOfStatement,
      createFunctionBody = $__92.createFunctionBody,
      createIdentifierExpression = $__92.createIdentifierExpression,
      createIfStatement = $__92.createIfStatement,
      createParenExpression = $__92.createParenExpression,
      createThisExpression = $__92.createThisExpression,
      createVariableDeclarationList = $__92.createVariableDeclarationList;
  var options = System.get("../src/options.js").options;
  function ThisFinder() {
    $__ThisFinder__proto !== null && $__superCall(this, $__ThisFinder__proto, "constructor", arguments);
  }
  var $__ThisFinder__super = FindInFunctionScope;
  var $__ThisFinder__proto = $__getProtoParent($__ThisFinder__super);
  ($__class)(ThisFinder, {visitThisExpression: function(tree) {
      this.found = true;
    }}, {}, $__ThisFinder__super, $__ThisFinder__proto);
  function ArgumentsFinder() {
    $__ArgumentsFinder__proto !== null && $__superCall(this, $__ArgumentsFinder__proto, "constructor", arguments);
  }
  var $__ArgumentsFinder__super = FindInFunctionScope;
  var $__ArgumentsFinder__proto = $__getProtoParent($__ArgumentsFinder__super);
  ($__class)(ArgumentsFinder, {visitIdentifierExpression: function(tree) {
      if (tree.identifierToken.value === ARGUMENTS) this.found = true;
    }}, {}, $__ArgumentsFinder__super, $__ArgumentsFinder__proto);
  function ComprehensionTransformer() {
    $__ComprehensionTransformer__proto !== null && $__superCall(this, $__ComprehensionTransformer__proto, "constructor", arguments);
  }
  var $__ComprehensionTransformer__super = TempVarTransformer;
  var $__ComprehensionTransformer__proto = $__getProtoParent($__ComprehensionTransformer__super);
  ($__class)(ComprehensionTransformer, {transformComprehension: function(tree, statement, isGenerator) {
      var prefix = arguments[3];
      var suffix = arguments[4];
      var bindingKind = isGenerator || !options.blockBinding ? VAR: LET;
      var statements = prefix ? [prefix]: [];
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
      var argumentsFinder = new ArgumentsFinder(statement);
      if (argumentsFinder.found) {
        var tempVar = this.addTempVar(createIdentifierExpression(ARGUMENTS));
        statement = AlphaRenamer.rename(statement, ARGUMENTS, tempVar);
      }
      var thisFinder = new ThisFinder(statement);
      if (thisFinder.found) {
        var tempVar = this.addTempVar(createThisExpression());
        statement = AlphaRenamer.rename(statement, THIS, tempVar);
      }
      statements.push(statement);
      if (suffix) statements.push(suffix);
      var func = new FunctionExpression(null, null, isGenerator, createEmptyParameterList(), createFunctionBody(statements));
      return createParenExpression(createCallExpression(func));
    }}, {}, $__ComprehensionTransformer__super, $__ComprehensionTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ComprehensionTransformer: {
      get: function() {
        return ComprehensionTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/PlaceholderParser.js", function() {
  "use strict";
  var ArrayMap = System.get("../src/util/ArrayMap.js").ArrayMap;
  var $__97 = System.get("../src/syntax/trees/ParseTreeType.js"),
      BLOCK = $__97.BLOCK,
      EXPRESSION_STATEMENT = $__97.EXPRESSION_STATEMENT,
      IDENTIFIER_EXPRESSION = $__97.IDENTIFIER_EXPRESSION;
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var LiteralToken = System.get("../src/syntax/LiteralToken.js").LiteralToken;
  var MutedErrorReporter = System.get("../src/util/MutedErrorReporter.js").MutedErrorReporter;
  var ParseTree = System.get("../src/syntax/trees/ParseTree.js").ParseTree;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var Parser = System.get("../src/syntax/Parser.js").Parser;
  var $__97 = System.get("../src/syntax/trees/ParseTrees.js"),
      LiteralExpression = $__97.LiteralExpression,
      LiteralPropertyName = $__97.LiteralPropertyName,
      PropertyMethodAssignment = $__97.PropertyMethodAssignment,
      PropertyNameAssignment = $__97.PropertyNameAssignment,
      PropertyNameShorthand = $__97.PropertyNameShorthand;
  var SourceFile = System.get("../src/syntax/SourceFile.js").SourceFile;
  var IDENTIFIER = System.get("../src/syntax/TokenType.js").IDENTIFIER;
  var $__97 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArrayLiteralExpression = $__97.createArrayLiteralExpression,
      createBindingIdentifier = $__97.createBindingIdentifier,
      createBlock = $__97.createBlock,
      createBooleanLiteral = $__97.createBooleanLiteral,
      createCommaExpression = $__97.createCommaExpression,
      createExpressionStatement = $__97.createExpressionStatement,
      createFunctionBody = $__97.createFunctionBody,
      createGetAccessor = $__97.createGetAccessor,
      createIdentifierExpression = $__97.createIdentifierExpression,
      createIdentifierToken = $__97.createIdentifierToken,
      createMemberExpression = $__97.createMemberExpression,
      createNullLiteral = $__97.createNullLiteral,
      createNumberLiteral = $__97.createNumberLiteral,
      createParenExpression = $__97.createParenExpression,
      createSetAccessor = $__97.createSetAccessor,
      createStringLiteral = $__97.createStringLiteral,
      createVoid0 = $__97.createVoid0;
  var NOT_FOUND = {};
  var PREFIX = '$__placeholder__';
  var cache = new ArrayMap();
  function parseExpression(sourceLiterals) {
    for (var values = [],
        $__94 = 1; $__94 < arguments.length; $__94++) values[$__94 - 1] = arguments[$__94];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseExpression(sourceLiterals);
    }));
  }
  function parseStatement(sourceLiterals) {
    for (var values = [],
        $__95 = 1; $__95 < arguments.length; $__95++) values[$__95 - 1] = arguments[$__95];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseStatement(sourceLiterals);
    }));
  }
  function parsePropertyDefinition(sourceLiterals) {
    for (var values = [],
        $__96 = 1; $__96 < arguments.length; $__96++) values[$__96 - 1] = arguments[$__96];
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
    if (!values.length) return tree;
    return new PlaceholderTransformer(values).transformAny(tree);
  }
  var counter = 0;
  function PlaceholderParser() {}
  ($__class)(PlaceholderParser, {
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
      var parser = new Parser(errorReporter, file);
      var tree = doParse(parser);
      if (errorReporter.hadError() || !tree || !parser.isAtEnd()) throw new Error(("Internal error trying to parse:\n\n" + source));
      return tree;
    }
  }, {});
  function convertValueToExpression(value) {
    if (value instanceof ParseTree) return value;
    if (value instanceof IdentifierToken) return createIdentifierExpression(value);
    if (value instanceof LiteralToken) return new LiteralExpression(value.location, value);
    if (Array.isArray(value)) {
      if (value[0]instanceof ParseTree) {
        if (value.length === 1) return value[0];
        if (value[0].isStatement()) return createBlock(value); else return createParenExpression(createCommaExpression(value));
      }
      return createArrayLiteralExpression(value.map(convertValueToExpression));
    }
    if (value === null) return createNullLiteral();
    if (value === undefined) return createVoid0();
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
    if (value instanceof IdentifierToken) return value;
    return createIdentifierToken(value);
  }
  function PlaceholderTransformer(values) {
    $__superCall(this, $__PlaceholderTransformer__proto, "constructor", []);
    this.values = values;
  }
  var $__PlaceholderTransformer__super = ParseTreeTransformer;
  var $__PlaceholderTransformer__proto = $__getProtoParent($__PlaceholderTransformer__super);
  ($__class)(PlaceholderTransformer, {
    getValueAt: function(index) {
      return this.values[index];
    },
    getValue_: function(str) {
      if (str.indexOf(PREFIX) !== 0) return NOT_FOUND;
      return this.getValueAt(Number(str.slice(PREFIX.length)));
    },
    transformIdentifierExpression: function(tree) {
      var value = this.getValue_(tree.identifierToken.value);
      if (value === NOT_FOUND) return tree;
      return convertValueToExpression(value);
    },
    transformBindingIdentifier: function(tree) {
      var value = this.getValue_(tree.identifierToken.value);
      if (value === NOT_FOUND) return tree;
      return createBindingIdentifier(value);
    },
    transformExpressionStatement: function(tree) {
      if (tree.expression.type === IDENTIFIER_EXPRESSION) {
        var transformedExpression = this.transformIdentifierExpression(tree.expression);
        if (transformedExpression === tree.expression) return tree;
        if (transformedExpression.isStatement()) return transformedExpression;
        return createExpressionStatement(transformedExpression);
      }
      return $__superCall(this, $__PlaceholderTransformer__proto, "transformExpressionStatement", [tree]);
    },
    transformBlock: function(tree) {
      if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
        var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
        if (transformedStatement === tree.statements[0]) return tree;
        if (transformedStatement.type === BLOCK) return transformedStatement;
      }
      return $__superCall(this, $__PlaceholderTransformer__proto, "transformBlock", [tree]);
    },
    transformFunctionBody: function(tree) {
      if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
        var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
        if (transformedStatement === tree.statements[0]) return tree;
        if (transformedStatement.type === BLOCK) return createFunctionBody(transformedStatement.statements);
      }
      return $__superCall(this, $__PlaceholderTransformer__proto, "transformFunctionBody", [tree]);
    },
    transformMemberExpression: function(tree) {
      var value = this.getValue_(tree.memberName.value);
      if (value === NOT_FOUND) return $__superCall(this, $__PlaceholderTransformer__proto, "transformMemberExpression", [tree]);
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
      return $__superCall(this, $__PlaceholderTransformer__proto, "transformPropertyNameAssignment", [tree]);
    }
  }, {}, $__PlaceholderTransformer__super, $__PlaceholderTransformer__proto);
  return Object.preventExtensions(Object.create(null, {
    parseExpression: {
      get: function() {
        return parseExpression;
      },
      enumerable: true
    },
    parseStatement: {
      get: function() {
        return parseStatement;
      },
      enumerable: true
    },
    parsePropertyDefinition: {
      get: function() {
        return parsePropertyDefinition;
      },
      enumerable: true
    },
    PlaceholderParser: {
      get: function() {
        return PlaceholderParser;
      },
      enumerable: true
    },
    PlaceholderTransformer: {
      get: function() {
        return PlaceholderTransformer;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ArrayComprehensionTransformer.js", function() {
  "use strict";
  var $__98 = Object.freeze(Object.defineProperties(["var ", " = 0, ", " = [];"], {raw: {value: Object.freeze(["var ", " = 0, ", " = [];"])}})),
      $__99 = Object.freeze(Object.defineProperties(["", "[", "++] = ", ";"], {raw: {value: Object.freeze(["", "[", "++] = ", ";"])}})),
      $__100 = Object.freeze(Object.defineProperties(["return ", ";"], {raw: {value: Object.freeze(["return ", ";"])}}));
  var ComprehensionTransformer = System.get("../src/codegeneration/ComprehensionTransformer.js").ComprehensionTransformer;
  var createIdentifierExpression = System.get("../src/codegeneration/ParseTreeFactory.js").createIdentifierExpression;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  function ArrayComprehensionTransformer() {
    $__ArrayComprehensionTransformer__proto !== null && $__superCall(this, $__ArrayComprehensionTransformer__proto, "constructor", arguments);
  }
  var $__ArrayComprehensionTransformer__super = ComprehensionTransformer;
  var $__ArrayComprehensionTransformer__proto = $__getProtoParent($__ArrayComprehensionTransformer__super);
  ($__class)(ArrayComprehensionTransformer, {transformArrayComprehension: function(tree) {
      this.pushTempVarState();
      var expression = this.transformAny(tree.expression);
      var index = createIdentifierExpression(this.getTempIdentifier());
      var result = createIdentifierExpression(this.getTempIdentifier());
      var tempVarsStatatement = parseStatement($__98, index, result);
      var statement = parseStatement($__99, result, index, expression);
      var returnStatement = parseStatement($__100, result);
      var isGenerator = false;
      var result = this.transformComprehension(tree, statement, isGenerator, tempVarsStatatement, returnStatement);
      this.popTempVarState();
      return result;
    }}, {}, $__ArrayComprehensionTransformer__super, $__ArrayComprehensionTransformer__proto);
  ArrayComprehensionTransformer.transformTree = function(identifierGenerator, tree) {
    return new ArrayComprehensionTransformer(identifierGenerator).transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {ArrayComprehensionTransformer: {
      get: function() {
        return ArrayComprehensionTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ArrowFunctionTransformer.js", function() {
  "use strict";
  var BIND = System.get("../src/syntax/PredefinedName.js").BIND;
  var FindInFunctionScope = System.get("../src/codegeneration/FindInFunctionScope.js").FindInFunctionScope;
  var FormalParameterList = System.get("../src/syntax/trees/ParseTrees.js").FormalParameterList;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var FUNCTION_BODY = System.get("../src/syntax/trees/ParseTreeType.js").FUNCTION_BODY;
  var $__104 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__104.createArgumentList,
      createCallExpression = $__104.createCallExpression,
      createFunctionBody = $__104.createFunctionBody,
      createFunctionExpression = $__104.createFunctionExpression,
      createMemberExpression = $__104.createMemberExpression,
      createParenExpression = $__104.createParenExpression,
      createReturnStatement = $__104.createReturnStatement,
      createThisExpression = $__104.createThisExpression;
  function ThisFinder() {
    $__ThisFinder__proto !== null && $__superCall(this, $__ThisFinder__proto, "constructor", arguments);
  }
  var $__ThisFinder__super = FindInFunctionScope;
  var $__ThisFinder__proto = $__getProtoParent($__ThisFinder__super);
  ($__class)(ThisFinder, {visitThisExpression: function(tree) {
      this.found = true;
    }}, {}, $__ThisFinder__super, $__ThisFinder__proto);
  function ArrowFunctionTransformer(reporter) {
    $__superCall(this, $__ArrowFunctionTransformer__proto, "constructor", []);
    this.reporter_ = reporter;
  }
  var $__ArrowFunctionTransformer__super = ParseTreeTransformer;
  var $__ArrowFunctionTransformer__proto = $__getProtoParent($__ArrowFunctionTransformer__super);
  ($__class)(ArrowFunctionTransformer, {transformArrowFunctionExpression: function(tree) {
      var parameters;
      if (tree.formalParameters) {
        parameters = this.transformAny(tree.formalParameters).parameters;
      } else {
        parameters = [];
      }
      var functionBody = this.transformAny(tree.functionBody);
      if (functionBody.type != FUNCTION_BODY) {
        functionBody = createFunctionBody([createReturnStatement(functionBody)]);
      }
      var result = createParenExpression(createFunctionExpression(new FormalParameterList(null, parameters), functionBody));
      var finder = new ThisFinder(functionBody);
      if (finder.found) {
        return createCallExpression(createMemberExpression(result, BIND), createArgumentList(createThisExpression()));
      }
      return result;
    }}, {transformTree: function(reporter, tree) {
      return new ArrowFunctionTransformer(reporter).transformAny(tree);
    }}, $__ArrowFunctionTransformer__super, $__ArrowFunctionTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ArrowFunctionTransformer: {
      get: function() {
        return ArrowFunctionTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/BlockBindingTransformer.js", function() {
  "use strict";
  var AlphaRenamer = System.get("../src/codegeneration/AlphaRenamer.js").AlphaRenamer;
  var $__106 = System.get("../src/syntax/trees/ParseTreeType.js"),
      BINDING_IDENTIFIER = $__106.BINDING_IDENTIFIER,
      BLOCK = $__106.BLOCK,
      VARIABLE_DECLARATION_LIST = $__106.VARIABLE_DECLARATION_LIST;
  var $__106 = System.get("../src/syntax/trees/ParseTrees.js"),
      FunctionDeclaration = $__106.FunctionDeclaration,
      FunctionExpression = $__106.FunctionExpression;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__106 = System.get("../src/syntax/TokenType.js"),
      CONST = $__106.CONST,
      LET = $__106.LET,
      VAR = $__106.VAR;
  var $__106 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentExpression = $__106.createAssignmentExpression,
      createBindingIdentifier = $__106.createBindingIdentifier,
      createBlock = $__106.createBlock,
      createCatch = $__106.createCatch,
      createEmptyStatement = $__106.createEmptyStatement,
      createExpressionStatement = $__106.createExpressionStatement,
      createFinally = $__106.createFinally,
      createForInStatement = $__106.createForInStatement,
      createForStatement = $__106.createForStatement,
      createFunctionBody = $__106.createFunctionBody,
      createIdentifierExpression = $__106.createIdentifierExpression,
      createIdentifierToken = $__106.createIdentifierToken,
      createThrowStatement = $__106.createThrowStatement,
      createTryStatement = $__106.createTryStatement,
      createUndefinedExpression = $__106.createUndefinedExpression,
      createVariableDeclaration = $__106.createVariableDeclaration,
      createVariableDeclarationList = $__106.createVariableDeclarationList,
      createVariableStatement = $__106.createVariableStatement;
  var ScopeType = {
    SCRIPT: 'SCRIPT',
    FUNCTION: 'FUNCTION',
    BLOCK: 'BLOCK'
  };
  function Scope(parent, type) {
    this.parent = parent;
    this.type = type;
    this.blockVariables = null;
  }
  ($__class)(Scope, {addBlockScopedVariable: function(value) {
      if (!this.blockVariables) {
        this.blockVariables = Object.create(null);
      }
      this.blockVariables[value] = true;
    }}, {});
  ;
  function Rename(oldName, newName) {
    this.oldName = oldName;
    this.newName = newName;
  }
  ($__class)(Rename, {}, {});
  function renameAll(renames, tree) {
    renames.forEach((function(rename) {
      tree = AlphaRenamer.rename(tree, rename.oldName, rename.newName);
    }));
    return tree;
  }
  function toBlock(statement) {
    return statement.type == BLOCK ? statement: createBlock(statement);
  }
  function BlockBindingTransformer(stateAllocator) {
    $__superCall(this, $__BlockBindingTransformer__proto, "constructor", []);
    this.scope_ = null;
  }
  var $__BlockBindingTransformer__super = ParseTreeTransformer;
  var $__BlockBindingTransformer__proto = $__getProtoParent($__BlockBindingTransformer__super);
  ($__class)(BlockBindingTransformer, {
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
        var list = $__spread([statement], block.statements);
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
      var copyFwd = [];
      var copyBak = [];
      var hoisted = [];
      var renames = [];
      variables.declarations.forEach((function(variable) {
        var variableName = this.getVariableName_(variable);
        var hoistedName = ("$" + variableName);
        var initializer = renameAll(renames, variable.initializer);
        hoisted.push(createVariableDeclaration(hoistedName, initializer));
        copyFwd.push(createVariableDeclaration(variableName, createIdentifierExpression(hoistedName)));
        copyBak.push(createExpressionStatement(createAssignmentExpression(createIdentifierExpression(hoistedName), createIdentifierExpression(variableName))));
        renames.push(new Rename(variableName, hoistedName));
      }).bind(this));
      var condition = renameAll(renames, tree.condition);
      var increment = renameAll(renames, tree.increment);
      var transformedForLoop = createBlock(createVariableStatement(createVariableDeclarationList(LET, hoisted)), createForStatement(null, condition, increment, createBlock(createVariableStatement(createVariableDeclarationList(LET, copyFwd)), createTryStatement(toBlock(tree.body), null, createFinally(createBlock(copyBak))))));
      return this.transformAny(transformedForLoop);
    },
    transformFunctionDeclaration: function(tree) {
      var body = this.transformFunctionBody(tree.functionBody);
      var formalParameterList = this.transformAny(tree.formalParameterList);
      if (this.scope_.type === ScopeType.BLOCK) {
        this.scope_.addBlockScopedVariable(tree.name.identifierToken.value);
        return createExpressionStatement(createAssignmentExpression(createIdentifierExpression(tree.name.identifierToken), new FunctionExpression(tree.location, null, tree.isGenerator, formalParameterList, body)));
      }
      if (body === tree.functionBody && formalParameterList === tree.formalParameterList) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, tree.name, tree.isGenerator, formalParameterList, body);
    },
    transformScript: function(tree) {
      var scope = this.push_(this.createScriptScope_());
      var result = $__superCall(this, $__BlockBindingTransformer__proto, "transformScript", [tree]);
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
        var variableName = this.getVariableName_(variable);
        this.scope_.addBlockScopedVariable(variableName);
        var initializer = this.transformAny(variable.initializer);
        if (initializer != null) {
          comma.push(createAssignmentExpression(createIdentifierExpression(variableName), initializer));
        }
      }).bind(this));
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
        var declarations = transformed != null ? transformed: tree.declarations;
        var declarationType = tree.declarationType != VAR ? VAR: tree.declarationType;
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
  }, {transformTree: function(tree) {
      return new BlockBindingTransformer().transformAny(tree);
    }}, $__BlockBindingTransformer__super, $__BlockBindingTransformer__proto);
  return Object.preventExtensions(Object.create(null, {BlockBindingTransformer: {
      get: function() {
        return BlockBindingTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/CascadeExpressionTransformer.js", function() {
  "use strict";
  var $__108 = System.get("../src/syntax/trees/ParseTreeType.js"),
      BINARY_OPERATOR = $__108.BINARY_OPERATOR,
      CALL_EXPRESSION = $__108.CALL_EXPRESSION,
      CALL_EXPRESSION = $__108.CALL_EXPRESSION,
      CASCADE_EXPRESSION = $__108.CASCADE_EXPRESSION,
      CASCADE_EXPRESSION = $__108.CASCADE_EXPRESSION,
      IDENTIFIER_EXPRESSION = $__108.IDENTIFIER_EXPRESSION,
      MEMBER_EXPRESSION = $__108.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__108.MEMBER_LOOKUP_EXPRESSION;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__108 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentExpression = $__108.createAssignmentExpression,
      createBinaryOperator = $__108.createBinaryOperator,
      createCallExpression = $__108.createCallExpression,
      createCascadeExpression = $__108.createCascadeExpression,
      createCommaExpression = $__108.createCommaExpression,
      createIdentifierExpression = $__108.createIdentifierExpression,
      createMemberExpression = $__108.createMemberExpression,
      createMemberLookupExpression = $__108.createMemberLookupExpression,
      createParenExpression = $__108.createParenExpression;
  function prependMemberExpression(name, rest) {
    switch (rest.type) {
      case MEMBER_EXPRESSION:
        return createMemberExpression(prependMemberExpression(name, rest.operand), rest.memberName);
      case MEMBER_LOOKUP_EXPRESSION:
        return createMemberLookupExpression(prependMemberExpression(name, rest.operand), rest.memberExpression);
      case IDENTIFIER_EXPRESSION:
        return createMemberExpression(name, rest.identifierToken);
      case CALL_EXPRESSION:
        return createCallExpression(prependMemberExpression(name, rest.operand), rest.args);
      case CASCADE_EXPRESSION:
        return createCascadeExpression(prependMemberExpression(name, rest.operand), rest.expressions);
      default:
        throw Error('Not reachable');
    }
  }
  function CascadeExpressionTransformer(identifierGenerator, reporter) {
    $__superCall(this, $__CascadeExpressionTransformer__proto, "constructor", [identifierGenerator]);
    this.reporter_ = reporter;
  }
  var $__CascadeExpressionTransformer__super = TempVarTransformer;
  var $__CascadeExpressionTransformer__proto = $__getProtoParent($__CascadeExpressionTransformer__super);
  ($__class)(CascadeExpressionTransformer, {
    transformCascadeExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var ident = createIdentifierExpression(this.addTempVar());
      var expressions = this.transformList(tree.expressions.map(this.desugarExpression_.bind(this, ident)));
      expressions.unshift(createAssignmentExpression(ident, operand));
      expressions.push(ident);
      return createParenExpression(createCommaExpression(expressions));
    },
    desugarExpression_: function(ident, tree) {
      switch (tree.type) {
        case BINARY_OPERATOR:
          return this.desugarBinaryExpression_(ident, tree);
        case CALL_EXPRESSION:
          return this.desugarCallExpression_(ident, tree);
        case CASCADE_EXPRESSION:
          return this.desugarCascadeExpression_(ident, tree);
        default:
          this.reporter_.reportError(tree.location.start, 'Unsupported expression type in cascade: %s', tree.type);
      }
    },
    desugarBinaryExpression_: function(ident, tree) {
      return createBinaryOperator(prependMemberExpression(ident, tree.left), tree.operator, tree.right);
    },
    desugarCallExpression_: function(ident, tree) {
      var newOperand = prependMemberExpression(ident, tree.operand);
      return createCallExpression(newOperand, tree.args);
    },
    desugarCascadeExpression_: function(ident, tree) {
      var newOperand = prependMemberExpression(ident, tree.operand);
      return createCascadeExpression(newOperand, tree.expressions);
    }
  }, {transformTree: function(identifierGenerator, reporter, tree) {
      return new CascadeExpressionTransformer(identifierGenerator, reporter).transformAny(tree);
    }}, $__CascadeExpressionTransformer__super, $__CascadeExpressionTransformer__proto);
  return Object.preventExtensions(Object.create(null, {CascadeExpressionTransformer: {
      get: function() {
        return CascadeExpressionTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/semantics/util.js", function() {
  "use strict";
  var $__109 = System.get("../src/syntax/trees/ParseTreeType.js"),
      IDENTIFIER_EXPRESSION = $__109.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__109.LITERAL_EXPRESSION,
      PAREN_EXPRESSION = $__109.PAREN_EXPRESSION,
      UNARY_EXPRESSION = $__109.UNARY_EXPRESSION;
  var UNDEFINED = System.get("../src/syntax/PredefinedName.js").UNDEFINED;
  var VOID = System.get("../src/syntax/TokenType.js").VOID;
  function hasUseStrict(list) {
    for (var i = 0; i < list.length; i++) {
      if (!list[i].isDirectivePrologue()) return false;
      if (list[i].isUseStrictDirective()) return true;
    }
    return false;
  }
  function isUndefined(tree) {
    if (tree.type === PAREN_EXPRESSION) return isUndefined(tree.expression);
    return tree.type === IDENTIFIER_EXPRESSION && tree.identifierToken.value === UNDEFINED;
  }
  function isVoidExpression(tree) {
    if (tree.type === PAREN_EXPRESSION) return isVoidExpression(tree.expression);
    return tree.type === UNARY_EXPRESSION && tree.operator.type === VOID && isLiteralExpression(tree.operand);
  }
  function isLiteralExpression(tree) {
    if (tree.type === PAREN_EXPRESSION) return isLiteralExpression(tree.expression);
    return tree.type === LITERAL_EXPRESSION;
  }
  return Object.preventExtensions(Object.create(null, {
    hasUseStrict: {
      get: function() {
        return hasUseStrict;
      },
      enumerable: true
    },
    isUndefined: {
      get: function() {
        return isUndefined;
      },
      enumerable: true
    },
    isVoidExpression: {
      get: function() {
        return isVoidExpression;
      },
      enumerable: true
    },
    isLiteralExpression: {
      get: function() {
        return isLiteralExpression;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/staticsemantics/PropName.js", function() {
  "use strict";
  var $__110 = System.get("../src/syntax/trees/ParseTreeType.js"),
      COMPUTED_PROPERTY_NAME = $__110.COMPUTED_PROPERTY_NAME,
      GET_ACCESSOR = $__110.GET_ACCESSOR,
      LITERAL_PROPERTY_NAME = $__110.LITERAL_PROPERTY_NAME,
      PROPERTY_METHOD_ASSIGNMENT = $__110.PROPERTY_METHOD_ASSIGNMENT,
      PROPERTY_NAME_ASSIGNMENT = $__110.PROPERTY_NAME_ASSIGNMENT,
      PROPERTY_NAME_SHORTHAND = $__110.PROPERTY_NAME_SHORTHAND,
      SET_ACCESSOR = $__110.SET_ACCESSOR;
  var IDENTIFIER = System.get("../src/syntax/TokenType.js").IDENTIFIER;
  function propName(tree) {
    switch (tree.type) {
      case LITERAL_PROPERTY_NAME:
        var token = tree.literalToken;
        if (token.isKeyword() || token.type === IDENTIFIER) return token.toString();
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
  return Object.preventExtensions(Object.create(null, {propName: {
      get: function() {
        return propName;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/MakeStrictTransformer.js", function() {
  "use strict";
  var $__112 = System.get("../src/syntax/trees/ParseTrees.js"),
      FunctionBody = $__112.FunctionBody,
      Script = $__112.Script;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var createUseStrictDirective = System.get("../src/codegeneration/ParseTreeFactory.js").createUseStrictDirective;
  var hasUseStrict = System.get("../src/semantics/util.js").hasUseStrict;
  function prepend(statements) {
    return $__spread([createUseStrictDirective()], statements);
  }
  function MakeStrictTransformer() {
    $__MakeStrictTransformer__proto !== null && $__superCall(this, $__MakeStrictTransformer__proto, "constructor", arguments);
  }
  var $__MakeStrictTransformer__super = ParseTreeTransformer;
  var $__MakeStrictTransformer__proto = $__getProtoParent($__MakeStrictTransformer__super);
  ($__class)(MakeStrictTransformer, {
    transformScript: function(tree) {
      if (hasUseStrict(tree.scriptItemList)) return tree;
      return new Script(tree.location, prepend(tree.scriptItemList));
    },
    transformFunctionBody: function(tree) {
      if (hasUseStrict(tree.statements)) return tree;
      return new FunctionBody(tree.location, prepend(tree.statements));
    }
  }, {transformTree: function(tree) {
      return new MakeStrictTransformer().transformAny(tree);
    }}, $__MakeStrictTransformer__super, $__MakeStrictTransformer__proto);
  return Object.preventExtensions(Object.create(null, {MakeStrictTransformer: {
      get: function() {
        return MakeStrictTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/OperatorExpander.js", function() {
  "use strict";
  var $__113 = System.get("../src/syntax/trees/ParseTreeType.js"),
      IDENTIFIER_EXPRESSION = $__113.IDENTIFIER_EXPRESSION,
      SUPER_EXPRESSION = $__113.SUPER_EXPRESSION;
  var $__113 = System.get("../src/syntax/TokenType.js"),
      AMPERSAND = $__113.AMPERSAND,
      AMPERSAND_EQUAL = $__113.AMPERSAND_EQUAL,
      BAR = $__113.BAR,
      BAR_EQUAL = $__113.BAR_EQUAL,
      CARET = $__113.CARET,
      CARET_EQUAL = $__113.CARET_EQUAL,
      LEFT_SHIFT = $__113.LEFT_SHIFT,
      LEFT_SHIFT_EQUAL = $__113.LEFT_SHIFT_EQUAL,
      MINUS = $__113.MINUS,
      MINUS_EQUAL = $__113.MINUS_EQUAL,
      PERCENT = $__113.PERCENT,
      PERCENT_EQUAL = $__113.PERCENT_EQUAL,
      PLUS = $__113.PLUS,
      PLUS_EQUAL = $__113.PLUS_EQUAL,
      RIGHT_SHIFT = $__113.RIGHT_SHIFT,
      RIGHT_SHIFT_EQUAL = $__113.RIGHT_SHIFT_EQUAL,
      SLASH = $__113.SLASH,
      SLASH_EQUAL = $__113.SLASH_EQUAL,
      STAR = $__113.STAR,
      STAR_EQUAL = $__113.STAR_EQUAL,
      UNSIGNED_RIGHT_SHIFT = $__113.UNSIGNED_RIGHT_SHIFT,
      UNSIGNED_RIGHT_SHIFT_EQUAL = $__113.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__113 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentExpression = $__113.createAssignmentExpression,
      createBinaryOperator = $__113.createBinaryOperator,
      createCommaExpression = $__113.createCommaExpression,
      createIdentifierExpression = $__113.createIdentifierExpression,
      createMemberExpression = $__113.createMemberExpression,
      createMemberLookupExpression = $__113.createMemberLookupExpression,
      createOperatorToken = $__113.createOperatorToken,
      createParenExpression = $__113.createParenExpression;
  function getBinaryOperator(type) {
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
  function expandMemberLookupExpression(tree, tempVarTransformer) {
    var tmp1;
    var expressions = [];
    if (tree.left.operand.type == SUPER_EXPRESSION || tree.left.operand.type == IDENTIFIER_EXPRESSION) {
      tmp1 = tree.left.operand;
    } else {
      tmp1 = createIdentifierExpression(tempVarTransformer.addTempVar());
      expressions.push(createAssignmentExpression(tmp1, tree.left.operand));
    }
    var tmp2 = createIdentifierExpression(tempVarTransformer.addTempVar());
    expressions.push(createAssignmentExpression(tmp2, tree.left.memberExpression), createAssignmentExpression(createMemberLookupExpression(tmp1, tmp2), createBinaryOperator(createMemberLookupExpression(tmp1, tmp2), createOperatorToken(getBinaryOperator(tree.operator.type)), tree.right)));
    return createParenExpression(createCommaExpression(expressions));
  }
  function expandMemberExpression(tree, tempVarTransformer) {
    var tmp;
    var expressions = [];
    if (tree.left.operand.type == SUPER_EXPRESSION || tree.left.operand.type == IDENTIFIER_EXPRESSION) {
      tmp = tree.left.operand;
    } else {
      tmp = createIdentifierExpression(tempVarTransformer.addTempVar());
      expressions.push(createAssignmentExpression(tmp, tree.left.operand));
    }
    expressions.push(createAssignmentExpression(createMemberExpression(tmp, tree.left.memberName), createBinaryOperator(createMemberExpression(tmp, tree.left.memberName), createOperatorToken(getBinaryOperator(tree.operator.type)), tree.right)));
    return createParenExpression(createCommaExpression(expressions));
  }
  return Object.preventExtensions(Object.create(null, {
    expandMemberLookupExpression: {
      get: function() {
        return expandMemberLookupExpression;
      },
      enumerable: true
    },
    expandMemberExpression: {
      get: function() {
        return expandMemberExpression;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/SuperTransformer.js", function() {
  "use strict";
  var $__114 = Object.freeze(Object.defineProperties(["", "(", ",\n                                               ", ",\n                                               ", ",\n                                               ", ")"], {raw: {value: Object.freeze(["", "(", ",\n                                               ", ",\n                                               ", ",\n                                               ", ")"])}})),
      $__115 = Object.freeze(Object.defineProperties(["", "(", ",\n                                              ", ",\n                                              ", ")"], {raw: {value: Object.freeze(["", "(", ",\n                                              ", ",\n                                              ", ")"])}})),
      $__116 = Object.freeze(Object.defineProperties(["", "(", ",\n                                                ", ",\n                                                ", ",\n                                                ", ")"], {raw: {value: Object.freeze(["", "(", ",\n                                                ", ",\n                                                ", ",\n                                                ", ")"])}}));
  var $__119 = System.get("../src/syntax/trees/ParseTrees.js"),
      FunctionDeclaration = $__119.FunctionDeclaration,
      FunctionExpression = $__119.FunctionExpression;
  var $__119 = System.get("../src/syntax/trees/ParseTreeType.js"),
      LITERAL_PROPERTY_NAME = $__119.LITERAL_PROPERTY_NAME,
      MEMBER_EXPRESSION = $__119.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__119.MEMBER_LOOKUP_EXPRESSION,
      SUPER_EXPRESSION = $__119.SUPER_EXPRESSION;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var EQUAL = System.get("../src/syntax/TokenType.js").EQUAL;
  var assert = System.get("../src/util/assert.js").assert;
  var $__119 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArrayLiteralExpression = $__119.createArrayLiteralExpression,
      createIdentifierExpression = $__119.createIdentifierExpression,
      createStringLiteral = $__119.createStringLiteral,
      createThisExpression = $__119.createThisExpression;
  var $__119 = System.get("../src/codegeneration/OperatorExpander.js"),
      expandMemberExpression = $__119.expandMemberExpression,
      expandMemberLookupExpression = $__119.expandMemberLookupExpression;
  var parseExpression = System.get("../src/codegeneration/PlaceholderParser.js").parseExpression;
  var SUPER_DESCRIPTOR_CODE = "function (proto, name) {\n      if (!proto)\n        throw new %TypeError('super is null');\n      return %getPropertyDescriptor(proto, name);\n    }";
  var SUPER_CALL_CODE = "function(self, proto, name, args) {\n      var descriptor = %superDescriptor(proto, name);\n      if (descriptor) {\n        if ('value' in descriptor)\n          return descriptor.value.apply(self, args);\n        if (descriptor.get)\n          return descriptor.get.call(self).apply(self, args);\n      }\n      throw new %TypeError(\"Object has no method '\" + name + \"'.\");\n    }";
  var SUPER_GET_CODE = "function(self, proto, name) {\n      var descriptor = %superDescriptor(proto, name);\n      if (descriptor) {\n        if (descriptor.get)\n          return descriptor.get.call(self);\n        else if ('value' in descriptor)\n          return descriptor.value;\n      }\n      return undefined;\n    }";
  var SUPER_SET_CODE = "function(self, proto, name, value) {\n      var descriptor = %superDescriptor(proto, name);\n      if (descriptor && descriptor.set) {\n        descriptor.set.call(self, value);\n        return;\n      }\n      throw new %TypeError(\"Object has no setter '\" + name + \"'.\");\n    }";
  function SuperTransformer(tempVarTransformer, runtimeInliner, reporter, protoName, methodTree, thisName) {
    this.tempVarTransformer_ = tempVarTransformer;
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
    this.protoName_ = protoName;
    this.method_ = methodTree;
    this.superCount_ = 0;
    this.thisVar_ = createIdentifierExpression(thisName);
    this.inNestedFunc_ = 0;
    this.nestedSuperCount_ = 0;
  }
  var $__SuperTransformer__super = ParseTreeTransformer;
  var $__SuperTransformer__proto = $__getProtoParent($__SuperTransformer__super);
  ($__class)(SuperTransformer, {
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
      var transformedTree = constructor === FunctionExpression ? $__superCall(this, $__SuperTransformer__proto, "transformFunctionExpression", [tree]): $__superCall(this, $__SuperTransformer__proto, "transformFunctionDeclaration", [tree]);
      this.inNestedFunc_--;
      if (oldSuperCount !== this.superCount_) this.nestedSuperCount_ += this.superCount_ - oldSuperCount;
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
      if ((tree.operand.type == MEMBER_EXPRESSION || tree.operand.type == MEMBER_LOOKUP_EXPRESSION) && tree.operand.operand.type == SUPER_EXPRESSION) {
        this.superCount_++;
        var name;
        if (tree.operand.type == MEMBER_EXPRESSION) name = tree.operand.memberName.value; else name = tree.operand.memberExpression;
        return this.createSuperCallExpression_(name, tree);
      }
      return $__superCall(this, $__SuperTransformer__proto, "transformCallExpression", [tree]);
    },
    createSuperCallExpression_: function(methodName, tree) {
      var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
      var args = createArrayLiteralExpression(tree.args.args);
      return this.createSuperCallExpression(thisExpr, this.protoName_, methodName, args);
    },
    createSuperCallExpression: function(thisExpr, protoName, methodName, args) {
      return parseExpression($__114, this.superCall_, thisExpr, protoName, methodName, args);
    },
    get superGet_() {
      this.runtimeInliner_.register('superDescriptor', SUPER_DESCRIPTOR_CODE);
      return this.runtimeInliner_.get('superGet', SUPER_GET_CODE);
    },
    get superSet_() {
      this.runtimeInliner_.register('superDescriptor', SUPER_DESCRIPTOR_CODE);
      return this.runtimeInliner_.get('superSet', SUPER_SET_CODE);
    },
    get superCall_() {
      this.runtimeInliner_.register('superDescriptor', SUPER_DESCRIPTOR_CODE);
      return this.runtimeInliner_.get('superCall', SUPER_CALL_CODE);
    },
    transformMemberShared_: function(tree, name) {
      var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
      return parseExpression($__115, this.superGet_, thisExpr, this.protoName_, name);
    },
    transformMemberExpression: function(tree) {
      if (tree.operand.type === SUPER_EXPRESSION) {
        this.superCount_++;
        return this.transformMemberShared_(tree, createStringLiteral(tree.memberName.value));
      }
      return $__superCall(this, $__SuperTransformer__proto, "transformMemberExpression", [tree]);
    },
    transformMemberLookupExpression: function(tree) {
      if (tree.operand.type === SUPER_EXPRESSION) return this.transformMemberShared_(tree, tree.memberExpression);
      return $__superCall(this, $__SuperTransformer__proto, "transformMemberLookupExpression", [tree]);
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.isAssignmentOperator() && (tree.left.type === MEMBER_EXPRESSION || tree.left.type === MEMBER_LOOKUP_EXPRESSION) && tree.left.operand.type === SUPER_EXPRESSION) {
        if (tree.operator.type !== EQUAL) {
          if (tree.left.type === MEMBER_LOOKUP_EXPRESSION) {
            tree = expandMemberLookupExpression(tree, this.tempVarTransformer_);
          } else {
            tree = expandMemberExpression(tree, this.tempVarTransformer_);
          }
          return this.transformAny(tree);
        }
        this.superCount_++;
        var name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ? tree.left.memberExpression: createStringLiteral(tree.left.memberName.value);
        var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
        var right = this.transformAny(tree.right);
        return parseExpression($__116, this.superSet_, thisExpr, this.protoName_, name, right);
      }
      return $__superCall(this, $__SuperTransformer__proto, "transformBinaryOperator", [tree]);
    },
    transformSuperExpression: function(tree) {
      this.reportError_(tree, '"super" may only be used on the LHS of a member ' + 'access expression before a call (TODO wording)');
      return tree;
    },
    reportError_: function(tree) {
      var $__120;
      for (var args = [],
          $__118 = 1; $__118 < arguments.length; $__118++) args[$__118 - 1] = arguments[$__118];
      ($__120 = this.reporter_).reportError.apply($__120, $__spread([tree.location.start], args));
    }
  }, {}, $__SuperTransformer__super, $__SuperTransformer__proto);
  return Object.preventExtensions(Object.create(null, {SuperTransformer: {
      get: function() {
        return SuperTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ClassTransformer.js", function() {
  "use strict";
  var $__121 = Object.freeze(Object.defineProperties(["(", ")(", ", ", ",\n                                                       ", ")"], {raw: {value: Object.freeze(["(", ")(", ", ", ",\n                                                       ", ")"])}})),
      $__122 = Object.freeze(Object.defineProperties(["var ", " = ", ""], {raw: {value: Object.freeze(["var ", " = ", ""])}})),
      $__123 = Object.freeze(Object.defineProperties(["var ", " = ", "(", ")"], {raw: {value: Object.freeze(["var ", " = ", "(", ")"])}})),
      $__124 = Object.freeze(Object.defineProperties(["(", ")(", ", ", ", ", ",\n                            ", ", ", ")"], {raw: {value: Object.freeze(["(", ")(", ", ", ", ", ",\n                            ", ", ", ")"])}})),
      $__125 = Object.freeze(Object.defineProperties(["(", ")(", ", ", ", ", ",\n                            ", ")"], {raw: {value: Object.freeze(["(", ")(", ", ", ", ", ",\n                            ", ")"])}})),
      $__126 = Object.freeze(Object.defineProperties(["(", ")(", ", ", ",\n                                               ", ")"], {raw: {value: Object.freeze(["(", ")(", ", ", ",\n                                               ", ")"])}})),
      $__127 = Object.freeze(Object.defineProperties(["return ", ""], {raw: {value: Object.freeze(["return ", ""])}})),
      $__128 = Object.freeze(Object.defineProperties(["(function(", ") {\n        ", "\n      })(", ")"], {raw: {value: Object.freeze(["(function(", ") {\n        ", "\n      })(", ")"])}})),
      $__129 = Object.freeze(Object.defineProperties(["(function() {\n      ", "\n    })()"], {raw: {value: Object.freeze(["(function() {\n      ", "\n    })()"])}})),
      $__130 = Object.freeze(Object.defineProperties(["constructor: ", ""], {raw: {value: Object.freeze(["constructor: ", ""])}})),
      $__131 = Object.freeze(Object.defineProperties(["function() {}"], {raw: {value: Object.freeze(["function() {}"])}})),
      $__132 = Object.freeze(Object.defineProperties(["function() {\n      ", ";\n    }"], {raw: {value: Object.freeze(["function() {\n      ", ";\n    }"])}})),
      $__133 = Object.freeze(Object.defineProperties(["", " !== null && ", ""], {raw: {value: Object.freeze(["", " !== null && ", ""])}}));
  var CONSTRUCTOR = System.get("../src/syntax/PredefinedName.js").CONSTRUCTOR;
  var $__135 = System.get("../src/syntax/trees/ParseTrees.js"),
      AnonBlock = $__135.AnonBlock,
      BindingIdentifier = $__135.BindingIdentifier,
      Block = $__135.Block,
      ClassExpression = $__135.ClassExpression,
      ExportDeclaration = $__135.ExportDeclaration,
      FunctionDeclaration = $__135.FunctionDeclaration,
      FunctionExpression = $__135.FunctionExpression,
      GetAccessor = $__135.GetAccessor,
      PropertyMethodAssignment = $__135.PropertyMethodAssignment,
      SetAccessor = $__135.SetAccessor;
  var $__135 = System.get("../src/syntax/trees/ParseTreeType.js"),
      GET_ACCESSOR = $__135.GET_ACCESSOR,
      PROPERTY_METHOD_ASSIGNMENT = $__135.PROPERTY_METHOD_ASSIGNMENT,
      SET_ACCESSOR = $__135.SET_ACCESSOR;
  var SuperTransformer = System.get("../src/codegeneration/SuperTransformer.js").SuperTransformer;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var VAR = System.get("../src/syntax/TokenType.js").VAR;
  var MakeStrictTransformer = System.get("../src/codegeneration/MakeStrictTransformer.js").MakeStrictTransformer;
  var $__135 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createBlock = $__135.createBlock,
      createEmptyParameterList = $__135.createEmptyParameterList,
      createExpressionStatement = $__135.createExpressionStatement,
      createFunctionBody = $__135.createFunctionBody,
      id = $__135.createIdentifierExpression,
      createMemberExpression = $__135.createMemberExpression,
      createObjectLiteralExpression = $__135.createObjectLiteralExpression,
      createParenExpression = $__135.createParenExpression,
      createScopedExpression = $__135.createScopedExpression,
      createThisExpression = $__135.createThisExpression,
      createUseStrictDirective = $__135.createUseStrictDirective,
      createVariableStatement = $__135.createVariableStatement;
  var hasUseStrict = System.get("../src/semantics/util.js").hasUseStrict;
  var parseOptions = System.get("../src/options.js").parseOptions;
  var $__135 = System.get("../src/codegeneration/PlaceholderParser.js"),
      parseExpression = $__135.parseExpression,
      parsePropertyDefinition = $__135.parsePropertyDefinition,
      parseStatement = $__135.parseStatement;
  var propName = System.get("../src/staticsemantics/PropName.js").propName;
  var GET_PROTO_PARENT_CODE = "function(superClass) {\n      if (typeof superClass === 'function') {\n        var prototype = superClass.prototype;\n        if (Object(prototype) === prototype || prototype === null)\n          return prototype;\n      }\n      if (superClass === null)\n        return null;\n      throw new %TypeError();\n    }";
  var CLASS_CODE = "function(ctor, object, staticObject, superClass, protoParent) {\n      %defineProperty(object, 'constructor', {value: ctor, configurable: true, writable: true, enumerable: false});\n      if (arguments.length > 3) {\n        if (typeof superClass === 'function')\n          ctor.__proto__ = superClass;\n        ctor.prototype = Object.create(protoParent || %getProtoParent(superClass), %getDescriptors(object));\n      } else {\n        ctor.prototype = object;\n      }\n      return %defineProperties(ctor, %getDescriptors(staticObject));\n    }";
  function ClassTransformer(identifierGenerator, runtimeInliner, reporter) {
    $__superCall(this, $__ClassTransformer__proto, "constructor", [identifierGenerator]);
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
    this.strictCount_ = 0;
    this.state_ = null;
  }
  var $__ClassTransformer__super = TempVarTransformer;
  var $__ClassTransformer__proto = $__getProtoParent($__ClassTransformer__super);
  ($__class)(ClassTransformer, {
    transformExportDeclaration: function(tree) {
      var transformed = $__superCall(this, $__ClassTransformer__proto, "transformExportDeclaration", [tree]);
      if (transformed === tree) return tree;
      var declaration = transformed.declaration;
      if (declaration instanceof AnonBlock) {
        var statements = $__spread([new ExportDeclaration(null, declaration.statements[0])], declaration.statements.slice(1));
        return new AnonBlock(null, statements);
      }
      return transformed;
    },
    transformModule: function(tree) {
      this.strictCount_ = 1;
      return $__superCall(this, $__ClassTransformer__proto, "transformModule", [tree]);
    },
    transformScript: function(tree) {
      this.strictCount_ = + hasUseStrict(tree.scriptItemList);
      return $__superCall(this, $__ClassTransformer__proto, "transformScript", [tree]);
    },
    transformFunctionBody: function(tree) {
      var useStrict = + hasUseStrict(tree.statements);
      this.strictCount_ += useStrict;
      var result = $__superCall(this, $__ClassTransformer__proto, "transformFunctionBody", [tree]);
      this.strictCount_ -= useStrict;
      return result;
    },
    makeStrict_: function(tree) {
      if (this.strictCount_) return tree;
      return MakeStrictTransformer.transformTree(tree);
    },
    transformClassElements_: function(tree, protoName, superName) {
      var oldState = this.state_;
      this.state_ = {
        hasStaticSuper: false,
        hasSuper: false
      };
      var superClass = this.transformAny(tree.superClass);
      var hasConstructor = false;
      var protoElements = [],
          staticElements = [];
      var constructorBody,
          constructorParams;
      if (!superClass) {
        protoName = this.runtimeInliner_.get('ObjectPrototype');
        superName = this.runtimeInliner_.get('FunctionPrototype');
      }
      tree.elements.forEach((function(tree) {
        var elements,
            proto;
        if (tree.isStatic) {
          elements = staticElements;
          proto = superName;
        } else {
          elements = protoElements;
          proto = protoName;
        }
        switch (tree.type) {
          case GET_ACCESSOR:
            elements.push(this.transformGetAccessor_(tree, proto));
            break;
          case SET_ACCESSOR:
            elements.push(this.transformSetAccessor_(tree, proto));
            break;
          case PROPERTY_METHOD_ASSIGNMENT:
            var transformed = this.transformPropertyMethodAssignment_(tree, proto);
            if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
              hasConstructor = true;
              constructorParams = transformed.formalParameterList;
              constructorBody = transformed.functionBody;
            } else {
              elements.push(transformed);
            }
            break;
          default:
            throw new Error(("Unexpected class element: " + tree.type));
        }
      }).bind(this));
      var object = createObjectLiteralExpression(protoElements);
      var staticObject = createObjectLiteralExpression(staticElements);
      var state = this.state_;
      this.state_ = oldState;
      if (!hasConstructor) {
        constructorParams = createEmptyParameterList();
        if (superClass) {
          constructorBody = createFunctionBody([this.getDefaultConstructorBody_(tree, protoName)]);
          state.hasSuper = true;
        } else {
          constructorBody = createFunctionBody([]);
        }
      }
      return {
        hasConstructor: hasConstructor,
        constructorParams: constructorParams,
        constructorBody: constructorBody,
        superClass: superClass,
        object: object,
        staticObject: staticObject,
        hasSuper: state.hasSuper,
        hasStaticSuper: state.hasStaticSuper
      };
    },
    get class_() {
      this.runtimeInliner_.register('getProtoParent', GET_PROTO_PARENT_CODE);
      return this.runtimeInliner_.get('class', CLASS_CODE);
    },
    get getProtoParent_() {
      return this.runtimeInliner_.get('getProtoParent', GET_PROTO_PARENT_CODE);
    },
    transformClassDeclaration: function(tree) {
      var name = tree.name.identifierToken.value;
      var protoName = id(("$__" + name + "__proto"));
      var superName = id(("$__" + name + "__super"));
      var options = this.transformClassElements_(tree, protoName, superName);
      var anonBlock = this.transformClassShared_(tree, options, id(name), protoName, superName);
      return this.makeStrict_(anonBlock);
    },
    transformClassShared_: function(tree, options, name, protoName, superName) {
      var $__135 = options,
          constructorBody = $__135.constructorBody,
          constructorParams = $__135.constructorParams,
          hasConstructor = $__135.hasConstructor,
          hasStaticSuper = $__135.hasStaticSuper,
          hasSuper = $__135.hasSuper,
          object = $__135.object,
          staticObject = $__135.staticObject,
          superClass = $__135.superClass;
      var nameAsBinding = new BindingIdentifier(name.location, name.identifierToken);
      var func = new FunctionDeclaration(tree.location, nameAsBinding, false, constructorParams, constructorBody);
      var statements = [func];
      if (!superClass) {
        statements.push(parseStatement($__121, this.class_, name, object, staticObject));
        return new AnonBlock(null, statements);
      }
      if (tree instanceof ClassExpression) {
        superClass = superName;
      } else if (hasStaticSuper || hasSuper) {
        statements.push(parseStatement($__122, superName, superClass));
        superClass = superName;
      }
      if (hasSuper) {
        statements.push(parseStatement($__123, protoName, this.getProtoParent_, superClass));
        statements.push(parseStatement($__124, this.class_, name, object, staticObject, superClass, protoName));
      } else {
        statements.push(parseStatement($__125, this.class_, name, object, staticObject, superClass));
      }
      return new AnonBlock(null, statements);
    },
    transformClassExpression: function(tree) {
      this.pushTempVarState();
      var name,
          protoName,
          superName;
      if (tree.name) {
        name = tree.name.identifierToken.value;
        protoName = ("$__" + name + "__proto");
        superName = ("$__" + name + "__super");
      } else {
        name = this.getTempIdentifier();
        protoName = (name + "__proto");
        superName = (name + "__super");
      }
      var expression = this.transformClassExpression_(tree, id(name), id(protoName), id(superName));
      this.popTempVarState();
      return createParenExpression(this.makeStrict_(expression));
    },
    transformClassExpression_: function(tree, name, protoName, superName) {
      var options = this.transformClassElements_(tree, protoName, superName);
      var $__135 = options,
          constructorBody = $__135.constructorBody,
          constructorParams = $__135.constructorParams,
          hasConstructor = $__135.hasConstructor,
          hasStaticSuper = $__135.hasStaticSuper,
          hasSuper = $__135.hasSuper,
          object = $__135.object,
          staticObject = $__135.staticObject,
          superClass = $__135.superClass;
      if (!tree.name && !superClass && !hasSuper && !hasStaticSuper) {
        var func = new FunctionExpression(tree.location, tree.name, false, constructorParams, constructorBody);
        return parseExpression($__126, this.class_, func, object, staticObject);
      }
      var anonBlock = this.transformClassShared_(tree, options, name, protoName, superName);
      var block = createBlock($__spread(anonBlock.statements, [parseStatement($__127, name)]));
      if (superClass) {
        return parseExpression($__128, superName, block, superClass);
      }
      return parseExpression($__129, block);
    },
    transformPropertyMethodAssignment_: function(tree, protoName) {
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformSuperInFunctionBody_(tree, tree.functionBody, protoName);
      if (!tree.isStatic && formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
        return tree;
      }
      var isStatic = false;
      return new PropertyMethodAssignment(tree.location, isStatic, tree.isGenerator, tree.name, formalParameterList, functionBody);
    },
    transformGetAccessor_: function(tree, protoName) {
      var body = this.transformSuperInFunctionBody_(tree, tree.body, protoName);
      if (!tree.isStatic && body === tree.body) return tree;
      return new GetAccessor(tree.location, false, tree.name, body);
    },
    transformSetAccessor_: function(tree, protoName) {
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformSuperInFunctionBody_(tree, tree.body, protoName);
      if (!tree.isStatic && body === tree.body) return tree;
      return new SetAccessor(tree.location, false, tree.name, parameter, body);
    },
    transformSuperInFunctionBody_: function(methodTree, tree, protoName) {
      this.pushTempVarState();
      var thisName = this.getTempIdentifier();
      var thisDecl = createVariableStatement(VAR, thisName, createThisExpression());
      var superTransformer = new SuperTransformer(this, this.runtimeInliner_, this.reporter_, protoName, methodTree, thisName);
      var transformedTree = superTransformer.transformFunctionBody(this.transformFunctionBody(tree));
      if (tree != transformedTree) {
        if (methodTree.isStatic) this.state_.hasStaticSuper = true; else this.state_.hasSuper = true;
      }
      this.popTempVarState();
      if (superTransformer.nestedSuper) return createFunctionBody([thisDecl].concat(transformedTree.statements));
      return transformedTree;
    },
    getDefaultConstructor_: function(tree, hasSuper, protoName) {
      var constr = this.getDefaultConstructorFunction_(tree, hasSuper, protoName);
      return parsePropertyDefinition($__130, constr);
    },
    getDefaultConstructorFunction_: function(tree, hasSuper, protoName) {
      if (!hasSuper) return parseExpression($__131);
      return parseExpression($__132, this.getDefaultConstructorBody_(tree, protoName));
    },
    getDefaultConstructorBody_: function(tree, protoName) {
      var superTransformer = new SuperTransformer(this, this.runtimeInliner_, this.reporter_, protoName, null, null);
      var superCall = superTransformer.createSuperCallExpression(createThisExpression(), protoName, 'constructor', id('arguments'));
      return parseStatement($__133, protoName, superCall);
    }
  }, {transformTree: function(identifierGenerator, runtimeInliner, reporter, tree) {
      return new this(identifierGenerator, runtimeInliner, reporter).transformAny(tree);
    }}, $__ClassTransformer__super, $__ClassTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ClassTransformer: {
      get: function() {
        return ClassTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/CollectionTransformer.js", function() {
  "use strict";
  var $__137 = System.get("../src/syntax/PredefinedName.js"),
      ELEMENT_DELETE = $__137.ELEMENT_DELETE,
      ELEMENT_GET = $__137.ELEMENT_GET,
      ELEMENT_HAS = $__137.ELEMENT_HAS,
      ELEMENT_SET = $__137.ELEMENT_SET,
      TRACEUR_RUNTIME = $__137.TRACEUR_RUNTIME;
  var MEMBER_LOOKUP_EXPRESSION = System.get("../src/syntax/trees/ParseTreeType.js").MEMBER_LOOKUP_EXPRESSION;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__137 = System.get("../src/syntax/TokenType.js"),
      DELETE = $__137.DELETE,
      EQUAL = $__137.EQUAL,
      IN = $__137.IN;
  var $__137 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__137.createArgumentList,
      createAssignmentExpression = $__137.createAssignmentExpression,
      createCallCall = $__137.createCallCall,
      createCallExpression = $__137.createCallExpression,
      createCommaExpression = $__137.createCommaExpression,
      createIdentifierExpression = $__137.createIdentifierExpression,
      createMemberExpression = $__137.createMemberExpression,
      createParenExpression = $__137.createParenExpression;
  var expandMemberLookupExpression = System.get("../src/codegeneration/OperatorExpander.js").expandMemberLookupExpression;
  function CollectionTransformer() {
    $__CollectionTransformer__proto !== null && $__superCall(this, $__CollectionTransformer__proto, "constructor", arguments);
  }
  var $__CollectionTransformer__super = TempVarTransformer;
  var $__CollectionTransformer__proto = $__getProtoParent($__CollectionTransformer__super);
  ($__class)(CollectionTransformer, {
    transformBinaryOperator: function(tree) {
      if (tree.operator.type === IN) {
        var name = this.transformAny(tree.left);
        var object = this.transformAny(tree.right);
        return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, ELEMENT_HAS), createArgumentList(object, name));
      }
      if (tree.left.type === MEMBER_LOOKUP_EXPRESSION && tree.operator.isAssignmentOperator()) {
        if (tree.operator.type !== EQUAL) {
          tree = expandMemberLookupExpression(tree, this);
          return this.transformAny(tree);
        }
        var operand = this.transformAny(tree.left.operand);
        var memberExpression = this.transformAny(tree.left.memberExpression);
        var value = this.transformAny(tree.right);
        return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, ELEMENT_SET), createArgumentList(operand, memberExpression, value));
      }
      return $__superCall(this, $__CollectionTransformer__proto, "transformBinaryOperator", [tree]);
    },
    transformCallExpression: function(tree) {
      if (tree.operand.type !== MEMBER_LOOKUP_EXPRESSION) return $__superCall(this, $__CollectionTransformer__proto, "transformCallExpression", [tree]);
      var operand = this.transformAny(tree.operand.operand);
      var memberExpression = this.transformAny(tree.operand.memberExpression);
      var ident = createIdentifierExpression(this.addTempVar());
      var elements = tree.args.args.map(this.transformAny, this);
      var callExpr = createCallCall(createCallExpression(createMemberExpression(TRACEUR_RUNTIME, ELEMENT_GET), createArgumentList(ident, memberExpression)), ident, elements);
      var expressions = [createAssignmentExpression(ident, operand), callExpr];
      return createParenExpression(createCommaExpression(expressions));
    },
    transformMemberLookupExpression: function(tree) {
      return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, ELEMENT_GET), createArgumentList(tree.operand, tree.memberExpression));
    },
    transformUnaryExpression: function(tree) {
      if (tree.operator.type !== DELETE || tree.operand.type !== MEMBER_LOOKUP_EXPRESSION) {
        return $__superCall(this, $__CollectionTransformer__proto, "transformUnaryExpression", [tree]);
      }
      var operand = this.transformAny(tree.operand.operand);
      var memberExpression = this.transformAny(tree.operand.memberExpression);
      return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, ELEMENT_DELETE), createArgumentList(operand, memberExpression));
    }
  }, {transformTree: function(identifierGenerator, tree) {
      return new CollectionTransformer(identifierGenerator).transformAny(tree);
    }}, $__CollectionTransformer__super, $__CollectionTransformer__proto);
  return Object.preventExtensions(Object.create(null, {CollectionTransformer: {
      get: function() {
        return CollectionTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ParameterTransformer.js", function() {
  "use strict";
  var FunctionBody = System.get("../src/syntax/trees/ParseTrees.js").FunctionBody;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var prependStatements = System.get("../src/codegeneration/PrependStatements.js").prependStatements;
  var stack = [];
  function ParameterTransformer() {
    $__ParameterTransformer__proto !== null && $__superCall(this, $__ParameterTransformer__proto, "constructor", arguments);
  }
  var $__ParameterTransformer__super = TempVarTransformer;
  var $__ParameterTransformer__proto = $__getProtoParent($__ParameterTransformer__super);
  ($__class)(ParameterTransformer, {
    transformFunctionDeclaration: function(tree) {
      stack.push([]);
      return $__superCall(this, $__ParameterTransformer__proto, "transformFunctionDeclaration", [tree]);
    },
    transformFunctionExpression: function(tree) {
      stack.push([]);
      return $__superCall(this, $__ParameterTransformer__proto, "transformFunctionExpression", [tree]);
    },
    transformGetAccessor: function(tree) {
      stack.push([]);
      return $__superCall(this, $__ParameterTransformer__proto, "transformGetAccessor", [tree]);
    },
    transformSetAccessor: function(tree) {
      stack.push([]);
      return $__superCall(this, $__ParameterTransformer__proto, "transformSetAccessor", [tree]);
    },
    transformPropertyMethodAssignment: function(tree) {
      stack.push([]);
      return $__superCall(this, $__ParameterTransformer__proto, "transformPropertyMethodAssignment", [tree]);
    },
    transformFunctionBody: function(tree) {
      var transformedTree = $__superCall(this, $__ParameterTransformer__proto, "transformFunctionBody", [tree]);
      var statements = stack.pop();
      if (!statements.length) return transformedTree;
      statements = prependStatements.apply(null, $__spread([transformedTree.statements], statements));
      return new FunctionBody(transformedTree.location, statements);
    },
    get parameterStatements() {
      return stack[stack.length - 1];
    }
  }, {}, $__ParameterTransformer__super, $__ParameterTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ParameterTransformer: {
      get: function() {
        return ParameterTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/DefaultParametersTransformer.js", function() {
  "use strict";
  var $__141 = System.get("../src/semantics/util.js"),
      isUndefined = $__141.isUndefined,
      isVoidExpression = $__141.isVoidExpression;
  var FormalParameterList = System.get("../src/syntax/trees/ParseTrees.js").FormalParameterList;
  var ParameterTransformer = System.get("../src/codegeneration/ParameterTransformer.js").ParameterTransformer;
  var ARGUMENTS = System.get("../src/syntax/PredefinedName.js").ARGUMENTS;
  var REST_PARAMETER = System.get("../src/syntax/trees/ParseTreeType.js").REST_PARAMETER;
  var $__141 = System.get("../src/syntax/TokenType.js"),
      NOT_EQUAL_EQUAL = $__141.NOT_EQUAL_EQUAL,
      VAR = $__141.VAR;
  var $__141 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createBinaryOperator = $__141.createBinaryOperator,
      createConditionalExpression = $__141.createConditionalExpression,
      createIdentifierExpression = $__141.createIdentifierExpression,
      createMemberLookupExpression = $__141.createMemberLookupExpression,
      createNumberLiteral = $__141.createNumberLiteral,
      createOperatorToken = $__141.createOperatorToken,
      createVariableStatement = $__141.createVariableStatement,
      createVoid0 = $__141.createVoid0;
  var prependStatements = System.get("../src/codegeneration/PrependStatements.js").prependStatements;
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
  function DefaultParametersTransformer() {
    $__DefaultParametersTransformer__proto !== null && $__superCall(this, $__DefaultParametersTransformer__proto, "constructor", arguments);
  }
  var $__DefaultParametersTransformer__super = ParameterTransformer;
  var $__DefaultParametersTransformer__proto = $__getProtoParent($__DefaultParametersTransformer__super);
  ($__class)(DefaultParametersTransformer, {transformFormalParameterList: function(tree) {
      var parameters = [];
      var changed = false;
      var defaultToUndefined = false;
      for (var i = 0; i < tree.parameters.length; i++) {
        var param = this.transformAny(tree.parameters[i]);
        if (param !== tree.parameters[i]) changed = true;
        if (param.type === REST_PARAMETER || !param.initializer && !defaultToUndefined) {
          parameters.push(param);
        } else {
          defaultToUndefined = true;
          changed = true;
          this.parameterStatements.push(createDefaultAssignment(i, param.binding, param.initializer));
        }
      }
      if (!changed) return tree;
      return new FormalParameterList(tree.location, parameters);
    }}, {transformTree: function(identifierGenerator, tree) {
      return new DefaultParametersTransformer(identifierGenerator).transformAny(tree);
    }}, $__DefaultParametersTransformer__super, $__DefaultParametersTransformer__proto);
  return Object.preventExtensions(Object.create(null, {DefaultParametersTransformer: {
      get: function() {
        return DefaultParametersTransformer;
      },
      enumerable: true
    }}));
}, this);
var $__superGet = function(self, proto, name) {
  var descriptor = $__superDescriptor(proto, name);
  if (descriptor) {
    if (descriptor.get) return descriptor.get.call(self); else if ('value'in descriptor) return descriptor.value;
  }
  return undefined;
};
System.get('@traceur/module').registerModule("../src/codegeneration/DestructuringTransformer.js", function() {
  "use strict";
  var $__143 = System.get("../src/syntax/PredefinedName.js"),
      ARRAY = $__143.ARRAY,
      CALL = $__143.CALL,
      PROTOTYPE = $__143.PROTOTYPE,
      SLICE = $__143.SLICE;
  var $__143 = System.get("../src/syntax/trees/ParseTreeType.js"),
      ARRAY_LITERAL_EXPRESSION = $__143.ARRAY_LITERAL_EXPRESSION,
      ARRAY_PATTERN = $__143.ARRAY_PATTERN,
      BINDING_ELEMENT = $__143.BINDING_ELEMENT,
      BINDING_IDENTIFIER = $__143.BINDING_IDENTIFIER,
      BLOCK = $__143.BLOCK,
      CALL_EXPRESSION = $__143.CALL_EXPRESSION,
      COMPUTED_PROPERTY_NAME = $__143.COMPUTED_PROPERTY_NAME,
      IDENTIFIER_EXPRESSION = $__143.IDENTIFIER_EXPRESSION,
      LITERAL_EXPRESSION = $__143.LITERAL_EXPRESSION,
      MEMBER_EXPRESSION = $__143.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__143.MEMBER_LOOKUP_EXPRESSION,
      OBJECT_LITERAL_EXPRESSION = $__143.OBJECT_LITERAL_EXPRESSION,
      OBJECT_PATTERN = $__143.OBJECT_PATTERN,
      OBJECT_PATTERN_FIELD = $__143.OBJECT_PATTERN_FIELD,
      PAREN_EXPRESSION = $__143.PAREN_EXPRESSION,
      VARIABLE_DECLARATION_LIST = $__143.VARIABLE_DECLARATION_LIST;
  var $__143 = System.get("../src/syntax/trees/ParseTrees.js"),
      BindingElement = $__143.BindingElement,
      Catch = $__143.Catch,
      ForInStatement = $__143.ForInStatement,
      ForOfStatement = $__143.ForOfStatement,
      LiteralExpression = $__143.LiteralExpression;
  var ParameterTransformer = System.get("../src/codegeneration/ParameterTransformer.js").ParameterTransformer;
  var $__143 = System.get("../src/syntax/TokenType.js"),
      EQUAL = $__143.EQUAL,
      IDENTIFIER = $__143.IDENTIFIER,
      IN = $__143.IN,
      LET = $__143.LET,
      VAR = $__143.VAR;
  var $__143 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__143.createArgumentList,
      createAssignmentExpression = $__143.createAssignmentExpression,
      createBinaryOperator = $__143.createBinaryOperator,
      createBindingIdentifier = $__143.createBindingIdentifier,
      createBlock = $__143.createBlock,
      createCallExpression = $__143.createCallExpression,
      createCommaExpression = $__143.createCommaExpression,
      createConditionalExpression = $__143.createConditionalExpression,
      createExpressionStatement = $__143.createExpressionStatement,
      createIdentifierExpression = $__143.createIdentifierExpression,
      createMemberExpression = $__143.createMemberExpression,
      createMemberLookupExpression = $__143.createMemberLookupExpression,
      createNumberLiteral = $__143.createNumberLiteral,
      createOperatorToken = $__143.createOperatorToken,
      createParenExpression = $__143.createParenExpression,
      createStringLiteral = $__143.createStringLiteral,
      createVariableDeclaration = $__143.createVariableDeclaration,
      createVariableDeclarationList = $__143.createVariableDeclarationList,
      createVariableStatement = $__143.createVariableStatement;
  var options = System.get("../src/options.js").options;
  function Desugaring(rvalue) {
    this.rvalue = rvalue;
  }
  ($__class)(Desugaring, {}, {});
  function AssignmentExpressionDesugaring(rvalue) {
    $__superCall(this, $__AssignmentExpressionDesugaring__proto, "constructor", [rvalue]);
    this.expressions = [];
  }
  var $__AssignmentExpressionDesugaring__super = Desugaring;
  var $__AssignmentExpressionDesugaring__proto = $__getProtoParent($__AssignmentExpressionDesugaring__super);
  ($__class)(AssignmentExpressionDesugaring, {assign: function(lvalue, rvalue) {
      lvalue = lvalue instanceof BindingElement ? lvalue.binding: lvalue;
      this.expressions.push(createAssignmentExpression(lvalue, rvalue));
    }}, {}, $__AssignmentExpressionDesugaring__super, $__AssignmentExpressionDesugaring__proto);
  function VariableDeclarationDesugaring(rvalue) {
    $__superCall(this, $__VariableDeclarationDesugaring__proto, "constructor", [rvalue]);
    this.declarations = [];
  }
  var $__VariableDeclarationDesugaring__super = Desugaring;
  var $__VariableDeclarationDesugaring__proto = $__getProtoParent($__VariableDeclarationDesugaring__super);
  ($__class)(VariableDeclarationDesugaring, {assign: function(lvalue, rvalue) {
      if (lvalue instanceof BindingElement) {
        this.declarations.push(createVariableDeclaration(lvalue.binding, rvalue));
        return;
      }
      if (lvalue.type == IDENTIFIER_EXPRESSION) lvalue = createBindingIdentifier(lvalue);
      this.declarations.push(createVariableDeclaration(lvalue, rvalue));
    }}, {}, $__VariableDeclarationDesugaring__super, $__VariableDeclarationDesugaring__proto);
  function createConditionalMemberExpression(rvalue, name, initializer) {
    if (name.type === COMPUTED_PROPERTY_NAME) {
      return createConditionalMemberLookupExpression(rvalue, name.expression, initializer);
    }
    var token;
    if (name.type == BINDING_IDENTIFIER) {
      token = name.identifierToken;
    } else {
      token = name.literalToken;
      if (!token.isKeyword() && token.type !== IDENTIFIER) {
        return createConditionalMemberLookupExpression(rvalue, new LiteralExpression(null, token), initializer);
      }
    }
    if (!initializer) return createMemberExpression(rvalue, token);
    return createConditionalExpression(createBinaryOperator(createStringLiteral(token.toString()), createOperatorToken(IN), rvalue), createMemberExpression(rvalue, token), initializer);
  }
  function createConditionalMemberLookupExpression(rvalue, index, initializer) {
    if (!initializer) return createMemberLookupExpression(rvalue, index);
    return createConditionalExpression(createBinaryOperator(index, createOperatorToken(IN), rvalue), createMemberLookupExpression(rvalue, index), initializer);
  }
  function DestructuringTransformer() {
    $__DestructuringTransformer__proto !== null && $__superCall(this, $__DestructuringTransformer__proto, "constructor", arguments);
  }
  var $__DestructuringTransformer__super = ParameterTransformer;
  var $__DestructuringTransformer__proto = $__getProtoParent($__DestructuringTransformer__super);
  ($__class)(DestructuringTransformer, {
    transformArrayPattern: function(tree) {
      throw new Error('unreachable');
    },
    transformObjectPattern: function(tree) {
      throw new Error('unreachable');
    },
    transformBinaryOperator: function(tree) {
      if (tree.operator.type == EQUAL && tree.left.isPattern()) {
        return this.transformAny(this.desugarAssignment_(tree.left, tree.right));
      } else {
        return $__superCall(this, $__DestructuringTransformer__proto, "transformBinaryOperator", [tree]);
      }
    },
    desugarAssignment_: function(lvalue, rvalue) {
      var tempIdent = createIdentifierExpression(this.addTempVar());
      var desugaring = new AssignmentExpressionDesugaring(tempIdent);
      this.desugarPattern_(desugaring, lvalue);
      desugaring.expressions.unshift(createAssignmentExpression(tempIdent, rvalue));
      desugaring.expressions.push(tempIdent);
      return createParenExpression(createCommaExpression(desugaring.expressions));
    },
    transformVariableDeclarationList: function(tree) {
      if (!this.destructuringInDeclaration_(tree)) {
        return $__superCall(this, $__DestructuringTransformer__proto, "transformVariableDeclarationList", [tree]);
      }
      this.pushTempVarState();
      var desugaredDeclarations = [];
      tree.declarations.forEach((function(declaration) {
        var $__144;
        if (declaration.lvalue.isPattern()) {
          ($__144 = desugaredDeclarations).push.apply($__144, $__toObject(this.desugarVariableDeclaration_(declaration)));
        } else {
          desugaredDeclarations.push(declaration);
        }
      }).bind(this));
      var transformedTree = this.transformVariableDeclarationList(createVariableDeclarationList(tree.declarationType, desugaredDeclarations));
      this.popTempVarState();
      return transformedTree;
    },
    transformForInStatement: function(tree) {
      return this.transformForInOrOf_(tree, $__superGet(this, $__DestructuringTransformer__proto, "transformForInStatement"), ForInStatement);
    },
    transformForOfStatement: function(tree) {
      return this.transformForInOrOf_(tree, $__superGet(this, $__DestructuringTransformer__proto, "transformForOfStatement"), ForOfStatement);
    },
    transformForInOrOf_: function(tree, superMethod, constr) {
      var $__144;
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
      if (body.type !== BLOCK) body = createBlock(body);
      ($__144 = statements).push.apply($__144, $__toObject(body.statements));
      body = createBlock(statements);
      this.popTempVarState();
      return new constr(tree.location, initializer, collection, body);
    },
    transformBindingElement: function(tree) {
      if (!tree.binding.isPattern() || tree.initializer) return tree;
      var statements = this.parameterStatements;
      var binding = this.desugarBinding_(tree.binding, statements, VAR);
      return new BindingElement(null, binding, null);
    },
    transformCatch: function(tree) {
      var $__144;
      if (!tree.binding.isPattern()) return $__superCall(this, $__DestructuringTransformer__proto, "transformCatch", [tree]);
      var body = this.transformAny(tree.catchBody);
      var statements = [];
      var kind = options.blockBinding ? LET: VAR;
      var binding = this.desugarBinding_(tree.binding, statements, kind);
      ($__144 = statements).push.apply($__144, $__toObject(body.statements));
      return new Catch(tree.location, binding, createBlock(statements));
    },
    desugarBinding_: function(bindingTree, statements, declarationType) {
      var varName = this.getTempIdentifier();
      var binding = createBindingIdentifier(varName);
      var idExpr = createIdentifierExpression(varName);
      var desugaring;
      if (declarationType === null) desugaring = new AssignmentExpressionDesugaring(idExpr); else desugaring = new VariableDeclarationDesugaring(idExpr);
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
          desugaring.assign(desugaring.rvalue, tree.initializer);
          var initializerFound = this.desugarPattern_(desugaring, tree.lvalue);
          if (initializerFound || desugaring.declarations.length > 2) return desugaring.declarations;
          initializer = initializer || createParenExpression(tree.initializer);
          desugaring = new VariableDeclarationDesugaring(initializer);
          this.desugarPattern_(desugaring, tree.lvalue);
          return desugaring.declarations;
      }
    },
    desugarPattern_: function(desugaring, tree) {
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
                desugaring.assign(lvalue.lvalue, createCallExpression(createMemberExpression(ARRAY, PROTOTYPE, SLICE, CALL), createArgumentList(desugaring.rvalue, createNumberLiteral(i))));
              } else {
                if (lvalue.initializer) initializerFound = true;
                desugaring.assign(lvalue, createConditionalMemberLookupExpression(desugaring.rvalue, createNumberLiteral(i), lvalue.initializer));
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
                  if (field.initializer) initializerFound = true;
                  lookup = createConditionalMemberExpression(desugaring.rvalue, field.binding, field.initializer);
                  desugaring.assign(createIdentifierExpression(field.binding), lookup);
                  break;
                case OBJECT_PATTERN_FIELD:
                  if (field.element.initializer) initializerFound = true;
                  var name = field.name;
                  lookup = createConditionalMemberExpression(desugaring.rvalue, name, field.element.initializer);
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
      return initializerFound;
    }
  }, {transformTree: function(identifierGenerator, tree) {
      return new DestructuringTransformer(identifierGenerator).transformAny(tree);
    }}, $__DestructuringTransformer__super, $__DestructuringTransformer__proto);
  return Object.preventExtensions(Object.create(null, {DestructuringTransformer: {
      get: function() {
        return DestructuringTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ForOfTransformer.js", function() {
  "use strict";
  var $__145 = Object.freeze(Object.defineProperties(["", " = ", ".value;"], {raw: {value: Object.freeze(["", " = ", ".value;"])}})),
      $__146 = Object.freeze(Object.defineProperties(["\n        for (var ", " =\n                 ", "(", "),\n                 ", ";\n             !(", " = ", ".next()).done; ) {\n          ", ";\n          ", ";\n        }"], {raw: {value: Object.freeze(["\n        for (var ", " =\n                 ", "(", "),\n                 ", ";\n             !(", " = ", ".next()).done; ) {\n          ", ";\n          ", ";\n        }"])}}));
  var TRACEUR_RUNTIME = System.get("../src/syntax/PredefinedName.js").TRACEUR_RUNTIME;
  var VARIABLE_DECLARATION_LIST = System.get("../src/syntax/trees/ParseTreeType.js").VARIABLE_DECLARATION_LIST;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__148 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      id = $__148.createIdentifierExpression,
      createMemberExpression = $__148.createMemberExpression,
      createVariableStatement = $__148.createVariableStatement;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  var transformOptions = System.get("../src/options.js").transformOptions;
  var GET_ITERATOR_CODE = "function(object) {\n  return object[%iterator]();\n}";
  var GET_ITERATOR_RUNTIME_CODE = ("function(object) {\n  return " + TRACEUR_RUNTIME + ".getIterator(object);\n}");
  function ForOfTransformer(identifierGenerator, runtimeInliner) {
    $__superCall(this, $__ForOfTransformer__proto, "constructor", [identifierGenerator]);
    this.runtimeInliner_ = runtimeInliner;
  }
  var $__ForOfTransformer__super = TempVarTransformer;
  var $__ForOfTransformer__proto = $__getProtoParent($__ForOfTransformer__super);
  ($__class)(ForOfTransformer, {
    transformForOfStatement: function(original) {
      var tree = $__superCall(this, $__ForOfTransformer__proto, "transformForOfStatement", [original]);
      var iter = id(this.getTempIdentifier());
      var result = id(this.getTempIdentifier());
      var assignment;
      if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
        assignment = createVariableStatement(tree.initializer.declarationType, tree.initializer.declarations[0].lvalue, createMemberExpression(result, 'value'));
      } else {
        assignment = parseStatement($__145, tree.initializer, result);
      }
      return parseStatement($__146, iter, this.getIterator_, tree.collection, result, result, iter, assignment, tree.body);
    },
    get getIterator_() {
      if (transformOptions.privateNames) {
        return this.runtimeInliner_.get('getIterator', GET_ITERATOR_RUNTIME_CODE);
      } else {
        return this.runtimeInliner_.get('getIterator', GET_ITERATOR_CODE);
      }
    }
  }, {transformTree: function(identifierGenerator, runtimeInliner, tree) {
      return new ForOfTransformer(identifierGenerator, runtimeInliner).transformAny(tree);
    }}, $__ForOfTransformer__super, $__ForOfTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ForOfTransformer: {
      get: function() {
        return ForOfTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/GeneratorComprehensionTransformer.js", function() {
  "use strict";
  var ComprehensionTransformer = System.get("../src/codegeneration/ComprehensionTransformer.js").ComprehensionTransformer;
  var createYieldStatement = System.get("../src/codegeneration/ParseTreeFactory.js").createYieldStatement;
  function GeneratorComprehensionTransformer() {
    $__GeneratorComprehensionTransformer__proto !== null && $__superCall(this, $__GeneratorComprehensionTransformer__proto, "constructor", arguments);
  }
  var $__GeneratorComprehensionTransformer__super = ComprehensionTransformer;
  var $__GeneratorComprehensionTransformer__proto = $__getProtoParent($__GeneratorComprehensionTransformer__super);
  ($__class)(GeneratorComprehensionTransformer, {transformGeneratorComprehension: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statement = createYieldStatement(expression);
      var isGenerator = true;
      return this.transformComprehension(tree, statement, isGenerator);
    }}, {}, $__GeneratorComprehensionTransformer__super, $__GeneratorComprehensionTransformer__proto);
  GeneratorComprehensionTransformer.transformTree = function(identifierGenerator, tree) {
    return new GeneratorComprehensionTransformer(identifierGenerator).transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {GeneratorComprehensionTransformer: {
      get: function() {
        return GeneratorComprehensionTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/State.js", function() {
  "use strict";
  var FINALLY_FALL_THROUGH = System.get("../src/syntax/PredefinedName.js").FINALLY_FALL_THROUGH;
  var $__152 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignStateStatement = $__152.createAssignStateStatement,
      createAssignmentStatement = $__152.createAssignmentStatement,
      createBreakStatement = $__152.createBreakStatement,
      createCaseClause = $__152.createCaseClause,
      createIdentifierExpression = $__152.createIdentifierExpression,
      createNumberLiteral = $__152.createNumberLiteral,
      createStatementList = $__152.createStatementList;
  function State(id) {
    this.id = id;
  }
  ($__class)(State, {
    transformMachineState: function(enclosingFinally, machineEndState, reporter) {
      return createCaseClause(createNumberLiteral(this.id), this.transform(enclosingFinally, machineEndState, reporter));
    },
    transformBreak: function(labelSet, breakState) {
      return this;
    },
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      return this;
    }
  }, {});
  ;
  State.INVALID_STATE = - 1;
  State.END_STATE = - 2;
  State.RETHROW_STATE = - 3;
  State.generateJump = function(enclosingFinally, fallThroughState) {
    return createStatementList(State.generateAssignState(enclosingFinally, fallThroughState), createBreakStatement());
  };
  State.generateJumpThroughFinally = function(finallyState, destination) {
    return createStatementList(State.generateAssignStateOutOfFinally_(destination, finallyState), createBreakStatement());
  };
  State.generateAssignState = function(enclosingFinally, fallThroughState) {
    var assignState;
    if (isFinallyExit(enclosingFinally, fallThroughState)) {
      assignState = State.generateAssignStateOutOfFinally(enclosingFinally, fallThroughState);
    } else {
      assignState = createStatementList(createAssignStateStatement(fallThroughState));
    }
    return assignState;
  };
  function isFinallyExit(enclosingFinally, destination) {
    return enclosingFinally != null && enclosingFinally.tryStates.indexOf(destination) < 0;
  }
  State.generateAssignStateOutOfFinally = function(enclosingFinally, destination) {
    return State.generateAssignStateOutOfFinally_(destination, enclosingFinally.finallyState);
  };
  State.generateAssignStateOutOfFinally_ = function(destination, finallyState) {
    return createStatementList(createAssignStateStatement(finallyState), createAssignmentStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), createNumberLiteral(destination)));
  };
  State.replaceStateList = function(oldStates, oldState, newState) {
    var states = [];
    for (var i = 0; i < oldStates.length; i++) {
      states.push(State.replaceStateId(oldStates[i], oldState, newState));
    }
    return states;
  };
  State.replaceStateId = function(current, oldState, newState) {
    return current == oldState ? newState: current;
  };
  State.replaceAllStates = function(exceptionBlocks, oldState, newState) {
    var result = [];
    for (var i = 0; i < exceptionBlocks.length; i++) {
      result.push(exceptionBlocks[i].replaceState(oldState, newState));
    }
    return result;
  };
  return Object.preventExtensions(Object.create(null, {State: {
      get: function() {
        return State;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/TryState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var Kind = {
    CATCH: 'catch',
    FINALLY: 'finally'
  };
  function TryState(kind, tryStates, nestedTrys) {
    this.kind = kind;
    this.tryStates = tryStates;
    this.nestedTrys = nestedTrys;
  }
  ($__class)(TryState, {
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
  return Object.preventExtensions(Object.create(null, {TryState: {
      get: function() {
        return TryState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/syntax/trees/StateMachine.js", function() {
  "use strict";
  var ParseTree = System.get("../src/syntax/trees/ParseTree.js").ParseTree;
  var STATE_MACHINE = System.get("../src/syntax/trees/ParseTreeType.js").STATE_MACHINE;
  var TryState = System.get("../src/codegeneration/generator/TryState.js").TryState;
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
  function StateMachine(startState, fallThroughState, states, exceptionBlocks) {
    this.location = null;
    this.startState = startState;
    this.fallThroughState = fallThroughState;
    this.states = states;
    this.exceptionBlocks = exceptionBlocks;
  }
  ($__class)(StateMachine, {
    get type() {
      return STATE_MACHINE;
    },
    transform: function(transformer) {
      return transformer.transformStateMachine(this);
    },
    visit: function(visitor) {
      visitor.visitStateMachine(this);
    },
    hasExceptionBlocks: function() {
      return this.exceptionBlocks.length > 0;
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
    getEnclosingCatchMap: function() {
      var enclosingMap = Object.create(null);
      addCatchOrFinallyStates(TryState.Kind.CATCH, enclosingMap, this.exceptionBlocks);
      return enclosingMap;
    },
    allCatchStates: function() {
      var catches = [];
      addAllCatchStates(this.exceptionBlocks, catches);
      return catches;
    }
  }, {}, ParseTree);
  return Object.preventExtensions(Object.create(null, {StateMachine: {
      get: function() {
        return StateMachine;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/FallThroughState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  function FallThroughState(id, fallThroughState, statements) {
    $__superCall(this, $__FallThroughState__proto, "constructor", [id]);
    this.fallThroughState = fallThroughState;
    this.statements = statements;
  }
  var $__FallThroughState__super = State;
  var $__FallThroughState__proto = $__getProtoParent($__FallThroughState__super);
  ($__class)(FallThroughState, {
    replaceState: function(oldState, newState) {
      return new FallThroughState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.statements);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return $__spread(this.statements, State.generateJump(enclosingFinally, this.fallThroughState));
    }
  }, {}, $__FallThroughState__super, $__FallThroughState__proto);
  return Object.preventExtensions(Object.create(null, {FallThroughState: {
      get: function() {
        return FallThroughState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/BreakState.js", function() {
  "use strict";
  var FallThroughState = System.get("../src/codegeneration/generator/FallThroughState.js").FallThroughState;
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var createStatementList = System.get("../src/codegeneration/ParseTreeFactory.js").createStatementList;
  function BreakState(id, label) {
    $__superCall(this, $__BreakState__proto, "constructor", [id]);
    this.label = label;
  }
  var $__BreakState__super = State;
  var $__BreakState__proto = $__getProtoParent($__BreakState__super);
  ($__class)(BreakState, {
    replaceState: function(oldState, newState) {
      return new BreakState(State.replaceStateId(this.id, oldState, newState), this.label);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },
    transformBreak: function(labelSet, breakState) {
      if (this.label == null || this.label in labelSet) {
        return new FallThroughState(this.id, breakState, createStatementList());
      }
      return this;
    },
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      return this.transformBreak(labelSet, breakState);
    }
  }, {}, $__BreakState__super, $__BreakState__proto);
  return Object.preventExtensions(Object.create(null, {BreakState: {
      get: function() {
        return BreakState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/ContinueState.js", function() {
  "use strict";
  var FallThroughState = System.get("../src/codegeneration/generator/FallThroughState.js").FallThroughState;
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var createStatementList = System.get("../src/codegeneration/ParseTreeFactory.js").createStatementList;
  function ContinueState(id, label) {
    $__superCall(this, $__ContinueState__proto, "constructor", [id]);
    this.label = label;
  }
  var $__ContinueState__super = State;
  var $__ContinueState__proto = $__getProtoParent($__ContinueState__super);
  ($__class)(ContinueState, {
    replaceState: function(oldState, newState) {
      return new ContinueState(State.replaceStateId(this.id, oldState, newState), this.label);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      if (this.label == null || this.label in labelSet) {
        return new FallThroughState(this.id, continueState, createStatementList());
      }
      return this;
    }
  }, {}, $__ContinueState__super, $__ContinueState__proto);
  return Object.preventExtensions(Object.create(null, {ContinueState: {
      get: function() {
        return ContinueState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/BreakContinueTransformer.js", function() {
  "use strict";
  var BreakState = System.get("../src/codegeneration/generator/BreakState.js").BreakState;
  var ContinueState = System.get("../src/codegeneration/generator/ContinueState.js").ContinueState;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var StateMachine = System.get("../src/syntax/trees/StateMachine.js").StateMachine;
  function safeGetLabel(tree) {
    return tree.name ? tree.name.value: null;
  }
  function BreakContinueTransformer(stateAllocator) {
    $__superCall(this, $__BreakContinueTransformer__proto, "constructor", []);
    this.transformBreaks_ = true;
    this.stateAllocator_ = stateAllocator;
  }
  var $__BreakContinueTransformer__super = ParseTreeTransformer;
  var $__BreakContinueTransformer__proto = $__getProtoParent($__BreakContinueTransformer__super);
  ($__class)(BreakContinueTransformer, {
    allocateState_: function() {
      return this.stateAllocator_.allocateState();
    },
    stateToStateMachine_: function(newState) {
      var fallThroughState = this.allocateState_();
      return new StateMachine(newState.id, fallThroughState, [newState], []);
    },
    transformBreakStatement: function(tree) {
      return this.transformBreaks_ || tree.name ? this.stateToStateMachine_(new BreakState(this.allocateState_(), safeGetLabel(tree))): tree;
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
      var result = $__superCall(this, $__BreakContinueTransformer__proto, "transformSwitchStatement", [tree]);
      this.transformBreaks_ = oldState;
      return result;
    },
    transformWhileStatement: function(tree) {
      return tree;
    }
  }, {}, $__BreakContinueTransformer__super, $__BreakContinueTransformer__proto);
  return Object.preventExtensions(Object.create(null, {BreakContinueTransformer: {
      get: function() {
        return BreakContinueTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/CatchState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var TryState = System.get("../src/codegeneration/generator/TryState.js").TryState;
  function CatchState(identifier, catchState, fallThroughState, allStates, nestedTrys) {
    $__superCall(this, $__CatchState__proto, "constructor", [TryState.Kind.CATCH, allStates, nestedTrys]);
    this.identifier = identifier;
    this.catchState = catchState;
    this.fallThroughState = fallThroughState;
  }
  var $__CatchState__super = TryState;
  var $__CatchState__proto = $__getProtoParent($__CatchState__super);
  ($__class)(CatchState, {replaceState: function(oldState, newState) {
      return new CatchState(this.identifier, State.replaceStateId(this.catchState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
    }}, {}, $__CatchState__super, $__CatchState__proto);
  return Object.preventExtensions(Object.create(null, {CatchState: {
      get: function() {
        return CatchState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/ConditionalState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var $__168 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createBlock = $__168.createBlock,
      createIfStatement = $__168.createIfStatement;
  function ConditionalState(id, ifState, elseState, condition) {
    $__superCall(this, $__ConditionalState__proto, "constructor", [id]);
    this.ifState = ifState;
    this.elseState = elseState;
    this.condition = condition;
  }
  var $__ConditionalState__super = State;
  var $__ConditionalState__proto = $__getProtoParent($__ConditionalState__super);
  ($__class)(ConditionalState, {
    replaceState: function(oldState, newState) {
      return new ConditionalState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.ifState, oldState, newState), State.replaceStateId(this.elseState, oldState, newState), this.condition);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return [createIfStatement(this.condition, createBlock(State.generateJump(enclosingFinally, this.ifState)), createBlock(State.generateJump(enclosingFinally, this.elseState)))];
    }
  }, {}, $__ConditionalState__super, $__ConditionalState__proto);
  return Object.preventExtensions(Object.create(null, {ConditionalState: {
      get: function() {
        return ConditionalState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/FinallyFallThroughState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  function FinallyFallThroughState() {
    $__FinallyFallThroughState__proto !== null && $__superCall(this, $__FinallyFallThroughState__proto, "constructor", arguments);
  }
  var $__FinallyFallThroughState__super = State;
  var $__FinallyFallThroughState__proto = $__getProtoParent($__FinallyFallThroughState__super);
  ($__class)(FinallyFallThroughState, {
    replaceState: function(oldState, newState) {
      return new FinallyFallThroughState(State.replaceStateId(this.id, oldState, newState));
    },
    transformMachineState: function(enclosingFinally, machineEndState, reporter) {
      return null;
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('these are generated in addFinallyFallThroughDispatches');
    }
  }, {}, $__FinallyFallThroughState__super, $__FinallyFallThroughState__proto);
  return Object.preventExtensions(Object.create(null, {FinallyFallThroughState: {
      get: function() {
        return FinallyFallThroughState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/FinallyState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var TryState = System.get("../src/codegeneration/generator/TryState.js").TryState;
  function FinallyState(finallyState, fallThroughState, allStates, nestedTrys) {
    $__superCall(this, $__FinallyState__proto, "constructor", [TryState.Kind.FINALLY, allStates, nestedTrys]);
    this.finallyState = finallyState;
    this.fallThroughState = fallThroughState;
  }
  var $__FinallyState__super = TryState;
  var $__FinallyState__proto = $__getProtoParent($__FinallyState__super);
  ($__class)(FinallyState, {replaceState: function(oldState, newState) {
      return new FinallyState(State.replaceStateId(this.finallyState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
    }}, {}, $__FinallyState__super, $__FinallyState__proto);
  return Object.preventExtensions(Object.create(null, {FinallyState: {
      get: function() {
        return FinallyState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/StateAllocator.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  function StateAllocator() {
    this.nextState_ = State.INVALID_STATE + 1;
  }
  ($__class)(StateAllocator, {allocateState: function() {
      return this.nextState_++;
    }}, {});
  return Object.preventExtensions(Object.create(null, {StateAllocator: {
      get: function() {
        return StateAllocator;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/SwitchState.js", function() {
  "use strict";
  var $__176 = System.get("../src/syntax/trees/ParseTrees.js"),
      CaseClause = $__176.CaseClause,
      DefaultClause = $__176.DefaultClause,
      SwitchStatement = $__176.SwitchStatement;
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var $__176 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createBreakStatement = $__176.createBreakStatement,
      createStatementList = $__176.createStatementList;
  function SwitchClause(first, second) {
    this.first = first;
    this.second = second;
  }
  ($__class)(SwitchClause, {}, {});
  function SwitchState(id, expression, clauses) {
    $__superCall(this, $__SwitchState__proto, "constructor", [id]);
    this.expression = expression;
    this.clauses = clauses;
  }
  var $__SwitchState__super = State;
  var $__SwitchState__proto = $__getProtoParent($__SwitchState__super);
  ($__class)(SwitchState, {
    replaceState: function(oldState, newState) {
      var clauses = this.clauses.map((function(clause) {
        return new SwitchClause(clause.first, State.replaceStateId(clause.second, oldState, newState));
      }));
      return new SwitchState(State.replaceStateId(this.id, oldState, newState), this.expression, clauses);
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
  }, {}, $__SwitchState__super, $__SwitchState__proto);
  return Object.preventExtensions(Object.create(null, {
    SwitchClause: {
      get: function() {
        return SwitchClause;
      },
      enumerable: true
    },
    SwitchState: {
      get: function() {
        return SwitchState;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/CPSTransformer.js", function() {
  "use strict";
  var $__177 = Object.freeze(Object.defineProperties(["\n        return this.innerFunction($yieldSent, $yieldAction);"], {raw: {value: Object.freeze(["\n        return this.innerFunction($yieldSent, $yieldAction);"])}}));
  var BreakContinueTransformer = System.get("../src/codegeneration/generator/BreakContinueTransformer.js").BreakContinueTransformer;
  var $__179 = System.get("../src/syntax/trees/ParseTreeType.js"),
      CASE_CLAUSE = $__179.CASE_CLAUSE,
      STATE_MACHINE = $__179.STATE_MACHINE,
      VARIABLE_DECLARATION_LIST = $__179.VARIABLE_DECLARATION_LIST,
      VARIABLE_STATEMENT = $__179.VARIABLE_STATEMENT;
  var $__179 = System.get("../src/syntax/trees/ParseTrees.js"),
      CaseClause = $__179.CaseClause,
      IdentifierExpression = $__179.IdentifierExpression,
      SwitchStatement = $__179.SwitchStatement;
  var CatchState = System.get("../src/codegeneration/generator/CatchState.js").CatchState;
  var ConditionalState = System.get("../src/codegeneration/generator/ConditionalState.js").ConditionalState;
  var FallThroughState = System.get("../src/codegeneration/generator/FallThroughState.js").FallThroughState;
  var FinallyFallThroughState = System.get("../src/codegeneration/generator/FinallyFallThroughState.js").FinallyFallThroughState;
  var FinallyState = System.get("../src/codegeneration/generator/FinallyState.js").FinallyState;
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var assert = System.get("../src/util/assert.js").assert;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  var $__179 = System.get("../src/syntax/PredefinedName.js"),
      $ARGUMENTS = $__179.$ARGUMENTS,
      $THAT = $__179.$THAT,
      ARGUMENTS = $__179.ARGUMENTS,
      CAUGHT_EXCEPTION = $__179.CAUGHT_EXCEPTION,
      FINALLY_FALL_THROUGH = $__179.FINALLY_FALL_THROUGH,
      STATE = $__179.STATE,
      STORED_EXCEPTION = $__179.STORED_EXCEPTION,
      YIELD_ACTION = $__179.YIELD_ACTION,
      YIELD_SENT = $__179.YIELD_SENT;
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var StateAllocator = System.get("../src/codegeneration/generator/StateAllocator.js").StateAllocator;
  var StateMachine = System.get("../src/syntax/trees/StateMachine.js").StateMachine;
  var $__179 = System.get("../src/codegeneration/generator/SwitchState.js"),
      SwitchClause = $__179.SwitchClause,
      SwitchState = $__179.SwitchState;
  var $__179 = System.get("../src/syntax/TokenType.js"),
      PLUS = $__179.PLUS,
      VAR = $__179.VAR;
  var TryState = System.get("../src/codegeneration/generator/TryState.js").TryState;
  var $__179 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignStateStatement = $__179.createAssignStateStatement,
      createAssignmentExpression = $__179.createAssignmentExpression,
      createAssignmentStatement = $__179.createAssignmentStatement,
      createBinaryOperator = $__179.createBinaryOperator,
      createBindingIdentifier = $__179.createBindingIdentifier,
      createBlock = $__179.createBlock,
      createBreakStatement = $__179.createBreakStatement,
      createCaseClause = $__179.createCaseClause,
      createCatch = $__179.createCatch,
      createCommaExpression = $__179.createCommaExpression,
      createDefaultClause = $__179.createDefaultClause,
      createEmptyStatement = $__179.createEmptyStatement,
      createFunctionBody = $__179.createFunctionBody,
      createExpressionStatement = $__179.createExpressionStatement,
      createFunctionExpression = $__179.createFunctionExpression,
      createIdentifierExpression = $__179.createIdentifierExpression,
      createNumberLiteral = $__179.createNumberLiteral,
      createOperatorToken = $__179.createOperatorToken,
      createParameterList = $__179.createParameterList,
      createStatementList = $__179.createStatementList,
      createStringLiteral = $__179.createStringLiteral,
      createSwitchStatement = $__179.createSwitchStatement,
      createThisExpression = $__179.createThisExpression,
      createThrowStatement = $__179.createThrowStatement,
      createTrueLiteral = $__179.createTrueLiteral,
      createTryStatement = $__179.createTryStatement,
      createVariableStatement = $__179.createVariableStatement,
      createWhileStatement = $__179.createWhileStatement;
  var variablesInBlock = System.get("../src/semantics/VariableBinder.js").variablesInBlock;
  function CPSTransformer(reporter) {
    $__superCall(this, $__CPSTransformer__proto, "constructor", []);
    this.reporter = reporter;
    this.stateAllocator_ = new StateAllocator();
    this.labelSet_ = Object.create(null);
  }
  var $__CPSTransformer__super = ParseTreeTransformer;
  var $__CPSTransformer__proto = $__getProtoParent($__CPSTransformer__super);
  ($__class)(CPSTransformer, {
    allocateState: function() {
      return this.stateAllocator_.allocateState();
    },
    transformBlock: function(tree) {
      this.clearLabels_();
      var transformedTree = $__superCall(this, $__CPSTransformer__proto, "transformBlock", [tree]);
      var machine = this.transformStatementList_(transformedTree.statements);
      return machine == null ? transformedTree: machine;
    },
    transformFunctionBody: function(tree) {
      this.clearLabels_();
      var transformedTree = $__superCall(this, $__CPSTransformer__proto, "transformFunctionBody", [tree]);
      var machine = this.transformStatementList_(transformedTree.statements);
      return machine == null ? transformedTree: machine;
    },
    transformStatementList_: function(someTransformed) {
      if (!this.containsStateMachine_(someTransformed)) {
        return null;
      }
      var currentMachine = this.ensureTransformed_(someTransformed[0]);
      for (var index = 1; index < someTransformed.length; index++) {
        currentMachine = this.createSequence_(currentMachine, this.ensureTransformed_(someTransformed[index]));
      }
      return currentMachine;
    },
    containsStateMachine_: function(statements) {
      if (statements instanceof Array) {
        for (var i = 0; i < statements.length; i++) {
          if (statements[i].type == STATE_MACHINE) {
            return true;
          }
        }
        return false;
      }
      assert(statements instanceof SwitchStatement);
      for (var i = 0; i < statements.caseClauses.length; i++) {
        var clause = statements.caseClauses[i];
        if (clause.type == CASE_CLAUSE) {
          if (this.containsStateMachine_(clause.statements)) {
            return true;
          }
        } else {
          if (this.containsStateMachine_(clause.statements)) {
            return true;
          }
        }
      }
      return false;
    },
    transformCaseClause: function(tree) {
      var result = $__superCall(this, $__CPSTransformer__proto, "transformCaseClause", [tree]);
      var machine = this.transformStatementList_(result.statements);
      return machine == null ? result: new CaseClause(null, result.expression, createStatementList(machine));
    },
    transformDoWhileStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $__superCall(this, $__CPSTransformer__proto, "transformDoWhileStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      var loopBodyMachine = result.body;
      var startState = loopBodyMachine.startState;
      var conditionState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();
      var states = [];
      this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState, labels, states);
      states.push(new ConditionalState(conditionState, startState, fallThroughState, result.condition));
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
    },
    addLoopBodyStates_: function(loopBodyMachine, continueState, breakState, labels, states) {
      for (var i = 0; i < loopBodyMachine.states.length; i++) {
        var state = loopBodyMachine.states[i];
        states.push(state.transformBreakOrContinue(labels, breakState, continueState));
      }
    },
    transformForStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $__superCall(this, $__CPSTransformer__proto, "transformForStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      var loopBodyMachine = result.body;
      var incrementState = loopBodyMachine.fallThroughState;
      var conditionState = result.increment == null && result.condition != null ? incrementState: this.allocateState();
      var startState = result.initializer == null ? (result.condition == null ? loopBodyMachine.startState: conditionState): this.allocateState();
      var fallThroughState = this.allocateState();
      var states = [];
      if (result.initializer != null) {
        states.push(new FallThroughState(startState, conditionState, createStatementList(createExpressionStatement(result.initializer))));
      }
      if (result.condition != null) {
        states.push(new ConditionalState(conditionState, loopBodyMachine.startState, fallThroughState, result.condition));
      } else {
        states.push(new FallThroughState(conditionState, loopBodyMachine.startState, createStatementList()));
      }
      if (result.increment != null) {
        states.push(new FallThroughState(incrementState, conditionState, createStatementList(createExpressionStatement(result.increment))));
      }
      this.addLoopBodyStates_(loopBodyMachine, incrementState, fallThroughState, labels, states);
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
    },
    transformForInStatement: function(tree) {
      return tree;
    },
    transformForOfStatement: function(tree) {
      throw new Error('for of statements should be transformed before this pass');
    },
    transformIfStatement: function(tree) {
      var $__180;
      this.clearLabels_();
      var result = $__superCall(this, $__CPSTransformer__proto, "transformIfStatement", [tree]);
      if (result.ifClause.type != STATE_MACHINE && (result.elseClause == null || result.elseClause.type != STATE_MACHINE)) {
        return result;
      }
      var ifClause = this.ensureTransformed_(result.ifClause);
      var elseClause = this.ensureTransformed_(result.elseClause);
      var startState = this.allocateState();
      var fallThroughState = ifClause.fallThroughState;
      var ifState = ifClause.startState;
      var elseState = elseClause == null ? fallThroughState: elseClause.startState;
      var states = [];
      var exceptionBlocks = [];
      states.push(new ConditionalState(startState, ifState, elseState, result.condition));
      ($__180 = states).push.apply($__180, $__toObject(ifClause.states));
      ($__180 = exceptionBlocks).push.apply($__180, $__toObject(ifClause.exceptionBlocks));
      if (elseClause != null) {
        this.replaceAndAddStates_(elseClause.states, elseClause.fallThroughState, fallThroughState, states);
        ($__180 = exceptionBlocks).push.apply($__180, $__toObject(State.replaceAllStates(elseClause.exceptionBlocks, elseClause.fallThroughState, fallThroughState)));
      }
      return new StateMachine(startState, fallThroughState, states, exceptionBlocks);
    },
    removeEmptyStates: function(oldStates) {
      var emptyStates = [],
          newStates = [];
      for (var i = 0; i < oldStates.length; i++) {
        if (oldStates[i]instanceof FallThroughState && oldStates[i].statements.length === 0) {
          emptyStates.push(oldStates[i]);
        } else {
          newStates.push(oldStates[i]);
        }
      }
      for (i = 0; i < newStates.length; i++) {
        newStates[i] = emptyStates.reduce((function(state, $__179) {
          var id = $__179.id,
              fallThroughState = $__179.fallThroughState;
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
      var oldLabels = this.addLabel_(tree.name.value);
      var result = this.transformAny(tree.statement);
      this.restoreLabels_(oldLabels);
      return result;
    },
    clearLabels_: function() {
      var result = this.labelSet_;
      this.labelSet_ = Object.create(null);
      return result;
    },
    restoreLabels_: function(oldLabels) {
      this.labelSet_ = oldLabels;
    },
    addLabel_: function(label) {
      var oldLabels = this.labelSet_;
      var labelSet = Object.create(null);
      for (var k in this.labelSet_) {
        labelSet[k] = k;
      }
      labelSet[label] = label;
      this.labelSet_ = labelSet;
      return oldLabels;
    },
    transformSwitchStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $__superCall(this, $__CPSTransformer__proto, "transformSwitchStatement", [tree]);
      if (!this.containsStateMachine_(result)) {
        return result;
      }
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      var nextState = fallThroughState;
      var states = [];
      var clauses = [];
      var tryStates = [];
      var hasDefault = false;
      for (var index = result.caseClauses.length - 1; index >= 0; index--) {
        var clause = result.caseClauses[index];
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
      states.push(new SwitchState(startState, result.expression, clauses.reverse()));
      return new StateMachine(startState, fallThroughState, states.reverse(), tryStates);
    },
    addSwitchClauseStates_: function(nextState, fallThroughState, labels, statements, states, tryStates) {
      var $__180;
      var machine = this.ensureTransformedList_(statements);
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var transformedState = state.transformBreak(labels, fallThroughState);
        states.push(transformedState.replaceState(machine.fallThroughState, nextState));
      }
      ($__180 = tryStates).push.apply($__180, $__toObject(machine.exceptionBlocks));
      return machine.startState;
    },
    transformTryStatement: function(tree) {
      this.clearLabels_();
      var result = $__superCall(this, $__CPSTransformer__proto, "transformTryStatement", [tree]);
      if (result.body.type != STATE_MACHINE && (result.catchBlock == null || result.catchBlock.catchBody.type != STATE_MACHINE)) {
        return result;
      }
      var tryMachine = this.ensureTransformed_(result.body);
      if (result.catchBlock != null) {
        var catchBlock = result.catchBlock;
        var exceptionName = catchBlock.binding.identifierToken.value;
        var catchMachine = this.ensureTransformed_(catchBlock.catchBody);
        var startState = tryMachine.startState;
        var fallThroughState = tryMachine.fallThroughState;
        var catchStart = this.allocateState();
        var states = $__spread(tryMachine.states);
        states.push(new FallThroughState(catchStart, catchMachine.startState, createStatementList(createAssignmentStatement(createIdentifierExpression(exceptionName), createIdentifierExpression(STORED_EXCEPTION)))));
        this.replaceAndAddStates_(catchMachine.states, catchMachine.fallThroughState, fallThroughState, states);
        tryMachine = new StateMachine(startState, fallThroughState, states, [new CatchState(exceptionName, catchStart, fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]);
      }
      if (result.finallyBlock != null) {
        var finallyBlock = result.finallyBlock;
        var finallyMachine = this.ensureTransformed_(finallyBlock.block);
        var startState = tryMachine.startState;
        var fallThroughState = tryMachine.fallThroughState;
        var states = $__spread(tryMachine.states, finallyMachine.states, [new FinallyFallThroughState(finallyMachine.fallThroughState)]);
        tryMachine = new StateMachine(startState, fallThroughState, states, [new FinallyState(finallyMachine.startState, finallyMachine.fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]);
      }
      return tryMachine;
    },
    transformVariableStatement: function(tree) {
      var declarations = this.transformVariableDeclarationList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      if (declarations == null) {
        return createEmptyStatement();
      }
      if (declarations.type == VARIABLE_DECLARATION_LIST) {
        return createVariableStatement(declarations);
      }
      return createExpressionStatement(declarations);
    },
    transformVariableDeclarationList: function(tree) {
      if (tree.declarationType == VAR) {
        var expressions = [];
        for (var i = 0; i < tree.declarations.length; i++) {
          var declaration = tree.declarations[i];
          if (declaration.initializer != null) {
            expressions.push(createAssignmentExpression(createIdentifierExpression(this.transformAny(declaration.lvalue)), this.transformAny(declaration.initializer)));
          }
        }
        var list = expressions;
        if (list.length == 0) {
          return null;
        } else if (list.length == 1) {
          return list[0];
        } else {
          return createCommaExpression(expressions);
        }
      }
      return $__superCall(this, $__CPSTransformer__proto, "transformVariableDeclarationList", [tree]);
    },
    transformWhileStatement: function(tree) {
      var labels = this.clearLabels_();
      var result = $__superCall(this, $__CPSTransformer__proto, "transformWhileStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      var loopBodyMachine = result.body;
      var startState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();
      var states = [];
      states.push(new ConditionalState(startState, loopBodyMachine.startState, fallThroughState, result.condition));
      this.addLoopBodyStates_(loopBodyMachine, startState, fallThroughState, labels, states);
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks);
    },
    transformWithStatement: function(tree) {
      var result = $__superCall(this, $__CPSTransformer__proto, "transformWithStatement", [tree]);
      if (result.body.type != STATE_MACHINE) {
        return result;
      }
      throw new Error('Unreachable - with statement not allowed in strict mode/harmony');
    },
    transformThisExpression: function(tree) {
      return new IdentifierExpression(tree.location, new IdentifierToken(tree.location, $THAT));
    },
    transformIdentifierExpression: function(tree) {
      if (tree.identifierToken.value === ARGUMENTS) {
        return new IdentifierExpression(tree.location, new IdentifierToken(tree.location, $ARGUMENTS));
      }
      return tree;
    },
    generateMachineMethod: function(machine) {
      return createFunctionExpression(createParameterList(YIELD_SENT, YIELD_ACTION), createFunctionBody([createWhileStatement(createTrueLiteral(), this.generateMachine(machine))]));
    },
    generateHoistedThis: function() {
      return createVariableStatement(VAR, $THAT, createThisExpression());
    },
    generateHoistedArguments: function() {
      return createVariableStatement(VAR, $ARGUMENTS, createIdentifierExpression(ARGUMENTS));
    },
    generateMachineInnerFunction: function(machine) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var enclosingCatchState = machine.getEnclosingCatchMap();
      var rethrowState = this.allocateState();
      var machineEndState = this.allocateState();
      var body = createWhileStatement(createTrueLiteral(), createSwitchStatement(createIdentifierExpression(STATE), this.transformMachineStates(machine, State.END_STATE, State.RETHROW_STATE, enclosingFinallyState)));
      return createFunctionExpression(createParameterList(YIELD_SENT, YIELD_ACTION), createFunctionBody([body]));
    },
    generateMachine: function(machine) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var enclosingCatchState = machine.getEnclosingCatchMap();
      var body = parseStatement($__177);
      var caseClauses = [];
      this.addExceptionCases_(State.RETHROW_STATE, enclosingFinallyState, enclosingCatchState, machine.states, caseClauses);
      caseClauses.push(createDefaultClause(this.machineUncaughtExceptionStatements(State.RETHROW_STATE, State.END_STATE)));
      body = createTryStatement(createBlock(body), createCatch(createBindingIdentifier(CAUGHT_EXCEPTION), createBlock(createAssignmentStatement(createIdentifierExpression(STORED_EXCEPTION), createIdentifierExpression(CAUGHT_EXCEPTION)), createSwitchStatement(createIdentifierExpression(STATE), caseClauses))), null);
      return body;
    },
    getMachineVariables: function(tree, machine) {
      var statements = [];
      statements.push(createVariableStatement(VAR, STATE, createNumberLiteral(machine.startState)));
      statements.push(createVariableStatement(VAR, STORED_EXCEPTION, null));
      statements.push(createVariableStatement(VAR, FINALLY_FALL_THROUGH, null));
      var liftedIdentifiers = variablesInBlock(tree, true);
      var allCatchStates = machine.allCatchStates();
      for (var i = 0; i < allCatchStates.length; i++) {
        liftedIdentifiers[allCatchStates[i].identifier] = true;
      }
      var liftedIdentifierList = Object.keys(liftedIdentifiers).sort();
      for (var i = 0; i < liftedIdentifierList.length; i++) {
        var liftedIdentifier = liftedIdentifierList[i];
        statements.push(createVariableStatement(VAR, liftedIdentifier, null));
      }
      return statements;
    },
    addExceptionCases_: function(rethrowState, enclosingFinallyState, enclosingCatchState, allStates, caseClauses) {
      for (var i = 0; i < allStates.length; i++) {
        var state = allStates[i].id;
        var statements = allStates[i].statements;
        var finallyState = enclosingFinallyState[state];
        var catchState = enclosingCatchState[state];
        if (!statements || statements.length === 0) continue;
        if (catchState != null && finallyState != null && catchState.tryStates.indexOf(finallyState.finallyState) >= 0) {
          caseClauses.push(createCaseClause(createNumberLiteral(state), State.generateJumpThroughFinally(finallyState.finallyState, catchState.catchState)));
        } else if (catchState != null) {
          caseClauses.push(createCaseClause(createNumberLiteral(state), createStatementList(createAssignStateStatement(catchState.catchState), createBreakStatement())));
        } else if (finallyState != null) {
          caseClauses.push(createCaseClause(createNumberLiteral(state), State.generateJumpThroughFinally(finallyState.finallyState, rethrowState)));
        } else {}
      }
    },
    transformFunctionDeclaration: function(tree) {
      this.clearLabels_();
      return tree;
    },
    transformFunctionExpression: function(tree) {
      this.clearLabels_();
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
      return this.statementsToStateMachine_([statement]);
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
      cases.push(createCaseClause(createNumberLiteral(machine.fallThroughState), this.machineFallThroughStatements(machineEndState)));
      cases.push(createCaseClause(createNumberLiteral(machineEndState), this.machineEndStatements()));
      cases.push(createCaseClause(createNumberLiteral(rethrowState), this.machineRethrowStatements(machineEndState)));
      cases.push(createDefaultClause([createThrowStatement(createBinaryOperator(createStringLiteral('traceur compiler bug: invalid state in state machine: '), createOperatorToken(PLUS), createIdentifierExpression(STATE)))]));
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
                statements = createStatementList(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(FINALLY_FALL_THROUGH)), createAssignmentStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), createNumberLiteral(State.INVALID_STATE)), createBreakStatement());
              }
              caseClauses.push(createCaseClause(createNumberLiteral(destination), statements));
            }
            caseClauses.push(createDefaultClause(createStatementList(createAssignStateStatement(enclosingFinallyState.finallyState), createBreakStatement())));
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createSwitchStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), caseClauses), createBreakStatement())));
          } else {
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(FINALLY_FALL_THROUGH)), createBreakStatement())));
          }
          this.addFinallyFallThroughDispatches(finallyState, finallyState.nestedTrys, cases);
        } else {
          this.addFinallyFallThroughDispatches(enclosingFinallyState, tryState.nestedTrys, cases);
        }
      }
    },
    createSequence_: function(head, tail) {
      var states = $__spread(head.states);
      for (var i = 0; i < tail.states.length; i++) {
        var tailState = tail.states[i];
        states.push(tailState.replaceState(tail.startState, head.fallThroughState));
      }
      var exceptionBlocks = $__spread(head.exceptionBlocks);
      for (var i = 0; i < tail.exceptionBlocks.length; i++) {
        var tryState = tail.exceptionBlocks[i];
        exceptionBlocks.push(tryState.replaceState(tail.startState, head.fallThroughState));
      }
      return new StateMachine(head.startState, tail.fallThroughState, states, exceptionBlocks);
    },
    maybeTransformStatement_: function(maybeTransformedStatement) {
      if (maybeTransformedStatement.type == VARIABLE_STATEMENT && maybeTransformedStatement.declarations.declarationType != VAR) {
        this.reporter.reportError(maybeTransformedStatement.location != null ? maybeTransformedStatement.location.start: null, 'traceur: const/let declaration may not be ' + 'in a block containing a yield.');
      }
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
      return maybeTransformed.type == STATE_MACHINE ? maybeTransformed: this.statementToStateMachine_(maybeTransformed);
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
    }
  }, {}, $__CPSTransformer__super, $__CPSTransformer__proto);
  return Object.preventExtensions(Object.create(null, {CPSTransformer: {
      get: function() {
        return CPSTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/EndState.js", function() {
  "use strict";
  var State = System.get("../src/codegeneration/generator/State.js").State;
  function EndState() {
    $__EndState__proto !== null && $__superCall(this, $__EndState__proto, "constructor", arguments);
  }
  var $__EndState__super = State;
  var $__EndState__proto = $__getProtoParent($__EndState__super);
  ($__class)(EndState, {
    replaceState: function(oldState, newState) {
      return new EndState(State.replaceStateId(this.id, oldState, newState));
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return State.generateJump(enclosingFinally, machineEndState);
    }
  }, {}, $__EndState__super, $__EndState__proto);
  return Object.preventExtensions(Object.create(null, {EndState: {
      get: function() {
        return EndState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/AsyncTransformer.js", function() {
  "use strict";
  var $__183 = Object.freeze(Object.defineProperties(["\n        var ", " = {\n          GState: 0,\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "], {raw: {value: Object.freeze(["\n        var ", " = {\n          GState: 0,\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "])}})),
      $__184 = Object.freeze(Object.defineProperties(["\n        var ", " = ", ".moveNext.bind(", ");"], {raw: {value: Object.freeze(["\n        var ", " = ", ".moveNext.bind(", ");"])}}));
  var CPSTransformer = System.get("../src/codegeneration/generator/CPSTransformer.js").CPSTransformer;
  var EndState = System.get("../src/codegeneration/generator/EndState.js").EndState;
  var FallThroughState = System.get("../src/codegeneration/generator/FallThroughState.js").FallThroughState;
  var $__186 = System.get("../src/syntax/PredefinedName.js"),
      $VALUE = $__186.$VALUE,
      CALLBACK = $__186.CALLBACK,
      CONTINUATION = $__186.CONTINUATION,
      CREATE_CALLBACK = $__186.CREATE_CALLBACK,
      CREATE_ERRBACK = $__186.CREATE_ERRBACK,
      CREATE_PROMISE = $__186.CREATE_PROMISE,
      DEFERRED = $__186.DEFERRED,
      ERR = $__186.ERR,
      ERRBACK = $__186.ERRBACK,
      NEW_STATE = $__186.NEW_STATE,
      RESULT = $__186.RESULT,
      STATE = $__186.STATE,
      STORED_EXCEPTION = $__186.STORED_EXCEPTION,
      THEN = $__186.THEN,
      WAIT_TASK = $__186.WAIT_TASK;
  var STATE_MACHINE = System.get("../src/syntax/trees/ParseTreeType.js").STATE_MACHINE;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  var StateMachine = System.get("../src/syntax/trees/StateMachine.js").StateMachine;
  var VAR = System.get("../src/syntax/TokenType.js").VAR;
  var $__186 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__186.createArgumentList,
      createAssignStateStatement = $__186.createAssignStateStatement,
      createAssignmentStatement = $__186.createAssignmentStatement,
      createBlock = $__186.createBlock,
      createBreakStatement = $__186.createBreakStatement,
      createCallExpression = $__186.createCallExpression,
      createCallStatement = $__186.createCallStatement,
      createEmptyArgumentList = $__186.createEmptyArgumentList,
      createFunctionExpression = $__186.createFunctionExpression,
      createFunctionBody = $__186.createFunctionBody,
      createIdentifierExpression = $__186.createIdentifierExpression,
      createMemberExpression = $__186.createMemberExpression,
      createNewExpression = $__186.createNewExpression,
      createNumberLiteral = $__186.createNumberLiteral,
      createParameterList = $__186.createParameterList,
      createParameterReference = $__186.createParameterReference,
      createReturnStatement = $__186.createReturnStatement,
      createStatementList = $__186.createStatementList,
      createThrowStatement = $__186.createThrowStatement,
      createUndefinedExpression = $__186.createUndefinedExpression,
      createVariableStatement = $__186.createVariableStatement;
  function AsyncTransformer() {
    $__AsyncTransformer__proto !== null && $__superCall(this, $__AsyncTransformer__proto, "constructor", arguments);
  }
  var $__AsyncTransformer__super = CPSTransformer;
  var $__AsyncTransformer__proto = $__getProtoParent($__AsyncTransformer__super);
  ($__class)(AsyncTransformer, {
    transformYieldExpression: function(tree) {
      this.reporter.reportError(tree.location.start, 'Async function may not have a yield expression.');
      return tree;
    },
    transformAwaitStatement: function(tree) {
      var createTaskState = this.allocateState();
      var callbackState = this.allocateState();
      var errbackState = this.allocateState();
      var fallThroughState = this.allocateState();
      var states = [];
      states.push(new FallThroughState(createTaskState, callbackState, createStatementList(createAssignmentStatement(createIdentifierExpression(WAIT_TASK), this.transformAny(tree.expression)), createCallStatement(createMemberExpression(WAIT_TASK, THEN), createArgumentList(createCallExpression(createIdentifierExpression(CREATE_CALLBACK), createArgumentList(createNumberLiteral(callbackState))), createCallExpression(createIdentifierExpression(CREATE_ERRBACK), createArgumentList(createNumberLiteral(errbackState))))), createReturnStatement(null))));
      var assignment;
      if (tree.identifier != null) {
        assignment = createStatementList(createAssignmentStatement(createIdentifierExpression(tree.identifier), createIdentifierExpression($VALUE)));
      } else {
        assignment = createStatementList();
      }
      states.push(new FallThroughState(callbackState, fallThroughState, assignment));
      states.push(new FallThroughState(errbackState, fallThroughState, createStatementList(createThrowStatement(createIdentifierExpression(ERR)))));
      return new StateMachine(createTaskState, fallThroughState, states, []);
    },
    transformFinally: function(tree) {
      var result = $__superCall(this, $__AsyncTransformer__proto, "transformFinally", [tree]);
      if (result.block.type != STATE_MACHINE) {
        return result;
      }
      this.reporter.reportError(tree.location.start, 'async not permitted within a finally block.');
      return result;
    },
    transformReturnStatement: function(tree) {
      var result = tree.expression;
      if (result == null) {
        result = createUndefinedExpression();
      }
      var startState = this.allocateState();
      var endState = this.allocateState();
      var completeState = new FallThroughState(startState, endState, createStatementList(this.createCompleteTask_(result)));
      var end = new EndState(endState);
      return new StateMachine(startState, this.allocateState(), [completeState, end], []);
    },
    createCompleteTask_: function(result) {
      return createCallStatement(createMemberExpression(RESULT, CALLBACK), createArgumentList(result));
    },
    transformAsyncBody: function(tree) {
      var $__187;
      var transformedTree = this.transformAny(tree);
      if (this.reporter.hadError()) {
        return tree;
      }
      var machine = transformedTree;
      var statements = [];
      statements.push(this.generateHoistedThis());
      statements.push(this.generateHoistedArguments());
      ($__187 = statements).push.apply($__187, $__toObject(this.getMachineVariables(tree, machine)));
      statements.push(createVariableStatement(VAR, $VALUE, null));
      statements.push(createVariableStatement(VAR, ERR, null));
      statements.push(createVariableStatement(VAR, RESULT, createNewExpression(createIdentifierExpression(DEFERRED), createEmptyArgumentList())));
      statements.push(createVariableStatement(VAR, WAIT_TASK, null));
      var id = createIdentifierExpression;
      var G = '$G';
      statements.push(parseStatement($__183, G, this.generateMachineInnerFunction(machine), this.generateMachineMethod(machine)));
      statements.push(parseStatement($__184, id(CONTINUATION), id(G), id(G)));
      statements.push(createVariableStatement(VAR, CREATE_CALLBACK, createFunctionExpression(createParameterList(NEW_STATE), createFunctionBody([createReturnStatement(createFunctionExpression(createParameterList(1), createFunctionBody([createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(NEW_STATE)), createAssignmentStatement(createIdentifierExpression($VALUE), createParameterReference(0)), createCallStatement(createIdentifierExpression(CONTINUATION))])))]))));
      statements.push(createVariableStatement(VAR, CREATE_ERRBACK, createFunctionExpression(createParameterList(NEW_STATE), createFunctionBody([createReturnStatement(createFunctionExpression(createParameterList(1), createFunctionBody([createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(NEW_STATE)), createAssignmentStatement(createIdentifierExpression(ERR), createParameterReference(0)), createCallStatement(createIdentifierExpression(CONTINUATION))])))]))));
      statements.push(createCallStatement(createIdentifierExpression(CONTINUATION)));
      statements.push(createReturnStatement(createCallExpression(createMemberExpression(RESULT, CREATE_PROMISE))));
      return createFunctionBody(statements);
    },
    machineUncaughtExceptionStatements: function(rethrowState, machineEndState) {
      return createStatementList(createAssignStateStatement(rethrowState), createBreakStatement());
    },
    machineEndStatements: function() {
      return createStatementList(createReturnStatement(null));
    },
    machineFallThroughStatements: function(machineEndState) {
      return createStatementList(this.createCompleteTask_(createUndefinedExpression()), createAssignStateStatement(machineEndState), createBreakStatement());
    },
    machineRethrowStatements: function(machineEndState) {
      return createStatementList(createCallStatement(createMemberExpression(RESULT, ERRBACK), createArgumentList(createIdentifierExpression(STORED_EXCEPTION))), createAssignStateStatement(machineEndState), createBreakStatement());
    }
  }, {}, $__AsyncTransformer__super, $__AsyncTransformer__proto);
  AsyncTransformer.transformAsyncBody = function(reporter, body) {
    return new AsyncTransformer(reporter).transformAsyncBody(body);
  };
  return Object.preventExtensions(Object.create(null, {AsyncTransformer: {
      get: function() {
        return AsyncTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/ForInTransformPass.js", function() {
  "use strict";
  var $__189 = System.get("../src/syntax/trees/ParseTreeType.js"),
      BLOCK = $__189.BLOCK,
      VARIABLE_DECLARATION_LIST = $__189.VARIABLE_DECLARATION_LIST,
      IDENTIFIER_EXPRESSION = $__189.IDENTIFIER_EXPRESSION;
  var $__189 = System.get("../src/syntax/PredefinedName.js"),
      LENGTH = $__189.LENGTH,
      PUSH = $__189.PUSH;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__189 = System.get("../src/syntax/TokenType.js"),
      BANG = $__189.BANG,
      IN = $__189.IN,
      OPEN_ANGLE = $__189.OPEN_ANGLE,
      PLUS_PLUS = $__189.PLUS_PLUS,
      VAR = $__189.VAR;
  var $__189 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__189.createArgumentList,
      createAssignmentStatement = $__189.createAssignmentStatement,
      createBinaryOperator = $__189.createBinaryOperator,
      createBlock = $__189.createBlock,
      createCallStatement = $__189.createCallStatement,
      createContinueStatement = $__189.createContinueStatement,
      createEmptyArrayLiteralExpression = $__189.createEmptyArrayLiteralExpression,
      createForInStatement = $__189.createForInStatement,
      createForStatement = $__189.createForStatement,
      createIdentifierExpression = $__189.createIdentifierExpression,
      createIfStatement = $__189.createIfStatement,
      createMemberExpression = $__189.createMemberExpression,
      createMemberLookupExpression = $__189.createMemberLookupExpression,
      createNumberLiteral = $__189.createNumberLiteral,
      createOperatorToken = $__189.createOperatorToken,
      createParenExpression = $__189.createParenExpression,
      createPostfixExpression = $__189.createPostfixExpression,
      createUnaryExpression = $__189.createUnaryExpression,
      createVariableDeclarationList = $__189.createVariableDeclarationList,
      createVariableStatement = $__189.createVariableStatement;
  function ForInTransformPass() {
    $__ForInTransformPass__proto !== null && $__superCall(this, $__ForInTransformPass__proto, "constructor", arguments);
  }
  var $__ForInTransformPass__super = TempVarTransformer;
  var $__ForInTransformPass__proto = $__getProtoParent($__ForInTransformPass__super);
  ($__class)(ForInTransformPass, {transformForInStatement: function(original) {
      var $__190;
      var tree = original;
      var bodyStatements = [];
      var body = this.transformAny(tree.body);
      if (body.type == BLOCK) {
        ($__190 = bodyStatements).push.apply($__190, $__toObject(body.statements));
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
      ($__190 = innerBlock).push.apply($__190, $__toObject(bodyStatements));
      elements.push(createForStatement(createVariableDeclarationList(VAR, i, createNumberLiteral(0)), createBinaryOperator(createIdentifierExpression(i), createOperatorToken(OPEN_ANGLE), createMemberExpression(keys, LENGTH)), createPostfixExpression(createIdentifierExpression(i), createOperatorToken(PLUS_PLUS)), createBlock(innerBlock)));
      return createBlock(elements);
    }}, {transformTree: function(identifierGenerator, tree) {
      return new ForInTransformPass(identifierGenerator).transformAny(tree);
    }}, $__ForInTransformPass__super, $__ForInTransformPass__proto);
  return Object.preventExtensions(Object.create(null, {ForInTransformPass: {
      get: function() {
        return ForInTransformPass;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/YieldState.js", function() {
  "use strict";
  var CURRENT = System.get("../src/syntax/PredefinedName.js").CURRENT;
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var $__192 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentStatement = $__192.createAssignmentStatement,
      createIdentifierExpression = $__192.createIdentifierExpression,
      createMemberExpression = $__192.createMemberExpression,
      createReturnStatement = $__192.createReturnStatement,
      createThisExpression = $__192.createThisExpression,
      createTrueLiteral = $__192.createTrueLiteral;
  function YieldState(id, fallThroughState, expression) {
    $__superCall(this, $__YieldState__proto, "constructor", [id]);
    this.fallThroughState = fallThroughState;
    this.expression = expression;
  }
  var $__YieldState__super = State;
  var $__YieldState__proto = $__getProtoParent($__YieldState__super);
  ($__class)(YieldState, {
    replaceState: function(oldState, newState) {
      return new this.constructor(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.expression);
    },
    transform: function(enclosingFinally, machineEndState, reporter) {
      return $__spread([createAssignmentStatement(createMemberExpression(createThisExpression(), CURRENT), this.expression)], State.generateAssignState(enclosingFinally, this.fallThroughState), [createReturnStatement(createTrueLiteral())]);
    }
  }, {}, $__YieldState__super, $__YieldState__proto);
  return Object.preventExtensions(Object.create(null, {YieldState: {
      get: function() {
        return YieldState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/ReturnState.js", function() {
  "use strict";
  var $__194 = System.get("../src/semantics/util.js"),
      isUndefined = $__194.isUndefined,
      isVoidExpression = $__194.isVoidExpression;
  var YIELD_RETURN = System.get("../src/syntax/PredefinedName.js").YIELD_RETURN;
  var YieldState = System.get("../src/codegeneration/generator/YieldState.js").YieldState;
  var State = System.get("../src/codegeneration/generator/State.js").State;
  var $__194 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentStatement = $__194.createAssignmentStatement,
      createMemberExpression = $__194.createMemberExpression,
      createThisExpression = $__194.createThisExpression;
  function ReturnState() {
    $__ReturnState__proto !== null && $__superCall(this, $__ReturnState__proto, "constructor", arguments);
  }
  var $__ReturnState__super = YieldState;
  var $__ReturnState__proto = $__getProtoParent($__ReturnState__super);
  ($__class)(ReturnState, {transform: function(enclosingFinally, machineEndState, reporter) {
      var e = this.expression;
      if (e && !isUndefined(e) && !isVoidExpression(e)) {
        return $__spread([createAssignmentStatement(createMemberExpression(createThisExpression(), YIELD_RETURN), this.expression)], State.generateJump(enclosingFinally, machineEndState));
      } else {
        return State.generateJump(enclosingFinally, machineEndState);
      }
    }}, {}, $__ReturnState__super, $__ReturnState__proto);
  return Object.preventExtensions(Object.create(null, {ReturnState: {
      get: function() {
        return ReturnState;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/generator/GeneratorTransformer.js", function() {
  "use strict";
  var $__195 = Object.freeze(Object.defineProperties(["\n        var ", " = {\n          GState: ", ",\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "], {raw: {value: Object.freeze(["\n        var ", " = {\n          GState: ", ",\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "])}})),
      $__196 = Object.freeze(Object.defineProperties(["return ", "(", ");"], {raw: {value: Object.freeze(["return ", "(", ");"])}}));
  var CPSTransformer = System.get("../src/codegeneration/generator/CPSTransformer.js").CPSTransformer;
  var EndState = System.get("../src/codegeneration/generator/EndState.js").EndState;
  var $__198 = System.get("../src/syntax/PredefinedName.js"),
      ACTION_SEND = $__198.ACTION_SEND,
      ACTION_THROW = $__198.ACTION_THROW,
      RESULT = $__198.RESULT,
      STORED_EXCEPTION = $__198.STORED_EXCEPTION,
      TRACEUR_RUNTIME = $__198.TRACEUR_RUNTIME,
      YIELD_RETURN = $__198.YIELD_RETURN;
  var $__198 = System.get("../src/syntax/trees/ParseTreeType.js"),
      STATE_MACHINE = $__198.STATE_MACHINE,
      YIELD_EXPRESSION = $__198.YIELD_EXPRESSION;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  var StateMachine = System.get("../src/syntax/trees/StateMachine.js").StateMachine;
  var VAR = System.get("../src/syntax/TokenType.js").VAR;
  var YieldState = System.get("../src/codegeneration/generator/YieldState.js").YieldState;
  var ReturnState = System.get("../src/codegeneration/generator/ReturnState.js").ReturnState;
  var $__198 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignStateStatement = $__198.createAssignStateStatement,
      createAssignmentStatement = $__198.createAssignmentStatement,
      createExpressionStatement = $__198.createExpressionStatement,
      createFalseLiteral = $__198.createFalseLiteral,
      createFunctionBody = $__198.createFunctionBody,
      id = $__198.createIdentifierExpression,
      createMemberExpression = $__198.createMemberExpression,
      createNumberLiteral = $__198.createNumberLiteral,
      createObjectLiteralExpression = $__198.createObjectLiteralExpression,
      createPropertyNameAssignment = $__198.createPropertyNameAssignment,
      createReturnStatement = $__198.createReturnStatement,
      createStatementList = $__198.createStatementList,
      createThisExpression = $__198.createThisExpression,
      createThrowStatement = $__198.createThrowStatement,
      createUndefinedExpression = $__198.createUndefinedExpression,
      createVariableStatement = $__198.createVariableStatement;
  var transformOptions = System.get("../src/options.js").transformOptions;
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var GSTATE = 'GState';
  var GENERATOR_WRAP_CODE = ("function(generator) {\n  return %addIterator({\n    next: function(x) {\n      switch (generator.GState) {\n        case " + ST_EXECUTING + ":\n          throw new Error('\"next\" on executing generator');\n        case " + ST_CLOSED + ":\n          throw new Error('\"next\" on closed generator');\n        case " + ST_NEWBORN + ":\n          if (x !== undefined) {\n            throw new TypeError('Sent value to newborn generator');\n          }\n          // fall through\n        case " + ST_SUSPENDED + ":\n          generator.GState = " + ST_EXECUTING + ";\n          if (generator.moveNext(x, " + ACTION_SEND + ")) {\n            generator.GState = " + ST_SUSPENDED + ";\n            return {value: generator.current, done: false};\n          }\n          generator.GState = " + ST_CLOSED + ";\n          return {value: generator.yieldReturn, done: true};\n      }\n    },\n\n    'throw': function(x) {\n      switch (generator.GState) {\n        case " + ST_EXECUTING + ":\n          throw new Error('\"throw\" on executing generator');\n        case " + ST_CLOSED + ":\n          throw new Error('\"throw\" on closed generator');\n        case " + ST_NEWBORN + ":\n          generator.GState = " + ST_CLOSED + ";\n          throw x;\n        case " + ST_SUSPENDED + ":\n          generator.GState = " + ST_EXECUTING + ";\n          if (generator.moveNext(x, " + ACTION_THROW + ")) {\n            generator.GState = " + ST_SUSPENDED + ";\n            return {value: generator.current, done: false};\n          }\n          generator.GState = " + ST_CLOSED + ";\n          return {value: generator.yieldReturn, done: true};\n      }\n    }\n  });\n}");
  var ADD_ITERATOR_CODE = "function(object) {\n  object[%iterator] = %returnThis;\n  return %defineProperty(object, %iterator, {enumerable: false});\n}";
  var ADD_ITERATOR_RUNTIME_CODE = ("function(object) {\n  return " + TRACEUR_RUNTIME + ".addIterator(object);\n}");
  function GeneratorTransformer(runtimeInliner, reporter) {
    $__superCall(this, $__GeneratorTransformer__proto, "constructor", [reporter]);
    this.runtimeInliner_ = runtimeInliner;
  }
  var $__GeneratorTransformer__super = CPSTransformer;
  var $__GeneratorTransformer__proto = $__getProtoParent($__GeneratorTransformer__super);
  ($__class)(GeneratorTransformer, {
    transformYieldExpression_: function(tree) {
      var e = tree.expression || createUndefinedExpression();
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(new YieldState(startState, fallThroughState, this.transformAny(e)), fallThroughState);
    },
    transformYieldExpression: function(tree) {
      this.reporter.reportError(tree.location.start, 'Only \'a = yield b\' and \'var a = yield b\' currently supported.');
      return tree;
    },
    transformExpressionStatement: function(tree) {
      var e = tree.expression;
      if (e.type === YIELD_EXPRESSION) return this.transformYieldExpression_(e);
      return $__superCall(this, $__GeneratorTransformer__proto, "transformExpressionStatement", [tree]);
    },
    transformAwaitStatement: function(tree) {
      this.reporter.reportError(tree.location.start, 'Generator function may not have an async statement.');
      return tree;
    },
    transformFinally: function(tree) {
      var result = $__superCall(this, $__GeneratorTransformer__proto, "transformFinally", [tree]);
      if (result.block.type != STATE_MACHINE) {
        return result;
      }
      this.reporter.reportError(tree.location.start, 'yield or return not permitted from within a finally block.');
      return result;
    },
    transformReturnStatement: function(tree) {
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(new ReturnState(startState, fallThroughState, this.transformAny(tree.expression)), fallThroughState);
    },
    transformGeneratorBody: function(tree) {
      var $__199;
      var transformedTree = this.transformAny(tree);
      if (this.reporter.hadError()) {
        return tree;
      }
      var machine = transformedTree;
      machine = new StateMachine(machine.startState, machine.fallThroughState, this.removeEmptyStates(machine.states), machine.exceptionBlocks);
      var statements = [];
      var G = '$G';
      statements.push(this.generateHoistedThis());
      statements.push(this.generateHoistedArguments());
      ($__199 = statements).push.apply($__199, $__toObject(this.getMachineVariables(tree, machine)));
      statements.push(parseStatement($__195, G, ST_NEWBORN, this.generateMachineInnerFunction(machine), this.generateMachineMethod(machine)));
      statements.push(parseStatement($__196, this.generatorWrap_, id(G)));
      return createFunctionBody(statements);
    },
    get generatorWrap_() {
      if (transformOptions.privateNames) this.runtimeInliner_.register('addIterator', ADD_ITERATOR_RUNTIME_CODE); else this.runtimeInliner_.register('addIterator', ADD_ITERATOR_CODE);
      return this.runtimeInliner_.get('generatorWrap', GENERATOR_WRAP_CODE);
    },
    machineUncaughtExceptionStatements: function(rethrowState, machineEndState) {
      return createStatementList(createAssignmentStatement(createMemberExpression(createThisExpression(), GSTATE), createNumberLiteral(ST_CLOSED)), createAssignStateStatement(machineEndState), createThrowStatement(id(STORED_EXCEPTION)));
    },
    machineRethrowStatements: function(machineEndState) {
      return createStatementList(createThrowStatement(id(STORED_EXCEPTION)));
    },
    machineFallThroughStatements: function(machineEndState) {
      return createStatementList(createAssignStateStatement(machineEndState));
    },
    machineEndStatements: function() {
      return [createReturnStatement(createFalseLiteral())];
    }
  }, {transformGeneratorBody: function(runtimeInliner, reporter, body) {
      return new GeneratorTransformer(runtimeInliner, reporter).transformGeneratorBody(body);
    }}, $__GeneratorTransformer__super, $__GeneratorTransformer__proto);
  ;
  return Object.preventExtensions(Object.create(null, {GeneratorTransformer: {
      get: function() {
        return GeneratorTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/GeneratorTransformPass.js", function() {
  "use strict";
  var $__200 = Object.freeze(Object.defineProperties(["\n          if (", " == ", ") {\n            ", " = ", ";\n            throw ", ";\n          }"], {raw: {value: Object.freeze(["\n          if (", " == ", ") {\n            ", " = ", ";\n            throw ", ";\n          }"])}})),
      $__201 = Object.freeze(Object.defineProperties(["\n        {\n          var ", " = ", ".getIterator(", ");\n          var ", ";\n\n          // TODO: Should 'yield *' handle non-generator iterators? A strict\n          // interpretation of harmony:generators would indicate 'no', but\n          // 'yes' seems makes more sense from a language-user's perspective.\n\n          // received = void 0;\n          ", " = void 0;\n          // send = true; // roughly equivalent\n          ", " = ", ";\n\n          while (true) {\n            if (", " == ", ") {\n              ", " = ", ".next(", ");\n            } else {\n              ", " = ", ".throw(", ");\n            }\n            if (", ".done) {\n              ", " = ", ".value;\n              break;\n            }\n            // Normally, this would go through transformYieldForExpression_\n            // which would rethrow and we would catch it and set up the states\n            // again.\n            ", ";\n          }\n        }"], {raw: {value: Object.freeze(["\n        {\n          var ", " = ", ".getIterator(", ");\n          var ", ";\n\n          // TODO: Should 'yield *' handle non-generator iterators? A strict\n          // interpretation of harmony:generators would indicate 'no', but\n          // 'yes' seems makes more sense from a language-user's perspective.\n\n          // received = void 0;\n          ", " = void 0;\n          // send = true; // roughly equivalent\n          ", " = ", ";\n\n          while (true) {\n            if (", " == ", ") {\n              ", " = ", ".next(", ");\n            } else {\n              ", " = ", ".throw(", ");\n            }\n            if (", ".done) {\n              ", " = ", ".value;\n              break;\n            }\n            // Normally, this would go through transformYieldForExpression_\n            // which would rethrow and we would catch it and set up the states\n            // again.\n            ", ";\n          }\n        }"])}}));
  var AsyncTransformer = System.get("../src/codegeneration/generator/AsyncTransformer.js").AsyncTransformer;
  var ForInTransformPass = System.get("../src/codegeneration/generator/ForInTransformPass.js").ForInTransformPass;
  var $__203 = System.get("../src/syntax/trees/ParseTrees.js"),
      GetAccessor = $__203.GetAccessor,
      SetAccessor = $__203.SetAccessor;
  var GeneratorTransformer = System.get("../src/codegeneration/generator/GeneratorTransformer.js").GeneratorTransformer;
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var EQUAL = System.get("../src/syntax/TokenType.js").EQUAL;
  var $__203 = System.get("../src/syntax/trees/ParseTreeType.js"),
      BINARY_OPERATOR = $__203.BINARY_OPERATOR,
      COMMA_EXPRESSION = $__203.COMMA_EXPRESSION,
      PAREN_EXPRESSION = $__203.PAREN_EXPRESSION,
      YIELD_EXPRESSION = $__203.YIELD_EXPRESSION;
  var $__203 = System.get("../src/syntax/trees/ParseTrees.js"),
      FunctionDeclaration = $__203.FunctionDeclaration,
      FunctionExpression = $__203.FunctionExpression;
  var $__203 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentExpression = $__203.createAssignmentExpression,
      createAssignmentStatement = $__203.createAssignmentStatement,
      createBlock = $__203.createBlock,
      createCommaExpression = $__203.createCommaExpression,
      createExpressionStatement = $__203.createExpressionStatement,
      createIdentifierExpression = $__203.createIdentifierExpression,
      createReturnStatement = $__203.createReturnStatement,
      createMemberExpression = $__203.createMemberExpression,
      createVariableDeclaration = $__203.createVariableDeclaration,
      createVariableDeclarationList = $__203.createVariableDeclarationList,
      createVariableStatement = $__203.createVariableStatement,
      createYieldStatement = $__203.createYieldStatement;
  var $__203 = System.get("../src/syntax/PredefinedName.js"),
      ACTION_SEND = $__203.ACTION_SEND,
      ACTION_THROW = $__203.ACTION_THROW,
      TRACEUR_RUNTIME = $__203.TRACEUR_RUNTIME,
      YIELD_ACTION = $__203.YIELD_ACTION,
      YIELD_SENT = $__203.YIELD_SENT;
  var $__203 = System.get("../src/options.js"),
      transformOptions = $__203.transformOptions,
      options = $__203.options;
  function isYieldAssign(tree) {
    return tree.operator.type === EQUAL && tree.right.type === YIELD_EXPRESSION && tree.left.isLeftHandSideExpression();
  }
  var id = createIdentifierExpression;
  function YieldFinder(tree) {
    this.hasYield = false;
    this.hasYieldFor = false;
    this.hasForIn = false;
    this.hasAsync = false;
    this.visitAny(tree);
  }
  var $__YieldFinder__super = ParseTreeVisitor;
  var $__YieldFinder__proto = $__getProtoParent($__YieldFinder__super);
  ($__class)(YieldFinder, {
    hasAnyGenerator: function() {
      return this.hasYield || this.hasAsync;
    },
    visitYieldExpression: function(tree) {
      this.hasYield = true;
      this.hasYieldFor = tree.isYieldFor;
    },
    visitAwaitStatement: function(tree) {
      this.hasAsync = true;
    },
    visitForInStatement: function(tree) {
      this.hasForIn = true;
      $__superCall(this, $__YieldFinder__proto, "visitForInStatement", [tree]);
    },
    visitFunctionDeclaration: function(tree) {},
    visitFunctionExpression: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {}
  }, {}, $__YieldFinder__super, $__YieldFinder__proto);
  var throwClose;
  function YieldExpressionTransformer(identifierGenerator) {
    $__superCall(this, $__YieldExpressionTransformer__proto, "constructor", [identifierGenerator]);
    if (!throwClose) {
      throwClose = parseStatement($__200, id(YIELD_ACTION), ACTION_THROW, id(YIELD_ACTION), ACTION_SEND, id(YIELD_SENT));
    }
  }
  var $__YieldExpressionTransformer__super = TempVarTransformer;
  var $__YieldExpressionTransformer__proto = $__getProtoParent($__YieldExpressionTransformer__super);
  ($__class)(YieldExpressionTransformer, {
    transformExpressionStatement: function(tree) {
      var e = tree.expression,
          ex;
      while (e.type === PAREN_EXPRESSION) {
        e = e.expression;
      }
      function commaWrap(lhs, rhs) {
        return createExpressionStatement(createCommaExpression($__spread([createAssignmentExpression(lhs, rhs)], ex.slice(1))));
      }
      switch (e.type) {
        case BINARY_OPERATOR:
          if (isYieldAssign(e)) return this.factorAssign_(e.left, e.right, createAssignmentStatement);
          break;
        case COMMA_EXPRESSION:
          ex = e.expressions;
          if (ex[0].type === BINARY_OPERATOR && isYieldAssign(ex[0])) return this.factorAssign_(ex[0].left, ex[0].right, commaWrap);
        case YIELD_EXPRESSION:
          if (e.isYieldFor) return this.transformYieldForExpression_(e);
          return createBlock(tree, throwClose);
      }
      return tree;
    },
    transformVariableStatement: function(tree) {
      var tdd = tree.declarations.declarations;
      function isYieldVarAssign(tree) {
        return tree.initializer && tree.initializer.type === YIELD_EXPRESSION;
      }
      function varWrap(lhs, rhs) {
        return createVariableStatement(createVariableDeclarationList(tree.declarations.declarationType, $__spread([createVariableDeclaration(lhs, rhs)], tdd.slice(1))));
      }
      if (isYieldVarAssign(tdd[0])) return this.factorAssign_(tdd[0].lvalue, tdd[0].initializer, varWrap);
      return tree;
    },
    transformReturnStatement: function(tree) {
      if (tree.expression && tree.expression.type === YIELD_EXPRESSION) return this.factor_(tree.expression, createReturnStatement);
      return tree;
    },
    factorAssign_: function(lhs, rhs, wrap) {
      return this.factor_(rhs, (function(ident) {
        return wrap(lhs, ident);
      }));
    },
    factor_: function(expression, wrap) {
      if (expression.isYieldFor) return createBlock(this.transformYieldForExpression_(expression), wrap(id(YIELD_SENT)));
      return createBlock([createExpressionStatement(expression), throwClose, wrap(id(YIELD_SENT))]);
    },
    transformYieldForExpression_: function(tree) {
      var g = id(this.getTempIdentifier());
      var next = id(this.getTempIdentifier());
      return parseStatement($__201, g, id(TRACEUR_RUNTIME), tree.expression, next, id(YIELD_SENT), id(YIELD_ACTION), ACTION_SEND, id(YIELD_ACTION), ACTION_SEND, next, g, id(YIELD_SENT), next, g, id(YIELD_SENT), next, id(YIELD_SENT), next, createYieldStatement(createMemberExpression(next, 'value')));
    }
  }, {transformTree: function(identifierGenerator, tree) {
      return new YieldExpressionTransformer(identifierGenerator).transformAny(tree);
    }}, $__YieldExpressionTransformer__super, $__YieldExpressionTransformer__proto);
  function GeneratorTransformPass(identifierGenerator, runtimeInliner, reporter) {
    $__superCall(this, $__GeneratorTransformPass__proto, "constructor", [identifierGenerator]);
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
  }
  var $__GeneratorTransformPass__super = TempVarTransformer;
  var $__GeneratorTransformPass__proto = $__getProtoParent($__GeneratorTransformPass__super);
  ($__class)(GeneratorTransformPass, {
    transformFunctionDeclaration: function(tree) {
      return this.transformFunction_(tree, FunctionDeclaration);
    },
    transformFunctionExpression: function(tree) {
      return this.transformFunction_(tree, FunctionExpression);
    },
    transformFunction_: function(tree, constructor) {
      var body = this.transformBody_(tree.functionBody, tree.isGenerator);
      if (body === tree.functionBody) return tree;
      var isGenerator = false;
      return new constructor(null, tree.name, isGenerator, tree.formalParameterList, body);
    },
    transformBody_: function(tree, isGenerator) {
      var finder;
      var body = $__superCall(this, $__GeneratorTransformPass__proto, "transformFunctionBody", [tree]);
      if (isGenerator || (options.unstarredGenerators || transformOptions.deferredFunctions)) {
        finder = new YieldFinder(tree);
        if (!(finder.hasYield || isGenerator || finder.hasAsync)) return body;
      } else if (!isGenerator) {
        return body;
      }
      if (finder.hasForIn && (transformOptions.generators || transformOptions.deferredFunctions)) {
        body = ForInTransformPass.transformTree(this.identifierGenerator, body);
      }
      if (finder.hasYield || isGenerator) {
        if (transformOptions.generators) {
          body = YieldExpressionTransformer.transformTree(this.identifierGenerator, body);
          body = GeneratorTransformer.transformGeneratorBody(this.runtimeInliner_, this.reporter_, body);
        }
      } else if (transformOptions.deferredFunctions) {
        body = AsyncTransformer.transformAsyncBody(this.reporter_, body);
      }
      return body;
    },
    transformGetAccessor: function(tree) {
      var body = this.transformBody_(tree.body);
      if (body === tree.body) return tree;
      return new GetAccessor(tree.location, tree.isStatic, tree.name, body);
    },
    transformSetAccessor: function(tree) {
      var body = this.transformBody_(tree.body);
      if (body === tree.body) return tree;
      return new SetAccessor(tree.location, tree.isStatic, tree.name, tree.parameter, body);
    }
  }, {transformTree: function(identifierGenerator, runtimeInliner, reporter, tree) {
      return new GeneratorTransformPass(identifierGenerator, runtimeInliner, reporter).transformAny(tree);
    }}, $__GeneratorTransformPass__super, $__GeneratorTransformPass__proto);
  return Object.preventExtensions(Object.create(null, {GeneratorTransformPass: {
      get: function() {
        return GeneratorTransformPass;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ModuleTransformer.js", function() {
  "use strict";
  var $__204 = Object.freeze(Object.defineProperties(["", ": {\n         get: function() { return ", "; },\n         enumerable: true\n       }"], {raw: {value: Object.freeze(["", ": {\n         get: function() { return ", "; },\n         enumerable: true\n       }"])}})),
      $__205 = Object.freeze(Object.defineProperties(["System.get('@traceur/module').registerModule(", ", function() {\n          ", "\n        }, this);"], {raw: {value: Object.freeze(["System.get('@traceur/module').registerModule(", ", function() {\n          ", "\n        }, this);"])}})),
      $__206 = Object.freeze(Object.defineProperties(["return Object.preventExtensions(Object.create(null, ", "));"], {raw: {value: Object.freeze(["return Object.preventExtensions(Object.create(null, ", "));"])}})),
      $__207 = Object.freeze(Object.defineProperties(["var $__default = ", ""], {raw: {value: Object.freeze(["var $__default = ", ""])}})),
      $__208 = Object.freeze(Object.defineProperties(["System.get(", ")"], {raw: {value: Object.freeze(["System.get(", ")"])}}));
  var $__210 = System.get("../src/syntax/trees/ParseTrees.js"),
      BindingElement = $__210.BindingElement,
      BindingIdentifier = $__210.BindingIdentifier,
      EmptyStatement = $__210.EmptyStatement,
      LiteralPropertyName = $__210.LiteralPropertyName,
      ObjectPattern = $__210.ObjectPattern,
      ObjectPatternField = $__210.ObjectPatternField,
      Script = $__210.Script;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__210 = System.get("../src/syntax/trees/ParseTreeType.js"),
      EXPORT_DEFAULT = $__210.EXPORT_DEFAULT,
      EXPORT_SPECIFIER = $__210.EXPORT_SPECIFIER,
      EXPORT_STAR = $__210.EXPORT_STAR,
      MODULE = $__210.MODULE,
      SCRIPT = $__210.SCRIPT;
  var $__210 = System.get("../src/syntax/TokenType.js"),
      STAR = $__210.STAR,
      VAR = $__210.VAR;
  var assert = System.get("../src/util/assert.js").assert;
  var $__210 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createBindingIdentifier = $__210.createBindingIdentifier,
      createIdentifierExpression = $__210.createIdentifierExpression,
      createIdentifierToken = $__210.createIdentifierToken,
      createMemberExpression = $__210.createMemberExpression,
      createObjectLiteralExpression = $__210.createObjectLiteralExpression,
      createUseStrictDirective = $__210.createUseStrictDirective,
      createVariableStatement = $__210.createVariableStatement;
  var $__210 = System.get("../src/codegeneration/PlaceholderParser.js"),
      parseExpression = $__210.parseExpression,
      parsePropertyDefinition = $__210.parsePropertyDefinition,
      parseStatement = $__210.parseStatement;
  function getGetterExport(transformer, symbol) {
    var name = symbol.name;
    var tree = symbol.tree;
    var returnExpression;
    switch (tree.type) {
      case EXPORT_DEFAULT:
        returnExpression = createIdentifierExpression('$__default');
        break;
      case EXPORT_SPECIFIER:
        var moduleSpecifier = symbol.relatedTree;
        if (moduleSpecifier) {
          var idName = transformer.getTempVarNameForModuleSpecifier(moduleSpecifier);
          returnExpression = createMemberExpression(idName, tree.lhs);
        } else {
          returnExpression = createIdentifierExpression(tree.lhs);
        }
        break;
      case EXPORT_STAR:
        assert(symbol.relatedTree);
        var moduleSpecifier = symbol.relatedTree;
        var idName = transformer.getTempVarNameForModuleSpecifier(moduleSpecifier);
        returnExpression = createMemberExpression(idName, symbol.name);
        break;
      default:
        returnExpression = createIdentifierExpression(name);
        break;
    }
    return parsePropertyDefinition($__204, name, returnExpression);
  }
  function ModuleTransformer(project, url) {
    var module = arguments[2];
    $__superCall(this, $__ModuleTransformer__proto, "constructor", [project.identifierGenerator]);
    this.project = project;
    this.url = url;
    this.module = module;
    assert(this.url);
  }
  var $__ModuleTransformer__super = TempVarTransformer;
  var $__ModuleTransformer__proto = $__getProtoParent($__ModuleTransformer__super);
  ($__class)(ModuleTransformer, {
    getTempVarNameForModuleSpecifier: function(moduleSpecifier) {
      var moduleName = moduleSpecifier.token.processedValue;
      return '$__' + moduleName.replace(/[^a-zA-Z0-9$]/g, function(c) {
        return '_' + c.charCodeAt(0) + '_';
      }) + '__';
    },
    transformModule: function(tree) {
      this.pushTempVarState();
      var statements = $__spread([createUseStrictDirective()], this.transformList(tree.scriptItemList), [this.createExportStatement()]);
      this.popTempVarState();
      var registerStatement = parseStatement($__205, this.url, statements);
      return new Script(tree.location, [registerStatement]);
    },
    createExportStatement: function() {
      var properties = this.module.getExports().map((function(exp) {
        return getGetterExport(this, exp);
      }).bind(this));
      var descriptors = createObjectLiteralExpression(properties);
      return parseStatement($__206, descriptors);
    },
    transformExportDeclaration: function(tree) {
      return this.transformAny(tree.declaration);
    },
    transformExportDefault: function(tree) {
      return parseStatement($__207, tree.expression);
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
      var token = tree.token;
      var name = tree.token.processedValue;
      var url;
      if (name[0] === '@') {
        url = name;
      } else {
        url = System.normalResolve(name, this.url);
      }
      return parseExpression($__208, url);
    },
    transformModuleDeclaration: function(tree) {
      var initializer = this.transformAny(tree.expression);
      return createVariableStatement(VAR, tree.identifier, initializer);
    },
    transformImportedBinding: function(tree) {
      var bindingElement = new BindingElement(tree.location, tree.binding, null);
      var name = new LiteralPropertyName(null, createIdentifierToken('default'));
      return new ObjectPattern(null, [new ObjectPatternField(null, name, bindingElement)]);
    },
    transformImportDeclaration: function(tree) {
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
  }, {
    transform: function(project, tree, url) {
      assert(tree.type === SCRIPT);
      return new ModuleTransformer(project, url).transformAny(tree);
    },
    transformAsModule: function(project, tree, module) {
      assert(tree.type === MODULE);
      assert(module);
      return new ModuleTransformer(project, module.url, module).transformAny(tree);
    }
  }, $__ModuleTransformer__super, $__ModuleTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ModuleTransformer: {
      get: function() {
        return ModuleTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/NumericLiteralTransformer.js", function() {
  "use strict";
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__212 = System.get("../src/syntax/trees/ParseTrees.js"),
      LiteralExpression = $__212.LiteralExpression,
      LiteralPropertyName = $__212.LiteralPropertyName;
  var LiteralToken = System.get("../src/syntax/LiteralToken.js").LiteralToken;
  var NUMBER = System.get("../src/syntax/TokenType.js").NUMBER;
  function needsTransform(token) {
    return token.type === NUMBER && /^0[bBoO]/.test(token.value);
  }
  function transformToken(token) {
    return new LiteralToken(NUMBER, String(token.processedValue), token.location);
  }
  function NumericLiteralTransformer() {
    $__NumericLiteralTransformer__proto !== null && $__superCall(this, $__NumericLiteralTransformer__proto, "constructor", arguments);
  }
  var $__NumericLiteralTransformer__super = ParseTreeTransformer;
  var $__NumericLiteralTransformer__proto = $__getProtoParent($__NumericLiteralTransformer__super);
  ($__class)(NumericLiteralTransformer, {
    transformLiteralExpression: function(tree) {
      var token = tree.literalToken;
      if (needsTransform(token)) return new LiteralExpression(tree.location, transformToken(token));
      return tree;
    },
    transformLiteralPropertyName: function(tree) {
      var token = tree.literalToken;
      if (needsTransform(token)) return new LiteralPropertyName(tree.location, transformToken(token));
      return tree;
    }
  }, {transformTree: function(tree) {
      return new NumericLiteralTransformer().transformAny(tree);
    }}, $__NumericLiteralTransformer__super, $__NumericLiteralTransformer__proto);
  return Object.preventExtensions(Object.create(null, {NumericLiteralTransformer: {
      get: function() {
        return NumericLiteralTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ObjectLiteralTransformer.js", function() {
  "use strict";
  var FindVisitor = System.get("../src/codegeneration/FindVisitor.js").FindVisitor;
  var $__214 = System.get("../src/syntax/trees/ParseTrees.js"),
      FormalParameterList = $__214.FormalParameterList,
      FunctionExpression = $__214.FunctionExpression,
      IdentifierExpression = $__214.IdentifierExpression,
      LiteralExpression = $__214.LiteralExpression;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__214 = System.get("../src/syntax/TokenType.js"),
      IDENTIFIER = $__214.IDENTIFIER,
      STRING = $__214.STRING;
  var $__214 = System.get("../src/syntax/trees/ParseTreeType.js"),
      COMPUTED_PROPERTY_NAME = $__214.COMPUTED_PROPERTY_NAME,
      LITERAL_PROPERTY_NAME = $__214.LITERAL_PROPERTY_NAME;
  var $__214 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createAssignmentExpression = $__214.createAssignmentExpression,
      createCommaExpression = $__214.createCommaExpression,
      createDefineProperty = $__214.createDefineProperty,
      createEmptyParameterList = $__214.createEmptyParameterList,
      createFunctionExpression = $__214.createFunctionExpression,
      createIdentifierExpression = $__214.createIdentifierExpression,
      createObjectCreate = $__214.createObjectCreate,
      createObjectLiteralExpression = $__214.createObjectLiteralExpression,
      createParenExpression = $__214.createParenExpression,
      createPropertyNameAssignment = $__214.createPropertyNameAssignment,
      createStringLiteral = $__214.createStringLiteral;
  var propName = System.get("../src/staticsemantics/PropName.js").propName;
  var transformOptions = System.get("../src/options.js").transformOptions;
  function AdvancedPropertyFinder(tree) {
    this.protoExpression = null;
    $__superCall(this, $__AdvancedPropertyFinder__proto, "constructor", [tree, true]);
  }
  var $__AdvancedPropertyFinder__super = FindVisitor;
  var $__AdvancedPropertyFinder__proto = $__getProtoParent($__AdvancedPropertyFinder__super);
  ($__class)(AdvancedPropertyFinder, {
    visitPropertyNameAssignment: function(tree) {
      if (isProtoName(tree.name)) this.protoExpression = tree.value; else $__superCall(this, $__AdvancedPropertyFinder__proto, "visitPropertyNameAssignment", [tree]);
    },
    visitComputedPropertyName: function(tree) {
      if (transformOptions.computedPropertyNames) this.found = true;
    }
  }, {}, $__AdvancedPropertyFinder__super, $__AdvancedPropertyFinder__proto);
  function isProtoName(tree) {
    return propName(tree) === '__proto__';
  }
  function ObjectLiteralTransformer(identifierGenerator) {
    $__superCall(this, $__ObjectLiteralTransformer__proto, "constructor", [identifierGenerator]);
    this.protoExpression = null;
    this.needsAdvancedTransform = false;
    this.seenAccessors = null;
  }
  var $__ObjectLiteralTransformer__super = TempVarTransformer;
  var $__ObjectLiteralTransformer__proto = $__getProtoParent($__ObjectLiteralTransformer__super);
  ($__class)(ObjectLiteralTransformer, {
    findSeenAccessor_: function(name) {
      if (name.type === COMPUTED_PROPERTY_NAME) return null;
      var s = propName(name);
      return this.seenAccessors[s];
    },
    removeSeenAccessor_: function(name) {
      if (name.type === COMPUTED_PROPERTY_NAME) return;
      var s = propName(name);
      delete this.seenAccessors[s];
    },
    addSeenAccessor_: function(name, descr) {
      if (name.type === COMPUTED_PROPERTY_NAME) return;
      var s = propName(name);
      this.seenAccessors[s] = descr;
    },
    createProperty_: function(name, descr) {
      var expression;
      if (name.type === LITERAL_PROPERTY_NAME) {
        if (this.needsAdvancedTransform) expression = this.getPropertyName_(name); else expression = name;
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
          if (token.isKeyword()) return createStringLiteral(token.type);
          return new LiteralExpression(token.location, token);
      }
    },
    transformObjectLiteralExpression: function(tree) {
      var oldNeedsTransform = this.needsAdvancedTransform;
      var oldSeenAccessors = this.seenAccessors;
      try {
        var finder = new AdvancedPropertyFinder(tree);
        if (!finder.found) {
          this.needsAdvancedTransform = false;
          return $__superCall(this, $__ObjectLiteralTransformer__proto, "transformObjectLiteralExpression", [tree]);
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
        if (protoExpression) objectExpression = createObjectCreate(protoExpression); else objectExpression = createObjectLiteralExpression([]);
        expressions.unshift(createAssignmentExpression(tempVarIdentifierExpression, objectExpression));
        expressions.push(tempVarIdentifierExpression);
        return createParenExpression(createCommaExpression(expressions));
      } finally {
        this.needsAdvancedTransform = oldNeedsTransform;
        this.seenAccessors = oldSeenAccessors;
      }
    },
    transformPropertyNameAssignment: function(tree) {
      if (!this.needsAdvancedTransform) return $__superCall(this, $__ObjectLiteralTransformer__proto, "transformPropertyNameAssignment", [tree]);
      if (isProtoName(tree.name)) return null;
      return this.createProperty_(tree.name, {
        value: this.transformAny(tree.value),
        configurable: true,
        enumerable: true,
        writable: true
      });
    },
    transformGetAccessor: function(tree) {
      if (!this.needsAdvancedTransform) return $__superCall(this, $__ObjectLiteralTransformer__proto, "transformGetAccessor", [tree]);
      var body = this.transformAny(tree.body);
      var func = createFunctionExpression(createEmptyParameterList(), body);
      return this.createProperty_(tree.name, {
        get: func,
        configurable: true,
        enumerable: true
      });
    },
    transformSetAccessor: function(tree) {
      if (!this.needsAdvancedTransform) return $__superCall(this, $__ObjectLiteralTransformer__proto, "transformSetAccessor", [tree]);
      var body = this.transformAny(tree.body);
      var parameter = this.transformAny(tree.parameter);
      var parameterList = new FormalParameterList(parameter.location, [parameter]);
      var func = createFunctionExpression(parameterList, body);
      return this.createProperty_(tree.name, {
        set: func,
        configurable: true,
        enumerable: true
      });
    },
    transformPropertyMethodAssignment: function(tree) {
      var func = new FunctionExpression(tree.location, null, tree.isGenerator, this.transformAny(tree.formalParameterList), this.transformAny(tree.functionBody));
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
      if (!this.needsAdvancedTransform) return $__superCall(this, $__ObjectLiteralTransformer__proto, "transformPropertyNameShorthand", [tree]);
      var expression = this.transformAny(tree.name);
      return this.createProperty_(tree.name, {
        value: new IdentifierExpression(tree.location, tree.name.identifierToken),
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }, {transformTree: function(identifierGenerator, tree) {
      return new ObjectLiteralTransformer(identifierGenerator).transformAny(tree);
    }}, $__ObjectLiteralTransformer__super, $__ObjectLiteralTransformer__proto);
  return Object.preventExtensions(Object.create(null, {ObjectLiteralTransformer: {
      get: function() {
        return ObjectLiteralTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/PropertyNameShorthandTransformer.js", function() {
  "use strict";
  var $__216 = System.get("../src/syntax/trees/ParseTrees.js"),
      IdentifierExpression = $__216.IdentifierExpression,
      LiteralPropertyName = $__216.LiteralPropertyName,
      PropertyNameAssignment = $__216.PropertyNameAssignment;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  function PropertyNameShorthandTransformer() {
    $__PropertyNameShorthandTransformer__proto !== null && $__superCall(this, $__PropertyNameShorthandTransformer__proto, "constructor", arguments);
  }
  var $__PropertyNameShorthandTransformer__super = ParseTreeTransformer;
  var $__PropertyNameShorthandTransformer__proto = $__getProtoParent($__PropertyNameShorthandTransformer__super);
  ($__class)(PropertyNameShorthandTransformer, {transformPropertyNameShorthand: function(tree) {
      return new PropertyNameAssignment(tree.location, new LiteralPropertyName(tree.location, tree.name), new IdentifierExpression(tree.location, tree.name));
    }}, {transformTree: function(tree) {
      return new PropertyNameShorthandTransformer().transformAny(tree);
    }}, $__PropertyNameShorthandTransformer__super, $__PropertyNameShorthandTransformer__proto);
  return Object.preventExtensions(Object.create(null, {PropertyNameShorthandTransformer: {
      get: function() {
        return PropertyNameShorthandTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/RestParameterTransformer.js", function() {
  "use strict";
  var $__217 = Object.freeze(Object.defineProperties(["\n            for (var ", " = [], ", " = ", ";\n                 ", " < arguments.length; ", "++)\n              ", "[", " - ", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n            for (var ", " = [], ", " = ", ";\n                 ", " < arguments.length; ", "++)\n              ", "[", " - ", "] = arguments[", "];"])}})),
      $__218 = Object.freeze(Object.defineProperties(["\n            for (var ", " = [], ", " = 0;\n                 ", " < arguments.length; ", "++)\n              ", "[", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n            for (var ", " = [], ", " = 0;\n                 ", " < arguments.length; ", "++)\n              ", "[", "] = arguments[", "];"])}}));
  var FormalParameterList = System.get("../src/syntax/trees/ParseTrees.js").FormalParameterList;
  var ParameterTransformer = System.get("../src/codegeneration/ParameterTransformer.js").ParameterTransformer;
  var createIdentifierToken = System.get("../src/codegeneration/ParseTreeFactory.js").createIdentifierToken;
  var parseStatement = System.get("../src/codegeneration/PlaceholderParser.js").parseStatement;
  function hasRestParameter(formalParameterList) {
    var parameters = formalParameterList.parameters;
    return parameters.length > 0 && parameters[parameters.length - 1].isRestParameter();
  }
  function getRestParameterLiteralToken(formalParameterList) {
    var parameters = formalParameterList.parameters;
    return parameters[parameters.length - 1].identifier.identifierToken;
  }
  function RestParameterTransformer() {
    $__RestParameterTransformer__proto !== null && $__superCall(this, $__RestParameterTransformer__proto, "constructor", arguments);
  }
  var $__RestParameterTransformer__super = ParameterTransformer;
  var $__RestParameterTransformer__proto = $__getProtoParent($__RestParameterTransformer__super);
  ($__class)(RestParameterTransformer, {transformFormalParameterList: function(tree) {
      var transformed = $__superCall(this, $__RestParameterTransformer__proto, "transformFormalParameterList", [tree]);
      if (hasRestParameter(transformed)) {
        var parametersWithoutRestParam = new FormalParameterList(transformed.location, transformed.parameters.slice(0, - 1));
        var startIndex = transformed.parameters.length - 1;
        var i = createIdentifierToken(this.getTempIdentifier());
        var name = getRestParameterLiteralToken(transformed);
        var loop;
        if (startIndex) {
          loop = parseStatement($__217, name, i, startIndex, i, i, name, i, startIndex, i);
        } else {
          loop = parseStatement($__218, name, i, i, i, name, i, i);
        }
        this.parameterStatements.push(loop);
        return parametersWithoutRestParam;
      }
      return transformed;
    }}, {transformTree: function(identifierGenerator, tree) {
      return new RestParameterTransformer(identifierGenerator).transformAny(tree);
    }}, $__RestParameterTransformer__super, $__RestParameterTransformer__proto);
  return Object.preventExtensions(Object.create(null, {RestParameterTransformer: {
      get: function() {
        return RestParameterTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/SpreadTransformer.js", function() {
  "use strict";
  var $__222 = System.get("../src/syntax/PredefinedName.js"),
      APPLY = $__222.APPLY,
      BIND = $__222.BIND,
      FUNCTION = $__222.FUNCTION,
      PROTOTYPE = $__222.PROTOTYPE;
  var $__222 = System.get("../src/syntax/trees/ParseTreeType.js"),
      MEMBER_EXPRESSION = $__222.MEMBER_EXPRESSION,
      MEMBER_LOOKUP_EXPRESSION = $__222.MEMBER_LOOKUP_EXPRESSION,
      SPREAD_EXPRESSION = $__222.SPREAD_EXPRESSION;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__222 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__222.createArgumentList,
      createArrayLiteralExpression = $__222.createArrayLiteralExpression,
      createAssignmentExpression = $__222.createAssignmentExpression,
      createCallExpression = $__222.createCallExpression,
      createEmptyArgumentList = $__222.createEmptyArgumentList,
      createIdentifierExpression = $__222.createIdentifierExpression,
      createMemberExpression = $__222.createMemberExpression,
      createMemberLookupExpression = $__222.createMemberLookupExpression,
      createNewExpression = $__222.createNewExpression,
      createNullLiteral = $__222.createNullLiteral,
      createParenExpression = $__222.createParenExpression;
  var SPREAD_CODE = "\n    function() {\n      var rv = [], k = 0;\n      for (var i = 0; i < arguments.length; i++) {\n        var value = %toObject(arguments[i]);\n        for (var j = 0; j < value.length; j++) {\n          rv[k++] = value[j];\n        }\n      }\n      return rv;\n    }";
  function hasSpreadMember(trees) {
    return trees.some((function(tree) {
      return tree && tree.type == SPREAD_EXPRESSION;
    }));
  }
  function SpreadTransformer(identifierGenerator, runtimeInliner) {
    $__superCall(this, $__SpreadTransformer__proto, "constructor", [identifierGenerator]);
    this.runtimeInliner_ = runtimeInliner;
  }
  var $__SpreadTransformer__super = TempVarTransformer;
  var $__SpreadTransformer__proto = $__getProtoParent($__SpreadTransformer__super);
  ($__class)(SpreadTransformer, {
    get spread_() {
      return this.runtimeInliner_.get('spread', SPREAD_CODE);
    },
    get toObject_() {
      return this.runtimeInliner_.get('toObject');
    },
    createArrayFromElements_: function(elements, needsNewArray) {
      var length = elements.length;
      if (length === 1 && !needsNewArray) {
        return createCallExpression(this.toObject_, createArgumentList(this.transformAny(elements[0].expression)));
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
          if (!lastArray) lastArray = [];
          lastArray.push(this.transformAny(elements[i]));
        }
      }
      if (lastArray) args.push(createArrayLiteralExpression(lastArray));
      return createCallExpression(this.spread_, createArgumentList(args));
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
      var arrayExpression = $__spread([createNullLiteral()], tree.args.args);
      arrayExpression = this.createArrayFromElements_(arrayExpression, false);
      return createNewExpression(createParenExpression(createCallExpression(createMemberExpression(FUNCTION, PROTOTYPE, BIND, APPLY), createArgumentList(this.transformAny(tree.operand), arrayExpression))), createEmptyArgumentList());
    },
    transformArrayLiteralExpression: function(tree) {
      if (hasSpreadMember(tree.elements)) {
        return this.createArrayFromElements_(tree.elements, true);
      }
      return $__superCall(this, $__SpreadTransformer__proto, "transformArrayLiteralExpression", [tree]);
    },
    transformCallExpression: function(tree) {
      if (hasSpreadMember(tree.args.args)) {
        return this.desugarCallSpread_(tree);
      }
      return $__superCall(this, $__SpreadTransformer__proto, "transformCallExpression", [tree]);
    },
    transformNewExpression: function(tree) {
      if (tree.args != null && hasSpreadMember(tree.args.args)) {
        return this.desugarNewSpread_(tree);
      }
      return $__superCall(this, $__SpreadTransformer__proto, "transformNewExpression", [tree]);
    }
  }, {transformTree: function(identifierGenerator, runtimeInliner, tree) {
      return new SpreadTransformer(identifierGenerator, runtimeInliner).transformAny(tree);
    }}, $__SpreadTransformer__super, $__SpreadTransformer__proto);
  return Object.preventExtensions(Object.create(null, {SpreadTransformer: {
      get: function() {
        return SpreadTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/TemplateLiteralTransformer.js", function() {
  "use strict";
  var $__224 = System.get("../src/syntax/trees/ParseTreeType.js"),
      BINARY_OPERATOR = $__224.BINARY_OPERATOR,
      COMMA_EXPRESSION = $__224.COMMA_EXPRESSION,
      CONDITIONAL_EXPRESSION = $__224.CONDITIONAL_EXPRESSION,
      TEMPLATE_LITERAL_PORTION = $__224.TEMPLATE_LITERAL_PORTION;
  var $__224 = System.get("../src/syntax/trees/ParseTrees.js"),
      LiteralExpression = $__224.LiteralExpression,
      ParenExpression = $__224.ParenExpression;
  var LiteralToken = System.get("../src/syntax/LiteralToken.js").LiteralToken;
  var $__224 = System.get("../src/syntax/PredefinedName.js"),
      DEFINE_PROPERTIES = $__224.DEFINE_PROPERTIES,
      OBJECT = $__224.OBJECT,
      RAW = $__224.RAW;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var TempVarTransformer = System.get("../src/codegeneration/TempVarTransformer.js").TempVarTransformer;
  var $__224 = System.get("../src/syntax/TokenType.js"),
      PERCENT = $__224.PERCENT,
      PLUS = $__224.PLUS,
      SLASH = $__224.SLASH,
      STAR = $__224.STAR,
      STRING = $__224.STRING;
  var $__224 = System.get("../src/codegeneration/ParseTreeFactory.js"),
      createArgumentList = $__224.createArgumentList,
      createArrayLiteralExpression = $__224.createArrayLiteralExpression,
      createBinaryOperator = $__224.createBinaryOperator,
      createCallExpression = $__224.createCallExpression,
      createIdentifierExpression = $__224.createIdentifierExpression,
      createMemberExpression = $__224.createMemberExpression,
      createObjectFreeze = $__224.createObjectFreeze,
      createObjectLiteralExpression = $__224.createObjectLiteralExpression,
      createOperatorToken = $__224.createOperatorToken,
      createPropertyDescriptor = $__224.createPropertyDescriptor,
      createPropertyNameAssignment = $__224.createPropertyNameAssignment,
      createStringLiteral = $__224.createStringLiteral;
  function createCallSiteIdObject(tree) {
    var elements = tree.elements;
    return createObjectFreeze(createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTIES), createArgumentList(createCookedStringArray(elements), createObjectLiteralExpression(createPropertyNameAssignment(RAW, createPropertyDescriptor({value: createObjectFreeze(createRawStringArray(elements))}))))));
  }
  function maybeAddEmptyStringAtEnd(elements, items) {
    var length = elements.length;
    if (!length || elements[length - 1].type !== TEMPLATE_LITERAL_PORTION) items.push(createStringLiteral(''));
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
  function TemplateLiteralTransformer() {
    $__TemplateLiteralTransformer__proto !== null && $__superCall(this, $__TemplateLiteralTransformer__proto, "constructor", arguments);
  }
  var $__TemplateLiteralTransformer__super = TempVarTransformer;
  var $__TemplateLiteralTransformer__proto = $__getProtoParent($__TemplateLiteralTransformer__super);
  ($__class)(TemplateLiteralTransformer, {
    transformFunctionBody: function(tree) {
      return ParseTreeTransformer.prototype.transformFunctionBody.call(this, tree);
    },
    transformTemplateLiteralExpression: function(tree) {
      if (!tree.operand) return this.createDefaultTemplateLiteral(tree);
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
      var firstNonEmpty = tree.elements[0].value.value === '' ? - 1: 0;
      var binaryExpression = this.transformAny(tree.elements[0]);
      if (length == 1) return binaryExpression;
      var plusToken = createOperatorToken(PLUS);
      for (var i = 1; i < length; i++) {
        var element = tree.elements[i];
        if (element.type === TEMPLATE_LITERAL_PORTION) {
          if (element.value.value === '') continue; else if (firstNonEmpty < 0 && i === 2) binaryExpression = binaryExpression.right;
        }
        var transformedTree = this.transformAny(tree.elements[i]);
        binaryExpression = createBinaryOperator(binaryExpression, plusToken, transformedTree);
      }
      return new ParenExpression(null, binaryExpression);
    }
  }, {transformTree: function(identifierGenerator, tree) {
      return new TemplateLiteralTransformer(identifierGenerator).transformAny(tree);
    }}, $__TemplateLiteralTransformer__super, $__TemplateLiteralTransformer__proto);
  return Object.preventExtensions(Object.create(null, {TemplateLiteralTransformer: {
      get: function() {
        return TemplateLiteralTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/TypeTransformer.js", function() {
  "use strict";
  var VariableDeclaration = System.get("../src/syntax/trees/ParseTrees.js").VariableDeclaration;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  function TypeTransformer() {
    $__TypeTransformer__proto !== null && $__superCall(this, $__TypeTransformer__proto, "constructor", arguments);
  }
  var $__TypeTransformer__super = ParseTreeTransformer;
  var $__TypeTransformer__proto = $__getProtoParent($__TypeTransformer__super);
  ($__class)(TypeTransformer, {transformVariableDeclaration: function(tree) {
      if (tree.typeAnnotation) {
        tree = new VariableDeclaration(tree.location, tree.lvalue, null, tree.initializer);
      }
      return $__superCall(this, $__TypeTransformer__proto, "transformVariableDeclaration", [tree]);
    }}, {transformTree: function(tree) {
      return new TypeTransformer().transformAny(tree);
    }}, $__TypeTransformer__super, $__TypeTransformer__proto);
  return Object.preventExtensions(Object.create(null, {TypeTransformer: {
      get: function() {
        return TypeTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/ProgramTransformer.js", function() {
  "use strict";
  var ArrayComprehensionTransformer = System.get("../src/codegeneration/ArrayComprehensionTransformer.js").ArrayComprehensionTransformer;
  var ArrowFunctionTransformer = System.get("../src/codegeneration/ArrowFunctionTransformer.js").ArrowFunctionTransformer;
  var BlockBindingTransformer = System.get("../src/codegeneration/BlockBindingTransformer.js").BlockBindingTransformer;
  var CascadeExpressionTransformer = System.get("../src/codegeneration/CascadeExpressionTransformer.js").CascadeExpressionTransformer;
  var ClassTransformer = System.get("../src/codegeneration/ClassTransformer.js").ClassTransformer;
  var CollectionTransformer = System.get("../src/codegeneration/CollectionTransformer.js").CollectionTransformer;
  var DefaultParametersTransformer = System.get("../src/codegeneration/DefaultParametersTransformer.js").DefaultParametersTransformer;
  var DestructuringTransformer = System.get("../src/codegeneration/DestructuringTransformer.js").DestructuringTransformer;
  var ForOfTransformer = System.get("../src/codegeneration/ForOfTransformer.js").ForOfTransformer;
  var FreeVariableChecker = System.get("../src/semantics/FreeVariableChecker.js").FreeVariableChecker;
  var GeneratorComprehensionTransformer = System.get("../src/codegeneration/GeneratorComprehensionTransformer.js").GeneratorComprehensionTransformer;
  var GeneratorTransformPass = System.get("../src/codegeneration/GeneratorTransformPass.js").GeneratorTransformPass;
  var ModuleTransformer = System.get("../src/codegeneration/ModuleTransformer.js").ModuleTransformer;
  var NumericLiteralTransformer = System.get("../src/codegeneration/NumericLiteralTransformer.js").NumericLiteralTransformer;
  var ObjectLiteralTransformer = System.get("../src/codegeneration/ObjectLiteralTransformer.js").ObjectLiteralTransformer;
  var ObjectMap = System.get("../src/util/ObjectMap.js").ObjectMap;
  var ParseTreeValidator = System.get("../src/syntax/ParseTreeValidator.js").ParseTreeValidator;
  var PropertyNameShorthandTransformer = System.get("../src/codegeneration/PropertyNameShorthandTransformer.js").PropertyNameShorthandTransformer;
  var TemplateLiteralTransformer = System.get("../src/codegeneration/TemplateLiteralTransformer.js").TemplateLiteralTransformer;
  var RestParameterTransformer = System.get("../src/codegeneration/RestParameterTransformer.js").RestParameterTransformer;
  var SpreadTransformer = System.get("../src/codegeneration/SpreadTransformer.js").SpreadTransformer;
  var TypeTransformer = System.get("../src/codegeneration/TypeTransformer.js").TypeTransformer;
  var $__229 = System.get("../src/options.js"),
      options = $__229.options,
      transformOptions = $__229.transformOptions;
  function ProgramTransformer(reporter, project) {
    this.project_ = project;
    this.reporter_ = reporter;
    this.results_ = new ObjectMap();
    this.url = null;
  }
  ($__class)(ProgramTransformer, {
    transform_: function() {
      this.project_.getSourceFiles().forEach((function(file) {
        this.transformFile_(file);
      }).bind(this));
    },
    transformFile_: function(file) {
      var url = arguments[1] !== (void 0) ? arguments[1]: file.name;
      this.url = url;
      var result = this.transform(this.project_.getParseTree(file));
      this.results_.set(file, result);
    },
    transformFileAsModule_: function(file, module) {
      this.url = module.url;
      var result = this.transformTree_(this.project_.getParseTree(file), module);
      this.results_.set(file, result);
    },
    transform: function(tree) {
      return this.transformTree_(tree);
    },
    transformTree_: function(tree) {
      var module = arguments[1];
      var identifierGenerator = this.project_.identifierGenerator;
      var runtimeInliner = this.project_.runtimeInliner;
      var reporter = this.reporter_;
      function transform(enabled, transformer) {
        for (var args = [],
            $__228 = 2; $__228 < arguments.length; $__228++) args[$__228 - 2] = arguments[$__228];
        return chain(enabled, (function() {
          var $__230;
          return ($__230 = transformer).transformTree.apply($__230, $__spread(args, [tree]));
        }));
      }
      function chain(enabled, func) {
        if (!enabled) return;
        if (!reporter.hadError()) {
          if (options.validate) {
            ParseTreeValidator.validate(tree);
          }
          tree = func() || tree;
        }
      }
      transform(transformOptions.types, TypeTransformer);
      transform(transformOptions.numericLiterals, NumericLiteralTransformer);
      transform(transformOptions.templateLiterals, TemplateLiteralTransformer, identifierGenerator);
      chain(transformOptions.modules, (function() {
        return this.transformModules_(tree, module);
      }).bind(this));
      transform(transformOptions.arrowFunctions, ArrowFunctionTransformer, reporter);
      transform(transformOptions.classes, ClassTransformer, identifierGenerator, runtimeInliner, reporter);
      transform(transformOptions.propertyNameShorthand, PropertyNameShorthandTransformer);
      transform(transformOptions.propertyMethods || transformOptions.computedPropertyNames, ObjectLiteralTransformer, identifierGenerator);
      transform(transformOptions.generatorComprehension, GeneratorComprehensionTransformer, identifierGenerator);
      transform(transformOptions.arrayComprehension, ArrayComprehensionTransformer, identifierGenerator);
      transform(transformOptions.forOf, ForOfTransformer, identifierGenerator, runtimeInliner);
      transform(transformOptions.restParameters, RestParameterTransformer, identifierGenerator);
      transform(transformOptions.defaultParameters, DefaultParametersTransformer, identifierGenerator);
      transform(transformOptions.destructuring, DestructuringTransformer, identifierGenerator);
      transform(transformOptions.generators || transformOptions.deferredFunctions, GeneratorTransformPass, identifierGenerator, runtimeInliner, reporter);
      transform(transformOptions.spread, SpreadTransformer, identifierGenerator, runtimeInliner);
      chain(true, (function() {
        return runtimeInliner.transformAny(tree);
      }));
      transform(transformOptions.blockBinding, BlockBindingTransformer);
      transform(transformOptions.cascadeExpression, CascadeExpressionTransformer, identifierGenerator, reporter);
      transform(transformOptions.trapMemberLookup || transformOptions.privateNames, CollectionTransformer, identifierGenerator);
      chain(options.freeVariableChecker, (function() {
        return FreeVariableChecker.checkScript(reporter, tree);
      }));
      return tree;
    },
    transformModules_: function(tree) {
      var module = arguments[1];
      if (module) return ModuleTransformer.transformAsModule(this.project_, tree, module);
      return ModuleTransformer.transform(this.project_, tree, this.url);
    }
  }, {});
  ProgramTransformer.transform = function(reporter, project) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transform_();
    return transformer.results_;
  };
  ProgramTransformer.transformFile = function(reporter, project, sourceFile) {
    var url = arguments[3];
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transformFile_(sourceFile, url);
    return transformer.results_;
  };
  ProgramTransformer.transformFileAsModule = function(reporter, project, module, sourceFile) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transformFileAsModule_(sourceFile, module);
    return transformer.results_;
  };
  return Object.preventExtensions(Object.create(null, {ProgramTransformer: {
      get: function() {
        return ProgramTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/Compiler.js", function() {
  "use strict";
  var ModuleAnalyzer = System.get("../src/semantics/ModuleAnalyzer.js").ModuleAnalyzer;
  var Parser = System.get("../src/syntax/Parser.js").Parser;
  var ProgramTransformer = System.get("../src/codegeneration/ProgramTransformer.js").ProgramTransformer;
  var Project = System.get("../src/semantics/symbols/Project.js").Project;
  function Compiler(reporter, project) {
    this.reporter_ = reporter;
    this.project_ = project;
  }
  ($__class)(Compiler, {
    compile_: function() {
      this.parse_();
      this.analyze_();
      this.transform_();
      if (this.hadError_()) {
        return null;
      }
      return this.results_;
    },
    compileFile_: function(file) {
      this.parseFile_(file);
      this.analyzeFile_(file);
      this.transformFile_(file);
      if (this.hadError_()) {
        return null;
      }
      return this.results_.get(file);
    },
    transform_: function() {
      if (this.hadError_()) {
        return;
      }
      this.results_ = ProgramTransformer.transform(this.reporter_, this.project_);
    },
    transformFile_: function(sourceFile) {
      if (this.hadError_()) {
        return;
      }
      this.results_ = ProgramTransformer.transformFile(this.reporter_, this.project_, sourceFile);
    },
    analyze_: function() {
      if (this.hadError_()) {
        return;
      }
      var analyzer = new ModuleAnalyzer(this.reporter_, this.project_);
      analyzer.analyze();
    },
    analyzeFile_: function(sourceFile) {
      if (this.hadError_()) {
        return;
      }
      var analyzer = new ModuleAnalyzer(this.reporter_, this.project_);
      analyzer.analyzeFile(sourceFile);
    },
    parse_: function() {
      this.project_.getSourceFiles().forEach(this.parseFile_, this);
    },
    parseFile_: function(file) {
      if (this.hadError_()) {
        return;
      }
      this.project_.setParseTree(file, new Parser(this.reporter_, file).parseScript());
    },
    hadError_: function() {
      return this.reporter_.hadError();
    }
  }, {
    compile: function(reporter, project) {
      return new Compiler(reporter, project).compile_();
    },
    compileFile: function(reporter, sourceFile) {
      var url = arguments[2] !== (void 0) ? arguments[2]: sourceFile.name;
      var project = arguments[3] !== (void 0) ? arguments[3]: new Project(url);
      project.addFile(sourceFile);
      return new Compiler(reporter, project).compileFile_(sourceFile);
    }
  });
  return Object.preventExtensions(Object.create(null, {Compiler: {
      get: function() {
        return Compiler;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/WebPageProject.js", function() {
  "use strict";
  var Compiler = System.get("../src/codegeneration/Compiler.js").Compiler;
  var ErrorReporter = System.get("../src/util/ErrorReporter.js").ErrorReporter;
  var Project = System.get("../src/semantics/symbols/Project.js").Project;
  var SourceFile = System.get("../src/syntax/SourceFile.js").SourceFile;
  var TreeWriter = System.get("../src/outputgeneration/TreeWriter.js").TreeWriter;
  function WebPageProject(url) {
    $__superCall(this, $__WebPageProject__proto, "constructor", [url]);
    this.numPending_ = 0;
    this.numberInlined_ = 0;
  }
  var $__WebPageProject__super = Project;
  var $__WebPageProject__proto = $__getProtoParent($__WebPageProject__super);
  ($__class)(WebPageProject, {
    asyncLoad_: function(url, fncOfContent, onScriptsReady) {
      this.numPending_++;
      this.loadResource(url, (function(content) {
        if (content) fncOfContent(content); else console.warn('Failed to load', url);
        if (--this.numPending_ <= 0) onScriptsReady();
      }).bind(this));
    },
    loadResource: function(url, fncOfContentOrNull) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.addEventListener('load', (function(e) {
        if (xhr.status == 200 || xhr.status == 0) fncOfContentOrNull(xhr.responseText);
      }));
      var onFailure = (function() {
        fncOfContentOrNull(null);
      });
      xhr.addEventListener('error', onFailure, false);
      xhr.addEventListener('abort', onFailure, false);
      xhr.send();
    },
    addFileFromScriptElement: function(scriptElement, name, content) {
      var file = new SourceFile(name, content);
      file.scriptElement = scriptElement;
      this.addFile(file);
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
      if (this.numPending_ <= 0) onScriptsReady();
    },
    get reporter() {
      if (!this.reporter_) {
        this.reporter_ = new ErrorReporter();
      }
      return this.reporter_;
    },
    get compiler() {
      if (!this.compiler_) {
        this.compiler_ = new Compiler(this.reporter, this);
      }
      return this.compiler_;
    },
    compile: function() {
      var trees = this.compiler.compile_();
      if (this.reporter.hadError()) {
        console.warn('Traceur compilation errors', this.reporter);
        return;
      }
      return trees;
    },
    putFile: function(file) {
      var scriptElement = document.createElement('script');
      scriptElement.setAttribute('data-traceur-src-url', file.name);
      scriptElement.textContent = file.generatedSource;
      var parent = file.scriptElement.parentNode;
      parent.insertBefore(scriptElement, file.scriptElement || null);
    },
    putFiles: function(files) {
      files.forEach(this.putFile, this);
    },
    runInWebPage: function(trees) {
      var files = this.generateSourceFromTrees(trees);
      this.putFiles(files);
    },
    generateSourceFromTrees: function(trees) {
      return trees.keys().map((function(file) {
        var tree = trees.get(file);
        var opts = {showLineNumbers: false};
        file.generatedSource = TreeWriter.write(tree, opts);
        return file;
      }));
    },
    run: function() {
      var done = arguments[0] !== (void 0) ? arguments[0]: (function() {});
      document.addEventListener('DOMContentLoaded', (function() {
        var selector = 'script[type="text/traceur"]';
        var scripts = document.querySelectorAll(selector);
        if (!scripts.length) {
          done();
          return;
        }
        this.addFilesFromScriptElements(scripts, (function() {
          var trees = this.compile();
          this.runInWebPage(trees);
          done();
        }).bind(this));
      }).bind(this), false);
    }
  }, {}, $__WebPageProject__super, $__WebPageProject__proto);
  return Object.preventExtensions(Object.create(null, {WebPageProject: {
      get: function() {
        return WebPageProject;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/CloneTreeTransformer.js", function() {
  "use strict";
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var $__236 = System.get("../src/syntax/trees/ParseTrees.js"),
      BindingIdentifier = $__236.BindingIdentifier,
      BreakStatement = $__236.BreakStatement,
      ContinueStatement = $__236.ContinueStatement,
      DebuggerStatement = $__236.DebuggerStatement,
      EmptyStatement = $__236.EmptyStatement,
      ExportSpecifier = $__236.ExportSpecifier,
      ExportStar = $__236.ExportStar,
      IdentifierExpression = $__236.IdentifierExpression,
      ImportSpecifier = $__236.ImportSpecifier,
      LiteralExpression = $__236.LiteralExpression,
      ModuleSpecifier = $__236.ModuleSpecifier,
      PredefinedType = $__236.PredefinedType,
      PropertyNameShorthand = $__236.PropertyNameShorthand,
      TemplateLiteralPortion = $__236.TemplateLiteralPortion,
      RestParameter = $__236.RestParameter,
      SuperExpression = $__236.SuperExpression,
      ThisExpression = $__236.ThisExpression;
  function CloneTreeTransformer() {
    $__CloneTreeTransformer__proto !== null && $__superCall(this, $__CloneTreeTransformer__proto, "constructor", arguments);
  }
  var $__CloneTreeTransformer__super = ParseTreeTransformer;
  var $__CloneTreeTransformer__proto = $__getProtoParent($__CloneTreeTransformer__super);
  ($__class)(CloneTreeTransformer, {
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
        return $__superCall(this, $__CloneTreeTransformer__proto, "transformList", [list]);
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
  }, {}, $__CloneTreeTransformer__super, $__CloneTreeTransformer__proto);
  CloneTreeTransformer.cloneTree = function(tree) {
    return new CloneTreeTransformer().transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {CloneTreeTransformer: {
      get: function() {
        return CloneTreeTransformer;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/codegeneration/module/ModuleRequireVisitor.js", function() {
  "use strict";
  var ParseTreeVisitor = System.get("../src/syntax/ParseTreeVisitor.js").ParseTreeVisitor;
  var STRING = System.get("../src/syntax/TokenType.js").STRING;
  var canonicalizeUrl = System.get("../src/util/url.js").canonicalizeUrl;
  function ModuleRequireVisitor(reporter) {
    $__superCall(this, $__ModuleRequireVisitor__proto, "constructor", []);
    this.urls_ = Object.create(null);
  }
  var $__ModuleRequireVisitor__super = ParseTreeVisitor;
  var $__ModuleRequireVisitor__proto = $__getProtoParent($__ModuleRequireVisitor__super);
  ($__class)(ModuleRequireVisitor, {
    get requireUrls() {
      return Object.keys(this.urls_);
    },
    visitModuleSpecifier: function(tree) {
      this.urls_[canonicalizeUrl(tree.token.processedValue)] = true;
    }
  }, {}, $__ModuleRequireVisitor__super, $__ModuleRequireVisitor__proto);
  return Object.preventExtensions(Object.create(null, {ModuleRequireVisitor: {
      get: function() {
        return ModuleRequireVisitor;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/outputgeneration/ProjectWriter.js", function() {
  "use strict";
  var TreeWriter = System.get("../src/outputgeneration/TreeWriter.js").TreeWriter;
  function ProjectWriter() {}
  ($__class)(ProjectWriter, {}, {});
  ProjectWriter.write = function(results) {
    var options = arguments[1];
    return results.keys().map((function(file) {
      return TreeWriter.write(results.get(file), options);
    })).join('');
  };
  return Object.preventExtensions(Object.create(null, {ProjectWriter: {
      get: function() {
        return ProjectWriter;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/outputgeneration/SourceMapIntegration.js", function() {
  "use strict";
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
      return aPath.indexOf(aRoot + '/') === 0 ? aPath.substr(aRoot.length + 1): aPath;
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
      return aValue < 0 ? ((- aValue) << 1) + 1: (aValue << 1) + 0;
    }
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative ? - shifted: shifted;
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
        return aLow < 0 ? null: aHaystack[aLow];
      }
    }
    exports.search = function search(aNeedle, aHaystack, aCompare) {
      return aHaystack.length > 0 ? recursiveSearch(- 1, aHaystack.length, aNeedle, aHaystack, aCompare): null;
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
      if (aGenerated && 'line'in aGenerated && 'column'in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
        return;
      } else if (aGenerated && 'line'in aGenerated && 'column'in aGenerated && aOriginal && 'line'in aOriginal && 'column'in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
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
        return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key]: null;
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
          return this.sourceRoot ? util.join(this.sourceRoot, s): s;
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
      this.line = aLine === undefined ? null: aLine;
      this.column = aColumn === undefined ? null: aColumn;
      this.source = aSource === undefined ? null: aSource;
      this.name = aName === undefined ? null: aName;
      if (aChunks != null) this.add(aChunks);
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
        if (this.children[i]instanceof SourceNode) {
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
  return Object.preventExtensions(Object.create(null, {
    SourceMapGenerator: {
      get: function() {
        return SourceMapGenerator;
      },
      enumerable: true
    },
    SourceMapConsumer: {
      get: function() {
        return SourceMapConsumer;
      },
      enumerable: true
    },
    SourceNode: {
      get: function() {
        return SourceNode;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/runtime/WebLoader.js", function() {
  "use strict";
  function WebLoader() {}
  ($__class)(WebLoader, {
    load: function(url, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        if (xhr.status == 200 || xhr.status == 0) {
          callback(xhr.responseText);
        } else {
          errback();
        }
        xhr = null;
      };
      xhr.onerror = function() {
        errback();
      };
      xhr.open('GET', url, true);
      xhr.send();
      return (function() {
        return xhr && xhr.abort();
      });
    },
    loadSync: function(url) {
      var xhr = new XMLHttpRequest();
      xhr.onerror = function(e) {
        throw new Error(xhr.statusText);
      };
      xhr.open('GET', url, false);
      xhr.send();
      if (xhr.status == 200 || xhr.status == 0) return xhr.responseText;
    }
  }, {});
  return Object.preventExtensions(Object.create(null, {WebLoader: {
      get: function() {
        return WebLoader;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/runtime/module-loader.js", function() {
  "use strict";
  var ArrayMap = System.get("../src/util/ArrayMap.js").ArrayMap;
  var ModuleAnalyzer = System.get("../src/semantics/ModuleAnalyzer.js").ModuleAnalyzer;
  var ModuleRequireVisitor = System.get("../src/codegeneration/module/ModuleRequireVisitor.js").ModuleRequireVisitor;
  var ModuleSymbol = System.get("../src/semantics/symbols/ModuleSymbol.js").ModuleSymbol;
  var ObjectMap = System.get("../src/util/ObjectMap.js").ObjectMap;
  var Parser = System.get("../src/syntax/Parser.js").Parser;
  var ProgramTransformer = System.get("../src/codegeneration/ProgramTransformer.js").ProgramTransformer;
  var Project = System.get("../src/semantics/symbols/Project.js").Project;
  var SourceFile = System.get("../src/syntax/SourceFile.js").SourceFile;
  var TreeWriter = System.get("../src/outputgeneration/TreeWriter.js").TreeWriter;
  var WebLoader = System.get("../src/runtime/WebLoader.js").WebLoader;
  var assert = System.get("../src/util/assert.js").assert;
  var getUid = System.get("../src/util/uid.js").getUid;
  var isStandardModuleUrl = System.get("../src/util/url.js").isStandardModuleUrl;
  var base = Object.freeze(Object.create(null, {
    Array: {value: Array},
    Boolean: {value: Boolean},
    Date: {value: Date},
    Error: {value: Error},
    EvalError: {value: EvalError},
    Function: {value: Function},
    JSON: {value: JSON},
    Math: {value: Math},
    Number: {value: Number},
    Object: {value: Object},
    RangeError: {value: RangeError},
    ReferenceError: {value: ReferenceError},
    RegExp: {value: RegExp},
    String: {value: String},
    SyntaxError: {value: SyntaxError},
    TypeError: {value: TypeError},
    URIError: {value: URIError},
    undefined: {value: void 0}
  }));
  var NOT_STARTED = 0;
  var LOADING = 1;
  var LOADED = 2;
  var PARSED = 3;
  var TRANSFORMED = 4;
  var COMPLETE = 5;
  var ERROR = 6;
  function CodeUnit(loader, url, type, state) {
    this.loader = loader;
    this.url = url;
    this.type = type;
    this.state = state;
    this.uid = getUid();
    this.state_ = NOT_STARTED;
  }
  ($__class)(CodeUnit, {
    get state() {
      return this.state_;
    },
    set state(state) {
      if (state < this.state_) {
        throw new Error('Invalid state change');
      }
      this.state_ = state;
    },
    get reporter() {
      return this.loader.reporter;
    },
    get project() {
      return this.loader.project;
    },
    get tree() {
      return this.project.getParseTree(this.file);
    },
    get moduleSymbol() {
      return this.project.getRootModule();
    },
    addListener: function(callback, errback) {
      if (this.state >= COMPLETE) throw Error((this.url + " is already loaded"));
      if (!this.listeners) {
        this.listeners = [];
      }
      this.listeners.push(callback, errback);
    },
    dispatchError: function(value) {
      this.dispatch_(value, 1);
    },
    dispatchComplete: function(value) {
      this.dispatch_(value, 0);
    },
    dispatch_: function(value, error) {
      var listeners = this.listeners;
      if (!listeners) {
        return;
      }
      listeners = listeners.concat();
      this.listeners = [];
      for (var i = error; i < listeners.length; i += 2) {
        var f = listeners[i];
        if (f) {
          f(value);
        }
      }
    },
    parse: function() {
      var reporter = this.reporter;
      var project = this.project;
      var url = this.url;
      var program = this.text;
      var file = new SourceFile(url, program);
      project.addFile(file);
      this.file = file;
      var parser = new Parser(reporter, file);
      var tree;
      if (this.type == 'module') tree = parser.parseModule(); else tree = parser.parseScript();
      if (reporter.hadError()) {
        this.error = 'Parse error';
        return false;
      }
      project.setParseTree(file, tree);
      this.state = PARSED;
      return true;
    },
    transform: function() {
      return ProgramTransformer.transformFile(this.reporter, this.project, this.file);
    }
  }, {});
  function LoadCodeUnit(loader, url) {
    $__superCall(this, $__LoadCodeUnit__proto, "constructor", [loader, url, 'module', NOT_STARTED]);
    if (isStandardModuleUrl(url)) {
      this.state = COMPLETE;
      this.dependencies = [];
    }
  }
  var $__LoadCodeUnit__super = CodeUnit;
  var $__LoadCodeUnit__proto = $__getProtoParent($__LoadCodeUnit__super);
  ($__class)(LoadCodeUnit, {
    get moduleSymbol() {
      return this.project.getModuleForUrl(this.url);
    },
    parse: function() {
      if (!$__superCall(this, $__LoadCodeUnit__proto, "parse", [])) {
        return false;
      }
      var project = this.loader.project;
      var tree = this.tree;
      var url = this.url;
      var moduleSymbol = new ModuleSymbol(tree, url);
      project.addExternalModule(moduleSymbol);
      return true;
    },
    transform: function() {
      if (this.type === 'module') {
        return ProgramTransformer.transformFileAsModule(this.reporter, this.project, this.moduleSymbol, this.file);
      }
      return ProgramTransformer.transformFile(this.reporter, this.project, this.file);
    }
  }, {}, $__LoadCodeUnit__super, $__LoadCodeUnit__proto);
  function EvalCodeUnit(loader, code) {
    $__superCall(this, $__EvalCodeUnit__proto, "constructor", [loader, loader.url, 'script', LOADED]);
    this.text = code;
  }
  var $__EvalCodeUnit__super = CodeUnit;
  var $__EvalCodeUnit__proto = $__getProtoParent($__EvalCodeUnit__super);
  ($__class)(EvalCodeUnit, {}, {}, $__EvalCodeUnit__super, $__EvalCodeUnit__proto);
  function InternalLoader(reporter, project) {
    var fileLoader = arguments[2] !== (void 0) ? arguments[2]: new InternalLoader.FileLoader;
    var options = arguments[3] !== (void 0) ? arguments[3]: {};
    this.reporter = reporter;
    this.project = project;
    this.fileLoader = fileLoader;
    this.cache = new ArrayMap();
    this.urlToKey = Object.create(null);
    this.sync_ = false;
    this.translateHook = options.translate || defaultTranslate;
  }
  ($__class)(InternalLoader, {
    get url() {
      return this.project.url;
    },
    loadTextFile: function(url, callback, errback) {
      return this.fileLoader.load(url, callback, errback);
    },
    loadTextFileSync: function(url) {
      return this.fileLoader.loadSync(url);
    },
    load: function(url) {
      var type = arguments[1] !== (void 0) ? arguments[1]: 'script';
      url = System.normalResolve(url, this.url);
      var codeUnit = this.getCodeUnit(url, type);
      if (codeUnit.state != NOT_STARTED || codeUnit.state == ERROR) {
        return codeUnit;
      }
      codeUnit.state = LOADING;
      if (this.sync_) {
        try {
          codeUnit.text = this.loadTextFileSync(url);
          codeUnit.state = LOADED;
          this.handleCodeUnitLoaded(codeUnit);
        } catch (e) {
          codeUnit.state = ERROR;
          this.handleCodeUnitLoadError(codeUnit);
        }
        return codeUnit;
      }
      var loader = this;
      var translate = this.translateHook;
      codeUnit.abort = this.loadTextFile(url, function(text) {
        codeUnit.text = translate(text);
        codeUnit.state = LOADED;
        loader.handleCodeUnitLoaded(codeUnit);
      }, function() {
        codeUnit.state = ERROR;
        loader.handleCodeUnitLoadError(codeUnit);
      });
      return codeUnit;
    },
    loadSync: function(url) {
      var type = arguments[1] !== (void 0) ? arguments[1]: 'script';
      this.sync_ = true;
      var loaded = this.load(url, type);
      this.sync_ = false;
      return loaded;
    },
    evalAsync: function(code) {
      var codeUnit = new EvalCodeUnit(this, code);
      this.cache.set({}, codeUnit);
      return codeUnit;
    },
    eval: function(code) {
      var codeUnit = new EvalCodeUnit(this, code);
      this.cache.set({}, codeUnit);
      this.handleCodeUnitLoaded(codeUnit);
      return codeUnit;
    },
    getKey: function(url, type) {
      var combined = type + ':' + url;
      if (combined in this.urlToKey) {
        return this.urlToKey[combined];
      }
      return this.urlToKey[combined] = {};
    },
    getCodeUnit: function(url, type) {
      var key = this.getKey(url, type);
      var cacheObject = this.cache.get(key);
      if (!cacheObject) {
        cacheObject = new LoadCodeUnit(this, url);
        cacheObject.type = type;
        this.cache.set(key, cacheObject);
      }
      return cacheObject;
    },
    areAll: function(state) {
      return this.cache.values().every((function(codeUnit) {
        return codeUnit.state >= state;
      }));
    },
    handleCodeUnitLoaded: function(codeUnit) {
      if (!codeUnit.parse()) {
        this.abortAll();
        return;
      }
      var requireVisitor = new ModuleRequireVisitor(this.reporter);
      requireVisitor.visit(codeUnit.tree);
      var baseUrl = codeUnit.url;
      codeUnit.dependencies = requireVisitor.requireUrls.sort().map((function(url) {
        url = System.normalResolve(url, baseUrl);
        return this.getCodeUnit(url, 'module');
      }).bind(this));
      codeUnit.dependencies.forEach((function(dependency) {
        this.load(dependency.url, 'module');
      }).bind(this));
      if (this.areAll(PARSED)) {
        this.analyze();
        this.transform();
        this.evaluate();
      }
    },
    handleCodeUnitLoadError: function(codeUnit) {
      codeUnit.error = 'Failed to load \'' + codeUnit.url + '\'';
      this.reporter.reportError(null, codeUnit.error);
      this.abortAll();
    },
    abortAll: function() {
      this.cache.values().forEach((function(codeUnit) {
        if (codeUnit.abort) {
          codeUnit.abort();
          codeUnit.state = ERROR;
        }
      }));
      this.cache.values().forEach((function(codeUnit) {
        codeUnit.dispatchError(codeUnit.error);
      }));
    },
    analyze: function() {
      var dependencies = this.cache.values();
      var trees = [];
      var modules = [];
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        assert(codeUnit.state >= PARSED);
        if (codeUnit.state == PARSED) {
          trees.push(codeUnit.tree);
          modules.push(codeUnit.moduleSymbol);
        }
      }
      var analyzer = new ModuleAnalyzer(this.reporter, this.project);
      analyzer.analyzeTrees(trees, modules);
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
          if (codeUnit.state == ERROR) {
            codeUnit.dispatchError('Failed to analyze');
          }
        }
      }
    },
    transform: function() {
      this.transformDependencies(this.cache.values());
    },
    transformDependencies: function(dependencies) {
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= TRANSFORMED) {
          continue;
        }
        codeUnit.transformedTree = this.transformCodeUnit(codeUnit);
        codeUnit.state = TRANSFORMED;
      }
    },
    transformCodeUnit: function(codeUnit) {
      this.transformDependencies(codeUnit.dependencies);
      var results = codeUnit.transform();
      return results.get(codeUnit.file);
    },
    evaluate: function() {
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
      var dependencies = ordered;
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        var result;
        try {
          result = this.evalCodeUnit(codeUnit);
        } catch (ex) {
          codeUnit.error = ex;
          this.reporter.reportError(null, String(ex));
          this.abortAll();
          return;
        }
        codeUnit.result = result;
        codeUnit.transformedTree = null;
        codeUnit.text = null;
      }
      for (var i = 0; i < dependencies.length; i++) {
        var codeUnit = dependencies[i];
        if (codeUnit.state >= COMPLETE) {
          continue;
        }
        codeUnit.state = COMPLETE;
        codeUnit.dispatchComplete(codeUnit.result);
      }
    },
    evalCodeUnit: function(codeUnit) {
      return ('global', eval)(TreeWriter.write(codeUnit.transformedTree));
    }
  }, {
    set FileLoader(v) {
      FileLoader = v;
    },
    get FileLoader() {
      return FileLoader;
    }
  });
  var FileLoader = WebLoader;
  function defaultTranslate(source) {
    return source;
  }
  function CodeLoader(reporter, project, parentLoader) {
    var options = arguments[3] !== (void 0) ? arguments[3]: {};
    this.internalLoader_ = new InternalLoader(reporter, project, undefined, options);
  }
  ($__class)(CodeLoader, {
    load: function(url) {
      var callback = arguments[1] !== (void 0) ? arguments[1]: (function(result) {});
      var errback = arguments[2] !== (void 0) ? arguments[2]: (function(ex) {
        throw ex;
      });
      var codeUnit = this.internalLoader_.load(url, 'script');
      codeUnit.addListener(function(result) {
        callback(result);
      }, errback);
    },
    eval: function(program) {
      var codeUnit = this.internalLoader_.eval(program);
      return codeUnit.result;
    },
    evalAsync: function(program, callback) {
      var errback = arguments[2];
      var codeUnit = this.internalLoader_.evalAsync(program);
      codeUnit.addListener(callback, errback);
      this.internalLoader_.handleCodeUnitLoaded(codeUnit);
    },
    import: function(url) {
      var callback = arguments[1] !== (void 0) ? arguments[1]: (function(module) {});
      var errback = arguments[2] !== (void 0) ? arguments[2]: (function(ex) {
        throw ex;
      });
      var codeUnit = this.internalLoader_.load(url, 'module');
      codeUnit.addListener(function() {
        callback(System.get(codeUnit.url));
      }, errback);
    },
    defineGlobal: function(name, value) {
      throw Error('Not implemented');
    },
    defineModule: function(name, moduleInstanceObject) {
      var cacheKey = arguments[2];
      throw Error('Not implemented');
    },
    create: function(moduleInstanceObject) {
      var resolver = arguments[1];
      var url = this.project_.url;
      var project = new Project(url);
      var loader = new CodeLoader(this.reporter, project, this, resolver);
      return loader;
    },
    createBase: function() {
      return base;
    }
  }, {});
  var internals = {
    CodeUnit: CodeUnit,
    EvalCodeUnit: EvalCodeUnit,
    InternalLoader: InternalLoader,
    LoadCodeUnit: LoadCodeUnit
  };
  return Object.preventExtensions(Object.create(null, {
    CodeLoader: {
      get: function() {
        return CodeLoader;
      },
      enumerable: true
    },
    internals: {
      get: function() {
        return internals;
      },
      enumerable: true
    }
  }));
}, this);
System.get('@traceur/module').registerModule("../src/util/TestErrorReporter.js", function() {
  "use strict";
  var ErrorReporter = System.get("../src/util/ErrorReporter.js").ErrorReporter;
  function TestErrorReporter() {
    this.errors = [];
  }
  ($__class)(TestErrorReporter, {
    reportMessageInternal: function(location, format, args) {
      this.errors.push(ErrorReporter.format(location, format, args));
    },
    hasMatchingError: function(expected) {
      return this.errors.some((function(error) {
        return error.indexOf(expected) !== - 1;
      }));
    }
  }, {}, ErrorReporter);
  return Object.preventExtensions(Object.create(null, {TestErrorReporter: {
      get: function() {
        return TestErrorReporter;
      },
      enumerable: true
    }}));
}, this);
System.get('@traceur/module').registerModule("../src/traceur.js", function() {
  "use strict";
  var $___46__47_options__ = System.get("../src/options.js");
  var $___46__47_WebPageProject__ = System.get("../src/WebPageProject.js");
  var ModuleAnalyzer = System.get("../src/semantics/ModuleAnalyzer.js").ModuleAnalyzer;
  var Project = System.get("../src/semantics/symbols/Project.js").Project;
  var semantics = {
    ModuleAnalyzer: ModuleAnalyzer,
    symbols: {Project: Project}
  };
  var ErrorReporter = System.get("../src/util/ErrorReporter.js").ErrorReporter;
  var SourcePosition = System.get("../src/util/SourcePosition.js").SourcePosition;
  var TestErrorReporter = System.get("../src/util/TestErrorReporter.js").TestErrorReporter;
  var resolveUrl = System.get("../src/util/url.js").resolveUrl;
  var util = {
    ErrorReporter: ErrorReporter,
    SourcePosition: SourcePosition,
    TestErrorReporter: TestErrorReporter,
    resolveUrl: resolveUrl
  };
  var IdentifierToken = System.get("../src/syntax/IdentifierToken.js").IdentifierToken;
  var LiteralToken = System.get("../src/syntax/LiteralToken.js").LiteralToken;
  var Parser = System.get("../src/syntax/Parser.js").Parser;
  var Scanner = System.get("../src/syntax/Scanner.js").Scanner;
  var SourceFile = System.get("../src/syntax/SourceFile.js").SourceFile;
  var Token = System.get("../src/syntax/Token.js").Token;
  var TokenType = System.get("../src/syntax/TokenType.js");
  var trees = System.get("../src/syntax/trees/ParseTrees.js");
  var syntax = {
    IdentifierToken: IdentifierToken,
    LiteralToken: LiteralToken,
    Parser: Parser,
    Scanner: Scanner,
    SourceFile: SourceFile,
    Token: Token,
    TokenType: TokenType,
    trees: trees
  };
  var ParseTreeWriter = System.get("../src/outputgeneration/ParseTreeWriter.js").ParseTreeWriter;
  var ParseTreeMapWriter = System.get("../src/outputgeneration/ParseTreeMapWriter.js").ParseTreeMapWriter;
  var ProjectWriter = System.get("../src/outputgeneration/ProjectWriter.js").ProjectWriter;
  var SourceMapConsumer = System.get("../src/outputgeneration/SourceMapIntegration.js").SourceMapConsumer;
  var SourceMapGenerator = System.get("../src/outputgeneration/SourceMapIntegration.js").SourceMapGenerator;
  var TreeWriter = System.get("../src/outputgeneration/TreeWriter.js").TreeWriter;
  var outputgeneration = {
    ParseTreeWriter: ParseTreeWriter,
    ParseTreeMapWriter: ParseTreeMapWriter,
    ProjectWriter: ProjectWriter,
    SourceMapConsumer: SourceMapConsumer,
    SourceMapGenerator: SourceMapGenerator,
    TreeWriter: TreeWriter
  };
  var Compiler = System.get("../src/codegeneration/Compiler.js").Compiler;
  var ModuleTransformer = System.get("../src/codegeneration/ModuleTransformer.js").ModuleTransformer;
  var ParseTreeTransformer = System.get("../src/codegeneration/ParseTreeTransformer.js").ParseTreeTransformer;
  var ProgramTransformer = System.get("../src/codegeneration/ProgramTransformer.js").ProgramTransformer;
  var CloneTreeTransformer = System.get("../src/codegeneration/CloneTreeTransformer.js").CloneTreeTransformer;
  var ParseTreeFactory = System.get("../src/codegeneration/ParseTreeFactory.js");
  var ModuleRequireVisitor = System.get("../src/codegeneration/module/ModuleRequireVisitor.js").ModuleRequireVisitor;
  var codegeneration = {
    Compiler: Compiler,
    ModuleTransformer: ModuleTransformer,
    ParseTreeTransformer: ParseTreeTransformer,
    ProgramTransformer: ProgramTransformer,
    CloneTreeTransformer: CloneTreeTransformer,
    ParseTreeFactory: ParseTreeFactory,
    module: {ModuleRequireVisitor: ModuleRequireVisitor}
  };
  var modules = System.get("../src/runtime/module-loader.js");
  ;
  return Object.preventExtensions(Object.create(null, {
    options: {
      get: function() {
        return $___46__47_options__.options;
      },
      enumerable: true
    },
    WebPageProject: {
      get: function() {
        return $___46__47_WebPageProject__.WebPageProject;
      },
      enumerable: true
    },
    semantics: {
      get: function() {
        return semantics;
      },
      enumerable: true
    },
    util: {
      get: function() {
        return util;
      },
      enumerable: true
    },
    syntax: {
      get: function() {
        return syntax;
      },
      enumerable: true
    },
    outputgeneration: {
      get: function() {
        return outputgeneration;
      },
      enumerable: true
    },
    codegeneration: {
      get: function() {
        return codegeneration;
      },
      enumerable: true
    },
    modules: {
      get: function() {
        return modules;
      },
      enumerable: true
    }
  }));
}, this);
var traceur = System.get("../src/traceur.js");
