class SpreadTestClass {
  self = null;
  x = null;
  y = null;
  SpreadTestClass = SpreadTestClass;
  constructor(x, y) {
    this.self = this;
    this.x = x;
    this.y = y;
  }
}

var object = new SpreadTestClass(...[0, 1]);

// ----------------------------------------------------------------------------

assertEquals(object.x, 0);
assertEquals(object.y, 1);
assertEquals(object.self, object);
assertTrue(object instanceof object.SpreadTestClass);
