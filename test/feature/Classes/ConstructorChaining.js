class ConstructorA {
  new(x) {
    this.x = x;
  }
}

class ConstructorB : ConstructorA {
  new(x, y) {
    super(x);
    this.y = y;
  }
}

// ----------------------------------------------------------------------------

var a = new ConstructorA('ax');
assertEquals('ax', a.x);
assertFalse(a.hasOwnProperty('y'));

var b = new ConstructorB('bx', 'by');
assertEquals('bx', b.x);
assertEquals('by', b.y);
