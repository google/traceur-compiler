// should have a length of 1
assert.equal(Array.from.length, 1);
var arr;
var obj;

// should make an array from arguments
var arrayFromArgs = function() {return Array.from(arguments);};
arr = arrayFromArgs('a', 1);

assert.equal(arr.length, 2);
assert.deepEqual(arr, ['a', 1]);
assert.equal(Array.isArray(arr), true);

// should handle undefined values
var arrayLike = {0: 'a', 2: 'c', length: 3};
arr = Array.from(arrayLike);

assert.equal(arr.length, 3);
assert.deepEqual(arr, ['a', undefined, 'c']);
assert.equal(Array.isArray(arr), true);

// should use a mapFn
arr = Array.from([{'a': 1}, {'a': 2}], function(item, i) {
  return item.a + i;
});

assert.deepEqual(arr, [1, 3]);

// should set this in mapFn
var thisObj = {a: 10};
arr = Array.from([{'a': 1}, {'a': 2}], function(item, i) {
  return this.a + item.a + i;
}, thisObj);

assert.deepEqual(arr, [11, 13]);

// should map on array-like object
arr = Array.from({0: {'a': 5}, length: 1}, function(item, i) {
  return item.a + i;
});

assert.deepEqual(arr, [5]);

// should throw on bad map fn
assert.throws(function() {
  Array.from.call([], null)
}, TypeError);

// should make from an array-like object
var arrayLikeObj = function(len) {
  this.length = len;
};
arrayLikeObj.from = Array.from;
obj = arrayLikeObj.from(['a', 'b', 'c']);

assert.equal(obj.length, 3);
assert.deepEqual(obj, {0: 'a', 1: 'b', 2: 'c', length: 3});

// should make from a non-array iterable
var calledIterator = 0;
var Iterable = function(len) {
  var self = this;

  self.length = len;
  self[Symbol.iterator] = function*() {
    for (var i = 0; i < self.length; i++) {
      calledIterator++;
      yield self[i];
    }
  };
};
var it = new Iterable(3);
it[0] = 'a';
it[1] = 'b';
it[2] = 'c';
obj = Array.from(it);

assert.equal(obj.length, 3);
assert.equal(obj[0], 'a');
assert.equal(obj[1], 'b');
assert.equal(obj[2], 'c');
assert.equal(calledIterator, 3);
