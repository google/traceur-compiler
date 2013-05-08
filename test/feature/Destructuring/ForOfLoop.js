// Options: --block-binding

function* gen() {
  yield 'abc';
  yield 'def';
}

var expectedHeads = ['a', 'd'];
var expectedTails = [['b', 'c'], ['e','f']];
var i = 0;
for (var [head, ...tail] of gen()) {
  assert.equal(expectedHeads[i], head);
  assertArrayEquals(expectedTails[i], tail);
  i++;
}
assert.equal(2, i);

{
  let x = 42;
  for (let {length: x} of gen()) {
    assert.equal(3, x);
  }
  assert.equal(42, x);
}

var k;
for ({length: k} of ['abc'])  // No block
  assert.equal(3, k);