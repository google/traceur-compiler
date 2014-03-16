// Options: --async-functions
// Async.

function asyncThrow(e) {
  if (true)
    throw e;
  await asyncYield();
}

function asyncYield() {
  return asyncTimeout(0);
}

function asyncTimeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(function() {
  var value;
  try {
    value = await asyncThrow(1);
    fail("shouldn't get here");
  } catch (e) {
    assert.equal(1, e);
  }

  done();
})();