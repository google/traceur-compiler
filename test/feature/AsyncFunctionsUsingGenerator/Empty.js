// Options: --async-functions --generators=parse
// Skip !function*() {}
// Async.

async function empty() {
}

empty().then((v) => {
  assert.isUndefined(v);
  done();
});