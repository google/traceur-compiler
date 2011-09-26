class MethodsA {
  function ma() {}
  static function sma() {}
}

class MethodsB extends MethodsA {
  function mb() {}
  static function smb() {}
}

class MethodsC extends MethodsB {
  function mc() {}
  static function smc() {}
}

// ----------------------------------------------------------------------------

var a = new MethodsA();
var b = new MethodsB();
var c = new MethodsC();

var pa = Object.getPrototypeOf(a);
var pb = Object.getPrototypeOf(b);
var pc = Object.getPrototypeOf(c);

assertNoOwnProperties(a);
assertNoOwnProperties(b);
assertNoOwnProperties(c);

assertHasOwnProperty(pa, 'ma');
assertLacksOwnProperty(pa, 'mb', 'mc', 'sma', 'smb', 'smc');
assertHasOwnProperty(pb, 'mb');
assertLacksOwnProperty(pb, 'ma', 'mc', 'sma', 'smb', 'smc');
assertHasOwnProperty(pc, 'mc');
assertLacksOwnProperty(pc, 'ma', 'mb', 'sma', 'smb', 'smc');

assertHasOwnProperty(MethodsA, 'sma');
assertLacksOwnProperty(MethodsA, 'smb', 'smc');
assertHasOwnProperty(MethodsB, 'smb');
assertLacksOwnProperty(MethodsB, 'sma', 'smc');
assertHasOwnProperty(MethodsC, 'smc');
assertLacksOwnProperty(MethodsC, 'sma', 'smb');
