// Should not compile.
// Error: 'd' is not a module

module a {
  export module b {
    module c from d;
  }
}
