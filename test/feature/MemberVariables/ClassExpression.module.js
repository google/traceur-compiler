// Options: --member-variables --types --type-assertions --type-assertion-module=../TypeAssertions/resources/assert

import '../TypeAssertions/resources/assert';

class C extends class {
  x: number;
} {
  y: number;
}

var c = new C();

assert.throw(() => { c.x  = 'str'}, chai.AssertionError);
assert.throw(() => { c.y  = 'str'}, chai.AssertionError);
