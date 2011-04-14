// Utility functions used below.

function checkEmpty(o) {
  var m = Object.getOwnPropertyNames(o);
  if (m.length) {
    fail("Unexpected members found:" + m.join(","));
  }
}

function checkObjectHas(o) {
  var args = Array.prototype.slice.call(arguments, 1, arguments.length);
  for (var i = 0; i < args.length; i ++) {
    var m = args[i];
    if (!o.hasOwnProperty(m)) {
      fail("Expected member " + m + " not found.");
    }
  }
}

function checkObjectHasNot(o) {
  var args = Array.prototype.slice.call(arguments, 1, arguments.length);
  for (var i = 0; i < args.length; i ++) {
    var m = args[i];
    if (o.hasOwnProperty(m)) {
      fail("Unxpected member " + m + " found.");
    }
  }
}

// Test simple inheritcance of empty classes.

class EmptyA {
}

class EmptyB : EmptyA {
}

function testInheritanceChecks() {
  var a = new EmptyA();
  var b = new EmptyB();

  assertEquals(true, a instanceof EmptyA);
  assertEquals(false, a instanceof EmptyB);
  assertEquals(true, b instanceof EmptyA);
  assertEquals(true, b instanceof EmptyB);
}

// Singletons used to test $new behavior.

var SingletonInstance = { }
var SingletonInstanceTwo = { }

// Test $new() behavior.

class NewA {
  static $new() { return SingletonInstance; }
}

class NewB : NewA {
}

function testCustomNew() {
  var a = new NewA();
  var b = new NewB();

  assertEquals(true, a === SingletonInstance);
  assertEquals(true, b === SingletonInstance);
}

// Test the correct $new being called in the inheritance chain. 

class SkipNewA {
  static $new() { return SingletonInstance; }
}

class SkipNewB : SkipNewA {
}

class SkipNewC : SkipNewB {
  static $new() { return SingletonInstanceTwo; }
}

class SkipNewD : SkipNewC {
}

function testSkipNew() {
  var a = new SkipNewA();
  var b = new SkipNewB();
  var c = new SkipNewC();
  var d = new SkipNewD();

  assert("own $new", SingletonInstance === a);
  assert("base $new", SingletonInstance === b);
  assert("overriden $new", SingletonInstanceTwo === c);
  assert("inherited overriden $new", SingletonInstanceTwo === d);
}

// Test inherited fields.

class FieldA {
  var a1 = "field a1 val";
  var a2 = "field a2 val";
}

class FieldB : FieldA {
  var b1 = "field b1 val";
}

function testInheritedFields() {
  var a = new FieldA();
  var b = new FieldB();

  assertUndefined(a.b1);
  assertEquals(true, a.hasOwnProperty("a1"));
  assertEquals(true, a.hasOwnProperty("a2"));
  assertEquals(false, a.hasOwnProperty("b1"));

  assertEquals(true, b.hasOwnProperty("a1"));
  assertEquals(true, b.hasOwnProperty("a2"));
  assertEquals(true, b.hasOwnProperty("b1"));
}

// Test constructor behavior.

class ConstructorA {
  new(x) {
    this.x = x;
  }
}

class ConstructorB : ConstructorA {
  new(x, y) {
    super(x);
    this.y = y;
  }
}

function testConstructedFields() {
  var a = new ConstructorA("ax");
  var b = new ConstructorB("bx", "by");

  assertEquals("ax", a.x);
  assertEquals(false, a.hasOwnProperty("y"));
  assertEquals("bx", b.x);
  assertEquals("by", b.y);
}

// Test property getters with super.

class GetterA {
  get x() { return "getter x"; }
  get y() { return "getter y"; }
}

class GetterB : GetterA {
  get x() { return super.x; }
}

class GetterC : GetterB {
  get y() { return super.y; }
}

function testInheritedGetter() {
  var b = new GetterB();
  var c = new GetterC();

  assertEquals("getter x", b.x);
  assertEquals("getter y", c.y);
}

// Test static members and functions.

class StaticA {
  static sa = "sa";
  static function sma() {}
}

class StaticB : StaticA {
  static sb = "sb";
  static function smb() {}
}

class StaticC : StaticB {
  static sc = "sc";
  static function smc() {}
}

function testStaticMembers() {
  var a = new StaticA();
  var b = new StaticB();
  var c = new StaticC();
  
  checkObjectHasNot(a, "sa", "sma", "sb", "smb", "sc", "smc");
  checkObjectHas(StaticA, "sa", "sma");
  checkObjectHasNot(StaticA, "sb", "smb", "sc", "smc");

  checkObjectHasNot(b, "sa", "sma", "sb", "smb", "sc", "smc");
  checkObjectHas(StaticB, "sb", "smb");
  checkObjectHasNot(StaticB, "sa", "sma", "sc", "smc");

  checkObjectHasNot(c, "sa", "sma", "sb", "smb", "sc", "smc");
  checkObjectHas(StaticC, "sc", "smc");
  checkObjectHasNot(StaticC, "sa", "sma", "sb", "smb");
}

// Test static and instance methods.

class MethodsA {
  function ma() {}
  static function sma() {}
}

class MethodsB : MethodsA {
  function mb() {}
  static function smb() {}
}

class MethodsC : MethodsB {
  function mc() {}
  static function smc() {}
}

function testInheritedMethods() {
  var a = new MethodsA();
  var b = new MethodsB();
  var c = new MethodsC();

  var pa = Object.getPrototypeOf(a);
  var pb = Object.getPrototypeOf(b);
  var pc = Object.getPrototypeOf(c);

  checkEmpty(a);
  checkEmpty(b);
  checkEmpty(c);

  checkObjectHas(pa, "ma");
  checkObjectHasNot(pa, "mb", "mc", "sma", "smb", "smc");
  checkObjectHas(pb, "mb");
  checkObjectHasNot(pb, "ma", "mc", "sma", "smb", "smc");
  checkObjectHas(pc, "mc");
  checkObjectHasNot(pc, "ma", "mb", "sma", "smb", "smc");

  checkObjectHas(MethodsA, "sma");
  checkObjectHasNot(MethodsA, "smb", "smc");
  checkObjectHas(MethodsB, "smb");
  checkObjectHasNot(MethodsB, "sma", "smc");
  checkObjectHas(MethodsC, "smc");
  checkObjectHasNot(MethodsC, "sma", "smb");
}

// Test chained super call.

class ChainA {
  function foo() {
    return "A";
  }
}

class ChainB : ChainA {
  function foo() {
    return super.foo() + " B";
  }
}

class ChainC : ChainB {
  function foo() {
    return super.foo() + " C";
  }
}

class ChainD : ChainC {
  function foo() {
    return super.foo() + " D";
  }
}

function testChainedSuperCall() {
  var d = new ChainD();
  assertEquals("A B C D", d.foo());
}

// Test inheriting from a 'non-class'.

function noClassA() {}
noClassA.prototype = {
 ma: function() { return 'ma' }
}

class NoClassB : noClassA {
 mb() {
   return 'mb ' + super.ma();
 }
}

function testInheritFromNoClass() {
  var b = new NoClassB;
  assertEquals(true, b instanceof noClassA);
  assertEquals('ma', b.ma());
  assertEquals('mb ma', b.mb());
}

// Test inheriting from a a member expression representing a class.

var baseContainer = {
  base : function() {}
}
baseContainer.base.prototype = {
  x : "proto x",
  constructor : function() { this.y = "base y"; }
}

class MemberExprBase : baseContainer.base {
  var z = "var z";
  new(w) { super(); this.w = w; }
}

function testInheritFromMemberExpr() {
  var a = new MemberExprBase("w value");
  var pa = Object.getPrototypeOf(a);
  var ppa = Object.getPrototypeOf(pa);

  checkObjectHas(a, "y", "w", "z");
  checkObjectHasNot(a, "x");
  checkObjectHas(pa, "constructor");
  checkObjectHas(ppa, "x", "constructor")
}

// Test implementation of method lookup in super.

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

function testMethodLookup() {
  var c = new MethodLookupC();
  assertEquals("B.foo.get", c.x());
  assertEquals("B.bar()", c.y());
}

// Test implementation of field/property lookup in super.
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

function testFieldLookup() {
  var c = new FieldLookupC();
  assertEquals("B.get.foo", c.x());
  assertEquals("B.value", c.y());
  assertUndefined(c.z());
  assertEquals("B.baz.value", c.w());
}

// Test behavior of super with missing properties/methods.

class MissingSuperA {
}

class MissingSuperB : MissingSuperA {
  function method() {
    return super.foo();
  }
  function field() {
    return super.foo;
  }
}

function testMissingSuperProperty() {
  // collect the expected values
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

  // test against those
  var b = new MissingSuperB();
  var actualF = b.field();
  var actualM;
  try {
    b.method();
  } catch (e) {
    actualM = e;
  }

  assert("expected both undefined", actualF === expectedF);
  assert(expectedM instanceof TypeError);
  assert(actualM instanceof TypeError);
  assert("expected both TypeError",
    Object.getPrototypeOf(actualM) === Object.getPrototypeOf(expectedM));
}
