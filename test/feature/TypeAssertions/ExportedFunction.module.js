// Options: --types --type-assertions
import {exportedParamAndReturn} from './resources/exported-function.js';
import {AssertionError} from '../../asserts.js';

assert.equal(1, exportedParamAndReturn(1));

assert.throw(() => { exportedParamAndReturn(''); }, AssertionError);
assert.throw(() => { exportedParamAndReturn(0); }, AssertionError);
