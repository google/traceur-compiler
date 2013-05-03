function f(...args) {
  return args;
}

module m {
  assert.equal('a', (f `a`)[0][0]);
}

module n {
  assert.equal('b', (f `b`)[0][0]);
}
