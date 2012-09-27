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

assertEquals(object, result);
assertEquals(object.a, 'A2');
assertEquals(object.b, 'B');
assertArrayEquals(object.c, [0, 11, 2]);
assertEquals(object.d.e, 'E2');
assertEquals(object.F, 'F');
assertEquals(object.G, 'G');
assertEquals(object.h, 'H');
assertEquals(object.i, 'I');
