var t = new WeakSet();

var objectKey = {};
var frozenKey = Object.freeze({});
var sealedKey = Object.seal({});
var preventedExtensionsKey = Object.preventExtensions({});

t.add(objectKey);
t.add(frozenKey);
t.add(sealedKey);
t.add(preventedExtensionsKey);

assert.isTrue(!t.has({}));

assert.isTrue(t.has(objectKey));
assert.isTrue(t.has(frozenKey));
assert.isTrue(t.has(sealedKey));
assert.isTrue(t.has(preventedExtensionsKey));

t.clear();
assert.isTrue(!t.has(objectKey));
assert.isTrue(!t.has(frozenKey));
assert.isTrue(!t.has(sealedKey));
assert.isTrue(!t.has(preventedExtensionsKey));


var key2 = function () {};
var t2 = new WeakSet([key2]);
assert.isTrue(t2.has(key2));
t2.delete(key2);
assert.isTrue(!t2.has(key2));
