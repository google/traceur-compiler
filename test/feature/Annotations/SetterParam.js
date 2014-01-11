// Options: --annotations
import {Anno} from './resources/setup';

class SetterParam {
  set prop(@Anno x) {}
}

assertArrayEquals([[new Anno]],
    Object.getOwnPropertyDescriptor(SetterParam.prototype, 'prop').
        set.parameters);
