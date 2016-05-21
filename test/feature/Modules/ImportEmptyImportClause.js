import object from './resources/object-for-side-effects.js';
object.sideEffect = 1;
import {} from './resources/side-effect2.js';
assert.equal(2, object.sideEffect);
object.sideEffect = 1;
