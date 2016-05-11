// Options: --annotations
import {Anno} from './resources/setup.js';

class C {
  @Anno('x y z')
  get "x y z"() { return 1; }
  @Anno('xyz')
  get xyz() { return 1; }
}

assert.deepEqual([new Anno('x y z')],
    Object.getOwnPropertyDescriptor(C.prototype, 'x y z').get.annotations);
assert.deepEqual([new Anno('xyz')],
    Object.getOwnPropertyDescriptor(C.prototype, 'xyz').get.annotations);
