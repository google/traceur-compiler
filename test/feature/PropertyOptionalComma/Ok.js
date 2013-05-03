// Options: --property-optional-comma

var object = {
  a() {}
  b() {}
  c() {},
  get d() {}
  get e() {}
  get f() {},
  set g(g) {}
  set h(h) {}
  set i(i) {},
};

// ----------------------------------------------------------------------------

assert.isTrue(object.hasOwnProperty('a'));
assert.isTrue(object.hasOwnProperty('b'));
assert.isTrue(object.hasOwnProperty('c'));
assert.isTrue(object.hasOwnProperty('d'));
assert.isTrue(object.hasOwnProperty('e'));
assert.isTrue(object.hasOwnProperty('f'));
assert.isTrue(object.hasOwnProperty('g'));
assert.isTrue(object.hasOwnProperty('h'));
assert.isTrue(object.hasOwnProperty('i'));
