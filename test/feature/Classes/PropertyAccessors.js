class ImmutablePoint {
  get x () { return this.x_; }
  get y () { return this.y_; }
}

class MutablePoint {
  get x () { return this.x_; }
  set x (x) { this.x_ = x; }
  get y () { return this.y_; }
  set y (y) { this.y_ = y; }
}

// ----------------------------------------------------------------------------

var immutable = new ImmutablePoint();
assertEquals(undefined, immutable.x);
assertEquals(undefined, immutable.y);
immutable.x_ = 10;
immutable.y_ = 20;
assertEquals(10, immutable.x);
assertEquals(20, immutable.y);
assertEquals(10, immutable.x_);
assertEquals(20, immutable.y_);

try {
  immutable.x = 11;
  fail('should not be able to set a get only property');
} catch (except) {
}
try {
  immutable.y = 11;
  fail('should not be able to set a get only property');
} catch (except) {
}
assertEquals(10, immutable.x);
assertEquals(20, immutable.y);

var mutable = new MutablePoint();
assertEquals(undefined, mutable.x);
assertEquals(undefined, mutable.y);
mutable.x_ = 10;
mutable.y_ = 20;
assertEquals(10, mutable.x);
assertEquals(20, mutable.y);
assertEquals(10, mutable.x_);
assertEquals(20, mutable.y_);

try {
  mutable.x = 11;
} catch (except) {
  fail('should be able to set a read/write property');
}
try {
  mutable.y = 12;
} catch (except) {
  fail('should be able to set a read/write property');
}
assertEquals(11, mutable.x);
assertEquals(12, mutable.y);
