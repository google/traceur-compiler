// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup';

class AnnotatedClass {
  @Anno
  *generate() {}

  @Anno2
  static *staticGenerate() {}
}

assertArrayEquals([new Anno],
    AnnotatedClass.prototype.generate.annotations);
assertArrayEquals([new Anno2],
    AnnotatedClass.staticGenerate.annotations);
