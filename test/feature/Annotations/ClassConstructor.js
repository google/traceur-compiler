// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup';

@Anno
class AnnotatedClassCtor {
  @Anno2
  constructor() {}
}

assertArrayEquals([new Anno, new Anno2], AnnotatedClassCtor.annotations);
