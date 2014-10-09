// Options: --annotations
import {Anno} from './resources/setup';

class C {
  @Anno('x y z')
  "x y z"() { return 1; }
  @Anno('xyz')
  xyz() { return 1; }
}

assertArrayEquals([new Anno('x y z')], C.prototype['x y z'].annotations);
assertArrayEquals([new Anno('xyz')], C.prototype.xyz.annotations);
