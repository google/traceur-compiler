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

  assert.equal(self, object.self);
}
