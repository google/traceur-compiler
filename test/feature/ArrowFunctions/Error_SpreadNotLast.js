// Should not compile.
// Error: :6:17: Unexpected token ,
// Error: :6:12: Unexpected token ...

{
  let f = (...xs, x) => xs;
}