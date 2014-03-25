var t = new Map();

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

t.set(objectKey, 				'value1');
t.set(frozenKey, 				'value2');
t.set(sealedKey, 				'value3');
t.set(preventedExtensionsKey, 	'value4');
t.set(stringKey, 				'value5');
t.set(numberKey, 				'value6');
t.set(booleanKey, 				'value7');
t.set(undefinedKey, 			'value8');
t.set(nullKey, 					'value9');

assert.isTrue(t.size === 9);

assert.isTrue(t.get(objectKey)  === 'value1');
assert.isTrue(t.get(frozenKey)  === 'value2');
assert.isTrue(t.get(sealedKey)  === 'value3');
assert.isTrue(t.get(preventedExtensionsKey)  === 'value4');
assert.isTrue(t.get(stringKey)  === 'value5');
assert.isTrue(t.get(numberKey)  === 'value6');
assert.isTrue(t.get(booleanKey)  === 'value7');
assert.isTrue(t.get(undefinedKey)  === 'value8');
assert.isTrue(t.get(nullKey)  === 'value9');

assert.isTrue(t.get({})  === undefined);
assert.isTrue(t.get('keykeykey')  === 'value5');
assert.isTrue(t.get(42.24)  === 'value6');
assert.isTrue(t.get(true)  === 'value7');
assert.isTrue(t.get(undefined)  === 'value8');
assert.isTrue(t.get(null)  === 'value9');

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
for (var [key, value] of t) {
	cnt++;
}
assert.isTrue(cnt  === 9);

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


var t2 = new Map(t);
assert.isTrue(t2.size === 9);
t2.clear();
assert.isTrue(t2.size === 0);

var t3 = new Map([ [[],[]], [{},{}], [NaN,NaN] ]);
assert.isTrue(t3.size === 3);
assert.isTrue(t3.has(NaN));
assert.isTrue(isNaN(t3.get(NaN)));
t3.delete(NaN);
assert.isTrue(t3.size === 2);
t3.delete(NaN);
assert.isTrue(t3.size === 2);
