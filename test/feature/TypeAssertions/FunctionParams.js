// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function single(a:Number) {}
function multiple(a:Number, b:Boolean) {}
function untyped(a) {}
function onlySome(a, b:Number) {}

single(1);
multiple(1, true);
untyped();
onlySome(null, 1);

assert.throw(() => { single(''); }, chai.AssertionError);
assert.throw(() => { multiple('', false); }, chai.AssertionError);
assert.throw(() => { multiple(false, 1); }, chai.AssertionError);
assert.throw(() => { multiple(1, ''); }, chai.AssertionError);
assert.throw(() => { onlySome(1, true); }, chai.AssertionError);
