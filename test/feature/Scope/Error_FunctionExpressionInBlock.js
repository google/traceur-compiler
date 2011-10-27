// Should not compile.

{
  (function g() {
    return 'inner';
  });

  g;  // function expression doesn't add name to the scope.
}
