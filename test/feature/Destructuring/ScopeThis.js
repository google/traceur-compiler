function destructScopeThis() {
  var x;
  var o = {
    f: function() {
      [this.x] = [1];
    }
  };
  o.f();
  return {
    x: x,
    o_x: o.x
  };
}

// ----------------------------------------------------------------------------

var result = destructScopeThis();
assertUndefined(result.x);
assertEquals(1, result.o_x);
