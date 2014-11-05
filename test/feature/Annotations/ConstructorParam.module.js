// Options: --annotations
import {Anno} from './resources/setup.js';

class CtorParam {
  constructor(@Anno x) {}
}

assertArrayEquals([[new Anno]], CtorParam.parameters);

