// Should not compile.
// Error: 'c' is not a module

module a {
  module b from c;
}
