function destructEvaluatesToRvalue() {
  var a;
  return [a] = [1, 2, 3];
}

// ----------------------------------------------------------------------------

var result = destructEvaluatesToRvalue();
assert.deepEqual([1, 2, 3], result);
