// Should not compile.
// Error: :9:12: 'y' is not exported by 'feature/Modules/resources/x.js'
// Error: :9:15: 'z' is not exported by 'feature/Modules/resources/x.js'
// Error: :10:9: 'w' is not exported by 'feature/Modules/resources/x.js'
// Error: :12:9: 'foo' is not exported by '@name'
// Error: :13:9: 'bar' is not exported by '@name'
// Error: :13:14: 'baz' is not exported by '@name'

import {x, y, z} from './resources/x.js';
import {w} from './resources/x.js';

import {foo} from '@name';
import {bar, baz} from '@name';
