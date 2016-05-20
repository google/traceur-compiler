testGlobal.sideEffect = 1;
import {} from './resources/side-effect2.js';
assert.equal(2, testGlobal.sideEffect);
testGlobal.sideEffect = 1;
