// Options: --jsx=f
// Make sure your editor is NOT stripping whitespace when editing this.

function f(name, props, ...children) {
  return children;
}

assert.deepEqual([], <p/>);
assert.deepEqual(['a'], <p>a</p>);
assert.deepEqual(['a b'], <p>a b</p>);
assert.deepEqual(['a  b'], <p>a  b</p>);
assert.deepEqual(['a   b'], <p>a   b</p>);

// tabs gets replaced by spaces
assert.deepEqual(['a b'], <p>a	b</p>);
assert.deepEqual(['a   b'], <p>a			b</p>);

// Leading/trailing space with newlines gets stripped.
assert.deepEqual(['a'], <p>a
</p>);
assert.deepEqual(['a'], <p>
  a</p>);
assert.deepEqual(['a'], <p>
  a
</p>);

assert.deepEqual(['a'], <p>a 
</p>);
assert.deepEqual(['a'], <p> 
  a</p>);
assert.deepEqual(['a'], <p> 
  a
</p>);

assert.deepEqual([['b'], '  ', ['c']], <p>
  <q>b</q>  <r>c</r>
</p>);

assert.deepEqual([' ', ' ', ' '], <p> {} {} </p>);
