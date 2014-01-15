// Should not compile.
// Error: feature/Modules/Error_DuplicateImport.js:7:9: 'a' was previously imported at feature/Modules/Error_DuplicateImport.js:6:9
// Error: feature/Modules/Error_DuplicateImport.js:10:8: 'd' was previously imported at feature/Modules/Error_DuplicateImport.js:9:8
// Error: feature/Modules/Error_DuplicateImport.js:11:9: 'd' was previously imported at feature/Modules/Error_DuplicateImport.js:9:8

import {a} from './resources/a';
import {c as a} from './resources/c';

import d from './resources/default-class';
import d from './resources/default-name';
import {a as d} from './resources/a2';
