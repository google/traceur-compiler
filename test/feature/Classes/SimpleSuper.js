class SuperBase {
  m() { return 40; }
  get x () { return this.baseX; }
  set x (value) { this.baseX = value; }
  constructor() {
    this.baseC = 2;
    this.baseX = 4;
  }
}

class SuperDerived extends SuperBase {
  m() { return 41; }
  superM() { return super.m(); }
  superX() { return super.x; }
  constructor() {
    this.x = 10;
    this.derC = 3;
    super();
  }
}

// ----------------------------------------------------------------------------

var obj = new SuperDerived();
assertEquals(41, obj.m());
assertEquals(40, obj.superM());
assertEquals(4, obj.baseX);
assertEquals(4, obj.x);
assertEquals(4, obj.superX());
assertEquals(2, obj.baseC);
assertEquals(3, obj.derC);
