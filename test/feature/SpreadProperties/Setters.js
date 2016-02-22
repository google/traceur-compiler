// Options: --spread-properties

function fail() {
  assert.isTrue(false, 'unreachable');
}

var o;
assert.deepEqual({set a(x) {fail()}, ...{a: 'a'}}, {a: 'a'});
assert.deepEqual(o = {a: 'a', ...{set a(x) {fail()}}}, {a: undefined});
o.a = 'b';
assert.equal(o.a, 'b');

var n = 0;
var o;
assert.deepEqual(o = {a: 'a', ...{get a() { n++; return 'b'; }}}, {a: 'b'});
assert.equal(1, n);
assert.equal(o.a, 'b');
assert.equal(1, n);
