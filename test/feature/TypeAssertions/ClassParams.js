// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
class Test {
  single(a:Number) { return true; }
  multiple(a:Number, b:Boolean) { return true; }
  rest(...a:Number) { return true; }
  destructuring({a, b}:Number) { return true; }
  initialized(a:Number = 1) { return a; }
  untyped(a) { return true; }
}

var test = new Test();
test.single(1);
test.multiple(1, true);
test.rest(1, 2, 3);
test.destructuring({a: 1, b: 2});
test.untyped();

assert.equal(1, test.initialized());
assert.equal(2, test.initialized(2));

assert.throw(function () { test.single(''); }, chai.AssertionError);
assert.throw(function () { test.multiple('', false); }, chai.AssertionError);
assert.throw(function () { test.multiple(false, 1); }, chai.AssertionError);
assert.throw(function () { test.multiple(1, ''); }, chai.AssertionError);
assert.throw(function () { test.rest(1, ''); }, chai.AssertionError);
assert.throw(function () { test.destructuring({a: 1, b: ''}); }, chai.AssertionError);
assert.throw(function () { test.initialized(''); }, chai.AssertionError);
