// Should not compile.
// Disabled by default.

function asyncComplete() {
  return new Promise((resolve) => {
    resolve('complete');
  });
}

// ----------------------------------------------------------------------------

(function() {
  var value;
  await value = asyncComplete();
  assert.equal('complete', value);
})();
