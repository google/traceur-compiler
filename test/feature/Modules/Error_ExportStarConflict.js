// Should not compile.
// Error: resources/export-conflict.js:2:8: Duplicate export of 'a'
// Error: resources/export-conflict.js:1:12: 'a' was previously exported here

import {a} from './resources/export-conflict';

