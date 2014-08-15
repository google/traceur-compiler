// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup';

class UnannotatedClass {
  constructor(a:X, b) {
    this.abc = a;
  }

  bar(a:X) {}

  set setter(a:X) {
    this.abc = a;
  }
}

assertArrayEquals([[X], []], UnannotatedClass.parameters);
assertArrayEquals([[X]], UnannotatedClass.prototype.bar.parameters);
assertArrayEquals([[X]],
    Object.getOwnPropertyDescriptor(UnannotatedClass.prototype, 'setter').
        set.parameters);
