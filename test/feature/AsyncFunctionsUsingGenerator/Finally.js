// Options: --async-functions --generators=parse
// Skip !function*() {}
// Async.

var finallyVisited = false;

var resolve;
var p = new Promise((r) => {
  resolve = r;
});
var v;

async function test() {
  try {
    v = await p;
  } finally {
    finallyVisited = true;
  }
  assert.equal(42, v);
  assert.isTrue(finallyVisited);
  done();
}

test();
assert.isFalse(finallyVisited);
resolve(42);
