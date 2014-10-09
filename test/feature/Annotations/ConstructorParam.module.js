// Options: --annotations
import {Anno} from './resources/setup';

class CtorParam {
  constructor(@Anno x) {}
}

assertArrayEquals([[new Anno]], CtorParam.parameters);

