// Should not compile.
// Options: --freeVariableChecker
try {
  var y = xxx;
} catch (e) {}
// test/unit/semantics/freeVariableChecker.traceur.js checks operation
// of the checker, here we check that the option works in the compiler.
