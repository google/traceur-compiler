// Options: --block-binding
// Block binding is needed to get the right scoping semantics inside the catch
// block.

var head = 'head';
var tail = 'tail';
var name = 'name';

try {
  throw new Error('abc');
} catch ({message: [head, ...tail], name}) {
  assertEquals('a', head);
  assertArrayEquals(['b', 'c'], tail);
  assertEquals('Error', name);
}

assertEquals('head', head);
assertEquals('tail', tail);
assertEquals('name', name);