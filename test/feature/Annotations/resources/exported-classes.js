import {Anno} from './setup';

@Anno
export class ExportedAnnotatedClass {
  @Anno
  annotatedMethod() {}
}

export class ExportedUnannotatedClass {
  @Anno
  annotatedMethod() {}
}
