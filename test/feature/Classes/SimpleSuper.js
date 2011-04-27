class SuperBase {
  m() { return 40; }
  var baseX;
  get x () { return this.baseX; }
  set x (value) { this.baseX = value; }
  var baseF = 1;
  var baseC;
  new() {
    this.baseC = 2;
    this.baseX = 4;
  }
}

class SuperDerived : SuperBase {
  m() { return 41; }
  superM() { return super.m(); }
  var x = 10;
  superX() { return super.x; }
  var derC;
  new() {
    this.derC = 3;
    super();
  }
}

// ----------------------------------------------------------------------------

var obj = new SuperDerived();
assertEquals(41, obj.m());
assertEquals(40, obj.superM());
assertEquals(4, obj.baseX);
assertEquals(10, obj.x);
assertEquals(4, obj.superX());
assertEquals(1, obj.baseF);
assertEquals(2, obj.baseC);
assertEquals(3, obj.derC);
