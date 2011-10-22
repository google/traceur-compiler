// Should not compile.
// Options: --propertyOptionalComma=false

var object = {
  get x() {
    return 42;
  }
  set x(v) {}
};
