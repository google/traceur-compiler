// Options: --types=true --type-assertions
import {exportedParamAndReturn} from './resources/exported-function';

assert.equal(1, exportedParamAndReturn(1));

assert.throw(function () { exportedParamAndReturn(''); }, chai.AssertionError);
assert.throw(function () { exportedParamAndReturn(0); }, chai.AssertionError);
