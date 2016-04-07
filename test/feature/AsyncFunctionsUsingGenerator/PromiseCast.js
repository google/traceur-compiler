// Options: --async-functions --generators=parse
// Skip !function*() {}
// Async.

async function f() {
  var x = await 1;
  assert.equal(x, 1);
  x = await undefined;
  assert.equal(x, undefined);
  done();
}

f();
