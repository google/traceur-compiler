// Options: --annotations
import {Anno} from './resources/setup.js';

class StaticMethod {
  @Anno
  static method(@Anno x) {}
}

assert.deepEqual([new Anno], StaticMethod.method.annotations);
assert.deepEqual([[new Anno]], StaticMethod.method.parameters);
