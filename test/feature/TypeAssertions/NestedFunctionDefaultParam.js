// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function f(value:String, a:Function = function():Function {
  // body of default param expression
  return function (x:String):Number {
    if (x === 'invalid')
      return x;
    return x.length;
  };
}) {
  return a()(value);
}

assert.equal(5, f('hello'));
assert.equal(10, f('hello', function () { return function () { return 10; }}));

assert.throw(function () { f(1); }, chai.AssertionError);
assert.throw(function () { f('hello', 1); }, chai.AssertionError);
assert.throw(function () { f('invalid'); }, chai.AssertionError);
