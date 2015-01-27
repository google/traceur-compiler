function *f1() {
  yield 1;
  yield 2;
}

var g1 = f1();
assert.deepEqual(g1.next(), {value: 1, done: false});
assert.deepEqual(g1.return(42), {value: 42, done: true});
assert.deepEqual(g1.next(), {value: undefined, done: true});

function *f2() {
  yield 1;
  try {
    yield 1;
  } catch (e) {
    return 2;
  }
}

var g2 = f2();
assert.deepEqual(g2.next(), {value: 1, done: false});
assert.deepEqual(g2.return(42), {value: 42, done: true})
assert.deepEqual(g2.next(), {value: undefined, done: true});

function *f3() {
  try {
    yield 1;
  } finally {
    yield 2;
  }
}

var g3 = f3();
assert.deepEqual(g3.next(), {value: 1, done: false});
assert.deepEqual(g3.return(42), {value: 2, done: false});
assert.deepEqual(g3.next(), {value: 42, done: true});
assert.deepEqual(g3.next(), {value: undefined, done: true});

function *f4() {
  var x = 1;
  function *g() {
    try {
      yield 1;
      yield 2;
    } finally {
      x = 10;
    }
  }
  try {
    yield *g();
  } finally {
    yield x;
  }
}

var g4 = f4();
assert.deepEqual(g4.next(), {value: 1, done: false});
assert.deepEqual(g4.return(42), {value: 10, done: false});
assert.deepEqual(g4.next(), {value: 42, done: true});
assert.deepEqual(g4.next(), {value: undefined, done: true});

function *f5() {
  try {
    yield 1;
  } finally {
    return 2;
  }
}

var g5 = f5();
assert.deepEqual(g5.next(), {value: 1, done: false});
assert.deepEqual(g5.return(42), {value: 2, done: true});
assert.deepEqual(g5.next(), {value: undefined, done: true});

function *f6() {
  yield 1;
}

var g6 = f6();
assert.deepEqual(g6.return(42), {value: 42, done: true});
assert.deepEqual(g6.next(), {value: undefined, done: true});

function *f7() {
  return 1;
}

var g7 = f7();
assert.deepEqual(g7.next(), {value: 1, done: true});
assert.deepEqual(g7.next(), {value: undefined, done: true})
assert.deepEqual(g7.return(42), {value: 42, done: true});
assert.deepEqual(g7.next(), {value: undefined, done: true});

