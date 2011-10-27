function f() {
  return 'outer';
}

{
  var f = function f() {
    return 'inner';
  };

  assertEquals('inner', f());
}

assertEquals('inner', f());
