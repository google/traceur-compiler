// Options: --block-binding

{
  function f() {
    return f;
  }
  var g = f;
  f = 42;
  assertEquals(42, g());
}
