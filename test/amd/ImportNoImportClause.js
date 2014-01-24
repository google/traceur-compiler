// AMD executes the dependencies before executing the module.
import './deps/side-effect';
assert.equal(1, this.sideEffect);
this.sideEffect = 0;
