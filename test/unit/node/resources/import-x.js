import {x} from './reexport-x.js';
const g = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : undefined;
g.result = x;  // To verify execution, test this global value.
