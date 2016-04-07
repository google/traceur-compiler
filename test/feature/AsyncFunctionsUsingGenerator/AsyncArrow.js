// Options: --async-functions --generators=parse
// Skip !function*() {}
// Async.

var f = async () => 1;

f().then((result) => {
  assert.equal(result, 1);
  done();
}).catch(done);
