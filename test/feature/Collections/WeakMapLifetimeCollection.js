var t = new WeakMap();

var objectKey = {};
var frozenKey = Object.freeze({});
var sealedKey = Object.seal({});
var preventedExtensionsKey = Object.preventExtensions({});

t.set(objectKey, 'value1', true);
t.set(frozenKey, 'value2', true);
t.set(sealedKey, 'value3', true);
t.set(preventedExtensionsKey, 'value4', true);

assert.isTrue(t.get(objectKey) === 'value1');
assert.isTrue(t.get(frozenKey) === 'value2');
assert.isTrue(t.get(sealedKey) === 'value3');
assert.isTrue(t.get(preventedExtensionsKey) === 'value4');

assert.isTrue(t.get({}) === undefined);

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
var t2 = new WeakMap([[key2, NaN]]);
assert.isTrue(t2.has(key2));
assert.isTrue(isNaN(t2.get(key2)));
t2.delete(key2);
assert.isTrue(t2.get(key2) === undefined);
assert.isTrue(!t2.has(key2));

var t3 = new WeakMap();
t3.set(key2, undefined);
assert.isTrue(t3.get(key2, 'foo') === undefined);