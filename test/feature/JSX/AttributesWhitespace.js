// Options: --jsx=f

// This file has trailing whitespace. Make sure your editor does not strip
// them.

function f(name, props) {
  return props.b;
}

assert.equal(<a b=" c "/>, ' c ');
assert.equal(<a b="  c  "/>, '  c  ');
assert.equal(<a b="c "/>, 'c ');
assert.equal(<a b="c "/>, 'c ');
assert.equal(<a b="\tc\n"/>, '\\tc\\n');
assert.equal(<a b="'"/>, '\'');
assert.equal(<a b='"'/>, '"');
assert.equal(<a b="&"/>, '&');
assert.equal(<a b='
'/>, '\n');
assert.equal(<a b=' 
'/>, ' \n');
assert.equal(<a b='
 '/>, ' ');
assert.equal(<a b='

'/>, ' ');
assert.equal(<a b=' 

'/>, '  ');
assert.equal(<a b='	'/>, '\t');
