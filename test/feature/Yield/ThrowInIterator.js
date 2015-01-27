function *f() {
  try {
    yield *[1, 2, 3];
  }
  catch (ex) {
    yield ex;
  }
}

var g = f();
assert.deepEqual(g.next(), {value: 1, done: false});
assert.deepEqual(g.throw(42), {value: 42, done: false});
assert.deepEqual(g.next(), {value: undefined, done: true});

