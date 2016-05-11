// Options: --spread-properties

var o;
assert.deepEqual({set a(x) {assert.fail()}, ...{a: 'a'}}, {a: 'a'});
assert.deepEqual(o = {a: 'a', ...{set a(x) {assert.fail()}}}, {a: undefined});
o.a = 'b';
assert.equal(o.a, 'b');

var n = 0;
var o;
assert.deepEqual(o = {a: 'a', ...{get a() { n++; return 'b'; }}}, {a: 'b'});
assert.equal(1, n);
assert.equal(o.a, 'b');
assert.equal(1, n);
