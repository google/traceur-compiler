function noClassA() {}
noClassA.prototype = {
  ma: function() { return 'ma'; }
}

class NoClassB : noClassA {
  mb() {
    return 'mb ' + super.ma();
  }
}

// ----------------------------------------------------------------------------

var b = new NoClassB;
assertTrue(b instanceof noClassA);
assertEquals('ma', b.ma());
assertEquals('mb ma', b.mb());
