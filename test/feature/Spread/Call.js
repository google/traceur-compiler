function* G() {
  yield 'hi';
  yield 'there';
}

function f(...args) {
  return args;
}

var result = f(0, ...[1, 2], 3, ...G());
assert.deepEqual([0, 1, 2, 3, 'hi', 'there'], result);

result = f(...G());
assert.deepEqual(['hi', 'there'], result);

function g() {
  'use strict';
  assert.strictEqual(undefined, this);
}

g();
g(...[]);
