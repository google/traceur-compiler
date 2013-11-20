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
function Greeter() {
  "use strict";
}
($__class)(Greeter, {sayHi: function() {
    "use strict";
    console.log('Hi!');
  }}, {});
var greeter = new Greeter();
greeter.sayHi();
