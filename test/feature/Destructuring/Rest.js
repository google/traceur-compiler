function destructRest() {
  var a, b, c, d, e;
  [...a] = [1, 2, 3];
  [b, ...c] = [1, 2, 3];
  [,,, ...d] = [1, 2, 3];
  [...e] = {x: 'boom'};
  return {a: a, b: b, c: c, d: d, e: e};
}

// ----------------------------------------------------------------------------

var result = destructRest();
assertArrayEquals([1, 2, 3], result.a);
assert.equal(1, result.b);
assertArrayEquals([2, 3], result.c);
assertArrayEquals([], result.d);
assertArrayEquals([], result.e);
