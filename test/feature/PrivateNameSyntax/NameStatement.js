// Options: --private-names --private-name-syntax

// IIFE to hide private names from other tests.
(function() {

  private @a;
  private @b = @a;
  assertEquals(@a, @b);

  private @c, @d = @c;
  assertEquals(@c, @d);

  assertThrows(function() {
    private @e = 42;
  });

})();