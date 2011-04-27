class ElementHolder {
  element;

  getElement() { return this.element; }

  makeFilterCapturedThis() {
    var capturedThis = this;
    return function (x) {
      return x == capturedThis.element;
    }
  }

  makeFilterLostThis() {
    return function (x) { return x == this.element; }
  }

  makeFilterHidden(element) {
    return function (x) { return x == element; }
  }
}

// ----------------------------------------------------------------------------

var obj = new ElementHolder();

obj.element = 40;
assertEquals(40, obj.getElement());
assertTrue(obj.makeFilterCapturedThis()(40));
assertFalse(obj.makeFilterLostThis()(40));

obj.element = 39;
assertFalse(obj.makeFilterCapturedThis()(40));
assertTrue(obj.makeFilterCapturedThis()(39));

assertFalse(obj.makeFilterHidden(41)(40));
assertTrue(obj.makeFilterHidden(41)(41));
