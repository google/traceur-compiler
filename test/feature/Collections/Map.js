var t = new Map();

var objectKey = {};
var stringKey = 'keykeykey';
var numberKey = 42.24;
var booleanKey = true;
var undefinedKey = undefined;
var nullKey = null;
var nanKey = NaN;
var zeroKey = 0;


assert.equal(t.size, 0);

t.set(undefinedKey, 'value8');
t.set(nullKey, 'value9');
t.set(stringKey, 'value5');
t.set(numberKey, 'value6');
t.set(booleanKey, 'value7');
t.set(objectKey, 'value1');
t.set(nanKey, 'value10');
t.set(zeroKey, 'value11');

assert.equal(t.size, 8);

assert.equal(t.get(objectKey), 'value1');
assert.equal(t.get(stringKey), 'value5');
assert.equal(t.get(numberKey), 'value6');
assert.equal(t.get(booleanKey), 'value7');
assert.equal(t.get(undefinedKey), 'value8');
assert.equal(t.get(nullKey), 'value9');
assert.equal(t.get(nanKey), 'value10');
assert.equal(t.get(zeroKey), 'value11');

assert.equal(t.get({}), undefined);
assert.equal(t.get('keykeykey'), 'value5');
assert.equal(t.get(42.24), 'value6');
assert.equal(t.get(true), 'value7');
assert.equal(t.get(undefined), 'value8');
assert.equal(t.get(null), 'value9');
assert.equal(t.get(NaN), 'value10');
assert.equal(t.get(0), 'value11');
assert.equal(t.get(1/Number.POSITIVE_INFINITY), 'value11');
assert.equal(t.get(-1/Number.POSITIVE_INFINITY), 'value11');

assert.isTrue(!t.has({}));

assert.isTrue(t.has(objectKey));
assert.isTrue(t.has(stringKey));
assert.isTrue(t.has(numberKey));
assert.isTrue(t.has(booleanKey));
assert.isTrue(t.has(undefinedKey));
assert.isTrue(t.has(nullKey));
assert.isTrue(t.has(nanKey));
assert.isTrue(t.has(zeroKey));

assert.isTrue(t.has('keykeykey'));
assert.isTrue(t.has(42.24));
assert.isTrue(t.has(true));
assert.isTrue(t.has(undefined));
assert.isTrue(t.has(null));
assert.isTrue(t.has(NaN));
assert.isTrue(t.has(0));
assert.isTrue(t.has(-0));

var arrKeys = [];
var arr = [];
var cnt = 0;
t.forEach(function (value, key, map) {
  assert.equal(map, t);
  arrKeys.push(key);
  arr.push(value);
  cnt++;
});
assert.equal(cnt, 8);

assertArrayEquals(arrKeys, [ undefinedKey, nullKey, stringKey,
    numberKey, booleanKey, objectKey,
    nanKey, zeroKey ]);
assertArrayEquals(arr, ["value8", "value9", 
    "value5", "value6", "value7",
    "value1", "value10", "value11"]);

var t3 = new Map([ [[],[]], [{},{}], [NaN,NaN] ]);
assert.equal(t3.size, 3);
assert.isTrue(t3.has(NaN));
assert.isTrue(isNaN(t3.get(NaN)));
assert.equal(t3.set(NaN, NaN), t3); // test of 23.1.3.9.11
t3.delete(NaN);
assert.equal(t3.size, 2);
t3.delete(NaN);
assert.equal(t3.size, 2);
