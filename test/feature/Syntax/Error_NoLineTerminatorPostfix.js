// Should not compile.
// Error: 7:7: primary expression expected

function f(x) {
  var x = 0;
  x
    ++;
}
