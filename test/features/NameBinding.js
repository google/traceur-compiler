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


