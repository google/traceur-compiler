// Should not compile.
// Error: 'c' is not a module

module a {
  export module b from c;
}
