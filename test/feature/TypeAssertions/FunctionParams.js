// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function single(a:Number) {}
function multiple(a:Number, b:Boolean) {}
function untyped(a) {}

single(1);
multiple(1, true);
untyped();

assert.throw(function () { single(''); }, chai.AssertionError);
assert.throw(function () { multiple('', false); }, chai.AssertionError);
assert.throw(function () { multiple(false, 1); }, chai.AssertionError);
assert.throw(function () { multiple(1, ''); }, chai.AssertionError);
