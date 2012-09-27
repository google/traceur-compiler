// Options: --cascade-expression
// Should not compile.

var object = {};
object.{
  'a' = 'a';
  1 = 1;
  true = true;
  null = null;
};