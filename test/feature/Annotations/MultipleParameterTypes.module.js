// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup.js';

function MultiParamWithAnnotation(@Anno x:X, y) {}
function MultiTypedParamsNoAnnotations(x:X, y:X) {}

assert.deepEqual([[X, new Anno], []], MultiParamWithAnnotation.parameters);
assert.deepEqual([[X], [X]], MultiTypedParamsNoAnnotations.parameters);
