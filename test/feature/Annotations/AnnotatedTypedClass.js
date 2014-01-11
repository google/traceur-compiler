// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup';

@Anno
class AnnotatedTypedClass {
  @Anno
  constructor(@Anno a:X, @Anno('b') b) {
    this.foo = a;
  }

  bar(a:X) {}
}

assertArrayEquals([new Anno, new Anno], AnnotatedTypedClass.annotations);
assertArrayEquals([[X, new Anno], [new Anno('b')]], AnnotatedTypedClass.parameters);
assertArrayEquals([[X]], AnnotatedTypedClass.prototype.bar.parameters);
