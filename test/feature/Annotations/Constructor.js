// Options: --annotations
import {Anno} from './resources/setup';

class AnnotatedCtor {
  @Anno2
  constructor() {}
}

assertArrayEquals([new Anno2], AnnotatedCtor.annotations);
