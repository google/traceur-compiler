// Options: --annotations --types
import {FooAnnotation} from './circular_annotation2';

@FooAnnotation
export class BarAnnotation {
  constructor(@FooAnnotation foo1, foo2: FooAnnotation) {}
}
