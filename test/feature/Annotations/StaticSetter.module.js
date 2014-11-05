// Options: --annotations
import {Anno} from './resources/setup.js';

class StaticSetter {
  @Anno
  static set prop(@Anno x) {}
}

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(StaticSetter, 'prop').set.annotations);
assertArrayEquals([[new Anno]],
    Object.getOwnPropertyDescriptor(StaticSetter, 'prop').set.parameters);
