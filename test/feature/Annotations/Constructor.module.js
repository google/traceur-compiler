// Options: --annotations
import {Anno2} from './resources/setup';

class AnnotatedCtor {
  @Anno2
  constructor() {}
}

assertArrayEquals([new Anno2], AnnotatedCtor.annotations);
