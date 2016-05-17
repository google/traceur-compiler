// This test depends on it running in non strict mode.
assert.isTrue(function() { return this; }() !== undefined);

function f() {
  'use strict';
  var xs = 'abc'.split('');
  var o = {
    f() {
      return this;
    }
  };
  o.f(...xs);
  return (1, o.f)();
}

assert.isUndefined(f());