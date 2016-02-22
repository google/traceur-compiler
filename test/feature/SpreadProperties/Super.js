// Options: --spread-properties

var p = {
  m() {
    return 'm';
  },
  n() {
    return 'n';
  },
};

var a = {a: 'a'};
var b = {b: 'b'};

var o = {
  __proto__: p,
  ...a,
  m() {
    return super.m();
  },
  ...b,
  n() {
    return super.n();
  },
};

assert.equal(o.a, 'a');
assert.equal(o.b, 'b');
assert.equal(o.m(), 'm');
assert.equal(o.n(), 'n');
