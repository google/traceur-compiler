var global = this;

module m from './resources/f.js';
assert.equal(global, m.f());
