function isStopIteration(s) {
  // Maybe something more rigorous later.
  return typeof s === 'object' && String(s) === '[object StopIteration]';
}

function assertThrowsStopIteration(fn) {
  if (!isStopIteration(assertThrows(fn)))
    fail('[object StopIteration] expected');
}

//-----------------------------------------------------------------------------

var finallyVisited = false;

function* test() {
  try {
    yield 42;
  } finally {
    finallyVisited = true;
  }
}

var it = test();
assert.equal(42, it.next());
assert.isFalse(finallyVisited);

assertThrowsStopIteration(() => it.next());
assert.isTrue(finallyVisited);

finallyVisited = false;
for (var i of test()) {
  assert.equal(42, i);
}
assert.isTrue(finallyVisited);
