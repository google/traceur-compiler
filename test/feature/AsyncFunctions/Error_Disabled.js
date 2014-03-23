// Should not compile.
// Disabled by default.
// Error: :14:21: Semi-colon expected

function asyncComplete() {
  return new Promise((resolve) => {
    resolve('complete');
  });
}

// ----------------------------------------------------------------------------

(async function() {
  var value = async asyncComplete();
  assert.equal('complete', value);
})();
