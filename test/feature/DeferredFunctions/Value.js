// Options: --deferred-functions
// Async.

function asyncValue(value) {
  if (true)
    return value;
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
  await value = asyncValue(42);
  assert.equal(42, value);
  done();
})();
