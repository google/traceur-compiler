var baseContainer = {
  base: function() {}
}

baseContainer.base.prototype = {
  x: 'proto x',
  constructor: function() { this.y = 'base y'; }
}

class MemberExprBase extends baseContainer.base {
  var z = 'var z';
  constructor(w) { super(); this.w = w; }
}

// ----------------------------------------------------------------------------

var a = new MemberExprBase('w value');
var pa = Object.getPrototypeOf(a);
var ppa = Object.getPrototypeOf(pa);

assertHasOwnProperty(a, 'y', 'w', 'z');
assertLacksOwnProperty(a, 'x');
assertHasOwnProperty(pa, 'constructor');
assertHasOwnProperty(ppa, 'x', 'constructor')
