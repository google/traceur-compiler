var finallyVisited = false;

var d = new Deferred;
var v;

function test() {
  try {
    await v = d;
  } finally {
    finallyVisited = true;
  }
}

test();
assertFalse(finallyVisited);
d.callback(42)
assertEquals(42, v);
assertTrue(finallyVisited)
