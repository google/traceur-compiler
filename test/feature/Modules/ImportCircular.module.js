// Should not compile.
// Error: Unsupported circular dependency between feature/Modules/ImportCircular.module and feature/Modules/resources/clockwise

import {clockwise} from './resources/clockwise';
export function counterclockwise() {
  return clockwise();
}
