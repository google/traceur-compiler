// Options: --member-variables --types --type-assertions --type-assertion-module=../TypeAssertions/resources/assert

import '../TypeAssertions/resources/assert';

class C {
  d() {
    class D {
      x: number;
    }

    return new D();
  }
}

var d = new C().d();

assert.throw(() => { d.x = 'string'}, chai.AssertionError);
