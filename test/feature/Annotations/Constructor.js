// Options: --annotations
import {Anno2} from './resources/setup.js';

class AnnotatedCtor {
  @Anno2
  constructor() {}
}

assert.deepEqual([new Anno2], AnnotatedCtor.annotations);
