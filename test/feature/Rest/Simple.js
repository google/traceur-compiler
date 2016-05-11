function f(...p) {
  return p;
}

function g(a, ...p) {
  return p;
}

assert.deepEqual([], f());
assert.deepEqual([0], f(0));
assert.deepEqual([0, 1], f(0, 1));

assert.deepEqual([], g());
assert.deepEqual([], g(0));
assert.deepEqual([1], g(0, 1));
assert.deepEqual([1, 2], g(0, 1, 2));
