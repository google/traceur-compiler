var x = 1;
{
  let x;
  assertEquals(undefined, x);
  x = 2;
  assertEquals(2, x);
}
assertEquals(1, x);
