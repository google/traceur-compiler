// Options: --types --type-assertions --type-assertion-module=./resources/assert.js
import {AssertionError} from '../../asserts.js';

var globalVar: number = 1;
var globalUninitializedVar: number;

function variableTypes() {
  var x: number = 1;
  var y: number;
  var a: number, b: number;
  var c: number = 1, d: number = 2, e: string = 'test';
}

function throwsAssertion(value) {
  var x: number = value;
}

assert.throw(() => { throwsAssertion('test'); }, AssertionError);
