// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup.js';

function AnnotatedTypedParam(@Anno x:X) {}

assert.deepEqual([[X, new Anno]], AnnotatedTypedParam.parameters);
