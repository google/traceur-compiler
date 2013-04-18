// Should not compile.
// Error: 7:7: unexpected token ;

function f(x) {
  var x = 0;
  x
    ++;
}
