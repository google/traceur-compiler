// Options: --annotations
import {Anno} from './resources/setup.js';

@Anno
function Simple() {}

assert.deepEqual([new Anno], Simple.annotations);
