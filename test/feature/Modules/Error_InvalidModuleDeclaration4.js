// Should not compile.
// Error: 'd' is not a module

module a {
  module b {}
  var d = {b};
  module c from d;
}
