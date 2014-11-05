// Options: --annotations --types
import {BarAnnotation} from './circular_annotation1.js';

@BarAnnotation
export class FooAnnotation {
  constructor(@BarAnnotation bar1, bar2: BarAnnotation) {

  }
}
