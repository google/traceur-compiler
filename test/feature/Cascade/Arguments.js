// Options: --cascade-expression

{
  var object = {};
  function f() {
    object.{
      arguments = arguments;
    }
  }

  f(0, 1);

  assert.equal(0, object.arguments[0]);
  assert.equal(1, object.arguments[1]);
}
