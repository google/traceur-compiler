// Options: --types --type-assertions --type-assertion-module=./resources/assert.js
class Test {
  single(a: number) { return true; }
  multiple(a: number, b: boolean) { return true; }
  initialized(a: number = 1) { return a; }
  untyped(a) { return true; }

  set name(val: string) {
    this._name = val;
  }
}

var test = new Test();
test.single(1);
test.multiple(1, true);
test.untyped();
test.name = 'me';

assert.equal(1, test.initialized());
assert.equal(2, test.initialized(2));

assert.throw(() => { test.single(''); }, chai.AssertionError);
assert.throw(() => { test.multiple('', false); }, chai.AssertionError);
assert.throw(() => { test.multiple(false, 1); }, chai.AssertionError);
assert.throw(() => { test.multiple(1, ''); }, chai.AssertionError);
assert.throw(() => { test.initialized(''); }, chai.AssertionError);
assert.throw(() => { test.name = 123; }, chai.AssertionError);
