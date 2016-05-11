function destructRest() {
  var a, b, c, d;
  [...a] = [1, 2, 3];
  [b, ...c] = [1, 2, 3];
  [,,, ...d] = [1, 2, 3];
  return {a: a, b: b, c: c, d: d};
}

var result = destructRest();
assert.deepEqual([1, 2, 3], result.a);
assert.equal(1, result.b);
assert.deepEqual([2, 3], result.c);
assert.deepEqual([], result.d);

assert.throw(function() {
  var e;
  // No iterator.
  [...e] = {x: 'boom'};
}, TypeError);
