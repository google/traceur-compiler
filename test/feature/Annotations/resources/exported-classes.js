import {Anno} from './setup.js';

@Anno
export class ExportedAnnotatedClass {
  @Anno
  annotatedMethod() {}
}

export class ExportedUnannotatedClass {
  @Anno
  annotatedMethod() {}
}
