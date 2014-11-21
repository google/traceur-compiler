// Options: --member-variables --types

class A {
  one: number = 1;
  static str: string = 'str';
}

class B {
  one: number = 1;
  static str: string = 'str';
  constructor() {
  }
}

var C = class {
  one: number = 1;
  static str: string = 'str';
}

assert.equal(A.str, 'str');
assert.equal(B.str, 'str');
assert.equal(C.str, 'str');

var a = new A();
var b = new B();
var c = new C();

assert.equal(a.one, 1);
assert.equal(b.one, 1);
assert.equal(c.one, 1);
