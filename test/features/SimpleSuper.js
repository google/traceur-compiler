class SuperBase {
  m() { return 40; }
  var baseX;
  get x () { return this.baseX; }
  set x (value) { this.baseX = value; }
  var baseF = 1;
  var baseC;
  new() {
    this.baseC = 2;
    this.baseX = 4;
  }
}

class SuperDerived : SuperBase {
  m() { return 41; }
  superM() { return super.m(); }
  var x = 10;
  superX() { return super.x; }
  var derC;
  new() {
    this.derC = 3;
    super();
  }
}

