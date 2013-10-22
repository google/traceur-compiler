assert.equal(String.fromCodePoint.length, 0);

assert.equal(String.fromCodePoint(''), '\0');
assert.equal(String.fromCodePoint(), '');
assert.equal(String.fromCodePoint(-0), '\0');
assert.equal(String.fromCodePoint(0), '\0');
assert.equal(String.fromCodePoint(0x1D306), '\uD834\uDF06');
assert.equal(String.fromCodePoint(0x1D306, 0x61, 0x1D307), '\uD834\uDF06a\uD834\uDF07');
assert.equal(String.fromCodePoint(0x61, 0x62, 0x1D307), 'ab\uD834\uDF07');
assert.equal(String.fromCodePoint(false), '\0');
assert.equal(String.fromCodePoint(null), '\0');

assertThrows(function() { String.fromCodePoint('_'); });
assertThrows(function() { String.fromCodePoint('+Infinity'); });
assertThrows(function() { String.fromCodePoint('-Infinity'); });
assertThrows(function() { String.fromCodePoint(-1); });
assertThrows(function() { String.fromCodePoint(0x10FFFF + 1); });
assertThrows(function() { String.fromCodePoint(3.14); });
assertThrows(function() { String.fromCodePoint(3e-2); });
assertThrows(function() { String.fromCodePoint(Infinity); });
assertThrows(function() { String.fromCodePoint(NaN); });
assertThrows(function() { String.fromCodePoint(undefined); });
assertThrows(function() { String.fromCodePoint({}); });
