// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup.js';

function AnnotatedTypedParam(@Anno x:X) {}

assertArrayEquals([[X, new Anno]], AnnotatedTypedParam.parameters);
