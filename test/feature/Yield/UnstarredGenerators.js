// Options: --unstarredGenerators

function G() {
  yield 42;
}

var g = G();

assert.deepEqual({value: 42, done: false}, g.next());
assert.deepEqual({value: undefined, done: true}, g.next());
