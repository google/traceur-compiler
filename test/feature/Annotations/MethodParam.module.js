// Options: --annotations
import {Anno} from './resources/setup.js';

class MethodParam {
  method(@Anno x) {}
}

assert.deepEqual([[new Anno]], MethodParam.prototype.method.parameters);

