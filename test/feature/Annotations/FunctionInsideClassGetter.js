// Options: --annotations
import {Anno} from './resources/setup';

@Anno('Test')
class Test {
  get annotatedFn() {
    @Anno('x')
    function x() {}
    return x;
  }
}

assertArrayEquals([new Anno('Test')], Test.annotations);
assertArrayEquals([new Anno('x')], new Test().annotatedFn.annotations);
