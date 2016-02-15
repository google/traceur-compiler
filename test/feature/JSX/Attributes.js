// Options: --jsx=f

function f(name, props) {
  return props;
}

assert.equal('b', <p a="b"/>.a);
assert.equal('b', <p a='b'/>.a);
assert.equal('b', <p a={'b'}/>.a);
assert.equal(42, <p a={42}/>.a);

assert.equal('d', <p a="b" c="d"/>.c);
assert.equal('f', <p e-e="f"/>['e-e']);

assert.deepEqual('j', <p g=<h i="j"/>/>.g.i);

// Boolean attribute shorthand.
assert.deepEqual({b: true}, <a b/>);
assert.deepEqual({b: true, c:true}, <a b c/>);
assert.deepEqual({b: 'b', c: true, d: 'd'}, <a b='b' c d='d'/>);
