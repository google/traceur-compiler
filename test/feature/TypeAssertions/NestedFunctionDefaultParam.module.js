// Options: --types --type-assertions --type-assertion-module=./resources/assert.js
function f(value: string, a: Function = function(): Function {
  // body of default param expression
  return function (x: string): number {
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
