// AMD executes the dependencies before executing the module.
import './deps/side-effect';
const g = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : undefined;
assert.equal(1, g.sideEffect);
g.sideEffect = 0;
