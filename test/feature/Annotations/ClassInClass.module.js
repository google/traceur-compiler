// Options: --annotations --types
import {
  Anno,
  Anno2,
  X
} from './resources/setup.js';

@Anno('outer')
class Outer {
  @Anno2('outerCtor')
  constructor() {}

  static get nested() {
    @Anno('inner')
    class Inner {
      @Anno2('innerCtor')
      constructor() {}
      @Anno('innerMethod')
      method(@Anno('innerMethodParam') x : X) {}
    }
    return Inner;
  }
}

var Inner = Outer.nested;
assert.deepEqual([new Anno('outer'), new Anno2('outerCtor')], Outer.annotations);
assert.deepEqual([new Anno('inner'), new Anno2('innerCtor')], Inner.annotations);
assert.deepEqual([new Anno('innerMethod')], Inner.prototype.method.annotations);
assert.deepEqual([[X, new Anno('innerMethodParam')]],
    Inner.prototype.method.parameters);
