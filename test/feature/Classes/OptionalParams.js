class OptionalParams {
  constructor(opt = 1) {
    this.opt = opt;
  }
  instanceMethod(opt = 2) {
    return opt;
  }
  static staticMethod(opt = 3) {
    return opt;
  }
}

// ----------------------------------------------------------------------------

var obj = new OptionalParams();
assertEquals(1, obj.opt);
assertEquals(2, obj.instanceMethod());
assertEquals(3, obj.instanceMethod(3));
assertEquals(3, OptionalParams.staticMethod());
assertEquals(4, OptionalParams.staticMethod(4));

var obj2 = new OptionalParams(2);
assertEquals(2, obj2.opt);