// Should not compile.
// Disabled by default.

var object = {
  get x() {
    return 42;
  }
  set x(v) {}
};
