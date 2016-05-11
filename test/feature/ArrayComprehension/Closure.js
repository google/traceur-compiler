// Options: --array-comprehension --block-binding
// Block binding is needed to get the right scoping semantics inside the arrow
// function in the comprehension.

var res = [for (x of [0, 1]) for (y of [2, 3]) () => [x, y]];

assert.equal(4, res.length);
assert.deepEqual([0, 2], res[0]());
assert.deepEqual([0, 3], res[1]());
assert.deepEqual([1, 2], res[2]());
assert.deepEqual([1, 3], res[3]());
