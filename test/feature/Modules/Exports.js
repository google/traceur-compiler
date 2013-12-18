module a from './resources/i';

(function() {
  'use strict';
  assert.equal(0, a.i);
  a.inc();
  assert.equal(1, a.i);

  assert.throws(function() {
    a.i = 2;
  }, TypeError);
})();

assert.equal(1, a.i);

module d from './resources/d';
assert.equal('A', d.a);
