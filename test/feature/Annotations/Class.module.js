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

assert.deepEqual([new Anno], AnnotatedClass.annotations);
assert.deepEqual([new Anno],
    AnnotatedClass.prototype.annotatedMethod.annotations);

assert.deepEqual([new Anno],
    Object.getOwnPropertyDescriptor(AnnotatedClass.prototype, 'prop').
        get.annotations);

assert.deepEqual([new Anno],
    Object.getOwnPropertyDescriptor(AnnotatedClass.prototype, 'prop').
        set.annotations);

