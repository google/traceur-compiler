this.sideEffect = 1;
import './deps/side-effect.js';
assert.equal(2, this.sideEffect);
this.sideEffect = 1;
