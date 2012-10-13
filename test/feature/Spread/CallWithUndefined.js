function f(...args) {
  return args;
}

assertThrows(function() {
  // Should throw due to ToObject(undefined)
  f(0, ...undefined, 1);
})
