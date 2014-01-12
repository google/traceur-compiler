// Options: --types=true --type-assertions
function single(a:Number) {}
function multiple(a:Number, b:Boolean) {}
function rest(...a:Number) {}
function destructuring({a, b}:Number) {}
function untyped(a) {}
function initialized(a:Number = 1) { return a; }

single(1);
multiple(1, true);
rest(1, 2, 3);
destructuring({a: 1, b: 2});
untyped();

assert.equal(1, initialized());
assert.equal(2, initialized(2));

assert.throw(function () { single(''); }, chai.AssertionError);
assert.throw(function () { multiple('', false); }, chai.AssertionError);
assert.throw(function () { multiple(false, 1); }, chai.AssertionError);
assert.throw(function () { multiple(1, ''); }, chai.AssertionError);
assert.throw(function () { rest(1, ''); }, chai.AssertionError);
assert.throw(function () { destructuring({a: 1, b: ''}); }, chai.AssertionError);
assert.throw(function () { initialized(''); }, chai.AssertionError);
