// Options: --symbols

var s = Symbol();
var p = {};
Object.defineProperty(p, s, {
  get: function() {
    return 42;
  },
  configurable: true
});

var o = Object.create(p);
assert.equal(42, o[s]);
assertThrows(function() {
  o[s] = 1;
});

var val;
Object.defineProperty(p, s, {
  set: function(v) {
    val = v;
  },
  configurable: true
});

o[s] = 33;
assert.equal(33, val);
