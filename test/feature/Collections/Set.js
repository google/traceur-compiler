var t = new Set();

var objectKey = {};
var stringKey = 'keykeykey';
var numberKey = 42.24;
var booleanKey = true;
var undefinedKey = undefined;
var nullKey = null;
var nanKey = NaN;
var zeroKey = 0;

t.add(objectKey);
t.add(stringKey);
t.add(numberKey);
t.add(booleanKey);
t.add(undefinedKey);
t.add(nullKey);
t.add(nanKey);
t.add(zeroKey);

assert.equal(t.size, 8);

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

var expected = [ undefinedKey, nullKey, stringKey,
    numberKey, booleanKey, objectKey,
    nanKey, zeroKey ];
expected.sort();


// forEach
var arr = [];
var cnt = 0;

t.forEach(val => {
  arr.push(val);
  cnt++;
});

assert.equal(cnt, 8);


arr.sort();
assertArrayEquals(arr, expected);

// iterator
arr = [];
cnt = 0;

for(var setItterVal of t) {
  arr.push(setItterVal);
  cnt++;
}
assert.equal(cnt, 8);


arr.sort();
assertArrayEquals(arr, expected);

// .values()
arr = [];
cnt = 0;

for(var setItterVal of t.values()) {
  arr.push(setItterVal);
  cnt++;
}
assert.equal(cnt, 8);


arr.sort();
assertArrayEquals(arr, expected);

var t3 = new Set([[], {}, NaN]);
assert.equal(t3.size, 3);
assert.isTrue(t3.has(NaN));
t3.delete(NaN);
assert.equal(t3.size, 2);
t3.delete(NaN);
assert.equal(t3.size, 2);
t3.clear();
assert.equal(t3.size, 0);