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

assertArrayEquals([new Anno],
    AnnotatedClass.prototype.generate.annotate);
assertArrayEquals([new Anno2],
    AnnotatedClass.staticGenerate.annotate);
