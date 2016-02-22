// Options: --spread-properties

var n = 0;
var o;
assert.deepEqual(o = {a: 'a', ...{get a() { n++; return 'b'; }}}, {a: 'b'});
assert.equal(1, n);
assert.equal(o.a, 'b');
assert.equal(1, n);
