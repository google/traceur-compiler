function testImplementsVar() {
  var implements = 1;
  return implements;
}
assertEquals(testImplementsVar(), 1);

function testInterfaceVar() {
  var interface = 1;
  return interface;
}
assertEquals(testInterfaceVar(), 1);

function testPackageVar() {
  var package = 1;
  return package;
}
assertEquals(testPackageVar(), 1);

function testPrivateVar() {
  var private = 1;
  return private;
}
assertEquals(testPrivateVar(), 1);

function testProtectedVar() {
  var protected = 1;
  return protected;
}
assertEquals(testProtectedVar(), 1);

function testPublicVar() {
  var public = 1;
  return public;
}
assertEquals(testPublicVar(), 1);

function testStaticVar() {
  var static = 1;
  return static;
}
assertEquals(testStaticVar(), 1);

function testYieldVar() {
  var yield = 1;
  return yield;
}
assertEquals(testYieldVar(), 1);
