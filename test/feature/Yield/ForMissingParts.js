function* f0() {
  for (;;) {
    yield 0;
  }
}

function* f1() {
  for (; ; 1) {
    yield 1;
  }
}

function* f2() {
  for (; 1; ) {
    yield 2;
  }
}

function* f3() {
  for (; 1; 1) {
    yield 3;
  }
}

function* f4() {
  for (1; ; ) {
    yield 4;
  }
}

function* f5() {
  for (1; ; 1) {
    yield 5;
  }
}

function* f6() {
  for (1; 1; ) {
    yield 6;
  }
}

function* f7() {
  for (1; 1; 1) {
    yield 7;
  }
}

assert.equal(0, f0().next().value);
assert.equal(1, f1().next().value);
assert.equal(2, f2().next().value);
assert.equal(3, f3().next().value);
assert.equal(4, f4().next().value);
assert.equal(5, f5().next().value);
assert.equal(6, f6().next().value);
assert.equal(7, f7().next().value);
