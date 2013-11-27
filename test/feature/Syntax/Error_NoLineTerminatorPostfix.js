// Should not compile.
// Error: 7:7: Unexpected token ;

function f(x) {
  var x = 0;
  x
    ++;
}
