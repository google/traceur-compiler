var global = this;

module m from './resources/f';
assert.equal(global, m.f());
