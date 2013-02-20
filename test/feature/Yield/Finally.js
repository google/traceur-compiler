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
assertEquals(42, it.next());
assertFalse(finallyVisited);

assertThrowsStopIteration(() => it.next());
assertTrue(finallyVisited);

finallyVisited = false;
for (var i of test()) {
  assertEquals(42, i);
}
assertTrue(finallyVisited);
