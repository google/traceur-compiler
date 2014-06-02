// Should not compile.
// Options: --computed-property-names=false
// Error: :6:3: Unexpected token [

var object = {
  [1]: 2
};
