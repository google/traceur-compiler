function letInClosure(n) {
  l = []
  for (var i = 0; i < n; i ++) {
    let let_i = i;
    if (i % 3 == 0) {
      continue;
    }
    l.push( function() { return let_i; } )
  }
  return l;
}

// ----------------------------------------------------------------------------
