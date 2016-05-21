// AMD executes the dependencies before executing the module.
import {} from './deps/side-effect2.js';
const g = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : undefined;
assert.equal(1, g.sideEffect);
g.sideEffect = 0;
