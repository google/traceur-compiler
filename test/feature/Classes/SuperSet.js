class B {
  constructor() {
    this._y = {v: 321};
    this._z = 1;
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
    return this._y.v
  }

  set z(v) {
    this._z = v;
  }
  get z() {
    return this._z;
  }
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
  inc(val) {
    super.z += val;
  }
  incLookup(val) {
    super['z'] += val;
  }
}

var c = new C;
c.x = 42;
assertEquals(42, c.getX());

c.v = 123;
assertEquals(123, c.getV());

c.inc(3);
assertEquals(4, c.z);

c.incLookup(5);
assertEquals(9, c.z);