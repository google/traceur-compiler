// Not enabled.
'use strong'

var o = {x: 1};
delete o.x;
assert.equal(undefined, o.x);
