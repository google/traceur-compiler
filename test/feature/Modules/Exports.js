module a from './resources/i.js';

(function() {
  'use strict';
  assert.equal(0, a.i);
  a.inc();
  assert.equal(1, a.i);

  assertThrows(function() {
    a.i = 2;
  });
})();

assert.equal(1, a.i);

module d from './resources/d.js';
assert.equal('A', d.a);
