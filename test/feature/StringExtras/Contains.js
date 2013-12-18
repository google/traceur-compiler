// Tests taken from http://mths.be/contains

Object.prototype[1] = 2; // try to break `arguments[1]`

assert.equal(String.prototype.contains.length, 1);

assert.equal('abc'.contains(), false);
assert.equal('aundefinedb'.contains(), true);
assert.equal('abc'.contains(undefined), false);
assert.equal('aundefinedb'.contains(undefined), true);
assert.equal('abc'.contains(null), false);
assert.equal('anullb'.contains(null), true);
assert.equal('abc'.contains(false), false);
assert.equal('afalseb'.contains(false), true);
assert.equal('abc'.contains(NaN), false);
assert.equal('aNaNb'.contains(NaN), true);
assert.equal('abc'.contains('abc'), true);
assert.equal('abc'.contains('def'), false);
assert.equal('abc'.contains(''), true);
assert.equal(''.contains(''), true);

assert.equal('abc'.contains('b', -Infinity), true);
assert.equal('abc'.contains('b', -1), true);
assert.equal('abc'.contains('b', -0), true);
assert.equal('abc'.contains('b', +0), true);
assert.equal('abc'.contains('b', NaN), true);
assert.equal('abc'.contains('b', 'x'), true);
assert.equal('abc'.contains('b', false), true);
assert.equal('abc'.contains('b', undefined), true);
assert.equal('abc'.contains('b', null), true);
assert.equal('abc'.contains('b', 1), true);
assert.equal('abc'.contains('b', 2), false);
assert.equal('abc'.contains('b', 3), false);
assert.equal('abc'.contains('b', 4), false);
assert.equal('abc'.contains('b', +Infinity), false);
assert.equal('abc'.contains('bc'), true);
assert.equal('abc'.contains('bc\0'), false);

assert.equal('abc123def'.contains(1, -Infinity), true);
assert.equal('abc123def'.contains(1, -1), true);
assert.equal('abc123def'.contains(1, -0), true);
assert.equal('abc123def'.contains(1, +0), true);
assert.equal('abc123def'.contains(1, NaN), true);
assert.equal('abc123def'.contains(1, 'x'), true);
assert.equal('abc123def'.contains(1, false), true);
assert.equal('abc123def'.contains(1, undefined), true);
assert.equal('abc123def'.contains(1, null), true);
assert.equal('abc123def'.contains(1, 1), true);
assert.equal('abc123def'.contains(1, 2), true);
assert.equal('abc123def'.contains(1, 3), true);
assert.equal('abc123def'.contains(1, 4), false);
assert.equal('abc123def'.contains(1, 5), false);
assert.equal('abc123def'.contains(1, +Infinity), false);

assert.equal('abc123def'.contains(9, -Infinity), false);
assert.equal('abc123def'.contains(9, -1), false);
assert.equal('abc123def'.contains(9, -0), false);
assert.equal('abc123def'.contains(9, +0), false);
assert.equal('abc123def'.contains(9, NaN), false);
assert.equal('abc123def'.contains(9, 'x'), false);
assert.equal('abc123def'.contains(9, false), false);
assert.equal('abc123def'.contains(9, undefined), false);
assert.equal('abc123def'.contains(9, null), false);
assert.equal('abc123def'.contains(9, 1), false);
assert.equal('abc123def'.contains(9, 2), false);
assert.equal('abc123def'.contains(9, 3), false);
assert.equal('abc123def'.contains(9, 4), false);
assert.equal('abc123def'.contains(9, 5), false);
assert.equal('abc123def'.contains(9, +Infinity), false);

assert.equal('foo[a-z]+(bar)?'.contains('[a-z]+'), true);
assert.equal('foo[a-z]+(bar)?'.contains(/[a-z]+/), false);
assert.equal('foo/[a-z]+/(bar)?'.contains(/[a-z]+/), true);
assert.equal('foo[a-z]+(bar)?'.contains('(bar)?'), true);
assert.equal('foo[a-z]+(bar)?'.contains(/(bar)?/), false);
assert.equal('foo[a-z]+/(bar)?/'.contains(/(bar)?/), true);

// http://mathiasbynens.be/notes/javascript-unicode#poo-test
var string = 'I\xF1t\xEBrn\xE2ti\xF4n\xE0liz\xE6ti\xF8n\u2603\uD83D\uDCA9';
assert.equal(string.contains(''), true);
assert.equal(string.contains('\xF1t\xEBr'), true);
assert.equal(string.contains('\xE0liz\xE6'), true);
assert.equal(string.contains('\xF8n\u2603\uD83D\uDCA9'), true);
assert.equal(string.contains('\u2603'), true);
assert.equal(string.contains('\uD83D\uDCA9'), true);

assert.throw(function() { String.prototype.contains.call(undefined); }, TypeError);
assert.throw(function() { String.prototype.contains.call(undefined, 'b'); }, TypeError);
assert.throw(function() { String.prototype.contains.call(undefined, 'b', 4); }, TypeError);
assert.throw(function() { String.prototype.contains.call(null); }, TypeError);
assert.throw(function() { String.prototype.contains.call(null, 'b'); }, TypeError);
assert.throw(function() { String.prototype.contains.call(null, 'b', 4); }, TypeError);
assert.equal(String.prototype.contains.call(42, '2'), true);
assert.equal(String.prototype.contains.call(42, 'b', 4), false);
assert.equal(String.prototype.contains.call(42, '2', 4), false);
assert.equal(String.prototype.contains.call({ 'toString': function() { return 'abc'; } }, 'b', 0), true);
assert.equal(String.prototype.contains.call({ 'toString': function() { return 'abc'; } }, 'b', 1), true);
assert.equal(String.prototype.contains.call({ 'toString': function() { return 'abc'; } }, 'b', 2), false);

assert.throw(function() { String.prototype.contains.apply(undefined); }, TypeError);
assert.throw(function() { String.prototype.contains.apply(undefined, ['b']); }, TypeError);
assert.throw(function() { String.prototype.contains.apply(undefined, ['b', 4]); }, TypeError);
assert.throw(function() { String.prototype.contains.apply(null); }, TypeError);
assert.throw(function() { String.prototype.contains.apply(null, ['b']); }, TypeError);
assert.throw(function() { String.prototype.contains.apply(null, ['b', 4]); }, TypeError);
assert.equal(String.prototype.contains.apply(42, ['2']), true);
assert.equal(String.prototype.contains.apply(42, ['b', 4]), false);
assert.equal(String.prototype.contains.apply(42, ['2', 4]), false);
assert.equal(String.prototype.contains.apply({ 'toString': function() { return 'abc'; } }, ['b', 0]), true);
assert.equal(String.prototype.contains.apply({ 'toString': function() { return 'abc'; } }, ['b', 1]), true);
assert.equal(String.prototype.contains.apply({ 'toString': function() { return 'abc'; } }, ['b', 2]), false);

delete Object.prototype[1];
