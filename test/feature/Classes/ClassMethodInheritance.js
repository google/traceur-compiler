function B() {}
B.b = function() {
  return 'B.b';
};

class C extends B {}

assertEquals(Object.getPrototypeOf(C), B);
assertEquals(Object.getPrototypeOf(C.prototype), B.prototype);

assertEquals(C.b(), 'B.b');

class D extends Object {}

assertEquals(Object.getPrototypeOf(D), Object);
assertEquals(Object.getPrototypeOf(D.prototype), Object.prototype);
assertEquals(D.keys, Object.keys);

class E {}

assertEquals(Object.getPrototypeOf(E), Function.prototype);
assertEquals(Object.getPrototypeOf(E.prototype), Object.prototype);
assertFalse('keys' in E);