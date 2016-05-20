var topLevelThis = this;

import * as m from './resources/f.js';
assert.equal(topLevelThis, m.f());
assert.equal(undefined, topLevelThis);
