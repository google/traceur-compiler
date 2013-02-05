class C extends null {}

var c = new C;
assertTrue(c instanceof C);
assertFalse(c instanceof Object);

// Closure testing framework tries to toString the object and fails.
assertTrue(Object.getPrototypeOf(c) === C.prototype);
assertTrue(Object.getPrototypeOf(Object.getPrototypeOf(c)) === null);

assertEquals(c.toString, undefined);

class D extends null {
  constructor(...args) {
    super(...args);
  }
}

assertThrows(function() {
  new D();
});

class E extends function() { return null }() {
  constructor(...args) {
    super(...args);
  }
}

assertThrows(function() {
  new E();
});


function f() {};
f.prototype = null;

class F extends f {
  get x() {
    return 1;
  }
}

assertEquals(1, new F().x);


function g() {}
function h() {}
g.prototype = h;
class G extends g {
  get x() {
    return 2;
  }
}

assertEquals(2, new G().x);
