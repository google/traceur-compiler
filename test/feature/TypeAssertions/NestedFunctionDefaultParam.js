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
assert.equal(10, f('hello', () => { return () => { return 10; }}));

assert.throw(() => { f(1); }, chai.AssertionError);
assert.throw(() => { f('hello', 1); }, chai.AssertionError);
assert.throw(() => { f('invalid'); }, chai.AssertionError);
