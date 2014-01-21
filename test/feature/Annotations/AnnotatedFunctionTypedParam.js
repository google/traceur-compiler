// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup';

@Anno
function AnnotatedFnMultiParam(x:X, y) {}

assertArrayEquals([[X], []], AnnotatedFnMultiParam.parameters);
