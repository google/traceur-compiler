// Should not compile.
// Options: --async-functions
// Error: :8:5: Semi-colon expected
// Error: :8:5: Unexpected token =>

var async = () => 1;
var x = async
(y) => y;
