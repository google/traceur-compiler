// Error: :5:12: 'y' is not exported by 'feature/Modules/resources/x'
// Error: :5:15: 'z' is not exported by 'feature/Modules/resources/x'
// Error: :6:9: 'w' is not exported by 'feature/Modules/resources/x'

import {x, y, z} from './resources/x';
import {w} from './resources/x';

