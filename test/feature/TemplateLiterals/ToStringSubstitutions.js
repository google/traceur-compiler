var a = {
  toString: function() { return 'a'; },
  valueOf: function() { return '-a-'; }
};
var b = {
  toString: function() { return 'b'; },
  valueOf: function() { return '-b-'; }
};
assert.equal('a', `${a}`);
assert.equal('ab', `${a}${b}`);
assert.equal('-a--b-', `${a + b}`);
assert.equal('-a-', `${a + ''}`);
assert.equal('1a', `1${a}`);
assert.equal('1a2', `1${a}2`);
assert.equal('1a2b', `1${a}2${b}`);
assert.equal('1a2b3', `1${a}2${b}3`);
