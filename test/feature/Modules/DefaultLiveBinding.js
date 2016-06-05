import * as m from './resources/default-live.js';

assert.equal(m.default(), 1);
m.changeDefault();
assert.equal(m.default, 2);
