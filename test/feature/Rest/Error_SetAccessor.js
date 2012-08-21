// Should not compile.
// Error: :5:9: 'identifier' expected

var object = {
  set x(...rest) {
    // rest is not allowed for set accessor
  }
};
