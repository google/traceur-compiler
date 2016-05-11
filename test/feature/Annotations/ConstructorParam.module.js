// Options: --annotations
import {Anno} from './resources/setup.js';

class CtorParam {
  constructor(@Anno x) {}
}

assert.deepEqual([[new Anno]], CtorParam.parameters);

