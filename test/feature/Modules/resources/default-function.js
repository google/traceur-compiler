import {assert} from '../../../asserts.js';

export default function f() {
  return 123;
}

assert.instanceOf(f, Function);
