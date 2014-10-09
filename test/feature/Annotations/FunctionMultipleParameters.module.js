// Options: --annotations
import {Anno} from './resources/setup';

function MultipleParams(@Anno('x') x, @Anno('y') y) {}

assertArrayEquals([[new Anno('x')], [new Anno('y')]],
    MultipleParams.parameters);
