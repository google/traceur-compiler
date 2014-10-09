// Options: --freeVariableChecker
// Error: :4:11: xxx is not defined
try {
  var y = xxx;
} catch (e) {}
// test/unit/semantics/freeVariableChecker.traceur.js checks operation
// of the checker, here we check that the option works in the compiler.
