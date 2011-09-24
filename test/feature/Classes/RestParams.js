class RestParams {
  constructor(...rest) {
    this.rest = rest;
  }
  instanceMethod(...rest) {
    return rest;
  }
  static staticMethod(...rest) {
    return rest;
  }
}

// ----------------------------------------------------------------------------

var obj = new RestParams(0, 1, 2);
assertArrayEquals([0, 1, 2], obj.rest);
assertArrayEquals([3, 4, 5], obj.instanceMethod(3, 4, 5));
assertArrayEquals([6, 7, 8], RestParams.staticMethod(6, 7, 8));
