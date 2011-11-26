function assertFrozen(obj) {
  assertTrue(Object.isFrozen(obj));
}

function assertNameFrozen(n) {
  [
    n,
    n.toString,
    n.toString.prototype,
    n.public,
    n.public.toString,
    n.public.toString.prototype
  ].forEach(assertFrozen);
}

var Name = traceur.runtime.modules['@name'];

var n = Name.create();
assertTrue(Name.isName(n));
assertFalse(Name.isName(n.public));
assertEquals('object', typeof n.public);
assertNotEquals(n, n.public);
assertFalse(Name.isName(n.public));
assertEquals(n + '', n.public + '');
assertNameFrozen(n);

var n2 = Name.create('abc');
assertTrue(Name.isName(n2));
assertFalse(Name.isName(n2.public));
assertEquals('object', typeof n2.public);
assertNotEquals(n2, n2.public);
assertFalse(Name.isName(n2.public));
assertEquals(n2 + '', n2.public + '');
assertEquals('abc', n2.public + '');
assertNameFrozen(n2);
