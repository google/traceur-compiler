class C extends null {}

var c = new C;
assert.isTrue(c instanceof C);
assert.isFalse(c instanceof Object);

// Closure testing framework tries to toString the object and fails.
assert.isTrue(Object.getPrototypeOf(c) === C.prototype);
assert.isTrue(Object.getPrototypeOf(Object.getPrototypeOf(c)) === null);

assert.equal(c.toString, undefined);

class D extends null {
  constructor(...args) {
    super(...args);
  }
}

assert.throw(function() {
  new D();
}, TypeError);

class E extends function() { return null }() {
  constructor(...args) {
    super(...args);
  }
}

assert.throw(function() {
  new E();
}, TypeError);


function f() {};
f.prototype = null;

class F extends f {
  get x() {
    return 1;
  }
}

assert.equal(1, new F().x);


function g() {}
function h() {}
g.prototype = h;
class G extends g {
  get x() {
    return 2;
  }
}

assert.equal(2, new G().x);
