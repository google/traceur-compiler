import {assert} from '../../../asserts.js';

export default class C {
  m() {
    return 'm';
  }
}

assert.instanceOf(C, Function);
