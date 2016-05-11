class RestParams {
  constructor(...rest) {
    this.rest = rest;
  }
  instanceMethod(...rest) {
    return rest;
  }
}

// ----------------------------------------------------------------------------

var obj = new RestParams(0, 1, 2);
assert.deepEqual([0, 1, 2], obj.rest);
assert.deepEqual([3, 4, 5], obj.instanceMethod(3, 4, 5));

