// Options: --annotations
import {Anno} from './resources/setup.js';

function AnnotatedParam(@Anno('x') x) {}

assert.deepEqual([[new Anno('x')]], AnnotatedParam.parameters);
