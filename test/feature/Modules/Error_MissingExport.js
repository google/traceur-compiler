// Should not compile.
// Error: :6:12: 'y' is not exported by 'feature/Modules/resources/x.js'
// Error: :6:15: 'z' is not exported by 'feature/Modules/resources/x.js'
// Error: :7:9: 'w' is not exported by 'feature/Modules/resources/x.js'

import {x, y, z} from './resources/x';
import {w} from './resources/x';

