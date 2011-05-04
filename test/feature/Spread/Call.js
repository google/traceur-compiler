function f(...args) {
  return args;
}
var result = f(0, ...[1, 2], 3);

// ----------------------------------------------------------------------------

assertArrayEquals([0, 1, 2, 3], result);
