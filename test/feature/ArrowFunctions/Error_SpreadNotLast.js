// Should not compile.
// Error: :6:17: ')' expected
// Error: :6:12: Unexpected token ...

{
  let f = (...xs, x) => xs;
}