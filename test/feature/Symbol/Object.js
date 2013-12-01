// Options: --symbols

var s = Symbol();
var object = {};
object[s] = 42;
assert.equal(42, object[s]);
assert.isUndefined(object[n + '']);
assertArrayEquals([], Object.getOwnPropertyNames(object));
assert.isTrue(object.hasOwnProperty(s));

assert.equal(32, object[s] -= 10);
assert.equal(16, object[s] /= 2);
assert.equal(16, object[s]);

var n = Symbol();
assert.equal(o[n] = 1, 1);
assert.equal(o[n] += 2, 3);

assert.isFalse(Object.getOwnPropertyDescriptor(o, n).enumerable);

assert.isTrue(n in o);
assert.isTrue(delete o[n]);
assert.isFalse(n in o);
