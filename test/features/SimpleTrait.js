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
