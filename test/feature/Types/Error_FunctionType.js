// Options: --types --free-variable-checker
// Error: :6:3: unresolved is not defined

(function() {
  var f: (unresolved: number) => string
  unresolved;
});
