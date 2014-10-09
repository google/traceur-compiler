// Options: --annotations
import {Anno} from './resources/setup';

class C {
  @Anno('x y z')
  get "x y z"() { return 1; }
  @Anno('xyz')
  get xyz() { return 1; }
}

assertArrayEquals([new Anno('x y z')],
    Object.getOwnPropertyDescriptor(C.prototype, 'x y z').get.annotations);
assertArrayEquals([new Anno('xyz')],
    Object.getOwnPropertyDescriptor(C.prototype, 'xyz').get.annotations);
