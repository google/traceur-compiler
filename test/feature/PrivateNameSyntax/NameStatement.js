private @a;
private @b = @a;
assertEquals(@a, @b);

private @c, @d = @c;
assertEquals(@c, @d);

assertThrows(function() {
  private @e = 42;
});