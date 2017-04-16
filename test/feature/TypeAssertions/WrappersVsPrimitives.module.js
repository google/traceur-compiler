// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

var num : Number = new Number(1);
var str : String = new String('str');
var bool : Boolean = new Boolean(true);

var n : number = 1;
var s : string = 'str';
var b : boolean = true;

assert.throw(() => {
  var num : Number = 1;
});
assert.throw(() => {
  var str : String = 'str';
});
assert.throw(() => {
  var bool : Boolean = true;
});

assert.throw(() => {
  var num : number = new Number(1);
});
assert.throw(() => {
  var str : string = new String('str');
});
assert.throw(() => {
  var bool : boolean = new Boolean(true);
});
