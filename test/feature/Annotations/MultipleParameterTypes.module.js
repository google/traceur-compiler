// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup';

function MultiParamWithAnnotation(@Anno x:X, y) {}
function MultiTypedParamsNoAnnotations(x:X, y:X) {}

assertArrayEquals([[X, new Anno], []], MultiParamWithAnnotation.parameters);
assertArrayEquals([[X], [X]], MultiTypedParamsNoAnnotations.parameters);
