// AMD executes the dependencies before executing the module.
import {} from './deps/side-effect2.js';
import object from './deps/object-for-side-effects.js';
assert.equal(1, object.sideEffect);
object.sideEffect = 0;
