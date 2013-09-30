module 'a' {
  export var i = 0;
  export function inc() {
    i++;
  }
}

module a from 'a';

(function() {
  'use strict';
  assert.equal(0, a.i);
  a.inc();
  assert.equal(1, a.i);

  assertThrows(function() {
    a.i = 2;
  });
})();



// DeclarationAlias
assert.equal(1, a.i);

// NestedDeclarations
module 'b' {
  export var b = 42;
}

module 'c' {
  export * from 'b'
}
module c from 'c';
assert.equal(42, c.b);
