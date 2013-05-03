// Options: --deferred-functions

function asyncThrow(e) {
  if (true)
    throw e;
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
  try {
    await value = asyncThrow(1);
    fail("shouldn't get here");
  } catch (e) {
    assert.equal(1, e);
  }

  done = true;
})();
