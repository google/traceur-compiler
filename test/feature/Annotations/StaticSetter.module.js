// Options: --annotations
import {Anno} from './resources/setup.js';

class StaticSetter {
  @Anno
  static set prop(@Anno x) {}
}

assert.deepEqual([new Anno],
    Object.getOwnPropertyDescriptor(StaticSetter, 'prop').set.annotations);
assert.deepEqual([[new Anno]],
    Object.getOwnPropertyDescriptor(StaticSetter, 'prop').set.parameters);
