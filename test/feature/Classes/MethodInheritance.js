class MethodsA {
  ma() {}
}

class MethodsB extends MethodsA {
  mb() {}
}

class MethodsC extends MethodsB {
  mc() {}
}

// ----------------------------------------------------------------------------

var a = new MethodsA();
var b = new MethodsB();
var c = new MethodsC();

var pa = Object.getPrototypeOf(a);
var pb = Object.getPrototypeOf(b);
var pc = Object.getPrototypeOf(c);

assert.equal(Object.getOwnPropertyNames(a).length, 0);
assert.equal(Object.getOwnPropertyNames(b).length, 0);
assert.equal(Object.getOwnPropertyNames(c).length, 0);

assert.isTrue(pa.hasOwnProperty('ma'));
assert.isFalse(pa.hasOwnProperty('mb'));
assert.isFalse(pa.hasOwnProperty('mc'));
assert.isTrue(pb.hasOwnProperty('mb'));
assert.isFalse(pb.hasOwnProperty('ma'));
assert.isFalse(pb.hasOwnProperty('mc'));
assert.isTrue(pc.hasOwnProperty('mc'));
assert.isFalse(pc.hasOwnProperty('ma'));
assert.isFalse(pc.hasOwnProperty('mb'));
