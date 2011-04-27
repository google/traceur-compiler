class MethodLookupA {
  function foo() {
    return "A.foo()";
  }
  get bar() {
    return "A.get.bar";
  }
  set bar(value) { }
}

class MethodLookupB : MethodLookupA {
  get foo() {
    return "B.foo.get";
  }
  set foo(value) { }
  function bar() {
    return "B.bar()";
  }
}

class MethodLookupC : MethodLookupB {
  function x() {
    return super.foo();
  }
  function y() {
    return super.bar();
  }
}

// ----------------------------------------------------------------------------

var c = new MethodLookupC();
assertEquals("B.foo.get", c.x());
assertEquals("B.bar()", c.y());
