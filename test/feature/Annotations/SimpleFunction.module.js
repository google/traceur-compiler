// Options: --annotations
import {Anno} from './resources/setup';

@Anno
function Simple() {}

assertArrayEquals([new Anno], Simple.annotations);
