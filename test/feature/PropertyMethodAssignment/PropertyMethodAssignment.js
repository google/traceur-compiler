var object = {
  x: {
    j() {
      return j;
    }
  },
  f() {
    return f;
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

assertArrayEquals(['x'], Object.keys(object));

function assertMethod(object, name) {
  assertTrue(object.hasOwnProperty(name));
  var descriptor = Object.getOwnPropertyDescriptor(object, name);
  assertEquals('object', typeof descriptor);
  assertFalse(descriptor.enumerable);
  assertEquals('function', typeof object[name]);
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
assertArrayEquals([], Object.keys(object.x));
assertMethod(object.x, 'j');
