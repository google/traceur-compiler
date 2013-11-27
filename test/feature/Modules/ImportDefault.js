import x from './resources/default';
assert.equal(x, 42);

import C from './resources/default-class';
assert.equal(new C().m(), 'm');

import {default as D} from './resources/default-name';
assert.equal(D, 4);
