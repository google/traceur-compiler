testGlobal.sideEffect = 1;
import './resources/side-effect.js';
assert.equal(2, testGlobal.sideEffect);
testGlobal.sideEffect = 1;
