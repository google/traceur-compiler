function* f() {
  return yield 111;
}

var g = f();

assert.deepEqual({value: 111, done: false}, g.next());
assert.deepEqual({value: undefined, done: true}, g.next());
