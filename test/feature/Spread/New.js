function F(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.self = this;
  this.F = F;
}

var object = new F(0, ...[1, 2]);

// ----------------------------------------------------------------------------

assertEquals(0, object.x);
assertEquals(1, object.y);
assertEquals(2, object.z);
assertEquals(object, object.self);
assertTrue(object instanceof object.F);
