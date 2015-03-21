(function testArray1() {
  let a, b, c;
  ([a, b, c]) = ['a', 'b', 'c'];
  assert.deepEqual(['a', 'b', 'c'], [a, b, c]);
})();

(function testArray2() {
  let a, b, c;
  (([a, b, c])) = ['e', 'f', 'g'];
  assert.deepEqual(['e', 'f', 'g'], [a, b, c]);
})();

(function testArray3() {
  let a, b, c;
  ([a, [b], c]) = ['a', ['b', 'd'], 'c'];
  assert.deepEqual(['a', 'b', 'c'], [a, b, c]);
})();

(function testArray4() {
  let a, b, c;
  (([a, [b], c])) = ['e', ['f', 'h'], 'g'];
  assert.deepEqual(['e', 'f', 'g'], [a, b, c]);
})();

// ---------------------------------------------

(function testObject1() {
  let a, b, c;
  ({a, b, c}) = {a: 'a', c: 'c', b: 'b'};
  assert.deepEqual(['a', 'b', 'c'], [a, b, c]);
})();

(function testObject2() {
  let a, b, c;
  (({a, b, c})) = { a: 'e', c: 'f', b: 'g'};
  assert.deepEqual(['e', 'g', 'f'], [a, b, c]);
})();

(function testObject3() {
  let a, b, c;
  ({a, b, c}) = { a: 'a', b: 'b', d: 'd', c: 'c'};
  assert.deepEqual(['a', 'b', 'c'], [a, b, c]);
})();

(function testObject4() {
  let a, b, c;
  (({a, b, c})) = {a: 'e', b: 'f', d: 'h', c: 'g'};
  assert.deepEqual(['e', 'f', 'g'], [a, b, c]);
})();
