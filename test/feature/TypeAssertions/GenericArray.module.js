// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

var a: Array = [];
var b: Array<number> = [];
var c: Array<number> = [0];
var d: Array<number> = [1, 2];

assert.throw(() => {
  var a: Array<number> = ['s'];
});

var e: Array<Array<number> > = [[]];
var e: Array<Array<number>> = [[]];
var f: Array<Array<number>>= [[3, 4], [5]];
var g: Array<Array<Array<number>>> = [[[]]];
var h: Array<Array<Array<number>>>= [[[]]];
