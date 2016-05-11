// Options: --annotations
import {Anno} from './resources/setup.js';

@Anno
function* generate() {}

assert.deepEqual([new Anno], generate.annotations);
