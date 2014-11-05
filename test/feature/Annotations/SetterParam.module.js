// Options: --annotations
import {Anno} from './resources/setup.js';

class SetterParam {
  set prop(@Anno x) {}
}

assertArrayEquals([[new Anno]],
    Object.getOwnPropertyDescriptor(SetterParam.prototype, 'prop').
        set.parameters);
