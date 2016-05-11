var a = '';
var b = ['b', ...a];
var c = [...b, ...b];
var d;
var e = [0, ...d = '12', 3];
var f = [... new String('abc')];

// ----------------------------------------------------------------------------

assert.deepEqual(['b'], b);
assert.deepEqual(['b', 'b'], c);
assert.deepEqual([0, '1', '2', 3], e);
assert.deepEqual(['a', 'b', 'c'], f);
