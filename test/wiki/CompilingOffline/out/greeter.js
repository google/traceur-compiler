var $__Object = Object, $__ObjectPrototype = $__Object.prototype, $__Function = Function, $__FunctionPrototype = $__Function.prototype, $__defineProperty = $__Object.defineProperty, $__defineProperties = $__Object.defineProperties, $__getOwnPropertyNames = $__Object.getOwnPropertyNames, $__getOwnPropertyDescriptor = $__Object.getOwnPropertyDescriptor, $__getDescriptors = function(object) {
  var descriptors = {}, name, names = $__getOwnPropertyNames(object);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    descriptors[name] = $__getOwnPropertyDescriptor(object, name);
  }
  return descriptors;
}, $__class = function(ctor, object, staticObject) {
  $__defineProperty(object, 'constructor', {
    value: ctor,
    configurable: true,
    writable: true,
    enumerable: false
  });
  ctor.prototype = object;
  return $__defineProperties(ctor, $__getDescriptors(staticObject));
};
function Greeter() {
  "use strict";
}
$__class(Greeter, {sayHi: function() {
    "use strict";
    console.log('Hi!');
  }}, {});
var greeter = new Greeter();
greeter.sayHi();
