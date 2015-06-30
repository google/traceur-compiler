// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

import {AssertionError} from '../../asserts.js';

function initialized(a: number = 1) { return a; }

assert.equal(1, initialized());
assert.equal(2, initialized(2));
assert.throw(() => { initialized(''); }, AssertionError);
