// Options: --member-variables --types

var globalValue = 0;

class A {
  instanceValue: number = globalValue;
}

var a0 = new A();
globalValue++;
var a1 = new A();

assert.equal(a0.instanceValue, 0);
assert.equal(a1.instanceValue, 1);
