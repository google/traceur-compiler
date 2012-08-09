class B {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class C extends B {
  // No constructor
}

var c = new B(1, 2);
assertEquals(1, c.x);
assertEquals(2, c.y);

assertFalse(
    Object.getOwnPropertyDescriptor(B.prototype, 'constructor').enumerable);
assertFalse(
    Object.getOwnPropertyDescriptor(C.prototype, 'constructor').enumerable);

// Ensure that we don't try to call super() in the default constructor.
class D extends null {}
var d = new D();


class E extends function(x) {
  this.x = x;
} {}

var e = new E(42)
assertEquals(42, e.x);
