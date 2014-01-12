// Options: --annotations
import {Anno} from './resources/setup';
import {
  exportedAnnotated,
  exportedUnannotated
} from './resources/exported-functions';

assertArrayEquals([new Anno], exportedAnnotated.annotations);
assertArrayEquals([[new Anno]], exportedAnnotated.parameters);
assert.isUndefined(exportedUnannotated.annotations);
assertArrayEquals([[new Anno]], exportedUnannotated.parameters);
