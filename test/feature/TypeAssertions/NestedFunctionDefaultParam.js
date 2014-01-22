// Options: --types=true --type-assertions
function f(value:String, a = function():Function {
  // body of default param expression
  return function (x:String):Number {
    if (x === 'invalid')
      return x;
    return x.length;
  };
}) {
  return a(value);
}

assert.equals(5, f('hello'));
assert.throw(function () { f(1); }, chai.AssertionError);
assert.throw(function () { f('hello', 1); }, chai.AssertionError);
assert.throw(function () { f('invalid'); }, chai.AssertionError);
