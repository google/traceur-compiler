// Options: --cascade-expression

{
  var object = {};
  var self = {};
  function f() {
    object.{
      self = this;
    }
  }

  f.call(self);

  assertEquals(self, object.self);
}
