// Error: feature/Modules/Error_DuplicateImport.module.js:6:9: 'a' was previously imported at feature/Modules/Error_DuplicateImport.module.js:5:9
// Error: feature/Modules/Error_DuplicateImport.module.js:9:8: 'd' was previously imported at feature/Modules/Error_DuplicateImport.module.js:8:8
// Error: feature/Modules/Error_DuplicateImport.module.js:10:9: 'd' was previously imported at feature/Modules/Error_DuplicateImport.module.js:8:8

import {a} from './resources/a';
import {c as a} from './resources/c';

import d from './resources/default-class';
import d from './resources/default-name';
import {a as d} from './resources/a2';
