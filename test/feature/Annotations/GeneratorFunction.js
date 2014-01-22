// Options: --annotations
import {Anno} from './resources/setup';

@Anno
function* generate() {}

assertArrayEquals([new Anno], generate.annotations);
