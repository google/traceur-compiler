// AMD executes the dependencies before executing the module.
import './deps/side-effect';
import object from './deps/object-for-side-effects.js';
assert.equal(1, object.sideEffect);
object.sideEffect = 0;
