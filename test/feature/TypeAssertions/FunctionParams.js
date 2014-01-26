// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function single(a:Number) {}
function multiple(a:Number, b:Boolean) {}
function untyped(a) {}

single(1);
multiple(1, true);
untyped();

assert.throw(() => { single(''); }, chai.AssertionError);
assert.throw(() => { multiple('', false); }, chai.AssertionError);
assert.throw(() => { multiple(false, 1); }, chai.AssertionError);
assert.throw(() => { multiple(1, ''); }, chai.AssertionError);
