function destructVarDecl() {
  // Const; and an array inside an object literal inside an array.
  const a = 0, [b, {c, x: [d]}] = [1, {c: 2, x: [3]}];

  // Now an object literal inside an array inside an object literal.
  var {x: [{e}, f], g} = {x: [{e:4}, 5], g: 6};

  // Two patterns in one var.
  var {h} = {h: 7}, {i} = {i: 8};

  return { a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h, i: i };
}

// ----------------------------------------------------------------------------

var result = destructVarDecl();
assertEquals(0, result.a);
assertEquals(1, result.b);
assertEquals(2, result.c);
assertEquals(3, result.d);
assertEquals(4, result.e);
assertEquals(5, result.f);
assertEquals(6, result.g);
assertEquals(7, result.h);
assertEquals(8, result.i);
