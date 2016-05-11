// Options: --annotations
import {Anno} from './resources/setup.js';

@Anno('Test')
class Test {
  get annotatedFn() {
    @Anno('x')
    function x() {}
    return x;
  }
}

assert.deepEqual([new Anno('Test')], Test.annotations);
assert.deepEqual([new Anno('x')], new Test().annotatedFn.annotations);
