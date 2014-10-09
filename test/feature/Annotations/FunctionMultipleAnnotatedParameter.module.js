// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup';

function MultipleAnnotations(@Anno('x') @Anno2('x') x) {}

assertArrayEquals([[new Anno('x'), new Anno2('x')]],
    MultipleAnnotations.parameters);
