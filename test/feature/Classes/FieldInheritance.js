class Point2D {
  var x = 1;
  var y = 2;
}

class Point3D : Point2D {
  var z = 3;
}

// ----------------------------------------------------------------------------

var a = new Point2D();
assertEquals(true, a.hasOwnProperty('x'));
assertEquals(true, a.hasOwnProperty('y'));
assertEquals(false, a.hasOwnProperty('z'));
assertUndefined(a.z);

var b = new Point3D();
assertEquals(true, b.hasOwnProperty('x'));
assertEquals(true, b.hasOwnProperty('y'));
assertEquals(true, b.hasOwnProperty('z'));
