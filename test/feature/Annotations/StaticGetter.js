// Options: --annotations
import {Anno} from './resources/setup';

class StaticGetter {
  @Anno
  static get prop() { return 'getter'; }
}

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(StaticGetter, 'prop').get.annotations);
