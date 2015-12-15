// Options: --async-functions --generators=parse
// Skip !function*() {}
// Async.

var f = async x => x;

f(1).then((result) => {
  assert.equal(result, 1);
  done();
}).catch(done);
