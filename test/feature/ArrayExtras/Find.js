// should have a length of 1
assert.equal(Array.prototype.find.length, 1);

// should handle basic case
assert.equal([1, 2, 3].find(function(v) {
    return (v * v === 4);
}), 2);

// should handle arrow functions
assert.equal([1, 2, 3].find(v => (v * v === 4)), 2);

// should return -1 when not found
assert.equal([1, 2, 3].find(v => (v > 10)), undefined);

// should return first match
assert.equal([2, 2, 3].find(v => (v * v === 4)), 2);

// should handle custom objects
assert.equal(Array.prototype.find.call({
    'length': 2,
    '0': false,
    '1': true
}, v => v), true);

// should handle bad predicate
assert.throws(function() {
    [1, 2, 3].find(1)
}, TypeError);

// should handle bad this
assert.throws(function() {
    Array.prototype.find.call(null, function() {})
}, TypeError);

// should handle 'this'
({
    assert: function() {
        var self = this;

        // should not be the same 'this'
        [1, 2, 3].find(function() {
            assert.notEqual(this, self);
        });

        // should be the same 'this'
        [1, 2, 3].find(function() {
            assert.equal(this, self);
        }, self);

        // should not have an effect on arrow functions
        [1, 2, 3].find(() => assert.equal(this, self));
        [1, 2, 3].find(() => assert.equal(this, self), self);

    }
}).assert();
