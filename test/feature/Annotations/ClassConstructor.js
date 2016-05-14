// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup.js';

@Anno
class AnnotatedClassCtor {
  @Anno2
  constructor() {}
}

assert.deepEqual([new Anno, new Anno2], AnnotatedClassCtor.annotations);
