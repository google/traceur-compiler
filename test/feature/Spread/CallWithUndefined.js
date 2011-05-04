function f(...args) {
  return args;
}
var result = f(0, ...undefined, 1);

// ----------------------------------------------------------------------------

assertArrayEquals([0, 1], result);
