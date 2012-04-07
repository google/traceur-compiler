class Point2D {
  constructor() {
    this.x = 1;
    this.y = 2;
  }
}

class Point3D extends Point2D {
  constructor() {
    super();
    this.z = 3;
  }
}

// ----------------------------------------------------------------------------

var a = new Point2D();
assertTrue(a.hasOwnProperty('x'));
assertTrue(a.hasOwnProperty('y'));
assertFalse(a.hasOwnProperty('z'));
assertUndefined(a.z);

var b = new Point3D();
assertTrue(b.hasOwnProperty('x'));
assertTrue(b.hasOwnProperty('y'));
assertTrue(b.hasOwnProperty('z'));
