// Should not compile.
// Disabled by default.

function asyncComplete() {
  var task = new Deferred();
  task.callback('complete');
  return task.createPromise();
}

// ----------------------------------------------------------------------------

(function() {
  var value;
  await value = asyncComplete();
  assert.equal('complete', value);
})();
