// Options: --annotations
import {Anno} from './resources/setup.js';
import defaultExportedFunction from './resources/exported-default-function.js';

import {
  exportedAnnotated,
  exportedUnannotated
} from './resources/exported-functions.js';

assert.deepEqual([new Anno], exportedAnnotated.annotations);
assert.deepEqual([[new Anno]], exportedAnnotated.parameters);
assert.isUndefined(exportedUnannotated.annotations);
assert.deepEqual([[new Anno]], exportedUnannotated.parameters);
