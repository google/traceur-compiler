var s = Symbol();
var object = {};
object[s] = 42;
assert.equal(42, object[s]);
// Native Symbol throws for ToString.
// assert.isUndefined(object[s + '']);
assert.deepEqual([], Object.getOwnPropertyNames(object));
assert.isTrue(object.hasOwnProperty(s));

assert.equal(32, object[s] -= 10);
assert.equal(16, object[s] /= 2);
assert.equal(16, object[s]);

var n = Symbol();
assert.equal(object[n] = 1, 1);
assert.equal(object[n] += 2, 3);

assert.isTrue(Object.getOwnPropertyDescriptor(object, n).enumerable);

assert.isTrue(n in object);
assert.isTrue(delete object[n]);
assert.isFalse(n in object);

/* TODO(jjb): Issue #1991
var keys = [];
for (var k in object) {
	keys.push(k);
}
assert.equal(0, keys.length, keys + '');
assert.equal(0, Object.keys(object).length);
*/
