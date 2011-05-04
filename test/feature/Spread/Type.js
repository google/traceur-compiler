
// ----------------------------------------------------------------------------

assertArrayEquals([0, 1], [0, ...null, 1]);
assertArrayEquals([0, 1], [0, ...undefined, 1]);
assertArrayEquals([0, 1], [0, ...{}, 1]);
assertArrayEquals([0, 1, 2, 3], [0, ...{0: 1, 1: 2, length: 2}, 3]);
assertArrayEquals([0, 'a', 'b', 'c', 1], [0, ... new String('abc'), 1]);

assertThrows(function() {
  [0, ...1, 1];
});

assertThrows(function() {
  [0, ...'string', 1];
});

assertThrows(function() {
  [0, ...true, 1];
});

assertThrows(function() {
  [0, ...function() {}, 1];
});
