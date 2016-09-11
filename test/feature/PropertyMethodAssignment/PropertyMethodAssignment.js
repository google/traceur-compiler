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

assert.deepEqual([
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
  assert.isTrue(object.hasOwnProperty(name));
  var descriptor = Object.getOwnPropertyDescriptor(object, name);
  assert.equal('object', typeof descriptor);
  assert.isTrue(descriptor.enumerable);
  assert.equal('function', typeof object[name]);
  // IE does not have a name property on functions.
  // ES6 compliant engines will set the name of {x: function() {}} to x
  var fn = object[name].name;
  assert.include(['', undefined, name], fn);
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

assert.equal(object.f, object.f());

// Test the nested object.
assert.deepEqual(['j'], Object.keys(object.x));
assertMethod(object.x, 'j');

// Test name binding.
var m = 42;
class C {
  m() {
    return m;
  }
}
assert.equal(42, new C().m())
