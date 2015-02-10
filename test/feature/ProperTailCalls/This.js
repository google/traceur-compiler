// Options: --proper-tail-calls

class C {
  constructor(x) {
    this.x = x;
  }
  getX() {
    return this.x;
  }
}

var o = new C(42);

assert.equal(o.getX(), 42);

