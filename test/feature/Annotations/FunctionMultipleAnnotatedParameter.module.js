// Options: --annotations
import {
  Anno,
  Anno2
} from './resources/setup.js';

function MultipleAnnotations(@Anno('x') @Anno2('x') x) {}

assert.deepEqual([[new Anno('x'), new Anno2('x')]],
    MultipleAnnotations.parameters);
