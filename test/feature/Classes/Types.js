// Options: --types

class Typed {
  constructor(x : number) {
    this.x;
  }

  addTo(y : number) : number {
    this.x += y;
    return this.x;
  }

  get x() : number {
    return this.x;
  }

  set x(x : number) {
    this.x = x;
  }
}

assert.equal(1, new Typed(1).x);
assert.equal(2, new Typed(1).addTo(1));
