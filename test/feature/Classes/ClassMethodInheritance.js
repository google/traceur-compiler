function B() {}
B.b = function() {
  return 'B.b';
};

class C extends B {}

assertEquals(Object.getPrototypeOf(C), B);
assertEquals(Object.getPrototypeOf(C.prototype), B.prototype);

assertEquals(C.b(), 'B.b');
