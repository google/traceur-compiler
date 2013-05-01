// Options: --private-names --private-name-syntax

// IIFE to hide private names from other tests.
(function() {

  private @a;
  var object = {};
  object.@a = 42;
  assert.equal(42, object.@a);

  private @b = @a;
  assert.equal(42, object.@b);

  object.@b = 'Changed';
  assert.equal(object.@a, object.@b);
  assert.equal('Changed', object.@a);

})();