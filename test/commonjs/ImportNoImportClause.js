const g = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : undefined;
g.sideEffect = 1;
import './deps/side-effect.js';
assert.equal(2, g.sideEffect);
g.sideEffect = 1;
