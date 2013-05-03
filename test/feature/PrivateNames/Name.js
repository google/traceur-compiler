// Options: --private-names

function assertFrozen(obj) {
  assert.isTrue(Object.isFrozen(obj));
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
assert.isTrue(isName(n));
assert.isFalse(isName(n.public));
assert.equal('object', typeof n.public);
assert.notEqual(n, n.public);
assert.isFalse(isName(n.public));
assert.equal(n + '', n.public + '');
assertNameFrozen(n);

var n2 = new Name('abc');
assert.isTrue(isName(n2));
assert.isFalse(isName(n2.public));
assert.equal('object', typeof n2.public);
assert.notEqual(n2, n2.public);
assert.isFalse(isName(n2.public));
assert.equal(n2 + '', n2.public + '');
assert.equal('abc', n2.public + '');
assertNameFrozen(n2);
