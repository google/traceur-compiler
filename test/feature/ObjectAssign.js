var target = {a: 0, b: 2};
var source = {a: 1, c: 3, get d: function() { return 4; }};
var assigned = Object.assign(target, source);

// ----------------------------------------------------------------------------

assert.isTrue(Object.hasOwnProperty("assign"));
assert.areEqual(assigned.a, source.a);
assert.areEqual(assigned.b, target.b);
assert.areEqual(assigned.c, source.c);
assert.notEqual(assigned.d, source.d);
