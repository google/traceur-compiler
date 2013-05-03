// Options: --private-names --private-name-syntax

// IIFE to hide private names from other tests.
(function() {

  private @a;
  private @b = @a;
  assert.equal(@a, @b);

  private @c, @d = @c;
  assert.equal(@c, @d);

  assertThrows(function() {
    private @e = 42;
  });

})();