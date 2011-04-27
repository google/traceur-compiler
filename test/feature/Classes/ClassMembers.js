class StaticA {
  class sa = 'sa';
  class function sma() {}
}

class StaticB : StaticA {
  class sb = 'sb';
  class function smb() {}
}

class StaticC : StaticB {
  class sc = 'sc';
  class function smc() {}
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
