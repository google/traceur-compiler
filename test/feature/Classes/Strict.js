class C1 {
  m() {
    return function() {
      return this;
    }();
  }
}

class C2 extends C1 {
  m() {
    return function() {
      return this;
    }();
  }
}

var C3 = class {
  m() {
    return function() {
      return this;
    }();
  }
};

var C4 = class extends C3 {
  m() {
    return function() {
      return this;
    }();
  }
};

assertUndefined(new C1().m());
assertUndefined(new C2().m());
assertUndefined(new C3().m());
assertUndefined(new C4().m());
