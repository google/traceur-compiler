import {fn1, variable1} from './circular1.js';

export var variable2 = 'test circular 2';

fn1();

export var output;

export function fn2() {
  output = variable1;
}