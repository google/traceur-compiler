function destructEvaluationOrder() {
  var a;
  [a, a, a] = [1, 2, 3, 4];
  return a;
}

// ----------------------------------------------------------------------------

var result = destructEvaluationOrder();
assertEquals(3, result);
