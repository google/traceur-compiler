// Options: --async-functions
// Async.

var finallyVisited = false;

var resolve;
var p = new Promise((r) => {
  resolve = r;
});

async function test() {
  try {
    await p;
  } finally {
    finallyVisited = true;
  }
  assert.isTrue(finallyVisited);
  done();
}

test();
assert.isFalse(finallyVisited);
resolve();
