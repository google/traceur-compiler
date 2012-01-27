// Copyright 2012 Google Inc.
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

// Shim for DOM class declarations to be included before
// including compiled classes which derive from the DOM

function HTMLH1HeadingElement() {}
function HTMLH2HeadingElement() {}
function HTMLH3HeadingElement() {}
function HTMLH4HeadingElement() {}
function HTMLH5HeadingElement() {}
function HTMLH6HeadingElement() {}

try {
  HTMLH1HeadingElement.prototype = HTMLHeadingElement.prototype;
  HTMLH2HeadingElement.prototype = HTMLHeadingElement.prototype;
  HTMLH3HeadingElement.prototype = HTMLHeadingElement.prototype;
  HTMLH4HeadingElement.prototype = HTMLHeadingElement.prototype;
  HTMLH5HeadingElement.prototype = HTMLHeadingElement.prototype;
  HTMLH6HeadingElement.prototype = HTMLHeadingElement.prototype;
} catch (e) {
}


/**
 * The traceur runtime.
 */
var traceur = traceur || {};
traceur.runtime = (function() {
  'use strict';
  var $create = Object.create;
  var $defineProperty = Object.defineProperty;
  var $freeze = Object.freeze;
  var $getOwnPropertyNames = Object.getOwnPropertyNames;
  var $call = Function.prototype.call.bind(Function.prototype.call);
  var $hasOwnProperty = Object.prototype.hasOwnProperty;

  var bind = Function.prototype.bind;
  var map = $create(null);

  // Associates the instance maker with the class.
  // Used below for classes inherited from DOM elements.
  function add(name, cls, make) {
    $defineProperty(make, '$class', {value: cls});
    // Firefox does not treat DOM constructors as functions so they do not have
    // a name property.
    if (!cls.name) {
      $defineProperty(cls, 'name', {value: name});
    }
    map[name] = make;
  }

  // AUTO-GENERATED
  try {add('Array', Array, function() {return new Array();});}catch (e) {}
  try {add('Date', Date, function() {return new Date();});}catch (e) {}
  try {add('Event', Event, function() {return document.createEvent('Event');});}catch (e) {}
  try {add('HTMLAnchorElement', HTMLAnchorElement, function() {return document.createElement('a');});}catch (e) {}
  try {add('HTMLAreaElement', HTMLAreaElement, function() {return document.createElement('area');});}catch (e) {}
  try {add('HTMLAudioElement', HTMLAudioElement, function() {return document.createElement('audio');});}catch (e) {}
  try {add('HTMLBRElement', HTMLBRElement, function() {return document.createElement('br');});}catch (e) {}
  try {add('HTMLBaseElement', HTMLBaseElement, function() {return document.createElement('base');});}catch (e) {}
  try {add('HTMLBlockquoteElement', HTMLBlockquoteElement, function() {return document.createElement('blockquote');});}catch (e) {}
  try {add('HTMLBodyElement', HTMLBodyElement, function() {return document.createElement('body');});}catch (e) {}
  try {add('HTMLButtonElement', HTMLButtonElement, function() {return document.createElement('button');});}catch (e) {}
  try {add('HTMLCanvasElement', HTMLCanvasElement, function() {return document.createElement('canvas');});}catch (e) {}
  try {add('HTMLDListElement', HTMLDListElement, function() {return document.createElement('dl');});}catch (e) {}
  try {add('HTMLDivElement', HTMLDivElement, function() {return document.createElement('div');});}catch (e) {}
  try {
    try {
      // Feature test for native Component Model subclassing.
      HTMLElement.call =  Function.prototype.call;
      HTMLElement.apply = Function.prototype.apply;
      new HTMLElement();
    }catch(featureTestException) {
      // Else, hack in "generic" element support for constructing HTMLElement.
      add('HTMLElement', HTMLElement, function() {return document.createElement('span');});
    }
  }catch (e) {}
  try {add('HTMLEmbedElement', HTMLEmbedElement, function() {return document.createElement('embed');});}catch (e) {}
  try {add('HTMLFieldSetElement', HTMLFieldSetElement, function() {return document.createElement('fieldset');});}catch (e) {}
  try {add('HTMLFormElement', HTMLFormElement, function() {return document.createElement('form');});}catch (e) {}
  try {add('HTMLH1HeadingElement', HTMLH1HeadingElement, function() {return document.createElement('h1');});}catch (e) {}
  try {add('HTMLH2HeadingElement', HTMLH2HeadingElement, function() {return document.createElement('h2');});}catch (e) {}
  try {add('HTMLH3HeadingElement', HTMLH3HeadingElement, function() {return document.createElement('h3');});}catch (e) {}
  try {add('HTMLH4HeadingElement', HTMLH4HeadingElement, function() {return document.createElement('h4');});}catch (e) {}
  try {add('HTMLH5HeadingElement', HTMLH5HeadingElement, function() {return document.createElement('h5');});}catch (e) {}
  try {add('HTMLH6HeadingElement', HTMLH6HeadingElement, function() {return document.createElement('h6');});}catch (e) {}
  try {add('HTMLHRElement', HTMLHRElement, function() {return document.createElement('hr');});}catch (e) {}
  try {add('HTMLHeadElement', HTMLHeadElement, function() {return document.createElement('head');});}catch (e) {}
  try {add('HTMLHeadingElement', HTMLHeadingElement, function() {return document.createElement('h1');});}catch (e) {}
  try {add('HTMLHtmlElement', HTMLHtmlElement, function() {return document.createElement('html');});}catch (e) {}
  try {add('HTMLIFrameElement', HTMLIFrameElement, function() {return document.createElement('iframe');});}catch (e) {}
  try {add('HTMLImageElement', HTMLImageElement, function() {return document.createElement('img');});}catch (e) {}
  try {add('HTMLInputElement', HTMLInputElement, function() {return document.createElement('input');});}catch (e) {}
  try {add('HTMLLIElement', HTMLLIElement, function() {return document.createElement('li');});}catch (e) {}
  try {add('HTMLLabelElement', HTMLLabelElement, function() {return document.createElement('label');});}catch (e) {}
  try {add('HTMLLegendElement', HTMLLegendElement, function() {return document.createElement('legend');});}catch (e) {}
  try {add('HTMLLinkElement', HTMLLinkElement, function() {return document.createElement('link');});}catch (e) {}
  try {add('HTMLMapElement', HTMLMapElement, function() {return document.createElement('map');});}catch (e) {}
  try {add('HTMLMenuElement', HTMLMenuElement, function() {return document.createElement('menu');});}catch (e) {}
  try {add('HTMLMetaElement', HTMLMetaElement, function() {return document.createElement('meta');});}catch (e) {}
  try {add('HTMLMeterElement', HTMLMeterElement, function() {return document.createElement('meter');});}catch (e) {}
  try {add('HTMLModElement', HTMLModElement, function() {return document.createElement('del');});}catch (e) {}
  try {add('HTMLOListElement', HTMLOListElement, function() {return document.createElement('ol');});}catch (e) {}
  try {add('HTMLObjectElement', HTMLObjectElement, function() {return document.createElement('object');});}catch (e) {}
  try {add('HTMLOptGroupElement', HTMLOptGroupElement, function() {return document.createElement('optgroup');});}catch (e) {}
  try {add('HTMLOptionElement', HTMLOptionElement, function() {return document.createElement('option');});}catch (e) {}
  try {add('HTMLOutputElement', HTMLOutputElement, function() {return document.createElement('output');});}catch (e) {}
  try {add('HTMLParagraphElement', HTMLParagraphElement, function() {return document.createElement('p');});}catch (e) {}
  try {add('HTMLParamElement', HTMLParamElement, function() {return document.createElement('param');});}catch (e) {}
  try {add('HTMLPreElement', HTMLPreElement, function() {return document.createElement('pre');});}catch (e) {}
  try {add('HTMLProgressElement', HTMLProgressElement, function() {return document.createElement('progress');});}catch (e) {}
  try {add('HTMLQuoteElement', HTMLQuoteElement, function() {return document.createElement('q');});}catch (e) {}
  try {add('HTMLScriptElement', HTMLScriptElement, function() {return document.createElement('script');});}catch (e) {}
  try {add('HTMLSelectElement', HTMLSelectElement, function() {return document.createElement('select');});}catch (e) {}
  try {add('HTMLSourceElement', HTMLSourceElement, function() {return document.createElement('source');});}catch (e) {}
  try {add('HTMLStyleElement', HTMLStyleElement, function() {return document.createElement('style');});}catch (e) {}
  try {add('HTMLTableCaptionElement', HTMLTableCaptionElement, function() {return document.createElement('caption');});}catch (e) {}
  try {add('HTMLTableCellElement', HTMLTableCellElement, function() {return document.createElement('td');});}catch (e) {}
  try {add('HTMLTableColElement', HTMLTableColElement, function() {return document.createElement('col');});}catch (e) {}
  try {add('HTMLTableElement', HTMLTableElement, function() {return document.createElement('table');});}catch (e) {}
  try {add('HTMLTableRowElement', HTMLTableRowElement, function() {return document.createElement('tr');});}catch (e) {}
  try {add('HTMLTableSectionElement', HTMLTableSectionElement, function() {return document.createElement('tbody');});}catch (e) {}
  try {add('HTMLTextAreaElement', HTMLTextAreaElement, function() {return document.createElement('textarea');});}catch (e) {}
  try {add('HTMLTitleElement', HTMLTitleElement, function() {return document.createElement('title');});}catch (e) {}
  try {add('HTMLUListElement', HTMLUListElement, function() {return document.createElement('ul');});}catch (e) {}
  try {add('HTMLVideoElement', HTMLVideoElement, function() {return document.createElement('video');});}catch (e) {}
  try {add('KeyboardEvent', KeyboardEvent, function() {return document.createEvent('KeyboardEvent');});}catch (e) {}
  try {add('MouseEvent', MouseEvent, function() {return document.createEvent('MouseEvents');});}catch (e) {}
  try {add('MutationEvent', MutationEvent, function() {return document.createEvent('MutationEvents');});}catch (e) {}
  try {add('RegExp', RegExp, function() {return new RegExp();});}catch (e) {}
  try {add('SVGZoomEvent', SVGZoomEvent, function() {return document.createEvent('SVGZoomEvents');});}catch (e) {}
  try {add('String', String, function() {return new String();});}catch (e) {}
  try {add('Text', Text, function() {return document.createTextNode('');});}catch (e) {}
  try {add('TextEvent', TextEvent, function() {return document.createEvent('TextEvent');});}catch (e) {}
  try {add('UIEvent', UIEvent, function() {return document.createEvent('UIEvents');});}catch (e) {}
  // END AUTO-GENERATED

  /**
   * Combines mixins with the current class, issuing errors for conflicts or
   * missing requires.
   *
   * @param {Object} proto the prototype for the class we're creating.
   * @param {Array.<Object>} mixins the set of traits to mix in.
   * @return {Object} the trait to set into new instances with defineProperties.
   */
  function analyzeMixins(proto, mixins) {
    var trait = traceur.runtime.trait;
    mixins = trait.compose.apply(null, mixins);
    var properties = {};
    Object.getOwnPropertyNames(mixins).forEach(function(name) {
      var pd = mixins[name];
      // check for remaining 'required' properties
      // Note: it's OK for the prototype to provide the properties
      if (pd.required) {
        if (!(name in proto)) {
          throw new TypeError('Missing required property: ' + name);
        }
      } else if (pd.conflict) { // check for remaining conflicting properties
        throw new TypeError('Remaining conflicting property: ' + name);
      } else {
        properties[name] = pd;
      }
    });
    return properties;
  }

  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }

  var method = nonEnum;

  // Harmony String Extras
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
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
      return this.indexOf(s) !== -1;
    }),
    toArray: method(function() {
      return this.split('');
    })
  });

  // The createClass function
  // name: the class name
  // base: the base class
  // make: the function to create instance of the class
  //       i.e. function() { return document.createElement('div'); }
  // ctor: the constructor function
  // proto: the prototype object (containing instance methods, properties)
  // initS: the function to initialize class static members
  // mixins: Traits to mixin to this class
  function createClass(name, base, make, ctor, init, proto, initS, mixins) {
    if (base) {
      if (typeof base != 'function' && typeof base.prototype != 'object') {
        throw new TypeError(
            'Base class of ' + name +
            ' must be a function (' + typeof base + ')');
      }
    } else {
      base = Object;
    }
    make = make || base.$new;

    if (!make && base.name) {
      var dom = map[base.name];
      if (dom && dom.$class === base) {
        make = dom;
      }
    }

    var binit = base.$init;
    var finit = binit ?
        (init ? function() { binit.call(this); init.call(this); } : binit) :
        init;
    if (ctor) {
      $defineProperty(proto, 'constructor', method(ctor));
    } else {
      ctor = proto.constructor;
    }

    proto.__proto__ = base.prototype;

    if (mixins) {
      mixins = analyzeMixins(proto, mixins);
    }

    function TheClass() {
      var $this = make ? make() : this;
      $this.__proto__ = TheClass.prototype;
      if (mixins) { Object.defineProperties($this, mixins); }
      if (finit) { finit.call($this); }
      if (ctor) { ctor.apply($this, arguments); }
      return $this;
    }

    TheClass.prototype = proto;

    if (finit) {
      // TODO(arv): Remove?
      $defineProperty(TheClass, '$init', {value: finit});
    }
    if (make) {
      // TODO(arv): Remove?
      $defineProperty(TheClass, '$new', {value: make});
    }
    if (initS) { initS.call(TheClass); }
    return TheClass;
  }

  function createTrait(parts, mixins) {
    var trait = traceur.runtime.trait;
    parts = trait(parts);
    if (mixins) {
      parts = trait.override(parts, trait.compose.apply(null, mixins));
    }
    return parts;
  }

  function superCall($class, name, args) {
    var proto = Object.getPrototypeOf($class.prototype);
    while (proto) {
      var p = Object.getOwnPropertyDescriptor(proto, name);
      if (p) {
        if (p.hasOwnProperty('value')) {
          return p.value.apply(this, args);
        }
        if (p.hasOwnProperty('get')) {
          return p.get.apply(this, args);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    throw new TypeError("Object has no method '" + name + "'.");
  }

  function superGet($class, name) {
    var proto = Object.getPrototypeOf($class.prototype);
    while (proto) {
      var p = Object.getOwnPropertyDescriptor(proto, name);
      if (p) {
        if (p.hasOwnProperty('value')) {
          return p.value;
        }
        if (p.hasOwnProperty('get')) {
          return p.get.call(this);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    return undefined;
  }

  var pushItem = Array.prototype.push.call.bind(Array.prototype.push);
  var pushArray = Array.prototype.push.apply.bind(Array.prototype.push);
  var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);

  /**
   * Spreads the elements in {@code items} into a single array.
   * @param {Array} items Array of interleaving booleans and values.
   * @return {Array}
   */
  function spread(items) {
    var retval = [];
    for (var i = 0; i < items.length; i += 2) {
      if (items[i]) {
        if (items[i + 1] == null)
          continue;
        if (typeof items[i + 1] != 'object')
          throw TypeError('Spread expression has wrong type');
        pushArray(retval, slice(items[i + 1]));
      } else {
        pushItem(retval, items[i + 1]);
      }
    }
    return retval;
  }

  /**
   * @param {Function} ctor
   * @param {Array} items Array of interleaving booleans and values.
   * @return {Object}
   */
  function spreadNew(ctor, items) {
    var args = spread(items);
    args.unshift(null);
    var retval = new (bind.apply(ctor, args));
    return retval && typeof retval == 'object' ? retval : object;
  };

  /**
   * Marks properties as non enumerable.
   * @param {Object} object
   * @param {Array.<string>} names
   * @return {Object}
   */
  function markMethods(object, names) {
    names.forEach(function(name) {
      $defineProperty(object, name, {enumerable: false});
    });
    return object;
  }

  /**
   * The default quasi function which just concats the quasi literal parts.
   * @param {{raw: Array.<string>, cooked: Array.<string>}} callSiteId
   * @param {...} var_args Values from the quasi substitutions.
   * @return {string}
   */
  function defaultQuasi(callSiteId, var_args) {
    var cookedStrings = callSiteId.cooked;
    var cookedStringsLength = cookedStrings.length;
    var out = [], k = 0;
    var argumentLength = arguments.length;
    for (var i = 0; i < cookedStringsLength;) {
      out[k++] = cookedStrings[i];
      if (++i < argumentLength)
        out[k++] = String(arguments[i]);
    }
    return out.join('');
  }

  var counter = 0;

  /**
   * Generates a new unique string.
   * @return {string}
   */
  function newUniqueString() {
    return ' @' + ++counter + Math.random();
  }

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

  // Private name.

  // Collection getters and setters
  var elementDeleteName = new Name();
  var elementGetName = new Name();
  var elementSetName = new Name();

  // HACK: We should use runtime/modules/std/name.js or something like that.
  var NameModule = $freeze({
    create: function(str) {
      return new Name(str);
    },
    isName: function(x) {
      return x instanceof Name;
    },
    elementGet: elementGetName,
    elementSet: elementSetName,
    elementDelete: elementDeleteName
  });

  var nameRe = /^ @/;

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

  function elementDelete(object, name) {
    if (hasPrivateNameProperty(object, elementDeleteName))
      return getProperty(object, elementDeleteName).call(object, name);
    return deleteProperty(object, name);
  }

  function elementGet(object, name) {
    if (hasPrivateNameProperty(object, elementGetName))
      return getProperty(object, elementGetName).call(object, name);
    return getProperty(object, name);
  }

  function elementGetCall(object, name, args) {
    return elementGet(object, name).apply(object, args);
  }

  function elementHas(object, name) {
    // Should we allow trapping this too?
    return has(object, name);
  }

  function elementSet(object, name, value) {
    if (hasPrivateNameProperty(object, elementSetName))
      getProperty(object, elementSetName).call(object, name, value);
    else
      setProperty(object, name, value);
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
  }

  function $getPropertyDescriptor(obj, name) {
    while (obj !== null) {
      var result = Object.getOwnPropertyDescriptor(obj, name);
      if (result)
        return result;
      obj = Object.getPrototypeOf(obj);
    }
    return undefined;
  }

  function getPropertyDescriptor(obj, name) {
    if (NameModule.isName(name))
      return undefined;
    assertNotName(name);
    return $getPropertyDescriptor(obj, name);
  }

  $defineProperty(Object, 'defineProperty', {value: defineProperty});
  $defineProperty(Object, 'deleteProperty', method(deleteProperty));
  $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
  $defineProperty(Object, 'getProperty', method(getProperty));
  $defineProperty(Object, 'getPropertyDescriptor',
                  method(getPropertyDescriptor));
  $defineProperty(Object, 'has', method(has));
  $defineProperty(Object, 'setProperty', method(setProperty));
  $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});

  // is and isnt

  // Unlike === this returns true for (NaN, NaN) and false for (0, -0).
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }

  function isnt(left, right) {
    return !is(left, right);
  }

  $defineProperty(Object, 'is', method(is));

  // Iterators.
  var iteratorName = NameModule.create('iterator');

  /**
   * This is used to tag the return value from a generator.
   * @type Name
   */
  var generatorName = NameModule.create();

  var IterModule = {
    get iterator() {
      return iteratorName;
    }
    // TODO: Implement the rest of @iter and move it to a different file that
    // gets compiled.
  };

  function getIterator(collection) {
    // TODO: Keep an eye on the future spec to see whether this should
    // do "duck typing"?
    if (getProperty(collection, generatorName))
      return collection;
    return getProperty(collection, iteratorName).call(collection);
  }

  function markAsGenerator(object) {
    setProperty(object, generatorName, true);
  }

  // Make arrays iterable.
  defineProperty(Array.prototype, IterModule.iterator, method(function() {
    var index = 0;
    var array = this;
    var current;
    return {
      get current() {
        return current;
      },
      moveNext: function() {
        if (index < array.length) {
          current = array[index++];
          return true;
        }
        return false;
      }
    };
  }));

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

  var modules = $freeze({
    get '@name'() {
      return NameModule;
    },
    get '@iter'() {
      return IterModule;
    }
  });

  // Return the traceur namespace.
  return {
    createClass: createClass,
    createTrait: createTrait,
    defaultQuasi: defaultQuasi,
    Deferred: Deferred,
    elementDelete: elementDelete,
    elementGet: elementGet,
    elementGetCall: elementGetCall,
    elementHas: elementHas,
    elementSet: elementSet,
    getIterator: getIterator,
    is: is,
    isnt: isnt,
    markAsGenerator: markAsGenerator,
    markMethods: markMethods,
    modules: modules,
    spread: spread,
    spreadNew: spreadNew,
    superCall: superCall,
    superGet: superGet
  };
})();

var Deferred = traceur.runtime.Deferred;

