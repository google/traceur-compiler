// Should not compile.
// Error: :6:17: ')' expected
// Error: :6:19: '=>' expected

{
  let f = (...xs, x) => xs;
}