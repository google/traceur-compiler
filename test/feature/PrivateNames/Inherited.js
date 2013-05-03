// Options: --private-names

import Name from '@name';

var n = new Name;
var p = {};
Object.defineProperty(p, n, {
  get: function() {
    return 42;
  },
  configurable: true
});

var o = Object.create(p);
assert.equal(42, o[n]);
assertThrows(function() {
  o[n] = 1;
});

var val;
Object.defineProperty(p, n, {
  set: function(v) {
    val = v;
  },
  configurable: true
});

o[n] = 33;
assert.equal(33, val);
