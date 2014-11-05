import {fn2, variable2} from './circular2.js';

export var variable1 = 'test circular 1';

fn2();

export var output;

export function fn1() {
  output = variable2;
}