function* gen() {
  yield 'abc';
  yield 'def';
}

var expectedHeads = ['a', 'd'];
var expectedTails = [['b', 'c'], ['e','f']];
var i = 0;
for (var [head, ...tail] of gen()) {
  assertEquals(expectedHeads[i], head);
  assertArrayEquals(expectedTails[i], tail);
  i++;
}
assertEquals(2, i);

{
  let x = 42;
  for (let {length: x} of gen()) {
    assertEquals(3, x);
  }
  assertEquals(42, x);
}

var k;
for ({length: k} of ['abc'])  // No block
  assertEquals(3, k);