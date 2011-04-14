class ImmutablePoint {
  x_, y_;
  get x () { return this.x_; }
  get y () { return this.y_; }
}

class MutablePoint {
  x_, y_;
  get x () { return this.x_; }
  set x (x) { this.x_ = x; }
  get y () { return this.y_; }
  set y (y) { this.y_ = y; }
}
