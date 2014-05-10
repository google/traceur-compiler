// Should not compile.
// Options: --async-functions
// Error: :7:1: Unexpected token =>

var async = () => 1;
var x = async (y)
=> y;
