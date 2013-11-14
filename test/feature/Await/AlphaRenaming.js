// Options: --deferred-functions

function asyncComplete(self, arg) {
  var task = new Deferred();
  task.callback([self, arg]);
  return task.createPromise();
}

var self = {};
var obj = {};
var value;

function A() {
  assert.equal(this, self);
  await value = asyncComplete(this, arguments[0]);
}

A.call(self, obj);
assert.deepEqual([self, obj], value);
