// Options: --async-functions --generators=parse
// Skip !function*() {}
// Async.

function asyncYield() {
  return asyncTimeout(0);
}

function asyncTimeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async function() {
  await asyncYield();
  done();
})();
