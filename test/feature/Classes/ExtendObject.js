var b = {
  x: 42,
  m() {
    return 'b.m';
  }
};

class C extends b {
  get x() {
    return super.x;
  }
  m() {
    return super.m();
  }
}

// ----------------------------------------------------------------------------

var c = new C;
assertTrue(c instanceof C);
assertEquals(Object.getPrototypeOf(c), C.prototype);
assertEquals(Object.getPrototypeOf(Object.getPrototypeOf(c)), b);

assertEquals(c.x, 42);
assertEquals(c.m(), 'b.m');
