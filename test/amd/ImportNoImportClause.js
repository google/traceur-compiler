// ADM executes the dependencies before executing the module.
this.sideEffect = 2;
import './deps/side-effect';
assert.equal(2, this.sideEffect);
