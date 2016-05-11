// Options: --annotations
import {Anno} from './resources/setup.js';

function MultipleParams(@Anno('x') x, @Anno('y') y) {}

assert.deepEqual([[new Anno('x')], [new Anno('y')]],
    MultipleParams.parameters);
