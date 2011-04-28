trait Equality {
  equals(other) {
    return this === other;
  }
  notEquals(other) {
    return !this.equals(other);
  }
} 

class MixinPoint {
  mixin Equality { equals : requires };

  x = 0, y = 0;

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
} 

// ----------------------------------------------------------------------------

var p1 = new MixinPoint();
var p2 = new MixinPoint();
assertTrue(p1.equals(p2));
assertFalse(p2.notEquals(p1));

p2.x = 1;
assertFalse(p2.equals(p1));
assertTrue(p2.notEquals(p1));
