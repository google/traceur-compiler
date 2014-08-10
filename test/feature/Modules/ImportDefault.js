import x from './resources/default';
assert.equal(x, 42);

import C from './resources/default-class';
assert.equal(new C().m(), 'm');

import {default as D} from './resources/default-name';
assert.equal(D, 4);

import f from './resources/default-function';
assert.equal(f(), 123);

import E from './resources/default-class-expression';
assert.equal(new E().n(), 'n');

import g from './resources/default-function-expression';
assert.equal(g(), 456);
