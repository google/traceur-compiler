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
  superM() {
    return (function() {
      return super.m();
    })();
  }
  superX() {
    return (function() {
      return super.x;
    })();
  }
  superX2() {
    return (function() {
      return (function() {
        return super.x;
      })();
    })();
  }
  superX2F() {
    return function() {
      return (function() {
        return super.x;
      })();
    };
  }
  get superXprop() {
    return (function() {
      return super.x;
    })();
  }
  set superXprop(v) {
    return (function() {
      super.x = v;
    })();
  }
  constructor() {
    this.x = 10;
    this.derC = 3;
    (function() { super(); })();
  }
}

// ----------------------------------------------------------------------------

var obj = new SuperDerived();
assertEquals(41, obj.m());
assertEquals(40, obj.superM());

assertEquals(4, obj.baseX);
assertEquals(4, obj.x);
assertEquals(4, obj.superX());
assertEquals(4, obj.superX2());
assertEquals(4, obj.superX2F()());
assertEquals(4, obj.superXprop);

obj.superXprop = 5;
assertEquals(5, obj.baseX);
assertEquals(5, obj.x);
assertEquals(5, obj.superX());
assertEquals(5, obj.superX2());
assertEquals(5, obj.superX2F()());
assertEquals(5, obj.superXprop);

assertEquals(2, obj.baseC);
assertEquals(3, obj.derC);
