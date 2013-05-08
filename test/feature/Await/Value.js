// Options: --deferred-functions

function asyncValue(value) {
  if (true)
    return value;
  await asyncYield();
}

function asyncYield() {
  return asyncTimeout(0);
}

function asyncTimeout(ms) {
  var task = new Deferred();
  messageQueue.push(function() {
    task.callback(undefined);
  });
  return task.createPromise();
}

var done = false;
var messageQueue = [];

function run(f) {
  return function() {
    done = false;
    f();
    while (dequeue()) {
      // intentionally empty
    }
    assert.isTrue(done);
  };
}

function dequeue() {
  var f = messageQueue.shift();
  if (f) {
    f();
    return true;
  }
  return false;
}

// ----------------------------------------------------------------------------

run(function() {
  var value;
  await value = asyncValue(42);
  assert.equal(42, value);
  done = true;
})();
