// Options: --free-variable-checker
// Error: :8:9: missingVarWith is not defined

var o = {};
with (o) {
  missingVarWith = 42;
}
var x = missingVarWith * 2;
