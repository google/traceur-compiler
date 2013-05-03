// Options: --cascade-expression

var object = {
  a: 'A',
  c: [0, 1, 2],
  d: {
    e: 'E'
  },
  f: function() {
    this.F = 'F';
  },
  g: function(x) {
    this.G = x;
  }
};

var result = object.{
  a = 'A2';
  b = 'B'  // ASI
  c[1] = 11;
  f();
  g('G');
  d.{
    e = 'E2'
  };
  h = 'H';
}.{
  i = 'I'
};

assert.equal(object, result);
assert.equal(object.a, 'A2');
assert.equal(object.b, 'B');
assertArrayEquals(object.c, [0, 11, 2]);
assert.equal(object.d.e, 'E2');
assert.equal(object.F, 'F');
assert.equal(object.G, 'G');
assert.equal(object.h, 'H');
assert.equal(object.i, 'I');
