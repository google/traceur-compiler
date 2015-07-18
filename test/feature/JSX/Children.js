// Options: --jsx=f

function f(name, props, ...children) {
  return {
    [name]: children
  };
}

assert.deepEqual({p: []}, <p/>);
assert.deepEqual({p: [42]}, <p>{42}</p>);
assert.deepEqual({p: [1, 2]}, <p>{1}{2}</p>);
assert.deepEqual({p: [' ', 1, ' ', 2, ' ']}, <p> {1} {2} </p>);
assert.deepEqual({p: [' ', ' ', 2, ' ']}, <p> {} {2} </p>);

assert.deepEqual({a: [{b: []}]}, <a><b/></a>);
assert.deepEqual({a: ['x', {b: []}, 'y', {c: []}, 'z']}, <a>x<b/>y<c/>z</a>);
