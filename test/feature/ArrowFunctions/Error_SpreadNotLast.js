// Should not compile.
// Options: --block-binding
// SyntaxError: feature/ArrowFunctions/Error_SpreadNotLast.js:6:17: ')' expected

{
  let f = (...xs, x) => xs;
}