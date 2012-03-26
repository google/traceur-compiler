var finallyVisited = false;

function* test() {
  try {
    yield 42;
  } finally {
    finallyVisited = true;
  }
}

var it = test();
it.moveNext();
assertEquals(42, it.current);
assertFalse(finallyVisited);

it.moveNext();
assertTrue(finallyVisited);

finallyVisited = false;
for (var i of test()) {
  assertEquals(42, i);
}
assertTrue(finallyVisited);
