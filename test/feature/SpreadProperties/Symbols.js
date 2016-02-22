// Options: --spread-properties

var s1 = Symbol();
var s2 = Symbol();

var o = {[s1]: 1, ...{[s2]: 2}};
assert.equal(o[s1], 1);
assert.equal(o[s2], 2);
