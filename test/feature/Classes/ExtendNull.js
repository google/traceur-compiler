class C extends null {}

// ----------------------------------------------------------------------------

var c = new C;
assertTrue(c instanceof C);
assertFalse(c instanceof Object);

// Closure testing framework tries to toString the object and fails.
assertTrue(Object.getPrototypeOf(c) === C.prototype);
assertTrue(Object.getPrototypeOf(Object.getPrototypeOf(c)) === null);

assertEquals(c.toString, undefined);
