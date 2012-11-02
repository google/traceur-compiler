// This test depends on it running in non strict mode.
assertTrue(function() { return this; }() !== undefined);

function f() {
  'use strict';
  var xs = 'abc';
  var o = {
    f() {
      return this;
    }
  };
  o.f(...xs);
  return (1, o.f)();
}

assertUndefined(f());