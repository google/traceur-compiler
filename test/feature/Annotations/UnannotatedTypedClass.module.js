// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup.js';

class UnannotatedClass {
  constructor(a:X, b) {
    this.abc = a;
  }

  bar(a:X) {}

  set setter(a:X) {
    this.abc = a;
  }
}

assert.deepEqual([[X], []], UnannotatedClass.parameters);
assert.deepEqual([[X]], UnannotatedClass.prototype.bar.parameters);
assert.deepEqual([[X]],
    Object.getOwnPropertyDescriptor(UnannotatedClass.prototype, 'setter').
        set.parameters);
