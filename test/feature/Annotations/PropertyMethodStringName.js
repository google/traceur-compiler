// Options: --annotations
import {Anno} from './resources/setup.js';

class C {
  @Anno('x y z')
  "x y z"() { return 1; }
  @Anno('xyz')
  xyz() { return 1; }
}

assert.deepEqual([new Anno('x y z')], C.prototype['x y z'].annotations);
assert.deepEqual([new Anno('xyz')], C.prototype.xyz.annotations);
