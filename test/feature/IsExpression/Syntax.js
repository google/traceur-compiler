{
  let lastX;
  function is(x) {
    lastX = x;
    return x + 1;
  }

  // OK since is is defined
  42
  is
  42

  assertTrue(42 is
             42);  // line terminator OK after is.

  assertTrue(1 is (1));
  assertTrue(lastX === undefined);

  let x = 1
      is (2);

  assertTrue(x === 1);
  assertTrue(lastX === 2);

  assertTrue(1 is is(0));
  assertTrue(lastX === 0);

  assertTrue(2 is (is(1)));
  assertTrue(lastX === 1);
}
