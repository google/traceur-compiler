var o = {xW: 0, yW: 0, propW: {xW: 0, yW: 0, funcW: null}};
var funcW;

with (o) {
  xW = 20;
  yW = xW * xW;
  // https://github.com/google/traceur-compiler/issues/1346
  funcW = function(x, y) { return y / x + x; }
  var withVar;
}

withVar = 20;
assert.equal(40, funcW(o.xW, o.yW));

with (o) {
  with (propW) {
    xW = 21;
    yW = xW * xW;
    funcW = function(f, x, y) { return f(x, y) * 100; }
    var withVar2;
  }
}

withVar2 = 20;
var op = o.propW;
assert.equal(42, funcW(op.xW, op.yW));
assert.equal(4200, op.funcW(funcW, op.xW, op.yW));
