// Options: --cascade-expression=false
// Should not compile.

var object = {};
object.{
  a = 0;
  b = 1;
};
