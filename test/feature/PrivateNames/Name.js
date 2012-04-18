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

import {Name, isName} from '@name';

var n = new Name;
assertTrue(isName(n));
assertFalse(isName(n.public));
assertEquals('object', typeof n.public);
assertNotEquals(n, n.public);
assertFalse(isName(n.public));
assertEquals(n + '', n.public + '');
assertNameFrozen(n);

var n2 = new Name('abc');
assertTrue(isName(n2));
assertFalse(isName(n2.public));
assertEquals('object', typeof n2.public);
assertNotEquals(n2, n2.public);
assertFalse(isName(n2.public));
assertEquals(n2 + '', n2.public + '');
assertEquals('abc', n2.public + '');
assertNameFrozen(n2);
