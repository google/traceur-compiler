this.sideEffect = 1;
import {} from './deps/side-effect2';
assert.equal(2, this.sideEffect);
this.sideEffect = 1;
