// Options: --block-binding
// Block binding is needed to get the right scoping semantics inside the catch
// block.

var head = 'head';
var tail = 'tail';
var name = 'name';

try {
  throw new Error('abc');
} catch ({message: [head, ...tail], name}) {
  assert.equal('a', head);
  assertArrayEquals(['b', 'c'], tail);
  assert.equal('Error', name);
}

assert.equal('head', head);
assert.equal('tail', tail);
assert.equal('name', name);