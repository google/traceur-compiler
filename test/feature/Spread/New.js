function F(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.self = this;
  this.F = F;
}

var object = new F(0, ...[1, 2]);

// ----------------------------------------------------------------------------

assert.equal(0, object.x);
assert.equal(1, object.y);
assert.equal(2, object.z);
assert.equal(object, object.self);
assert.isTrue(object instanceof object.F);
