
assertArrayEquals([0, 1], [0, ...{}, 1]);
assertArrayEquals([0, 1, 2, 3], [0, ...{0: 1, 1: 2, length: 2}, 3]);
assertArrayEquals([0, 'a', 'b', 'c', 1],[0, ...'abc', 1]);
assertArrayEquals([0, 'a', 'b', 'c', 1], [0, ... new String('abc'), 1]);
assertArrayEquals([0, 1], [0, ...true, 1]);
assertArrayEquals([0, 1],[0, ...1, 1]);
assertArrayEquals([0, 1],[0, ...function() {}, 1]);
assertArrayEquals([0, undefined, undefined, 1],[0, ...function(x, y) {}, 1]);
assertArrayEquals([0, 1],[0, ...{}, 1]);

assert.throw(function() {
  [0, ...null, 1];
}, TypeError);

assert.throw(function() {
  [0, ...undefined, 1];
}, TypeError);

