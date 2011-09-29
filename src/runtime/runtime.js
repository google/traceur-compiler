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
  var defineProperty = Object.defineProperty;
  var bind = Function.prototype.bind;
  var map = Object.create(null);

  // Associates the instance maker with the class.
  // Used below for classes inherited from DOM elements.
  function add(name, cls, make) {
    defineProperty(make, '$class', {value: cls});
    // Firefox does not treat DOM constructors as functions so they do not have
    // a name property.
    if (!cls.name) {
      defineProperty(cls, 'name', {value: name});
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
      defineProperty(proto, 'constructor', {
        value: ctor,
        enumerable: false,
        configurable: true,
        writable: true
      });
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
      defineProperty(TheClass, '$init', {value: finit});
    }
    if (make) {
      // TODO(arv): Remove?
      defineProperty(TheClass, '$new', {value: make});
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

  // Add iterator support to arrays.
  defineProperty(Array.prototype, traceur.syntax.PredefinedName.ITERATOR, {
    value: function() {
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
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  var pushItem = Array.prototype.push.call.bind(Array.prototype.push);
  var pushArray = Array.prototype.push.apply.bind(Array.prototype.push);
  var slice = Array.prototype.slice.call.bind(Array.prototype.slice);

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
      Object.defineProperty(object, name, {enumerable: false});
    });
    return object;
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

  // Return the traceur namespace.
  return {
    createClass: createClass,
    createTrait: createTrait,
    Deferred: Deferred,
    markMethods: markMethods,
    spread: spread,
    spreadNew: spreadNew,
    superCall: superCall,
    superGet: superGet
  };
})();

var Deferred = traceur.runtime.Deferred;
