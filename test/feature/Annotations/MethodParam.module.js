// Options: --annotations
import {Anno} from './resources/setup.js';

class MethodParam {
  method(@Anno x) {}
}

assertArrayEquals([[new Anno]], MethodParam.prototype.method.parameters);

