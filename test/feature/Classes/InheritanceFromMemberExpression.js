var baseContainer = {
  base: function() {
    this.yyy = 'base constructor';
  }
};

baseContainer.base.prototype = {
  x: 'proto x',
  constructor: function() {
    this.y = 'base y';
  }
}

class MemberExprBase extends baseContainer.base {
  constructor(w) {
    super();
    this.z = 'var z';
    this.w = w;
  }
}

// ----------------------------------------------------------------------------

var a = new MemberExprBase('w value');
var pa = Object.getPrototypeOf(a);
var ppa = Object.getPrototypeOf(pa);

assert.isTrue(a.hasOwnProperty('yyy'));
assert.isTrue(a.hasOwnProperty('w'));
assert.isTrue(a.hasOwnProperty('z'));
assert.isFalse(a.hasOwnProperty('x'));
assert.isTrue(pa.hasOwnProperty('constructor'));
assert.isTrue(ppa.hasOwnProperty('x'));
assert.isTrue(ppa.hasOwnProperty('constructor'));
