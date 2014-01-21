// Options: --annotations
import {Anno} from './resources/setup';

class StaticSetter {
  @Anno
  static set prop(@Anno x) {}
}

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(StaticSetter, 'prop').set.annotations);
assertArrayEquals([[new Anno]],
    Object.getOwnPropertyDescriptor(StaticSetter, 'prop').set.parameters);
