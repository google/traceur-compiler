// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup.js';

class AnnotatedClass {
  @Anno
  *generate() {}

  @Anno2
  static *staticGenerate() {}
}

assert.deepEqual([new Anno],
    AnnotatedClass.prototype.generate.annotations);
assert.deepEqual([new Anno2],
    AnnotatedClass.staticGenerate.annotations);
