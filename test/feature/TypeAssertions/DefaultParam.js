// Options: --types=true --type-assertions
function initialized(a:Number = 1) { return a; }

assert.equal(1, initialized());
assert.equal(2, initialized(2));
assert.throw(function () { initialized(''); }, chai.AssertionError);
