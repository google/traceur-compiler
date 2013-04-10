// Should not compile.
// Error: :6:15: ')' expected

var object = {
  // Default parameters are not allowed on setters.
  set x(value = 42) {}
}