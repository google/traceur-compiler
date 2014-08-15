// Options: --annotations
import {Anno} from './resources/setup';

@Anno
class AnnotatedClass {
  @Anno
  annotatedMethod() {}

  @Anno
  get prop() { return 'getter'; }

  @Anno
  set prop(x) {}
}

assertArrayEquals([new Anno], AnnotatedClass.annotations);
assertArrayEquals([new Anno],
    AnnotatedClass.prototype.annotatedMethod.annotations);

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(AnnotatedClass.prototype, 'prop').
        get.annotations);

assertArrayEquals([new Anno],
    Object.getOwnPropertyDescriptor(AnnotatedClass.prototype, 'prop').
        set.annotations);

