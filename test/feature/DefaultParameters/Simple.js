function f(a = 1, b = 2) {
  return a + b;
}

assertEquals(0, f.length);
assertEquals(3, f());
assertEquals(6, f(4));
assertEquals(24, f(8, 16));

function g(a, b = a) {
  return a + b;
}

assertEquals(1, g.length);
assertEquals(4, g(2));
assertEquals(5, g(2, 3));

function C(obj = this) {
  this.obj = obj;
}

assertEquals(0, C.length);

var c = new C;
assertEquals(c, c.obj);

var c2 = new C(42);
assertEquals(42, c2.obj);
