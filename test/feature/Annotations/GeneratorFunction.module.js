// Options: --annotations
import {Anno} from './resources/setup.js';

@Anno
function* generate() {}

assertArrayEquals([new Anno], generate.annotations);
