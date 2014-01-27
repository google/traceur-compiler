// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
class Test {
  simple():Number { return 1; }

  throwsAssertion():Boolean {
    return {test: '123'};
  }

  get getter():Number { return 1; }

  static staticSimple():Number { return 1; }
  static staticThrowsAssertion():Boolean {
    return {test: '123'};
  }

  static get staticGetter():Number { return 1; }
}

var test = new Test();

assert.equal(1, Test.staticGetter);
assert.equal(1, Test.staticSimple());
assert.throw(Test.staticThrowsAssertion, chai.AssertionError);

assert.equal(1, test.getter);
assert.equal(1, test.simple());
assert.throw(test.throwsAssertion, chai.AssertionError);
