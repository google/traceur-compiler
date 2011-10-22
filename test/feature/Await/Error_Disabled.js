// Should not compile.
// Options: --deferredFunctions=false

function asyncComplete() {
  var task = new Deferred();
  task.callback('complete');
  return task.createPromise();
}

// ----------------------------------------------------------------------------

(function() {
  var value;
  await value = asyncComplete();
  assertEquals('complete', value);
})();
