function f(...args) {
  return args;
}

module m {
  assertEquals('a', (f `a`)[0][0]);
}

module n {
  assertEquals('b', (f `b`)[0][0]);
}
