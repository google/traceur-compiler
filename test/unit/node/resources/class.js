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
    return super() + this.x;
  }
}

var result = new C(1).method();
