// Options: --annotations
import {Anno} from './resources/setup.js';
import DefaultExportedAnnotatedClass from './resources/exported-default-class.js';
import {
  ExportedAnnotatedClass,
  ExportedUnannotatedClass
} from './resources/exported-classes.js';


assertArrayEquals([new Anno], ExportedAnnotatedClass.annotations);
assertArrayEquals([new Anno],
    ExportedAnnotatedClass.prototype.annotatedMethod.annotations);

assertArrayEquals([new Anno],
    ExportedUnannotatedClass.prototype.annotatedMethod.annotations);
