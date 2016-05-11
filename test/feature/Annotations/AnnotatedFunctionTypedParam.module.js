// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup.js';

@Anno
function AnnotatedFnMultiParam(x:X, y) {}

assert.deepEqual([[X], []], AnnotatedFnMultiParam.parameters);
