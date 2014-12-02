// Options: --annotations
import {Anno} from './resources/setup.js';

@Anno
function Simple() {}

assertArrayEquals([new Anno], Simple.annotations);
