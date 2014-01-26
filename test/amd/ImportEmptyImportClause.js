// AMD executes the dependencies before executing the module.
import {} from './deps/side-effect2';
assert.equal(1, this.sideEffect);
this.sideEffect = 0;