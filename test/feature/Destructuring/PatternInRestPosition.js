{
  let [x, ...[y, z]] = [0, 1, 2];
  assertEquals(0, x);
  assertEquals(1, y);
  assertEquals(2, z);

  let length;
  [...{length}] = [0, 1, 2]
  assertEquals(3, length);
}