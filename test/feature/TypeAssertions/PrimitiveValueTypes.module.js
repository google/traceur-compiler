// Options: --types --type-assertions --type-assertion-module=./resources/assert.js
import {AssertionError} from '../../asserts.js';

function foo(a: string): boolean {
  var x: number = 1;
  return true;
}

function failReturn(): number {
  return 'str';
}

function failVariable() {
  var x: string = true;
}


foo('bar');
assert.throw(() => { foo(123) }, AssertionError);
assert.throw(() => { failReturn() }, AssertionError);
assert.throw(() => { failVariable() }, AssertionError);
