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

assertTrue(object.hasOwnProperty('a'));
assertTrue(object.hasOwnProperty('b'));
assertTrue(object.hasOwnProperty('c'));
assertTrue(object.hasOwnProperty('d'));
assertTrue(object.hasOwnProperty('e'));
assertTrue(object.hasOwnProperty('f'));
assertTrue(object.hasOwnProperty('g'));
assertTrue(object.hasOwnProperty('h'));
assertTrue(object.hasOwnProperty('i'));
