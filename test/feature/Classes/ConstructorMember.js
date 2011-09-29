class ConstructorMember {
  constructor() {}
}

class DerivedConstructorMember extends ConstructorMember {
  constructor() {}
}

// ----------------------------------------------------------------------------

var cm = new ConstructorMember;
assertEquals(cm.constructor, ConstructorMember.prototype.constructor);
assertTrue(ConstructorMember.prototype.hasOwnProperty('constructor'));

for (var key in ConstructorMember) {
  assertNotEquals('constructor should not be enumerable', 'constructor', key);
}

var dcm = new DerivedConstructorMember;
assertEquals(dcm.constructor, DerivedConstructorMember.prototype.constructor);
assertTrue(DerivedConstructorMember.prototype.hasOwnProperty('constructor'));

for (var key in DerivedConstructorMember) {
  assertNotEquals('constructor should not be enumerable', 'constructor', key);
}
