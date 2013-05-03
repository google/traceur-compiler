// Options: --deferred-functions

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
assert.isFalse(finallyVisited);
d.callback(42)
assert.equal(42, v);
assert.isTrue(finallyVisited)
