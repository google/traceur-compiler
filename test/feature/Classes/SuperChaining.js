class ChainA {
  function foo() {
    return 'A';
  }
}

class ChainB extends ChainA {
  function foo() {
    return super.foo() + ' B';
  }
}

class ChainC extends ChainB {
  function foo() {
    return super.foo() + ' C';
  }
}

class ChainD extends ChainC {
  function foo() {
    return super.foo() + ' D';
  }
}

// ----------------------------------------------------------------------------

var d = new ChainD();
assertEquals('A B C D', d.foo());
