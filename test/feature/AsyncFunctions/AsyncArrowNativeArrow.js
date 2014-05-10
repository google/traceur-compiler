// Options: --async-functions  --arrow-functions=parse
// Async.

// This tests that async arrow functions will work even if we do not transform
// normal arrow functions.

var f = async () => 1;

f().then((result) => {
  assert.equal(result, 1);
  done();
}).catch(done);
