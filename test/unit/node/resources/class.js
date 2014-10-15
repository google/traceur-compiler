class B {
  constructor(x) {
    this.x = x;
  }
  method() {
    return 1;
  }
}

class C extends B {
  method() {
    return super.method() + this.x;
  }
}

var result = new C(1).method();
