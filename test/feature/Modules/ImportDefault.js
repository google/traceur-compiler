import x from './resources/default';
assert.equal(x, 42);

import C from './resources/default-class';
assert.equal(new C().m(), 'm');

import {default as D} from './resources/default-name';
assert.equal(D, 4);

import f from './resources/default-function';
assert.equal(f(), 123);

import f from './resources/default-function2';
assert.equal(f(), 123);

import f from './resources/default-function3';
assert.equal(f(), 123);

import f from './resources/default-function4';
assert.equal(f(), 123);