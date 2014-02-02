// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
var globalVar:Number = 1;
var globalUninitializedVar:Number;

function variableTypes() {
  var x:Number = 1;
  var y:Number;
  var a:Number, b:Number;
  var c:Number = 1, d:Number = 2, e:String = 'test';
}

function throwsAssertion(value) {
  var x:Number = value;
}

assert.throw(() => { throwsAssertion('test'); }, chai.AssertionError);
