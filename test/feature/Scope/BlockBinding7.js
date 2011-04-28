function blockTest() {
  {
    let x = 'let x value';
    function g() {
      return x;
    }
    return g;
  }
}

// ----------------------------------------------------------------------------

assertEquals('let x value', blockTest()());
