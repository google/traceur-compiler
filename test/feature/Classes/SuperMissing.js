class MissingSuperA {}

class MissingSuperB extends MissingSuperA {
  method() {
    return super.foo();
  }
  field() {
    return super.foo;
  }
}

// ----------------------------------------------------------------------------

// Collect the expected values.
var expectedF;
var expectedM;
var actualF;
var actualM;

expectedF = ({}).x;
try {
  ({}).method();
} catch (e) {
  expectedM = e;
}

// Test against those.
var b = new MissingSuperB();
var actualF = b.field();
var actualM;
try {
  b.method();
} catch (e) {
  actualM = e;
}

assertEquals(actualF, expectedF);
assertTrue(expectedM instanceof TypeError);
assertTrue(actualM instanceof TypeError);
assertEquals(Object.getPrototypeOf(actualM), Object.getPrototypeOf(expectedM));
