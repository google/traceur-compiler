// Error: Unsupported circular dependency between test/feature/Modules/ImportCircular.js and test/feature/Modules/resources/clockwise.js

import {clockwise} from './resources/clockwise.js';
export function counterclockwise() {
  return clockwise();
}
