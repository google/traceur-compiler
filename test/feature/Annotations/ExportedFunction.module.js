// Options: --annotations
import {Anno} from './resources/setup.js';
import defaultExportedFunction from './resources/exported-default-function.js';

import {
  exportedAnnotated,
  exportedUnannotated
} from './resources/exported-functions.js';

assertArrayEquals([new Anno], exportedAnnotated.annotate);
assertArrayEquals([[new Anno]], exportedAnnotated.parameters);
assert.isUndefined(exportedUnannotated.annotate);
assertArrayEquals([[new Anno]], exportedUnannotated.parameters);
