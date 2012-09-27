// Options: --cascade-expression

{
  var object = {};
  function f() {
    object.{
      arguments = arguments;
    }
  }

  f(0, 1);

  assertEquals(0, object.arguments[0]);
  assertEquals(1, object.arguments[1]);
}
