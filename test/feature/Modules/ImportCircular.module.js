// Error: Unsupported circular dependency between feature/Modules/ImportCircular.module.js and feature/Modules/resources/clockwise.js

import {clockwise} from './resources/clockwise.js';
export function counterclockwise() {
  return clockwise();
}
