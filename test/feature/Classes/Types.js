// Options: --types

class Typed {
  constructor(x : Number) {
    this.x_ = x;
  }

  addTo(y : Number) : Number {
    this.x += y;
    return this.x;
  }

  get x() : Number {
    return this.x_;
  }

  set x(x : Number) {
    this.x_ = x;
  }
}

assert.equal(1, new Typed(1).x);
assert.equal(2, new Typed(1).addTo(1));
