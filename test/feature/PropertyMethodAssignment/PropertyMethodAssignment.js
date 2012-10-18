var object = {
  x: {
    j() {
      return this.j;
    }
  },
  f() {
    return this.f;
  },
  'g'() {},
  "h"() {},
  42() {},
  null() {},
  true() {},
  false() {},
  function() {},
  var() {},
  'class'() {}  // NodeJS incorrectly flags {class: ...} as an error.
};

// ----------------------------------------------------------------------------

assertArrayEquals([
  '42',
  'x',
  'f',
  'g',
  'h',
  'null',
  'true',
  'false',
  'function',
  'var',
  'class'
], Object.keys(object));

function assertMethod(object, name) {
  assertTrue(object.hasOwnProperty(name));
  var descriptor = Object.getOwnPropertyDescriptor(object, name);
  assertEquals('object', typeof descriptor);
  assertTrue(descriptor.enumerable);
  assertEquals('function', typeof object[name]);
  assertEquals('', object[name].name);
}

assertMethod(object, 'f');
assertMethod(object, 'g');
assertMethod(object, 'h');
assertMethod(object, '42');
assertMethod(object, 'null');
assertMethod(object, 'true');
assertMethod(object, 'false');
assertMethod(object, 'function');
assertMethod(object, 'var');
assertMethod(object, 'class');

assertEquals(object.f, object.f());

// Test the nested object.
assertArrayEquals(['j'], Object.keys(object.x));
assertMethod(object.x, 'j');

// Test name binding.
var m = 42;
class C {
  m() {
    return m;
  }
}
assertEquals(42, new C().m())
