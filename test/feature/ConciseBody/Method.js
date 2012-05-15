var object = {
  m() 'm',
  n(x) x
  o(y) y
};

assertEquals('m', object.m());
assertEquals(42, object.n(42));
assertEquals(43, object.o(43));
