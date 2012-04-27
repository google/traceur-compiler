var object = {
  abc: 0,  // Keep all the keys at length 3.
  def: 1
};

var expectedHeads = ['a', 'd'];
var expectedTails = [['b', 'c'], ['e','f']];
var i = 0;
for (var [head, ...tail] in object) {
  assertEquals(expectedHeads[i], head);
  assertArrayEquals(expectedTails[i], tail);
  i++;
}
assertEquals(2, i);

{
  let x = 42;
  for (let {length: x} in object) {
    assertEquals(3, x);
  }
  assertEquals(42, x);
}

var k;
for ({length: k} in {abc: 3})  // No block
  assertEquals(3, k);