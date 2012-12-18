{
  let a = [function() {
    return 1;
  }];

  assertEquals(1, a[0] `whatevs`);

  function f() {
    return [function() {
      return 2;
    }];
  }

  assertEquals(2, f `abc` [0] `def`);

  let o = {
    g: function() {
      return 3;
    }
  };

  assertEquals(3, o.g `ghi`);
}
