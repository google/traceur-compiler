class B {
  constructor() {
    this._y = {v: 321};
  }
  set x(value) {
    this._x = value;
  }
  get x() {
    return this._y;
  }
  getX() {
    return this._x;
  }
  getV() {
    return this._y.v}
}

class C extends B {
  constructor() {
    super();
  }
  set x(value) {
    super.x = value;
  }
  set v(value) {
    return super.x.v = value;
  }
}

var c = new C;
c.x = 42;
assertEquals(42, c.getX());

c.v = 123;
assertEquals(123, c.getV());