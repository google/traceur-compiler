var $__getDescriptors = function(object) {
  var descriptors = {}, name, names = Object.getOwnPropertyNames(object);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    descriptors[name] = Object.getOwnPropertyDescriptor(object, name);
  }
  return descriptors;
}, $__createClassNoExtends = function(object, staticObject) {
  var ctor = object.constructor;
  Object.defineProperty(object, 'constructor', {enumerable: false});
  ctor.prototype = object;
  Object.defineProperties(ctor, $__getDescriptors(staticObject));
  return ctor;
}, $__superDescriptor = function(proto, name) {
  if (!proto) throw new TypeError('super is null');
  return Object.getPropertyDescriptor(proto, name);
}, $__superCall = function(self, proto, name, args) {
  var descriptor = $__superDescriptor(proto, name);
  if (descriptor) {
    if ('value'in descriptor) return descriptor.value.apply(self, args);
    if (descriptor.get) return descriptor.get.call(self).apply(self, args);
  }
  throw new TypeError("Object has no method '" + name + "'.");
}, $__getProtoParent = function(superClass) {
  if (typeof superClass === 'function') {
    var prototype = superClass.prototype;
    if (Object(prototype) === prototype || prototype === null) return superClass.prototype;
  }
  if (superClass === null) return null;
  throw new TypeError();
}, $__createClass = function(object, staticObject, protoParent, superClass, hasConstructor) {
  var ctor = object.constructor;
  if (typeof superClass === 'function') ctor.__proto__ = superClass;
  if (!hasConstructor && protoParent === null) ctor = object.constructor = function() {};
  var descriptors = $__getDescriptors(object);
  descriptors.constructor.enumerable = false;
  ctor.prototype = Object.create(protoParent, descriptors);
  Object.defineProperties(ctor, $__getDescriptors(staticObject));
  return ctor;
}, $__superGet = function(self, proto, name) {
  var descriptor = $__superDescriptor(proto, name);
  if (descriptor) {
    if (descriptor.get) return descriptor.get.call(self); else if ('value'in descriptor) return descriptor.value;
  }
  return undefined;
}, $__toObject = function(value) {
  if (value == null) throw TypeError();
  return Object(value);
}, $__spread = function() {
  var rv = [], k = 0;
  for (var i = 0; i < arguments.length; i++) {
    var value = $__toObject(arguments[i]);
    for (var j = 0; j < value.length; j++) {
      rv[k++] = value[j];
    }
  }
  return rv;
};
var $__21, $__22, $__23, $__24, $__25, $__26, $__27, $__28, $__29, $__30, $__31, $__32, $__33, $__34, $__35, $__36, $__37, $__38, $__39, $__40;
(function(global) {
  'use strict';
  var $create = Object.create;
  var $defineProperty = Object.defineProperty;
  var $freeze = Object.freeze;
  var $getOwnPropertyNames = Object.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
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
    Object.defineProperties(String.prototype, {
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
      })
    });
    $defineProperty(String, 'raw', {
      value: function(callsite) {
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
      },
      configurable: true,
      enumerable: false,
      writable: true
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
  function elementDelete(object, name) {
    if (traceur.options.trapMemberLookup && hasPrivateNameProperty(object, elementDeleteName)) {
      return getProperty(object, elementDeleteName).call(object, name);
    }
    return deleteProperty(object, name);
  }
  function elementGet(object, name) {
    if (traceur.options.trapMemberLookup && hasPrivateNameProperty(object, elementGetName)) {
      return getProperty(object, elementGetName).call(object, name);
    }
    return getProperty(object, name);
  }
  function elementHas(object, name) {
    return has(object, name);
  }
  function elementSet(object, name, value) {
    if (traceur.options.trapMemberLookup && hasPrivateNameProperty(object, elementSetName)) {
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
  }
  function $getPropertyDescriptor(obj, name) {
    while (obj !== null) {
      var result = Object.getOwnPropertyDescriptor(obj, name);
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
  }
  var iteratorName = new Name('iterator');
  var IterModule = {
    get iterator() {
      return iteratorName;
    },
    isStopIteration: isStopIteration
  };
  function getIterator(collection) {
    return getProperty(collection, iteratorName).call(collection);
  }
  function returnThis() {
    return this;
  }
  function addIterator(object) {
    setProperty(object, iteratorName, returnThis);
    return object;
  }
  function polyfillArray(Array) {
    defineProperty(Array.prototype, IterModule.iterator, method(function() {
      var index = 0;
      var array = this;
      return {next: function() {
          if (index < array.length) {
            return array[index++];
          }
          throw StopIterationLocal;
        }};
    }));
  }
  var GeneratorReturnLocal;
  function setGeneratorReturn(GeneratorReturn, global) {
    switch (typeof GeneratorReturn) {
      case 'function':
        if (typeof GeneratorReturnLocal === 'function' && StopIterationLocal instanceof GeneratorReturnLocal) {
          GeneratorReturnLocal = GeneratorReturn;
          setStopIteration(undefined, global);
          return;
        }
        GeneratorReturnLocal = GeneratorReturn;
        return;
      case 'undefined':
        GeneratorReturnLocal = function(v) {
          this.value = v;
        };
        GeneratorReturnLocal.prototype = {toString: function() {
            return '[object GeneratorReturn ' + this.value + ']';
          }};
        return;
      default:
        throw new TypeError('constructor function required');
    }
  }
  setGeneratorReturn();
  var StopIterationLocal;
  function isStopIteration(x) {
    return x === StopIterationLocal || x instanceof GeneratorReturnLocal;
  }
  function setStopIteration(StopIteration, global) {
    switch (typeof StopIteration) {
      case 'object':
        StopIterationLocal = StopIteration;
        break;
      case 'undefined':
        StopIterationLocal = new GeneratorReturnLocal();
        StopIterationLocal.toString = function() {
          return '[object StopIteration]';
        };
        break;
      default:
        throw new TypeError('invalid StopIteration type.');
    }
    if (global) global.StopIteration = StopIterationLocal;
  }
  setStopIteration(global.StopIteration, global);
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
  var modules = $freeze({
    get'@name'() {
      return NameModule;
    },
    get'@iter'() {
      return IterModule;
    }
  });
  global.Deferred = Deferred;
  function setupGlobals(global) {
    polyfillString(global.String);
    polyfillObject(global.Object);
    polyfillArray(global.Array);
  }
  setupGlobals(global);
  var runtime = {
    Deferred: Deferred,
    get GeneratorReturn() {
      return GeneratorReturnLocal;
    },
    setGeneratorReturn: setGeneratorReturn,
    get StopIteration() {
      return StopIterationLocal;
    },
    setStopIteration: setStopIteration,
    isStopIteration: isStopIteration,
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
    modules: modules
  };
  global.$traceurRuntime = runtime;
})(typeof global !== 'undefined' ? global: this);
var $___src_util_url_js = (function() {
  "use strict";
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
  function resolveUrl(base, url) {
    if (url[0] === '@') return url;
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
  return Object.preventExtensions(Object.create(null, {
    removeDotSegments: {
      get: function() {
        return removeDotSegments;
      },
      enumerable: true
    },
    canonicalizeUrl: {
      get: function() {
        return canonicalizeUrl;
      },
      enumerable: true
    },
    resolveUrl: {
      get: function() {
        return resolveUrl;
      },
      enumerable: true
    }
  }));
}).call(this);
var $___src_runtime_get_module_js = (function() {
  "use strict";
  var resolveUrl = $___src_util_url_js.resolveUrl;
  var currentCodeUnit;
  var standardModuleUrlRegExp = /^@\w+$/;
  function getModuleInstanceByUrl(url) {
    if (standardModuleUrlRegExp.test(url)) return $traceurRuntime.modules[url] || null;
    url = resolveUrl(currentCodeUnit.url, url);
    for (var i = 0; i < currentCodeUnit.dependencies.length; i++) {
      if (currentCodeUnit.dependencies[i].url == url) {
        return currentCodeUnit.dependencies[i].result;
      }
    }
    return null;
  }
  function getCurrentCodeUnit() {
    return currentCodeUnit;
  }
  function setCurrentCodeUnit(codeUnit) {
    currentCodeUnit = codeUnit;
  }
  return Object.preventExtensions(Object.create(null, {
    standardModuleUrlRegExp: {
      get: function() {
        return standardModuleUrlRegExp;
      },
      enumerable: true
    },
    getModuleInstanceByUrl: {
      get: function() {
        return getModuleInstanceByUrl;
      },
      enumerable: true
    },
    getCurrentCodeUnit: {
      get: function() {
        return getCurrentCodeUnit;
      },
      enumerable: true
    },
    setCurrentCodeUnit: {
      get: function() {
        return setCurrentCodeUnit;
      },
      enumerable: true
    }
  }));
}).call(this);
var modules = $___src_runtime_get_module_js;
(function(global) {
  'use strict';
  global.$traceurModules = modules;
})(typeof global !== 'undefined' ? global: this);
var $___src_options_js = (function() {
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
  addFeatureOption('defaultParameters', ON_BY_DEFAULT);
  addFeatureOption('destructuring', ON_BY_DEFAULT);
  addFeatureOption('forOf', ON_BY_DEFAULT);
  addFeatureOption('propertyMethods', ON_BY_DEFAULT);
  addFeatureOption('propertyNameShorthand', ON_BY_DEFAULT);
  addFeatureOption('templateLiterals', ON_BY_DEFAULT);
  addFeatureOption('restParameters', ON_BY_DEFAULT);
  addFeatureOption('spread', ON_BY_DEFAULT);
  addFeatureOption('generatorComprehension', ON_BY_DEFAULT);
  addFeatureOption('generators', ON_BY_DEFAULT);
  addFeatureOption('modules', ON_BY_DEFAULT);
  addFeatureOption('blockBinding', EXPERIMENTAL);
  addFeatureOption('privateNameSyntax', EXPERIMENTAL);
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
}).call(this);
var $___src_semantics_symbols_SymbolType_js = (function() {
  "use strict";
  var SymbolType = {
    EXPORT: 'EXPORT',
    MODULE: 'MODULE'
  };
  return Object.preventExtensions(Object.create(null, {SymbolType: {
      get: function() {
        return SymbolType;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_symbols_Symbol_js = (function() {
  "use strict";
  var SymbolType = $___src_semantics_symbols_SymbolType_js.SymbolType;
  var Symbol = function() {
    'use strict';
    var $Symbol = ($__createClassNoExtends)({
      constructor: function(type, tree, name) {
        this.type = type;
        this.tree = tree;
        this.name = name;
      },
      asExport: function() {
        traceur.assert(this.type == SymbolType.EXPORT);
        return this;
      },
      asModuleSymbol: function() {
        traceur.assert(this.type == SymbolType.MODULE);
        return this;
      }
    }, {});
    return $Symbol;
  }();
  return Object.preventExtensions(Object.create(null, {Symbol: {
      get: function() {
        return Symbol;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_symbols_ExportSymbol_js = (function() {
  "use strict";
  var Symbol = $___src_semantics_symbols_Symbol_js.Symbol;
  var SymbolType = $___src_semantics_symbols_SymbolType_js.SymbolType;
  var ExportSymbol = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportSymbol = ($__createClass)({constructor: function(tree, name, relatedTree) {
        $__superCall(this, $__proto, "constructor", [SymbolType.EXPORT, tree, name]);
        this.relatedTree = relatedTree;
      }}, {}, $__proto, $__super, true);
    return $ExportSymbol;
  }(Symbol);
  return Object.preventExtensions(Object.create(null, {ExportSymbol: {
      get: function() {
        return ExportSymbol;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_trees_ParseTreeType_js = (function() {
  "use strict";
  var ARGUMENT_LIST = 'ARGUMENT_LIST';
  var ARRAY_COMPREHENSION = 'ARRAY_COMPREHENSION';
  var ARRAY_LITERAL_EXPRESSION = 'ARRAY_LITERAL_EXPRESSION';
  var ARRAY_PATTERN = 'ARRAY_PATTERN';
  var ARROW_FUNCTION_EXPRESSION = 'ARROW_FUNCTION_EXPRESSION';
  var AT_NAME_DECLARATION = 'AT_NAME_DECLARATION';
  var AT_NAME_EXPRESSION = 'AT_NAME_EXPRESSION';
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
  var CONDITIONAL_EXPRESSION = 'CONDITIONAL_EXPRESSION';
  var CONTINUE_STATEMENT = 'CONTINUE_STATEMENT';
  var COVER_FORMALS = 'COVER_FORMALS';
  var DEBUGGER_STATEMENT = 'DEBUGGER_STATEMENT';
  var DEFAULT_CLAUSE = 'DEFAULT_CLAUSE';
  var DO_WHILE_STATEMENT = 'DO_WHILE_STATEMENT';
  var EMPTY_STATEMENT = 'EMPTY_STATEMENT';
  var EXPORT_DECLARATION = 'EXPORT_DECLARATION';
  var EXPORT_MAPPING = 'EXPORT_MAPPING';
  var EXPORT_MAPPING_LIST = 'EXPORT_MAPPING_LIST';
  var EXPORT_SPECIFIER = 'EXPORT_SPECIFIER';
  var EXPORT_SPECIFIER_SET = 'EXPORT_SPECIFIER_SET';
  var EXPORT_STAR = 'EXPORT_STAR';
  var EXPRESSION_STATEMENT = 'EXPRESSION_STATEMENT';
  var FINALLY = 'FINALLY';
  var FOR_IN_STATEMENT = 'FOR_IN_STATEMENT';
  var FOR_OF_STATEMENT = 'FOR_OF_STATEMENT';
  var FOR_STATEMENT = 'FOR_STATEMENT';
  var FORMAL_PARAMETER_LIST = 'FORMAL_PARAMETER_LIST';
  var FUNCTION_DECLARATION = 'FUNCTION_DECLARATION';
  var FUNCTION_EXPRESSION = 'FUNCTION_EXPRESSION';
  var GENERATOR_COMPREHENSION = 'GENERATOR_COMPREHENSION';
  var GET_ACCESSOR = 'GET_ACCESSOR';
  var IDENTIFIER_EXPRESSION = 'IDENTIFIER_EXPRESSION';
  var IF_STATEMENT = 'IF_STATEMENT';
  var IMPORT_BINDING = 'IMPORT_BINDING';
  var IMPORT_DECLARATION = 'IMPORT_DECLARATION';
  var IMPORT_SPECIFIER = 'IMPORT_SPECIFIER';
  var IMPORT_SPECIFIER_SET = 'IMPORT_SPECIFIER_SET';
  var LABELLED_STATEMENT = 'LABELLED_STATEMENT';
  var LITERAL_EXPRESSION = 'LITERAL_EXPRESSION';
  var MEMBER_EXPRESSION = 'MEMBER_EXPRESSION';
  var MEMBER_LOOKUP_EXPRESSION = 'MEMBER_LOOKUP_EXPRESSION';
  var MODULE_DECLARATION = 'MODULE_DECLARATION';
  var MODULE_DEFINITION = 'MODULE_DEFINITION';
  var MODULE_EXPRESSION = 'MODULE_EXPRESSION';
  var MODULE_REQUIRE = 'MODULE_REQUIRE';
  var MODULE_SPECIFIER = 'MODULE_SPECIFIER';
  var NAME_STATEMENT = 'NAME_STATEMENT';
  var NEW_EXPRESSION = 'NEW_EXPRESSION';
  var OBJECT_LITERAL_EXPRESSION = 'OBJECT_LITERAL_EXPRESSION';
  var OBJECT_PATTERN = 'OBJECT_PATTERN';
  var OBJECT_PATTERN_FIELD = 'OBJECT_PATTERN_FIELD';
  var PAREN_EXPRESSION = 'PAREN_EXPRESSION';
  var POSTFIX_EXPRESSION = 'POSTFIX_EXPRESSION';
  var PREDEFINED_TYPE = 'PREDEFINED_TYPE';
  var PROGRAM = 'PROGRAM';
  var PROPERTY_METHOD_ASSIGNMENT = 'PROPERTY_METHOD_ASSIGNMENT';
  var PROPERTY_NAME_ASSIGNMENT = 'PROPERTY_NAME_ASSIGNMENT';
  var PROPERTY_NAME_SHORTHAND = 'PROPERTY_NAME_SHORTHAND';
  var REST_PARAMETER = 'REST_PARAMETER';
  var RETURN_STATEMENT = 'RETURN_STATEMENT';
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
    AT_NAME_DECLARATION: {
      get: function() {
        return AT_NAME_DECLARATION;
      },
      enumerable: true
    },
    AT_NAME_EXPRESSION: {
      get: function() {
        return AT_NAME_EXPRESSION;
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
    EXPORT_MAPPING: {
      get: function() {
        return EXPORT_MAPPING;
      },
      enumerable: true
    },
    EXPORT_MAPPING_LIST: {
      get: function() {
        return EXPORT_MAPPING_LIST;
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
    IMPORT_BINDING: {
      get: function() {
        return IMPORT_BINDING;
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
    MODULE_DECLARATION: {
      get: function() {
        return MODULE_DECLARATION;
      },
      enumerable: true
    },
    MODULE_DEFINITION: {
      get: function() {
        return MODULE_DEFINITION;
      },
      enumerable: true
    },
    MODULE_EXPRESSION: {
      get: function() {
        return MODULE_EXPRESSION;
      },
      enumerable: true
    },
    MODULE_REQUIRE: {
      get: function() {
        return MODULE_REQUIRE;
      },
      enumerable: true
    },
    MODULE_SPECIFIER: {
      get: function() {
        return MODULE_SPECIFIER;
      },
      enumerable: true
    },
    NAME_STATEMENT: {
      get: function() {
        return NAME_STATEMENT;
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
    PROGRAM: {
      get: function() {
        return PROGRAM;
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
}).call(this);
var $___src_syntax_TokenType_js = (function() {
  "use strict";
  var AMPERSAND = '&';
  var AMPERSAND_EQUAL = '&=';
  var AND = '&&';
  var ARROW = '=>';
  var AT_NAME = 'at name';
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
  var DOLLAR = '$';
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
    AT_NAME: {
      get: function() {
        return AT_NAME;
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
    DOLLAR: {
      get: function() {
        return DOLLAR;
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
}).call(this);
var $___src_syntax_Token_js = (function() {
  "use strict";
  var $__17 = $___src_syntax_TokenType_js, AMPERSAND_EQUAL = $__17.AMPERSAND_EQUAL, BAR_EQUAL = $__17.BAR_EQUAL, CARET_EQUAL = $__17.CARET_EQUAL, EQUAL = $__17.EQUAL, LEFT_SHIFT_EQUAL = $__17.LEFT_SHIFT_EQUAL, MINUS_EQUAL = $__17.MINUS_EQUAL, PERCENT_EQUAL = $__17.PERCENT_EQUAL, PLUS_EQUAL = $__17.PLUS_EQUAL, RIGHT_SHIFT_EQUAL = $__17.RIGHT_SHIFT_EQUAL, SLASH_EQUAL = $__17.SLASH_EQUAL, STAR_EQUAL = $__17.STAR_EQUAL, UNSIGNED_RIGHT_SHIFT_EQUAL = $__17.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var Token = function() {
    'use strict';
    var $Token = ($__createClassNoExtends)({
      constructor: function(type, location) {
        this.type = type;
        this.location = location;
      },
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
    return $Token;
  }();
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
}).call(this);
var $___src_util_JSON_js = (function() {
  "use strict";
  function transform(v) {
    var replacer = arguments[1] !== (void 0) ? arguments[1]: (function(k, v) {
      return v;
    });
    return transform_(replacer('', v), replacer);
  }
  function transform_(v, replacer) {
    var rv, tv;
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
}).call(this);
var $___src_syntax_trees_ParseTree_js = (function() {
  "use strict";
  var ParseTreeType = $___src_syntax_trees_ParseTreeType_js;
  var $__17 = ParseTreeType, ARGUMENT_LIST = $__17.ARGUMENT_LIST, ARRAY_COMPREHENSION = $__17.ARRAY_COMPREHENSION, ARRAY_LITERAL_EXPRESSION = $__17.ARRAY_LITERAL_EXPRESSION, ARRAY_PATTERN = $__17.ARRAY_PATTERN, ARROW_FUNCTION_EXPRESSION = $__17.ARROW_FUNCTION_EXPRESSION, AT_NAME_DECLARATION = $__17.AT_NAME_DECLARATION, AT_NAME_EXPRESSION = $__17.AT_NAME_EXPRESSION, AWAIT_STATEMENT = $__17.AWAIT_STATEMENT, BINARY_OPERATOR = $__17.BINARY_OPERATOR, BINDING_ELEMENT = $__17.BINDING_ELEMENT, BINDING_IDENTIFIER = $__17.BINDING_IDENTIFIER, BLOCK = $__17.BLOCK, BREAK_STATEMENT = $__17.BREAK_STATEMENT, CALL_EXPRESSION = $__17.CALL_EXPRESSION, CASCADE_EXPRESSION = $__17.CASCADE_EXPRESSION, CASE_CLAUSE = $__17.CASE_CLAUSE, CATCH = $__17.CATCH, CLASS_DECLARATION = $__17.CLASS_DECLARATION, CLASS_EXPRESSION = $__17.CLASS_EXPRESSION, COMMA_EXPRESSION = $__17.COMMA_EXPRESSION, COMPREHENSION_FOR = $__17.COMPREHENSION_FOR, COMPREHENSION_IF = $__17.COMPREHENSION_IF, CONDITIONAL_EXPRESSION = $__17.CONDITIONAL_EXPRESSION, CONTINUE_STATEMENT = $__17.CONTINUE_STATEMENT, COVER_FORMALS = $__17.COVER_FORMALS, DEBUGGER_STATEMENT = $__17.DEBUGGER_STATEMENT, DEFAULT_CLAUSE = $__17.DEFAULT_CLAUSE, DO_WHILE_STATEMENT = $__17.DO_WHILE_STATEMENT, EMPTY_STATEMENT = $__17.EMPTY_STATEMENT, EXPORT_DECLARATION = $__17.EXPORT_DECLARATION, EXPORT_MAPPING = $__17.EXPORT_MAPPING, EXPORT_MAPPING_LIST = $__17.EXPORT_MAPPING_LIST, EXPORT_SPECIFIER = $__17.EXPORT_SPECIFIER, EXPORT_SPECIFIER_SET = $__17.EXPORT_SPECIFIER_SET, EXPORT_STAR = $__17.EXPORT_STAR, EXPRESSION_STATEMENT = $__17.EXPRESSION_STATEMENT, FINALLY = $__17.FINALLY, FOR_IN_STATEMENT = $__17.FOR_IN_STATEMENT, FOR_OF_STATEMENT = $__17.FOR_OF_STATEMENT, FOR_STATEMENT = $__17.FOR_STATEMENT, FORMAL_PARAMETER_LIST = $__17.FORMAL_PARAMETER_LIST, FUNCTION_DECLARATION = $__17.FUNCTION_DECLARATION, FUNCTION_EXPRESSION = $__17.FUNCTION_EXPRESSION, GENERATOR_COMPREHENSION = $__17.GENERATOR_COMPREHENSION, GET_ACCESSOR = $__17.GET_ACCESSOR, IDENTIFIER_EXPRESSION = $__17.IDENTIFIER_EXPRESSION, IF_STATEMENT = $__17.IF_STATEMENT, IMPORT_BINDING = $__17.IMPORT_BINDING, IMPORT_DECLARATION = $__17.IMPORT_DECLARATION, IMPORT_SPECIFIER = $__17.IMPORT_SPECIFIER, IMPORT_SPECIFIER_SET = $__17.IMPORT_SPECIFIER_SET, LABELLED_STATEMENT = $__17.LABELLED_STATEMENT, LITERAL_EXPRESSION = $__17.LITERAL_EXPRESSION, MEMBER_EXPRESSION = $__17.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__17.MEMBER_LOOKUP_EXPRESSION, MODULE_DECLARATION = $__17.MODULE_DECLARATION, MODULE_DEFINITION = $__17.MODULE_DEFINITION, MODULE_EXPRESSION = $__17.MODULE_EXPRESSION, MODULE_REQUIRE = $__17.MODULE_REQUIRE, MODULE_SPECIFIER = $__17.MODULE_SPECIFIER, NAME_STATEMENT = $__17.NAME_STATEMENT, NEW_EXPRESSION = $__17.NEW_EXPRESSION, OBJECT_LITERAL_EXPRESSION = $__17.OBJECT_LITERAL_EXPRESSION, OBJECT_PATTERN = $__17.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__17.OBJECT_PATTERN_FIELD, PAREN_EXPRESSION = $__17.PAREN_EXPRESSION, POSTFIX_EXPRESSION = $__17.POSTFIX_EXPRESSION, PREDEFINED_TYPE = $__17.PREDEFINED_TYPE, PROGRAM = $__17.PROGRAM, PROPERTY_METHOD_ASSIGNMENT = $__17.PROPERTY_METHOD_ASSIGNMENT, PROPERTY_NAME_ASSIGNMENT = $__17.PROPERTY_NAME_ASSIGNMENT, PROPERTY_NAME_SHORTHAND = $__17.PROPERTY_NAME_SHORTHAND, REST_PARAMETER = $__17.REST_PARAMETER, RETURN_STATEMENT = $__17.RETURN_STATEMENT, SET_ACCESSOR = $__17.SET_ACCESSOR, SPREAD_EXPRESSION = $__17.SPREAD_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__17.SPREAD_PATTERN_ELEMENT, STATE_MACHINE = $__17.STATE_MACHINE, SUPER_EXPRESSION = $__17.SUPER_EXPRESSION, SWITCH_STATEMENT = $__17.SWITCH_STATEMENT, SYNTAX_ERROR_TREE = $__17.SYNTAX_ERROR_TREE, TEMPLATE_LITERAL_EXPRESSION = $__17.TEMPLATE_LITERAL_EXPRESSION, TEMPLATE_LITERAL_PORTION = $__17.TEMPLATE_LITERAL_PORTION, TEMPLATE_SUBSTITUTION = $__17.TEMPLATE_SUBSTITUTION, THIS_EXPRESSION = $__17.THIS_EXPRESSION, THROW_STATEMENT = $__17.THROW_STATEMENT, TRY_STATEMENT = $__17.TRY_STATEMENT, TYPE_NAME = $__17.TYPE_NAME, UNARY_EXPRESSION = $__17.UNARY_EXPRESSION, VARIABLE_DECLARATION = $__17.VARIABLE_DECLARATION, VARIABLE_DECLARATION_LIST = $__17.VARIABLE_DECLARATION_LIST, VARIABLE_STATEMENT = $__17.VARIABLE_STATEMENT, WHILE_STATEMENT = $__17.WHILE_STATEMENT, WITH_STATEMENT = $__17.WITH_STATEMENT, YIELD_EXPRESSION = $__17.YIELD_EXPRESSION;
  var STRING = $___src_syntax_TokenType_js.STRING;
  var Token = $___src_syntax_Token_js.Token;
  var utilJSON = $___src_util_JSON_js;
  var ParseTree = function() {
    'use strict';
    var $ParseTree = ($__createClassNoExtends)({
      constructor: function(type, location) {
        throw new Error("Don't use for now. 'super' is currently very slow.");
        this.type = type;
        this.location = location;
      },
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
          case AT_NAME_EXPRESSION:
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
      isStatement: function() {
        return this.isSourceElement();
      },
      isStatementStandard: function() {
        switch (this.type) {
          case BLOCK:
          case AWAIT_STATEMENT:
          case VARIABLE_STATEMENT:
          case EMPTY_STATEMENT:
          case EXPRESSION_STATEMENT:
          case IF_STATEMENT:
          case DO_WHILE_STATEMENT:
          case WHILE_STATEMENT:
          case FOR_OF_STATEMENT:
          case FOR_IN_STATEMENT:
          case FOR_STATEMENT:
          case CONTINUE_STATEMENT:
          case BREAK_STATEMENT:
          case RETURN_STATEMENT:
          case WITH_STATEMENT:
          case SWITCH_STATEMENT:
          case LABELLED_STATEMENT:
          case THROW_STATEMENT:
          case TRY_STATEMENT:
          case DEBUGGER_STATEMENT:
            return true;
          default:
            return false;
        }
      },
      isSourceElement: function() {
        switch (this.type) {
          case FUNCTION_DECLARATION:
          case CLASS_DECLARATION:
          case NAME_STATEMENT:
            return true;
        }
        return this.isStatementStandard();
      },
      isProgramElement: function() {
        switch (this.type) {
          case CLASS_DECLARATION:
          case EXPORT_DECLARATION:
          case FUNCTION_DECLARATION:
          case IMPORT_DECLARATION:
          case MODULE_DECLARATION:
          case MODULE_DEFINITION:
          case NAME_STATEMENT:
          case VARIABLE_DECLARATION:
            return true;
        }
        return this.isStatementStandard();
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
    }, {});
    return $ParseTree;
  }();
  ParseTree.stripLocation = function(key, value) {
    if (key === 'location') {
      return undefined;
    }
    return value;
  };
  ParseTree.replacer = function(k, v) {
    if (v instanceof ParseTree || v instanceof Token) {
      var rv = {type: v.type};
      Object.keys(v).forEach(function(name) {
        if (name !== 'location') rv[name] = v[name];
      });
      return rv;
    }
    return v;
  };
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
}).call(this);
var $___src_syntax_ParseTreeVisitor_js = (function() {
  "use strict";
  var ParseTreeVisitor = function() {
    'use strict';
    var $ParseTreeVisitor = ($__createClassNoExtends)({
      constructor: function() {},
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
      visitAtNameDeclaration: function(tree) {
        this.visitAny(tree.initializer);
      },
      visitAtNameExpression: function(tree) {},
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
      visitConditionalExpression: function(tree) {
        this.visitAny(tree.condition);
        this.visitAny(tree.left);
        this.visitAny(tree.right);
      },
      visitContinueStatement: function(tree) {},
      visitCoverFormals: function(tree) {
        this.visitList(tree.expressions);
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
      visitExportMapping: function(tree) {
        this.visitAny(tree.moduleExpression);
        this.visitAny(tree.specifierSet);
      },
      visitExportMappingList: function(tree) {
        this.visitList(tree.paths);
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
        this.visitAny(tree.body);
      },
      visitIdentifierExpression: function(tree) {},
      visitIfStatement: function(tree) {
        this.visitAny(tree.condition);
        this.visitAny(tree.ifClause);
        this.visitAny(tree.elseClause);
      },
      visitImportBinding: function(tree) {
        this.visitAny(tree.moduleExpression);
        this.visitAny(tree.importSpecifierSet);
      },
      visitImportDeclaration: function(tree) {
        this.visitList(tree.importPathList);
      },
      visitImportSpecifier: function(tree) {},
      visitImportSpecifierSet: function(tree) {
        this.visitList(tree.specifiers);
      },
      visitLabelledStatement: function(tree) {
        this.visitAny(tree.statement);
      },
      visitLiteralExpression: function(tree) {},
      visitMemberExpression: function(tree) {
        this.visitAny(tree.operand);
      },
      visitMemberLookupExpression: function(tree) {
        this.visitAny(tree.operand);
        this.visitAny(tree.memberExpression);
      },
      visitModuleDeclaration: function(tree) {
        this.visitList(tree.specifiers);
      },
      visitModuleDefinition: function(tree) {
        this.visitList(tree.elements);
      },
      visitModuleExpression: function(tree) {
        this.visitAny(tree.reference);
      },
      visitModuleRequire: function(tree) {},
      visitModuleSpecifier: function(tree) {
        this.visitAny(tree.expression);
      },
      visitNameStatement: function(tree) {
        this.visitList(tree.declarations);
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
        this.visitAny(tree.element);
      },
      visitParenExpression: function(tree) {
        this.visitAny(tree.expression);
      },
      visitPostfixExpression: function(tree) {
        this.visitAny(tree.operand);
      },
      visitPredefinedType: function(tree) {},
      visitProgram: function(tree) {
        this.visitList(tree.programElements);
      },
      visitPropertyMethodAssignment: function(tree) {
        this.visitAny(tree.formalParameterList);
        this.visitAny(tree.functionBody);
      },
      visitPropertyNameAssignment: function(tree) {
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
    return $ParseTreeVisitor;
  }();
  return Object.preventExtensions(Object.create(null, {ParseTreeVisitor: {
      get: function() {
        return ParseTreeVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ModuleVisitor_js = (function() {
  "use strict";
  var $__17 = $___src_syntax_trees_ParseTree_js, ParseTree = $__17.ParseTree, ParseTreeType = $__17.ParseTreeType;
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var Symbol = $___src_semantics_symbols_Symbol_js.Symbol;
  var resolveUrl = $___src_util_url_js.resolveUrl;
  function getFriendlyName(module) {
    return module.name || module.url;
  }
  var ModuleVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleVisitor = ($__createClass)({
      constructor: function(reporter, project, module) {
        $__superCall(this, $__proto, "constructor", []);
        this.reporter_ = reporter;
        this.project = project;
        this.currentModule_ = module;
      },
      get currentModule() {
        return this.currentModule_;
      },
      getModuleByName: function(name) {
        var module = this.currentModule;
        while (module) {
          if (module.hasModule(name)) {
            return module.getModule(name);
          }
          module = module.parent;
        }
        return null;
      },
      getModuleForModuleExpression: function(tree, reportErrors) {
        if (tree.reference.type == ParseTreeType.MODULE_REQUIRE) {
          var url = tree.reference.url.processedValue;
          url = resolveUrl(this.currentModule.url, url);
          return this.project.getModuleForUrl(url);
        }
        var getNext = (function(parent, identifierToken) {
          var name = identifierToken.value;
          if (!parent.hasModule(name)) {
            if (reportErrors) {
              this.reportError_(tree, '\'%s\' is not a module', name);
            }
            return null;
          }
          if (!parent.hasExport(name)) {
            if (reportErrors) {
              this.reportError_(tree, '\'%s\' is not exported by %s', name, getFriendlyName(parent));
            }
            return null;
          }
          return parent.getModule(name);
        }).bind(this);
        var name = tree.reference.identifierToken.value;
        var parent = this.getModuleByName(name);
        if (!parent) {
          if (reportErrors) {
            this.reportError_(tree, '\'%s\' is not a module', name);
          }
          return null;
        }
        for (var i = 0; i < tree.identifiers.length; i++) {
          parent = getNext(parent, tree.identifiers[i]);
          if (!parent) {
            return null;
          }
        }
        return parent;
      },
      visitFunctionDeclaration: function(tree) {},
      visitFunctionExpression: function(tree) {},
      visitSetAccessor: function(tree) {},
      visitGetAccessor: function(tree) {},
      visitModuleElement_: function(element) {
        switch (element.type) {
          case ParseTreeType.MODULE_DECLARATION:
          case ParseTreeType.MODULE_DEFINITION:
          case ParseTreeType.EXPORT_DECLARATION:
          case ParseTreeType.IMPORT_DECLARATION:
            this.visitAny(element);
        }
      },
      visitProgram: function(tree) {
        tree.programElements.forEach(this.visitModuleElement_, this);
      },
      visitModuleDefinition: function(tree) {
        var current = this.currentModule_;
        var name = tree.name.value;
        var module = current.getModule(name);
        traceur.assert(module);
        this.currentModule_ = module;
        tree.elements.forEach(this.visitModuleElement_, this);
        this.currentModule_ = current;
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
        for (var args = [], $__6 = 2; $__6 < arguments.length; $__6++) args[$__6 - 2] = arguments[$__6];
        var tree;
        if (symbolOrTree instanceof Symbol) {
          tree = symbolOrTree.tree;
        } else {
          tree = symbolOrTree;
        }
        ($__21 = this.reporter_).reportError.apply($__21, $__spread([tree.location.start, format], args));
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
    }, {}, $__proto, $__super, true);
    return $ModuleVisitor;
  }(ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {ModuleVisitor: {
      get: function() {
        return ModuleVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ExportVisitor_js = (function() {
  "use strict";
  var ExportSymbol = $___src_semantics_symbols_ExportSymbol_js.ExportSymbol;
  var IDENTIFIER_EXPRESSION = $___src_syntax_trees_ParseTreeType_js.IDENTIFIER_EXPRESSION;
  var ModuleVisitor = $___src_codegeneration_module_ModuleVisitor_js.ModuleVisitor;
  var ExportVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportVisitor = ($__createClass)({
      constructor: function(reporter, project, module) {
        $__superCall(this, $__proto, "constructor", [reporter, project, module]);
        this.inExport_ = false;
        this.relatedTree_ = null;
      },
      addExport_: function(name, tree) {
        if (!this.inExport_) {
          return;
        }
        traceur.assert(typeof name == 'string');
        var parent = this.currentModule;
        if (parent.hasExport(name)) {
          this.reportError_(tree, 'Duplicate export declaration \'%s\'', name);
          this.reportRelatedError_(parent.getExport(name));
          return;
        }
        parent.addExport(name, new ExportSymbol(tree, name, this.relatedTree_));
      },
      visitClassDeclaration: function(tree) {
        this.addExport_(tree.name.identifierToken.value, tree);
      },
      visitExportDeclaration: function(tree) {
        this.inExport_ = true;
        this.visitAny(tree.declaration);
        this.inExport_ = false;
      },
      visitExportMapping: function(tree) {
        this.relatedTree_ = tree.moduleExpression;
        this.visitAny(tree.specifierSet);
        this.relatedTree_ = null;
      },
      visitExportMappingList: function(tree) {
        for (var i = 0; i < tree.paths.length; i++) {
          var path = tree.paths[i];
          if (path.type == IDENTIFIER_EXPRESSION) {
            this.addExport_(path.identifierToken.value, path);
          } else {
            this.visitAny(path);
          }
        }
      },
      visitExportSpecifier: function(tree) {
        this.addExport_((tree.rhs || tree.lhs).value, tree);
      },
      visitExportStar: function(tree) {
        var module = this.getModuleForModuleExpression(this.relatedTree_);
        module.getExports().forEach((function($__17) {
          var name = $__17.name;
          this.addExport_(name, tree);
        }).bind(this));
      },
      visitFunctionDeclaration: function(tree) {
        this.addExport_(tree.name.identifierToken.value, tree);
      },
      visitIdentifierExpression: function(tree) {
        this.addExport_(tree.identifierToken.value, tree);
      },
      visitModuleDefinition: function(tree) {
        this.addExport_(tree.name.value, tree);
        var inExport = this.inExport_;
        this.inExport_ = false;
        $__superCall(this, $__proto, "visitModuleDefinition", [tree]);
        this.inExport_ = inExport;
      },
      visitModuleSpecifier: function(tree) {
        this.addExport_(tree.identifier.value, tree);
      },
      visitVariableDeclaration: function(tree) {
        this.addExport_(tree.lvalue.identifierToken.value, tree);
      }
    }, {}, $__proto, $__super, true);
    return $ExportVisitor;
  }(ModuleVisitor);
  return Object.preventExtensions(Object.create(null, {ExportVisitor: {
      get: function() {
        return ExportVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ImportStarVisitor_js = (function() {
  "use strict";
  var IMPORT_SPECIFIER_SET = $___src_syntax_trees_ParseTreeType_js.IMPORT_SPECIFIER_SET;
  var ModuleVisitor = $___src_codegeneration_module_ModuleVisitor_js.ModuleVisitor;
  var STAR = $___src_syntax_TokenType_js.STAR;
  var ImportStarVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ImportStarVisitor = ($__createClass)({
      constructor: function(reporter, project, module) {
        $__superCall(this, $__proto, "constructor", [reporter, project, module]);
      },
      visitImportBinding: function(tree) {
        var importSpecifierSet = tree.importSpecifierSet;
        if (importSpecifierSet.type === IMPORT_SPECIFIER_SET && importSpecifierSet.specifiers.type === STAR) {
          var module = this.getModuleForModuleExpression(tree.moduleExpression);
          this.project.setModuleForStarTree(importSpecifierSet, module);
        }
      }
    }, {}, $__proto, $__super, true);
    return $ImportStarVisitor;
  }(ModuleVisitor);
  return Object.preventExtensions(Object.create(null, {ImportStarVisitor: {
      get: function() {
        return ImportStarVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ModuleDeclarationVisitor_js = (function() {
  "use strict";
  var ModuleVisitor = $___src_codegeneration_module_ModuleVisitor_js.ModuleVisitor;
  var ModuleDeclarationVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleDeclarationVisitor = ($__createClass)({
      constructor: function(reporter, project, module) {
        $__superCall(this, $__proto, "constructor", [reporter, project, module]);
      },
      visitModuleSpecifier: function(tree) {
        var name = tree.identifier.value;
        var parent = this.currentModule;
        var module = this.getModuleForModuleExpression(tree.expression);
        if (!module) {
          return;
        }
        parent.addModuleWithName(module, name);
      }
    }, {}, $__proto, $__super, true);
    return $ModuleDeclarationVisitor;
  }(ModuleVisitor);
  return Object.preventExtensions(Object.create(null, {ModuleDeclarationVisitor: {
      get: function() {
        return ModuleDeclarationVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_symbols_ModuleSymbol_js = (function() {
  "use strict";
  var Symbol = $___src_semantics_symbols_Symbol_js.Symbol;
  var SymbolType = $___src_semantics_symbols_SymbolType_js.SymbolType;
  var ModuleSymbol = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleSymbol = ($__createClass)({
      constructor: function(name, parent, tree, url) {
        $__superCall(this, $__proto, "constructor", [SymbolType.MODULE, tree, name]);
        this.children_ = Object.create(null);
        this.exports_ = Object.create(null);
        this.parent = parent;
        this.tree = tree;
        if (!url) {
          console.error('Missing URL');
        }
        this.url = url;
      },
      addModule: function(module) {
        this.addModuleWithName(module, module.name);
      },
      addModuleWithName: function(module, name) {
        this.children_[name] = module;
      },
      hasModule: function(name) {
        return name in this.children_;
      },
      getModule: function(name) {
        return this.children_[name];
      },
      hasExport: function(name) {
        return name in this.exports_;
      },
      getExport: function(name) {
        return this.exports_[name];
      },
      addExport: function(name, exp) {
        this.exports_[name] = exp;
      },
      getExports: function() {
        var exports = this.exports_;
        return Object.keys(exports).map((function(key) {
          return exports[key];
        }));
      }
    }, {}, $__proto, $__super, true);
    return $ModuleSymbol;
  }(Symbol);
  return Object.preventExtensions(Object.create(null, {ModuleSymbol: {
      get: function() {
        return ModuleSymbol;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ModuleDefinitionVisitor_js = (function() {
  "use strict";
  var ModuleSymbol = $___src_semantics_symbols_ModuleSymbol_js.ModuleSymbol;
  var ModuleVisitor = $___src_codegeneration_module_ModuleVisitor_js.ModuleVisitor;
  var ModuleDefinitionVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleDefinitionVisitor = ($__createClass)({
      constructor: function(reporter, project, module) {
        $__superCall(this, $__proto, "constructor", [reporter, project, module]);
      },
      visitModuleDefinition: function(tree) {
        var name = tree.name.value;
        if (this.checkForDuplicateModule_(name, tree)) {
          var parent = this.currentModule;
          var module = new ModuleSymbol(name, parent, tree, parent.url);
          parent.addModule(module);
        }
        $__superCall(this, $__proto, "visitModuleDefinition", [tree]);
      }
    }, {}, $__proto, $__super, true);
    return $ModuleDefinitionVisitor;
  }(ModuleVisitor);
  return Object.preventExtensions(Object.create(null, {ModuleDefinitionVisitor: {
      get: function() {
        return ModuleDefinitionVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ValidationVisitor_js = (function() {
  "use strict";
  var ModuleVisitor = $___src_codegeneration_module_ModuleVisitor_js.ModuleVisitor;
  function getFriendlyName(module) {
    return module.name || "'" + module.url + "'";
  }
  var ValidationVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ValidationVisitor = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
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
      visitExportMapping: function(tree) {
        if (tree.moduleExpression) {
          this.visitAny(tree.moduleExpression);
          var module = this.getModuleForModuleExpression(tree.moduleExpression);
          this.visitAndValidate_(module, tree.specifierSet);
        }
      },
      visitExportSpecifier: function(tree) {
        this.checkExport_(tree, tree.lhs.value);
      },
      visitIdentifierExpression: function(tree) {
        this.checkExport_(tree, tree.identifierToken.value);
      },
      visitModuleExpression: function(tree) {
        this.getModuleForModuleExpression(tree, true);
      },
      visitImportBinding: function(tree) {
        var module = this.getModuleForModuleExpression(tree.moduleExpression, true);
        this.visitAndValidate_(module, tree.importSpecifierSet);
      },
      visitImportSpecifier: function(tree) {
        this.checkExport_(tree, tree.lhs.value);
      }
    }, {}, $__proto, $__super, false);
    return $ValidationVisitor;
  }(ModuleVisitor);
  return Object.preventExtensions(Object.create(null, {ValidationVisitor: {
      get: function() {
        return ValidationVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_ModuleAnalyzer_js = (function() {
  "use strict";
  var ExportVisitor = $___src_codegeneration_module_ExportVisitor_js.ExportVisitor;
  var ImportStarVisitor = $___src_codegeneration_module_ImportStarVisitor_js.ImportStarVisitor;
  var ModuleDeclarationVisitor = $___src_codegeneration_module_ModuleDeclarationVisitor_js.ModuleDeclarationVisitor;
  var ModuleDefinitionVisitor = $___src_codegeneration_module_ModuleDefinitionVisitor_js.ModuleDefinitionVisitor;
  var ValidationVisitor = $___src_codegeneration_module_ValidationVisitor_js.ValidationVisitor;
  var ModuleAnalyzer = function() {
    'use strict';
    var $ModuleAnalyzer = ($__createClassNoExtends)({
      constructor: function(reporter, project) {
        this.reporter_ = reporter;
        this.project_ = project;
      },
      analyze: function() {
        this.analyzeTrees(this.project_.getParseTrees());
      },
      analyzeFile: function(sourceFile) {
        var trees = [this.project_.getParseTree(sourceFile)];
        this.analyzeTrees(trees);
      },
      analyzeTrees: function(trees) {
        this.analyzeModuleTrees(trees);
      },
      analyzeModuleTrees: function(trees) {
        var roots = arguments[1];
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
        doVisit(ModuleDefinitionVisitor);
        doVisit(ExportVisitor);
        doVisit(ModuleDeclarationVisitor);
        doVisit(ValidationVisitor);
        doVisit(ImportStarVisitor);
      }
    }, {});
    return $ModuleAnalyzer;
  }();
  return Object.preventExtensions(Object.create(null, {ModuleAnalyzer: {
      get: function() {
        return ModuleAnalyzer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_trees_ParseTrees_js = (function() {
  "use strict";
  var ParseTree = $___src_syntax_trees_ParseTree_js.ParseTree;
  var ParseTreeType = $___src_syntax_trees_ParseTreeType_js;
  var $__18 = ParseTreeType, ARGUMENT_LIST = $__18.ARGUMENT_LIST, ARRAY_COMPREHENSION = $__18.ARRAY_COMPREHENSION, ARRAY_LITERAL_EXPRESSION = $__18.ARRAY_LITERAL_EXPRESSION, ARRAY_PATTERN = $__18.ARRAY_PATTERN, ARROW_FUNCTION_EXPRESSION = $__18.ARROW_FUNCTION_EXPRESSION, AT_NAME_DECLARATION = $__18.AT_NAME_DECLARATION, AT_NAME_EXPRESSION = $__18.AT_NAME_EXPRESSION, AWAIT_STATEMENT = $__18.AWAIT_STATEMENT, BINARY_OPERATOR = $__18.BINARY_OPERATOR, BINDING_ELEMENT = $__18.BINDING_ELEMENT, BINDING_IDENTIFIER = $__18.BINDING_IDENTIFIER, BLOCK = $__18.BLOCK, BREAK_STATEMENT = $__18.BREAK_STATEMENT, CALL_EXPRESSION = $__18.CALL_EXPRESSION, CASCADE_EXPRESSION = $__18.CASCADE_EXPRESSION, CASE_CLAUSE = $__18.CASE_CLAUSE, CATCH = $__18.CATCH, CLASS_DECLARATION = $__18.CLASS_DECLARATION, CLASS_EXPRESSION = $__18.CLASS_EXPRESSION, COMMA_EXPRESSION = $__18.COMMA_EXPRESSION, COMPREHENSION_FOR = $__18.COMPREHENSION_FOR, COMPREHENSION_IF = $__18.COMPREHENSION_IF, CONDITIONAL_EXPRESSION = $__18.CONDITIONAL_EXPRESSION, CONTINUE_STATEMENT = $__18.CONTINUE_STATEMENT, COVER_FORMALS = $__18.COVER_FORMALS, DEBUGGER_STATEMENT = $__18.DEBUGGER_STATEMENT, DEFAULT_CLAUSE = $__18.DEFAULT_CLAUSE, DO_WHILE_STATEMENT = $__18.DO_WHILE_STATEMENT, EMPTY_STATEMENT = $__18.EMPTY_STATEMENT, EXPORT_DECLARATION = $__18.EXPORT_DECLARATION, EXPORT_MAPPING = $__18.EXPORT_MAPPING, EXPORT_MAPPING_LIST = $__18.EXPORT_MAPPING_LIST, EXPORT_SPECIFIER = $__18.EXPORT_SPECIFIER, EXPORT_SPECIFIER_SET = $__18.EXPORT_SPECIFIER_SET, EXPORT_STAR = $__18.EXPORT_STAR, EXPRESSION_STATEMENT = $__18.EXPRESSION_STATEMENT, FINALLY = $__18.FINALLY, FOR_IN_STATEMENT = $__18.FOR_IN_STATEMENT, FOR_OF_STATEMENT = $__18.FOR_OF_STATEMENT, FOR_STATEMENT = $__18.FOR_STATEMENT, FORMAL_PARAMETER_LIST = $__18.FORMAL_PARAMETER_LIST, FUNCTION_DECLARATION = $__18.FUNCTION_DECLARATION, FUNCTION_EXPRESSION = $__18.FUNCTION_EXPRESSION, GENERATOR_COMPREHENSION = $__18.GENERATOR_COMPREHENSION, GET_ACCESSOR = $__18.GET_ACCESSOR, IDENTIFIER_EXPRESSION = $__18.IDENTIFIER_EXPRESSION, IF_STATEMENT = $__18.IF_STATEMENT, IMPORT_BINDING = $__18.IMPORT_BINDING, IMPORT_DECLARATION = $__18.IMPORT_DECLARATION, IMPORT_SPECIFIER = $__18.IMPORT_SPECIFIER, IMPORT_SPECIFIER_SET = $__18.IMPORT_SPECIFIER_SET, LABELLED_STATEMENT = $__18.LABELLED_STATEMENT, LITERAL_EXPRESSION = $__18.LITERAL_EXPRESSION, MEMBER_EXPRESSION = $__18.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__18.MEMBER_LOOKUP_EXPRESSION, MODULE_DECLARATION = $__18.MODULE_DECLARATION, MODULE_DEFINITION = $__18.MODULE_DEFINITION, MODULE_EXPRESSION = $__18.MODULE_EXPRESSION, MODULE_REQUIRE = $__18.MODULE_REQUIRE, MODULE_SPECIFIER = $__18.MODULE_SPECIFIER, NAME_STATEMENT = $__18.NAME_STATEMENT, NEW_EXPRESSION = $__18.NEW_EXPRESSION, OBJECT_LITERAL_EXPRESSION = $__18.OBJECT_LITERAL_EXPRESSION, OBJECT_PATTERN = $__18.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__18.OBJECT_PATTERN_FIELD, PAREN_EXPRESSION = $__18.PAREN_EXPRESSION, POSTFIX_EXPRESSION = $__18.POSTFIX_EXPRESSION, PREDEFINED_TYPE = $__18.PREDEFINED_TYPE, PROGRAM = $__18.PROGRAM, PROPERTY_METHOD_ASSIGNMENT = $__18.PROPERTY_METHOD_ASSIGNMENT, PROPERTY_NAME_ASSIGNMENT = $__18.PROPERTY_NAME_ASSIGNMENT, PROPERTY_NAME_SHORTHAND = $__18.PROPERTY_NAME_SHORTHAND, REST_PARAMETER = $__18.REST_PARAMETER, RETURN_STATEMENT = $__18.RETURN_STATEMENT, SET_ACCESSOR = $__18.SET_ACCESSOR, SPREAD_EXPRESSION = $__18.SPREAD_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__18.SPREAD_PATTERN_ELEMENT, STATE_MACHINE = $__18.STATE_MACHINE, SUPER_EXPRESSION = $__18.SUPER_EXPRESSION, SWITCH_STATEMENT = $__18.SWITCH_STATEMENT, SYNTAX_ERROR_TREE = $__18.SYNTAX_ERROR_TREE, TEMPLATE_LITERAL_EXPRESSION = $__18.TEMPLATE_LITERAL_EXPRESSION, TEMPLATE_LITERAL_PORTION = $__18.TEMPLATE_LITERAL_PORTION, TEMPLATE_SUBSTITUTION = $__18.TEMPLATE_SUBSTITUTION, THIS_EXPRESSION = $__18.THIS_EXPRESSION, THROW_STATEMENT = $__18.THROW_STATEMENT, TRY_STATEMENT = $__18.TRY_STATEMENT, TYPE_NAME = $__18.TYPE_NAME, UNARY_EXPRESSION = $__18.UNARY_EXPRESSION, VARIABLE_DECLARATION = $__18.VARIABLE_DECLARATION, VARIABLE_DECLARATION_LIST = $__18.VARIABLE_DECLARATION_LIST, VARIABLE_STATEMENT = $__18.VARIABLE_STATEMENT, WHILE_STATEMENT = $__18.WHILE_STATEMENT, WITH_STATEMENT = $__18.WITH_STATEMENT, YIELD_EXPRESSION = $__18.YIELD_EXPRESSION;
  var ArgumentList = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArgumentList = ($__createClass)({
      constructor: function(location, args) {
        this.location = location;
        this.args = args;
      },
      transform: function(transformer) {
        return transformer.transformArgumentList(this);
      },
      visit: function(visitor) {
        visitor.visitArgumentList(this);
      },
      get type() {
        return ARGUMENT_LIST;
      }
    }, {}, $__proto, $__super, true);
    return $ArgumentList;
  }(ParseTree);
  var ArrayComprehension = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArrayComprehension = ($__createClass)({
      constructor: function(location, comprehensionList, expression) {
        this.location = location;
        this.comprehensionList = comprehensionList;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformArrayComprehension(this);
      },
      visit: function(visitor) {
        visitor.visitArrayComprehension(this);
      },
      get type() {
        return ARRAY_COMPREHENSION;
      }
    }, {}, $__proto, $__super, true);
    return $ArrayComprehension;
  }(ParseTree);
  var ArrayLiteralExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArrayLiteralExpression = ($__createClass)({
      constructor: function(location, elements) {
        this.location = location;
        this.elements = elements;
      },
      transform: function(transformer) {
        return transformer.transformArrayLiteralExpression(this);
      },
      visit: function(visitor) {
        visitor.visitArrayLiteralExpression(this);
      },
      get type() {
        return ARRAY_LITERAL_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ArrayLiteralExpression;
  }(ParseTree);
  var ArrayPattern = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArrayPattern = ($__createClass)({
      constructor: function(location, elements) {
        this.location = location;
        this.elements = elements;
      },
      transform: function(transformer) {
        return transformer.transformArrayPattern(this);
      },
      visit: function(visitor) {
        visitor.visitArrayPattern(this);
      },
      get type() {
        return ARRAY_PATTERN;
      }
    }, {}, $__proto, $__super, true);
    return $ArrayPattern;
  }(ParseTree);
  var ArrowFunctionExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArrowFunctionExpression = ($__createClass)({
      constructor: function(location, formalParameters, functionBody) {
        this.location = location;
        this.formalParameters = formalParameters;
        this.functionBody = functionBody;
      },
      transform: function(transformer) {
        return transformer.transformArrowFunctionExpression(this);
      },
      visit: function(visitor) {
        visitor.visitArrowFunctionExpression(this);
      },
      get type() {
        return ARROW_FUNCTION_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ArrowFunctionExpression;
  }(ParseTree);
  var AtNameDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AtNameDeclaration = ($__createClass)({
      constructor: function(location, atNameToken, initializer) {
        this.location = location;
        this.atNameToken = atNameToken;
        this.initializer = initializer;
      },
      transform: function(transformer) {
        return transformer.transformAtNameDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitAtNameDeclaration(this);
      },
      get type() {
        return AT_NAME_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $AtNameDeclaration;
  }(ParseTree);
  var AtNameExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AtNameExpression = ($__createClass)({
      constructor: function(location, atNameToken) {
        this.location = location;
        this.atNameToken = atNameToken;
      },
      transform: function(transformer) {
        return transformer.transformAtNameExpression(this);
      },
      visit: function(visitor) {
        visitor.visitAtNameExpression(this);
      },
      get type() {
        return AT_NAME_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $AtNameExpression;
  }(ParseTree);
  var AwaitStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AwaitStatement = ($__createClass)({
      constructor: function(location, identifier, expression) {
        this.location = location;
        this.identifier = identifier;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformAwaitStatement(this);
      },
      visit: function(visitor) {
        visitor.visitAwaitStatement(this);
      },
      get type() {
        return AWAIT_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $AwaitStatement;
  }(ParseTree);
  var BinaryOperator = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BinaryOperator = ($__createClass)({
      constructor: function(location, left, operator, right) {
        this.location = location;
        this.left = left;
        this.operator = operator;
        this.right = right;
      },
      transform: function(transformer) {
        return transformer.transformBinaryOperator(this);
      },
      visit: function(visitor) {
        visitor.visitBinaryOperator(this);
      },
      get type() {
        return BINARY_OPERATOR;
      }
    }, {}, $__proto, $__super, true);
    return $BinaryOperator;
  }(ParseTree);
  var BindingElement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BindingElement = ($__createClass)({
      constructor: function(location, binding, initializer) {
        this.location = location;
        this.binding = binding;
        this.initializer = initializer;
      },
      transform: function(transformer) {
        return transformer.transformBindingElement(this);
      },
      visit: function(visitor) {
        visitor.visitBindingElement(this);
      },
      get type() {
        return BINDING_ELEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $BindingElement;
  }(ParseTree);
  var BindingIdentifier = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BindingIdentifier = ($__createClass)({
      constructor: function(location, identifierToken) {
        this.location = location;
        this.identifierToken = identifierToken;
      },
      transform: function(transformer) {
        return transformer.transformBindingIdentifier(this);
      },
      visit: function(visitor) {
        visitor.visitBindingIdentifier(this);
      },
      get type() {
        return BINDING_IDENTIFIER;
      }
    }, {}, $__proto, $__super, true);
    return $BindingIdentifier;
  }(ParseTree);
  var Block = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $Block = ($__createClass)({
      constructor: function(location, statements) {
        this.location = location;
        this.statements = statements;
      },
      transform: function(transformer) {
        return transformer.transformBlock(this);
      },
      visit: function(visitor) {
        visitor.visitBlock(this);
      },
      get type() {
        return BLOCK;
      }
    }, {}, $__proto, $__super, true);
    return $Block;
  }(ParseTree);
  var BreakStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BreakStatement = ($__createClass)({
      constructor: function(location, name) {
        this.location = location;
        this.name = name;
      },
      transform: function(transformer) {
        return transformer.transformBreakStatement(this);
      },
      visit: function(visitor) {
        visitor.visitBreakStatement(this);
      },
      get type() {
        return BREAK_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $BreakStatement;
  }(ParseTree);
  var CallExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CallExpression = ($__createClass)({
      constructor: function(location, operand, args) {
        this.location = location;
        this.operand = operand;
        this.args = args;
      },
      transform: function(transformer) {
        return transformer.transformCallExpression(this);
      },
      visit: function(visitor) {
        visitor.visitCallExpression(this);
      },
      get type() {
        return CALL_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $CallExpression;
  }(ParseTree);
  var CascadeExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CascadeExpression = ($__createClass)({
      constructor: function(location, operand, expressions) {
        this.location = location;
        this.operand = operand;
        this.expressions = expressions;
      },
      transform: function(transformer) {
        return transformer.transformCascadeExpression(this);
      },
      visit: function(visitor) {
        visitor.visitCascadeExpression(this);
      },
      get type() {
        return CASCADE_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $CascadeExpression;
  }(ParseTree);
  var CaseClause = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CaseClause = ($__createClass)({
      constructor: function(location, expression, statements) {
        this.location = location;
        this.expression = expression;
        this.statements = statements;
      },
      transform: function(transformer) {
        return transformer.transformCaseClause(this);
      },
      visit: function(visitor) {
        visitor.visitCaseClause(this);
      },
      get type() {
        return CASE_CLAUSE;
      }
    }, {}, $__proto, $__super, true);
    return $CaseClause;
  }(ParseTree);
  var Catch = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $Catch = ($__createClass)({
      constructor: function(location, binding, catchBody) {
        this.location = location;
        this.binding = binding;
        this.catchBody = catchBody;
      },
      transform: function(transformer) {
        return transformer.transformCatch(this);
      },
      visit: function(visitor) {
        visitor.visitCatch(this);
      },
      get type() {
        return CATCH;
      }
    }, {}, $__proto, $__super, true);
    return $Catch;
  }(ParseTree);
  var ClassDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ClassDeclaration = ($__createClass)({
      constructor: function(location, name, superClass, elements) {
        this.location = location;
        this.name = name;
        this.superClass = superClass;
        this.elements = elements;
      },
      transform: function(transformer) {
        return transformer.transformClassDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitClassDeclaration(this);
      },
      get type() {
        return CLASS_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $ClassDeclaration;
  }(ParseTree);
  var ClassExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ClassExpression = ($__createClass)({
      constructor: function(location, name, superClass, elements) {
        this.location = location;
        this.name = name;
        this.superClass = superClass;
        this.elements = elements;
      },
      transform: function(transformer) {
        return transformer.transformClassExpression(this);
      },
      visit: function(visitor) {
        visitor.visitClassExpression(this);
      },
      get type() {
        return CLASS_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ClassExpression;
  }(ParseTree);
  var CommaExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CommaExpression = ($__createClass)({
      constructor: function(location, expressions) {
        this.location = location;
        this.expressions = expressions;
      },
      transform: function(transformer) {
        return transformer.transformCommaExpression(this);
      },
      visit: function(visitor) {
        visitor.visitCommaExpression(this);
      },
      get type() {
        return COMMA_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $CommaExpression;
  }(ParseTree);
  var ComprehensionFor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ComprehensionFor = ($__createClass)({
      constructor: function(location, left, iterator) {
        this.location = location;
        this.left = left;
        this.iterator = iterator;
      },
      transform: function(transformer) {
        return transformer.transformComprehensionFor(this);
      },
      visit: function(visitor) {
        visitor.visitComprehensionFor(this);
      },
      get type() {
        return COMPREHENSION_FOR;
      }
    }, {}, $__proto, $__super, true);
    return $ComprehensionFor;
  }(ParseTree);
  var ComprehensionIf = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ComprehensionIf = ($__createClass)({
      constructor: function(location, expression) {
        this.location = location;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformComprehensionIf(this);
      },
      visit: function(visitor) {
        visitor.visitComprehensionIf(this);
      },
      get type() {
        return COMPREHENSION_IF;
      }
    }, {}, $__proto, $__super, true);
    return $ComprehensionIf;
  }(ParseTree);
  var ConditionalExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ConditionalExpression = ($__createClass)({
      constructor: function(location, condition, left, right) {
        this.location = location;
        this.condition = condition;
        this.left = left;
        this.right = right;
      },
      transform: function(transformer) {
        return transformer.transformConditionalExpression(this);
      },
      visit: function(visitor) {
        visitor.visitConditionalExpression(this);
      },
      get type() {
        return CONDITIONAL_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ConditionalExpression;
  }(ParseTree);
  var ContinueStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ContinueStatement = ($__createClass)({
      constructor: function(location, name) {
        this.location = location;
        this.name = name;
      },
      transform: function(transformer) {
        return transformer.transformContinueStatement(this);
      },
      visit: function(visitor) {
        visitor.visitContinueStatement(this);
      },
      get type() {
        return CONTINUE_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ContinueStatement;
  }(ParseTree);
  var CoverFormals = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CoverFormals = ($__createClass)({
      constructor: function(location, expressions) {
        this.location = location;
        this.expressions = expressions;
      },
      transform: function(transformer) {
        return transformer.transformCoverFormals(this);
      },
      visit: function(visitor) {
        visitor.visitCoverFormals(this);
      },
      get type() {
        return COVER_FORMALS;
      }
    }, {}, $__proto, $__super, true);
    return $CoverFormals;
  }(ParseTree);
  var DebuggerStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $DebuggerStatement = ($__createClass)({
      constructor: function(location) {
        this.location = location;
      },
      transform: function(transformer) {
        return transformer.transformDebuggerStatement(this);
      },
      visit: function(visitor) {
        visitor.visitDebuggerStatement(this);
      },
      get type() {
        return DEBUGGER_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $DebuggerStatement;
  }(ParseTree);
  var DefaultClause = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $DefaultClause = ($__createClass)({
      constructor: function(location, statements) {
        this.location = location;
        this.statements = statements;
      },
      transform: function(transformer) {
        return transformer.transformDefaultClause(this);
      },
      visit: function(visitor) {
        visitor.visitDefaultClause(this);
      },
      get type() {
        return DEFAULT_CLAUSE;
      }
    }, {}, $__proto, $__super, true);
    return $DefaultClause;
  }(ParseTree);
  var DoWhileStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $DoWhileStatement = ($__createClass)({
      constructor: function(location, body, condition) {
        this.location = location;
        this.body = body;
        this.condition = condition;
      },
      transform: function(transformer) {
        return transformer.transformDoWhileStatement(this);
      },
      visit: function(visitor) {
        visitor.visitDoWhileStatement(this);
      },
      get type() {
        return DO_WHILE_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $DoWhileStatement;
  }(ParseTree);
  var EmptyStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $EmptyStatement = ($__createClass)({
      constructor: function(location) {
        this.location = location;
      },
      transform: function(transformer) {
        return transformer.transformEmptyStatement(this);
      },
      visit: function(visitor) {
        visitor.visitEmptyStatement(this);
      },
      get type() {
        return EMPTY_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $EmptyStatement;
  }(ParseTree);
  var ExportDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportDeclaration = ($__createClass)({
      constructor: function(location, declaration) {
        this.location = location;
        this.declaration = declaration;
      },
      transform: function(transformer) {
        return transformer.transformExportDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitExportDeclaration(this);
      },
      get type() {
        return EXPORT_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $ExportDeclaration;
  }(ParseTree);
  var ExportMapping = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportMapping = ($__createClass)({
      constructor: function(location, moduleExpression, specifierSet) {
        this.location = location;
        this.moduleExpression = moduleExpression;
        this.specifierSet = specifierSet;
      },
      transform: function(transformer) {
        return transformer.transformExportMapping(this);
      },
      visit: function(visitor) {
        visitor.visitExportMapping(this);
      },
      get type() {
        return EXPORT_MAPPING;
      }
    }, {}, $__proto, $__super, true);
    return $ExportMapping;
  }(ParseTree);
  var ExportMappingList = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportMappingList = ($__createClass)({
      constructor: function(location, paths) {
        this.location = location;
        this.paths = paths;
      },
      transform: function(transformer) {
        return transformer.transformExportMappingList(this);
      },
      visit: function(visitor) {
        visitor.visitExportMappingList(this);
      },
      get type() {
        return EXPORT_MAPPING_LIST;
      }
    }, {}, $__proto, $__super, true);
    return $ExportMappingList;
  }(ParseTree);
  var ExportSpecifier = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportSpecifier = ($__createClass)({
      constructor: function(location, lhs, rhs) {
        this.location = location;
        this.lhs = lhs;
        this.rhs = rhs;
      },
      transform: function(transformer) {
        return transformer.transformExportSpecifier(this);
      },
      visit: function(visitor) {
        visitor.visitExportSpecifier(this);
      },
      get type() {
        return EXPORT_SPECIFIER;
      }
    }, {}, $__proto, $__super, true);
    return $ExportSpecifier;
  }(ParseTree);
  var ExportSpecifierSet = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportSpecifierSet = ($__createClass)({
      constructor: function(location, specifiers) {
        this.location = location;
        this.specifiers = specifiers;
      },
      transform: function(transformer) {
        return transformer.transformExportSpecifierSet(this);
      },
      visit: function(visitor) {
        visitor.visitExportSpecifierSet(this);
      },
      get type() {
        return EXPORT_SPECIFIER_SET;
      }
    }, {}, $__proto, $__super, true);
    return $ExportSpecifierSet;
  }(ParseTree);
  var ExportStar = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExportStar = ($__createClass)({
      constructor: function(location) {
        this.location = location;
      },
      transform: function(transformer) {
        return transformer.transformExportStar(this);
      },
      visit: function(visitor) {
        visitor.visitExportStar(this);
      },
      get type() {
        return EXPORT_STAR;
      }
    }, {}, $__proto, $__super, true);
    return $ExportStar;
  }(ParseTree);
  var ExpressionStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ExpressionStatement = ($__createClass)({
      constructor: function(location, expression) {
        this.location = location;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformExpressionStatement(this);
      },
      visit: function(visitor) {
        visitor.visitExpressionStatement(this);
      },
      get type() {
        return EXPRESSION_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ExpressionStatement;
  }(ParseTree);
  var Finally = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $Finally = ($__createClass)({
      constructor: function(location, block) {
        this.location = location;
        this.block = block;
      },
      transform: function(transformer) {
        return transformer.transformFinally(this);
      },
      visit: function(visitor) {
        visitor.visitFinally(this);
      },
      get type() {
        return FINALLY;
      }
    }, {}, $__proto, $__super, true);
    return $Finally;
  }(ParseTree);
  var ForInStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ForInStatement = ($__createClass)({
      constructor: function(location, initializer, collection, body) {
        this.location = location;
        this.initializer = initializer;
        this.collection = collection;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformForInStatement(this);
      },
      visit: function(visitor) {
        visitor.visitForInStatement(this);
      },
      get type() {
        return FOR_IN_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ForInStatement;
  }(ParseTree);
  var ForOfStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ForOfStatement = ($__createClass)({
      constructor: function(location, initializer, collection, body) {
        this.location = location;
        this.initializer = initializer;
        this.collection = collection;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformForOfStatement(this);
      },
      visit: function(visitor) {
        visitor.visitForOfStatement(this);
      },
      get type() {
        return FOR_OF_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ForOfStatement;
  }(ParseTree);
  var ForStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ForStatement = ($__createClass)({
      constructor: function(location, initializer, condition, increment, body) {
        this.location = location;
        this.initializer = initializer;
        this.condition = condition;
        this.increment = increment;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformForStatement(this);
      },
      visit: function(visitor) {
        visitor.visitForStatement(this);
      },
      get type() {
        return FOR_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ForStatement;
  }(ParseTree);
  var FormalParameterList = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FormalParameterList = ($__createClass)({
      constructor: function(location, parameters) {
        this.location = location;
        this.parameters = parameters;
      },
      transform: function(transformer) {
        return transformer.transformFormalParameterList(this);
      },
      visit: function(visitor) {
        visitor.visitFormalParameterList(this);
      },
      get type() {
        return FORMAL_PARAMETER_LIST;
      }
    }, {}, $__proto, $__super, true);
    return $FormalParameterList;
  }(ParseTree);
  var FunctionDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FunctionDeclaration = ($__createClass)({
      constructor: function(location, name, isGenerator, formalParameterList, functionBody) {
        this.location = location;
        this.name = name;
        this.isGenerator = isGenerator;
        this.formalParameterList = formalParameterList;
        this.functionBody = functionBody;
      },
      transform: function(transformer) {
        return transformer.transformFunctionDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitFunctionDeclaration(this);
      },
      get type() {
        return FUNCTION_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $FunctionDeclaration;
  }(ParseTree);
  var FunctionExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FunctionExpression = ($__createClass)({
      constructor: function(location, name, isGenerator, formalParameterList, functionBody) {
        this.location = location;
        this.name = name;
        this.isGenerator = isGenerator;
        this.formalParameterList = formalParameterList;
        this.functionBody = functionBody;
      },
      transform: function(transformer) {
        return transformer.transformFunctionExpression(this);
      },
      visit: function(visitor) {
        visitor.visitFunctionExpression(this);
      },
      get type() {
        return FUNCTION_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $FunctionExpression;
  }(ParseTree);
  var GeneratorComprehension = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $GeneratorComprehension = ($__createClass)({
      constructor: function(location, comprehensionList, expression) {
        this.location = location;
        this.comprehensionList = comprehensionList;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformGeneratorComprehension(this);
      },
      visit: function(visitor) {
        visitor.visitGeneratorComprehension(this);
      },
      get type() {
        return GENERATOR_COMPREHENSION;
      }
    }, {}, $__proto, $__super, true);
    return $GeneratorComprehension;
  }(ParseTree);
  var GetAccessor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $GetAccessor = ($__createClass)({
      constructor: function(location, isStatic, name, body) {
        this.location = location;
        this.isStatic = isStatic;
        this.name = name;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformGetAccessor(this);
      },
      visit: function(visitor) {
        visitor.visitGetAccessor(this);
      },
      get type() {
        return GET_ACCESSOR;
      }
    }, {}, $__proto, $__super, true);
    return $GetAccessor;
  }(ParseTree);
  var IdentifierExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $IdentifierExpression = ($__createClass)({
      constructor: function(location, identifierToken) {
        this.location = location;
        this.identifierToken = identifierToken;
      },
      transform: function(transformer) {
        return transformer.transformIdentifierExpression(this);
      },
      visit: function(visitor) {
        visitor.visitIdentifierExpression(this);
      },
      get type() {
        return IDENTIFIER_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $IdentifierExpression;
  }(ParseTree);
  var IfStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $IfStatement = ($__createClass)({
      constructor: function(location, condition, ifClause, elseClause) {
        this.location = location;
        this.condition = condition;
        this.ifClause = ifClause;
        this.elseClause = elseClause;
      },
      transform: function(transformer) {
        return transformer.transformIfStatement(this);
      },
      visit: function(visitor) {
        visitor.visitIfStatement(this);
      },
      get type() {
        return IF_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $IfStatement;
  }(ParseTree);
  var ImportBinding = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ImportBinding = ($__createClass)({
      constructor: function(location, moduleExpression, importSpecifierSet) {
        this.location = location;
        this.moduleExpression = moduleExpression;
        this.importSpecifierSet = importSpecifierSet;
      },
      transform: function(transformer) {
        return transformer.transformImportBinding(this);
      },
      visit: function(visitor) {
        visitor.visitImportBinding(this);
      },
      get type() {
        return IMPORT_BINDING;
      }
    }, {}, $__proto, $__super, true);
    return $ImportBinding;
  }(ParseTree);
  var ImportDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ImportDeclaration = ($__createClass)({
      constructor: function(location, importPathList) {
        this.location = location;
        this.importPathList = importPathList;
      },
      transform: function(transformer) {
        return transformer.transformImportDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitImportDeclaration(this);
      },
      get type() {
        return IMPORT_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $ImportDeclaration;
  }(ParseTree);
  var ImportSpecifier = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ImportSpecifier = ($__createClass)({
      constructor: function(location, lhs, rhs) {
        this.location = location;
        this.lhs = lhs;
        this.rhs = rhs;
      },
      transform: function(transformer) {
        return transformer.transformImportSpecifier(this);
      },
      visit: function(visitor) {
        visitor.visitImportSpecifier(this);
      },
      get type() {
        return IMPORT_SPECIFIER;
      }
    }, {}, $__proto, $__super, true);
    return $ImportSpecifier;
  }(ParseTree);
  var ImportSpecifierSet = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ImportSpecifierSet = ($__createClass)({
      constructor: function(location, specifiers) {
        this.location = location;
        this.specifiers = specifiers;
      },
      transform: function(transformer) {
        return transformer.transformImportSpecifierSet(this);
      },
      visit: function(visitor) {
        visitor.visitImportSpecifierSet(this);
      },
      get type() {
        return IMPORT_SPECIFIER_SET;
      }
    }, {}, $__proto, $__super, true);
    return $ImportSpecifierSet;
  }(ParseTree);
  var LabelledStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $LabelledStatement = ($__createClass)({
      constructor: function(location, name, statement) {
        this.location = location;
        this.name = name;
        this.statement = statement;
      },
      transform: function(transformer) {
        return transformer.transformLabelledStatement(this);
      },
      visit: function(visitor) {
        visitor.visitLabelledStatement(this);
      },
      get type() {
        return LABELLED_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $LabelledStatement;
  }(ParseTree);
  var LiteralExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $LiteralExpression = ($__createClass)({
      constructor: function(location, literalToken) {
        this.location = location;
        this.literalToken = literalToken;
      },
      transform: function(transformer) {
        return transformer.transformLiteralExpression(this);
      },
      visit: function(visitor) {
        visitor.visitLiteralExpression(this);
      },
      get type() {
        return LITERAL_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $LiteralExpression;
  }(ParseTree);
  var MemberExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $MemberExpression = ($__createClass)({
      constructor: function(location, operand, memberName) {
        this.location = location;
        this.operand = operand;
        this.memberName = memberName;
      },
      transform: function(transformer) {
        return transformer.transformMemberExpression(this);
      },
      visit: function(visitor) {
        visitor.visitMemberExpression(this);
      },
      get type() {
        return MEMBER_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $MemberExpression;
  }(ParseTree);
  var MemberLookupExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $MemberLookupExpression = ($__createClass)({
      constructor: function(location, operand, memberExpression) {
        this.location = location;
        this.operand = operand;
        this.memberExpression = memberExpression;
      },
      transform: function(transformer) {
        return transformer.transformMemberLookupExpression(this);
      },
      visit: function(visitor) {
        visitor.visitMemberLookupExpression(this);
      },
      get type() {
        return MEMBER_LOOKUP_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $MemberLookupExpression;
  }(ParseTree);
  var ModuleDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleDeclaration = ($__createClass)({
      constructor: function(location, specifiers) {
        this.location = location;
        this.specifiers = specifiers;
      },
      transform: function(transformer) {
        return transformer.transformModuleDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitModuleDeclaration(this);
      },
      get type() {
        return MODULE_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $ModuleDeclaration;
  }(ParseTree);
  var ModuleDefinition = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleDefinition = ($__createClass)({
      constructor: function(location, name, elements) {
        this.location = location;
        this.name = name;
        this.elements = elements;
      },
      transform: function(transformer) {
        return transformer.transformModuleDefinition(this);
      },
      visit: function(visitor) {
        visitor.visitModuleDefinition(this);
      },
      get type() {
        return MODULE_DEFINITION;
      }
    }, {}, $__proto, $__super, true);
    return $ModuleDefinition;
  }(ParseTree);
  var ModuleExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleExpression = ($__createClass)({
      constructor: function(location, reference, identifiers) {
        this.location = location;
        this.reference = reference;
        this.identifiers = identifiers;
      },
      transform: function(transformer) {
        return transformer.transformModuleExpression(this);
      },
      visit: function(visitor) {
        visitor.visitModuleExpression(this);
      },
      get type() {
        return MODULE_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ModuleExpression;
  }(ParseTree);
  var ModuleRequire = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleRequire = ($__createClass)({
      constructor: function(location, url) {
        this.location = location;
        this.url = url;
      },
      transform: function(transformer) {
        return transformer.transformModuleRequire(this);
      },
      visit: function(visitor) {
        visitor.visitModuleRequire(this);
      },
      get type() {
        return MODULE_REQUIRE;
      }
    }, {}, $__proto, $__super, true);
    return $ModuleRequire;
  }(ParseTree);
  var ModuleSpecifier = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleSpecifier = ($__createClass)({
      constructor: function(location, identifier, expression) {
        this.location = location;
        this.identifier = identifier;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformModuleSpecifier(this);
      },
      visit: function(visitor) {
        visitor.visitModuleSpecifier(this);
      },
      get type() {
        return MODULE_SPECIFIER;
      }
    }, {}, $__proto, $__super, true);
    return $ModuleSpecifier;
  }(ParseTree);
  var NameStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $NameStatement = ($__createClass)({
      constructor: function(location, declarations) {
        this.location = location;
        this.declarations = declarations;
      },
      transform: function(transformer) {
        return transformer.transformNameStatement(this);
      },
      visit: function(visitor) {
        visitor.visitNameStatement(this);
      },
      get type() {
        return NAME_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $NameStatement;
  }(ParseTree);
  var NewExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $NewExpression = ($__createClass)({
      constructor: function(location, operand, args) {
        this.location = location;
        this.operand = operand;
        this.args = args;
      },
      transform: function(transformer) {
        return transformer.transformNewExpression(this);
      },
      visit: function(visitor) {
        visitor.visitNewExpression(this);
      },
      get type() {
        return NEW_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $NewExpression;
  }(ParseTree);
  var ObjectLiteralExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ObjectLiteralExpression = ($__createClass)({
      constructor: function(location, propertyNameAndValues) {
        this.location = location;
        this.propertyNameAndValues = propertyNameAndValues;
      },
      transform: function(transformer) {
        return transformer.transformObjectLiteralExpression(this);
      },
      visit: function(visitor) {
        visitor.visitObjectLiteralExpression(this);
      },
      get type() {
        return OBJECT_LITERAL_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ObjectLiteralExpression;
  }(ParseTree);
  var ObjectPattern = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ObjectPattern = ($__createClass)({
      constructor: function(location, fields) {
        this.location = location;
        this.fields = fields;
      },
      transform: function(transformer) {
        return transformer.transformObjectPattern(this);
      },
      visit: function(visitor) {
        visitor.visitObjectPattern(this);
      },
      get type() {
        return OBJECT_PATTERN;
      }
    }, {}, $__proto, $__super, true);
    return $ObjectPattern;
  }(ParseTree);
  var ObjectPatternField = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ObjectPatternField = ($__createClass)({
      constructor: function(location, identifier, element) {
        this.location = location;
        this.identifier = identifier;
        this.element = element;
      },
      transform: function(transformer) {
        return transformer.transformObjectPatternField(this);
      },
      visit: function(visitor) {
        visitor.visitObjectPatternField(this);
      },
      get type() {
        return OBJECT_PATTERN_FIELD;
      }
    }, {}, $__proto, $__super, true);
    return $ObjectPatternField;
  }(ParseTree);
  var ParenExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ParenExpression = ($__createClass)({
      constructor: function(location, expression) {
        this.location = location;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformParenExpression(this);
      },
      visit: function(visitor) {
        visitor.visitParenExpression(this);
      },
      get type() {
        return PAREN_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ParenExpression;
  }(ParseTree);
  var PostfixExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PostfixExpression = ($__createClass)({
      constructor: function(location, operand, operator) {
        this.location = location;
        this.operand = operand;
        this.operator = operator;
      },
      transform: function(transformer) {
        return transformer.transformPostfixExpression(this);
      },
      visit: function(visitor) {
        visitor.visitPostfixExpression(this);
      },
      get type() {
        return POSTFIX_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $PostfixExpression;
  }(ParseTree);
  var PredefinedType = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PredefinedType = ($__createClass)({
      constructor: function(location, typeToken) {
        this.location = location;
        this.typeToken = typeToken;
      },
      transform: function(transformer) {
        return transformer.transformPredefinedType(this);
      },
      visit: function(visitor) {
        visitor.visitPredefinedType(this);
      },
      get type() {
        return PREDEFINED_TYPE;
      }
    }, {}, $__proto, $__super, true);
    return $PredefinedType;
  }(ParseTree);
  var Program = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $Program = ($__createClass)({
      constructor: function(location, programElements) {
        this.location = location;
        this.programElements = programElements;
      },
      transform: function(transformer) {
        return transformer.transformProgram(this);
      },
      visit: function(visitor) {
        visitor.visitProgram(this);
      },
      get type() {
        return PROGRAM;
      }
    }, {}, $__proto, $__super, true);
    return $Program;
  }(ParseTree);
  var PropertyMethodAssignment = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PropertyMethodAssignment = ($__createClass)({
      constructor: function(location, isStatic, isGenerator, name, formalParameterList, functionBody) {
        this.location = location;
        this.isStatic = isStatic;
        this.isGenerator = isGenerator;
        this.name = name;
        this.formalParameterList = formalParameterList;
        this.functionBody = functionBody;
      },
      transform: function(transformer) {
        return transformer.transformPropertyMethodAssignment(this);
      },
      visit: function(visitor) {
        visitor.visitPropertyMethodAssignment(this);
      },
      get type() {
        return PROPERTY_METHOD_ASSIGNMENT;
      }
    }, {}, $__proto, $__super, true);
    return $PropertyMethodAssignment;
  }(ParseTree);
  var PropertyNameAssignment = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PropertyNameAssignment = ($__createClass)({
      constructor: function(location, name, value) {
        this.location = location;
        this.name = name;
        this.value = value;
      },
      transform: function(transformer) {
        return transformer.transformPropertyNameAssignment(this);
      },
      visit: function(visitor) {
        visitor.visitPropertyNameAssignment(this);
      },
      get type() {
        return PROPERTY_NAME_ASSIGNMENT;
      }
    }, {}, $__proto, $__super, true);
    return $PropertyNameAssignment;
  }(ParseTree);
  var PropertyNameShorthand = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PropertyNameShorthand = ($__createClass)({
      constructor: function(location, name) {
        this.location = location;
        this.name = name;
      },
      transform: function(transformer) {
        return transformer.transformPropertyNameShorthand(this);
      },
      visit: function(visitor) {
        visitor.visitPropertyNameShorthand(this);
      },
      get type() {
        return PROPERTY_NAME_SHORTHAND;
      }
    }, {}, $__proto, $__super, true);
    return $PropertyNameShorthand;
  }(ParseTree);
  var RestParameter = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $RestParameter = ($__createClass)({
      constructor: function(location, identifier) {
        this.location = location;
        this.identifier = identifier;
      },
      transform: function(transformer) {
        return transformer.transformRestParameter(this);
      },
      visit: function(visitor) {
        visitor.visitRestParameter(this);
      },
      get type() {
        return REST_PARAMETER;
      }
    }, {}, $__proto, $__super, true);
    return $RestParameter;
  }(ParseTree);
  var ReturnStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ReturnStatement = ($__createClass)({
      constructor: function(location, expression) {
        this.location = location;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformReturnStatement(this);
      },
      visit: function(visitor) {
        visitor.visitReturnStatement(this);
      },
      get type() {
        return RETURN_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ReturnStatement;
  }(ParseTree);
  var SetAccessor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SetAccessor = ($__createClass)({
      constructor: function(location, isStatic, name, parameter, body) {
        this.location = location;
        this.isStatic = isStatic;
        this.name = name;
        this.parameter = parameter;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformSetAccessor(this);
      },
      visit: function(visitor) {
        visitor.visitSetAccessor(this);
      },
      get type() {
        return SET_ACCESSOR;
      }
    }, {}, $__proto, $__super, true);
    return $SetAccessor;
  }(ParseTree);
  var SpreadExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SpreadExpression = ($__createClass)({
      constructor: function(location, expression) {
        this.location = location;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformSpreadExpression(this);
      },
      visit: function(visitor) {
        visitor.visitSpreadExpression(this);
      },
      get type() {
        return SPREAD_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $SpreadExpression;
  }(ParseTree);
  var SpreadPatternElement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SpreadPatternElement = ($__createClass)({
      constructor: function(location, lvalue) {
        this.location = location;
        this.lvalue = lvalue;
      },
      transform: function(transformer) {
        return transformer.transformSpreadPatternElement(this);
      },
      visit: function(visitor) {
        visitor.visitSpreadPatternElement(this);
      },
      get type() {
        return SPREAD_PATTERN_ELEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $SpreadPatternElement;
  }(ParseTree);
  var SuperExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SuperExpression = ($__createClass)({
      constructor: function(location) {
        this.location = location;
      },
      transform: function(transformer) {
        return transformer.transformSuperExpression(this);
      },
      visit: function(visitor) {
        visitor.visitSuperExpression(this);
      },
      get type() {
        return SUPER_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $SuperExpression;
  }(ParseTree);
  var SwitchStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SwitchStatement = ($__createClass)({
      constructor: function(location, expression, caseClauses) {
        this.location = location;
        this.expression = expression;
        this.caseClauses = caseClauses;
      },
      transform: function(transformer) {
        return transformer.transformSwitchStatement(this);
      },
      visit: function(visitor) {
        visitor.visitSwitchStatement(this);
      },
      get type() {
        return SWITCH_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $SwitchStatement;
  }(ParseTree);
  var SyntaxErrorTree = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SyntaxErrorTree = ($__createClass)({
      constructor: function(location, nextToken, message) {
        this.location = location;
        this.nextToken = nextToken;
        this.message = message;
      },
      transform: function(transformer) {
        return transformer.transformSyntaxErrorTree(this);
      },
      visit: function(visitor) {
        visitor.visitSyntaxErrorTree(this);
      },
      get type() {
        return SYNTAX_ERROR_TREE;
      }
    }, {}, $__proto, $__super, true);
    return $SyntaxErrorTree;
  }(ParseTree);
  var TemplateLiteralExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TemplateLiteralExpression = ($__createClass)({
      constructor: function(location, operand, elements) {
        this.location = location;
        this.operand = operand;
        this.elements = elements;
      },
      transform: function(transformer) {
        return transformer.transformTemplateLiteralExpression(this);
      },
      visit: function(visitor) {
        visitor.visitTemplateLiteralExpression(this);
      },
      get type() {
        return TEMPLATE_LITERAL_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $TemplateLiteralExpression;
  }(ParseTree);
  var TemplateLiteralPortion = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TemplateLiteralPortion = ($__createClass)({
      constructor: function(location, value) {
        this.location = location;
        this.value = value;
      },
      transform: function(transformer) {
        return transformer.transformTemplateLiteralPortion(this);
      },
      visit: function(visitor) {
        visitor.visitTemplateLiteralPortion(this);
      },
      get type() {
        return TEMPLATE_LITERAL_PORTION;
      }
    }, {}, $__proto, $__super, true);
    return $TemplateLiteralPortion;
  }(ParseTree);
  var TemplateSubstitution = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TemplateSubstitution = ($__createClass)({
      constructor: function(location, expression) {
        this.location = location;
        this.expression = expression;
      },
      transform: function(transformer) {
        return transformer.transformTemplateSubstitution(this);
      },
      visit: function(visitor) {
        visitor.visitTemplateSubstitution(this);
      },
      get type() {
        return TEMPLATE_SUBSTITUTION;
      }
    }, {}, $__proto, $__super, true);
    return $TemplateSubstitution;
  }(ParseTree);
  var ThisExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ThisExpression = ($__createClass)({
      constructor: function(location) {
        this.location = location;
      },
      transform: function(transformer) {
        return transformer.transformThisExpression(this);
      },
      visit: function(visitor) {
        visitor.visitThisExpression(this);
      },
      get type() {
        return THIS_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $ThisExpression;
  }(ParseTree);
  var ThrowStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ThrowStatement = ($__createClass)({
      constructor: function(location, value) {
        this.location = location;
        this.value = value;
      },
      transform: function(transformer) {
        return transformer.transformThrowStatement(this);
      },
      visit: function(visitor) {
        visitor.visitThrowStatement(this);
      },
      get type() {
        return THROW_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $ThrowStatement;
  }(ParseTree);
  var TryStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TryStatement = ($__createClass)({
      constructor: function(location, body, catchBlock, finallyBlock) {
        this.location = location;
        this.body = body;
        this.catchBlock = catchBlock;
        this.finallyBlock = finallyBlock;
      },
      transform: function(transformer) {
        return transformer.transformTryStatement(this);
      },
      visit: function(visitor) {
        visitor.visitTryStatement(this);
      },
      get type() {
        return TRY_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $TryStatement;
  }(ParseTree);
  var TypeName = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TypeName = ($__createClass)({
      constructor: function(location, moduleName, name) {
        this.location = location;
        this.moduleName = moduleName;
        this.name = name;
      },
      transform: function(transformer) {
        return transformer.transformTypeName(this);
      },
      visit: function(visitor) {
        visitor.visitTypeName(this);
      },
      get type() {
        return TYPE_NAME;
      }
    }, {}, $__proto, $__super, true);
    return $TypeName;
  }(ParseTree);
  var UnaryExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $UnaryExpression = ($__createClass)({
      constructor: function(location, operator, operand) {
        this.location = location;
        this.operator = operator;
        this.operand = operand;
      },
      transform: function(transformer) {
        return transformer.transformUnaryExpression(this);
      },
      visit: function(visitor) {
        visitor.visitUnaryExpression(this);
      },
      get type() {
        return UNARY_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $UnaryExpression;
  }(ParseTree);
  var VariableDeclaration = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $VariableDeclaration = ($__createClass)({
      constructor: function(location, lvalue, typeAnnotation, initializer) {
        this.location = location;
        this.lvalue = lvalue;
        this.typeAnnotation = typeAnnotation;
        this.initializer = initializer;
      },
      transform: function(transformer) {
        return transformer.transformVariableDeclaration(this);
      },
      visit: function(visitor) {
        visitor.visitVariableDeclaration(this);
      },
      get type() {
        return VARIABLE_DECLARATION;
      }
    }, {}, $__proto, $__super, true);
    return $VariableDeclaration;
  }(ParseTree);
  var VariableDeclarationList = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $VariableDeclarationList = ($__createClass)({
      constructor: function(location, declarationType, declarations) {
        this.location = location;
        this.declarationType = declarationType;
        this.declarations = declarations;
      },
      transform: function(transformer) {
        return transformer.transformVariableDeclarationList(this);
      },
      visit: function(visitor) {
        visitor.visitVariableDeclarationList(this);
      },
      get type() {
        return VARIABLE_DECLARATION_LIST;
      }
    }, {}, $__proto, $__super, true);
    return $VariableDeclarationList;
  }(ParseTree);
  var VariableStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $VariableStatement = ($__createClass)({
      constructor: function(location, declarations) {
        this.location = location;
        this.declarations = declarations;
      },
      transform: function(transformer) {
        return transformer.transformVariableStatement(this);
      },
      visit: function(visitor) {
        visitor.visitVariableStatement(this);
      },
      get type() {
        return VARIABLE_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $VariableStatement;
  }(ParseTree);
  var WhileStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $WhileStatement = ($__createClass)({
      constructor: function(location, condition, body) {
        this.location = location;
        this.condition = condition;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformWhileStatement(this);
      },
      visit: function(visitor) {
        visitor.visitWhileStatement(this);
      },
      get type() {
        return WHILE_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $WhileStatement;
  }(ParseTree);
  var WithStatement = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $WithStatement = ($__createClass)({
      constructor: function(location, expression, body) {
        this.location = location;
        this.expression = expression;
        this.body = body;
      },
      transform: function(transformer) {
        return transformer.transformWithStatement(this);
      },
      visit: function(visitor) {
        visitor.visitWithStatement(this);
      },
      get type() {
        return WITH_STATEMENT;
      }
    }, {}, $__proto, $__super, true);
    return $WithStatement;
  }(ParseTree);
  var YieldExpression = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $YieldExpression = ($__createClass)({
      constructor: function(location, expression, isYieldFor) {
        this.location = location;
        this.expression = expression;
        this.isYieldFor = isYieldFor;
      },
      transform: function(transformer) {
        return transformer.transformYieldExpression(this);
      },
      visit: function(visitor) {
        visitor.visitYieldExpression(this);
      },
      get type() {
        return YIELD_EXPRESSION;
      }
    }, {}, $__proto, $__super, true);
    return $YieldExpression;
  }(ParseTree);
  return Object.preventExtensions(Object.create(null, {
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
    AtNameDeclaration: {
      get: function() {
        return AtNameDeclaration;
      },
      enumerable: true
    },
    AtNameExpression: {
      get: function() {
        return AtNameExpression;
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
    ExportMapping: {
      get: function() {
        return ExportMapping;
      },
      enumerable: true
    },
    ExportMappingList: {
      get: function() {
        return ExportMappingList;
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
    ImportBinding: {
      get: function() {
        return ImportBinding;
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
    ModuleDeclaration: {
      get: function() {
        return ModuleDeclaration;
      },
      enumerable: true
    },
    ModuleDefinition: {
      get: function() {
        return ModuleDefinition;
      },
      enumerable: true
    },
    ModuleExpression: {
      get: function() {
        return ModuleExpression;
      },
      enumerable: true
    },
    ModuleRequire: {
      get: function() {
        return ModuleRequire;
      },
      enumerable: true
    },
    ModuleSpecifier: {
      get: function() {
        return ModuleSpecifier;
      },
      enumerable: true
    },
    NameStatement: {
      get: function() {
        return NameStatement;
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
    Program: {
      get: function() {
        return Program;
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
}).call(this);
var $___src_codegeneration_ParseTreeTransformer_js = (function() {
  "use strict";
  var $__18 = $___src_syntax_trees_ParseTrees_js, ArgumentList = $__18.ArgumentList, ArrayComprehension = $__18.ArrayComprehension, ArrayLiteralExpression = $__18.ArrayLiteralExpression, ArrayPattern = $__18.ArrayPattern, ArrowFunctionExpression = $__18.ArrowFunctionExpression, AtNameDeclaration = $__18.AtNameDeclaration, AtNameExpression = $__18.AtNameExpression, AwaitStatement = $__18.AwaitStatement, BinaryOperator = $__18.BinaryOperator, BindingElement = $__18.BindingElement, BindingIdentifier = $__18.BindingIdentifier, Block = $__18.Block, BreakStatement = $__18.BreakStatement, CallExpression = $__18.CallExpression, CascadeExpression = $__18.CascadeExpression, CaseClause = $__18.CaseClause, Catch = $__18.Catch, ClassDeclaration = $__18.ClassDeclaration, ClassExpression = $__18.ClassExpression, CommaExpression = $__18.CommaExpression, ComprehensionFor = $__18.ComprehensionFor, ComprehensionIf = $__18.ComprehensionIf, ConditionalExpression = $__18.ConditionalExpression, ContinueStatement = $__18.ContinueStatement, CoverFormals = $__18.CoverFormals, DebuggerStatement = $__18.DebuggerStatement, DefaultClause = $__18.DefaultClause, DoWhileStatement = $__18.DoWhileStatement, EmptyStatement = $__18.EmptyStatement, ExportDeclaration = $__18.ExportDeclaration, ExportMapping = $__18.ExportMapping, ExportMappingList = $__18.ExportMappingList, ExportSpecifier = $__18.ExportSpecifier, ExportSpecifierSet = $__18.ExportSpecifierSet, ExportStar = $__18.ExportStar, ExpressionStatement = $__18.ExpressionStatement, Finally = $__18.Finally, ForInStatement = $__18.ForInStatement, ForOfStatement = $__18.ForOfStatement, ForStatement = $__18.ForStatement, FormalParameterList = $__18.FormalParameterList, FunctionDeclaration = $__18.FunctionDeclaration, FunctionExpression = $__18.FunctionExpression, GeneratorComprehension = $__18.GeneratorComprehension, GetAccessor = $__18.GetAccessor, IdentifierExpression = $__18.IdentifierExpression, IfStatement = $__18.IfStatement, ImportBinding = $__18.ImportBinding, ImportDeclaration = $__18.ImportDeclaration, ImportSpecifier = $__18.ImportSpecifier, ImportSpecifierSet = $__18.ImportSpecifierSet, LabelledStatement = $__18.LabelledStatement, LiteralExpression = $__18.LiteralExpression, MemberExpression = $__18.MemberExpression, MemberLookupExpression = $__18.MemberLookupExpression, ModuleDeclaration = $__18.ModuleDeclaration, ModuleDefinition = $__18.ModuleDefinition, ModuleExpression = $__18.ModuleExpression, ModuleRequire = $__18.ModuleRequire, ModuleSpecifier = $__18.ModuleSpecifier, NameStatement = $__18.NameStatement, NewExpression = $__18.NewExpression, ObjectLiteralExpression = $__18.ObjectLiteralExpression, ObjectPattern = $__18.ObjectPattern, ObjectPatternField = $__18.ObjectPatternField, ParenExpression = $__18.ParenExpression, PostfixExpression = $__18.PostfixExpression, PredefinedType = $__18.PredefinedType, Program = $__18.Program, PropertyMethodAssignment = $__18.PropertyMethodAssignment, PropertyNameAssignment = $__18.PropertyNameAssignment, PropertyNameShorthand = $__18.PropertyNameShorthand, RestParameter = $__18.RestParameter, ReturnStatement = $__18.ReturnStatement, SetAccessor = $__18.SetAccessor, SpreadExpression = $__18.SpreadExpression, SpreadPatternElement = $__18.SpreadPatternElement, SuperExpression = $__18.SuperExpression, SwitchStatement = $__18.SwitchStatement, SyntaxErrorTree = $__18.SyntaxErrorTree, TemplateLiteralExpression = $__18.TemplateLiteralExpression, TemplateLiteralPortion = $__18.TemplateLiteralPortion, TemplateSubstitution = $__18.TemplateSubstitution, ThisExpression = $__18.ThisExpression, ThrowStatement = $__18.ThrowStatement, TryStatement = $__18.TryStatement, TypeName = $__18.TypeName, UnaryExpression = $__18.UnaryExpression, VariableDeclaration = $__18.VariableDeclaration, VariableDeclarationList = $__18.VariableDeclarationList, VariableStatement = $__18.VariableStatement, WhileStatement = $__18.WhileStatement, WithStatement = $__18.WithStatement, YieldExpression = $__18.YieldExpression;
  var ParseTreeTransformer = function() {
    'use strict';
    var $ParseTreeTransformer = ($__createClassNoExtends)({
      constructor: function() {},
      transformAny: function(tree) {
        return tree && tree.transform(this);
      },
      transformList: function(list) {
        var builder = null;
        for (var index = 0; index < list.length; index++) {
          var element = list[index];
          var transformed = this.transformAny(element);
          if (builder != null || element != transformed) {
            if (builder == null) {
              builder = list.slice(0, index);
            }
            builder.push(transformed);
          }
        }
        return builder || list;
      },
      transformStateMachine: function(tree) {
        throw Error('State machines should not live outside of the GeneratorTransformer.');
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
      transformAtNameDeclaration: function(tree) {
        var initializer = this.transformAny(tree.initializer);
        if (initializer === tree.initializer) {
          return tree;
        }
        return new AtNameDeclaration(tree.location, tree.atNameToken, initializer);
      },
      transformAtNameExpression: function(tree) {
        return tree;
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
      transformExportMapping: function(tree) {
        var moduleExpression = this.transformAny(tree.moduleExpression);
        var specifierSet = this.transformAny(tree.specifierSet);
        if (moduleExpression === tree.moduleExpression && specifierSet === tree.specifierSet) {
          return tree;
        }
        return new ExportMapping(tree.location, moduleExpression, specifierSet);
      },
      transformExportMappingList: function(tree) {
        var paths = this.transformList(tree.paths);
        if (paths === tree.paths) {
          return tree;
        }
        return new ExportMappingList(tree.location, paths);
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
        var body = this.transformAny(tree.body);
        if (body === tree.body) {
          return tree;
        }
        return new GetAccessor(tree.location, tree.isStatic, tree.name, body);
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
      transformImportBinding: function(tree) {
        var moduleExpression = this.transformAny(tree.moduleExpression);
        var importSpecifierSet = this.transformAny(tree.importSpecifierSet);
        if (moduleExpression === tree.moduleExpression && importSpecifierSet === tree.importSpecifierSet) {
          return tree;
        }
        return new ImportBinding(tree.location, moduleExpression, importSpecifierSet);
      },
      transformImportDeclaration: function(tree) {
        var importPathList = this.transformList(tree.importPathList);
        if (importPathList === tree.importPathList) {
          return tree;
        }
        return new ImportDeclaration(tree.location, importPathList);
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
      transformModuleDeclaration: function(tree) {
        var specifiers = this.transformList(tree.specifiers);
        if (specifiers === tree.specifiers) {
          return tree;
        }
        return new ModuleDeclaration(tree.location, specifiers);
      },
      transformModuleDefinition: function(tree) {
        var elements = this.transformList(tree.elements);
        if (elements === tree.elements) {
          return tree;
        }
        return new ModuleDefinition(tree.location, tree.name, elements);
      },
      transformModuleExpression: function(tree) {
        var reference = this.transformAny(tree.reference);
        if (reference === tree.reference) {
          return tree;
        }
        return new ModuleExpression(tree.location, reference, tree.identifiers);
      },
      transformModuleRequire: function(tree) {
        return tree;
      },
      transformModuleSpecifier: function(tree) {
        var expression = this.transformAny(tree.expression);
        if (expression === tree.expression) {
          return tree;
        }
        return new ModuleSpecifier(tree.location, tree.identifier, expression);
      },
      transformNameStatement: function(tree) {
        var declarations = this.transformList(tree.declarations);
        if (declarations === tree.declarations) {
          return tree;
        }
        return new NameStatement(tree.location, declarations);
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
        var element = this.transformAny(tree.element);
        if (element === tree.element) {
          return tree;
        }
        return new ObjectPatternField(tree.location, tree.identifier, element);
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
      transformProgram: function(tree) {
        var programElements = this.transformList(tree.programElements);
        if (programElements === tree.programElements) {
          return tree;
        }
        return new Program(tree.location, programElements);
      },
      transformPropertyMethodAssignment: function(tree) {
        var formalParameterList = this.transformAny(tree.formalParameterList);
        var functionBody = this.transformAny(tree.functionBody);
        if (formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
          return tree;
        }
        return new PropertyMethodAssignment(tree.location, tree.isStatic, tree.isGenerator, tree.name, formalParameterList, functionBody);
      },
      transformPropertyNameAssignment: function(tree) {
        var value = this.transformAny(tree.value);
        if (value === tree.value) {
          return tree;
        }
        return new PropertyNameAssignment(tree.location, tree.name, value);
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
        var parameter = this.transformAny(tree.parameter);
        var body = this.transformAny(tree.body);
        if (parameter === tree.parameter && body === tree.body) {
          return tree;
        }
        return new SetAccessor(tree.location, tree.isStatic, tree.name, parameter, body);
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
    return $ParseTreeTransformer;
  }();
  return Object.preventExtensions(Object.create(null, {ParseTreeTransformer: {
      get: function() {
        return ParseTreeTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_AssignmentPatternTransformer_js = (function() {
  "use strict";
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__18 = $___src_syntax_trees_ParseTrees_js, ArrayPattern = $__18.ArrayPattern, BindingElement = $__18.BindingElement, IdentifierExpression = $__18.IdentifierExpression, ObjectPattern = $__18.ObjectPattern, ObjectPatternField = $__18.ObjectPatternField, SpreadPatternElement = $__18.SpreadPatternElement;
  var EQUAL = $___src_syntax_TokenType_js.EQUAL;
  var AssignmentPatternTransformerError = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AssignmentPatternTransformerError = ($__createClass)({constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      }}, {}, $__proto, $__super, false);
    return $AssignmentPatternTransformerError;
  }(Error);
  var AssignmentPatternTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AssignmentPatternTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformBinaryOperator: function(tree) {
        if (tree.operator.type !== EQUAL) throw new AssignmentPatternTransformerError();
        var bindingElement = this.transformAny(tree.left);
        return new BindingElement(tree.location, bindingElement.binding, tree.right);
      },
      transformArrayLiteralExpression: function(tree) {
        var elements = this.transformList(tree.elements);
        return new ArrayPattern(tree.location, elements);
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
    }, {}, $__proto, $__super, false);
    return $AssignmentPatternTransformer;
  }(ParseTreeTransformer);
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
}).call(this);
var $___src_codegeneration_CoverFormalsTransformer_js = (function() {
  "use strict";
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__18 = $___src_syntax_trees_ParseTrees_js, ArrayPattern = $__18.ArrayPattern, BindingElement = $__18.BindingElement, BindingIdentifier = $__18.BindingIdentifier, FormalParameterList = $__18.FormalParameterList, ObjectPattern = $__18.ObjectPattern, ObjectPatternField = $__18.ObjectPatternField, RestParameter = $__18.RestParameter, SpreadPatternElement = $__18.SpreadPatternElement;
  var EQUAL = $___src_syntax_TokenType_js.EQUAL;
  var $__18 = $___src_syntax_trees_ParseTreeType_js, IDENTIFIER_EXPRESSION = $__18.IDENTIFIER_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__18.SPREAD_PATTERN_ELEMENT;
  var AssignmentPatternTransformerError = $___src_codegeneration_AssignmentPatternTransformer_js.AssignmentPatternTransformerError;
  var CoverFormalsTransformerError = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CoverFormalsTransformerError = ($__createClass)({constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      }}, {}, $__proto, $__super, false);
    return $CoverFormalsTransformerError;
  }(Error);
  var CoverFormalsTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CoverFormalsTransformer = ($__createClass)({
      constructor: function() {
        this.isValid = true;
        this.inArrayPattern_ = false;
      },
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
        return new BindingElement(tree.location, bindingElement.binding, tree.right);
      },
      transformArrayLiteralExpression: function(tree) {
        var wasInArrayPattern = this.inArrayPattern_;
        this.inArrayPattern_ = true;
        var elements = this.transformList(tree.elements);
        this.inArrayPattern_ = wasInArrayPattern;
        var okIndex = elements.length - 1;
        for (var i = 0; i < okIndex; i++) {
          if (elements[i].type === SPREAD_PATTERN_ELEMENT) throw new CoverFormalsTransformerError();
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
    }, {}, $__proto, $__super, true);
    return $CoverFormalsTransformer;
  }(ParseTreeTransformer);
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
}).call(this);
var $___src_syntax_IdentifierToken_js = (function() {
  "use strict";
  var Token = $___src_syntax_Token_js.Token;
  var IDENTIFIER = $___src_syntax_TokenType_js.IDENTIFIER;
  var IdentifierToken = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $IdentifierToken = ($__createClass)({
      constructor: function(location, value) {
        this.location = location;
        this.value = value;
      },
      toString: function() {
        return this.value;
      },
      get type() {
        return IDENTIFIER;
      }
    }, {}, $__proto, $__super, true);
    return $IdentifierToken;
  }(Token);
  return Object.preventExtensions(Object.create(null, {IdentifierToken: {
      get: function() {
        return IdentifierToken;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_PredefinedName_js = (function() {
  "use strict";
  var ADD_ITERATOR = 'addIterator';
  var ANY = 'any';
  var $ARGUMENTS = '$arguments';
  var $THAT = '$that';
  var $VALUE = '$value';
  var ADD_CONTINUATION = 'addContinuation';
  var APPLY = 'apply';
  var ARGUMENTS = 'arguments';
  var ARRAY = 'Array';
  var ASSERT_NAME = 'assertName';
  var BIND = 'bind';
  var BOOL = 'bool';
  var CALL = 'call';
  var CALLBACK = 'callback';
  var CAPTURED_ARGUMENTS = '$arguments';
  var CAPTURED_THIS = '$this';
  var CAUGHT_EXCEPTION = '$caughtException';
  var CLOSE = 'close';
  var CONFIGURABLE = 'configurable';
  var CONSTRUCTOR = 'constructor';
  var CONTINUATION = '$continuation';
  var CREATE = 'create';
  var CREATE_CALLBACK = '$createCallback';
  var CREATE_CLASS = 'createClass';
  var CREATE_ERRBACK = '$createErrback';
  var CREATE_NAME = 'createName';
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
  var FIELD_INITIALIZER_METHOD = '$field_initializer_';
  var FINALLY_FALL_THROUGH = '$finallyFallThrough';
  var FREEZE = 'freeze';
  var FROM = 'from';
  var FUNCTION = 'Function';
  var GET = 'get';
  var GET_ITERATOR = 'getIterator';
  var GET_MODULE_INSTANCE_BY_URL = 'getModuleInstanceByUrl';
  var GET_PROPERTY = 'getProperty';
  var HAS = 'has';
  var INIT = '$init';
  var IS_DONE = 'isDone';
  var ITERATOR = 'iterator';
  var INNER_FUNCTION = 'innerFunction';
  var LENGTH = 'length';
  var MODULE = 'module';
  var MODULES = 'modules';
  var MOVE_NEXT = 'moveNext';
  var NEW = 'new';
  var NEW_STATE = '$newState';
  var NUMBER = 'number';
  var OBJECT = 'Object';
  var OBJECT_NAME = 'Object';
  var OF = 'of';
  var PARAM = '$param';
  var PREVENT_EXTENSIONS = 'preventExtensions';
  var PROTO = '__proto__';
  var PROTOTYPE = 'prototype';
  var PUSH = 'push';
  var RAW = 'raw';
  var REQUIRE = 'require';
  var REQUIRED = 'required';
  var REQUIRES = 'requires';
  var RESOLVE = 'resolve';
  var RESULT = '$result';
  var RUNTIME = 'runtime';
  var SET = 'set';
  var SET_PROPERTY = 'setProperty';
  var SLICE = 'slice';
  var SPREAD = 'spread';
  var SPREAD_NEW = 'spreadNew';
  var STATE = '$state';
  var STORED_EXCEPTION = '$storedException';
  var STRING = 'string';
  var SUPER_CALL = 'superCall';
  var SUPER_GET = 'superGet';
  var SUPER_SET = 'superSet';
  var THEN = 'then';
  var THIS = 'this';
  var TRACEUR = 'traceur';
  var TRACEUR_MODULES = '$traceurModules';
  var TRACEUR_RUNTIME = '$traceurRuntime';
  var TYPE_ERROR = 'TypeError';
  var UNDEFINED = 'undefined';
  var VALUE = 'value';
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
  var ACTION_CLOSE = 2;
  return Object.preventExtensions(Object.create(null, {
    ADD_ITERATOR: {
      get: function() {
        return ADD_ITERATOR;
      },
      enumerable: true
    },
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
    CAPTURED_ARGUMENTS: {
      get: function() {
        return CAPTURED_ARGUMENTS;
      },
      enumerable: true
    },
    CAPTURED_THIS: {
      get: function() {
        return CAPTURED_THIS;
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
    CREATE_CLASS: {
      get: function() {
        return CREATE_CLASS;
      },
      enumerable: true
    },
    CREATE_ERRBACK: {
      get: function() {
        return CREATE_ERRBACK;
      },
      enumerable: true
    },
    CREATE_NAME: {
      get: function() {
        return CREATE_NAME;
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
    FIELD_INITIALIZER_METHOD: {
      get: function() {
        return FIELD_INITIALIZER_METHOD;
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
    GET_ITERATOR: {
      get: function() {
        return GET_ITERATOR;
      },
      enumerable: true
    },
    GET_MODULE_INSTANCE_BY_URL: {
      get: function() {
        return GET_MODULE_INSTANCE_BY_URL;
      },
      enumerable: true
    },
    GET_PROPERTY: {
      get: function() {
        return GET_PROPERTY;
      },
      enumerable: true
    },
    HAS: {
      get: function() {
        return HAS;
      },
      enumerable: true
    },
    INIT: {
      get: function() {
        return INIT;
      },
      enumerable: true
    },
    IS_DONE: {
      get: function() {
        return IS_DONE;
      },
      enumerable: true
    },
    ITERATOR: {
      get: function() {
        return ITERATOR;
      },
      enumerable: true
    },
    INNER_FUNCTION: {
      get: function() {
        return INNER_FUNCTION;
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
    MODULES: {
      get: function() {
        return MODULES;
      },
      enumerable: true
    },
    MOVE_NEXT: {
      get: function() {
        return MOVE_NEXT;
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
    PARAM: {
      get: function() {
        return PARAM;
      },
      enumerable: true
    },
    PREVENT_EXTENSIONS: {
      get: function() {
        return PREVENT_EXTENSIONS;
      },
      enumerable: true
    },
    PROTO: {
      get: function() {
        return PROTO;
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
    REQUIRE: {
      get: function() {
        return REQUIRE;
      },
      enumerable: true
    },
    REQUIRED: {
      get: function() {
        return REQUIRED;
      },
      enumerable: true
    },
    REQUIRES: {
      get: function() {
        return REQUIRES;
      },
      enumerable: true
    },
    RESOLVE: {
      get: function() {
        return RESOLVE;
      },
      enumerable: true
    },
    RESULT: {
      get: function() {
        return RESULT;
      },
      enumerable: true
    },
    RUNTIME: {
      get: function() {
        return RUNTIME;
      },
      enumerable: true
    },
    SET: {
      get: function() {
        return SET;
      },
      enumerable: true
    },
    SET_PROPERTY: {
      get: function() {
        return SET_PROPERTY;
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
    SUPER_CALL: {
      get: function() {
        return SUPER_CALL;
      },
      enumerable: true
    },
    SUPER_GET: {
      get: function() {
        return SUPER_GET;
      },
      enumerable: true
    },
    SUPER_SET: {
      get: function() {
        return SUPER_SET;
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
    TRACEUR: {
      get: function() {
        return TRACEUR;
      },
      enumerable: true
    },
    TRACEUR_MODULES: {
      get: function() {
        return TRACEUR_MODULES;
      },
      enumerable: true
    },
    TRACEUR_RUNTIME: {
      get: function() {
        return TRACEUR_RUNTIME;
      },
      enumerable: true
    },
    TYPE_ERROR: {
      get: function() {
        return TYPE_ERROR;
      },
      enumerable: true
    },
    UNDEFINED: {
      get: function() {
        return UNDEFINED;
      },
      enumerable: true
    },
    VALUE: {
      get: function() {
        return VALUE;
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
    },
    ACTION_CLOSE: {
      get: function() {
        return ACTION_CLOSE;
      },
      enumerable: true
    }
  }));
}).call(this);
var $___src_syntax_AtNameToken_js = (function() {
  "use strict";
  var Token = $___src_syntax_Token_js.Token;
  var AT_NAME = $___src_syntax_TokenType_js.AT_NAME;
  var AtNameToken = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AtNameToken = ($__createClass)({
      constructor: function(location, value) {
        this.location = location;
        this.value = value;
      },
      toString: function() {
        return this.value;
      },
      get type() {
        return AT_NAME;
      }
    }, {}, $__proto, $__super, true);
    return $AtNameToken;
  }(Token);
  return Object.preventExtensions(Object.create(null, {AtNameToken: {
      get: function() {
        return AtNameToken;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_Keywords_js = (function() {
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
}).call(this);
var $___src_syntax_KeywordToken_js = (function() {
  "use strict";
  var STRICT_KEYWORD = $___src_syntax_Keywords_js.STRICT_KEYWORD;
  var Token = $___src_syntax_Token_js.Token;
  var KeywordToken = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $KeywordToken = ($__createClass)({
      constructor: function(type, keywordType, location) {
        this.type = type;
        this.location = location;
        this.isStrictKeyword_ = keywordType === STRICT_KEYWORD;
      },
      isKeyword: function() {
        return true;
      },
      isStrictKeyword: function() {
        return this.isStrictKeyword_;
      }
    }, {}, $__proto, $__super, true);
    return $KeywordToken;
  }(Token);
  return Object.preventExtensions(Object.create(null, {KeywordToken: {
      get: function() {
        return KeywordToken;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_LiteralToken_js = (function() {
  "use strict";
  var Token = $___src_syntax_Token_js.Token;
  var $__18 = $___src_syntax_TokenType_js, NULL = $__18.NULL, NUMBER = $__18.NUMBER, STRING = $__18.STRING;
  var StringParser = function() {
    'use strict';
    var $StringParser = ($__createClassNoExtends)({
      constructor: function(value) {
        this.value = value;
        this.index = 0;
      },
      next: function() {
        if (++this.index >= this.value.length - 1) throw StopIteration;
        return this.value[this.index];
      },
      parse: function() {
        if (this.value.indexOf('\\') === - 1) return this.value.slice(1, - 1);
        var result = '';
        {
          var $__5 = $traceurRuntime.getIterator(this);
          try {
            while (true) {
              var ch = $__5.next();
              {
                result += ch === '\\' ? this.parseEscapeSequence(): ch;
              }
            }
          } catch (e) {
            if (!$traceurRuntime.isStopIteration(e)) throw e;
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
            return String.fromCharCode(parseInt(next() + next(), 16));
          case 'u':
            return String.fromCharCode(parseInt(next() + next() + next() + next(), 16));
          default:
            if (Number(ch) < 8) throw new Error('Octal literals are not supported');
            return ch;
        }
      }
    }, {});
    return $StringParser;
  }();
  var LiteralToken = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $LiteralToken = ($__createClass)({
      constructor: function(type, value, location) {
        this.type = type;
        this.location = location;
        this.value = value;
      },
      toString: function() {
        return this.value;
      },
      get processedValue() {
        switch (this.type) {
          case NULL:
            return null;
          case NUMBER:
            return Number(this.value);
          case STRING:
            var parser = new StringParser(this.value);
            return parser.parse();
          default:
            throw new Error('Not implemented');
        }
      }
    }, {}, $__proto, $__super, true);
    return $LiteralToken;
  }(Token);
  return Object.preventExtensions(Object.create(null, {LiteralToken: {
      get: function() {
        return LiteralToken;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_Scanner_js = (function() {
  "use strict";
  var AtNameToken = $___src_syntax_AtNameToken_js.AtNameToken;
  var IdentifierToken = $___src_syntax_IdentifierToken_js.IdentifierToken;
  var KeywordToken = $___src_syntax_KeywordToken_js.KeywordToken;
  var LiteralToken = $___src_syntax_LiteralToken_js.LiteralToken;
  var Token = $___src_syntax_Token_js.Token;
  var getKeywordType = $___src_syntax_Keywords_js.getKeywordType;
  var $__18 = $___src_syntax_TokenType_js, AMPERSAND = $__18.AMPERSAND, AMPERSAND_EQUAL = $__18.AMPERSAND_EQUAL, AND = $__18.AND, ARROW = $__18.ARROW, AT_NAME = $__18.AT_NAME, AWAIT = $__18.AWAIT, BACK_QUOTE = $__18.BACK_QUOTE, BANG = $__18.BANG, BAR = $__18.BAR, BAR_EQUAL = $__18.BAR_EQUAL, BREAK = $__18.BREAK, CARET = $__18.CARET, CARET_EQUAL = $__18.CARET_EQUAL, CASE = $__18.CASE, CATCH = $__18.CATCH, CLASS = $__18.CLASS, CLOSE_ANGLE = $__18.CLOSE_ANGLE, CLOSE_CURLY = $__18.CLOSE_CURLY, CLOSE_PAREN = $__18.CLOSE_PAREN, CLOSE_SQUARE = $__18.CLOSE_SQUARE, COLON = $__18.COLON, COMMA = $__18.COMMA, CONST = $__18.CONST, CONTINUE = $__18.CONTINUE, DEBUGGER = $__18.DEBUGGER, DEFAULT = $__18.DEFAULT, DELETE = $__18.DELETE, DO = $__18.DO, DOLLAR = $__18.DOLLAR, DOT_DOT_DOT = $__18.DOT_DOT_DOT, ELSE = $__18.ELSE, END_OF_FILE = $__18.END_OF_FILE, ENUM = $__18.ENUM, EQUAL = $__18.EQUAL, EQUAL_EQUAL = $__18.EQUAL_EQUAL, EQUAL_EQUAL_EQUAL = $__18.EQUAL_EQUAL_EQUAL, ERROR = $__18.ERROR, EXPORT = $__18.EXPORT, EXTENDS = $__18.EXTENDS, FALSE = $__18.FALSE, FINALLY = $__18.FINALLY, FOR = $__18.FOR, FUNCTION = $__18.FUNCTION, GREATER_EQUAL = $__18.GREATER_EQUAL, IDENTIFIER = $__18.IDENTIFIER, IF = $__18.IF, IMPLEMENTS = $__18.IMPLEMENTS, IMPORT = $__18.IMPORT, IN = $__18.IN, INSTANCEOF = $__18.INSTANCEOF, INTERFACE = $__18.INTERFACE, LEFT_SHIFT = $__18.LEFT_SHIFT, LEFT_SHIFT_EQUAL = $__18.LEFT_SHIFT_EQUAL, LESS_EQUAL = $__18.LESS_EQUAL, LET = $__18.LET, MINUS = $__18.MINUS, MINUS_EQUAL = $__18.MINUS_EQUAL, MINUS_MINUS = $__18.MINUS_MINUS, NEW = $__18.NEW, NO_SUBSTITUTION_TEMPLATE = $__18.NO_SUBSTITUTION_TEMPLATE, NOT_EQUAL = $__18.NOT_EQUAL, NOT_EQUAL_EQUAL = $__18.NOT_EQUAL_EQUAL, NULL = $__18.NULL, NUMBER = $__18.NUMBER, OPEN_ANGLE = $__18.OPEN_ANGLE, OPEN_CURLY = $__18.OPEN_CURLY, OPEN_PAREN = $__18.OPEN_PAREN, OPEN_SQUARE = $__18.OPEN_SQUARE, OR = $__18.OR, PACKAGE = $__18.PACKAGE, PERCENT = $__18.PERCENT, PERCENT_EQUAL = $__18.PERCENT_EQUAL, PERIOD = $__18.PERIOD, PERIOD_OPEN_CURLY = $__18.PERIOD_OPEN_CURLY, PLUS = $__18.PLUS, PLUS_EQUAL = $__18.PLUS_EQUAL, PLUS_PLUS = $__18.PLUS_PLUS, PRIVATE = $__18.PRIVATE, PROTECTED = $__18.PROTECTED, PUBLIC = $__18.PUBLIC, QUESTION = $__18.QUESTION, REGULAR_EXPRESSION = $__18.REGULAR_EXPRESSION, RETURN = $__18.RETURN, RIGHT_SHIFT = $__18.RIGHT_SHIFT, RIGHT_SHIFT_EQUAL = $__18.RIGHT_SHIFT_EQUAL, SEMI_COLON = $__18.SEMI_COLON, SLASH = $__18.SLASH, SLASH_EQUAL = $__18.SLASH_EQUAL, STAR = $__18.STAR, STAR_EQUAL = $__18.STAR_EQUAL, STATIC = $__18.STATIC, STRING = $__18.STRING, SUPER = $__18.SUPER, SWITCH = $__18.SWITCH, TEMPLATE_HEAD = $__18.TEMPLATE_HEAD, TEMPLATE_MIDDLE = $__18.TEMPLATE_MIDDLE, TEMPLATE_TAIL = $__18.TEMPLATE_TAIL, THIS = $__18.THIS, THROW = $__18.THROW, TILDE = $__18.TILDE, TRUE = $__18.TRUE, TRY = $__18.TRY, TYPEOF = $__18.TYPEOF, UNSIGNED_RIGHT_SHIFT = $__18.UNSIGNED_RIGHT_SHIFT, UNSIGNED_RIGHT_SHIFT_EQUAL = $__18.UNSIGNED_RIGHT_SHIFT_EQUAL, VAR = $__18.VAR, VOID = $__18.VOID, WHILE = $__18.WHILE, WITH = $__18.WITH, YIELD = $__18.YIELD;
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
  var isIdentifierStartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierStartArray[i] = i === 36 || i >= 65 && i <= 90 || i === 95 || i >= 97 && i <= 122;
  }
  function isIdentifierStart(code) {
    return code < 128 ? isIdentifierStartArray[code]: isUnicodeLetter(code);
  }
  var isIdentifierPartArray = [];
  for (var i = 0; i < 128; i++) {
    isIdentifierPartArray[i] = isIdentifierStart(i) || isDecimalDigit(i);
  }
  function isIdentifierPart(code) {
    return code < 128 ? isIdentifierPartArray[code]: isUnicodeLetter(code);
  }
  var unicodeLetterTable = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750, 880, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957, 1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069, 2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2423, 2425, 2431, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3805, 3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198, 4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4304, 4346, 4348, 4348, 4352, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6103, 6103, 6108, 6108, 6176, 6263, 6272, 6312, 6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516, 6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7104, 7141, 7168, 7203, 7245, 7247, 7258, 7293, 7401, 7404, 7406, 7409, 7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358, 11360, 11492, 11499, 11502, 11520, 11557, 11568, 11621, 11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 11823, 11823, 12293, 12295, 12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438, 12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 13312, 19893, 19893, 19968, 19968, 40907, 40907, 40960, 42124, 42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539, 42560, 42606, 42623, 42647, 42656, 42735, 42775, 42783, 42786, 42888, 42891, 42894, 42896, 42897, 42912, 42921, 43002, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43638, 43642, 43642, 43648, 43695, 43697, 43697, 43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714, 43739, 43741, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44002, 44032, 44032, 55203, 55203, 55216, 55238, 55243, 55291, 63744, 64045, 64048, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594, 65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786, 65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334, 66352, 66378, 66432, 66461, 66464, 66499, 66504, 66511, 66513, 66517, 66560, 66717, 67584, 67589, 67592, 67592, 67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669, 67840, 67861, 67872, 67897, 68096, 68096, 68112, 68115, 68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405, 68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687, 69763, 69807, 73728, 74606, 74752, 74850, 77824, 78894, 92160, 92728, 110592, 110593, 119808, 119892, 119894, 119964, 119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980, 119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069, 120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121, 120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144, 120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570, 120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686, 120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779, 131072, 131072, 173782, 173782, 173824, 173824, 177972, 177972, 177984, 177984, 178205, 178205, 194560, 195101];
  function isUnicodeLetter(code) {
    for (var i = 0; i < unicodeLetterTable.length;) {
      if (code < unicodeLetterTable[i++]) return false;
      if (code <= unicodeLetterTable[i++]) return true;
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
  var index, input, length, token, lastToken, lookaheadToken, currentCharCode, lineNumberTable, errorReporter, currentParser;
  var Scanner = function() {
    'use strict';
    var $Scanner = ($__createClassNoExtends)({
      constructor: function(reporter, file, parser) {
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
      },
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
    return $Scanner;
  }();
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
    var beginIndex = index - 1;
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
      case 64:
        return scanAtName(beginIndex);
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
      case 88:
      case 120:
        next();
        if (!isHexDigit(currentCharCode)) {
          reportError('Hex Integer Literal must contain at least one digit');
        }
        skipHexDigits();
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
      case 46:
        return scanFractionalNumericLiteral(beginIndex);
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
      default:
        return new LiteralToken(NUMBER, getTokenString(beginIndex), getTokenRange(beginIndex));
    }
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
  function scanAtName(beginIndex) {
    if (isAtEnd()) {
      reportError('Expected identifier start character', beginIndex);
      return createToken(ERROR, beginIndex);
    }
    var code = currentCharCode;
    next();
    var identifierToken = scanIdentifierOrKeyword(beginIndex, code);
    if (identifierToken.type === ERROR) return identifierToken;
    var value = identifierToken.value;
    return new AtNameToken(getTokenRange(beginIndex), value);
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
}).call(this);
var $___src_util_SourceRange_js = (function() {
  "use strict";
  var SourceRange = function() {
    'use strict';
    var $SourceRange = ($__createClassNoExtends)({constructor: function(start, end) {
        this.start = start;
        this.end = end;
      }}, {});
    return $SourceRange;
  }();
  return Object.preventExtensions(Object.create(null, {SourceRange: {
      get: function() {
        return SourceRange;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_staticsemantics_StrictParams_js = (function() {
  "use strict";
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var isStrictKeyword = $___src_syntax_Keywords_js.isStrictKeyword;
  var StrictParams = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $StrictParams = ($__createClass)({
      constructor: function(errorReporter) {
        $__superCall(this, $__proto, "constructor", []);
        this.errorReporter = errorReporter;
      },
      visitBindingIdentifier: function(tree) {
        var name = tree.identifierToken.value;
        if (isStrictKeyword(name)) {
          this.errorReporter.reportError(tree.location.start, (name + " is a reserved identifier"));
        }
      }
    }, {visit: function(tree, errorReporter) {
        new StrictParams(errorReporter).visitAny(tree);
      }}, $__proto, $__super, true);
    return $StrictParams;
  }(ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {StrictParams: {
      get: function() {
        return StrictParams;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_Parser_js = (function() {
  "use strict";
  var $__18 = $___src_codegeneration_AssignmentPatternTransformer_js, AssignmentPatternTransformer = $__18.AssignmentPatternTransformer, AssignmentPatternTransformerError = $__18.AssignmentPatternTransformerError;
  var $__18 = $___src_codegeneration_CoverFormalsTransformer_js, CoverFormalsTransformer = $__18.CoverFormalsTransformer, CoverFormalsTransformerError = $__18.CoverFormalsTransformerError;
  var IdentifierToken = $___src_syntax_IdentifierToken_js.IdentifierToken;
  var $__18 = $___src_syntax_trees_ParseTreeType_js, ARRAY_LITERAL_EXPRESSION = $__18.ARRAY_LITERAL_EXPRESSION, BINARY_OPERATOR = $__18.BINARY_OPERATOR, CALL_EXPRESSION = $__18.CALL_EXPRESSION, CASCADE_EXPRESSION = $__18.CASCADE_EXPRESSION, COMMA_EXPRESSION = $__18.COMMA_EXPRESSION, FORMAL_PARAMETER_LIST = $__18.FORMAL_PARAMETER_LIST, IDENTIFIER_EXPRESSION = $__18.IDENTIFIER_EXPRESSION, MEMBER_EXPRESSION = $__18.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__18.MEMBER_LOOKUP_EXPRESSION, OBJECT_LITERAL_EXPRESSION = $__18.OBJECT_LITERAL_EXPRESSION, PAREN_EXPRESSION = $__18.PAREN_EXPRESSION, PROPERTY_NAME_ASSIGNMENT = $__18.PROPERTY_NAME_ASSIGNMENT, REST_PARAMETER = $__18.REST_PARAMETER, SYNTAX_ERROR_TREE = $__18.SYNTAX_ERROR_TREE;
  var $__18 = $___src_syntax_PredefinedName_js, ANY = $__18.ANY, BOOL = $__18.BOOL, FROM = $__18.FROM, GET = $__18.GET, MODULE = $__18.MODULE, NUMBER = $__18.NUMBER, OF = $__18.OF, SET = $__18.SET, STRING = $__18.STRING;
  var Scanner = $___src_syntax_Scanner_js.Scanner;
  var SourceRange = $___src_util_SourceRange_js.SourceRange;
  var StrictParams = $___src_staticsemantics_StrictParams_js.StrictParams;
  var $__18 = $___src_syntax_Token_js, Token = $__18.Token, isAssignmentOperator = $__18.isAssignmentOperator;
  var $__18 = $___src_options_js, parseOptions = $__18.parseOptions, options = $__18.options;
  var $__18 = $___src_syntax_TokenType_js, AMPERSAND = $__18.AMPERSAND, AMPERSAND_EQUAL = $__18.AMPERSAND_EQUAL, AND = $__18.AND, ARROW = $__18.ARROW, AT_NAME = $__18.AT_NAME, AWAIT = $__18.AWAIT, BACK_QUOTE = $__18.BACK_QUOTE, BANG = $__18.BANG, BAR = $__18.BAR, BAR_EQUAL = $__18.BAR_EQUAL, BREAK = $__18.BREAK, CARET = $__18.CARET, CARET_EQUAL = $__18.CARET_EQUAL, CASE = $__18.CASE, CATCH = $__18.CATCH, CLASS = $__18.CLASS, CLOSE_ANGLE = $__18.CLOSE_ANGLE, CLOSE_CURLY = $__18.CLOSE_CURLY, CLOSE_PAREN = $__18.CLOSE_PAREN, CLOSE_SQUARE = $__18.CLOSE_SQUARE, COLON = $__18.COLON, COMMA = $__18.COMMA, CONST = $__18.CONST, CONTINUE = $__18.CONTINUE, DEBUGGER = $__18.DEBUGGER, DEFAULT = $__18.DEFAULT, DELETE = $__18.DELETE, DO = $__18.DO, DOLLAR = $__18.DOLLAR, DOT_DOT_DOT = $__18.DOT_DOT_DOT, ELSE = $__18.ELSE, END_OF_FILE = $__18.END_OF_FILE, ENUM = $__18.ENUM, EQUAL = $__18.EQUAL, EQUAL_EQUAL = $__18.EQUAL_EQUAL, EQUAL_EQUAL_EQUAL = $__18.EQUAL_EQUAL_EQUAL, ERROR = $__18.ERROR, EXPORT = $__18.EXPORT, EXTENDS = $__18.EXTENDS, FALSE = $__18.FALSE, FINALLY = $__18.FINALLY, FOR = $__18.FOR, FUNCTION = $__18.FUNCTION, GREATER_EQUAL = $__18.GREATER_EQUAL, IDENTIFIER = $__18.IDENTIFIER, IF = $__18.IF, IMPLEMENTS = $__18.IMPLEMENTS, IMPORT = $__18.IMPORT, IN = $__18.IN, INSTANCEOF = $__18.INSTANCEOF, INTERFACE = $__18.INTERFACE, LEFT_SHIFT = $__18.LEFT_SHIFT, LEFT_SHIFT_EQUAL = $__18.LEFT_SHIFT_EQUAL, LESS_EQUAL = $__18.LESS_EQUAL, LET = $__18.LET, MINUS = $__18.MINUS, MINUS_EQUAL = $__18.MINUS_EQUAL, MINUS_MINUS = $__18.MINUS_MINUS, NEW = $__18.NEW, NO_SUBSTITUTION_TEMPLATE = $__18.NO_SUBSTITUTION_TEMPLATE, NOT_EQUAL = $__18.NOT_EQUAL, NOT_EQUAL_EQUAL = $__18.NOT_EQUAL_EQUAL, NULL = $__18.NULL, NUMBER = $__18.NUMBER, OPEN_ANGLE = $__18.OPEN_ANGLE, OPEN_CURLY = $__18.OPEN_CURLY, OPEN_PAREN = $__18.OPEN_PAREN, OPEN_SQUARE = $__18.OPEN_SQUARE, OR = $__18.OR, PACKAGE = $__18.PACKAGE, PERCENT = $__18.PERCENT, PERCENT_EQUAL = $__18.PERCENT_EQUAL, PERIOD = $__18.PERIOD, PERIOD_OPEN_CURLY = $__18.PERIOD_OPEN_CURLY, PLUS = $__18.PLUS, PLUS_EQUAL = $__18.PLUS_EQUAL, PLUS_PLUS = $__18.PLUS_PLUS, PRIVATE = $__18.PRIVATE, PROTECTED = $__18.PROTECTED, PUBLIC = $__18.PUBLIC, QUESTION = $__18.QUESTION, REGULAR_EXPRESSION = $__18.REGULAR_EXPRESSION, RETURN = $__18.RETURN, RIGHT_SHIFT = $__18.RIGHT_SHIFT, RIGHT_SHIFT_EQUAL = $__18.RIGHT_SHIFT_EQUAL, SEMI_COLON = $__18.SEMI_COLON, SLASH = $__18.SLASH, SLASH_EQUAL = $__18.SLASH_EQUAL, STAR = $__18.STAR, STAR_EQUAL = $__18.STAR_EQUAL, STATIC = $__18.STATIC, STRING = $__18.STRING, SUPER = $__18.SUPER, SWITCH = $__18.SWITCH, TEMPLATE_HEAD = $__18.TEMPLATE_HEAD, TEMPLATE_MIDDLE = $__18.TEMPLATE_MIDDLE, TEMPLATE_TAIL = $__18.TEMPLATE_TAIL, THIS = $__18.THIS, THROW = $__18.THROW, TILDE = $__18.TILDE, TRUE = $__18.TRUE, TRY = $__18.TRY, TYPEOF = $__18.TYPEOF, UNSIGNED_RIGHT_SHIFT = $__18.UNSIGNED_RIGHT_SHIFT, UNSIGNED_RIGHT_SHIFT_EQUAL = $__18.UNSIGNED_RIGHT_SHIFT_EQUAL, VAR = $__18.VAR, VOID = $__18.VOID, WHILE = $__18.WHILE, WITH = $__18.WITH, YIELD = $__18.YIELD;
  var $__18 = $___src_syntax_trees_ParseTrees_js, ArgumentList = $__18.ArgumentList, ArrayComprehension = $__18.ArrayComprehension, ArrayLiteralExpression = $__18.ArrayLiteralExpression, ArrayPattern = $__18.ArrayPattern, ArrowFunctionExpression = $__18.ArrowFunctionExpression, AtNameDeclaration = $__18.AtNameDeclaration, AtNameExpression = $__18.AtNameExpression, AwaitStatement = $__18.AwaitStatement, BinaryOperator = $__18.BinaryOperator, BindingElement = $__18.BindingElement, BindingIdentifier = $__18.BindingIdentifier, Block = $__18.Block, BreakStatement = $__18.BreakStatement, CallExpression = $__18.CallExpression, CascadeExpression = $__18.CascadeExpression, CaseClause = $__18.CaseClause, Catch = $__18.Catch, ClassDeclaration = $__18.ClassDeclaration, ClassExpression = $__18.ClassExpression, CommaExpression = $__18.CommaExpression, ComprehensionFor = $__18.ComprehensionFor, ComprehensionIf = $__18.ComprehensionIf, ConditionalExpression = $__18.ConditionalExpression, ContinueStatement = $__18.ContinueStatement, CoverFormals = $__18.CoverFormals, DebuggerStatement = $__18.DebuggerStatement, DefaultClause = $__18.DefaultClause, DoWhileStatement = $__18.DoWhileStatement, EmptyStatement = $__18.EmptyStatement, ExportDeclaration = $__18.ExportDeclaration, ExportMapping = $__18.ExportMapping, ExportMappingList = $__18.ExportMappingList, ExportSpecifier = $__18.ExportSpecifier, ExportSpecifierSet = $__18.ExportSpecifierSet, ExportStar = $__18.ExportStar, ExpressionStatement = $__18.ExpressionStatement, Finally = $__18.Finally, ForInStatement = $__18.ForInStatement, ForOfStatement = $__18.ForOfStatement, ForStatement = $__18.ForStatement, FormalParameterList = $__18.FormalParameterList, FunctionDeclaration = $__18.FunctionDeclaration, FunctionExpression = $__18.FunctionExpression, GeneratorComprehension = $__18.GeneratorComprehension, GetAccessor = $__18.GetAccessor, IdentifierExpression = $__18.IdentifierExpression, IfStatement = $__18.IfStatement, ImportBinding = $__18.ImportBinding, ImportDeclaration = $__18.ImportDeclaration, ImportSpecifier = $__18.ImportSpecifier, ImportSpecifierSet = $__18.ImportSpecifierSet, LabelledStatement = $__18.LabelledStatement, LiteralExpression = $__18.LiteralExpression, MemberExpression = $__18.MemberExpression, MemberLookupExpression = $__18.MemberLookupExpression, ModuleDeclaration = $__18.ModuleDeclaration, ModuleDefinition = $__18.ModuleDefinition, ModuleExpression = $__18.ModuleExpression, ModuleRequire = $__18.ModuleRequire, ModuleSpecifier = $__18.ModuleSpecifier, NameStatement = $__18.NameStatement, NewExpression = $__18.NewExpression, ObjectLiteralExpression = $__18.ObjectLiteralExpression, ObjectPattern = $__18.ObjectPattern, ObjectPatternField = $__18.ObjectPatternField, ParenExpression = $__18.ParenExpression, PostfixExpression = $__18.PostfixExpression, PredefinedType = $__18.PredefinedType, Program = $__18.Program, PropertyMethodAssignment = $__18.PropertyMethodAssignment, PropertyNameAssignment = $__18.PropertyNameAssignment, PropertyNameShorthand = $__18.PropertyNameShorthand, RestParameter = $__18.RestParameter, ReturnStatement = $__18.ReturnStatement, SetAccessor = $__18.SetAccessor, SpreadExpression = $__18.SpreadExpression, SpreadPatternElement = $__18.SpreadPatternElement, SuperExpression = $__18.SuperExpression, SwitchStatement = $__18.SwitchStatement, SyntaxErrorTree = $__18.SyntaxErrorTree, TemplateLiteralExpression = $__18.TemplateLiteralExpression, TemplateLiteralPortion = $__18.TemplateLiteralPortion, TemplateSubstitution = $__18.TemplateSubstitution, ThisExpression = $__18.ThisExpression, ThrowStatement = $__18.ThrowStatement, TryStatement = $__18.TryStatement, TypeName = $__18.TypeName, UnaryExpression = $__18.UnaryExpression, VariableDeclaration = $__18.VariableDeclaration, VariableDeclarationList = $__18.VariableDeclarationList, VariableStatement = $__18.VariableStatement, WhileStatement = $__18.WhileStatement, WithStatement = $__18.WithStatement, YieldExpression = $__18.YieldExpression;
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
  var Parser = function() {
    'use strict';
    var $Parser = ($__createClassNoExtends)({
      constructor: function(errorReporter, file) {
        this.errorReporter_ = errorReporter;
        this.scanner_ = new Scanner(errorReporter, file, this);
        this.allowYield_ = options.unstarredGenerators;
        this.strictMode_ = false;
        this.noLint = false;
        this.noLintChanged_ = false;
        this.strictSemicolons_ = options.strictSemicolons;
      },
      parseProgram: function() {
        var load = arguments[0] !== (void 0) ? arguments[0]: false;
        var start = this.getTreeStartLocation_();
        var programElements = this.parseProgramElements_(load);
        this.eat_(END_OF_FILE);
        return new Program(this.getTreeLocation_(start), programElements);
      },
      parseProgramElements_: function(load) {
        var result = [];
        var type;
        var checkUseStrictDirective = true;
        while ((type = this.peekType_()) !== END_OF_FILE) {
          var programElement = this.parseProgramElement_(type, load);
          if (checkUseStrictDirective) {
            if (!programElement.isDirectivePrologue()) {
              checkUseStrictDirective = false;
            } else if (programElement.isUseStrictDirective()) {
              this.strictMode_ = true;
              checkUseStrictDirective = false;
            }
          }
          result.push(programElement);
        }
        return result;
      },
      parseProgramElement_: function(type, load) {
        return this.parseStatement_(type, true, load);
      },
      peekModuleDefinition_: function(type) {
        return type === IDENTIFIER && this.peek_(OPEN_CURLY, 1);
      },
      parseModuleDefinition_: function(load, start) {
        var strictMode = this.strictMode_;
        this.strictMode_ = true;
        var name = this.eatId_();
        this.eat_(OPEN_CURLY);
        var result = [];
        var type;
        while (this.peekModuleElement_(type = this.peekType_())) {
          result.push(this.parseModuleElement_(type, load));
        }
        this.eat_(CLOSE_CURLY);
        this.strictMode_ = strictMode;
        return new ModuleDefinition(this.getTreeLocation_(start), name, result);
      },
      parseModuleSpecifier_: function(load) {
        var start = this.getTreeStartLocation_();
        var identifier = this.eatId_();
        this.eatId_(FROM);
        var expression = this.parseModuleExpression_(load);
        return new ModuleSpecifier(this.getTreeLocation_(start), identifier, expression);
      },
      parseModuleExpression_: function(load) {
        var start = this.getTreeStartLocation_();
        var reference = this.parseModuleReference_(load);
        var identifierNames = [];
        while (this.peek_(PERIOD) && this.peekIdName_(this.peekToken_(1))) {
          this.eat_(PERIOD);
          identifierNames.push(this.eatIdName_());
        }
        return new ModuleExpression(this.getTreeLocation_(start), reference, identifierNames);
      },
      parseModuleReference_: function(load) {
        var start = this.getTreeStartLocation_();
        if (load && this.peek_(STRING)) {
          var url = this.eat_(STRING);
          return new ModuleRequire(this.getTreeLocation_(start), url);
        }
        return this.parseIdentifierExpression_();
      },
      peekModuleElement_: function(type) {
        return this.peekStatement_(type, true);
      },
      parseModuleElement_: function(type, load) {
        return this.parseProgramElement_(type, load);
      },
      parseImportDeclaration_: function(load) {
        var start = this.getTreeStartLocation_();
        this.eat_(IMPORT);
        var importBindings = [];
        importBindings.push(this.parseImportBinding_(load));
        while (this.eatIf_(COMMA)) {
          importBindings.push(this.parseImportBinding_(load));
        }
        this.eatPossibleImplicitSemiColon_();
        return new ImportDeclaration(this.getTreeLocation_(start), importBindings);
      },
      parseImportBinding_: function(load) {
        var start = this.getTreeStartLocation_();
        var importSpecifierSet = this.parseImportSpecifierSet_();
        this.eatId_(FROM);
        var moduleExpression = this.parseModuleExpression_(load);
        return new ImportBinding(this.getTreeLocation_(start), moduleExpression, importSpecifierSet);
      },
      parseImportSpecifierSet_: function() {
        if (this.peek_(OPEN_CURLY)) {
          var start = this.getTreeStartLocation_();
          this.eat_(OPEN_CURLY);
          var specifiers = [this.parseImportSpecifier_()];
          while (this.eatIf_(COMMA)) {
            if (this.peek_(CLOSE_CURLY)) break;
            specifiers.push(this.parseImportSpecifier_());
          }
          this.eat_(CLOSE_CURLY);
          return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers);
        }
        if (this.peek_(STAR)) {
          var star = this.eat_(STAR);
          return new ImportSpecifierSet(this.getTreeLocation_(start), star);
        }
        return this.parseIdentifierNameExpression_();
      },
      parseImportSpecifier_: function() {
        var start = this.getTreeStartLocation_();
        var lhs = this.eatIdName_();
        var rhs = null;
        if (this.eatIf_(COLON)) rhs = this.eatId_();
        return new ImportSpecifier(this.getTreeLocation_(start), lhs, rhs);
      },
      parseExportDeclaration_: function(load) {
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
          case IDENTIFIER:
            if (this.peekModuleDeclaration_(type)) {
              exportTree = this.parseModuleDeclaration_(load);
            } else {
              exportTree = this.parseExportMappingList_(load);
            }
            break;
          case OPEN_CURLY:
          case STAR:
            exportTree = this.parseExportMappingList_(load);
            break;
          default:
            return this.parseUnexpectedToken_(type);
        }
        return new ExportDeclaration(this.getTreeLocation_(start), exportTree);
      },
      parseExportMappingList_: function(load) {
        var start = this.getTreeStartLocation_();
        var mappings = [this.parseExportMapping_(load)];
        while (this.eatIf_(COMMA)) {
          mappings.push(this.parseExportMapping_(load));
        }
        this.eatPossibleImplicitSemiColon_();
        return new ExportMappingList(this.getTreeLocation_(start), mappings);
      },
      parseExportMapping_: function(load) {
        var start = this.getTreeStartLocation_();
        var specifierSet, expression;
        if (this.eatIf_(STAR)) {
          specifierSet = new ExportStar(this.getTreeLocation_(start));
          expression = this.parseFromModuleExpressionOpt_(load, true);
        } else if (this.peek_(OPEN_CURLY)) {
          specifierSet = this.parseExportSpecifierSet_();
          expression = this.parseFromModuleExpressionOpt_(load, false);
        } else {
          specifierSet = this.parseIdentifierExpression_();
          expression = this.parseFromModuleExpressionOpt_(load, false);
        }
        return new ExportMapping(this.getTreeLocation_(start), expression, specifierSet);
      },
      parseFromModuleExpressionOpt_: function(load, required) {
        if (required || this.peekPredefinedString_(FROM)) {
          this.eatId_(FROM);
          return this.parseModuleExpression_(load);
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
        var lhs, rhs = null;
        if (this.peek_(COLON, 1)) {
          lhs = this.eatIdName_();
          this.eat_(COLON);
          rhs = this.eatId_();
        } else {
          lhs = this.eatId_();
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
      peekModuleDeclaration_: function(type) {
        return parseOptions.modules && type === IDENTIFIER && this.peekToken_().value === MODULE && this.peek_(IDENTIFIER, 1);
      },
      parseModuleDeclaration_: function(load) {
        var start = this.getTreeStartLocation_();
        this.eatId_();
        if (this.peekModuleDefinition_(this.peekType_())) return this.parseModuleDefinition_(load, start);
        var specifiers = [this.parseModuleSpecifier_(load)];
        while (this.eatIf_(COMMA)) {
          specifiers.push(this.parseModuleSpecifier_(load));
        }
        this.eatPossibleImplicitSemiColon_();
        return new ModuleDeclaration(this.getTreeLocation_(start), specifiers);
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
        return this.nextToken_();
      },
      parseStatement: function() {
        return this.parseStatement_(this.peekType_(), false, false);
      },
      parseStatement_: function(type, allowProgramElement, load) {
        switch (type) {
          case RETURN:
            return this.parseReturnStatement_();
          case CONST:
          case LET:
            if (!parseOptions.blockBinding) break;
          case VAR:
            return this.parseVariableStatement_();
          case IDENTIFIER:
            if (allowProgramElement && parseOptions.modules && this.peekModuleDeclaration_(type)) {
              return this.parseModuleDeclaration_(load);
            }
            break;
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
            if (allowProgramElement && parseOptions.modules) return this.parseExportDeclaration_(load);
            break;
          case IMPORT:
            if (allowProgramElement && parseOptions.modules) return this.parseImportDeclaration_(load);
            break;
          case OPEN_CURLY:
            return this.parseBlock_();
          case PRIVATE:
            if (parseOptions.privateNameSyntax) return this.parseNameStatement_();
            break;
          case SEMI_COLON:
            return this.parseEmptyStatement_();
          case TRY:
            return this.parseTryStatement_();
          case WITH:
            return this.parseWithStatement_();
        }
        return this.parseExpressionStatement_();
      },
      peekStatement_: function(type, allowProgramElement) {
        switch (type) {
          case RETURN:
          case THIS:
          case VAR:
          case IDENTIFIER:
          case IF:
          case FOR:
          case BREAK:
          case SWITCH:
          case THROW:
          case WHILE:
          case FUNCTION:
          case BANG:
          case CONTINUE:
          case DEBUGGER:
          case DELETE:
          case DO:
          case FALSE:
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
          case SEMI_COLON:
          case SLASH:
          case SLASH_EQUAL:
          case STRING:
          case TILDE:
          case TRUE:
          case TRY:
          case TYPEOF:
          case VOID:
          case WITH:
            return true;
          case CLASS:
          case SUPER:
            return parseOptions.classes;
          case CONST:
          case LET:
            return parseOptions.blockBinding;
          case AT_NAME:
          case PRIVATE:
            return parseOptions.privateNameSyntax;
          case YIELD:
            return parseOptions.generators;
          case AWAIT:
            return parseOptions.deferredFunctions;
          case TEMPLATE_HEAD:
          case NO_SUBSTITUTION_TEMPLATE:
            return parseOptions.templateLiterals;
          case IMPORT:
          case EXPORT:
            return allowProgramElement && parseOptions.modules;
        }
        return false;
      },
      parseFunctionDeclaration_: function() {
        var start = this.getTreeStartLocation_();
        this.nextToken_();
        var isGenerator = this.eatIf_(STAR);
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
        var isGenerator = this.eatIf_(STAR);
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
        return new Block(this.getTreeLocation_(start), result);
      },
      parseStatementList_: function() {
        var checkUseStrictDirective = arguments[0] !== (void 0) ? arguments[0]: false;
        var result = [];
        var type;
        while (this.peekStatement_(type = this.peekType_(), false)) {
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
        var result = this.parseStatementList_();
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
      parseNameStatement_: function() {
        var start = this.getTreeStartLocation_();
        this.eat_(PRIVATE);
        var declarations = [];
        declarations.push(this.parseAtNameDeclaration_());
        while (this.eatIf_(COMMA)) {
          declarations.push(this.parseAtNameDeclaration_());
        }
        this.eatPossibleImplicitSemiColon_();
        return new NameStatement(this.getTreeLocation_(start), declarations);
      },
      parseAtNameDeclaration_: function() {
        var start = this.getTreeStartLocation_();
        var atName = this.eat_(AT_NAME);
        var initializer = null;
        if (this.peek_(EQUAL)) initializer = this.parseInitializer_(Expression.IN);
        return new AtNameDeclaration(this.getTreeLocation_(start), atName, initializer);
      },
      parseEmptyStatement_: function() {
        var start = this.getTreeStartLocation_();
        this.eat_(SEMI_COLON);
        return new EmptyStatement(this.getTreeLocation_(start));
      },
      parseExpressionStatement_: function() {
        var start = this.getTreeStartLocation_();
        var expression = this.parseExpression();
        if (expression.type === IDENTIFIER_EXPRESSION && this.eatIf_(COLON)) {
          var name = expression.identifierToken;
          var statement = this.parseStatement();
          return new LabelledStatement(this.getTreeLocation_(start), name, statement);
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
        return this.parseStatementList_();
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
          case AT_NAME:
            return this.parseAtNameExpression_();
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
      parseAtNameExpression_: function() {
        var start = this.getTreeStartLocation_();
        var atName = this.eat_(AT_NAME);
        return new AtNameExpression(this.getTreeLocation_(start), atName);
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
          if (propertyDefinition.type === PROPERTY_NAME_ASSIGNMENT) {
            if (!this.eatIf_(COMMA)) break;
          } else if (!this.eatPropertyOptionalComma_()) {
            break;
          }
        }
        this.eat_(CLOSE_CURLY);
        return new ObjectLiteralExpression(this.getTreeLocation_(start), result);
      },
      eatPropertyOptionalComma_: function() {
        return this.eatIf_(COMMA) || parseOptions.propertyOptionalComma;
      },
      parsePropertyDefinition: function() {
        var start = this.getTreeStartLocation_();
        var isGenerator = false;
        var isStatic = false;
        if (parseOptions.generators && parseOptions.propertyMethods && this.peek_(STAR)) {
          return this.parseGeneratorMethod_(start, isStatic);
        }
        var name = this.parsePropertyName_();
        if (parseOptions.propertyMethods && this.peek_(OPEN_PAREN)) return this.parseMethod_(start, isStatic, isGenerator, name);
        if (this.eatIf_(COLON)) {
          var value = this.parseAssignmentExpression();
          return new PropertyNameAssignment(this.getTreeLocation_(start), name, value);
        }
        var type = this.peekType_();
        if (name.type === IDENTIFIER && name.value === GET && this.peekPropertyName_(type)) {
          return this.parseGetAccessor_(start, isStatic);
        }
        if (name.type === IDENTIFIER && name.value === SET && this.peekPropertyName_(type)) {
          return this.parseSetAccessor_(start, isStatic);
        }
        if (parseOptions.propertyNameShorthand) return new PropertyNameShorthand(this.getTreeLocation_(start), name);
        return this.parseUnexpectedToken_(name);
      },
      parseClassElement_: function() {
        var start = this.getTreeStartLocation_();
        var type = this.peekType_();
        var isStatic = false, isGenerator = false;
        switch (type) {
          case STATIC:
            var staticToken = this.nextToken_();
            type = this.peekType_();
            switch (type) {
              case OPEN_PAREN:
                return this.parseMethod_(start, isStatic, isGenerator, staticToken);
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
        if (name.type === IDENTIFIER && name.value === GET && this.peekPropertyName_(type)) {
          return this.parseGetAccessor_(start, isStatic);
        }
        if (name.type === IDENTIFIER && name.value === SET && this.peekPropertyName_(type)) {
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
          case AT_NAME:
            return parseOptions.privateNameSyntax;
          case IDENTIFIER:
          case STRING:
          case NUMBER:
            return true;
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
          case AT_NAME:
            return parseOptions.privateNameSyntax;
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
          return new BinaryOperator(this.getTreeLocation_(start), left, operator, right);
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
              if (parseOptions.privateNameSyntax && this.peek_(AT_NAME)) name = this.nextToken_(); else name = this.eatIdName_();
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
        if (this.peek_(OPEN_CURLY)) return this.parseBlock_();
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
        if (this.peek_(COLON, 1)) {
          var name = this.nextToken_();
          this.eat_(COLON);
          var binding = this.parseBindingElement_();
          return new ObjectPatternField(this.getTreeLocation_(start), name, binding);
        }
        var binding = this.parseBindingIdentifier_();
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
          this.reportExpectedError_(token, 'identifier');
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
    return $Parser;
  }();
  return Object.preventExtensions(Object.create(null, {Parser: {
      get: function() {
        return Parser;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ParseTreeFactory_js = (function() {
  "use strict";
  var IdentifierToken = $___src_syntax_IdentifierToken_js.IdentifierToken;
  var LiteralToken = $___src_syntax_LiteralToken_js.LiteralToken;
  var $__18 = $___src_syntax_trees_ParseTree_js, ParseTree = $__18.ParseTree, ParseTreeType = $__18.ParseTreeType;
  var $__18 = $___src_syntax_PredefinedName_js, BIND = $__18.BIND, CALL = $__18.CALL, CREATE = $__18.CREATE, DEFINE_PROPERTY = $__18.DEFINE_PROPERTY, FREEZE = $__18.FREEZE, OBJECT = $__18.OBJECT, PREVENT_EXTENSIONS = $__18.PREVENT_EXTENSIONS, STATE = $__18.STATE, UNDEFINED = $__18.UNDEFINED, getParameterName = $__18.getParameterName;
  var Token = $___src_syntax_Token_js.Token;
  var $__18 = $___src_syntax_TokenType_js, EQUAL = $__18.EQUAL, FALSE = $__18.FALSE, NULL = $__18.NULL, NUMBER = $__18.NUMBER, STRING = $__18.STRING, TRUE = $__18.TRUE, VOID = $__18.VOID;
  var $__18 = $___src_syntax_trees_ParseTrees_js, ArgumentList = $__18.ArgumentList, ArrayComprehension = $__18.ArrayComprehension, ArrayLiteralExpression = $__18.ArrayLiteralExpression, ArrayPattern = $__18.ArrayPattern, ArrowFunctionExpression = $__18.ArrowFunctionExpression, AtNameDeclaration = $__18.AtNameDeclaration, AtNameExpression = $__18.AtNameExpression, AwaitStatement = $__18.AwaitStatement, BinaryOperator = $__18.BinaryOperator, BindingElement = $__18.BindingElement, BindingIdentifier = $__18.BindingIdentifier, Block = $__18.Block, BreakStatement = $__18.BreakStatement, CallExpression = $__18.CallExpression, CascadeExpression = $__18.CascadeExpression, CaseClause = $__18.CaseClause, Catch = $__18.Catch, ClassDeclaration = $__18.ClassDeclaration, ClassExpression = $__18.ClassExpression, CommaExpression = $__18.CommaExpression, ComprehensionFor = $__18.ComprehensionFor, ComprehensionIf = $__18.ComprehensionIf, ConditionalExpression = $__18.ConditionalExpression, ContinueStatement = $__18.ContinueStatement, CoverFormals = $__18.CoverFormals, DebuggerStatement = $__18.DebuggerStatement, DefaultClause = $__18.DefaultClause, DoWhileStatement = $__18.DoWhileStatement, EmptyStatement = $__18.EmptyStatement, ExportDeclaration = $__18.ExportDeclaration, ExportMapping = $__18.ExportMapping, ExportMappingList = $__18.ExportMappingList, ExportSpecifier = $__18.ExportSpecifier, ExportSpecifierSet = $__18.ExportSpecifierSet, ExportStar = $__18.ExportStar, ExpressionStatement = $__18.ExpressionStatement, Finally = $__18.Finally, ForInStatement = $__18.ForInStatement, ForOfStatement = $__18.ForOfStatement, ForStatement = $__18.ForStatement, FormalParameterList = $__18.FormalParameterList, FunctionDeclaration = $__18.FunctionDeclaration, FunctionExpression = $__18.FunctionExpression, GeneratorComprehension = $__18.GeneratorComprehension, GetAccessor = $__18.GetAccessor, IdentifierExpression = $__18.IdentifierExpression, IfStatement = $__18.IfStatement, ImportBinding = $__18.ImportBinding, ImportDeclaration = $__18.ImportDeclaration, ImportSpecifier = $__18.ImportSpecifier, ImportSpecifierSet = $__18.ImportSpecifierSet, LabelledStatement = $__18.LabelledStatement, LiteralExpression = $__18.LiteralExpression, MemberExpression = $__18.MemberExpression, MemberLookupExpression = $__18.MemberLookupExpression, ModuleDeclaration = $__18.ModuleDeclaration, ModuleDefinition = $__18.ModuleDefinition, ModuleExpression = $__18.ModuleExpression, ModuleRequire = $__18.ModuleRequire, ModuleSpecifier = $__18.ModuleSpecifier, NameStatement = $__18.NameStatement, NewExpression = $__18.NewExpression, ObjectLiteralExpression = $__18.ObjectLiteralExpression, ObjectPattern = $__18.ObjectPattern, ObjectPatternField = $__18.ObjectPatternField, ParenExpression = $__18.ParenExpression, PostfixExpression = $__18.PostfixExpression, PredefinedType = $__18.PredefinedType, Program = $__18.Program, PropertyMethodAssignment = $__18.PropertyMethodAssignment, PropertyNameAssignment = $__18.PropertyNameAssignment, PropertyNameShorthand = $__18.PropertyNameShorthand, RestParameter = $__18.RestParameter, ReturnStatement = $__18.ReturnStatement, SetAccessor = $__18.SetAccessor, SpreadExpression = $__18.SpreadExpression, SpreadPatternElement = $__18.SpreadPatternElement, SuperExpression = $__18.SuperExpression, SwitchStatement = $__18.SwitchStatement, SyntaxErrorTree = $__18.SyntaxErrorTree, TemplateLiteralExpression = $__18.TemplateLiteralExpression, TemplateLiteralPortion = $__18.TemplateLiteralPortion, TemplateSubstitution = $__18.TemplateSubstitution, ThisExpression = $__18.ThisExpression, ThrowStatement = $__18.ThrowStatement, TryStatement = $__18.TryStatement, TypeName = $__18.TypeName, UnaryExpression = $__18.UnaryExpression, VariableDeclaration = $__18.VariableDeclaration, VariableDeclarationList = $__18.VariableDeclarationList, VariableStatement = $__18.VariableStatement, WhileStatement = $__18.WhileStatement, WithStatement = $__18.WithStatement, YieldExpression = $__18.YieldExpression;
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
    for (var args = [], $__7 = 1; $__7 < arguments.length; $__7++) args[$__7 - 1] = arguments[$__7];
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
  function createScopedStatements(statements) {
    if (statements instanceof ParseTree) statements = slice(arguments);
    return createScopedBlock(createBlock(statements));
  }
  function createScopedBlock(block) {
    return createExpressionStatement(createScopedExpression(block));
  }
  function createScopedExpression(block) {
    return createCallCall(createParenExpression(createFunctionExpression(createEmptyParameterList(), block)), createThisExpression());
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
    if (args instanceof ParseTree) args = slice(arguments, 2);
    var builder = [thisExpression];
    if (args)($__22 = builder).push.apply($__22, $__toObject(args));
    return createCallExpression(createMemberExpression(func, CALL), createArgumentList(builder));
  }
  function createCallCallStatement(func, thisExpression) {
    for (var args = [], $__8 = 2; $__8 < arguments.length; $__8++) args[$__8 - 2] = arguments[$__8];
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
  function createFunctionExpression(formalParameterList, functionBody) {
    return new FunctionExpression(null, null, false, formalParameterList, functionBody);
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
  function createProgram(programElements) {
    return new Program(null, programElements);
  }
  function createPropertyNameAssignment(identifier, value) {
    if (typeof identifier == 'string') identifier = createIdentifierToken(identifier);
    return new PropertyNameAssignment(null, identifier, value);
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
    createScopedStatements: {
      get: function() {
        return createScopedStatements;
      },
      enumerable: true
    },
    createScopedBlock: {
      get: function() {
        return createScopedBlock;
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
    createProgram: {
      get: function() {
        return createProgram;
      },
      enumerable: true
    },
    createPropertyNameAssignment: {
      get: function() {
        return createPropertyNameAssignment;
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
}).call(this);
var $___src_semantics_VariableBinder_js = (function() {
  "use strict";
  var $__18 = $___src_syntax_trees_ParseTreeType_js, ARRAY_PATTERN = $__18.ARRAY_PATTERN, BINDING_IDENTIFIER = $__18.BINDING_IDENTIFIER, OBJECT_PATTERN = $__18.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__18.OBJECT_PATTERN_FIELD, PAREN_EXPRESSION = $__18.PAREN_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__18.SPREAD_PATTERN_ELEMENT;
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var VAR = $___src_syntax_TokenType_js.VAR;
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
  var VariableBinder = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $VariableBinder = ($__createClass)({
      constructor: function(includeFunctionScope, scope) {
        $__superCall(this, $__proto, "constructor", []);
        this.includeFunctionScope_ = includeFunctionScope;
        this.scope_ = scope || null;
        this.block_ = null;
        this.identifiers_ = Object.create(null);
      },
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
          $__superCall(this, $__proto, "visitVariableDeclarationList", [tree]);
        } else {
          var decls = tree.declarations;
          for (var i = 0; i < decls.length; i++) {
            this.visitAny(decls[i].initializer);
          }
        }
      },
      visitVariableDeclaration: function(tree) {
        this.bindVariableDeclaration_(tree.lvalue);
        $__superCall(this, $__proto, "visitVariableDeclaration", [tree]);
      },
      bind_: function(identifier) {
        traceur.assert(typeof identifier.value == 'string');
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
              this.bind_(field.identifier);
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
    }, {}, $__proto, $__super, true);
    return $VariableBinder;
  }(ParseTreeVisitor);
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
}).call(this);
var $___src_codegeneration_AlphaRenamer_js = (function() {
  "use strict";
  var $__18 = $___src_syntax_trees_ParseTrees_js, FunctionDeclaration = $__18.FunctionDeclaration, FunctionExpression = $__18.FunctionExpression;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__18 = $___src_syntax_PredefinedName_js, ARGUMENTS = $__18.ARGUMENTS, THIS = $__18.THIS;
  var createIdentifierExpression = $___src_codegeneration_ParseTreeFactory_js.createIdentifierExpression;
  var $__18 = $___src_semantics_VariableBinder_js, variablesInBlock = $__18.variablesInBlock, variablesInFunction = $__18.variablesInFunction;
  var AlphaRenamer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AlphaRenamer = ($__createClass)({
      constructor: function(oldName, newName) {
        $__superCall(this, $__proto, "constructor", []);
        this.oldName_ = oldName;
        this.newName_ = newName;
      },
      transformBlock: function(tree) {
        if (this.oldName_ in variablesInBlock(tree)) {
          return tree;
        } else {
          return $__superCall(this, $__proto, "transformBlock", [tree]);
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
        return $__superCall(this, $__proto, "transformFunctionDeclaration", [tree]);
      },
      transformFunctionExpression: function(tree) {
        if (this.oldName_ === tree.name) {
          tree = new FunctionExpression(tree.location, this.newName_, tree.isGenerator, tree.formalParameterList, tree.functionBody);
        }
        if (this.getDoNotRecurse(tree)) return tree;
        return $__superCall(this, $__proto, "transformFunctionExpression", [tree]);
      },
      getDoNotRecurse: function(tree) {
        return this.oldName_ === ARGUMENTS || this.oldName_ === THIS || this.oldName_ in variablesInFunction(tree);
      },
      transformCatch: function(tree) {
        if (!tree.binding.isPattern() && this.oldName_ === tree.binding.identifierToken.value) {
          return tree;
        }
        return $__superCall(this, $__proto, "transformCatch", [tree]);
      }
    }, {}, $__proto, $__super, true);
    return $AlphaRenamer;
  }(ParseTreeTransformer);
  AlphaRenamer.rename = function(tree, oldName, newName) {
    return new AlphaRenamer(oldName, newName).transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {AlphaRenamer: {
      get: function() {
        return AlphaRenamer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_FindVisitor_js = (function() {
  "use strict";
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var foundSentinel = {};
  var FindVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FindVisitor = ($__createClass)({
      constructor: function(tree, keepOnGoing) {
        this.found_ = false;
        this.keepOnGoing_ = keepOnGoing;
        try {
          this.visitAny(tree);
        } catch (ex) {
          if (ex !== foundSentinel) throw ex;
        }
      },
      get found() {
        return this.found_;
      },
      set found(v) {
        if (v) {
          this.found_ = true;
          if (!this.keepOnGoing_) throw foundSentinel;
        }
      }
    }, {}, $__proto, $__super, true);
    return $FindVisitor;
  }(ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {FindVisitor: {
      get: function() {
        return FindVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_FindInFunctionScope_js = (function() {
  "use strict";
  var FindVisitor = $___src_codegeneration_FindVisitor_js.FindVisitor;
  var FindInFunctionScope = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FindInFunctionScope = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      visitFunctionDeclaration: function(tree) {},
      visitFunctionExpression: function(tree) {},
      visitSetAccessor: function(tree) {},
      visitGetAccessor: function(tree) {},
      visitPropertyMethodAssignment: function(tree) {}
    }, {}, $__proto, $__super, false);
    return $FindInFunctionScope;
  }(FindVisitor);
  return Object.preventExtensions(Object.create(null, {FindInFunctionScope: {
      get: function() {
        return FindInFunctionScope;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_PrependStatements_js = (function() {
  "use strict";
  var $__18 = $___src_syntax_trees_ParseTreeType_js, EXPRESSION_STATEMENT = $__18.EXPRESSION_STATEMENT, LITERAL_EXPRESSION = $__18.LITERAL_EXPRESSION;
  var STRING = $___src_syntax_TokenType_js.STRING;
  function isStringExpressionStatement(tree) {
    return tree.type === EXPRESSION_STATEMENT && tree.expression.type === LITERAL_EXPRESSION && tree.expression.literalToken.type === STRING;
  }
  function prependStatements(statements) {
    for (var statementsToPrepend = [], $__9 = 1; $__9 < arguments.length; $__9++) statementsToPrepend[$__9 - 1] = arguments[$__9];
    if (!statements.length) return statementsToPrepend;
    if (!statementsToPrepend.length) return statements;
    var transformed = [];
    var inProlog = true;
    statements.forEach((function(statement) {
      if (inProlog && !isStringExpressionStatement(statement)) {
        ($__23 = transformed).push.apply($__23, $__toObject(statementsToPrepend));
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
}).call(this);
var $___src_codegeneration_TempVarTransformer_js = (function() {
  "use strict";
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__18 = $___src_syntax_trees_ParseTrees_js, ModuleDefinition = $__18.ModuleDefinition, Program = $__18.Program;
  var VAR = $___src_syntax_TokenType_js.VAR;
  var $__18 = $___src_codegeneration_ParseTreeFactory_js, createBlock = $__18.createBlock, createVariableDeclaration = $__18.createVariableDeclaration, createVariableDeclarationList = $__18.createVariableDeclarationList, createVariableStatement = $__18.createVariableStatement;
  var prependStatements = $___src_codegeneration_PrependStatements_js.prependStatements;
  function getVars(self) {
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1];
    if (!vars) throw new Error('Invalid use of addTempVar');
    return vars;
  }
  var TempVarStatement = function() {
    'use strict';
    var $TempVarStatement = ($__createClassNoExtends)({constructor: function(name, initializer) {
        this.name = name;
        this.initializer = initializer;
      }}, {});
    return $TempVarStatement;
  }();
  var TempVarTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TempVarTransformer = ($__createClass)({
      constructor: function(identifierGenerator) {
        $__superCall(this, $__proto, "constructor", []);
        this.identifierGenerator = identifierGenerator;
        this.tempVarStack_ = [[]];
        this.tempIdentifierStack_ = [[]];
        this.pool_ = [];
      },
      transformStatements_: function(statements) {
        this.tempVarStack_.push([]);
        var transformedStatements = this.transformList(statements);
        var vars = this.tempVarStack_.pop();
        if (!vars.length) return transformedStatements;
        var seenNames = Object.create(null);
        vars = vars.filter((function(tempVarStatement) {
          var $__18 = tempVarStatement, name = $__18.name, initializer = $__18.initializer;
          if (name in seenNames) {
            if (seenNames[name].initializer || initializer) throw new Error('Invalid use of TempVarTransformer');
            return false;
          }
          seenNames[name] = tempVarStatement;
          return true;
        }));
        var variableStatement = createVariableStatement(createVariableDeclarationList(VAR, vars.map((function($__18) {
          var name = $__18.name, initializer = $__18.initializer;
          return createVariableDeclaration(name, initializer);
        }))));
        return prependStatements(transformedStatements, variableStatement);
      },
      transformProgram: function(tree) {
        var programElements = this.transformStatements_(tree.programElements);
        if (programElements == tree.programElements) {
          return tree;
        }
        return new Program(tree.location, programElements);
      },
      transformFunctionBody: function(tree) {
        this.pushTempVarState();
        var statements = this.transformStatements_(tree.statements);
        this.popTempVarState();
        if (statements == tree.statements) return tree;
        return createBlock(statements);
      },
      transformModuleDefinition: function(tree) {
        this.pushTempVarState();
        var elements = this.transformStatements_(tree.elements);
        this.popTempVarState();
        if (elements == tree.elements) return tree;
        return new ModuleDefinition(tree.location, tree.name, elements);
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
    }, {}, $__proto, $__super, true);
    return $TempVarTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {TempVarTransformer: {
      get: function() {
        return TempVarTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ComprehensionTransformer_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_PredefinedName_js, ARGUMENTS = $__19.ARGUMENTS, THIS = $__19.THIS;
  var AlphaRenamer = $___src_codegeneration_AlphaRenamer_js.AlphaRenamer;
  var FindInFunctionScope = $___src_codegeneration_FindInFunctionScope_js.FindInFunctionScope;
  var FunctionExpression = $___src_syntax_trees_ParseTrees_js.FunctionExpression;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__19 = $___src_syntax_TokenType_js, LET = $__19.LET, VAR = $__19.VAR;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, COMPREHENSION_FOR = $__19.COMPREHENSION_FOR, COMPREHENSION_IF = $__19.COMPREHENSION_IF;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createBlock = $__19.createBlock, createCallExpression = $__19.createCallExpression, createEmptyParameterList = $__19.createEmptyParameterList, createForOfStatement = $__19.createForOfStatement, createIdentifierExpression = $__19.createIdentifierExpression, createIfStatement = $__19.createIfStatement, createParenExpression = $__19.createParenExpression, createThisExpression = $__19.createThisExpression, createVariableDeclarationList = $__19.createVariableDeclarationList;
  var options = $___src_options_js.options;
  var ThisFinder = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ThisFinder = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      visitThisExpression: function(tree) {
        this.found = true;
      }
    }, {}, $__proto, $__super, false);
    return $ThisFinder;
  }(FindInFunctionScope);
  var ArgumentsFinder = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArgumentsFinder = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      visitIdentifierExpression: function(tree) {
        if (tree.identifierToken.value === ARGUMENTS) this.found = true;
      }
    }, {}, $__proto, $__super, false);
    return $ArgumentsFinder;
  }(FindInFunctionScope);
  var ComprehensionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ComprehensionTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformComprehension: function(tree, statement, isGenerator, returnStatement) {
        var bindingKind = isGenerator || !options.blockBinding ? VAR: LET;
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
        var statements = [statement];
        if (returnStatement) statements.push(returnStatement);
        var func = new FunctionExpression(null, null, isGenerator, createEmptyParameterList(), createBlock(statements));
        return createParenExpression(createCallExpression(func));
      }
    }, {}, $__proto, $__super, false);
    return $ComprehensionTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {ComprehensionTransformer: {
      get: function() {
        return ComprehensionTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ArrayComprehensionTransformer_js = (function() {
  "use strict";
  var ComprehensionTransformer = $___src_codegeneration_ComprehensionTransformer_js.ComprehensionTransformer;
  var PLUS_PLUS = $___src_syntax_TokenType_js.PLUS_PLUS;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArrayLiteralExpression = $__19.createArrayLiteralExpression, createAssignmentStatement = $__19.createAssignmentStatement, createIdentifierExpression = $__19.createIdentifierExpression, createMemberLookupExpression = $__19.createMemberLookupExpression, createNumberLiteral = $__19.createNumberLiteral, createPostfixExpression = $__19.createPostfixExpression, createReturnStatement = $__19.createReturnStatement;
  var ArrayComprehensionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArrayComprehensionTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformArrayComprehension: function(tree) {
        var expression = this.transformAny(tree.expression);
        var indexName = this.addTempVar(createNumberLiteral(0));
        var resultName = this.addTempVar(createArrayLiteralExpression([]));
        var resultIdentifier = createIdentifierExpression(resultName);
        var statement = createAssignmentStatement(createMemberLookupExpression(resultIdentifier, createPostfixExpression(createIdentifierExpression(indexName), PLUS_PLUS)), expression);
        var returnStatement = createReturnStatement(resultIdentifier);
        var isGenerator = false;
        return this.transformComprehension(tree, statement, isGenerator, returnStatement);
      }
    }, {}, $__proto, $__super, false);
    return $ArrayComprehensionTransformer;
  }(ComprehensionTransformer);
  ArrayComprehensionTransformer.transformTree = function(identifierGenerator, tree) {
    return new ArrayComprehensionTransformer(identifierGenerator).transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {ArrayComprehensionTransformer: {
      get: function() {
        return ArrayComprehensionTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ArrowFunctionTransformer_js = (function() {
  "use strict";
  var BIND = $___src_syntax_PredefinedName_js.BIND;
  var FindInFunctionScope = $___src_codegeneration_FindInFunctionScope_js.FindInFunctionScope;
  var FormalParameterList = $___src_syntax_trees_ParseTrees_js.FormalParameterList;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var BLOCK = $___src_syntax_trees_ParseTreeType_js.BLOCK;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__19.createArgumentList, createBlock = $__19.createBlock, createCallExpression = $__19.createCallExpression, createFunctionExpression = $__19.createFunctionExpression, createMemberExpression = $__19.createMemberExpression, createParenExpression = $__19.createParenExpression, createReturnStatement = $__19.createReturnStatement, createThisExpression = $__19.createThisExpression;
  var ThisFinder = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ThisFinder = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      visitThisExpression: function(tree) {
        this.found = true;
      }
    }, {}, $__proto, $__super, false);
    return $ThisFinder;
  }(FindInFunctionScope);
  var ArrowFunctionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ArrowFunctionTransformer = ($__createClass)({
      constructor: function(reporter) {
        $__superCall(this, $__proto, "constructor", []);
        this.reporter_ = reporter;
      },
      transformArrowFunctionExpression: function(tree) {
        var parameters;
        if (tree.formalParameters) {
          parameters = this.transformAny(tree.formalParameters).parameters;
        } else {
          parameters = [];
        }
        var functionBody = this.transformAny(tree.functionBody);
        if (functionBody.type != BLOCK) {
          functionBody = createBlock(createReturnStatement(functionBody));
        }
        var result = createParenExpression(createFunctionExpression(new FormalParameterList(null, parameters), functionBody));
        var finder = new ThisFinder(functionBody);
        if (finder.found) {
          return createCallExpression(createMemberExpression(result, BIND), createArgumentList(createThisExpression()));
        }
        return result;
      }
    }, {transformTree: function(reporter, tree) {
        return new ArrowFunctionTransformer(reporter).transformAny(tree);
      }}, $__proto, $__super, true);
    return $ArrowFunctionTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {ArrowFunctionTransformer: {
      get: function() {
        return ArrowFunctionTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_OperatorExpander_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_trees_ParseTreeType_js, IDENTIFIER_EXPRESSION = $__19.IDENTIFIER_EXPRESSION, SUPER_EXPRESSION = $__19.SUPER_EXPRESSION;
  var $__19 = $___src_syntax_TokenType_js, AMPERSAND = $__19.AMPERSAND, AMPERSAND_EQUAL = $__19.AMPERSAND_EQUAL, BAR = $__19.BAR, BAR_EQUAL = $__19.BAR_EQUAL, CARET = $__19.CARET, CARET_EQUAL = $__19.CARET_EQUAL, LEFT_SHIFT = $__19.LEFT_SHIFT, LEFT_SHIFT_EQUAL = $__19.LEFT_SHIFT_EQUAL, MINUS = $__19.MINUS, MINUS_EQUAL = $__19.MINUS_EQUAL, PERCENT = $__19.PERCENT, PERCENT_EQUAL = $__19.PERCENT_EQUAL, PLUS = $__19.PLUS, PLUS_EQUAL = $__19.PLUS_EQUAL, RIGHT_SHIFT = $__19.RIGHT_SHIFT, RIGHT_SHIFT_EQUAL = $__19.RIGHT_SHIFT_EQUAL, SLASH = $__19.SLASH, SLASH_EQUAL = $__19.SLASH_EQUAL, STAR = $__19.STAR, STAR_EQUAL = $__19.STAR_EQUAL, UNSIGNED_RIGHT_SHIFT = $__19.UNSIGNED_RIGHT_SHIFT, UNSIGNED_RIGHT_SHIFT_EQUAL = $__19.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__19.createAssignmentExpression, createBinaryOperator = $__19.createBinaryOperator, createCommaExpression = $__19.createCommaExpression, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createMemberLookupExpression = $__19.createMemberLookupExpression, createOperatorToken = $__19.createOperatorToken, createParenExpression = $__19.createParenExpression;
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
}).call(this);
var $___src_codegeneration_AtNameMemberTransformer_js = (function() {
  "use strict";
  var AtNameExpression = $___src_syntax_trees_ParseTrees_js.AtNameExpression;
  var $__19 = $___src_syntax_PredefinedName_js, DELETE_PROPERTY = $__19.DELETE_PROPERTY, GET_PROPERTY = $__19.GET_PROPERTY, RUNTIME = $__19.RUNTIME, SET_PROPERTY = $__19.SET_PROPERTY, TRACEUR_RUNTIME = $__19.TRACEUR_RUNTIME;
  var MEMBER_EXPRESSION = $___src_syntax_trees_ParseTreeType_js.MEMBER_EXPRESSION;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__19 = $___src_syntax_TokenType_js, AT_NAME = $__19.AT_NAME, DELETE = $__19.DELETE, EQUAL = $__19.EQUAL;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__19.createArgumentList, createAssignmentExpression = $__19.createAssignmentExpression, createCallCall = $__19.createCallCall, createCallExpression = $__19.createCallExpression, createCommaExpression = $__19.createCommaExpression, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createParenExpression = $__19.createParenExpression;
  var expandMemberExpression = $___src_codegeneration_OperatorExpander_js.expandMemberExpression;
  var AtNameMemberTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AtNameMemberTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformBinaryOperator: function(tree) {
        if (tree.left.type === MEMBER_EXPRESSION && tree.left.memberName.type === AT_NAME && tree.operator.isAssignmentOperator()) {
          if (tree.operator.type !== EQUAL) {
            tree = expandMemberExpression(tree, this);
            return this.transformAny(tree);
          }
          var operand = this.transformAny(tree.left.operand);
          var memberName = tree.left.memberName;
          var atNameExpression = new AtNameExpression(memberName.location, memberName);
          var value = this.transformAny(tree.right);
          return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, SET_PROPERTY), createArgumentList(operand, atNameExpression, value));
        }
        return $__superCall(this, $__proto, "transformBinaryOperator", [tree]);
      },
      transformCallExpression: function(tree) {
        if (tree.operand.type !== MEMBER_EXPRESSION || tree.operand.memberName.type !== AT_NAME) return $__superCall(this, $__proto, "transformCallExpression", [tree]);
        var operand = this.transformAny(tree.operand.operand);
        var memberName = tree.operand.memberName;
        var ident = createIdentifierExpression(this.addTempVar());
        var elements = tree.args.args.map(this.transformAny, this);
        var atNameExpression = new AtNameExpression(memberName.location, memberName);
        var callExpr = createCallCall(createCallExpression(createMemberExpression(TRACEUR_RUNTIME, GET_PROPERTY), createArgumentList(ident, atNameExpression)), ident, elements);
        var expressions = [createAssignmentExpression(ident, operand), callExpr];
        return createParenExpression(createCommaExpression(expressions));
      },
      transformMemberExpression: function(tree) {
        if (tree.memberName.type !== AT_NAME) return $__superCall(this, $__proto, "transformMemberExpression", [tree]);
        var atNameExpression = new AtNameExpression(tree.memberName.location, tree.memberName);
        return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, GET_PROPERTY), createArgumentList(tree.operand, atNameExpression));
      },
      transformUnaryExpression: function(tree) {
        if (tree.operator.type !== DELETE || tree.operand.type !== MEMBER_EXPRESSION || tree.operand.memberName.type !== AT_NAME) {
          return $__superCall(this, $__proto, "transformUnaryExpression", [tree]);
        }
        var operand = this.transformAny(tree.operand.operand);
        var memberName = tree.operand.memberName;
        var atNameExpression = new AtNameExpression(memberName.location, memberName);
        return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, DELETE_PROPERTY), createArgumentList(operand, atNameExpression));
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new AtNameMemberTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, false);
    return $AtNameMemberTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {AtNameMemberTransformer: {
      get: function() {
        return AtNameMemberTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_BlockBindingTransformer_js = (function() {
  "use strict";
  var AlphaRenamer = $___src_codegeneration_AlphaRenamer_js.AlphaRenamer;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, BINDING_IDENTIFIER = $__19.BINDING_IDENTIFIER, BLOCK = $__19.BLOCK, VARIABLE_DECLARATION_LIST = $__19.VARIABLE_DECLARATION_LIST;
  var $__19 = $___src_syntax_trees_ParseTrees_js, FunctionDeclaration = $__19.FunctionDeclaration, FunctionExpression = $__19.FunctionExpression;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__19 = $___src_syntax_TokenType_js, CONST = $__19.CONST, LET = $__19.LET, VAR = $__19.VAR;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__19.createAssignmentExpression, createBindingIdentifier = $__19.createBindingIdentifier, createBlock = $__19.createBlock, createCatch = $__19.createCatch, createEmptyStatement = $__19.createEmptyStatement, createExpressionStatement = $__19.createExpressionStatement, createFinally = $__19.createFinally, createForInStatement = $__19.createForInStatement, createForStatement = $__19.createForStatement, createIdentifierExpression = $__19.createIdentifierExpression, createIdentifierToken = $__19.createIdentifierToken, createThrowStatement = $__19.createThrowStatement, createTryStatement = $__19.createTryStatement, createUndefinedExpression = $__19.createUndefinedExpression, createVariableDeclaration = $__19.createVariableDeclaration, createVariableDeclarationList = $__19.createVariableDeclarationList, createVariableStatement = $__19.createVariableStatement;
  var ScopeType = {
    PROGRAM: 'PROGRAM',
    FUNCTION: 'FUNCTION',
    BLOCK: 'BLOCK'
  };
  var Scope = function() {
    'use strict';
    var $Scope = ($__createClassNoExtends)({
      constructor: function(parent, type) {
        this.parent = parent;
        this.type = type;
        this.blockVariables = null;
      },
      addBlockScopedVariable: function(value) {
        if (!this.blockVariables) {
          this.blockVariables = Object.create(null);
        }
        this.blockVariables[value] = true;
      }
    }, {});
    return $Scope;
  }();
  ;
  var Rename = function() {
    'use strict';
    var $Rename = ($__createClassNoExtends)({constructor: function(oldName, newName) {
        this.oldName = oldName;
        this.newName = newName;
      }}, {});
    return $Rename;
  }();
  function renameAll(renames, tree) {
    renames.forEach((function(rename) {
      tree = AlphaRenamer.rename(tree, rename.oldName, rename.newName);
    }));
    return tree;
  }
  function toBlock(statement) {
    return statement.type == BLOCK ? statement: createBlock(statement);
  }
  var BlockBindingTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BlockBindingTransformer = ($__createClass)({
      constructor: function(stateAllocator) {
        $__superCall(this, $__proto, "constructor", []);
        this.scope_ = null;
      },
      createProgramScope_: function() {
        return new Scope(this.scope_, ScopeType.PROGRAM);
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
      transformProgram: function(tree) {
        var scope = this.push_(this.createProgramScope_());
        var result = $__superCall(this, $__proto, "transformProgram", [tree]);
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
        body = this.transformBlockStatements_(body);
        this.pop_(scope);
        return body;
      },
      transformBlockStatements_: function(tree) {
        var statements = this.transformList(tree.statements);
        if (this.scope_.blockVariables != null) {
          tree = toBlock(this.rewriteAsCatch_(this.scope_.blockVariables, createBlock(statements)));
        } else if (statements != tree.statements) {
          tree = createBlock(statements);
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
      }}, $__proto, $__super, true);
    return $BlockBindingTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {BlockBindingTransformer: {
      get: function() {
        return BlockBindingTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_CascadeExpressionTransformer_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_trees_ParseTreeType_js, BINARY_OPERATOR = $__19.BINARY_OPERATOR, CALL_EXPRESSION = $__19.CALL_EXPRESSION, CALL_EXPRESSION = $__19.CALL_EXPRESSION, CASCADE_EXPRESSION = $__19.CASCADE_EXPRESSION, CASCADE_EXPRESSION = $__19.CASCADE_EXPRESSION, IDENTIFIER_EXPRESSION = $__19.IDENTIFIER_EXPRESSION, MEMBER_EXPRESSION = $__19.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__19.MEMBER_LOOKUP_EXPRESSION;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__19.createAssignmentExpression, createBinaryOperator = $__19.createBinaryOperator, createCallExpression = $__19.createCallExpression, createCascadeExpression = $__19.createCascadeExpression, createCommaExpression = $__19.createCommaExpression, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createMemberLookupExpression = $__19.createMemberLookupExpression, createParenExpression = $__19.createParenExpression;
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
  var CascadeExpressionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CascadeExpressionTransformer = ($__createClass)({
      constructor: function(identifierGenerator, reporter) {
        $__superCall(this, $__proto, "constructor", [identifierGenerator]);
        this.reporter_ = reporter;
      },
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
      }}, $__proto, $__super, true);
    return $CascadeExpressionTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {CascadeExpressionTransformer: {
      get: function() {
        return CascadeExpressionTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_util_ArrayMap_js = (function() {
  "use strict";
  var ArrayMap = function() {
    'use strict';
    var $ArrayMap = ($__createClassNoExtends)({
      constructor: function() {
        this.values_ = [];
        this.keys_ = [];
      },
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
    return $ArrayMap;
  }();
  return Object.preventExtensions(Object.create(null, {ArrayMap: {
      get: function() {
        return ArrayMap;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_util_ErrorReporter_js = (function() {
  "use strict";
  var ErrorReporter = function() {
    'use strict';
    var $ErrorReporter = ($__createClassNoExtends)({
      constructor: function() {
        this.hadError_ = false;
      },
      reportError: function(location, format) {
        for (var args = [], $__10 = 2; $__10 < arguments.length; $__10++) args[$__10 - 2] = arguments[$__10];
        this.hadError_ = true;
        this.reportMessageInternal(location, format, args);
      },
      reportMessageInternal: function(location, format, args) {
        if (location) format = (location + ": " + format);
        ($__24 = console).error.apply($__24, $__spread([format], args));
      },
      hadError: function() {
        return this.hadError_;
      },
      clearError: function() {
        this.hadError_ = false;
      }
    }, {});
    return $ErrorReporter;
  }();
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
}).call(this);
var $___src_util_MutedErrorReporter_js = (function() {
  "use strict";
  var ErrorReporter = $___src_util_ErrorReporter_js.ErrorReporter;
  var MutedErrorReporter = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $MutedErrorReporter = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      reportMessageInternal: function(location, format, args) {}
    }, {}, $__proto, $__super, false);
    return $MutedErrorReporter;
  }(ErrorReporter);
  return Object.preventExtensions(Object.create(null, {MutedErrorReporter: {
      get: function() {
        return MutedErrorReporter;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_util_SourcePosition_js = (function() {
  "use strict";
  var SourcePosition = function() {
    'use strict';
    var $SourcePosition = ($__createClassNoExtends)({
      constructor: function(source, offset) {
        this.source = source;
        this.offset = offset;
        this.line_ = - 1;
        this.column_ = - 1;
      },
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
    return $SourcePosition;
  }();
  return Object.preventExtensions(Object.create(null, {SourcePosition: {
      get: function() {
        return SourcePosition;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_LineNumberTable_js = (function() {
  "use strict";
  var SourcePosition = $___src_util_SourcePosition_js.SourcePosition;
  var SourceRange = $___src_util_SourceRange_js.SourceRange;
  var isLineTerminator = $___src_syntax_Scanner_js.isLineTerminator;
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
  var LineNumberTable = function() {
    'use strict';
    var $LineNumberTable = ($__createClassNoExtends)({
      constructor: function(sourceFile) {
        this.sourceFile_ = sourceFile;
        this.lineStartOffsets_ = null;
        this.lastLine_ = 0;
        this.lastOffset_ = - 1;
      },
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
    return $LineNumberTable;
  }();
  return Object.preventExtensions(Object.create(null, {LineNumberTable: {
      get: function() {
        return LineNumberTable;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_util_uid_js = (function() {
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
}).call(this);
var $___src_syntax_SourceFile_js = (function() {
  "use strict";
  var LineNumberTable = $___src_syntax_LineNumberTable_js.LineNumberTable;
  var getUid = $___src_util_uid_js.getUid;
  var SourceFile = function() {
    'use strict';
    var $SourceFile = ($__createClassNoExtends)({constructor: function(name, contents) {
        this.name = name;
        this.contents = contents;
        this.lineNumberTable = new LineNumberTable(this);
        this.uid = getUid();
      }}, {});
    return $SourceFile;
  }();
  return Object.preventExtensions(Object.create(null, {SourceFile: {
      get: function() {
        return SourceFile;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_PlaceholderParser_js = (function() {
  "use strict";
  var ArrayMap = $___src_util_ArrayMap_js.ArrayMap;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, BLOCK = $__19.BLOCK, EXPRESSION_STATEMENT = $__19.EXPRESSION_STATEMENT, IDENTIFIER_EXPRESSION = $__19.IDENTIFIER_EXPRESSION;
  var IdentifierToken = $___src_syntax_IdentifierToken_js.IdentifierToken;
  var MutedErrorReporter = $___src_util_MutedErrorReporter_js.MutedErrorReporter;
  var ParseTree = $___src_syntax_trees_ParseTree_js.ParseTree;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var Parser = $___src_syntax_Parser_js.Parser;
  var $__19 = $___src_syntax_trees_ParseTrees_js, PropertyMethodAssignment = $__19.PropertyMethodAssignment, PropertyNameAssignment = $__19.PropertyNameAssignment, PropertyNameShorthand = $__19.PropertyNameShorthand;
  var SourceFile = $___src_syntax_SourceFile_js.SourceFile;
  var IDENTIFIER = $___src_syntax_TokenType_js.IDENTIFIER;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArrayLiteralExpression = $__19.createArrayLiteralExpression, createBindingIdentifier = $__19.createBindingIdentifier, createBlock = $__19.createBlock, createBooleanLiteral = $__19.createBooleanLiteral, createCommaExpression = $__19.createCommaExpression, createExpressionStatement = $__19.createExpressionStatement, createGetAccessor = $__19.createGetAccessor, createIdentifierExpression = $__19.createIdentifierExpression, createIdentifierToken = $__19.createIdentifierToken, createMemberExpression = $__19.createMemberExpression, createNullLiteral = $__19.createNullLiteral, createNumberLiteral = $__19.createNumberLiteral, createParenExpression = $__19.createParenExpression, createSetAccessor = $__19.createSetAccessor, createStringLiteral = $__19.createStringLiteral, createVoid0 = $__19.createVoid0;
  var NOT_FOUND = {};
  var PREFIX = '$__placeholder__';
  var cache = new ArrayMap();
  function parseExpression(sourceLiterals) {
    for (var values = [], $__11 = 1; $__11 < arguments.length; $__11++) values[$__11 - 1] = arguments[$__11];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseExpression(sourceLiterals);
    }));
  }
  function parseStatement(sourceLiterals) {
    for (var values = [], $__12 = 1; $__12 < arguments.length; $__12++) values[$__12 - 1] = arguments[$__12];
    return parse(sourceLiterals, values, (function() {
      return new PlaceholderParser().parseStatement(sourceLiterals);
    }));
  }
  function parsePropertyDefinition(sourceLiterals) {
    for (var values = [], $__13 = 1; $__13 < arguments.length; $__13++) values[$__13 - 1] = arguments[$__13];
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
  var PlaceholderParser = function() {
    'use strict';
    var $PlaceholderParser = ($__createClassNoExtends)({
      constructor: function() {},
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
        var file = new SourceFile('parse@TemplateParser', source);
        var errorReporter = new MutedErrorReporter();
        var parser = new Parser(errorReporter, file);
        var tree = doParse(parser);
        if (errorReporter.hadError() || !tree || !parser.isAtEnd()) throw new Error(("Internal error trying to parse:\n\n" + source));
        return tree;
      }
    }, {});
    return $PlaceholderParser;
  }();
  function convertValueToExpression(value) {
    if (value instanceof ParseTree) return value;
    if (value instanceof IdentifierToken) return createIdentifierExpression(value);
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
  var PlaceholderTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PlaceholderTransformer = ($__createClass)({
      constructor: function(values) {
        $__superCall(this, $__proto, "constructor", []);
        this.values = values;
      },
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
        return $__superCall(this, $__proto, "transformExpressionStatement", [tree]);
      },
      transformBlock: function(tree) {
        if (tree.statements.length === 1 && tree.statements[0].type === EXPRESSION_STATEMENT) {
          var transformedStatement = this.transformExpressionStatement(tree.statements[0]);
          if (transformedStatement === tree.statements[0]) return tree;
          if (transformedStatement.type === BLOCK) return transformedStatement;
        }
        return $__superCall(this, $__proto, "transformBlock", [tree]);
      },
      transformGetAccessor: function(tree) {
        var value = this.getValue_(tree.name.value);
        if (value === NOT_FOUND) return $__superCall(this, $__proto, "transformGetAccessor", [tree]);
        return createGetAccessor(value, this.transformAny(tree.body));
      },
      transformMemberExpression: function(tree) {
        var value = this.getValue_(tree.memberName.value);
        if (value === NOT_FOUND) return $__superCall(this, $__proto, "transformMemberExpression", [tree]);
        var operand = this.transformAny(tree.operand);
        return createMemberExpression(operand, value);
      },
      transformPropertyMethodAssignment: function(tree) {
        if (tree.name.type === IDENTIFIER) {
          var value = this.getValue_(tree.name.value);
          if (value !== NOT_FOUND) {
            return new PropertyMethodAssignment(tree.location, tree.isStatic, tree.isGenerator, convertValueToIdentifierToken(value), this.transformAny(tree.formalParameterList), this.transformAny(tree.functionBody));
          }
        }
        return $__superCall(this, $__proto, "transformPropertyMethodAssignment", [tree]);
      },
      transformPropertyNameAssignment: function(tree) {
        if (tree.name.type === IDENTIFIER) {
          var value = this.getValue_(tree.name.value);
          if (value !== NOT_FOUND) {
            return new PropertyNameAssignment(null, convertValueToIdentifierToken(value), this.transformAny(tree.value));
          }
        }
        return $__superCall(this, $__proto, "transformPropertyNameAssignment", [tree]);
      },
      transformPropertyNameShorthand: function(tree) {
        var value = this.getValue_(tree.name.value);
        if (value !== NOT_FOUND) {
          if (value instanceof ParseTree) return value;
          return new PropertyNameShorthand(null, convertValueToIdentifierToken(value));
        }
        return $__superCall(this, $__proto, "transformPropertyNameShorthand", [tree]);
      },
      transformSetAccessor: function(tree) {
        var value = this.getValue_(tree.name.value);
        if (value === NOT_FOUND) return $__superCall(this, $__proto, "transformSetAccessor", [tree]);
        return createSetAccessor(value, this.transformAny(tree.parameter), this.transformAny(tree.body));
      }
    }, {}, $__proto, $__super, true);
    return $PlaceholderTransformer;
  }(ParseTreeTransformer);
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
}).call(this);
var $___src_codegeneration_SuperTransformer_js = (function() {
  "use strict";
  var $__0 = Object.freeze(Object.defineProperties(["", "(", ",\n                                               ", ",\n                                               ", ",\n                                               ", ")"], {raw: {value: Object.freeze(["", "(", ",\n                                               ", ",\n                                               ", ",\n                                               ", ")"])}})), $__1 = Object.freeze(Object.defineProperties(["", "(", ",\n                                              ", ",\n                                              ", ")"], {raw: {value: Object.freeze(["", "(", ",\n                                              ", ",\n                                              ", ")"])}})), $__2 = Object.freeze(Object.defineProperties(["", "(", ",\n                                                ", ",\n                                                ", ",\n                                                ", ")"], {raw: {value: Object.freeze(["", "(", ",\n                                                ", ",\n                                                ", ",\n                                                ", ")"])}}));
  var $__19 = $___src_syntax_trees_ParseTrees_js, FunctionDeclaration = $__19.FunctionDeclaration, FunctionExpression = $__19.FunctionExpression;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, MEMBER_EXPRESSION = $__19.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__19.MEMBER_LOOKUP_EXPRESSION, SUPER_EXPRESSION = $__19.SUPER_EXPRESSION;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var EQUAL = $___src_syntax_TokenType_js.EQUAL;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArrayLiteralExpression = $__19.createArrayLiteralExpression, createIdentifierExpression = $__19.createIdentifierExpression, createStringLiteral = $__19.createStringLiteral, createThisExpression = $__19.createThisExpression;
  var $__19 = $___src_codegeneration_OperatorExpander_js, expandMemberExpression = $__19.expandMemberExpression, expandMemberLookupExpression = $__19.expandMemberLookupExpression;
  var parseExpression = $___src_codegeneration_PlaceholderParser_js.parseExpression;
  var SUPER_DESCRIPTOR_CODE = "function (proto, name) {\n      if (!proto)\n        throw new TypeError('super is null');\n      return Object.getPropertyDescriptor(proto, name);\n    }";
  var SUPER_CALL_CODE = "function(self, proto, name, args) {\n      var descriptor = %superDescriptor(proto, name);\n      if (descriptor) {\n        if ('value' in descriptor)\n          return descriptor.value.apply(self, args);\n        if (descriptor.get)\n          return descriptor.get.call(self).apply(self, args);\n      }\n      throw new TypeError(\"Object has no method '\" + name + \"'.\");\n    }";
  var SUPER_GET_CODE = "function(self, proto, name) {\n      var descriptor = %superDescriptor(proto, name);\n      if (descriptor) {\n        if (descriptor.get)\n          return descriptor.get.call(self);\n        else if ('value' in descriptor)\n          return descriptor.value;\n      }\n      return undefined;\n    }";
  var SUPER_SET_CODE = "function(self, proto, name, value) {\n      var descriptor = %superDescriptor(proto, name);\n      if (descriptor && descriptor.set) {\n        descriptor.set.call(self, value);\n        return;\n      }\n      throw new TypeError(\"Object has no setter '\" + name + \"'.\");\n    }";
  var SuperTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SuperTransformer = ($__createClass)({
      constructor: function(tempVarTransformer, runtimeInliner, reporter, protoName, methodTree, thisName) {
        this.tempVarTransformer_ = tempVarTransformer;
        this.runtimeInliner_ = runtimeInliner;
        this.reporter_ = reporter;
        this.protoName_ = protoName;
        this.method_ = methodTree;
        this.superCount_ = 0;
        this.thisVar_ = createIdentifierExpression(thisName);
        this.inNestedFunc_ = 0;
        this.nestedSuperCount_ = 0;
      },
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
        var transformedTree = constructor === FunctionExpression ? $__superCall(this, $__proto, "transformFunctionExpression", [tree]): $__superCall(this, $__proto, "transformFunctionDeclaration", [tree]);
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
          var methodName = this.method_.name.value;
          return this.createSuperCallExpression_(methodName, tree);
        }
        if ((tree.operand.type == MEMBER_EXPRESSION || tree.operand.type == MEMBER_LOOKUP_EXPRESSION) && tree.operand.operand.type == SUPER_EXPRESSION) {
          this.superCount_++;
          var name;
          if (tree.operand.type == MEMBER_EXPRESSION) name = tree.operand.memberName.value; else name = tree.operand.memberExpression;
          return this.createSuperCallExpression_(name, tree);
        }
        return $__superCall(this, $__proto, "transformCallExpression", [tree]);
      },
      createSuperCallExpression_: function(methodName, tree) {
        var thisExpr = this.inNestedFunc_ ? this.thisVar_: createThisExpression();
        var args = createArrayLiteralExpression(tree.args.args);
        return this.createSuperCallExpression(thisExpr, this.protoName_, methodName, args);
      },
      createSuperCallExpression: function(thisExpr, protoName, methodName, args) {
        return parseExpression($__0, this.superCall_, thisExpr, protoName, methodName, args);
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
        return parseExpression($__1, this.superGet_, thisExpr, this.protoName_, name);
      },
      transformMemberExpression: function(tree) {
        if (tree.operand.type === SUPER_EXPRESSION) {
          this.superCount_++;
          return this.transformMemberShared_(tree, createStringLiteral(tree.memberName.value));
        }
        return $__superCall(this, $__proto, "transformMemberExpression", [tree]);
      },
      transformMemberLookupExpression: function(tree) {
        if (tree.operand.type === SUPER_EXPRESSION) return this.transformMemberShared_(tree, tree.memberExpression);
        return $__superCall(this, $__proto, "transformMemberLookupExpression", [tree]);
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
          return parseExpression($__2, this.superSet_, thisExpr, this.protoName_, name, right);
        }
        return $__superCall(this, $__proto, "transformBinaryOperator", [tree]);
      },
      transformSuperExpression: function(tree) {
        this.reportError_(tree, '"super" may only be used on the LHS of a member ' + 'access expression before a call (TODO wording)');
        return tree;
      },
      reportError_: function(tree) {
        for (var args = [], $__14 = 1; $__14 < arguments.length; $__14++) args[$__14 - 1] = arguments[$__14];
        ($__25 = this.reporter_).reportError.apply($__25, $__spread([tree.location.start], args));
      }
    }, {}, $__proto, $__super, true);
    return $SuperTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {SuperTransformer: {
      get: function() {
        return SuperTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ClassTransformer_js = (function() {
  "use strict";
  var $__2 = Object.freeze(Object.defineProperties(["function($__super) {\n        'use strict';\n        var $__proto = ", "($__super);\n        var ", " =\n            (", ")(", ", ", ", $__proto,\n                                   $__super, ", ");\n        return ", ";\n      }(", ")"], {raw: {value: Object.freeze(["function($__super) {\n        'use strict';\n        var $__proto = ", "($__super);\n        var ", " =\n            (", ")(", ", ", ", $__proto,\n                                   $__super, ", ");\n        return ", ";\n      }(", ")"])}})), $__1 = Object.freeze(Object.defineProperties(["function() {\n      'use strict';\n      var ", " = (", ")(\n          ", ", ", ");\n      return ", ";\n    }()"], {raw: {value: Object.freeze(["function() {\n      'use strict';\n      var ", " = (", ")(\n          ", ", ", ");\n      return ", ";\n    }()"])}})), $__0 = Object.freeze(Object.defineProperties(["constructor: function() {}"], {raw: {value: Object.freeze(["constructor: function() {}"])}})), $__3 = Object.freeze(Object.defineProperties(["constructor: function() {\n      ", ";\n    }"], {raw: {value: Object.freeze(["constructor: function() {\n      ", ";\n    }"])}}));
  var CONSTRUCTOR = $___src_syntax_PredefinedName_js.CONSTRUCTOR;
  var $__19 = $___src_syntax_trees_ParseTrees_js, GetAccessor = $__19.GetAccessor, PropertyMethodAssignment = $__19.PropertyMethodAssignment, SetAccessor = $__19.SetAccessor;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, GET_ACCESSOR = $__19.GET_ACCESSOR, PROPERTY_METHOD_ASSIGNMENT = $__19.PROPERTY_METHOD_ASSIGNMENT, SET_ACCESSOR = $__19.SET_ACCESSOR;
  var SuperTransformer = $___src_codegeneration_SuperTransformer_js.SuperTransformer;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__19 = $___src_syntax_TokenType_js, LET = $__19.LET, VAR = $__19.VAR;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createBlock = $__19.createBlock, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createObjectLiteralExpression = $__19.createObjectLiteralExpression, createThisExpression = $__19.createThisExpression, createVariableStatement = $__19.createVariableStatement;
  var parseOptions = $___src_options_js.parseOptions;
  var $__19 = $___src_codegeneration_PlaceholderParser_js, parseExpression = $__19.parseExpression, parsePropertyDefinition = $__19.parsePropertyDefinition;
  var CREATE_CLASS_CODE = "function(object, staticObject, protoParent, superClass, hasConstructor) {\n      var ctor = object.constructor;\n      if (typeof superClass === 'function')\n        ctor.__proto__ = superClass;\n      if (!hasConstructor && protoParent === null)\n        ctor = object.constructor = function() {};\n\n      var descriptors = %getDescriptors(object);\n      descriptors.constructor.enumerable = false;\n      ctor.prototype = Object.create(protoParent, descriptors);\n      Object.defineProperties(ctor, %getDescriptors(staticObject));\n\n      return ctor;\n    }";
  var GET_PROTO_PARENT_CODE = "function(superClass) {\n      if (typeof superClass === 'function') {\n        var prototype = superClass.prototype;\n        if (Object(prototype) === prototype || prototype === null)\n          return superClass.prototype;\n      }\n      if (superClass === null)\n        return null;\n      throw new TypeError();\n    }";
  var CREATE_CLASS_NO_EXTENDS_CODE = "function(object, staticObject) {\n      var ctor = object.constructor;\n      Object.defineProperty(object, 'constructor', {enumerable: false});\n      ctor.prototype = object;\n      Object.defineProperties(ctor, %getDescriptors(staticObject));\n      return ctor;\n    }";
  var ClassTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ClassTransformer = ($__createClass)({
      constructor: function(identifierGenerator, runtimeInliner, reporter) {
        $__superCall(this, $__proto, "constructor", [identifierGenerator]);
        this.runtimeInliner_ = runtimeInliner;
        this.reporter_ = reporter;
      },
      transformClassShared_: function(tree, name) {
        var superClass = this.transformAny(tree.superClass);
        var nameIdent = createIdentifierExpression(name);
        var protoName = createIdentifierExpression('$__proto');
        var hasConstructor = false;
        var protoElements = [], staticElements = [];
        var staticSuperRef = superClass ? createIdentifierExpression('$__super'): createMemberExpression('Function', 'prototype');
        tree.elements.forEach((function(tree) {
          var elements, proto;
          if (tree.isStatic) {
            elements = staticElements;
            proto = staticSuperRef;
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
              if (!tree.isStatic && tree.name.value === CONSTRUCTOR) hasConstructor = true;
              elements.push(this.transformPropertyMethodAssignment_(tree, proto));
              break;
            default:
              throw new Error(("Unexpected class element: " + tree.type));
          }
        }).bind(this));
        if (!hasConstructor) {
          protoElements.unshift(this.getDefaultConstructor_(tree, superClass, protoName));
        }
        var object = createObjectLiteralExpression(protoElements);
        var staticObject = createObjectLiteralExpression(staticElements);
        if (superClass) {
          return parseExpression($__2, this.getProtoParent_, nameIdent, this.createClass_, object, staticObject, hasConstructor, nameIdent, superClass);
        }
        return parseExpression($__1, nameIdent, this.createClassNoExtends_, object, staticObject, nameIdent);
      },
      get createClass_() {
        return this.runtimeInliner_.get('createClass', CREATE_CLASS_CODE);
      },
      get getProtoParent_() {
        return this.runtimeInliner_.get('getProtoParent', GET_PROTO_PARENT_CODE);
      },
      get createClassNoExtends_() {
        return this.runtimeInliner_.get('createClassNoExtends', CREATE_CLASS_NO_EXTENDS_CODE);
      },
      transformClassDeclaration: function(tree) {
        var name = '$' + tree.name.identifierToken.value;
        return createVariableStatement(parseOptions.blockBinding ? LET: VAR, tree.name, this.transformClassShared_(tree, name));
      },
      transformClassExpression: function(tree) {
        var ident = tree.name ? tree.name.identifierToken.value: this.addTempVar();
        return this.transformClassShared_(tree, ident);
      },
      transformPropertyMethodAssignment_: function(tree, protoName) {
        var formalParameterList = this.transformAny(tree.formalParameterList);
        var functionBody = this.transformSuperInBlock_(tree, tree.functionBody, protoName);
        if (!tree.isStatic && formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) {
          return tree;
        }
        var isStatic = false;
        return new PropertyMethodAssignment(tree.location, isStatic, tree.isGenerator, tree.name, formalParameterList, functionBody);
      },
      transformGetAccessor_: function(tree, protoName) {
        var body = this.transformSuperInBlock_(tree, tree.body, protoName);
        if (!tree.isStatic && body === tree.body) return tree;
        return new GetAccessor(tree.location, false, tree.name, body);
      },
      transformSetAccessor_: function(tree, protoName) {
        var parameter = this.transformAny(tree.parameter);
        var body = this.transformSuperInBlock_(tree, tree.body, protoName);
        if (!tree.isStatic && body === tree.body) return tree;
        return new SetAccessor(tree.location, false, tree.name, parameter, body);
      },
      transformSuperInBlock_: function(methodTree, tree, protoName) {
        this.pushTempVarState();
        var thisName = this.getTempIdentifier();
        var thisDecl = createVariableStatement(VAR, thisName, createThisExpression());
        var superTransformer = new SuperTransformer(this, this.runtimeInliner_, this.reporter_, protoName, methodTree, thisName);
        var transformedTree = superTransformer.transformBlock(this.transformBlock(tree));
        this.popTempVarState();
        if (superTransformer.nestedSuper) return createBlock([thisDecl].concat(transformedTree.statements));
        return transformedTree;
      },
      getDefaultConstructor_: function(tree, hasSuper, protoName) {
        if (!hasSuper) return parsePropertyDefinition($__0);
        var superTransformer = new SuperTransformer(this, this.runtimeInliner_, this.reporter_, protoName, null, null);
        var superCall = superTransformer.createSuperCallExpression(createThisExpression(), protoName, 'constructor', createIdentifierExpression('arguments'));
        return parsePropertyDefinition($__3, superCall);
      }
    }, {transformTree: function(identifierGenerator, runtimeInliner, reporter, tree) {
        return new this(identifierGenerator, runtimeInliner, reporter).transformAny(tree);
      }}, $__proto, $__super, true);
    return $ClassTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {ClassTransformer: {
      get: function() {
        return ClassTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_CollectionTransformer_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_PredefinedName_js, ELEMENT_DELETE = $__19.ELEMENT_DELETE, ELEMENT_GET = $__19.ELEMENT_GET, ELEMENT_HAS = $__19.ELEMENT_HAS, ELEMENT_SET = $__19.ELEMENT_SET, RUNTIME = $__19.RUNTIME, TRACEUR_RUNTIME = $__19.TRACEUR_RUNTIME;
  var MEMBER_LOOKUP_EXPRESSION = $___src_syntax_trees_ParseTreeType_js.MEMBER_LOOKUP_EXPRESSION;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__19 = $___src_syntax_TokenType_js, DELETE = $__19.DELETE, EQUAL = $__19.EQUAL, IN = $__19.IN;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__19.createArgumentList, createAssignmentExpression = $__19.createAssignmentExpression, createCallCall = $__19.createCallCall, createCallExpression = $__19.createCallExpression, createCommaExpression = $__19.createCommaExpression, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createParenExpression = $__19.createParenExpression;
  var expandMemberLookupExpression = $___src_codegeneration_OperatorExpander_js.expandMemberLookupExpression;
  var CollectionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CollectionTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
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
        return $__superCall(this, $__proto, "transformBinaryOperator", [tree]);
      },
      transformCallExpression: function(tree) {
        if (tree.operand.type !== MEMBER_LOOKUP_EXPRESSION) return $__superCall(this, $__proto, "transformCallExpression", [tree]);
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
          return $__superCall(this, $__proto, "transformUnaryExpression", [tree]);
        }
        var operand = this.transformAny(tree.operand.operand);
        var memberExpression = this.transformAny(tree.operand.memberExpression);
        return createCallExpression(createMemberExpression(TRACEUR_RUNTIME, ELEMENT_DELETE), createArgumentList(operand, memberExpression));
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new CollectionTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, false);
    return $CollectionTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {CollectionTransformer: {
      get: function() {
        return CollectionTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_util_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_trees_ParseTreeType_js, IDENTIFIER_EXPRESSION = $__19.IDENTIFIER_EXPRESSION, LITERAL_EXPRESSION = $__19.LITERAL_EXPRESSION, PAREN_EXPRESSION = $__19.PAREN_EXPRESSION, UNARY_EXPRESSION = $__19.UNARY_EXPRESSION;
  var UNDEFINED = $___src_syntax_PredefinedName_js.UNDEFINED;
  var VOID = $___src_syntax_TokenType_js.VOID;
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
}).call(this);
var $___src_codegeneration_DefaultParametersTransformer_js = (function() {
  "use strict";
  var $__19 = $___src_semantics_util_js, isUndefined = $__19.isUndefined, isVoidExpression = $__19.isVoidExpression, isLiteralExpression = $__19.isLiteralExpression;
  var $__19 = $___src_syntax_trees_ParseTrees_js, FormalParameterList = $__19.FormalParameterList, FunctionDeclaration = $__19.FunctionDeclaration, FunctionExpression = $__19.FunctionExpression;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__19 = $___src_syntax_PredefinedName_js, ARGUMENTS = $__19.ARGUMENTS, UNDEFINED = $__19.UNDEFINED;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, IDENTIFIER_EXPRESSION = $__19.IDENTIFIER_EXPRESSION, LITERAL_EXPRESSION = $__19.LITERAL_EXPRESSION, PAREN_EXPRESSION = $__19.PAREN_EXPRESSION, REST_PARAMETER = $__19.REST_PARAMETER, UNARY_EXPRESSION = $__19.UNARY_EXPRESSION;
  var $__19 = $___src_syntax_TokenType_js, NOT_EQUAL_EQUAL = $__19.NOT_EQUAL_EQUAL, VAR = $__19.VAR, VOID = $__19.VOID;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createBinaryOperator = $__19.createBinaryOperator, createBlock = $__19.createBlock, createConditionalExpression = $__19.createConditionalExpression, createIdentifierExpression = $__19.createIdentifierExpression, createMemberLookupExpression = $__19.createMemberLookupExpression, createNumberLiteral = $__19.createNumberLiteral, createOperatorToken = $__19.createOperatorToken, createVariableStatement = $__19.createVariableStatement, createVoid0 = $__19.createVoid0;
  var prependStatements = $___src_codegeneration_PrependStatements_js.prependStatements;
  var stack = [];
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
  var DefaultParametersTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $DefaultParametersTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformFunctionExpression: function(tree) {
        return this.transformFunction_(tree, FunctionExpression);
      },
      transformFunctionDeclaration: function(tree) {
        return this.transformFunction_(tree, FunctionDeclaration);
      },
      transformFunction_: function(tree, constructor) {
        stack.push([]);
        var transformedTree = constructor === FunctionExpression ? $__superCall(this, $__proto, "transformFunctionExpression", [tree]): $__superCall(this, $__proto, "transformFunctionDeclaration", [tree]);
        var statements = stack.pop();
        if (!statements.length) return transformedTree;
        statements = prependStatements.apply(null, $__spread([transformedTree.functionBody.statements], statements));
        return new constructor(transformedTree.location, transformedTree.name, transformedTree.isGenerator, transformedTree.formalParameterList, createBlock(statements));
      },
      transformFormalParameterList: function(tree) {
        var parameters = [];
        var statements = stack[stack.length - 1];
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
            statements.push(createDefaultAssignment(i, param.binding, param.initializer));
          }
        }
        if (!changed) return tree;
        return new FormalParameterList(tree.location, parameters);
      }
    }, {transformTree: function(tree) {
        return new DefaultParametersTransformer().transformAny(tree);
      }}, $__proto, $__super, false);
    return $DefaultParametersTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {DefaultParametersTransformer: {
      get: function() {
        return DefaultParametersTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_DestructuringTransformer_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_PredefinedName_js, ARRAY = $__19.ARRAY, CALL = $__19.CALL, PROTOTYPE = $__19.PROTOTYPE, SLICE = $__19.SLICE;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, ARRAY_LITERAL_EXPRESSION = $__19.ARRAY_LITERAL_EXPRESSION, ARRAY_PATTERN = $__19.ARRAY_PATTERN, BINDING_ELEMENT = $__19.BINDING_ELEMENT, BLOCK = $__19.BLOCK, CALL_EXPRESSION = $__19.CALL_EXPRESSION, IDENTIFIER_EXPRESSION = $__19.IDENTIFIER_EXPRESSION, LITERAL_EXPRESSION = $__19.LITERAL_EXPRESSION, MEMBER_EXPRESSION = $__19.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__19.MEMBER_LOOKUP_EXPRESSION, OBJECT_LITERAL_EXPRESSION = $__19.OBJECT_LITERAL_EXPRESSION, OBJECT_PATTERN = $__19.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__19.OBJECT_PATTERN_FIELD, PAREN_EXPRESSION = $__19.PAREN_EXPRESSION, VARIABLE_DECLARATION_LIST = $__19.VARIABLE_DECLARATION_LIST;
  var $__19 = $___src_syntax_trees_ParseTrees_js, BindingElement = $__19.BindingElement, Catch = $__19.Catch, ForInStatement = $__19.ForInStatement, ForOfStatement = $__19.ForOfStatement, FunctionDeclaration = $__19.FunctionDeclaration, FunctionExpression = $__19.FunctionExpression, LiteralExpression = $__19.LiteralExpression, SetAccessor = $__19.SetAccessor;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__19 = $___src_syntax_TokenType_js, EQUAL = $__19.EQUAL, IDENTIFIER = $__19.IDENTIFIER, IN = $__19.IN, LET = $__19.LET, VAR = $__19.VAR;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__19.createArgumentList, createAssignmentExpression = $__19.createAssignmentExpression, createBinaryOperator = $__19.createBinaryOperator, createBindingIdentifier = $__19.createBindingIdentifier, createBlock = $__19.createBlock, createCallExpression = $__19.createCallExpression, createCommaExpression = $__19.createCommaExpression, createConditionalExpression = $__19.createConditionalExpression, createExpressionStatement = $__19.createExpressionStatement, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createMemberLookupExpression = $__19.createMemberLookupExpression, createNumberLiteral = $__19.createNumberLiteral, createOperatorToken = $__19.createOperatorToken, createParenExpression = $__19.createParenExpression, createStringLiteral = $__19.createStringLiteral, createVariableDeclaration = $__19.createVariableDeclaration, createVariableDeclarationList = $__19.createVariableDeclarationList, createVariableStatement = $__19.createVariableStatement;
  var options = $___src_options_js.options;
  var prependStatements = $___src_codegeneration_PrependStatements_js.prependStatements;
  var stack = [];
  var Desugaring = function() {
    'use strict';
    var $Desugaring = ($__createClassNoExtends)({constructor: function(rvalue) {
        this.rvalue = rvalue;
      }}, {});
    return $Desugaring;
  }();
  var AssignmentExpressionDesugaring = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AssignmentExpressionDesugaring = ($__createClass)({
      constructor: function(rvalue) {
        $__superCall(this, $__proto, "constructor", [rvalue]);
        this.expressions = [];
      },
      assign: function(lvalue, rvalue) {
        this.expressions.push(createAssignmentExpression(lvalue, rvalue));
      }
    }, {}, $__proto, $__super, true);
    return $AssignmentExpressionDesugaring;
  }(Desugaring);
  var VariableDeclarationDesugaring = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $VariableDeclarationDesugaring = ($__createClass)({
      constructor: function(rvalue) {
        $__superCall(this, $__proto, "constructor", [rvalue]);
        this.declarations = [];
      },
      assign: function(lvalue, rvalue) {
        if (lvalue.type === BINDING_ELEMENT) {
          this.declarations.push(createVariableDeclaration(lvalue.binding, rvalue));
          return;
        }
        if (lvalue.type == IDENTIFIER_EXPRESSION) lvalue = createBindingIdentifier(lvalue);
        this.declarations.push(createVariableDeclaration(lvalue, rvalue));
      }
    }, {}, $__proto, $__super, true);
    return $VariableDeclarationDesugaring;
  }(Desugaring);
  function createConditionalMemberExpression(rvalue, identToken, initializer) {
    if (identToken.type !== IDENTIFIER) {
      return createConditionalMemberLookupExpression(rvalue, new LiteralExpression(null, identToken), initializer);
    }
    if (!initializer) return createMemberExpression(rvalue, identToken);
    return createConditionalExpression(createBinaryOperator(createStringLiteral(identToken.value), createOperatorToken(IN), rvalue), createMemberExpression(rvalue, identToken), initializer);
  }
  function createConditionalMemberLookupExpression(rvalue, index, initializer) {
    if (!initializer) return createMemberLookupExpression(rvalue, index);
    return createConditionalExpression(createBinaryOperator(index, createOperatorToken(IN), rvalue), createMemberLookupExpression(rvalue, index), initializer);
  }
  var DestructuringTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $DestructuringTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
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
          return $__superCall(this, $__proto, "transformBinaryOperator", [tree]);
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
          return $__superCall(this, $__proto, "transformVariableDeclarationList", [tree]);
        }
        this.pushTempVarState();
        var desugaredDeclarations = [];
        tree.declarations.forEach((function(declaration) {
          if (declaration.lvalue.isPattern()) {
            ($__26 = desugaredDeclarations).push.apply($__26, $__toObject(this.desugarVariableDeclaration_(declaration)));
          } else {
            desugaredDeclarations.push(declaration);
          }
        }).bind(this));
        var transformedTree = this.transformVariableDeclarationList(createVariableDeclarationList(tree.declarationType, desugaredDeclarations));
        this.popTempVarState();
        return transformedTree;
      },
      transformForInStatement: function(tree) {
        return this.transformForInOrOf_(tree, $__superGet(this, $__proto, "transformForInStatement"), ForInStatement);
      },
      transformForOfStatement: function(tree) {
        return this.transformForInOrOf_(tree, $__superGet(this, $__proto, "transformForOfStatement"), ForOfStatement);
      },
      transformForInOrOf_: function(tree, superMethod, constr) {
        if (!tree.initializer.isPattern() && (tree.initializer.type !== VARIABLE_DECLARATION_LIST || !this.destructuringInDeclaration_(tree.initializer))) {
          return superMethod.call(this, tree);
        }
        this.pushTempVarState();
        var declarationType, lvalue;
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
        ($__27 = statements).push.apply($__27, $__toObject(body.statements));
        body = createBlock(statements);
        this.popTempVarState();
        return new constr(tree.location, initializer, collection, body);
      },
      transformFunctionDeclaration: function(tree) {
        return this.transformFunction_(tree, FunctionDeclaration);
      },
      transformFunctionExpression: function(tree) {
        return this.transformFunction_(tree, FunctionExpression);
      },
      transformFunction_: function(tree, constructor) {
        stack.push([]);
        var transformedTree = constructor === FunctionExpression ? $__superCall(this, $__proto, "transformFunctionExpression", [tree]): $__superCall(this, $__proto, "transformFunctionDeclaration", [tree]);
        var statements = stack.pop();
        if (!statements.length) return transformedTree;
        statements = prependStatements.apply(null, $__spread([transformedTree.functionBody.statements], statements));
        return new constructor(transformedTree.location, transformedTree.name, transformedTree.isGenerator, transformedTree.formalParameterList, createBlock(statements));
      },
      transformSetAccessor: function(tree) {
        stack.push([]);
        var transformedTree = $__superCall(this, $__proto, "transformSetAccessor", [tree]);
        var statements = stack.pop();
        if (!statements.length) return transformedTree;
        ($__28 = statements).push.apply($__28, $__toObject(transformedTree.body.statements));
        return new SetAccessor(transformedTree.location, transformedTree.isStatic, transformedTree.name, transformedTree.parameter, createBlock(statements));
      },
      transformBindingElement: function(tree) {
        if (!tree.binding.isPattern() || tree.initializer) return tree;
        var statements = stack[stack.length - 1];
        var binding = this.desugarBinding_(tree.binding, statements, VAR);
        return new BindingElement(null, binding, null);
      },
      transformCatch: function(tree) {
        if (!tree.binding.isPattern()) return $__superCall(this, $__proto, "transformCatch", [tree]);
        var body = this.transformAny(tree.catchBody);
        var statements = [];
        var kind = options.blockBinding ? LET: VAR;
        var binding = this.desugarBinding_(tree.binding, statements, kind);
        ($__29 = statements).push.apply($__29, $__toObject(body.statements));
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
                    lookup = createConditionalMemberExpression(desugaring.rvalue, field.binding.identifierToken, field.initializer);
                    desugaring.assign(createIdentifierExpression(field.binding), lookup);
                    break;
                  case OBJECT_PATTERN_FIELD:
                    if (field.element.initializer) initializerFound = true;
                    lookup = createConditionalMemberExpression(desugaring.rvalue, field.identifier, field.element.initializer);
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
      }}, $__proto, $__super, false);
    return $DestructuringTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {DestructuringTransformer: {
      get: function() {
        return DestructuringTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ForOfTransformer_js = (function() {
  "use strict";
  var $__3 = Object.freeze(Object.defineProperties(["\n      {\n        var ", " = ", ".getIterator(", ");\n        try {\n          while (true) {\n            ", ";\n            ", "; // statement\n          }\n        } catch(e) {\n          if (!", ".isStopIteration(e))\n            throw e;\n        }\n      }"], {raw: {value: Object.freeze(["\n      {\n        var ", " = ", ".getIterator(", ");\n        try {\n          while (true) {\n            ", ";\n            ", "; // statement\n          }\n        } catch(e) {\n          if (!", ".isStopIteration(e))\n            throw e;\n        }\n      }"])}}));
  var $__19 = $___src_syntax_PredefinedName_js, CLOSE = $__19.CLOSE, CURRENT = $__19.CURRENT, GET_ITERATOR = $__19.GET_ITERATOR, MOVE_NEXT = $__19.MOVE_NEXT, RUNTIME = $__19.RUNTIME, TRACEUR_RUNTIME = $__19.TRACEUR_RUNTIME;
  var VARIABLE_DECLARATION_LIST = $___src_syntax_trees_ParseTreeType_js.VARIABLE_DECLARATION_LIST;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var VAR = $___src_syntax_TokenType_js.VAR;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__19.createArgumentList, createAssignmentExpression = $__19.createAssignmentExpression, createBlock = $__19.createBlock, createCallExpression = $__19.createCallExpression, createCallStatement = $__19.createCallStatement, createExpressionStatement = $__19.createExpressionStatement, createFinally = $__19.createFinally, createIfStatement = $__19.createIfStatement, createIdentifierExpression = $__19.createIdentifierExpression, createMemberExpression = $__19.createMemberExpression, createTryStatement = $__19.createTryStatement, createVariableStatement = $__19.createVariableStatement, createWhileStatement = $__19.createWhileStatement;
  var parseStatement = $___src_codegeneration_PlaceholderParser_js.parseStatement;
  var ForOfTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ForOfTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformForOfStatement: function(original) {
        var tree = $__superCall(this, $__proto, "transformForOfStatement", [original]);
        var iter = createIdentifierExpression(this.getTempIdentifier());
        var assignment;
        if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
          assignment = createVariableStatement(tree.initializer.declarationType, tree.initializer.declarations[0].lvalue, createCallExpression(createMemberExpression(iter, 'next')));
        } else {
          assignment = createExpressionStatement(createAssignmentExpression(tree.initializer, createCallExpression(createMemberExpression(iter, 'next'))));
        }
        var id = createIdentifierExpression;
        return parseStatement($__3, iter, id(TRACEUR_RUNTIME), tree.collection, assignment, tree.body, id(TRACEUR_RUNTIME));
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new ForOfTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, false);
    return $ForOfTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {ForOfTransformer: {
      get: function() {
        return ForOfTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_FreeVariableChecker_js = (function() {
  "use strict";
  var ARGUMENTS = $___src_syntax_PredefinedName_js.ARGUMENTS;
  var $__19 = $___src_syntax_trees_ParseTrees_js, BindingIdentifier = $__19.BindingIdentifier, IdentifierExpression = $__19.IdentifierExpression;
  var IdentifierToken = $___src_syntax_IdentifierToken_js.IdentifierToken;
  var IDENTIFIER_EXPRESSION = $___src_syntax_trees_ParseTreeType_js.IDENTIFIER_EXPRESSION;
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var TYPEOF = $___src_syntax_TokenType_js.TYPEOF;
  var global = this;
  var Scope = function() {
    'use strict';
    var $Scope = ($__createClassNoExtends)({constructor: function(parent) {
        this.parent = parent;
        this.references = Object.create(null);
        this.declarations = Object.create(null);
      }}, {});
    return $Scope;
  }();
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
  var FreeVariableChecker = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FreeVariableChecker = ($__createClass)({
      constructor: function(reporter) {
        $__superCall(this, $__proto, "constructor", []);
        this.reporter_ = reporter;
        this.scope_ = null;
        this.disableChecksLevel_ = 0;
      },
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
      visitProgram: function(tree, global) {
        var scope = this.pushScope_();
        var object = global;
        while (object) {
          Object.getOwnPropertyNames(object).forEach(this.declareVariable_, this);
          object = Object.getPrototypeOf(object);
        }
        this.visitList(tree.programElements);
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
        $__superCall(this, $__proto, "visitGetAccessor", [tree]);
        this.pop_(scope);
      },
      visitSetAccessor: function(tree) {
        var scope = this.pushScope_();
        $__superCall(this, $__proto, "visitSetAccessor", [tree]);
        this.pop_(scope);
      },
      visitCatch: function(tree) {
        var scope = this.pushScope_();
        $__superCall(this, $__proto, "visitCatch", [tree]);
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
          $__superCall(this, $__proto, "visitUnaryExpression", [tree]);
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
            ($__30 = this).reportError_.apply($__30, $__toObject(e));
          }).bind(this));
        }
      },
      reportError_: function() {
        for (var args = [], $__15 = 0; $__15 < arguments.length; $__15++) args[$__15] = arguments[$__15];
        ($__31 = this.reporter_).reportError.apply($__31, $__toObject(args));
      }
    }, {checkProgram: function(reporter, tree) {
        new FreeVariableChecker(reporter).visitProgram(tree, global);
      }}, $__proto, $__super, true);
    return $FreeVariableChecker;
  }(ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {FreeVariableChecker: {
      get: function() {
        return FreeVariableChecker;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_GeneratorComprehensionTransformer_js = (function() {
  "use strict";
  var ComprehensionTransformer = $___src_codegeneration_ComprehensionTransformer_js.ComprehensionTransformer;
  var createYieldStatement = $___src_codegeneration_ParseTreeFactory_js.createYieldStatement;
  var GeneratorComprehensionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $GeneratorComprehensionTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformGeneratorComprehension: function(tree) {
        var expression = this.transformAny(tree.expression);
        var statement = createYieldStatement(expression);
        var isGenerator = true;
        return this.transformComprehension(tree, statement, isGenerator);
      }
    }, {}, $__proto, $__super, false);
    return $GeneratorComprehensionTransformer;
  }(ComprehensionTransformer);
  GeneratorComprehensionTransformer.transformTree = function(identifierGenerator, tree) {
    return new GeneratorComprehensionTransformer(identifierGenerator).transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {GeneratorComprehensionTransformer: {
      get: function() {
        return GeneratorComprehensionTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_State_js = (function() {
  "use strict";
  var FINALLY_FALL_THROUGH = $___src_syntax_PredefinedName_js.FINALLY_FALL_THROUGH;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createAssignStateStatement = $__19.createAssignStateStatement, createAssignmentStatement = $__19.createAssignmentStatement, createBreakStatement = $__19.createBreakStatement, createCaseClause = $__19.createCaseClause, createIdentifierExpression = $__19.createIdentifierExpression, createNumberLiteral = $__19.createNumberLiteral, createStatementList = $__19.createStatementList;
  var State = function() {
    'use strict';
    var $State = ($__createClassNoExtends)({
      constructor: function(id) {
        this.id = id;
      },
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
    return $State;
  }();
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
}).call(this);
var $___src_codegeneration_generator_FallThroughState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var FallThroughState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FallThroughState = ($__createClass)({
      constructor: function(id, fallThroughState, statements) {
        $__superCall(this, $__proto, "constructor", [id]);
        this.fallThroughState = fallThroughState;
        this.statements = statements;
      },
      replaceState: function(oldState, newState) {
        return new FallThroughState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.statements);
      },
      transform: function(enclosingFinally, machineEndState, reporter) {
        return $__spread(this.statements, State.generateJump(enclosingFinally, this.fallThroughState));
      }
    }, {}, $__proto, $__super, true);
    return $FallThroughState;
  }(State);
  return Object.preventExtensions(Object.create(null, {FallThroughState: {
      get: function() {
        return FallThroughState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_BreakState_js = (function() {
  "use strict";
  var FallThroughState = $___src_codegeneration_generator_FallThroughState_js.FallThroughState;
  var State = $___src_codegeneration_generator_State_js.State;
  var createStatementList = $___src_codegeneration_ParseTreeFactory_js.createStatementList;
  var BreakState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BreakState = ($__createClass)({
      constructor: function(id, label) {
        $__superCall(this, $__proto, "constructor", [id]);
        this.label = label;
      },
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
    }, {}, $__proto, $__super, true);
    return $BreakState;
  }(State);
  return Object.preventExtensions(Object.create(null, {BreakState: {
      get: function() {
        return BreakState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_ContinueState_js = (function() {
  "use strict";
  var FallThroughState = $___src_codegeneration_generator_FallThroughState_js.FallThroughState;
  var State = $___src_codegeneration_generator_State_js.State;
  var createStatementList = $___src_codegeneration_ParseTreeFactory_js.createStatementList;
  var ContinueState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ContinueState = ($__createClass)({
      constructor: function(id, label) {
        $__superCall(this, $__proto, "constructor", [id]);
        this.label = label;
      },
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
    }, {}, $__proto, $__super, true);
    return $ContinueState;
  }(State);
  return Object.preventExtensions(Object.create(null, {ContinueState: {
      get: function() {
        return ContinueState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_TryState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var Kind = {
    CATCH: 'catch',
    FINALLY: 'finally'
  };
  var TryState = function() {
    'use strict';
    var $TryState = ($__createClassNoExtends)({
      constructor: function(kind, tryStates, nestedTrys) {
        this.kind = kind;
        this.tryStates = tryStates;
        this.nestedTrys = nestedTrys;
      },
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
    return $TryState;
  }();
  TryState.Kind = Kind;
  return Object.preventExtensions(Object.create(null, {TryState: {
      get: function() {
        return TryState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_trees_StateMachine_js = (function() {
  "use strict";
  var ParseTree = $___src_syntax_trees_ParseTree_js.ParseTree;
  var STATE_MACHINE = $___src_syntax_trees_ParseTreeType_js.STATE_MACHINE;
  var TryState = $___src_codegeneration_generator_TryState_js.TryState;
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
  var StateMachine = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $StateMachine = ($__createClass)({
      constructor: function(startState, fallThroughState, states, exceptionBlocks) {
        this.location = null;
        this.startState = startState;
        this.fallThroughState = fallThroughState;
        this.states = states;
        this.exceptionBlocks = exceptionBlocks;
      },
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
    }, {}, $__proto, $__super, true);
    return $StateMachine;
  }(ParseTree);
  return Object.preventExtensions(Object.create(null, {StateMachine: {
      get: function() {
        return StateMachine;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_BreakContinueTransformer_js = (function() {
  "use strict";
  var BreakState = $___src_codegeneration_generator_BreakState_js.BreakState;
  var ContinueState = $___src_codegeneration_generator_ContinueState_js.ContinueState;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var StateMachine = $___src_syntax_trees_StateMachine_js.StateMachine;
  function safeGetLabel(tree) {
    return tree.name ? tree.name.value: null;
  }
  var BreakContinueTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $BreakContinueTransformer = ($__createClass)({
      constructor: function(stateAllocator) {
        $__superCall(this, $__proto, "constructor", []);
        this.transformBreaks_ = true;
        this.stateAllocator_ = stateAllocator;
      },
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
        var result = $__superCall(this, $__proto, "transformSwitchStatement", [tree]);
        this.transformBreaks_ = oldState;
        return result;
      },
      transformWhileStatement: function(tree) {
        return tree;
      }
    }, {}, $__proto, $__super, true);
    return $BreakContinueTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {BreakContinueTransformer: {
      get: function() {
        return BreakContinueTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_CatchState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var TryState = $___src_codegeneration_generator_TryState_js.TryState;
  var CatchState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CatchState = ($__createClass)({
      constructor: function(identifier, catchState, fallThroughState, allStates, nestedTrys) {
        $__superCall(this, $__proto, "constructor", [TryState.Kind.CATCH, allStates, nestedTrys]);
        this.identifier = identifier;
        this.catchState = catchState;
        this.fallThroughState = fallThroughState;
      },
      replaceState: function(oldState, newState) {
        return new CatchState(this.identifier, State.replaceStateId(this.catchState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
      }
    }, {}, $__proto, $__super, true);
    return $CatchState;
  }(TryState);
  return Object.preventExtensions(Object.create(null, {CatchState: {
      get: function() {
        return CatchState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_ConditionalState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createBlock = $__19.createBlock, createIfStatement = $__19.createIfStatement;
  var ConditionalState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ConditionalState = ($__createClass)({
      constructor: function(id, ifState, elseState, condition) {
        $__superCall(this, $__proto, "constructor", [id]);
        this.ifState = ifState;
        this.elseState = elseState;
        this.condition = condition;
      },
      replaceState: function(oldState, newState) {
        return new ConditionalState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.ifState, oldState, newState), State.replaceStateId(this.elseState, oldState, newState), this.condition);
      },
      transform: function(enclosingFinally, machineEndState, reporter) {
        return [createIfStatement(this.condition, createBlock(State.generateJump(enclosingFinally, this.ifState)), createBlock(State.generateJump(enclosingFinally, this.elseState)))];
      }
    }, {}, $__proto, $__super, true);
    return $ConditionalState;
  }(State);
  return Object.preventExtensions(Object.create(null, {ConditionalState: {
      get: function() {
        return ConditionalState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_FinallyFallThroughState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var FinallyFallThroughState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FinallyFallThroughState = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      replaceState: function(oldState, newState) {
        return new FinallyFallThroughState(State.replaceStateId(this.id, oldState, newState));
      },
      transformMachineState: function(enclosingFinally, machineEndState, reporter) {
        return null;
      },
      transform: function(enclosingFinally, machineEndState, reporter) {
        throw new Error('these are generated in addFinallyFallThroughDispatches');
      }
    }, {}, $__proto, $__super, false);
    return $FinallyFallThroughState;
  }(State);
  return Object.preventExtensions(Object.create(null, {FinallyFallThroughState: {
      get: function() {
        return FinallyFallThroughState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_FinallyState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var TryState = $___src_codegeneration_generator_TryState_js.TryState;
  var FinallyState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $FinallyState = ($__createClass)({
      constructor: function(finallyState, fallThroughState, allStates, nestedTrys) {
        $__superCall(this, $__proto, "constructor", [TryState.Kind.FINALLY, allStates, nestedTrys]);
        this.finallyState = finallyState;
        this.fallThroughState = fallThroughState;
      },
      replaceState: function(oldState, newState) {
        return new FinallyState(State.replaceStateId(this.finallyState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState));
      }
    }, {}, $__proto, $__super, true);
    return $FinallyState;
  }(TryState);
  return Object.preventExtensions(Object.create(null, {FinallyState: {
      get: function() {
        return FinallyState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_StateAllocator_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var StateAllocator = function() {
    'use strict';
    var $StateAllocator = ($__createClassNoExtends)({
      constructor: function() {
        this.nextState_ = State.INVALID_STATE + 1;
      },
      allocateState: function() {
        return this.nextState_++;
      }
    }, {});
    return $StateAllocator;
  }();
  return Object.preventExtensions(Object.create(null, {StateAllocator: {
      get: function() {
        return StateAllocator;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_SwitchState_js = (function() {
  "use strict";
  var $__19 = $___src_syntax_trees_ParseTrees_js, CaseClause = $__19.CaseClause, DefaultClause = $__19.DefaultClause, SwitchStatement = $__19.SwitchStatement;
  var State = $___src_codegeneration_generator_State_js.State;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createBreakStatement = $__19.createBreakStatement, createStatementList = $__19.createStatementList;
  var SwitchClause = function() {
    'use strict';
    var $SwitchClause = ($__createClassNoExtends)({constructor: function(first, second) {
        this.first = first;
        this.second = second;
      }}, {});
    return $SwitchClause;
  }();
  var SwitchState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SwitchState = ($__createClass)({
      constructor: function(id, expression, clauses) {
        $__superCall(this, $__proto, "constructor", [id]);
        this.expression = expression;
        this.clauses = clauses;
      },
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
    }, {}, $__proto, $__super, true);
    return $SwitchState;
  }(State);
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
}).call(this);
var $___src_codegeneration_generator_CPSTransformer_js = (function() {
  "use strict";
  var $__3 = Object.freeze(Object.defineProperties(["\n        return this.innerFunction($yieldSent, $yieldAction);"], {raw: {value: Object.freeze(["\n        return this.innerFunction($yieldSent, $yieldAction);"])}}));
  var BreakContinueTransformer = $___src_codegeneration_generator_BreakContinueTransformer_js.BreakContinueTransformer;
  var $__19 = $___src_syntax_trees_ParseTreeType_js, CASE_CLAUSE = $__19.CASE_CLAUSE, STATE_MACHINE = $__19.STATE_MACHINE, VARIABLE_DECLARATION_LIST = $__19.VARIABLE_DECLARATION_LIST, VARIABLE_STATEMENT = $__19.VARIABLE_STATEMENT;
  var $__19 = $___src_syntax_trees_ParseTrees_js, CaseClause = $__19.CaseClause, IdentifierExpression = $__19.IdentifierExpression, SwitchStatement = $__19.SwitchStatement;
  var CatchState = $___src_codegeneration_generator_CatchState_js.CatchState;
  var ConditionalState = $___src_codegeneration_generator_ConditionalState_js.ConditionalState;
  var FallThroughState = $___src_codegeneration_generator_FallThroughState_js.FallThroughState;
  var FinallyFallThroughState = $___src_codegeneration_generator_FinallyFallThroughState_js.FinallyFallThroughState;
  var FinallyState = $___src_codegeneration_generator_FinallyState_js.FinallyState;
  var IdentifierToken = $___src_syntax_IdentifierToken_js.IdentifierToken;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var parseStatement = $___src_codegeneration_PlaceholderParser_js.parseStatement;
  var $__19 = $___src_syntax_PredefinedName_js, $ARGUMENTS = $__19.$ARGUMENTS, $THAT = $__19.$THAT, ARGUMENTS = $__19.ARGUMENTS, CAUGHT_EXCEPTION = $__19.CAUGHT_EXCEPTION, FINALLY_FALL_THROUGH = $__19.FINALLY_FALL_THROUGH, INNER_FUNCTION = $__19.INNER_FUNCTION, STATE = $__19.STATE, STORED_EXCEPTION = $__19.STORED_EXCEPTION, YIELD_ACTION = $__19.YIELD_ACTION, YIELD_SENT = $__19.YIELD_SENT;
  var State = $___src_codegeneration_generator_State_js.State;
  var StateAllocator = $___src_codegeneration_generator_StateAllocator_js.StateAllocator;
  var StateMachine = $___src_syntax_trees_StateMachine_js.StateMachine;
  var $__19 = $___src_codegeneration_generator_SwitchState_js, SwitchClause = $__19.SwitchClause, SwitchState = $__19.SwitchState;
  var $__19 = $___src_syntax_TokenType_js, PLUS = $__19.PLUS, VAR = $__19.VAR;
  var TryState = $___src_codegeneration_generator_TryState_js.TryState;
  var $__19 = $___src_codegeneration_ParseTreeFactory_js, createAssignStateStatement = $__19.createAssignStateStatement, createAssignmentExpression = $__19.createAssignmentExpression, createAssignmentStatement = $__19.createAssignmentStatement, createBinaryOperator = $__19.createBinaryOperator, createBindingIdentifier = $__19.createBindingIdentifier, createBlock = $__19.createBlock, createBreakStatement = $__19.createBreakStatement, createCaseClause = $__19.createCaseClause, createCatch = $__19.createCatch, createCommaExpression = $__19.createCommaExpression, createDefaultClause = $__19.createDefaultClause, createEmptyStatement = $__19.createEmptyStatement, createExpressionStatement = $__19.createExpressionStatement, createFunctionExpression = $__19.createFunctionExpression, createIdentifierExpression = $__19.createIdentifierExpression, createNumberLiteral = $__19.createNumberLiteral, createOperatorToken = $__19.createOperatorToken, createParameterList = $__19.createParameterList, createStatementList = $__19.createStatementList, createStringLiteral = $__19.createStringLiteral, createSwitchStatement = $__19.createSwitchStatement, createThisExpression = $__19.createThisExpression, createThrowStatement = $__19.createThrowStatement, createTrueLiteral = $__19.createTrueLiteral, createTryStatement = $__19.createTryStatement, createVariableStatement = $__19.createVariableStatement, createWhileStatement = $__19.createWhileStatement;
  var variablesInBlock = $___src_semantics_VariableBinder_js.variablesInBlock;
  var CPSTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CPSTransformer = ($__createClass)({
      constructor: function(reporter) {
        $__superCall(this, $__proto, "constructor", []);
        this.reporter = reporter;
        this.stateAllocator_ = new StateAllocator();
        this.labelSet_ = Object.create(null);
      },
      allocateState: function() {
        return this.stateAllocator_.allocateState();
      },
      transformBlock: function(tree) {
        this.clearLabels_();
        var transformedTree = $__superCall(this, $__proto, "transformBlock", [tree]);
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
        traceur.assert(statements instanceof SwitchStatement);
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
        var result = $__superCall(this, $__proto, "transformCaseClause", [tree]);
        var machine = this.transformStatementList_(result.statements);
        return machine == null ? result: new CaseClause(null, result.expression, createStatementList(machine));
      },
      transformDoWhileStatement: function(tree) {
        var labels = this.clearLabels_();
        var result = $__superCall(this, $__proto, "transformDoWhileStatement", [tree]);
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
        var result = $__superCall(this, $__proto, "transformForStatement", [tree]);
        if (result.body.type != STATE_MACHINE) {
          return result;
        }
        var loopBodyMachine = result.body;
        var incrementState = loopBodyMachine.fallThroughState;
        var conditionState = result.increment == null && result.condition != null ? incrementState: this.allocateState();
        var startState = result.initializer == null ? conditionState: this.allocateState();
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
        this.clearLabels_();
        var result = $__superCall(this, $__proto, "transformIfStatement", [tree]);
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
        ($__32 = states).push.apply($__32, $__toObject(ifClause.states));
        ($__33 = exceptionBlocks).push.apply($__33, $__toObject(ifClause.exceptionBlocks));
        if (elseClause != null) {
          this.replaceAndAddStates_(elseClause.states, elseClause.fallThroughState, fallThroughState, states);
          ($__34 = exceptionBlocks).push.apply($__34, $__toObject(State.replaceAllStates(elseClause.exceptionBlocks, elseClause.fallThroughState, fallThroughState)));
        }
        return new StateMachine(startState, fallThroughState, states, exceptionBlocks);
      },
      removeEmptyStates: function(oldStates) {
        var emptyStates = [], newStates = [];
        for (var i = 0; i < oldStates.length; i++) {
          if (oldStates[i]instanceof FallThroughState && oldStates[i].statements.length === 0) {
            emptyStates.push(oldStates[i]);
          } else {
            newStates.push(oldStates[i]);
          }
        }
        for (i = 0; i < newStates.length; i++) {
          newStates[i] = emptyStates.reduce((function(state, $__19) {
            var id = $__19.id, fallThroughState = $__19.fallThroughState;
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
        var result = $__superCall(this, $__proto, "transformSwitchStatement", [tree]);
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
        var machine = this.ensureTransformedList_(statements);
        for (var i = 0; i < machine.states.length; i++) {
          var state = machine.states[i];
          var transformedState = state.transformBreak(labels, fallThroughState);
          states.push(transformedState.replaceState(machine.fallThroughState, nextState));
        }
        ($__35 = tryStates).push.apply($__35, $__toObject(machine.exceptionBlocks));
        return machine.startState;
      },
      transformTryStatement: function(tree) {
        this.clearLabels_();
        var result = $__superCall(this, $__proto, "transformTryStatement", [tree]);
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
        return $__superCall(this, $__proto, "transformVariableDeclarationList", [tree]);
      },
      transformWhileStatement: function(tree) {
        var labels = this.clearLabels_();
        var result = $__superCall(this, $__proto, "transformWhileStatement", [tree]);
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
        var result = $__superCall(this, $__proto, "transformWithStatement", [tree]);
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
        return createFunctionExpression(createParameterList(YIELD_SENT, YIELD_ACTION), createBlock(createWhileStatement(createTrueLiteral(), this.generateMachine(machine))));
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
        return createFunctionExpression(createParameterList(YIELD_SENT, YIELD_ACTION), createBlock(body));
      },
      generateMachine: function(machine) {
        var enclosingFinallyState = machine.getEnclosingFinallyMap();
        var enclosingCatchState = machine.getEnclosingCatchMap();
        var body = parseStatement($__3);
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
        cases.push(createDefaultClause([createThrowStatement(createBinaryOperator(createStringLiteral('traceur compiler bug: invalid state in state machine'), createOperatorToken(PLUS), createIdentifierExpression(STATE)))]));
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
    }, {}, $__proto, $__super, true);
    return $CPSTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {CPSTransformer: {
      get: function() {
        return CPSTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_EndState_js = (function() {
  "use strict";
  var State = $___src_codegeneration_generator_State_js.State;
  var EndState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $EndState = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      replaceState: function(oldState, newState) {
        return new EndState(State.replaceStateId(this.id, oldState, newState));
      },
      transform: function(enclosingFinally, machineEndState, reporter) {
        return State.generateJump(enclosingFinally, machineEndState);
      }
    }, {}, $__proto, $__super, false);
    return $EndState;
  }(State);
  return Object.preventExtensions(Object.create(null, {EndState: {
      get: function() {
        return EndState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_AsyncTransformer_js = (function() {
  "use strict";
  var $__3 = Object.freeze(Object.defineProperties(["\n        var ", " = {\n          GState: 0,\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "], {raw: {value: Object.freeze(["\n        var ", " = {\n          GState: 0,\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "])}})), $__0 = Object.freeze(Object.defineProperties(["\n        var ", " = ", ".moveNext.bind(", ");"], {raw: {value: Object.freeze(["\n        var ", " = ", ".moveNext.bind(", ");"])}}));
  var CPSTransformer = $___src_codegeneration_generator_CPSTransformer_js.CPSTransformer;
  var EndState = $___src_codegeneration_generator_EndState_js.EndState;
  var FallThroughState = $___src_codegeneration_generator_FallThroughState_js.FallThroughState;
  var $__20 = $___src_syntax_PredefinedName_js, $VALUE = $__20.$VALUE, CALLBACK = $__20.CALLBACK, CONTINUATION = $__20.CONTINUATION, CREATE_CALLBACK = $__20.CREATE_CALLBACK, CREATE_ERRBACK = $__20.CREATE_ERRBACK, CREATE_PROMISE = $__20.CREATE_PROMISE, DEFERRED = $__20.DEFERRED, ERR = $__20.ERR, ERRBACK = $__20.ERRBACK, NEW_STATE = $__20.NEW_STATE, RESULT = $__20.RESULT, STATE = $__20.STATE, STORED_EXCEPTION = $__20.STORED_EXCEPTION, THEN = $__20.THEN, WAIT_TASK = $__20.WAIT_TASK;
  var STATE_MACHINE = $___src_syntax_trees_ParseTreeType_js.STATE_MACHINE;
  var parseStatement = $___src_codegeneration_PlaceholderParser_js.parseStatement;
  var StateMachine = $___src_syntax_trees_StateMachine_js.StateMachine;
  var VAR = $___src_syntax_TokenType_js.VAR;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__20.createArgumentList, createAssignStateStatement = $__20.createAssignStateStatement, createAssignmentStatement = $__20.createAssignmentStatement, createBlock = $__20.createBlock, createBreakStatement = $__20.createBreakStatement, createCallExpression = $__20.createCallExpression, createCallStatement = $__20.createCallStatement, createEmptyArgumentList = $__20.createEmptyArgumentList, createFunctionExpression = $__20.createFunctionExpression, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createNewExpression = $__20.createNewExpression, createNumberLiteral = $__20.createNumberLiteral, createParameterList = $__20.createParameterList, createParameterReference = $__20.createParameterReference, createReturnStatement = $__20.createReturnStatement, createStatementList = $__20.createStatementList, createThrowStatement = $__20.createThrowStatement, createUndefinedExpression = $__20.createUndefinedExpression, createVariableStatement = $__20.createVariableStatement;
  var AsyncTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AsyncTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
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
        states.push(new FallThroughState(createTaskState, callbackState, createStatementList(createAssignmentStatement(createIdentifierExpression(WAIT_TASK), tree.expression), createCallStatement(createMemberExpression(WAIT_TASK, THEN), createArgumentList(createCallExpression(createIdentifierExpression(CREATE_CALLBACK), createArgumentList(createNumberLiteral(callbackState))), createCallExpression(createIdentifierExpression(CREATE_ERRBACK), createArgumentList(createNumberLiteral(errbackState))))), createReturnStatement(null))));
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
        var result = $__superCall(this, $__proto, "transformFinally", [tree]);
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
        var transformedTree = this.transformAny(tree);
        if (this.reporter.hadError()) {
          return tree;
        }
        var machine = transformedTree;
        var statements = [];
        statements.push(this.generateHoistedThis());
        ($__36 = statements).push.apply($__36, $__toObject(this.getMachineVariables(tree, machine)));
        statements.push(createVariableStatement(VAR, $VALUE, null));
        statements.push(createVariableStatement(VAR, ERR, null));
        statements.push(createVariableStatement(VAR, RESULT, createNewExpression(createIdentifierExpression(DEFERRED), createEmptyArgumentList())));
        statements.push(createVariableStatement(VAR, WAIT_TASK, null));
        var id = createIdentifierExpression;
        var G = '$G';
        statements.push(parseStatement($__3, G, this.generateMachineInnerFunction(machine), this.generateMachineMethod(machine)));
        statements.push(parseStatement($__0, id(CONTINUATION), id(G), id(G)));
        statements.push(createVariableStatement(VAR, CREATE_CALLBACK, createFunctionExpression(createParameterList(NEW_STATE), createBlock(createReturnStatement(createFunctionExpression(createParameterList(1), createBlock(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(NEW_STATE)), createAssignmentStatement(createIdentifierExpression($VALUE), createParameterReference(0)), createCallStatement(createIdentifierExpression(CONTINUATION)))))))));
        statements.push(createVariableStatement(VAR, CREATE_ERRBACK, createFunctionExpression(createParameterList(NEW_STATE), createBlock(createReturnStatement(createFunctionExpression(createParameterList(1), createBlock(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(NEW_STATE)), createAssignmentStatement(createIdentifierExpression(ERR), createParameterReference(0)), createCallStatement(createIdentifierExpression(CONTINUATION)))))))));
        statements.push(createCallStatement(createIdentifierExpression(CONTINUATION)));
        statements.push(createReturnStatement(createCallExpression(createMemberExpression(RESULT, CREATE_PROMISE))));
        return createBlock(statements);
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
    }, {}, $__proto, $__super, false);
    return $AsyncTransformer;
  }(CPSTransformer);
  AsyncTransformer.transformAsyncBody = function(reporter, body) {
    return new AsyncTransformer(reporter).transformAsyncBody(body);
  };
  return Object.preventExtensions(Object.create(null, {AsyncTransformer: {
      get: function() {
        return AsyncTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_ForInTransformPass_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_trees_ParseTreeType_js, BLOCK = $__20.BLOCK, VARIABLE_DECLARATION_LIST = $__20.VARIABLE_DECLARATION_LIST, IDENTIFIER_EXPRESSION = $__20.IDENTIFIER_EXPRESSION;
  var $__20 = $___src_syntax_PredefinedName_js, LENGTH = $__20.LENGTH, PUSH = $__20.PUSH;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__20 = $___src_syntax_TokenType_js, BANG = $__20.BANG, IN = $__20.IN, OPEN_ANGLE = $__20.OPEN_ANGLE, PLUS_PLUS = $__20.PLUS_PLUS, VAR = $__20.VAR;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__20.createArgumentList, createAssignmentStatement = $__20.createAssignmentStatement, createBinaryOperator = $__20.createBinaryOperator, createBlock = $__20.createBlock, createCallStatement = $__20.createCallStatement, createContinueStatement = $__20.createContinueStatement, createEmptyArrayLiteralExpression = $__20.createEmptyArrayLiteralExpression, createForInStatement = $__20.createForInStatement, createForStatement = $__20.createForStatement, createIdentifierExpression = $__20.createIdentifierExpression, createIfStatement = $__20.createIfStatement, createMemberExpression = $__20.createMemberExpression, createMemberLookupExpression = $__20.createMemberLookupExpression, createNumberLiteral = $__20.createNumberLiteral, createOperatorToken = $__20.createOperatorToken, createParenExpression = $__20.createParenExpression, createPostfixExpression = $__20.createPostfixExpression, createUnaryExpression = $__20.createUnaryExpression, createVariableDeclarationList = $__20.createVariableDeclarationList, createVariableStatement = $__20.createVariableStatement;
  var ForInTransformPass = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ForInTransformPass = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformForInStatement: function(original) {
        var tree = original;
        var bodyStatements = [];
        var body = this.transformAny(tree.body);
        if (body.type == BLOCK) {
          ($__37 = bodyStatements).push.apply($__37, $__toObject(body.statements));
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
        var originalKey, assignOriginalKey;
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
        ($__38 = innerBlock).push.apply($__38, $__toObject(bodyStatements));
        elements.push(createForStatement(createVariableDeclarationList(VAR, i, createNumberLiteral(0)), createBinaryOperator(createIdentifierExpression(i), createOperatorToken(OPEN_ANGLE), createMemberExpression(keys, LENGTH)), createPostfixExpression(createIdentifierExpression(i), createOperatorToken(PLUS_PLUS)), createBlock(innerBlock)));
        return createBlock(elements);
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new ForInTransformPass(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, false);
    return $ForInTransformPass;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {ForInTransformPass: {
      get: function() {
        return ForInTransformPass;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_YieldState_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_PredefinedName_js, CURRENT = $__20.CURRENT, RESULT = $__20.RESULT;
  var State = $___src_codegeneration_generator_State_js.State;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentStatement = $__20.createAssignmentStatement, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createReturnStatement = $__20.createReturnStatement, createThisExpression = $__20.createThisExpression, createTrueLiteral = $__20.createTrueLiteral;
  var YieldState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $YieldState = ($__createClass)({
      constructor: function(id, fallThroughState, expression) {
        $__superCall(this, $__proto, "constructor", [id]);
        this.fallThroughState = fallThroughState;
        this.expression = expression;
      },
      replaceState: function(oldState, newState) {
        return new this.constructor(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.expression);
      },
      transform: function(enclosingFinally, machineEndState, reporter) {
        return $__spread([createAssignmentStatement(createMemberExpression(createThisExpression(), CURRENT), this.expression)], State.generateAssignState(enclosingFinally, this.fallThroughState), [createReturnStatement(createTrueLiteral())]);
      }
    }, {}, $__proto, $__super, true);
    return $YieldState;
  }(State);
  return Object.preventExtensions(Object.create(null, {YieldState: {
      get: function() {
        return YieldState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_ReturnState_js = (function() {
  "use strict";
  var $__20 = $___src_semantics_util_js, isUndefined = $__20.isUndefined, isVoidExpression = $__20.isVoidExpression;
  var $__20 = $___src_syntax_PredefinedName_js, CURRENT = $__20.CURRENT, RESULT = $__20.RESULT, UNDEFINED = $__20.UNDEFINED, YIELD_RETURN = $__20.YIELD_RETURN;
  var IDENTIFIER_EXPRESSION = $___src_syntax_trees_ParseTreeType_js.IDENTIFIER_EXPRESSION;
  var YieldState = $___src_codegeneration_generator_YieldState_js.YieldState;
  var State = $___src_codegeneration_generator_State_js.State;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentStatement = $__20.createAssignmentStatement, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createReturnStatement = $__20.createReturnStatement, createThisExpression = $__20.createThisExpression, createTrueLiteral = $__20.createTrueLiteral;
  var ReturnState = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ReturnState = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transform: function(enclosingFinally, machineEndState, reporter) {
        var e = this.expression;
        if (e && !isUndefined(e) && !isVoidExpression(e)) {
          return $__spread([createAssignmentStatement(createMemberExpression(createThisExpression(), YIELD_RETURN), this.expression)], State.generateJump(enclosingFinally, machineEndState));
        } else {
          return State.generateJump(enclosingFinally, machineEndState);
        }
      }
    }, {}, $__proto, $__super, false);
    return $ReturnState;
  }(YieldState);
  return Object.preventExtensions(Object.create(null, {ReturnState: {
      get: function() {
        return ReturnState;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_generator_GeneratorTransformer_js = (function() {
  "use strict";
  var $__0 = Object.freeze(Object.defineProperties(["\n        var ", " = {\n          GState: ", ",\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "], {raw: {value: Object.freeze(["\n        var ", " = {\n          GState: ", ",\n          current: undefined,\n          yieldReturn: undefined,\n          innerFunction: ", ",\n          moveNext: ", "\n        };\n        "])}})), $__3 = Object.freeze(Object.defineProperties(["return ", "(", ");"], {raw: {value: Object.freeze(["return ", "(", ");"])}}));
  var CPSTransformer = $___src_codegeneration_generator_CPSTransformer_js.CPSTransformer;
  var EndState = $___src_codegeneration_generator_EndState_js.EndState;
  var $__20 = $___src_syntax_PredefinedName_js, ACTION_SEND = $__20.ACTION_SEND, ACTION_THROW = $__20.ACTION_THROW, ACTION_CLOSE = $__20.ACTION_CLOSE, ADD_ITERATOR = $__20.ADD_ITERATOR, CURRENT = $__20.CURRENT, MOVE_NEXT = $__20.MOVE_NEXT, RESULT = $__20.RESULT, RUNTIME = $__20.RUNTIME, STORED_EXCEPTION = $__20.STORED_EXCEPTION, TRACEUR_RUNTIME = $__20.TRACEUR_RUNTIME, YIELD_RETURN = $__20.YIELD_RETURN;
  var $__20 = $___src_syntax_trees_ParseTreeType_js, STATE_MACHINE = $__20.STATE_MACHINE, YIELD_EXPRESSION = $__20.YIELD_EXPRESSION;
  var parseStatement = $___src_codegeneration_PlaceholderParser_js.parseStatement;
  var StateMachine = $___src_syntax_trees_StateMachine_js.StateMachine;
  var VAR = $___src_syntax_TokenType_js.VAR;
  var YieldState = $___src_codegeneration_generator_YieldState_js.YieldState;
  var ReturnState = $___src_codegeneration_generator_ReturnState_js.ReturnState;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createAssignStateStatement = $__20.createAssignStateStatement, createAssignmentStatement = $__20.createAssignmentStatement, createBlock = $__20.createBlock, createExpressionStatement = $__20.createExpressionStatement, createFalseLiteral = $__20.createFalseLiteral, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createNumberLiteral = $__20.createNumberLiteral, createObjectLiteralExpression = $__20.createObjectLiteralExpression, createPropertyNameAssignment = $__20.createPropertyNameAssignment, createReturnStatement = $__20.createReturnStatement, createStatementList = $__20.createStatementList, createThisExpression = $__20.createThisExpression, createThrowStatement = $__20.createThrowStatement, createUndefinedExpression = $__20.createUndefinedExpression, createVariableStatement = $__20.createVariableStatement;
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var GSTATE = 'GState';
  var GeneratorTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $GeneratorTransformer = ($__createClass)({
      constructor: function(runtimeInliner, reporter) {
        $__superCall(this, $__proto, "constructor", [reporter]);
        this.runtimeInliner_ = runtimeInliner;
      },
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
        return $__superCall(this, $__proto, "transformExpressionStatement", [tree]);
      },
      transformAwaitStatement: function(tree) {
        this.reporter.reportError(tree.location.start, 'Generator function may not have an async statement.');
        return tree;
      },
      transformFinally: function(tree) {
        var result = $__superCall(this, $__proto, "transformFinally", [tree]);
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
        ($__39 = statements).push.apply($__39, $__toObject(this.getMachineVariables(tree, machine)));
        statements.push(parseStatement($__0, G, ST_NEWBORN, this.generateMachineInnerFunction(machine), this.generateMachineMethod(machine)));
        var generatorWrap = this.runtimeInliner_.get('generatorWrap', ("\n        function (generator) {\n          return " + TRACEUR_RUNTIME + ".addIterator({\n            send: function(x) {\n              switch (generator.GState) {\n                case " + ST_EXECUTING + ":\n                  throw new Error('\"send\" on executing generator');\n                case " + ST_CLOSED + ":\n                  throw new Error('\"send\" on closed generator');\n                case " + ST_NEWBORN + ":\n                  if (x !== undefined) {\n                    throw new TypeError('Sent value to newborn generator');\n                  }\n                  // fall through\n                case " + ST_SUSPENDED + ":\n                  generator.GState = " + ST_EXECUTING + ";\n                  if (generator.moveNext(x, " + ACTION_SEND + ")) {\n                    generator.GState = " + ST_SUSPENDED + ";\n                    return generator.current;\n                  }\n                  generator.GState = " + ST_CLOSED + ";\n                  if (generator.yieldReturn !== undefined) {\n                    throw new " + TRACEUR_RUNTIME + ".\n                        GeneratorReturn(generator.yieldReturn);\n                  }\n                  throw " + TRACEUR_RUNTIME + ".StopIteration;\n              }\n            },\n\n            next: function() {\n              return this.send(undefined);\n            },\n\n            'throw': function(x) {\n              switch (generator.GState) {\n                case " + ST_EXECUTING + ":\n                  throw new Error('\"throw\" on executing generator');\n                case " + ST_CLOSED + ":\n                  throw new Error('\"throw\" on closed generator');\n                case " + ST_NEWBORN + ":\n                  generator.GState = " + ST_CLOSED + ";\n                  throw x;\n                case " + ST_SUSPENDED + ":\n                  generator.GState = " + ST_EXECUTING + ";\n                  if (generator.moveNext(x, " + ACTION_THROW + ")) {\n                    generator.GState = " + ST_SUSPENDED + ";\n                    return generator." + CURRENT + ";\n                  }\n                  generator.GState = " + ST_CLOSED + ";\n                  if (generator.yieldReturn !== undefined) {\n                    throw new " + TRACEUR_RUNTIME + ".\n                        GeneratorReturn(generator.yieldReturn);\n                  }\n                  throw " + TRACEUR_RUNTIME + ".StopIteration;\n              }\n            },\n\n            close: function() {\n              switch (generator.GState) {\n                case " + ST_EXECUTING + ":\n                  throw new Error('\"close\" on executing generator');\n                case " + ST_CLOSED + ":\n                  return;\n                case " + ST_NEWBORN + ":\n                  generator.GState = " + ST_CLOSED + ";\n                  return;\n                case " + ST_SUSPENDED + ":\n                  generator.GState = " + ST_EXECUTING + ";\n                  generator.moveNext(undefined, " + ACTION_CLOSE + ");\n                  generator.GState = " + ST_CLOSED + ";\n              }\n            }\n          });\n        }"));
        var id = createIdentifierExpression;
        statements.push(parseStatement($__3, generatorWrap, id(G)));
        return createBlock(statements);
      },
      machineUncaughtExceptionStatements: function(rethrowState, machineEndState) {
        return createStatementList(createAssignmentStatement(createMemberExpression(createThisExpression(), GSTATE), createNumberLiteral(ST_CLOSED)), createAssignStateStatement(machineEndState), createThrowStatement(createIdentifierExpression(STORED_EXCEPTION)));
      },
      machineRethrowStatements: function(machineEndState) {
        return createStatementList(createThrowStatement(createIdentifierExpression(STORED_EXCEPTION)));
      },
      machineFallThroughStatements: function(machineEndState) {
        return createStatementList(createAssignStateStatement(machineEndState));
      },
      machineEndStatements: function() {
        return [createReturnStatement(createFalseLiteral())];
      }
    }, {transformGeneratorBody: function(runtimeInliner, reporter, body) {
        return new GeneratorTransformer(runtimeInliner, reporter).transformGeneratorBody(body);
      }}, $__proto, $__super, true);
    return $GeneratorTransformer;
  }(CPSTransformer);
  ;
  return Object.preventExtensions(Object.create(null, {GeneratorTransformer: {
      get: function() {
        return GeneratorTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_GeneratorTransformPass_js = (function() {
  "use strict";
  var $__3 = Object.freeze(Object.defineProperties(["\n          switch (", ") {\n            case ", ":\n              ", " = ", ";\n              throw ", ";\n            case ", ":\n              return;\n          }"], {raw: {value: Object.freeze(["\n          switch (", ") {\n            case ", ":\n              ", " = ", ";\n              throw ", ";\n            case ", ":\n              return;\n          }"])}})), $__0 = Object.freeze(Object.defineProperties(["\n        {\n          var ", " = ", ".getIterator(", ");\n          var ", ";\n          // Use duck-type testing to also identify native generator objects.\n          // TODO: Reduce false positives.\n          var ", " = ", ".send;\n\n          // TODO: Should 'yield *' handle non-generator iterators? A strict\n          // interpretation of harmony:generators would indicate 'no', but\n          // 'yes' seems makes more sense from a language-user's perspective.\n\n          // received = void 0;\n          ", " = void 0;\n          // send = true; // roughly equivalent\n          ", " = ", ";\n          try {\n            while (true) {\n              switch (", ") {\n                case ", ":\n                  if (", ")\n                    ", " = ", ".send(", ");\n                  else\n                    ", " = ", ".next();\n                  break;\n                case ", ":\n                  ", " = ", ";\n                  if (", ")\n                    ", " = ", ".throw(", ");\n                  else\n                    throw ", ";\n                  break;\n                case ", ":\n                  // TODO: Another deviation from harmony:generators. This line\n                  // is needed if we want any given generator function G to be\n                  // identical in behavior to GG when 'close' is used.\n                  //   function* GG() { yield* G(); }\n                  if (", ")\n                    ", ".close();\n                  return;\n              }\n              ", ";\n            }\n          } catch(e) {\n            if (!", ".isStopIteration(e))\n              throw e;\n            // result = e.value;\n            ", " = e.value;\n          } finally {\n            try {\n              ", ".close();\n            } catch(e) {}\n          }\n        }"], {raw: {value: Object.freeze(["\n        {\n          var ", " = ", ".getIterator(", ");\n          var ", ";\n          // Use duck-type testing to also identify native generator objects.\n          // TODO: Reduce false positives.\n          var ", " = ", ".send;\n\n          // TODO: Should 'yield *' handle non-generator iterators? A strict\n          // interpretation of harmony:generators would indicate 'no', but\n          // 'yes' seems makes more sense from a language-user's perspective.\n\n          // received = void 0;\n          ", " = void 0;\n          // send = true; // roughly equivalent\n          ", " = ", ";\n          try {\n            while (true) {\n              switch (", ") {\n                case ", ":\n                  if (", ")\n                    ", " = ", ".send(", ");\n                  else\n                    ", " = ", ".next();\n                  break;\n                case ", ":\n                  ", " = ", ";\n                  if (", ")\n                    ", " = ", ".throw(", ");\n                  else\n                    throw ", ";\n                  break;\n                case ", ":\n                  // TODO: Another deviation from harmony:generators. This line\n                  // is needed if we want any given generator function G to be\n                  // identical in behavior to GG when 'close' is used.\n                  //   function* GG() { yield* G(); }\n                  if (", ")\n                    ", ".close();\n                  return;\n              }\n              ", ";\n            }\n          } catch(e) {\n            if (!", ".isStopIteration(e))\n              throw e;\n            // result = e.value;\n            ", " = e.value;\n          } finally {\n            try {\n              ", ".close();\n            } catch(e) {}\n          }\n        }"])}}));
  var AsyncTransformer = $___src_codegeneration_generator_AsyncTransformer_js.AsyncTransformer;
  var ForInTransformPass = $___src_codegeneration_generator_ForInTransformPass_js.ForInTransformPass;
  var ForOfTransformer = $___src_codegeneration_ForOfTransformer_js.ForOfTransformer;
  var $__20 = $___src_syntax_trees_ParseTrees_js, GetAccessor = $__20.GetAccessor, SetAccessor = $__20.SetAccessor;
  var GeneratorTransformer = $___src_codegeneration_generator_GeneratorTransformer_js.GeneratorTransformer;
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var parseStatement = $___src_codegeneration_PlaceholderParser_js.parseStatement;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__20 = $___src_syntax_TokenType_js, EQUAL = $__20.EQUAL, VAR = $__20.VAR;
  var $__20 = $___src_syntax_trees_ParseTreeType_js, BINARY_OPERATOR = $__20.BINARY_OPERATOR, COMMA_EXPRESSION = $__20.COMMA_EXPRESSION, IDENTIFIER_EXPRESSION = $__20.IDENTIFIER_EXPRESSION, PAREN_EXPRESSION = $__20.PAREN_EXPRESSION, YIELD_EXPRESSION = $__20.YIELD_EXPRESSION;
  var $__20 = $___src_syntax_trees_ParseTrees_js, FunctionDeclaration = $__20.FunctionDeclaration, FunctionExpression = $__20.FunctionExpression;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__20.createAssignmentExpression, createAssignmentStatement = $__20.createAssignmentStatement, createBlock = $__20.createBlock, createCommaExpression = $__20.createCommaExpression, createExpressionStatement = $__20.createExpressionStatement, createForOfStatement = $__20.createForOfStatement, createIdentifierExpression = $__20.createIdentifierExpression, createVariableDeclaration = $__20.createVariableDeclaration, createVariableDeclarationList = $__20.createVariableDeclarationList, createVariableStatement = $__20.createVariableStatement, createYieldStatement = $__20.createYieldStatement;
  var $__20 = $___src_syntax_PredefinedName_js, ACTION_SEND = $__20.ACTION_SEND, ACTION_THROW = $__20.ACTION_THROW, ACTION_CLOSE = $__20.ACTION_CLOSE, TRACEUR_RUNTIME = $__20.TRACEUR_RUNTIME, YIELD_ACTION = $__20.YIELD_ACTION, YIELD_SENT = $__20.YIELD_SENT;
  var $__20 = $___src_options_js, transformOptions = $__20.transformOptions, options = $__20.options;
  function isYieldAssign(tree) {
    return tree.operator.type === EQUAL && tree.right.type === YIELD_EXPRESSION && tree.left.isLeftHandSideExpression();
  }
  var id = createIdentifierExpression;
  var YieldFinder = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $YieldFinder = ($__createClass)({
      constructor: function(tree) {
        this.hasYield = false;
        this.hasYieldFor = false;
        this.hasForIn = false;
        this.hasAsync = false;
        this.visitAny(tree);
      },
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
        $__superCall(this, $__proto, "visitForInStatement", [tree]);
      },
      visitFunctionDeclaration: function(tree) {},
      visitFunctionExpression: function(tree) {},
      visitSetAccessor: function(tree) {},
      visitGetAccessor: function(tree) {}
    }, {}, $__proto, $__super, true);
    return $YieldFinder;
  }(ParseTreeVisitor);
  var throwClose;
  var YieldExpressionTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $YieldExpressionTransformer = ($__createClass)({
      constructor: function(identifierGenerator) {
        $__superCall(this, $__proto, "constructor", [identifierGenerator]);
        if (!throwClose) {
          throwClose = parseStatement($__3, id(YIELD_ACTION), ACTION_THROW, id(YIELD_ACTION), ACTION_SEND, id(YIELD_SENT), ACTION_CLOSE);
        }
      },
      transformExpressionStatement: function(tree) {
        var e = tree.expression, ex;
        while (e.type === PAREN_EXPRESSION) {
          e = e.expression;
        }
        function commaWrap(lhs, rhs) {
          return createExpressionStatement(createCommaExpression($__spread([createAssignmentExpression(lhs, rhs)], ex.slice(1))));
        }
        switch (e.type) {
          case BINARY_OPERATOR:
            if (isYieldAssign(e)) return this.factor_(e.left, e.right, createAssignmentStatement);
            break;
          case COMMA_EXPRESSION:
            ex = e.expressions;
            if (ex[0].type === BINARY_OPERATOR && isYieldAssign(ex[0])) return this.factor_(ex[0].left, ex[0].right, commaWrap);
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
        if (isYieldVarAssign(tdd[0])) return this.factor_(tdd[0].lvalue, tdd[0].initializer, varWrap);
        return tree;
      },
      factor_: function(lhs, rhs, wrap) {
        if (rhs.isYieldFor) return createBlock(this.transformYieldForExpression_(rhs), wrap(lhs, id(YIELD_SENT)));
        return createBlock([createExpressionStatement(rhs), throwClose, wrap(lhs, id(YIELD_SENT))]);
      },
      transformYieldForExpression_: function(tree) {
        var g = id(this.getTempIdentifier());
        var next = id(this.getTempIdentifier());
        var isGeneratorObject = id(this.getTempIdentifier());
        return parseStatement($__0, g, id(TRACEUR_RUNTIME), tree.expression, next, isGeneratorObject, g, id(YIELD_SENT), id(YIELD_ACTION), ACTION_SEND, id(YIELD_ACTION), ACTION_SEND, isGeneratorObject, next, g, id(YIELD_SENT), next, g, ACTION_THROW, id(YIELD_ACTION), ACTION_SEND, isGeneratorObject, next, g, id(YIELD_SENT), id(YIELD_SENT), ACTION_CLOSE, isGeneratorObject, g, createYieldStatement(next), id(TRACEUR_RUNTIME), id(YIELD_SENT), g);
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new YieldExpressionTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, true);
    return $YieldExpressionTransformer;
  }(TempVarTransformer);
  var GeneratorTransformPass = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $GeneratorTransformPass = ($__createClass)({
      constructor: function(identifierGenerator, runtimeInliner, reporter) {
        $__superCall(this, $__proto, "constructor", [identifierGenerator]);
        this.runtimeInliner_ = runtimeInliner;
        this.reporter_ = reporter;
      },
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
        var body = $__superCall(this, $__proto, "transformBlock", [tree]);
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
      }}, $__proto, $__super, true);
    return $GeneratorTransformPass;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {GeneratorTransformPass: {
      get: function() {
        return GeneratorTransformPass;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ModuleTransformer_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_trees_ParseTrees_js, BindingElement = $__20.BindingElement, BindingIdentifier = $__20.BindingIdentifier, LiteralExpression = $__20.LiteralExpression, ObjectPattern = $__20.ObjectPattern, ObjectPatternField = $__20.ObjectPatternField, Program = $__20.Program;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__20 = $___src_syntax_PredefinedName_js, GET_MODULE_INSTANCE_BY_URL = $__20.GET_MODULE_INSTANCE_BY_URL, TRACEUR_MODULES = $__20.TRACEUR_MODULES;
  var $__20 = $___src_syntax_trees_ParseTreeType_js, CLASS_DECLARATION = $__20.CLASS_DECLARATION, EXPORT_DECLARATION = $__20.EXPORT_DECLARATION, EXPORT_MAPPING_LIST = $__20.EXPORT_MAPPING_LIST, EXPORT_SPECIFIER = $__20.EXPORT_SPECIFIER, EXPORT_STAR = $__20.EXPORT_STAR, FUNCTION_DECLARATION = $__20.FUNCTION_DECLARATION, IDENTIFIER_EXPRESSION = $__20.IDENTIFIER_EXPRESSION, IMPORT_DECLARATION = $__20.IMPORT_DECLARATION, MODULE_DECLARATION = $__20.MODULE_DECLARATION, MODULE_DEFINITION = $__20.MODULE_DEFINITION, MODULE_REQUIRE = $__20.MODULE_REQUIRE, VARIABLE_STATEMENT = $__20.VARIABLE_STATEMENT;
  var $__20 = $___src_syntax_TokenType_js, STAR = $__20.STAR, VAR = $__20.VAR;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__20.createArgumentList, createBindingIdentifier = $__20.createBindingIdentifier, createBlock = $__20.createBlock, createCallExpression = $__20.createCallExpression, createEmptyParameterList = $__20.createEmptyParameterList, createExpressionStatement = $__20.createExpressionStatement, createFunctionExpression = $__20.createFunctionExpression, createIdentifierExpression = $__20.createIdentifierExpression, createIdentifierToken = $__20.createIdentifierToken, createMemberExpression = $__20.createMemberExpression, createNullLiteral = $__20.createNullLiteral, createObjectCreate = $__20.createObjectCreate, createObjectLiteralExpression = $__20.createObjectLiteralExpression, createObjectPreventExtensions = $__20.createObjectPreventExtensions, createProgram = $__20.createProgram, createPropertyDescriptor = $__20.createPropertyDescriptor, createPropertyNameAssignment = $__20.createPropertyNameAssignment, createReturnStatement = $__20.createReturnStatement, createScopedExpression = $__20.createScopedExpression, createUseStrictDirective = $__20.createUseStrictDirective, createVariableDeclaration = $__20.createVariableDeclaration, createVariableDeclarationList = $__20.createVariableDeclarationList, createVariableStatement = $__20.createVariableStatement;
  var hasUseStrict = $___src_semantics_util_js.hasUseStrict;
  function toBindingIdentifier(tree) {
    return new BindingIdentifier(tree.location, tree.identifierToken);
  }
  function getGetterExport(project, symbol) {
    var name = symbol.name;
    var tree = symbol.tree;
    var returnExpression;
    switch (tree.type) {
      case EXPORT_SPECIFIER:
        returnExpression = transformSpecifier(project, tree.lhs, symbol.relatedTree);
        break;
      case EXPORT_STAR:
        traceur.assert(symbol.relatedTree);
        returnExpression = transformSpecifier(project, createIdentifierToken(symbol.name), symbol.relatedTree);
        break;
      case IDENTIFIER_EXPRESSION:
        if (!symbol.relatedTree) {
          returnExpression = tree;
        } else {
          returnExpression = transformSpecifier(project, tree.identifierToken, symbol.relatedTree);
        }
        break;
      default:
        returnExpression = createIdentifierExpression(name);
        break;
    }
    var fun = createFunctionExpression(createEmptyParameterList(), createBlock(createReturnStatement(returnExpression)));
    var descriptor = createPropertyDescriptor({
      get: fun,
      enumerable: true
    });
    return createPropertyNameAssignment(name, descriptor);
  }
  function transformSpecifier(project, identifierToken, moduleExpression) {
    if (moduleExpression) {
      var operand = new ModuleTransformer(project).transformAny(moduleExpression);
      return createMemberExpression(operand, identifierToken);
    }
    return createIdentifierExpression(identifierToken);
  }
  var ModuleTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleTransformer = ($__createClass)({
      constructor: function(project) {
        $__superCall(this, $__proto, "constructor", []);
        this.project_ = project;
      },
      transformModuleExpression: function(tree) {
        var reference = tree.reference;
        if (reference.type == MODULE_REQUIRE) {
          return createCallExpression(createMemberExpression(TRACEUR_MODULES, GET_MODULE_INSTANCE_BY_URL), createArgumentList(new LiteralExpression(null, reference.url)));
        }
        if (tree.identifiers.length == 0) return reference;
        return createMemberExpression(reference, tree.identifiers);
      },
      transformModuleSpecifier: function(tree) {
        var expression = this.transformAny(tree.expression);
        return createVariableDeclaration(tree.identifier, expression);
      },
      transformImportDeclaration: function(tree) {
        var declarations = this.transformList(tree.importPathList);
        return createVariableStatement(createVariableDeclarationList(VAR, declarations));
      },
      transformImportBinding: function(tree) {
        var importSpecifierSet;
        if (tree.importSpecifierSet.type == IDENTIFIER_EXPRESSION) {
          var field = new BindingElement(tree.location, createBindingIdentifier(tree.importSpecifierSet.identifierToken), null);
          importSpecifierSet = new ObjectPattern(tree.location, [field]);
        } else {
          importSpecifierSet = this.transformAny(tree.importSpecifierSet);
        }
        var moduleExpression = this.transformAny(tree.moduleExpression);
        return createVariableDeclaration(importSpecifierSet, moduleExpression);
      },
      transformImportSpecifierSet: function(tree) {
        var fields;
        if (tree.specifiers.type === STAR) {
          var module = this.project_.getModuleForStarTree(tree);
          var fields = module.getExports().map((function(exportSymbol) {
            return new BindingElement(tree.location, createBindingIdentifier(exportSymbol.name), null);
          }));
        } else {
          fields = this.transformList(tree.specifiers);
        }
        return new ObjectPattern(null, fields);
      },
      transformImportSpecifier: function(tree) {
        if (tree.rhs) {
          var binding = new BindingIdentifier(tree.location, tree.rhs);
          var bindingElement = new BindingElement(tree.location, binding, null);
          return new ObjectPatternField(tree.location, tree.lhs, bindingElement);
        }
        return new BindingElement(tree.location, createBindingIdentifier(tree.lhs), null);
      }
    }, {}, $__proto, $__super, true);
    return $ModuleTransformer;
  }(ParseTreeTransformer);
  ModuleTransformer.transform = function(project, tree) {
    var module = project.getRootModule();
    var useStrictCount = hasUseStrict(tree.programElements) ? 1: 0;
    var elements = tree.programElements.map((function(element) {
      switch (element.type) {
        case MODULE_DEFINITION:
          return transformDefinition(project, module, element, useStrictCount);
        case MODULE_DECLARATION:
          return transformDeclaration(project, module, element);
        case IMPORT_DECLARATION:
          return new ModuleTransformer(project).transformAny(element);
        default:
          return element;
      }
    }));
    return new Program(tree.location, elements);
  };
  ModuleTransformer.transformAsModule = function(project, module, tree) {
    var callExpression = transformModuleElements(project, module, tree.programElements);
    return createProgram([createExpressionStatement(callExpression)]);
  };
  function transformModuleElements(project, module, elements, useStrictCount) {
    var statements = [];
    useStrictCount = useStrictCount || 0;
    if (!useStrictCount) statements.push(createUseStrictDirective());
    elements.forEach((function(element) {
      switch (element.type) {
        case MODULE_DECLARATION:
          statements.push(transformDeclaration(project, module, element));
          break;
        case MODULE_DEFINITION:
          statements.push(transformDefinition(project, module, element, useStrictCount + 1));
          break;
        case EXPORT_DECLARATION:
          var declaration = element.declaration;
          switch (declaration.type) {
            case MODULE_DEFINITION:
              statements.push(transformDefinition(project, module, declaration, useStrictCount + 1));
              break;
            case MODULE_DECLARATION:
              statements.push(transformDeclaration(project, module, declaration));
              break;
            case EXPORT_MAPPING_LIST:
              break;
            case CLASS_DECLARATION:
            case FUNCTION_DECLARATION:
            case VARIABLE_STATEMENT:
              statements.push(declaration);
              break;
            default:
              throw new Error('unreachable');
          }
          break;
        case IMPORT_DECLARATION:
          var transformer = new ModuleTransformer(project);
          statements.push(transformer.transformAny(element));
          break;
        default:
          statements.push(element);
      }
    }));
    var properties = module.getExports().map((function(exp) {
      return getGetterExport(project, exp);
    }));
    var descriptors = createObjectLiteralExpression(properties);
    statements.push(createReturnStatement(createObjectPreventExtensions(createObjectCreate(createNullLiteral(), descriptors))));
    return createScopedExpression(createBlock(statements));
  }
  function transformDefinition(project, parent, tree, useStrictCount) {
    var module = parent.getModule(tree.name.value);
    var callExpression = transformModuleElements(project, module, tree.elements, useStrictCount);
    return createVariableStatement(VAR, module.name, callExpression);
  }
  function transformDeclaration(project, parent, tree) {
    var transformer = new ModuleTransformer(project);
    var list = tree.specifiers.map(transformer.transformAny, transformer);
    var variableDeclarationList = createVariableDeclarationList(VAR, list);
    return createVariableStatement(variableDeclarationList);
  }
  return Object.preventExtensions(Object.create(null, {ModuleTransformer: {
      get: function() {
        return ModuleTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ObjectLiteralTransformer_js = (function() {
  "use strict";
  var FindVisitor = $___src_codegeneration_FindVisitor_js.FindVisitor;
  var $__20 = $___src_syntax_trees_ParseTrees_js, FormalParameterList = $__20.FormalParameterList, FunctionExpression = $__20.FunctionExpression, IdentifierExpression = $__20.IdentifierExpression, LiteralExpression = $__20.LiteralExpression;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__20 = $___src_syntax_TokenType_js, AT_NAME = $__20.AT_NAME, IDENTIFIER = $__20.IDENTIFIER, STRING = $__20.STRING;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__20.createAssignmentExpression, createCommaExpression = $__20.createCommaExpression, createDefineProperty = $__20.createDefineProperty, createEmptyParameterList = $__20.createEmptyParameterList, createFunctionExpression = $__20.createFunctionExpression, createIdentifierExpression = $__20.createIdentifierExpression, createObjectCreate = $__20.createObjectCreate, createObjectLiteralExpression = $__20.createObjectLiteralExpression, createParenExpression = $__20.createParenExpression, createPropertyNameAssignment = $__20.createPropertyNameAssignment, createStringLiteral = $__20.createStringLiteral;
  var transformOptions = $___src_options_js.transformOptions;
  function findAtNameInProperty(propertyName) {
    return function(tree) {
      if (transformOptions.privateNameSyntax && tree[propertyName].type === AT_NAME) {
        this.found = true;
      }
    };
  }
  var AtNameFinder = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $AtNameFinder = ($__createClass)({
      constructor: function(tree) {
        this.protoExpression = null;
        $__superCall(this, $__proto, "constructor", [tree, true]);
      },
      checkAtName_: function(tree) {
        if (transformOptions.privateNameSyntax && tree.name.type === AT_NAME) {
          return this.found = true;
        }
        return false;
      },
      visitPropertyNameAssignment: function(tree) {
        if (this.checkAtName_(tree)) return;
        if (getPropertyNameForToken(tree.name) === '__proto__') {
          this.protoExpression = tree.value;
        }
      },
      visitGetAccessor: function(tree) {
        this.checkAtName_(tree);
      },
      visitSetAccessor: function(tree) {
        this.checkAtName_(tree);
      },
      visitPropertyMethodAssignment: function(tree) {
        this.checkAtName_(tree);
      },
      visitPropertyNameShorthand: function(tree) {
        this.checkAtName_(tree);
      }
    }, {}, $__proto, $__super, true);
    return $AtNameFinder;
  }(FindVisitor);
  function getPropertyNameForToken(nameToken) {
    if (nameToken.type === STRING) return nameToken.processedValue;
    return nameToken.value;
  }
  var ObjectLiteralTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ObjectLiteralTransformer = ($__createClass)({
      constructor: function(identifierGenerator) {
        $__superCall(this, $__proto, "constructor", [identifierGenerator]);
        this.protoExpression = null;
        this.needsAtNameTransform = false;
        this.seenAccessors = null;
      },
      createProperty_: function(name, descr) {
        if (descr.get || descr.set) {
          var lookupName = getPropertyNameForToken(name);
          var oldAccessor = this.seenAccessors[lookupName];
          if (oldAccessor) {
            oldAccessor.get = descr.get || oldAccessor.get;
            oldAccessor.set = descr.set || oldAccessor.set;
            delete this.seenAccessors[lookupName];
            return null;
          } else {
            this.seenAccessors[lookupName] = descr;
          }
        }
        return [name, descr];
      },
      getPropertyName_: function(token) {
        switch (token.type) {
          case AT_NAME:
            return createIdentifierExpression(this.identifierGenerator.getUniqueIdentifier(token.value));
          case IDENTIFIER:
            return createStringLiteral(token.value);
          default:
            if (token.isKeyword()) return createStringLiteral(token.type);
            return new LiteralExpression(token.location, token);
        }
      },
      transformObjectLiteralExpression: function(tree) {
        var oldNeedsTransform = this.needsAtNameTransform;
        var oldSeenAccessors = this.seenAccessors;
        try {
          var finder = new AtNameFinder(tree);
          if (!finder.found) {
            this.needsAtNameTransform = false;
            return $__superCall(this, $__proto, "transformObjectLiteralExpression", [tree]);
          }
          this.needsAtNameTransform = true;
          this.seenAccessors = Object.create(null);
          var properties = this.transformList(tree.propertyNameAndValues);
          properties = properties.filter((function(tree) {
            return tree;
          }));
          var tempVar = this.addTempVar();
          var tempVarIdentifierExpression = createIdentifierExpression(tempVar);
          var expressions = properties.map((function(property) {
            var name = property[0];
            var descr = property[1];
            return createDefineProperty(tempVarIdentifierExpression, this.getPropertyName_(name), descr);
          }).bind(this));
          var protoExpression = this.transformAny(finder.protoExpression);
          var objectExpression;
          if (protoExpression) objectExpression = createObjectCreate(protoExpression); else objectExpression = createObjectLiteralExpression([]);
          expressions.unshift(createAssignmentExpression(tempVarIdentifierExpression, objectExpression));
          expressions.push(tempVarIdentifierExpression);
          return createParenExpression(createCommaExpression(expressions));
        } finally {
          this.needsAtNameTransform = oldNeedsTransform;
          this.seenAccessors = oldSeenAccessors;
        }
      },
      transformPropertyNameAssignment: function(tree) {
        if (!this.needsAtNameTransform) return $__superCall(this, $__proto, "transformPropertyNameAssignment", [tree]);
        if (getPropertyNameForToken(tree.name) === '__proto__') return null;
        return this.createProperty_(tree.name, {
          value: this.transformAny(tree.value),
          configurable: true,
          enumerable: true,
          writable: true
        });
      },
      transformGetAccessor: function(tree) {
        if (!this.needsAtNameTransform) return $__superCall(this, $__proto, "transformGetAccessor", [tree]);
        var body = this.transformAny(tree.body);
        var func = createFunctionExpression(createEmptyParameterList(), body);
        return this.createProperty_(tree.name, {
          get: func,
          configurable: true,
          enumerable: true
        });
      },
      transformSetAccessor: function(tree) {
        if (!this.needsAtNameTransform) return $__superCall(this, $__proto, "transformSetAccessor", [tree]);
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
        if (!this.needsAtNameTransform) {
          return createPropertyNameAssignment(tree.name, func);
        }
        return this.createProperty_(tree.name, {
          value: func,
          configurable: true,
          enumerable: true,
          writable: true
        });
      },
      transformPropertyNameShorthand: function(tree) {
        if (!this.needsAtNameTransform) return $__superCall(this, $__proto, "transformPropertyNameShorthand", [tree]);
        return this.createProperty_(tree.name, {
          value: new IdentifierExpression(tree.location, tree.name),
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new ObjectLiteralTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, true);
    return $ObjectLiteralTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {ObjectLiteralTransformer: {
      get: function() {
        return ObjectLiteralTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_util_ObjectMap_js = (function() {
  "use strict";
  var ObjectMap = function() {
    'use strict';
    var $ObjectMap = ($__createClassNoExtends)({
      constructor: function() {
        this.keys_ = Object.create(null);
        this.values_ = Object.create(null);
      },
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
    return $ObjectMap;
  }();
  return Object.preventExtensions(Object.create(null, {ObjectMap: {
      get: function() {
        return ObjectMap;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_outputgeneration_ParseTreeWriter_js = (function() {
  "use strict";
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var $__20 = $___src_syntax_PredefinedName_js, FROM = $__20.FROM, GET = $__20.GET, OF = $__20.OF, MODULE = $__20.MODULE, REQUIRES = $__20.REQUIRES, SET = $__20.SET;
  var Token = $___src_syntax_Token_js.Token;
  var getKeywordType = $___src_syntax_Keywords_js.getKeywordType;
  var $__20 = $___src_syntax_TokenType_js, AMPERSAND = $__20.AMPERSAND, AMPERSAND_EQUAL = $__20.AMPERSAND_EQUAL, AND = $__20.AND, ARROW = $__20.ARROW, AT_NAME = $__20.AT_NAME, AWAIT = $__20.AWAIT, BACK_QUOTE = $__20.BACK_QUOTE, BANG = $__20.BANG, BAR = $__20.BAR, BAR_EQUAL = $__20.BAR_EQUAL, BREAK = $__20.BREAK, CARET = $__20.CARET, CARET_EQUAL = $__20.CARET_EQUAL, CASE = $__20.CASE, CATCH = $__20.CATCH, CLASS = $__20.CLASS, CLOSE_ANGLE = $__20.CLOSE_ANGLE, CLOSE_CURLY = $__20.CLOSE_CURLY, CLOSE_PAREN = $__20.CLOSE_PAREN, CLOSE_SQUARE = $__20.CLOSE_SQUARE, COLON = $__20.COLON, COMMA = $__20.COMMA, CONST = $__20.CONST, CONTINUE = $__20.CONTINUE, DEBUGGER = $__20.DEBUGGER, DEFAULT = $__20.DEFAULT, DELETE = $__20.DELETE, DO = $__20.DO, DOLLAR = $__20.DOLLAR, DOT_DOT_DOT = $__20.DOT_DOT_DOT, ELSE = $__20.ELSE, END_OF_FILE = $__20.END_OF_FILE, ENUM = $__20.ENUM, EQUAL = $__20.EQUAL, EQUAL_EQUAL = $__20.EQUAL_EQUAL, EQUAL_EQUAL_EQUAL = $__20.EQUAL_EQUAL_EQUAL, ERROR = $__20.ERROR, EXPORT = $__20.EXPORT, EXTENDS = $__20.EXTENDS, FALSE = $__20.FALSE, FINALLY = $__20.FINALLY, FOR = $__20.FOR, FUNCTION = $__20.FUNCTION, GREATER_EQUAL = $__20.GREATER_EQUAL, IDENTIFIER = $__20.IDENTIFIER, IF = $__20.IF, IMPLEMENTS = $__20.IMPLEMENTS, IMPORT = $__20.IMPORT, IN = $__20.IN, INSTANCEOF = $__20.INSTANCEOF, INTERFACE = $__20.INTERFACE, LEFT_SHIFT = $__20.LEFT_SHIFT, LEFT_SHIFT_EQUAL = $__20.LEFT_SHIFT_EQUAL, LESS_EQUAL = $__20.LESS_EQUAL, LET = $__20.LET, MINUS = $__20.MINUS, MINUS_EQUAL = $__20.MINUS_EQUAL, MINUS_MINUS = $__20.MINUS_MINUS, NEW = $__20.NEW, NO_SUBSTITUTION_TEMPLATE = $__20.NO_SUBSTITUTION_TEMPLATE, NOT_EQUAL = $__20.NOT_EQUAL, NOT_EQUAL_EQUAL = $__20.NOT_EQUAL_EQUAL, NULL = $__20.NULL, NUMBER = $__20.NUMBER, OPEN_ANGLE = $__20.OPEN_ANGLE, OPEN_CURLY = $__20.OPEN_CURLY, OPEN_PAREN = $__20.OPEN_PAREN, OPEN_SQUARE = $__20.OPEN_SQUARE, OR = $__20.OR, PACKAGE = $__20.PACKAGE, PERCENT = $__20.PERCENT, PERCENT_EQUAL = $__20.PERCENT_EQUAL, PERIOD = $__20.PERIOD, PERIOD_OPEN_CURLY = $__20.PERIOD_OPEN_CURLY, PLUS = $__20.PLUS, PLUS_EQUAL = $__20.PLUS_EQUAL, PLUS_PLUS = $__20.PLUS_PLUS, PRIVATE = $__20.PRIVATE, PROTECTED = $__20.PROTECTED, PUBLIC = $__20.PUBLIC, QUESTION = $__20.QUESTION, REGULAR_EXPRESSION = $__20.REGULAR_EXPRESSION, RETURN = $__20.RETURN, RIGHT_SHIFT = $__20.RIGHT_SHIFT, RIGHT_SHIFT_EQUAL = $__20.RIGHT_SHIFT_EQUAL, SEMI_COLON = $__20.SEMI_COLON, SLASH = $__20.SLASH, SLASH_EQUAL = $__20.SLASH_EQUAL, STAR = $__20.STAR, STAR_EQUAL = $__20.STAR_EQUAL, STATIC = $__20.STATIC, STRING = $__20.STRING, SUPER = $__20.SUPER, SWITCH = $__20.SWITCH, TEMPLATE_HEAD = $__20.TEMPLATE_HEAD, TEMPLATE_MIDDLE = $__20.TEMPLATE_MIDDLE, TEMPLATE_TAIL = $__20.TEMPLATE_TAIL, THIS = $__20.THIS, THROW = $__20.THROW, TILDE = $__20.TILDE, TRUE = $__20.TRUE, TRY = $__20.TRY, TYPEOF = $__20.TYPEOF, UNSIGNED_RIGHT_SHIFT = $__20.UNSIGNED_RIGHT_SHIFT, UNSIGNED_RIGHT_SHIFT_EQUAL = $__20.UNSIGNED_RIGHT_SHIFT_EQUAL, VAR = $__20.VAR, VOID = $__20.VOID, WHILE = $__20.WHILE, WITH = $__20.WITH, YIELD = $__20.YIELD;
  var NEW_LINE = '\n';
  var PRETTY_PRINT = true;
  var ParseTreeWriter = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ParseTreeWriter = ($__createClass)({
      constructor: function(highlighted, showLineNumbers) {
        $__superCall(this, $__proto, "constructor", []);
        this.highlighted_ = highlighted;
        this.showLineNumbers_ = showLineNumbers;
        this.result_ = '';
        this.currentLine_ = '';
        this.currentLineComment_ = null;
        this.indentDepth_ = 0;
        this.lastToken_ = null;
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
        this.currentLocation = tree.location;
        $__superCall(this, $__proto, "visitAny", [tree]);
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
      visitAtNameExpression: function(tree) {
        this.write_(tree.atNameToken);
      },
      visitAtNameDeclaration: function(tree) {
        this.write_(tree.atNameToken);
        if (tree.initializer) {
          this.write_(EQUAL);
          this.visitAny(tree.initializer);
        }
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
        this.writelnList_(tree.expressions, SEMI_COLON, false);
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
      visitExportMappingList: function(tree) {
        this.writeList_(tree.paths, COMMA, false);
      },
      visitExportMapping: function(tree) {
        this.visitAny(tree.specifierSet);
        if (tree.moduleExpression) {
          this.write_(FROM);
          this.visitAny(tree.moduleExpression);
        }
      },
      visitExportSpecifier: function(tree) {
        this.write_(tree.lhs);
        if (tree.rhs) {
          this.write_(COLON);
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
        this.write_(tree.name);
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
        this.writeList_(tree.importPathList, COMMA, false);
        this.write_(SEMI_COLON);
      },
      visitImportBinding: function(tree) {
        this.visitAny(tree.importSpecifierSet);
        if (tree.moduleExpression) {
          this.write_(FROM);
          this.visitAny(tree.moduleExpression);
        }
      },
      visitImportSpecifier: function(tree) {
        this.write_(tree.lhs);
        if (tree.rhs !== null) {
          this.write_(COLON);
          this.write_(tree.rhs);
        }
      },
      visitImportSpecifierSet: function(tree) {
        if (tree.specifiers.type == STAR) {
          this.write_(STAR);
        } else {
          this.write_(OPEN_CURLY);
          this.writeList_(tree.specifiers, COMMA, FALSE);
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
      visitModuleDeclaration: function(tree) {
        this.write_(MODULE);
        this.writeList_(tree.specifiers, COMMA, false);
        this.write_(SEMI_COLON);
      },
      visitModuleDefinition: function(tree) {
        this.write_(MODULE);
        this.write_(tree.name);
        this.write_(OPEN_CURLY);
        this.writeln_();
        this.writeList_(tree.elements, null, true);
        this.write_(CLOSE_CURLY);
        this.writeln_();
      },
      visitModuleExpression: function(tree) {
        this.visitAny(tree.reference);
        for (var i = 0; i < tree.identifiers.length; i++) {
          this.write_(PERIOD);
          this.write_(tree.identifiers[i]);
        }
      },
      visitModuleRequire: function(tree) {
        this.write_(tree.url);
      },
      visitModuleSpecifier: function(tree) {
        this.write_(tree.identifier);
        this.write_(FROM);
        this.visitAny(tree.expression);
      },
      visitNameStatement: function(tree) {
        this.write_(PRIVATE);
        this.writeList_(tree.declarations, COMMA, false);
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
        this.write_(tree.identifier);
        if (tree.element !== null) {
          this.write_(COLON);
          this.visitAny(tree.element);
        }
      },
      visitParenExpression: function(tree) {
        this.write_(OPEN_PAREN);
        $__superCall(this, $__proto, "visitParenExpression", [tree]);
        this.write_(CLOSE_PAREN);
      },
      visitPostfixExpression: function(tree) {
        this.visitAny(tree.operand);
        this.write_(tree.operator);
      },
      visitPredefinedType: function(tree) {
        this.write_(tree.typeToken);
      },
      visitProgram: function(tree) {
        this.writelnList_(tree.programElements, null, true);
      },
      visitPropertyMethodAssignment: function(tree) {
        if (tree.isStatic) this.write_(STATIC);
        if (tree.isGenerator) this.write_(STAR);
        this.write_(tree.name);
        this.write_(OPEN_PAREN);
        this.visitAny(tree.formalParameterList);
        this.write_(CLOSE_PAREN);
        this.visitAny(tree.functionBody);
      },
      visitPropertyNameAssignment: function(tree) {
        this.write_(tree.name);
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
        this.writeRaw_(DOLLAR);
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
        this.write_(tree.name);
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
        this.writeList_(tree.declarations, COMMA, false);
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
        $__superCall(this, $__proto, "visitVariableStatement", [tree]);
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
              this.writeln_();
            }
          }
          this.visitAny(element);
        }
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
              for (var i = 0, indent = this.indentDepth_; i < indent; i++) {
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
          case FROM:
          case GET:
          case OF:
          case MODULE:
          case REQUIRES:
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
          case REQUIRES:
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
    }, {}, $__proto, $__super, true);
    return $ParseTreeWriter;
  }(ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {ParseTreeWriter: {
      get: function() {
        return ParseTreeWriter;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_outputgeneration_ParseTreeMapWriter_js = (function() {
  "use strict";
  var ParseTreeWriter = $___src_outputgeneration_ParseTreeWriter_js.ParseTreeWriter;
  var ParseTreeMapWriter = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ParseTreeMapWriter = ($__createClass)({
      constructor: function(highlighted, showLineNumbers, sourceMapGenerator) {
        $__superCall(this, $__proto, "constructor", [highlighted, showLineNumbers]);
        this.sourceMapGenerator_ = sourceMapGenerator;
        this.outputLineCount_ = 1;
      },
      write_: function(value) {
        if (this.currentLocation) {
          this.addMapping();
        }
        $__superCall(this, $__proto, "write_", [value]);
      },
      writeCurrentln_: function() {
        $__superCall(this, $__proto, "writeCurrentln_", []);
        this.outputLineCount_++;
      },
      addMapping: function() {
        var mapping = {
          generated: {
            line: this.outputLineCount_,
            column: this.currentLine_.length
          },
          original: {
            line: this.currentLocation.start.line + 1,
            column: this.currentLocation.start.column
          },
          source: this.currentLocation.start.source.name
        };
        this.sourceMapGenerator_.addMapping(mapping);
      }
    }, {}, $__proto, $__super, true);
    return $ParseTreeMapWriter;
  }(ParseTreeWriter);
  return Object.preventExtensions(Object.create(null, {ParseTreeMapWriter: {
      get: function() {
        return ParseTreeMapWriter;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_outputgeneration_TreeWriter_js = (function() {
  "use strict";
  var ParseTreeMapWriter = $___src_outputgeneration_ParseTreeMapWriter_js.ParseTreeMapWriter;
  var ParseTreeWriter = $___src_outputgeneration_ParseTreeWriter_js.ParseTreeWriter;
  var TreeWriter = function() {
    'use strict';
    var $TreeWriter = ($__createClassNoExtends)({constructor: function() {}}, {});
    return $TreeWriter;
  }();
  TreeWriter.write = function(tree) {
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
  };
  return Object.preventExtensions(Object.create(null, {TreeWriter: {
      get: function() {
        return TreeWriter;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_syntax_ParseTreeValidator_js = (function() {
  "use strict";
  var NewExpression = $___src_syntax_trees_ParseTrees_js.NewExpression;
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var TreeWriter = $___src_outputgeneration_TreeWriter_js.TreeWriter;
  var $__20 = $___src_syntax_TokenType_js, AMPERSAND = $__20.AMPERSAND, AMPERSAND_EQUAL = $__20.AMPERSAND_EQUAL, AND = $__20.AND, BAR = $__20.BAR, BAR_EQUAL = $__20.BAR_EQUAL, CARET = $__20.CARET, CARET_EQUAL = $__20.CARET_EQUAL, CLOSE_ANGLE = $__20.CLOSE_ANGLE, EQUAL = $__20.EQUAL, EQUAL_EQUAL = $__20.EQUAL_EQUAL, EQUAL_EQUAL_EQUAL = $__20.EQUAL_EQUAL_EQUAL, GREATER_EQUAL = $__20.GREATER_EQUAL, IN = $__20.IN, INSTANCEOF = $__20.INSTANCEOF, LEFT_SHIFT = $__20.LEFT_SHIFT, LEFT_SHIFT_EQUAL = $__20.LEFT_SHIFT_EQUAL, LESS_EQUAL = $__20.LESS_EQUAL, MINUS = $__20.MINUS, MINUS_EQUAL = $__20.MINUS_EQUAL, NOT_EQUAL = $__20.NOT_EQUAL, NOT_EQUAL_EQUAL = $__20.NOT_EQUAL_EQUAL, OPEN_ANGLE = $__20.OPEN_ANGLE, OR = $__20.OR, PERCENT = $__20.PERCENT, PERCENT_EQUAL = $__20.PERCENT_EQUAL, PLUS = $__20.PLUS, PLUS_EQUAL = $__20.PLUS_EQUAL, RIGHT_SHIFT = $__20.RIGHT_SHIFT, RIGHT_SHIFT_EQUAL = $__20.RIGHT_SHIFT_EQUAL, SLASH = $__20.SLASH, SLASH_EQUAL = $__20.SLASH_EQUAL, STAR = $__20.STAR, STAR_EQUAL = $__20.STAR_EQUAL, STRING = $__20.STRING, UNSIGNED_RIGHT_SHIFT = $__20.UNSIGNED_RIGHT_SHIFT, UNSIGNED_RIGHT_SHIFT_EQUAL = $__20.UNSIGNED_RIGHT_SHIFT_EQUAL;
  var $__20 = $___src_syntax_trees_ParseTreeType_js, ARRAY_PATTERN = $__20.ARRAY_PATTERN, BINDING_ELEMENT = $__20.BINDING_ELEMENT, BINDING_IDENTIFIER = $__20.BINDING_IDENTIFIER, BLOCK = $__20.BLOCK, CASE_CLAUSE = $__20.CASE_CLAUSE, CATCH = $__20.CATCH, CLASS_DECLARATION = $__20.CLASS_DECLARATION, DEFAULT_CLAUSE = $__20.DEFAULT_CLAUSE, EXPORT_DECLARATION = $__20.EXPORT_DECLARATION, EXPORT_MAPPING = $__20.EXPORT_MAPPING, EXPORT_MAPPING_LIST = $__20.EXPORT_MAPPING_LIST, EXPORT_SPECIFIER = $__20.EXPORT_SPECIFIER, EXPORT_SPECIFIER_SET = $__20.EXPORT_SPECIFIER_SET, EXPORT_STAR = $__20.EXPORT_STAR, FINALLY = $__20.FINALLY, FORMAL_PARAMETER_LIST = $__20.FORMAL_PARAMETER_LIST, FUNCTION_DECLARATION = $__20.FUNCTION_DECLARATION, GET_ACCESSOR = $__20.GET_ACCESSOR, IDENTIFIER_EXPRESSION = $__20.IDENTIFIER_EXPRESSION, IMPORT_DECLARATION = $__20.IMPORT_DECLARATION, MODULE_DECLARATION = $__20.MODULE_DECLARATION, MODULE_DEFINITION = $__20.MODULE_DEFINITION, MODULE_EXPRESSION = $__20.MODULE_EXPRESSION, MODULE_SPECIFIER = $__20.MODULE_SPECIFIER, OBJECT_PATTERN = $__20.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__20.OBJECT_PATTERN_FIELD, PROPERTY_METHOD_ASSIGNMENT = $__20.PROPERTY_METHOD_ASSIGNMENT, PROPERTY_NAME_ASSIGNMENT = $__20.PROPERTY_NAME_ASSIGNMENT, PROPERTY_NAME_SHORTHAND = $__20.PROPERTY_NAME_SHORTHAND, REST_PARAMETER = $__20.REST_PARAMETER, SET_ACCESSOR = $__20.SET_ACCESSOR, TEMPLATE_LITERAL_PORTION = $__20.TEMPLATE_LITERAL_PORTION, TEMPLATE_SUBSTITUTION = $__20.TEMPLATE_SUBSTITUTION, VARIABLE_DECLARATION_LIST = $__20.VARIABLE_DECLARATION_LIST, VARIABLE_STATEMENT = $__20.VARIABLE_STATEMENT;
  var ValidationError = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ValidationError = ($__createClass)({constructor: function(tree, message) {
        this.tree = tree;
        this.message = message;
      }}, {}, $__proto, $__super, true);
    return $ValidationError;
  }(Error);
  var ParseTreeValidator = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ParseTreeValidator = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
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
          this.checkVisit_(statement.isSourceElement(), statement, 'statement or function declaration expected');
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
        this.checkVisit_(declType == VARIABLE_STATEMENT || declType == FUNCTION_DECLARATION || declType == MODULE_DEFINITION || declType == MODULE_DECLARATION || declType == CLASS_DECLARATION || declType == EXPORT_MAPPING_LIST, tree.declaration, 'expected valid export tree');
      },
      visitExportMapping: function(tree) {
        if (tree.moduleExpression) {
          this.checkVisit_(tree.moduleExpression.type == MODULE_EXPRESSION, tree.moduleExpression, 'module expression expected');
        }
        var specifierType = tree.specifierSet.type;
        this.checkVisit_(specifierType == EXPORT_SPECIFIER_SET || specifierType == EXPORT_STAR || specifierType == IDENTIFIER_EXPRESSION, tree.specifierSet, 'specifier set or identifier expected');
      },
      visitExportMappingList: function(tree) {
        this.check_(tree.paths.length > 0, tree, 'expected at least one path');
        for (var i = 0; i < tree.paths.length; i++) {
          var path = tree.paths[i];
          var type = path.type;
          this.checkVisit_(type == EXPORT_MAPPING, path, 'expected export mapping');
        }
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
          this.checkVisit_(tree.condition.isExpression(), tree.increment, 'expression expected');
        }
        this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected');
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
        this.checkType_(BLOCK, tree.functionBody, 'block expected');
      },
      visitGetAccessor: function(tree) {
        this.checkType_(BLOCK, tree.body, 'block expected');
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
      visitModuleDeclaration: function(tree) {
        for (var i = 0; i < tree.specifiers.length; i++) {
          var specifier = tree.specifiers[i];
          this.checkType_(MODULE_SPECIFIER, specifier, 'module specifier expected');
        }
      },
      visitModuleDefinition: function(tree) {
        for (var i = 0; i < tree.elements.length; i++) {
          var element = tree.elements[i];
          this.checkVisit_((element.isStatement() && element.type !== BLOCK) || element.type === CLASS_DECLARATION || element.type === EXPORT_DECLARATION || element.type === IMPORT_DECLARATION || element.type === MODULE_DEFINITION || element.type === MODULE_DECLARATION, element, 'module element expected');
        }
      },
      visitModuleRequire: function(tree) {
        this.check_(tree.url.type == STRING, tree.url, 'string expected');
      },
      visitModuleSpecifier: function(tree) {
        this.checkType_(MODULE_EXPRESSION, tree.expression, 'module expression expected');
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
      visitProgram: function(tree) {
        for (var i = 0; i < tree.programElements.length; i++) {
          var programElement = tree.programElements[i];
          this.checkVisit_(programElement.isProgramElement(), programElement, 'global program element expected');
        }
      },
      visitPropertyNameAssignment: function(tree) {
        this.checkVisit_(tree.value.isArrowFunctionExpression(), tree.value, 'assignment expression expected');
      },
      visitPropertyNameShorthand: function(tree) {},
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
        this.checkType_(BLOCK, tree.body, 'block expected');
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
    }, {}, $__proto, $__super, false);
    return $ParseTreeValidator;
  }(ParseTreeVisitor);
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
}).call(this);
var $___src_codegeneration_PrivateNameSyntaxTransformer_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_PredefinedName_js, ASSERT_NAME = $__20.ASSERT_NAME, CREATE_NAME = $__20.CREATE_NAME, RUNTIME = $__20.RUNTIME, TRACEUR_RUNTIME = $__20.TRACEUR_RUNTIME;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var CONST = $___src_syntax_TokenType_js.CONST;
  var $__20 = $___src_syntax_trees_ParseTrees_js, VariableDeclarationList = $__20.VariableDeclarationList, VariableStatement = $__20.VariableStatement;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__20.createArgumentList, createCallExpression = $__20.createCallExpression, createEmptyArgumentList = $__20.createEmptyArgumentList, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createVariableDeclaration = $__20.createVariableDeclaration;
  var PrivateNameSyntaxTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PrivateNameSyntaxTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      getTransformedName_: function(token) {
        return this.identifierGenerator.getUniqueIdentifier(token.value);
      },
      transformAtNameExpression: function(tree) {
        var transformedName = this.getTransformedName_(tree.atNameToken);
        return createIdentifierExpression(transformedName);
      },
      transformNameStatement: function(tree) {
        var declarations = this.transformList(tree.declarations);
        return new VariableStatement(tree.location, new VariableDeclarationList(tree.location, CONST, declarations));
      },
      transformAtNameDeclaration: function(tree) {
        var transformedName = this.getTransformedName_(tree.atNameToken);
        var args, name;
        if (tree.initializer) {
          args = createArgumentList(this.transformAny(tree.initializer));
          name = ASSERT_NAME;
        } else {
          args = createEmptyArgumentList();
          name = CREATE_NAME;
        }
        return createVariableDeclaration(transformedName, createCallExpression(createMemberExpression(TRACEUR_RUNTIME, name), args));
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new PrivateNameSyntaxTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, false);
    return $PrivateNameSyntaxTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {PrivateNameSyntaxTransformer: {
      get: function() {
        return PrivateNameSyntaxTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_PropertyNameShorthandTransformer_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_trees_ParseTrees_js, IdentifierExpression = $__20.IdentifierExpression, PropertyNameAssignment = $__20.PropertyNameAssignment;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var PropertyNameShorthandTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $PropertyNameShorthandTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformPropertyNameShorthand: function(tree) {
        return new PropertyNameAssignment(tree.location, tree.name, new IdentifierExpression(tree.location, tree.name));
      }
    }, {transformTree: function(tree) {
        return new PropertyNameShorthandTransformer().transformAny(tree);
      }}, $__proto, $__super, false);
    return $PropertyNameShorthandTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {PropertyNameShorthandTransformer: {
      get: function() {
        return PropertyNameShorthandTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_TemplateLiteralTransformer_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_trees_ParseTreeType_js, BINARY_OPERATOR = $__20.BINARY_OPERATOR, COMMA_EXPRESSION = $__20.COMMA_EXPRESSION, CONDITIONAL_EXPRESSION = $__20.CONDITIONAL_EXPRESSION, TEMPLATE_LITERAL_PORTION = $__20.TEMPLATE_LITERAL_PORTION;
  var $__20 = $___src_syntax_trees_ParseTrees_js, LiteralExpression = $__20.LiteralExpression, ParenExpression = $__20.ParenExpression;
  var LiteralToken = $___src_syntax_LiteralToken_js.LiteralToken;
  var $__20 = $___src_syntax_PredefinedName_js, DEFINE_PROPERTIES = $__20.DEFINE_PROPERTIES, OBJECT = $__20.OBJECT, RAW = $__20.RAW;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__20 = $___src_syntax_TokenType_js, PERCENT = $__20.PERCENT, PLUS = $__20.PLUS, SLASH = $__20.SLASH, STAR = $__20.STAR, STRING = $__20.STRING;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__20.createArgumentList, createArrayLiteralExpression = $__20.createArrayLiteralExpression, createBinaryOperator = $__20.createBinaryOperator, createCallExpression = $__20.createCallExpression, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createObjectFreeze = $__20.createObjectFreeze, createObjectLiteralExpression = $__20.createObjectLiteralExpression, createOperatorToken = $__20.createOperatorToken, createPropertyDescriptor = $__20.createPropertyDescriptor, createPropertyNameAssignment = $__20.createPropertyNameAssignment, createStringLiteral = $__20.createStringLiteral;
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
    var i = 0, k = 1, c, c2;
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
  var TemplateLiteralTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TemplateLiteralTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformFunctionBody: function(tree) {
        return this.transformBlock(tree);
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
      }}, $__proto, $__super, false);
    return $TemplateLiteralTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {TemplateLiteralTransformer: {
      get: function() {
        return TemplateLiteralTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_RestParameterTransformer_js = (function() {
  "use strict";
  var $__0 = Object.freeze(Object.defineProperties(["\n          for (var ", " = [], ", " = ", ";\n               ", " < arguments.length; ", "++)\n            ", "[", " - ", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n          for (var ", " = [], ", " = ", ";\n               ", " < arguments.length; ", "++)\n            ", "[", " - ", "] = arguments[", "];"])}})), $__3 = Object.freeze(Object.defineProperties(["\n          for (var ", " = [], ", " = 0;\n               ", " < arguments.length; ", "++)\n            ", "[", "] = arguments[", "];"], {raw: {value: Object.freeze(["\n          for (var ", " = [], ", " = 0;\n               ", " < arguments.length; ", "++)\n            ", "[", "] = arguments[", "];"])}}));
  var FormalParameterList = $___src_syntax_trees_ParseTrees_js.FormalParameterList;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createBlock = $__20.createBlock, createIdentifierToken = $__20.createIdentifierToken;
  var parseStatement = $___src_codegeneration_PlaceholderParser_js.parseStatement;
  var prependStatements = $___src_codegeneration_PrependStatements_js.prependStatements;
  function hasRestParameter(formalParameterList) {
    var parameters = formalParameterList.parameters;
    return parameters.length > 0 && parameters[parameters.length - 1].isRestParameter();
  }
  function getRestParameterLiteralToken(formalParameterList) {
    var parameters = formalParameterList.parameters;
    return parameters[parameters.length - 1].identifier.identifierToken;
  }
  var RestParameterTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $RestParameterTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformFunctionDeclaration: function(tree) {
        if (hasRestParameter(tree.formalParameterList)) return this.desugarRestParameters_(tree);
        return $__superCall(this, $__proto, "transformFunctionDeclaration", [tree]);
      },
      transformFunctionExpression: function(tree) {
        if (hasRestParameter(tree.formalParameterList)) return this.desugarRestParameters_(tree);
        return $__superCall(this, $__proto, "transformFunctionExpression", [tree]);
      },
      desugarRestParameters_: function(tree) {
        var formalParameterList = this.transformAny(tree.formalParameterList);
        var parametersWithoutRestParam = new FormalParameterList(formalParameterList.location, formalParameterList.parameters.slice(0, - 1));
        var startIndex = tree.formalParameterList.parameters.length - 1;
        var i = createIdentifierToken(this.getTempIdentifier());
        var name = getRestParameterLiteralToken(tree.formalParameterList);
        var loop;
        if (startIndex) {
          loop = parseStatement($__0, name, i, startIndex, i, i, name, i, startIndex, i);
        } else {
          loop = parseStatement($__3, name, i, i, i, name, i, i);
        }
        var statements = prependStatements(tree.functionBody.statements, loop);
        var functionBody = this.transformAny(createBlock(statements));
        return new tree.constructor(tree.location, tree.name, tree.isGenerator, parametersWithoutRestParam, functionBody);
      }
    }, {transformTree: function(identifierGenerator, tree) {
        return new RestParameterTransformer(identifierGenerator).transformAny(tree);
      }}, $__proto, $__super, false);
    return $RestParameterTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {RestParameterTransformer: {
      get: function() {
        return RestParameterTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_SpreadTransformer_js = (function() {
  "use strict";
  var $__20 = $___src_syntax_PredefinedName_js, APPLY = $__20.APPLY, BIND = $__20.BIND, FUNCTION = $__20.FUNCTION, PROTOTYPE = $__20.PROTOTYPE;
  var $__20 = $___src_syntax_trees_ParseTreeType_js, MEMBER_EXPRESSION = $__20.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__20.MEMBER_LOOKUP_EXPRESSION, SPREAD_EXPRESSION = $__20.SPREAD_EXPRESSION;
  var TempVarTransformer = $___src_codegeneration_TempVarTransformer_js.TempVarTransformer;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createArgumentList = $__20.createArgumentList, createArrayLiteralExpression = $__20.createArrayLiteralExpression, createAssignmentExpression = $__20.createAssignmentExpression, createCallExpression = $__20.createCallExpression, createEmptyArgumentList = $__20.createEmptyArgumentList, createIdentifierExpression = $__20.createIdentifierExpression, createMemberExpression = $__20.createMemberExpression, createMemberLookupExpression = $__20.createMemberLookupExpression, createNewExpression = $__20.createNewExpression, createNullLiteral = $__20.createNullLiteral, createParenExpression = $__20.createParenExpression;
  var SPREAD_CODE = "\n    function() {\n      var rv = [], k = 0;\n      for (var i = 0; i < arguments.length; i++) {\n        var value = %toObject(arguments[i]);\n        for (var j = 0; j < value.length; j++) {\n          rv[k++] = value[j];\n        }\n      }\n      return rv;\n    }";
  function hasSpreadMember(trees) {
    return trees.some((function(tree) {
      return tree && tree.type == SPREAD_EXPRESSION;
    }));
  }
  var SpreadTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $SpreadTransformer = ($__createClass)({
      constructor: function(identifierGenerator, runtimeInliner) {
        $__superCall(this, $__proto, "constructor", [identifierGenerator]);
        this.runtimeInliner_ = runtimeInliner;
      },
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
        var functionObject, contextObject;
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
        return $__superCall(this, $__proto, "transformArrayLiteralExpression", [tree]);
      },
      transformCallExpression: function(tree) {
        if (hasSpreadMember(tree.args.args)) {
          return this.desugarCallSpread_(tree);
        }
        return $__superCall(this, $__proto, "transformCallExpression", [tree]);
      },
      transformNewExpression: function(tree) {
        if (tree.args != null && hasSpreadMember(tree.args.args)) {
          return this.desugarNewSpread_(tree);
        }
        return $__superCall(this, $__proto, "transformNewExpression", [tree]);
      }
    }, {transformTree: function(identifierGenerator, runtimeInliner, tree) {
        return new SpreadTransformer(identifierGenerator, runtimeInliner).transformAny(tree);
      }}, $__proto, $__super, true);
    return $SpreadTransformer;
  }(TempVarTransformer);
  return Object.preventExtensions(Object.create(null, {SpreadTransformer: {
      get: function() {
        return SpreadTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_TypeTransformer_js = (function() {
  "use strict";
  var VariableDeclaration = $___src_syntax_trees_ParseTrees_js.VariableDeclaration;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var TypeTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TypeTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformVariableDeclaration: function(tree) {
        if (tree.typeAnnotation) {
          tree = new VariableDeclaration(tree.location, tree.lvalue, null, tree.initializer);
        }
        return $__superCall(this, $__proto, "transformVariableDeclaration", [tree]);
      }
    }, {transformTree: function(tree) {
        return new TypeTransformer().transformAny(tree);
      }}, $__proto, $__super, false);
    return $TypeTransformer;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {TypeTransformer: {
      get: function() {
        return TypeTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_ProgramTransformer_js = (function() {
  "use strict";
  var ArrayComprehensionTransformer = $___src_codegeneration_ArrayComprehensionTransformer_js.ArrayComprehensionTransformer;
  var ArrowFunctionTransformer = $___src_codegeneration_ArrowFunctionTransformer_js.ArrowFunctionTransformer;
  var AtNameMemberTransformer = $___src_codegeneration_AtNameMemberTransformer_js.AtNameMemberTransformer;
  var BlockBindingTransformer = $___src_codegeneration_BlockBindingTransformer_js.BlockBindingTransformer;
  var CascadeExpressionTransformer = $___src_codegeneration_CascadeExpressionTransformer_js.CascadeExpressionTransformer;
  var ClassTransformer = $___src_codegeneration_ClassTransformer_js.ClassTransformer;
  var CollectionTransformer = $___src_codegeneration_CollectionTransformer_js.CollectionTransformer;
  var DefaultParametersTransformer = $___src_codegeneration_DefaultParametersTransformer_js.DefaultParametersTransformer;
  var DestructuringTransformer = $___src_codegeneration_DestructuringTransformer_js.DestructuringTransformer;
  var ForOfTransformer = $___src_codegeneration_ForOfTransformer_js.ForOfTransformer;
  var FreeVariableChecker = $___src_semantics_FreeVariableChecker_js.FreeVariableChecker;
  var GeneratorComprehensionTransformer = $___src_codegeneration_GeneratorComprehensionTransformer_js.GeneratorComprehensionTransformer;
  var GeneratorTransformPass = $___src_codegeneration_GeneratorTransformPass_js.GeneratorTransformPass;
  var ModuleTransformer = $___src_codegeneration_ModuleTransformer_js.ModuleTransformer;
  var ObjectLiteralTransformer = $___src_codegeneration_ObjectLiteralTransformer_js.ObjectLiteralTransformer;
  var ObjectMap = $___src_util_ObjectMap_js.ObjectMap;
  var ParseTreeValidator = $___src_syntax_ParseTreeValidator_js.ParseTreeValidator;
  var PrivateNameSyntaxTransformer = $___src_codegeneration_PrivateNameSyntaxTransformer_js.PrivateNameSyntaxTransformer;
  var PropertyNameShorthandTransformer = $___src_codegeneration_PropertyNameShorthandTransformer_js.PropertyNameShorthandTransformer;
  var TemplateLiteralTransformer = $___src_codegeneration_TemplateLiteralTransformer_js.TemplateLiteralTransformer;
  var RestParameterTransformer = $___src_codegeneration_RestParameterTransformer_js.RestParameterTransformer;
  var SpreadTransformer = $___src_codegeneration_SpreadTransformer_js.SpreadTransformer;
  var TypeTransformer = $___src_codegeneration_TypeTransformer_js.TypeTransformer;
  var $__20 = $___src_options_js, options = $__20.options, transformOptions = $__20.transformOptions;
  var ProgramTransformer = function() {
    'use strict';
    var $ProgramTransformer = ($__createClassNoExtends)({
      constructor: function(reporter, project) {
        this.project_ = project;
        this.reporter_ = reporter;
        this.results_ = new ObjectMap();
      },
      transform_: function() {
        this.project_.getSourceFiles().forEach((function(file) {
          this.transformFile_(file);
        }).bind(this));
      },
      transformFile_: function(file) {
        var result = this.transform(this.project_.getParseTree(file));
        this.results_.set(file, result);
      },
      transformFileAsModule_: function(module, file) {
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
          for (var args = [], $__16 = 2; $__16 < arguments.length; $__16++) args[$__16 - 2] = arguments[$__16];
          return chain(enabled, (function() {
            return ($__40 = transformer).transformTree.apply($__40, $__spread(args, [tree]));
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
        transform(transformOptions.templateLiterals, TemplateLiteralTransformer, identifierGenerator);
        chain(transformOptions.modules, (function() {
          return this.transformModules_(tree, module);
        }).bind(this));
        transform(transformOptions.arrowFunctions, ArrowFunctionTransformer, reporter);
        transform(transformOptions.classes, ClassTransformer, identifierGenerator, runtimeInliner, reporter);
        transform(transformOptions.propertyNameShorthand, PropertyNameShorthandTransformer);
        transform(transformOptions.propertyMethods || transformOptions.privateNameSyntax && transformOptions.privateNames, ObjectLiteralTransformer, identifierGenerator);
        transform(transformOptions.generatorComprehension, GeneratorComprehensionTransformer, identifierGenerator);
        transform(transformOptions.arrayComprehension, ArrayComprehensionTransformer, identifierGenerator);
        transform(transformOptions.forOf, ForOfTransformer, identifierGenerator);
        transform(transformOptions.restParameters, RestParameterTransformer, identifierGenerator);
        transform(transformOptions.defaultParameters, DefaultParametersTransformer);
        transform(transformOptions.destructuring, DestructuringTransformer, identifierGenerator);
        transform(transformOptions.generators || transformOptions.deferredFunctions, GeneratorTransformPass, identifierGenerator, runtimeInliner, reporter);
        transform(transformOptions.privateNames && transformOptions.privateNameSyntax, AtNameMemberTransformer, identifierGenerator);
        transform(transformOptions.privateNames && transformOptions.privateNameSyntax, PrivateNameSyntaxTransformer, identifierGenerator);
        transform(transformOptions.spread, SpreadTransformer, identifierGenerator, runtimeInliner);
        chain(true, (function() {
          return runtimeInliner.transformAny(tree);
        }));
        transform(transformOptions.blockBinding, BlockBindingTransformer);
        transform(transformOptions.cascadeExpression, CascadeExpressionTransformer, identifierGenerator, reporter);
        transform(transformOptions.trapMemberLookup || transformOptions.privateNames, CollectionTransformer, identifierGenerator);
        chain(options.freeVariableChecker, (function() {
          return FreeVariableChecker.checkProgram(reporter, tree);
        }));
        return tree;
      },
      transformModules_: function(tree) {
        var module = arguments[1];
        if (module) return ModuleTransformer.transformAsModule(this.project_, module, tree);
        return ModuleTransformer.transform(this.project_, tree);
      }
    }, {});
    return $ProgramTransformer;
  }();
  ProgramTransformer.transform = function(reporter, project) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transform_();
    return transformer.results_;
  };
  ProgramTransformer.transformFile = function(reporter, project, sourceFile) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transformFile_(sourceFile);
    return transformer.results_;
  };
  ProgramTransformer.transformFileAsModule = function(reporter, project, module, sourceFile) {
    var transformer = new ProgramTransformer(reporter, project);
    transformer.transformFileAsModule_(module, sourceFile);
    return transformer.results_;
  };
  return Object.preventExtensions(Object.create(null, {ProgramTransformer: {
      get: function() {
        return ProgramTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_RuntimeInliner_js = (function() {
  "use strict";
  var MutedErrorReporter = $___src_util_MutedErrorReporter_js.MutedErrorReporter;
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var Parser = $___src_syntax_Parser_js.Parser;
  var Program = $___src_syntax_trees_ParseTrees_js.Program;
  var SourceFile = $___src_syntax_SourceFile_js.SourceFile;
  var VAR = $___src_syntax_TokenType_js.VAR;
  var $__20 = $___src_codegeneration_ParseTreeFactory_js, createIdentifierExpression = $__20.createIdentifierExpression, createVariableDeclaration = $__20.createVariableDeclaration, createVariableDeclarationList = $__20.createVariableDeclarationList, createVariableStatement = $__20.createVariableStatement;
  var prependStatements = $___src_codegeneration_PrependStatements_js.prependStatements;
  var shared = {
    toObject: "function(value) {\n        if (value == null)\n          throw TypeError();\n        return Object(value);\n      }",
    getDescriptors: "function(object) {\n        var descriptors = {}, name, names = Object.getOwnPropertyNames(object);\n        for (var i = 0; i < names.length; i++) {\n          var name = names[i];\n          descriptors[name] = Object.getOwnPropertyDescriptor(object, name);\n        }\n        return descriptors;\n      }"
  };
  function parse(source, name) {
    var file = new SourceFile(name + '@runtime', source);
    var errorReporter = new MutedErrorReporter();
    return new Parser(errorReporter, file).parseAssignmentExpression();
  }
  var RuntimeInliner = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $RuntimeInliner = ($__createClass)({
      constructor: function(identifierGenerator) {
        $__superCall(this, $__proto, "constructor", []);
        this.identifierGenerator = identifierGenerator;
        this.map_ = Object.create(null);
      },
      transformProgram: function(tree) {
        var names = Object.keys(this.map_);
        if (!names.length) return tree;
        var vars = names.filter(function(name) {
          return !this.map_[name].inserted;
        }, this).map(function(name) {
          var item = this.map_[name];
          item.inserted = true;
          return createVariableDeclaration(item.uid, item.expression);
        }, this);
        if (!vars.length) return tree;
        var variableStatement = createVariableStatement(createVariableDeclarationList(VAR, vars));
        var programElements = prependStatements(tree.programElements, variableStatement);
        return new Program(tree.location, programElements);
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
          traceur.assert(source);
          this.register(name, source);
        }
        return this.getAsIdentifierExpression(name);
      }
    }, {}, $__proto, $__super, true);
    return $RuntimeInliner;
  }(ParseTreeTransformer);
  return Object.preventExtensions(Object.create(null, {RuntimeInliner: {
      get: function() {
        return RuntimeInliner;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_UniqueIdentifierGenerator_js = (function() {
  "use strict";
  var UniqueIdentifierGenerator = function() {
    'use strict';
    var $UniqueIdentifierGenerator = ($__createClassNoExtends)({
      constructor: function() {
        this.identifierIndex = 0;
      },
      generateUniqueIdentifier: function() {
        return ("$__" + this.identifierIndex++);
      },
      getUniqueIdentifier: function(name) {
        if (name[0] === '@') return ("$___" + name.slice(1));
        return ("$__" + name);
      }
    }, {});
    return $UniqueIdentifierGenerator;
  }();
  return Object.preventExtensions(Object.create(null, {UniqueIdentifierGenerator: {
      get: function() {
        return UniqueIdentifierGenerator;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_semantics_symbols_Project_js = (function() {
  "use strict";
  var ArrayMap = $___src_util_ArrayMap_js.ArrayMap;
  var ExportSymbol = $___src_semantics_symbols_ExportSymbol_js.ExportSymbol;
  var ModuleSymbol = $___src_semantics_symbols_ModuleSymbol_js.ModuleSymbol;
  var ObjectMap = $___src_util_ObjectMap_js.ObjectMap;
  var RuntimeInliner = $___src_codegeneration_RuntimeInliner_js.RuntimeInliner;
  var UniqueIdentifierGenerator = $___src_codegeneration_UniqueIdentifierGenerator_js.UniqueIdentifierGenerator;
  var resolveUrl = $___src_util_url_js.resolveUrl;
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
  var standardModuleUrlRegExp = /^@\w+$/;
  var standardModuleCache = Object.create(null);
  function getStandardModule(url) {
    if (!(url in standardModuleCache)) {
      var symbol = new ModuleSymbol(null, null, null, url);
      var moduleInstance = $traceurRuntime.modules[url];
      Object.keys(moduleInstance).forEach((function(name) {
        symbol.addExport(name, new ExportSymbol(null, name, null));
      }));
      standardModuleCache[url] = symbol;
    }
    return standardModuleCache[url];
  }
  var Project = function() {
    'use strict';
    var $Project = ($__createClassNoExtends)({
      constructor: function(url) {
        this.identifierGenerator = new UniqueIdentifierGenerator();
        this.runtimeInliner = new RuntimeInliner(this.identifierGenerator);
        this.sourceFiles_ = Object.create(null);
        this.parseTrees_ = new ObjectMap();
        this.rootModule_ = new ModuleSymbol(null, null, null, url);
        this.modulesByUrl_ = Object.create(null);
        this.moduleExports_ = new ArrayMap();
      },
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
        traceur.assert(!this.hasModuleForUrl(module.url));
        this.modulesByUrl_[module.url] = module;
      },
      getModuleForUrl: function(url) {
        url = resolveUrl(this.url, url);
        traceur.assert(this.hasModuleForUrl(url));
        if (standardModuleUrlRegExp.test(url)) return getStandardModule(url);
        return this.modulesByUrl_[url];
      },
      hasModuleForUrl: function(url) {
        if (standardModuleUrlRegExp.test(url)) return url in $traceurRuntime.modules;
        url = resolveUrl(this.url, url);
        return url in this.modulesByUrl_;
      },
      setModuleForStarTree: function(tree, symbol) {
        this.moduleExports_.set(tree, symbol);
      },
      getModuleForStarTree: function(tree) {
        return this.moduleExports_.get(tree);
      }
    }, {});
    return $Project;
  }();
  return Object.preventExtensions(Object.create(null, {Project: {
      get: function() {
        return Project;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_Compiler_js = (function() {
  "use strict";
  var ModuleAnalyzer = $___src_semantics_ModuleAnalyzer_js.ModuleAnalyzer;
  var Parser = $___src_syntax_Parser_js.Parser;
  var ProgramTransformer = $___src_codegeneration_ProgramTransformer_js.ProgramTransformer;
  var Project = $___src_semantics_symbols_Project_js.Project;
  var Compiler = function() {
    'use strict';
    var $Compiler = ($__createClassNoExtends)({
      constructor: function(reporter, project) {
        this.reporter_ = reporter;
        this.project_ = project;
      },
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
        this.project_.setParseTree(file, new Parser(this.reporter_, file).parseProgram(true));
      },
      hadError_: function() {
        return this.reporter_.hadError();
      }
    }, {});
    return $Compiler;
  }();
  Compiler.compile = function(reporter, project) {
    return new Compiler(reporter, project).compile_();
  };
  Compiler.compileFile = function(reporter, sourceFile, url) {
    var project = new Project(url);
    project.addFile(sourceFile);
    return new Compiler(reporter, project).compileFile_(sourceFile);
  };
  return Object.preventExtensions(Object.create(null, {Compiler: {
      get: function() {
        return Compiler;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_WebPageProject_js = (function() {
  "use strict";
  var Compiler = $___src_codegeneration_Compiler_js.Compiler;
  var ErrorReporter = $___src_util_ErrorReporter_js.ErrorReporter;
  var Project = $___src_semantics_symbols_Project_js.Project;
  var SourceFile = $___src_syntax_SourceFile_js.SourceFile;
  var TreeWriter = $___src_outputgeneration_TreeWriter_js.TreeWriter;
  var WebPageProject = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $WebPageProject = ($__createClass)({
      constructor: function(url) {
        $__superCall(this, $__proto, "constructor", [url]);
        this.numPending_ = 0;
        this.numberInlined_ = 0;
      },
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
        for (var i = 0, length = scriptElements.length; i < length; i++) {
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
        document.addEventListener('DOMContentLoaded', (function() {
          var selector = 'script[type="text/traceur"]';
          var scripts = document.querySelectorAll(selector);
          if (!scripts.length) {
            return;
          }
          this.addFilesFromScriptElements(scripts, (function() {
            var trees = this.compile();
            this.runInWebPage(trees);
          }).bind(this));
        }).bind(this), false);
      }
    }, {}, $__proto, $__super, true);
    return $WebPageProject;
  }(Project);
  return Object.preventExtensions(Object.create(null, {WebPageProject: {
      get: function() {
        return WebPageProject;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_util_TestErrorReporter_js = (function() {
  "use strict";
  var ErrorReporter = $___src_util_ErrorReporter_js.ErrorReporter;
  var TestErrorReporter = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $TestErrorReporter = ($__createClass)({
      constructor: function() {
        this.errors = [];
      },
      reportMessageInternal: function(location, format, args) {
        this.errors.push(ErrorReporter.format(location, format, args));
      },
      hasMatchingError: function(expected) {
        return this.errors.some((function(error) {
          return error.indexOf(expected) !== - 1;
        }));
      }
    }, {}, $__proto, $__super, true);
    return $TestErrorReporter;
  }(ErrorReporter);
  return Object.preventExtensions(Object.create(null, {TestErrorReporter: {
      get: function() {
        return TestErrorReporter;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_outputgeneration_ProjectWriter_js = (function() {
  "use strict";
  var TreeWriter = $___src_outputgeneration_TreeWriter_js.TreeWriter;
  var ProjectWriter = function() {
    'use strict';
    var $ProjectWriter = ($__createClassNoExtends)({constructor: function() {}}, {});
    return $ProjectWriter;
  }();
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
}).call(this);
var $___src_outputgeneration_SourceMapIntegration_js = (function() {
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
  var define, m = {};
  define = makeDefine(m, './util');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module);
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
    function join(aRoot, aPath) {
      return aPath.charAt(0) === '/' ? aPath: aRoot.replace(/\/*$/, '') + '/' + aPath;
    }
    exports.join = join;
    function toSetString(aStr) {
      return '$' + aStr;
    }
    exports.toSetString = toSetString;
    function relative(aRoot, aPath) {
      return aPath.indexOf(aRoot.replace(/\/*$/, '') + '/') === 0 ? aPath.substr(aRoot.length + 1): aPath;
    }
    exports.relative = relative;
  });
  define = makeDefine(m, './array-set');
  if (typeof define !== 'function') {
    var define = require('amdefine')(module);
  }
  define(function(require, exports, module) {
    var util = require('./util');
    function ArraySet() {
      this._array = [];
      this._set = {};
    }
    ArraySet.fromArray = function ArraySet_fromArray(aArray) {
      var set = new ArraySet();
      for (var i = 0, len = aArray.length; i < len; i++) {
        set.add(aArray[i]);
      }
      return set;
    };
    ArraySet.prototype.add = function ArraySet_add(aStr) {
      if (this.has(aStr)) {
        return;
      }
      var idx = this._array.length;
      this._array.push(aStr);
      this._set[util.toSetString(aStr)] = idx;
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
    var define = require('amdefine')(module);
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
    var define = require('amdefine')(module);
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
      var continuation, digit;
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
    var define = require('amdefine')(module);
  }
  define(function(require, exports, module) {
    function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
      var mid = Math.floor((aHigh - aLow) / 2) + aLow;
      var cmp = aCompare(aNeedle, aHaystack[mid]);
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
    var define = require('amdefine')(module);
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
        generated: generated,
        original: original,
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
        if (mapping.source === aSourceFile && mapping.original) {
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.original.line,
            column: mapping.original.column
          });
          if (original && original.source !== null) {
            if (sourceRoot) {
              mapping.source = util.relative(sourceRoot, original.source);
            } else {
              mapping.source = original.source;
            }
            mapping.original.line = original.line;
            mapping.original.column = original.column;
            mapping.name = mapping.name && original.name || mapping.name;
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
        throw new Error('Invalid mapping.');
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
      this._mappings.sort(function(mappingA, mappingB) {
        var cmp = mappingA.generated.line - mappingB.generated.line;
        return cmp === 0 ? mappingA.generated.column - mappingB.generated.column: cmp;
      });
      for (var i = 0, len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];
        if (mapping.generated.line !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generated.line !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        } else {
          if (i > 0) {
            result += ',';
          }
        }
        result += base64VLQ.encode(mapping.generated.column - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generated.column;
        if (mapping.source && mapping.original) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source) - previousSource);
          previousSource = this._sources.indexOf(mapping.source);
          result += base64VLQ.encode(mapping.original.line - 1 - previousOriginalLine);
          previousOriginalLine = mapping.original.line - 1;
          result += base64VLQ.encode(mapping.original.column - previousOriginalColumn);
          previousOriginalColumn = mapping.original.column;
          if (mapping.name) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name) - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }
      return result;
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
        map.sourcesContent = map.sources.map(function(source) {
          if (map.sourceRoot) {
            source = util.relative(map.sourceRoot, source);
          }
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, util.toSetString(source)) ? this._sourcesContents[util.toSetString(source)]: null;
        }, this);
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
    var define = require('amdefine')(module);
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
      var file = util.getArg(sourceMap, 'file');
      if (version !== this._version) {
        throw new Error('Unsupported version: ' + version);
      }
      this._names = ArraySet.fromArray(names);
      this._sources = ArraySet.fromArray(sources);
      this.sourceRoot = sourceRoot;
      this.sourcesContent = sourcesContent;
      this.file = file;
      this._generatedMappings = [];
      this._originalMappings = [];
      this._parseMappings(mappings, sourceRoot);
    }
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
      this._originalMappings.sort(this._compareOriginalPositions);
    };
    SourceMapConsumer.prototype._compareOriginalPositions = function SourceMapConsumer_compareOriginalPositions(mappingA, mappingB) {
      if (mappingA.source > mappingB.source) {
        return 1;
      } else if (mappingA.source < mappingB.source) {
        return - 1;
      } else {
        var cmp = mappingA.originalLine - mappingB.originalLine;
        return cmp === 0 ? mappingA.originalColumn - mappingB.originalColumn: cmp;
      }
    };
    SourceMapConsumer.prototype._compareGeneratedPositions = function SourceMapConsumer_compareGeneratedPositions(mappingA, mappingB) {
      var cmp = mappingA.generatedLine - mappingB.generatedLine;
      return cmp === 0 ? mappingA.generatedColumn - mappingB.generatedColumn: cmp;
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
      var mapping = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", this._compareGeneratedPositions);
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
        var relativeUrl = util.relative(this.sourceRoot, aSource);
        if (this._sources.has(relativeUrl)) {
          return this.sourcesContent[this._sources.indexOf(relativeUrl)];
        }
      }
      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
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
      var mapping = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", this._compareOriginalPositions);
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
    var define = require('amdefine')(module);
  }
  define(function(require, exports, module) {
    var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
    function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
      this.children = [];
      this.line = aLine === undefined ? null: aLine;
      this.column = aColumn === undefined ? null: aColumn;
      this.source = aSource === undefined ? null: aSource;
      this.name = aName === undefined ? null: aName;
      if (aChunks != null) this.add(aChunks);
    }
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
      this.children.forEach(function(chunk) {
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
      }, this);
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
      this.walk(function(chunk, original) {
        generated.code += chunk;
        if (original.source !== null && original.line !== null && original.column !== null) {
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
          sourceMappingActive = true;
        } else if (sourceMappingActive) {
          map.addMapping({generated: {
              line: generated.line,
              column: generated.column
            }});
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
}).call(this);
var $___src_codegeneration_CloneTreeTransformer_js = (function() {
  "use strict";
  var ParseTreeTransformer = $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
  var $__20 = $___src_syntax_trees_ParseTrees_js, AtNameExpression = $__20.AtNameExpression, BindingIdentifier = $__20.BindingIdentifier, BreakStatement = $__20.BreakStatement, ContinueStatement = $__20.ContinueStatement, DebuggerStatement = $__20.DebuggerStatement, EmptyStatement = $__20.EmptyStatement, ExportSpecifier = $__20.ExportSpecifier, ExportStar = $__20.ExportStar, IdentifierExpression = $__20.IdentifierExpression, ImportSpecifier = $__20.ImportSpecifier, LiteralExpression = $__20.LiteralExpression, ModuleRequire = $__20.ModuleRequire, PredefinedType = $__20.PredefinedType, PropertyNameShorthand = $__20.PropertyNameShorthand, TemplateLiteralPortion = $__20.TemplateLiteralPortion, RestParameter = $__20.RestParameter, SuperExpression = $__20.SuperExpression, ThisExpression = $__20.ThisExpression;
  var CloneTreeTransformer = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $CloneTreeTransformer = ($__createClass)({
      constructor: function() {
        $__superCall(this, $__proto, "constructor", arguments);
      },
      transformAtNameExpression: function(tree) {
        return new AtNameExpression(tree.location, tree.atNameToken);
      },
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
          return $__superCall(this, $__proto, "transformList", [list]);
        }
      },
      transformLiteralExpression: function(tree) {
        return new LiteralExpression(tree.location, tree.literalToken);
      },
      transformModuleRequire: function(tree) {
        return new ModuleRequire(tree.location, tree.url);
      },
      transformPredefinedType: function(tree) {
        return new PredefinedType(tree.location, tree.token);
      },
      transformPropertyNameShorthand: function(tree) {
        return new PropertyNameShorthand(tree.location, tree.name);
      },
      transformTemplateLiteralPortion: function(tree) {
        return new TemplateLiteralPortion(tree.location, tree.token);
      },
      transformRestParameter: function(tree) {
        return new RestParameter(tree.location, tree.identifer);
      },
      transformSuperExpression: function(tree) {
        return new SuperExpression(tree.location);
      },
      transformThisExpression: function(tree) {
        return new ThisExpression(tree.location);
      }
    }, {}, $__proto, $__super, false);
    return $CloneTreeTransformer;
  }(ParseTreeTransformer);
  CloneTreeTransformer.cloneTree = function(tree) {
    return new CloneTreeTransformer().transformAny(tree);
  };
  return Object.preventExtensions(Object.create(null, {CloneTreeTransformer: {
      get: function() {
        return CloneTreeTransformer;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_codegeneration_module_ModuleRequireVisitor_js = (function() {
  "use strict";
  var ParseTreeVisitor = $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
  var canonicalizeUrl = $___src_util_url_js.canonicalizeUrl;
  var ModuleRequireVisitor = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $ModuleRequireVisitor = ($__createClass)({
      constructor: function(reporter) {
        $__superCall(this, $__proto, "constructor", []);
        this.urls_ = Object.create(null);
      },
      get requireUrls() {
        return Object.keys(this.urls_);
      },
      visitModuleRequire: function(tree) {
        this.urls_[canonicalizeUrl(tree.url.processedValue)] = true;
      }
    }, {}, $__proto, $__super, true);
    return $ModuleRequireVisitor;
  }(ParseTreeVisitor);
  return Object.preventExtensions(Object.create(null, {ModuleRequireVisitor: {
      get: function() {
        return ModuleRequireVisitor;
      },
      enumerable: true
    }}));
}).call(this);
var $___src_runtime_modules_js = (function() {
  "use strict";
  var ArrayMap = $___src_util_ArrayMap_js.ArrayMap;
  var ModuleAnalyzer = $___src_semantics_ModuleAnalyzer_js.ModuleAnalyzer;
  var ModuleRequireVisitor = $___src_codegeneration_module_ModuleRequireVisitor_js.ModuleRequireVisitor;
  var ModuleSymbol = $___src_semantics_symbols_ModuleSymbol_js.ModuleSymbol;
  var ObjectMap = $___src_util_ObjectMap_js.ObjectMap;
  var Parser = $___src_syntax_Parser_js.Parser;
  var ProgramTransformer = $___src_codegeneration_ProgramTransformer_js.ProgramTransformer;
  var Project = $___src_semantics_symbols_Project_js.Project;
  var SourceFile = $___src_syntax_SourceFile_js.SourceFile;
  var TreeWriter = $___src_outputgeneration_TreeWriter_js.TreeWriter;
  var getUid = $___src_util_uid_js.getUid;
  var resolveUrl = $___src_util_url_js.resolveUrl;
  var $__20 = $___src_runtime_get_module_js, standardModuleUrlRegExp = $__20.standardModuleUrlRegExp, getModuleInstanceByUrl = $__20.getModuleInstanceByUrl, getCurrentCodeUnit = $__20.getCurrentCodeUnit, setCurrentCodeUnit = $__20.setCurrentCodeUnit;
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
  var CodeUnit = function() {
    'use strict';
    var $CodeUnit = ($__createClassNoExtends)({
      constructor: function(loader, url, state) {
        this.loader = loader;
        this.url = url;
        this.state = state;
        this.uid = getUid();
        this.state_ = NOT_STARTED;
      },
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
        var tree = parser.parseProgram(this.allowLoad);
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
    return $CodeUnit;
  }();
  var LoadCodeUnit = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $LoadCodeUnit = ($__createClass)({
      constructor: function(loader, url) {
        $__superCall(this, $__proto, "constructor", [loader, url, NOT_STARTED]);
        this.allowLoad = true;
        if (standardModuleUrlRegExp.test(url)) {
          this.state = COMPLETE;
          this.dependencies = [];
        }
      },
      get moduleSymbol() {
        return this.project.getModuleForUrl(this.url);
      },
      parse: function() {
        if (!$__superCall(this, $__proto, "parse", [])) {
          return false;
        }
        var project = this.loader.project;
        var tree = this.tree;
        var url = this.url;
        var moduleSymbol = new ModuleSymbol(null, null, tree, url);
        project.addExternalModule(moduleSymbol);
        return true;
      },
      transform: function() {
        return ProgramTransformer.transformFileAsModule(this.reporter, this.project, this.moduleSymbol, this.file);
      }
    }, {}, $__proto, $__super, true);
    return $LoadCodeUnit;
  }(CodeUnit);
  var EvalCodeUnit = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $EvalCodeUnit = ($__createClass)({constructor: function(loader, code) {
        $__superCall(this, $__proto, "constructor", [loader, loader.url, LOADED]);
        this.text = code;
        this.allowLoad = false;
      }}, {}, $__proto, $__super, true);
    return $EvalCodeUnit;
  }(CodeUnit);
  var EvalLoadCodeUnit = function($__super) {
    'use strict';
    var $__proto = $__getProtoParent($__super);
    var $EvalLoadCodeUnit = ($__createClass)({constructor: function(loader, code) {
        CodeUnit.call(this, loader, loader.url, LOADED);
        this.text = code;
        this.allowLoad = true;
      }}, {}, $__proto, $__super, true);
    return $EvalLoadCodeUnit;
  }(CodeUnit);
  var InternalLoader = function() {
    'use strict';
    var $InternalLoader = ($__createClassNoExtends)({
      constructor: function(reporter, project) {
        this.reporter = reporter;
        this.project = project;
        this.cache = new ArrayMap();
        this.urlToKey = Object.create(null);
        this.sync_ = false;
      },
      get url() {
        return this.project.url;
      },
      loadTextFile: function(url, callback, errback) {
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
        return xhr;
      },
      loadTextFileSync: function(url) {
        var xhr = new XMLHttpRequest();
        xhr.onerror = function(e) {
          throw new Error(xhr.statusText);
        };
        xhr.open('GET', url, false);
        xhr.send();
        if (xhr.status == 200 || xhr.status == 0) {
          return xhr.responseText;
        }
      },
      load: function(url) {
        url = resolveUrl(this.url, url);
        var codeUnit = this.getCodeUnit(url);
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
        codeUnit.xhr = this.loadTextFile(url, function(text) {
          codeUnit.text = text;
          codeUnit.state = LOADED;
          loader.handleCodeUnitLoaded(codeUnit);
        }, function() {
          codeUnit.state = ERROR;
          loader.handleCodeUnitLoadError(codeUnit);
        });
        return codeUnit;
      },
      loadSync: function(url) {
        this.sync_ = true;
        var loaded = this.load(url);
        this.sync_ = false;
        return loaded;
      },
      evalLoad: function(code) {
        var codeUnit = new EvalLoadCodeUnit(this, code);
        this.cache.set({}, codeUnit);
        return codeUnit;
      },
      eval: function(code) {
        var codeUnit = new EvalCodeUnit(this, code);
        this.cache.set({}, codeUnit);
        this.handleCodeUnitLoaded(codeUnit);
        return codeUnit;
      },
      getKey: function(url) {
        if (url in this.urlToKey) {
          return this.urlToKey[url];
        }
        return this.urlToKey[url] = {};
      },
      getCodeUnit: function(url) {
        var key = this.getKey(url);
        var cacheObject = this.cache.get(key);
        if (!cacheObject) {
          cacheObject = new LoadCodeUnit(this, url);
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
        codeUnit.dependencies = requireVisitor.requireUrls.map((function(url) {
          url = resolveUrl(baseUrl, url);
          return this.getCodeUnit(url);
        }).bind(this));
        codeUnit.dependencies.forEach((function(dependency) {
          this.load(dependency.url);
        }).bind(this));
        if (this.areAll(PARSED)) {
          this.analyze();
          this.transform();
          this.evaluate();
        }
      },
      handleCodeUnitLoadError: function(codeUnit) {
        this.error = codeUnit.error = 'Failed to load \'' + codeUnit.url + '\'';
        this.abortAll();
      },
      abortAll: function() {
        this.cache.values().forEach((function(codeUnit) {
          if (codeUnit.xhr) {
            codeUnit.xhr.abort();
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
          traceur.assert(codeUnit.state >= PARSED);
          if (codeUnit.state == PARSED) {
            trees.push(codeUnit.tree);
            modules.push(codeUnit.moduleSymbol);
          }
        }
        var analyzer = new ModuleAnalyzer(this.reporter, this.project);
        analyzer.analyzeModuleTrees(trees, modules);
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
        var dependencies = this.cache.values();
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
          traceur.assert(getCurrentCodeUnit() === undefined);
          setCurrentCodeUnit(codeUnit);
          var result;
          try {
            result = this.evalCodeUnit(codeUnit);
          } catch (ex) {
            codeUnit.error = ex.message;
            this.abortAll();
            return;
          } finally {
            traceur.assert(getCurrentCodeUnit() === codeUnit);
            setCurrentCodeUnit(undefined);
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
        return ('global', eval)("'use strict';" + TreeWriter.write(codeUnit.transformedTree));
      }
    }, {});
    return $InternalLoader;
  }();
  var CodeLoader = function() {
    'use strict';
    var $CodeLoader = ($__createClassNoExtends)({
      constructor: function(reporter, project, parentLoader) {
        var resolver = arguments[3];
        this.internalLoader_ = new InternalLoader(reporter, project);
      },
      load: function(url, callback) {
        var errback = arguments[2];
        var codeUnit = this.internalLoader_.load(url);
        codeUnit.addListener(callback, errback);
      },
      eval: function(program) {
        var codeUnit = this.internalLoader_.eval(program);
        return codeUnit.result;
      },
      evalLoad: function(program, callback) {
        var errback = arguments[2];
        var codeUnit = this.internalLoader_.evalLoad(program);
        codeUnit.addListener(callback, errback);
        this.internalLoader_.handleCodeUnitLoaded(codeUnit);
      },
      import: function(moduleInstanceObject) {
        throw Error('Not implemented');
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
    return $CodeLoader;
  }();
  var internals = (function() {
    return Object.preventExtensions(Object.create(null, {
      CodeUnit: {
        get: function() {
          return CodeUnit;
        },
        enumerable: true
      },
      EvalCodeUnit: {
        get: function() {
          return EvalCodeUnit;
        },
        enumerable: true
      },
      EvalLoadCodeUnit: {
        get: function() {
          return EvalLoadCodeUnit;
        },
        enumerable: true
      },
      InternalLoader: {
        get: function() {
          return InternalLoader;
        },
        enumerable: true
      },
      LoadCodeUnit: {
        get: function() {
          return LoadCodeUnit;
        },
        enumerable: true
      }
    }));
  }).call(this);
  ;
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
}).call(this);
var traceur = (function() {
  "use strict";
  var global = this;
  var options = $___src_options_js.options;
  function generateNameForUrl(url, commonPath) {
    return '$__' + url.replace(commonPath, '').replace(/[^\d\w$]/g, '_');
  }
  function getModuleForTesting(path) {
    return global[generateNameForUrl(("../src/" + path), './')];
  }
  function assert(b) {
    if (!b && options.debug) throw Error('Assertion failed');
  }
  var semantics = (function() {
    var symbols = (function() {
      return Object.preventExtensions(Object.create(null, {Project: {
          get: function() {
            return $___src_semantics_symbols_Project_js.Project;
          },
          enumerable: true
        }}));
    }).call(this);
    return Object.preventExtensions(Object.create(null, {
      FreeVariableChecker: {
        get: function() {
          return $___src_semantics_FreeVariableChecker_js.FreeVariableChecker;
        },
        enumerable: true
      },
      ModuleAnalyzer: {
        get: function() {
          return $___src_semantics_ModuleAnalyzer_js.ModuleAnalyzer;
        },
        enumerable: true
      },
      VariableBinder: {
        get: function() {
          return $___src_semantics_VariableBinder_js.VariableBinder;
        },
        enumerable: true
      },
      symbols: {
        get: function() {
          return symbols;
        },
        enumerable: true
      }
    }));
  }).call(this);
  var util = (function() {
    return Object.preventExtensions(Object.create(null, {
      ErrorReporter: {
        get: function() {
          return $___src_util_ErrorReporter_js.ErrorReporter;
        },
        enumerable: true
      },
      MutedErrorReporter: {
        get: function() {
          return $___src_util_MutedErrorReporter_js.MutedErrorReporter;
        },
        enumerable: true
      },
      SourcePosition: {
        get: function() {
          return $___src_util_SourcePosition_js.SourcePosition;
        },
        enumerable: true
      },
      TestErrorReporter: {
        get: function() {
          return $___src_util_TestErrorReporter_js.TestErrorReporter;
        },
        enumerable: true
      },
      canonicalizeUrl: {
        get: function() {
          return $___src_util_url_js.canonicalizeUrl;
        },
        enumerable: true
      },
      resolveUrl: {
        get: function() {
          return $___src_util_url_js.resolveUrl;
        },
        enumerable: true
      },
      removeDotSegments: {
        get: function() {
          return $___src_util_url_js.removeDotSegments;
        },
        enumerable: true
      }
    }));
  }).call(this);
  var syntax = (function() {
    var TokenType = $___src_syntax_TokenType_js;
    var trees = (function() {
      var ParseTreeType = $___src_syntax_trees_ParseTreeType_js;
      return Object.preventExtensions(Object.create(null, {
        ArgumentList: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ArgumentList;
          },
          enumerable: true
        },
        ArrayComprehension: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ArrayComprehension;
          },
          enumerable: true
        },
        ArrayLiteralExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ArrayLiteralExpression;
          },
          enumerable: true
        },
        ArrayPattern: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ArrayPattern;
          },
          enumerable: true
        },
        ArrowFunctionExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ArrowFunctionExpression;
          },
          enumerable: true
        },
        AtNameDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.AtNameDeclaration;
          },
          enumerable: true
        },
        AtNameExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.AtNameExpression;
          },
          enumerable: true
        },
        AwaitStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.AwaitStatement;
          },
          enumerable: true
        },
        BinaryOperator: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.BinaryOperator;
          },
          enumerable: true
        },
        BindingElement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.BindingElement;
          },
          enumerable: true
        },
        BindingIdentifier: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.BindingIdentifier;
          },
          enumerable: true
        },
        Block: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.Block;
          },
          enumerable: true
        },
        BreakStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.BreakStatement;
          },
          enumerable: true
        },
        CallExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.CallExpression;
          },
          enumerable: true
        },
        CascadeExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.CascadeExpression;
          },
          enumerable: true
        },
        CaseClause: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.CaseClause;
          },
          enumerable: true
        },
        Catch: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.Catch;
          },
          enumerable: true
        },
        ClassDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ClassDeclaration;
          },
          enumerable: true
        },
        ClassExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ClassExpression;
          },
          enumerable: true
        },
        CommaExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.CommaExpression;
          },
          enumerable: true
        },
        ComprehensionFor: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ComprehensionFor;
          },
          enumerable: true
        },
        ComprehensionIf: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ComprehensionIf;
          },
          enumerable: true
        },
        ConditionalExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ConditionalExpression;
          },
          enumerable: true
        },
        ContinueStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ContinueStatement;
          },
          enumerable: true
        },
        CoverFormals: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.CoverFormals;
          },
          enumerable: true
        },
        DebuggerStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.DebuggerStatement;
          },
          enumerable: true
        },
        DefaultClause: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.DefaultClause;
          },
          enumerable: true
        },
        DoWhileStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.DoWhileStatement;
          },
          enumerable: true
        },
        EmptyStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.EmptyStatement;
          },
          enumerable: true
        },
        ExportDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExportDeclaration;
          },
          enumerable: true
        },
        ExportMapping: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExportMapping;
          },
          enumerable: true
        },
        ExportMappingList: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExportMappingList;
          },
          enumerable: true
        },
        ExportSpecifier: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExportSpecifier;
          },
          enumerable: true
        },
        ExportSpecifierSet: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExportSpecifierSet;
          },
          enumerable: true
        },
        ExportStar: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExportStar;
          },
          enumerable: true
        },
        ExpressionStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ExpressionStatement;
          },
          enumerable: true
        },
        Finally: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.Finally;
          },
          enumerable: true
        },
        ForInStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ForInStatement;
          },
          enumerable: true
        },
        ForOfStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ForOfStatement;
          },
          enumerable: true
        },
        ForStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ForStatement;
          },
          enumerable: true
        },
        FormalParameterList: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.FormalParameterList;
          },
          enumerable: true
        },
        FunctionDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.FunctionDeclaration;
          },
          enumerable: true
        },
        FunctionExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.FunctionExpression;
          },
          enumerable: true
        },
        GeneratorComprehension: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.GeneratorComprehension;
          },
          enumerable: true
        },
        GetAccessor: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.GetAccessor;
          },
          enumerable: true
        },
        IdentifierExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.IdentifierExpression;
          },
          enumerable: true
        },
        IfStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.IfStatement;
          },
          enumerable: true
        },
        ImportBinding: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ImportBinding;
          },
          enumerable: true
        },
        ImportDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ImportDeclaration;
          },
          enumerable: true
        },
        ImportSpecifier: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ImportSpecifier;
          },
          enumerable: true
        },
        ImportSpecifierSet: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ImportSpecifierSet;
          },
          enumerable: true
        },
        LabelledStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.LabelledStatement;
          },
          enumerable: true
        },
        LiteralExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.LiteralExpression;
          },
          enumerable: true
        },
        MemberExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.MemberExpression;
          },
          enumerable: true
        },
        MemberLookupExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.MemberLookupExpression;
          },
          enumerable: true
        },
        ModuleDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ModuleDeclaration;
          },
          enumerable: true
        },
        ModuleDefinition: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ModuleDefinition;
          },
          enumerable: true
        },
        ModuleExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ModuleExpression;
          },
          enumerable: true
        },
        ModuleRequire: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ModuleRequire;
          },
          enumerable: true
        },
        ModuleSpecifier: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ModuleSpecifier;
          },
          enumerable: true
        },
        NameStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.NameStatement;
          },
          enumerable: true
        },
        NewExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.NewExpression;
          },
          enumerable: true
        },
        ObjectLiteralExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ObjectLiteralExpression;
          },
          enumerable: true
        },
        ObjectPattern: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ObjectPattern;
          },
          enumerable: true
        },
        ObjectPatternField: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ObjectPatternField;
          },
          enumerable: true
        },
        ParenExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ParenExpression;
          },
          enumerable: true
        },
        PostfixExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.PostfixExpression;
          },
          enumerable: true
        },
        PredefinedType: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.PredefinedType;
          },
          enumerable: true
        },
        Program: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.Program;
          },
          enumerable: true
        },
        PropertyMethodAssignment: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.PropertyMethodAssignment;
          },
          enumerable: true
        },
        PropertyNameAssignment: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.PropertyNameAssignment;
          },
          enumerable: true
        },
        PropertyNameShorthand: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.PropertyNameShorthand;
          },
          enumerable: true
        },
        RestParameter: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.RestParameter;
          },
          enumerable: true
        },
        ReturnStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ReturnStatement;
          },
          enumerable: true
        },
        SetAccessor: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.SetAccessor;
          },
          enumerable: true
        },
        SpreadExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.SpreadExpression;
          },
          enumerable: true
        },
        SpreadPatternElement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.SpreadPatternElement;
          },
          enumerable: true
        },
        SuperExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.SuperExpression;
          },
          enumerable: true
        },
        SwitchStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.SwitchStatement;
          },
          enumerable: true
        },
        SyntaxErrorTree: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.SyntaxErrorTree;
          },
          enumerable: true
        },
        TemplateLiteralExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.TemplateLiteralExpression;
          },
          enumerable: true
        },
        TemplateLiteralPortion: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.TemplateLiteralPortion;
          },
          enumerable: true
        },
        TemplateSubstitution: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.TemplateSubstitution;
          },
          enumerable: true
        },
        ThisExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ThisExpression;
          },
          enumerable: true
        },
        ThrowStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.ThrowStatement;
          },
          enumerable: true
        },
        TryStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.TryStatement;
          },
          enumerable: true
        },
        TypeName: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.TypeName;
          },
          enumerable: true
        },
        UnaryExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.UnaryExpression;
          },
          enumerable: true
        },
        VariableDeclaration: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.VariableDeclaration;
          },
          enumerable: true
        },
        VariableDeclarationList: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.VariableDeclarationList;
          },
          enumerable: true
        },
        VariableStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.VariableStatement;
          },
          enumerable: true
        },
        WhileStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.WhileStatement;
          },
          enumerable: true
        },
        WithStatement: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.WithStatement;
          },
          enumerable: true
        },
        YieldExpression: {
          get: function() {
            return $___src_syntax_trees_ParseTrees_js.YieldExpression;
          },
          enumerable: true
        },
        ParseTree: {
          get: function() {
            return $___src_syntax_trees_ParseTree_js.ParseTree;
          },
          enumerable: true
        },
        ParseTreeType: {
          get: function() {
            return ParseTreeType;
          },
          enumerable: true
        }
      }));
    }).call(this);
    return Object.preventExtensions(Object.create(null, {
      IdentifierToken: {
        get: function() {
          return $___src_syntax_IdentifierToken_js.IdentifierToken;
        },
        enumerable: true
      },
      LiteralToken: {
        get: function() {
          return $___src_syntax_LiteralToken_js.LiteralToken;
        },
        enumerable: true
      },
      Parser: {
        get: function() {
          return $___src_syntax_Parser_js.Parser;
        },
        enumerable: true
      },
      ParseTreeValidator: {
        get: function() {
          return $___src_syntax_ParseTreeValidator_js.ParseTreeValidator;
        },
        enumerable: true
      },
      ParseTreeVisitor: {
        get: function() {
          return $___src_syntax_ParseTreeVisitor_js.ParseTreeVisitor;
        },
        enumerable: true
      },
      Scanner: {
        get: function() {
          return $___src_syntax_Scanner_js.Scanner;
        },
        enumerable: true
      },
      SourceFile: {
        get: function() {
          return $___src_syntax_SourceFile_js.SourceFile;
        },
        enumerable: true
      },
      Token: {
        get: function() {
          return $___src_syntax_Token_js.Token;
        },
        enumerable: true
      },
      TokenType: {
        get: function() {
          return TokenType;
        },
        enumerable: true
      },
      trees: {
        get: function() {
          return trees;
        },
        enumerable: true
      }
    }));
  }).call(this);
  var outputgeneration = (function() {
    return Object.preventExtensions(Object.create(null, {
      ParseTreeWriter: {
        get: function() {
          return $___src_outputgeneration_ParseTreeWriter_js.ParseTreeWriter;
        },
        enumerable: true
      },
      ParseTreeMapWriter: {
        get: function() {
          return $___src_outputgeneration_ParseTreeMapWriter_js.ParseTreeMapWriter;
        },
        enumerable: true
      },
      ProjectWriter: {
        get: function() {
          return $___src_outputgeneration_ProjectWriter_js.ProjectWriter;
        },
        enumerable: true
      },
      SourceMapConsumer: {
        get: function() {
          return $___src_outputgeneration_SourceMapIntegration_js.SourceMapConsumer;
        },
        enumerable: true
      },
      SourceMapGenerator: {
        get: function() {
          return $___src_outputgeneration_SourceMapIntegration_js.SourceMapGenerator;
        },
        enumerable: true
      },
      TreeWriter: {
        get: function() {
          return $___src_outputgeneration_TreeWriter_js.TreeWriter;
        },
        enumerable: true
      }
    }));
  }).call(this);
  var codegeneration = (function() {
    var ParseTreeFactory = $___src_codegeneration_ParseTreeFactory_js;
    var module = (function() {
      return Object.preventExtensions(Object.create(null, {ModuleRequireVisitor: {
          get: function() {
            return $___src_codegeneration_module_ModuleRequireVisitor_js.ModuleRequireVisitor;
          },
          enumerable: true
        }}));
    }).call(this);
    return Object.preventExtensions(Object.create(null, {
      Compiler: {
        get: function() {
          return $___src_codegeneration_Compiler_js.Compiler;
        },
        enumerable: true
      },
      ModuleTransformer: {
        get: function() {
          return $___src_codegeneration_ModuleTransformer_js.ModuleTransformer;
        },
        enumerable: true
      },
      ParseTreeTransformer: {
        get: function() {
          return $___src_codegeneration_ParseTreeTransformer_js.ParseTreeTransformer;
        },
        enumerable: true
      },
      ProgramTransformer: {
        get: function() {
          return $___src_codegeneration_ProgramTransformer_js.ProgramTransformer;
        },
        enumerable: true
      },
      CloneTreeTransformer: {
        get: function() {
          return $___src_codegeneration_CloneTreeTransformer_js.CloneTreeTransformer;
        },
        enumerable: true
      },
      ParseTreeFactory: {
        get: function() {
          return ParseTreeFactory;
        },
        enumerable: true
      },
      parseExpression: {
        get: function() {
          return $___src_codegeneration_PlaceholderParser_js.parseExpression;
        },
        enumerable: true
      },
      parseStatement: {
        get: function() {
          return $___src_codegeneration_PlaceholderParser_js.parseStatement;
        },
        enumerable: true
      },
      module: {
        get: function() {
          return module;
        },
        enumerable: true
      }
    }));
  }).call(this);
  var modules = $___src_runtime_modules_js;
  return Object.preventExtensions(Object.create(null, {
    options: {
      get: function() {
        return options;
      },
      enumerable: true
    },
    generateNameForUrl: {
      get: function() {
        return generateNameForUrl;
      },
      enumerable: true
    },
    getModuleForTesting: {
      get: function() {
        return getModuleForTesting;
      },
      enumerable: true
    },
    assert: {
      get: function() {
        return assert;
      },
      enumerable: true
    },
    WebPageProject: {
      get: function() {
        return $___src_WebPageProject_js.WebPageProject;
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
}).call(this);
