// Should not compile.
// Error: missingVar is not defined
var o = {};
with (o) {
  missingVar = 42;
}
var x = missingVar * 2;
