function destructArray() {
  var a, b, c, d;
  [a, [b], c, d] = ['hello', [',', 'junk'], ['world']];
  return {
    a: a,
    b: b,
    c: c,
    d: d
  };
}

// ----------------------------------------------------------------------------

var result = destructArray();
assertEquals('hello', result.a);
assertEquals(',', result.b);
assertArrayEquals(['world'], result.c);
assertUndefined(result.d);
