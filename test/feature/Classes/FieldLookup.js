// This requires manually constructed classes.

function fieldLookupA() { }
fieldLookupA.prototype = {
  foo : "A.value",
  get bar() {
    return "A.get.bar";
  },
  set bar(value) { },
  boo : "A.boo.value",
  baz : undefined
}

function fieldLookupB() { }
fieldLookupB.prototype = {
  __proto__ : fieldLookupA.prototype,
  get foo() {
    return "B.get.foo";
  },
  set foo(value) { },
  bar : "B.value",
  boo : undefined,
  baz : "B.baz.value",
}

class FieldLookupC : fieldLookupB {
  function x() {
    return super.foo;
  }
  function y() {
    return super.bar;
  }
  function z() {
    return super.boo;
  }
  function w() {
    return super.baz;
  }
}

// ----------------------------------------------------------------------------

var c = new FieldLookupC();
assertEquals("B.get.foo", c.x());
assertEquals("B.value", c.y());
assertUndefined(c.z());
assertEquals("B.baz.value", c.w());
