// Options: --annotations
import {Anno} from './resources/setup.js';

@Anno
class AnnotatedClass {
  @Anno
  annotatedMethod() {}

  @Anno
  get prop() { return 'getter'; }

  @Anno
  set prop(x) {}
}

assertArrayEquals([new Anno], AnnotatedClass.annotate);
assertArrayEquals([new Anno],
    AnnotatedClass.prototype.annotatedMethod.annotate);

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(AnnotatedClass.prototype, 'prop').
        get.annotate);

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(AnnotatedClass.prototype, 'prop').
        set.annotate);
