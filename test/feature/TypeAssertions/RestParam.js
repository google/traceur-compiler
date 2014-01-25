// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function rest(...a:Number) {}

rest(1, 2, 3);
assert.throw(function () { rest(1, ''); }, chai.AssertionError);
