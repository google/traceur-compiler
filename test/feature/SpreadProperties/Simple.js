// Options: --spread-properties

assert.deepEqual({...{a: 'a'}}, {a: 'a'});
assert.deepEqual({a: 'a', ...{b: 'b'}}, {a: 'a', b: 'b'});
assert.deepEqual({a: 'a', ...{b: 'b'}, c: 'c'}, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual({a: 'a', b: 'b', ...{c: 'c'}}, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual({a: 'a', b: 'b', c: 'c', ...{}}, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual({...{a: 'a'}, b: 'b', c: 'c'}, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual({...{a: 'a'}, ...{b: 'b'}, ...{c: 'c'}},
    {a: 'a', b: 'b', c: 'c'});

assert.deepEqual({a: 1, ...{a: 2}}, {a: 2});
assert.deepEqual({...{a: 1}, a: 2}, {a: 2});
