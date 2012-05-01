// Should not compile.
// Error: 'd' is not a module

module a {
  module b {}
  module c from b.d;
}
