// should have a length of 1
assert.equal(Array.prototype.findIndex.length, 1);

// should handle basic case
assert.equal([1, 2, 3].findIndex(function(v) {
    return (v * v === 4);
}), 1);

// should handle arrow functions
assert.equal([1, 2, 3].findIndex(v => (v * v === 4)), 1);

// should return -1 when not found
assert.equal([1, 2, 3].findIndex(v => (v > 10)), -1);

// should return first match
assert.equal([2, 2, 3].findIndex(v => (v * v === 4)), 0);

// should handle custom objects
assert.equal(Array.prototype.findIndex.call({
    'length': 2,
    '0': false,
    '1': true
}, v => v), 1);

// should handle bad predicate
assert.throws(function() {
    [1, 2, 3].findIndex(1)
}, TypeError);

// should handle bad this
assert.throws(function() {
    Array.prototype.findIndex.call(null, function() {})
}, TypeError);
