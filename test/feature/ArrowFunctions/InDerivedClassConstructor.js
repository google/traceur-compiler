class Base {
  bar() {
    return 1;
  }
}

class Derived extends Base {
  constructor() {
    super()
    this.foo = () => {
      return this.bar();
    };
  }
  bar() {
    return 2;
  }
}

let d = new Derived();
assert.equal(2, (0, d).foo());
