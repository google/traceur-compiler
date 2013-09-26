var target = {a: 0, b: 2};
var source = {a: 1, c: 3, get d: function() { return 4; }};
var mixed = Object.mixin(target, source);

// ----------------------------------------------------------------------------

assert.isTrue(Object.hasOwnProperty("mixin"));
assert.areEqual(mixed.a, source.a);
assert.areEqual(mixed.b, target.b);
assert.areEqual(mixed.c, source.c);
assert.areEqual(mixed.d, source.d);
