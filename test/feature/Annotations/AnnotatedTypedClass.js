// Options: --annotations --types
import {
  Anno,
  Anno2,
  X
} from './resources/setup.js';

@Anno('class')
class AnnotatedTypedClass {
  @Anno2('ctor')
  constructor(@Anno a:X, @Anno('b') b) {
    this.foo = a;
  }

  bar(a:X) {}
}

assert.deepEqual([new Anno('class'), new Anno2('ctor')], AnnotatedTypedClass.annotations);
assert.deepEqual([[X, new Anno], [new Anno('b')]], AnnotatedTypedClass.parameters);
assert.deepEqual([[X]], AnnotatedTypedClass.prototype.bar.parameters);
