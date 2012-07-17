{
  let i = 0, called = 0;
  function f() {
    called++;
    return function() {
      return ++i;
    };
  }

  assertEquals(1, f() `whatevs`);
  assertEquals(1, called);
  assertEquals(2, f `abc` `def`);
  assertEquals(2, called);
  assertEquals(3, f `ghi` ());
  assertEquals(3, called);
}
