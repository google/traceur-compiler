function letInClosure(n) {
  var l = [];
  for (var i = 0; i < n; i ++) {
    let let_i = i;
    if (i % 3 == 0) {
      continue;
    }
    l.push(function() {
      return let_i;
    });
  }
  return l;
}

// ----------------------------------------------------------------------------

var result = letInClosure(10);
assertEquals(1, result[0]());
assertEquals(2, result[1]());
assertEquals(4, result[2]());
assertEquals(5, result[3]());
assertEquals(7, result[4]());
assertEquals(8, result[5]());
