function* G() {
  yield 1;
  yield 2;
  yield 3;
}

var a = [...G()];
var b = [4, ...G()];
var c = [...G(), 4];
var d = [4, ...G(), 5];

// ----------------------------------------------------------------------------

assert.deepEqual([1, 2, 3], a);
assert.deepEqual([4, 1, 2, 3], b);
assert.deepEqual([1, 2, 3, 4], c);
assert.deepEqual([4, 1, 2, 3, 5], d);
