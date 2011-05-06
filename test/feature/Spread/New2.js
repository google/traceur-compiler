function G() {}

function F(x, y, z) {
  var obj = new G;
  obj.x = x;
  obj.y = y;
  obj.z = z;
  obj.f = this;
  obj.G = G;
  obj.F = F;
  return obj;
}

var object = new F(0, ...[1, 2]);

// ----------------------------------------------------------------------------

assertEquals(0, object.x);
assertEquals(1, object.y);
assertEquals(2, object.z);
assertFalse(object instanceof object.F);
assertTrue(object instanceof object.G);
assertTrue(object.f instanceof object.F);
