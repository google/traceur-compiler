// Options: --jsx=f

function f(name, props) {
  return props;
}

assert.deepEqual(<p {...{a: 'a'}}/>, {a: 'a'});
assert.deepEqual(<p a='a' {...{b: 'b'}}/>, {a: 'a', b: 'b'});
assert.deepEqual(<p a='a' {...{b: 'b'}} c='c'/>, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual(<p a='a' b='b' {...{c: 'c'}}/>, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual(<p a='a' b='b' c='c' {...{}}/>, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual(<p {...{a: 'a'}} b='b' c='c'/>, {a: 'a', b: 'b', c: 'c'});
assert.deepEqual(<p {...{a: 'a'}} {...{b: 'b'}} {...{c: 'c'}}/>,
    {a: 'a', b: 'b', c: 'c'});

assert.deepEqual(<p a={1} {...{a: 2}}/>, {a: 2});
assert.deepEqual(<p {...{a: 1}} a={2}/>, {a: 2});
