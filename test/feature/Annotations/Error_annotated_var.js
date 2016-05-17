// Options: --annotations
// Error: :5:2: Unsupported annotated expression
import {Anno} from './resources/setup.js';

@Anno
var test = 1;
