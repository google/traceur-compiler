function testImplementsInPattern({implements}) {
  return implements;
}
assertEquals(testImplementsInPattern({implements: 1}), 1);

function testInterfaceInPattern({interface}) {
  return interface;
}
assertEquals(testInterfaceInPattern({interface: 1}), 1);

function testPackageInPattern({package}) {
  return package;
}
assertEquals(testPackageInPattern({package: 1}), 1);

function testPrivateInPattern({private}) {
  return private;
}
assertEquals(testPrivateInPattern({private: 1}), 1);

function testProtectedInPattern({protected}) {
  return protected;
}
assertEquals(testProtectedInPattern({protected: 1}), 1);

function testPublicInPattern({public}) {
  return public;
}
assertEquals(testPublicInPattern({public: 1}), 1);

function testStaticInPattern({static}) {
  return static;
}
assertEquals(testStaticInPattern({static: 1}), 1);

function testYieldInPattern({yield}) {
  return yield;
}
assertEquals(testYieldInPattern({yield: 1}), 1);
