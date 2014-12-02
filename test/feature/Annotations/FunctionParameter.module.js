// Options: --annotations
import {Anno} from './resources/setup.js';

function AnnotatedParam(@Anno('x') x) {}

assertArrayEquals([[new Anno('x')]], AnnotatedParam.parameters);
