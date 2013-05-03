// Options: --deferred-functions

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
  var x = 0;
  await asyncTimeout(1);
  assert.equal(1, ++x);
  await asyncTimeout(1);
  assert.equal(2, ++x);
  await asyncTimeout(1);
  assert.equal(3, ++x);
  await asyncTimeout(1);
  assert.equal(4, ++x);
  done = true;
})();
