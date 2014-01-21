// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup';

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
assertArrayEquals([new Anno('outer'), new Anno2('outerCtor')], Outer.annotations);
assertArrayEquals([new Anno('inner'), new Anno2('innerCtor')], Inner.annotations);
assertArrayEquals([new Anno('innerMethod')], Inner.prototype.method.annotations);
assertArrayEquals([[X, new Anno('innerMethodParam')]],
    Inner.prototype.method.parameters);
