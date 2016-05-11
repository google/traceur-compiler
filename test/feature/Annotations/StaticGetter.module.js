// Options: --annotations
import {Anno} from './resources/setup.js';

class StaticGetter {
  @Anno
  static get prop() { return 'getter'; }
}

assert.deepEqual([new Anno],
    Object.getOwnPropertyDescriptor(StaticGetter, 'prop').get.annotations);
