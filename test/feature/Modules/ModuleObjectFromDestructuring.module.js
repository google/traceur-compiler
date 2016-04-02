import * as m from './resources/export-destructuring.js';

assert.deepEqual(['x', 'y'], Object.keys(m).sort());
