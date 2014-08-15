// Options: --annotations
import {Anno} from './resources/setup';

function AnnotatedParam(@Anno('x') x) {}

assertArrayEquals([[new Anno('x')]], AnnotatedParam.parameters);
