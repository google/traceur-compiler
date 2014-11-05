// Options: --annotations
import {Anno2} from './resources/setup.js';

class AnnotatedCtor {
  @Anno2
  constructor() {}
}

assertArrayEquals([new Anno2], AnnotatedCtor.annotations);
