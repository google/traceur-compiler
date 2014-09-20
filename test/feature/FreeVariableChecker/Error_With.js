// Should not compile.
// Options: --free-variable-checker
// Error: missingVarWith is not defined
var o = {};
with (o) {
  missingVarWith = 42;
}
var x = missingVarWith * 2;
