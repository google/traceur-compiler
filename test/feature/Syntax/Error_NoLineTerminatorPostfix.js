// Should not compile.
// SyntaxError: feature/Syntax/Error_NoLineTerminatorPostfix.js:7:7: Unexpected token ;

function f(x) {
  var x = 0;
  x
    ++;
}
