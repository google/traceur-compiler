var a = [];
var b = [0, ...a];
var c = [...b, ...b];
var d;
var e = [0, ...d = [1, 2], 3];
var f = [0, ...[[1, 2], [3, 4]], 5];

// ----------------------------------------------------------------------------

assert.deepEqual([0], b);
assert.deepEqual([0, 0], c);
assert.deepEqual([1, 2], d);
assert.deepEqual([0, 1, 2, 3], e);
assert.deepEqual([0, [1, 2], [3, 4], 5], f);
