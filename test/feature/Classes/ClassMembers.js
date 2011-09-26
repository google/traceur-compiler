class StaticA {
  static sa = 'sa';
  static function sma() {}
}

class StaticB extends StaticA {
  static sb = 'sb';
  static function smb() {}
}

class StaticC extends StaticB {
  static sc = 'sc';
  static function smc() {}
}

// ----------------------------------------------------------------------------

var a = new StaticA();
var b = new StaticB();
var c = new StaticC();

assertLacksOwnProperty(a, 'sa', 'sma', 'sb', 'smb', 'sc', 'smc');
assertHasOwnProperty(StaticA, 'sa', 'sma');
assertLacksOwnProperty(StaticA, 'sb', 'smb', 'sc', 'smc');

assertLacksOwnProperty(b, 'sa', 'sma', 'sb', 'smb', 'sc', 'smc');
assertHasOwnProperty(StaticB, 'sb', 'smb');
assertLacksOwnProperty(StaticB, 'sa', 'sma', 'sc', 'smc');

assertLacksOwnProperty(c, 'sa', 'sma', 'sb', 'smb', 'sc', 'smc');
assertHasOwnProperty(StaticC, 'sc', 'smc');
assertLacksOwnProperty(StaticC, 'sa', 'sma', 'sb', 'smb');
