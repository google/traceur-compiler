// Options: --types --type-assertions --type-assertion-module=./resources/assert.js
import {AssertionError} from '../../asserts.js';

class Test {
  simple(): number { return 1; }

  throwsAssertion(): boolean {
    return {test: '123'};
  }

  get getter(): number { return 1; }

  static staticSimple(): number { return 1; }
  static staticThrowsAssertion(): boolean {
    return {test: '123'};
  }

  static get staticGetter(): number { return 1; }
}

var test = new Test();

assert.equal(1, Test.staticGetter);
assert.equal(1, Test.staticSimple());
assert.throw(Test.staticThrowsAssertion, AssertionError);

assert.equal(1, test.getter);
assert.equal(1, test.simple());
assert.throw(test.throwsAssertion, AssertionError);
