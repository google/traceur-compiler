// Options: --symbols=false

var s = Symbol();
var s2 = Symbol();
var object = {};
o[s] = 1;
o[s2] = 2;

assert.equal(o[s], 1);
assert.equal(o[s2], 2);
