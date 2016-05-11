// Options: --annotations
import {Anno} from './resources/setup.js';
import DefaultExportedAnnotatedClass from './resources/exported-default-class.js';
import {
  ExportedAnnotatedClass,
  ExportedUnannotatedClass
} from './resources/exported-classes.js';


assert.deepEqual([new Anno], ExportedAnnotatedClass.annotations);
assert.deepEqual([new Anno],
    ExportedAnnotatedClass.prototype.annotatedMethod.annotations);

assert.deepEqual([new Anno],
    ExportedUnannotatedClass.prototype.annotatedMethod.annotations);
