// Options: --annotations
import {Anno} from './resources/setup';
import DefaultExportedAnnotatedClass from './resources/exported-default-class';
import {
  ExportedAnnotatedClass,
  ExportedUnannotatedClass
} from './resources/exported-classes';


assertArrayEquals([new Anno], ExportedAnnotatedClass.annotations);
assertArrayEquals([new Anno],
    ExportedAnnotatedClass.prototype.annotatedMethod.annotations);

assertArrayEquals([new Anno],
    ExportedUnannotatedClass.prototype.annotatedMethod.annotations);
