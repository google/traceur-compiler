var t = new Set();

var objectKey = {};
var frozenKey = Object.freeze({});
var sealedKey = Object.seal({});
var preventedExtensionsKey = Object.preventExtensions({});
var stringKey = 'keykeykey';
var numberKey = 42.24;
var booleanKey = true;
var undefinedKey = undefined;
var nullKey = null;

assert.isTrue(t.size === 0);

t.add(objectKey);
t.add(frozenKey);
t.add(sealedKey);
t.add(preventedExtensionsKey);
t.add(stringKey);
t.add(numberKey);
t.add(booleanKey);
t.add(undefinedKey);
t.add(nullKey);

assert.isTrue(t.size === 9);

assert.isTrue(!t.has({}));

assert.isTrue(t.has(objectKey));
assert.isTrue(t.has(frozenKey));
assert.isTrue(t.has(sealedKey));
assert.isTrue(t.has(preventedExtensionsKey));
assert.isTrue(t.has(stringKey));
assert.isTrue(t.has(numberKey));
assert.isTrue(t.has(booleanKey));
assert.isTrue(t.has(undefinedKey));
assert.isTrue(t.has(nullKey));

assert.isTrue(t.has('keykeykey'));
assert.isTrue(t.has(42.24));
assert.isTrue(t.has(true));
assert.isTrue(t.has(undefined));
assert.isTrue(t.has(null));

var cnt = 0;
for (var key of t) {
	cnt++;
}
assert.isTrue(cnt === 9);

var cnt = 0;
for (var [key, value] of t.entries()) {
	cnt++;
}
assert.isTrue(cnt  === 9);

var cnt = 0;
for (var key of t.keys()) {
	cnt++;
}
assert.isTrue(cnt  === 9);

var cnt = 0;
for (var value of t.values()) {
	cnt++;
}
assert.isTrue(cnt  === 9);


var t2 = new Set(t);
assert.isTrue(t2.size === 9);
t2.delete(undefined);
assert.isTrue(t2.size === 8);
t2.delete(objectKey);
assert.isTrue(t2.size === 7);

t.clear();
assert.isTrue(t.size === 0);

assert.isTrue(!t.has(objectKey));
assert.isTrue(!t.has(frozenKey));
assert.isTrue(!t.has(sealedKey));
assert.isTrue(!t.has(preventedExtensionsKey));
assert.isTrue(!t.has(stringKey));
assert.isTrue(!t.has(numberKey));
assert.isTrue(!t.has(booleanKey));
assert.isTrue(!t.has(undefinedKey));
assert.isTrue(!t.has(nullKey));

assert.isTrue(!t.has('keykeykey'));
assert.isTrue(!t.has(42.24));
assert.isTrue(!t.has(true));
assert.isTrue(!t.has(undefined));
assert.isTrue(!t.has(null));

