// Options: --annotations
import {Anno} from './resources/setup';

class AnnotatedCtor {
  @Anno
  constructor() {}
}

assertArrayEquals([new Anno], AnnotatedCtor.annotations);
